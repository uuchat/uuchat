import React, { Component } from 'react';
import { Modal, Input, Upload, Icon, message } from 'antd';

class ChatSetting extends Component{
    constructor(){
        super();
        this.state = {
            isAccountShow: false,
            isPasswordShow: false,
            isUploading: false,
            isSetVisible: false,
            setContent: '',
            percent: 0,
            avatar: require('../static/images/contact.png')
        };
    }
    accountHandle = () => {
        let isAccountShow = this.state.isAccountShow;

        this.setState({
            isAccountShow: !isAccountShow
        });
    }
    accountSave = () => {
        let name = this.refs.name.refs.input.value,
            displayName = this.refs.displayName.refs.input.value,
            _self = this;

        if(name !==''){
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
                if(200 === d.code){
                    message.success('Save success!');
                    _self.setState({
                        isAccountShow: false
                    });
                }
            })
            .catch(function(e){
                message.error(e, 4);
            });
        }else{
            this.refs.name.refs.input.style.border = '1px solid red';
        }
    }
    passwordHandle = () => {
        let isPasswordShow = this.state.isPasswordShow;
        this.setState({
            isPasswordShow: !isPasswordShow
        });
    }
    passwordSave = (e) => {
        let _self = this,
            passwd = this.refs.passwd.refs.input.value.replace(/^\s$/g, ''),
            cpasswd = this.refs.cpasswd.refs.input.value.replace(/^\s$/g, '');

        if(passwd === '' || (passwd !== cpasswd)){
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
            if(200 === d.code){
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
    }
    shortcutSet = () => {
        import('./console/shortcuts').then(s => {
            this.setState({
                setContent: <s.default cisd={this.state.csid} />,
                isSetVisible: true
            });
        }).catch(e=>{});
    }
    shortcutClose = () => {
        this.setState({
            isSetVisible: false
        });
    }
    render(){
        let {setContent, isAccountShow, isPasswordShow, avatar, percent, isUploading, isSetVisible} = this.state,
            {csid, avatarHandle, name} = this.props,
            _self = this,
            props = {
                name: 'avatars',
                action: '/customersuccesses/'+csid+'/avatar',
                accept: 'image/*',
                showUploadList: false,
                headers: {
                    authorization: 'authorization-text',
                },
                onChange(info) {
                    let file = info.file;
                    if(file.status === 'uploading'){
                        if(info.event){
                            _self.setState({
                                isUploading: true,
                                percent: Math.ceil(info.event.percent)
                            });
                        }
                    }else if(file.status === 'done') {
                        if(200 === file.response.code){
                            let photo = file.response.msg.photo;
                            localStorage.setItem('uuchat.avatar', photo);
                            avatarHandle(photo);
                            setTimeout(function(){
                                _self.setState({
                                    avatar: photo,
                                    isUploading: false
                                });
                            }, 800);
                        }
                    }else if(file.status === 'error') {
                        message.error(file.name+' file upload failed.');
                    }
                }
            };

        return (
            <ul className="customerSuccess-setting">
                <li onClick={this.accountHandle}>Your account
                    <Modal
                        title={"Editing "+name}
                        visible={isAccountShow}
                        cancelText="Cancel"
                        okText="Save"
                        onCancel={this.accountHandle}
                        onOk={this.accountSave}
                    >
                        <div>
                            <div className="account-item">
                                <p>Contact email</p>
                                <Input value={localStorage['uuchat.email']} readOnly />
                            </div>
                            <div className="account-item">
                                <p>Display name</p>
                                <Input defaultValue={(localStorage['uuchat.displayName'] !=='' ? localStorage['uuchat.displayName'] : name)} ref="displayName" />
                            </div>
                            <div className="account-item">
                                <p>Username</p>
                                <Input defaultValue={name} ref="name" />
                            </div>
                            <div className="account-item">
                                <p>Operator photo(100x100)</p>
                                <div className="avatar-box">
                                    <img src={(localStorage['uuchat.avatar'] !=='' ? localStorage['uuchat.avatar'] : avatar)} alt="" />
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
                            <p>Change password</p>
                            <Input type="password" placeholder="min 6 words" ref="passwd" />
                            <p>Confirn</p>
                            <Input type="password" placeholder="comfirn password" ref="cpasswd" />
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
            </ul>
        );
    }
}

export default ChatSetting;