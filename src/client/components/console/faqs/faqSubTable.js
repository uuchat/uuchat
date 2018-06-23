import React, { Component } from 'react';
import { Table, Button, Icon, Input, Divider, Popconfirm } from 'antd';
import { fetchAsync, escapeHTML } from '../common/utils';
import { emptyTableLocale } from '../common/constants';
import Tips from '../../common/tips';
import styles from './style.css';

const { TextArea } = Input;

export default class FAQSubTable extends Component {
    state = {
        data: [],
        loading: false
    };
    index = 0;
    cacheOriginData = {};

    getDataSource = async () => {
        const { record } = this.props;
        const collection_id = record.key;

        try {
            this.setState({loading: true});

            let data = await fetchAsync('/console/faqs/collection/' + collection_id);

            if (data.code !== 200) return Tips.error(data.msg, 4);

            data = data.msg.map(function (item) {
                item.key = item.uuid;

                return item;
            });

            this.setState({data});

        } catch (e) {
            Tips.error(e.msg, 4);
        } finally {
            this.setState({loading: false});
        }
    };

    componentDidMount() {
        this.getDataSource();
    }

    getRowByKey = (key, newData) => {
        return (newData || this.state.data).filter(item => item.key === key)[0];
    };

    deliverIssueChange = (newData) => {
        let record = this.props.record;
        record.count = newData.length;
        this.props.onIssueChange(record);
    };

    toggleEditable = (e, key) => {
        e.preventDefault();

        const newData = this.state.data.map(item => ({...item}));
        const target = this.getRowByKey(key, newData);

        if (target) {
            if (!target.editable) {
                this.cacheOriginData[key] = {...target};
            }

            target.editable = !target.editable;
            this.setState({data: newData});

            this.deliverIssueChange(newData);
        }
    };

    // delete row
    remove = async (key) => {
        try {
            this.setState({loading: true});

            let data = await fetchAsync('/console/faqs/' + key, {method: 'DELETE'});
            if (data.code !== 200) return Tips.error(data.msg, 4);

            const newData = this.state.data.filter(item => item.key !== key);
            this.setState({data: newData});

            this.deliverIssueChange(newData);
        } catch (e) {
            Tips.error(e.message, 4);
        } finally {
            this.setState({loading: false});
        }
    };

    newMember = () => {
        const newData = this.state.data.map(item => ({...item}));
        newData.push({
            key: `NEW_TEMP_ID_${this.index}`,
            issue: '',
            answer: '',
            editable: true,
            isNew: true
        });

        this.index += 1;

        this.setState({data: newData});
    };

    handleKeyPress = (e, key) => {
        if (e.key === 'Enter') {
            this.saveRow(e, key);
        }
    };

    handleFieldChange = (e, fieldName, key) => {
        const newData = this.state.data.map(item => ({...item}));
        const target = this.getRowByKey(key, newData);
        if (target) {
            target[fieldName] = e.target.value;
            this.setState({data: newData});
        }
    };

    // save row record
    saveRow = async (e, key) => {
        e.persist();

        this.setState({loading: true});

        if (this.clickedCancel) {
            this.clickedCancel = false;
            return this.setState({loading: false});
        }

        const target = this.getRowByKey(key) || {};

        if (!target.issue || !target.answer) {
            Tips.error('Please input complete faq information.');
            e.target.focus();

            return this.setState({loading: false});
        }

        try {
            if (target.isNew) {
                const { record } = this.props;
                const collectionId = record.key;

                let url = '/console/faqs/';
                let method = 'POST';
                let body = 'collectionId=' + collectionId + '&issue=' + encodeURIComponent(escapeHTML(target.issue)) + '&answer=' + encodeURIComponent(escapeHTML(target.answer));

                let data = await fetchAsync(url, {
                    credentials: 'include',
                    method: method,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: body
                });

                if (data.code !== 200) return Tips.error(data.msg, 4);
                key = target.key = target.uuid = data.msg.uuid;

                delete target.isNew;
            } else {
                let url = '/console/faqs/' + key;
                let method = 'PATCH';
                let body = 'issue=' +  encodeURIComponent(escapeHTML(target.issue)) + '&answer=' +  encodeURIComponent(escapeHTML(target.answer));

                let data = await fetchAsync(url, {
                    credentials: 'include',
                    method: method,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: body
                });

                if (data.code !== 200) return Tips.error(data.msg, 4);
            }

            this.toggleEditable(e, key);

        } catch (e) {
            Tips.error(e.message, 4);
        } finally {
            this.setState({loading: false});
        }
    };

