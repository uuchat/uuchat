import React, { Component } from 'react';
import { Row, Col, Input, Tabs, Modal, notification } from 'antd';
import io from 'socket.io-client';
import Chat from '../components/chat';
import ChatSend from './chatSend';
import ChatMessage from './chatMessage';
import ChatEmpty from './chatEmpty';
import ChatUser from './chatUser';
import ChatIcon from './chatMenuIcon';
import ChatList from './chatLists';
import ChatSetting from './chatSetting';
import '../static/css/customerSuccess.css';

const TabPane = Tabs.TabPane;
let notifyKey = '';

class CustomerSuccess extends Component{
    constructor(props){
        super(props);
        this.state = {
            socket: {},
            csid: localStorage['uuchat.csid'] || '',
            csName: localStorage['uuchat.name'] || '',
            csDisplayName: localStorage['uuchat.displayName'] || '',
            csEmail: localStorage['uuchat.email'] || '',
            csAvatar: localStorage['uuchat.avatar'] || '../static/images/contact.png',
            customerSelect: {
                cid: '',
                name: '',
                marked: 0
            },
            messageLists: {},
            customerLists: [],
            menuIcons: {
                chat: 'chat_selected',
                contact: 'contact',
                setting: 'setting'
            },
            chatNotify: {},
            isOnline: true,
            isConnectErr: false
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
        sio.on('connect_error', this.customerSuccessConectErr);
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

    /***
     * cs.customer.list
     */
    csCustomerList = (data) => {
        let customer = {};

        data.map((d)=>customer[d.cid] = []);

        this.setState({
            customerLists: data,
            messageLists: customer,
            customerSelect: {
                cid: data[0].cid,
                name: data[0].name,
                marked: data[0].marked
            }
        });

        for (let i = 0; i < data.length; i++) {
            this.getMessageHistory(data[i].cid);
        }
    };

    /***
     * cs.customer.one
     */
    csCustomerOne = (data) => {
        let customerLists = this.state.customerLists,
            messageLists = this.state.messageLists,
            cid = this.state.customerSelect.cid,
            name = this.state.customerSelect.name,
            marked = this.state.customerSelect.marked;

        customerLists.unshift(data);

        if (!messageLists[data.cid]) {
            if (customerLists.length <=1 ){
                cid = data.cid;
                name = data.name;
                marked = data.marked;
            }
        } else {
            cid = data.cid;
            name = data.name;
            marked = data.marked;
        }
        this.getMessageHistory(data.cid);
        this.setState({
            customerLists: customerLists,
            customerSelect: {
                cid: cid,
                name: name,
                marked: marked
            }
        });
    };

    /***
     * cs.dispatch
     */
    csDispatch = (cid, name, info) => {
        let customerLists = this.state.customerLists;
        customerLists.unshift({
            cid: cid,
            name: name,
            info: info
        });

        if (customerLists.length > 1){
            this.setState({
                customerLists: customerLists
            });
        } else {
            this.getMessageHistory(cid);
            this.setState({
                customerLists: customerLists,
                customerSelect: {
                    cid: cid,
                    name: name
                }
            });
        }
    };

    /***
     * cs.need.login
     */
    csNeedLogin = (fn) => {
        fn(true);
        this.state.socket.disconnect();
        window.location.href="/";
    };

    /***
     * c.message
     */
    cMessage = (cid, msg) => {

        let msgArr = this.state.messageLists[cid],
            messageLists = this.state.messageLists,
            chatNotify = this.state.chatNotify;

        if (this.state.customerSelect.cid !== cid){
            if (!chatNotify[cid]) {
                chatNotify[cid] = 1;
            } else {
                chatNotify[cid]++;
            }
        }

        msgArr && msgArr.push({
            msgAvatar: '',
            msgText: msg,
            msgType: 0,
            msgTime: new Date()
        });
        messageLists[cid] = msgArr;

        this.setState({
            messageLists: messageLists,
            chatNotify: chatNotify
        });
    };

    /***
     * c.disconnect
     */
    cDisconnect = (cid) => {
        let customerLists = this.state.customerLists,
            cSelectCid = this.state.customerSelect.cid,
            cSelectName = this.state.customerSelect.name;

        customerLists.map((c, i)=> c.cid === cid && customerLists.splice(i, 1));

        if (customerLists.length > 0) {
            cSelectCid = customerLists[0].cid;
            cSelectName = customerLists[0].name;
        } else {
            cSelectCid = '';
            cSelectName = '';
        }

        this.setState({
            customerSelect: {
                cid: cSelectCid,
                name: cSelectName
            },
            customerLists: customerLists
        });
    };

    /***
     * cs.customer.offline
     */
    csCustomerOffline = (data) => {
        let customerLists = this.state.customerLists;
        customerLists.unshift({
            cid: data.cid,
            name: data.name,
            type: 'offline',
            msg: {
                name: data.name,
                email: data.email,
                content: data.content
            }
        });
        this.setState({
            customerLists: customerLists
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
        let isConnectErr = this.state.isConnectErr;

        if (isConnectErr) {
            notification.close("errNotifyKey");
            notifyKey = "";
            this.setState({
                isConnectErr: false
            });
        }
    };

    /***
     *
     * customerSuccessConectErr socket connect server Error handle
     *
     */

    customerSuccessConectErr = () => {
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
            isConnectErr: true,
            customerSelect: {
                cid: '',
                name: '',
                marked: 0
            },
            messageLists: {},
            customerLists: []
        });
    };

    /***
     *
     * onSearchHandler
     */
    onSearchHandler = (e) => {
        if (e.target.value === '') {
            e.preventDefault();
            return false;
        }
    };

    /***
     *
     * @param activeIndex
     * @param name
     */
    onChatListClick = (name, cid, marked) => {

        let chatNotify = this.state.chatNotify;
        if (cid === this.state.customerSelect.cid) {
            return false;
        }

        if (chatNotify[cid]) {
            chatNotify[cid] = 0;
        }

        this.setState({
            customerSelect: {
                cid: cid,
                name: name,
                marked: marked
            },
            chatNotify: chatNotify
        });

        this.getMessageHistory(cid);
    };

    /***
     *
     * customerSuccess send message to customer
     *
     * @param msg
     */
    customerSuccessMessage = (msg) => {
        let {customerSelect, messageLists, csAvatar, socket} = this.state,
             cid = customerSelect.cid;

        if (msg !== '') {
            let msgArr = messageLists[cid],
                d = new Date();

            msgArr.push({
                msgAvatar: csAvatar,
                msgText: msg,
                msgType: 1,
                msgTime: d
            });
            messageLists[cid] = msgArr;

            this.setState({
                messageLists: messageLists
            });
            socket.emit('cs.message', cid, msg, function(success){
                if (success){
                    document.querySelector('.t-'+d.getTime()).className += ' done';
                }
            });

        }

    };
    /***
     *
     * @returns {boolean}
     */

    menuIconClick = (index) => {
        this.setState({
            menuIcons: {
                chat: (index === "1" ? 'chat_selected' : 'chat'),
                contact: (index === "2" ? 'contact_selected' : 'contact'),
                setting: (index === "3" ? 'setting_selected' : 'setting')
            }
        });
    };

    /***
     *
     * Close the customer dialog
     *
     */
    closeDialog = (e, cid, type) => {
        e.stopPropagation();
        let {customerLists, messageLists, customerSelect, socket} = this.state,
            scid = customerSelect.cid,
            name = customerSelect.name,
            _self = this,
            title = 'Do you Want to close this customer?',
            content = 'If yes , the customer window will be remove';

        if (type === 'offline') {
            title = 'Do you Want to close this offline message?';
            content = 'If yes , the offline message will be remove';
        }

        Modal.confirm({
            title: title,
            content: content,
            okText: 'Yes',
            cancelText: 'No',
            onOk() {
                delete messageLists[cid];
                customerLists && customerLists.map((c, i) => c.cid === cid &&  customerLists.splice(i, 1));

                if (type === 'offline') {
                    _self.setState({
                        customerLists: customerLists
                    });
                    return false;
                }

                if (customerLists.length > 0) {
                    if (scid === cid){
                        scid = customerLists[0].cid;
                        name = customerLists[0].name;
                    }
                } else {
                    scid = '';
                    name = '';
                }

                socket.emit('cs.closeDialog', cid, function(flag){
                    if (flag){
                        _self.setState({
                            customerLists: customerLists,
                            messageLists: messageLists,
                            customerSelect: {
                                cid: scid,
                                name: name
                            }
                        });
                    }
                });
            }
        });
    };

    /***
     * socketTransfer
     */
    socketTransfer = (cid) => {

        let {customerLists, messageLists, customerSelect} = this.state,
            scid = customerSelect.cid,
            name = customerSelect.name;

        delete messageLists[cid];

        customerLists && customerLists.map((c, i) => c.cid === cid &&  customerLists.splice(i, 1));

        if (customerLists.length > 0) {
            if (scid === cid) {
                scid = customerLists[0].cid;
                name = customerLists[0].name;
            }
        } else {
            scid = '';
            name = '';
        }
        this.setState({
            customerLists: customerLists,
            messageLists: messageLists,
            customerSelect: {
                cid: scid,
                name: name
            }
        });
    };
    /***
     *
     * User login out
     *
     */
    loginOut = (e) => {
        e.preventDefault();
        let { socket } = this.state;
        Modal.confirm({
            title: 'Login out',
            content: 'Do you comfirm login out?',
            cancelText: 'No',
            okText: 'Yes',
            onOk: function(){
                fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .then((res)=>res.json())
                .then(function(d){
                    if (d.code === 200){
                        socket.emit('cs.logout',function(type){});
                        socket.close();
                        window.location.href = '/login';
                    }
                })
                .catch(function(e){});
            }
        });
    };

    /***
     *
     *   status handle
     */
    statusHandle = (type) => {
        this.state.socket.emit('cs.status', this.state.customerSelect.cid, type, function(state){});
    };

    /***
     * get customerSuccess and customer chat history
     *
     */
    getMessageHistory = (cid) => {
        let _self = this;

        if (_self.state.messageLists[cid] && _self.state.messageLists[cid].length > 0) {
            return false;
        }

        fetch('/messages/customer/'+cid+'/cs/'+this.state.csid)
            .then((data) => data.json())
            .then(d =>{
                let historyMessage = _self.state.messageLists,
                    avatar = _self.state.csAvatar;

                if (!historyMessage[cid] ) {
                    historyMessage[cid]=[];
                }

                d.msg.map((dd) =>{
                    return historyMessage[cid].push({
                        msgAvatar: (dd.type === 1) ? avatar : '',
                        msgText: dd.msg,
                        msgType: dd.type,
                        msgTime: dd.createdAt
                    });
                });

                _self.setState({
                    messageLists: historyMessage
                });

            })
            .catch(function(e){});
    };

    /***
     *
     * filterCustomerInfo
     *
     */
    filterCustomerInfo = (customer, cid) => {
        let cdata = null;
        if (customer.length > 0) {
            for (var i = 0, l = customer.length; i < l; i++) {
                if (customer[i].cid === cid) {
                    cdata = customer[i];
                    break;
                }
            }
        }
        return cdata;
    };

    /***
     * @returns {boolean}
     *       statusToggle
     */
    statusToggle = () => {
        let state = this.state,
            status = state.isOnline,
            stat = 1;

        if (state.isConnectErr) {
           this.createSocket();
            notification.close("errNotifyKey");
        } else {
            if (status) {
                stat = 2;
                status = false;
            } else {
                stat = 1;
                status = true;
            }
            state.socket.emit('cs.changeOnOff', stat, function(isToggle){});
            this.setState({
                isOnline: status
            });
        }

    };

    /***
     * avatarHandle
     */
    avatarHandle = (avatar) => {
        this.setState({
            csAvatar: avatar
        });
    };
    chatListShow = () => {
        document.querySelector('.customerSuccess-left').className += ' left-menu-show';
    };
    chatListHide = () => {
        document.querySelector('.customerSuccess-left').className='customerSuccess-left';
    };
    csShortcuts = (action, shortcut) => {
        shortcut.action = action;
        localStorage.setItem('newShortcut', JSON.stringify(shortcut));
    };
    render(){

        let {customerLists, customerSelect, chatNotify, messageLists, isOnline, isConnectErr, csAvatar, csName, csEmail, menuIcons, csid, socket} = this.state,
            cArr = [],
            Info = this.filterCustomerInfo(customerLists, customerSelect.cid);

        if (customerLists.length > 0) {
            customerLists.forEach((chat, index)=>{
                if (chat.cid !== '') {

                    let {msg, cid, name, type, marked} = chat,
                        num = (!chatNotify[cid]) ? 0 : chatNotify[cid],
                        isActive = (customerSelect.cid === cid);

                    if (type && type === 'offline') {
                        cArr.push(<Chat key={index} email={msg} cid={cid} name={name} type={type} closeDialog={this.closeDialog}  />);
                    } else {
                        cArr.push(<Chat key={index} marked={marked} cid={cid} newMsg={messageLists[cid]} name={name} num={num} closeDialog={this.closeDialog} onChatListClick={this.onChatListClick} isActive={isActive} />);
                    }
                }
            });
        }

        return (
            <div className={"uuchat-customerSuccess " + ((!isOnline || isConnectErr) ? " off" : "")}>
                    <div className="customerSuccess-header">
                        <Row>
                            <Col xs={0} sm={6} md={6} lg={6} xl={6}>
                                <div className="user-status">
                                    <div className="status-bar" onClick={this.statusToggle}>
                                        {isConnectErr ?
                                            <p><i className="off"></i> Disconnected, Click to reconnect</p>
                                            :
                                            <p><i className={isOnline ? '' : 'off'}></i>{isOnline ? '' : 'Not '}Accepting New Chats</p>
                                        }

                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={18} md={18} lg={18} xl={18} className="user-avatar">
                                 <div className="user-avatar-box">
                                    {customerSelect.cid !== '' && <div className="m-menu" onClick={this.chatListShow}></div>}
                                     <img src={ (csAvatar !=='null' && csAvatar) ? '/'+csAvatar
                                         : require('../static/images/contact.png')} alt="avatar" title="avatar" />&nbsp;&nbsp;
                                     <a href="" className="logout" onClick={this.loginOut}>
                                         LOGOUT &nbsp;{csName || csEmail}
                                     </a>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <Row className="customerSuccess-main">
                        <Col xs={24} sm={7} md={7} lg={6} xl={6}>
                            <div className="customerSuccess-left" onClick={this.chatListHide}>
                                <div className="left-menu">
                                   <form method="get" action="/search" target="_blank" className="">
                                       <Input.Search
                                            placeholder="Type text and enter"
                                            onPressEnter={this.onSearchHandler}
                                            name="search"
                                        />
                                    </form>
                                </div>
                                <Tabs defaultActiveKey="1" onTabClick={this.menuIconClick}>
                                    <TabPane tab={<ChatIcon name={menuIcons.chat} />} key="1">
                                            <ul className="customer-lists">
                                            {cArr}
                                            </ul>
                                    </TabPane>
                                    <TabPane tab={<ChatIcon name={menuIcons.contact} />} key="2">
                                         <ChatList csid={csid} csAvatar={csAvatar} />
                                    </TabPane>
                                    <TabPane tab={<ChatIcon name={menuIcons.setting} />} key="3">
                                        <ChatSetting name={csName} csid={csid} avatarHandle={this.avatarHandle} />
                                    </TabPane>
                                </Tabs>
                            </div>
                        </Col>
                        <Col xs={24} sm={11} md={11} lg={12} xl={12}>
                            <div className="customerSuccess-content">
                            {
                                customerSelect.cid !== '' &&
                                <ChatMessage
                                    socket={socket && socket}
                                    cid={customerSelect.cid}
                                    csid={csid}
                                    csAvatar={csAvatar}
                                    messageLists={messageLists[customerSelect.cid]}
                                    chatRoleName={customerSelect.name}
                                    transferHandle={this.socketTransfer}
                                    marked={customerSelect.marked }
                                    />
                            }
                            {
                                customerSelect.cid !== '' &&
                                <ChatSend
                                    sendMessage={this.customerSuccessMessage}
                                    statusHandle={this.statusHandle}
                                    cid={customerSelect.cid}
                                    csid={csid}
                                    socket={socket}
                                    />
                            }
                            {
                                customerSelect.cid ==='' && <ChatEmpty />
                            }
                            </div>
                        </Col>
                        <Col xs={24} sm={6} md={6} lg={6} xl={6}>
                            <div className="customerSuccess-right">
                                { customerSelect.cid !== "" && <ChatUser info={Info} />}
                            </div>
                        </Col>
                    </Row>
            </div>
        );
    }

}


export default CustomerSuccess;