/**
 * Created by jianzhiqiang on 2017/7/9.
 */
import React,{Component} from 'react';
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import { sortFilterByProps } from './utils';

class RateExpandedTable extends Component {

    render() {
        let { dataSource, sortedInfo,month, loading, onChange } = this.props;

        const columns = [
            {
                title: 'email',
                dataIndex: 'email',
                key: 'email',
                sorter: (a, b) => sortFilterByProps(a, b, 'email'),
                sortOrder: sortedInfo.columnKey === 'email' && sortedInfo.order,
                render: (text, record) => (
                    <Link to={{pathname: '/rates/'+record.csid, state:{month: month} }}>{ text }</Link> )
            },
            {
                title: 'name',
                dataIndex: 'name',
                key: 'name',
                sorter: (a, b) => sortFilterByProps(a, b, 'name'),
                sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order
            },
            {
                title: 'rate times',
                dataIndex: 'total',
                key: 'total',
                sorter: (a, b) => a.total - b.total,
                sortOrder: sortedInfo.columnKey === 'total' && sortedInfo.order
            },
            {
                title: 'favorable percent',
                dataIndex: 'favorablePercent',
                key: 'favorablePercent',
                render: (value) => value + '%',
                sorter: (a, b) => a.favorablePercent - b.favorablePercent,
                sortOrder: sortedInfo.columnKey === 'favorablePercent' && sortedInfo.order
            },
            {
                title: 'critical',
                dataIndex: 'critical',
                key: 'critical',
                sorter: (a, b) => a.critical - b.critical,
                sortOrder: sortedInfo.columnKey === 'critical' && sortedInfo.order
            }];

        const expandedRowRender = (record) => {
            const expanderColumns = [
                {title: 'rate', dataIndex: 'rate', key: 'rate'},
                {title: 'count', dataIndex: 'count', key: 'count'}
            ];

            const expanderData = record.rates.map(function (item, index) {
                item.key = index;
                return item;
            });

            return (
                <Table
                    locale={{ emptyText: 'List is empty' }}
                    columns={expanderColumns}
                    dataSource={expanderData}
                    pagination={false}
                    />
            );
        };

        return (
            <Table
                className="ant-table-expanded-nested"
                locale={{ emptyText: 'List is empty' }}
                expandedRowRender={ expandedRowRender }
                dataSource={ dataSource }
                columns={ columns }
                loading={ loading }
                onChange={ onChange }
                />
        );
    }
}

export default RateExpandedTable;

