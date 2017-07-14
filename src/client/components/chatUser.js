import React, { Component } from 'react';

class ChatUser extends Component{

    render(){

        var I = this.props.info;
        var info = [];

        for(var i in I.info){
            info.push(<tr key={i}><td className="user-td">{i}:</td><td>{I.info[i]}</td></tr>);
        }

        return (
            <div className="chat-user">
                <div className="user-header">USER-Infomation</div>
                <div className="user-body">
                    <table>
                        <tbody>
                            {info}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default ChatUser;