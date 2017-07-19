import React, { Component } from 'react';
import { Spin } from 'antd';
import LimitedInfiniteScroll from './scroller';
import { formatDate } from './utils';

export default class ScrollTable extends Component {

    render() {
        const pageLimit = 10, pageStart = 1;

        const { data:{total, list}, initPage, loadNextFunc, renderCustomer } = this.props;

        let hasMore = total === undefined || list.length < total;

        const items = list.map((item, index) => {
            return (
                <tr key={index}>
                    <td>{renderCustomer(item.cid, item)}</td>
                    <td>{item.csName}</td>
                    <td>{item.csEmail}</td>
                    <td>{formatDate(item.updatedAt)}</td>
                </tr>
            );
        });

        return (
            <div className="ant-table">
                <div className="ant-table-content">
                    <div className="ant-table-body">
                        <table>
                            <thead className='ant-table-thead'>
                            <tr>
                                <th>customer</th>
                                <th>name</th>
                                <th>email</th>
                                <th>lastest connect time</th>
                            </tr>
                            </thead>
                            <LimitedInfiniteScroll
                                initPage={ initPage }
                                pageLimit={ pageLimit }
                                pageStart={ pageStart }
                                hasMore={ hasMore }
                                colSpan={ 4 }
                                spinLoader={<div className='scroll-loader'><Spin /></div>}
                                mannualLoader={<div className='scroll-loader'><a>Load More</a></div>}
                                noMore={<div className='scroll-loader'>No More Items</div>}
                                loadNext={loadNextFunc}>
                                {items}
                            </LimitedInfiniteScroll>
                        </table>
                    </div>
                    <div className="ant-table-footer">
                        <div id="tableFooter" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div></div>
                            <div>total: {items.length} items</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}