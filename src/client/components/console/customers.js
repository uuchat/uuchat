import React, { Component } from 'react';
import { Breadcrumb, message } from 'antd';
import CustomerTable from './customerTable';
import { emptyTableLocale } from './constants';

export default class Operators extends Component {

    state = {
        dataSource: [],
        searchText: '',
        sorter: {},
        pagination: {}
    };

    getDataSource = () => {
        let { pagination,sorter } = this.state;

        const _component = this;
        let queryUrl = '/customerstorages?1=1';

        if (pagination.current) queryUrl += "&pageNum=" + (pagination.current - 1);
        if (sorter.field) queryUrl += "&sortField=" + sorter.field + "&sortOrder=" + sorter.order;

        fetch(queryUrl)
            .then((res)=>res.json())
            .then(function (data) {
                if (data.code !== 200) return message.error(data.msg, 4);

                data.msg.rows.forEach(function (item) {
                    item.key = item.uuid;
                });

                pagination.total = data.msg.count;

                _component.setState({
                    pagination,
                    dataSource: data.msg.rows
                });

            }).catch(function (e) {
                message.error(e, 4);
            });
    };

    handleChange = (pagination, filters, sorter) => {
        this.setState({pagination, sorter}, this.getDataSource);
    };

    componentDidMount() {
        this.getDataSource();
    }

    render() {
        let { dataSource, sorter, pagination } = this.state;

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Customers</Breadcrumb.Item>
                </Breadcrumb>

                <div className="content-body">
                    <CustomerTable locale={ emptyTableLocale }
                                   dataSource={ dataSource }
                                   sorter={ sorter }
                                   pagination={ pagination }
                                   onChange={ this.handleChange }/>
                </div>
            </div>
        );
    }
}