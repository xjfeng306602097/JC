layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
	index: 'lib/index', //主入口模块
    authtree: '../layui_exts/authTree/authTree',
}).use(['index', 'layer', 'form', 'authtree'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form
        ,authtree = layui.authtree;
    
    var current_id = getUrlRelativePath(4);
    // console.log(current_id);
    
    var storage = layui.data(setter.tableName);
        
    // 获取当前ID数据
    function getMenuTree(){
    	$.ajax({
    		url: getApiUrl('role.getMenusWithCheck', {id: current_id}),
    		type: getApiMethod('role.getMenusWithCheck'),
    		headers: {
    		    "Content-Type": "application/json",
    		    "Authorization": 'Bearer ' + storage.access_token
    		},
    		success: function (result) {
    		    // console.log('API',result.data);
    		    // 渲染时传入渲染目标ID，树形结构数据（具体结构看样例，checked表示默认选中），以及input表单的名字
                authtree.render('#LAY-auth-tree-index', result.data, {inputname: 'authids[]', layfilter: 'lay-check-auth', openall: true});
        	}
    	});
    };
    
    getMenuTree();
});