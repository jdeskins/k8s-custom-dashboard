import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'
import moment from 'moment';
import Loader from './Loader'


var timer;


var getClassFromType = function(type) {
  var className = '';
  if (type == 'Warning') {
    className = 'danger';
  }
  return className;
};


export default React.createClass({
  getInitialState: function() {
    return {
      isLoading: false,
      events: [],
      namespace: ''
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
    this.setState({ isLoading: true });

    var url = '/api/v1/events';
    var title = 'Events';

    if (namespace) {
      url = '/api/v1/namespaces/' + namespace + '/events';
      title = 'Events for ' + namespace;
    }

    this.setState({ title: title });

    axios.get(url)
      .then(res => {
        var events = [];
        if (res.data.items) {
          events = res.data.items.sort(function(a, b) {return a.lastTimestamp.localeCompare(b.lastTimestamp);});
        }
        this.setState({ isLoading: false, events: events });
      });
  },


  componentDidMount: function() {
    var namespace = this.props.params.namespace;
    this.setState({namespace: namespace});
    this.loadDocument(namespace);
  },

  render: function() {
    return (
      <div>
        <h1>{this.state.title} ({this.state.events.length})</h1>
        <form>
          <label>Refresh Interval:</label>
          <select name="refreshInterval" onChange={this.handleRefreshChange}>
            <option value="0">No Refresh</option>
            <option value="2">2 seconds</option>
            <option value="60">1 minute</option>
            <option value="600">10 minutes</option>
          </select>
        </form>
        <span>Last Hour</span>
        <Loader isLoading={this.state.isLoading} />
        <table className="table table-striped table-bordered table-hover table-condensed">
          <thead>
          <tr>
            <th>NS</th>
            <th>Name</th>
            <th>Reason</th>
            <th>Message</th>
            <th>Count</th>
            <th>Last Time</th>
            <th>Type</th>
          </tr>
          </thead>
          <tbody>
          {this.state.events.map(event =>
            <tr key={event.metadata.uid} className={getClassFromType(event.type)}>
              <td><Link to={"/namespaces/"+ event.metadata.namespace +"/events"}>{event.metadata.namespace}</Link></td>
              <td>{event.involvedObject.kind} {event.involvedObject.name}</td>
              <td>{event.reason}</td>
              <td>{event.message}</td>
              <td>{event.count}</td>
              <td>{moment(event.lastTimestamp).format("HH:mm:ss.sss")}</td>
              <td>{event.type}</td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    )
  }

})
