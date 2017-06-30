/**
 *
 * Created by jianzhiqiang on 2017/6/14.
 */

import React, { Component } from 'react';
import { Breadcrumb, Table, message, Select, Modal, Spin } from 'antd';

import ChatList from './chatList';
import { getCustomerName, formatDate } from './utils';

const Option = Select.Option;

//pageNum,pageSize,pageTotal,pageReload
const initPagination = [0, 10, 0, true];

class Transcripts extends Component {
    lock = false;

    state = {
        csSource: [],
        dataSource: [],
        pagination: Object.assign([], initPagination),
        spinning: false,
        filter: [],
    };

    renderCustomer = (text, record) => {
        let customer = getCustomerName(text);
        //  input params using closure(another way:bind)
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

        let { dataSource, filter, pagination } = this.state;

        if (!pagination[3]) return;

        let queryUrl = '/chathistories?1=1';

        if (filter.csid) queryUrl += '&csid=' + filter.csid;
        queryUrl += '&pageNum=' + pagination[0];

        _component.setState({spinning: true});

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

                    data.msg.rows.forEach((item) => {
                        item.key = item.uuid;
                        let csFilters = this.state.csSource.filter((element) => element.csid === item.csid);
                        item.csName = csFilters.length ? csFilters[0].name : 'invalid_user';
                        item.csEmail = csFilters.length ? csFilters[0].email : 'invalid_email';
                    });

                    dataSource = dataSource.concat(data.msg.rows);

                    pagination[0]++;
                    pagination[2] += data.msg.rows.length;

                    //console.log('page:', pagination[2], data.msg.count, dataSource.length);

                    if (pagination[2] === data.msg.count) pagination[3] = false;

                    _component.setState({
                        dataSource,
                        pagination,
                    });
                } else {
                    message.error(data.msg, 4);
                }
            }).catch((e) => message.error(e.message, 4))
            .then(() => this.setState({spinning: false}))
    }


    handleScroll = (e) => {
        const { pagination,spinning } = this.state;
        let deta = document.body.clientHeight + document.body.scrollTop + 80 - document.body.scrollHeight;
        //console.log('lock', this.lock, 'spinning', spinning, 'loading', pagination[3], 'deta', deta);

        if (!this.lock && !spinning && pagination[3] && (deta >= 0)) {
            //console.log(new Date(), 'update data source>>>>>');
            this.lock = true;
            this.detachScrollEvent();
            this.getDataSource();
        }
    }


    attachScrollEvent = () => {
        window.addEventListener('scroll', this.handleScroll, false);
        window.addEventListener('resize', this.handleScroll, false);

        this.handleScroll();
    }

    detachScrollEvent = (next) => {
        this.lock = false;
        window.removeEventListener('scroll', this.handleScroll, false);
        window.removeEventListener('resize', this.handleScroll, false);
    }

    componentDidMount() {
        this.attachScrollEvent();
    }

    componentWillUnmount() {
        this.detachScrollEvent();
    }

    componentWillUpdate(nextProps, nextState) {
        //console.log('componentWillUpdate');
        //console.log(this.state.dataSource.length, nextState.dataSource.length);
    }

    componentDidUpdate(prevProps, prevState) {
        //console.log('componentDidUpdate');
        //console.log(this.state.dataSource.length, prevState.dataSource.length);
        setTimeout(() => {
            this.attachScrollEvent();
        }, 0);
    }


    handleChange = (pagination, filters, sorter) => {
        //console.log({pagination, sorter});

        //this.setState({pagination, sorter}, this.getDataSource);
    }

    handleSelectChange = (key, value) => {
        //console.log(key, value);

        let filter = {};
        filter[key] = value;

        this.setState({
            filter,
            pagination: Object.assign([], initPagination),
            dataSource: [],
        }, this.getDataSource);
    }

    render() {
        let { csSource, dataSource, spinning } = this.state;

        const columns = [
            {
                title: 'customer', dataIndex: 'cid', key: 'cid', render: this.renderCustomer,
            },
            {title: 'name', dataIndex: 'csName', key: 'csName',},
            {title: 'email', dataIndex: 'csEmail', key: 'csEmail',},
            {
                title: 'latest connect time', dataIndex: 'updatedAt', key: 'updatedAt', render: formatDate,
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
                                allowClear={ true }
                                optionFilterProp="children"
                                onChange={ this.handleSelectChange.bind(null, 'csid') }
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                {csSource.map(d => <Option key={d.csid}>{d.email}</Option>)}
                            </Select>
                        </div>
                        <div className="table-operations">
                        </div>
                    </div>

                    <Table locale={{ emptyText: 'List is empty' }}
                           dataSource={ dataSource }
                           columns={ columns }
                           pagination={ false }
                           footer={ currentData =>
                                    <div id="tableFooter" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div> </div>
                                        <div> <Spin spinning={spinning} /></div>
                                        <div>total: {currentData.length} items</div>
                                    </div>
                                }
                        />
                </div>
            </div>
        );
    }
}

export default Transcripts;