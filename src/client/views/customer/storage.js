;(function (w, d) {
    var uuchatAjax = function(params){
        var params = params || {}
        params.data = params.data || {},
            json = params.jsonp ? jsonp(params) : json(params);

        function json(params){
            params.type = (params.type || 'GET').toUpperCase();
            !params.fileType && (params.data = formatParams(params.data));

            var xhr = null,
                org = window.location.protocol+'://'+window.location.host;

            xhr = new XMLHttpRequest() || new ActiveXObjcet('Microsoft.XMLHTTP');

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

            xhr.upload.onprogress = params.progress;
            params.error && (xhr.onerror = params.error);

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
    };

    w.uuchatAjax = uuchatAjax;


})(window, document)
;(function (w, doc) {


    var UStorage = {
        storageData: {
            time: {
                firstTime: "",
                lastTime: "",
                chatTime: "",
                timezone: ""
            },
            userInfo: {
                name: "",
                firstScreen: "",
                screenList: [],
                lastScreen: "",
                city: "",
                country: "",
                email: "",
                UserID: ""
            },
            browser: {
                language: "",
                browser: "",
                browserVersion: "",
                OS: ""
            }
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
            var d = new Date(),
                list = this.storageData.userInfo.screenList.toString();

            this.storageData.time.lastTime = d.getTime();

            if(list.indexOf(doc.referrer) < 0){
                this.storageData.userInfo.screenList.push(doc.referrer);
            }

            this.storageData.userInfo.lastScreen  = doc.referrer;

            if(data){
                this.storageData.userInfo.city  = data.city;
                this.storageData.userInfo.country  = data.country;
                this.storageData.userInfo.email  = data.email;
                this.storageData.userInfo.UserID  = data.UserID;
                this.storageData.browser.browser  = data.browser;
                this.storageData.browser.browserVersion  = data.browserVersion;
                this.storageData.browser.OS  = data.OS;
            }

            localStorage.setItem("uuInfoData", JSON.stringify(this.storageData));
        },
        createStorageData: function() {
            var d = new Date();


            if(this.storageData.time.firstTime === ""){
                this.storageData.time.firstTime = d.getTime();
            }
            if(this.storageData.time.lastTime === ""){
                this.storageData.time.lastTime = d.getTime();
            }
            this.storageData.time.timezone = Math.ceil(d.getTimezoneOffset()/60);
            this.storageData.userInfo.firstScreen = doc.referrer;
            this.storageData.userInfo.lastScreen  = doc.referrer;

            this.storageData.userInfo.screenList.push(doc.referrer);
            this.storageData.browser.language = (navigator.language || navigator.browserLanguage).toLowerCase();


            localStorage.setItem("uuInfoData", JSON.stringify(this.storageData));

        },
        send: function() {
            if(uuchatAjax){
                uuchatAjax({
                    url:'/offlines',
                    type:'GET',
                    jsonp: 'jsonpCallback',
                    data: UStorage.storageData,
                    success: function(d) {
                        if (d.code === 200) {
                            UStorage.update(d.data);
                        }
                    }
                });
            }
        }
    };
    w.UStorage = UStorage;

    UStorage.init();
    //UStorage.send();


})(window, document)