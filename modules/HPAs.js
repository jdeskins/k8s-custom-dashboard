import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'
import Loader from './Loader'


export default React.createClass({
  getInitialState: function() {
    return {
      isLoading: false,
      autoscalers: []
    }
  },


  getAutoscalers: function() {
    axios.get('/apis/extensions/v1beta1/horizontalpodautoscalers')
      .then(response => {
        this.setState({ isLoading: false });
        const autoscalers = response.data.items.sort(function(a, b) {
          if(a.metadata.name < b.metadata.name) return -1;
          if(a.metadata.name > b.metadata.name) return 1;
          return 0;
        });
        this.setState({ autoscalers });
      })
      .catch(function (error) {
        console.log(error);
      });
  },


  componentDidMount: function() {
    this.setState({ isLoading: true });
    this.getAutoscalers();
  },

  render: function() {
    return (
      <div>
        <h1>Horizontal Pod Autoscalers</h1>
        <Loader isLoading={this.state.isLoading} />
        <div className="col-md-8">
          <table className="table table-striped table-bordered table-hover table-condensed">
            <thead>
            <tr>
              <th>Name</th>
              <th>Namespace</th>
              <th>Current CPU</th>
              <th>Current Replicas</th>
              <th>Desired</th>
              <th>Min</th>
              <th>Max</th>
            </tr>
            </thead>
            <tbody>
            {this.state.autoscalers.map(autoscaler =>
              <tr key={autoscaler.metadata.uid}>
                <td>
                  <Link to={"/scaling/"+ autoscaler.metadata.namespace +"/" + autoscaler.metadata.name}>
                    {autoscaler.metadata.name}
                  </Link>
                </td>
                <td>{autoscaler.metadata.namespace}</td>
                <td className="text-center">{autoscaler.status.currentCPUUtilizationPercentage}%</td>
                <td className="text-center">{autoscaler.status.currentReplicas}</td>
                <td className="text-center">{autoscaler.status.desiredReplicas}</td>
                <td className="text-center">{autoscaler.spec.minReplicas}</td>
                <td className="text-center">{autoscaler.spec.maxReplicas}</td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

})
