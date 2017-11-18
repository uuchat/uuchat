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

    onSearchHandler = (e) => {
        if (e.target.value === '') {
            e.preventDefault();
            return false;
        }
    };

    chatListHide = () => {
        document.querySelector('.customerSuccess-left').className='customerSuccess-left';
    };

    avatarHandle = (avatar) => {
        this.props.customerSuccess.setState({
            csAvatar: avatar
        });
    };

    render() {

        let {menuIcons} = this.state,
            {customerLists, customerSelect, chatNotify, messageLists, csAvatar, csName, csid} = this.props.customerSuccess.state,
            {closeDialog, onChatListClick} = this.props.customerSuccess,
            chatLists = [];

        if (customerLists.length > 0) {
            customerLists.forEach((chat, index)=>{
                if (chat.cid !== '') {

                    let {msg, cid, name, type, marked} = chat,
                        num = chatNotify[cid] || 0 ,
                        isActive = (customerSelect.cid === cid),
                        options = {};

                    if (type && type === 'offline') {
                        options = {
                            cid: cid,
                            name: name,
                            email: msg,
                            type: type,
                            closeDialog: closeDialog
                        };
                    } else {
                        options = {
                            cid: cid,
                            name: name,
                            newMsg: messageLists[cid],
                            isActive: isActive,
                            num: num,
                            marked: marked,
                            closeDialog: closeDialog,
                            onChatListClick: onChatListClick
                        };
                    }
                    chatLists.push(<Chat key={index} options={options} />);
                }
            });
        }

        return (
            <div className="customerSuccess-left" onClick={this.chatListHide}>
                <div className="left-menu">
                    <form method="get" action="/search" target="_blank" className="">
                        <Input.Search
                            placeholder="Type text and enter"
                            onPressEnter={this.onSearchHandler}
                            name="search"
                        />
                    </form>
                </div>
                <Tabs defaultActiveKey="1" onTabClick={this.menuIconClick}>
                    <TabPane tab={<ChatIcon name={menuIcons.chat} />} key="1">
                        <ul className="customer-lists">
                            {chatLists}
                        </ul>
                    </TabPane>
                    <TabPane tab={<ChatIcon name={menuIcons.contact} />} key="2">
                        <ChatHistoryLists csid={csid} csAvatar={csAvatar} />
                    </TabPane>
                    <TabPane tab={<ChatIcon name={menuIcons.setting} />} key="3">
                        <ChatSetting name={csName} csid={csid} avatarHandle={this.avatarHandle} customerSuccess={this.props.customerSuccess} />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default ChatMenu;

