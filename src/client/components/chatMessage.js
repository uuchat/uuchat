import React, { Component } from 'react';
import { Modal } from 'antd';
import ChatMessageItem from './chatMessageItem';
import String2int from './utils';

var onlineListModal = null;

class ChatMessage extends Component{

    constructor(){
        super();
        this.state = {
            isMarkShow: false,
            visible: false,
            OnlineCustomerList: {},
            onlineShow: null,
            markedList: {}
        };
    }
    componentDidMount(){

        let markedList = this.state.markedList;

        if (!markedList[this.props.cid]) {
            markedList[this.props.cid] = this.props.marked;
        }

        this.setState({
            markedList: markedList
        });
        this.props.socket && this.props.socket.on('cs.online.info', this.csOnlineInfo);
    }
    componentWillUnmount(){
        this.props.socket && this.props.socket.off('cs.online.info');
    }
    componentDidUpdate(){
        var msgList = this.refs.list;
        msgList.scrollTop = msgList.scrollHeight;
    }

    marked = (e) => {
        let isms = this.state.isMarkShow;
        this.setState({
            isMarkShow: !isms
        });
    };
    optionSelect = (e) => {
        e.stopPropagation();
        let type = e.target.getAttribute('data-type'),
            _self = this;

        if (type === 'm') {
            this.setState({
                visible: true
            });
        } else if (type === 't') {
            let onlineLists = [],
                ocl = _self.state.OnlineCustomerList;

            for (let i in ocl) {
                if (i !== _self.props.csid){
                    onlineLists.push({
                        name: i,
                        info: ocl[i]
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
                                    <span className="online-avatar fl"> {cs.info[1] !=='' ? <img width="100%" src={cs.info[1]} alt="" /> : <img width="100%" src={require('../static/images/contact.png')} alt="" /> }</span>
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
        }
    };
    markOk = () => {
        this.setState({
            visible: false,
            isMarkShow: false
        });
    };

    markCancel = () => {
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
            t = e.target,
            csid = t.getAttribute('data-csid');

       socket.emit('cs.dispatch', csid, cid, function(success){
            if (success) {
                transferHandle(cid);
                onlineListModal.destroy();
            }
        });

    };

    render(){
        let {markedList, visible, isMarkShow} = this.state,
            {cid, marked, chatRoleName, messageLists, csAvatar} = this.props,
            markArr = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'grey'],
            cIndex = String2int(cid),
            avatar = '',
            hasMarked = markedList[cid] ? markedList[cid] : marked;

        avatar = <div className={"avatar-color avatar-icon-"+cIndex} >{chatRoleName.substr(0,1).toUpperCase()}</div>;

        return (
            <div className="chat-message">
                <div className="message-title">U-{chatRoleName.toUpperCase()}
                    <div className="chat-tags fr" onClick={this.marked}>...
                         <ul className="more-options" style={{display: !isMarkShow ? 'none' : 'block'}} onClick={this.optionSelect}>
                            <span className="caret"></span>
                            <h3>List Actions <span className="fr options-close" onClick={this.markOk}>╳</span></h3>
                            <li data-type="m">Mark</li>
                            <li data-type="t">Transfer</li>
                        </ul>
                        <Modal
                            title="Mark customer for favorite color"
                            okText="Ok"
                            cancelText="Cancel"
                            visible={visible}
                            onOk={this.markOk}
                            onCancel={this.markCancel}
                        >
                            <div className="mark-color-list" onClick={this.markColorSelect}>
                                {markArr.map((m ,i)=>
                                        <span key={i} className={"mark-tag tag-"+m+(hasMarked === (i+1) ? "  selected" : "")} title={"mark "+m}>{i+1}</span>
                                )}
                            </div>
                        </Modal>
                    </div>
                </div>
                <div className="message-lists" ref="list">
                    {
                        messageLists && messageLists.map((msg, index) =>
                            <ChatMessageItem
                                    key={index}
                                    ownerType={msg.msgType}
                                    ownerAvatar={ (msg.msgType === 1 ) ? csAvatar : avatar }
                                    ownerText={msg.msgText} time={msg.msgTime}
                                    shortSetting={true}
                                    />
                        )
                    }
                </div>
            </div>
        );

    }
}

export default ChatMessage;