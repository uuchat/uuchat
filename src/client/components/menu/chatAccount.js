import React, {Component} from 'react';
import {Input, Upload, Icon} from 'antd';
import Tips from '../common/tips';

class Account extends Component{
    constructor() {
        super();
        this.state = {
            avatarUploading: false,
            percent: 0,
            avatar: '../../static/images/contact.png'
        };
    }
    beforeUpload = (file) => {
        let isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            Tips.error('Image must smaller than 2MB!');
        }
        if (!/(.jpg|.png|.gif|.jpeg)/g.test(file.name)) {
            Tips.error('Image type must be jpg、jpeg、png、gif!');
            isLt2M = false;
        }
        return isLt2M;
    };
    refreshAvatar = (avatar) => {
       this.props.customerSuccess.setState({
           avatar: avatar
       });
    };
    accountSave = () => {

        let name = this.refs.name.input.value;
        let displayName = this.refs.displayName.input.value;

        if (name !=='') {
            fetch('/customersuccesses/'+localStorage['uuchat.csid'], {
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
                        Tips.success('Save success!');
                        localStorage.setItem('uuchat.displayName', displayName);
                        localStorage.setItem('uuchat.name', name);
                    }
                })
                .catch(function(e){
                    Tips.error(e, 4);
                });
        } else {
            this.refs.name.refs.input.style.border = '1px solid red';
        }
    };
    render(){
        let {csid, name} = this.props.customerSuccess.state;
        let {avatarUploading, percent, avatar} = this.state;
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
                            avatarUploading: true,
                            percent: Math.ceil(info.event.percent)
                        });
                    }
                } else if (file.status === 'done') {
                    if (file.response.code === 200) {
                        let photo = file.response.msg.photo;
                        localStorage.setItem('uuchat.avatar', photo+'?t='+(new Date()).getTime());
                        _self.refreshAvatar(photo);
                        setTimeout(function(){
                            _self.setState({
                                avatar: photo,
                                avatarUploading: false
                            });
                        }, 800);
                    }
                } else if (file.status === 'error') {
                    Tips.error(file.name+' file upload failed.', 4);
                }
            }
        };

        return (
            <div className="menu-account">
                <div className="account-item">
                    <p>Email:</p>
                    <Input size="large" value={localStorage['uuchat.email']} readOnly />
                </div>
                <div className="account-item">
                    <p>Display name:</p>
                    <Input size="large" defaultValue={(localStorage['uuchat.displayName'] || name)} ref="displayName" />
                </div>
                <div className="account-item">
                    <p>User name:</p>
                    <Input size="large" defaultValue={localStorage['uuchat.name'] || name} ref="name" />
                </div>
                <div className="account-item">
                    <p>Avatar size(100x100)</p>
                    <div className="avatar-box">
                        <img width="100" height="100" src={(localStorage['uuchat.avatar'] || avatar)} alt="" />
                        <div className="avatar-process" style={{display: avatarUploading ? 'block' : 'none'}}>{percent}%</div>
                    </div>
                    <div className="avatar-upload"><Upload {...props}><Icon type="upload" /> Upload </Upload> </div>
                </div>
                <div className="account-footer">
                    <a className="theme-save ant-btn ant-btn-primary" onClick={this.accountSave}>Save</a>
                </div>
            </div>
        );
    }
}


export default Account;