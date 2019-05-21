import React from 'react';

import { combineLatest } from 'rxjs';

import bigDecimal from 'js-big-decimal';


import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Switch from '@material-ui/core/Switch';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';


import MyWalletServices from '../../../../Services/MyWalletServices';

const styles = {
  
};

class CoinControl extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      coinControl: false,
      inputAddresses: [],
      selectedInputs: []
    };
  
    this.subscription = null;
  }


  componentDidMount() {
    this.subscription = combineLatest(MyWalletServices.inputAddresses, this.props.transaction.coinControl, this.props.transaction.selectedInputs,
      this.props.transaction.selectedInputsTotal)
      .subscribe(([inputAddresses, coinControl, selectedInputs, selectedInputsTotal]) => this.setState({coinControl, inputAddresses, selectedInputs, selectedInputsTotal}));
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }


  renderInputAddressCoinControl = (inputAddress) =>
  {
    const { classes, transaction } = this.props;
    const { selectedInputs } = this.state;

    //var enabledInputs = inputAddress.inputs

    var allSelected = inputAddress.inputs.find(input => selectedInputs.indexOf(input) == -1) == null;

    const handleInputChange = (input) =>{
      return (event) =>{
  

        if (event.target.checked == true)transaction.addSelectedInput(input.unspent.txid, input.unspent.vout);
        else transaction.removeSelectedInput(input.unspent.txid, input.unspent.vout);
      }
    }


    const handleInputAddressChange = (event) =>{
      if (event.target.checked == true)inputAddress.inputs.forEach(input => transaction.addSelectedInput(input.unspent.txid, input.unspent.vout)); //TODO: maybe have an add many option
      else inputAddress.inputs.forEach(input => transaction.removeSelectedInput(input.unspent.txid, input.unspent.vout)); //TODO: maybe have a remove many option
    }



    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Checkbox
            checked={allSelected}
            onClick={(e)=> e.stopPropagation()}
            onChange={handleInputAddressChange}
            color="primary"
          />
        {inputAddress.myAddress.name} {inputAddress.address.balance}
        
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Confirmations</TableCell>
                <TableCell>Locked Reason</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inputAddress.inputs.map(input => (
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={selectedInputs.indexOf(input) != -1}
                      onChange={handleInputChange(input)}
                      disabled={(input.disabled)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>{input.unspent.value}</TableCell>
                  <TableCell>{TimeToString(input.unspent.time)}</TableCell>
                  <TableCell>{input.confirmations}</TableCell>
                  <TableCell>
                    { input.inMemPool ? "In MemPool, " : null }
                    { input.inMnList ? "In MN List, " : null } 
                    { input.isMatureCoins == false ? "Not Mature, " : null } 
                    { input.lockState != null ? (input.lockState == true ? "User Locked," : "User Unlocked,") : null }
                  </TableCell>
                  <TableCell>

                    {
                      input.lockState == null ? (
                        <div>
                          <Button variant="contained" color="primary" onClick={(e) => MyWalletServices.addInputLockState(input.unspent.txid + "-" + input.unspent.vout, true)}>
                            Lock
                          </Button>
                          <Button variant="contained" color="primary" onClick={(e) => MyWalletServices.addInputLockState(input.unspent.txid + "-" + input.unspent.vout, false)}>
                            Unlock
                          </Button>
                        </div>

                      ): 
                      (
                        <div>
                          <Button variant="contained" color="primary" onClick={(e) => MyWalletServices.updateInputLockState(input.unspent.txid + "-" + input.unspent.vout, true)}>
                            Lock
                          </Button>
                          <Button variant="contained" color="primary" onClick={(e) => MyWalletServices.updateInputLockState(input.unspent.txid + "-" + input.unspent.vout, false)}>
                            Unlock
                          </Button>
                        </div>
                      )
                    }

                    {
                      input.lockState != null ?
                      (
                        <Button variant="contained" color="primary" onClick={(e) => MyWalletServices.deleteInputLockState(input.unspent.txid + "-" + input.unspent.vout)}>
                          Clear Locked State
                        </Button>
                      ): null
                    }
                    

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }


  handleCoinControlChange = (event ) =>{
    ;
  }


  render(){
    const { classes } = this.props;
    const { inputAddresses, coinControl, selectedInputsTotal } = this.state;
    
    return (
      <div>
        Coin Control: 
        <Switch
          checked={coinControl}
          onChange={(event) => this.props.transaction.setCoinControl(event.target.checked)}
          color="primary"
        />

        {
          coinControl ? (
            <div> 
              {inputAddresses.map(this.renderInputAddressCoinControl)}
              <div>
                Input Total: { selectedInputsTotal }
              </div>
            </div>
          ): null
        }
        
      </div>
    );
  }
}



CoinControl.propTypes = {
  classes: PropTypes.object.isRequired,
  controlledAddresses: PropTypes.object.isRequired,
  selectedInputs: PropTypes.object.isRequired, 
};

export default withStyles(styles)(CoinControl);



var TimeToString = (timestamp) =>{ //TODO: make this an include
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}
