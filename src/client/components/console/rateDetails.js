import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Breadcrumb, Table, Button, message, Radio } from 'antd';
import { getCustomerName, formatDate } from './utils';
import { rateList,emptyTableLocale } from './constants';

const RadioGroup = Radio.Group;

export default class Rates extends Component {

    state = {
        csSource: [],
        dataSource: [],
        month: moment().format('YYYY-MM'),
        rateValue: null
    };

    getDataSource = ()=> {
        const _component = this;

        let queryUrl = '/console/rates/cs/';
        queryUrl += this.props.match.params.csid + '/month/' + this.state.month;

        queryUrl += "?1=1";

        if (this.state.rateValue) queryUrl += "&rate=" + this.state.rateValue;

        fetch('/customersuccesses')
            .then((res) => res.json())
            .then(function (data) {
                if (200 === data.code) {
                    return _component.setState({
                        csSource: data.msg
                    });
                } else {
                    message.error(data.msg, 4);
                }
            }).then(() => fetch(queryUrl))
            .then((res) => res.json())
            .then((data) => {
                if (200 === data.code) {

                    data.msg.rows.forEach((item) => {
                        item.key = item.uuid;
                        let csFilters = this.state.csSource.filter((element) => element.csid === item.csid);
                        item.csName = csFilters.length ? csFilters[0].name : 'invalid_user';
                        item.csEmail = csFilters.length ? csFilters[0].email : 'invalid_email';
                    });

                    _component.setState({
                        dataSource: data.msg.rows
                    });
                } else {
                    message.error(data.msg, 4);
                }
            }).catch((e) => message.error(e.message, 4));
    };

    componentDidMount () {
        const location = this.props.location;
        let month = location.state ? location.state.month : moment().format('YYYY-MM');
        this.setState({month}, this.getDataSource);
    };

    handleRadioChange = (e) => {
        let rateValue = e.target.value;
        this.setState({rateValue}, this.getDataSource);
    };

    render() {
        let { dataSource, month } = this.state;

        const columns = [
            {title: 'email', dataIndex: 'csEmail', key: 'csEmail'},
            {title: 'name', dataIndex: 'csName', key: 'csName'},
            {title: 'customer', dataIndex: 'cid', key: 'cid', render: getCustomerName},
            {title: 'rate', dataIndex: 'rate', key: 'rate'},
            {title: 'createAt', dataIndex: 'createdAt', key: 'createdAt', render: formatDate}
        ];

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Rates</Breadcrumb.Item>
                </Breadcrumb>

                <div className="content-body">
                    <div className="table-deals">
                        <div className="table-search">
                            <RadioGroup onChange={this.handleRadioChange} value={this.state.rateValue}>
                                { rateList.map((rate) => <Radio key={rate} value={rate}>{rate}</Radio>)}
                            </RadioGroup>
                        </div>
                        <div className="table-operations">

                            <Button>
                                <Link to={{pathname: '/rates', state:{month: month} }}>Back</Link>
                            </Button>
                        </div>
                    </div>

                    <Table locale={ emptyTableLocale } dataSource={ dataSource } columns={ columns }/>
                </div>
            </div>
        );
    }
}