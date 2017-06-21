/**
 * Created by jianzhiqiang on 2017/6/20.
 */
import React,{ Component } from 'react';
import { Form, Button, Row, Col, DatePicker, Input, Select } from 'antd';
import moment from 'moment';

const Search = Input.Search;
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
    }

    handleFields = (fields) => {
        const { createAt } = fields;
        if (createAt && createAt.length) {
            fields.createAt = [createAt[0].format('YYYY-MM-DD'), createAt[1].format('YYYY-MM-DD')]
        }
        return fields;
    }

    handleReset = () => {
        const fields = this.getFieldsValue();

        for (let item in fields) {
            if ({}.hasOwnProperty.call(fields, item)) {
                if (Array.isArray(fields[item])) {
                    fields[item] = []
                } else {
                    fields[item] = undefined
                }
            }
        }

        //Object.assign(fields, this.filter);

        this.setFieldsValue(fields);
        this.handleSubmit();
    }

    handleSubmit = () => {
        let fields = this.getFieldsValue();
        fields = this.handleFields(fields);
        this.onFilterChange(fields);
    }

    render() {
        const { csSource } = this.state;

        let { createdAt } = this.filter;
        let initialCreateAt = [];

        if (createdAt && createdAt[0]) {
            initialCreateAt[0] = createdAt[0]
        }

        if (createdAt && createdAt[1]) {
            initialCreateAt[1] = createdAt[1]
        }

        const rateList = [1, 2, 3, 4, 5];

        const ColProps = {
            xs: 24,
            sm: 12,
            style: {
                marginBottom: 16,
            },
        };
        const TwoColProps = {
            ...ColProps,
            xl: 96,
        };

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
                    {this.getFieldDecorator('createdAt', {initialValue: initialCreateAt})(
                        <RangePicker style={{ width: '100%' }} size="large"/>
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