;(function (w, doc) {
    var uuchatAjax = function(options){

        var params = options || {};

        if (options.jsonp) {
            jsonp(params);
        } else {
            json(params);
        }

        function json(params){
            params.type = (params.type || 'GET').toUpperCase();
            !params.fileType && (params.data = formatParams(params.data));

            var xhr = null;

            xhr = new XMLHttpRequest() || new ActiveXObjcet('Microsoft.XMLHTTP');

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var status = xhr.status;
                    if(status >= 200 && status < 300) {

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
            };

            xhr.upload.onprogress = params.progress;
            params.error && (xhr.onerror = params.error);

            if (params.type == 'GET') {
                xhr.open(params.type, params.url + '?' + params.data, true);
                xhr.send(null);
            } else {
                xhr.open(params.type, params.url, true);
                xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
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
    };

    w.uuchatAjax = uuchatAjax;

})(window, document)
;(function (w, doc) {

    function extend(destination, source){
        for(var property in source) {
            if (destination.hasOwnProperty(property)) {
                destination[property] = source[property];
            }
        }
        return destination
    }

    var UStorage = {
        storageData: {
            firstTime: "",
            lastTime: "",
            chatTime: "",
            timezone: "",
            name: "",
            email: "",
            firstScreen: "",
            screenList: [],
            lastScreen: "",
            city: "",
            country: "",
            language: "",
            browser: "",
            bv: "",
            os: "",
            cid: '',
            isRefresh: false
        },
        set: function (d) {
            if(this.storageData.isRefresh){
                d.cid && this.patch(d.cid);
                this.storageData.isRefresh = false;
                return false;
            }

            extend(this.storageData, d);

            if (d.action === 'init' || d.action === 'updateUser') {
                this.storageData.cid = d.cid;
                this.send();
            }
            localStorage.setItem("uuInfoData", JSON.stringify(this.storageData));

        },
        init: function() {
            if (w.localStorage) {
                var uls = localStorage.getItem("uuInfoData");
                if(uls){
                    this.storageData = JSON.parse(uls);
                    this.update();
                }else{
                    this.createStorageData();
                }
            }
        },
        get: function() {
            return this.storageData;
        },
        update: function(data) {

            this.storageData.lastTime = (new Date()).getTime();

            if ( this.storageData.screenList.toString().indexOf(doc.referrer.split('?')[0]) < 0) {
                this.storageData.screenList.push(doc.referrer.split('?')[0]);
            }
            if(this.storageData.lastScreen != doc.referrer.split('?')[0]){
                this.storageData.isRefresh = true;
                this.storageData.lastScreen = doc.referrer.split('?')[0];
            }

            extend(this.storageData, data);

            localStorage.setItem("uuInfoData", JSON.stringify(this.storageData));
        },
        createStorageData: function() {
            var d = new Date();

            this.storageData.firstTime = d.getTime();
            this.storageData.lastTime = d.getTime();
            this.storageData.timezone = Math.ceil(d.getTimezoneOffset()/60);
            this.storageData.firstScreen = doc.referrer;
            this.storageData.lastScreen  = doc.referrer;

            this.storageData.screenList.push(doc.referrer.split('?')[0]);
            this.storageData.language = (navigator.language || navigator.browserLanguage).toLowerCase();

            localStorage.setItem("uuInfoData", JSON.stringify(this.storageData));
        },
        send: function() {
            if (UStorage.storageData.cid) {
                var SD = this.storageData;
                uuchatAjax({
                    url:'/customerstorages/customer/'+UStorage.storageData.cid,
                    type:'POST',
                    data: {
                        firstTime: SD.firstTime,
                        timezone: SD.timezone,
                        firstScreen: SD.firstScreen,
                        lastScreen: SD.lastScreen,
                        language: SD.language
                    },
                    success: function(d) {
                        d = JSON.parse(d);
                        if (d.code === 200) {
                            UStorage.update(d.msg);
                        }
                    }
                });
            }
        },
        patch: function (cid) {
            uuchatAjax({
                url:'/customerstorages/customer/'+cid,
                type:'PATCH',
                data: {
                    lastTime: UStorage.storageData.lastTime,
                    chatTime: UStorage.storageData.chatTime,
                    lastScreen: UStorage.storageData.lastScreen
                },
                success: function(d) {
                    d = JSON.parse(d);
                    if (d.code === 200) {
                        UStorage.update(d.msg);
                    }
                }
            });
        }
    };
    w.UStorage = UStorage;

    UStorage.init();

    w.addEventListener('message', function (e) {
        e.data && UStorage.set(e.data);
    });

})(window, document);
