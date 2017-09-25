import React, { Component } from 'react';
import { Table } from 'antd';
import { getCustomerName, formatDate } from '../common/utils';

export default class RateListTable extends Component {

    render() {
        let { locale, dataSource, pagination, loading, onChange, sorter } = this.props;

        const columns = [
            {title: 'email', dataIndex: 'csEmail', key: 'csEmail'},
            {title: 'name', dataIndex: 'csName', key: 'csName'},
            {
                title: 'customer', dataIndex: 'cid', key: 'cid', render: getCustomerName,
                sorter: true, sortOrder: sorter.columnKey === 'customer' && sorter.order
            },
            {
                title: 'rate', dataIndex: 'rate', key: 'rate',
                sorter: true, sortOrder: sorter.columnKey === 'rate' && sorter.order
            },
            {
                title: 'createdAt', dataIndex: 'createdAt', key: 'createdAt', render: (value) => formatDate(value),
                sorter: true, sortOrder: sorter.columnKey === 'createdAt' && sorter.order
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