layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'layer', 'form'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form;

    var current_id = getUrlRelativePath(4);
    // console.log(current_id);

    var storage = layui.data(setter.tableName);

    init();

    //初始化页面
    function init() {
        // 载入lang后再依次载入其他数据
        loadLangList(null, function() {
            // 获取当前ID数据
            $.ajax({
                url: getApiUrl('user.detail', { id: current_id }),
                type: getApiMethod('user.detail'),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + storage.access_token
                },
                success: function(result) {
                    // console.log(result);
                    form.val('userEdit', {
                        "username": result.data.username,
                        "nickname": result.data.nickname,
                        "phone": result.data.phone,
                        "email": result.data.email,
                        "lang": result.data.lang,
                    });

                    getSelectOption('deptId', getApiUrl('department.table'), storage.access_token, '', result.data.deptId);

                    getMultipleOption('roleIds', getApiUrl('role.list'), storage.access_token, '', result.data.roleIds);

                    form.render();
                }
            });
        });
    }

    // 载入语言版本数据
    var __loadLangList_fail_number = 0;
    function loadLangList(data, success) {
        $.ajax({
            url: getApiUrl('lang.list'),
            type: getApiMethod('lang.list'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: data,
            success: function(result) {
                __loadLangList_fail_number = 0;
                if (result.code === "0000") {
                    var list = result.data;
                    if (list != null && list.length > 0) {
                        var _Html = '<option value="">Select</option>';
                        $.each(list, function(index, value) {
                            var langCode = list[index];
                            var lang = list[index].replace('_', '-');
                            _Html += '<option value="' + langCode + '">' + lang + '</option>';
                        });
                        $("select[name=lang]").html(_Html);
                        form.render();
                    }
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__loadLangList_fail_number;
                console.log('loadLangList: 网络错误！');
                if (__loadLangList_fail_number < 3) {
                    setTimeout(function() {
                        loadLangList(data, success);
                    }, 100);
                } else {
                    console.log('loadLangList: 已累计3次请求失败');
                }
            }
        });
    }

});