import React, {Component} from 'react';
//import {FormattedMessage} from 'react-intl';
import _ from 'lodash';
import { Breadcrumb, Col, Row, message } from 'antd';
import NumberCard from './numberCard';

class Dashboard extends Component {

    state = {
        numbers: [
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
                title: 'Offline Customers',
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
        ]
    };

    getNumbers = () => {
        let _component = this;
        let { numbers } = this.state;

        fetch('/console/numbers')
            .then((res)=>res.json())
            .then(function (data) {

                if (200 === data.code) {

                    var numberObj = _.reduce(data.msg, function (result, value) {
                        Object.assign(result, value);
                        return result;
                    }, {});

                    numbers.forEach(function (number) {
                        number.number = numberObj[number.key];
                    });

                    _component.setState({
                        numbers
                    });
                } else {
                    message.error(data.msg, 4);
                }
            }).catch(function (e) {
                message.error(e.message, 4);
            });

    }

    componentDidMount = () => {
        this.getNumbers();
    }

    render() {
        let { numbers } = this.state;

        let numberCards = numbers.map((item, key) =>
                (<Col key={key} lg={6} md={12}>
                    <NumberCard {...item} />
                </Col>)
        );

        return (
            <div style={{ overflow:'-Scroll',overflowX:'hidden' }}>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                </Breadcrumb>

                <Row gutter={24}>
                    {numberCards}
                </Row>

                <div style={{ padding: 0, background: '#fff' }}>

                </div>
            </div>
        );
    }
}

export default Dashboard;