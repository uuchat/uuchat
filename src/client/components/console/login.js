/**
 * Created by lwc on 2017/5/5.
 */
import React, {Component} from 'react';
import 'whatwg-fetch';
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';

import '../../static/css/login.css';

const FormItem = Form.Item;


class Login extends Component{

    constructor(){
        super();
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    handleSubmit(e){
        e.preventDefault();

        this.props.form.validateFields((err, values) => {

            if (!err) {

                fetch('/console/login', {
                    credentials: 'include',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: 'email='+values.userName+'&passwd='+values.password
                })
                .then((res)=>res.json())
                .then(function(d){
                    if(200 === d.code){
                        localStorage.setItem('uuchat.csid', d.msg.csid);
                        localStorage.setItem('uuchat.email', d.msg.email);
                        localStorage.setItem('uuchat.name', d.msg.name);
                        localStorage.setItem('uuchat.displayName', (d.msg.displayName ? d.msg.displayName : ''));
                        localStorage.setItem('uuchat.avatar', (d.msg.photo ? d.msg.photo : ''));
                        window.location.href = "/console/index";
                    }else if(1002 === d.code){
                        message.error('User email is not found', 4);
                    }else if(1003 === d.code){
                        message.error('User unauthorized ', 4);
                    }else{
                        message.error(d.msg, 4);
                    }
                })
                .catch(function(e){
                    message.error(e, 4);
                });

            }
        });

    }


    render(){
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="login-body">
                <div className="login-header"> <span>U</span> </div>
                <Form onSubmit={this.handleSubmit} className="login-form">
                    <FormItem>
                         {
                            getFieldDecorator('userName', {
                                rules: [{type: 'email', message: 'The input is not valid E-mail!'},{ required: true, message: 'Please input your email!' }]
                            })(
                                <Input prefix={<Icon type="user" style={{ fontSize: 16 }} />} placeholder="Username or eamil" />
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
                                initialValue: true,
                            })(
                                <Checkbox>Remember me</Checkbox>
                        )}
                        <Button type="primary" htmlType="submit" className="login-form-button"> Log in </Button>
                    </FormItem>
                </Form>
            </div>
        );

    }

}

const LoginForm = Form.create()(Login);


export default LoginForm;