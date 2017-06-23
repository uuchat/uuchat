/**
 * Created by lwc on 2017/5/5.
 */

import React, { Component } from 'react';
import {Modal} from 'antd';
import String2int from './utils';

class Chat extends Component{

    constructor(){
        super();
        this.state = {
            isCloseOffline: false
        };
        this.chatClickHandler = this.chatClickHandler.bind(this);
        this.offlineShow = this.offlineShow.bind(this);
        this.closeOffline = this.closeOffline.bind(this);
    }

    chatClickHandler(e){
        this.props.onChatListClick(this.props.name, this.props.cid,  this.props.marked);
    }

    msgFilter(msg){
        var imgReg = /[a-zA-Z0-9.%=/]{1,}[.](jpg|png|jpeg)/g,
            m = msg.replace && msg.replace(/#/gi, "<br />");

        if(msg.replace && imgReg.test(m)){
            return  <img src={'/'+msg.split('|')[0]} alt="" />;
        }
        return <span dangerouslySetInnerHTML={{__html: m}}></span>;
    }
    offlineShow(){
        Modal.info({
            title:'From customer offline message!',
            okText: 'Close',
            content: (
                <div>
                    <h1 className="chat-offline-msg">Content: {this.props.email.content}</h1>
                    <h2 className="chat-offline-t">Name: {this.props.email.name}</h2>
                    <h3 className="chat-offline-t">Email: {this.props.email.email}</h3>
                </div>
            )
        });
    }
    closeOffline(e){
        e.stopPropagation();
        this.setState({
            isCloseOffline: true
        });
    }

    render(){

        var len, msg,
            cIndex = String2int(this.props.cid);

        if(!this.props.type){
            if(this.props.newMsg && this.props.newMsg.length > 0 ){
                len = this.props.newMsg.length;
                msg = this.props.newMsg[len - 1];
            }
        }

        if(!this.props.type){
            return (
                <li onClick={this.chatClickHandler} className={ this.props.isActive  ? 'active' : ''}>
                    <div className="chat-avatar fl">
                        <span className={"avatar-icon avatar-icon-"+cIndex}>{this.props.name.substr(0,1).toUpperCase()}</span>
                    </div>
                    <div className="chat-news fr">
                        <h2 className="text-overflow">U-{this.props.name.toUpperCase()}</h2>
                        <p className="text-overflow">{msg && this.msgFilter(msg.msgText)}</p>
                    </div>
                    <div className="chat-close" onClick={(e)=>this.props.closeDialog(e, this.props.cid)}>╳</div>
                    <div className="chat-notify" style={{display: (this.props.isActive || this.props.num === 0) ? 'none' : 'inline-block'}}>{this.props.num}</div>
                </li>
             );
        }else if(this.props.type){
            return (
                <li onClick={this.offlineShow} style={{display: this.state.isCloseOffline ? 'none' : ''}}>
                    <div className="chat-avatar fl">
                        <span className={"avatar-icon avatar-icon-"+cIndex}>{this.props.cid.substr(0,1).toUpperCase()}</span>
                    </div>
                    <div className="chat-news fr">
                        <h2 className="text-overflow">U-{this.props.cid.substr(0,1).toUpperCase()}</h2>
                        <p className="text-overflow">Offline message </p>
                    </div>
                    <div className="chat-close" onClick={this.closeOffline}>╳</div>
                    <div className="chat-notify">Offline message </div>
               </li>
            );
        }
    }
}


export default Chat;