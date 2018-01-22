import React, {Component} from 'react';
import Account from './chatAccount';
import Password from './chatPassword';
import Shortcuts from './chatShortcuts';
import Theme from './chatTheme';

class MenuSetting extends Component{

    constructor() {
        super();
        this.state = {
            opacity: localStorage['bgThemeOpacity'] || 0.7
        };
    }

    backgroundSelect = (e) => {
        if (e.target.tagName.toLocaleLowerCase() === 'span') {
            let theme = e.target.getAttribute('data-value').split('?')[0];

            this.props.customerSuccess.setState({bgThemeImg: theme});
            localStorage.setItem('bgThemeImg', theme);
        }
    };
    themeOpacityChange = (e) => {
        let opacity = e.target.value;

        this.setState({opacity: opacity});
        this.props.customerSuccess.setState({bgThemeOpacity: opacity});
        localStorage.setItem('bgThemeOpacity', opacity);
    };

    render(){

        let {menu} = this.props;
        let {opacity} = this.state;

        return (
            <div className="menu-setting">
                <div className="menu-header">{menu} Menu Settings</div>
                {menu === 'Account' && <Account customerSuccess={this.props.customerSuccess}/>}
                {menu === 'Password' && <Password />}
                {menu === 'Shortcuts' && <Shortcuts />}
                {menu === 'Theme' && <Theme backgroundSelect={this.backgroundSelect} themeOpacityChange={this.themeOpacityChange} opacity={opacity} />}
            </div>
        );
    }
}

export default MenuSetting;