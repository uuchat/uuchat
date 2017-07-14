import React, { Component } from 'react';
import { Form, Input, Checkbox, Row, Col, Button, message } from 'antd';
import '../static/css/register.css';

var FormItem = Form.Item;

class RegisterForm extends Component {
    constructor(){
        super();
        this.state = {
            confirmDirty: false
        };
    }
    handleSubmit = (e) =>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err) {
                fetch('/register', {
                    credentials: 'include',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: 'email='+values.email+'&passwd='+values.password
                })
                .then((res)=>res.json())
                .then(function(d){
                    if(200 === d.code){
                        localStorage.setItem('avatar', '');
                        localStorage.setItem('uuchat.csid', d.msg.csid);
                        localStorage.setItem('uuchat.email', d.msg.email);
                        localStorage.setItem('uuchat.name', d.msg.name);
                        localStorage.setItem('uuchat.displayName', d.msg.displayName);
                        localStorage.setItem('uuchat.avatar', d.msg.photo);
                        window.location.href = "/chat";
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
    handleConfirmBlur = (e) => {
        var value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }
    checkPassword = (rule, value, callback) => {
        var form = this.props.form;
        if(value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!');
        }else {
            callback();
        }
    }
    checkConfirm = (rule, value, callback) => {
        var form = this.props.form;
        if(value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    }
    hasErrors = (fieldsError) => {
        return Object.keys(fieldsError).some(field => fieldsError[field]);
    }
    render() {

        var { getFieldDecorator, getFieldsError } = this.props.form;

        return (
            <Row>
                <Col xs={{span:24, offset: 0}} sm={{span: 20, offset: 2}} md={{span: 20, offset: 2}} lg={{span: 24, offset: 0}} xl={{span: 24, offset: 0}}>
                    <Form onSubmit={this.handleSubmit} layout="vertical">
                        <FormItem
                            label="E-mail"
                            hasFeedback
                            >
                            {getFieldDecorator('email', {
                                rules: [{
                                    type: 'email', message: 'The input is not valid E-mail!',
                                }, {
                                    required: true, message: 'Please input your E-mail!',
                                }],
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem
                            label="Password"
                            hasFeedback
                            >
                            {getFieldDecorator('password', {
                                rules: [{
                                    required: true, message: 'Password must be no less than 6 characters!', min: 6
                                }, {
                                    validator: this.checkConfirm,
                                }],
                            })(
                                <Input type="password" />
                            )}
                        </FormItem>
                        <FormItem
                             label="Confirm Password"
                             hasFeedback
                            >
                            {getFieldDecorator('confirm', {
                                rules: [{
                                    required: true, message: 'Password must be no less than 6 characters!', min: 6
                                }, {
                                    validator: this.checkPassword,
                                }],
                            })(
                                <Input type="password" onBlur={this.handleConfirmBlur} />
                            )}
                       </FormItem>
                        <FormItem  style={{ marginBottom: 8 }}>
                            {getFieldDecorator('agreement', {
                                valuePropName: 'checked',
                                rules: [{
                                    required: true, message: 'Please agreement!',
                                }]
                            })(
                                <Checkbox>I have read the <a href="">agreement</a></Checkbox>
                            )}
                        </FormItem>
                        <FormItem>
                            <Button type="primary" htmlType="submit" size="large" disabled={this.hasErrors(getFieldsError())}>Register</Button>
                        </FormItem>
                    </Form>
                </Col>
            </Row>
        );
    }
}

var RegistrationForm = Form.create()(RegisterForm);


class Register extends Component{

    render(){

        return (
            <div className="uuchat-register">
                <div className="register-header"><span>U</span></div>
                <RegistrationForm />
            </div>
        );
    }

}

export default Register;

