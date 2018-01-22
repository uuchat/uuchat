import React, { Component } from 'react';
import {Modal} from 'antd';
import Tips from '../common/tips';

class ChatUser extends Component{

    constructor() {
        super();
        this.state = {
            emailModalVisible: false
        };
    }

    writeEmail = () => {
        this.setState({
            emailModalVisible: true
        });
    };

    cancelSendEmail = () => {
        this.setState({
            emailModalVisible: false
        });
    };

    sendEmail = () => {

        let subject = this.refs.subject.value;
        let content = this.refs.content.innerHTML;
        let sendValid = true;

        if (subject === '') {
            this.refs.subject.style.border = '1px solid #ff0000';
            sendValid = false;
        }

        if (content === 'Hi!' || content === '') {
            this.refs.content.style.border = '1px solid #ff0000';
            sendValid = false;
        }

        if (sendValid) {
            let {cid, email} = this.props.info;
            let csid = localStorage['uuchat.csid'];
            let _self = this;

            fetch('/messages/customer/'+cid+'/cs/'+csid+'/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'to='+email+'&subject='+subject+'&message='+content
            }).then(d => d.json()).then(d => {
                if (d.code === 200) {
                    Tips.success('Email to '+email+' is send success!');
                    _self.setState({
                        emailModalVisible: false
                    });
                } else {
                    Tips.error(d.msg);
                }
            }).catch(e => {
                Tips.error(e);
            });
        }

    };

    InputStyleReset = (e) => {
        e.target.style.border = '1px solid #f8fafc';
    };

    render(){

        let {emailModalVisible} = this.state;
        let info  = this.props.info;
        let infoArr = [];
        let hasEmail = false;

        for (let key in info) {
            if (key === 'email' && info[key]) {
                hasEmail = true;
            }
            infoArr.push(<tr key={key}><td className="user-td">{key}:</td><td>{info[key]}</td></tr>);
        }

        return (
            <div className="chat-user">
                <div className="user-header">USER-Infomation</div>
                <div className="user-body">
                    <table>
                        <tbody>
                            {infoArr}
                        </tbody>
                    </table>
                </div>
                {hasEmail && <div className="user-contact"><a href="javascript:;" className="ant-btn ant-btn-primary" onClick={this.writeEmail}>Email To {info.email}</a></div>}
                <Modal
                    title="Send Email For The Offline Customer"
                    visible={emailModalVisible}
                    okText="Send"
                    cancelText="Cancel"
                    onCancel={this.cancelSendEmail}
                    onOk={this.sendEmail}
                    className="email-modal"
                >
                    <div className="email-body">
                        <div className="email-title"><b>TO: </b> <i>{info.email}</i></div>
                        <div className="email-subject"><input type="text" placeholder="Enter email subject" ref="subject" onFocus={this.InputStyleReset} /></div>
                        <div contenteditable="true" className="email-content" ref="content" onFocus={this.InputStyleReset} >Hi!</div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default ChatUser;