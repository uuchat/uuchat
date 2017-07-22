import React, { Component } from 'react';
import '../static/css/shortcut.css';

let shortCutLists = [];

class ShortList extends Component{
    selectClick = (e) => {
        e.stopPropagation();
        this.props.shortCutSelecterClick(document.querySelector('.s-'+this.props.num+' .key-value').innerHTML);
    }
    render(){
        let {num, name, value} = this.props;
        return (
            <li className={'s-'+num+' '+(num<=0 ? 'on' : '')} onClick={this.selectClick}>
                <span className="key-name">{';'+name}</span>
                <span className="key-value">{value}</span>
            </li>
        );
    }
}

class ShortEmpty extends Component{
    render(){
        return (
            <div className="short-empty">
                You have not setting Shortcuts, you can setting some on the settings tab.
            </div>
        );
    }
}

class ChatShortcut extends Component{

    constructor(){
        super();
        this.state = {
            isFetchList: false
        };
    }

    componentDidMount(){
        this.getShortCutsList();
    }

    getShortCutsList = () => {
        let _self = this;

        if(shortCutLists.length > 0){
            this.setState({
                isFetchList: true
            });
            return;
        }
        fetch('/shortcuts/cs/'+this.props.csid+'/all')
            .then((d)=>d.json())
            .then((data)=>{
                if(data.code === 200){
                    shortCutLists = data.msg
                    _self.setState({
                        isFetchList: true
                    });
                }
            })
            .catch((e)=>{});
    }

    render(){
        return (
            <div className="shortcut">
                <div className="short-head">
                    <span class="navigate-shortcuts">Navigate ↑ and ↓</span>
                    <span class="hotkey-shortcuts">
                        &nbsp; &nbsp;<strong>Enter</strong> or <strong>Tab</strong> to select
                    </span>
                </div>
                <div className="short-list">
                    <ul className="shortListUl">
                        {shortCutLists.length > 0 && shortCutLists.map((s, i)=>
                                <ShortList key={i} num={i} name={s.shortcut} value={s.msg} shortCutSelecterClick={this.props.shortCutSelecterClick} />
                        )}
                    </ul>
                </div>
                {(shortCutLists.length === 0) && <ShortEmpty />}
            </div>
        );

    }

}


export default ChatShortcut;