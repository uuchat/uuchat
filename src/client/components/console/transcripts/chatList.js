import React, { Component } from 'react';
import { message } from 'antd';
import ChatMessageItem from '../../message/chatMessageItem';
import { fetchAsync } from '../common/utils';

export default class ChatList extends Component {

    state = {
        dataSource: []
    };

    getDataSource = async (cid, csid) => {
        try {
            let data = await fetchAsync('/messages/customer/' + cid + '/cs/' + csid);
            if (data.code !== 200) return message.error(data.msg, 4);

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
        } catch (e) {
            message.error(e.message, 4);
        }
    };

    componentDidMount() {
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