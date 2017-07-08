import React, {Component} from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import { Layout, Menu, Icon, message, Button } from 'antd';

import UpgradeNote from './upgradeNote';
import Dashboard from './dashboard';
//import Operators from './operators';
//import Transcripts from './transcripts';
import Rates from './rates';
//import RateList from './rateList';
//import RateDetails from './rateDetails';

import AsyncComponent from '../../views/asyncComponent.js';

/*const Dashboard = AsyncComponent(() => import('./dashboard')
    .then(module => module.default), { name: 'dashboard' });*/

const Operators = AsyncComponent(() => import('./operators')
    .then(module => module.default), { name: 'operators' });

const Transcripts = AsyncComponent(() => import('./transcripts')
    .then(module => module.default), { name: 'transcripts' });

/*const Rates = AsyncComponent(() => import('./rates')
    .then(Rates => module.default), { name: 'rates' });*/

const RateList = AsyncComponent(() => import('./rateList')
    .then(module => module.default), { name: 'rateList' });

const RateDetails = AsyncComponent(() => import('./rateDetails')
    .then(module => module.default), { name: 'rateDetails' });

const { Header, Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;

class Console extends Component {
    state = {
        collapsed: false,
        mode: 'inline',
        current: "dashboard",
        csid: localStorage['uuchat.csid'] || '',
        name: localStorage['uuchat.name'] || '',
        displayName: localStorage['uuchat.displayName'] || '',
        avatar: localStorage['uuchat.avatar'] || '',
    };

    onCollapse = (collapsed) => {
        this.setState({
            collapsed,
            mode: collapsed ? 'vertical' : 'inline',
        });
    };

    handleClick = (e) => {
        this.setState({
            current: e.key,
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

    logout() {
        fetch('/logout', {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
            .then((res)=>res.json())
            .then(function (d) {
                if (200 === d.code) {
                    window.location.href = '/console';
                }
            })
            .catch(function (e) {
                message.error(e.message, 4);
            });
    }

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
                            <Menu.Item key="dashboard">
                              <span>
                                <Icon type="laptop"/>
                                <span className="nav-text">Dashboard</span>
                              </span>
                            </Menu.Item>
                            <Menu.Item key="operators">
                              <span>
                                <Icon type="user"/>
                                <span className="nav-text">Operators</span>
                              </span>
                            </Menu.Item>
                            <Menu.Item key="transcripts">
                              <span>
                                <Icon type="database"/>
                                <span className="nav-text">Transcripts</span>
                              </span>
                            </Menu.Item>
                            <Menu.Item key="rates">
                              <span>
                                <Icon type="star-o"/>
                                <span className="nav-text">Rate Report</span>
                              </span>
                            </Menu.Item>
                            <Menu.Item key="rateList">
                              <span>
                                <Icon type="star-o"/>
                                <span className="nav-text">Rate List</span>
                              </span>
                            </Menu.Item>
                        </Menu>
                    </Sider>
                    <Layout>
                        <Header style={{ background: '#fff', padding: 0, height: '47px', lineHeight: '47px' }}>
                            <div style={{ float:'right' }}>
                                <div style={{ display:'inline-block' }}>
                                    <Button type="primary" onClick={(e)=> window.location.href='/chat'}>
                                        launch chat
                                    </Button>
                                    <span style={{ borderLeft:'1px solid #a7def1',width:'1px',marginLeft:'20px' }}>
                                    </span>
                                </div>
                                <div className="rightWarpper">
                                    <Menu mode="horizontal" onClick={this.handleHeaderClick}>
                                        <SubMenu title={ userTitle }>
                                            <Menu.Item key="whatIsNew">
                                                <Icon style={{fontSize:18, color: '#8fc9fb'}} type="bell"/>
                                                What's new
                                            </Menu.Item>
                                            <Menu.Item key="logout">
                                                <Icon style={{fontSize:18, color: '#d4572f'}} type="poweroff"/>
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
                                        <Route exact path="/transcripts" component={ Transcripts }/>
                                        <Route exact path="/rates" component={ Rates }/>
                                        <Route exact path="/rateList" component={ RateList }/>
                                        <Route exact path="/rates/:csid" component={ RateDetails }/>
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

export default Console;