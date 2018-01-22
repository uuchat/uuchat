import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import '../../static/css/tips.css';

class Message extends Component{
    render(){

        let {content, hide, type} = this.props;
        let icons = {
            error: 'anticon-close-circle',
            success: 'anticon-check-circle',
            info: 'anticon-info-circle'
        };

        return (
            <div className={"uu-tips-message message-"+type}>
                <i class={"anticon "+icons[type]}></i>
                {content}
                <div className="uu-tips-close" onClick={hide}>hide</div>
            </div>
        );
    }
}

let Tips = {
    error: function (content, duration, onClose) {
        this.notice('error', content, duration, onClose);
    },
    info: function (content, duration, onClose) {
        this.notice('info', content, duration, onClose);
    },
    success: function (content, duration, onClose) {
        this.notice('success', content, duration, onClose);
    },
    notice: function (type, content, duration, onClose) {
        if (!document.querySelector('.uu-message')) {
            let messageDiv = document.createElement('div');
            messageDiv.className = 'uu-message';
            document.querySelector('body').append(messageDiv);
        }

        ReactDOM.render(<Message hide={this.hide} content={content} type={type} />, document.querySelector('.uu-message'));

        onClose && onClose();

        setTimeout(function () {
            Tips.destroy();
        }, duration * 1000 || 6000);
    },
    destroy: function () {
        let messageDiv = document.querySelector('.uu-message');

        if (messageDiv) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    },
    hide: function () {
        Tips.destroy();
    }
};


export default Tips;