import React, {Component} from 'react';
import ChatMessageItem from '../message/chatMessageItem';
import String2int from '../common/utils';

class ChatHistory extends Component{

    constructor() {
        super();
        this.state = {
            cid: '',
            historyChatLists: {}
        };
    }

    componentDidMount() {
        let {cid, chatsArr} = this.props.historyChat;
        let historyChatLists = {};

        historyChatLists[cid] = {
            isLoading: false,
            hasMoreChat: false,
            pageNum: 2,
            chatsArr: chatsArr || []
        };

        if (cid) {
            this.setState({
                cid: cid,
                historyChatLists: historyChatLists
            });
        }

    }

    componentWillUpdate(nextProps, nextState) {

        let {cid, chatsArr} = nextProps.historyChat;
        let {historyChatLists} = this.state;

        if (cid === this.state.cid) {
            return false;
        }

        let chat = {
            isLoading: false,
            hasMoreChat: true,
            pageNum: 2,
            chatsArr: chatsArr
        };

        historyChatLists[cid] = chat;

        if (chatsArr) {
            if ((chatsArr.length % 10) > 0) {
                chat.hasMoreChat = false;
            }
            chat.pageNum = Math.ceil(chatsArr.length / 10) + 1;
        }

        this.setState({
            cid: cid,
            historyChatLists: historyChatLists
        });

    }
    loadMoreHistoryChats = (e) => {
        let msgList = this.refs.lists;
        let {cid, historyChatLists} = this.state;
        let {csid} = this.props;
        let _self = this;
        let avatar = localStorage.getItem('uuchat.avatar') || '../../static/images/contact.png';

        if (e.deltaY < 0 && (msgList.scrollTop <= 0) && cid && historyChatLists[cid].hasMoreChat && !historyChatLists[cid].isLoading) {
            msgList.className += ' loading';
            historyChatLists[cid].isLoading = true;
            requestAnimationFrame(function () {
                fetchHistoryChat();
            });
        }
        function fetchHistoryChat() {
            fetch('/messages/customer/' + cid + '/cs/' + csid+'?pageNum='+historyChatLists[cid].pageNum+'&pageSize=10')
            .then((data) => data.json())
            .then(d =>{
                if (d.code === 200) {
                    if (d.msg.length < 10) {
                        historyChatLists[cid].hasMoreChat = false;
                    }
                    historyChatLists[cid].pageNum++;
                    historyChatLists[cid].isLoading = false;

                    if (d.msg.length > 0) {
                        d.msg.reverse().map(chat => historyChatLists[cid].chatsArr.unshift({
                            msgAvatar: (chat.type === 1 || chat.type === 2) ? avatar : '',
                            msgText: chat.msg,
                            msgType: chat.type,
                            msgTime: chat.createdAt
                        }));
                    }

                    _self.setState({
                        historyChatLists: historyChatLists
                    });
                }
                msgList.className = 'message-lists';
            })
            .catch(e => {
                msgList.className = 'message-lists';
                historyChatLists[cid].isLoading = false;
                _self.setState({
                    historyChatLists: historyChatLists
                });
            });
        }
    };

    render() {
        let {cid, historyChatLists} = this.state;
        let chat = historyChatLists[cid];
        let headerBgColor = '';
        let name = '';

        if (cid) {
            headerBgColor = String2int(cid) + ' colorful';
            name = cid.substr(0, 6).toUpperCase();
        }

        return (
            <div className="chat-history">
                <div className={"chat-history-header history-header-" + headerBgColor}>{name && 'U-'+name} History Chat</div>
                <div className="message-lists" onWheel={this.loadMoreHistoryChats} ref="lists">
                    {chat && chat.chatsArr.map((chat, index)=>
                        <ChatMessageItem
                            key={index}
                            ownerType={chat.msgType}
                            ownerAvatar={chat.msgAvatar}
                            ownerText={chat.msgText}
                            time={chat.msgTime}
                            cid={cid}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default ChatHistory;