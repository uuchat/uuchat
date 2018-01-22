import React, {Component} from 'react';


class Shortcuts extends Component{
    constructor() {
        super();
        this.state = {
            shortcuts: ''
        };
    }
    componentDidMount() {
        import('../console/shortcuts/shortcuts').then((Shortcuts) => {
            this.setState({
                shortcuts: <Shortcuts.default csid={localStorage.getItem('uuchat.csid') || ''} />
            });
        }).catch(e=>{});
    }
    render() {
        return (
            <div className="menu-shortcuts">{this.state.shortcuts}</div>
        );
    }
}

export default Shortcuts;