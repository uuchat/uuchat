import React, { Component } from 'react';
import { Table } from 'antd';
import ActionDropDown from '../common/actionDropDown';
import { emptyTableLocale } from '../common/constants';
import { sortFilterByProps, formatDate } from '../common/utils';

export default class ShortcutTable extends Component {

    renderAction = (value) => {
        let { handleMenuClick } = this.props;

        return (
            <ActionDropDown
                onMenuClick={e => handleMenuClick(e, value)}
                menuOptions={[
                        { key: '1', name: 'Edit' },
                        { key: '2', name: 'Delete' }
                        ]}
                />
        );
    };

    render() {
        let { dataSource, pagination, onChange, sorter } = this.props;

        const columns = [
            {
                title: 'shortcut', dataIndex: 'shortcut', key: 'shortcut',
                sorter: (a, b) => sortFilterByProps(a, b, 'shortcut'),
                sortOrder: sorter.columnKey === 'shortcut' && sorter.order
            },
            {
                title: 'Expanded Message', dataIndex: 'msg', key: 'msg',
                sorter: (a, b) => sortFilterByProps(a, b, 'msg'),
                sortOrder: sorter.columnKey === 'msg' && sorter.order
            },
            {
                title: 'createTime', dataIndex: 'createdAt', key: 'createdAt',
                sorter: (a, b) => sortFilterByProps(a, b, 'createdAt'),
                sortOrder: sorter.columnKey === 'createdAt' && sorter.order,
                render: (value)=>formatDate(value)
            },
            {
                title: 'Action', dataIndex: '', key: 'id', render: this.renderAction
            }
        ];

        return (
            <Table locale={ emptyTableLocale }
                   columns={ columns }
                   dataSource={ dataSource }
                   pagination={ pagination }
                   sorter={ sorter }
                   onChange={ onChange }/>
        );
    }
}