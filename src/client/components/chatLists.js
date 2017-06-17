/**
 * Created by lwc on 2017/6/7.
 */
import React, { Component} from 'react';
import {Modal} from 'antd';
import ChatMessageItem from './chatMessageItem';
import String2int from './utils';

var chatHistory = {};

class ChatList extends Component{

    constructor(){
        super();
        this.state = {
            hasList: false,
            chatLists: [],
            filterMark: 8
        };
        this.getList = this.getList.bind(this);
        this.showHistory = this.showHistory.bind(this);
        this.filterMarked = this.filterMarked.bind(this);
    }

    componentDidMount(){
        this.getList();
    }
    getList(){
        var that = this;
        fetch('/chathistories/cs/'+this.props.csid+'/latestmonth').then(function(d){
            return d.json();
        }).then(function(d){
            if(200 === d.code){
                that.setState({
                    hasList: true,
                    chatLists: d.msg
                });
            }
        }).catch(function(e){});
    }
    showHistory(e){
        var t = e.target,
            cid = '',
            _li,
            cIndex,
            ulList;

        if(t.tagName.toLowerCase() === 'li'){
            _li = t;
        }else if(t.parentNode && t.parentNode.tagName.toLowerCase() === 'li' ){
            _li = t.parentNode;
        }else if(t.parentNode.parentNode && t.parentNode.parentNode.tagName.toLowerCase() === 'li'){
            _li = t.parentNode.parentNode;
        }
        cid = _li.getAttribute('data-cid');
        cIndex = _li.getAttribute('data-cIndex');

        if(chatHistory[cid]){
            this.renderHistroy(cid, cIndex);
        }else{
            chatHistory[cid] = [];
            this.fetchHistory(cid, this.props.csid, cIndex);
        }

        ulList = _li.parentNode;
        ulList = ulList.getElementsByTagName('li');

        for(var i = 0, l = ulList.length; i < l; i++){
            ulList[i].className = '';
        }
        _li.className='active';
    }

    renderHistroy(cid, cIndex){

        var data = chatHistory[cid];

        Modal.info({
            title: 'U-'+(cid.substr(0, 6).toUpperCase())+' chats',
            width: '600px',
            okText: 'Ok',
            content: (
                <div className="message-lists chat-lists-history">

                {data.map((msg ,index)=>
                     <ChatMessageItem key={index} ownerType={msg.msgType}
                        ownerAvatar={ msg.msgAvatar ? msg.msgAvatar : <div className={"avatar-color avatar-icon-"+cIndex} >{cid.substr(0, 1).toUpperCase()}</div> }
                        ownerText={msg.msgText} time={msg.msgTime}
                        />
                 )}

                </div>
            ),
            onOk() {},
        });
    }

    fetchHistory(cid, csid, cIndex){
        var that = this;
        fetch('/messages/customer/'+cid+'/cs/'+csid)
            .then((data) => data.json())
            .then(d =>{
                var historyMessage = [];
                d.msg.map((dd) =>{
                    return historyMessage.push({
                        msgAvatar: (dd.type === 1) ? require('../static/images/contact.png') : '',
                        msgText: dd.msg,
                        msgType: dd.type,
                        msgTime: new Date(dd.createdAt)
                    });
                });

                chatHistory[cid] = historyMessage;
                that.renderHistroy(cid, cIndex);

            })
            .catch(function(e){});
    }

    filterMarked(e){
        if(e.target.tagName.toLowerCase() === 'span'){
            var marked = parseInt(e.target.getAttribute('data-marked'), 10) === 7 ? 0 : parseInt(e.target.getAttribute('data-marked'), 10);
            this.setState({
                filterMark: marked
            });
        }
    }

    render(){

        var chatArr = [],
            chatListsArr = this.state.chatLists,
            markArr = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'grey'];

        for(var i = 0, l = chatListsArr.length; i < l; i++){
            var cIndex = String2int(chatListsArr[i].cid);


            if((this.state.filterMark !== 8) && this.state.filterMark !== chatListsArr[i].marked){
                continue;
            }

            chatArr.push(
                <li key={i} data-cid={chatListsArr[i].cid} data-cIndex={cIndex}>
                    <div className="chat-avatar fl">
                        <span className={"avatar-icon avatar-icon-"+cIndex} >{chatListsArr[i].cid.substr(0,1).toUpperCase()}</span>
                    </div>
                    <div className="chat-list-name fr">
                        <h2 className="text-overflow">U-{chatListsArr[i].cid.substr(0, 6).toUpperCase()}</h2>
                        <span className={"marked-tag marked-"+(chatListsArr[i].marked ? chatListsArr[i].marked  : '7')}></span>
                    </div>
                </li>
            );
        }

        return (

            <div className="contact-list">
                <div className="mark-filter mark-color-list" onClick={this.filterMarked}>Filter :&nbsp;&nbsp;<span data-marked="8" className="mark-tag mark-tag-all">All</span>
                    {markArr.map((m ,i)=>
                        <span key={i} data-marked={i+1} className={"mark-tag tag-"+m+(this.state.filterMark === (i+1) ? "  selected" : "")} title={"mark "+m}>{i+1}</span>
                    )}
                </div>
                <ul className="customer-lists" onClick={this.showHistory}>
                    {chatArr}
                </ul>
            </div>
        );

    }
}

export default ChatList;