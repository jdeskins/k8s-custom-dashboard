import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'


export default React.createClass({
  getInitialState: function() {
    return {
      pod: {},
      name: "",
      podText: "",
      containers: [],
      error: ""
    }
  },


  componentDidMount: function() {
    const url = '/api/v1/namespaces/' + this.props.params.namespace + '/pods/' + this.props.params.name;
    const _this = this;
    axios.get(url)
      .then(res => {
        const pod = res.data;
        this.setState({
          pod: pod,
          name: pod.metadata.name,
          podText: JSON.stringify(pod, null, 4),
          containers: pod.spec.containers
        });
      })
      .catch(function (error) {
        var message;
        if (error.response.status == 404) {
          message = 'Pod: ' + _this.props.params.name + ' is not found.  The pod may have been killed.';
        } else {
          message = 'There was a problem retrieving this Pod';
        }
        _this.setState({ error: message,  name: _this.props.params.name });
      });
  },


  render() {
    return (
      <div>
        <h1>Pod: {this.state.name}</h1>
        <div>
          {this.state.containers.map(container =>
            <div key={container.name} className="container-item">
              <Link to={"/namespaces/"+ this.props.params.namespace +"/pods/"+ this.state.name +"/log?container=" + container.name}>
                <button type="button" className="btn btn-sm btn-primary">View Logs</button>
              </Link>
              <b>{ container.name }</b>
            </div>
          )}
        </div>
        <div>
          Namespace: {this.props.params.namespace} <span className="divider">|</span>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/events"}>Events</Link> <span className="divider">|</span>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/pods"}>Pods</Link> <span className="divider">|</span>
          <Link to={"/namespaces/"+ this.props.params.namespace +"/services"}>Services</Link>
        </div>

        {this.state.error &&
          <div className="bg-danger">{ this.state.error }</div>
        }
        <div className="col-md-12 code">
          {this.state.podText}
        </div>
      </div>
    )
  }
})