layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'layer', 'form'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form;
    
    var current_id = getUrlRelativePath(4);
    // console.log(current_id);
    
    var storage = layui.data(setter.tableName);
        
    // 获取当前ID数据
    $.ajax({
        url: getApiUrl('role.detail', {id: current_id}),
        type: getApiMethod('role.detail'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function (result) {
            // console.log(result.data);
            form.val('roleEdit', {
                "name": result.data.name,
                "code": result.data.code,
                "sort": result.data.sort,
            });
            form.render();
        }
    });
});