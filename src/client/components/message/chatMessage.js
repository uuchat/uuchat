import React, { Component } from 'react';
import { Modal } from 'antd';
import ChatMessageItem from './chatMessageItem';
import String2int from '../common/utils';

var onlineListModal = null,
    record = {};

class ChatMessage extends Component{

    constructor(){
        super();
        this.state = {
            isMarkShow: false,
            visible: false,
            OnlineCustomerList: {},
            onlineShow: null,
            markedList: {},
            historyChatMessage: []
        };
    }
    componentDidMount(){

        let {markedList} = this.state,
            {cid, marked, socket} = this.props;

        if (!markedList[cid]) {
            markedList[cid] = marked;
        }

        this.setState({
            markedList: markedList
        });

        socket && socket.on('cs.online.info', this.csOnlineInfo);
    }
    componentWillUnmount(){
        this.props.socket && this.props.socket.off('cs.online.info');
    }
    componentDidUpdate(){
        let msgList = this.refs.list;

        if (record[this.props.cid].isLoading) {
            record[this.props.cid].isLoading = false;
            return false;
        }

        msgList.scrollTop = msgList.scrollHeight;

    }

    marked = () => {
        let isMarkShow = this.state.isMarkShow;
        this.setState({
            isMarkShow: !isMarkShow
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
        let _self = this,
            onlineLists = [],
            onlines = _self.state.OnlineCustomerList;

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
                    isMarkShow: false
                });
            }
        });
    };
    markHide = () => {
        this.setState({
            visible: false,
            isMarkShow: false
        });
    };

    markColorSelect = (e) => {
        let {cid, csid, socket} = this.props,
            t = e.target,
            _self = this,
            markedList = this.state.markedList;

        if (t.tagName.toLowerCase() === 'span') {
            socket.emit('cs.marked', cid, csid, parseInt(t.innerHTML, 10), function (type) {
                if (type) {
                    markedList[cid]=parseInt(t.innerHTML, 10);
                    _self.setState({
                        markedList: markedList
                    });
                }
            });
        }
    };

    csOnlineInfo = (data) =>{
        if (Object.keys(this.state.OnlineCustomerList).length !== Object.keys(data).length) {
              this.setState({
                  OnlineCustomerList: data
              });
        }
    };
    transfer = (e) => {
        let {socket, cid, transferHandle} = this.props,
            _self = this,
            t = e.target,
            csid = t.getAttribute('data-csid');

       socket.emit('cs.dispatch', csid, cid, function(success){
            if (success) {
                transferHandle(cid);
                _self.setState({
                    isMarkShow: false
                });
                onlineListModal.destroy();
            }
        });

    };

    scrollHandle = (e) => {

        let msgList = this.refs.list,
            {csid, cid, customerSuccess} = this.props,
            {messageLists, csAvatar} = customerSuccess.state;

        if ((e.deltaY < 0) && (msgList.scrollTop <= 0) && record[cid].hasMoreChat && !record[cid].isLoading) {
            record[cid].isLoading = true;
            msgList.className += ' loading';
            requestAnimationFrame(function () {
                getChatHistory();
            });
        }

        function getChatHistory(){

            fetch('/messages/customer/' + cid + '/cs/' + csid+'?pageNum='+record[cid].pageNum+'&pageSize=10')
                .then((data) => data.json())
                .then(d =>{
                    if (d.code === 200) {
                        if (d.msg.length === 0 || d.msg.length < 10) {
                            record[cid].hasMoreChat = false;
                        }
                        record[cid].pageNum++;

                        if (d.msg.length > 0) {
                            d.msg.map(chat => messageLists[cid].unshift({
                                msgAvatar: (chat.type === 1) ? csAvatar : '',
                                msgText: chat.msg,
                                msgType: chat.type,
                                msgTime: chat.createdAt
                            }));
                            customerSuccess.setState({
                                messageLists: messageLists
                            });
                        }

                    }

                    setTimeout(function () {
                        record[cid].isLoading = false;
                        msgList.className = 'message-lists';
                    }, 2000);

                })
                .catch(e => {
                    record[cid].isLoading = false;
                    msgList.className = 'message-lists';
                });
        }

    };

    render(){
        let {markedList, visible, isMarkShow} = this.state,
            {cid, marked, chatRoleName, messageLists, csAvatar} = this.props,
            markArr = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'grey'],
            cIndex = String2int(cid),
            avatar = '',
            hasMarked = markedList[cid] || marked;

        !record[cid] && (record[cid] = {
            pageNum: 2,
            isLoading: false,
            hasMoreChat: true
        });

        hasMarked = (hasMarked < 1 ? 7 : hasMarked);
        avatar = <div className={"avatar-color avatar-icon-"+cIndex} >{chatRoleName.substr(0,1).toUpperCase()}</div>;


        if (messageLists && (messageLists.length === 0 || messageLists.length < 20)) {
            record[cid].hasMoreChat = false;
        }

        return (
            <div className="chat-message">
                <div className="message-title">U-{chatRoleName.toUpperCase()}
                    <div className="chat-tags fr" onClick={this.marked}>...
                         <ul className="more-options" style={{display: !isMarkShow ? 'none' : 'block'}} onClick={this.optionSelect}>
                            <span className="caret"></span>
                            <h3>List Actions <span className="fr options-close" onClick={this.markHide}>╳</span></h3>
                            <li data-type="m"><i className="action-icon mark"></i>Mark</li>
                            <li data-type="t"><i className="action-icon transfer"></i>Transfer</li>
                        </ul>
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
                                        <span key={i} className={"mark-tag tag-"+m+(hasMarked === (i+1) ? "  selected" : "")} title={"mark "+m}>{i+1}</span>
                                )}
                            </div>
                        </Modal>
                    </div>
                </div>
                <div className="message-lists" ref="list" onWheel={this.scrollHandle}>
                    {messageLists && messageLists.map((msg, index) =>
                            <ChatMessageItem
                                    key={msg.msgTime}
                                    ownerType={msg.msgType}
                                    ownerAvatar={ (msg.msgType === 1 ) ? csAvatar : avatar }
                                    ownerText={msg.msgText}
                                    time={msg.msgTime}
                                    shortSetting={true}
                                    />
                    )}
                </div>
            </div>
        );

    }
}

export default ChatMessage;