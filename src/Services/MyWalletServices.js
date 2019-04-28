import { Observable, Subject  } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import walletWorker from '../Scripts/walletWorker.js'




var _walletWorker = null

const walletWorkerCode = walletWorker.toString();
const walletWorkerCodeBlob = new Blob(['('+walletWorkerCode+')()']);
_walletWorker = new Worker(URL.createObjectURL(walletWorkerCodeBlob));


var myMasternodeAdded = new Subject();
var myMasternodeDeleted = new Subject();

var myAddressAdded = new Subject();
var myAddressDeleted = new Subject();

var walletWorkerRequestId = 0;
var pendingWalletWorkerRequests = {}

if (_walletWorker != null)
{
    _walletWorker.onmessage = function(e) {
        var message = e.data;
        var pendingWalletWorkerRequest = pendingWalletWorkerRequests["r" + message.id];
        if (pendingWalletWorkerRequest != null)
        {
            if (message.success)pendingWalletWorkerRequest.resolve(message);
            else pendingWalletWorkerRequest.reject(message);
            clearTimeout(pendingWalletWorkerRequest.timer);
            eval("delete pendingWalletWorkerRequests.r" + message.id);
        }
    
        if (message.event == "addedMasternode") myMasternodeAdded.next(message.data);
        else if (message.event == "deletedMasternode") myMasternodeDeleted.next(message.data);
        else if (message.event == "addedAddress") myAddressAdded.next(message.data);
        else if (message.event == "deletedAddress") myAddressDeleted.next(message.data);
    }
}




function sendWalletWorkerRequest(request)
{
    request.id = walletWorkerRequestId;


    return new Promise(function(resolve, reject)
    {
        var pendingWalletWorkerRequest = {
            request: request,
            resolve: resolve,
            reject: reject,
            timer: setTimeout(reject,30000)
        };
        
    
        _walletWorker.postMessage(request);
    
    
        pendingWalletWorkerRequests["r" + walletWorkerRequestId] = pendingWalletWorkerRequest;
        walletWorkerRequestId++;
    }); 

}


const myAddresses = Observable.create(function(observer) {

    var _addresses = null;

    var listAddresses = () =>{
        sendWalletWorkerRequest({
            op:"listAddresses"
        })
        .then(addresses =>{
            _addresses = addresses;
            observer.next(addresses);
        })
        .catch(err => observer.error(err));
    };

    var myAddressAddedSubscription = myAddressAdded.subscribe(listAddresses);
    var myAddressDeletedSubscription = myAddressDeleted.subscribe(listAddresses);

    var intervalId = setInterval(listAddresses, 30000);
    listAddresses();

    return () => {
        clearInterval(intervalId);
        myAddressAddedSubscription.unsubscribe();
        myAddressDeletedSubscription.unsubscribe();
    }
  
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));


  var addMyAddress = (name, address, WIF) =>{ 
    return sendWalletWorkerRequest({
        op:"createAddress",
        name:name,
        address: address,
        WIF:WIF
    });
  }

  var deleteMyAddress = (address) =>{ 
    return sendWalletWorkerRequest({
        op:"deleteAddress",
        address: address
    });
  }


  


const myMasternodes = Observable.create(function(observer) {

    var _masternodes = null;

    var listMasternodes = () =>{
        sendWalletWorkerRequest({
            op:"listMasternodes"
        })
        .then(masternodes =>{
            _masternodes = masternodes;
            observer.next(masternodes);
        })
        .catch(err => observer.error(err));
    };

    var myMasternodeAddedSubscription = myMasternodeAdded.subscribe(listMasternodes);
    var myMasternodeDeletedSubscription = myMasternodeDeleted.subscribe(listMasternodes);

    var intervalId = setInterval(listMasternodes, 30000);
    listMasternodes();

    return () => {
        clearInterval(intervalId);
        myMasternodeAddedSubscription.unsubscribe();
        myMasternodeDeletedSubscription.unsubscribe();
    }
  
  }).pipe(shareReplay({
    bufferSize: 1,
    refCount: true
  }));


  var addMyMasternode = (name, output) =>{ 
    return sendWalletWorkerRequest({
        op:"createMasternode",
        name:name,
        output: output
    });
  }

  var deleteMyMasternode = (output) =>{ 
    return sendWalletWorkerRequest({
        op:"deleteMasternode",
        output: output
    });
  }


export default {
    myAddresses,
    addMyAddress,
    deleteMyAddress,

    myMasternodes,
    addMyMasternode,
    deleteMyMasternode

}