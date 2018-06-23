import React, { Component } from 'react';
import { Modal, message, Input } from 'antd';
import ChatMessageItem from '../message/chatMessageItem';
import String2int from '../common/utils';
import '../../static/css/common.css';
import '../../static/css/customerSuccess.css';

let chatHistory = {};
let searchContent = '';
let pageNum = 0;

class ChatSearchItem extends Component{

    msgConver = (msg) => {
        let str = '';
        if (/"email":/g.test(msg)) {
            msg = JSON.parse(msg);
            str += '<span>Offline messages(email: '+msg.email+'): </span>';
            str += msg.content;
        } else {
            str = msg.replace(/#/gi, "<br />").replace(/((https?|ftp|file|http):\/\/[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*)/g, function(match) {
                return '<a href="' + match + '" target="_blank">' + match + '</a>';
            });
        }
        return <div dangerouslySetInnerHTML={{__html: str}}></div>;
    };
    showHistory = (e) => {
        this.props.showHistory(this.props.cid);
    };
    render() {
        return (
            <li onClick={this.showHistory}>
                <div className={"fl search-avatar avatar-icon-"+String2int(this.props.cid)}>{this.props.cid.substr(0, 1).toUpperCase()}</div>
                <div className="fr search-text">{this.msgConver(this.props.msg)}</div>
            </li>
        );
    }
}

class ChatSearch extends Component{
    constructor() {
        super();
        this.state = {
            csid: localStorage.getItem('uuchat.csid') || '',
            searchList: [],
            hisCid: '',
            isHisVis: false,
            hisTitle: '',
            isViewMore: false
        };
    }
    componentDidMount() {
        let search = window.location.href;
        let content = '';

        if (search.indexOf('?search=') > -1) {
            search = search.split('?')[1].split('&');

            for (let i = 0, l = search.length; i < l; i++) {
                if (search[i].indexOf('search=') > -1) {
                    content = search[i].split('=')[1];
                    break;
                }
            }
            searchContent = content;
            this.getSearchList(content);
        }

    }
    getSearchList = (content) => {
        let that = this;
        fetch('/messages/cs/'+that.state.csid+'/search?msg='+content).then(function(d){
            return d.json();
        }).then(function(d){
            if (d.code === 200) {
                let isView = true;
                if (d.msg.length > 0) {
                    pageNum++;
                } else {
                    pageNum = 0;
                    message.info('There has no chats result aboute '+content, 4);
                }

                if (d.msg.length <5) {
                    isView = false;
                }

                that.setState({
                    searchList: d.msg,
                    isViewMore: isView
                });
            }
        }).catch(function(e){});
    };
    fetchHistory = (cid) => {
        let that = this,
            avatar = localStorage.getItem('uuchat.avatar') ? localStorage.getItem('uuchat.avatar') : require('../../static/images/contact.png');

        fetch('/messages/customer/'+cid+'/cs/'+that.state.csid)
            .then((data) => data.json())
            .then(d =>{
                let historyMessage = [];
                d.msg.map((dd) =>{
                    return historyMessage.push({
                        msgAvatar: (dd.type === 1) ? avatar : '',
                        msgText: dd.msg,
                        msgType: dd.type,
                        msgTime: new Date(dd.createdAt)
                    });
                });

                chatHistory[cid] = historyMessage;
                that.renderHistory(cid);

            })
            .catch(function(e){});
    };
    renderHistory = (cid) => {
        this.setState({
            hisCid: cid,
            isHisVis: true,
            hisTitle: 'U-'+(cid.substr(0, 6).toUpperCase())+' chats history'
        });
    };
    historyClose = () => {
        this.setState({
            isHisVis: false
        });
    };
    viewMore = () => {
        let that = this;
        fetch('/messages/cs/'+that.state.csid+'/search/latestmonth?msg='+searchContent+'&pageNum='+(pageNum * 5)).then(function(d){
            return d.json();
        }).then(function(d){
            if (d.code === 200) {
                if (d.msg.length > 0) {
                    let sList = that.state.searchList;
                    sList = sList.concat(d.msg);
                    pageNum++;
                    that.setState({
                        searchList: sList
                    });
                } else {
                    pageNum = 0;
                    message.info('There has no more result!', 4);
                }
                if (d.msg.length < 5) {
                    that.setState({
                        isViewMore: false
                    });
                }
            }
        }).catch(function(e){});
    };
    onSearchHandler = (e) => {
        if (e.target.value!=="") {
            this.getSearchList(e.target.value);
        }
    };

    render() {
        let state = this.state;
        let sArr = [];
        let searchL = state.searchList;
        let chatHistoryData = chatHistory[state.hisCid];
        let historyColorIndex = String2int(state.hisCid);

        for (let i = 0, l = searchL.length; i < l; i++) {
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
                        <li> Chats history lists </li>
                        {sArr}
                        <li className="more-search" style={{display: state.isViewMore ? '' : 'none'}} onClick={this.viewMore}>View more </li>
                    </ul>
                    <div className="none-results" style={{display: searchL.length > 0 ? 'none' : ''}}>No relevant results were found</div>
                </div>
             </div>
        );
    }

}

export default ChatSearch;