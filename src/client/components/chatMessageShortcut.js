import React, { Component } from 'react';
import { Modal, Input } from 'antd';
import '../static/css/shortcut.css';

class ChatMessageShortcut extends Component{
    constructor(){
        super();
        this.state={
            isSetShow: false
        }
    }
    setShortcut = () => {
        this.toggleSet(true);
    }
    shortcutFetch = () => {
        let _self = this,
            shortKey = this.refs.shortKey.refs.input.value,
            shortValue = this.refs.shortValue.refs.input.value,
            bodyData = 'csid='+(localStorage.getItem('uuchat.csid') || '')+'&shortcut='+shortKey+'&msg='+shortValue;

        if(shortKey.replace(/^\s$/g, '') === ''){
            _self.toggleSet(false);
            return false;
        }

        fetch('/shortcuts', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyData
        }).then(d=>d.json()).then(data=>{
            localStorage.setItem('newShortcut', '{"shortcut": "'+shortKey+'","msg": "'+shortValue+'", "action":"INSERT"}');
            _self.toggleSet(false);
        }).catch((e)=>{});
    }
    shortcutCancel =  () => {
        this.toggleSet(false);
    }
    toggleSet = (flag) => {
        this.setState({
            isSetShow: flag
        });
    }
    render(){
        let { content } = this.props;
        content = content.replace(/&nbsp;/g, ' ').replace(/(^\s*)/g, '').replace(/&gt;/g, '>').replace(/&lt;/g, '<');

        return (
            <div className="short-item-setting" onClick={this.setShortcut}>
                 <Modal
                    title="Add a Personal Shortcut"
                    visible={this.state.isSetShow}
                    cancelText="Cancel"
                    okText="Save"
                    onCancel={this.shortcutCancel}
                    onOk={this.shortcutFetch}
                  >
                    <div>
                        <div className="set-item">
                            Add a personal shortcut for the text you want to expand then type <i>;</i> in chat to search for the shortcut.
                        </div>
                        <div className="set-item">
                            <p className="set-item-label">Shortcut</p>
                            <Input defaultValue="" addonBefore=";" ref="shortKey" />
                            <p className="set-item-label">Expanded Message</p>
                            <Input type="textarea" defaultValue={content} ref="shortValue" />
                         </div>
                     </div>
                  </Modal>
            </div>
        );
    }
}

export default ChatMessageShortcut;