import React, { Component } from 'react';
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';
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
                        message.error('Email is not found', 4);
                    } else if (d.code === 1003) {
                        message.error('User unauthorized ', 4);
                    } else {
                        message.error(d.msg, 4);
                    }
                })
                .catch(function(e){
                    message.error(e, 4);
                });

            }
        });

    };

    render(){
        let { getFieldDecorator } = this.props.form;
        return (
            <div className="login-body">
                <div className="login-header"> <span></span> </div>
                <Form onSubmit={this.handleSubmit} className="login-form">
                    <FormItem>
                         {
                            getFieldDecorator('userName', {
                                rules: [{type: 'email', message: 'The input is not valid E-mail!'},{ required: true, message: 'Please input your email!' }]
                            })(
                                <Input prefix={<Icon type="user" style={{ fontSize: 16 }} />} placeholder="Username Or Email" />
                            )
                          }
                        </FormItem>
                        <FormItem>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: 'Password must be no less than 6 characters', min: 6 }]
                        })(
                        <Input prefix={<Icon type="lock" style={{ fontSize: 16 }} />} type="password" placeholder="Password" />
                    )}
                    </FormItem>
                   <FormItem>
                        {getFieldDecorator('remember', {
                                valuePropName: 'checked',
                                initialValue: true
                            })(
                                <Checkbox>Remember me</Checkbox>
                        )}
                        <a className="login-form-forgot" href="">Forgot password</a>
                        <Button type="primary" htmlType="submit" className="login-form-button">Log in </Button> Or <a href="/register">Sign up!</a>
                    </FormItem>
                </Form>
            </div>
        );
    }

}

const LoginForm = Form.create()(Login);

export default LoginForm;