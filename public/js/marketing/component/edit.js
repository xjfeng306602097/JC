/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingComponent/edit
    
 */

layui.config({
	base: '../../layuiadmin/' //静态资源所在路径
}).extend({
	index: 'lib/index' //主入口模块
}).use(['index', 'laydate', 'layer','form'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate=layui.laydate
        ,form = layui.form;
        
    var current_id = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);
    
    // 获取组件信息
    $.ajax({
        url: getApiUrl('marketing.component.detail', {code: current_id}),
        type: getApiMethod('marketing.component.detail'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code === "0000") {
                form.val('componentEdit', {
                    "name": result.data.name,
                    "type": result.data.type,
                });
                // 实现被禁用后的组件类型显示
                $('select[name=type]>option[disabled][value!='+result.data.type+']').remove();
                form.render();
            } else {
                layer.msg(result.msg);
            }
        }
    });
           
}); 