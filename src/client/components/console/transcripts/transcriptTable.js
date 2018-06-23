import React, { Component } from 'react';
import { Table } from 'antd';

export default class TranscriptTable extends Component {

    render() {
        let { locale, dataSource, pagination, loading, onChange, sorter, renderCustomer, formatDate } = this.props;

        const columns = [
            {
                title: 'customer success name', dataIndex: 'csName', key: 'csName'
            },
            {
                title: 'customer success email', dataIndex: 'csEmail', key: 'csEmail'
            },
            {
                title: 'customer', dataIndex: 'cid', key: 'cid', render: renderCustomer,
                sorter: true, sortOrder: sorter.columnKey === 'customer' && sorter.order
            },
            {
                title: 'first connect time',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (value) => formatDate(value),
                sorter: true,
                sortOrder: sorter.columnKey === 'createdAt' && sorter.order
            },
            {
                title: 'latest connect time',
                dataIndex: 'updatedAt',
                key: 'updatedAt',
                render: (value) => formatDate(value),
                sorter: true,
                sortOrder: sorter.columnKey === 'updatedAt' && sorter.order
            }
        ];

        return (
            <Table locale={ locale }
                   dataSource={ dataSource }
                   columns={ columns }
                   pagination={ pagination }
                   loading={ loading }
                   onChange={ onChange }/>
        );
    }
}