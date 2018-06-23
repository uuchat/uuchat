import React, { Component } from 'react';
import { Table } from 'antd';
import { emptyTableLocale } from '../common/constants';
import FAQSubTable from './faqSubTable';
import ActionDropDown from '../common/actionDropDown';
import { unEscapeHTML } from '../common/utils';

export default class FAQExpandedTable extends Component {

    render() {
        let { dataSource, loading, onChange, onIssueChange, handleMenuClick } = this.props;

        const renderAction = (value) => {
            return (
                <ActionDropDown
                    onMenuClick={e => handleMenuClick(e, value)}
                    menuOptions={[
                        {key: '1', name: 'Edit' },
                        {key: '2', name: 'Delete' }
                    ]}
                    />
            );
        };

        const columns = [
            {
                title: 'Collection', dataIndex: 'name', key: 'name', render: unEscapeHTML, width: '35%'
            },
            {
                title: 'Count', dataIndex: 'count', key: 'count', width: '33%'
            },
            {
                title: 'Action', dataIndex: '', key: 'uuid', render: renderAction
            }];

        const expandedRowRender = (record) => (<FAQSubTable record={record} onIssueChange={onIssueChange}/>);

        return (
            <Table
                className="ant-table-expanded-nested"
                locale={ emptyTableLocale }
                expandedRowRender={ expandedRowRender }
                dataSource={ dataSource }
                columns={ columns }
                loading={ loading }
                onChange={ onChange }
                />
        );
    }
}