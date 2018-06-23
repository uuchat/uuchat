import React, { Component } from 'react';
import { Breadcrumb, Select, Modal, Button, Row, Col } from 'antd';
import Tips from '../../common/tips';
import ChatList from './chatList';
import { getCustomerName, fetchAsync, formatDate } from '../common/utils';
import { saveCSV } from '../common/fileExport';
import TranscriptTable from './transcriptTable';
import { emptyTableLocale } from '../common/constants';

const Option = Select.Option;

export default class Transcripts extends Component {

    state = {
        csSource: [],
        dataSource: [],
        pagination: {},
        filter: [],
        sorter: {}
    };

    getCSSource = async () => {
        try {
            let data = await fetchAsync('/customersuccesses');
            if (data.code !== 200) return Tips.error(data.msg, 4);

            this.setState({csSource: data.msg});
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    getDataSource = async () => {
        try {
            this.setState({loading: true});

            let { csSource, filter,pagination, sorter } = this.state;

            let queryUrl = '/chathistories?1=1';
            if (filter.csid) queryUrl += '&csid=' + filter.csid;

            if (pagination.current) queryUrl += "&pageNum=" + (pagination.current - 1);
            if (sorter.field) queryUrl += "&sortField=" + sorter.field + "&sortOrder=" + sorter.order;

            let data = await fetchAsync(queryUrl);
            if (data.code !== 200) return Tips.error(data.msg, 4);

            data.msg.rows.forEach((item) => {
                item.key = item.uuid;
                let csFilters = csSource.filter((element) => element.csid === item.csid);
                item.csName = csFilters.length ? csFilters[0].name : 'invalid_user';
                item.csEmail = csFilters.length ? csFilters[0].email : 'invalid_email';
            });

            pagination.total = data.msg.count;

            this.setState({
                dataSource: data.msg.rows,
                pagination: pagination
            });
        } catch (e) {
            Tips.error(e.message, 4);
        } finally {
            this.setState({loading: false});
        }
    };

    componentDidMount() {
        this.getCSSource().then(() => this.getDataSource());
    }

    handleChange = (pagination, filters, sorter) => {
        this.setState({pagination, sorter}, this.getDataSource);
    };

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

    handleExport = async () => {
        try {
            let { csSource, filter, sorter } = this.state;

            let queryUrl = '/chathistories?1=1';
            if (filter.csid) queryUrl += '&csid=' + filter.csid;

            if (sorter.field) queryUrl += "&sortField=" + sorter.field + "&sortOrder=" + sorter.order;
            queryUrl += "&pageSize=10000";

            let data = await fetchAsync(queryUrl);
            if (data.code !== 200) return Tips.error(data.msg, 4);

            data.msg.rows.forEach((item) => {
                let csFilters = csSource.filter((element) => element.csid === item.csid);
                item.csName = csFilters.length ? csFilters[0].name : 'invalid_user';
                item.csEmail = csFilters.length ? csFilters[0].email : 'invalid_email';
            });

            const options = {
                headers: ['csid', 'csName', 'csEmail', 'cid', 'createdAt', 'updatedAt'],
                filename: 'uuchat_transcripts_' + formatDate(new Date(), 'yyyyMMdd_hhmmss')
            };

            saveCSV(data.msg.rows, options);
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    renderCustomer = (text, record) => {
        let customer = getCustomerName(text);
        return <a onClick={ (e) => this.handleChatList(e, record) }>{ customer }</a>;
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

    render() {
        let { pagination, loading, csSource, dataSource, sorter } = this.state;

        let transcriptTableProps = {
            locale: emptyTableLocale,
            pagination: pagination, loading: loading,

            sorter: sorter,
            dataSource: dataSource,
            renderCustomer: this.renderCustomer,
            formatDate: formatDate,
            onChange: this.handleChange
        };

        const ColProps = {
            xs: 24,
            sm: 12,
            style: {
                marginBottom: 16
            }
        };

        const TwoColProps = {
            ...ColProps,
            xl: 96
        };

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Data</Breadcrumb.Item>
                    <Breadcrumb.Item>Transcripts</Breadcrumb.Item>
                </Breadcrumb>

                <div className="content-body">
                    <Row gutter={24}>
                        <Col {...TwoColProps} xl={{ span: 10 }} md={{ span: 24 }} sm={{ span: 24 }}>
                            <Select
                                showSearch
                                style={{ width: 200 }}
                                size="normal"
                                placeholder="Select Email"
                                allowClear={ true }
                                optionFilterProp="children"
                                onChange={ this.handleSelectChange.bind(null, 'csid') }
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                {csSource.map(d => <Option key={d.csid}>{d.email}</Option>)}
                            </Select>
                        </Col>
                        <Col {...ColProps} xl={{ span: 4 }} md={{ span: 8 }}>
                        </Col>
                        <Col {...TwoColProps} xl={{ span: 10 }} md={{ span: 24 }} sm={{ span: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <div>
                                    <Button style={{ marginLeft: 8 }} onClick={ this.handleExport }>Export</Button>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <TranscriptTable {...transcriptTableProps}/>

                </div>
            </div>
        );
    }
}