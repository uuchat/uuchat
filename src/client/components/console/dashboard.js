import React, {Component} from 'react';
//import {FormattedMessage} from 'react-intl';

import { Breadcrumb, Col } from 'antd';

import NumberCard from './numberCard';

const numbers = [
    {
        icon: 'team',
        color: '#f797d6',
        title: 'Online Customers',
        number: 18,
    }, {
        icon: 'customer-service',
        color: '#f69899',
        title: 'Customers Success',
        number: 3,
    }, {
        icon: 'message',
        color: '#8fc9fb',
        title: 'Messages',
        number: 132,
    }, {
        icon: 'star-o',
        color: '#f8c82e',
        title: 'Rates',
        number: 20,
    },
];

class Dashboard extends Component {
    numberCards = numbers.map((item, key) =>
            (<Col key={key} lg={6} md={12}>
                <NumberCard {...item} />
            </Col>)
    );

    render() {
        return (
            <div style={{ overflow:'-Scroll',overflowX:'hidden' }}>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                </Breadcrumb>

                <div style={{ padding: 0, background: '#fff' }}>

                </div>
            </div>
        );
    }
}

export default Dashboard;

/**<Row gutter={24}>
 {this.numberCards}
 </Row>*/