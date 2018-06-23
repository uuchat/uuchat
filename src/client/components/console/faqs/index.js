import React, { Component } from 'react';
import { Breadcrumb, Button, Modal } from 'antd';
import Tips from '../../common/tips';
import AsyncComponent from '../../common/asyncComponent.js';
import { fetchAsync, escapeHTML } from '../common/utils';
import FAQCollectionForm from './faqCollectionForm';

const FAQExpandedTable = AsyncComponent(() =>
import ('./faqExpandedTable').then(component => component.default));

export default class FAQ extends Component {

    state = {
        visible: false,
        dataSource: []
    };


    getDataSource = async () => {
        try {
            this.setState({loading: true});

            let collectionUrl = '/console/faqs/collections';

            let data = await fetchAsync(collectionUrl);

            if (data.code !== 200) return Tips.error(data.msg, 4);

            data.msg.forEach(function (item) {
                item.key = item.uuid;
            });

            this.setState({
                dataSource: data.msg
            });
        } catch (e) {
            Tips.error(e.message, 4);
        } finally {
            this.setState({loading: false});
        }
    };

    componentDidMount() {
        // run once
        this.getDataSource();
    }

    handleChange = (pagination, filters, sorter) => {
        this.setState({
            sortedInfo: sorter
        });
    };

    handleIssueChange = (record) => {
        let { dataSource } = this.state;

        dataSource.forEach(function (item) {
            if (item.uuid === record.uuid) {
                item.count = record.count;
            }
        });

        this.setState({dataSource});
    };

    handleOk = (form, e) => {
        e.preventDefault();

        let { modalType, initialData } = this.state;

        form.validateFields(async (err, values) => {
            if (err) return;

            const collection = escapeHTML(values.collection);

            try {
                let url = '/console/faqs/collections/' + (modalType === 'Create' ? '' : initialData.key);
                let method = modalType === 'Create' ? 'POST' : 'PATCH';
                let body = 'name=' + encodeURIComponent(collection);

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
                Tips.error(e.message, 4);
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

    handleMenuClick = (e, value) => {
        switch (e.key) {
            case '1':
                this.editCollection('Update', value);
                break;
            case '2':
                Modal.confirm({
                    title: 'You will delete this collection:',
                    content: value.name,
                    okText: 'OK',
                    cancelText: 'Cancel',
                    onOk: () => {
                        this.deleteCollection(value.key);
                    }
                });
                break;
            default:
                break;
        }
    };

    editCollection = (modalType, value) => {
        this.setState({
            visible: true,
            modalType: modalType,
            initialData: value
        });
    };

    deleteCollection = async (key) => {
        try {
            let data = await fetchAsync('/console/faqs/collections/' + key, {method: 'DELETE'});
            if (data.code !== 200) return Tips.error(data.msg, 4);

            this.getDataSource();
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    render() {
        let { dataSource, sortedInfo, modalType, visible, initialData } = this.state;
        sortedInfo = sortedInfo || {};

        let faqCollectionFormProps = {
            modalType: modalType,
            visible: visible,
            onOk: this.handleOk,
            initialData: initialData,
            onCancel: this.handleCancel
        };

        let faqExpandedTable = {
            dataSource: dataSource,
            sortedInfo: sortedInfo,
            onChange: this.handleChange,
            onIssueChange: this.handleIssueChange,
            handleMenuClick: this.handleMenuClick
        };

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Setting</Breadcrumb.Item>
                    <Breadcrumb.Item>FAQ</Breadcrumb.Item>
                </Breadcrumb>

                <div className="content-body">
                    <div className="table-deals">
                        <div className="table-search">
                        </div>
                        <div className="table-operations">
                            <Button onClick={ this.editCollection.bind(this, 'Create') }>Create</Button>
                            <FAQCollectionForm { ...faqCollectionFormProps }/>
                        </div>
                    </div>
                    <FAQExpandedTable { ...faqExpandedTable }/>
                </div>
            </div>
        );
    }
}