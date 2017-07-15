import React, { Component } from 'react';
import { Breadcrumb, message, Select, Modal } from 'antd';
import ChatList from './chatList';
import { getCustomerName } from './utils';
import ScrollTable from './scrollTable';

const Option = Select.Option;

class Transcripts extends Component {

    state = {
        csSource: [],
        dataSource: [],
        total: 0,
        filter: [],
        initPage: false
    };

    handleChatList = (e, record) => {
        e.preventDefault();

        if (record.cid) record.cIndex = parseInt(record.cid, 16) % 14;

        Modal.info({
            title: 'U-' + (record.cid.substr(0, 6).toUpperCase()) + ' chats',
            width: '600px',
            content: <ChatList { ...record } />,
            onOk() {
            }
        });
    };

    getCSSource = () => {
        const _component = this;

        return fetch('/customersuccesses')
            .then((res) => res.json())
            .then(function (data) {
                if (200 === data.code) {
                    return _component.setState({
                        csSource: data.msg
                    });
                } else {
                    message.error(data.msg, 4);
                }
            })
    };

    getDataSource = (pageNum) => {
        const _component = this;
        let { csSource, dataSource, filter } = this.state;

        let queryUrl = '/chathistories?1=1';

        if (filter.csid) queryUrl += '&csid=' + filter.csid;
        if (pageNum) queryUrl += '&pageNum=' + pageNum;

        fetch(queryUrl)
            .then((res) => res.json())
            .then((data) => {
                if (200 === data.code) {

                    data.msg.rows.forEach((item) => {
                        item.key = item.uuid;
                        let csFilters = csSource.filter((element) => element.csid === item.csid);
                        item.csName = csFilters.length ? csFilters[0].name : 'invalid_user';
                        item.csEmail = csFilters.length ? csFilters[0].email : 'invalid_email';
                    });


                    _component.setState({
                        dataSource: dataSource.concat(data.msg.rows),
                        total: data.msg.count,
                        initPage: false
                    });
                } else {
                    message.error(data.msg, 4);
                }
            }).catch((e) => message.error(e.message, 4));
    };

    componentDidMount() {
        const _component = this;
        this.getCSSource().then(function () {
            _component.getDataSource();
        });
    }

    handleSelectChange = (key, value) => {
        let filter = {};
        filter[key] = value;

        this.setState({
            filter,
            dataSource: [],
            total: 0,
            initPage: true
        }, this.getDataSource);
    };

    renderCustomer = (text, record) => {
        let customer = getCustomerName(text);
        return <a onClick={ (e) => this.handleChatList(e, record) }>{ customer }</a>;
    };

    render() {
        let { csSource, dataSource, total,initPage } = this.state;

        let scrollTableProps = {
            initPage: initPage,
            data: {
                total: total,
                list: dataSource
            },
            loadNextFunc: this.getDataSource,
            renderCustomer: this.renderCustomer
        };

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

                    <ScrollTable {...scrollTableProps}/>

                </div>
            </div>
        );
    }
}

export default Transcripts;