import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'


export default React.createClass({
  getInitialState: function() {
    return {
      services: []
    }
  },


  componentDidMount: function() {
    const url = '/api/v1/namespaces/' + this.props.params.namespace + '/services';
    axios.get(url)
      .then(res => {
        var services = [];
        if (res.data.items) {
          services = res.data.items.sort(function(a, b) {
            if(a.metadata.name < b.metadata.name) return -1;
            if(a.metadata.name > b.metadata.name) return 1;
            return 0;
          });
        }
        this.setState({ services });
      });
  },


  render() {
    return (
      <div>
        <h1>Services for {this.props.params.namespace}</h1>
        <div>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/events"}>Events</Link> <span className="divider">|</span>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/pods"}>Pods</Link>
        </div>
        <table className="table table-striped table-bordered table-hover table-condensed">
          <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>URL</th>
          </tr>
          </thead>
          <tbody>
          {this.state.services.map(service =>

            <tr key={service.metadata.uid}>
              <td>{service.metadata.name}</td>
              <td>{service.spec.type}</td>
              <td>{service.status.loadBalancer.ingress ? service.status.loadBalancer.ingress[0].hostname : "None"}</td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    )
  }
})