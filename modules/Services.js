import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'


var getInternalEndpoints = function(service) {
  var endpoints = '';
  var internalEndpoint = service.internalEndpoint;
  if (service.type == 'NodePort') {
    endpoints = internalEndpoint.host + ':' + internalEndpoint.ports[0].nodePort + ' ' + internalEndpoint.ports[0].protocol;
  } else {
    endpoints = internalEndpoint.host + ':' + internalEndpoint.ports[0].port + ' ' + internalEndpoint.ports[0].protocol;
  }

  return endpoints;
};


// TODO: Check structure of service.externalEndpoints and display properly
var getExternalEndpoints = function(service) {
  return JSON.stringify(service.externalEndpoints);
};


export default React.createClass({
  getInitialState: function() {
    return {
      services: []
    }
  },


  componentDidMount: function() {
    // TODO: Change url to:
    // /api/v1/proxy/namespaces/kube-system/services/kubernetes-dashboard/api/v1/service

    // const url = '/api/v1/namespaces/' + this.props.params.namespace + '/services';

    var url = '/api/v1/proxy/namespaces/kube-system/services/kubernetes-dashboard/api/v1/service';
    if (this.props.params.namespace) {
      url = url + '/' + this.props.params.namespace;
    }

    axios.get(url)
      .then(res => {
        var services = [];
        if (res.data.services) {
          services = res.data.services.sort(function(a, b) {
            if(a.objectMeta.name < b.objectMeta.name) return -1;
            if(a.objectMeta.name > b.objectMeta.name) return 1;
            return 0;
          });
        }
        this.setState({ services });
      });
  },


  render() {
    return (
      <div>
        <h1>Services: {this.props.params.namespace}</h1>
        <div>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/events"}>Events</Link> <span className="divider">|</span>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/pods"}>Pods</Link>
        </div>
        <table className="table table-striped table-bordered table-hover table-condensed">
          <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Cluster IP</th>
            <th>Internal Endpoints</th>
            <th>External Endpoints</th>
          </tr>
          </thead>
          <tbody>
          {this.state.services.map(service =>
            <tr key={service.objectMeta.name}>
              <td>{service.objectMeta.name}</td>
              <td>{service.type}</td>
              <td>{service.clusterIP}</td>
              <td>{getInternalEndpoints(service)}</td>
              <td>{getExternalEndpoints(service)}</td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    )
  }
})