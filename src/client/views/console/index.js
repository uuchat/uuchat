/**
 * Created by jianzhiqiang on 2017/5/12.
 */
import '../../static/css/common.css';
import '../../static/css/console.css';
import '../../static/css/customerSuccess.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import LoginView from '../../components/console/loginView';
import Console from '../../components/console/console';

ReactDOM.render(
    <BrowserRouter basename="/console">
        <div style={{height: '100%'}}>
            <Switch>
                <Route exact path="/" component={ LoginView }/>
                <Route exact path="/index" component={ Console }/>
            </Switch>
        </div>
    </BrowserRouter>
    , document.getElementById('console-body'));
