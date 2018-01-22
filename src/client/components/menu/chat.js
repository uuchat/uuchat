import React, { Component } from 'react';
import String2int from '../common/utils';

class Chat extends Component{

    msgFilter(msg){
        let imgReg = /^content\/upload\//g;
        let m = msg.replace && msg.replace(/#/gi, "<br />");

        if (!msg) {
            return false;
        }

        if (msg.replace && imgReg.test(m)) {
            return  <img src={'/'+msg.split('|')[0]} alt="" />;
        }
        return <span dangerouslySetInnerHTML={{__html: m}}></span>;
    }

    render(){

        let {cid, name, newMsg, isActive, num, closeChat, toggleChat } = this.props.options;
        let msg = newMsg[newMsg.length - 1];

        return (
            <li onClick={(e) => toggleChat(name, cid)} className={ isActive ? 'active' : ''}>
                <div className="chat-avatar fl">
                    <span className={"avatar-icon avatar-icon-"+String2int(cid)}>{name.substr(0,1).toUpperCase()}</span>
                </div>
                <div className="chat-news fr">
                    <h2 className="text-overflow">U-{name.toUpperCase()}</h2>
                    <p className="text-overflow">{msg && this.msgFilter(msg.msgText)}</p>
                </div>
                <div className="chat-close" onClick={(e) => closeChat(cid)}>╳</div>
                <div className="chat-notify" style={{display: (isActive || num === 0) ? 'none' : 'inline-block'}}>{num}</div>
            </li>
         );

    }
}


export default Chat;