/**
 *
 * Created by jianzhiqiang on 2017/6/14.
 */

import React, { Component } from 'react';
import { Breadcrumb, Table, message, Input, Modal } from 'antd';

import ChatList from './chatList';

const Search = Input.Search;

class Transcripts extends Component {
    state = {
        csSource: [],
        dataSource: [],
    };

    renderCustomer = (value) => {
        let customer = 'U-' + value.slice(0, 6).toUpperCase();
        //  input params using closure
        return <a onClick={ (e) => this.handleChatList(e, value) }>{ customer }</a>;
    }

    renderTime = (date) => date.slice(0, 10) + ' ' + date.slice(11, 16);

    handleSearchChange = (e) => {
        e.preventDefault();
    }

    handleChatList = (e, cid) => {
        e.preventDefault();

        let { dataSource } = this.state;

        let dataFilters = dataSource.filter((item) => item.cid === cid);
        let chatListProps = dataFilters.length ? dataFilters[0] : {};

        if(chatListProps.cid) chatListProps.cIndex = parseInt(chatListProps.cid, 16) % 14;

        Modal.info({
            title: 'U-' + (cid.substr(0, 6).toUpperCase()) + ' chats',
            width: '600px',
            okText: 'Ok',
            content: <ChatList { ...chatListProps } />,
            onOk() {
            },
        });
    }

    getDataSource = () => {
        const _component = this;

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
            }).then(() => fetch('/chathistories'))
            .then((res) => res.json())
            .then((data) => {
                if (200 === data.code) {

                    data.msg.forEach((item) => {
                        item.key = item.uuid;
                        let csFilters = this.state.csSource.filter((element) => element.csid === item.csid);
                        item.csName = csFilters.length ? csFilters[0].name : 'invalid_user';
                        item.csEmail = csFilters.length ? csFilters[0].email : 'invalid_email';
                    });

                    _component.setState({
                        dataSource: data.msg
                    });
                } else {
                    message.error(data.msg, 4);
                }
            }).catch((e) => message.error(e.message, 4))
        ;
    }

    componentDidMount = ()=> {
        this.getDataSource();
    }

    render() {
        let { dataSource } = this.state;

        const columns = [
            {title: 'customer', dataIndex: 'cid', key: 'cid', render: this.renderCustomer},
            {title: 'customer success', dataIndex: 'csName', key: 'csName',},
            {title: 'email', dataIndex: 'csEmail', key: 'csEmail',},
            {title: 'latest connect time', dataIndex: 'updatedAt', key: 'updatedAt', render: this.renderTime},
        ];

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Transcripts</Breadcrumb.Item>
                </Breadcrumb>

                <div style={{ padding: 24, background: '#fff' }}>
                    <div className="table-deals">
                        <div className="table-search">
                            <Search placeholder="search email" style={{ width: 200 }}
                                    onChange={ this.handleSearchChange }/>
                        </div>
                        <div className="table-operations">
                        </div>
                    </div>

                    <Table locale={{ emptyText: 'List is empty' }} dataSource={ dataSource } columns={ columns }/>
                </div>
            </div>
        );
    }
}

export default Transcripts;