import { from, of } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormGroup from '@material-ui/core/FormGroup';

import { TextValidator, ValidatorForm} from 'react-material-ui-form-validator';


import MyWalletServices from '../../Services/MyWalletServices/MyWalletServices';
import DialogService from '../../Services/DialogService';
import GetWalletPasswordObservable from '../../Observables/GetWalletPasswordObservable';



export default (props) => {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState((props.address ||""));
  

  const form = React.useRef(null);


  const handleWatch = () =>{ 
    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;
      
      MyWalletServices.isWalletEncrypted.pipe(
        first(),
        switchMap(walletEncrypted => walletEncrypted == false ? 
          of(null):
          GetWalletPasswordObservable
        ),
        switchMap(() => from(MyWalletServices.addMyAddress(name,address)))
      ).subscribe(
        props.onClose,
        err =>{ //TODO: this needs improving, better error message
          DialogService.showMessage("Failed", "Failed to watch address").subscribe()
        }
      );      

    });
  }


  

  return (
    <Dialog open={true} onClose={props.onClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Watch Address</DialogTitle>
        <DialogContent>

          <ValidatorForm ref={form} >

            <FormGroup>
              <TextValidator
                label="Name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                validators={['required']}
                errorMessages={['required']}
              />
              <TextValidator
                label="Address"
                onChange={(e) => setAddress(e.target.value)}
                value={address}
                validators={['required', 'isChaincoinAddress']}
                errorMessages={['required',"Invalid"]}
              />
            </FormGroup>
          </ValidatorForm>

        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleWatch} color="primary">
            Watch
          </Button>
        </DialogActions>
      </Dialog>
  );
}