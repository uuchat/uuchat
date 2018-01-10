import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch,BrowserRouter } from 'react-router-dom';
import AsyncComponent from '../components/common/asyncComponent.js';
import LoginView from './login/index';
import '../static/css/app.css';

const CustomerSuccessView = AsyncComponent(() => import('./customerSuccess/index')
    .then(module => module.default), { name: 'chat'});



ReactDOM.render(
    <BrowserRouter basename="/">
        <div style={{height: '100%'}}>
            <Switch>
                <Route exact path="/login" component={LoginView}  />
                <Route exact path="/chat" component={CustomerSuccessView}  />
            </Switch>
        </div>
    </BrowserRouter>
, document.getElementById('uu-chat'));


