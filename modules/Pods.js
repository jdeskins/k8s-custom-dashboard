import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router'


var getCPULimit = function(pod) {
  var cpuLimit = 'NA';
  if (pod.spec.containers[0].resources && pod.spec.containers[0].resources.limits) {
    cpuLimit = pod.spec.containers[0].resources.limits.cpu
  }
  return cpuLimit;
};


var getMemoryLimit = function(pod) {
  var memLimit = 'NA';
  if (pod.spec.containers[0].resources && pod.spec.containers[0].resources.limits) {
    memLimit = pod.spec.containers[0].resources.limits.memory
  }
  return memLimit;
};


var getStartTime = function(pod) {
  var startTime = "NA";
  if (pod.status.containerStatuses && pod.status.containerStatuses[0] && pod.status.containerStatuses[0].state.running) {
    startTime = pod.status.containerStatuses[0].state.running.startedAt;
  }
  return startTime;
};


var getRestartCount = function(pod) {
  var restartCount = "NA";
  if (pod.status.containerStatuses && pod.status.containerStatuses[0]) {
    restartCount = pod.status.containerStatuses[0].restartCount;
  }
  return restartCount;
};


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

var isWarningState = function(pod){
  // TODO: add pending status
  const restartCount = getRestartCount(pod);
  if (restartCount > 20 || pod.status.phase == "Pending") {
    return true;
  }
  return false;
};


export default React.createClass({
  getInitialState: function() {
    return {
      pods: [],
      podsByNodes: {},
      title: 'Pods',
      warnings: []
    }
  },


  componentWillReceiveProps: function (nextProps) {
    // Only load if params have changed
    if (nextProps.params.namespace != this.props.params.namespace) {
      this.loadDocument(nextProps.params.namespace);
    }
  },


  loadDocument: function(namespace) {
    var url, title;

    if (namespace) {
      url = '/api/v1/namespaces/' + namespace + '/pods';
      title = 'Pods for ' + namespace;
    } else {
      url = '/api/v1/pods';
      title = 'All Pods';
    }

    axios.get(url)
      .then(res => {
        var pods = [];
        if (res.data.items) {
          pods = res.data.items.sort(function(a, b) {
            if(a.metadata.name < b.metadata.name) return -1;
            if(a.metadata.name > b.metadata.name) return 1;
            return 0;
          });
        }

        var podsByNodes = {};
        var warnings = [];
        pods.map(function(pod){
          var restartCount = getRestartCount(pod);
          var podData = {
            'name': pod.metadata.name,
            'namespace': pod.metadata.namespace,
            'image': pod.spec.containers[0].image,
            'CPULimit': getCPULimit(pod),
            'MemLimit': getMemoryLimit(pod),
            'phase': pod.status.phase,
            'restartCount': restartCount,
            'startTime': getStartTime(pod),
            'reason': getStatus(pod),
            'labels': pod.metadata.labels
          };

          if (isWarningState(pod)) {
            warnings.push(podData);
          }

          var nodeName = pod.spec.nodeName;
          if (podsByNodes[nodeName]) {
            podsByNodes[nodeName].push(podData);
          } else {
            podsByNodes[nodeName] = [];
            podsByNodes[nodeName].push(podData);
          }

        });

        var numberOfNodes = Object.keys(podsByNodes).length;
        this.setState({
          pods: pods,
          title: title + ' (' + pods.length + ' pods on ' + numberOfNodes + ' nodes)',
          podsByNodes: podsByNodes,
          warnings: warnings
        });

      });
  },


  componentDidMount: function() {
    this.loadDocument(this.props.params.namespace);
  },


  componentDidUpdate() {
    ReactDOM.findDOMNode(this).scrollTop = 0
  },


  render() {
    return (
      <div>
        <h1>{this.state.title}</h1>
        <div>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/events"}>Events</Link> <span className="divider">|</span>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/services"}>Services</Link>
        </div>

        {this.state.warnings.length > 0 &&
          <div id="warnings" className="col-md-8 col-md-offset-2">
            <h3>Warnings</h3>
            <table className="table table-striped table-bordered table-hover table-condensed">
              <thead>
                <tr>
                  <th>Pod</th>
                  <th>Namespace</th>
                  <th>Status</th>
                  <th>Restarts</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {this.state.warnings.map( warning =>
                  <tr key={warning.name} className="danger">
                    <td><Link to={"/namespaces/"+ warning.namespace +"/pods/" + warning.name}>{warning.name}</Link></td>
                    <td><Link to={"/namespaces/"+ warning.namespace +"/pods"}>{warning.namespace}</Link></td>
                    <td>{warning.phase}</td>
                    <td>{warning.restartCount}</td>
                    <td>{warning.reason}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        }


        {Object.keys(this.state.podsByNodes).map( node =>
          <div key={node} className="row">
            <div className="col-md-12 node-container">
              <div className="node row">
                <div className="name">NODE: {node}</div>

                {this.state.podsByNodes[node].map(pod =>
                  <div className="col-md-3" key={pod.name}>
                    <div className="pod">
                      <b>POD: <Link to={"/namespaces/"+ pod.namespace +"/pods/" + pod.name}>{pod.name}</Link></b><br/>
                      {pod.image}<br/>
                      NS: <Link to={"/namespaces/"+ pod.namespace +"/pods"}>{pod.namespace}</Link><br/>
                      {showLabels(pod.labels)}
                      CPU: {pod.CPULimit} Mem: {pod.MemLimit}<br/>
                      Started: {moment(pod.startTime).format("MM/DD HH:mm:ss")}<br/>

                      <div className={pod.phase.toLowerCase()}>
                        Status: {pod.phase} &nbsp;
                        <span className={getRestartStyle(pod.restartCount)}>({pod.restartCount} restarts)</span>
                        </div>
                    </div>
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