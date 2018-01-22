import React, { Component } from 'react';
import { Form, Icon, Input, Button } from 'antd';
import Tips from './tips';
import '../../static/css/login.css';

const FormItem = Form.Item;

class Login extends Component{

    static defaultProps = {
        fetchUrl: '/login',
        redirect: '/chat'
    };

    handleSubmit = (e) => {
        e.preventDefault();

        this.props.form.validateFields((err, values) => {

            if (!err) {

                let { fetchUrl, redirect } = this.props;

                fetch(fetchUrl, {
                    credentials: 'include',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: 'email='+values.userName+'&passwd='+values.password
                })
                .then((res)=>res.json())
                .then(function(d){
                    if (d.code === 200) {
                        localStorage.setItem('uuchat.csid', d.msg.csid);
                        localStorage.setItem('uuchat.email', d.msg.email);
                        localStorage.setItem('uuchat.name', d.msg.name);
                        localStorage.setItem('uuchat.displayName', (d.msg.displayName ? d.msg.displayName : ''));
                        localStorage.setItem('uuchat.avatar', (d.msg.photo ? d.msg.photo : ''));
                        localStorage.setItem('bgThemeImg', (d.msg.background ? d.msg.background : ''));
                        localStorage.setItem('bgThemeOpacity', (d.msg.opacity ? d.msg.opacity : 0.7));
                        if (document.querySelector('#uu-chat')) {
                            document.querySelector('#uu-chat').innerHTML = '<div class="chat-loading"><div class="bounce bounce1"></div><div class="bounce bounce2"></div><div class="bounce bounce3"></div></div>';
                        }
                        window.location.href = redirect;
                    } else if (d.code === 1002) {
                        Tips.error('Email or password is empty');
                    } else if (d.code === 1003) {
                        Tips.error('Email not found');
                    } else if (d.code === 1004) {
                        Tips.error('Password wrong');
                    } else {
                        Tips.error(d.msg);
                    }
                })
                .catch(function(e){
                    Tips.error(e);
                });

            }
        });

    };

    resetPassword = (e) => {
        let email = document.querySelector('#userName').value || '';
        let emailReg = /[0-9a-z_A-Z.\\-]+@(([0-9a-zA-Z]+)[.]){1,2}[a-z]{2,3}/g;

        if (!email || !emailReg.test(email)) {
            Tips.error('Please enter your vaild email', 4);
            return false;
        }
        fetch('/passwdreset', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'email='+email
        }).then((res)=>res.json())
            .then(d => {
                if (d.code === 200) {
                    Tips.success('Please check your email ' + email + ' in time to reset your password', 8);
                }

            })
            .catch(e => {
                Tips.error(e, 4);
            });

    };

    render(){
        let { getFieldDecorator } = this.props.form;
        return (
            <div className="login-section">
                <div className="login-header"><a href="/"></a></div>
                <div className="login-body">
                    <Form onSubmit={this.handleSubmit} className="login-form">
                        <FormItem>
                             {
                                getFieldDecorator('userName', {
                                    rules: [{type: 'email', message: 'The input is not valid Email!'},{ required: true, message: 'Please input your email!' }]
                                })(
                                    <Input size="large" prefix={<Icon type="mail" style={{ fontSize: 18 }} />} placeholder="Email Address" />
                                )
                              }
                            </FormItem>
                            <FormItem>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: 'Password must be no less than 6 characters', min: 6 }]
                            })(
                            <Input size="large" prefix={<Icon type="lock" style={{ fontSize: 18 }} />} type="password" placeholder="Password" />
                        )}
                        </FormItem>
                       <FormItem>
                            <Button type="primary" size="large" htmlType="submit" className="login-form-button">Sign in </Button>
                           <a className="login-form-forgot" href="javascript:;" onClick={this.resetPassword}>Forgot password？</a>
                        </FormItem>
                    </Form>
                </div>
            </div>
        );
    }

}

const LoginForm = Form.create()(Login);

export default LoginForm;