/**

 @Name：makro 
 @Author：makro
 @Site：/user/password
    
 */

layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'layer', 'form'], function() {
    var $ = layui.$,
        setter = layui.setter,
        layer = layui.layer,
        form = layui.form;

    var storage = layui.data(setter.tableName);

    var current_param = getUrlRelativePath(4);
    if (current_param === "me") {
        getUserInfo(current_param);
    } else {
        var _arr = current_param.split(',');

        var current_id = _arr[0],
            current_username = _arr[1];

        getUserInfo(current_id);
    }


    // 获取当前ID数据
    function getUserInfo(i) {
        $.ajax({
            url: getApiUrl('user.detail', { id: i }),
            type: getApiMethod('user.detail'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                // console.log(result);
                if (i == 'me') {
                    current_id = result.data.id;
                    current_username = result.data.username;
                }

                form.val('userPassword', {
                    "username": current_username,
                });

                form.render();
            }
        });
    }


    /* 自定义验证规则 */
    form.verify({
        pass: [
            /^[\S]{8,16}$/, '密码必须8到16位，且不能出现空格'
        ],
        repass: function(value) {
            var repassvalue = $('#repassword').val();
            if (value != repassvalue) {
                return '两次输入的密码不一致!';
            }
        }
    });


    form.on('submit(LAY-user-password-submit)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);

        var mydata = {
            "password": result.password,
            "status": "1",
        };
        $.ajax({
            url: getApiUrl('user.text', { id: current_id }),
            type: getApiMethod('user.text'),
            data: JSON.stringify(mydata),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                if (result.code === "0000") {
                    layer.msg(result.msg);
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    });

});