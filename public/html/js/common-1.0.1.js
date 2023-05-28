if (API_URL === undefined) {
    var API_URL = $('meta[name="gateway"]').attr("content");
}
var Common = (function(API_URL) {
    var urlParser = function(url) {
        return new URL(url);
    };
    var staticDomain = '';
    var static = function (uri) {
        if (!staticDomain) {
            var src = window.location.href;
            if (document.currentScript) {
                src = document.currentScript.src;
            }
            var url = urlParser(src);
            staticDomain = url.protocol + '//' + url.host;
        }
        return staticDomain + uri;
    }
    var obj = {};
    // 跳转APP页面链接
    var open_app_url = static('/makro-htmls/openapp.html');
    if (API_URL == window.location.protocol + '//' + window.location.host) {
        open_app_url = API_URL + '/makro-file/h5/openapp.html';
    }
    // 载入js脚本
    var scripts = [];
    obj.loadScript = function(url, success, error) {
        if (scripts.indexOf(url) === -1) {
            scripts.push(url);
            var body = document.getElementsByTagName('body')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.onload = script.onreadystatechange = function() {
                if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                    success && success();
                    // Handle memory leak in IE
                    script.onload = script.onreadystatechange = null;
                }
            };
            script.onerror = function() {
                var index = scripts.indexOf(url);
                if (index !== -1) {
                    scripts.splice(index, 1);
                }
                error && error();
            };
            script.src = url;
            body.appendChild(script);
        } else {
            success && success();
        }
    };
    // API 请求
    var API = function() {
        // api列表
        var list = {
            "track": {
                "uv": {
                    "url": "/makro-stat/api/v1/track/uv",
                    "method": "POST",
                },
                "pv": {
                    "url": "/makro-stat/api/v1/track/pv",
                    "method": "POST",
                },
                "stay": {
                    "url": "/makro-stat/api/v1/track/stay",
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
            "uv": {
                "api": "track.uv",
                "contentType": "application/json;charset=utf-8;",
                "dataType": "json",
            },
            "pv": {
                "api": "track.pv",
                "contentType": "application/json;charset=utf-8;",
                "dataType": "json",
            },
            "stay": {
                "api": "track.stay",
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
        var sign = function(d) {
            var v = new Date();
            var p = function (n, length) {
                for (var len = (n + '').length; len < length; len = n.length) {
                    n = "0" + n;
                }
                return n;
            };
            return md5('makro_jE7n85j' + d + v.getFullYear() + p(v.getMonth() + 1, 2) + p(v.getDate(), 2));
        }
        var request = function() {
            var headers = {
                'Makro-Digital-Sign': sign(data),
            };
            $.ajax({
                url: api.url(item.api),
                type: api.method(item.api),
                contentType: item.contentType,
                headers: headers,
                data: data,
                dataType: item.dataType,
                cache: false,
                success: function(result) {
                    success && success(result);
                },
                error: function() {
                    error && error();
                }
            });
        };
        var md5_js = static('/makro-js/md5.min.js');
        Common.loadScript(md5_js, function() {
            request();
        }, function() {
            error && error();
        });
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
    /**
     * 导航类型
     * 0: 点击一个链接，在浏览器地址栏中输入URL，提交表单，点击书签，通过脚本操作进行初始化
     * 1: 点击重新加载按钮或使用location.reload()
     * 2: 使用浏览器历史记录（前进和后退）
     * 3: 预渲染的链接。比如<link rel="prerender" href="//example.com/next-page.html">
     * 4: 其他情况。
     */
    obj.navigationType = function() {
        var type;
        if (window.performance.navigation) {
            type = window.performance.navigation.type;
            if (type == 255) {
                type = 4;
            }
        }
        if (window.performance.getEntriesByType("navigation")) {
            var p = window.performance.getEntriesByType("navigation")[0].type;
            if (p == 'navigate') {
                type = 0;
            }
            if (p == 'reload') {
                type = 1;
            }
            if (p == 'back_forward') {
                type = 2;
            }
            if (p == 'prerender') {
                type = 3;
            }
        }
        return type;
    };
    obj.url = urlParser(window.location.href);
    obj.urlParse = urlParser;
    // 打开APP
    obj.openApp = function(url, webUrl) {
        var openUrl = open_app_url + '?app_url=' + encodeURIComponent(url);
        if (webUrl) {
            openUrl += '&web_url=' + encodeURIComponent(webUrl);
        }
        window.location.href = openUrl;
        // window.location.href = webUrl;
    };
    // 发送postMessage
    obj.postMessage = function(data) {
        if (window.ReactNativeWebView) { // React-Native
            if (typeof data == 'object') {
                data = JSON.stringify(data);
            }
            window.ReactNativeWebView.postMessage(data);
        } else if (typeof uni.postMessage == 'function') { // uniapp
            uni.postMessage({
                data: data,
            });
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
    obj.pageInit = function(_current) {
        // 打开商品页面
        var openGoods = function(goodsCode) {
            var productId = '';
            if (window.goodsInfo[goodsCode] && window.goodsInfo[goodsCode].id) {
                productId = window.goodsInfo[goodsCode].id;
            }
            var url = API_URL + '/goto/product/web?itemCode=' + goodsCode + '&productId=' + productId;
            if (Common.device.isApp()) {
                // 如果是app打开，则通知app跳转对应页面
                Common.postMessage({
                    action: 'clickGoods',
                    goodsCode: goodsCode,
                    id: productId,
                });
            } else {
                // 如果为手机端并且为web访问则尝试通过app打开
                if (Common.device.isMobile()) {
                    // Common.openApp('makro://goods?code=' + goodsCode + '&id=' + productId, url);
                    // 打开APP
                    var app_url = API_URL + '/goto/product/app?itemCode=' + goodsCode + '&productId=' + productId;
                    Common.openApp(app_url, url);
                } else {
                    window.location.href = url;
                }
            }
        };
        // 点击商品
        var clickGoods = function(goodsCode, pageNo) {
            console.log('clickGoods: ' + goodsCode);
            if (pageNo === undefined) {
                pageNo = parseInt(window.pageData.pageNo);
            } else {
                pageNo = parseInt(pageNo);
            }
            if (window.pageTrack) {
                var data = {
                    "uuid": window.pageData.uuid,
                    "bizId": window.pageData.bizId,
                    "channel": _current.channel,
                    "goodsCode": goodsCode,
                    "memberNo": _current.memberNo,
                    "mmCode": _current.mmCode,
                    "pageNo": pageNo,
                    "publishType": _current.publishType,
                    "storeCode": _current.storeCode
                };
                Common.track('clickGoods', data, function(result) {
                    openGoods(goodsCode);
                }, function() {
                    openGoods(goodsCode);
                });
            } else {
                openGoods(goodsCode);
            }
        };
        // 翻页
        var turnPage = function(pageNo) {
            console.log('pageNo: ' + pageNo);
        };
        window.pageData = _current;
        window.pageTrack = false;
        window.pageOpenTime = Date.now(); // 页面打开时间
        window.goodsInfo = {};
        window.clickGoods = clickGoods;
        window.turnPage = turnPage;
    }
    // 开启页面监听
    obj.pageTrack = function() {
        window.pageTrack = true;
        if (localStorage) {
            window.pageData.uuid = localStorage.getItem('uuid') || void 0;
        }
        // 打开MM详情页记录
        var pvData = {
            "uuid": window.pageData.uuid,
            "channel": window.pageData.channel,
            "memberNo": window.pageData.memberNo,
            "mmCode": window.pageData.mmCode,
            "pageNo": window.pageData.pageNo,
            "pageUrl": window.pageData.pageUrl,
            "publishType": window.pageData.publishType,
            "storeCode": window.pageData.storeCode
        };
        var _pvReq_failNumber = 0;
        var pvReq = function() {
            var bizId = '';
            if (sessionStorage) {
                bizId = sessionStorage.getItem('bizId');
                sessionStorage.removeItem('bizId');
            }
            // 如果已经有bizId，就还原
            if (bizId && Common.navigationType() == 2) {
                console.log('bizId', bizId);
                window.pageData.bizId = bizId;
            } else {
                Common.track('pv', pvData, function(result) {
                    _pvReq_failNumber = 0;
                    window.pageData.bizId = result.msg;
                    console.log(result);
                }, function() {
                    ++_pvReq_failNumber;
                    if (_pvReq_failNumber <= 2) {
                        setTimeout(function() {
                            pvReq();
                        }, 300);
                    } else {
                        console.log('Track error');
                    }
                });
            }
        };
        pvReq();
        // 每5秒上传一次心跳数据
        var lastStayTime = window.pageOpenTime;
        var pageStayInterval = setInterval(function() {
            if (window.pageData.bizId) {
                var pageNo = window.pageData.pageNo;
                var currentTime = Date.now();
                var time = currentTime - lastStayTime;
                pageStays[pageNo] = pageStays[pageNo] ? pageStays[pageNo] + time : time;
                lastStayTime = currentTime;
                var stayList = [];
                for (var n in pageStays) {
                    stayList.push({
                        "uuid": window.pageData.uuid,
                        "bizId": window.pageData.bizId,
                        "channel": window.pageData.channel,
                        "memberNo": window.pageData.memberNo,
                        "mmCode": window.pageData.mmCode,
                        "storeCode": window.pageData.storeCode,
                        "pageNo": parseInt(n),
                        "stayTime": pageStays[n]
                    });
                }
                Common.track('stay', stayList, function(result) {
                    pageStays = {};
                    // console.log(result);
                });
            }
        }, 5000);
        // 翻页
        window.pageTurnTime = window.pageOpenTime; // 页面上次翻页时间
        var pageStays = {};
        var turnPage = function(pageNo) {
            pageNo = parseInt(pageNo);
            console.log('pageNo: ' + pageNo);
            if (window.pageData.bizId) {
                pvData.uuid = window.pageData.uuid;
                pvData.bizId = window.pageData.bizId;
                pvData.pageNo = pageNo;
                Common.track('pv', pvData, function(result) {
                    // console.log(result);
                });
            }
            // 将page更改同步到URL
            if (window.history.replaceState) {
                Common.url.searchParams.set('p', pageNo);
                var url = Common.url.toString();
                window.history.replaceState(null, '', url);
            }
            var lastPage = window.pageData.pageNo;
            var currentTime = Date.now();
            var time = currentTime - lastStayTime;
            pageStays[lastPage] = pageStays[lastPage] ? pageStays[lastPage] + time : time;
            lastStayTime = currentTime;
            window.pageTurnTime = currentTime;
            window.pageData.pageNo = pageNo;
        };
        window.turnPage = turnPage;
        // 点击商品链接时
        $(document).on('click', 'a', function(e) {
            var url = $(this).attr('href');
            var goodsCode = '';
            var goodsUrlRegs = [
                /^(http|https):\/\/www.makroclick.com\/[A-Za-z0-9-_]+\/products\/[0-9]+$/,
                /^http(s)?:\/\/(.*?)\/product\/[A-Za-z0-9]+$/,
            ];
            for (var i = 0; i < goodsUrlRegs.length; i++) {
                if (goodsUrlRegs[i].test(url)) {
                    goodsCode = url.substring(url.lastIndexOf("\/") + 1, url.length);
                    break;
                }
            }
            if (goodsCode) {
                var pageIndex = $(this).parents('.pageBox').index();
                var pageNo = parseInt((pageIndex + 1) / 2).toString();
                window.clickGoods(goodsCode, pageNo);
                return false;
            }
        });
        // 跳转页面前
        $(window).bind('beforeunload', function() {
            console.log('beforeunload', window.pageData.bizId);
            if (window.pageData.bizId) {
                // sessionStorage存储页面信息
                if (sessionStorage) {
                    sessionStorage.setItem('bizId', window.pageData.bizId);
                }
            }
        });
    };
    return obj;
})(API_URL);