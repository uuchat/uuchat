import React, { Component } from 'react';

class ChatEmpty extends Component{

    render(){
        return (
            <div className="chat-empty">
                <div className="chat-empty-text">No current chats</div>
            </div>
        );
    }
}

export default ChatEmpty;