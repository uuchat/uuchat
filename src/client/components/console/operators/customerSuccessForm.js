import React, { Component } from 'react';
import { Modal, Form, Input, Button } from 'antd';

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

        const formItemLayout = null;

        const { visible, onCancel, onOk, confirmLoading } = this.props;

        return (
            <Modal title="Invite a New User"
                   visible={visible}
                   onOk={onOk.bind(this, this.props.form)}
                   confirmLoading={confirmLoading}
                   onCancel={onCancel}
                   footer={[
                    <Button style={{width: '100%'}} type="primary" key="invite" onClick={onOk.bind(this, this.props.form)}>Send invitation now</Button>
                  ]}
                >
                <Form layout="vertical">
                    <FormItem {...formItemLayout} label="Email Address" hasFeedback>
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
                </Form>
            </Modal>
        );
    }
}

export default Form.create()(CustomerSuccessForm);