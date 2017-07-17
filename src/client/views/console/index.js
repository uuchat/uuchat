import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import LoginView from '../../components/console/loginView';
import Console from '../../components/console/console';
import '../../static/css/common.css';
import '../../static/css/customerSuccess.css';
import '../../static/css/console.css';

ReactDOM.render(
    <LocaleProvider locale={enUS}>
        <BrowserRouter basename="/console">
            <div style={{height: '100%'}}>
                <Switch>
                    <Route exact path="/" component={ LoginView }/>
                    <Route exact path="/index" component={ Console }/>
                </Switch>
            </div>
        </BrowserRouter>
    </LocaleProvider>
    , document.getElementById('console-body'));
