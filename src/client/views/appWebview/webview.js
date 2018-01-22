var EMOJI=[{text:"\ud83d\ude01"},{text:"\ud83d\ude02"},{text:"\ud83d\ude03"},{text:"\ud83d\ude04"},{text:"\ud83d\ude05"},{text:"\ud83d\ude06"},{text:"\ud83d\ude09"},{text:"\ud83d\ude0a"},
    {text:"\ud83d\ude0b"},{text:"\ud83d\ude0c"},{text:"\ud83d\ude0d"},{text:"\ud83d\ude0f"},{text:"\ud83d\ude12"},{text:"\ud83d\ude13"},{text:"\ud83d\ude14"},{text:"\ud83d\ude16"},{text:"\ud83d\ude18"},
    {text:"\ud83d\ude1a"},{text:"\ud83d\ude1c"},{text:"\ud83d\ude1d"},{text:"\ud83d\ude1e"},{text:"\ud83d\ude20"},{text:"\ud83d\ude21"},{text:"\ud83d\ude22"},{text:"\ud83d\ude23"},{text:"\ud83d\ude24"},
    {text:"\ud83d\ude25"},{text:"\ud83d\ude28"},{text:"\ud83d\ude29"},{text:"\ud83d\ude2a"},{text:"\ud83d\ude2b"},{text:"\ud83d\ude2d"},{text:"\ud83d\ude30"},{text:"\ud83d\ude31"},{text:"\ud83d\ude32"},
    {text:"\ud83d\ude33"},{text:"\ud83d\ude35"},{text:"\ud83d\ude37"},{text:"\ud83d\ude4c"},{text:"\ud83d\ude4f"},{text:"\u270a\ufe0f"},{text:"\u270b\ufe0f"},{text:"\u270c\ufe0f"},{text:"\ud83d\udc4c"},
    {text:"\ud83d\udc4b"},{text:"\ud83d\udc4d"},{text:"\ud83d\udc4f"},{text:"\ud83d\udc8b"}];

!function(t){"use strict";var e=t.HTMLCanvasElement&&t.HTMLCanvasElement.prototype,o=t.Blob&&function(){try{return Boolean(new Blob)}catch(t){return!1}}(),n=o&&t.Uint8Array&&function(){try{return 100===new Blob([new Uint8Array(100)]).size}catch(t){return!1}}(),r=t.BlobBuilder||t.WebKitBlobBuilder||t.MozBlobBuilder||t.MSBlobBuilder,a=/^data:((.*?)(;charset=.*?)?)(;base64)?,/,i=(o||r)&&t.atob&&t.ArrayBuffer&&t.Uint8Array&&function(t){var e,i,l,u,c,f,b,d,B;if(!(e=t.match(a)))throw new Error("invalid data URI");for(i=e[2]?e[1]:"text/plain"+(e[3]||";charset=US-ASCII"),l=!!e[4],u=t.slice(e[0].length),c=l?atob(u):decodeURIComponent(u),f=new ArrayBuffer(c.length),b=new Uint8Array(f),d=0;d<c.length;d+=1)b[d]=c.charCodeAt(d);return o?new Blob([n?b:f],{type:i}):((B=new r).append(f),B.getBlob(i))};t.HTMLCanvasElement&&!e.toBlob&&(e.mozGetAsFile?e.toBlob=function(t,o,n){var r=this;setTimeout(function(){t(n&&e.toDataURL&&i?i(r.toDataURL(o,n)):r.mozGetAsFile("blob",o))})}:e.toDataURL&&i&&(e.toBlob=function(t,e,o){var n=this;setTimeout(function(){t(i(n.toDataURL(e,o)))})})),"function"==typeof define&&define.amd?define(function(){return i}):"object"==typeof module&&module.exports?module.exports=i:t.dataURLtoBlob=i}(window);

