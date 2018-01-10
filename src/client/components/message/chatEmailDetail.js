import React, {Component} from 'react';

class EmailDetail extends Component{

    constructor(){
        super();
        this.state = {
            address: '',
            firstSeen: '',
            lastContacted: '',
            lastSeen: ''
        };
    }

    componentDidMount(){
        let {cid} = this.props;
        let emailDetail = localStorage.getItem('emailDetail');

        if (emailDetail) {
            emailDetail = JSON.parse(emailDetail);
            let nowTime = (new Date()).getTime();

            if (nowTime - emailDetail.time < 86400000) {
                this.setState(emailDetail);
                return false;
            }

        }

        fetch('/customers/cid/'+cid, {
            method: 'GET'
        }).then(res => res.json()).then(d => {
            if (d.code === 200) {
                let msg = d.msg;
                let detail = {
                        address: msg.address,
                        firstSeen: msg.firstSeen,
                        lastContacted: msg.lastContacted,
                        lastSeen: msg.lastSeen
                    };
                this.setState(detail);
                detail.time = (new Date()).getTime();
                localStorage.setItem('emailDetail', JSON.stringify(detail));
            }
        }).catch(e => {});
    }

    render() {
        let {email, pos} = this.props;
        let {address, firstSeen, lastContacted, lastSeen} = this.state;

        return (
            <div className="email-detail" style={pos}>
                <div className="detail-link">
                    <div className="avater">
                        <img width="50" height="50" src="../../static/images/local_avatar.svg" alt=""/>
                    </div>
                    <div className="name">
                        <h4>{email}</h4>
                        <p><i></i>{address}</p>
                    </div>
                </div>
                <div className="detail-time">
                    <div className="time-item">
                        <h4>FIRST SEEN</h4>
                        <p><i></i> {firstSeen}</p>
                    </div>
                    <div className="time-item">
                        <h4>LAST SEEN</h4>
                        <p><i></i> {lastSeen}</p>
                    </div>
                    <div className="time-item">
                        <h4>LAST CONTACTED</h4>
                        <p><i></i> {lastContacted}</p>
                    </div>
                </div>
            </div>
        );
    }
}


export default EmailDetail;