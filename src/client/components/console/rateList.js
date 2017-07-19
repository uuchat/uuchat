import React, { Component } from 'react';
import moment from 'moment';
import { Breadcrumb, message } from 'antd';
import RateListTable from './rateListTable';
import AsyncComponent from '../../views/asyncComponent.js';
import { emptyTableLocale } from './constants';

const RateSearchForm = AsyncComponent(() => import('./rateSearchForm')
    .then(component => component.default));

export default class RateList extends Component {

    filter = {
        createdAt: [moment().subtract(7, 'days'), moment()]
    };

    state = {
        csSource: [],
        dataSource: [],
        pagination: {},
        loading: false,
        filter: this.filter,
        sorter: {}
    };

    getDataSource = ()=> {
        const _component = this;

        let { filter,pagination, sorter } = this.state;

        _component.setState({loading: true});

        let queryUrl = '/rates?1=1';

        if (filter.rate) queryUrl += '&rate=' + filter.rate;
        if (filter.csid) queryUrl += '&csid=' + filter.csid;
        if (filter.createdAt.length) queryUrl += '&createdAtStart=' + moment(filter.createdAt[0]).format('YYYY-MM-DD')
            + '&createdAtEnd=' + moment(filter.createdAt[1]).format('YYYY-MM-DD');

        if (pagination.current) queryUrl += "&pageNum=" + (pagination.current - 1);
        if (sorter.field) queryUrl += "&sortField=" + sorter.field + "&sortOrder=" + sorter.order;

        fetch('/customersuccesses')
            .then((res) => res.json())
            .then(function (data) {
                if (200 === data.code) {
                    return _component.setState({
                        csSource: data.msg
                    });
                } else {
                    throw new Error(data.msg);
                }
            }).then(() => fetch(queryUrl))
            .then((res) => res.json())
            .then((data) => {
                if (200 === data.code) {
                    pagination.total = data.msg.count;

                    data.msg.rows.forEach((item) => {
                        item.key = item.uuid;
                        let csFilters = this.state.csSource.filter((element) => element.csid === item.csid);
                        item.csName = csFilters.length ? csFilters[0].name : 'invalid_user';
                        item.csEmail = csFilters.length ? csFilters[0].email : 'invalid_email';
                    });

                    _component.setState({
                        pagination: pagination,
                        dataSource: data.msg.rows,
                        loading: false
                    });
                } else {
                    _component.setState({loading: false});
                    message.error(data.msg, 4);
                }
            }).catch((e) => {
                _component.setState({loading: false});
                message.error(e.message, 4);
            })
    }

    componentDidMount () {
        this.getDataSource();
    }

    handleChange = (pagination, filters, sorter) => {
        this.setState({pagination, sorter}, this.getDataSource);
    };

    onFilterChange = (value) => {
        // Init current page when searching.
        let {pagination} = this.state;
        pagination.current = 1;
        this.setState({pagination});

        this.setState({filter: value}, this.getDataSource);
    };

    render() {
        let { csSource, dataSource, pagination, loading, sorter } = this.state;

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
                           loading={ loading }
                           sorter={ sorter }
                           onChange={ this.handleChange }/>
                </div>
            </div>
        );
    }
}