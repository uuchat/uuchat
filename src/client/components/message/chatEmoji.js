import React, { Component } from 'react';
import Emojis from '../common/emojis';

class EmojiPicker extends Component{

    constructor(props){
        super(props);
        this.clickHandle = this.clickHandle.bind(this);
    }

    clickHandle(e){
        this.props.addEmojiHandle(e.target.innerHTML+'  ');
    }

    render(){

        return (
            <div className="emoji-picker">
                <div className="emoji-group">
                    {Emojis.map((emoji, index) =>
                            <span key={"emoji-"+index} className={"emoji-item"} title={emoji.name} onClick={this.clickHandle}>{emoji.text}</span>
                     )}
                </div>

                <div className="emoji-caret"></div>
            </div>
        );

    }

}


export default EmojiPicker;