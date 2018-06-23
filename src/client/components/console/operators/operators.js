import React, { Component } from 'react';
import { Breadcrumb, Button, Modal, Input, List, Avatar } from 'antd';
import CustomerSuccessForm from './customerSuccessForm';
import CustomerSuccessTable from './customerSuccessTable';
import { fetchAsync } from '../common/utils';
import { fromNow } from '../common/momentUtils';
import Tips from '../../common/tips';

const Search = Input.Search;
const Confirm = Modal.confirm;

export default class Operators extends Component {

    state = {
        dataSource: [],
        storeDataSource: [],
        inviteDataSource: [],
        visible: false,
        searchText: '',
        sorter: {},
        pagination: {}
    };

    showModal = () => this.setState({visible: true});

    handleOk = (form, e) => {
        e.preventDefault();

        form.validateFields(async (err, values) => {
            if (err) return;

            try {
                let body = 'email=' + values.email;

                let data = await fetchAsync('/invite', {
                    credentials: 'include',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: body
                });

                if (data.code !== 200) {
                    Tips.error(data.msg, 4);
                } else {
                    Tips.info(data.msg, 4);
                }
                form.resetFields();
                this.getDataSource();
            } catch (e) {
                Tips.error(e.message, 4);
            } finally {
                this.setState({visible: false});
            }
        });
    };

    handleCancel = () => this.setState({visible: false});

    handleSearchChange = (e) => {
        e.preventDefault();

        let { pagination, dataSource, storeDataSource } = this.state;

        const reg = new RegExp(e.target.value, 'gi');

        dataSource = storeDataSource.filter((record) => record.email.match(reg));

        pagination.total = dataSource.length;

        this.setState({
            searchText: e.target.value,
            dataSource,
            pagination
        });
    };

    getDataSource = async () => {
        try {
            let { pagination} = this.state;

            let data = await fetchAsync('/customersuccesses');
            if (data.code !== 200) return Tips.error(data.msg, 4);

            let dataSource = [], inviteDataSource = [];

            data.msg.forEach(function (item) {
                if (item.passwd) {
                    dataSource.push({
                        key: item.csid,
                        csid: item.csid,
                        avatar: item.photo,
                        name: item.name,
                        email: item.email,
                        createdAt: item.createdAt
                    });
                } else {
                    inviteDataSource.push({
                        csid: item.csid,
                        email: item.email,
                        updatedAt: item.updatedAt
                    });
                }
            });

            pagination.total = dataSource.length;

            let st = {
                pagination,
                dataSource,
                inviteDataSource,
                storeDataSource: dataSource
            };

            if (data.msg[0]) st.superUser = data.msg[0].csid;

            this.setState(st);
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    handleMenuClick = (e, value) => {
        switch (e.key) {
            case '1':
                this.showModal();
                break;
            case '2':
                Confirm({
                    title: 'Are you sure delete ' + value.email,
                    onOk: () => {
                        this.onDeleteItem(value.key);
                    }
                });
                break;
            default:
                break;
        }
    };

    onDeleteItem = async (key) => {
        try {
            let data = await fetchAsync('/customersuccesses/' + key, {method: 'DELETE'});
            if (data.code !== 200) return Tips.error(data.msg, 4);

            this.getDataSource();
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    handleChange = (pagination, filters, sorter) => {
        this.setState({pagination, sorter});
    };

    handleReset = (value) => {
        let { pagination, dataSource, storeDataSource } = this.state;
        dataSource = storeDataSource;

        pagination.current = 1;
        pagination.total = storeDataSource.length;

        // Init current page when searching.
        this.setState({
            pagination,
            sorter: {},
            searchText: '',
            dataSource
        });
    };

    handleResend = async (csid, email) => {
        try {
            let body = 'csid=' + csid + '&email=' + email;

            let data = await fetchAsync('/invite/resend', {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body
            });

            if (data.code !== 200) return Tips.error(data.msg, 4);
            Tips.info(data.msg, 4);
            this.getDataSource();
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    componentDidMount() {
        this.getDataSource();
    }

    getInvitation(inviteList) {
        if (inviteList.length) {
            return <List
                bordered
                dataSource={inviteList}
                renderItem={item => (
                          <List.Item actions={[<a onClick={this.onDeleteItem.bind(null, item.csid)}>REVOKE</a>,
                           <a onClick={this.handleResend.bind(null, item.csid, item.email)}>RESEND</a>]}>
                            <List.Item.Meta
                              avatar={<Avatar src={require('../../../static/images/contact.png')} />}
                              title={item.email}
                              description={'Invitation sent: ' + fromNow(item.updatedAt)}
                            />
                            <div></div>
                          </List.Item>
                        )}
                />;
        } else {
            return null;
        }
    }

    render() {
        let { dataSource, inviteDataSource, visible, confirmLoading, sorter, searchText, pagination, superUser } = this.state;

        const customerSuccessFormProps = {
            visible: visible,
            confirmLoading: confirmLoading,
            onOk: this.handleOk,
            onCancel: this.handleCancel
        };

        const customerSuccessTableProps = {
            superUser: superUser,
            dataSource: dataSource,
            pagination: pagination,
            sorter: sorter,
            onChange: this.handleChange,
            handleMenuClick: this.handleMenuClick
        };

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Setting</Breadcrumb.Item>
                    <Breadcrumb.Item>Agents</Breadcrumb.Item>
                </Breadcrumb>

                <div className="content-body">
                    <div className="table-deals">
                        <div className="table-search">
                            <Search placeholder="search email"
                                    style={{ width: 200 }}
                                    value={ searchText }
                                    onChange={ this.handleSearchChange }/>
                        </div>
                        <div className="table-operations">
                            <Button type="ghost" onClick={ this.handleReset }>Reset</Button>
                            <Button type="ghost" onClick={ this.showModal }>Invite</Button>
                            <CustomerSuccessForm { ...customerSuccessFormProps } />
                        </div>
                    </div>

                    {this.getInvitation(inviteDataSource)}
                    {inviteDataSource.length ? <br/> : null}

                    <CustomerSuccessTable { ...customerSuccessTableProps } />
                </div>
            </div>
        );
    }
}