import React, { Component } from 'react';
import { Breadcrumb, Col, Row, message, Card } from 'antd';
import NumberCard from './numberCard';
import MonthlyReport from './monthlyReport';
import { fetchAsync } from '../common/utils';

export default class Dashboard extends Component {

    state = {
        numbersData: {},
        monthlyData: {}
    };

    getData = async (url, key) => {
        try {
            let data = await fetchAsync(url);
            if (data.code !== 200) return message.error(data.msg, 4);

            let st = {};
            st[key] = data.msg;

            this.setState(st);
        } catch (e) {
            message.error(e.message, 4);
        }
    };

    getDataSource = async () => {
        await Promise.all([
            this.getData('/console/numbers', 'numbersData'),
            this.getData('/console/monthly', 'monthlyData')
        ]);
    };

    componentDidMount() {
        this.getDataSource();
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

        const topColResponsiveProps = {
            xs: 24,
            sm: 12,
            md: 12,
            lg: 6,
            xl: 6,
            style: {marginBottom: 24}
        };

        numbersList.forEach(function (number) {
            number.number = numbersData[number.key] || 0;
        });

        let numberCards = numbersList.map((item, key) =>
                (<Col key={key} {...topColResponsiveProps}>
                    <NumberCard {...item} />
                </Col>)
        );

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                </Breadcrumb>

                <div style={{ padding: "0 12px" }}>
                    <Row gutter={24}>
                        { numberCards }
                        <Col xs={24} lg={24} md={24}>
                            <Card title="Monthly Report" bordered={false}>
                                <MonthlyReport { ...monthlyData }/>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}