import React, { Component } from 'react';

class ChatMessageItem extends Component{

    msgConver(msg){
        let str = '';
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
        let str = '',
            h = t.getHours(),
            m = t.getMinutes();
        m = m > 9 ? m : '0' + m;

        str += h + ':' + m;
        str += (h <= 12) ? ' AM' : ' PM';

        return str;
    }
    render(){
        let {ownerAvatar, ownerType, time, ownerText} = this.props,
            imgReg = /[a-zA-Z0-9.%=/]{1,}[|]?[.](jpg|png|jpeg)/g,
            imgSrc = ownerText,
            isImg = false,
            isOld = false,
            img = '',
            flClass = 'fl';

        if(typeof time === 'string'){
            time = new Date(time);
            isOld = true;
        }

        if(imgReg.test(imgSrc)){
            isImg = true;
            imgSrc = imgSrc.split('|');
        }

        if(typeof ownerAvatar === 'string'){
            img =  <img src={ownerAvatar} alt="avatar" title="avatar" />
        }else{
            if(ownerType===0 || ownerType===4){
                img = ownerAvatar;
            }
        }

        if(ownerType===1 || ownerType === 3){
            flClass = isOld ? 'fr done' : 'fr';
        }

        return (
            <div className="message-item">
                <p className={'msg-time-'+ownerType}>{this.timeFomat(time)}</p>
                <div className={"message-avatar " + flClass}>
                    { img }
                </div>
                <div className={"message-content " + flClass + " t-" +time.getMinutes()+"-"+time.getSeconds()}>
                    {    isImg?
                        <a href={'/'+imgSrc[1]} target="_blank"><img width={imgSrc[2]} height={imgSrc[3]} src={'/'+imgSrc[0]} alt="" /></a>
                        : this.msgConver(ownerText)
                    }
                </div>
            </div>
        );

    }

}

export default ChatMessageItem;