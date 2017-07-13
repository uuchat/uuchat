

import React, {Component} from 'react';
import { Modal, Form, Input, Tooltip, Icon } from 'antd';

const FormItem = Form.Item;

class CustomerSuccessForm extends Component {
    state = {
        confirmDirty: false
    };

    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({confirmDirty: this.state.confirmDirty || !!value});
    };

    checkPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    };

    checkConfirm = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], {force: true});
        }
        callback();
    };

    render() {
        const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 7}
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 15}
            }
        };

        const { visible, onCancel, onOk, confirmLoading } = this.props;

        return (
            <Modal title="Create customer session"
                   visible={visible}
                   onOk={onOk}
                   confirmLoading={confirmLoading}
                   onCancel={onCancel}
                   okText="Create"
                   cancelText="Cancel"
                >
                <Form>
                    <FormItem {...formItemLayout} label="E-mail" hasFeedback>
                        {getFieldDecorator('email', {
                            rules: [
                                {
                                    type: 'email', message: 'The input is not valid E-mail!'
                                },
                                {
                                    required: true, message: 'Please input your E-mail!'
                                }]
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="Password"
                        hasFeedback
                        >
                        {getFieldDecorator('password', {
                            rules: [
                                {
                                    required: true, message: 'min 6 words', min: 6
                                },
                                {
                                    validator: this.checkConfirm
                                }
                            ]
                        })(
                            <Input type="password"/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="Confirm Password"
                        hasFeedback
                        >
                        {getFieldDecorator('confirm', {
                            rules: [
                                {
                                    required: true, message: 'min 6 words', min: 6
                                },
                                {
                                    validator: this.checkPassword
                                }
                            ]
                        })(
                            <Input type="password" onBlur={this.handleConfirmBlur}/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={(
                        <span>
                          name&nbsp;
                          <Tooltip title="What do you want other to call you?">
                            <Icon type="question-circle-o" />
                          </Tooltip>
                        </span>
                      )}
                        hasFeedback
                        >
                        {getFieldDecorator('name', {})(
                            <Input />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

export default CustomerSuccessForm;