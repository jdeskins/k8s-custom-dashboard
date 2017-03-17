import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router'
import CPU from './elements/CPU'
import Memory from './elements/Memory'
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
      refreshValue: '0',
      nodesByName: {},
      nodeHealth: {}
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


  loadNodeHealth: function() {
    const url = '/api/v1/nodes';
    const nodeHealthUrl = '/api/v1/namespaces/kube-system/services/heapster/proxy/apis/metrics/v1alpha1/nodes';
    const _this = this;

    // Load Nodes
    axios.get(url)
      .then(res => {
        var nodes = [];
        if (res.data.items) {
          nodes = res.data.items.sort(function(a, b) {
            if(a.metadata.name < b.metadata.name) return -1;
            if(a.metadata.name > b.metadata.name) return 1;
            return 0;
          });
        }

        var nodesByName = {};
        nodes.map(function(node){
          nodesByName[node.metadata.name] = node;
        });

        this.setState({
          nodesByName: nodesByName
        });

        // Load Node health
        axios.get(nodeHealthUrl)
          .then(res => {
            var nodeHealth = {};
            if (res.data.items) {
              const nodes = res.data.items;
              nodes.map(function(node){
                nodeHealth[node.metadata.name] = node;
              });
            }
            _this.state.nodeHealth = nodeHealth;
            _this.forceUpdate();
          });

      });
  },


  loadDocument: function(namespace) {
    var url, title;

    this.loadNodeHealth();

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
        var containerCount = 0;
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
          containerCount += pod.spec.containers.length;

        });

        var numberOfNodes = Object.keys(podsByNodes).length;
        this.setState({
          pods: pods,
          title: title + ' (' + pods.length + ' pods, '+ containerCount +' containers on ' + numberOfNodes + ' nodes)',
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
    const nodeHealth = this.state.nodeHealth;

    return (
      <div>
        <h1>{this.state.title}</h1>

        <form>
          <label>Refresh Interval:</label>
          <select name="refreshInterval" onChange={this.handleRefreshChange}>
            <option value="0">No Refresh</option>
            <option value="2">2 Seconds</option>
            <option value="5">5 Seconds</option>
            <option value="30">30 Seconds</option>
            <option value="300">5 minutes</option>
            <option value="600">10 minutes</option>
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
                    <td>{getRestartCount(warning)} <span className="small">(since {moment(warning.status.startTime).format("MM/DD HH:mm")})</span></td>
                    <td>{getStatus(warning)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        }


        {Object.keys(this.state.podsByNodes).map( nodeName =>
          <div key={nodeName} className="row">
            <div className="col-md-12 node-container">
              <div className="node row">
                <div className="name">NODE: {nodeName}</div>
                {nodeHealth[nodeName] &&
                  <div>
                    <CPU node={this.state.nodesByName[nodeName]} usage={nodeHealth[nodeName].usage} />
                    <Memory node={this.state.nodesByName[nodeName]} usage={nodeHealth[nodeName].usage} />
                  </div>
                }

                {this.state.podsByNodes[nodeName].map(pod =>
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