    // cancel update
    cancel = (e, key) => {
        this.clickedCancel = true;

        e.preventDefault();

        const newData = this.state.data.map(item => ({...item}));

        const target = this.getRowByKey(key, newData);

        if (this.cacheOriginData[key]) {
            Object.assign(target, this.cacheOriginData[key]);
            target.editable = false;
            delete this.cacheOriginData[key];
        }

        this.setState({data: newData});

        this.clickedCancel = false;
    };

    render() {
        const { data, loading } = this.state;

        const renderIssue = (text, record) => {
            if (record.editable) {
                return (
                    <Input
                        value={text}
                        autoFocus
                        onChange={e => this.handleFieldChange(e, 'issue', record.key)}
                        onKeyPress={e => this.handleKeyPress(e, record.key)}
                        placeholder="issue"
                        maxlength="40"
                        style={{verticalAlign: "middle"}}
                        />
                );
            }

            return text;
        };

        const renderAnswer = (text, record) => {
            if (record.editable) {
                return (
                    <TextArea
                        value={text}
                        onChange={e => this.handleFieldChange(e, 'answer', record.key)}
                        onKeyPress={e => this.handleKeyPress(e, record.key)}
                        placeholder="answer"
                        rows={1}
                        autosize
                        maxlength="140"
                        style={{verticalAlign: "middle"}}
                        />
                );
            }

            return text;
        };

        const renderAction = (text, record) => {
            if (!!record.editable && this.state.loading) {
                return null;
            }

            if (record.editable) {
                if (record.isNew) {
                    return (
                        <span>
                          <a onClick={e => this.saveRow(e, record.key)}>Add</a>
                          <Divider type="vertical"/>
                          <Popconfirm title="Delete this row?" onConfirm={() => this.remove(record.key)}>
                              <a>Delete</a>
                          </Popconfirm>
                        </span>
                    );
                }

                return (
                    <span>
                        <a onClick={e => this.saveRow(e, record.key)}>save</a>
                        <Divider type="vertical"/>
                        <a onClick={e => this.cancel(e, record.key)}>cancel</a>
                    </span>
                );
            }

            return (
                <span>
                  <a onClick={e => this.toggleEditable(e, record.key)}>Edit</a>
                  <Divider type="vertical"/>
                  <Popconfirm title="Delete this row?" onConfirm={() => this.remove(record.key)}>
                      <a>Delete</a>
                  </Popconfirm>
            </span>
            );
        };

        const columns = [
            {title: 'issue', dataIndex: 'issue', key: 'issue', width: '30%', render: renderIssue},
            {title: 'answer', dataIndex: 'answer', key: 'answer', width: '50%', render: renderAnswer},
            {title: 'Action', dataIndex: '', key: 'uuid', width: '20%', render: renderAction}
        ];

        const getFooter = () =>(<Button size="small" onClick={this.newMember}><Icon type="plus"/>Add Issue</Button>);

        return (
            <Table
                locale={ emptyTableLocale }
                columns={columns}
                dataSource={data}
                loading={ loading }
                pagination={false}
                footer={getFooter}
                rowClassName={record => {
                    return record.editable ? styles.editable : '';
                    }}
                />
        );
    }
}
