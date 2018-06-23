import React, { Component } from 'react';
import { Form, Button, Row, Col, DatePicker, Input, Icon } from 'antd';

const { RangePicker } = DatePicker;

class CustomerSearchForm extends Component {

    handleChange = (key, values) => {
        let fields = this.props.form.getFieldsValue();
        fields[key] = values;
        fields = this.handleFields(fields);
        this.props.onFilterChange(fields);
    };

    handleFields = (fields) => {
        const { lastTime } = fields;
        if (lastTime && lastTime.length) {
            fields.lastTime = [lastTime[0].format('YYYY-MM-DD'), lastTime[1].format('YYYY-MM-DD')];
        }
        return fields;
    };

    handleReset = () => {
        const fields = this.props.form.getFieldsValue();

        for (let item in fields) {
            if ({}.hasOwnProperty.call(fields, item)) {
                if (Array.isArray(fields[item])) {
                    fields[item] = [];
                } else {
                    fields[item] = undefined;
                }
            }
        }
        this.setState({calendarFooterValue: null});
        this.props.form.setFieldsValue(fields);
        this.handleSubmit();
    };

    handleSubmit = () => {
        let fields = this.props.form.getFieldsValue();
        fields = this.handleFields(fields);
        this.props.onFilterChange(fields);
    };

    render() {
        const { form: { getFieldDecorator }, handleExport } = this.props;
        const ColProps = {
            xs: 24,
            sm: 12,
            style: {
                marginBottom: 16
            }
        };
        const TwoColProps = {
            ...ColProps,
            xl: 96
        };

        return (
            <Row gutter={24}>
                <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }}>
                    {getFieldDecorator('country')(
                        <Input size="normal"
                               placeholder="search country"
                               suffix={<Icon type="search" />}
                               onPressEnter={this.handleSubmit}/>
                    )}
                </Col>
                <Col {...ColProps} xl={{ span: 6 }} md={{ span: 8 }} sm={{ span: 12 }}>
                    {getFieldDecorator('lastTime')(
                        <RangePicker style={{ width: '100%' }}
                                     size="normal"
                                     placeholder={['last screen start', 'last screen end']}
                                     onChange={this.handleChange.bind(null, 'lastTime')}/>
                    )}
                </Col>
                <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }}>
                </Col>
                <Col {...TwoColProps} xl={{ span: 10 }} md={{ span: 24 }} sm={{ span: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div>
                            <Button style={{ marginLeft: 8 }} type="primary" className="margin-right"
                                    onClick={ this.handleSubmit }>Search</Button>
                            <Button style={{ marginLeft: 8 }} onClick={ handleExport }>Export</Button>
                            <Button style={{ marginLeft: 8 }} onClick={ this.handleReset }>Reset</Button>
                        </div>
                    </div>
                </Col>
            </Row>
        );
    }
}

export default Form.create()(CustomerSearchForm);