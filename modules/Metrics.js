import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'
import moment from 'moment';
import Loader from './Loader'
import Pod from './elements/Pod'


let timer;


const getClassFromType = function(type) {
  let className = '';
  if (type === 'Warning') {
    className = 'danger';
  }
  return className;
};


const displayInvolvedObject = function(involvedObject) {
  let html;
  if (involvedObject.kind === 'Pod') {
    html = <Link to={"/namespaces/"+ involvedObject.namespace +"/pods/"+ involvedObject.name}>Pod {involvedObject.name}</Link>;
  } else {
    html = involvedObject.kind + ' ' + involvedObject.name;
  }
  return html;
};


export default React.createClass({
  getInitialState: function() {
    return {
      hpa: {
        spec: {
          minReplicas: 0,
          maxReplicas: 0
        },
        status: {
          currentCPUUtilizationPercentage: 0,
          currentReplicas: 0,
          desiredReplicas: 0
        }
      },
      events: [],
      filteredEvents: [],
      isLoading: false,
      warningCount: 0,
      pods: [],
      filteredPods: [],
      refreshValue: '0',
      namespace: '',
      name: ''
    }
  },


  componentWillReceiveProps: function (nextProps) {
    console.log('In componentWillReceiveProps...');
    // Only load if params have changed
    if (nextProps.location.query.namespace != this.props.location.query.namespace
      || nextProps.location.query.name != this.props.location.query.name) {

      clearInterval(timer);
      var namespace = nextProps.location.query.namespace;
      var name = nextProps.location.query.name;
      this.setState({namespace: namespace, name: name});
      this.loadDocument(namespace, name);

      var refreshValue = this.state.refreshValue;
      if (refreshValue != undefined && refreshValue != '0') {
        const refreshInterval = parseInt(refreshValue) * 1000;
        this.startRefresh(refreshInterval, namespace, name);
      }

    }
  },


  componentWillUnmount: function() {
    if (timer) {
      clearInterval(timer);
    }
  },


  startRefresh: function(refreshInterval, namespace, name) {
    console.log('In startRefresh for: namespace=' + namespace + ' name=' + name);
    let loadDocument = this.loadDocument;
    timer = setInterval(function(x, y) {
      loadDocument(x, y);
    }, refreshInterval, namespace, name);
  },


  handleRefreshChange: function(event) {
    const refreshValue = event.target.value;
    this.setState({refreshValue: refreshValue});
    if (refreshValue === "0") {
      clearInterval(timer);
    } else {
      const refreshInterval = parseInt(refreshValue) * 1000;
      this.startRefresh(refreshInterval, this.state.namespace, this.state.name);
    }
  },


  loadDocument: function(namespace, name) {
    console.log('In Metrics: loadDocument... namespace: ' + namespace + ' name: ' + name);

    // Get HPA
    axios.get('/apis/extensions/v1beta1/namespaces/' + namespace + '/horizontalpodautoscalers/productavailability')
      .then(res => {
        this.setState({
          hpa: res.data
        });

      });

    // Get Events
    axios.get('/api/v1/namespaces/' + namespace + '/events')
      .then(res => {
        let events = [];
        let filteredEvents = [];
        let warningCount = 0;
        if (res.data.items) {
          // Sort descending
          events = res.data.items.sort(function(a, b) {return b.lastTimestamp.localeCompare(a.lastTimestamp);});
          const eventsLength = events.length;
          for (let i = 0; i < eventsLength; i++) {
            if (events[i].type === 'Warning') {
              warningCount += 1;
            }
            if (events[i].involvedObject.name.startsWith(name)) {
              filteredEvents.push(events[i]);
            }
          }
        }
        this.setState({ isLoading: false, events: events, filteredEvents: filteredEvents, warningCount: warningCount });
      });

    // Get Pods filtered by app name
    axios.get('/api/v1/namespaces/' + namespace + '/pods')
      .then(res => {
        let pods = [];
        let filteredPods = [];
        if (res.data.items) {
          // Sort by start time
          pods = res.data.items.sort(function(a, b) {
            if(a.status.startTime < b.status.startTime) return -1;
            if(a.status.startTime > b.status.startTime) return 1;
            return 0;
          });

          for (let i = 0; i < pods.length; i++) {
            if (pods[i].metadata.labels.app === name) {
              filteredPods.push(pods[i]);
            }
          }
        }

        this.setState({
          pods: pods,
          filteredPods: filteredPods
        });
      });

  },


  componentDidMount: function() {
    let namespace = this.props.location.query.namespace;
    let name = this.props.location.query.name;

    this.setState({
      namespace: namespace,
      name: name
    });

    this.loadDocument(namespace, name);
  },


  render() {
    return (
      <div>
        <h1>Metrics</h1>
        <form>
          <label>Refresh:</label>
          <select name="refreshInterval" onChange={this.handleRefreshChange}>
            <option value="0">No Refresh</option>
            <option value="2">2 Seconds</option>
            <option value="5">5 Seconds</option>
            <option value="10">10 Seconds</option>
            <option value="30">30 Seconds</option>
          </select>
        </form>

        <div className="col-md-6">
          <h2>Pods</h2>
          <table className="table table-striped table-bordered table-hover table-condensed">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {this.state.filteredPods.map( pod =>
                <tr key={pod.metadata.name}>
                  <td><Link to={"/namespaces/"+ pod.metadata.namespace +"/pods/" + pod.metadata.name}>{pod.metadata.name}</Link></td>
                  <td>{pod.status.phase}</td>
                  <td>{moment(pod.status.startTime).format("MM/DD HH:mm:ss")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="col-md-6">
          <h2>Horizontal Pod Autoscaling</h2>
          <table className="table table-striped table-bordered table-hover table-condensed">
            <thead>
            <tr>
              <th>Current CPU</th>
              <th>Current</th>
              <th>Desired</th>
              <th>Min</th>
              <th>Max</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td className="text-center">{this.state.hpa.status.currentCPUUtilizationPercentage}%</td>
              <td className="text-center">{this.state.hpa.status.currentReplicas}</td>
              <td className="text-center">{this.state.hpa.status.desiredReplicas}</td>
              <td className="text-center">{this.state.hpa.spec.minReplicas}</td>
              <td className="text-center">{this.state.hpa.spec.maxReplicas}</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div className="col-md-12">
          <h2>Events</h2>
          <table className="table table-striped table-bordered table-hover table-condensed">
            <thead>
              <tr>
                <th>Name</th>
                <th>Reason</th>
                <th>Message</th>
                <th>Count</th>
                <th>Last Time</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {this.state.filteredEvents.map(event =>
                <tr key={event.metadata.uid} className={getClassFromType(event.type)}>
                  <td>{displayInvolvedObject(event.involvedObject)}</td>
                  <td>{event.reason}</td>
                  <td>{event.message}</td>
                  <td className="text-right">{event.count}</td>
                  <td>{moment(event.lastTimestamp).format("HH:mm:ss.sss")}</td>
                  <td>{event.type}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


      </div>
    )
  }
})