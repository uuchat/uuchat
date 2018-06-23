import React, { Component } from 'react';
import { Breadcrumb } from 'antd';
import AsyncComponent from '../../common/asyncComponent';
import CustomerTable from './customerTable';
import { fetchAsync, formatDate } from '../common/utils';
import Tips from '../../common/tips';
import { saveCSV } from '../common/fileExport';

const CustomerSearchForm = AsyncComponent(() => import ('./customerSearchForm').then(component => component.default));

export default class Customers extends Component {

    state = {
        dataSource: [],
        pagination: {},
        sorter: {},
        filter: {}
    };

    getDataSource = async () => {
        try {
            this.setState({loading: true});

            let { pagination,sorter, filter } = this.state;

            let queryUrl = '/customerstorages?1=1';

            if (filter.lastTime && filter.lastTime.length) {
                queryUrl += "&lastTimeStart=" + filter.lastTime[0] + "&lastTimeEnd=" + filter.lastTime[1];
            }
            if (filter.country) queryUrl += "&country=" + filter.country;
            if (pagination.current) queryUrl += "&pageNum=" + (pagination.current - 1);
            if (sorter.field) queryUrl += "&sortField=" + sorter.field + "&sortOrder=" + sorter.order;

            let data = await fetchAsync(queryUrl);
            if (data.code !== 200) return Tips.error(data.msg, 4);

            data.msg.rows.forEach(function (item) {
                item.key = item.uuid;
            });

            pagination.total = data.msg.count;

            this.setState({
                pagination,
                dataSource: data.msg.rows
            });
        } catch (e) {
            Tips.error(e.message, 4);
        } finally {
            this.setState({loading: false});
        }
    };

    componentDidMount() {
        this.getDataSource();
    }

    handleChange = (pagination, filters, sorter) => {
        this.setState({pagination, sorter}, this.getDataSource);
    };

    onFilterChange = (value) => {
        // Init current page when searching.
        let {pagination} = this.state;
        pagination.current = 1;

        this.setState({pagination, filter: value}, this.getDataSource);
    };

    handleExport = async() => {
        try {
            let { sorter, filter } = this.state;

            let queryUrl = '/customerstorages?1=1';

            if (filter.lastTime && filter.lastTime.length) {
                queryUrl += "&lastTimeStart=" + filter.lastTime[0] + "&lastTimeEnd=" + filter.lastTime[1];
            }
            if (filter.country) queryUrl += "&country=" + filter.country;
            if (sorter.field) queryUrl += "&sortField=" + sorter.field + "&sortOrder=" + sorter.order;
            queryUrl += "&pageSize=10000";

            let data = await fetchAsync(queryUrl);
            if (data.code !== 200) return Tips.error(data.msg, 4);

            data.msg.rows.forEach(function (item) {
                item.firstTime = formatDate(item.firstTime);
                item.lastTime = formatDate(item.lastTime);
            });

            const dataSource = data.msg.rows;

            const options = {
                headers: ['cid', 'firstTime', 'lastTime', 'country', 'platform'],
                filename: 'uuchat_customer_' + formatDate(new Date(), 'yyyyMMdd_hhmmss')
            };

            saveCSV(dataSource, options);
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    render() {
        let { dataSource, sorter, pagination, loading } = this.state;

        let customerTableProps = {
            dataSource: dataSource,
            sorter: sorter,
            pagination: pagination,
            loading: loading,
            onChange: this.handleChange
        };

        const searchProps = {
            filter: this.filter,
            onFilterChange: this.onFilterChange,
            dataSource: dataSource,
            handleExport: this.handleExport
        };

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Data</Breadcrumb.Item>
                    <Breadcrumb.Item>Customers</Breadcrumb.Item>
                </Breadcrumb>

                <div className="content-body">
                    <CustomerSearchForm  { ...searchProps } />

                    <CustomerTable { ...customerTableProps }/>
                </div>
            </div>
        );
    }
}