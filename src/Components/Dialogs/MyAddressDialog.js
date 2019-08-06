import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import FormGroup from '@material-ui/core/FormGroup';

import { TextValidator, ValidatorForm} from 'react-material-ui-form-validator';


import MyWalletServices from '../../Services/MyWalletServices';
import BlockchainServices from '../../Services/BlockchainServices';
import DialogService from '../../Services/DialogService';

export default (props) => {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState((props.address ||""));
  const [wif, setWif] = React.useState((props.wif ||""));
  

  const form = React.useRef(null);


  React.useEffect(() => {

    const subscription = MyWalletServices.myAddress(props.address).subscribe((myAddress) =>{
      if (myAddress != null)
      {
        setName(myAddress.name);
        setWif(myAddress.WIF);
      }
    });
    
    return () =>{
      subscription.unsubscribe();
    }
  }, []);



  const handleSave = () =>{ 
    form.current.isFormValid(false).then(valid =>{
      if (valid == false) return;//TODO: need to make sure the WIF is correct for this address

      MyWalletServices.updateMyAddress(name,address,wif)
      .then(props.onClose)
      .catch(err => DialogService.showMessage("Failed", "Failed to update My Address"));

    });
  }


  

  return (
    <Dialog open={true} onClose={props.onClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Update My Address</DialogTitle>
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
                disabled={true}
              />
              <TextValidator
                label="WIF"
                onChange={(e) => setWif(e.target.value)}
                value={wif}
                validators={['isWifValid']}
                errorMessages={["Invalid"]}
              />
            </FormGroup>
          </ValidatorForm>

        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
  );
}