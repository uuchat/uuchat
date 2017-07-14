import React, { Component } from 'react';
import moment from 'moment';
import { Form, Button, Row, Col, DatePicker, Select, Radio } from 'antd';
import { rateList } from './constants';

const { RangePicker } = DatePicker;
const Option = Select.Option;

class RateSearchForm extends Component {
    constructor(props) {
        super(props);
        const { filter, onFilterChange } = this.props;
        this.filter = filter;
        this.onFilterChange = onFilterChange;

        const { getFieldsValue, setFieldsValue, getFieldDecorator } = this.props.form;
        this.getFieldsValue = getFieldsValue;
        this.setFieldsValue = setFieldsValue;
        this.getFieldDecorator = getFieldDecorator;

        this.state = {
            csSource: [],
            rangePickerOpen: false,
            calendarFooterValue: '7days'
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.csSource) {
            this.setState({csSource: nextProps.csSource});
        }
    }

    handleChange = (key, values) => {
        let fields = this.getFieldsValue();
        fields[key] = values;
        fields = this.handleFields(fields);
        this.onFilterChange(fields);
    };

    handleFields = (fields) => {
        const { createdAt } = fields;
        if (createdAt && createdAt.length) {
            fields.createdAt = [createdAt[0].format('YYYY-MM-DD'), createdAt[1].format('YYYY-MM-DD')];
        }
        return fields;
    };

    handleReset = () => {
        const fields = this.getFieldsValue();

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
        this.setFieldsValue(fields);
        this.handleSubmit();
    };

    handleSubmit = () => {
        let fields = this.getFieldsValue();
        fields = this.handleFields(fields);
        this.onFilterChange(fields);
    };

    handleCalendarFooterChange = (e) => {
        let range = e.target.value;
        let endDate = moment();
        let key = 'createdAt';
        let values = [moment().subtract(7, 'days'), endDate];
        switch (range) {
            case '7days':
                break;
            case '1month':
                values[0] = moment().subtract(1, 'months');
                break;
            case '3months':
                values[0] = moment().subtract(3, 'months');
                break;
            case '6months':
                values[0] = moment().subtract(6, 'months');
                break;
            case '1years':
                values[0] = moment().subtract(1, 'years');
                break;
            default:
                break;
        }

        this.setState({
            calendarFooterValue: range
        });

        const fields = this.getFieldsValue();
        fields.createdAt = values;
        this.setFieldsValue(fields);

        this.handleChange(key, values);
    };

    render() {
        const { csSource, rangePickerOpen,calendarFooterValue } = this.state;

        const initialCreatedAt = this.filter.createdAt;

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

        const renderCalendarFooter = ()=> {
            return (
                <Radio.Group style={{padding:'8px 0'}} size='large'
                             defaultValue={ calendarFooterValue }
                             onChange={this.handleCalendarFooterChange}>
                    <Radio.Button style={{padding:'0 8px'}} value='7days'>Last Week</Radio.Button>
                    <Radio.Button style={{padding:'0 8px'}} value='1month'>Last Month</Radio.Button>
                    <Radio.Button style={{padding:'0 8px'}} value='3months'>Last 3 Months</Radio.Button>
                    <Radio.Button style={{padding:'0 8px'}} value='6months'>Last 6 Months</Radio.Button>
                    <Radio.Button style={{padding:'0 8px'}} value='1year'>Last year</Radio.Button>
                </Radio.Group>
            );
        }

        return (
            <Row gutter={24}>
                <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }}>
                    {this.getFieldDecorator('rate')(
                        <Select
                            showSearch
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="Select Rate"
                            optionFilterProp="children"
                            onChange={ this.handleChange.bind(null, 'rate') }
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                            {rateList.map(d => <Option key={d}>{d}</Option>)}
                        </Select>
                    )}
                </Col>
                <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }}>
                    {this.getFieldDecorator('csid')(
                        <Select
                            showSearch
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="Select Email"
                            optionFilterProp="children"
                            onChange={ this.handleChange.bind(null, 'csid') }
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                            {csSource.map(d => <Option key={d.csid}>{d.email}</Option>)}
                        </Select>
                    )}
                </Col>
                <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }}>
                    {this.getFieldDecorator('createdAt', {initialValue: initialCreatedAt})(
                        <RangePicker style={{ width: '100%' }} size="large"
                                     renderExtraFooter={renderCalendarFooter}
                                     open={ rangePickerOpen }
                                     onChange={this.handleChange.bind(null, 'createdAt')}/>
                    )}
                </Col>
                <Col {...TwoColProps} xl={{ span: 10 }} md={{ span: 24 }} sm={{ span: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div>
                            <Button style={{ marginLeft: 8 }} type="primary" size="large" className="margin-right"
                                    onClick={ this.handleSubmit }>Search</Button>
                            <Button style={{ marginLeft: 8 }} size="large" onClick={ this.handleReset }>Reset</Button>
                        </div>
                    </div>
                </Col>
            </Row>
        );
    }
}

export default Form.create()(RateSearchForm);