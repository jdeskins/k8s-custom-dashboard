import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'
import Pod from './elements/Pod'


var timer;


export default React.createClass({
  getInitialState: function() {
    return {
      pods: [],
      podsByNodes: {},
      title: 'Pods By Label',
      refreshValue: '0',
      labelKey: '',
      labelValue: ''
    }
  },


  componentWillReceiveProps: function (nextProps) {
    // Only load if params have changed
    if (nextProps.params.labelkey != this.props.params.labelkey
      && nextProps.params.labelvalue != this.props.params.labelvalue) {

      clearInterval(timer);
      var labelKey = nextProps.params.labelkey;
      var labelValue = nextProps.params.labelvalue;
      this.setState({labelKey: labelKey, labelValue: labelValue});
      this.loadDocument(labelKey, labelValue);
      var refreshValue = this.state.refreshValue;
      if (refreshValue != undefined && refreshValue != '0') {
        const refreshInterval = parseInt(refreshValue) * 1000;
        this.startRefresh(refreshInterval, labelKey, labelValue);
      }

    }
  },


  componentWillUnmount: function() {
    if (timer) {
      clearInterval(timer);
    }
  },


  startRefresh: function(refreshInterval, labelKey, labelValue) {
    var loadDocument = this.loadDocument;
    timer = setInterval(function(x, y) {
      loadDocument(x, y);
    }, refreshInterval, labelKey, labelValue);
  },


  handleRefreshChange: function(event) {
    const refreshValue = event.target.value;
    this.setState({refreshValue: refreshValue});
    if (refreshValue == "0") {
      clearInterval(timer);
    } else {
      const refreshInterval = parseInt(refreshValue) * 1000;
      var labelKey = this.state.labelKey;
      var labelValue = this.state.labelValue;
      this.startRefresh(refreshInterval, labelKey, labelValue);
    }
  },


  loadDocument: function(labelkey, labelvalue) {
    console.log('In PodsByLabel: loadDocument... key: ' + labelkey + ' value: ' + labelvalue);
    axios.get('/api/v1/pods?labelSelector=' + labelkey + '%3D' + labelvalue)
      .then(res => {
        var pods = [];
        if (res.data.items) {
          pods = res.data.items;
        }

        var podsByNodes = {};
        pods.map(function(pod){
          var nodeName = pod.spec.nodeName;
          if (podsByNodes[nodeName]) {
            podsByNodes[nodeName].push(pod);
          } else {
            podsByNodes[nodeName] = [];
            podsByNodes[nodeName].push(pod);
          }
        });

        this.setState({
          pods: pods,
          podsByNodes: podsByNodes
        });

      });
  },


  componentDidMount: function() {
    this.setState({labelKey: this.props.params.labelkey, labelValue: this.props.params.labelvalue});
    this.loadDocument(this.props.params.labelkey, this.props.params.labelvalue);
  },


  render() {
    return (
      <div>
        <h1>{this.state.title} ({this.props.params.labelkey}: {this.props.params.labelvalue})</h1>
        <p>Found {this.state.pods.length}</p>

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