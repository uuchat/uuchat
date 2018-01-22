import React,{ Component } from 'react';
import { Breadcrumb, Modal, Button, Input } from 'antd';
import ShortcutForm from './shortcutForm';
import ShortcutTable from './shortcutTable';
import { fetchAsync } from '../common/utils';
import Tips from '../../common/tips';

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

    getDataSource = async () => {
        try {
            let { pagination, sortedInfo, filteredInfo } = this.state;
            let { csid } = this.props;

            let queryUrl = '/shortcuts?1=1';
            if (csid) queryUrl = '/shortcuts/cs/' + csid + '?1=1';
            if (filteredInfo.shortcut) queryUrl += "&shortcut=" + filteredInfo.shortcut;
            if (sortedInfo.field) queryUrl += "&sortField=" + sortedInfo.field + "&sortOrder=" + sortedInfo.order;

            let data = await fetchAsync(queryUrl);

            if (data.code !== 200) return Tips.error(data.msg, 4);

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

            this.setState({
                pagination,
                dataSource,
                StoreDataSource: dataSource
            });
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    componentDidMount() {
        this.getDataSource();
    }

    handleMenuClick = (e, value) => {
        switch (e.key) {
            case '1':
                this.editShortcut('Update', value);
                break;
            case '2':
                Modal.confirm({
                    title: 'Are you sure delete shortcut: ' + value.shortcut,
                    okText: 'OK',
                    cancelText: 'Cancel',
                    onOk: () => {
                        this.onDelete(value.key);
                    }
                });
                break;
            default:
                break;
        }
    };

    onDelete = async (key) => {
        try {
            let data = await fetchAsync('/shortcuts/' + key, {method: 'DELETE'});
            if (data.code !== 200) return Tips.error(data.msg, 4);

            this.getDataSource();
        } catch (e) {
            Tips.error(e, 4);
        }
    };

    handleOk = (form, e) => {
        e.preventDefault();

        let { modalType, initialData } = this.state;
        let { csid } = this.props;

        form.validateFields(async (err, values) => {
            if (err) return;

            try {
                let url = '/shortcuts/' + (modalType === 'Create' ? '' : initialData.id);
                let method = modalType === 'Create' ? 'POST' : 'PATCH';
                let body = 'shortcut=' + values.shortcut + '&msg=' + values.msg;

                if (csid) body += '&csid=' + csid;

                let data = await fetchAsync(url, {
                    credentials: 'include',
                    method: method,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: body
                });
                if (data.code !== 200) return Tips.error(data.msg, 4);

                this.getDataSource();
            } catch (e) {
                Tips.error(e, 4);
            } finally {
                form.resetFields();
                this.setState({visible: false});
            }
        });
    };

    handleCancel = (form, e) => {
        form.resetFields();
        this.setState({visible: false});
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
        dataSource = StoreDataSource.filter((record) => record.shortcut.match(reg));

        pagination.total = dataSource.length;

        this.setState({
            pagination,
            filteredInfo,
            dataSource
        });
    };

    render() {
        let { visible, dataSource, initialData, modalType, sortedInfo, filteredInfo, pagination } = this.state;

        let shortcutFormProps = {
            modalType: modalType,
            visible: visible,
            onOk: this.handleOk,
            initialData: initialData,
            onCancel: this.handleCancel
        };

        let shortcutTableProps = {
            dataSource: dataSource,
            pagination: pagination,
            sorter: sortedInfo,
            onChange: this.handleChange,
            handleMenuClick: this.handleMenuClick
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
                            <Button type="ghost" style={{ marginLeft: 8 }}
                                    onClick={ this.handleReset }>Reset</Button>
                            <Button type="ghost" style={{ marginLeft: 8 }}
                                    onClick={ this.editShortcut.bind(this, 'Create') }>Create</Button>
                            <ShortcutForm {...shortcutFormProps}/>
                        </div>
                    </div>

                    <ShortcutTable { ...shortcutTableProps }/>
                </div>
            </div>
        );
    }
}