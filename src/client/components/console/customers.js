import React, { Component } from 'react';
import { Table, Breadcrumb, message } from 'antd';
import { emptyTableLocale } from './constants';
import { sortFilterByProps, formatDate } from './utils';

export default class Operators extends Component {

    state = {
        dataSource: [],
        searchText: '',
        sorter: {},
        pagination: {}
    };

    rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
        },
        getCheckboxProps: (record) => ({
            disabled: record.key === this.state.superUser
        })
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

        const columns = [
            {
                title: 'customer', dataIndex: 'cid', key: 'cid'
            },
            {
                title: 'first screen', dataIndex: 'firstTime', key: 'firfirstTimestScreen',
                sorter: (a, b) => sortFilterByProps(a, b, 'firstTime'),
                sortOrder: sorter.columnKey === 'firstTime' && sorter.order,
                render: (value) => formatDate(value)
            },
            {
                title: 'last screen', dataIndex: 'lastTime', key: 'lastTime',
                sorter: (a, b) => sortFilterByProps(a, b, 'lastTime'),
                sortOrder: sorter.columnKey === 'lastTime' && sorter.order,
                render: (value) => formatDate(value)
            },
            {
                title: 'country', dataIndex: 'country', key: 'country',
                sorter: (a, b) => sortFilterByProps(a, b, 'country'),
                sortOrder: sorter.columnKey === 'country' && sorter.order
            }
        ];

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Customers</Breadcrumb.Item>
                </Breadcrumb>

                <div className="content-body">
                    <Table rowSelection={this.rowSelection}
                           dataSource={dataSource}
                           columns={columns}
                           locale={emptyTableLocale}
                           pagination={ pagination }
                           onChange={ this.handleChange }/>
                </div>
            </div>
        );
    }
}