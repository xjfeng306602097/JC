/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/user/add
    
 */

layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'laydate', 'table', 'layer'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer;

    var storage = layui.data(setter.tableName);

    getSelectOption('deptId', getApiUrl('department.table'), storage.access_token, '', '');

    getMultipleOption('roleIds', getApiUrl('role.list'), storage.access_token, '', '');

    /* 自定义验证规则 */
    form.verify({
        pass: [/(.+){8,16}$/, '密码必须8到16位'],
        role: function(value) {
            if (value == -1) {
                return 'Select Role!';
            }
        },
        dept: function(value) {
            if (value == -1) {
                return 'Select Department!';
            }
        },
    });

    init();

    //初始化页面
    function init() {
        // 载入lang后再依次载入其他数据
        loadLangList(null, function() {
            
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