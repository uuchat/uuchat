import React, { Component } from 'react';
import String2int from '../common/utils';

const historyChatData = {};

class ChatHistoryLists extends Component{

    constructor(){
        super();
        this.state = {
            historyChatLists: [],
            filterMark: 8,
            activeIndex: -1
        };
    }

    componentDidMount(){
        this.getHistoryChatLists();
    }
    getHistoryChatLists = () => {
        let _self = this;
        fetch('/chathistories/cs/'+this.props.csid+'/latestmonth').then(function(d){
            return d.json();
        }).then(function(d){
            if (d.code === 200) {
                if (d.msg[0]) {
                    _self.fetchHistoryChat(d.msg[0].cid, _self.props.csid);
                }
                _self.setState({
                    activeIndex: d.msg[0] && d.msg[0].cid,
                    historyChatLists: d.msg
                });
            }
        }).catch(function(e){});
    };
    toggleHistoryChat = (e) => {
        let target = e.target;
        let cid = '';

        if (target.tagName.toLowerCase() === 'li') {
            cid = target.getAttribute('data-cid');
        } else if (target.parentNode && target.parentNode.tagName.toLowerCase() === 'li' ) {
            cid = target.parentNode.getAttribute('data-cid');
        } else if (target.parentNode.parentNode && target.parentNode.parentNode.tagName.toLowerCase() === 'li') {
            cid = target.parentNode.parentNode.getAttribute('data-cid');
        }

        if (historyChatData[cid]) {
            this.renderHistory(cid);
        } else {
            historyChatData[cid] = [];
            this.fetchHistoryChat(cid, this.props.csid);
        }

        this.setState({
            activeIndex: cid
        });

    };

    renderHistory = (cid) => {
        this.props.customerSuccess.setState({
            historyChat: {
                cid: cid,
                chatsArr: historyChatData[cid]
            }
        });
    };

    fetchHistoryChat = (cid, csid) => {
        let _self = this;
        let avatar = _self.props.avatar || '../../static/images/contact.png';

        cid && fetch('/messages/customer/'+cid+'/cs/'+csid)
            .then((data) => data.json())
            .then(d =>{
                let historyChat = [];
                d.msg.map((dd) =>
                    historyChat.push({
                        msgAvatar: (dd.type === 1 || dd.type === 2) ? avatar : '',
                        msgText: dd.msg,
                        msgType: dd.type,
                        msgTime: dd.createdAt
                    })
                );

                historyChatData[cid] = historyChat;
                historyChatData[cid].info = d.customer;
                _self.renderHistory(cid);

            })
            .catch(function(e){});
    };

    filterMarked = (e) => {
        if (e.target.tagName.toLowerCase() === 'span') {
            let marked = parseInt(e.target.getAttribute('data-marked'), 10);
            this.setState({
                filterMark: marked
            });
        }
    };

    render(){

        let {historyChatLists, filterMark, activeIndex} = this.state;
        let chatArr = [];
        let markArr = ['grey', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];

        for (let i = 0, l = historyChatLists.length; i < l; i++) {

            let chat = historyChatLists[i];

            if ((filterMark !== 8) && filterMark !== chat.marked) {
                continue;
            }

            chatArr.push(
                <li key={'his-'+chat.cid} data-cid={chat.cid} className={activeIndex === chat.cid ? 'active' : ''} >
                    <div className="chat-avatar fl">
                        <span className={"avatar-icon avatar-icon-"+String2int(chat.cid)} >{chat.cid.substr(0,1).toUpperCase()}</span>
                    </div>
                    <div className="chat-list-name fr">
                        <h2 className="text-overflow">U-{chat.cid.substr(0, 6).toUpperCase()}</h2>
                        <span className={"marked-tag marked-"+chat.marked}></span>
                    </div>
                </li>
            );
        }

        return (
            <div className="contact-list">
                <div className="mark-filter mark-color-list" onClick={this.filterMarked}>Filter :&nbsp;&nbsp;<span data-marked="8" className="mark-tag mark-tag-all">All</span>
                    {markArr.map((m ,i)=>
                        <span key={i} data-marked={i} className={"mark-tag tag-"+m+(filterMark === i ? "  selected" : "")} title={"mark "+m}>{i}</span>
                    )}
                </div>
                <ul className="customer-lists" onClick={this.toggleHistoryChat}>
                    {chatArr}
                </ul>
            </div>
        );

    }
}

export default ChatHistoryLists;