;(function (win, doc) {

    var LIB = {
        $: function (el) {
            if (arguments.length > 1 && arguments[1]) {
                return doc.querySelectorAll(el);
            }
            return doc.querySelector(el);
        },
        addEvent: function (el, event, cb) {
            el && el.addEventListener(event, cb, false);
        },
        hasClass: function (el, name) {
              return el.classList.contains(name);
        },
        addClass: function (el, name) {
            el.classList.add(name);
        },
        removeClass: function (el, name) {
            el.classList.remove(name);
        },
        toggleClass: function (el, name) {
            el.classList.toggle(name);
        },
        imageCompress: function (imageObj, callback) {
            var reader = new FileReader();
            var img = new Image();
            var canvas = doc.createElement('canvas');
            var context = canvas.getContext('2d');
            var file = imageObj;

            reader.onload = function (e) {
                img.src = e.target.result;
            };

            img.onload = function () {
                var originWidth = this.width,
                    originHeight = this.height,
                    maxWidth = 640,
                    maxHeight = 640,
                    targetWidth = originWidth,
                    targetHeight = originHeight;

                if (originWidth > maxWidth || originHeight > maxHeight) {
                    if (originWidth / originHeight > maxWidth / maxHeight) {
                        targetWidth = maxWidth;
                        targetHeight = Math.round(maxWidth * (originHeight / originWidth));
                    } else {
                        targetHeight = maxHeight;
                        targetWidth = Math.round(maxHeight * (originWidth / originHeight));
                    }
                }

                canvas.width = targetWidth;
                canvas.height = targetHeight;
                context.clearRect(0, 0, targetWidth, targetHeight);
                context.drawImage(img, 0, 0, targetWidth, targetHeight);
                callback && callback(canvas.toDataURL('image/jpeg'), file.name);
            };

            if (file.type.indexOf('image') > -1) {
                reader.readAsDataURL(file);
            }
        },
        timeFormat: function (t) {
            var d = t ? new Date(t) : new Date();
            var d2 = d.getDate();
            var m = d.getMonth() + 1;
            var h = d.getHours();
            var f = d.getMinutes();

            d2 = d2 > 9 ? d2 : '0'+d2;
            m = m > 9 ? m : '0'+m;
            h = h > 9 ? h : '0'+h;
            f = f > 9 ? f : '0'+f;

            return d.getFullYear() +'-' + m + '-' + d2 + ' ' +h + ' : ' +f;
        },
        insertToCursorPosition: function(lastEditRange, s) {

            var selection = getSelection();

            if (lastEditRange) {
                selection.removeAllRanges();
                selection.addRange(lastEditRange);
            }

            if (selection && selection.rangeCount === 1 && selection.isCollapsed) {
                var range = selection.getRangeAt(0);
                var txt = document.createTextNode(s);

                range.insertNode(txt);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                UCM.lastEditRange = range;
            }

        },
        ajax: function (options) {

            var defaultOptions = {
                type: 'GET',
                url: '',
                data: '',
                beforeSend: null,
                success: function (d) {},
                error: function (e) {},
                progress: function (f) {},
                error: function (err) {}
            }, xhr;

            for (var key in options) {
                defaultOptions[key] = options[key];
            }

            xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {

                    var response = '';
                    var type = xhr.getResponseHeader('Content-type');

                    if (type.indexOf('xml') !== -1 && xhr.responseXML) {
                        response = xhr.responseXML;
                    } else if(type === 'application/json') {
                        response = JSON.parse(xhr.responseText);
                    } else {
                        response = xhr.responseText;
                    }

                    defaultOptions.success(response);

                } else if(xhr.readyState == 4 && xhr.status !== 200){
                    defaultOptions.error(xhr.status);
                }
            };
            xhr.upload.onprogress = defaultOptions.progress;
            xhr.onerror = defaultOptions.error;

            if (defaultOptions.type == 'GET') {
                xhr.open(defaultOptions.type, defaultOptions.url + '?' + defaultOptions.data, true);
                defaultOptions.beforeSend && defaultOptions.beforeSend(xhr);
                xhr.send(null);
            } else {
                xhr.open(defaultOptions.type, defaultOptions.url, true);
                defaultOptions.beforeSend && defaultOptions.beforeSend(xhr);
                xhr.send(defaultOptions.data);
            }

        }
    };


    var UCM = {
        socket: null,
        cid: '',
        csid: '',
        csName: '',
        csPhoto: 'static/images/contact.png',
        userId: '',
        domain: 'https://uuchat.io',
        maxTimes: 2700*1000,
        startTime: 0,
        clockTimer: null,
        isConnectErr: false,
        isCustomerSuccessOnline: false,
        lastEditRange: null,
        hasChatHistory: true,
        init: function () {
            this.getUserType();
            this.control();
            this.emojiCreate();
            this.socketInit();
        },
        getUserType: function () {
            var url = window.location.href;
            url = url.indexOf('?') > -1 ? url.split('?') : [];

            if (url.length > 0) {
                url = url[1].split('=');
                this.userId = url[1];
            }
        },
        control: function () {
            this.enter();
            this.chat();
            this.emojiPicker();
        },
        enter: function () {
            var edit = LIB.$('.input-text');
            var emojiBtn = LIB.$('.emoji');

            LIB.addEvent(edit, 'focus', function (e) {
                LIB.removeClass(this, 'activation');
                var target = this;
                setTimeout(function(){
                    target.scrollIntoViewIfNeeded();
                },400);
            });
            LIB.addEvent(edit, 'click', function (e) {
                if (window.getSelection) {
                    var sel = window.getSelection();
                    UCM.lastEditRange = sel.getRangeAt(0);
                }
            });
            LIB.addEvent(edit, 'DOMSubtreeModified', function () {
                var val = edit.innerHTML.replace(/<\/?[^>]*>/g, '').replace(/&nbsp;/ig, '').replace(/ /ig, '');
                if (val.length > 0) {
                    UCM.chatStatus(true);
                }
            });
            LIB.addEvent(edit, 'blur', function (e) {
                e.target.innerHTML && LIB.addClass(this, 'activation');
            });
            LIB.addEvent(edit, 'keydown', function (e) {

                if (e.keyCode === 13) {
                    e.returnValue = false;
                    e.preventDefault();
                    return false;
                }

                setTimeout(function () {
                    var message = e.target.innerHTML.replace(/<\/?[^>]*>/g, '').replace(/&nbsp;/ig, '').replace(/ /ig, '');
                    if (message.length > 0) {
                        UCM.chatStatus(true);
                    } else {
                        e.target.innerHTML = '';
                        UCM.chatStatus(false);
                    }
                }, 0);

            });

            LIB.addEvent(emojiBtn, 'click', function (e) {
                LIB.toggleClass(LIB.$('.emoji-picker'), 'show');
                UCM.resizeBodyHeight();
            });

            LIB.addEvent(LIB.$('.body'), 'click', function (e) {

                var target = e.target;
                var classes = target.className;

                if (classes === 'email-submit') {
                    emailSend();
                    return false;
                }

                if (classes === 'email-input') {
                    emailFocus(target);
                    return false;
                }

                if (classes.indexOf('rate-item') > -1) {
                    rateSelect(target);
                    return false;
                }

                if (classes === 'rate-submit') {
                    rateSumbit(target);
                    return false;
                }

                if (classes === 'reconnect-btn') {
                    LIB.$('.body').innerHTML = '<div class="reconnect-mask"><i></i></div>';
                    UCM.socketInit();
                }

            });

            function emailSend() {
                var email = LIB.$('.email-input').value;
                var reg = /[0-9a-z_A-Z.\\-]+@(([0-9a-zA-Z]+)[.]){1,2}[a-z]{2,3}/g;

                if (email === '' || !reg.test(email)) {
                    LIB.addClass(LIB.$('.offline-email'), 'error');
                    return false;
                }

                LIB.ajax({
                    url: UCM.domain+'/customers/cid/'+UCM.cid,
                    type:'PATCH',
                    data: "email="+email,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    },
                    success: function (d) {
                        d = JSON.parse(d);
                        if (d.code === 200) {
                            localStorage.setItem('offlineEmail', email);
                            LIB.$('.offline-email').innerHTML = "<h4>You'll be notified here and by email</h4><h5>"+email+"</h5>";
                        }
                    }
                });
            }

            function emailFocus(obj){
                LIB.removeClass(LIB.$('.offline-email'), 'error');
                setTimeout(function () {
                    if (LIB.$('.body').scrollHeight < LIB.$('.body').offsetHeight + obj.offsetTop) {
                        LIB.$('.body').scrollTop = LIB.$('.body').scrollHeight;
                    }
                }, 500);
            }
            function rateSelect(target) {
                var hasRate = target.parentNode.parentNode.getAttribute('hasRate');
                var rates = target.parentNode.querySelectorAll('.rate-item');
                var rateNum = target.innerHTML;

                if (hasRate) {
                    return false;
                }

                for (var i = 0; i < 5; i++) {
                    if (i < rateNum) {
                        rates[i].className = 'rate-item on';
                    } else {
                        rates[i].className = 'rate-item';
                    }
                }
            }

            function rateSumbit(target) {
                var rateStars = target.parentNode.parentNode.querySelectorAll('.on').length;
                UCM.socket.emit('c.rate', UCM.cid, rateStars, function (success) {
                    UCM.isCustomerSuccessOnline = false;
                    if (success) {
                        target.parentNode.parentNode.setAttribute('hasRate', 1);
                        UCM.addNewMessage({
                            type: 'socket',
                            text: 'Thank you for your rate!! Goodbye!'
                        });
                        //this.close();
                        //UCM.socket = null;
                    }
                });
            }

        },
        chat: function () {
            LIB.addEvent(LIB.$('#praise'), 'click', function (e) {

                if (LIB.hasClass(this, 'send')) {
                    UCM.sendMessage({action: 'message'});
                } else {
                    UCM.sendMessage({action: 'praise'});
                }
            });
            LIB.addEvent(LIB.$('#photo'), 'change', function (e) {
                var file = e.target.files[0];
                this.value = '';
                UCM.imagesUploadFilter(file);
            });
            LIB.addEvent(LIB.$('#camera'), 'change', function (e) {
                var file = e.target.files[0];
                this.value = '';
                UCM.imagesUploadFilter(file);
            });
        },
        imagesUploadFilter: function (file) {

            UCM.addNewMessage({
                type: 'system',
                text: '<span class="uploading">uploading....</span>'
            });
            if (!/(.jpg|.gif|.png)$/g.test(file.name)) {
                LIB.$('.uploading').innerHTML = 'Image format must be jpg 、png、gif';
                LIB.$('.uploading').className = 'upload-failed';
                return false;
            }

            LIB.imageCompress(file, UCM.photoUpload);

            this.value = '';
        },
        chatClock: function () {
            clearInterval(this.clockTimer);
            this.clockTimer = setInterval(function () {

                var nowTime = (new Date()).getTime();

                if (nowTime - UCM.startTime > UCM.maxTimes) {
                    clearInterval(UCM.clockTimer);
                    UCM.isCustomerSuccessOnline = false;
                }

            }, 7000);
        },
        sendMessage: function (type) {

            var msg = '';
            var time = (new Date()).getTime();

            if (type.action === 'message') {
                msg = type.text || LIB.$('.input-text').innerHTML;
                LIB.$('.input-text').innerHTML = '';
                this.chatStatus(false);
            } else if(type.action === 'praise') {
                msg = '👍 ';
            } else if(type.action === 'system') {
                msg = type.text;
            }

            (type.action !== 'system') && UCM.addNewMessage({
                type: 'send',
                text: msg,
                time: time
            });

            if (!UCM.isCustomerSuccessOnline) {
                this.socket.emit('c.offlineMsg', this.cid, msg, function (success) {
                     LIB.addClass(LIB.$('.msg-'+time), 'success');
                     if (!LIB.$('.offline-email')) {
                         emailTemp();
                     }
                });
            } else {
                this.socket.emit('c.message', this.cid, msg, function (success) {
                    if (success) {
                        LIB.addClass(LIB.$('.msg-'+time), 'success');
                    } else {
                        LIB.addClass(LIB.$('.msg-'+time), 'failed');
                    }
                });
            }

            if (LIB.hasClass(LIB.$('.emoji-picker'), 'show')) {
                LIB.removeClass(LIB.$('.emoji-picker'), 'show');
                this.resizeBodyHeight();
            }
            LIB.removeClass(LIB.$('.input-text'), 'activation');

            function emailTemp() {
                var email = localStorage.getItem('offlineEmail');
                var str = '';

                if (email) {
                    str = '<div class="offline-email"><h4>You\'ll be notified here and by email</h4><h5><a href="mailto:'+email+'">'+email+'</a></h5></div>';
                } else {
                    str = '<div class="offline-email"><h2>Get notify by email</h2><div class="email-wrap"><input class="email-input" placeholder="email@domain.com" /><span class="email-submit"></span></div><p>That email doesn\'t look quite right</p></div>';
                }

                UCM.addNewMessage({
                    type: 'accept',
                    text: 'save typically replies in a few hours'
                });
                UCM.addNewMessage({
                    type: 'accept',
                    text: 'Give them a way to reach you: '
                });
                UCM.addNewMessage({
                    type: 'accept',
                    text: str
                });
            }
        },
        filterMessage: function (text) {

            var imgReg = /^content\/upload\//g;
            var linkReg = /((https?|ftp|file|http):\/\/[-a-zA-Z0-9+&@#\/%?=~_|!:,.;]*)/g;
            var newText = '';

            if (imgReg.test(text)) {
                text = text.split('|');
                newText = '<a href="'+UCM.domain+'/'+text[1]+'"><img src="'+UCM.domain+'/'+text[0] +'" width="'+text[2]+'" height="'+text[3]+'" alt="" /></a>';
            } else {
                newText = text.replace(/&nbsp;/g, ' ').replace(/#/gi, "<br />").replace(linkReg, function(match){
                    return '<a href="'+match+'" target="_blank">'+match+'</a>';
                });
            }

            return newText;
        },
        addNewMessage: function (msg) {
            var str = '';
            var body = LIB.$('.body');

            msg.text = this.filterMessage(msg.text);

            switch (msg.type) {
                case 'send':
                    str = this.sendMessageItem(msg.time, msg.text);
                    break;
                case 'accept':
                    str = this.acceptMessageItem(msg.text);
                    break;
                case 'system':
                    str = this.systemMessageItem(msg.text);
                    break;
                case 'socket':
                    clearInterval(UCM.clockTimer);

                    if (msg.btn) {
                        msg.text += '<span class="reconnect-btn">Reconnect</span>';
                    }

                    if (LIB.$('.system-socket')) {
                        LIB.$('.system-socket').innerHTML = msg.text;
                    } else {
                        str = this.socketMessageItem(msg.text);
                    }
                    break;
                default:
                    break;
            }

            UCM.startTime = (new Date()).getTime();

            body.innerHTML += str;
            body.scrollTop = body.scrollHeight;
        },
        sendMessageItem: function (time, text) {
            return '<div class="message client msg-'+time+'"><div class="content">'+text+'</div><span class="msg-status"></span></div>';
        },
        acceptMessageItem: function (text) {
            var str = '<div class="message server"><div class="avatar">';
            str += '<img width="100%" src="'+this.csPhoto+'" alt="">';
            str += '</div><div class="content">'+text+'</div></div>';
            return str;
        },
        systemMessageItem: function (text) {
            var str = '<div class="message notice">';
            str += '<p>'+LIB.timeFormat()+'</p>';
            str += '<p class="system">'+text+'</p>';
            str += '</div>';
            return str;
        },
        socketMessageItem: function (text) {
            var str = '<div class="message notice">';
            str += '<p>'+LIB.timeFormat()+'</p>';
            str += '<p class="system system-socket">'+text+'</p>';
            str += '</div>';
            return str;
        },
        createRate: function () {
            var str = '<div class="rate">';
            str += '<div class="rate-title">Please rate the dialogue</div>';
            str += '<div class="rate-body">';
            str += '<span class="rate-item">1</span><span class="rate-item">2</span><span class="rate-item">3</span><span class="rate-item">4</span><span class="rate-item">5</span>';
            str += '</div>';
            str += '<div class="rate-footer">';
            str += '<div class="rate-submit">Submit</div>';
            str += '</div></div>';
            return str;
        },
        chatStatus: function (isSend) {
            if (isSend) {
                LIB.addClass(LIB.$('#praise'), 'send');
            } else {
                LIB.removeClass(praise, 'send');
            }
        },
        photoUpload: function (imgFile, name) {

            var data = new FormData();
            var imgUploadUrl = UCM.domain+'/messages/customer/'+UCM.cid+'/cs/'+UCM.csid+'/image';

            data.append('image', dataURLtoBlob(imgFile), name);

            if (!UCM.csid) {
                imgUploadUrl = UCM.domain+'/messages/customer/'+UCM.cid+'/image';
            }

            LIB.ajax({
                type: 'POST',
                url: imgUploadUrl,
                data: data,
                success: function (d) {

                    d = JSON.parse(d);

                    if (d.code === 200) {
                        uploadStatus('done');

                        UCM.sendMessage({
                            action: 'message',
                            text: d.msg.resized+'|'+d.msg.original+'|'+d.msg.w+'|'+d.msg.h
                        });
                    } else {
                        uploadStatus('failed');
                    }
                },
                error: function (err) {
                    uploadStatus('failed');
                }
            });

            function uploadStatus(text) {
                if (LIB.$('.uploading')) {
                    LIB.$('.uploading').innerHTML = 'upload '+text;
                    LIB.$('.uploading').className = 'upload-'+text;
                }
            }

        },
        emojiCreate: function () {
            var emojis = '';
            for (var i = 0, l = EMOJI.length; i < l; i++) {
                emojis += '<span>'+EMOJI[i].text+'</span>';
            }
            LIB.$('.emoji-picker').innerHTML = emojis;
        },
        emojiPicker: function () {
            LIB.addEvent(LIB.$('.emoji-picker'), 'click', function (e) {
                 if (e.target.tagName.toUpperCase() === 'SPAN') {
                     LIB.$('.input-text').focus();
                     LIB.insertToCursorPosition(UCM.lastEditRange, e.target.innerHTML);
                     LIB.addClass(LIB.$('.input-text'), 'activation');
                     UCM.chatStatus(true);
                 }
            });
        },
        resizeBodyHeight: function () {
            var body = LIB.$('.body');
            var windowHeight = window.screen.height;
            var footerHeight = LIB.$('.footer').offsetHeight;

            body.style.height = windowHeight  - footerHeight + 'px';
            body.scrollTop = body.scrollHeight;
        },
        initData: function (data) {
            this.cid  = data.cid;
            this.csid = data.csid || '';
            this.csName = data.name;

            data.photo && (this.csPhoto = UCM.domain + '/'+ data.photo);

            if (data.msg.length > 0 && data.csid) {
                this.initHistoryChat(data.msg);
            }

            if (data.msg.length === 0 || data.msg.length < 10) {
                this.hasChatHistory = false;
            }
            LIB.$('.body').scrollTop = LIB.$('.body').scrollHeight;
        },
        initHistoryChat: function (msgArr) {
            var str = '';
            var c = '';
            var status = '';

            for (var i = 0, l = msgArr.length; i < l; i++) {
                if (msgArr[i].type === 3 || msgArr[i].type === 2 || msgArr[i].type === 4 || (msgArr[i].msg && msgArr[i].msg.indexOf('@User ID@') > -1)) {
                    continue;
                }

                if (i === 0) {
                    str += '<div class="message notice">';
                    str += '<p>'+LIB.timeFormat(msgArr[i].createdAt)+'</p>';
                    str += '</div>';
                }

                if (msgArr[i].type === 1) {
                    c = 'server';
                } else if(msgArr[i].type === 0) {
                    c = 'client success';
                    status = '<span class="msg-status"></span>';
                }

                str += '<div class="message '+c+'">';

                if (c === 'server') {
                    str += '<div class="avatar">';
                    str += '<img width="100%" src="'+this.csPhoto+'" alt="">';
                    str += '</div>';
                }
                str += '<div class="content">';
                str += this.filterMessage(msgArr[i].msg);
                str += '</div>';
                str +=  status;
                str += '</div>';
            }

            if (arguments[1]) {
                str = str + LIB.$('.body').innerHTML;
                LIB.$('.body').innerHTML =  str;
            } else {
                LIB.$('.body').innerHTML = str;
            }

        },
        loadChatHistory: function () {

            var touchPos = {
                sx: 0,
                sy: 0,
                ex: 0,
                ey: 0
            }, isLoadingChatHistory = false, pageNum = 1;


            LIB.addEvent(LIB.$('.body'), 'touchstart', function (e) {
               if (e.touches[0]) {
                   touchPos.sx = e.touches[0].clientX;
                   touchPos.sy = e.touches[0].clientY;
               }

            });

            LIB.addEvent(LIB.$('.body'), 'touchmove', function (e) {
                if (e.touches[0]) {
                    touchPos.ex = e.touches[0].clientX;
                    touchPos.ey = e.touches[0].clientY;
                }

                if (touchPos.ey - touchPos.sy > 30 && !isLoadingChatHistory && UCM.hasChatHistory) {
                    isLoadingChatHistory = true;
                    LIB.addClass(LIB.$('.body'), 'loading');
                    loadChatHistory();
                }
            });


            function loadChatHistory() {

               LIB.ajax({
                    type: 'GET',
                    url: UCM.domain+'/messages/customer/'+UCM.cid+'/cs/'+UCM.csid,
                    data: 'pageNum='+pageNum+'&pageSize=10',
                    success: function (d) {

                        var d = JSON.parse(d);

                        if (d.code === 200) {
                            pageNum++;
                            if (d.msg.length === 0 || d.msg.length < 10) {
                                UCM.hasChatHistory = false;
                            }
                            UCM.initHistoryChat(d.msg, 'loadMore');
                        }
                        isLoadingChatHistory = false;
                        LIB.removeClass(LIB.$('.body'), 'loading');
                    },
                    error: function (error) {
                        isLoadingChatHistory = false;
                        LIB.removeClass(LIB.$('.body'), 'loading');
                    }
                });

            }
        },
        socketInit: function () {
            this.socket = io(UCM.domain+'/c', {
                forceNew: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
                timeout: 10000
            });
            this.socket.on('connect', this.socketConnect);
            this.socket.on('connect_error', this.socketConnectError);
            this.socket.on('disconnect', this.socketDisconnect);
            this.socket.on('reconnect', this.socketReconnect);
            this.socket.on('reconnect_error', this.socketReconnectError);
            this.socket.on('error', this.socketError);
            this.socket.on('cs.message', this.socketCsMessage);
            this.socket.on('cs.disconnect', this.socketCsDisconnect);
            this.socket.on('c.queue.update', this.socketQueueUpdate);
            this.socket.on('c.queue.shift', this.socketQueueShift);
            this.socket.on('cs.close.dialog', this.socketCloseDialog);
            this.socket.on('c.dispatch', this.socketDispatch);
            this.socket.on('cs.action.rate', this.socketActionRate);
        },
        socketConnect: function () {
            this.emit('c.select', UCM.socketCsSelect);
        },
        socketConnectError: function () {
            UCM.addNewMessage({
                type: 'socket',
                btn: true,
                text: 'Connection to customerSuccess error!'
            });
        },
        socketReconnectError: function () {
            if (LIB.$('.reconnect-mask')) {
                LIB.$('.reconnect-mask').parentNode.removeChild(LIB.$('.reconnect-mask'));
            }
        },
        socketDisconnect: function (reason) {
            UCM.isCustomerSuccessOnline = false;
        },
        socketReconnect: function () {
            UCM.isCustomerSuccessOnline = true;
        },
        socketError: function () {
            UCM.addNewMessage({
                type: 'socket',
                btn: true,
                text: 'Connection error!'
            });
        },
        socketSendUserId: function () {
            if (this.userId !='') {
                var userIdCreateTimes = window.localStorage.getItem('userIdCreateTimes') || null,
                    currentTimes = (new Date()).getTime();

                if (userIdCreateTimes && (currentTimes - userIdCreateTimes < 259200000 )) {
                    return false;
                }

                this.sendMessage({
                    action: 'system',
                    text: '@User ID@: '+this.userId
                });
                window.localStorage.setItem('userIdCreateTimes', currentTimes);
            }
        },
        socketCsSelect: function (type, data) {
            if (type === 1) {
                UCM.isCustomerSuccessOnline = true;
                UCM.initData(data);
                UCM.socketSendUserId();
                UCM.startTime = (new Date()).getTime();
                UCM.chatClock();
                UCM.loadChatHistory();
            } else if(type === 2) {
                UCM.addNewMessage({
                    type: 'system',
                    text: 'The current number of queues is <i id="queue-num">'+data.num+'</i>'
                });
            } else if(type === 3) {
                UCM.isCustomerSuccessOnline = false;
                UCM.initData(data);
            }
            if (LIB.$('.reconnect-mask')) {
                LIB.$('.reconnect-mask').parentNode.removeChild(LIB.$('.reconnect-mask'));
            }
        },
        socketCsMessage: function (cid, msg) {
            UCM.addNewMessage({
                type: 'accept',
                text: msg
            });
        },
        socketCsDisconnect: function () {
            UCM.isCustomerSuccessOnline = false;
        },
        socketQueueUpdate: function (pos) {
            LIB.$('#queue-num').innerHTML = pos;
        },
        socketQueueShift: function (data) {
            (data.msg.length > 0) && UCM.initHistoryChat(data.msg);
        },
        socketCloseDialog: function () {
            UCM.isCustomerSuccessOnline = false;
        },
        socketDispatch: function (csid, name, avatar) {
            UCM.csid = csid;
            UCM.csName = name;
            avatar && (UCM.csPhoto = UCM.domain +'/'+ avatar);
        },
        socketActionRate: function () {
            UCM.addNewMessage({
                type: 'accept',
                text: UCM.createRate()
            });
        }
    };

    UCM.init();

})(window, document);

