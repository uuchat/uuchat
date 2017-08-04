import React, { PureComponent } from 'react';
import { Icon, Card } from 'antd';

export default class NumberCard extends PureComponent {

    render() {

        let { color, icon, title, number } = this.props;

        return (
        <Card className="numberCard">
            <Icon className="iconWarp" style={{ color }} type={ icon } />
            <div className="content">
                <p className="title">{title || 'No Title'}</p>
                <p className="number"> { number} </p>
            </div>
        </Card>
        );
    }
}