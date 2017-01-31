import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import App from './modules/App'
import About from './modules/About'
import Deployments from './modules/Deployments'
import Events from './modules/Events'
import Home from './modules/Home'
import Log from './modules/Log'
import Namespaces from './modules/Namespaces'
import NSEvents from './modules/NSEvents'
import Pod from './modules/Pod'
import Pods from './modules/Pods'
import PodsByLabel from './modules/PodsByLabel'
import Services from './modules/Services'


render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home}/>
      <Route path="/about" component={About}/>
      <Route path="/deployments" component={Deployments}/>
      <Route path="/events" component={Events}/>
      <Route path="/namespaces" component={Namespaces}/>
      <Route path="/namespaces/:namespace/events" component={NSEvents}/>
      <Route path="/namespaces/:namespace/pods/:name" component={Pod}/>
      <Route path="/namespaces/:namespace/pods/:name/log" component={Log}/>
      <Route path="/namespaces/:namespace/pods" component={Pods}/>
      <Route path="/namespaces/:namespace/services" component={Services}/>
      <Route path="/pods" component={Pods}/>
      <Route path="/pods/label/:labelkey/:labelvalue" component={PodsByLabel}/>
    </Route>
  </Router>
), document.getElementById('app'));
