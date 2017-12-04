import React, { Component } from 'react';
import { Table, Alert } from 'antd';
import { emptyTableLocale } from '../common/constants';
import { sortFilterByProps, formatDate } from '../common/utils';

export default class FeedbackTable extends Component {

    renderFeedbackDetail = (text, record) => {
        var feedback = JSON.parse(text);

        const children = [];

        feedback.forEach(function (item, index) {
            if (record.class === 'contact_us') {
                children.push(
                    <Alert message={item.suggest} type="success"/>
                );
            } else {
                children.push(
                    <Alert message={item.desc} description={item.content} type="success"/>
                );
            }
        });

        return (
            <div>
                {children}
            </div>
        );
    };

    render() {
        const { dataSource, pagination, onChange, sorter } = this.props;

        const columns = [
            {
                title: 'type',
                dataIndex: 'class',
                key: 'class',
                sorter: (a, b) => sortFilterByProps(a, b, 'class'),
                sortOrder: sorter.columnKey === 'class' && sorter.order
            },
            {
                title: 'email',
                dataIndex: 'email',
                key: 'email',
                sorter: (a, b) => sortFilterByProps(a, b, 'email'),
                sortOrder: sorter.columnKey === 'email' && sorter.order
            },
            {
                title: 'name',
                dataIndex: 'name',
                key: 'name',
                sorter: (a, b) => sortFilterByProps(a, b, 'name'),
                sortOrder: sorter.columnKey === 'name' && sorter.order
            },
            {
                title: 'createTime', dataIndex: 'createdAt', key: 'createdAt',
                sorter: (a, b) => sortFilterByProps(a, b, 'createdAt'),
                sortOrder: sorter.columnKey === 'createdAt' && sorter.order,
                render: (value) => formatDate(value)
            },
            {
                title: 'feedback',
                dataIndex: 'feedback',
                key: 'feedback',
                render: this.renderFeedbackDetail
            }
        ];
        return (
            <Table dataSource={ dataSource }
                   onChange={ onChange }
                   locale={ emptyTableLocale }
                   pagination={ pagination }
                   columns={columns}/>
        );
    }
}