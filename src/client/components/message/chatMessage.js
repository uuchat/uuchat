import React, { Component } from 'react';
import { Modal } from 'antd';
import ChatMessageItem from './chatMessageItem';

let onlineListModal = null;
let historyChatFetch = false;

class ChatMessage extends Component{

    constructor(){
        super();
        this.state = {
            markVisible: false,
            visible: false,
            onlineCustomerList: {},
            onlineShow: null,
            markedLists: {}
        };
    }
    componentDidMount(){

        let {socket, chat} = this.props;
        let {markedLists}  = this.state;

        if (!markedLists[chat.cid]) {
            markedLists[chat.cid] = chat.marked;
        }

        this.setState({
            markedLists: markedLists
        });
        socket && socket.on('cs.online.info', this.csOnlineInfo);
    }
    componentWillUnmount(){
        this.props.socket && this.props.socket.off('cs.online.info');
    }
    componentDidUpdate(){

        if (historyChatFetch) {
            historyChatFetch = false;
        } else {
            let msgList = this.refs.list;
            msgList.scrollTop = msgList.scrollHeight;
        }

    }

    marked = () => {
        let markVisible = this.state.markVisible;
        this.setState({
            markVisible: !markVisible
        });
    };
    optionSelect = (e) => {
        e.stopPropagation();
        let type = e.target.getAttribute('data-type');

        if (type === 'm') {
            this.setState({
                visible: true
            });
        } else if (type === 't') {
            this.customerTransfer();
        }
    };
    customerTransfer = () => {
        let _self = this;
        let onlineLists = [];
        let onlines = _self.state.onlineCustomerList;

        for (let i in onlines) {
            if (i !== _self.props.csid){
                onlineLists.push({
                    name: i,
                    info: onlines[i]
                });
            }
        }
        onlineListModal = Modal.info({
            title: 'Online customer success lists',
            okText: 'Ok',
            content: (
                <div>
                    {onlineLists.length > 0 ? onlineLists.map((cs, i) =>
                            <div key={i} className="online-item">
                                <span className="online-avatar fl"> {cs.info[1] !=='' ? <img width="100%" src={cs.info[1]} alt="" /> : <img width="100%" src={require('../../static/images/contact.png')} alt="" /> }</span>
                                <span className="online-name fl"> {cs.info[0]}</span>
                                <span className="online-btn fr" data-csid={cs.name} onClick={this.transfer}>Transfer</span>
                            </div>
                        ) :
                        <h2>There has no another online customerSuccess!</h2>
                    }
                </div>
            ),
            onOk(){
                _self.setState({
                    markVisible: false
                });
            }
        });
    };
    markHide = () => {
        this.setState({
            visible: false,
            markVisible: false
        });
    };

    markColorSelect = (e) => {
        let {chat, csid, socket} = this.props;
        let {markedLists} = this.state;
        let t = e.target;
        let _self = this;

        if (t.tagName.toLowerCase() === 'span') {
            socket.emit('cs.marked', chat.cid, csid, parseInt(t.innerHTML, 10), function (type) {

                if (type) {
                    markedLists[chat.cid]=parseInt(t.innerHTML, 10);
                    _self.setState({
                        markedLists: markedLists
                    });
                }
            });
        }
    };

    csOnlineInfo = (data) =>{
        if (Object.keys(this.state.onlineCustomerList).length !== Object.keys(data).length) {
              this.setState({
                  onlineCustomerList: data
              });
        }
    };
    transfer = (e) => {
       let {socket, chat, transferChat} = this.props;
       let _self = this;
       let t = e.target;
       let csid = t.getAttribute('data-csid');

       socket.emit('cs.dispatch', csid, chat.cid, function(success){
            if (success) {
                transferChat(chat.cid);
                _self.setState({
                    markVisible: false
                });
            }
            onlineListModal.destroy();
        });

    };

    scrollHandle = (e) => {

        let msgList = this.refs.list;
        let {csid, chat, customerSuccess} = this.props;
        let {chatLists, avatar} = customerSuccess.state;

        if ((e.deltaY < 0) && (msgList.scrollTop <= 0) && chatLists[chat.cid].hasMoreHistoryChat && !chatLists[chat.cid].isLoading) {
            chatLists[chat.cid].isLoading = true;
            msgList.className += ' loading';
            requestAnimationFrame(function () {
                getChatHistory();
            });
        }

        function getChatHistory(){
            historyChatFetch = true;
            fetch('/messages/customer/' + chat.cid + '/cs/' + csid+'?pageNum='+chatLists[chat.cid].pageNum+'&pageSize=10')
                .then((data) => data.json())
                .then(d =>{
                    if (d.code === 200) {
                        if (d.msg.length === 0 || d.msg.length < 10) {
                            chatLists[chat.cid].hasMoreHistoryChat = false;
                        }
                        chatLists[chat.cid].pageNum++;
                        chatLists[chat.cid].isLoading = false;

                        if (d.msg.length > 0) {
                            d.msg.reverse().map(chat => chatLists[chat.cid].messageLists.unshift({
                                msgAvatar: (chat.type === 1 || chat.type === 2) ? avatar : '',
                                msgText: chat.msg,
                                msgType: chat.type,
                                msgTime: chat.createdAt
                            }));
                        }

                        customerSuccess.setState({
                            chatLists: chatLists
                        });

                    }
                    msgList.className = 'message-lists';
                })
                .catch(e => {
                    chatLists[chat.cid].isLoading = false;
                    msgList.className = 'message-lists';
                    customerSuccess.setState({
                        chatLists: chatLists
                    });
                });
        }

    };

    render(){
        let {visible, markVisible, markedLists} = this.state;
        let {chat} = this.props;
        let markArr = ['grey', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];

        !markedLists[chat.cid] && (markedLists[chat.cid] = chat.marked);

        return (
            <div className="chat-message">
                <div className="message-title">U-{chat.name.toUpperCase()}
                    <div className="chat-tags fr" onClick={this.marked}>...
                         <ul className="more-options" style={{display: !markVisible ? 'none' : 'block'}} onClick={this.optionSelect}>
                            <span className="caret"></span>
                            <h3>List Actions <span className="fr options-close" onClick={this.markHide}>╳</span></h3>
                            <li data-type="m"><i className="action-icon mark"></i>Mark</li>
                            <li data-type="t"><i className="action-icon transfer"></i>Transfer</li>
                        </ul>
                    </div>
                    <Modal
                        title="Mark customer for favorite color"
                        okText="Ok"
                        cancelText="Cancel"
                        visible={visible}
                        onOk={this.markHide}
                        onCancel={this.markHide}
                    >
                        <div className="mark-color-list" onClick={this.markColorSelect}>
                            {markArr.map((m ,i)=>
                                <span key={m} className={"mark-tag tag-"+m+(markedLists[chat.cid] === i ? "  selected" : "")} title={"mark "+m}>{i}</span>
                            )}
                        </div>
                    </Modal>
                </div>
                <div className="message-lists" ref="list" onWheel={this.scrollHandle}>
                    {chat.messageLists.map((msg) =>
                            <ChatMessageItem
                                    key={msg.msgTime}
                                    ownerType={msg.msgType}
                                    ownerAvatar={msg.msgAvatar}
                                    ownerText={msg.msgText}
                                    time={msg.msgTime}
                                    shortSetting={true}
                                    cid={chat.cid}
                                    />
                    )}
                </div>
            </div>
        );

    }
}

export default ChatMessage;