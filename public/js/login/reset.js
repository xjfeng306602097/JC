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
    httpHeader.set('Authorization', null);// 去除Authorization
    httpHeader.setup();

    function getParamString() {
        var paramUrl = window.location.search.substring(1);
        var paramStrs = paramUrl.split('&');
        var params = {};
        for(var index = 0; index < paramStrs.length; index++) {
            params[paramStrs[index].split('=')[0]] = decodeURI(paramStrs[index].split('=')[1]);
        }
        return params;
    }
    let params = getParamString();
    // console.log(params);
    
    // 获取链接中的userName进行填充
    let username = params["username"];
    let token = params["token"];
    // 填充值
    $("#username").val(username);
    $("#token").val(token);

    form.render();

    $(document).keydown(function() {
        if (event.keyCode == 13) { //回车键的键值为13
            $("#LAY-user-login-submit").trigger("click");
        }
    });

    //提交
    form.on('submit(LAY-user-login-submit)', function(obj) {
        // console.log(obj.field);
        var req = {
            username: obj.field.username,
            password: obj.field.password,
            token: obj.field.token,
        }

        if (req.password !== obj.field.confirmPassword) {
            layer.msg("Password should be same with confirmPassword");
        }

        AjaxRequest({
            url: getApiUrl('login.reset'),
            method: getApiMethod('login.reset'),
            headers: {
                "Content-Type": "application/json"
            },
            loading: true,
            interval: 0.5,
            dataType: "json",
            data: JSON.stringify(req),
            success: function(res) {
                if (res.code === "0000") {
                    // 登入成功的提示与跳转
                    layer.msg('Success', {
                        offset: '15px',
                        icon: 1,
                        time: 1000
                    }, function() {
                        // 跳回登录页
                        $(location).attr('href', '/makroDigital/index');
                    });
                } else {
                    layer.msg(res.msg);
                }
            },
            error: function(e) {
                layer.msg("Error occurs, please contact with administrator");
            }
        }).lock();

    });

});