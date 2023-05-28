/**

 @Name：layuiAdmin 公共业务
 
 
 @License：LPPL
    
 */
 
layui.define(['http'], function(exports){
    var $ = layui.$
        ,layer = layui.layer
        ,laytpl = layui.laytpl
        ,setter = layui.setter
        ,view = layui.view
        ,admin = layui.admin
        ,table = layui.table
        ,http = layui.http;

    //公共函数可以写在此处，任何页面都会包含
    //……
    
    var storage = layui.data(setter.tableName);
    
    /* table全局设置 */
    // if (storage.access_token) {
    //     layui.table.set({
    //         headers: {'Authorization': 'Bearer ' + storage.access_token},
    //         parseData: function(res) {  // 利用parseData实现预处理
    //             if(res.code == 401) {
    //                 // setter.removeToken();
    //                 layui.layer.msg('登录过期', {icon: 2, anim: 6, time: 1500}, function () {
    //                     window.location.replace('/makroDigital/login');
    //                 });
    //             }
    //             return res;
    //         }
    //     });
    // }
    
    var permission = {
        // 是否已成功初始化权限列表
        initialized: false,
        config: {
            // 在权限发生变动后重新渲染页面，用于保证页面显示的及时性
            reRenderAfterUpdate: function () {
                // 重载table
                var ids = Object.keys(table.cache);
                if (ids.length > 0) {
                    for (var x in ids) {
                        table.reload(ids[x]);
                    }
                }
            },
        },
        isDisabled: function() {
            return $('body').attr('permission-verify') == 'disabled' || $('body').attr('permission-verify') == 'false';
        },
        init: function() {
            if (permission.initialized) {
                return false;
            }
            permission.initialized = true;
            storage = layui.data(setter.tableName);
            if (permission.isDisabled()) {
                $(document).find('[permission]').attr('permission', null);
            } else {
                permission.render();
            }
        },
        // 解析权限
        parse: function(value) {
            var checkReg = /^\[([\w-]+)\]([\w-]+)$/;
            var array = value.match(checkReg);
            if (array !== null && array.length > 0 && array[1] && array[2]) {
                var type = array[1];
                var key = array[2];
                if (storage[type] && storage[type][key]) {
                    value = storage[type][key];
                }
            }
            return value;
        },
        // 验证权限
        verify: function (value) {
            if (permission.isDisabled()) {
                return true;
            }
            var permissions = storage.permissions || [];
            if (permissions.length > 0) {
                if (typeof value === 'string') {
                    if (value === '') {
                        return true;
                    }
                    if (value.indexOf(',') !== -1) {
                        var reg = new RegExp('([^\S\n\r\t]+,)|(,[^\S\n\r\t]+)', 'g');
                        value = value.replace(reg, ',').split(',');
                    } else {
                        value = permission.parse(value);
                        if (permissions.indexOf(value) !== -1) {
                            return true;
                        }
                    }
                }
                if (Array.isArray(value)) {
                    var n = 0;
                    for (var i in value) {
                        value[i] = permission.parse(value[i]);
                        if (value[i] !== '' && permissions.indexOf(value[i]) === -1) {
                            break;
                        }
                        ++n;
                    }
                    if (n == value.length) {
                        return true;
                    }
                }
            }
            return false;
        },
        // 检查存在的权限数量。返回值：=0未找到任何权限，其他值为符合的权限数量
        exist: function(value) {
            if (permission.isDisabled()) {
                return 1;
            }
            var permissions = storage.permissions || [];
            if (permissions.length > 0) {
                if (typeof value === 'string') {
                    if (value === '') {
                        return 0;
                    }
                    if (value.indexOf(',') !== -1) {
                        var reg = new RegExp('([^\S\n\r\t]+,)|(,[^\S\n\r\t]+)', 'g');
                        value = value.replace(reg, ',').split(',');
                    } else {
                        value = permission.parse(value);
                        if (permissions.indexOf(value) !== -1) {
                            return 1;
                        }
                    }
                }
                if (Array.isArray(value)) {
                    var n = 0;
                    for (var i in value) {
                        if (value[i] === '') {
                            continue;
                        }
                        value[i] = permission.parse(value[i]);
                        if (permissions.indexOf(value[i]) !== -1) {
                            ++n;
                        }
                    }
                    return n;
                }
            }
            return 0;
        },
        render: function () {
            var permissions = storage.permissions;
            if (Array.isArray(permissions)) {
                $(document).find('[permission]').each(function() {
                    var value = $(this).attr('permission');
                    if (permission.verify(value)) {
                        $(this).attr('permission', null);
                    } else {
                        $(this).remove();
                    }
                });
            }
        },
        reload: function(force) {
            if (!permission.isDisabled()) {
                if (force === true) {
                    http.request({
                        url: getApiUrl('user.detail', { id: 'me' }),
                        type: getApiMethod('user.detail'),
                        headers: {
                            "Content-Type": "application/json"
                        },
                        success: function (result) {
                            if (result.code == '0000') {
                                var permissions = result.data.perms;
                                layui.data(setter.tableName, {
                                    key: "permissions",
                                    value: permissions
                                });
                                storage = layui.data(setter.tableName);
                                permission.render();
                                // 异步时，调用reRenderAfterUpdate方法重载
                                permission.config.reRenderAfterUpdate();
                            } else {
                                storage.permissions = [];
                                permission.render();
                            }
                        },
                        error: function(e) {
                            console.log(e);
                            storage.permissions = [];
                            permission.render();
                        }
                    });
                } else {
                    permission.render();
                }
            }
        },
    };

    // 初始化httpHeader
    var httpHeader = http.header();

    //退出
    admin.events.logout = function(){
        //执行退出接口
        var storage = layui.data(setter.tableName);
        
        if (storage.access_token) {
            var exit = function() {
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
                    key: 'httpHeader'
                    ,remove: true
                });
                
                layui.data(setter.tableName, {
                    key: 'ajaxCache'
                    ,remove: true
                });
                $.removeCookie('makroDigital_token');
                $.removeCookie('makroDigital_username');
                $.removeCookie('makroDigital_url');
                
                admin.exit(function(){
                    window.location.replace('/makroDigital/login'); //后台主页
                });
            };
            $.ajax({
                url: getApiUrl('login.logout'),
                type: getApiMethod('login.logout'),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + storage.access_token
                },
                statusCode: {
                    403: exit,
                },
                success: function(result) {
                    if (result.code === "0000") {
                        exit();
                    } else {
                        layui.msg(result.msg);
                    }
                }
            });
        
        } else {
            window.location.replace('/makroDigital/login');
        }
    
    };

  
    //对外暴露的接口
    exports('common', {
        permission: permission,
        httpHeader: httpHeader,
    });
});