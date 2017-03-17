import React from 'react'


export default React.createClass({

  render() {
    const node = this.props.node;
    const usage = this.props.usage;

    const totalMemory = parseInt(node.status.capacity.memory.replace('Ki'));
    const percentMemory = parseInt(usage.memory.replace('Ki')) / totalMemory;
    const roundedMemory = Math.round(percentMemory * 100);

    const divStyle = {
      width: (roundedMemory * 5) + 'px'
    };

    return (
      <div className="row">
        <div className="col-sm-2 text-right">MEM: {roundedMemory}%</div>
        <div className="col-sm-10">
          <div className="bar-container">
            <div className="mem-bar" style={divStyle}>&nbsp;</div>
          </div>
        </div>
      </div>
    );
  }

});
