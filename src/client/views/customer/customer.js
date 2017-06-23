/**
 * Created by lwc on 2017/6/1.
 */

;(function(w, doc,undefined){

    function $(el){
        if(/^#/g.test(el)){
            return doc.querySelector(el);
        }else if(/^\./g.test(el)){
            return doc.querySelectorAll(el);
        }
    }

    function addEvent(el, event, fn){
        if(el.addEventListener){
            el.addEventListener(event, fn, false);
        }else if(el.attchEvent){
            el.attachEvent('on'+event, fn);
        }else{
            el['on'+event] = fn;
        }
    }

    function hasClass(obj, cls) {
        return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }

    function addClass(obj, cls) {
        if (!hasClass(obj, cls)) obj.className += " " + cls;
    }

    function removeClass(obj, cls) {
        if (hasClass(obj, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            obj.className = obj.className.replace(reg, ' ');
        }
    }

    function toggleClass(obj,cls){
        if(hasClass(obj,cls)){
            removeClass(obj, cls);
        }else{
            addClass(obj, cls);
        }
    }

    var UUCT = {
        domain: 'http://127.0.0.1:9688',
        socket: null,
        chat: {
            cid: '',
            csid: '',
            csName: ''
        },
        init: function(){
            this.loadStyle([UUCT.domain+'/static/css/customer.css']);
            if(this.isLtIe8()){
                this.loadScript(UUCT.domain+'/static/images/socket.io.js');
            }else{
                this.loadScript(UUCT.domain+'/socket.io/socket.io.js');
            }
            this.createCT();
        },
        loadStyle: function(arr){

            for(var i = 0, l = arr.length; i < l; i++){
                var style = doc.createElement('link');
                style.href = arr[i];
                style.rel  = 'stylesheet';
                doc.getElementsByTagName('HEAD')[0].appendChild(style);
            }
        },
        loadScript: function(url){
            var spt = doc.createElement('script');
            spt.src = url;
            doc.getElementsByTagName('HEAD')[0].appendChild(spt);

            spt.onload = spt.onreadystatechange = function(){
                if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete" ) {
                    UUCT.ctrol();
                    spt.onload = spt.onreadystatechange = null;
                }

            };
        },
        isLtIe8: function(){
            var UA = navigator.userAgent,
                isIE = UA.indexOf('MSIE') > -1,
                v = isIE ? /\d+/.exec(UA.split(';')[1]) : 'no ie';
            return v <= 8;
        },
        createCT: function(){
            var ct = this.template(),
                ctNode = document.createElement('div');

            ctNode.setAttribute('class', 'chat-console');
            ctNode.innerHTML = ct;

            doc.body.appendChild(ctNode);
        },
        ctrol: function(){

            addEvent($('.chat-btn')[0], 'click', function(e){
                toggleClass($('.chat-body')[0], 'chat-body-hidden');
                toggleClass(this, 'chat-btn-close');

                $('.chat-nums')[0].style.display = 'none';
                $('.chat-nums')[0].innerHTML = 0;

                if(!UUCT.socket){
                    UUCT.createSocket();
                }
            });
        },
        ajax: function(params){
            var params = params || {}
                params.data = params.data || {},
                json = params.jsonp ? jsonp(params) : json(params);


            function json(params){
                params.type = (params.type || 'GET').toUpperCase();
                !params.fileType && (params.data = formatParams(params.data));

                var xhr = null;
                if(window.XMLHttpRequest) {
                    xhr = new XMLHttpRequest();
                } else {
                    xhr = new ActiveXObjcet('Microsoft.XMLHTTP');
                };

                xhr.onreadystatechange = function() {
                    if(xhr.readyState == 4) {
                        var status = xhr.status;
                        if(status >= 200 && status < 300) {
                            var response = '';
                            var type = xhr.getResponseHeader('Content-type');
                            if(type.indexOf('xml') !== -1 && xhr.responseXML) {
                                response = xhr.responseXML;
                            } else if(type === 'application/json') {
                                response = JSON.parse(xhr.responseText);
                            } else {
                                response = xhr.responseText;
                            };

                            params.success && params.success(response);
                        } else {
                            params.error && params.error(status);
                        }
                    };
                };

                if(params.type == 'GET') {
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
                };
                script.src = params.url + '?' + data;
                if(params.time) {
                    script.timer = setTimeout(function() {
                        window[callbackName] = null;
                        head.removeChild(script);
                        params.error && params.error({
                            message: 'timeout'
                        });
                    }, time);
                }
            };

            function formatParams(data) {
                var arr = [];
                for(var name in data) {
                    arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
                };
                arr.push('v=' + random());
                return arr.join('&');
            }
            function random() {
                return Math.floor(Math.random() * 10000 + 500);
            }
        },
        createSocket: function(){
            var io = window.io || io || {};

            UUCT.socket = io(UUCT.domain+'/c', {
                forceNew: true,
                reconnectionAttempts:5,
                reconnectionDelay:2000 ,
                timeout: 10000
            });
            UUCT.socket .on('connect', UUCT.socketConnect);
            UUCT.socket .on('connect_error', UUCT.socketConnectError);
            UUCT.socket .on('disconnect', UUCT.socketDisconnect);
            UUCT.socket .on('reconnect', UUCT.socketReconnect);
            UUCT.socket .on('error', UUCT.socketError);
        },
        template: function(){
            var str = '<div class="chat-body chat-body-hidden">';
            str +='<div class="chat-header"><div class="chat-avatar"><img class="avatar-img" src="'+UUCT.domain+'/static/images/ua.png" /></div><div class="chat-name"></div></div>';
            str +='</div>';
            str +='<div class="chat-btn chat-btn-open"> <div class="chat-nums" style="display: none;">0</div> </div>';
            return str;
        },
        tempOffline: function(){
            var str = '';
            str +='<div class="chat-offline">';
            str +='<p class="offline-title">Have a question about what uuChat can do for you ?</p>';
            str +='<input type="text" placeholder="Click here and type your Name" class="offline-name" ref="offName"/>';
            str +='<input type="email" placeholder="Click here and type your Email" class="offline-email" required="required" ref="offEmail"/>';
            str +='<textarea placeholder="Let us know and someone will get back to you within 24 hours, if not sooner!(max 140 words)" class="offline-text"></textarea>';
            str +='<button class="offline-send">Send</button></div>';

            return str;
        },
        tempMsg: function(){
            var str = '';
            str += '<div class="chat-msg"></div>';
            return str;
        },
        tempSend: function(){
            var str = '',
                emj = this.tempEmoji();
            str += '<div class="chat-send">';
            str += '<div class="chat-send-text">';
            str += '<pre class="send-pre"></pre>';
            str += '<textarea placeholder="Input text and Press Enter" class="chat-send-area"></textarea>';
            str += '<div class="chat-send-btns">';
            str += emj;
            str += '<label class="chat-send-btn chat-emoji-btn"></label>';
            if(window.FormData){
                str += '<label class="chat-send-btn chat-file-btn" for="upload-file">';
                str += '<input id="upload-file" name="image" type="file" class="chat-upload" accept="image/png, image/jpeg, image/gif,image/jpg" /></label>';
            }
            str += '</div> </div> </div>';
            return str;
        },
        tempEmoji: function(){
            var str = '';
            str += ' <div class="emoji-lists emoji-lists-hidden">';
            for(var i = 0, l = UUCTemo.length; i < l; i++){
                str += '<span class="emoji-item" title="'+UUCTemo[i].name+'">'+UUCTemo[i].text+'</span>';
            }
            str +='</div>';
            return str;
        },
        tempMsgItem: function(role, msg, t){
            var str = '',
                cls = '',
                name = '',
                h = t.getHours(),
                m = t.getMinutes();

            m = m > 9 ? m : '0'+m;

            if(0 === role){
                cls = 'to';
            }else{
                cls = 'from';
                name = UUCT.chat.csName;
            }

            msg = this.msgFilter(msg);
            str += '<div class="chat-item chat-'+cls+'">';
            str += '<p class="chat-role"><i>'+name+'</i>'+h+':'+m+'</p>';
            str += '<div class="chat-text">';
            str += msg;
            str += '</div>';
            str += '<div class="chat-caret"></div>';
            str += '</div>';

            return str;
        },
        msgFilter: function(msg){
            var imgReg = /[a-zA-Z0-9.%=/]{1,}[.](jpg|png|jpeg)/g,
                imgSrc = msg,
                str = '';

            if(imgReg.test(imgSrc)){
                imgSrc = msg.split('|');
                str += '<a href="'+UUCT.domain+'/'+imgSrc[1] +'" target="_blank">';
                str += '<img src="'+UUCT.domain+'/'+imgSrc[0] +'" alt="" /></a>';
            }else{
                str = msg.replace(/#/gi, "<br />").replace(/((https?|ftp|file|http):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*)/g, function(match){
                    return '<a href="'+match+'" target="_blank">'+match+'</a>';
                });
            }
            return str;
        },
        msgTranslate: function(msgObj){
            var chatMsg =  $('.chat-msg')[0];


            if(msgObj.msg === 1){

                var str = '';
                str += '<div class="rate-box">';
                str += '<p class="rate-title">Please rate the dialogue</p>';
                str += '<div class="rete-heart">';
                str += '<span class="rate-span">1</span><span class="rate-span">2</span><span class="rate-span">3</span><span class="rate-span">4</span><span class="rate-span">5</span>';
                str +='</div>';
                str +='<div class="rete-btn">Done</div></div>';
                chatMsg.innerHTML += this.tempMsgItem(msgObj.role, str, new Date());
                var hearts = $('.rete-heart'),
                    rateBtns = $('.rete-btn');

                for(var i = 0, l = hearts.length; i < l; i++){
                    (function(i){
                        var rateLevel = 5,
                            rate = hearts[i].children;
                        addEvent(hearts[i], 'mouseover', function(e){
                            if(e.target.tagName.toLowerCase() === 'span'){
                                var rateNum = e.target.innerHTML;
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
                        addEvent(rateBtns[i], 'click', function() {
                            UUCT.socket.emit('c.rate', UUCT.chat.cid, rateLevel, function (success) {
                                if (success) {
                                    chatMsg.innerHTML += UUCT.tempMsgItem(1, 'Thank you for your rate!! Goodbye!', new Date());
                                    chatMsg.scrollTop = chatMsg.scrollHeight;
                                    UUCT.socket.close();
                                    $('.chat-send')[0].parentNode.removeChild($('.chat-send')[0]);
                                    $('.chat-msg')[0].style.height = '560px';
                                    $('.chat-msg')[0].innerHTML = '<div class="reconnect-btn"><img width="32" src="'+UUCT.domain+'/static/images/write.png">New Conversation</div>';
                                    addEvent($('.reconnect-btn')[0], 'click', function(){
                                        $('.chat-msg')[0].parentNode.removeChild($('.chat-msg')[0]);
                                        UUCT.createSocket();
                                    });
                                }
                            });
                        });
                    })(i)
                }

            }else{
                chatMsg && (chatMsg.innerHTML += this.tempMsgItem(msgObj.role, msgObj.msg, new Date()));
            }

            chatMsg && (chatMsg.scrollTop = chatMsg.scrollHeight);

        },
        initCustomer: function(data){
            var msg = UUCT.tempMsg(),
                send = UUCT.tempSend(),
                msgList = '',
                src = (data.photo !== '') ? data.photo : 'static/images/ua.png';

            UUCT.chat.cid = data.cid;
            UUCT.chat.csid = data.csid;
            UUCT.chat.csName = data.name;


            $('.chat-name')[0].innerHTML = data.name;
            $('.chat-body')[0].innerHTML += msg;
            $('.chat-body')[0].innerHTML += send;
            $('.avatar-img')[0].setAttribute("src", UUCT.domain+'/'+src);

            if(data.msg.length > 0){
                for(var i = 0, l = data.msg.length; i < l; i++){
                    if(data.msg[i].type !== 3 && data.msg[i].type !== 4){
                        msgList += UUCT.tempMsgItem(data.msg[i].type, data.msg[i].msg, new Date(data.msg[i].createdAt));
                    }
                }
                $('.chat-msg')[0].innerHTML += msgList;
            }

        },
        socketConnect: function(){
            /***
             *
             * customer select
             *
             */
            this.emit('c.select', UUCT.socketCsSelect);

            /***
             *  On cs.message
             *
             */
            this.on('cs.message', UUCT.socketCsMessage);
            /***
             *
             *  On cs.status
             */
            this.on('cs.status', UUCT.socketCsStatus);
            /***
             *  On cs disconnect
             *
             */
            this.on('cs.disconnect', UUCT.socketCsDisconnect);
            /***
             * c.queue.update'
             */
            this.on('c.queue.update', UUCT.socketQueueUpdate);
            /***
             * c.queue.shift
             */
            this.on('c.queue.shift', UUCT.socketQueueShift);
            /***
             *
             */
            this.on('c.dispatch', function(csid, name, avatar){
                UUCT.chat.csid = csid;
                UUCT.chat.name = name;
                $('.chat-name')[0].innerHTML = name;
            });
            /***
             * cs.rate
             */
            this.on('cs.action.rate', function(){
                UUCT.msgTranslate({
                    role: 1,
                    msg: 1
                });
            });

        },
        socketConnectError: function(){
            this.close();
        },
        socketDisconnect: function(){
            UUCT.msgTranslate({
                role: 1,
                msg: 'The server has been outline!You can try it by refesh the browser at latter'
            });
            this.close();
        },
        socketCsSelect: function(type, data){
            if(1 === type){
                UUCT.initCustomer(data);
                addEvent($('.chat-emoji-btn')[0], 'click', function(e){
                    toggleClass($('.emoji-lists')[0], 'emoji-lists-hidden');
                });
                addEvent($('.emoji-lists')[0], 'click', function(e){
                    var e = e || window.event,
                        tg = e.target;

                    if(tg.tagName.toLowerCase() === 'span'){
                        $('.chat-send-area')[0].value += ' '+tg.innerHTML+' ';
                        $('.chat-send-area')[0].focus();
                    }
                });


                $('.chat-upload')[0] && addEvent($('.chat-upload')[0], 'change', function(e){

                   var data = new FormData();
                    data.append('image', e.target.files[0]);

                   UUCT.ajax({
                       url: UUCT.domain+'/messages/customer/'+UUCT.chat.cid+'/cs/'+UUCT.chat.csid+'/image',
                       type:'POST',
                       fileType: true,
                       data: data,
                       success: function(data){
                           var d = JSON.parse(data);
                           if(d.code === 200){
                               UUCT.socketSendMessage(d.msg.resized+'|'+d.msg.original);
                           }
                       }
                   });

                });

                addEvent($('.chat-send-area')[0], 'keypress', function(e){
                    var e = e || w.event,
                        val = this.value;

                    val = val.replace(/>/g, "&gt;").replace(/^\s$/g, "").replace(/</g, "&lt;").replace(/ /gi, '&nbsp;').replace(/\n/gi, '#');

                    if(val !== ''){
                        $('.send-pre')[0].innerHTML = val;
                    }
                    if(13 === e.keyCode){
                        if(val !== '') {
                            UUCT.socketSendMessage(val);
                            $('.send-pre')[0].innerHTML = '';
                            this.value = '';
                            this.focus();
                            this.setAttribute("placeholder", "");
                            addClass($('.emoji-lists')[0], 'emoji-lists-hidden');
                        }
                        e.returnValue = false;
                        e.preventDefault();
                    }

                });

                localStorage.setItem('csid', data.csid);
            }else if(2 === type){

                var queue = '<div class="chat-offline"><div class="line-up">Current queue number <i class="line-num">';
                queue += data.num;
                queue += '</i></div></div>';
                $('.chat-body')[0].innerHTML += queue;

            }else if(3 === type){
                var offline = UUCT.tempOffline();
                $('.chat-body')[0].innerHTML += offline;

                addEvent($('.offline-send')[0], 'click', function(){

                    var name = $('.offline-name')[0].value,
                        email = $('.offline-email')[0].value,
                        content = $('.offline-text')[0].value;

                    UUCT.ajax({
                        url:UUCT.domain+'/offlines',
                        type:'GET',
                        jsonp: 'jsonpCallback',
                        data: {
                            "name": name,
                            "email": email,
                            "content": content
                        },
                        success: function(d){
                            if(d.code === 200){
                                $('.chat-offline')[0].innerHTML = '<div className="offline-text-success"> Thank you for your message!We\'ll get back to you as soon as possible！</div>';
                            }
                        }
                    });
                });
            }
        },
        socketSendMessage: function(msg){
            UUCT.socket.emit('c.message', UUCT.chat.cid, msg, function(isTrue){
                if(isTrue){
                    UUCT.msgTranslate({
                        role: 0,
                        msg: msg
                    });
                }else{
                    UUCT.msgTranslate({
                        role: 1,
                        msg: 'The customerSuccess is offline'
                    });
                }
            });
        },
        socketCsMessage: function(cid, msg){
            var chatNums = $('.chat-nums')[0];
            UUCT.msgTranslate({
                role: 1,
                msg: msg
            });

            if(!hasClass($('.chat-btn')[0], 'chat-btn-close')){
                var n = chatNums.innerHTML;
                n++;
                chatNums.innerHTML = n;
                chatNums.style.display = 'block';
            }
        },
        socketCsStatus: function(status){
            if(1 === status){
                $('.chat-name')[0].innerHTML = '<span class="status-title">Entering</span>';
            }else if(2 === status){
                $('.chat-name')[0].innerHTML = UUCT.chat.csName;
            }
        },
        socketCsDisconnect: function(){
            UUCT.msgTranslate({
                role: 1,
                msg: 'The customerSuccess is offline!'
            });
        },
        socketQueueUpdate: function(pos){
            if($('.line-num')[0]){
                $('.line-num')[0].innerHTML = pos;
            }
        },
        socketQueueShift: function(d){
            if(d){
                var offline = $('.chat-offline')[0];
                offline.parentNode.removeChild($('.chat-offline')[0]);
                UUCT.initCustomer(d);
            }
        },
        socketReconnect: function(){
            UUCT.msgTranslate({
                role: 1,
                msg: 'Reconnect to server success!!!'
            });
        },
        socketError: function(){
            UUCT.msgTranslate({
                role: 1,
                msg: 'Its error to connect to the server!!! '
            });
        }
    };


    w.UUCT = UUCT;

    UUCT.init();

})(window, document);
var UUCTemo=[{name:"grinning-smile-eyes",text:"\ud83d\ude01",code:"U+1F601"},{name:"tears-of-joy",text:"\ud83d\ude02",code:"U+1F602"},{name:"smiling-open-mouth",text:"\ud83d\ude03",code:"U+1F603"},{name:"smiling-mouth-eyes",text:"\ud83d\ude04",code:"U+1F604"},{name:"smiling-cold-sweat",text:"\ud83d\ude05",code:"U+1F605"},{name:"smiling-closed-eyes",text:"\ud83d\ude06",code:"U+1F606"},{name:"winking",text:"\ud83d\ude09",code:"U+1F609"},{name:"smiling-eyes",text:"\ud83d\ude0a",code:"U+1F60A"},{name:"delicious-food",
    text:"\ud83d\ude0b",code:"U+1F60B"},{name:"relieved",text:"\ud83d\ude0c",code:"U+1F60C"},{name:"heart-shaped",text:"\ud83d\ude0d",code:"U+1F60D"},{name:"smirking",text:"\ud83d\ude0f",code:"U+1F60F"},{name:"unamused",text:"\ud83d\ude12",code:"U+1F612"},{name:"cold-sweat",text:"\ud83d\ude13",code:"U+1F613"},{name:"pensive",text:"\ud83d\ude14",code:"U+1F614"},{name:"confounded",text:"\ud83d\ude16",code:"U+1F616"},{name:"throwing-kiss",text:"\ud83d\ude18",code:"U+1F618"},{name:"kissing-closed-eyes",text:"\ud83d\ude1a",
    code:"U+1F61A"},{name:"stuck-out-tongue",text:"\ud83d\ude1c",code:"U+1F61C"},{name:"tightly-closed-eyes",text:"\ud83d\ude1d",code:""},{name:"disappointed",text:"\ud83d\ude1e",code:"U+1F61E"},{name:"angry",text:"\ud83d\ude20",code:"U+1F620"},{name:"pouting",text:"\ud83d\ude21",code:"U+1F621"},{name:"crying",text:"\ud83d\ude22",code:"U+1F622"},{name:"persevering",text:"\ud83d\ude23",code:"U+1F623"},{name:"look-of-triumph",text:"\ud83d\ude24",code:"U+1F624"},{name:"disappointed-relieved",text:"\ud83d\ude25",
    code:"U+1F625"},{name:"fearful",text:"\ud83d\ude28",code:"U+1F628"},{name:"weary",text:"\ud83d\ude29",code:"U+1F629"},{name:"sleepy",text:"\ud83d\ude2a",code:"U+1F62A"},{name:"tired",text:"\ud83d\ude2b",code:"U+1F62B"},{name:"loudly-crying ",text:"\ud83d\ude2d",code:"U+1F62D"},{name:"mouth-cold-sweat",text:"\ud83d\ude30",code:"U+1F630"},{name:"screaming-in-fear",text:"\ud83d\ude31",code:"U+1F631"},{name:"astonished",text:"\ud83d\ude32",code:"U+1F632"},{name:"flushed",text:"\ud83d\ude33",code:"U+1F633"},
    {name:"dizzy",text:"\ud83d\ude35",code:"U+1F635"},{name:"medical-mask",text:"\ud83d\ude37",code:"U+1F637"},{name:"hands-in-celebration",text:"\ud83d\ude4c",code:"U+1F64C"},{name:"folded-hands",text:"\ud83d\ude4f",code:"U+1F64F"},{name:"raised-first",text:"\u270a",code:"U+270A"},{name:"raised-hand",text:"\u270b",code:"U+270B"},{name:"victory-hand",text:"\u270c",code:"U+270C"},{name:"ok-hand-sign",text:"\ud83d\udc4c",code:"U+1F44C"},{name:"waving-hand-sign",text:"\ud83d\udc4b",code:"U+1F44B"},{name:"thumbs-up-sign",
        text:"\ud83d\udc4d",code:"U+1F44D"},{name:"clapping-hands-sign",text:"\ud83d\udc4f",code:"U+1F44F"},{name:"kiss-mark",text:"\ud83d\udc8b",code:"U+1F48B"}];

