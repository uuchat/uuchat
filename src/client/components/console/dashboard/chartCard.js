import React, { Component } from 'react';
import { Col, Row, Card, Tabs, Select } from 'antd';
import Bar from './bar';
import styles from './style.css';

const TabPane = Tabs.TabPane;
const Option = Select.Option;

export default class ChartCard extends Component {

    handleSelectChange = (key, value) => {
        this.props.handleChange(key, value);
    };

    render() {
        let { chatData, rateData, agentData } = this.props;

        const transChatData = chatData;

        const transRateData = rateData;

        const salesExtra = (
            <div className={styles.salesExtraWrap}>
                <div className={styles.salesExtra}>
                    <Select
                        showSearch
                        style={{ width: 200 }}
                        placeholder="Select Agent"
                        allowClear={ true }
                        optionFilterProp="children"
                        onChange={ this.handleSelectChange.bind(null, 'csid') }
                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                        {agentData.map(d => <Option key={d.csid}>{d.email}</Option>)}
                    </Select>
                </div>
            </div>
        );

        return (
            <Card bordered={false} bodyStyle={{ padding: 10 }}>
                <div className={styles.salesCard}>
                    <Tabs type="card" tabBarExtraContent={salesExtra} tabBarStyle={{ marginBottom: 24 }}>
                        <TabPane tab="Chat Count" key="chatCount">
                            <Row>
                                <Col>
                                    <div className={styles.salesBar}>
                                        <Bar height={500} title="" data={transChatData}/>
                                    </div>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tab="Chat Rate" key="chatRate">
                            <Row>
                                <Col>
                                    <div className={styles.salesBar}>
                                        <Bar height={500} title="" data={transRateData}/>
                                    </div>
                                </Col>
                            </Row>
                        </TabPane>
                    </Tabs>
                </div>
            </Card>
        );
    }
}