import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios';
import { Link } from 'react-router'
import Pod from './elements/Pod'


var timer;

var createUrl = function(namespace, path) {
  var url = '/' + path;
  if (namespace) {
    url = '/namespaces/'+ namespace + '/' + path;
  }
  return url;
}


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
      warnings: [],
      namespace: '',
      refreshValue: '0'
    }
  },


  componentWillReceiveProps: function (nextProps) {
    // Only load if params have changed
    if (nextProps.params.namespace != this.props.params.namespace) {
      clearInterval(timer);
      var namespace = nextProps.params.namespace;
      this.setState({namespace: namespace});
      this.loadDocument(namespace);
      var refreshValue = this.state.refreshValue;
      if (refreshValue != undefined && refreshValue != '0') {
        const refreshInterval = parseInt(refreshValue) * 1000;
        this.startRefresh(refreshInterval, namespace);
      }
    }
  },


  componentWillUnmount: function() {
    if (timer) {
      clearInterval(timer);
    }
  },


  startRefresh: function(refreshInterval, namespace) {
    var loadDocument = this.loadDocument;
    timer = setInterval(function(x) {
      loadDocument(x);
    }, refreshInterval, namespace);
  },


  handleRefreshChange: function(event) {
    const refreshValue = event.target.value;
    this.setState({refreshValue: refreshValue});
    if (refreshValue == "0") {
      clearInterval(timer);
    } else {
      const refreshInterval = parseInt(refreshValue) * 1000;
      var namespace = this.state.namespace;
      this.startRefresh(refreshInterval, namespace);
    }
  },


  loadDocument: function(namespace) {
    console.log('In loadDocument... namespace=' + namespace);
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
          var nodeName = pod.spec.nodeName;
          if (podsByNodes[nodeName]) {
            podsByNodes[nodeName].push(pod);
          } else {
            podsByNodes[nodeName] = [];
            podsByNodes[nodeName].push(pod);
          }

          if (isWarningState(pod)) {
            warnings.push(pod);
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
    var namespace = this.props.params.namespace;
    this.setState({namespace: namespace});
    this.loadDocument(namespace);
  },


  componentDidUpdate() {
    ReactDOM.findDOMNode(this).scrollTop = 0
  },


  render() {
    return (
      <div>
        <h1>{this.state.title}</h1>

        <form>
          <select name="refreshInterval" onChange={this.handleRefreshChange}>
            <option value="0">No Refresh</option>
            <option value="2">2 Seconds</option>
            <option value="5">5 Seconds</option>
            <option value="10">10 Seconds</option>
            <option value="30">30 Seconds</option>
          </select>
        </form>
        <div>
          <Link to={createUrl(this.props.params.namespace, 'events')}>Events</Link> <span className="divider">|</span>
          <Link to={createUrl(this.props.params.namespace, 'services')}>Services</Link>
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
                  <tr key={warning.metadata.name} className="danger">
                    <td><Link to={"/namespaces/"+ warning.metadata.namespace +"/pods/" + warning.metadata.name}>{warning.metadata.name}</Link></td>
                    <td><Link to={"/namespaces/"+ warning.metadata.namespace +"/pods"}>{warning.metadata.namespace}</Link></td>
                    <td>{warning.status.phase}</td>
                    <td>{getRestartCount(warning)}</td>
                    <td>{getStatus(warning)}</td>
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