/**
 * Created by jianzhiqiang on 2017/6/19.
 */
import React,{Component} from 'react';
import { Breadcrumb, Table, Button, message } from 'antd';
import { getCustomerName, formatDate } from './utils';

class Rates extends Component {
    state = {
        csSource: [],
        dataSource: [],
    };

    refreshTable = ()=> {
        const _component = this;

        fetch('/customersuccesses')
            .then((res) => res.json())
            .then(function (data) {
                if (200 === data.code) {
                    return _component.setState({
                        csSource: data.msg
                    });
                } else {
                    //message.error(data.msg, 4);
                    throw new Error(data.msg);
                }
            }).then(() => fetch('/rates/customersuccess/' + this.props.match.params.csid))
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
            }).catch((e) => message.error(e.message, 4))
    }

    componentDidMount = () => {
        this.refreshTable();
    }

    handleChange = (pagination, filters, sorter) => {
    }

    handleMonthPickerChange = () => {

    }

    render() {
        let { dataSource } = this.state;

        const columns = [
            {title: 'email', dataIndex: 'csEmail', key: 'csEmail',},
            {title: 'name', dataIndex: 'csName', key: 'csName',},
            {title: 'customer', dataIndex: 'cid', key: 'cid', render: getCustomerName},
            {title: 'rate', dataIndex: 'rate', key: 'rate'},
            {title: 'createAt', dataIndex: 'createdAt', key: 'createdAt', render: formatDate},
        ];

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Rates</Breadcrumb.Item>
                </Breadcrumb>

                <div style={{ padding: 24, background: '#fff' }}>
                    <div className="table-deals">
                        <div className="table-search">

                        </div>
                        <div className="table-operations">

                            <Button onClick={ () => window.location.href = "#/rates" }>Back</Button>
                        </div>
                    </div>

                    <Table locale={{ emptyText: 'List is empty' }} dataSource={ dataSource } columns={ columns }
                           onChange={ this.handleChange }/>
                </div>
            </div>
        );
    }
}

export default Rates;

