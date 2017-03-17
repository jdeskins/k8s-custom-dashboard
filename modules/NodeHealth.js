import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'
import CPU from './elements/CPU'
import Memory from './elements/Memory'


export default React.createClass({
  getInitialState: function() {
    return {
      nodes: [],
      nodeHealth: {}
    }
  },


  loadDocument: function() {
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
        this.setState({
          nodes: nodes
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


  componentDidMount: function() {
    this.loadDocument();
  },


  render() {
    const nodeHealth = this.state.nodeHealth;
    return (
      <div>
        <h1>Node Health</h1>
        <div className="health">
          {this.state.nodes.map( node =>
            <div key={node.metadata.name} className="node row">
              <div className="name">{node.metadata.name}</div>
              {nodeHealth[node.metadata.name] &&
                <div>
                  <CPU node={node} usage={nodeHealth[node.metadata.name].usage} />
                  <Memory node={node} usage={nodeHealth[node.metadata.name].usage} />
                </div>
              }
            </div>
          )}
        </div>
      </div>
    )
  }
})