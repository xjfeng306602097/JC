/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingComponent/add
    
 */

layui.config({
	base: '../../layuiadmin/' //静态资源所在路径
}).extend({
	index: 'lib/index' //主入口模块
}).use(['index', 'laydate', 'layer','form'], function(){
    var $ = layui.$
        ,layer = layui.layer
        ,laydate=layui.laydate
        ,form = layui.form;

    /* 自定义验证规则 */
    form.verify({
        
		type: function(value){
	        if(value==-1){
				return 'Select Type!';
			}
		},
    });        
}); 