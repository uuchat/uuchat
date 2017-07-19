import React,{ PureComponent } from 'react';
import { Dropdown, Button, Icon, Menu } from 'antd';

export default class ActionDropDown extends PureComponent {

    render() {
        const menu = this.props.menuOptions.map(item => <Menu.Item key={item.key}>{item.name}</Menu.Item>);

        return (
            <Dropdown overlay={ <Menu onClick={ this.props.onMenuClick }>{menu}</Menu> }>
                <Button style={{ border: 'none' }}>
                    <Icon style={{ marginRight: 2 }} type="bars"/>
                    <Icon type="down"/>
                </Button>
            </Dropdown>
        );
    }
}