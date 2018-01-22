import React, { Component } from 'react';

class ChatSetting extends Component{
    constructor(){
        super();
        this.state = {
            active: 'Account'
        };
    }
    toggleMenu = (text) => {
        let {customerSuccess} = this.props;
        customerSuccess.setState({
            menuSetting: text
        });
        this.setState({
            active: text
        });
    };
    accountHandle = () => {
        this.toggleMenu('Account');
    };
    passwordHandle = () => {
        this.toggleMenu('Password');
    };
    shortcutHandle = () => {
        this.toggleMenu('Shortcuts');
    };
    themeHandle = () => {
        this.toggleMenu('Theme');
    };
    render(){

        let {active} = this.state;

        return (
            <ul className="customerSuccess-setting">
                <li onClick={this.accountHandle} className={active+' account'}>Your Account</li>
                <li onClick={this.passwordHandle} className={active+' password'}>Change Password</li>
                <li onClick={this.shortcutHandle} className={active+' shortcuts'}>Shortcut Settings</li>
                <li onClick={this.themeHandle} className={active+' theme'}>Change Background</li>
            </ul>
        );
    }
}

export default ChatSetting;