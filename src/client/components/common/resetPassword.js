import React, { Component } from 'react';
import { Form, Icon, Input, Button } from 'antd';
import Tips from './tips';
import '../../static/css/login.css';

const FormItem = Form.Item;

class Login extends Component{

    constructor() {
        super();
        this.state = {
            token: ''
        };
    }

    componentDidMount() {
        let href = window.location.href;
        href = href.split('/reset/');

        if (href[1]) {
            this.setState({
                token: href[1]
            });
        }
    }

    checkPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    };

    handleSubmit = (e) => {
        e.preventDefault();

        let token = this.state.token;

        this.props.form.validateFields((err, values) => {

            if (!err) {

                fetch('/passwdreset', {
                    credentials: 'include',
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: 'passwd='+values.password+'&repasswd='+values.password+'&token='+token
                })
                .then((res)=>res.json())
                .then(function(d){
                    if (d.code === 200) {
                        window.location.href = '/login';
                    } else if (d.code === 1011) {
                        Tips.error('Wrong password format');
                    } else if (d.code === 1013) {
                        Tips.error('The link has expired');
                    } else if (d.code === 1015) {
                        Tips.error('Password reset failed');
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

    render(){
        let { getFieldDecorator } = this.props.form;
        return (
            <div className="login-section">
                <div className="login-header"><a href="/"></a></div>
                <div className="login-body">
                    <Form onSubmit={this.handleSubmit} className="login-form">
                        <FormItem>
                            {
                                getFieldDecorator('password', {
                                    rules: [{ required: true, message: 'Password must be no less than 6 characters', min: 6 }]
                                })(
                                    <Input size="large" prefix={<Icon type="lock" style={{ fontSize: 18 }} />} type="password" placeholder="New Password" />
                                )
                            }
                        </FormItem>
                        <FormItem>
                            {getFieldDecorator('confirm', {
                                rules: [{ required: true, min: 6 }, {validator: this.checkPassword}]
                            })(
                                <Input size="large" prefix={<Icon type="lock" style={{ fontSize: 18 }} />} type="password" placeholder="Confirm Password" />
                            )}
                        </FormItem>
                        <FormItem>
                            <Button type="primary" size="large" htmlType="submit" className="login-form-button">Reset password</Button>
                        </FormItem>
                    </Form>
                </div>
            </div>
        );
    }

}

const LoginForm = Form.create()(Login);

export default LoginForm;