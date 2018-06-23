import React, { Component } from 'react';
import Emojis from '../common/emojis';

class EmojiPicker extends Component{

    clickHandle = (e) => {
        this.props.addEmojiHandle(e.target.innerHTML+' ');
    };

    render(){
        let emojisArr = [];

        for (let key in Emojis) {
            emojisArr.push(<span className="emoji-title">{key}</span>);
            for (let i = 0, l = Emojis[key].length; i < l; i++) {
                emojisArr.push(<span key={"emoji-"+Emojis[key][i].name} className={"emoji-item"} title={Emojis[key][i].name} onClick={this.clickHandle}>{Emojis[key][i].text}</span>);
            }
        }

        return (
            <div className="emoji-picker">
                <div className="emoji-group">
                    {emojisArr}
                </div>
                <div className="emoji-caret"></div>
            </div>
        );
    }
}

export default EmojiPicker;