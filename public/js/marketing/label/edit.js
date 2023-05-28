/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingLabel/edit
    
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
        url: getApiUrl('marketing.label.detail', {id: current_id}),
        type: getApiMethod('marketing.label.detail'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code === "0000") {
                form.val('labelEdit', {
                    "classify": result.data.classify,
                    "type": result.data.type,
                    "name": result.data.name,
                    "value": result.data.value,
                    "sort": result.data.sort,
                });
                // 渲染选择器
                dict.render([
                    // label分类
                    { elem: 'select[name="classify"]', dictCode: 'label_classify', value: result.data.classify },
                    // label类型
                    { elem: 'select[name="type"]', dictCode: 'label_type', value: result.data.type },
                ]);
                form.render();
            } else {
                layer.msg(result.msg);
            }
        }
    });

});