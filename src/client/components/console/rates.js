/**
 * Created by jianzhiqiang on 2017/6/14.
 */
import React,{Component} from 'react';
import { Breadcrumb, Table, Button, message, DatePicker } from 'antd';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { sortFilterByProps } from './utils';

const { MonthPicker } = DatePicker;

class Rates extends Component {
    state = {
        dataSource: [],
        sortedInfo: null,
        month: moment().format('YYYY-MM'),
    };

    clearSorters = () => {
        this.setState({
            sortedInfo: null,
        });
    }

    getDataSource = ()=> {
        const _component = this;

        let { month } = this.state;

        let reportUrl = '/console/rates/report/month/' + month;

        fetch(reportUrl)
            .then((res)=>res.json())
            .then(function (data) {

                if (200 === data.code) {

                    data.msg.forEach(function (item) {
                        item.key = item.csid;
                    });

                    _component.setState({
                        dataSource: data.msg,
                    });
                } else {
                    message.error(data.msg, 4);
                }
            }).catch(function (e) {
                message.error(e.message, 4);
            });
    }

    componentWillMount = () => {
        const location = this.props.location;
        if (location.state) {
            this.setState({month: location.state.month});
        }
    }

    componentDidMount = () => {
        this.getDataSource();
    }

    handleChange = (pagination, filters, sorter) => {
        this.setState({
            sortedInfo: sorter,
        });
    }

    handleMonthPickerChange = (date, dateString) => {
        this.setState({
            month: dateString,
        }, this.getDataSource);
    }

    render() {
        let { dataSource,sortedInfo, month } = this.state;
        sortedInfo = sortedInfo || {};

        let defaultPickerMonth = moment(month);

        const columns = [
            {
                title: 'email',
                dataIndex: 'email',
                key: 'email',
                sorter: (a, b) => sortFilterByProps(a, b, 'email'),
                sortOrder: sortedInfo.columnKey === 'email' && sortedInfo.order,
                render: (text, record) => (
                    <Link to={{pathname: '/rates/'+record.csid, state:{month: month} }}>{ text }</Link> ),
            },
            {
                title: 'name',
                dataIndex: 'name',
                key: 'name',
                sorter: (a, b) => sortFilterByProps(a, b, 'name'),
                sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
            },
            {
                title: 'rate times',
                dataIndex: 'total',
                key: 'total',
                sorter: (a, b) => a.total - b.total,
                sortOrder: sortedInfo.columnKey === 'total' && sortedInfo.order,
            },
            {
                title: 'favorable percent',
                dataIndex: 'favorablePercent',
                key: 'favorablePercent',
                render: (value) => value + '%',
                sorter: (a, b) => a.favorablePercent - b.favorablePercent,
                sortOrder: sortedInfo.columnKey === 'favorablePercent' && sortedInfo.order,
            },
            {
                title: 'critical',
                dataIndex: 'critical',
                key: 'critical',
                sorter: (a, b) => a.critical - b.critical,
                sortOrder: sortedInfo.columnKey === 'critical' && sortedInfo.order,
            }];

        const expandedRowRender = (record) => {
            const expanderColumns = [
                {title: 'rate', dataIndex: 'rate', key: 'rate'},
                {title: 'count', dataIndex: 'count', key: 'count'},
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
        }

        moment.locale('en');

        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Rates</Breadcrumb.Item>
                </Breadcrumb>

                <div style={{ padding: 24, background: '#fff' }}>
                    <div className="table-deals">
                        <div className="table-search">
                            <MonthPicker onChange={ this.handleMonthPickerChange } defaultValue={ defaultPickerMonth }
                                         placeholder="Select month"/>
                        </div>
                        <div className="table-operations">

                            <Button onClick={this.clearSorters}>Clear sorters</Button>
                        </div>
                    </div>

                    <Table
                        className="ant-table-expanded-nested"
                        locale={{ emptyText: 'List is empty' }}
                        dataSource={ dataSource }
                        columns={ columns }
                        expandedRowRender={ expandedRowRender }
                        onChange={ this.handleChange }/>
                </div>
            </div>
        );
    }
}

export default Rates;

