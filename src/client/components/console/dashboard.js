import React, {Component} from 'react';
//import {FormattedMessage} from 'react-intl';
import { Breadcrumb, Col, Row, message,Card } from 'antd';

import NumberCard from './numberCard';
import MonthlyReport from './monthlyReport';

class Dashboard extends Component {

    state = {
        numbersData: [
            {
                key: 'dailyChats',
                icon: 'customer-service',
                color: '#f797d6',
                title: 'Daily Chats',
                number: 0,
            }, {
                key: 'offlineCustomers',
                icon: 'user-delete',
                color: '#f69899',
                title: 'Offline Messages',
                number: 0,
            }, {
                key: 'dailyRates',
                icon: 'star-o',
                color: '#8fc9fb',
                title: 'Daily Rates',
                number: 0,
            }, {
                key: 'criticalRates',
                icon: 'star-o',
                color: '#f8c82e',
                title: 'Critical Rates',
                number: 0,
            },
        ],
        monthlyData: null,
    };

    getNumbersData = () => {
        let _component = this;
        let { numbersData } = this.state;

        return fetch('/console/numbers')
            .then((res)=>res.json())
            .then(function (data) {

                if (200 === data.code) {

                    var numberObj = data.msg.reduce(function (result, value) {
                        Object.assign(result, value);
                        return result;
                    }, {});

                    numbersData.forEach(function (number) {
                        number.number = numberObj[number.key];
                    });

                    _component.setState({
                        numbersData
                    });
                } else {
                    message.error(data.msg, 4);
                }
            }).catch(function (e) {
                message.error(e.message, 4);
            });
    }

    getMonthlyData = ()=> {
        let _component = this;
        let { monthlyData } = this.state;

        return fetch('/console/monthly')
            .then((res)=>res.json())
            .then(function (data) {

                if (200 === data.code) {

                    monthlyData = data.msg;

                    _component.setState({
                        monthlyData
                    });
                } else {
                    message.error(data.msg, 4);
                }
            }).catch(function (e) {
                message.error(e.message, 4);
            });
    }

    componentDidMount = () => {
        this.getNumbersData();
        this.getMonthlyData();
    }

    render() {
        let { numbersData, monthlyData } = this.state;

        let numberCards = numbersData.map((item, key) =>
                (<Col key={key} lg={6} md={12}>
                    <NumberCard {...item} />
                </Col>)
        );

        let monthlyProps = {
            monthlyData
        };

        return (
            <div style={{ overflowX:'hidden' }}>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                </Breadcrumb>

                <Row gutter={24}>
                    {numberCards}
                    <Col lg={24} md={24}>
                        <Card title="Monthly Report" bordered={false}>
                            <MonthlyReport {...monthlyProps}/>
                        </Card>
                    </Col>
                </Row>

                <div style={{ padding: 0, background: '#fff' }}>

                </div>
            </div>
        );
    }
}

export default Dashboard;