/**
 * Created by lwc on 2017/5/5.
 */
import React, {Component} from 'react';
import {Modal} from 'antd';
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
        this.marked = this.marked.bind(this);
        this.optionSelect = this.optionSelect.bind(this);
        this.markOk = this.markOk.bind(this);
        this.markCancel = this.markCancel.bind(this);
        this.markColorSelect = this.markColorSelect.bind(this);
        this.csOnlineInfo = this.csOnlineInfo.bind(this);
        this.transfer = this.transfer.bind(this);
    }
    componentDidMount(){

        var markedList = this.state.markedList;

        if(!markedList[this.props.cid]){
            markedList[this.props.cid] = this.props.marked
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

    marked(e){
        var isms = this.state.isMarkShow;
        this.setState({
            isMarkShow: !isms
        });
    }
    optionSelect(e){
        e.stopPropagation();
        var type = e.target.getAttribute('data-type'),
            that = this;

        if('m' === type){
            this.setState({
                visible: true
            });
        }else if('t' === type){
            var onlineLists = [],
                ocl = that.state.OnlineCustomerList;

            for(var i in ocl){
                if(i !== that.props.csid){
                    onlineLists.push({
                        name: i,
                        info: ocl[i]
                    })
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
                        that.setState({
                            isMarkShow: false
                        });
                   }
            });
        }
    }
    markOk(){
        this.setState({
            visible: false,
            isMarkShow: false
        });
    }

    markCancel(){
        this.setState({
            visible: false,
            isMarkShow: false
        });
    }
    markColorSelect(e){
        var t = e.target,
            that = this,
            markedList = this.state.markedList;

        if(t.tagName.toLowerCase() === 'span') {
            this.props.socket.emit('cs.marked', this.props.cid, this.props.csid, parseInt(t.innerHTML, 10), function (type) {
                if (type) {
                    markedList[that.props.cid]=parseInt(t.innerHTML, 10);
                    that.setState({
                        markedList: markedList
                    });
                }
            });
        }
    }

    csOnlineInfo(data){
        if(Object.keys(this.state.OnlineCustomerList).length !== Object.keys(data).length){
              this.setState({
                  OnlineCustomerList: data
              });
        }
    }
    transfer(e){
        var t = e.target,
            csid = t.getAttribute('data-csid'),
            that = this;

        this.props.socket.emit('cs.dispatch', csid, this.props.cid, function(success){
            if(success){
                that.props.transferHandle(that.props.cid);
                onlineListModal.destroy();
            }
        });

    }

    render(){
        var markArr = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'grey'],
            cIndex = String2int(this.props.cid),
            avatar = '',
            marked = this.state.markedList[this.props.cid] ? this.state.markedList[this.props.cid] : this.props.marked;


        avatar = <div className={"avatar-color avatar-icon-"+cIndex} >{this.props.chatRoleName.substr(0,1).toUpperCase()}</div>;


        return (
            <div className="chat-message">
                <div className="message-title">U-{this.props.chatRoleName.toUpperCase()}
                    <div className="chat-tags fr" onClick={this.marked}>...
                         <ul className="more-options" style={{display: !this.state.isMarkShow ? 'none' : 'block'}} onClick={this.optionSelect}>
                            <span className="caret"></span>
                            <h3>List Actions <span className="fr options-close" onClick={this.markOk}>╳</span></h3>
                            <li data-type="m">Mark</li>
                            <li data-type="t">Transfer</li>
                        </ul>
                        <Modal
                            title="Mark customer for favorite color"
                            okText="Ok"
                            cancelText="Cancel"
                            visible={this.state.visible}
                            onOk={this.markOk}
                            onCancel={this.markCancel}
                        >
                            <div className="mark-color-list" onClick={this.markColorSelect}>
                                {markArr.map((m ,i)=>
                                        <span key={i} className={"mark-tag tag-"+m+(marked === (i+1) ? "  selected" : "")} title={"mark "+m}>{i+1}</span>
                                )}
                            </div>
                        </Modal>
                    </div>
                </div>
                <div className="message-lists" ref="list">
                    {
                        this.props.messageLists && this.props.messageLists.map((msg, index) =>
                            <ChatMessageItem key={index} ownerType={msg.msgType} ownerAvatar={ (msg.msgType === 1 ) ? this.props.csAvatar : avatar } ownerText={msg.msgText} time={msg.msgTime} />
                        )
                    }
                </div>
            </div>
        );

    }
}

export default ChatMessage;