import React, { Component } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { Layout, Menu, Icon, message, Button } from 'antd';
import UpgradeNote from './upgradenote/upgradeNote';
import RateList from './ratelist/rateList';
import AsyncComponent from '../common/asyncComponent.js';
import { fetchAsync } from './common/utils';

const Dashboard = AsyncComponent(() => import('./dashboard/dashboard').then(module => module.default));
const Operators = AsyncComponent(() => import('./operators/operators').then(module => module.default));
const Customers = AsyncComponent(() =>import('./customers/customers').then(module => module.default));
const Transcripts = AsyncComponent(() =>import('./transcripts/transcripts').then(module => module.default));
const Rates = AsyncComponent(() =>import('./ratereport/rates').then(module => module.default));
const RateDetails = AsyncComponent(() =>import('./ratereport/rateDetails').then(module => module.default));
const Shortcuts = AsyncComponent(() =>import('./shortcuts/shortcuts').then(module => module.default));
const FeedbackSettings = AsyncComponent(() =>import('./feedback/feedbackSettings').then(module => module.default));

const { Header, Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;

export default class Console extends Component {

    state = {
        collapsed: false,
        mode: 'inline',
        current: "dashboard",
        csid: localStorage['uuchat.csid'] || '',
        name: localStorage['uuchat.name'] || '',
        displayName: localStorage['uuchat.displayName'] || '',
        avatar: localStorage['uuchat.avatar'] || ''
    };

    onCollapse = (collapsed) => {
        this.setState({
            collapsed,
            mode: collapsed ? 'vertical' : 'inline'
        });
    };

    handleClick = (e) => {
        this.setState({
            current: e.key
        });
        window.location.href = "#/" + e.key;
    };

    handleHeaderClick = (e) => {
        switch (e.key) {
            case "logout":
                this.logout();
                break;
            case "whatIsNew":
                window.open('/public/changelog.html');
                break;
            default:
                break;
        }
    };

    logout = async () => {
        try {
            let data = await fetchAsync('/logout', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });

            if (data.code !== 200) return message.error(data.msg, 4);

            return window.location.href = '/console';
        } catch (e) {
            message.error(e.message, 4);
        }
    };

    render() {

        let { collapsed, mode, current, name, avatar } = this.state;

        let userTitle = (<span style={{ fontSize: 12 }}>
            <img className="user-avatar"
                 src={ (avatar !=='null' && avatar) ? '/' + avatar : require('../../static/images/contact.png')}
                 alt="avatar"
                 title="avatar"/>
            { name } &nbsp;
            <Icon style={{color: '#108ee9'}} type="down"/>
        </span>);

        const menuList = [
            {key: 'dashboard', type: 'laptop', text: 'Dashboard'},
            {key: 'operators', type: 'user', text: 'Operators'},
            {key: 'customers', type: 'user', text: 'customers'},
            {key: 'transcripts', type: 'database', text: 'Transcripts'},
            {key: 'rates', type: 'star-o', text: 'Rate Report'},
            {key: 'rateList', type: 'star-o', text: 'Rate List'},
            {key: 'shortcuts', type: 'tags-o', text: 'Shortcuts'}
            //,{key: 'feedbackSettings', type: 'setting', text: 'Feedback Settings'}
        ];

        return (
            <div>
                <UpgradeNote />
                <Layout>
                    <Sider
                        breakpoint="lg"
                        collapsible
                        collapsed={ collapsed }
                        onCollapse={ this.onCollapse }
                        >
                        <div className="logo"/>
                        <Menu
                            theme="dark"
                            onClick={this.handleClick}
                            mode={ mode }
                            defaultOpenKeys={["dashboard"]}
                            selectedKeys={ [current] }
                            >
                            {
                                menuList.map((item, index) =>
                                        <Menu.Item key={item.key}>
                                      <span>
                                        <Icon type={item.type}/>
                                        <span className="nav-text">{item.text}</span>
                                      </span>
                                        </Menu.Item>
                                )
                            }
                        </Menu>
                    </Sider>
                    <Layout>
                        <Header style={{ background: '#fff', padding: 0, height: '47px', lineHeight: '47px' }}>
                            <div style={{ float: 'right' }}>
                                <div style={{ display: 'inline-block' }}>
                                    <Button type="primary" onClick={(e)=> window.location.href='/chat'}>
                                        launch chat
                                    </Button>
                                    <span style={{ borderLeft: '1px solid #a7def1',width: '1px',marginLeft: '20px' }}>
                                    </span>
                                </div>
                                <div className="rightWarpper">
                                    <Menu mode="horizontal" onClick={this.handleHeaderClick}>
                                        <SubMenu title={ userTitle }>
                                            <Menu.Item key="whatIsNew">
                                                <Icon style={{fontSize: 18, color: '#8fc9fb'}} type="bell"/>
                                                What's new
                                            </Menu.Item>
                                            <Menu.Item key="logout">
                                                <Icon style={{fontSize: 18, color: '#d4572f'}} type="poweroff"/>
                                                Sign out
                                            </Menu.Item>
                                        </SubMenu>
                                    </Menu>
                                </div>
                            </div>
                        </Header>
                        <Content style={{ margin: '0 16px' }}>
                            <Router>
                                <div style={{ height: '100%'}}>
                                    <Switch>
                                        <Route exact path="/" component={ Dashboard }/>
                                        <Route exact path="/dashboard" component={ Dashboard }/>
                                        <Route exact path="/operators" component={ Operators }/>
                                        <Route exact path="/customers" component={ Customers }/>
                                        <Route exact path="/transcripts" component={ Transcripts }/>
                                        <Route exact path="/rates" component={ Rates }/>
                                        <Route exact path="/rateList" component={ RateList }/>
                                        <Route exact path="/shortcuts" component={ Shortcuts }/>
                                        <Route exact path="/rates/:csid" component={ RateDetails }/>
                                        <Route exact path="/feedbackSettings" component={ FeedbackSettings }/>
                                    </Switch>
                                </div>
                            </Router>
                        </Content>

                        <Footer style={{ textAlign: 'center' }}>
                            uuchat ©2017 Built with ♥ in shenzhen.
                        </Footer>
                    </Layout>
                </Layout>
            </div>
        );
    }
}