import React from 'react'
import axios from 'axios';
import { Link } from 'react-router'
import Loader from './Loader'


export default React.createClass({
  getInitialState: function() {
    return {
      isLoading: false,
      namespaces: [],
      namespace: '',
      autoscalers: [],
      errorMessage: '',
      hasHPA: true
    }
  },


  getNamespaces: function() {
    const _this = this;

    axios.get('/api/v1/namespaces')
      .then(response => {
        this.setState({ isLoading: false });
        const namespaces = response.data.items.sort(function(a, b) {
          if(a.metadata.name < b.metadata.name) return -1;
          if(a.metadata.name > b.metadata.name) return 1;
          return 0;
        });
        _this.setState({ namespaces });
      })
      .catch(function (error) {
        _this.setState({
          isLoading: false,
          errorMessage: error
        });
        console.log(error);
      });
  },


  getHPAs: function(namespace) {
    console.log('Get hpas for: ' + namespace);
    const _this = this;
    let autoscalers = [];

    _this.setState({ autoscalers });

    axios.get('/apis/extensions/v1beta1/namespaces/' + namespace + '/horizontalpodautoscalers')
      .then(response => {
        _this.setState({ isLoading: false });
        console.log(response.data);
        if (response.data.items) {
          autoscalers = response.data.items.sort(function(a, b) {
            if(a.metadata.name < b.metadata.name) return -1;
            if(a.metadata.name > b.metadata.name) return 1;
            return 0;
          });
          _this.setState({ autoscalers: autoscalers, hasHPA: true });
        } else {
          console.log('No autoscale items found');
          _this.setState({ autoscalers: [], hasHPA: false });
        }
      })
      .catch(function (error) {
        _this.setState({ isLoading: false });
        console.log(error);
      });
  },


  componentDidMount: function() {
    this.setState({ isLoading: true });
    let namespace = this.props.params.namespace;
    console.log('namespace', namespace);

    if (namespace) {
      this.getHPAs(namespace);
    } else {
      this.getNamespaces();
    }
  },


  selectNamespace: function(event) {
    const namespace = event.target.value;
    console.log('Selected ' + namespace);
    this.getHPAs(namespace);
  },


  render: function() {
    return (
      <div>
        <h1>Horizontal Pod Autoscalers</h1>

        <div>{this.state.errorMessage}</div>

        <div className="col-md-12">
          <h2>Namespace</h2>
          <Loader isLoading={this.state.isLoading}/>
          <div className="col-md-6">
            <form>
              <label>Select Namespace:</label>
              <select name="namespace" onChange={this.selectNamespace}>
                <option value="">Select</option>
                {this.state.namespaces.map(namespace =>
                  <option key={namespace.metadata.name} value={namespace.metadata.name}>{namespace.metadata.name}</option>
                )}
              </select>
            </form>
          </div>
        </div>

        {!this.state.hasHPA &&
          <h3>No autoscalers for namespace: {this.state.namespace}</h3>
        }

        {this.state.autoscalers.length > 0 &&
          <div className="col-md-12">
            <h2>Select Scaler</h2>
            <div className="col-md-6">
              <table className="table table-striped table-bordered table-hover table-condensed">
                <thead>
                <tr>
                  <th>Name</th>
                </tr>
                </thead>
                <tbody>
                {this.state.autoscalers.map(autoscaler =>
                  <tr key={autoscaler.metadata.uid}>
                    <td><Link to={"/scaling/"+ autoscaler.metadata.namespace + '/' + autoscaler.metadata.name}>{autoscaler.metadata.name}</Link></td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    )
  }

})
