import React, { Component } from 'react';
import moment from 'moment';
import { Breadcrumb, Button, message, DatePicker } from 'antd';
import AsyncComponent from '../../common/asyncComponent.js';
import { fetchAsync } from '../common/utils';

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

            if (data.code !== 200) return message.error(data.msg, 4);

            data.msg.forEach(function (item) {
                item.key = item.csid;
            });

            this.setState({
                dataSource: data.msg
            });
        } catch (e) {
            message.error(e.msg, 4);
        }
    };

    componentWillMount() {
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

    render() {
        let { dataSource,sortedInfo, month } = this.state;
        sortedInfo = sortedInfo || {};

        let defaultPickerMonth = moment(month);

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Rate Report</Breadcrumb.Item>
                </Breadcrumb>

                <div className="content-body">
                    <div className="table-deals">
                        <div className="table-search">
                            <MonthPicker size="large"
                                    onChange={ this.handleMonthPickerChange }
                                    defaultValue={ defaultPickerMonth }
                                    placeholder="Select month"/>
                        </div>
                        <div className="table-operations">

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