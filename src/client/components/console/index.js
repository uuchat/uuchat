import React, { Component } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { Layout, Menu, Icon } from 'antd';
import UpgradeNote from './upgradenote/upgradeNote';
import RateList from './ratelist/rateList';
import AsyncComponent from '../common/asyncComponent';
import { fetchAsync, getHashPath } from './common/utils';
import Tips from '../common/tips';

const Dashboard = AsyncComponent(() => import ('./dashboard/dashboard').then(module => module.default));
const Operators = AsyncComponent(() => import ('./operators/operators').then(module => module.default));
const Customers = AsyncComponent(() => import ('./customers/customers').then(module => module.default));
const Transcripts = AsyncComponent(() => import ('./transcripts/transcripts').then(module => module.default));
const Rates = AsyncComponent(() => import ('./ratereport/rates').then(module => module.default));
const RateDetails = AsyncComponent(() => import ('./ratereport/rateDetails').then(module => module.default));
const Shortcuts = AsyncComponent(() => import ('./shortcuts/shortcuts').then(module => module.default));
const Feedbacks = AsyncComponent(() => import ('./feedbacks/feedbacks').then(module => module.default));
const FeedbackSetting = AsyncComponent(() => import ('./feedbacks/feedbackSetting').then(module => module.default));
const FAQ = AsyncComponent(() => import ('./faqs').then(module => module.default));

const { Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;

export default class Console extends Component {

    state = {
        collapsed: true,
        mode: 'inline',
        current: "dashboard",
        csid: localStorage['uuchat.csid'] || '',
        avatar: localStorage['uuchat.avatar'] || ''
    };

    handleClick = (e) => {
        this.setState({ current: e.key });

        window.location.href = "#/" + e.key;
    };

    handleHeaderClick = (e) => {
        switch (e.key) {
            case "chat":
                window.location.href = '/chat';
                break;
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

            if (data.code !== 200) return Tips.error(data.msg, 4);

            return window.location.href = '/console';
        } catch (e) {
            Tips.error(e.message, 4);
        }
    };

    componentDidMount() {
        let current = getHashPath();
        current = current.charAt(0) === "/" ? current.substr(1) : current;
        if (current) this.setState({current: current});
    }

    render() {

        let { collapsed, mode, current, avatar } = this.state;

        let userTitle = (<span style={{ fontSize: 12 }}>
            <img className="user-avatar"
                 src={ (avatar !=='null' && avatar) ? '/' + avatar : require('../../static/images/contact.png')}
                 alt="avatar"
                 title="avatar"/>
        </span>);

        const routeList = [
            {path: "/", component: Dashboard},
            {path: "/dashboard", component: Dashboard},
            {path: "/operators", component: Operators},
            {path: "/customers", component: Customers},
            {path: "/transcripts", component: Transcripts},
            {path: "/rates", component: Rates},
            {path: "/rateList", component: RateList},
            {path: "/shortcuts", component: Shortcuts},
            {path: "/rates/:csid", component: RateDetails},
            {path: "/feedbacks", component: Feedbacks},
            {path: "/feedbackSetting", component: FeedbackSetting},
            {path: "/faqs", component: FAQ}
        ];

        return (
            <div>
                <UpgradeNote />
                <Layout style={{ minHeight: '100vh' }}>
                    <Sider
                        breakpoint="lg"
                        collapsible
                        collapsed={collapsed}
                        trigger={null}
                        >
                        <div className="logo">
                            <a href="#/">
                                <img src="/static/img/uuchat_logo.svg" alt="logo"></img>
                            </a>
                        </div>
                        <Menu
                            theme="dark"
                            onClick={this.handleClick}
                            mode={ mode }
                            defaultOpenKeys={["dashboard"]}
                            selectedKeys={[current]}
                            >
                                <SubMenu key="boardParent" title={<span><Icon type="laptop" /><span>Data</span></span>}>
                                    <Menu.Item key='dashboard'><span><span className="nav-text">Dashboard</span></span></Menu.Item>
                                </SubMenu>
                                <SubMenu key="data" title={<span><Icon type="database" /><span>Data</span></span>}>
                                    <Menu.Item key='customers'><span><Icon type='user'/><span className="nav-text">Customers</span></span></Menu.Item>
                                    <Menu.Item key='transcripts'><span><Icon type='message'/><span className="nav-text">Transcripts</span></span></Menu.Item>
                                    <Menu.Item key='rates'><span><Icon type='star-o'/><span className="nav-text">Rate Report</span></span></Menu.Item>
                                </SubMenu>
                                <SubMenu key="setting" title={<span><Icon type="setting" /><span>Setting</span></span>}>
                                    <Menu.Item key='operators'><span><Icon type='team'/><span className="nav-text">Agents</span></span></Menu.Item>
                                    <Menu.Item key='faqs'><span><Icon type='question-circle-o'/><span className="nav-text">FAQ</span></span></Menu.Item>
                                    <Menu.Item key='shortcuts'><span><Icon type='tags-o'/><span className="nav-text">Shortcuts</span></span></Menu.Item>
                                </SubMenu>
                                <SubMenu key="feedbacksParent" title={<span><Icon type="form" /><span>Setting</span></span>}>
                                    <Menu.Item key='feedbacks'><span><span className="nav-text">Feedbacks</span></span></Menu.Item>
                                </SubMenu>
                        </Menu>
                        <div className="switchtheme" id="sessionMenu">
                            <Menu
                                theme="dark"
                                mode={ mode }
                                getPopupContainer={() => document.getElementById('sessionMenu')}
                                onClick={this.handleHeaderClick}>
                                <SubMenu key="chatParent" title={(<Icon type=''><img style={{ height: '30px', width: '30px', marginLeft: '-8px' }} src={require('../../static/images/chat_pure.png')} alt=""/></Icon>) } >
                                    <Menu.Item key='chat'>
                                            Launch chat
                                    </Menu.Item>
                                </SubMenu>
                                <SubMenu key="userParent" title={ userTitle } >
                                    <Menu.Item key="whatIsNew"> <Icon style={{fontSize: 18, color: '#8fc9fb'}} type="bell"/> What's new </Menu.Item>
                                    <Menu.Item key="logout"> <Icon style={{fontSize: 18, color: '#d4572f'}} type="poweroff"/> Sign out </Menu.Item>
                                </SubMenu>
                            </Menu>
                        </div>
                    </Sider>
                    <Layout>
                        <Content style={{ margin: '0 16px' }}>
                            <Router>
                                <div style={{ height: '100%'}}>
                                    <Switch>
                                        {
                                            routeList.map((item, index)=> <Route exact path={ item.path } component={ item.component }/>)
                                        }
                                    </Switch>
                                </div>
                            </Router>
                        </Content>

                        <Footer style={{ textAlign: 'center' }}>
                            uuchat ©2018 Built with ♥ in shenzhen.
                        </Footer>
                    </Layout>
                </Layout>
            </div>
        );
    }
}