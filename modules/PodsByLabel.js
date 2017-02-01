import React from 'react'
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router'
import Pod from './elements/Pod'


var getStatus = function(pod) {
  var status = "";
  if (pod.status.containerStatuses && pod.status.containerStatuses[0].state.waiting) {
    status = pod.status.containerStatuses[0].state.waiting.reason;
  }
  return status;
};


var getRestartStyle = function (count) {
  // TODO: Count for uptime
  if (parseInt(count) > 20) {
    return "warning";
  } else {
    return "";
  }
};


var getRestartCount = function(pod) {
  var restartCount = "NA";
  if (pod.status.containerStatuses && pod.status.containerStatuses[0]) {
    restartCount = pod.status.containerStatuses[0].restartCount;
  }
  return restartCount;
};


var showLabels = function(labels) {
  var labelArray = [];
  for (var key in labels){
    labelArray.push(
      <div className="pod-label" key={key}>
        <Link to={"/pods/label/"+ key +"/" + labels[key]}>{key}: {labels[key]}</Link>
      </div>
    );
  }
  return (
    <div>
      Labels:
      { labelArray }
    </div>
  );
};


export default React.createClass({
  getInitialState: function() {
    return {
      pods: [],
      podsByNodes: {},
      title: 'Pods By Label'
    }
  },


  componentDidMount: function() {

    axios.get('/api/v1/pods?labelSelector=' + this.props.params.labelkey + '%3D' + this.props.params.labelvalue)
      .then(res => {
        var pods = [];
        if (res.data.items) {
          pods = res.data.items;
        }

        var podsByNodes = {};
        pods.map(function(pod){
          var nodeName = pod.spec.nodeName;
          if (podsByNodes[nodeName]) {
            podsByNodes[nodeName].push(pod);
          } else {
            podsByNodes[nodeName] = [];
            podsByNodes[nodeName].push(pod);
          }
        });

        this.setState({
          pods: pods,
          podsByNodes: podsByNodes
        });

      });
  },


  render() {
    return (
      <div>
        <h1>{this.state.title} ({this.props.params.labelkey}: {this.props.params.labelvalue})</h1>
        <p>Found {this.state.pods.length}</p>

        {Object.keys(this.state.podsByNodes).map( node =>
          <div key={node} className="row">
            <div className="col-md-12 node-container">
              <div className="node row">
                <div className="name">NODE: {node}</div>

                {this.state.podsByNodes[node].map(pod =>
                  <div className="col-md-3" key={pod.metadata.name}>
                    <Pod pod={pod} />
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
})