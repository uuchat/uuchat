import React, { Component } from 'react';
import Tips from '../common/tips';

let pageNum = 1;
let isLoading = false;

class Theme extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: 'color',
            colorLists: ['#039be5', '#00bcd4', '#009688', '#388e3c', '#dce775', '#b0a828', '#ffca28', '#ba68c8', '#a84c3c', '#cd924f', ''],
            photoLists: [],
            systemsLists: [
                {big: '../../static/images/theme1.jpg', thumb: '../../static/images/theme1_thumb.jpg'},
                {big: '../../static/images/theme2.jpg', thumb: '../../static/images/theme2_thumb.jpg'},
                {big: '../../static/images/theme3.jpg', thumb: '../../static/images/theme3_thumb.jpg'},
                {big: '../../static/images/theme4.jpg', thumb: '../../static/images/theme4_thumb.jpg'},
                {big: '../../static/images/theme5.jpg', thumb: '../../static/images/theme5_thumb.jpg'}
            ]
        };
    }
    loadImage = (num) => {
        fetch('https://api.unsplash.com/photos/?page='+num+'&order_by=latest', {
            headers: {
                "Authorization": "Client-ID f2cf670131450e7766c2dc838073a911ba7474f85463dbada4688197eac53f15"
            }
        }).then((res) => res.json())
            .then((d) => {
                isLoading = false;
                let {photoLists} = this.state;
                d.map((d) => {
                    photoLists.push({big: d.urls.regular, thumb: d.urls.thumb, name: d.user.name, username: d.user.username});
                });
                this.setState({
                    photoLists: photoLists
                });
            });
    };
    backgroundTypeSelect = (e) => {
        let {photoLists} = this.state;
        let type = e.target.getAttribute('data-type');

        if (type === 'photo' && photoLists.length === 0) {
           this.loadImage(1);
        }
       this.setState({
           type: type
       });
    };

    backgroundScroll = (e) => {
        let tg = e.target;
        let sHeight = tg.scrollHeight;
        let top = tg.scrollTop;
        let height = tg.offsetHeight;
        let {type} = this.state;

        if (sHeight<=(top + height) && type === 'photo' && !isLoading) {
            isLoading = true;
            pageNum++;
            this.loadImage(pageNum);
        }

    };

    saveTheme = () => {
        let csid = localStorage.getItem('uuchat.csid');
        let bgThemeImg = localStorage.getItem('bgThemeImg');
        let bgThemeOpacity = localStorage.getItem('bgThemeOpacity');

        fetch('/customersuccesses/'+csid+'/theme', {
            credentials: 'include',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'background='+bgThemeImg+'&opacity='+bgThemeOpacity
        }).then(res => res.json()).then(d => {
            if (d.code === 200) {
                Tips.success('Theme has been save!');
            }
        });
        this.setState({
            themeSetVisible: false
        });
    };

    render() {
        let {type, colorLists, photoLists, systemsLists} = this.state;
        let {backgroundSelect, themeOpacityChange, opacity} = this.props;
        let lists = [];

        if (type === 'color') {
            colorLists.map((i) => {
                lists.push(<span data-value={'color::'+i} style={{background: i}} className="color-type"></span>);
            });
        } else if (type === 'photo') {
            photoLists.map((i) => {
                lists.push(<span data-value={'photo::'+i.big} style={{backgroundImage: 'url('+i.thumb+')'}}>{
                    <a  target="_blank" href={"https://unsplash.com/@"+i.username+"?utm_source=uuchat&utm_medium=referral&utm_campaign=api-credit"}>{i.name}</a>
                }</span>);
            });
        } else if (type === 'system') {
            systemsLists.map((i) => {
                lists.push(<span data-value={'photo::'+i.big} style={{backgroundImage: 'url('+i.thumb+')'}}></span>);
            });
        }

        return (
            <div className="theme-setting">
                <div className="background-menu">
                    <div className="menu-item">
                        <img src="../../static/images/colors.png" alt=""  data-type="color" onClick={this.backgroundTypeSelect} />
                        <h3>Colors</h3>
                    </div>
                    <div className="menu-item">
                        <img src="../../static/images/pictures.jpg" alt="" data-type="photo" onClick={this.backgroundTypeSelect}/>
                        <h3>Photos by <a href="https://unsplash.com/?utm_source=uuchat&utm_medium=referral&utm_campaign=api-credit" target="_blank">Unsplash</a></h3>
                    </div>
                    <div className="menu-item">
                        <img src="../../static/images/systems.png" alt="" data-type="system" onClick={this.backgroundTypeSelect}/>
                        <h3>Systems</h3>
                    </div>
                </div>
                <div className="theme-background" onClick={backgroundSelect} onScroll={this.backgroundScroll}>
                    {lists}
                    {lists.length === 0 && <i className="loading">Loading....</i>}
                </div>
                <h4>Background Opacity:  <i>{(opacity*100).toFixed(2)}%</i></h4>
                <input type="range" name="points" min="0.1" max="1" defaultValue={opacity} step="0.01" onChange={themeOpacityChange} />
                <div className="theme-footer">
                    <a href="javascript:;" className="theme-save ant-btn ant-btn-primary" onClick={this.saveTheme}>Save</a>
                </div>
            </div>
        );
    }
}

export default Theme;