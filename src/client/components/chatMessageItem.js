import React, { Component } from 'react';

class ChatMessageItem extends Component{

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
    timeFomat(t){
        var str = '',
            h = t.getHours(),
            m = t.getMinutes();
        m = m > 9 ? m : '0' + m;

        str += h + ':' + m;

        if(h <= 12){
            str += ' AM';
        }else{
            str += ' PM';
        }

        return str;
    }
    render(){
        var imgReg = /[a-zA-Z0-9.%=/]{1,}[|]?[.](jpg|png|jpeg)/g,
            imgSrc = this.props.ownerText,
            isImg = false,
            img = '',
            flClass = 'fl';

        if(imgReg.test(imgSrc)){
            isImg = true;
            imgSrc = imgSrc.split('|');

        }
        if(typeof this.props.ownerAvatar === 'string'){
            img =  <img src={this.props.ownerAvatar} alt="avatar" title="avatar" />
        }else{
            if(this.props.ownerType===0 || this.props.ownerType===4){
                img = this.props.ownerAvatar;
            }
        }

        if(this.props.ownerType===1 || this.props.ownerType === 3){
            flClass='fr';
        }

        return (
            <div className="message-item">
                <p className={'msg-time-'+this.props.ownerType}>{this.timeFomat(this.props.time)}</p>
                <div className={"message-avatar " + flClass}>
                    { img }
                </div>
                <div className={"message-content " + flClass}>
                    {    isImg?
                        <a href={'/'+imgSrc[1]} target="_blank"><img src={'/'+imgSrc[0]} alt="" /></a>
                        : this.msgConver(this.props.ownerText)
                    }
                </div>
            </div>
        );

    }

}

export default ChatMessageItem;