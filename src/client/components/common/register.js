import React, { Component } from 'react';
import { Form, Input, Checkbox, Icon, Button } from 'antd';
import {Base64DecodeUnicode} from './utils';
import Tips from './tips';
import '../../static/css/register.css';

const FormItem = Form.Item;

class RegisterForm extends Component {
    constructor() {
        super();
        this.state = {
            token: '',
            email: '',
            inputReadOnly: true
        };
    }
    componentDidMount() {
        let href = window.location.href;
        href = href.split('/register/');


        if (href[1]) {
            let email = '';
            email = href[1].replace(/\/$/g, '');
            email = Base64DecodeUnicode(email) || '';
            email = email.split('|');

            this.setState({
                token: href[1],
                email: email[1]
            });
        }

    }
    handleSubmit = (e) =>{
        e.preventDefault();
        let {token} = this.state;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!values.agreement) {
                this.props.form.setFields({
                    agreement: {
                        errors: [new Error('Please agree to the agreement')]
                    }
                });
                return false;
            }
            if (!err) {
               fetch('/register/'+token, {
                    credentials: 'include',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: 'email='+values.email+'&passwd='+values.password+'&name='+values.fullName
                })
                .then((res)=>res.json())
                .then(function(d){
                    if (d.code === 200) {
                        localStorage.setItem('avatar', '');
                        localStorage.setItem('uuchat.csid', d.msg.csid);
                        localStorage.setItem('uuchat.email', d.msg.email);
                        localStorage.setItem('uuchat.name', d.msg.name);
                        localStorage.setItem('uuchat.displayName', d.msg.displayName);
                        localStorage.setItem('uuchat.avatar', d.msg.photo);
                        window.location.href = "/chat";
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
    hasErrors = (fieldsError) => {
        return Object.keys(fieldsError).some(field => fieldsError[field]);
    };
    fullNameFocus = () => {
        this.setState({
            inputReadOnly: false
        });
    };
    render() {

        let { getFieldDecorator, getFieldsError } = this.props.form;
        let {email, inputReadOnly} = this.state;
        let emailInput = {};
        let readOnly = {};

        email && (emailInput.readonly='true');
        inputReadOnly && (readOnly.readonly='true');

        return (
            <Form onSubmit={this.handleSubmit} layout="vertical">
                <FormItem
                    label="Email address"
                    hasFeedback
                    >
                    {getFieldDecorator('email', {
                        initialValue: email,
                        rules: [{
                            type: 'email', message: 'Please enter your vaild email!'
                        }, {
                            required: true, message: 'Please enter your vaild email!'
                        }]
                    })(
                        <Input prefix={<Icon type="mail" style={{ fontSize: 16 }} />} size="large" placeholder="Eg. uuchat@example.com" {...emailInput} />
                    )}
                </FormItem>
                <FormItem
                    label="Full name"
                    hasFeedback
                    >
                    {getFieldDecorator('fullName', {
                        rules: [{
                            required: true, message: 'Please enter your full name!'
                        }]
                    })(
                        <Input prefix={<Icon type="user" style={{ fontSize: 16 }} />} size="large" placeholder="Eg. Taylor Swift" {...readOnly} onFocus={this.fullNameFocus} />
                    )}
                </FormItem>
                <FormItem
                     label="Password"
                     hasFeedback
                    >
                    {getFieldDecorator('password', {
                        rules: [{
                            required: true, message: 'Password at least 6 characters!', min: 6
                        }]
                    })(
                        <Input prefix={<Icon type="lock" style={{ fontSize: 16 }} />} type="password" size="large" placeholder="At least 6 characters" />
                    )}
               </FormItem>
               <FormItem  style={{ marginBottom: 8 }}>
                    {getFieldDecorator('agreement', {
                        valuePropName: 'checked',
                        rules: [{
                            required: true, message: 'Please agree to the agreement!'
                        }]
                    })(
                        <Checkbox>I have read the <a href="https://uuchat.io/privacy">agreement</a></Checkbox>
                    )}
                </FormItem>
                <FormItem>
                    <Button type="primary" htmlType="submit" className="sign-up-btn" size="large" disabled={this.hasErrors(getFieldsError())}>Sign up</Button>
                </FormItem>
            </Form>
        );
    }
}

const RegistrationForm = Form.create()(RegisterForm);


class Register extends Component{

    render() {

        return (
            <div className="uuchat-register">
                <div className="register-header"><a href="/"></a></div>
                <div className="register-body">
                    <RegistrationForm />
                </div>
            </div>
        );
    }

}

export default Register;

