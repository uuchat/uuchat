import React, { Component } from 'react';
import { Row, Col, notification, Modal } from 'antd';

class Header extends Component{

    statusToggle = () => {
        let state = this.props.customerSuccess.state,
            status = state.isOnline,
            stat = 1;

        if (state.isConnectErr) {
            this.props.customerSuccess.createSocket();
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
            this.props.customerSuccess.setState({
                isOnline: status
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
                            window.location.href = '/login';
                        }
                    })
                    .catch(function(e){});
            }
        });
    };

    render() {
        let { isConnectErr, isOnline, customerSelect, csAvatar, csName, csEmail } = this.props.customerSuccess.state;

        return (
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
                            {customerSelect.cid && <div className="m-menu" onClick={this.chatListShow}></div>}
                            <img src={ csAvatar ? '/'+csAvatar : require('../../static/images/contact.png')} alt="avatar" title="avatar" />&nbsp;&nbsp;
                            <a className="logout" onClick={this.loginOut}>
                                LOGOUT &nbsp;{csName || csEmail}
                            </a>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}


export default Header;