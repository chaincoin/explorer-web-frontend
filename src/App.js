import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';

import ChaincoinIndexerServiceList from './Screens/ChaincoinIndexerServiceList'
import NavBar from './Components/NavBar'
import Header from './Components/Header/Header'

import HomeScreen from './Screens/HomeScreen'

import BlockList from './Screens/Explorer/BlockList'

import ContactMe from './Screens/ContactMe'

import BlockCount from './Components/Header/BlockCount'


const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  }
});


 class App extends React.Component {

  

  render() {
    return <Router>
      <div>
        <BlockCount/>
      </div>
    </Router>;
  }
}


export default withStyles(styles)(App);