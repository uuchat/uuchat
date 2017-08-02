import React,{ Component } from 'react';
import { Breadcrumb, Table, Modal, message, Button, Input } from 'antd';
import ActionDropDown from './actionDropDown';
import ShortcutForm from './shortcutForm';
import { emptyTableLocale } from './constants';
import { sortFilterByProps, formatDate } from './utils';

const Search = Input.Search;

export default class Shortcuts extends Component {

    state = {
        visible: false,
        dataSource: [],
        StoreDataSource: [],
        pagination: {},
        filteredInfo: {},
        sortedInfo: {}
    };

    getDataSource = () => {
        const _component = this;

        let { pagination, sortedInfo, filteredInfo } = this.state;
        let { csid } = this.props;

        let queryUrl = '/shortcuts?1=1';

        if (csid) queryUrl = '/shortcuts/cs/' + csid + '?1=1';

        if (filteredInfo.shortcut) queryUrl += "&shortcut=" + filteredInfo.shortcut;
        if (sortedInfo.field) queryUrl += "&sortField=" + sortedInfo.field + "&sortOrder=" + sortedInfo.order;

        fetch(queryUrl)
            .then((res)=>res.json())
            .then(function (data) {
                if (200 === data.code) {
                    pagination.total = data.msg.count;

                    let dataSource = data.msg.rows.map(function (item) {
                        return {
                            key: item.id,
                            id: item.id,
                            shortcut: item.shortcut,
                            msg: item.msg,
                            createdAt: item.createdAt
                        };
                    });

                    _component.setState({
                        pagination,
                        dataSource,
                        StoreDataSource: dataSource
                    });
                } else {
                    message.error(data.msg, 4);
                }
            }).catch(function (e) {
                message.error(e, 4);
            });
    };

    componentDidMount() {
        this.getDataSource();
    }

    renderAction = (value) => {
        return (
            <ActionDropDown
                onMenuClick={e => this.handleMenuClick(e, value)}
                menuOptions={[
                        { key: '1', name: 'Edit' },
                        { key: '2', name: 'Delete' }
                        ]}
                />
        );
    };

    handleMenuClick = (e, value) => {
        const _self = this;

        if (e.key === '1') {
            _self.editShortcut('Update', value);
        } else if (e.key === '2') {
            Modal.confirm({
                title: 'Are you sure delete shortcut: ' + value.shortcut,
                okText: 'OK',
                cancelText: 'Cancel',
                onOk(){
                    _self.onDelete(value.key)
                }
            });
        }
    };

    onDelete = (key) => {
        const _self = this;

        fetch('/shortcuts/' + key, {method: 'DELETE'})
            .then((res)=>res.json())
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

    handleOk = (form, e) => {
        e.preventDefault();

        let { modalType, initialData } = this.state;
        let { csid } = this.props;

        const _self = this;

        form.validateFields((err, values) => {
            if (err) return;

            let url = '/shortcuts/' + (modalType === 'Create' ? '' : initialData.id);
            let method = modalType === 'Create' ? 'POST' : 'PATCH';
            let body = 'shortcut=' + values.shortcut + '&msg=' + values.msg;

            if (csid) body += '&csid=' + csid;

            this.createOrUpdateShortcut(url, method, body)
                .then(function (d) {
                    if (200 === d.code) {
                        _self.getDataSource();
                    } else {
                        message.error(d.msg, 4);
                    }
                })
                .catch(function (e) {
                    message.error(e.message, 4);
                })
                .then(function () {
                    form.resetFields();
                    _self.setState({
                        visible: false
                    });
                });
        });
    };

    handleCancel = (form, e) => {
        form.resetFields();
        this.setState({visible: false});
    };

    createOrUpdateShortcut = (url, method, body) => {
        return fetch(url, {
            credentials: 'include',
            method: method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        }).then((res)=>res.json());
    };

    editShortcut = (modalType, value) => {
        this.setState({
            visible: true,
            initialData: value,
            modalType: modalType
        });
    };

    handleChange = (pagination, filters, sorter) => {
        this.setState({pagination, sortedInfo: sorter});
    };

    handleReset = () => {
        let { pagination, dataSource, StoreDataSource } = this.state;

        dataSource = StoreDataSource;

        pagination.current = 1;
        pagination.total = StoreDataSource.length;

        // Init current page when searching.
        this.setState({
            pagination,
            sortedInfo: {},
            filteredInfo: {},
            dataSource
        });
    };

    handleSearchChange = (e) => {
        e.preventDefault();

        let { pagination, filteredInfo, StoreDataSource, dataSource } = this.state;
        filteredInfo.shortcut = e.target.value;

        const reg = new RegExp(e.target.value, 'gi');
        dataSource = StoreDataSource.filter((record) => {
            return record.shortcut.match(reg);
        });

        pagination.total = dataSource.length;

        this.setState({
            pagination,
            filteredInfo,
            dataSource
        });
    };

    render() {

        let { visible, dataSource, initialData, modalType, sortedInfo, filteredInfo, pagination } = this.state;

        const columns = [
            {
                title: 'shortcut', dataIndex: 'shortcut', key: 'shortcut',
                sorter: (a, b) => sortFilterByProps(a, b, 'shortcut'),
                sortOrder: sortedInfo.columnKey === 'shortcut' && sortedInfo.order
            },
            {
                title: 'Expanded Message', dataIndex: 'msg', key: 'msg',
                sorter: (a, b) => sortFilterByProps(a, b, 'msg'),
                sortOrder: sortedInfo.columnKey === 'msg' && sortedInfo.order
            },
            {
                title: 'createTime', dataIndex: 'createdAt', key: 'createdAt',
                sorter: (a, b) => sortFilterByProps(a, b, 'createdAt'),
                sortOrder: sortedInfo.columnKey === 'createdAt' && sortedInfo.order,
                render: (value)=>formatDate(value)
            },
            {
                title: 'Action', dataIndex: '', key: 'id', render: this.renderAction
            }
        ];

        let shortcutFormProps = {
            modalType: modalType,
            visible: visible,
            onOk: this.handleOk,
            initialData: initialData,
            onCancel: this.handleCancel
        };

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Shortcuts</Breadcrumb.Item>
                </Breadcrumb>

                <div className="content-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div>
                            <Search placeholder="search shortcut"
                                    style={{ width: 200 }}
                                    value={ filteredInfo.shortcut }
                                    onChange={this.handleSearchChange}/>
                        </div>
                        <div>
                        </div>
                        <div>
                            <Button type="ghost" style={{ marginLeft: 8 }}
                                    onClick={ this.handleReset }>Reset</Button>
                            <Button type="ghost" style={{ marginLeft: 8 }}
                                    onClick={ this.editShortcut.bind(this, 'Create') }>Create</Button>
                            <ShortcutForm {...shortcutFormProps}/>
                        </div>
                    </div>

                    <Table columns={ columns }
                           dataSource={ dataSource }
                           locale={ emptyTableLocale }
                           pagination={ pagination }
                           onChange={ this.handleChange }/>
                </div>
            </div>
        );
    }
}