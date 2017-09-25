import React, { Component } from 'react';
import { Table, message } from 'antd';
import { emptyTableLocale } from '../common/constants';
import { sortFilterByProps, formatDate, fetchAsync } from '../common/utils';

export default class ScreenList extends Component {

    state = {
        dataSource: [],
        sorter: {},
        pagination: {}
    };

    getDataSource = async () => {
        try {
            let { uuid } = this.props;
            if (!uuid) return false;

            let data = await fetchAsync('/customerstorages/' + uuid + '/screens/');
            if (data.code !== 200) return message.error(data.msg, 4);

            data.msg.forEach(function (item, index) {
                item.key = index;
            });

            this.setState({
                dataSource: data.msg
            });
        } catch (e) {
            message.error(e.message, 4);
        }
    };

    handleChange = (pagination, filters, sorter) => {
        this.setState({pagination, sorter});
    };

    componentDidMount() {
        this.getDataSource();
    }

    render() {
        let { dataSource, sorter, pagination } = this.state;

        const columns = [
            {
                title: 'time', dataIndex: 'time', key: 'time',
                sorter: (a, b) => sortFilterByProps(a, b, 'time'),
                sortOrder: sorter.columnKey === 'time' && sorter.order,
                render: (value) => formatDate(value)
            },
            {
                title: 'screen', dataIndex: 'screen', key: 'screen',
                sorter: (a, b) => sortFilterByProps(a, b, 'time'),
                sortOrder: sorter.columnKey === 'screen' && sorter.order
            }
        ];

        return (
            <Table dataSource={ dataSource }
                   columns={ columns }
                   locale={ emptyTableLocale }
                   pagination={ pagination }
                   sorter={ sorter }
                   onChange={ this.handleChange }/>
        );
    }
}