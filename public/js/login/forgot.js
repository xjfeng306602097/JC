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

    $(document).keydown(function() {
        if (event.keyCode == 13) { //回车键的键值为13
            $("#LAY-user-forget-submit").trigger("click");
        }
    });

    //提交
    form.on('submit(LAY-user-forget-submit)', function(obj) {
        // console.log(obj.field);
        var myData = {
            username: obj.field.username,
        };

        AjaxRequest({
            url: getApiUrl('login.forgot') + '?' + $.param(myData),
            method: getApiMethod('login.forgot'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Basic ' + window.btoa("mall-admin-web:123456"),
            },
            loading: false,
            interval: 3,
            repeatTips: 'Please do not request frequently',
            success: function(result) {
                layer.msg(result.msg);
            },
            error: function(xhr, e) {
                layer.msg(e);
            }
        }).lock();

    });

});