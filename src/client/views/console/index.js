import '../../static/css/common.css';
import '../../static/css/app.css';
import '../../static/css/console.css';
import '../../static/css/customerSuccess.css';

import React from 'react';
import ReactDOM from 'react-dom';
//import {addLocaleData, IntlProvider} from 'react-intl';
//import intl from 'intl';
import { Route, Switch, BrowserRouter } from 'react-router-dom';

import Login from '../../components/console/login';
import Console from '../../components/console/console';

//const currentlang = navigator.language;

/*function getLocale(language) {
 let locale = language.split('-')[0];

 //if (locale !== 'zh') locale = 'en';

 locale = 'en';

 return locale;
 }*/

/*function getFilename(locale) {
 switch (locale) {
 case 'en':
 return 'en_US';
 break;
 case 'zh':
 return 'zh_CN';
 break;
 default:
 return 'en_US';
 break;
 }
 }*/

//function importLocale(locale) {
//    Promise.all([
//        // polyfill
//        import(`intl/locale-data/jsonp/${locale}`),
//        // react-intl
//        import(`react-intl/locale-data/${locale}`),
//        // locales
//        import(`../../locales/${getFilename(locale)}`),
//    ]).then((values) => {
//        addLocaleData([...values[1]]);
//        let messages = values[2];

//ReactDOM.render(
//<IntlProvider locale={currentlang} messages={messages}>
//    <Console />
//</IntlProvider>
// ,
//document.getElementById('console-body')
//);
//});
//}

//importLocale(getLocale(currentlang));

/*<BrowserRouter basename="/">
 <div style={{height: '100%'}}>
 <Switch>
 <Route exact path="/index" component={ LoginForm }  />
 <Route exact path="/" component={ Console }  />
 </Switch>
 </div>
 </BrowserRouter>*/

ReactDOM.render(
    <BrowserRouter basename="/console">
        <div style={{height: '100%'}}>
            <Switch>
                <Route exact path="/" component={ Login }/>
                <Route exact path="/index" component={ Console }/>
            </Switch>
        </div>
    </BrowserRouter>
    , document.getElementById('console-body'));
