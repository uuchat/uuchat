import React, { Component } from 'react';
import { Row, Col, Modal, notification } from 'antd';
import io from 'socket.io-client';
import Header from '../user/header';
import ChatMenu from '../menu/chatMenu';
import ChatSend from './chatSend';
import ChatMessage from './chatMessage';
import ChatEmpty from './chatEmpty';
import ChatUser from '../user/chatUser';
import '../../static/css/customerSuccess.css';

let notifyKey = '';

class CustomerSuccess extends Component{
    constructor(props){
        super(props);
        this.state = {
            socket: {},
            csid: localStorage['uuchat.csid'] || '',
            name: localStorage['uuchat.name'] || '',
            displayName: localStorage['uuchat.displayName'] || '',
            email: localStorage['uuchat.email'] || '',
            avatar: localStorage['uuchat.avatar'] || '../../static/images/contact.png',
            bgThemeImg: localStorage['bgThemeImg'] || '',
            bgThemeOpacity: localStorage['bgThemeOpacity'] || 0.7,
            status: 1,             // 1:online，2:offline, 3:connect error
            chatLists: {},
            chatActive: {}
        };

    }
    componentDidMount(){
        this.createSocket();
    }

    /***
     * createSocket
     */
    createSocket = () => {
        let sio = io('/cs', {
            forceNew: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000 ,
            timeout: 10000
        });

        sio.on('connect', this.customerSuccessConnect);
        sio.on('connect_error', this.customerSuccessConnectErr);
        sio.on('reconnect', this.socketReconnect);
        sio.on('cs.customer.one', this.csCustomerOne);
        sio.on('cs.customer.list', this.csCustomerList);
        sio.on('cs.dispatch', this.csDispatch);
        sio.on('cs.need.login', this.csNeedLogin);
        sio.on('c.message', this.cMessage);
        sio.on('c.disconnect', this.cDisconnect);
        sio.on('cs.customer.offline', this.csCustomerOffline);
        sio.on('cs.shortcut', this.csShortcuts);
        sio.on('error', this.socketError);
        this.setState({
            socket: sio
        });
    };

    csCustomerList = (data) => {
       let {chatLists, chatActive} = this.state;

       this.setState({
           chatLists: chatLists,
           chatActive: chatActive
       });
    };

    csCustomerOne = (data) => {

        let {chatLists, chatActive} = this.state;

        chatLists[data.cid] = {
            cid: data.cid,
            marked: data.marked,
            info: data.info,
            name: data.name,
            notifies: 0,
            status: 1,
            active: chatActive === null,
            messageLists: [],
            pageNum: 1,
            isLoading: false,
            hasMoreHistoryChat: true
        };

        if (!chatActive.cid) {
            chatActive.cid = data.cid;
        }

        this.getChatHistory(data.cid);

        this.setState({
            chatLists: chatLists,
            chatActive: chatActive
        });
    };

    csDispatch = (cid, name, info) => {
        this.csCustomerOne({
            cid: cid,
            name: name,
            info: info,
            marked: -1
        });
    };

    csNeedLogin = (fn) => {
        fn(true);
        this.state.socket.disconnect();
        window.location.href="/";
    };

    cMessage = (cid, msg) => {

        let {chatLists, chatActive} = this.state;

        if (cid !== chatActive.cid) {
            chatLists[cid].notifies++;
        }

        chatLists[cid].messageLists.push({
            msgAvatar: '',
            msgText: msg,
            msgType: 0,
            msgTime: new Date()
        });

        this.setState({
            chatLists: chatLists
        });

    };

    cDisconnect = (cid) => {
        this.deleteChat(cid);
    };

    csCustomerOffline = (data) => {
        let {chatLists, chatActive} = this.state;
        let cid = data.cid;

        !chatActive.cid && (chatActive.cid = cid);

        data.msg.map((chat) =>
            chatLists[cid] = {
                cid: cid,
                marked: 0,
                info: data.info,
                name: cid.split('-')[0],
                notifies: 0,
                status: 2,
                active: chatActive === null,
                messageLists: [{
                    msgAvatar: '',
                    msgText: {
                        email: data.email,
                        msg: data.msg,
                        type: chat.type,
                        name: cid.substr(0, 6)
                    },
                    msgType: chat.type,
                    msgTime: data.updatedAt
                }],
                pageNum: 0,
                isLoading: false,
                hasMoreHistoryChat: true
            }
        );
        this.setState({
            chatActive: chatActive,
            chatLists: chatLists
        });

    };

    /***
     * reconnect
     */
    socketReconnect = () => {};

    /***
     * error
     */
    socketError = () => {};

    /***
     *
     * customerSuccessConnect Socket Connected Server Handle
     *
     */
    customerSuccessConnect = () => {
        let status = this.state.status;

        if (status === 3) {
            notification.close("errNotifyKey");
            notifyKey = "";
            this.setState({
                status: 1
            });
        }
    };

    /***
     *
     * customerSuccessConectErr socket connect server Error handle
     *
     */

    customerSuccessConnectErr = () => {
        if (notifyKey === "") {
            notification.open({
                message: 'Server error',
                top: 50,
                duration: null,
                key: 'errNotifyKey',
                description: 'The server has offline!!!!.'
            });
            notifyKey = "nKey";
        }

       this.setState({
            status: 3,
            chatActive: {
                cid: ''
            },
            chatLists: {}
        });
    };

