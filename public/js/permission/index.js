/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroAdmin/permission/index
    
 */
 
layui.config({
	base: '../layuiadmin/' //静态资源所在路径
}).extend({
	index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer'], function(){
	var $ = layui.$
	    ,setter = layui.setter
        ,permission = layui.common.permission
		,form = layui.form
		,laydate = layui.laydate
		,table = layui.table
		,layer = layui.layer;
	
	
    var storage = layui.data(setter.tableName);	
	
    var current_menuId = getUrlSearchParams('menu') || '';
	var current_name = '',
        current_btnPerm = '',
        current_urlPerm = '';
	
	function getPermissionList(){
		table.render({
		    id: 'permissionTable'
			,elem: '#content-permission-list'
			,loading: true
			,even: true
			,url: getApiUrl('permission.page')
			,method: getApiMethod('permission.page')
			,headers: {'Authorization': 'Bearer ' + storage.access_token}
			,toolbar: true
            ,toolbar: '#permissionToolbar'
			,defaultToolbar: ['filter','exports']
            ,parseData: function(res) {
                if (res.code==="0000"){
                    return {
                        code: 0,
                        count: res.data.total,
                        data: res.data.records
                    }
                }
            }
			,cols: [[
                {type:'radio',  width: 80, fixed: 'left' }
				,{width: 80, title: 'Serial', type: 'numbers' }
				,{field:'menuId', width: 100, title: 'MenuID', sort: true }
				,{field:'name', width: 300, title: 'Name', sort: true }
				,{field:'btnPerm', width: 240, title: 'btnPerm' }
				,{field:'urlPerm', minWidth: 300, title: 'urlPerm' }
				,{field:'id', width: 80, title: 'ID', sort: true }
			]],
			where:{
                menuId: current_menuId,
			    name: current_name,
                btnPerm: current_btnPerm,
                urlPerm: current_urlPerm,
			},
			page: true,
			limit: 10,
			limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                if (current_menuId == '') {
                    // $('button[lay-event="new"]').remove();
                }
                permission.render();
            }
		});
	}
	
	getPermissionList();
	
	// 搜索
	form.on('submit(LAY-permission-front-search)', function(obj) {
		var field = JSON.stringify(obj.field);
		var result = JSON.parse(field);

        current_name = result.name;
        current_btnPerm = result.btnPerm;
        current_urlPerm = result.urlPerm;
		getPermissionList();
	});
	
    form.on('submit(LAY-permission-front-reset)', function(obj){
        form.val('permissionSearch', {
			"name": '',
            "btnPerm": '',
            "urlPerm": '',
		});
		form.render();
        current_name = '';
        current_btnPerm = '';
        current_urlPerm = '';
        getPermissionList();
    });
	
	//头工具栏事件
    table.on('toolbar(content-permission-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch(obj.event){
        case "new":
    		var index_page = layer.open({
    			type: 2
    			,title: 'Add Permission'
    			//,id:'newModule'
    			,content: '/makroDigital/permission/add' + window.location.search
    			,maxmin: true
    			,area: ['600px', '480px']
    			,btn: ['Submit', 'Cancel']
    			,yes: function(index, layero){
    				var iframeWindow = window['layui-layer-iframe' + index]
    					,submitID = 'LAY-permission-add-submit'
    					,submit = layero.find('iframe').contents().find('#'+ submitID);
    
    				// 监听提交
    				iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
    					var field = JSON.stringify(obj.field);
    					var result = JSON.parse(field);
    					
    					var mydata = {
    					    "menuId": result.menuId,
    						"name": trim(result.name),
    						"btnPerm": trim(result.btnPerm),
    						"urlPerm": trim(result.urlPerm),
    					};
    					$.ajax({
    						url: getApiUrl('permission.add'),
    						type: getApiMethod('permission.add'),
    						data: JSON.stringify(mydata),
    						headers: {
    						    "Content-Type": "application/json",
    						    "Authorization": 'Bearer ' + storage.access_token
    						},
    						success: function(result){
    							if (result.code==="0000"){
    								layer.msg(result.msg);
    								getPermissionList();
    							} else {
    								layer.msg(result.msg);
    							}
    						}
    					});
    					layer.close(index_page);
    				});
    				submit.trigger('click');
    			}
    		});
    	    break;
    	    
    	case "edit":
            // 编辑
            if (data.length==0) {
                layer.msg("Select one record");
            } else {
    			var index_page = layer.open({
    				type: 2
    				,title: 'Edit Permission - '+data[0].name
    				,id:'editData'
    				,content: '/makroDigital/permission/edit/' + data[0].id
    				,maxmin: true
    				,area: ['600px', '480px']
    				,btn: ['Submit', 'Cancel']
    				,yes: function(index, layero){
    					var iframeWindow = window['layui-layer-iframe' + index],
    						submitID = 'LAY-permission-edit-submit',
    						submit = layero.find('iframe').contents().find('#'+ submitID);
    
    					// 监听提交
    					iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
    						var field = JSON.stringify(obj.field);
    						var result = JSON.parse(field);
    
    						var mydata = {
                                "menuId": result.menuId,
        						"name": trim(result.name),
        						"btnPerm": trim(result.btnPerm),
        						"urlPerm": trim(result.urlPerm),
    						};
    						$.ajax({
    							url: getApiUrl('permission.update', {id: data[0].id}),
    							type: getApiMethod('permission.update'),
    							data: JSON.stringify(mydata),
        						headers: {
        						    "Content-Type": "application/json",
        						    "Authorization": 'Bearer ' + storage.access_token
        						},
    							success: function(result) {
    								if (result.code === "0000") {
    									table.reload('permissionTable'); //数据刷新
    									layer.msg(result.msg);
    
    									layer.close(index_page); //关闭弹层
    								} else {
    									layer.msg(result.msg);
    								}
    							}
    						});
                            layer.close(index_page);
    					});
    					submit.trigger('click');
    				}
    			});
            }
            break;

        case 'delete':
            // 删除
            if (data.length==0) {
                layer.msg("Select one record");
            } else {
                var id = data[0].id;
                layer.confirm('Confirm for delete?', {
                    icon: 3,
                    title: 'Delete Permission',
                    btn: ['Submit', 'Cancel'],
                }, function(index) {
                    $.ajax({
                        url: getApiUrl('permission.delete', {ids: id}),
                        type: getApiMethod('permission.delete'),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                layer.msg(result.msg);
                                table.reload('permissionTable');
                            } else {
                                layer.msg(result.msg);
                            }
                        }
                    });
                });
            }
            break;
        }
    });
});