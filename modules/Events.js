import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'
import moment from 'moment';
import Loader from './Loader'


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
      events: []
    }
  },

  componentDidMount: function() {
    this.setState({ isLoading: true });
    axios.get('/api/v1/events')
      .then(res => {
        var events = [];
        if (res.data.items) {
          events = res.data.items.sort(function(a, b) {return a.lastTimestamp.localeCompare(b.lastTimestamp);});
        }
        this.setState({ isLoading: false, events: events });
      });
  },

  render: function() {
    return (
      <div>
        <h1>Events ({this.state.events.length})</h1>
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
