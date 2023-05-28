/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/dict/add
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'laydate', 'layer', 'form'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form;
    
    var storage = layui.data(setter.tableName);

    init();

    form.verify({
        number: function(value, item) {
            var reg = /^[0-9]*$/;
            if (value && !reg.test(value)) {
                return 'Only allow to fill in pure numbers';
            }
        },
    });

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