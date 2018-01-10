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
                    if (xhr.readyState == 4) {
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

                if (params.type == 'GET') {
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
        }
    };

    var CHAT = {
        domain: (win.UUCHAT && win.UUCHAT.domain) || '',
        socket: null,
        timeStart: U.dateISOFomat(new Date()).getTime(),
        timeOutSeconds: 2700000,
        timeOutTimer: null,
        msgPageNum: 1,
        isLoadingMsg: false,
        hasMoreMsg: true,
        chatState: 0,
        cid: '',
        csid: '',
        csName: '',
        init: function(){
            U.loadStyle([CHAT.domain+'/static/css/customer.css']);
            var socketIO = localStorage.getItem ? localStorage.getItem('uuchat.skcdn', socketIO) : null;
            U.loadScript(socketIO || 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.3/socket.io.js', CHAT.ctrol);
            this.createCT();
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
                CHAT.socket && CHAT.socket.close();
            });
            U.addEvent(window, 'online', function(){
                CHAT.socket ? CHAT.socket.open() : CHAT.createSocket();
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
            str += '<pre class="send-pre"> </pre>';
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

            var str = '<div class="emoji-lists emoji-lists-hidden">';
            for (var i = 0, l = CHATemo.length; i < l; i++) {
                str += '<span class="emoji-item" title="'+CHATemo[i].name+'">'+CHATemo[i].text+' </span>';
            }
            str +='</div>';
            return str;
        },
        tempEmail: function(){
            var str = '<div class="chat-item chat-from"><div class="chat-text">';
            var uuInfoData = localStorage.getItem('uuInfoData');
            var emaiReg = /[0-9a-z_A-Z.\\-]+@(([0-9a-zA-Z]+)[.]){1,2}[a-z]{2,3}/g;
            var email = emaiReg.exec(uuInfoData);

            str += '<div class="email-notify">';
            if (email) {
                str += '<h4>You\'ll be notified here and by email</h4>';
                str += '<h5><a href="javascript:;"+email[0]+">'+email[0]+'</a></h5>';
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
        tempMsgItem: function(type, msg, t){
            var str = '';
            var cls = '';
            var name = '';
            var hour = '';
            var minute = '';
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
                            if (curTime != diffTime) {
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

            var dateStr = '';

            dateStr = time.split('T')[0];
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
        notifyEmail: function (action) {

            var notify = U.$('.email-notify');

            if (action === 'send') {
                send();
            } else if(action === 'focus') {
                focus();
            }

            function send() {
                var email = U.$('.email-input').value.replace(/^\s$/g, '');
                if (email == '' || !/^[0-9a-z_A-Z.\\-]+@(([0-9a-zA-Z]+)[.]){1,2}[a-z]{2,3}$/g.test(email)) {
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
                    CHAT.socket && CHAT.socket.close();
                }
            }, 5000);
        },
        socketConnectError: function(){
            U.$('.chat-main').innerHTML = '<div class="chat-offline"><div class="chat-error">The system is busy! Please try again later</div></div>';
        },
        socketDisconnect: function(){
            clearInterval(CHAT.timeOutTimer);
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
                    U.$('.send-pre').innerHTML += tg.innerHTML;
                }
            });
            U.addEvent(U.$('.emoji-lists'), 'mouseleave', function(e){
                U.toggleClass(U.$('.emoji-lists'), 'emoji-lists-hidden');
            });

            U.$('.chat-upload') && U.addEvent(U.$('.chat-upload'), 'change', function(e){

                var _self = this;
                var data = new FormData();
                var fileName = e.target.files[0];
                var fileSize = 0;
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
                                U.$('.chat-msg').removeChild(U.$('.upload-tips'));
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

            U.addEvent(U.$('.chat-send-area'), 'keydown', function(e){
                var e = e || w.event;
                var val = '';
                var _self = this;
                var keyCode = e.keyCode ? e.keyCode : e.which;

                setTimeout(function () {
                    val = _self.value.replace(/>/g, "&gt;").replace(/^\s$/g, "").replace(/</g, "&lt;");

                    if (val.length > 0 && !/^(&nbsp;)*$/g.test(val)) {
                        U.$('.send-pre').innerHTML = val;
                    } else {
                        _self.value = '';
                        U.$('.send-pre').innerHTML = ' ';
                    }

                    if (13 === keyCode) {
                        if (val && !/^#*$/g.test(val)) {
                            CHAT.socketSendMessage(val);
                            U.addClass(U.$('.emoji-lists'), 'emoji-lists-hidden');
                        }
                        _self.value = '';
                        _self.focus();
                        U.$('.send-pre').innerHTML = ' ';
                        e.returnValue && (e.returnValue = false);
                        e.preventDefault && e.preventDefault();
                    }
                }, 0);

            });
            U.addEvent(U.$('.chat-send-area'), 'blur', function(e){
                U.$('.send-pre').innerHTML = this.value.replace(/^\s$/g, ' ');
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
                    if (/[a-zA-Z0-9.%=/]{1,}[.](jpg|png|jpeg|gif)/g.test(msg)) {
                        U.addClass(U.$('.t-'+d), 'done-img');
                    } else {
                        U.addClass(U.$('.t-'+d), 'done');
                    }

                    if (!U.$('.email-notify')) {
                        CHAT.msgTranslate({
                            type: 1,
                            msg: "save typically replies in a few hours",
                            time: U.dateISOFomat(new Date()).getTime()
                        });
                        CHAT.msgTranslate({
                            type: 1,
                            msg: "Give them a way to reach you: ",
                            time: U.dateISOFomat(new Date()).getTime()
                        });
                        CHAT.msgTranslate({
                            type: 8,
                            msg: 'Offline email',
                            time: U.dateISOFomat(new Date()).getTime()
                        });
                    }

                });
                return false;
            }

            CHAT.socket.emit('c.message', CHAT.cid, msg, watchDog(function(err, success){
                if (success) {
                    if (/[a-zA-Z0-9.%=/]{1,}[.](jpg|png|jpeg|gif)$/g.test(msg)) {
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
var CHATemo=[{name:"grinning-smile-eyes",text:"\ud83d\ude01",code:"U+1F601"},{name:"tears-of-joy",text:"\ud83d\ude02",code:"U+1F602"},{name:"smiling-open-mouth",text:"\ud83d\ude03",code:"U+1F603"},{name:"smiling-mouth-eyes",text:"\ud83d\ude04",code:"U+1F604"},{name:"smiling-cold-sweat",text:"\ud83d\ude05",code:"U+1F605"},{name:"smiling-closed-eyes",text:"\ud83d\ude06",code:"U+1F606"},{name:"winking",text:"\ud83d\ude09",code:"U+1F609"},{name:"smiling-eyes",text:"\ud83d\ude0a",code:"U+1F60A"},{name:"delicious-food",
    text:"\ud83d\ude0b",code:"U+1F60B"},{name:"relieved",text:"\ud83d\ude0c",code:"U+1F60C"},{name:"heart-shaped",text:"\ud83d\ude0d",code:"U+1F60D"},{name:"smirking",text:"\ud83d\ude0f",code:"U+1F60F"},{name:"unamused",text:"\ud83d\ude12",code:"U+1F612"},{name:"cold-sweat",text:"\ud83d\ude13",code:"U+1F613"},{name:"pensive",text:"\ud83d\ude14",code:"U+1F614"},{name:"confounded",text:"\ud83d\ude16",code:"U+1F616"},{name:"throwing-kiss",text:"\ud83d\ude18",code:"U+1F618"},{name:"kissing-closed-eyes",text:"\ud83d\ude1a",
    code:"U+1F61A"},{name:"stuck-out-tongue",text:"\ud83d\ude1c",code:"U+1F61C"},{name:"tightly-closed-eyes",text:"\ud83d\ude1d",code:""},{name:"disappointed",text:"\ud83d\ude1e",code:"U+1F61E"},{name:"angry",text:"\ud83d\ude20",code:"U+1F620"},{name:"pouting",text:"\ud83d\ude21",code:"U+1F621"},{name:"crying",text:"\ud83d\ude22",code:"U+1F622"},{name:"persevering",text:"\ud83d\ude23",code:"U+1F623"},{name:"look-of-triumph",text:"\ud83d\ude24",code:"U+1F624"},{name:"disappointed-relieved",text:"\ud83d\ude25",
    code:"U+1F625"},{name:"fearful",text:"\ud83d\ude28",code:"U+1F628"},{name:"weary",text:"\ud83d\ude29",code:"U+1F629"},{name:"sleepy",text:"\ud83d\ude2a",code:"U+1F62A"},{name:"tired",text:"\ud83d\ude2b",code:"U+1F62B"},{name:"loudly-crying ",text:"\ud83d\ude2d",code:"U+1F62D"},{name:"mouth-cold-sweat",text:"\ud83d\ude30",code:"U+1F630"},{name:"screaming-in-fear",text:"\ud83d\ude31",code:"U+1F631"},{name:"astonished",text:"\ud83d\ude32",code:"U+1F632"},{name:"flushed",text:"\ud83d\ude33",code:"U+1F633"},
    {name:"dizzy",text:"\ud83d\ude35",code:"U+1F635"},{name:"medical-mask",text:"\ud83d\ude37",code:"U+1F637"},{name:"hands-in-celebration",text:"\ud83d\ude4c",code:"U+1F64C"},{name:"folded-hands",text:"\ud83d\ude4f",code:"U+1F64F"},{name:"raised-first",text:"\u270a\ufe0f",code:"U+270A"},{name:"raised-hand",text:"\u270b\ufe0f",code:"U+270B"},{name:"victory-hand",text:"\u270c\ufe0f",code:"U+270C"},{name:"ok-hand-sign",text:"\ud83d\udc4c",code:"U+1F44C"},{name:"waving-hand-sign",text:"\ud83d\udc4b",code:"U+1F44B"},{name:"thumbs-up-sign",
        text:"\ud83d\udc4d",code:"U+1F44D"},{name:"clapping-hands-sign",text:"\ud83d\udc4f",code:"U+1F44F"},{name:"kiss-mark",text:"\ud83d\udc8b",code:"U+1F48B"}];

