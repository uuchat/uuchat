/**
 * Created by jianzhiqiang on 2017/6/7.
 */
import React,{Component} from 'react';
import { Icon, Card } from 'antd';

class NumberCard extends Component {
    render() {

        let { color, icon, title, number } = this.props;

        return(
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

export default NumberCard;
