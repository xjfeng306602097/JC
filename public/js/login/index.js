layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'verify', 'common'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,admin = layui.admin
        ,form = layui.form
        ,router = layui.router()
        ,search = router.search
        ,httpHeader = layui.common.httpHeader;

    // 设置页面请求头
    httpHeader.set('Makro-Accept-Language', 'en_US');// 指定语言：英文
    httpHeader.setup();

    var current_uuid = "";
    var storage = layui.data(setter.tableName);

    // 回车事件触发
    var enterAction = 'login';
    if (storage.access_token) {
        AjaxRequest({
            url: getApiUrl('login.check'),
            method: getApiMethod('login.check'),
            loading: true,
            success: function(result) {
                if (result.code === "0000") {
                    enterAction = 'enterSystem';
                    layer.confirm('It is detected that you have logged in, do you want to enter?', {
                        icon: 3,
                        title: 'Tips',
                        btn: ['Enter', 'Cancel'],
                        end: function() {
                            // 关闭后改成提交登录
                            enterAction = 'login';
                        }
                    }, function(index) {
                        goToSystem();
                    });
                } else {
                    if (result.code === "0017" || result.code === "0018") {
                        clearLogin();
                    }
                    enterAction = 'login';
                }
            },
            error: function(xhr, errMsg) {
                var result = {};
                try {
                    result = JSON.parse(xhr.responseText);
                    if (result.code === "0017" || result.code === "0018") {
                        clearLogin();
                    }
                } catch (e) {
                    console.log('error');
                }
                enterAction = 'login';
            }
        });
    } else {
        clearLogin();
        enterAction = 'login';
    }

    function clearLogin() {
        //清空本地记录的 token，并跳转到登入页
        layui.data(setter.tableName, {
            key: 'username'
            ,remove: true
        });
        
        layui.data(setter.tableName, {
            key: 'access_token'
            ,remove: true
        });
        
        layui.data(setter.tableName, {
            key: 'permissions'
            ,remove: true
        });
        
        layui.data(setter.tableName, {
            key: 'ajaxCache'
            ,remove: true
        });
        storage = layui.data(setter.tableName);
        httpHeader.set('Authorization', null);// 去除Authorization
        httpHeader.setup();
        // console.log(storage);
        $.removeCookie('makroDigital_token');
        $.removeCookie('makroDigital_username');
    }

    function getValidateCode(lock) {
        AjaxRequest({
            url: getApiUrl('login.validateCode'),
            method: getApiMethod('login.validateCode'),
            loading: true,
            interval: 1,
            lock: lock,
            tips: {
                lock: 'Please do not get the verification code frequently',
                repeatClick: 'Please do not get the verification code frequently',
            },
            success: function(result) {
                if (result.code === "0000") {
                    current_uuid = result.data.uuid;
                    $("#LAY-user-get-vercode").attr("src", "data:image/png;base64," + result.data.img);
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(xhr, errMsg) {
                layer.msg(errMsg);
            }
        }).lock(function (event) {
            // 只在LAY-user-get-vercode点击时锁定
            if ($(event.target).is('#LAY-user-get-vercode')) {
                return 'click';
            }
            return false;
        });
    };

    getValidateCode();

    form.render();

    $("#LAY-user-get-vercode").on('click', function() {
        getValidateCode();
    });

    // 进入系统
    function goToSystem() {
        var storage = layui.data(setter.tableName);
        if (storage.access_token) {
            // 设置最新的access_token
            httpHeader.set('Authorization', 'Bearer ' + storage.access_token);
            httpHeader.setup();
            // 当前登录路径
            var loginUrl = window.location.pathname;

            var url = '';
            var originUrl = getUrlSearchParams('originUrl') || '';
            if (originUrl != '') {
                url = originUrl;
                if (url != '' && url.substring(0, loginUrl.length) != loginUrl) {
                    layui.data(setter.tableName, {
                        key: 'redirectTo',
                        value: url
                    });
                }
            } else if ((typeof($.cookie('makroDigital_url')) == "string")) {
                url = $.cookie('makroDigital_url');
                if (url != '' && url.substring(0, loginUrl.length) != loginUrl) {
                    layui.data(setter.tableName, {
                        key: 'redirectTo',
                        value: url
                    });
                    layui.data(setter.tableName, {
                        key: 'targetType',
                        value: 'back'
                    });
                }
            }
            if (url.substring(0, loginUrl.length) == loginUrl) {
                url = '';
            }
            // console.log('url', url);
            
            // 修复cookie数据
            $.cookie('makroDigital_token', storage.access_token);
            $.cookie('makroDigital_username', storage.username);

            // 当前页面是子页面时，跳转到原子页面地址
            if (self != top && url != null && url != '') {
                layui.data(setter.tableName, {
                    key: 'permissions'
                    ,remove: true
                });
                // 重载权限
                layui.common.permission.reload(true);
                var time = 0;
                var interval = setInterval(function() {
                    storage = layui.data(setter.tableName);
                    if (storage.permissions || time >= 10000) {
                        console.log('获取权限耗时：' + time + 'ms');
                        window.location.replace(url);
                        clearInterval(interval);
                    }
                    time += 10;
                }, 10);
            } else {
                window.location.replace('/makroDigital/index');
            }
        }
    }

    $(document).keydown(function() {
        if (event.keyCode == 13) { //回车键的键值为13
            switch (enterAction) {
                case 'login':
                    $("#LAY-user-login-submit").trigger("click");
                    break;
                case 'enterSystem':
                    goToSystem();
                    break;
            }
        }
    });

    //提交
    form.on('submit(LAY-user-login-submit)', function(obj) {
        // console.log(obj.field);
        var myData = {
            grant_type: 'captcha',
            refresh_token: 'true',
            scope: 'all',
            uuid: current_uuid,
            username: obj.field.username,
            password: obj.field.password,
            validateCode: obj.field.validateCode,
        };

        var lock = AjaxRequest({
            url: getApiUrl('login.auth') + '?' + $.param(myData),
            method: getApiMethod('login.auth'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Basic ' + window.btoa("mall-admin-web:123456"),
            },
            loading: true,
            interval: 0.5,
            success: function(result) {
                if (result.code === "0000") {
                    layui.data(setter.tableName, {
                        key: "access_token",
                        value: result.data.access_token
                    });
                    layui.data(setter.tableName, {
                        key: "username",
                        value: result.data.username
                    });

                    $.cookie('makroDigital_token', result.data.access_token);
                    $.cookie('makroDigital_username', result.data.username);

                    // 登入成功的提示与跳转
                    layer.msg('Success', {
                        offset: '15px',
                        icon: 1,
                        time: 1000
                    }, function() {
                        goToSystem();
                    });
                } else {
                    layer.msg(result.msg);
                    getValidateCode(lock);
                }
            },
            error: function(xhr, errMsg) {
                if (xhr.responseJSON) {
                    if (xhr.responseJSON.code === "0014") {
                        layer.msg("Username or Password was wroing!");
                        getValidateCode(lock);
                    }
                    if (xhr.responseJSON.code === "0021") {
                        layer.msg("Validate Code was wroing!");
                        getValidateCode(lock);
                    }
                    if (xhr.responseJSON.code === "0022") {
                        layer.msg("Verification code expired!");
                        getValidateCode(lock);
                    }
                } else {
                    layer.msg(errMsg);
                }
            }
        }).lock();

    });

});