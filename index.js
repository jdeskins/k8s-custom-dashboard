import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import App from './modules/App'
import About from './modules/About'
import Deployments from './modules/Deployments'
import Events from './modules/Events'
import Home from './modules/Home'
import HPAs from './modules/HPAs'
import Log from './modules/Log'
import Namespaces from './modules/Namespaces'
import NodeHealth from './modules/NodeHealth'
import Pod from './modules/Pod'
import Pods from './modules/Pods'
import PodsByLabel from './modules/PodsByLabel'
import Scaling from './modules/Scaling'
import Services from './modules/Services'


render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Home}/>
      <Route path="/about" component={About}/>
      <Route path="/deployments" component={Deployments}/>
      <Route path="/events" component={Events}/>
      <Route path="/namespaces" component={Namespaces}/>
      <Route path="/namespaces/:namespace/events" component={Events}/>
      <Route path="/namespaces/:namespace/pods/:name" component={Pod}/>
      <Route path="/namespaces/:namespace/pods/:name/log" component={Log}/>
      <Route path="/namespaces/:namespace/pods" component={Pods}/>
      <Route path="/namespaces/:namespace/services" component={Services}/>
      <Route path="/nodes" component={NodeHealth}/>
      <Route path="/pods" component={Pods}/>
      <Route path="/pods/label/:labelkey/:labelvalue" component={PodsByLabel}/>
      <Route path="/scaling" component={HPAs}/>
      <Route path="/scaling/:namespace/:appname" component={Scaling}/>
      <Route path="/services" component={Services}/>
    </Route>
  </Router>
), document.getElementById('app'));
