import React, { Component } from 'react';
import { Input, Tabs } from 'antd';
import Chat from './chat';
import ChatIcon from './chatMenuIcon';
import ChatHistoryLists from './chatHistoryLists';
import ChatSetting from './chatSetting';

const TabPane = Tabs.TabPane;

class ChatMenu extends Component{

    constructor() {
        super();
        this.state = {
            menuIcons: {
                chat: 'chat_selected',
                contact: 'contact',
                setting: 'setting'
            }
        };
    }

    menuIconClick = (index) => {
        this.setState({
            menuIcons: {
                chat: (index === "1" ? 'chat_selected' : 'chat'),
                contact: (index === "2" ? 'contact_selected' : 'contact'),
                setting: (index === "3" ? 'setting_selected' : 'setting')
            }
        });
    };

    onSearchHandler = (value) => {
        if (value === '') {
            return false;
        }
        document.querySelector('#search-form').submit();
    };

    chatListHide = () => {
        document.querySelector('.customerSuccess-left').className='customerSuccess-left';
    };

    avatarHandle = (avatar) => {
        this.props.customerSuccess.setState({
            avatar: avatar
        });
    };

    render() {

        let {menuIcons} = this.state;
        let {avatar, name, csid, chatLists, chatActive} = this.props.customerSuccess.state;
        let {closeChat, toggleChat} = this.props.customerSuccess;
        let chatListArr = [];

       for (let key in chatLists) {
           let options = {
               cid: chatLists[key].cid,
               name: chatLists[key].name,
               newMsg: chatLists[key].messageLists,
               isActive: chatLists[key].cid === chatActive.cid,
               num: chatLists[key].notifies,
               closeChat: closeChat,
               toggleChat: toggleChat
           };
           chatListArr.push(<Chat key={chatLists[key].cid} options={options} />);
       }

        return (
            <div className="customerSuccess-left" onClick={this.chatListHide}>
                <div className="left-menu">
                    <form method="get" action="/search" target="_blank" id="search-form">
                        <Input.Search
                            placeholder="Type text and press Enter"
                            onSearch={this.onSearchHandler}
                            name="search"
                        />
                    </form>
                </div>
                <Tabs defaultActiveKey="1" onTabClick={this.menuIconClick}>
                    <TabPane tab={<ChatIcon name={menuIcons.chat} />} key="1">
                        <ul className="customer-lists">
                            {chatListArr.reverse()}
                        </ul>
                    </TabPane>
                    <TabPane tab={<ChatIcon name={menuIcons.contact} />} key="2">
                        <ChatHistoryLists csid={csid} avatar={avatar} />
                    </TabPane>
                    <TabPane tab={<ChatIcon name={menuIcons.setting} />} key="3">
                        <ChatSetting name={name} csid={csid} avatarHandle={this.avatarHandle} customerSuccess={this.props.customerSuccess} />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default ChatMenu;

