import React from 'react'


export default React.createClass({

  render() {
    const node = this.props.node;
    const usage = this.props.usage;

    const totalCPU = parseInt(node.status.capacity.cpu) * 1000;
    const percentCPU = parseInt(usage.cpu) / totalCPU;
    const roundedCPU = Math.round(percentCPU * 100);

    const divStyle = {
      width: (roundedCPU * 5) + 'px'
    };

    return (
      <div className="row">
        <div className="col-sm-2 text-right">CPU: {roundedCPU}%</div>
        <div className="col-sm-10">
          <div className="bar-container">
            <div className="cpu-bar" style={divStyle}>&nbsp;</div>
          </div>
        </div>
      </div>
    );
  }

});
