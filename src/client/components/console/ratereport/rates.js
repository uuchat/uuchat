import React, { Component } from 'react';
import moment from 'moment';
import { Breadcrumb, Button, DatePicker, Row, Col, Radio } from 'antd';
import Tips from '../../common/tips';
import AsyncComponent from '../../common/asyncComponent.js';
import { fetchAsync, formatDate } from '../common/utils';
import { saveCSV } from '../common/fileExport';

const RateExpandedTable = AsyncComponent(() => import ('./rateExpandedTable').then(component => component.default));

const { MonthPicker } = DatePicker;

const defaultMonth = moment().format('YYYY-MM');

export default class Rates extends Component {

    state = {
        dataSource: [],
        sortedInfo: null,
        month: defaultMonth
    };

    clearSorters = () => {
        this.setState({
            sortedInfo: null
        });
    };

    getDataSource = async () => {
        try {
            let { month } = this.state;
            month = month || defaultMonth;
            this.setState({loading: true});

            let reportUrl = '/console/rates/report/month/' + month;

            let data = await fetchAsync(reportUrl);

            if (data.code !== 200) return Tips.error(data.msg, 4);

            data.msg.forEach(function (item) {
                item.key = item.csid;
            });

            this.setState({
                dataSource: data.msg
            });
        } catch (e) {
            Tips.error(e.msg, 4);
        }
    };

    UNSAFE_componentWillMount() {
        const location = this.props.location;
        if (location.state) this.setState({month: location.state.month});
    }

    componentDidMount() {
        this.getDataSource();
    }

    handleChange = (pagination, filters, sorter) => {
        this.setState({
            sortedInfo: sorter
        });
    };

    handleMonthPickerChange = (date, dateString) => {
        this.setState({
            month: dateString
        }, this.getDataSource);
    };

    handleRadioButtonChange = (e) => {
        window.location.href = "#/" + e.target.value;
    };

    handleExport = () => {
        const { dataSource } = this.state;

        let ds = [];

        dataSource.forEach(function(item){
            item.rates.forEach(function(rate){
                let exp = {};
                 Object.assign(exp, item);
                 Object.assign(exp, rate);

                delete exp.rates;
                delete exp.key;

                ds.push(exp);
            });
        });

        const options = {
            filename: 'uuchat_rates_'+ formatDate(new Date(), 'yyyyMMdd_hhmmss')
        };

        saveCSV(ds, options);
    };

    render() {
        let { dataSource,sortedInfo, month } = this.state;
        sortedInfo = sortedInfo || {};

        let defaultPickerMonth = moment(month);

        return (
            <div>
                <Row type="flex" justify="space-between">
                    <Col span={4}>
                        <Breadcrumb separator=">">
                            <Breadcrumb.Item>Data</Breadcrumb.Item>
                            <Breadcrumb.Item>Rate Report</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col span={6}>
                        <div className="ant-breadcrumb">
                            <Radio.Group size="large" value="rates" onChange={this.handleRadioButtonChange}>
                                <Radio.Button value="rates" style={{padding: '0 20px'}}>
                                    Rate Report
                                </Radio.Button>
                                <Radio.Button value="rateList" style={{padding: '0 20px'}}>
                                        Rate List
                                </Radio.Button>
                            </Radio.Group>
                        </div>
                    </Col>
                    <Col span={4}></Col>
                </Row>

                <div className="content-body">
                    <div className="table-deals">
                        <div className="table-search">
                            <MonthPicker size="normal"
                                    onChange={ this.handleMonthPickerChange }
                                    defaultValue={ defaultPickerMonth }
                                    placeholder="Select month"/>
                        </div>
                        <div className="table-operations">
                            <Button onClick={ this.handleExport }>Export</Button>
                            <Button onClick={this.clearSorters}>Clear sorters</Button>
                        </div>
                    </div>

                    <RateExpandedTable
                        dataSource={ dataSource }
                        sortedInfo={ sortedInfo }
                        month={ month || defaultMonth }
                        onChange={ this.handleChange }/>
                </div>
            </div>
        );
    }
}