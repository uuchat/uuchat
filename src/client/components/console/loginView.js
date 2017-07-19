import React, { Component } from 'react';
import Login from '../login';

export default class LoginView extends Component {

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