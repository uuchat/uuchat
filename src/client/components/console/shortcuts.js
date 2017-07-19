import React,{ Component } from 'react';
import { Breadcrumb } from 'antd';

export default class Shortcuts extends Component {

    render() {
        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Operators</Breadcrumb.Item>
                </Breadcrumb>

                <div className="content-body">
                </div>
            </div>
        );
    }
}