import React from 'react'
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router'


// TODO: Merge this with Events.js


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
      events: [],
      test: []
    }
  },

  componentDidMount: function() {
    const url = '/api/v1/namespaces/' + this.props.params.namespace + '/events';
    axios.get(url)
      .then(res => {
        var events = [];
        if (res.data.items) {
          events = res.data.items.sort(function(a, b) {return a.lastTimestamp.localeCompare(b.lastTimestamp);});
        }
        this.setState({ events });
      });
  },

  render() {
    return (
      <div>
        <h1>Events for {this.props.params.namespace}</h1>
        <span>Last Hour</span>
        <div>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/pods"}>Pods</Link> <span className="divider">|</span>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/services"}>Services</Link>
        </div>
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
              <td>{event.metadata.namespace}</td>
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