import React, { Component } from 'react';
import { Modal } from 'antd';
import ChatMessageItem from '../message/chatMessageItem';
import String2int from '../common/utils';

const chatHistory = {};

class ChatHistoryLists extends Component{

    constructor(){
        super();
        this.state = {
            hasList: false,
            chatLists: [],
            filterMark: 8,
            hisCid: 0,
            hisTitle: '',
            isHisVis: false
        };
    }

    componentDidMount(){
        this.getList();
    }
    getList = () => {
        let _self = this;
        fetch('/chathistories/cs/'+this.props.csid+'/latestmonth').then(function(d){
            return d.json();
        }).then(function(d){
            if (d.code === 200) {
                _self.setState({
                    hasList: true,
                    chatLists: d.msg
                });
            }
        }).catch(function(e){});
    };
    showHistory = (e) => {
        let t = e.target,
            cid = '',
            _li,
            ulList;

        if (t.tagName.toLowerCase() === 'li') {
            _li = t;
        } else if (t.parentNode && t.parentNode.tagName.toLowerCase() === 'li' ) {
            _li = t.parentNode;
        } else if (t.parentNode.parentNode && t.parentNode.parentNode.tagName.toLowerCase() === 'li') {
            _li = t.parentNode.parentNode;
        }
        cid = _li.getAttribute('data-cid');

        if (chatHistory[cid]) {
            this.renderHistroy(cid);
        } else {
            chatHistory[cid] = [];
            this.fetchHistory(cid, this.props.csid);
        }

        ulList = _li.parentNode;
        ulList = ulList.getElementsByTagName('li');

        for (let i = 0, l = ulList.length; i < l; i++) {
            ulList[i].className = '';
        }
        _li.className='active';
    };

    renderHistroy = (cid) => {
        this.setState({
            hisCid: cid,
            isHisVis: true,
            hisTitle: 'U-'+(cid.substr(0, 6).toUpperCase())+' chats history'
        });
    };

    fetchHistory = (cid, csid) => {
        let _self = this,
            csAvatar = _self.props.csAvatar || require('../../static/images/contact.png') ;

        fetch('/messages/customer/'+cid+'/cs/'+csid)
            .then((data) => data.json())
            .then(d =>{
                let historyMessage = [];
                d.msg.map((dd) =>
                     historyMessage.push({
                        msgAvatar: (dd.type === 1) ? csAvatar : '',
                        msgText: dd.msg,
                        msgType: dd.type,
                        msgTime: new Date(dd.createdAt)
                    })
                );

                chatHistory[cid] = historyMessage;
                _self.renderHistroy(cid);

            })
            .catch(function(e){});
    };

    filterMarked = (e) => {
        if (e.target.tagName.toLowerCase() === 'span') {
            let marked = parseInt(e.target.getAttribute('data-marked'), 10) === 7 ? 0 : parseInt(e.target.getAttribute('data-marked'), 10);
            this.setState({
                filterMark: marked
            });
        }
    };

    historyClose = () => {
        this.setState({
            isHisVis: false
        });
    };

    render(){

        let {hisCid, chatLists, filterMark, hisTitle, isHisVis} = this.state,
            chatArr = [],
            markArr = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'grey'],
            chatHistoryData = chatHistory[hisCid],
            historyColorIndex = String2int(hisCid);

        for (let i = 0, l = chatLists.length; i < l; i++) {

            if ((filterMark !== 8) && filterMark !== chatLists[i].marked) {
                continue;
            }

            chatArr.push(
                <li key={i} data-cid={chatLists[i].cid}>
                    <div className="chat-avatar fl">
                        <span className={"avatar-icon avatar-icon-"+String2int(chatLists[i].cid)} >{chatLists[i].cid.substr(0,1).toUpperCase()}</span>
                    </div>
                    <div className="chat-list-name fr">
                        <h2 className="text-overflow">U-{chatLists[i].cid.substr(0, 6).toUpperCase()}</h2>
                        <span className={"marked-tag marked-"+(chatLists[i].marked ? chatLists[i].marked  : '7')}></span>
                    </div>
                </li>
            );
        }

        return (
            <div className="contact-list">
                <div className="mark-filter mark-color-list" onClick={this.filterMarked}>Filter :&nbsp;&nbsp;<span data-marked="8" className="mark-tag mark-tag-all">All</span>
                    {markArr.map((m ,i)=>
                        <span key={i} data-marked={i+1} className={"mark-tag tag-"+m+(filterMark === (i+1) ? "  selected" : "")} title={"mark "+m}>{i+1}</span>
                    )}
                </div>
                <Modal
                    title={hisTitle}
                    visible={isHisVis}
                    footer={null}
                    onCancel={this.historyClose}
                    className={"history-header history-header-"+historyColorIndex}
                    wrapClassName="historyMessage"
                >
                    <div className="message-lists chat-lists-history">
                        {chatHistoryData && chatHistoryData.map((msg ,index)=>
                            <ChatMessageItem
                                key={msg.msgTime}
                                ownerType={msg.msgType}
                                ownerAvatar={ msg.msgAvatar ?
                                    msg.msgAvatar :
                                    <div className={"avatar-color avatar-icon-"+historyColorIndex} >{hisCid.substr(0, 1).toUpperCase()}</div>
                                }
                                ownerText={msg.msgText}
                                time={msg.msgTime}
                            />
                        )}
                    </div>
                </Modal>
                <ul className="customer-lists" onClick={this.showHistory}>
                    {chatArr}
                </ul>
            </div>
        );

    }
}

export default ChatHistoryLists;