import React, { Component } from 'react';
import { Modal } from 'antd';
import ChatMessageItem from '../message/chatMessageItem';
import String2int from '../common/utils';

const historyChatData = {};

class ChatHistoryLists extends Component{

    constructor(){
        super();
        this.state = {
            historyChatLists: [],
            filterMark: 8,
            cid: 0,
            title: '',
            historyChatVisible: false
        };
    }

    componentDidMount(){
        this.getHistoryChatLists();
    }
    getHistoryChatLists = () => {
        let _self = this;
        fetch('/chathistories/cs/'+this.props.csid+'/latestmonth').then(function(d){
            return d.json();
        }).then(function(d){
            if (d.code === 200) {
                _self.setState({
                    historyChatLists: d.msg
                });
            }
        }).catch(function(e){});
    };
    showHistoryChat = (e) => {
        let t = e.target;
        let cid = '';
        let _li;
        let ulList;

        if (t.tagName.toLowerCase() === 'li') {
            _li = t;
        } else if (t.parentNode && t.parentNode.tagName.toLowerCase() === 'li' ) {
            _li = t.parentNode;
        } else if (t.parentNode.parentNode && t.parentNode.parentNode.tagName.toLowerCase() === 'li') {
            _li = t.parentNode.parentNode;
        }
        cid = _li.getAttribute('data-cid');

        if (historyChatData[cid]) {
            this.renderHistory(cid);
        } else {
            historyChatData[cid] = [];
            this.fetchHistoryChat(cid, this.props.csid);
        }

        ulList = _li.parentNode;
        ulList = ulList.getElementsByTagName('li');

        for (let i = 0, l = ulList.length; i < l; i++) {
            ulList[i].className = '';
        }
        _li.className='active';
    };

    renderHistory = (cid) => {
        this.setState({
            cid: cid,
            historyChatVisible: true,
            title: 'U-'+(cid.substr(0, 6).toUpperCase())+' chat history'
        });
    };

    fetchHistoryChat = (cid, csid) => {
        let _self = this;
        let avatar = _self.props.avatar || require('../../static/images/contact.png') ;

        fetch('/messages/customer/'+cid+'/cs/'+csid)
            .then((data) => data.json())
            .then(d =>{
                let historyChat = [];
                d.msg.map((dd) =>
                    historyChat.push({
                        msgAvatar: (dd.type === 1 || dd.type === 2) ? avatar : '',
                        msgText: dd.msg,
                        msgType: dd.type,
                        msgTime: new Date(dd.createdAt)
                    })
                );

                historyChatData[cid] = historyChat;
                _self.renderHistory(cid);

            })
            .catch(function(e){});
    };

    filterMarked = (e) => {
        if (e.target.tagName.toLowerCase() === 'span') {
            let marked = parseInt(e.target.getAttribute('data-marked'), 10);
            this.setState({
                filterMark: marked
            });
        }
    };

    closeHistoryChat = () => {
        this.setState({
            historyChatVisible: false
        });
    };

    render(){

        let {cid, historyChatLists, filterMark, title, historyChatVisible} = this.state;
        let chatArr = [];
        let markArr = ['grey', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];
        let titleColorIndex = String2int(cid);

        for (let i = 0, l = historyChatLists.length; i < l; i++) {

            let chat = historyChatLists[i];

            if ((filterMark !== 8) && filterMark !== chat.marked) {
                continue;
            }

            chatArr.push(
                <li key={i} data-cid={historyChatLists[i].cid}>
                    <div className="chat-avatar fl">
                        <span className={"avatar-icon avatar-icon-"+String2int(chat.cid)} >{chat.cid.substr(0,1).toUpperCase()}</span>
                    </div>
                    <div className="chat-list-name fr">
                        <h2 className="text-overflow">U-{chat.cid.substr(0, 6).toUpperCase()}</h2>
                        <span className={"marked-tag marked-"+chat.marked}></span>
                    </div>
                </li>
            );
        }

        return (
            <div className="contact-list">
                <div className="mark-filter mark-color-list" onClick={this.filterMarked}>Filter :&nbsp;&nbsp;<span data-marked="8" className="mark-tag mark-tag-all">All</span>
                    {markArr.map((m ,i)=>
                        <span key={i} data-marked={i} className={"mark-tag tag-"+m+(filterMark === i ? "  selected" : "")} title={"mark "+m}>{i}</span>
                    )}
                </div>
                <Modal
                    title={title}
                    visible={historyChatVisible}
                    footer={null}
                    onCancel={this.closeHistoryChat}
                    className={"history-header history-header-"+titleColorIndex}
                    wrapClassName="historyMessage"
                >
                    <div className="message-lists chat-lists-history">
                        {historyChatData[cid] && historyChatData[cid].map((chat)=>
                            <ChatMessageItem
                                key={chat.msgTime}
                                ownerType={chat.msgType}
                                ownerAvatar={chat.msgAvatar}
                                ownerText={chat.msgText}
                                time={chat.msgTime}
                                cid={cid}
                            />
                        )}
                    </div>
                </Modal>
                <ul className="customer-lists" onClick={this.showHistoryChat}>
                    {chatArr}
                </ul>
            </div>
        );

    }
}

export default ChatHistoryLists;