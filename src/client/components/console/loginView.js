import React, { Component } from 'react';
import Login from '../login';

class LoginView extends Component {

    render() {
        const loginProps = {
            fetchUrl: '/console/login',
            redirect: '/console/index'
        };

        return (
            <Login {...loginProps}/>
        );
    }
}

export default LoginView;