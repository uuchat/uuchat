/**
 *
 * Created by jianzhiqiang on 2017/6/14.
 */

import React, { Component } from 'react';
import { Breadcrumb, Table, message, Select, Modal, Button } from 'antd';

import ChatList from './chatList';
import { getCustomerName, formatDate } from './utils';

const Option = Select.Option;

class Transcripts extends Component {
    state = {
        csSource: [],
        dataSource: [],
        pagination: {},
        loading: false,
        filter: [],
        sorter: {},
    };

    renderCustomer = (text, record) => {
        let customer = getCustomerName(text);
        //  input params using closure
        return <a onClick={ (e) => this.handleChatList(e, record) }>{ customer }</a>;
    }

    handleSearchChange = (e) => {
        e.preventDefault();
    }

    handleChatList = (e, record) => {
        e.preventDefault();

        if (record.cid) record.cIndex = parseInt(record.cid, 16) % 14;

        Modal.info({
            title: 'U-' + (record.cid.substr(0, 6).toUpperCase()) + ' chats',
            width: '600px',
            okText: 'Ok',
            content: <ChatList { ...record } />,
            onOk() {
            },
        });
    }

    getDataSource = () => {
        const _component = this;

        let { filter,pagination, sorter } = this.state;

        _component.setState({loading: true});

        let queryUrl = '/chathistories?1=1';

        if (filter.csid) queryUrl += '&csid=' + filter.csid;
        if (pagination.current) queryUrl += "&pageNum=" + (pagination.current - 1);
        if (sorter.field) queryUrl += "&sortField=" + sorter.field + "&sortOrder=" + sorter.order;

        //console.log(queryUrl);

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
            }).then(() => fetch(queryUrl))
            .then((res) => res.json())
            .then((data) => {
                if (200 === data.code) {
                    pagination.total = data.msg.count;

                    data.msg.rows.forEach((item) => {
                        item.key = item.uuid;
                        let csFilters = this.state.csSource.filter((element) => element.csid === item.csid);
                        item.csName = csFilters.length ? csFilters[0].name : 'invalid_user';
                        item.csEmail = csFilters.length ? csFilters[0].email : 'invalid_email';
                    });

                    _component.setState({
                        pagination: pagination,
                        dataSource: data.msg.rows,
                    });
                } else {
                    message.error(data.msg, 4);
                }
            }).catch((e) => message.error(e.message, 4))
            .then(function () {
                _component.setState({loading: false});
            });
    }

    componentDidMount = ()=> {
        this.getDataSource();
    }

    handleChange = (pagination, filters, sorter) => {
        console.log({pagination, sorter});

        this.setState({pagination, sorter}, this.getDataSource);
    }

    handleSelectChange = (key, value) => {
        //console.log(key, value);

        let filter = {};
        filter[key] = value;

        this.setState({filter}, this.getDataSource);
    }

    clearSorters = () => this.setState({sorter: {}}, this.getDataSource)

    render() {
        let { csSource, dataSource,pagination,loading,sorter } = this.state;

        const columns = [
            {
                title: 'customer', dataIndex: 'cid', key: 'cid', render: this.renderCustomer,
                sorter: true, sortOrder: sorter.columnKey === 'cid' && sorter.order,
            },
            {title: 'name', dataIndex: 'csName', key: 'csName',},
            {title: 'email', dataIndex: 'csEmail', key: 'csEmail',},
            {
                title: 'latest connect time', dataIndex: 'updatedAt', key: 'updatedAt', render: formatDate,
                sorter: true, sortOrder: sorter.columnKey === 'updatedAt' && sorter.order,
            },
        ];

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Transcripts</Breadcrumb.Item>
                </Breadcrumb>

                <div style={{ padding: 24, background: '#fff' }}>
                    <div className="table-deals">
                        <div className="table-search">
                            <Select
                                showSearch
                                style={{ width: 200 }}
                                size="large"
                                placeholder="Select Email"
                                optionFilterProp="children"
                                onChange={ this.handleSelectChange.bind(null, 'csid') }
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                {csSource.map(d => <Option key={d.csid}>{d.email}</Option>)}
                            </Select>
                        </div>
                        <div className="table-operations">
                            <Button onClick={this.clearSorters}>Clear sorters</Button>
                        </div>
                    </div>

                    <Table locale={{ emptyText: 'List is empty' }}
                           dataSource={ dataSource }
                           columns={ columns }
                           pagination={ pagination }
                           loading={ loading }
                           onChange={ this.handleChange }
                        />
                </div>
            </div>
        );
    }
}

export default Transcripts;