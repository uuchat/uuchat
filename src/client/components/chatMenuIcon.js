/**
 * Created by lwc on 2017/5/20.
 */
import React, {Component} from 'react';



class ChatIcon extends Component{

    render(){
        return (
            <div className={"chat-icon "+this.props.name}>
                <img src={require('../static/images/'+this.props.name+'.png')} alt="" />
            </div>
        );
    }

}

export default ChatIcon;