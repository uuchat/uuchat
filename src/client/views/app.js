/**
 * Created by lwc on 2017/5/3.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch,BrowserRouter } from 'react-router-dom';


import LoginView from './login/index';
import RegisterView from './register/index';
import CustomerSuccessView from './customerSuccess/index';

import '../static/css/common.css';
import '../static/css/app.css';

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


