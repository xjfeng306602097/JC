if (API_URL === undefined) {
    var API_URL = window.location.protocol + '//' + window.location.host;
}
var Common = (function(api_url) {
    var obj = {};
    // 跳转APP页面链接
    var open_app_url = API_URL + '/makro-htmls/openapp.html';
    if (API_URL == window.location.protocol + '//' + window.location.host) {
        open_app_url = API_URL + '/makro-file/h5/openapp.html';
    }
    // API 请求
    var API = function() {
        // api列表
        var list = {
            "track": {
                "pv": {
                    "url": "/makro-stat/api/v1/track/pv",
                    "method": "POST",
                },
                "goodsClick": {
                    "url": "/makro-stat/api/v1/track/goods/click",
                    "method": "POST",
                },
            }
        };
        for (var x in list) {
            this[x] = list[x];
        }
    };
    API.prototype.url = function(module) {
        var value = this;
        var tree = module.split('.');
        for (var key in tree) {
            if (tree[key] !== '') {
                value = value[tree[key]];
                if (value === undefined) {
                    return undefined;
                }
            }
        }
        if (typeof value.url == 'string') {
            return API_URL + value.url;
        }
        return '';
    };
    API.prototype.method = function(module) {
        var value = this;
        var tree = module.split('.');
        for (var key in tree) {
            if (tree[key] !== '') {
                value = value[tree[key]];
                if (value === undefined) {
                    return undefined;
                }
            }
        }
        return value.method || '';
    };
    var api = new API();
    // obj.api = api;
    // 采集数据
    obj.track = function(eventName, data, success, error) {
        var events = {
            "pv": {
                "api": "track.pv",
                "contentType": "application/json;charset=utf-8;",
                "dataType": "json",
            },
            "clickGoods": {
                "api": "track.goodsClick",
                "contentType": "application/json;charset=utf-8;",
                "dataType": "json",
            },
        };
        if (!events[eventName]) {
            return;
        }
        var item = events[eventName];
        if (typeof data == 'object' && item.contentType.indexOf('application/json') >= 0) {
            data = JSON.stringify(data);
        }
        var _failNumber = 0;
        var request = function() {
            $.ajax({
                url: api.url(item.api),
                type: api.method(item.api),
                contentType: item.contentType,
                data: data,
                dataType: item.dataType,
                cache: false,
                success: function(result) {
                    _failNumber = 0;
                    success && success(result);
                },
                error: function() {
                    ++_failNumber;
                    if (_failNumber <= 2) {
                        setTimeout(function() {
                            request();
                        }, 500);
                    } else {
                        error && error();
                    }
                }
            });
        };
        request();
    };
    // WebDevice 设备信息
    var WebDevice = function() {
        this.userAgent = navigator.userAgent;
        this.platform = navigator.platform;
    };
    WebDevice.prototype.isAndroid = function() {
        return Boolean(this.userAgent.match(/android/ig));
    };
    WebDevice.prototype.isIos = function() {
        return Boolean(this.userAgent.match(/iphone|ipod|iOS/ig));
    };
    WebDevice.prototype.isMobile = function() {
        return this.isAndroid() || this.isIos() || Boolean(this.userAgent.match(/Mobile/ig));
    };
    WebDevice.prototype.isApp = function() {
        return Boolean(this.userAgent.match(/Makro|isapp/ig)) || this.userAgent.indexOf('uni-app') >= 0;
    };
    obj.device = new WebDevice();
    var urlParser = function(url) {
        return new URL(url);
    };
    obj.url = urlParser(window.location.href);
    obj.urlParse = urlParser;
    // 打开APP
    obj.openApp = function(url, webUrl) {
        var openUrl = open_app_url + '?app_url=' + encodeURIComponent(url);
        if (webUrl) {
            openUrl += '&web_url=' + encodeURIComponent(webUrl);
        }
        // window.location.href = openUrl;
        window.location.href = webUrl;
    };
    // 发送postMessage
    obj.postMessage = function(data) {
        if (typeof uni.postMessage == 'function') { // uniapp
            uni.postMessage({
                data: data,
            });
        } else if (typeof window.ReactNativeWebView.postMessage == 'function') { // React-Native
            if (typeof data == 'object') {
                data = JSON.stringify(data);
            }
            window.ReactNativeWebView.postMessage(data);
        } else if (typeof window.postMessage == 'function') { // 浏览器
            if (typeof data == 'object') {
                data = JSON.stringify(data);
            }
            window.postMessage(data, API_URL);
        } else {
            console.log('不支持postMessage方法');
        }
    };
    // 监听Message事件，负责接收数据
    obj.onMessage = function(callback) {
        if (typeof window.addEventListener != 'undefined') {
            window.addEventListener('message', callback, false);
        } else if (typeof window.attachEvent != 'undefined') {
            window.attachEvent('onmessage', callback);
        }
    };
    // 监听页面
    obj.pageTrack = function(_current) {
        // 打开MM详情页记录
        var data = {
            "channel": _current.channel,
            "memberNo": _current.memberNo,
            "memberType": _current.memberType,
            "mmCode": _current.mmCode,
            // "pageNo": "",
            "pageUrl": _current.pageUrl,
            "publishType": _current.publishType,
            "storeCode": _current.storeCode
        };
        Common.track('pv', data, function(result) {
            console.log(result);
        });
        // 点击商品时记录
        $(document).on('click', 'a', function(e) {
            var url = $(this).attr('href');
            var goodsUrlReg = /^(http|https):\/\/www.makroclick.com\/[A-Za-z0-9-_]+\/products\/[0-9]+$/;
            if (goodsUrlReg.test(url)) {
                var goodsCode = url.substring(url.lastIndexOf("\/") + 1, url.length);
                var pageIndex = $(this).parents('.pageBox').index();
                var pageNo = parseInt((pageIndex + 1) / 2).toString();
                var data = {
                    "channel": _current.channel,
                    "goodsCode": goodsCode,
                    "memberNo": _current.memberNo,
                    "memberType": _current.memberType,
                    "mmCode": _current.mmCode,
                    "pageNo": pageNo,
                    "publishType": _current.publishType,
                    "storeCode": _current.storeCode
                };
                Common.track('clickGoods', data, function(result) {
                    console.log(result);
                    if (Common.device.isApp()) {
                        // 如果是app打开，则通知app跳转对应页面
                        Common.postMessage({
                            action: 'clickGoods',
                            goodsCode: goodsCode,
                        });
                    } else {
                        // 如果为手机端并且为web访问则尝试通过app打开
                        if (Common.device.isMobile()) {
                            Common.openApp('goods?code=' + goodsCode, url);
                        } else {
                            window.location.href = url;
                        }
                    }
                }, function() {
                    if (Common.device.isApp()) {
                        // 如果是app打开，则通知app跳转对应页面
                        Common.postMessage({
                            action: 'clickGoods',
                            goodsCode: goodsCode,
                        });
                    } else {
                        // 如果为手机端并且为web访问则尝试通过app打开
                        if (Common.device.isMobile()) {
                            Common.openApp('goods?code=' + goodsCode, url);
                        } else {
                            window.location.href = url;
                        }
                    }
                });
            }
            return false;
        });
    };
    return obj;
})(API_URL);