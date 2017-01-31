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
          <a href="/#/" className="logo">
            <span className="logo-lg">Kube Dashboard 2</span>
          </a>
          <nav className="navbar navbar-static-top">
            <a href="#" className="sidebar-toggle" data-toggle="offcanvas" role="button">
              <span className="sr-only">Toggle navigation</span>
            </a>
            <div className="navbar-custom-menu text-right">
              {this.state.username &&
                <div className="user-info">
                  <div>Logged in: {this.state.username}</div>
                  <div><Link to={"/logout"}>Log Out</Link></div>
                </div>
              }
            </div>
          </nav>
        </header>
        <div className="main-sidebar">
          <section className="sidebar">
            <ul role="nav" className="sidebar-menu">
              <li className="header">MAIN NAVIGATION</li>
              <li><NavLink to="/namespaces">Namespaces</NavLink></li>
              <li><NavLink to="/events">All Events</NavLink></li>
              <li><NavLink to="/pods">All Pods</NavLink></li>
              <li><NavLink to="/about">About</NavLink></li>
            </ul>
          </section>
        </div>
        <div className="content-wrapper">
          <div className="container">
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
})
