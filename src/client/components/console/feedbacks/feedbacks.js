import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button, Select } from 'antd';
import FeedbackTable from './feedbackTable';
import { fetchAsync } from '../common/utils';
import Tips from '../../common/tips';

const Option = Select.Option;

export default class Feedbacks extends Component {

    state = {
        classSource: [],
        dataSource: [],
        filter: [],
        sorter: {},
        pagination: {}
    };

    getClassSource = async () => {
        try {
            let data = await fetchAsync('/feedbackmetas/classes');
            if (data.code !== 200) return Tips.error(data.msg, 4);

            data.msg.push({desc: 'contact_us'});

            this.setState({
                classSource: data.msg
            });
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    getDataSource = async () => {
        try {
            let { pagination, filter } = this.state;

            let queryUrl = '/feedbacks';
            if (filter.class) queryUrl += '?class=' + filter.class;
            let data = await fetchAsync(queryUrl);
            if (data.code !== 200) return Tips.error(data.msg, 4);

            let sourceList = data.msg.rows.map(function (item) {
                item.key = item.uuid;
                return item;
            });

            pagination.total = data.msg.count;

            let st = {
                pagination,
                dataSource: sourceList
            };

            this.setState(st);
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    componentDidMount() {
        this.getClassSource();
        this.getDataSource();
    }

    handleChange = (pagination, filters, sorter) => {
        this.setState({pagination, sorter});
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

    render() {
        let { classSource, dataSource, pagination, sorter } = this.state;

        const feedbackTableProps = {
            dataSource: dataSource,
            pagination: pagination,
            sorter: sorter,
            onChange: this.handleChange
        };

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Feedbacks</Breadcrumb.Item>
                </Breadcrumb>

                <div className="content-body">
                    <div className="table-deals">
                        <div className="table-search">
                            <Select
                                showSearch
                                style={{ width: 200 }}
                                size="normal"
                                placeholder="Select type"
                                allowClear={ true }
                                optionFilterProp="children"
                                onChange={ this.handleSelectChange.bind(null, 'class') }
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                {classSource.map(d => <Option key={d.desc}>{d.desc}</Option>)}
                            </Select>
                        </div>
                        <div className="table-operations">
                            <Button>
                                <Link to={{pathname: '/feedbackSetting'}}>Feedback Settings</Link>
                            </Button>
                        </div>
                    </div>

                    <FeedbackTable { ...feedbackTableProps } />
                </div>
            </div>
        );
    }
}