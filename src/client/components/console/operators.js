import React, { Component } from 'react';
import { Table, Breadcrumb, message, Button, Modal, Input } from 'antd';
import CustomerSuccessForm from './customerSuccessForm';
import ActionDropDown from './actionDropDown';
import { emptyTableLocale } from './constants';
import { sortFilterByProps, formatDate } from './utils';

const Search = Input.Search;
const Confirm = Modal.confirm;

export default class Operators extends Component {

    state = {
        dataSource: [],
        StoreDataSource: [],
        visible: false,
        searchText: '',
        sortedInfo: {},
        pagination: {}
    };

    rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
        },
        getCheckboxProps: (record) => ({
            disabled: record.key === this.state.superUser
        })
    };

    showModal = () => this.setState({visible: true});

    handleOk = (form, e) => {
        e.preventDefault();

        const _self = this;

        form.validateFields((err, values) => {
            if (err) return;

            let body = 'email=' + values.email + '&passwd=' + values.password;
            if (values.name) body += '&name=' + values.name;

            fetch('/register', {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body
            }).then((res)=>res.json())
                .then(function (d) {
                    if (200 === d.code) {
                        _self.setState({
                            visible: false
                        });
                        form.resetFields();
                        _self.getDataSource();
                    } else {
                        _self.setState({
                            visible: false
                        });
                        message.error(d.msg, 4);
                    }
                })
                .catch(function (e) {
                    _self.setState({
                        visible: false
                    });
                    message.error(e.message, 4);
                });
        });
    };

    handleCancel = () => this.setState({visible: false});

    handleSearchChange = (e) => {
        e.preventDefault();

        let { pagination, dataSource, StoreDataSource } = this.state;

        const reg = new RegExp(e.target.value, 'gi');

        dataSource = StoreDataSource.filter((record) => {
            return record.email.match(reg);
        })

        pagination.total = dataSource.length;

        this.setState({
            searchText: e.target.value,
            dataSource,
            pagination
        });
    };

    getDataSource = () => {
        let { pagination } = this.state;

        const _component = this;

        fetch('/customersuccesses')
            .then((res)=>res.json())
            .then(function (data) {
                if (200 === data.code) {

                    let sourceList = [];

                    data.msg.forEach(function (item) {
                        sourceList.push({
                            key: item.csid,
                            csid: item.csid,
                            avatar: item.photo,
                            name: item.name,
                            email: item.email,
                            createAt: item.createdAt
                        });
                    });

                    pagination.total = sourceList.length;

                    let st = {
                        pagination,
                        dataSource: sourceList,
                        StoreDataSource: sourceList
                    };

                    if (data.msg[0]) st.superUser = data.msg[0].csid;

                    _component.setState(st);
                } else {
                    message.error(data.msg, 4);
                }
            }).catch(function (e) {
                message.error(e, 4);
            });
    };

    handleMenuClick = (e, value) => {
        const _self = this;
        if (e.key === '1') {
            _self.showModal();
        } else if (e.key === '2') {
            Confirm({
                title: 'Are you sure delete ' + value.email,
                onOk(){
                    _self.onDeleteItem(value.key)
                }
            });
        }
    };

    onDeleteItem = (key) => {
        const _self = this;

        fetch('/customersuccesses/' + key, {
            method: 'DELETE'
        }).then((res)=>res.json())
            .then(function (d) {
                if (200 === d.code) {
                    _self.getDataSource();
                } else {
                    message.error(d.msg, 4);
                }
            })
            .catch(function (e) {
                message.error(e, 4);
            });

    };

    renderAction = (value) => {
        if (value.key === this.state.superUser) return;

        return (
            <ActionDropDown
                onMenuClick={e => this.handleMenuClick(e, value)}
                menuOptions={[
                        { key: '2', name: 'Delete' }]}
                />
        );
    };

    handleChange = (pagination, filters, sorter) => {
        this.setState({pagination, sortedInfo: sorter});
    };

    handleReset = (value) => {
        let { pagination, dataSource, StoreDataSource } = this.state;
        dataSource = StoreDataSource;

        pagination.current = 1;
        pagination.total = StoreDataSource.length;

        // Init current page when searching.
        this.setState({
            pagination,
            sortedInfo: {},
            searchText: '',
            dataSource
        });
    };

    componentDidMount () {
        this.getDataSource();
    };

    render() {
        let { dataSource, visible, confirmLoading, sortedInfo, searchText, pagination } = this.state;

        let avatarRender = (avatar) =>
            (<img className="user-avatar"
                  src={ (avatar !=='null' && avatar) ? '/' + avatar : require('../../static/images/contact.png')}
                  alt="avatar"
                  title="avatar"/>);


        const columns = [
            {
                title: 'avatar', dataIndex: 'avatar', key: 'avatar', render: avatarRender
            },
            {
                title: 'email', dataIndex: 'email', key: 'email',
                sorter: (a, b) => sortFilterByProps(a, b, 'email'),
                sortOrder: sortedInfo.columnKey === 'email' && sortedInfo.order
            },
            {
                title: 'name', dataIndex: 'name', key: 'name',
                sorter: (a, b) => sortFilterByProps(a, b, 'name'),
                sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order
            },
            {
                title: 'createTime', dataIndex: 'createAt', key: 'createAt',
                sorter: (a, b) => sortFilterByProps(a, b, 'createAt'),
                sortOrder: sortedInfo.columnKey === 'createAt' && sortedInfo.order,
                render:(value) => formatDate(value)
            },
            {
                title: 'Action', dataIndex: '', key: 'csid', render: this.renderAction
            }
        ];

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Operators</Breadcrumb.Item>
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
                            <Button type="ghost" onClick={this.showModal}>Create</Button>
                            <CustomerSuccessForm
                                visible={visible}
                                onOk={this.handleOk}
                                confirmLoading={confirmLoading}
                                onCancel={this.handleCancel}
                                />
                        </div>
                    </div>

                    <Table rowSelection={this.rowSelection}
                           dataSource={dataSource}
                           columns={columns}
                           locale={emptyTableLocale}
                           pagination={ pagination }
                           onChange={ this.handleChange }/>
                </div>
            </div>
        );
    }
}