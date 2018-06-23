import React, { Component } from 'react';
import { Breadcrumb, Col, Row } from 'antd';
import moment from 'moment';
import NumberCard from './numberCard';
import { fetchAsync } from '../common/utils';
import Tips from '../../common/tips';
import AsyncComponent from '../../common/asyncComponent';
import DashboardSearchForm from './dashboardSearchForm';

const ChartCard = AsyncComponent(() => import ('./chartCard').then(module => module.default));

const dateRange = {
    'la1month': { text: 'Last Month', values: [moment().startOf('month').subtract(1, 'months'), moment().startOf('month')]},
    'la1week': {text: 'Last Week', values: [moment().startOf('week').subtract(7, 'days'), moment().startOf('week')]},
    '1day': {text: 'Today', values: [moment().startOf('day'), moment().endOf('day')]},
    '1week': {text: 'Current week', values: [moment().startOf('week'), moment().startOf('week').add(7, 'days')]},
    '1month': {text: 'Current month', values: [moment().startOf('month'), moment().startOf('month').add(1, 'months')]}
};


export default class Dashboard extends Component {

    state = {
        numbersData: {},
        chatData: [],
        rateData: [],
        agentData: [],
        dateRangeData: {},
        filter: {}
    };

    globalFilterKeys = ['createdAt'];

    getData = async (url, key) => {
        try {
            let data = await fetchAsync(url);
            if (data.code !== 200) return Tips.error(data.msg, 4);

            let state = {};
            state[key] = data.msg;

            this.setState(state);
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    getDataSource = async () => {
        await Promise.all([
            this.getData('/console/numbers', 'numbersData'),
            this.getData('/console/chart/chat', 'chatData'),
            this.getData('/console/chart/rate', 'rateData'),
            this.getData('/customersuccesses', 'agentData')
        ]);
    };

    getDisplayData = async () => {
        const { filter } = this.state;

        let numParams = '?1=1';
        let chartParams = '?1=1';

        let _self = this;

        Object.keys(filter).forEach(function (key) {
            if (_self.globalFilterKeys.indexOf(key) > -1) {
                if (key === 'createdAt') {
                    numParams += "&createdAtStart=" + filter['createdAt'][0];
                    chartParams += "&createdAtStart=" + filter['createdAt'][0];
                    numParams += "&createdAtEnd=" + filter['createdAt'][1];
                    chartParams += "&createdAtEnd=" + filter['createdAt'][1];
                } else {
                    numParams += "&" + key + "=" + filter[key];
                    chartParams += "&" + key + "=" + filter[key];
                }
            } else {
                chartParams += "&" + key + "=" + filter[key];
            }
        });

        await Promise.all([
            this.getData('/console/numbers' + numParams, 'numbersData'),
            this.getData('/console/chart/chat' + chartParams, 'chatData'),
            this.getData('/console/chart/rate' + chartParams, 'rateData')
        ]);
    };

    getChartData = async () => {
        const { filter } = this.state;

        var params = '?1=1';

        Object.keys(filter).forEach(function (key) {
            if (key === 'createdAt') {
                params += "&createdAtStart=" + filter['createdAt'][0];
                params += "&createdAtEnd=" + filter['createdAt'][1];
            } else {
                params += "&" + key + "=" + filter[key];
            }
        });

        await Promise.all([
            this.getData('/console/chart/chat' + params, 'chatData'),
            this.getData('/console/chart/rate' + params, 'rateData')
        ]);
    };

    componentDidMount() {
        this.getDataSource();
    }

    handleChange = (key, value) => {
        let { filter } = this.state;

        if (value) {
            filter[key] = value;
        } else {
            delete filter[key];
        }

        if (this.globalFilterKeys.indexOf(key) > -1) {
            this.setState({filter}, this.getDisplayData);
        } else {
            this.setState({filter}, this.getChartData);
        }
    };

    handleCalendarChange = (form, e) => {
        e.preventDefault();

        let {dateRangeData, filter} = this.state;

        const range = e.target.value || '1day';
        const rangeValues =  dateRange[range].values;

        form.setFieldsValue({
            rangeDatePicker: rangeValues
        }, () => {
            dateRangeData.dateRadioButton = range;
            filter.createdAt = rangeValues;

            this.setState({dateRangeData, filter}, this.getDisplayData);
        });
    };

    handleRangePickerChange = (form, values) => {
        if (!values || !values.length) {
            return;
        }
        let {dateRangeData, filter} = this.state;

        form.setFieldsValue({
            dateRadioButton: ''
        }, () => {
            dateRangeData.dateRadioButton = '';
            dateRangeData.rangeDatePicker = values;
            filter.createdAt = values;

            this.setState({dateRangeData, filter}, this.getDisplayData);
        });
    };

    render() {
        let { numbersData, chatData, rateData, agentData } = this.state;

        let numbersList = [
            {
                key: 'dailyChats',
                icon: 'customer-service',
                color: '#f797d6',
                title: 'Chats',
                number: 0
            }, {
                key: 'missChats',
                icon: 'user-delete',
                color: '#f69899',
                title: 'Miss Chats',
                number: 0
            }, {
                key: 'offlineCustomers',
                icon: 'mail',
                color: '#00908f',
                title: 'Customer Offline_Messages',
                number: 0
            }, {
                key: 'firstRespondTime',
                icon: 'clock-circle-o',
                color: '#00bb58',
                title: 'Average First Respond_Time',
                number: 0
            }
        ];

        const topColResponsiveProps = {
            xs: 24,
            sm: 12,
            md: 12,
            lg: 6,
            xl: 6,
            style: {marginBottom: 24}
        };

        const handleChange = this.handleChange;

        const chartCardProps = {chatData, rateData, agentData, handleChange};

        numbersList.forEach(function (number) {
            number.number = numbersData[number.key] || 0;
            if (number.key === 'firstRespondTime') {
                number.number += 's';
            }
        });

        let numberCards = numbersList.map((item, key) =>
                (<Col key={key} {...topColResponsiveProps}>
                    <NumberCard {...item} />
                </Col>)
        );


        const searchFormProps = {
            handleCalendarChange: this.handleCalendarChange,
            handleRangePickerChange: this.handleRangePickerChange,
            dateRange: dateRange
        };

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                </Breadcrumb>

                <div style={{ padding: "0 12px" }}>
                    <DashboardSearchForm {...searchFormProps}/>
                    <br/>

                    <Row gutter={24}>
                        { numberCards }
                    </Row>

                    <ChartCard {...chartCardProps} />
                </div>
            </div>
        );
    }
}