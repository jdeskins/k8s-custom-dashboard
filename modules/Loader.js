import React from 'react';


class Loader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.isLoading) {
      return (<h3 className="loading">Loading...</h3>)
    }
    return (null);
  }

}

export default Loader;