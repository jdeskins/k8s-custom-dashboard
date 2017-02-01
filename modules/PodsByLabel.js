import React from 'react'
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router'



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
        var warnings = [];
        pods.map(function(pod){
          var restartCount = getRestartCount(pod);
          var podData = {
            'name': pod.metadata.name,
            'namespace': pod.metadata.namespace,
            'image': pod.spec.containers[0].image,
            'phase': pod.status.phase,
            'restartCount': restartCount,
            'startTime': pod.status.startTime,
            'reason': getStatus(pod),
            'labels': pod.metadata.labels
          };

          var nodeName = pod.spec.nodeName;
          if (podsByNodes[nodeName]) {
            podsByNodes[nodeName].push(podData);
          } else {
            podsByNodes[nodeName] = [];
            podsByNodes[nodeName].push(podData);
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
            <div className="node-container col-md-12">
              <div className="node row">
                <div className="name">NODE: {node}</div>

                {this.state.podsByNodes[node].map(pod =>
                  <div className="pod col-md-3" key={pod.name}>
                    <b>POD: <Link to={"/namespaces/"+ pod.namespace +"/pods/" + pod.name}>{pod.name}</Link></b><br/>
                    <h4>{pod.image}</h4>
                    NS: <Link to={"/namespaces/"+ pod.namespace +"/pods"}>{pod.namespace}</Link><br/>
                    {showLabels(pod.labels)}
                    Started: {moment(pod.startTime).format("MM/DD HH:mm:ss")}<br/>
                    <div className={getRestartStyle(pod.restartCount)}>Restarts: {pod.restartCount}</div>
                    <div className={pod.phase.toLowerCase()}>Status: {pod.phase}</div>
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