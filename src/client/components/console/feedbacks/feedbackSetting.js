import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, Checkbox, Button, Row, Col, Input, Radio } from 'antd';
import { fetchAsync } from '../common/utils';
import Tips from '../../common/tips';

const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

const classid = 'network';

var properties = [];

export default class FeedbackSetting extends Component {

    state = {
        classid: '',
        checkBoxOptions: [],
        checkedList: [],
        indeterminate: false,
        checkAll: false,
        expand: false,
        itemValue: '',
        radioValue: 0,
        pageUrl: ''
    };

    getFeedbackData = async (e) => {
        try {
            let listUrl = '/feedbackmetas';

            let data = await fetchAsync(listUrl);

            if (data.code !== 200) return Tips.error(data.msg, 4);

            var st = {classid: data.msg.classid};

            if (data.msg.properties && data.msg.properties.length) {
                properties = data.msg.properties;

                var flag;

                properties.forEach(function (item, index) {
                    if (item.desc === 'Others') {
                        flag = index;
                    }
                });

                if (flag) {
                    var Others = properties[flag];
                    properties.splice(flag, 1);
                    properties.push(Others);
                }
            }

            st.checkBoxOptions = properties.map(function (item) {
                return item.desc;
            });

            this.setState(st);

        } catch (e) {
            Tips.error(e.msg, 4);
        }
    };

    componentDidMount() {
        this.getFeedbackData();
    }

    handleCreatePage = async (e) => {
        try {
            // send back checkedList
            this.setState({expand: false});

            let { checkedList } = this.state;

            if (!checkedList.length) {
                return Tips.error("Please select options");
            }

            var checkedProperties = properties.filter(function (item) {
                return checkedList.indexOf(item.desc) > -1;
            });

            let createPageUrl = '/feedbackmetas/classes/' + classid + '/page';
            let body = 'checkedProperties=' + JSON.stringify(checkedProperties);

            let data = await fetchAsync(createPageUrl, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body
            });

            if (data.code !== 200) return Tips.error(data.msg, 4);

            this.setState({pageUrl: data.msg.url});

        } catch (e) {
            Tips.error(e.msg, 4);
        }
    };

    handleCreateItem = async (e) => {
        try {
            let { itemValue, radioValue, checkBoxOptions } = this.state;

            let createItemUrl = '/feedbackmetas/classes/' + this.state.classid + '/properties';
            let body = 'desc=' + itemValue;
            body += '&type=' + radioValue;

            if (!itemValue) {
                return Tips.error('Input should not null', 4);
            } else if (checkBoxOptions.indexOf(itemValue) !== -1) {
                return Tips.error('Input already exists', 4);
            }

            let data = await fetchAsync(createItemUrl, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body
            });

            if (data.code !== 200) return Tips.error(data.msg, 4);

            var len = properties.length;

            if (properties[len - 1] && properties[len - 1].desc === 'Others') {
                properties.splice(len - 1, 0, data.msg);
            } else {
                properties.push(data.msg);
            }

            this.setState({
                expand: false,
                checkBoxOptions: properties.map(function (item) {
                    return item.desc;
                }),
                itemValue: '',
                radioValue: 0
            });

        } catch (e) {
            Tips.error(e.msg, 4);
        }
    };

    handleItemChange = (e) => {
        this.setState({itemValue: e.target.value});
    };

    handleRadioChange = (e)=> {
        this.setState({
            radioValue: e.target.value
        });
    };

    onChange = (checkedList) => {
        this.setState({
            checkedList,
            indeterminate: !!checkedList.length && (checkedList.length < this.state.checkBoxOptions.length),
            checkAll: checkedList.length === this.state.checkBoxOptions.length
        });
    };

    onCheckAllChange = (e) => {
        this.setState({
            checkedList: e.target.checked ? this.state.checkBoxOptions : [],
            indeterminate: false,
            checkAll: e.target.checked
        });
    };

    toggle = () => {
        const { expand } = this.state;
        this.setState({expand: !expand});
    };

    getFields = () => {
        const children = [];

        children.push(
            <Col span={8} key={0}>
                <Input value={this.state.itemValue} onChange={this.handleItemChange}
                       placeholder="Input item description"/>
            </Col>
        );

        children.push(
            <Col span={8} key={1}>
                <RadioGroup value={this.state.radioValue} onChange={this.handleRadioChange}>
                    <Radio value={0}>no content</Radio>
                    <Radio value={1}>has content</Radio>
                </RadioGroup>
            </Col>
        );

        children.push(
            <Col span={8} key={ 2 }>
                <Button onClick={this.handleCreateItem} style={{ marginLeft: 8 }}>create</Button>
                <Button onClick={this.toggle} style={{ marginLeft: 8 }}>cancel</Button>
            </Col>
        );

        return children;
    };

    render() {
        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>Feedback Settings</Breadcrumb.Item>
                </Breadcrumb>

                <div className="content-body">
                    <div className="table-deals">
                        <div className="table-search">
                        </div>
                        <div className="table-operations">
                            <Button>
                                <Link to={{pathname: '/feedbacks'}}>Feedbacks</Link>
                            </Button>
                        </div>
                    </div>
                    <div>
                        <div>
                            <div style={{ borderBottom: '1px solid #E9E9E9', paddingBottom: '4px' }}>
                                <Checkbox
                                    indeterminate={this.state.indeterminate}
                                    onChange={this.onCheckAllChange}
                                    checked={this.state.checkAll}
                                    style={{ fontWeight: 'bold' }}
                                    >
                                    {this.state.classid}
                                </Checkbox>
                            </div>
                            <br />
                            <CheckboxGroup
                                options={this.state.checkBoxOptions}
                                value={this.state.checkedList}
                                onChange={this.onChange}/>
                        </div>
                        <br/>
                        <Button type="default" shape="circle"
                                icon={this.state.expand ? 'minus' : 'plus'}
                                size="small" onClick={this.toggle}/>
                        <br/>
                        <Row gutter={40} style={{ marginTop: 8, display: this.state.expand?'block':'none' }}>
                            {this.getFields()}</Row>
                        <br/>
                        <Button onClick={this.handleCreatePage}>create page</Button>
                    </div>
                    <div className="table-operations" style={{ display: this.state.pageUrl?'block':'none' }}>
                        <br/>

                        <p>
                            Success create feedback static page, link is:&nbsp;
                            <a target="_blank" href={this.state.pageUrl}>{classid}</a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}