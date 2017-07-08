/**
 * Created by jianzhiqiang on 2017/7/7.
 */
import React, { Component } from 'react'

export default class LimitedInfiniteScroll extends Component {

    static defaultProps = {
        pageLimit: 10,
        pageStart: 0,
        threshold: 200,
        initPage: false,
        hasMore: false,
        autoLoad: true,
        useWindow: true,
        spinLoader: <div
            style={{textAlign: 'center', fontSize: 20, lineHeight: 1.5, paddingTop: 20, paddingBottom: 20, clear: 'both'}}>
            Loading...</div>,
        mannualLoader: <div style={{textAlign: 'center', clear: 'both', display: 'inline-block'}}><span
            style={{fontSize: 20, lineHeight: 1.5, marginTop: 20, marginBottom: 20, display: 'inline-block', color: '#88899a', border: '1px solid #88899a', borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3, borderBottomLeftRadius: 3, padding: '10px 20px', cursor: 'pointer'}}>Load More</span>
        </div>,
        noMore: null
    }

    state = {
        loading: false
    }

    calcTop = (element) => {
        if (!element) {
            return 0
        }
        return element.offsetTop + this.calcTop(element.offsetParent)
    }

    scrollHandler = () => {
        let offset
        const el = this.selfComponent
        if (this.props.useWindow) {
            let scrollTop = window.pageYOffset !== undefined ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop
            offset = this.calcTop(el) + el.offsetHeight - scrollTop - window.innerHeight
        } else {
            offset = el.scrollHeight - el.parentNode.scrollTop - el.parentNode.clientHeight
        }

        if (offset < Number(this.props.threshold)) {
            this.detachScrollEvent()

            if (typeof this.props.loadNext === 'function') {
                this.setState({
                    loading: true
                })
                this.props.loadNext(this.page++)
            }
        }
    }

    attachScrollEvent = () => {
        //console.log('attachScrollEvent', new Date());
        if (!this.props.hasMore) {
            return
        }

        const scrollEl = this.props.useWindow ? window : this.selfComponent.parentNode
        scrollEl.addEventListener('scroll', this.scrollHandler, false)
        scrollEl.addEventListener('resize', this.scrollHandler, false)

        if (this.props.autoLoad && !this.autoLoaded) {
            this.autoLoaded = true
            this.scrollHandler()
        }
    }

    detachScrollEvent = () => {
        const scrollEl = this.props.useWindow ? window : this.selfComponent.parentNode

        scrollEl.removeEventListener('scroll', this.scrollHandler, false)
        scrollEl.removeEventListener('resize', this.scrollHandler, false)
    }

    _init = ()=> {
        this.page = this.props.pageStart
        this.autoLoaded = false
    }

    componentWillMount() {
        this._init();
    }

    componentDidMount() {
        this.attachScrollEvent()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.initPage) this._init();
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.props.children.length < nextProps.children.length) {
            this.setState({
                loading: false
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if ((!this.props.pageLimit || this.page < this.props.pageLimit) && this.props.children.length > prevProps.children.length) {
            setTimeout(() => {
                this.attachScrollEvent()
            }, 0)
        }
    }

    componentWillUnmount() {
        this.detachScrollEvent()
    }

    render() {
        const {pageLimit, pageStart, threshold, hasMore, autoLoad, useWindow, loadNext, spinLoader, mannualLoader, noMore, children, ...props} = this.props

        const cloneMannualLoader = React.cloneElement(mannualLoader, {
            onClick: () => {
                this.setState({
                    loading: true
                })
                loadNext(this.page++)
            }
        })

        props.ref = node => {
            this.selfComponent = node
        }

        return (
            <tbody className='ant-table-tbody' {...props}>
            {children}
            <tr>
                <td colSpan='4'>
                    {this.state.loading && hasMore && <div style={{textAlign: 'center'}}>{spinLoader}</div>}
                    {!this.state.loading && hasMore && pageLimit > 0 && this.page >= pageLimit &&
                    <div style={{textAlign: 'center'}}>{cloneMannualLoader}</div>}
                    {!hasMore && noMore}
                </td>
            </tr>
            </tbody>
        )
    }
}