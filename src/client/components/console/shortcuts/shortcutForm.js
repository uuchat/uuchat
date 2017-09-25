import React, { Component } from 'react';
import { Modal, Form, Input } from 'antd';

const FormItem = Form.Item;

class ShortcutForm extends Component {

    static defaultProps={
        initialData: {
            shortcut: '',
            msg: ''
        }
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

        const { visible, onCancel, onOk, confirmLoading, initialData, modalType } = this.props;

        return (
            <Modal title={ modalType + " shortcut"}
                   visible={visible}
                   onOk={onOk.bind(this, this.props.form)}
                   confirmLoading={confirmLoading}
                   onCancel={onCancel.bind(this, this.props.form)}
                   okText={'OK'}
                   cancelText={'Cancel'}
                >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label="shortcut"
                        hasFeedback>
                        {getFieldDecorator('shortcut', {
                            initialValue: initialData.shortcut,
                            rules: [
                                {
                                    required: true, message: 'Please input your shortcut!'
                                }]
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="message"
                        hasFeedback
                        >
                        {getFieldDecorator('msg', {
                            initialValue: initialData.msg || '',
                            rules: [
                                {
                                    required: true, message: 'Please input your Expanded message!'
                                }
                            ]
                        })(
                            <Input type="textarea" autosize={{ minRows: 4 }}/>
                            )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

export default Form.create()(ShortcutForm);