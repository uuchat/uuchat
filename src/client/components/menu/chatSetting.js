import React, { Component } from 'react';
import { Modal, Input, Upload, Icon, message } from 'antd';
import Theme from './chatTheme';

class ChatSetting extends Component{
    constructor(){
        super();
        this.state = {
            isAccountShow: false,
            isPasswordShow: false,
            isUploading: false,
            isSetVisible: false,
            isThemeSet: false,
            setContent: '',
            percent: 0,
            opacity: localStorage['bgThemeOpacity'] || 0.7,
            avatar: require('../../static/images/contact.png')
        };
    }
    accountHandle = () => {
        let isAccountShow = this.state.isAccountShow;

        this.setState({
            isAccountShow: !isAccountShow
        });
    };
    accountSave = () => {

        let name = this.refs.name.input.value;
        let displayName = this.refs.displayName.input.value;
        let _self = this;

        if (name !=='') {
            fetch('/customersuccesses/'+this.props.csid, {
                credentials: 'include',
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'name='+name+'&displayName='+displayName
            })
            .then((res)=>res.json())
            .then(function(d){
                if (d.code === 200) {
                    message.success('Save success!');
                    _self.setState({
                        isAccountShow: false
                    });
                }
            })
            .catch(function(e){
                message.error(e, 4);
            });
        } else {
            this.refs.name.refs.input.style.border = '1px solid red';
        }
    };
    passwordHandle = () => {
        let isPasswordShow = this.state.isPasswordShow;
        this.setState({
            isPasswordShow: !isPasswordShow
        });
    };
    passwordSave = (e) => {
        let _self = this;
        let passwd = this.refs.passwd.input.value.replace(/^\s$/g, '');
        let cpasswd = this.refs.cpasswd.input.value.replace(/^\s$/g, '');

        if (passwd === '' || (passwd !== cpasswd)) {
            message.error('password must be same as confirm password and can not be empty');
            return false;
        }

        fetch('/customersuccesses/'+this.props.csid+'/passwd', {
            credentials: 'include',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'passwd='+passwd
        })
        .then((res)=>res.json())
        .then(function(d){
            if (d.code === 200) {
                message.success('Change passwd success!');
                _self.setState({
                    isPasswordShow: false
                });
                window.location.href = '/';
            }
        })
        .catch(function(e){
            message.error(e, 4);
        });
    };
    themeSetting = () => {
        let isThemeSet = this.state.isThemeSet;
        this.setState({
            isThemeSet: !isThemeSet
        });
    };
    themeClose = () => {
        let csid = localStorage.getItem('uuchat.csid');
        let bgThemeImg = localStorage.getItem('bgThemeImg');
        let bgThemeOpacity = localStorage.getItem('bgThemeOpacity');

        fetch('/customersuccesses/'+csid+'/theme', {
            credentials: 'include',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'background='+bgThemeImg+'&opacity='+bgThemeOpacity
        }).then(res => res.json()).then(d => {});
        this.setState({
            isThemeSet: false
        });
    };
    backgroundSelect = (e) => {
        if (e.target.tagName.toLocaleLowerCase() === 'span') {
            let { customerSuccess } = this.props;
            let theme = e.target.getAttribute('data-value').split('?')[0];

            customerSuccess.setState({bgThemeImg: theme});
            localStorage.setItem('bgThemeImg', theme);
        }
    };
    themeOpacityChange = (e) => {
        let { customerSuccess } = this.props;
        let op = e.target.value;

        this.setState({opacity: op});
        customerSuccess.setState({bgThemeOpacity: op});
        localStorage.setItem('bgThemeOpacity', op);
    };
    shortcutSet = () => {
        let csid = this.props.csid;
        if (this.state.setContent){
            this.setState({
                isSetVisible: true
            });
            return false;
        }
        import('../console/shortcuts/shortcuts').then(s => {
            this.setState({
                setContent: <s.default csid={csid} />,
                isSetVisible: true
            });
        }).catch(e=>{});
    };
    shortcutClose = () => {
        this.setState({
            isSetVisible: false
        });
    };
    beforeUpload = (file) => {
        let isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!', 4);
        }
        if (!/(.jpg|.png|.gif|.jpeg)/g.test(file.name)) {
            message.error('Image type must be jpg、jpeg、png、gif!', 4);
            isLt2M = false;
        }
        return isLt2M;
    };
    render(){
        let {setContent, isAccountShow, isPasswordShow, avatar, percent, isUploading, isSetVisible, isThemeSet, opacity } = this.state;
        let {csid, avatarHandle, name} = this.props;
        let _self = this;
        let props = {
                name: 'avatars',
                action: '/customersuccesses/'+csid+'/avatar',
                accept: 'image/*',
                showUploadList: false,
                headers: {
                    authorization: 'authorization-text'
                },
                beforeUpload: _self.beforeUpload,
                onChange(info) {
                    let file = info.file;
                    if (file.status === 'uploading') {
                        if (info.event){
                            _self.setState({
                                isUploading: true,
                                percent: Math.ceil(info.event.percent)
                            });
                        }
                    } else if (file.status === 'done') {
                        if (file.response.code === 200) {
                            let photo = file.response.msg.photo;
                            localStorage.setItem('uuchat.avatar', photo+'?t='+(new Date()).getTime());
                            avatarHandle(photo);
                            setTimeout(function(){
                                _self.setState({
                                    avatar: photo,
                                    isUploading: false
                                });
                            }, 800);
                        }
                    } else if (file.status === 'error') {
                        message.error(file.name+' file upload failed.');
                    }
                }
            };

        return (
            <ul className="customerSuccess-setting">
                <li onClick={this.accountHandle}>Your account
                    <Modal
                        title={"Edit "+name}
                        visible={isAccountShow}
                        cancelText="Cancel"
                        okText="Save"
                        onCancel={this.accountHandle}
                        onOk={this.accountSave}
                    >
                        <div>
                            <div className="account-item">
                                <p>Contact email:</p>
                                <Input value={localStorage['uuchat.email']} readOnly />
                            </div>
                            <div className="account-item">
                                <p>Display name:</p>
                                <Input defaultValue={(localStorage['uuchat.displayName'] !=='' ? localStorage['uuchat.displayName'] : name)} ref="displayName" />
                            </div>
                            <div className="account-item">
                                <p>Username:</p>
                                <Input defaultValue={name} ref="name" />
                            </div>
                            <div className="account-item">
                                <p>Avatar size(100x100)</p>
                                <div className="avatar-box">
                                    <img width="112" height="112" src={(localStorage['uuchat.avatar'] !=='' ? localStorage['uuchat.avatar'] : avatar)} alt="" />
                                    <div className="avatar-process" style={{display: isUploading ? 'block' : 'none'}}>{percent}%</div>
                                </div>
                                <div className="avatar-upload"><Upload {...props}><Icon type="upload" /> Upload </Upload> </div>
                            </div>
                        </div>
                    </Modal>
                </li>
                <li onClick={this.passwordHandle}>Change password
                    <Modal
                        title="Change Password"
                        visible={isPasswordShow}
                        cancelText="Cancel"
                        okText="Save"
                        onCancel={this.passwordHandle}
                        onOk={this.passwordSave}
                    >
                        <div className="change-passwd">
                            <p>New password</p>
                            <Input type="password" placeholder="min 6 words" ref="passwd" />
                            <p>Confirm new password</p>
                            <Input type="password" placeholder="Confirm password" ref="cpasswd" />
                        </div>
                    </Modal>
                </li>
                <li onClick={this.shortcutSet}>Shortcut settings
                    <Modal
                        title="Shortcuts"
                        visible={isSetVisible}
                        onCancel={this.shortcutClose}
                        width="88%"
                        footer={null}
                    >
                          {setContent}
                    </Modal>
                </li>
                <li onClick={this.themeSetting}>Change background
                    <Modal
                        title="Change background"
                        visible={isThemeSet}
                        cancelText="Cancel"
                        okText="Save"
                        width="710"
                        footer={null}
                        onCancel={this.themeClose}
                    >
                        <Theme backgroundSelect={this.backgroundSelect} themeOpacityChange={this.themeOpacityChange} opacity={opacity} />
                    </Modal>
                </li>
            </ul>
        );
    }
}

export default ChatSetting;