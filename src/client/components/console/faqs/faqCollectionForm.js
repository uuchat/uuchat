import React, { Component } from 'react';
import { Modal, Form, Input } from 'antd';
import { unEscapeHTML } from '../common/utils';

const FormItem = Form.Item;

class FAQCollectionForm extends Component {

    static defaultProps = {
        initialData: {
            collection: ''
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
            <Modal title={ modalType + " collection"}
                   visible={visible}
                   onOk={onOk.bind(this, this.props.form)}
                   confirmLoading={confirmLoading}
                   onCancel={onCancel.bind(this, this.props.form)}
                   okText={'OK'}
                   cancelText={'Cancel'}
                >
                <Form>
                    <p style={{margin: '0 -6px', paddingBottom: '12px', color: '#1890ff'}}>
                        <strong>Tip</strong>:&nbsp;
                        <label style={{fontSize: '8px'}}>
                            If any collection haven't issue, This Collection wouldn't show on visitor interface.
                        </label>
                    </p>
                    <FormItem
                        {...formItemLayout}
                        label="collection"
                        extra="Best not over 15 letters"
                        hasFeedback>
                        {getFieldDecorator('collection', {
                            initialValue: unEscapeHTML(initialData.name),
                            rules: [
                                {max: 15, message: 'cannot be longer than 15 characters'},
                                {required: true, message: 'Please input your collection!'}
                            ]
                        })(
                            <Input maxlength='15'/>
                        )}
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

export default Form.create()(FAQCollectionForm);