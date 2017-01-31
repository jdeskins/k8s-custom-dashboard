import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'


export default React.createClass({
  getInitialState: function() {
    return {
      log: "",
      name: ""
    }
  },


  componentDidMount: function() {
    const url = '/api/v1/namespaces/' + this.props.params.namespace + '/pods/' + this.props.params.name + '/log';
    axios.get(url)
      .then(res => {
        var log = res.data;
        if (log == "") {
          log = "(empty)";
        }
        this.setState({ log: log, name: this.props.params.name });
      });
  },


  render() {
    return (
      <div>
        <h1>Log for Pod: {this.state.name}</h1>
        <div>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/events"}>Events</Link> <span className="divider">|</span>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/pods"}>Pods</Link> <span className="divider">|</span>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/services"}>Services</Link>
        </div>
        <div className="col-md-12 code log">
          {this.state.log}
        </div>
      </div>
    )
  }
})