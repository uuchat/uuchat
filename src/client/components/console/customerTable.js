import React, { Component } from 'react';
import { Table, Modal } from 'antd';
import ScreenList from './screenList';
import { sortFilterByProps, getCustomerName, fromNow } from './utils';

export default class CustomerTable extends Component {

    handleScreenList = (e, record) => {
        e.preventDefault();

        Modal.info({
            title: getCustomerName(record.cid) + ' screen list',
            width: '600px',
            content: <ScreenList uuid={ record.uuid }/>,
            maskClosable: true,
            onOk() {
            }
        });
    };

    render() {
        let { locale, rowSelection, dataSource, pagination, loading, onChange, sorter } = this.props;

        let screenListRender = (uuid, record) => {
            return (<a onClick={ (e) => this.handleScreenList(e, record) }>
                <img className="user-avatar"
                     src={ require('../../static/images/chat_selected.png') }
                     alt="chat list"
                     title="chat list"/>
            </a>);
        };

        const columns = [
            {
                title: 'customer', dataIndex: 'cid', key: 'cid', render: getCustomerName,
                sorter: true, sortOrder: sorter.columnKey === 'cid' && sorter.order
            },
            {
                title: 'screen list', dataIndex: 'uuid', key: 'uuid',
                render: screenListRender
            },
            {
                title: 'first screen', dataIndex: 'firstTime', key: 'firstTime',
                sorter: (a, b) => sortFilterByProps(a, b, 'firstTime'),
                sortOrder: sorter.columnKey === 'firstTime' && sorter.order,
                render: fromNow
            },
            {
                title: 'last screen', dataIndex: 'lastTime', key: 'lastTime',
                sorter: (a, b) => sortFilterByProps(a, b, 'lastTime'),
                sortOrder: sorter.columnKey === 'lastTime' && sorter.order,
                render: fromNow
            },
            {
                title: 'country', dataIndex: 'country', key: 'country',
                sorter: true,
                sortOrder: sorter.columnKey === 'country' && sorter.order
            }
        ];

        return (
            <Table locale={ locale }
                   rowSelection={ rowSelection }
                   dataSource={ dataSource }
                   columns={ columns }
                   pagination={ pagination }
                   loading={ loading }
                   onChange={ onChange }/>
        );
    }
}