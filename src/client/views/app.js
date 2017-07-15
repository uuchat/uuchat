import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch,BrowserRouter } from 'react-router-dom';
import AsyncComponent from './asyncComponent.js';
import LoginView from './login/index';
import '../static/css/app.css';

const CustomerSuccessView = AsyncComponent(() => import('./customerSuccess/index')
    .then(module => module.default), { name: 'chat'});

const RegisterView = AsyncComponent(() => import('./register/index')
    .then(module => module.default), { name: 'register' });

ReactDOM.render(
    <BrowserRouter basename="/">
        <div style={{height: '100%'}}>
            <Switch>
                <Route exact path="/" component={LoginView}  />
                <Route exact path="/chat" component={CustomerSuccessView}  />
                <Route exact path="/register" component={RegisterView} />
            </Switch>
        </div>
    </BrowserRouter>
, document.getElementById('uu-chat'));


