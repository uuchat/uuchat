import React, { Component } from 'react';
import ChatMessageItem from '../chatMessageItem';

export default class ChatList extends Component {

    state = {
        dataSource: []
    };

    getDataSource = (cid, csid) => {
        fetch('/messages/customer/' + cid + '/cs/' + csid)
            .then((data) => data.json())
            .then(data => {
                this.setState({
                    dataSource: data.msg.map((item) => {
                        return {
                            msgAvatar: (item.type === 1) ? '/static/images/contact.png' : '',
                            msgText: item.msg,
                            msgType: item.type,
                            msgTime: new Date(item.createdAt)
                        };
                    })
                });
            }).catch(function (e) {
            });
    };

    componentDidMount () {
        let { cid, csid } = this.props;
        if (cid && csid) this.getDataSource(cid, csid);
    }

    render() {
        let { cid, cIndex } = this.props;
        let { dataSource } = this.state;

        return (
            <div className="message-lists chat-lists-history">
                {dataSource.map((msg, index)=>
                        <ChatMessageItem key={index} ownerType={msg.msgType}
                                         ownerAvatar={ msg.msgAvatar ? msg.msgAvatar : <div className={"avatar-color avatar-icon-"+cIndex} >{cid.substr(0, 1).toUpperCase()}</div> }
                                         ownerText={msg.msgText} time={msg.msgTime}
                            />
                )}
            </div>
        );
    }
}