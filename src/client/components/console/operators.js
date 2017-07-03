import React, {Component} from 'react';
import { Table, Breadcrumb, message, Button, Modal, Form, Input } from 'antd';
import CustomerSuccessForm from './customerSuccessForm';
import ActionDropDown from './actionDropDown';
import { formatDate } from './utils';

const Search = Input.Search;
const Confirm = Modal.confirm;

class Operators extends Component {

    state = {
        dataSource: [],
        StoreDataSource: [],
        visible: false,
        searchText: '',
    };

    rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
        },
        getCheckboxProps: (record) => ({
            disabled: record.key === this.state.superUser,
        }),
    };

    handleChange = (pagination, filters, sorter) => {

    };
    showModal = () => this.setState({visible: true})

    handleOk = (e) => {
        e.preventDefault();

        const _self = this;
        const form = _self.form;

        form.validateFields((err, values) => {
            if (err) return;

            /*this.setState({
             confirmLoading: true,
             });*/

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
                            visible: false,
                            //confirmLoading: false,
                        });
                        form.resetFields();
                        _self.getDataSource();
                    } else {
                        _self.setState({
                            visible: false,
                        });
                        message.error(d.msg, 4);
                    }
                })
                .catch(function (e) {
                    _self.setState({
                        visible: false,
                    });
                    message.error(e.message, 4);
                });
        });
    };

    saveFormRef = (form) => this.form = form
    handleCancel = () => this.setState({visible: false})

    handleSearchChange = (e) => {
        e.preventDefault();

        const { StoreDataSource } = this.state;

        const reg = new RegExp(e.target.value, 'gi');

        this.setState({
            searchText: e.target.value,
            dataSource: StoreDataSource.filter((record) => {
                return record.email.match(reg);
            })
        });
    };

    getDataSource = () => {
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
                            createTime: formatDate(item.createdAt)
                        });
                    });
                    let st = {
                        dataSource: sourceList,
                        StoreDataSource: sourceList,
                    };

                    st.StoreDataSource = sourceList;

                    if (data.msg[0]) st.superUser = data.msg[0].csid;

                    _component.setState(st);
                } else {
                    message.error(data.msg, 4);
                }
            }).catch(function (e) {
                message.error(e, 4);
            });
    }

    handleMenuClick = function (e, value) {
        const _self = this;
        if (e.key === '1') {
            this.showModal();
        } else if (e.key === '2') {
            Confirm({
                title: 'Are you sure delete ' + value.email,
                onOk(){
                    _self.onDeleteItem(value.key)
                },
                okText: 'Confirm',
                cancelText: 'Cancel'
            });
        }
    };

    onDeleteItem = function (key) {
        const _self = this;

        fetch('/customersuccesses/' + key, {
            method: 'DELETE',
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
                        //{ key: '1', name: 'Update' },
                        { key: '2', name: 'Delete' }]}
                />
        )
    };

    componentDidMount = () => {
        this.getDataSource();
    };

    render() {
        const WrappedCustomerSuccessForm = Form.create()(CustomerSuccessForm);

        let { dataSource, visible, confirmLoading } = this.state;

        let avatarRender = (avatar) =>
            (<img className="user-avatar"
                  src={ (avatar !=='null' && avatar) ? '/' + avatar : require('../../static/images/contact.png')}
                  alt="avatar"
                  title="avatar"/>)


        const columns = [
            {
                title: 'avatar', dataIndex: 'avatar', key: 'avatar',
                render: avatarRender,
            },
            {
                title: 'email', dataIndex: 'email', key: 'email',
            },
            {
                title: 'name', dataIndex: 'name', key: 'name',
            },
            {
                title: 'createTime', dataIndex: 'createTime', key: 'createTime',
            },
            {
                title: 'Action', dataIndex: '', key: 'csid',
                render: this.renderAction,
            },
        ];

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Operators</Breadcrumb.Item>
                </Breadcrumb>

                <div style={{ padding: 24, background: '#fff' }}>
                    <div className="table-deals">
                        <div className="table-search">
                            <Search placeholder="search email" style={{ width: 200 }}
                                    onChange={ this.handleSearchChange }/>
                        </div>
                        <div className="table-operations">
                            <Button type="ghost" onClick={this.showModal}>Create</Button>
                            <WrappedCustomerSuccessForm
                                visible={visible}
                                onOk={this.handleOk}
                                confirmLoading={confirmLoading}
                                onCancel={this.handleCancel}
                                ref={this.saveFormRef}
                                />
                        </div>
                    </div>

                    <Table rowSelection={this.rowSelection} dataSource={dataSource} columns={columns}
                           onChange={this.handleChange} locale={{ emptyText: 'List is empty' }}/>
                </div>
            </div>
        );
    }
}

export default Operators;