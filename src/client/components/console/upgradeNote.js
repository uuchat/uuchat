/**
 * Created by jianzhiqiang on 2017/6/10.
 */
import React,{Component} from 'react';
import { Alert } from 'antd';

const version = '0.1.0';

class UpgradeNote extends Component {
    state = {
        currentVersion: version,
        latestVersion: version
    };

    compareVersion = (v1, v2) => {
        let vl1 = v1.match(/^(\d+\.)?(\d+)/)[0].split('.');
        let vl2 = v2.match(/^(\d+\.)?(\d+)/)[0].split('.');
        return (vl1[0] * 100 + vl1[1] - vl2[0] * 100 - vl2[1]) > 0;
    };

    componentDidMount = ()=> {
        var _component = this;
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

export default UpgradeNote;
