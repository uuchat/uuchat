import React, { Component } from 'react';

class ChatMenu extends Component{

    constructor(){
        super();
        this.state = {
            isContentShow: false
        };
    }
    menuHeaderClick = () => {
        this.setState({
            isContentShow: !this.state.isContentShow
        });
    };

    render(){

        return (
            <div className="chat-menu">
                <div className="chat-menu-header" onClick={this.menuHeaderClick}>{this.props.title}</div>
                <div className="chat-menu-content"> { this.state.isContentShow ? this.props.children : ''}</div>
            </div>
        );

    }
}

export default ChatMenu;