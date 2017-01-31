import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'


export default React.createClass({
  getInitialState: function() {
    return {
      pod: {},
      name: "",
      podText: ""
    }
  },


  componentDidMount: function() {
    const url = '/api/v1/namespaces/' + this.props.params.namespace + '/pods/' + this.props.params.name;
    axios.get(url)
      .then(res => {
        const pod = res.data;
        this.setState({ pod: pod, name: pod.metadata.name, podText: JSON.stringify(pod, null, 4) });
      });
  },


  render() {
    return (
      <div>
        <h1>Pod: {this.state.name}</h1>
        <div>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/events"}>Events</Link> <span className="divider">|</span>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/pods"}>Pods</Link> <span className="divider">|</span>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/services"}>Services</Link>
        </div>
        <div className="col-md-12 code">
          {this.state.podText}
        </div>
      </div>
    )
  }
})