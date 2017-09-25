import React, { Component } from 'react';
import { Breadcrumb, message, Button, Modal, Input } from 'antd';
import CustomerSuccessForm from './customerSuccessForm';
import CustomerSuccessTable from './customerSuccessTable';
import { fetchAsync } from '../common/utils';

const Search = Input.Search;
const Confirm = Modal.confirm;

export default class Operators extends Component {

    state = {
        dataSource: [],
        StoreDataSource: [],
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
                let body = 'email=' + values.email + '&passwd=' + values.password;
                if (values.name) body += '&name=' + values.name;

                let data = await fetchAsync('/register', {
                    credentials: 'include',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: body
                });

                if (data.code !== 200) return message.error(data.msg, 4);
                form.resetFields();
                this.getDataSource();

            } catch (e) {
                message.error(e.message, 4);
            } finally {
                this.setState({
                    visible: false
                });
            }
        });
    };

    handleCancel = () => this.setState({visible: false});

    handleSearchChange = (e) => {
        e.preventDefault();

        let { pagination, dataSource, StoreDataSource } = this.state;

        const reg = new RegExp(e.target.value, 'gi');

        dataSource = StoreDataSource.filter((record) => record.email.match(reg));

        pagination.total = dataSource.length;

        this.setState({
            searchText: e.target.value,
            dataSource,
            pagination
        });
    };

    getDataSource = async () => {
        try {
            let { pagination } = this.state;

            let data = await fetchAsync('/customersuccesses');
            if (data.code !== 200) return message.error(data.msg, 4);

            let sourceList = data.msg.map(function (item) {
                return {
                    key: item.csid,
                    csid: item.csid,
                    avatar: item.photo,
                    name: item.name,
                    email: item.email,
                    createAt: item.createdAt
                };
            });

            pagination.total = sourceList.length;

            let st = {
                pagination,
                dataSource: sourceList,
                StoreDataSource: sourceList
            };

            if (data.msg[0]) st.superUser = data.msg[0].csid;

            this.setState(st);
        } catch (e) {
            message.error(e, 4);
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
            if (data.code !== 200) return message.error(data.msg, 4);

            this.getDataSource();
        } catch (e) {
            message.error(e, 4);
        }
    };

    handleChange = (pagination, filters, sorter) => {
        this.setState({pagination, sorter});
    };

    handleReset = (value) => {
        let { pagination, dataSource, StoreDataSource } = this.state;
        dataSource = StoreDataSource;

        pagination.current = 1;
        pagination.total = StoreDataSource.length;

        // Init current page when searching.
        this.setState({
            pagination,
            sorter: {},
            searchText: '',
            dataSource
        });
    };

    componentDidMount() {
        this.getDataSource();
    }

    render() {
        let { dataSource, visible, confirmLoading, sorter, searchText, pagination, superUser } = this.state;

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
                            <CustomerSuccessForm { ...customerSuccessFormProps } />
                        </div>
                    </div>

                    <CustomerSuccessTable { ...customerSuccessTableProps } />
                </div>
            </div>
        );
    }
}