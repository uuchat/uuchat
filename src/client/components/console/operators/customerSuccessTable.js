import React, { Component } from 'react';
import { Table } from 'antd';
import ActionDropDown from '../common/actionDropDown';
import { emptyTableLocale } from '../common/constants';
import { sortFilterByProps, formatDate } from '../common/utils';

export default class CustomerSuccessTable extends Component {

    render() {
        let { superUser, dataSource, pagination, sorter, onChange, handleMenuClick } = this.props;

        const avatarRender = (avatar) =>
            (<img className="user-avatar"
                  src={ (avatar !=='null' && avatar) ? '/' + avatar : require('../../../static/images/contact.png')}
                  alt="avatar"
                  title="avatar"/>);

        const renderAction = (value) => {
            if (value.key === superUser) return;

            return (
                <ActionDropDown
                    onMenuClick={e => handleMenuClick(e, value)}
                    menuOptions={[{ key: '2', name: 'Delete' }]}
                    />
            );
        };

        const columns = [
            {
                title: 'avatar', dataIndex: 'avatar', key: 'avatar', render: avatarRender
            },
            {
                title: 'email', dataIndex: 'email', key: 'email',
                sorter: (a, b) => sortFilterByProps(a, b, 'email'),
                sortOrder: sorter.columnKey === 'email' && sorter.order
            },
            {
                title: 'name', dataIndex: 'name', key: 'name',
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
                title: 'Action', dataIndex: '', key: 'csid', render: renderAction
            }
        ];

        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
            },
            getCheckboxProps: (record) => ({
                disabled: record.key === superUser
            })
        };

        return (
            <Table dataSource={ dataSource }
                   pagination={ pagination }
                   locale={ emptyTableLocale }
                   columns={ columns }
                   rowSelection={ rowSelection }
                   onChange={ onChange }/>
        );
    }

}