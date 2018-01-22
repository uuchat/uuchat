import React, {Component} from 'react';
import {Input} from 'antd';
import Tips from '../common/tips';


class Password extends Component{
    passwordSave = (e) => {
        let pwd = this.refs.pwd.input.value.replace(/^\s$/g, '');
        let comfirmPwd = this.refs.comfirmPwd.input.value.replace(/^\s$/g, '');

        if (pwd === '' || pwd.length < 6) {
            Tips.error('Password is incorrect!');
            return false;
        }

        if (pwd !== comfirmPwd) {
            Tips.error('Confirm password is incorrect!');
            return false;
        }

        fetch('/customersuccesses/'+localStorage.getItem('uuchat.csid')+'/passwd', {
            credentials: 'include',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'passwd='+pwd
        })
            .then((res)=>res.json())
            .then(function(d){
                if (d.code === 200) {
                    Tips.success('Change password success!');
                    setTimeout(function () {
                        window.location.href = '/login';
                    }, 3000);
                } else {
                    Tips.error(d.msg);
                }
            })
            .catch(function(e){
                Tips.error(e);
            });
    };
    render(){
        return (
            <div className="menu-password">
                <h4>New password</h4>
                <Input size="large" type="password" placeholder="Min 6 characters" ref="pwd" />
                <h4>Confirm password</h4>
                <Input size="large" type="password" placeholder="Confirm password" ref="comfirmPwd" />
                <div className="menu-password-footer">
                    <a className="theme-save ant-btn ant-btn-primary" onClick={this.passwordSave}>Save</a>
                </div>
            </div>
        );
    }
}

export default Password;