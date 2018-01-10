import React, { Component } from 'react';

class ChatUser extends Component{

    render(){

        let info  = this.props.info;
        let infoArr = [];

        for (let key in info) {
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
            </div>
        );
    }
}

export default ChatUser;