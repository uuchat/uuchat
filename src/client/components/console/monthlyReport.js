import React, { PureComponent } from 'react';
import { Progress, Col, Row } from 'antd';

export default class MonthlyReport extends PureComponent {

    static defaultProps = {
        chats: 0,
        offlineMessages: 0,
        messages: 0,
        rates: 0,
        favorablePercent: 0,
        criticalPercent: 0
    };

    render() {
        let { chats, offlineMessages, messages, rates, favorablePercent, criticalPercent } = this.props;
        let offlinePercent = chats ? Math.round(offlineMessages * 100 / chats) : 0;
        return (
            <div>
                <Row gutter={24}>
                    <Col lg={12} md={24}>
                        <div>
                            <div>
                                <div style={{padding:'10px 0',fontSize:'16px'}}>
                                    <b>Monthly chats:<span style={{margin:'0 10px'}}>{ chats }</span></b>
                                </div>
                            </div>

                            <div>
                                <div style={{padding:'10px 0',fontSize:'16px'}}>
                                    <b>Monthly messages:<span style={{margin:'0 10px'}}>{ messages }</span></b>
                                </div>
                            </div>
                            <div>
                                <div style={{padding:'10px 0',fontSize:'16px'}}><b>offline messages:</b></div>
                                <div style={{padding:'10px 0',fontSize:'16px'}}>
                                    <Progress percent={ offlinePercent }
                                              format={ (percent) => offlineMessages }/>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col lg={12} md={24}>
                        <Col lg={12} md={24}>
                            <div style={{ textAlign:'center' }}>
                                <Progress type="circle" percent={ favorablePercent }/>

                                <div style={{padding:'10px 0'}}>favorable rates</div>
                            </div>
                        </Col>
                        <Col lg={12} md={24}>
                            <div style={{ textAlign:'center' }}>
                                <Progress type="circle" percent={ criticalPercent} />

                                <div style={{padding:'10px 0', color:'#f69899'}}>critical rates</div>
                            </div>
                        </Col>

                        <div style={{ padding:'10px 0',textAlign:'center',fontSize:'16px' }}>
                            <b>Monthly rates: { rates }</b>
                        </div>
                    </Col>
                </Row>

            </div>
        );
    }

}