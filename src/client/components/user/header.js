import React, { Component } from 'react';
import { Row, Col, notification, Modal } from 'antd';

class Header extends Component{

    statusToggle = () => {
        let state = this.props.customerSuccess.state;
        let status = state.status;
        let stat = 1;

        if (status === 3) {
            this.props.customerSuccess.createSocket();
            notification.close("errNotifyKey");
        } else {

            if (status === 1) {
                stat = 2;
            }

            state.socket.emit('cs.changeOnOff', stat, function(isToggle){});
            this.props.customerSuccess.setState({
                status: stat
            });
        }
    };

    chatListShow = () => {
        document.querySelector('.customerSuccess-left').className += ' left-menu-show';
    };

    loginOut = (e) => {
        e.preventDefault();
        let { socket } = this.props.customerSuccess.state;
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
                            window.location.href = '/';
                        }
                    })
                    .catch(function(e){});
            }
        });
    };

    render() {
        let { status, chatActive, avatar, name, csEmail } = this.props.customerSuccess.state;

        return (
            <div className="customerSuccess-header">
                <Row>
                    <Col xs={0} sm={6} md={6} lg={6} xl={6}>
                        <div className="user-status">
                            <div className="status-bar" onClick={this.statusToggle}>
                                {(status === 3) ?
                                    <p><i className="off"></i> Disconnected, Click to reconnect</p>
                                    :
                                    <p><i className={status === 1 ? '' : 'off'}></i>{(status === 1) ? '' : 'Not '}Accepting New Chats</p>
                                }
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={18} md={18} lg={18} xl={18} className="user-avatar">
                        <div className="user-avatar-box">
                            {chatActive.cid && <div className="m-menu" onClick={this.chatListShow}></div>}
                            <img src={ avatar ? '/'+ avatar : require('../../static/images/contact.png')} alt="avatar" title="avatar" />&nbsp;&nbsp;
                            <a className="logout" onClick={this.loginOut}>
                                LOGOUT &nbsp;{name || csEmail}
                            </a>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}


export default Header;