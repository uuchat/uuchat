import React, { Component } from 'react';
import ChatMessageShortcut from './chatMessageShortcut';
import EmailDetail from './chatEmailDetail';
import String2int from '../common/utils';

class ChatMessageItem extends Component{

    constructor() {
        super();
        this.state = {
            showUserDetail: false,
            showEmailDetailY: 0
        };
    }

    msgConver = (msg) => {
        let str = '';
        let imgReg = /^content\/upload\//g;

        msg = msg.replace(/^&nbsp;/g, '');

        if (imgReg.test(msg)) {
            msg = msg.split('|');
            str = '<a href="'+msg[1]+'" target="_blank"><img width="'+msg[2]+'" height="'+msg[3]+'" src="'+msg[0]+'" alt="" /></a>';
        } else {
            str = msg.replace(/&nbsp;/g, ' ').replace(/#/gi, "<br />").replace(/((https?|ftp|file|http):\/\/[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*)/g, function (match) {
                return '<a href="' + match + '" target="_blank">' + match + '</a>';
            });
        }

        return <div dangerouslySetInnerHTML={{__html: str}}></div>;
    };
    timeCalculation = (t) => {
        let currentTimes = (new Date().getTime()) / 1000;
        let oldTimes = (new Date(t).getTime()) / 1000;
        let diffTimes = currentTimes - oldTimes;
        let str = '';

        if (diffTimes/86400 >= 1) {
            str = Math.ceil(diffTimes/86400)+'d ago';
        } else if (diffTimes/3600 >= 1) {
            str = Math.ceil(diffTimes/3600)+'h ago';
        } else {
            str = Math.ceil(diffTimes/60)+'m ago';
        }

        return str;

    };
    timeFomat = (t) => {
        let str = '';
        let h = t.getHours();
        let m = t.getMinutes();

        m = m > 9 ? m : '0' + m;

        str += h + ':' + m;
        str += (h <= 12) ? ' AM' : ' PM';

        return str;
    };
    showEmailDetail = (e) => {

        let list = document.querySelector('.chat-message');
        let pos = {};

        if ( e.pageY <= list.offsetHeight/2+80) {
            pos.top = e.pageY - 50 + 'px';
        } else {
            pos.top = e.pageY - 250 + 'px';
        }


        this.setState({
            showUserDetail: true,
            showEmailDetailY: pos
        });


    };
    hideEmailDetail = (e) => {
        this.setState({
            showUserDetail: false
        });
    };
    generateAvatar = (cid, avatar) => {
        let cIndex = String2int(cid);
        if (avatar) {
            return <img src={avatar} alt="avatar" title="avatar" />;
        }
        return <div className={"avatar-color avatar-icon-"+cIndex} >{cid.substr(0, 1).toUpperCase()}</div>;
    };
    render() {
        let {ownerAvatar, ownerType, time, ownerText, shortSetting, cid} = this.props;
        let {showUserDetail, showEmailDetailY} = this.state;
        let isOld = false;
        let isShowShortcut = false;
        let img = this.generateAvatar(cid, ownerAvatar);
        let flClass = 'fl';
        let messages = [];

        if (typeof time === 'string') {
            time = new Date(time);
            isOld = true;
        }

        if (ownerType===1 || ownerType === 2 || ownerType === 3) {
            flClass = isOld ? 'fr done' : 'fr';
            isShowShortcut = true;
        }

        if (typeof ownerText !== 'object' && ownerText.indexOf('@User ID@') > -1) {
            flClass += ' user-id';
        }

        if (typeof ownerText === 'object') {
            if (ownerText.email) {
                messages.push(
                    <div className="message-notify">
                        <div className="offline-mark">
                            <p>
                                <a href={"mailto:" + ownerText.email} onMouseOver={this.showEmailDetail} onMouseLeave={this.hideEmailDetail}>{ownerText.email} </a>
                                left their<i></i>Email:{ownerText.email} {this.timeCalculation(time)}
                             </p>
                        </div>
                        {showUserDetail && <EmailDetail email={ownerText.email} cid={cid} pos={showEmailDetailY} />}
                    </div>);
            } else {
                messages.push(
                    <div className="message-notify">
                        <div className="offline-mark"><p><a href="javascript:;">{ownerText.name}</a> <i></i> send the message {this.timeCalculation(time)}</p></div>
                    </div>);
            }

            ownerText.msg && ownerText.msg.map((msg) => {
                messages.push(
                    <div className="message-item">
                        <p className={'msg-time-'+ownerType}>{this.timeFomat(time)}</p>
                        <div className={"message-avatar " + flClass}>
                            {img}
                        </div>
                        <div className={"message-content " + flClass + " t-" +time.getTime()}>
                            {this.msgConver(msg.msg)}
                        </div>
                    </div>
                );
            });
        } else {
            messages.push(
                <div className="message-item">
                    <p className={'msg-time-'+ownerType}>{this.timeFomat(time)}</p>
                    <div className={"message-avatar " + flClass}>
                        {img}
                    </div>
                    <div className={"message-content " + flClass + " t-" +time.getTime()}>
                        {this.msgConver(ownerText)}
                    </div>
                    {shortSetting && isShowShortcut && <ChatMessageShortcut content={ownerText} />}
                </div>
            );
        }

        return (
            <div>
                {messages}
            </div>
        );

    }

}

export default ChatMessageItem;