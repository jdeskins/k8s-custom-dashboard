import React from 'react'
import NavLink from './NavLink'
import { Link } from 'react-router'


export default React.createClass({
  getInitialState: function() {
    return {
      username: ''
    }
  },


  render() {
    return (
      <div>
        <header className="main-header">

          <nav className="navbar navbar-static-top">
            <a href="#" className="sidebar-toggle" data-toggle="offcanvas" role="button">
              <span className="sr-only">Toggle navigation</span>
            </a>
            <div className="navbar-custom-menu">
              <Link to={"/"}><div className="logo">Custom Kubernetes Dashboard</div></Link>
            </div>
          </nav>
        </header>
        <div className="main-sidebar">
          <section className="sidebar">
            <ul role="nav" className="sidebar-menu">
              <li className="header">MAIN NAVIGATION</li>
              <li><NavLink to="/deployments">Deployments</NavLink></li>
              <li><NavLink to="/namespaces">Namespaces</NavLink></li>
              <li><NavLink to="/events">All Events</NavLink></li>
              <li><NavLink to="/pods">All Pods</NavLink></li>
            </ul>
          </section>
        </div>
        <div className="content-wrapper">
          <div className="container-fluid">
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
})
