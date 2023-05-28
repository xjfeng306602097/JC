/**

 @Name：http请求库
    
 */

layui.define(function(exports) {
    var $ = layui.$,
        setter = layui.setter;

    // sendBeacon方法http请求，支持header传递（firefox浏览器存在bug）
    // 与navigator.sendBeacon方法一样，能在beforeunload与unload方法里发送http请求，可用于提交数据，但无法确保获取到响应数据
    var sendBeacon = function(url, data, headers) {
        var event = window.event;
        var isFirefox = navigator.userAgent.indexOf('Firefox') >= 0;
        if (isFirefox || document.all === undefined) {
            // 兼容firefox
            if (event === undefined) {
                var caller = arguments.callee;
                while (caller.caller && caller.arguments[0].type === undefined) {
                    caller = caller.caller;
                }
                event = caller.arguments[0];
            }
        }
        var isUnload = false;
        // 检查是否是页面卸载时调用
        if (event.type == 'beforeunload' || event.type == 'unload') {
            isUnload = true;
        }
        console.log('sendBeacon: ' + event.type);
        // 检测是否为页面卸载时调用，并且检查是否支持navigator.sendBeacon方法，如果同时满足则进入
        if (isUnload && navigator.sendBeacon !== undefined) {
            var setHeaders = new Headers();
            for (var key in headers) {
                setHeaders.append(key, headers[key]);
            }
            // 当不支持fetch，降级为navigator.sendBeacon
            var navigatorSendBeacon = function(url, data) {
                // sendBeacon方法，但无法支持设置header
                var result = navigator.sendBeacon(url, data);
                console.log('sendBeacon[navigator.sendBeacon]: ' + result);
                return result;
            };
            try {
                // 优先采用fetch实现异步请求，经测试：
                // Chrome、Edge等webkit内核浏览器正常发出请求
                // firefox在beforeunload方法需调用event.preventDefault后才可发出请求，这样会导致弹出一个询问“是否退出”的窗口（firefox bug）
                // var returnValue = event.returnValue;
                if (isFirefox && event.type == 'beforeunload') {
                    event.preventDefault();
                }
                fetch(url, {
                    method: 'POST',
                    headers: setHeaders,
                    body: data,
                    mode: 'cors',
                    cache: 'no-cache',
                    redirect: 'error',
                    keepalive: true
                }).catch(function(error) {
                    console.log('sendBeacon[fetch] error: ' + error);
                    navigatorSendBeacon(url, data);
                });
            } catch (e) {
                console.log(e)
                navigatorSendBeacon(url, data);
            }
        } else {
            $.ajax({
                url: url,
                type: 'POST',
                headers: headers,
                data: data,
                async: isUnload ? false : true, // 卸载时改为同步请求，否则为异步请求
                cache: false,
                contentType: false,
                processData: false,
                error: function(e) {
                    console.log('sendBeacon[ajax] error: ' + e.statusText);
                }
            });
        }
    }

    var httpHeader = function() {
        if (window.pageHeaders === undefined) {
            var storage = layui.data(setter.tableName);
            window.pageHeaders = storage.httpHeader || {};
        }
        return {
            headers: window.pageHeaders,
            setup: function() {
                for (var key in this.headers) {
                    if (this.headers[key] === null) {
                        delete this.headers[key];
                        if ($.ajaxSettings.headers[key] !== undefined) {
                            delete $.ajaxSettings.headers[key];
                        }
                    }
                }
                $.ajaxSetup({
                    headers: this.headers,
                });
            },
            getAll: function(key) {
                var headers = {};
                for (var key in this.headers) {
                    if (this.headers[key] !== null) {
                        headers[key] = this.headers[key];
                    }
                }
                return headers;
            },
            get: function(key) {
                return this.headers[key];
            },
            set: function(key, value, isGlobal) {
                if (isGlobal) {
                    var storage = layui.data(setter.tableName);
                    if (storage.httpHeader === undefined) {
                        storage.httpHeader = {};
                    }
                    if (storage.httpHeader[key] != null && value == null) {
                        delete storage.httpHeader[key];
                    } else {
                        storage.httpHeader[key] = value;
                    }
                    layui.data(setter.tableName, {
                        key: "httpHeader",
                        value: storage.httpHeader
                    });
                }
                if (this.headers[key] != null && value == null) {
                    this.headers[key] = null;
                } else {
                    this.headers[key] = value;
                }
            },
            unset: function(key, isGlobal) {
                this.set(key, null, isGlobal);
            }
        };
    };

    if (window.ajaxParams === undefined) {
        window.ajaxParams = $.extend({
            locked: false, // 是否已开启锁定，false=未锁定，true=已锁定（不可创建新的请求）
            lock: {}, // 锁定数据
            tips: {
                lock: 'The request is being submitted, please wait', // 锁定提示
                repeatClick: 'The request is being submitted, please wait', // 重复点击提示
            },
            interval: 0, // 请求时间间隔
            lastRequestTime: 0, // 上次请求时间
            lastClickRequestTime: 0, // 最后点击请求时间，请求间隔判断使用
            loadingStyle: { // 加载样式
                shade: [0.2, '#fff'],
            },
            debug: false,
        }, window.ajaxParams);
    }
    // ajax请求的缓存
    var ajaxCache = {
        update: function() {
            var storage = layui.data(setter.tableName);
            var cache = storage.ajaxCache || [];
            var time = timestamp();
            for (var i = cache.length - 1; i >= 0; i--) {
                if (time > cache[i].expired) {
                    cache.splice(i, 1);
                }
            }
            layui.data(setter.tableName, {
                key: "ajaxCache",
                value: cache
            });
        },
        get: function(request) {
            var storage = layui.data(setter.tableName);
            var cache = storage.ajaxCache || [];
            var requestJson = JSON.stringify(request);
            var time = timestamp();
            var result = null;
            for (var i = cache.length - 1; i >= 0; i--) {
                if (time > cache[i].expired) {
                    cache.splice(i, 1);
                    continue;
                }
                if (cache[i].request == requestJson) {
                    result = cache[i].response;
                    break;
                }
            }
            layui.data(setter.tableName, {
                key: "ajaxCache",
                value: cache
            });
            return result;
        },
        add: function(request, response, time) {
            var item = {
                request: JSON.stringify(request),
                response: response,
                expired: parseInt(timestamp() + time),
            };
            if (this.get(request) === null) {
                var storage = layui.data(setter.tableName);
                var cache = storage.ajaxCache || [];
                cache.push(item);
                layui.data(setter.tableName, {
                    key: "ajaxCache",
                    value: cache
                });
            }
        }
    };
    ajaxCache.update();

    // ajaxRequest锁定
    var ajaxRequestLock = {
        check: function(lock, count) {
            if (window.ajaxParams.locked) {
                var lockData = window.ajaxParams.lock;
                if (lockData.key === lock) {
                    if (count) {
                        ++lockData.count;
                    }
                    return true;
                }
            }
            return false;
        },
        lock: function(data) {
            window.ajaxParams.locked = true;
            window.ajaxParams.lock = data;
        },
        unlock: function() {
            window.ajaxParams.locked = false;
            window.ajaxParams.lock = {};
        },
    };
    // ajax请求方法深度封装
    // ---api           string     指定请求的API接口，比如：login.auth
    // ---apiParams     object     API url入参
    // ---url           string     请求url，最高优先级（会覆盖api参数）
    // ---method        string     请求方法，默认为GET，最高优先级（会覆盖api参数）
    // ---type          string     请求方法，兼容ajax的type，优先级仅次于method（会覆盖api参数）
    // ---data          mixed      请求数据
    // ---headers       object     请求头
    // ---contentType   string     内容类型
    // ---dataType      string     指定返回内容类型，默认为自动识别
    // ---timeout       number     超时时间（毫秒）
    // ---cache         number     缓存时间（秒），默认为0，不缓存
    // ---interval      number     点击请求间隔时间（秒），仅在点击时并且首次请求时生效，用于防止重复点击。默认为0不启用
    // ---lock          number     传递锁定的值，用于异步同时请求，否则请无视
    // ---loading       boolean    是否显示加载框（传入上面的lock后，该设置将失效，根据主请求设置显示loading）
    // ---async         boolean    是否为异步请求，默认为true，false=同步请求
    // ---beforeSend    function   请求前执行方法，beforeSend方法（对应$.ajax）
    // ---success       function   请求成功执行方法，success方法（对应$.ajax）
    // ---error         function   请求错误执行方法，error方法（对应$.ajax）
    // ---complete      function   请求完成后执行方法，complete方法（对应$.ajax）
    var ajaxRequest = function(options) {
        var time = timestamp();
        var apiParams = options.apiParams || {};
        var url = options.url || (options.api ? getApiUrl(options.api, apiParams) : '');
        var method = options.method || options.type || (options.api ? getApiMethod(options.api) : 'GET');
        var async = options.async == undefined ? true : (!!options.async);
        var statusCode = options.statusCode || {};
        var loading = options.loading ? true : false;
        var cacheTime = parseInt(options.cache) || 0;
        var lock = null,
            m = false,
            requestLoading = null;
        var evt = event || window.event || {};
        // 返回的结果对象
        var requestResult = function(success) {
            var requestControl = {
                closeLoading: function() {},
                lock: function(lockEvent) {
                    return 0;
                },
            };
            if (!success) {
                return requestControl;
            }
            // 直接关闭loading层
            requestControl.closeLoading = function() {
                requestLoading && layui.layer.close(requestLoading);
            };
            if (async) {
                // 获取当前请求锁，用于将锁传递到下一个请求，防止同时多个请求时被拦截（仅在异步时生效）
                // lockEvent支持true、false、字符串、数组、函数传入
                requestControl.lock = function(lockEvent) {
                    var lock = time; // 以时间戳作为锁定key
                    if (typeof lockEvent == 'function') {
                        lockEvent = lockEvent(evt);
                    }
                    if (typeof lockEvent == 'string') {
                        if (lockEvent != evt.type) {
                            return 0;
                        }
                        lockEvent = [lockEvent];
                    } else if (lockEvent === false) {
                        return 0;
                    }
                    if (Array.isArray(lockEvent)) {
                        if (lockEvent.indexOf(evt.type) == -1) {
                            return 0;
                        }
                    } else {
                        lockEvent = null;
                    }
                    ajaxRequestLock.lock({
                        key: lock,
                        count: 1,
                        loading: requestLoading,
                        event: lockEvent,
                    });
                    return lock;
                };
            } else {
                requestControl.lock = function(lockEvent) {
                    console.error('Error: 同步请求时不能使用lock锁定');
                    return 0;
                };
            }
            return requestControl;
        };

        ajaxParams.debug && console.log('Request [' + method + '] ', url);
        var tips = $.extend({}, ajaxParams.tips, options.tips);
        if (options.lock != null && options.lock !== 0) {
            if (!ajaxRequestLock.check(options.lock, true)) {
                ajaxParams.debug && console.log('Error: 传递的锁定无效！');
                var lockTips = tips.lock || '';
                lockTips && layui.layer.msg(lockTips, { id: 'ajaxLockTips' });
                return requestResult(false);
            }
            lock = options.lock;
            m = true; // 有传递锁定
        } else {
            if (ajaxParams.locked) {
                ajaxParams.debug && console.log('Error: 已被其他的请求锁定，无法请求！');
                var lockTips = tips.lock || '';
                lockTips && layui.layer.msg(lockTips, { id: 'ajaxLockTips' });
                return requestResult(false);
            }
            lock = time;
        }
        if (evt.type == 'click') {
            var requestInterval = isNaN(options.interval) ? ajaxParams.interval : options.interval;
            requestInterval = Number(requestInterval);
            if (requestInterval > 0 && time <= (ajaxParams.lastClickRequestTime + requestInterval)) {
                ajaxParams.debug && console.log('Error: 重复请求，请间隔' + requestInterval + '秒后再试！');
                var repeatTips = tips.repeatClick || '';
                repeatTips && layui.layer.msg(repeatTips, { id: 'ajaxRepeatTips' });
                return requestResult(false);
            }
        }
        ajaxParams.debug && console.log('Request Start Time: ', time);
        ajaxParams.lastRequestTime = time;
        if (evt.type == 'click') {
            ajaxParams.lastClickRequestTime = time;
        }
        if (m) {
            requestLoading = ajaxParams.lock.loading;
        }
        if (loading && !requestLoading) {
            requestLoading = layui.layer.load(1, ajaxParams.loadingStyle);
        }
        var complete = function(xhr, message) {
            ajaxParams.debug && console.log('Request Total Time: ', timestamp() - time);
            var isCloseLoading = requestLoading ? true : false;
            var isUnlock = true;
            if (ajaxRequestLock.check(lock)) {
                --ajaxParams.lock.count;
                isUnlock = ajaxParams.lock.count <= 0;
            }
            if (isCloseLoading && isUnlock) {
                layui.layer.close(requestLoading, function() {
                    ajaxRequestLock.unlock();
                });
            } else if (isUnlock) {
                ajaxRequestLock.unlock();
            }
            options.complete && options.complete(xhr, message);
        };
        var request = {
            url: url,
            type: method,
            data: options.data,
            headers: options.headers,
            contentType: options.contentType,
            dataType: options.dataType,
        };
        if (cacheTime > 0) {
            var cacheResponse = ajaxCache.get(request);
            if (cacheResponse !== null) {
                if (async) {
                    setTimeout(function() {
                        options.beforeSend && options.beforeSend(cacheResponse.beforeSend[0]);
                        if (typeof statusCode == 'object' && cacheResponse.statusCode && statusCode[cacheResponse.statusCode]) {
                            statusCode[cacheResponse.statusCode]();
                        }
                        options.success && options.success(cacheResponse.success[0], cacheResponse.success[1]);
                        console.log('Request Use Cache');
                        complete(cacheResponse.complete[0], cacheResponse.complete[1]);
                    }, 1);
                } else {
                    options.beforeSend && options.beforeSend(cacheResponse.beforeSend[0]);
                    options.success && options.success(cacheResponse.success[0], cacheResponse.success[1]);
                    console.log('Request Use Cache');
                    complete(cacheResponse.complete[0], cacheResponse.complete[1]);
                }
                return requestResult(true);
            }
        }
        var cacheData = {};
        layui.$.ajax({
            url: url,
            type: method,
            data: options.data,
            headers: options.headers,
            contentType: options.contentType,
            dataType: options.dataType,
            timeout: options.timeout,
            async: async,
            statusCode: statusCode,
            cache: false, // 禁用浏览器缓存
            beforeSend: function(xhr) {
                if (cacheTime > 0) {
                    cacheData.beforeSend = [xhr];
                }
                options.beforeSend && options.beforeSend(xhr);
            },
            success: function(result, message) {
                if (cacheTime > 0) {
                    cacheData.success = [result, message];
                }
                options.success && options.success(result, message);
            },
            error: function(xhr, message, e) {
                options.error && options.error(xhr, message, e);
            },
            complete: function(xhr, message) {
                // 仅请求成功时才缓存
                if (cacheTime > 0 && cacheData.success) {
                    cacheData.statusCode = xhr.status;
                    cacheData.statusText = xhr.statusText;
                    cacheData.complete = [xhr, message];
                    ajaxCache.add(request, cacheData, cacheTime);
                }
                complete(xhr, message);
            }
        });
        return requestResult(true);
    };
    window.AjaxRequest = ajaxRequest;

    // 让浏览器下载指定文件
    var download = function(url, fileName) {
        var link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName || '');
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(link.href);
    };
    // ajax方式下载文件（远程时使用，支持传递header、下载进度条等高级操作）
    // ---api           string     指定请求的API接口，比如：login.auth
    // ---apiParams     object     API url入参
    // ---url           string     请求url，最高优先级（会覆盖api参数）
    // ---method        string     请求方法，默认为GET，最高优先级（会覆盖api参数）
    // ---type          string     请求方法，兼容ajax的type，优先级仅次于method（会覆盖api参数）
    // ---fileName      mixed      文件名称，支持字符串和function形式
    // ---data          mixed      请求数据
    // ---headers       object     请求头
    // ---timeout       number     超时时间（毫秒），默认不超时
    // ---success       function   请求成功执行方法，success方法
    // ---error         function   请求错误执行方法，error方法
    // ---complete      function   请求完成后执行方法，complete方法
    var downloadFile = function(options) {
        var apiParams = options.apiParams || {};
        var url = options.url || (options.api ? getApiUrl(options.api, apiParams) : '');
        var method = options.method || options.type || (options.api ? getApiMethod(options.api) : 'GET');
        var fileName = options.fileName;
        var timeout = options.timeout;
        var data = options.data || null;

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.open(method, url, true);
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                downloadTimeout && clearTimeout(downloadTimeout);
            }
        };
        xhr.onload = function() {
            if ((this.status >= 200 && this.status < 300) || (this.status === 304)) {
                var blob = this.response;
                var url = window.URL.createObjectURL(blob);
                if (typeof fileName == 'function') {
                    fileName = fileName(blob);
                }
                download(url, fileName);
                options.success && options.success(xhr, blob);
            } else {
                options.error && options.error(xhr, 'error', null);
            }
            options.complete && options.complete(xhr);
        };
        xhr.onerror = function(e) {
            options.error && options.error(xhr, 'error', e);
            options.complete && options.complete(xhr);
        };
        xhr.onabort = function(e) {
            options.error && options.error(xhr, 'abort', e);
            options.complete && options.complete(xhr);
        };
        xhr.ontimeout = function(e) {
            options.error && options.error(xhr, 'timeout', e);
            options.complete && options.complete(xhr);
        };
        xhr.onprogress = function(e) {
            options.progress && options.progress(e);
        };
        if (timeout && timeout > 0) {
            var downloadTimeout = setTimeout(function() {
                xhr.abort();
            }, timeout);
        }
        // 设置请求头
        var headers = httpHeader().getAll();
        if (options.headers) {
            Object.assign(headers, options.headers);
        }
        for (var key in headers) {
            xhr.setRequestHeader(key, headers[key]);
        }
        xhr.send(data);
    };
    window.downloadFile = downloadFile;

    // http请求封装
    var http = {
        request: ajaxRequest,
        download: download,
        downloadFile: downloadFile,
        sendBeacon: sendBeacon,
        // 代理请求，支持在关闭窗口时调用
        // 通过sendBeacon方法发送请求，并使用php转发请求，打通后端api接口
        proxyRequest: function(params) {
            var url = params.url;
            var method = params.method ? params.method : 'GET';
            var formData = new FormData();
            formData.append('url', url);
            formData.append('method', method);
            if (params.body != undefined) {
                formData.append('body', params.body);
            }
            if (params.headers != undefined) {
                var headers = JSON.stringify(params.headers);
                formData.append('headers', headers);
            }
            var query = {
                key: 'kDNw4AZX31rfuP12VH4Q9ejXSA8zwe78FhFC',
                code: 'BN26WHW1CNaqSvcx6515H8JVfeLKM5447CJV',
            };
            var queryStr = $.param(query);
            sendBeacon('/makroDigital/apiTransfer/index?' + queryStr, formData);
        },
        // 创建数据集合，可多次绑定数据，获取对应数据
        collection: function(params) {
            var url = params.url;
            var method = params.method ? params.method : 'GET';
            var headers = params.headers;
            var data = params.data;
            return {
                // 所有绑定该动态的事件
                events: {},
                // 只需触发一次的事件
                onlyOnce: [],
                // 事件绑定
                bind: function(event, options) {
                    this.events[event] = options;
                },
                unbind: function(event) {
                    delete this.events[event];
                },
                request: function() {
                    var that = this;
                    http.request({
                        url: url,
                        type: method,
                        headers: headers,
                        data: data,
                        success: function(result) {
                            for (var event in that.events) {
                                if (typeof that.events[event].success == 'function') {
                                    that.events[event].success(result);
                                }
                            }
                        },
                        error: function(e) {
                            for (var event in that.events) {
                                if (typeof that.events[event].error == 'function') {
                                    that.events[event].error(e);
                                }
                            }
                        },
                        complete: function(xhr) {
                            for (var event in that.events) {
                                if (typeof that.events[event].complete == 'function') {
                                    that.events[event].complete(xhr);
                                }
                            }
                            for (var i in that.onlyOnce) {
                                that.unbind(that.onlyOnce[i]);
                            }
                            that.onlyOnce = [];
                        }
                    });
                }
            }
        },
        // 请求头封装
        header: httpHeader,
    };

    //对外暴露的接口
    exports('http', http);
});