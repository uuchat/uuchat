/**
 * Created by lwc on 2017/6/29.
 */
import React, {Component} from 'react';
import {Modal, message, Input} from 'antd';
import ChatMessageItem from './chatMessageItem';
import String2int from './utils';
import '../static/css/common.css';
import '../static/css/customerSuccess.css';

var chatHistory = {},
    searchContent = '',
    pageNum = 0;

class ChatSearchItem extends Component{

    constructor(){
        super();
        this.msgConver = this.msgConver.bind(this);
        this.showHistory = this.showHistory.bind(this);
    }

    msgConver(msg){
        var str = '';
        if(typeof msg === 'object'){
            str = '<span class="offline-name">Offline message</span>';
            str += '<p class="offline-content">'+msg.content+'</p>';
            str += '<p class="offline-email">name: '+msg.name+'</p>';
            str += '<p class="offline-email">email: '+msg.email+'</p>';
        }else {
            str = msg.replace(/#/gi, "<br />").replace(/((https?|ftp|file|http):\/\/[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*)/g, function (match) {
                return '<a href="' + match + '" target="_blank">' + match + '</a>';
            });
        }
        return <div dangerouslySetInnerHTML={{__html: str}}></div>;
    }
    showHistory(e){
        this.props.showHistory(this.props.cid);
    }
    renderHistroy(cid){
        this.setState({
            hisCid: cid,
            isHisVis: true,
            hisTitle: 'U-'+(cid.substr(0, 6).toUpperCase())+' chats history'
        });
    }
    render(){
        return (
            <li onClick={this.showHistory}>
                <div className={"fl search-avatar avatar-icon-"+String2int(this.props.cid)}>{this.props.cid.substr(0, 1).toUpperCase()}</div>
                <div className="fr search-text">{this.msgConver(this.props.msg)}</div>
            </li>
        );
    }
}

class ChatSearch extends Component{
    constructor(){
        super();
        this.state = {
            csid: localStorage.getItem('uuchat.csid') || '',
            searchList: [],
            hisCid: '',
            isHisVis: false,
            hisTitle: '',
            isViewMore: false
        };
        this.getSearchList = this.getSearchList.bind(this);
        this.fetchHistory = this.fetchHistory.bind(this);
        this.renderHistroy = this.renderHistroy.bind(this);
        this.historyClose = this.historyClose.bind(this);
        this.viewMore = this.viewMore.bind(this);
        this.onSearchHandler = this.onSearchHandler.bind(this);
    }
    componentWillMount(){
        var search = window.location.href,
            content = '';

        search = search.split('?')[1].split('&');
        for(var i = 0, l = search.length; i < l; i++){
            if(search[i].indexOf('search=') > -1){
                content = search[i].split('=')[1];
                break;
            }
        }
        searchContent = content;
        this.getSearchList(content);
    }
    getSearchList(content){
        var that = this;
        fetch('/messages/cs/'+that.state.csid+'/search?msg='+content).then(function(d){
            return d.json();
        }).then(function(d){
            if(200 === d.code){
                if(d.msg.length > 0){
                    pageNum++;
                    that.setState({
                        searchList: d.msg,
                        isViewMore: false
                    });
                }else{
                    pageNum = 0;
                    message.info('There has no chats result aboute '+content, 4);
                }
            }
        }).catch(function(e){});
    }
    fetchHistory(cid){
        var that = this,
            csAvatar = localStorage.getItem('uuchat.avatar') ? localStorage.getItem('uuchat.avatar') : require('../static/images/contact.png');

        fetch('/messages/customer/'+cid+'/cs/'+that.state.csid)
            .then((data) => data.json())
            .then(d =>{
                var historyMessage = [];
                d.msg.map((dd) =>{
                    return historyMessage.push({
                        msgAvatar: (dd.type === 1) ? csAvatar : '',
                        msgText: dd.msg,
                        msgType: dd.type,
                        msgTime: new Date(dd.createdAt)
                    });
                });

                chatHistory[cid] = historyMessage;
                that.renderHistroy(cid);

            })
            .catch(function(e){});
    }
    renderHistroy(cid){
        this.setState({
            hisCid: cid,
            isHisVis: true,
            hisTitle: 'U-'+(cid.substr(0, 6).toUpperCase())+' chats history'
        });
    }
    historyClose(){
        this.setState({
            isHisVis: false
        });
    }
    viewMore(){
        var that = this;
        fetch('/messages/cs/'+that.state.csid+'/search/latestmonth?msg='+searchContent+'&pageNum='+(pageNum * 5)).then(function(d){
            return d.json();
        }).then(function(d){
            if(200 === d.code){
                if(d.msg.length > 0) {
                    var sList = that.state.searchList;
                    sList = sList.concat(d.msg);
                    pageNum++;
                    that.setState({
                        searchList: sList
                    });
                }else{
                    pageNum = 0;
                    message.info('There has no more result!', 4);
                    that.setState({
                        isViewMore: true
                    });
                }
            }
        }).catch(function(e){});
    }
    onSearchHandler(e){
        if(e.target.value!==""){
            this.getSearchList(e.target.value);
        }
    }

    render(){
        var state = this.state,
            sArr = [],
            searchL = state.searchList,
            chatHistoryData = chatHistory[state.hisCid],
            historyColorIndex = String2int(state.hisCid);

        for(var i = 0, l = searchL.length; i < l; i++){
            sArr.push(<ChatSearchItem key={i} cid={searchL[i].cid} msg={searchL[i].msg}  showHistory={this.fetchHistory} />);
        }

        return (
             <div className="search-body">
                <div className="customerSuccess-header">
                    <div className="search-user-info">
                            <Input.Search
                                placeholder="Type text and enter"
                                onPressEnter={this.onSearchHandler}
                                name="search"
                            />
                    </div>
                </div>
                <Modal
                    title={state.hisTitle}
                    visible={state.isHisVis}
                    footer={null}
                    onCancel={this.historyClose}
                    className={"history-header history-header-"+historyColorIndex}
                 >
                    <div className="message-lists chat-lists-history">
                        {chatHistoryData && chatHistoryData.map((msg ,index)=>
                            <ChatMessageItem key={index} ownerType={msg.msgType}
                                ownerAvatar={ msg.msgAvatar ? msg.msgAvatar :
                                <div className={"avatar-color avatar-icon-"+historyColorIndex} >{state.hisCid.substr(0, 1).toUpperCase()}</div> }
                                ownerText={msg.msgText} time={msg.msgTime}
                            />
                        )}
                    </div>
                </Modal>
                <div className="search-main">
                    <ul className="search-list">
                        <li> Chats lists </li>
                        {sArr}
                        <li className="more-search" style={{display: state.isViewMore ? 'none' : ''}} onClick={this.viewMore}>View more </li>
                    </ul>
                </div>
             </div>
        );
    }

}

export default ChatSearch;