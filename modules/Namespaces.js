import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'
import Loader from './Loader'


export default React.createClass({
  getInitialState: function() {
    return {
      isLoading: false,
      namespaces: []
    }
  },


  getNamespaces: function() {
    axios.get('/api/v1/namespaces')
      .then(response => {
        this.setState({ isLoading: false });
        const namespaces = response.data.items.sort(function(a, b) {
          if(a.metadata.name < b.metadata.name) return -1;
          if(a.metadata.name > b.metadata.name) return 1;
          return 0;
        });
        this.setState({ namespaces });
      })
      .catch(function (error) {
        console.log(error);
      });
  },


  componentDidMount: function() {
    this.setState({ isLoading: true });
    this.getNamespaces();
  },

  render: function() {
    return (
      <div>
        <h1>Namespaces</h1>
        <Loader isLoading={this.state.isLoading} />
        <div className="col-md-6">
          <table className="table table-striped table-bordered table-hover table-condensed">
            <thead>
            <tr>
              <th>Name</th>
              <th>Events</th>
              <th>Pods</th>
              <th>Services</th>
            </tr>
            </thead>
            <tbody>
            {this.state.namespaces.map(namespace =>
              <tr key={namespace.metadata.uid}>
                <td>{namespace.metadata.name}</td>
                <td><Link to={"/namespaces/"+ namespace.metadata.name +"/events"}>Events</Link></td>
                <td><Link to={"/namespaces/"+ namespace.metadata.name +"/pods"}>Pods</Link></td>
                <td><Link to={"/namespaces/"+ namespace.metadata.name +"/services"}>Services</Link></td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

})
