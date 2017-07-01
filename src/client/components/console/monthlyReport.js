/**
 * Created by jianzhiqiang on 2017/6/30.
 */
import React,{Component} from 'react';
import { Progress,Col, Row } from 'antd';

class MonthlyReport extends Component {

    render() {
        let { monthlyData } = this.props;
        let baseMonthlyData = {
            chats: 0,
            offlineMessages: 0,
            messages: 0,
            rates: 0,
            favorablePercent: 0,
            criticalPercent: 0
        };
        monthlyData = Object.assign(baseMonthlyData, monthlyData);
        monthlyData.offlinePercent = monthlyData.chats ? Math.round(monthlyData.offlineMessages * 100 / monthlyData.chats) : 0;
        return (
            <div>
                <Row gutter={24}>
                    <Col lg={12} md={24}>
                        <div>
                            <div>
                                <div style={{padding:'10px 0',fontSize:'16px'}}>
                                    <b>Monthly chats:<span style={{margin:'0 10px'}}>{ monthlyData.chats }</span></b>
                                </div>
                            </div>

                            <div>
                                <div style={{padding:'10px 0',fontSize:'16px'}}>
                                    <b>Monthly messages:<span style={{margin:'0 10px'}}>{ monthlyData.messages }</span></b>
                                </div>
                            </div>
                            <div>
                                <div style={{padding:'10px 0',fontSize:'16px'}}><b>offline messages:</b></div>
                                <div style={{padding:'10px 0',fontSize:'16px'}}>
                                    <Progress percent={ monthlyData.offlinePercent }
                                              format={ (percent) => monthlyData.offlineMessages }/>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col lg={12} md={24}>
                        <Col lg={12} md={24}>
                            <div style={{ textAlign:'center' }}>
                                <Progress type="circle" percent={monthlyData.favorablePercent}/>

                                <div style={{padding:'10px 0'}}>favorable rates</div>
                            </div>
                        </Col>
                        <Col lg={12} md={24}>
                            <div style={{ textAlign:'center' }}>
                                <Progress type="circle" percent={monthlyData.criticalPercent}/>

                                <div style={{padding:'10px 0', color:'#f69899'}}>critical rates</div>
                            </div>
                        </Col>

                        <div style={{ padding:'10px 0',textAlign:'center',fontSize:'16px' }}>
                            <b>Monthly rates: { monthlyData.rates }</b>
                        </div>
                    </Col>
                </Row>

            </div>
        );
    }

}

export default MonthlyReport;