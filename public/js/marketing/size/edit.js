/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingSize/edit
    
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

    //表单form值验证
    form.verify({
        //最小值验证
        minValue: function(value) {
            if (value * 1 <= 0) {
                return 'Cannot be empty or less than 0!';
            }
        },
    });
    
    // 获取字体信息
    $.ajax({
        url: getApiUrl('marketing.size.detail', {id: current_id}),
        type: getApiMethod('marketing.size.detail'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code === "0000") {
                form.val('sizeEdit', {
                    "name": result.data.name,
                    "width": result.data.width,
                    "height": result.data.height,
                    "remark": result.data.remark,
                });
            } else {
                layer.msg(result.msg);
            }
        }
    });
           
}); 