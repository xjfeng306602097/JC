/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingSize/add
    
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

});