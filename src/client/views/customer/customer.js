;(function(w, doc,undefined){

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
            } else if(el.attchEvent) {
                el.attachEvent('on'+event, fn);
            } else {
                el['on'+event] = fn;
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

                var xhr = null;

                xhr = new XMLHttpRequest() || new ActiveXObjcet('Microsoft.XMLHTTP');

                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        var status = xhr.status;
                        if (status >= 200 && status < 300) {
                            var response = '',
                                type = xhr.getResponseHeader('Content-type');

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
                }

                xhr.upload.onprogress = params.progress;
                params.error && (xhr.onerror = params.error);

                if (params.type == 'GET') {
                    xhr.open(params.type, params.url + '?' + params.data, true);
                    xhr.send(null);
                } else {
                    xhr.open(params.type, params.url, true);
                    xhr.send(params.data);
                }
            }

            function jsonp(params) {
                var callbackName = params.jsonp,
                    head = document.getElementsByTagName('head')[0],
                    data ,
                    script = document.createElement('script');

                params.data['callback'] = callbackName;
                data = formatParams(params.data);

                head.appendChild(script);
                window[callbackName] = function(json) {
                    head.removeChild(script);
                    clearTimeout(script.timer);
                    window[callbackName] = null;
                    params.success && params.success(json);
                }
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
        cutStr: function(str, len){
            var str_length = 0,
                str_cut = new String(),
                str_len = str.length,
                a = '';

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
        isLtIe8: function(){
            var UA = navigator.userAgent,
                isIE = UA.indexOf('MSIE') > -1,
                v = isIE ? /\d+/.exec(UA.split(';')[1]) : 'no ie';

            return v <= 8;
        }
    };


    var CHAT = {
        domain: (w.UUCHAT && w.UUCHAT.domain) || '',
        socket: null,
        timeStart: U.dateISOFomat(new Date()).getTime(),
        timeOutSeconds: 2700000,
        timeOutTimer: null,
        chat: {
            cid: '',
            csid: '',
            csName: ''
        },
        init: function(){
            U.loadStyle([CHAT.domain+'/static/css/customer.css']);
            if(U.isLtIe8()){
                U.loadScript(CHAT.domain+'/static/images/socket.io.js', CHAT.ctrol);
            }else{
                var socketIO = localStorage.getItem ? localStorage.getItem('uuchat.skcdn', socketIO) : null;
                U.loadScript(socketIO || 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.7.3/socket.io.min.js', CHAT.ctrol);
            }
            this.createCT();
        },
        createCT: function(){
            var ct = this.template(),
                ctNode = document.createElement('div');

            ctNode.setAttribute('class', 'chat-console chat-console-hidden');
            ctNode.innerHTML = ct;
            doc.body.appendChild(ctNode);
        },
        ctrol: function(){

            U.addEvent(U.$('.chat-btn'), 'click', function(e){
                U.toggleClass(U.$('.chat-console'), 'chat-console-hidden');
                U.toggleClass(this, 'chat-btn-close');

                U.$('.chat-nums').style.display = 'none';
                U.$('.chat-nums').innerHTML = 0;

                if(!CHAT.socket){
                    CHAT.createSocket();
                }
            });
        },
        createSocket: function(){
            var io = window.io || io || {};

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
                if (CHAT.socket) {
                    CHAT.socket.close();
                }
            });
            U.addEvent(window, 'online', function(){
                if (CHAT.socket) {
                    CHAT.socket.open();
                } else {
                    CHAT.createSocket();
                }
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
        tempOffline: function(){
            var str ='<div class="chat-offline">';
            str +='<p class="offline-title">Have a question about what uuChat can do for you ?</p>';
            str +='<h6>Name:</h6>';
            str +='<input type="text" placeholder="Click here and type your Name" class="offline-name"/>';
            str +='<h6>Email:</h6>';
            str +='<input type="email" placeholder="Click here and type your Email" class="offline-email" required="required" />';
            str +='<h6>Describe:</h6>';
            str +='<textarea placeholder="Let us know and someone will get back to you within 24 hours, if not sooner!(max 256 words)" class="offline-text"></textarea>';
            str +='<button class="offline-send">Send</button></div>';

            return str;
        },
        tempMsg: function(){
            var str = '<div class="chat-msg"></div>';
            return str;
        },
        tempSend: function(){
            var str = '<div class="chat-send">';
            str += '<div class="chat-send-text">';
            str += '<pre class="send-pre"></pre>';
            str += '<textarea placeholder="Input text and Press Enter (max 256 words)" class="chat-send-area" maxlength="256"></textarea>';
            str += '<div class="chat-send-btns">';
            str += this.tempEmoji();
            str += '<label class="chat-send-btn chat-emoji-btn"></label>';
            if(window.FormData){
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
        tempMsgItem: function(role, msg, t){
            var str = '',
                cls = '',
                name = '',
                h = '',
                m = '',
                isOld = false;

            if(typeof t === 'number'){
                cls += 't-'+t+' ';
                t = U.dateISOFomat(t);
            }

            if(typeof t === 'string'){
                t = U.dateISOFomat(t);
                isOld = true;
            }

            h = t.getHours();
            m = t.getMinutes();

            m = m > 9 ? m : '0'+m;

            if (0 === role) {
                cls += 'chat-to';
                if (/(png|jpg|gif|jpeg)\|/g.test(msg)) {
                    cls += isOld ? ' done-img' : '';
                } else {
                    cls += isOld ? ' done' : '';
                }
            } else {
                cls = 'chat-from';
                name = CHAT.chat.csName;
            }

            msg = this.msgFilter(msg);
            str += '<div class="chat-item '+cls+'">';
            str += '<p class="chat-role"><i>'+name+'</i>'+h+':'+m+'</p>';
            str += '<div class="chat-text">'+msg+'</div>';
            str += '<div class="chat-caret"></div></div>';

            return str;
        },
        msgFilter: function(msg){
            var imgReg = /[a-zA-Z0-9.%=/]{1,}[.](jpg|png|jpeg)/g,
                imgSrc = msg,
                str = '';

            if (imgReg.test(imgSrc)) {
                imgSrc = msg.split('|');
                str += '<a href="'+CHAT.domain+'/'+imgSrc[1] +'" target="_blank">';
                str += '<img src="'+CHAT.domain+'/'+imgSrc[0] +'" width="'+imgSrc[2]+'" height="'+imgSrc[3]+'" alt="" /></a>';
            } else {
                str = msg.replace(/&nbsp;/g, ' ').replace(/#/gi, "<br />").replace(/((https?|ftp|file|http):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*)/g, function(match){
                    return '<a href="'+match+'" target="_blank">'+match+'</a>';
                });
            }
            return str;
        },
        msgTranslate: function(msgObj){

            var chatMsg =  U.$('.chat-msg');

            if (msgObj.msg === 1) {

                this.msgRate(chatMsg, msgObj);

            } else if(msgObj.msg === 2) {

                var str = '<div class="new-conversation">Click to New Conversation</div>';
                chatMsg.innerHTML += this.tempMsgItem(msgObj.role, str, new Date());

            } else {
                chatMsg && (chatMsg.innerHTML += this.tempMsgItem(msgObj.role, msgObj.msg, msgObj.time));
            }

            chatMsg && (chatMsg.scrollTop = chatMsg.scrollHeight);
            CHAT.updateLocalStorage({
                action: 'updateChatTime'
            });

            U.$('.new-conversation') && U.addEvent(U.$('.new-conversation'), 'click', function(){
                CHAT.createSocket();
            });

        },
        msgRate: function (chatMsg, msgObj) {

            var str = '';

            str += '<div class="rate-box">';
            str += '<p class="rate-title">Please rate the dialogue</p>';
            str += '<div class="rete-heart">';
            str += '<span class="rate-span">1</span><span class="rate-span">2</span><span class="rate-span">3</span><span class="rate-span">4</span><span class="rate-span">5</span>';
            str +='</div>';
            str +='<div class="rete-btn">Done</div></div>';

            chatMsg.innerHTML += this.tempMsgItem(msgObj.role, str, new Date());

            var hearts = U.$('.rete-heart', true),
                rateBtns = U.$('.rete-btn', true);

            for(var i = 0, l = hearts.length; i < l; i++){
                (function(i){
                    var rateLevel = 5,
                        rate = hearts[i].children;
                    U.addEvent(hearts[i], 'mouseover', function(e){
                        var e = e || w.event,
                            tg = e.target || e.srcElement;

                        if(tg.tagName.toLowerCase() === 'span'){
                            var rateNum = tg.innerHTML;
                            rateLevel = rateNum;

                            for(var j = 0; j < 5; j++){
                                if(j < rateNum){
                                    rate[j].className="rate-span active";
                                }else{
                                    rate[j].className="rate-span";
                                }
                            }
                        }
                    });
                    U.addEvent(rateBtns[i], 'click', function() {

                        chatMsg.innerHTML += CHAT.tempMsgItem(1, 'Thank you for your rate!! Goodbye!', new Date());
                        chatMsg.scrollTop = chatMsg.scrollHeight;

                        CHAT.socket.emit('c.rate', CHAT.chat.cid, rateLevel, function (success) {
                            if(success){
                                setTimeout(function(){
                                    CHAT.socket.close();
                                    CHAT.socket = null;
                                    U.$('.chat-main').innerHTML = '<div class="reconnect-btn"><img width="32" src="'+CHAT.domain+'/static/images/write.png">New Conversation</div>';
                                    U.addEvent(U.$('.reconnect-btn'), 'click', function(){
                                        CHAT.createSocket();
                                    });
                                }, 3000);
                            }
                        });
                    });
                })(i)
            }
        },
        updateLocalStorage: function(userInfo){

            var uuchatIF = U.$('#uuchatIframe').contentWindow,
                d = new Date(),
                data = {};

            data.lastTime = d.getTime();
            data.chatTime = d.getTime();
            data.cid = CHAT.chat.cid;
            data.action = userInfo.action;

            if(userInfo.action === 'updateUser'){
                data.name = userInfo.name;
                data.email = userInfo.email;
            }

            uuchatIF.postMessage(data, '*');

        },
        initCustomer: function(data){
            var msg = CHAT.tempMsg(),
                send = CHAT.tempSend(),
                msgList = '',
                src = (data.photo && data.photo !== '') ? data.photo : CHAT.domain+'/static/images/ua.png';

            CHAT.chat.cid = data.cid;
            CHAT.chat.csid = data.csid;
            CHAT.chat.csName = data.name;

            CHAT.updateLocalStorage({action: 'init'});

            U.$('.chat-name').innerHTML = data.name;
            U.$('.chat-main').innerHTML = msg;
            U.$('.chat-main').innerHTML += send;
            U.$('.avatar-img').setAttribute("src", CHAT.domain+'/'+src);

            if(data.msg.length > 0){
                for(var i = 0, l = data.msg.length; i < l; i++){
                    var msg = data.msg[i];
                    if(msg.type !== 3 && msg.type !== 4){
                        msgList += CHAT.tempMsgItem(msg.type, msg.msg, msg.createdAt);
                    }
                }
                U.$('.chat-msg').innerHTML += msgList;
            }

        },
        socketConnect: function(){
            this.emit('c.select', CHAT.socketCsSelect);
        },
        socketConnectTimeOut: function(){
            CHAT.timeStart = U.dateISOFomat(new Date()).getTime();
            clearInterval(CHAT.timeOutTimer);
            CHAT.timeOutTimer = setInterval(function(){
                var timeNow = U.dateISOFomat(new Date());
                if(timeNow.getTime() - CHAT.timeStart > CHAT.timeOutSeconds){
                    clearInterval(CHAT.timeOutTimer);
                    CHAT.socket && CHAT.socket.close();
                }
            }, 2000);
        },
        socketConnectError: function(){
            U.$('.chat-main').innerHTML = '<div class="chat-offline"><div class="chat-error">There has error !You can try it later again</div></div>';
        },
        socketDisconnect: function(){

            var timeNow = U.dateISOFomat(new Date()),
                tips = 'The customerSuccess has offline, you can try it by refesh the browser at latter';

            if (timeNow.getTime() - CHAT.timeStart > CHAT.timeOutSeconds) {
                tips = 'Long time no chat, disconnect, you can try it by refesh the browser at latter';
            }

            if (!U.$('.chat-msg')) {
                U.$('.chat-main').innerHTML = CHAT.tempMsg();
            }

            if (U.$('.new-conversation')) {
                return false;
            }

            CHAT.msgTranslate({
                role: 1,
                msg: tips,
                time: new Date()
            });
            CHAT.socketReconnectTips();
            U.$('.chat-name').innerHTML = CHAT.chat.csName;
            this.close();
            CHAT.socket = null;
        },
        socketSelectSuccess: function (data) {
            CHAT.socketConnectTimeOut();
            CHAT.initCustomer(data);
            U.addEvent(U.$('.chat-emoji-btn'), 'click', function(e){
                U.toggleClass(U.$('.emoji-lists'), 'emoji-lists-hidden');
            });
            U.addEvent(U.$('.emoji-lists'), 'click', function(e){
                var e = e || window.event,
                    tg = e.target || e.srcElement;

                if(tg.tagName.toLowerCase() === 'span'){
                    U.$('.chat-send-area').value += tg.innerHTML;
                    U.$('.send-pre').innerHTML += tg.innerHTML;
                    U.$('.chat-send-area').focus();
                }
            });

            U.$('.chat-upload') && U.addEvent(U.$('.chat-upload'), 'change', function(e){

                var _self = this,
                    data = new FormData(),
                    isLt2M = 0;

                if(!e.target.files[0]){
                    return false;
                }
                data.append('image', e.target.files[0]);

                isLt2M = e.target.files[0].size / 1024 /1024;

                if(isLt2M >= 2){
                    U.$('.chat-msg').innerHTML += '<div class="upload-tips">Image must smaller than 2MB!</div>';
                    this.value = '';
                    setTimeout(function(){
                        U.$('.upload-tips').parentNode.removeChild(U.$('.upload-tips'));
                    }, 2000);
                    return false;
                }

                U.$('.chat-msg').innerHTML += '<div class="upload-tips">Start upload ...</div>';

                U.ajax({
                    url: CHAT.domain+'/messages/customer/'+CHAT.chat.cid+'/cs/'+CHAT.chat.csid+'/image?f=c',
                    type:'POST',
                    fileType: true,
                    data: data,
                    progress: function(d){
                        if(d.total === 0){
                            U.$('.upload-tips').innerHTML = 'Upload failed!!!';
                        }else{
                            U.$('.upload-tips').innerHTML = 'Uploading '+Math.round(d.loaded/d.total*100)+ ' %';
                        }

                        if(d.loaded === d.total){
                            setTimeout(function(){
                                U.$('.upload-tips') && U.$('.upload-tips').parentNode.removeChild(U.$('.upload-tips'));
                            }, 2500);
                        }
                    },
                    success: function(data){
                        var d = JSON.parse(data);
                        if(d.code === 200){
                            CHAT.socketSendMessage(d.msg.resized+'|'+d.msg.original+'|'+d.msg.w+'|'+d.msg.h);
                        }
                    },
                    error: function(e){
                        _self.value = '';
                        if(U.$('.upload-tips')){
                            U.$('.upload-tips').innerHTML = 'upload image has cros error.';
                            setTimeout(function(){
                                U.$('.upload-tips') && U.$('.upload-tips').parentNode.removeChild(U.$('.upload-tips'));
                            }, 2500);
                        }
                    }
                });

            });

            U.addEvent(U.$('.chat-send-area'), 'keydown', function(e){
                var e = e || w.event,
                    val = '',
                    _self = this;


                setTimeout(function () {
                    val = _self.value;
                    val = val.replace(/>/g, "&gt;").replace(/^\s$/g, "").replace(/</g, "&lt;").replace(/ /gi, '&nbsp;').replace(/\n/gi, '#');
                    U.$('.send-pre').innerHTML = val;
                    
                    if (13 === e.keyCode) {
                        if (val !== '') {
                            CHAT.socketSendMessage(val);
                            U.$('.send-pre').innerHTML = '';
                            _self.value = '';
                            _self.focus();
                            U.addClass(U.$('.emoji-lists'), 'emoji-lists-hidden');
                        }
                        e.returnValue = false;
                        e.preventDefault && e.preventDefault();
                    }
                }, 0);

            });
            U.addEvent(U.$('.chat-send-area'), 'blur', function(e){
                U.$('.send-pre').innerHTML = this.value;
            });
        },
        socketCsSelect: function(type, data){
            if(1 === type){

                CHAT.socketSelectSuccess(data);

            }else if(2 === type){

                var queue = '<div class="chat-offline"><div class="line-up">Current queue number <i class="line-num">';
                queue += data.num;
                queue += '</i></div></div>';
                U.$('.chat-main').innerHTML = queue;

            }else if(3 === type){
                CHAT.customerSuccessOffline();
            }
        },
        customerSuccessOffline: function(){
            var offline = CHAT.tempOffline();

            U.$('.chat-main').innerHTML = offline;
            U.addEvent(U.$('.offline-name'), 'focus', function(){
                U.removeClass(this, 'error');
            });
            U.addEvent(U.$('.offline-email'), 'focus', function(){
                U.removeClass(this, 'error');
            });
            U.addEvent(U.$('.offline-text'), 'focus', function(){
                U.removeClass(this, 'error');
            });

            U.addEvent(U.$('.offline-send'), 'click', function(){

                var name = U.$('.offline-name').value,
                    email = U.$('.offline-email').value,
                    content = U.$('.offline-text').value,
                    vertify = true;

                if(name === ''){
                    U.addClass(U.$('.offline-name'), 'error');
                    vertify = false;
                }

                if(email === '' || !/^[0-9a-z_A-Z.\\-]+@(([0-9a-zA-Z]+)[.]){1,2}[a-z]{2,3}$/g.test(email)){
                    U.addClass(U.$('.offline-email'), 'error');
                    vertify = false;
                }

                if(content === ''){
                    U.addClass(U.$('.offline-text'), 'error');
                    vertify = false;
                }
                if(!vertify){
                    return false;
                }

                CHAT.updateLocalStorage({
                    action: 'updateUser',
                    name: name,
                    email: email
                });

                U.ajax({
                    url:CHAT.domain+'/offlines',
                    type:'GET',
                    jsonp: 'jsonpCallback',
                    data: {
                        "name": name,
                        "email": email,
                        "content": content
                    },
                    success: function(d){

                        if (d.code === 200) {
                            var str = '<div className="offline-text-success">';

                            str += '<div class="offline-success">Thank you for your message!We\'ll get back to you as soon as possible！</div></div>';

                            U.$('.chat-offline').innerHTML = str;
                        }
                    }
                });
            });
        },
        socketReconnectTips: function(){
            CHAT.msgTranslate({
                role: 1,
                msg: 2,
                time: new Date()
            });
        },
        socketDispatch: function(csid, name, avatar){
            CHAT.chat.csid = csid;
            CHAT.chat.name = name;
            U.$('.chat-name').innerHTML = name;
        },
        socketActionRate: function(){
            CHAT.msgTranslate({
                role: 1,
                msg: 1,
                time: new Date()
            });
        },
        socketSendMessage: function(msg){
            CHAT.socketEmitMessage(U.cutStr(msg, 256));
        },
        socketEmitMessage: function(msg){
            var d = (new Date()).getTime();
            CHAT.timeStart = U.dateISOFomat(new Date()).getTime();
            CHAT.msgTranslate({
                role: 0,
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
            };


            CHAT.socket && CHAT.socket.emit('c.message', CHAT.chat.cid, msg, watchDog(function(err, success){
                if(success){
                    if(/(png|jpg|jpeg|gif)\|/g.test(msg)){
                        U.addClass(U.$('.t-'+d), 'done-img');
                    }else{
                        U.addClass(U.$('.t-'+d), 'done');
                    }

                }else{
                    U.$('.t-'+d).querySelector('.chat-text').innerHTML += '<span class="resend-btn" title="Click to resend">!</span>';
                    var resendBtns = U.$('.resend-btn', true);

                    for (var i = 0, l = resendBtns.length; i < l; i++) {
                        (function(el){
                            U.addEvent(el, "click", function(){
                                var resendMsg = this.parentNode.innerHTML.replace('<span class="resend-btn" title="Click to resend">!</span>', '');
                                CHAT.socketEmitMessage(U.cutStr(resendMsg, 256));
                            });
                        })(resendBtns[i]);
                    }
                }
            }));
        },
        socketCsMessage: function(cid, msg){
            var chatNums = U.$('.chat-nums');
            CHAT.timeStart = U.dateISOFomat(new Date()).getTime();
            CHAT.msgTranslate({
                role: 1,
                msg: msg,
                time: new Date()
            });

            if(!U.hasClass(U.$('.chat-btn'), 'chat-btn-close')){
                var n = chatNums.innerHTML;
                n++;
                chatNums.innerHTML = n;
                chatNums.style.display = 'block';
            }
        },
        socketCloseDialog: function(){
            CHAT.msgTranslate({
                role: 1,
                msg: 'The customerSuccess is offline!',
                time: new Date()
            });
            CHAT.socketReconnectTips();
        },
        socketCsStatus: function(status){
            if(1 === status){
                U.$('.chat-name').innerHTML = '<span class="status-title">Entering</span>';
            }else if(2 === status){
                U.$('.chat-name').innerHTML = CHAT.chat.csName;
            }
        },
        socketCsDisconnect: function(){
            clearInterval(CHAT.timeOutTimer);
            CHAT.msgTranslate({
                role: 1,
                msg: 'The customerSuccess is offline!',
                time: new Date()
            });
            CHAT.socketReconnectTips();
        },
        socketQueueUpdate: function(pos){
            if(U.$('.line-num')){
                U.$('.line-num').innerHTML = pos;
            }
        },
        socketQueueShift: function(d){
            if(d){
                CHAT.initCustomer(d);
                CHAT.socketConnectTimeOut();
            }
        },
        socketReconnect: function(){
            CHAT.msgTranslate({
                role: 1,
                msg: 'Reconnect to server success!!!',
                time: new Date()
            });
        },
        socketError: function(){
            CHAT.msgTranslate({
                role: 1,
                msg: 'Its error to connect to the server!!! ',
                time: new Date()
            });
        }
    };


    w.CHAT = CHAT;

    CHAT.init();

})(window, document);
var CHATemo=[{name:"grinning-smile-eyes",text:"\ud83d\ude01",code:"U+1F601"},{name:"tears-of-joy",text:"\ud83d\ude02",code:"U+1F602"},{name:"smiling-open-mouth",text:"\ud83d\ude03",code:"U+1F603"},{name:"smiling-mouth-eyes",text:"\ud83d\ude04",code:"U+1F604"},{name:"smiling-cold-sweat",text:"\ud83d\ude05",code:"U+1F605"},{name:"smiling-closed-eyes",text:"\ud83d\ude06",code:"U+1F606"},{name:"winking",text:"\ud83d\ude09",code:"U+1F609"},{name:"smiling-eyes",text:"\ud83d\ude0a",code:"U+1F60A"},{name:"delicious-food",
    text:"\ud83d\ude0b",code:"U+1F60B"},{name:"relieved",text:"\ud83d\ude0c",code:"U+1F60C"},{name:"heart-shaped",text:"\ud83d\ude0d",code:"U+1F60D"},{name:"smirking",text:"\ud83d\ude0f",code:"U+1F60F"},{name:"unamused",text:"\ud83d\ude12",code:"U+1F612"},{name:"cold-sweat",text:"\ud83d\ude13",code:"U+1F613"},{name:"pensive",text:"\ud83d\ude14",code:"U+1F614"},{name:"confounded",text:"\ud83d\ude16",code:"U+1F616"},{name:"throwing-kiss",text:"\ud83d\ude18",code:"U+1F618"},{name:"kissing-closed-eyes",text:"\ud83d\ude1a",
    code:"U+1F61A"},{name:"stuck-out-tongue",text:"\ud83d\ude1c",code:"U+1F61C"},{name:"tightly-closed-eyes",text:"\ud83d\ude1d",code:""},{name:"disappointed",text:"\ud83d\ude1e",code:"U+1F61E"},{name:"angry",text:"\ud83d\ude20",code:"U+1F620"},{name:"pouting",text:"\ud83d\ude21",code:"U+1F621"},{name:"crying",text:"\ud83d\ude22",code:"U+1F622"},{name:"persevering",text:"\ud83d\ude23",code:"U+1F623"},{name:"look-of-triumph",text:"\ud83d\ude24",code:"U+1F624"},{name:"disappointed-relieved",text:"\ud83d\ude25",
    code:"U+1F625"},{name:"fearful",text:"\ud83d\ude28",code:"U+1F628"},{name:"weary",text:"\ud83d\ude29",code:"U+1F629"},{name:"sleepy",text:"\ud83d\ude2a",code:"U+1F62A"},{name:"tired",text:"\ud83d\ude2b",code:"U+1F62B"},{name:"loudly-crying ",text:"\ud83d\ude2d",code:"U+1F62D"},{name:"mouth-cold-sweat",text:"\ud83d\ude30",code:"U+1F630"},{name:"screaming-in-fear",text:"\ud83d\ude31",code:"U+1F631"},{name:"astonished",text:"\ud83d\ude32",code:"U+1F632"},{name:"flushed",text:"\ud83d\ude33",code:"U+1F633"},
    {name:"dizzy",text:"\ud83d\ude35",code:"U+1F635"},{name:"medical-mask",text:"\ud83d\ude37",code:"U+1F637"},{name:"hands-in-celebration",text:"\ud83d\ude4c",code:"U+1F64C"},{name:"folded-hands",text:"\ud83d\ude4f",code:"U+1F64F"},{name:"raised-first",text:"\u270a",code:"U+270A"},{name:"raised-hand",text:"\u270b",code:"U+270B"},{name:"victory-hand",text:"\u270c",code:"U+270C"},{name:"ok-hand-sign",text:"\ud83d\udc4c",code:"U+1F44C"},{name:"waving-hand-sign",text:"\ud83d\udc4b",code:"U+1F44B"},{name:"thumbs-up-sign",
        text:"\ud83d\udc4d",code:"U+1F44D"},{name:"clapping-hands-sign",text:"\ud83d\udc4f",code:"U+1F44F"},{name:"kiss-mark",text:"\ud83d\udc8b",code:"U+1F48B"}];

