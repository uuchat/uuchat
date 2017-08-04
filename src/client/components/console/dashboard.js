import React, { Component } from 'react';
import { Breadcrumb, Col, Row, message, Card } from 'antd';
import NumberCard from './numberCard';
import MonthlyReport from './monthlyReport';

export default class Dashboard extends Component {

    state = {
        numbersData: {},
        monthlyData: {}
    };

    getNumbersData = () => {
        let _component = this;

        return fetch('/console/numbers')
            .then((res)=>res.json())
            .then(function (data) {

                if (data.code === 200) {
                    _component.setState({
                        numbersData: data.msg
                    });
                } else {
                    message.error(data.msg, 4);
                }
            }).catch(function (e) {
                message.error(e.message, 4);
            });
    };

    getMonthlyData = ()=> {
        let _component = this;

        return fetch('/console/monthly')
            .then((res)=>res.json())
            .then(function (data) {

                if (data.code === 200) {
                    _component.setState({
                        monthlyData: data.msg
                    });
                } else {
                    message.error(data.msg, 4);
                }
            }).catch(function (e) {
                message.error(e.message, 4);
            });
    };

    componentDidMount () {
        this.getNumbersData();
        this.getMonthlyData();
    }

    render() {
        let { numbersData, monthlyData } = this.state;

        let numbersList = [
            {
                key: 'dailyChats',
                icon: 'customer-service',
                color: '#f797d6',
                title: 'Daily Chats',
                number: 0
            }, {
                key: 'offlineCustomers',
                icon: 'user-delete',
                color: '#f69899',
                title: 'Offline Messages',
                number: 0
            }, {
                key: 'dailyRates',
                icon: 'star-o',
                color: '#8fc9fb',
                title: 'Daily Rates',
                number: 0
            }, {
                key: 'criticalRates',
                icon: 'star-o',
                color: '#f8c82e',
                title: 'Critical Rates',
                number: 0
            }
        ];

        numbersList.forEach(function (number) {
            number.number = numbersData[number.key] || 0;
        });

        let numberCards = numbersList.map((item, key) =>
                (<Col key={key} lg={6} md={12}>
                    <NumberCard {...item} />
                </Col>)
        );

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                </Breadcrumb>

                <Row gutter={24}>
                    { numberCards }
                    <Col lg={24} md={24}>
                        <Card title="Monthly Report" bordered={false}>
                            <MonthlyReport { ...monthlyData }/>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}