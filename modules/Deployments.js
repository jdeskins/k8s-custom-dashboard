import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'


export default React.createClass({
  getInitialState: function() {
    return {
      deployments: [],
      deploymentsByNamespace: {},
      title: 'Deployments',
      warnings: []
    }
  },


  componentWillReceiveProps: function (nextProps) {
    // Only load if params have changed
    if (nextProps.params.namespace != this.props.params.namespace) {
      this.loadDocument(nextProps.params.namespace);
    }
  },


  componentDidMount: function() {
    axios.get('/apis/extensions/v1beta1/deployments')
      .then(res => {
        var deployments = [];
        if (res.data.items) {
          deployments = res.data.items.sort(function(a, b) {
            if((a.metadata.name < b.metadata.name) || (a.metadata.namespace < b.metadata.namespace)) return -1;
            if((a.metadata.name > b.metadata.name) || (a.metadata.namespace > b.metadata.namespace)) return 1;
            return 0;
          });
        }

        var deploymentsByNamespace = {};
        deployments.map(function(deployment){

          var namespace = deployment.metadata.namespace;
          if (deploymentsByNamespace[namespace]) {
            deploymentsByNamespace[namespace].push(deployment);
          } else {
            deploymentsByNamespace[namespace] = [];
            deploymentsByNamespace[namespace].push(deployment);
          }
        });

        this.setState({
          deployments: deployments,
          title: 'Deployments (' + deployments.length + ')',
          deploymentsByNamespace: deploymentsByNamespace
        });

      });
  },


  render() {
    return (
      <div>
        <h1>{this.state.title}</h1>
        {Object.keys(this.state.deploymentsByNamespace).map( namespace =>
          <div key={namespace} className="col-md-6">
            <h2>{namespace}</h2>
            <table className="table table-striped table-bordered table-hover table-condensed">
              <thead>
              <tr>
                <th>Name</th>
                <th>Replicas</th>
                <th>Image</th>
              </tr>
              </thead>
              <tbody>
                {this.state.deploymentsByNamespace[namespace].map(deployment =>
                  <tr key={deployment.metadata.name}>
                    <td>{deployment.metadata.name}</td>
                    <td>{deployment.status.availableReplicas} of {deployment.status.replicas}</td>
                    <td>{deployment.spec.template.spec.containers[0].image}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }
})