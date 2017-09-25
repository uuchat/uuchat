import React, { Component } from 'react';
import moment from 'moment';
import { Breadcrumb, message } from 'antd';
import RateListTable from './rateListTable';
import AsyncComponent from '../../common/asyncComponent';
import { emptyTableLocale } from '../common/constants';
import { fetchAsync } from '../common/utils';

const RateSearchForm = AsyncComponent(() => import ('./rateSearchForm').then(component => component.default));

export default class RateList extends Component {

    filter = {
        createdAt: [moment().subtract(7, 'days'), moment()]
    };

    state = {
        csSource: [],
        dataSource: [],
        pagination: {},
        filter: this.filter,
        sorter: {}
    };

    getDataSource = async ()=> {
        try {
            let { filter,pagination, sorter } = this.state;

            let queryUrl = '/rates?1=1';

            if (filter.rate) queryUrl += '&rate=' + filter.rate;
            if (filter.csid) queryUrl += '&csid=' + filter.csid;
            if (filter.createdAt.length) queryUrl += '&createdAtStart=' + moment(filter.createdAt[0]).format('YYYY-MM-DD')
                + '&createdAtEnd=' + moment(filter.createdAt[1]).format('YYYY-MM-DD');

            if (pagination.current) queryUrl += "&pageNum=" + (pagination.current - 1);
            if (sorter.field) queryUrl += "&sortField=" + sorter.field + "&sortOrder=" + sorter.order;

            let cs = await fetchAsync('/customersuccesses');
            if (cs.code !== 200) return message.error(data.msg, 4);

            let data = await fetchAsync(queryUrl);
            if (data.code !== 200) return message.error(data.msg, 4);

            pagination.total = data.msg.count;

            data.msg.rows.forEach((item) => {
                item.key = item.uuid;
                let csFilters = cs.msg.filter((element) => element.csid === item.csid);
                item.csName = csFilters.length ? csFilters[0].name : 'invalid_user';
                item.csEmail = csFilters.length ? csFilters[0].email : 'invalid_email';
            });

            this.setState({
                csSource: cs.msg,
                pagination: pagination,
                dataSource: data.msg.rows
            });

        } catch (e) {
            message.error(e.message, 4);
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

    render() {
        let { csSource, dataSource, pagination, sorter } = this.state;

        const searchProps = {
            filter: this.filter,
            onFilterChange: this.onFilterChange,
            csSource: csSource
        };

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Rate List</Breadcrumb.Item>
                </Breadcrumb>

                <div className="content-body">
                    <RateSearchForm  { ...searchProps } />

                    <RateListTable locale={ emptyTableLocale }
                                   dataSource={ dataSource }
                                   pagination={ pagination }
                                   sorter={ sorter }
                                   onChange={ this.handleChange }/>
                </div>
            </div>
        );
    }
}