    toggleChat = (name, cid) => {

       let {chatActive, chatLists} = this.state;

       if (cid === chatActive.cid) {
           return false;
       }

       chatLists[chatActive.cid].active = false;
       chatLists[chatActive.cid].notifies = 0;
       chatActive.cid = cid;

       this.setState({
           chatLists: chatLists,
           chatActive: chatActive
       });

    };

    sendMessageToCustomer = (msg) => {
        let {chatActive, chatLists, avatar, socket} = this.state;
        let cid = chatActive.cid;

        if (msg !== '') {

            let d = new Date(),
                messageEvent = 'cs.message';

            chatLists[cid].messageLists.push({
                msgAvatar: avatar,
                msgText: msg,
                msgType: 1,
                msgTime: d
            });

            this.setState({
                chatLists: chatLists
            });

            if (chatLists[chatActive.cid].status === 2) {
               messageEvent = 'cs.offlineMessage';
            }

            socket.emit(messageEvent, cid, msg, function (success) {
                if (success) {
                    document.querySelector('.t-' + d.getTime()).className += ' done';
                }
            });

        }

    };

    closeChat = (cid) => {

        let _self = this;

        Modal.confirm({
            title: 'Do you Want to close this customer?',
            content: 'If yes , the customer  will be remove',
            okText: 'Yes',
            cancelText: 'No',
            onOk() {
                _self.state.socket.emit('cs.closeDialog', cid, function(flag){
                    _self.deleteChat(cid);
                });

            }
        });
    };

    transferChat = (cid) => {
        this.deleteChat(cid);
    };

    statusHandle = (type) => {
        this.state.socket.emit('cs.status', this.state.chatActive.cid, type, function(state){});
    };

    getChatHistory = (cid) => {
        let _self = this;
        let {csid, avatar, chatLists} = this.state;

        fetch('/messages/customer/'+cid+'/cs/'+csid)
            .then((data) => data.json())
            .then(d =>{
                d.msg.map((chat) =>
                    chatLists[cid].messageLists.push({
                        msgAvatar: (chat.type === 1 || chat.type === 2) ? avatar : '',
                        msgText: chat.msg,
                        msgType: chat.type,
                        msgTime: chat.createdAt
                    })
                );

                _self.setState({
                    chatLists: chatLists
                });

            })
            .catch(function(e){});
    };

    csShortcuts = (action, shortcut) => {
        shortcut.action = action;
        localStorage.setItem('newShortcut', JSON.stringify(shortcut));
    };

    rateFeedBack = () => {
        let {chatLists, chatActive, avatar} = this.state;

        chatLists[chatActive.cid].messageLists.push({
            msgAvatar: avatar,
            msgText: 'Invitation evaluation has been sent',
            msgType: 1,
            msgTime: new Date()
        });

        this.setState({
            chatLists: chatLists
        });

    };

    deleteChat = (cid) => {
        let {chatLists, chatActive} = this.state;

        delete chatLists[cid];

        if (Object.keys(chatLists).length === 0) {
            chatActive.cid = '';
        } else if (cid === chatActive.cid) {
            for (let k in chatLists) {
                chatActive.cid = k;
                break;
            }
        }

        this.setState({
            chatLists: chatLists,
            chatActive: chatActive
        });
    };

    render(){

        let {status, avatar, csid, socket, bgThemeImg, bgThemeOpacity, chatLists, chatActive} = this.state;
        let bgStyle = {};

        if (bgThemeImg && status === 1) {
            bgThemeImg = bgThemeImg.split('::');
            if (bgThemeImg[0] === 'photo') {
                bgStyle.backgroundImage = 'url('+bgThemeImg[1]+'?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1280&fit=max)';
            } else if (bgThemeImg[0] === 'color') {
                bgStyle.background = bgThemeImg[1];
            }
        }

        return (
            <div className={"uuchat-customerSuccess " + ((status !== 1) ? " off" : "") +(bgThemeImg ? " theme" : "")}
                 style={bgStyle}>
                    <Header customerSuccess={this} />
                    <Row className="customerSuccess-main" style={{background: 'rgba(255, 255, 255, '+bgThemeOpacity+')'}}>
                        <Col xs={24} sm={7} md={7} lg={6} xl={6}>
                           <ChatMenu customerSuccess={this} />
                        </Col>
                        <Col xs={24} sm={11} md={11} lg={12} xl={12}>
                            <div className="customerSuccess-content">
                            {
                                chatActive.cid ?
                                    <div>
                                        <ChatMessage
                                            socket={socket && socket}
                                            csid={csid}
                                            avatar={avatar}
                                            transferChat={this.transferChat}
                                            customerSuccess={this}
                                            chat={chatLists[chatActive.cid]}
                                            />
                                        <ChatSend
                                            sendMessage={this.sendMessageToCustomer}
                                            statusHandle={this.statusHandle}
                                            cid={chatActive.cid}
                                            csid={csid}
                                            socket={socket}
                                            rateFeedBack={this.rateFeedBack}
                                        />
                                    </div>
                                    :
                                    <ChatEmpty />
                            }
                            </div>
                        </Col>
                        <Col xs={24} sm={6} md={6} lg={6} xl={6}>
                            <div className="customerSuccess-right">
                                { chatActive.cid && <ChatUser info={chatLists[chatActive.cid].info} />}
                            </div>
                        </Col>
                    </Row>
            </div>
        );
    }

}

export default CustomerSuccess;