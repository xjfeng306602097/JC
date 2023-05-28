/**

 @Name：makro 
 @Author：makro
 @Site：/user/info
    
 */
 
layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
	index: 'lib/index' //主入口模块
}).use(['index', 'layer', 'form'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form;
        
	var storage = layui.data(setter.tableName);    
    
    var current_param = getUrlRelativePath(4);
    
    // 获取当前ID数据
    function getUserInfo(i){
    	$.ajax({
    		url: getApiUrl('user.detail', {id: i}),
    		type: getApiMethod('user.detail'),
    		headers: {
    		    "Content-Type": "application/json",
    		    "Authorization": 'Bearer ' + storage.access_token
    		},
    		success: function (result) {
    		    // console.log(result);
    			form.val('userInfo', {
    				"username": result.data.username,
    				"nickname": result.data.nickname,
    				"phone": result.data.phone,
    				"email": result.data.email,
    			});
    	        
    			form.render();
    		}
    	}); 
    };
    
    getUserInfo(current_param);

});