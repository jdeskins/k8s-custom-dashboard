import React from 'react'
import Namespaces from './Namespaces'


export default React.createClass({
  render() {
    return (
      <div>
        <h3>Custom Dashboard</h3>
        <div className="col-md-8">
          <p>Dashboard to display cluster information and status.</p>
          <p>
            This uses the credentials currently used by your local kubectl command.
            Use that command to change clusters or set the KUBECONFIG environment variable to point
            to the cluster config file.
          </p>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Namespaces/>
          </div>
        </div>
      </div>
    )
  }
})
