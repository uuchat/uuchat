import React, { Component } from 'react';
import { Breadcrumb, Select, Modal } from 'antd';
import Tips from '../../common/tips';
import ChatList from './chatList';
import { getCustomerName, fetchAsync } from '../common/utils';
import ScrollTable from './scrollTable';

const Option = Select.Option;

export default class Transcripts extends Component {

    state = {
        csSource: [],
        dataSource: [],
        total: 0,
        filter: [],
        initPage: false
    };

    handleChatList = (e, record) => {
        e.preventDefault();

        Modal.info({
            title: 'U-' + (record.cid.substr(0, 6).toUpperCase()) + ' chats',
            width: '600px',
            content: <ChatList { ...record } />,
            maskClosable: true,
            closable: true,
            onOk() {
            }
        });
    };

    getCSSource = async () => {
        try {
            let data = await fetchAsync('/customersuccesses');
            if (data.code !== 200) return Tips.error(data.msg, 4);

            this.setState({
                csSource: data.msg
            });
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    getDataSource = async (pageNum) => {
        try {
            let { csSource, dataSource, filter } = this.state;

            let queryUrl = '/chathistories?1=1';
            if (filter.csid) queryUrl += '&csid=' + filter.csid;
            if (pageNum) queryUrl += '&pageNum=' + pageNum;

            let data = await fetchAsync(queryUrl);
            if (data.code !== 200) return Tips.error(data.msg, 4);

            data.msg.rows.forEach((item) => {
                item.key = item.uuid;
                let csFilters = csSource.filter((element) => element.csid === item.csid);
                item.csName = csFilters.length ? csFilters[0].name : 'invalid_user';
                item.csEmail = csFilters.length ? csFilters[0].email : 'invalid_email';
            });


            this.setState({
                dataSource: dataSource.concat(data.msg.rows),
                total: data.msg.count,
                initPage: false
            });
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    componentDidMount() {
        this.getCSSource().then(() => this.getDataSource());
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

                <div className="content-body">
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