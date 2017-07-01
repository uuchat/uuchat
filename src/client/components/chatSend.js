/**
 * Created by lwc on 2017/5/5.
 */

import React, {Component} from 'react';
import { Input, Icon, Upload, message, Modal, Progress } from 'antd';
import EmojiPicker from './chatEmoji';
import {cutStr} from './utils';

/**
 * ChatSend Component
 *
 *
 */
class ChatSend extends Component{

    constructor(props){
        super(props);
        this.state = {
            percent: 0,
            isSendReady: false,
            isEmojiShow: false,
            textereaValue: "",
            socket: props.socket,
            isShowProcess: false
        };

        this.sendMessage = this.sendMessage.bind(this);
        this.emojiBtnHandle = this.emojiBtnHandle.bind(this);
        this.addEmojiHandle = this.addEmojiHandle.bind(this);
        this.textChangeHandle = this.textChangeHandle.bind(this);
        this.textFocusHandle = this.textFocusHandle.bind(this);
        this.blurHandle = this.blurHandle.bind(this);
        this.rateHandle = this.rateHandle.bind(this);
    }
    /***
     *
     * @param e
     */
    textChangeHandle(e){
        this.setState({
            textereaValue: e.target.value.substr(0, 512)
        });
        this.props.statusHandle(1);
    }
    blurHandle(){
        this.props.statusHandle(2);
    }
    textFocusHandle(){
        this.setState({
            isEmojiShow: false
        });
    }
    /***
     *
     * @param e
     */

    sendMessage(e){
        e.preventDefault();
        var msgVal = e.target.value,
            msg = msgVal.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /gi, '&nbsp;').replace(/\n/gi, '#');

        if(msgVal.length > 0){
            this.props.sendMessage(cutStr(msg, 256));
        }
        this.setState({
            isEmojiShow: false,
            textereaValue: "",
            isSendReady: true
        });
    }
    /***
     *
     */
    emojiBtnHandle(){
        this.setState({
            isEmojiShow: !this.state.isEmojiShow
        })
    }

    /***
     *
     * @param emoj
     */
    addEmojiHandle(emoji){
        this.insertToCursorPosition(this.state.textereaValue, emoji);
    }

    insertToCursorPosition(s1, s2){
        var obj = document.getElementsByClassName("chat-textarea")[0];
        obj.focus();
        if(document.selection) {
            var sel = document.selection.createRange();
            sel.text = s2;
        }else if(typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
            var startPos = obj.selectionStart,
                endPos = obj.selectionEnd,
                cursorPos = startPos,
                tmpStr = s1;

            var s3 = tmpStr.substring(0, startPos) + s2 + tmpStr.substring(endPos, tmpStr.length);

            this.setState({
                textereaValue: s3
            });
            cursorPos += s2.length;
            obj.selectionStart = obj.selectionEnd = cursorPos;
        }else{
             this.setState({
                textereaValue: this.state.textereaValue+ s2 +" "
             });
        }
    }
    rateHandle(e){
        var that = this;
        Modal.confirm({
            title: 'Invite user rate',
            okText: 'Yes',
            cancelText: 'Cancel',
            content: (
                <p>Are you sure invite the user rate?</p>
            ),
            onOk(){
                message.success('Invitation has been sent!', 4);
                that.props.socket && that.props.socket.emit('cs.rate', that.props.cid, function(success){
                    if(success){
                    }else{
                    }
                });
            }
        });
    }

    render(){
        var sendMessage = this.props.sendMessage,
            that = this;

        const props = {
            name: 'image',
            action: '/messages/customer/'+this.props.cid+'/cs/'+this.props.csid+'/image',
            accept: 'image/*',
            headers: {
                authorization: 'authorization-text',
            },
            onChange(info) {
                var status = info.file.status;

                if(status === 'uploading'){
                    if(info.event){
                        that.setState({
                            isShowProcess: true,
                            percent: info.event.percent
                        });
                    }
                }else if (status === 'done') {
                    if(200 === info.file.response.code){
                        sendMessage(info.file.response.msg.resized+'|'+info.file.response.msg.original);
                    }
                    message.success(info.file.name+' file uploaded successfully', 2, function(){
                        that.setState({
                            isShowProcess: false
                        });
                    });
                } else if (status === 'error') {
                    message.error(info.file.name+' file upload failed.', 2, function(){
                        that.setState({
                            isShowProcess: false
                        });
                    });
                }
            }
        };
        return (
            <div className="chat-send">
                <Progress type="circle" percent={this.state.percent} className="upload-process" width={60} style={{display: this.state.isShowProcess ? 'block' : 'none'}} />
                <div className="send-tools">
                    <div className="tool-box tool-emoji">
                        <Icon onClick={this.emojiBtnHandle} className={"emoji-icon "+(this.state.isEmojiShow ? 'active' : '')} />
                        {
                            this.state.isEmojiShow &&  <EmojiPicker addEmojiHandle={this.addEmojiHandle} />
                        }
                    </div>
                    <div className="tool-box">
                        <Upload {...props}>
                            <Icon type="folder" className="upload-icon" />
                        </Upload>
                    </div>
                    <div className="tool-box">
                        <span className="rate-icon" title="Invite user evaluation" onClick={this.rateHandle}></span>
                    </div>
                </div>
                <div className="chat-text">
                <Input
                    type="textarea"
                    className="chat-textarea"
                    onPressEnter={this.sendMessage}
                    placeholder={this.state.isSendReady ? "" : "Input text and press enter to send(max 256 words)"}
                    onChange={this.textChangeHandle}
                    value={this.state.textereaValue}
                    onFocus={this.textFocusHandle}
                    onBlur={this.blurHandle}
                    maxLength="256"
                    />
                </div>
            </div>

        );
    }
}

export default ChatSend;