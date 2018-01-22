import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Breadcrumb, Table, Button, Radio } from 'antd';
import Tips from '../../common/tips';
import { getCustomerName, formatDate, fetchAsync } from '../common/utils';
import { rateList,emptyTableLocale } from '../common/constants';

const RadioGroup = Radio.Group;

export default class Rates extends Component {

    state = {
        csSource: [],
        dataSource: [],
        pagination: {},
        month: moment().format('YYYY-MM'),
        rateValue: null
    };

    getDataSource = async ()=> {
        try {
            let { pagination } = this.state;

            let queryUrl = '/console/rates/cs/';
            queryUrl += this.props.match.params.csid + '/month/' + this.state.month;

            queryUrl += "?1=1";

            if (this.state.rateValue) queryUrl += "&rate=" + this.state.rateValue;
            if (pagination.current) queryUrl += "&pageNum=" + (pagination.current - 1);

            let cs = await fetchAsync('/customersuccesses');
            if (cs.code !== 200) return Tips.error(cs.message, 4);

            let data = await fetchAsync(queryUrl);
            if (data.code !== 200) return Tips.error(data.msg, 4);

            pagination.total = data.msg.count;

            data.msg.rows.forEach((item) => {
                item.key = item.uuid;
                let csFilters = cs.msg.filter((element) => element.csid === item.csid);
                item.csName = csFilters.length ? csFilters[0].name : 'invalid_user';
                item.csEmail = csFilters.length ? csFilters[0].email : 'invalid_email';
            });

            this.setState({
                csSource: cs.msg,
                dataSource: data.msg.rows,
                pagination
            });

        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    componentDidMount() {
        const location = this.props.location;
        let month = location.state ? location.state.month : moment().format('YYYY-MM');
        this.setState({month}, this.getDataSource);
    }

    handleRadioChange = (e) => {
        let rateValue = e.target.value;

        let { pagination } = this.state;
        pagination.current = 1;

        this.setState({rateValue, pagination}, this.getDataSource);
    };

    handleChange = (pagination, filters, sorter) => {
        this.setState({pagination}, this.getDataSource);
    };

    render() {
        let { dataSource, month, pagination } = this.state;

        const columns = [
            {title: 'email', dataIndex: 'csEmail', key: 'csEmail'},
            {title: 'name', dataIndex: 'csName', key: 'csName'},
            {title: 'customer', dataIndex: 'cid', key: 'cid', render: getCustomerName},
            {title: 'rate', dataIndex: 'rate', key: 'rate'},
            {title: 'createAt', dataIndex: 'createdAt', key: 'createdAt', render: (value)=>formatDate(value)}
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
                                <Link to={{pathname: '/rates', state: {month: month} }}>Back</Link>
                            </Button>
                        </div>
                    </div>

                    <Table locale={ emptyTableLocale }
                           dataSource={ dataSource }
                           columns={ columns }
                           pagination={ pagination }
                           onChange={ this.handleChange }/>
                </div>
            </div>
        );
    }
}