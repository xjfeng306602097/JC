/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/product/add
    
 */
 
layui.config({
	base: '../layuiadmin/' //静态资源所在路径
}).extend({
	index: 'lib/index', //主入口模块
}).use(['index', 'form', 'layer'], function(){
	var $ = layui.$
	    ,setter = layui.setter
		,form = layui.form
		,layer = layui.layer;
	
	var storage = layui.data(setter.tableName);



});