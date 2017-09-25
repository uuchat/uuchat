import React, { Component } from 'react';
import { Alert } from 'antd';
import { getMainVersion } from './../common/utils';

const version = '0.1.0';

export default class UpgradeNote extends Component {

    state = {
        currentVersion: version,
        latestVersion: version
    };

    compareVersion = (v1, v2) => {
        let vl1 = getMainVersion(v1);
        let vl2 = getMainVersion(v2);
        return (vl1[0] * 100 + vl1[1] - vl2[0] * 100 - vl2[1]) > 0;
    };

    componentDidMount = ()=> {
        let _component = this;
        setTimeout(function () {
            //fetch latestVersion and then set this.state
            const fetchData = '0.1.1';
            _component.setState({
                latestVersion: fetchData,
                message: (
                    <div>
                        uuchat { fetchData } is available! <a href="/" target="_blank">Click here</a> to upgrade.
                    </div>
                )
            });
        }, 1000);
    };

    render() {
        const { currentVersion, latestVersion,message } = this.state;

        if (this.compareVersion(latestVersion, currentVersion)) {
            return (
                <Alert
                    type="info"
                    message="Upgrade Note"
                    description={ message }
                    showIcon
                    closable
                    banner
                    />
            );
        } else {
            return <div/>;
        }
    }
}