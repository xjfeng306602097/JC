/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/store/edit
    
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

    form.verify({
        number: function(value, item) {
            var reg = /^[0-9]*$/;
            if (value && !reg.test(value)) {
                return 'Only allow to fill in pure numbers';
            }
        },
    });

    var current_id = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    // 获取组件信息
    $.ajax({
        url: getApiUrl('store.detail', {id: current_id}),
        type: getApiMethod('store.detail'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code === "0000") {
                form.val('storeEdit', {
                    "name": result.data.name,
                    "code": result.data.code,
                    "sort": result.data.sort,
                });
            } else {
                layer.msg(result.msg);
            }
        }
    });

});