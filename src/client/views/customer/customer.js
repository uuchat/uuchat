;(function(win, doc,undefined){

    var U = {
        $: function (el) {
            var isAll = arguments[1];

            if (isAll) {
                return doc.querySelectorAll(el);
            }

            return doc.querySelector(el);
        },
        addEvent: function (el, event, fn) {
            if (el.addEventListener) {
                el.addEventListener(event, fn, false);
            } else if(el.attachEvent) {
                el.attachEvent('on'+event, fn);
            } else {
                el['on'+event] = fn;
            }
        },
        removeEvent: function (el, event, fn) {
            if (el.removeEventListener) {
                el.removeEventListener(event, fn, false);
            } else if(el.detachEvent) {
                el.detachEvent('on'+event, fn);
            } else {
                el['on'+event] = null;
            }
        },
        hasClass: function (obj, cls) {
            return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        },
        addClass: function (obj, cls) {
            if(!this.hasClass(obj, cls)) obj.className += " " + cls;
        },
        removeClass: function (obj, cls) {
            if(this.hasClass(obj, cls)){
                var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
                obj.className = obj.className.replace(reg, '');
            }
        },
        toggleClass: function (obj, cls) {
            if (this.hasClass(obj,cls)) {
                this.removeClass(obj, cls);
            } else {
                this.addClass(obj, cls);
            }
        },
        ajax: function(options){
            var params = options || {};

            params.data = options.data || {};

            if (options.jsonp) {
                jsonp(options);
            } else {
                json(options);
            }

            function json(params){
                params.type = (params.type || 'GET').toUpperCase();
                !params.fileType && (params.data = formatParams(params.data));

                var xhr = new XMLHttpRequest() || new ActiveXObjcet('Microsoft.XMLHTTP');

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        var status = xhr.status;
                        if (status >= 200 && status < 300) {
                            var response = '';
                            var type = xhr.getResponseHeader('Content-type');

                            if (type.indexOf('xml') !== -1 && xhr.responseXML) {
                                response = xhr.responseXML;
                            } else if(type === 'application/json') {
                                response = JSON.parse(xhr.responseText);
                            } else {
                                response = xhr.responseText;
                            }

                            params.success && params.success(response);
                        } else {
                            params.error && params.error(status);
                        }
                    }
                };

                xhr.upload.onprogress = params.progress;
                params.error && (xhr.onerror = params.error);

                if (params.type === 'GET') {
                    xhr.open(params.type, params.url + '?' + params.data, true);
                    options.beforeSend && options.beforeSend(xhr);
                    xhr.send(null);
                } else {
                    xhr.open(params.type, params.url, true);
                    options.beforeSend && options.beforeSend(xhr);
                    xhr.send(params.data);
                }
            }

            function jsonp(params) {
                var callbackName = params.jsonp;
                var head = document.getElementsByTagName('head')[0];
                var data;
                var script = document.createElement('script');

                params.data['callback'] = callbackName;
                data = formatParams(params.data);

                head.appendChild(script);
                window[callbackName] = function(json) {
                    head.removeChild(script);
                    clearTimeout(script.timer);
                    window[callbackName] = null;
                    params.success && params.success(json);
                };
                script.src = params.url + '?' + data;
                if(params.time) {
                    script.timer = setTimeout(function() {
                        window[callbackName] = null;
                        head.removeChild(script);
                        params.error && params.error({
                            message: 'timeout'
                        });
                    }, time)
                }
            }

            function formatParams(data) {
                var arr = [];
                for (var name in data) {
                    arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
                }
                arr.push('v=' + random());
                return arr.join('&');
            }
            function random() {
                return Math.floor(Math.random() * 10000 + 500);
            }
        },
        dateISOFomat: function(t){
            if(isNaN(new Date(t))){
                t = t.split(/\D/);
                return new Date(Date.UTC(t[0], --t[1]||'', t[2]||'', t[3]||'', t[4]||'', t[5]||'', t[6]||''));
            }else{
                return new Date(t);
            }
        },
        isMobile: function () {
            return /Mobile/i.test(navigator.userAgent);
        },
        cutStr: function(str, len){
            var str_length = 0;
            var str_cut = new String();
            var str_len = str.length;
            var a = '';

            for(var i = 0; i < str_len; i++){
                a = str.charAt(i);
                str_length++;
                if (escape(a).length > 4) {
                    str_length++;
                }
                str_cut = str_cut.concat(a);
                if (str_length >= len) {
                    return str_cut;
                }
            }
            if(str_length < len) {
                return str;
            }
        },
        loadStyle: function(arr){
            for (var i = 0, l = arr.length; i < l; i++) {
                var style = doc.createElement('link');
                style.href = arr[i];
                style.rel  = 'stylesheet';
                doc.getElementsByTagName('HEAD')[0].appendChild(style);
            }
        },
        loadScript: function(url, callback){
            var spt = doc.createElement('script');
            spt.src = url;
            spt.async = true;
            doc.getElementsByTagName('HEAD')[0].appendChild(spt);

            spt.onload = spt.onreadystatechange = function(){
                if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete" ) {
                    callback && callback();
                    spt.onload = spt.onreadystatechange = null;
                }

            };
        },
        insertToCursorPosition: function(obj, s1, s2) {
            obj.focus();
            if (document.selection) {
                var sel = document.selection.createRange();
                sel.text = s2;
            } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
                var startPos = obj.selectionStart;
                var endPos = obj.selectionEnd;
                var cursorPos = startPos;
                var tmpStr = s1;
                var s3 = tmpStr.substring(0, startPos) + s2 + tmpStr.substring(endPos, tmpStr.length);

                obj.value = s3;
                cursorPos += s2.length;
                obj.selectionStart = obj.selectionEnd = cursorPos;
            } else {
                obj.value += s2;
            }
        },
        autoTextarea: function (elem, extra, maxHeight) {
            extra = extra || 0;

            var minHeight = parseFloat(getStyle('height'));

            function getStyle(name) {
                if (elem.currentStyle) {
                    var val = elem.currentStyle[name];

                    if (name === 'height' && val.search(/px/i) !== 1) {
                        var rect = elem.getBoundingClientRect();
                        return rect.bottom - rect.top -
                            parseFloat(getStyle('paddingTop')) -
                            parseFloat(getStyle('paddingBottom')) + 'px';
                    }

                    return val;
                } else {
                    return getComputedStyle(elem, null)[name];
                }
            }

            function change() {
                var  height;
                var  padding = 0;
                var  style = elem.style;

                if (elem._length === elem.value.length){
                    return;
                }

                elem._length = elem.value.length;
                elem.style.height = minHeight + 'px';
                U.$('.chat-send-text').style.height = minHeight + 'px';
                if (elem.scrollHeight > minHeight) {
                    if (maxHeight && elem.scrollHeight > maxHeight) {
                        height = maxHeight - padding;
                        style.overflowY = 'auto';
                    } else {
                        height = elem.scrollHeight - padding;
                        style.overflowY = 'hidden';
                    }

                    style.height = height + extra + 'px';
                    elem.currHeight = parseInt(style.height);
                    U.$('.chat-send-text').style.height = height + extra + 'px';
                }
            }

            this.addEvent(elem, 'propertychange', change);
            this.addEvent(elem, 'input', change);
            this.addEvent(elem, 'focus', change);

            change();
        }
    };

    var CHAT = {
        domain: (win.UUCHAT && win.UUCHAT.domain) || '',
        socket: null,
        timeStart: U.dateISOFomat(new Date()).getTime(),
        timeOutSeconds: 2700 * 1000,
        timeOutTimer: null,
        msgPageNum: 1,
        isLoadingMsg: false,
        hasMoreMsg: true,
        chatState: 0,
        cid: '',
        csid: '',
        csName: '',
        email: '',
        init: function(){
            U.loadStyle([CHAT.domain+'/static/css/customer.css']);
            var socketIO = localStorage.getItem ? localStorage.getItem('uuchat.skcdn', socketIO) : null;
            U.loadScript(socketIO || 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js', CHAT.ctrol);
            this.createCT();
            win.addEventListener('message', function(e){
                CHAT.email = e.data.email || '';
            }, false);
        },
        createCT: function(){
            var ct = this.template();
            var ctNode = document.createElement('div');

            ctNode.setAttribute('class', 'chat-console chat-console-hidden');
            ctNode.innerHTML = ct;
            doc.body.appendChild(ctNode);
        },
        ctrol: function(){

            U.addEvent(U.$('.chat-btn'), 'click', function(e){

                if (U.isMobile()) {
                    window.location.href = '/webview';
                    return false;
                }

                U.toggleClass(this, 'chat-btn-close');
                U.toggleClass(U.$('.chat-console'), 'chat-console-hidden');

                U.$('.chat-nums').style.display = 'none';
                U.$('.chat-nums').innerHTML = 0;

                if(!CHAT.socket){
                    CHAT.createSocket();
                }
            });
        },
        createSocket: function(){
            var io = win.io || io || {};

            CHAT.socket = io(CHAT.domain+'/c', {
                forceNew: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
                timeout: 10000
            });
            CHAT.socket.on('connect', this.socketConnect);
            CHAT.socket.on('connect_error', this.socketConnectError);
            CHAT.socket.on('disconnect', this.socketDisconnect);
            CHAT.socket.on('reconnect', this.socketReconnect);
            CHAT.socket.on('error', this.socketError);
            CHAT.socket.on('cs.message', this.socketCsMessage);
            CHAT.socket.on('cs.status', this.socketCsStatus);
            CHAT.socket.on('cs.disconnect', this.socketCsDisconnect);
            CHAT.socket.on('c.queue.update', this.socketQueueUpdate);
            CHAT.socket.on('c.queue.shift', this.socketQueueShift);
            CHAT.socket.on('cs.close.dialog', this.socketCloseDialog);
            CHAT.socket.on('c.dispatch', this.socketDispatch);
            CHAT.socket.on('cs.action.rate', this.socketActionRate);

            U.addEvent(window, 'offline', function(){
                CHAT.socket && (CHAT.socket = null);
            });
            U.addEvent(window, 'online', function(){
                CHAT.socket && (CHAT.socket = null);
                CHAT.createSocket();
            });
        },
        template: function(){
            var str = '<div class="chat-body">';
            str +='<div class="chat-header"><div class="chat-avatar"><img class="avatar-img" src="'+CHAT.domain+'/static/images/ua.png" /></div><div class="chat-name"></div></div>';
            str +='<div class="chat-main">';
            str +='<div class="chat-loading"><div class="bounce bounce1"></div><div class="bounce bounce2"></div><div class="bounce bounce3"></div></div>';
            str +='</div></div>';
            str +='<div class="chat-btn chat-btn-open"><div class="chat-nums" style="display: none;">0</div></div>';
            return str;
        },
        tempMsg: function(){
            return '<div class="chat-msg"></div>';
        },
        tempSend: function(){
            var str = '<div class="chat-send">';
            str += '<div class="chat-send-text">';
            str += '<textarea placeholder="Input text and Press Enter" class="chat-send-area" maxlength="256" type="text"></textarea>';
            str += '<div class="chat-send-btns">';
            str += this.tempEmoji();
            str += '<label class="chat-send-btn chat-emoji-btn"></label>';
            if(win.FormData){
                str += '<label class="chat-send-btn chat-file-btn" for="upload-file">';
                str += '<input id="upload-file" name="image" type="file" class="chat-upload" accept="image/png, image/jpeg, image/gif,image/jpg" /></label>';
            }
            str += '</div></div></div>';
            return str;
        },
        tempEmoji: function(){

            var str = '<div class="emoji-lists emoji-lists-hidden"><i class="arrow"></i><div class="emoji-picker-lists">';

            for (var key in ChatEmojis) {
                str += '<span class="emoji-title">'+key+'</span>';
                for (var i = 0, l = ChatEmojis[key].length; i < l; i++) {
                    str += '<span class="emoji-item" title="'+ChatEmojis[key][i].name+'">'+ChatEmojis[key][i].text+' </span>';
                }
            }
            str +='</div></div>';
            return str;
        },
        tempEmail: function(){
            var str = '<div class="chat-item chat-from"><div class="chat-text"><div class="email-notify">';

            if (CHAT.email) {
                str += '<h4>You\'ll be notified here and by email</h4>';
                str += '<h5><a href="javascript:;">'+CHAT.email+'</a></h5>';
            } else {
                str += '<h2>Get notified by email</h2>';
                str += '<div class="text-field"><input class="email-input" placeholder="email@domain.com"/><span class="email-btn"></span></div>';
                str += '<p class="email-error">That email doesn\'t look quite right</p>';
            }
            str += '<div class="chat-caret"></div>';
            str += '</div></div></div>';

            return str;
        },
        tempRate: function () {
            var str = '<div class="rate-box">';
            str += '<p class="rate-title">Please rate the dialogue</p>';
            str += '<div class="rate-heart">';
            str += '<span class="rate-span">1</span><span class="rate-span">2</span><span class="rate-span">3</span><span class="rate-span">4</span><span class="rate-span">5</span>';
            str += '</div><div class="rate-btn">Done</div></div>';

            return str;
        },
        tempSystemMsg: function (msg, type) {

            var sysMsg = U.$('.sys-msg');
            var chatMsg =  U.$('.chat-msg');
            var sysMsgStr = '<div class="sys-msg">';

            if (sysMsg) {
                (type === 'INITIALIZE') && (sysMsg.innerHTML = '');
                sysMsg.innerHTML += this.tempSystemMsgItem(msg);
            } else {
                sysMsgStr += this.tempSystemMsgItem(msg);
                chatMsg.innerHTML += sysMsgStr;
            }

            if (type === 'FAQ') {
                sysMsgStr = '<div class="sys-msg-btn">';
                sysMsgStr += '<span class="sys-faq sys-faq-yes">YES, <br /> I want</span>';
                sysMsgStr += '<span class="sys-faq sys-faq-no">No, I just <br /> browing</span>';
                sysMsgStr += '</div>';

                sysMsg.innerHTML += sysMsgStr;
            }

            chatMsg.scrollTop = chatMsg.scrollHeight;
        },
        tempSystemMsgItem: function (msg) {
            return '<div class="sys-msg-item">' + msg + '</div>';
        },
        tempMsgItem: function(type, msg, t){
            var str = '';
            var cls = '';
            var name = '';
            var hour;
            var minute;
            var isOld = false;

            if (typeof t === 'number') {
                cls += 't-'+t+' ';
            } else {
                isOld = true;
            }

            t = U.dateISOFomat(t);

            hour = t.getHours();
            minute = t.getMinutes();

            hour = hour > 9 ? hour : '0'+hour;
            minute = minute > 9 ? minute : '0'+minute;

            if (0 === type) {
                cls += 'chat-to';
                cls += isOld ? ' done' : '';
            } else {
                cls = 'chat-from';
                name = CHAT.csName;
            }

            msg = this.msgFilter(msg);
            str += '<div class="chat-item '+cls+'">';
            str += '<p class="chat-role"><i>'+name+'</i>'+hour+':'+minute+'</p>';
            str += '<div class="chat-text">'+msg+'</div>';
            str += '</div>';

            return str;
        },
        msgScroll: function () {
            if (document.mozFullScreen !== undefined) {
                U.addEvent(U.$('.chat-msg'), 'DOMMouseScroll', scrollHandler);
            } else {
                U.addEvent(U.$('.chat-msg'), 'mousewheel', scrollHandler);
            }

            function scrollHandler(e) {

                 if (!CHAT.hasMoreMsg || CHAT.isLoadingMsg) {
                     return false;
                 }

                 e = e || win.event;

                 e.delta = e.wheelDelta ? e.wheelDelta / 120 : -(e.detail || 0) / 3;

                 if (e.stopPropagation) {
                    e.stopPropagation();
                 } else {
                    e.cancelBubble = true;
                 }

                 if (e.delta > 0 && e.target.scrollTop <= 0 && CHAT.csid) {
                      CHAT.isLoadingMsg = true;
                      U.addClass(U.$('.chat-msg'), 'loading');
                      historyMsgRequest();
                 }
            }

            function historyMsgRequest() {

                U.ajax({
                    url: CHAT.domain + '/messages/customer/' + CHAT.cid + '/cs/' + CHAT.csid,
                    type: 'GET',
                    fileType: true,
                    data: 'pageNum='+CHAT.msgPageNum+'&pageSize=10',
                    success: function (d) {

                        var d = JSON.parse(d);
                        if (d.code === 200) {
                            CHAT.msgPageNum++;

                            if (d.msg.length < 10 || d.msg.length === 0) {
                                CHAT.hasMoreMsg = false;
                            }
                            renderMsgItems(d.msg);
                        }

                        CHAT.isLoadingMsg = false;
                        U.removeClass(U.$('.chat-msg'), 'loading');

                    },
                    error: function (error) {
                        CHAT.isLoadingMsg = false;
                        U.removeClass(U.$('.chat-msg'), 'loading');
                    }
                });
            }

            function renderMsgItems(data) {

                if (data.length > 0) {
                    var chatMsg = U.$('.chat-msg');
                    var msgList = '';
                    var curTime = new Date();
                    var diffTime = '';

                    curTime = curTime.getFullYear()+'-'+(curTime.getMonth() + 1) + '-' + curTime.getDate();

                    for (var i = 0, l = data.length; i < l; i++) {
                        var msg = data[i];
                        if (msg.type !== 3 && msg.type !== 4) {
                            diffTime = msg.createdAt.split('T')[0];
                            if (curTime !== diffTime) {
                                curTime = diffTime;
                                msgList += CHAT.msgHistoryTime(msg.createdAt);
                            }
                            msgList += CHAT.tempMsgItem(msg.type, msg.msg, msg.createdAt);
                        }
                    }

                    chatMsg.innerHTML = msgList+chatMsg.innerHTML;
                }

            }

        },
        msgHistoryTime: function (time) {

            var dateStr = time.split('T')[0];
            U.$('.time-'+dateStr) && U.$('.time-'+dateStr).parentNode.removeChild(U.$('.time-'+dateStr));

            return '<p class="chat-time time-'+dateStr+'"><i>'+dateStr.split('-').reverse().join('/')+'</i></p>';
        },
        msgFilter: function(msg){
            var imgReg = /(^content\/upload\/)/g;
            var str = '';

            msg = msg.replace(/^&nbsp;/g, '');

           if(imgReg.test(msg)){
                msg = msg.split('|');
                str += '<a href="' + CHAT.domain + '/' + msg[1] + '" target="_blank">';
                str += '<img src="'+CHAT.domain+'/'+msg[0]+'" width="'+msg[2]+'" height="'+msg[3]+'" />';
                str += '</a>';
            } else {
                str = msg.replace(/&nbsp;/g, ' ').replace(/#/gi, "<br />").replace(/((https?|ftp|file|http):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*)/g, function(match){
                    return '<a href="'+match+'" target="_blank">'+match+'</a>';
                });
            }
            return str;
        },
        msgTranslate: function(opt){

            var chatMsg =  U.$('.chat-msg');

            if (opt.type === 5) {
                this.msgRate(chatMsg, opt);
            } else if(opt.type === 2) {
                var str = '<div class="new-conversation">Click to New Conversation</div>';
                chatMsg.innerHTML += this.tempMsgItem(opt.type, str, new Date());
            } else if(opt.type === 8) {
                chatMsg.innerHTML += this.tempEmail();
            } else {
                chatMsg && (chatMsg.innerHTML += this.tempMsgItem(opt.type, opt.msg, opt.time));
            }

            if(!U.hasClass(U.$('.chat-btn'), 'chat-btn-close')){
                var chatNums = U.$('.chat-nums');
                chatNums.innerHTML = +chatNums.innerHTML + 1;
                chatNums.style.display = 'block';
            }

            chatMsg && (chatMsg.scrollTop = chatMsg.scrollHeight);
            CHAT.updateLocalStorage({
                action: 'updateChatTime'
            });
        },
        msgRate: function (chatMsg, msgObj) {
            chatMsg.innerHTML += this.tempMsgItem(msgObj.type, CHAT.tempRate(), new Date());
        },
        updateLocalStorage: function(userInfo){

            var uuchatIF = U.$('#uuchatIframe').contentWindow;
            var d = new Date();
            var data = {};

            data.lastTime = d.getTime();
            data.chatTime = d.getTime();
            data.cid = CHAT.cid;
            data.action = userInfo.action;

            if(userInfo.action === 'updateUser'){
                data.name = userInfo.name;
                data.email = userInfo.email;
            }

            uuchatIF.postMessage(data, '*');

        },
        initCustomer: function(data){
            var msgList = '';
            var msgMain = U.$('.chat-main');

            this.cid = data.cid;

            this.updateLocalStorage({action: 'init'});
            this.initCustomerInfo(data.csid, data.name, data.photo);

            msgMain.innerHTML = this.tempMsg();
            msgMain.innerHTML += this.tempSend();

            if (data.msg.length < 10 || data.msg.length === 0) {
                CHAT.hasMoreMsg = false;
            }

            if (typeof data.msg === 'object' && data.msg.length > 0) {
                for (var i = 0, l = data.msg.length; i < l; i++) {
                    var msg = data.msg[i];
                    if (msg.type < 3) {
                        msgList += this.tempMsgItem(msg.type, msg.msg, msg.createdAt);
                    } else if (msg.type == 8) {
                        msgList += this.tempEmail();
                    }
                }
                U.$('.chat-msg').innerHTML += msgList;
                U.$('.chat-msg').scrollTop = U.$('.chat-msg').scrollHeight;
            }

            U.addEvent(msgMain, 'click', msgMainClickHandle);
            U.addEvent(msgMain, 'mouseover', msgMainMouseOverHandle);

            function msgMainClickHandle(event) {
                var event = event || win.event;
                var target = event.target || event.srcElement;
                var classNames = target.className;

                if (classNames.indexOf('email-btn') > -1) {
                    CHAT.notifyEmail('send');
                    return false;
                }
                if (classNames.indexOf('email-input') > -1) {
                    CHAT.notifyEmail('focus');
                    return false;
                }

                if (classNames.indexOf('resend-btn') > -1) {
                    CHAT.messageResend(target);
                    return false;
                }

                if (classNames.indexOf('reconnect-btn') > -1 || classNames.indexOf('new-conversation') > -1) {
                    U.removeEvent(msgMain, 'click', msgMainClickHandle);
                    U.removeEvent(msgMain, 'mouseover', msgMainMouseOverHandle);
                    CHAT.createSocket();
                    return false;
                }

                if (classNames.indexOf('rate-btn') > -1) {
                    CHAT.rateSend(target);
                    return false;
                }

                if (classNames.indexOf('sys-faq-no') > -1) {
                    CHAT.renderFAQFish();
                    return false;
                }

                if (classNames.indexOf('sys-faq-yes') > -1 || classNames.indexOf('sys-issue-back') > -1) {
                    CHAT.getFAQData(CHAT.domain + '/faqs/collections', CHAT.renderFAQCollections);
                    return false;
                }

                if (classNames.indexOf('sys-collection-item') > -1) {
                    CHAT.getFAQData(CHAT.domain + '/faqs/collection/' + target.getAttribute('data-id') + '/issues', CHAT.renderIssue);
                    return false;
                }

                if (classNames.indexOf('sys-issue-item') > -1) {
                    CHAT.getFAQData(CHAT.domain + '/faqs/' + target.getAttribute('data-id') + '/answer/', CHAT.renderAnswer);
                    return false;
                }

                if (classNames.indexOf('sys-answer-go') > -1) {
                    CHAT.getFAQData(CHAT.domain + '/faqs/collections', CHAT.renderFAQCollections);
                    return false;
                }

                if (classNames.indexOf('sys-answer-leave') > -1) {
                    CHAT.renderFAQFish();
                    return false;
                }

            }

            function msgMainMouseOverHandle(event) {
                var event = event || window.event;
                var target = event.target || event.srcElement;
                var classes = target.className;

                if (classes.indexOf('rate-span') > -1) {
                    var rates = target.parentNode.getElementsByClassName('rate-span');
                    var rateNum = target.innerHTML;

                    target.parentNode.nextSibling.setAttribute('data-rate', rateNum);

                    for (var i = 0; i < 5; i++) {
                        if(i < rateNum) {
                            rates[i].className = 'rate-span active';
                        } else {
                            rates[i].className = 'rate-span';
                        }
                    }
                }
            }

        },
        messageResend: function (obj) {
            var resendMsg = obj.parentNode.innerHTML.replace('<span class="resend-btn" title="Click to resend">!</span>', '');
            CHAT.socketEmitMessage(U.cutStr(resendMsg, 256));
        },
        getFAQData: function (url, cb) {
            U.ajax({
                url: url,
                type: 'GET',
                success: function (d) {
                    var d = JSON.parse(d);
                    if (d.code === 200) {
                        cb && cb(d.msg);
                    }
                }
            });
        },
        renderFAQ: function () {
            CHAT.tempSystemMsg("Question, feedback? Let us know on below!", "");
            CHAT.tempSystemMsg("Search FAQ quickly?", "FAQ");
        },
        renderFAQCollections: function (arr) {
            if (arr.length <= 0) {
                CHAT.renderFAQFish();
                return false;
            }
            var str = '<div class="sys-collection-list">';
            str += CHAT.tempSystemMsgItem("Got it, What would you like to know more about?");
            for (var i = 0, l = arr.length; i < l; i++) {
                str += '<a class="sys-collection-item" data-id="'+arr[i].collection_id+'" title="'+arr[i].collection+'">' + arr[i].collection + '</a>';
            }
            str += '</div>';
            U.$('.sys-msg').innerHTML = str;
        },
        renderIssue: function (arr) {
            var str = '<div class="sys-issue-list">';
            str += CHAT.tempSystemMsgItem("Hey there! we found some links that may be helpful");
            for (var i = 0, l = arr.length; i < l; i++) {
                str += '<p><span class="sys-issue-item" data-id="'+arr[i].uuid+'">' + (i + 1) + '.' + arr[i].issue + '</span></p>';
            }
            str += '<p><span class="sys-issue-item sys-issue-back"><i class="issue-arrow">&#139;</i> Back</span></p>';
            str += '</div>';
            U.$('.sys-msg').innerHTML = str;
        },
        renderAnswer: function (answer) {
            var str = '<div class="sys-issue-list">';
            str += CHAT.tempSystemMsgItem(CHAT.msgFilter(answer));
            str += '<div class="sys-issue-btn">';
            str += '<span class="sys-answer-go">Go on!</span>';
            str += '<span class="sys-answer-leave">Leave!</span>';
            str += '</div>';
            str += '</div>';
            U.$('.sys-msg').innerHTML = str;
        },
        renderFAQFish: function () {
            U.$('.sys-msg') && (U.$('.sys-msg').innerHTML = '<div class="sys-msg-no">Thanks for you visit!</div>');
        },
        notifyEmail: function (action) {
            var notify = U.$('.email-notify');
            if (action === 'send') {
                send();
            } else if(action === 'focus') {
                focus();
            }
            function send() {
                var email = U.$('.email-input').value.replace(/^\s$/g, '');
                if (email === '' || !/^[0-9a-z_A-Z.\\-]+@(([0-9a-zA-Z]+)[.]){1,2}[a-z]{2,3}$/g.test(email)) {
                    U.addClass(U.$('.email-notify'), 'error');
                    return false;
                }

                CHAT.updateLocalStorage({
                    action: 'updateUser',
                    name: CHAT.cid,
                    email: email
                });

                U.ajax({
                    url:CHAT.domain+'/customers/cid/'+CHAT.cid,
                    type:'PATCH',
                    data: {"email": email},
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    },
                    success: function(d){
                        var d = JSON.parse(d);
                        if (d.code === 200) {
                            notify.innerHTML = "<h4>You'll be notified here and by email</h4><h5>"+email+"</h5>";
                            CHAT.renderFAQ();
                        }
                    }
                });
            }
            function focus() {
                U.removeClass(notify, 'error');
            }
        },
        rateSend: function (rate) {
            var chatMsg = U.$('.chat-msg');

            chatMsg.innerHTML += CHAT.tempMsgItem(1, 'Thank you for your rate!! Goodbye!', new Date());
            chatMsg.scrollTop = chatMsg.scrollHeight;

            CHAT.socket.emit('c.rate', CHAT.cid, rate.getAttribute('data-rate'), function (success) {
                if (success) {
                    setTimeout(function(){
                        CHAT.socket.close();
                        CHAT.socket = null;
                        U.$('.chat-main').innerHTML = '<div class="reconnect-btn"><img width="32" src="'+CHAT.domain+'/static/images/write.png">New Conversation</div>';
                    }, 3000);
                }
            });
        },
        initCustomerInfo: function (csid, name, avatar) {
            CHAT.csid = csid;
            CHAT.csName = name;
            U.$('.chat-name').innerHTML = name;
            U.$('.avatar-img').setAttribute("src", this.domain + '/' + (avatar || 'static/images/ua.png'));
        },
        socketConnect: function(){
            this.emit('c.select', CHAT.socketCsSelect);
        },
        socketConnectTimeOut: function(){
            if (CHAT.chatState === 3 || CHAT.chatState === 0) {
                return false;
            }
            CHAT.timeStart = U.dateISOFomat(new Date()).getTime();
            clearInterval(CHAT.timeOutTimer);
            CHAT.timeOutTimer = setInterval(function(){
                var timeNow = U.dateISOFomat(new Date()).getTime();
                if(timeNow - CHAT.timeStart > CHAT.timeOutSeconds){
                    clearInterval(CHAT.timeOutTimer);
                    CHAT.socket && CHAT.socket.emit('c.timeout', CHAT.cid);
                    CHAT.chatState = 3;
                }
            }, 5000);
        },
        socketConnectError: function(){
            U.$('.chat-main').innerHTML = '<div class="chat-offline"><div class="chat-error">The system is busy! Please try again later</div></div>';
        },
        socketDisconnect: function(){
            clearInterval(CHAT.timeOutTimer);
            CHAT.chatState = 3;
            U.$('.chat-name').innerHTML = CHAT.csName;
        },
        socketSelectSuccess: function (data) {
            CHAT.socketConnectTimeOut();
            CHAT.initCustomer(data);
            U.addEvent(U.$('.chat-emoji-btn'), 'click', function(e){
                U.toggleClass(U.$('.emoji-lists'), 'emoji-lists-hidden');
            });
            U.addEvent(U.$('.emoji-lists'), 'click', function(e){
                var e = e || win.event;
                var tg = e.target || e.srcElement;

                if (tg.tagName.toLowerCase() === 'span') {
                    U.insertToCursorPosition(U.$('.chat-send-area'), U.$('.chat-send-area').value, tg.innerHTML);
                }
            });
            U.addEvent(U.$('.emoji-lists'), 'mouseleave', function(e){
                U.toggleClass(U.$('.emoji-lists'), 'emoji-lists-hidden');
            });

            U.$('.chat-upload') && U.addEvent(U.$('.chat-upload'), 'change', function(e){

                var _self = this;
                var data = new FormData();
                var fileName = e.target.files[0];
                var fileSize;
                var imgUploadUrl = CHAT.domain+'/messages/customer/'+CHAT.cid+'/cs/'+CHAT.csid+'/image?f=c';

                if(!fileName){
                    showUploadImageTips('Image can not be uploaded because customer service is not online');
                    return false;
                }

                if (!/(.jpg|.gif|.png)$/g.test(fileName.name)) {
                    showUploadImageTips('Image format must be jpg 、png、gif');
                    return false;
                }

                fileSize = fileName.size / 1024 /1024;

                if (fileSize >= 2) {
                    showUploadImageTips('Image must smaller than 2MB!');
                    return false;
                }
                data.append('image', fileName);
                U.$('.chat-msg').innerHTML += '<div class="upload-tips">Start upload ...</div>';

                if (!CHAT.csid) {
                    imgUploadUrl = CHAT.domain+'/messages/customer/'+CHAT.cid+'/image';
                }

                U.ajax({
                    url: imgUploadUrl,
                    type:'POST',
                    fileType: true,
                    data: data,
                    progress: function(d){
                        var uploadTips = U.$('.upload-tips') || null;
                        if (d.total === 0) {
                            uploadTips.innerHTML = 'Upload failed!!!';
                        } else {
                            uploadTips.innerHTML = 'Uploading '+Math.round(d.loaded/d.total*100)+ ' %';
                        }

                        if (d.loaded === d.total) {
                            setTimeout(function(){
                                U.$('.chat-msg') && U.$('.chat-msg').removeChild(U.$('.upload-tips'));
                            }, 2500);
                        }
                    },
                    success: function(data){
                        var d = JSON.parse(data);
                        if (d.code === 200) {
                            CHAT.socketSendMessage(d.msg.resized+'|'+d.msg.original+'|'+d.msg.w+'|'+d.msg.h);
                        }
                    },
                    error: function(e){
                        _self.value = '';
                        var uploadTips = U.$('.upload-tips') || null;
                        if (uploadTips) {
                            uploadTips.innerHTML = 'upload image has cros error.';
                            setTimeout(function(){
                                U.$('.chat-msg').removeChild(U.$('.upload-tips'));
                            }, 2500);
                        }
                    }
                });

            });

            this.msgScroll();

            U.autoTextarea(U.$('.chat-send-area'));

            U.addEvent(U.$('.chat-send-area'), 'keydown', function(e){
                var e = e || win.event;
                var keyCode = e.keyCode ? e.keyCode : e.which;
                var val = this.value.replace(/>/g, "&gt;").replace(/^\s$/g, "").replace(/</g, "&lt;");

                if (13 === keyCode) {

                    if (val && !/^#*$/g.test(val)) {
                        CHAT.socketSendMessage(val);
                        U.addClass(U.$('.emoji-lists'), 'emoji-lists-hidden');
                        this.focus();
                        this.value = '';

                        U.$('.chat-send-text').style.height = '50px';
                        U.$('.chat-send-area').style.height = '50px';
                    }

                    e.returnValue && (e.returnValue = false);
                    e.preventDefault && e.preventDefault();
                }
            });

            function showUploadImageTips(text) {
                U.$('.chat-msg').innerHTML += '<div class="upload-tips">'+text+'</div>';
                this.value = '';
                setTimeout(function(){
                    U.$('.upload-tips').parentNode.removeChild(U.$('.upload-tips'));
                }, 2000);
            }
        },
        socketCsSelect: function(type, data){
            CHAT.chatState = type;
            if (1 === type) {
                CHAT.socketSelectSuccess(data);
            } else if(2 === type) {
                CHAT.socketQueue(data.num);
            } else if(3 === type) {
                CHAT.socketSelectSuccess(data);
            }
        },
        socketQueue: function (num){
            U.$('.chat-main').innerHTML = '<div class="chat-offline"><div class="line-up">Current queue number <i class="line-num">'+num+'</i></div></div>';
        },
        socketReconnectTips: function(){
            CHAT.msgTranslate({
                type: 2,
                msg: 'Reconnect button',
                time: new Date()
            });
        },
        socketDispatch: function(csid, name, avatar){
            CHAT.initCustomerInfo(csid, name, avatar);
        },
        socketActionRate: function(){
            CHAT.msgTranslate({
                type: 5,
                msg: 'Rate',
                time: new Date()
            });
        },
        socketSendMessage: function(msg){
            CHAT.socketEmitMessage(U.cutStr(msg, 256));
        },
        socketEmitMessage: function(msg){
            var d = U.dateISOFomat(new Date()).getTime();
            CHAT.timeStart = d;
            CHAT.msgTranslate({
                type: 0,
                msg: msg,
                time: d
            });

            function watchDog(tout, cb) {
                if ('function' === typeof tout) {
                    cb = tout;
                    tout = 5000;
                }
                var called = false;
                var t = setTimeout(function () {
                        if (!called) {
                            called = true;
                            cb(new Error('callback timeout'));
                        }
                    }, tout);

                return function () {
                    clearTimeout(t);
                    if (!called) {
                        called = true;
                        [].unshift.call(arguments, undefined);
                        cb.apply(this, arguments);
                    }
                };
            }
            if (CHAT.chatState === 3) {
                CHAT.socket.emit('c.offlineMsg', CHAT.cid, msg, function(success){
                    if ( /^content\/upload\//g.test(msg)) {
                        U.addClass(U.$('.t-'+d), 'done-img');
                    } else {
                        U.addClass(U.$('.t-'+d), 'done');
                    }

                    var currentTime = U.dateISOFomat(new Date()).getTime();

                    if (!U.$('.email-notify')) {
                        CHAT.msgTranslate({
                            type: 1,
                            msg: "save typically replies in a few hours",
                            time: currentTime
                        });
                        CHAT.msgTranslate({
                            type: 1,
                            msg: "Give them a way to reach you: ",
                            time: currentTime
                        });
                        CHAT.msgTranslate({
                            type: 8,
                            msg: 'Offline email',
                            time: currentTime
                        });

                        if (CHAT.email) {
                            CHAT.renderFAQ();
                        }
                    }
                });
                return false;
            }

            CHAT.socket.emit('c.message', CHAT.cid, msg, watchDog(function(err, success){
                if (success) {
                    if ( /^content\/upload\//g.test(msg)) {
                        U.addClass(U.$('.t-'+d), 'done-img');
                    } else {
                        U.addClass(U.$('.t-'+d), 'done');
                    }
                } else {
                    U.$('.t-'+d).querySelector('.chat-text').innerHTML += '<span class="resend-btn" title="Click to resend">!</span>';
                }
            }));
        },
        socketCsMessage: function(cid, msg){
            CHAT.timeStart = U.dateISOFomat(new Date()).getTime();
            CHAT.msgTranslate({
                type: 1,
                msg: msg,
                time: new Date()
            });
        },
        socketCloseDialog: function(){
            clearInterval(CHAT.timeOutTimer);
            CHAT.chatState = 3;
        },
        socketCsStatus: function(status){
            if (1 === status) {
                U.$('.chat-name').innerHTML = '<span class="status-title">Entering</span>';
            } else if(2 === status) {
                U.$('.chat-name').innerHTML = CHAT.csName;
            }
        },
        socketCsDisconnect: function(){
            clearInterval(CHAT.timeOutTimer);
            CHAT.chatState = 3;
        },
        socketQueueUpdate: function(pos){
            if (U.$('.line-num')) {
                U.$('.line-num').innerHTML = pos;
            }
        },
        socketQueueShift: function(d){
            if (d) {
                CHAT.initCustomer(d);
                CHAT.socketConnectTimeOut();
            }
        },
        socketReconnect: function(){
            CHAT.timeStart = U.dateISOFomat(new Date()).getTime();
            CHAT.chatState = 1;
        },
        socketError: function(){
            CHAT.msgTranslate({
                type: 1,
                msg: 'Its error to connect to the server!!! ',
                time: new Date()
            });
        }
    };


    win.CHAT = CHAT;

    CHAT.init();

})(window, document);
var ChatEmojis = {
    people: [
        {name: 'grinning-smile-eyes', text: '😁'},
        {name: 'tears-of-joy', text: '😂'},
        {name: 'smiling-open-mouth', text: '😃'},
        {name: 'smiling-mouth-eyes', text: '😄'},
        {name: 'smiling-cold-sweat', text: '😅'},
        {name: 'smiling-closed-eyes', text: '😆'},
        {name: 'winking', text: '😉', code: 'U+1F609'},
        {name: 'smiling-eyes', text: '😊'},
        {name: 'delicious-food', text: '😋'},
        {name: 'relieved', text: '😌'},
        {name: 'heart-shaped', text: '😍'},
        {name: 'smirking', text: '😏'},
        {name: 'unamused', text: '😒'},
        {name: 'cold-sweat', text: '😓'},
        {name: 'pensive', text: '😔'},
        {name: 'confounded', text: '😖'},
        {name: 'throwing-kiss', text: '😘'},
        {name: 'kissing-closed-eyes', text: '😚'},
        {name: 'stuck-out-tongue', text: '😜'},
        {name: 'tightly-closed-eyes', text: '😝'},
        {name: 'disappointed', text: '😞'},
        {name: 'angry', text: '😠'},
        {name: 'pouting', text: '😡'},
        {name: 'crying', text: '😢'},
        {name: 'persevering', text: '😣'},
        {name: 'look-of-triumph', text: '😤'},
        {name: 'disappointed-relieved', text: '😥'},
        {name: 'fearful', text: '😨'},
        {name: 'weary', text: '😩'},
        {name: 'sleepy', text: '😪'},
        {name: 'tired', text: '😫'},
        {name: 'loudly-crying ', text: '😭'},
        {name: 'mouth-cold-sweat', text: '😰'},
        {name: 'screaming-in-fear', text: '😱'},
        {name: 'astonished', text: '😲'},
        {name: 'flushed', text: '😳'},
        {name: 'dizzy', text: '😵'},
        {name: 'medical-mask', text: '😷'},
        {name: 'hands-in-celebration', text: '🙌'},
        {name: 'folded-hands', text: '🙏'},
        {name: 'raised-first', text: '✊'},
        {name: 'raised-hand', text: '✋'},
        {name: 'victory-hand', text: '✌️'},
        {name: 'ok-hand-sign', text: '👌'},
        {name: 'waving-hand-sign', text: '👋'},
        {name: 'thumbs-up-sign', text: '👍'},
        {name: 'clapping-hands-sign', text: '👏'}
    ],
    nature: [
        {name: 'dog', text: '🐶'},
        {name: 'wolf', text: '🐺'},
        {name: 'cat', text: '🐱'},
        {name: 'mouse', text: '🐭'},
        {name: 'hamster', text: '🐹'},
        {name: 'rabbit', text: '🐰'},
        {name: 'frog', text: '🐸'},
        {name: 'tiger', text: '🐯'},
        {name: 'koala', text: '🐨'},
        {name: 'bear', text: '🐻'},
        {name: 'pig', text: '🐷'},
        {name: 'cow', text: '🐮'},
        {name: 'boar', text: '🐗'},
        {name: 'monkey-face', text: '🐵'},
        {name: 'monkey', text: '🐒'},
        {name: 'horse', text: '🐴'},
        {name: 'sheep', text: '🐑'},
        {name: 'elephant', text: '🐘'},
        {name: 'panda-face', text: '🐼'},
        {name: 'penguin', text: '🐧'},
        {name: 'bird', text: '🐦'},
        {name: 'baby-chick', text: '🐤'},
        {name: 'hatched-chick', text: '🐥'},
        {name: 'hatching-chick', text: '🐣'},
        {name: 'chicken', text: '🐔'},
        {name: 'snake', text: '🐍'},
        {name: 'turtle', text: '🐢'},
        {name: 'bug', text: '🐛'},
        {name: 'bee', text: '🐝'},
        {name: 'ant', text: '🐜'},
        {name: 'beetle', text: '🐞'},
        {name: 'snail', text: '🐌'},
        {name: 'lion-face', text: '🦁'},
        {name: 'unicorn-face', text: '🦄'},
        {name: 'spider', text: '🕷'},
        {name: 'cherry-blossom', text: '🌸'},
        {name: 'tulip', text: '🌷'},
        {name: 'four-leaf-clover', text: '🍀'},
        {name: 'rose', text: '🌹'},
        {name: 'sunflower', text: '🌻'},
        {name: 'hibiscus', text: '🌺'},
        {name: 'maple-leaf', text: '🍁'},
        {name: 'leaves', text: '🍃'},
        {name: 'first-quarter-moon', text: '🌓'},
        {name: 'moon', text: '🌔'},
        {name: 'full-moon', text: '🌕'},
        {name: 'earth-asia', text: '🌏'},
        {name: 'volcano', text: '🌋'},
        {name: 'milky-way', text: '🌌'},
        {name: 'stars', text: '🌠'},
        {name: 'sun-behind-large-cloud', text: '🌥'},
        {name: 'cloud-with-rain', text: '🌧'},
        {name: 'cloud-with-lightning', text: '🌩'}
    ],
    objects: [
        {name: 'bamboo', text: '🎍'},
        {name: 'gift-heart', text: '💝'},
        {name: 'dolls', text: '🎎'},
        {name: 'school-satchel', text: '🎒'},
        {name: 'mortar-board', text: '🎓'},
        {name: 'flags', text: '🎏'},
        {name: 'fireworks', text: '🎆'},
        {name: 'sparkler', text: '🎇'},
        {name: 'wind-chime', text: '🎐'},
        {name: 'ghost', text: '👻'},
        {name: 'gift', text: '🎁'},
        {name: 'alarm-clock', text: '⏰'},
        {name: 'closed-lock-with-key', text: '🔐'},
        {name: 'pill', text: '💊'},
        {name: 'date', text: '📅'},
        {name: 'books', text: '📚'},
        {name: 'basketball', text: '🏀'},
        {name: 'football', text: '🏈'},
        {name: 'beer', text: '🍺'},
        {name: 'game-die', text: '🎲'},
        {name: 'tea', text: '🍵'},
        {name: 'lollipop', text: '🍭'},
        {name: 'studio-microphone', text: '🎙'},
        {name: 'oil-drum', text: '🛢'},
        {name: 'apple', text: '🍎'},
        {name: 'green-apple', text: '🍏'},
        {name: 'tangerine', text: '🍊'},
        {name: 'cherries', text: '🍒'},
        {name: 'grapes', text: '🍇'},
        {name: 'watermelon', text: '🍉'},
        {name: 'strawberry', text: '🍓'},
        {name: 'peach', text: '🍑'},
        {name: 'tomato', text: '🍅'},
        {name: 'desktop-computer', text: '🖥'},
        {name: 'printer', text: '🖨'},
        {name: 'trackball', text: '🖲'},
        {name: 'computer-mouse', text: '🖱'},
        {name: 'framed-picture', text: '🖼'}
    ],
    places: [
        {name: 'house', text: '🏠'},
        {name: 'school', text: '🏫'},
        {name: 'office', text: '🏢'},
        {name: 'hospital', text: '🏥'},
        {name: 'bus', text: '🚌'},
        {name: 'taxi', text: '🚗'},
        {name: 'car', text: '🚕'},
        {name: 'truck', text: '🚚'},
        {name: 'police-car', text: '🚓'},
        {name: 'ambulance', text: '🚑'},
        {name: 'fire-engine', text: '🚒'},
        {name: 'passenger-ship', text: '🛳'},
        {name: 'small-airplane', text: '🛩'},
        {name: 'national-park', text: '🕌'},
        {name: 'mosque', text: '🏞'},
        {name: 'cityscape', text: '🏙'},
        {name: 'synagogue', text: '🕍'},
        {name: 'department-store', text: '🏬'},
        {name: 'city-sunrise', text: '🌇'},
        {name: 'city-sunset', text: '🌆'},
        {name: 'tent', text: '⛺'},
        {name: 'factory', text: '🏭'},
        {name: 'sunrise', text: '🌅'},
        {name: 'statue-of-liberty', text: '🗽'},
        {name: 'bridge-at-night', text: '🌉'},
        {name: 'carousel-horse', text: '🎠'},
        {name: 'ferris-wheel', text: '🎡'},
        {name: 'fountain', text: '⛲'},
        {name: 'roller-coaster', text: '🎢'},
        {name: 'ticket', text: '🎫'},
        {name: 'barber', text: '💈'},
        {name: 'traffic-light', text: '🚥'},
        {name: 'construction', text: '🚧'},
        {name: 'beginner', text: '🔰'},
        {name: 'fuelpump', text: '⛽'},
        {name: 'round-pushpin', text: '📍'},
        {name: 'triangular-flag-on-post', text: '🚩'}
    ],
    symbols: [
        {name: 'keycap-ten', text: '🔟'},
        {name: '1234', text: '🔢'},
        {name: 'symbols', text: '🔣'},
        {name: 'capital-abcd', text: '🔠'},
        {name: 'abc', text: '🔤'},
        {name: 'arrow-up-small', text: '🔼'},
        {name: 'arrow-down-small', text: '🔽'},
        {name: 'rewind', text: '⏪'},
        {name: 'fast-forward', text: '⏩'},
        {name: 'arrow-double-up', text: '⏫'},
        {name: 'arrow-double-down', text: '⏬'},
        {name: 'pause-button', text: '⏸'},
        {name: 'stop-button', text: '⏹'},
        {name: 'record-button', text: '⏺'},
        {name: 'arrows-clockwise', text: '🔃'},
        {name: 'ok', text: '🆗'},
        {name: 'restroom', text: '🚻'},
        {name: 'mens', text: '🚹'},
        {name: 'womens', text: '🚺'},
        {name: 'wc', text: '🚾'},
        {name: 'no-entry-sign', text: '🚫'},
        {name: 'sos', text: '🆘'},
        {name: 'no-entry', text: '⛔'},
        {name: 'negative-squared-cross-mark', text: '❎'},
        {name: 'white-check-mark', text: '✅'},
        {name: 'heart-decoration', text: '💟'},
        {name: 'vs', text: '🆚'},
        {name: 'x', text: '❌'},
        {name: 'exclamation', text: '❗'},
        {name: 'question', text: '❓'},
        {name: 'o', text: '⭕'},
        {name: 'om', text: '🕉'},
        {name: 'menorah', text: '🕎'},
        {name: 'place-of-worship', text: '🛐'},
        {name: 'clock12', text: '🕛'},
        {name: 'clock1', text: '🕐'},
        {name: 'clock2', text: '🕑'},
        {name: 'clock3', text: '🕒'},
        {name: 'clock4', text: '🕓'},
        {name: 'clock5', text: '🕔'},
        {name: 'clock6', text: '🕕'},
        {name: 'clock7', text: '🕖'},
        {name: 'clock8', text: '🕗'},
        {name: 'clock9', text: '🕘'},
        {name: 'clock10', text: '🕙'},
        {name: 'clock11', text: '🕚'}
    ]
};

