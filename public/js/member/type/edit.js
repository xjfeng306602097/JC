/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/memberType/edit
    
 */

layui.config({
	base: '../../layuiadmin/' //静态资源所在路径
}).extend({
	index: 'lib/index' //主入口模块
}).use(['index', 'layer', 'form', 'dict'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form
        ,dict = layui.dict;
        
    var current_id = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);
    
    // 获取字体信息
    $.ajax({
        url: getApiUrl('member.type.detail', {id: current_id}),
        type: getApiMethod('member.type.detail'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code === "0000") {
                form.val('memberTypeEdit', {
                    "nameEn": result.data.nameEn,
                    "nameTh": result.data.nameTh,
                });
                form.render();
            } else {
                layer.msg(result.msg);
            }
        }
    });

});