import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { Card, CardText, CardBody, CardHeader } from 'reactstrap';
import TablePaginationActions from '../../Components/TablePaginationActions';


import BlockchainServices from '../../Services/BlockchainServices';
import MyWalletServices from '../../Services/MyWalletServices';



const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'scroll',
    "-webkit-overflow-scrolling": "touch"
  },
});

class PeerList extends React.Component {
  state = {
    tab: 0,
    rows: [
     
    ],
    page: 0,
    rowsPerPage: 10,
    loading: true,
    windowWidth: 0,
    error: null,

    searchInput: "",

    menuAnchorEl: []
  };

  masternodeListSubscription = null;

  handleChangePage = (event, page) => {
    this.setState({ page });
    
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: parseInt(event.target.value) });
  };

  componentDidMount() {
    this.subscription = BlockchainServices.peerInfo.subscribe((peerInfo) =>{
      this.setState({
        rows: peerInfo
      });
    });
  }

  componentWillUnmount = () => {
    this.subscription.unsubscribe();
  }

  labelDisplayedRows(){
    return "";
  }
 
  render() {
    const { classes } = this.props;
    const { rowsPerPage, page, tab } = this.state;
    var { rows } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);


    return (
      <Card>
        <CardHeader>
          <Tabs value={tab} onChange={(event, tab) => this.setState({ tab })} variant="scrollable" scrollButtons="auto">
            <Tab label="Peer List" classes={{ label: 'details-tab' }} />
            <Tab label="Add Nodes" classes={{ label: 'details-tab' }} />
          </Tabs>
        </CardHeader>
        <CardBody>
          <Paper>

            {tab == 0 ?(
              <React.Fragment>
                <div className={classes.tableWrapper}>
                  <Table className={classes.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Address</TableCell>
                        <TableCell>Connection Time</TableCell>
                        <TableCell>Version</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, rowPos) => (
                        <TableRow >
                          <TableCell component="th" scope="row">{row.addr}</TableCell>
                          <TableCell>{TimeToString(row.conntime)}</TableCell>
                          <TableCell>{row.version}</TableCell>
                        </TableRow>
                      ))}
                      {emptyRows > 0 && (
                        <TableRow style={{ height: 48 * emptyRows }}>
                          <TableCell colSpan={2} />
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  labelRowsPerPage=""
                  rowsPerPageOptions={[]}
                  labelDisplayedRows={this.labelDisplayedRows}
                  colSpan={2}
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    native: true,
                  }}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </React.Fragment>
            ): null}


            {tab == 1 ?(
              <React.Fragment>
                <p>
                  If your chaincoin has 0 connections then this can be copied into chaincoin.conf. <br/>
                  Remeber to restart chaincoind to load changes to chaincoin.conf
                </p>
                
                <div className={classes.tableWrapper}>
                  <Table className={classes.table}>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow >
                          <TableCell component="th" scope="row">addnode={row.addr}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </React.Fragment>
            ): null}
            
          </Paper>
        </CardBody>
      </Card>
      
    );
  }
}


PeerList.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(PeerList);





var TimeToString = (timestamp) =>{
  var d = new Date(timestamp * 1000);
  return d.toLocaleTimeString() + " " + d.toLocaleDateString();
}

