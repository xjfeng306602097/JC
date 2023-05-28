/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/memberType/add
    
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
    
    var storage = layui.data(setter.tableName);


});