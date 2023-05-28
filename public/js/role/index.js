/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroAdmin/role/index
    
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
    
    var current_name = '';
	function getRoleList(){
		table.render({
		    id: 'roleTable'
			,elem: '#content-role-list'
			,loading: true
			,even: true
			,url: getApiUrl('role.page')
			,method: getApiMethod('role.page')
			,headers: {'Authorization': 'Bearer ' + storage.access_token}
			,toolbar: true
            ,toolbar: '#roleToolbar'
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
				,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
				,{field:'name', width: 110, title: 'Name', fixed: 'left', sort: true }
				,{field:'code', width: 180, title: 'Code' }
				,{field:'sort', width: 180, title: 'Sort' }
				,{field:'status', width: 180, title: 'Status' }
				,{field:'id', width: 80, title: 'ID', sort: true }
			]],
			where: {
                name: current_name,
			},
			page: true,
			limit: 10,
			limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
		});
	}
	
	getRoleList();
	
	// 搜索
	form.on('submit(LAY-role-front-search)', function(obj) {
		var field = JSON.stringify(obj.field);
		var result = JSON.parse(field);
        current_name = result.name;
		getRoleList();
	});
	
	form.on('submit(LAY-role-front-reset)', function(obj){
        form.val('roleSearch', {
			name: '',
		});
		form.render();
        current_name = '';
        getRoleList();
    });
	
	//头工具栏事件
    table.on('toolbar(content-role-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch(obj.event){
        case "new":
    		var index_page = layer.open({
    			type: 2
    			,title: 'Add Role'
    			//,id:'newModule'
    			,content: '/makroDigital/role/add'
    			,maxmin: true
    			,area: ['600px', '480px']
    			,btn: ['Submit', 'Cancel']
    			,yes: function(index, layero){
    				var iframeWindow = window['layui-layer-iframe' + index]
    					,submitID = 'LAY-role-add-submit'
    					,submit = layero.find('iframe').contents().find('#'+ submitID);
    
    				// 监听提交
    				iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
    					var field = JSON.stringify(obj.field);
    					var result = JSON.parse(field);
    					
    					var mydata = {
    					    "code": result.code,
    						"name": result.name,
    						"sort": result.sort,
    						"status": "1"
    					};
    					$.ajax({
    						url: getApiUrl('role.add'),
    						type: getApiMethod('role.add'),
    						data: JSON.stringify(mydata),
    						headers: {
    						    "Content-Type": "application/json",
    						    "Authorization": 'Bearer ' + storage.access_token
    						},
    						success: function(result){
    							if (result.code==="0000"){
    								layer.msg(result.msg);
    								getRoleList();
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
    				,title: 'Edit Role - '+data[0].name
    				,id:'editData'
    				,content: '/makroDigital/role/edit/' + data[0].id
    				,maxmin: true
    				,area: ['600px', '480px']
    				,btn: ['Submit', 'Cancel']
    				,yes: function(index, layero){
    					var iframeWindow = window['layui-layer-iframe' + index],
    						submitID = 'LAY-role-edit-submit',
    						submit = layero.find('iframe').contents().find('#'+ submitID);
    
    					// 监听提交
    					iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
    						var field = JSON.stringify(obj.field);
    						var result = JSON.parse(field);
    
    						var mydata = {
    							"code": result.code,
        						"name": result.name,
        						"sort": result.sort,
        						// "status": "1"
    						};
    						$.ajax({
    							url: getApiUrl('role.update', {id: data[0].id}),
    							type: getApiMethod('role.update'),
    							data: JSON.stringify(mydata),
        						headers: {
        						    "Content-Type": "application/json",
        						    "Authorization": 'Bearer ' + storage.access_token
        						},
    							success: function(result) {
    								if (result.code === "0000") {
    									table.reload('roleTable'); //数据刷新
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
            
        case "permission":
            // 角色权限管理
            if (data.length==0) {
                layer.msg("Select one record");
            } else {
                var index_page = layer.open({
        			type: 2
        			,title: 'Permission of Role - '+data[0].name
        			,content: '/makroDigital/role/permission/'+data[0].id
        			,maxmin: true
        			,area: ['800px', '600px']
        			// ,btn: ['Submit', 'Cancel']
        			,yes: function(index, layero){
        				var iframeWindow = window['layui-layer-iframe' + index]
        					,submitID = 'LAY-role-permission-submit'
        					,submit = layero.find('iframe').contents().find('#'+ submitID);
        
        				submit.trigger('click');
        			}
        			
                });
                layer.full(index_page);
            }
            break;
        
        case "menu":
            // 角色菜单管理
            if (data.length==0) {
                layer.msg("Select one record");
            } else {
                var index_page = layer.open({
        			type: 2
        			,title: 'Menu of Role - '+data[0].name
        			//,id:'newModule'
        			,content: '/makroDigital/role/menu/'+data[0].id
        			,maxmin: true
        			,area: ['600px', '480px']
        			,btn: ['Submit', 'Cancel']
        			,yes: function(index, layero){
        				var iframeWindow = window['layui-layer-iframe' + index]
        					,submitID = 'LAY-role-menu-submit'
        					,submit = layero.find('iframe').contents().find('#'+ submitID);
        
        				// 监听提交
        				iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
        					var field = JSON.stringify(obj.field);
        					var result = JSON.parse(field);
        					
        					var arr = [];
        					$.each(result, function(i, o) {
        					    arr.push(o);
        					});
        					    
        					// console.log('result',arr);
        					var mydata = {
    							"menuIds": arr
    						};
    						$.ajax({
    							url: getApiUrl('role.updateMenus', {id: data[0].id}),
    							type: getApiMethod('role.updateMenus'),
    							data: JSON.stringify(mydata),
        						headers: {
        						    "Content-Type": "application/json",
        						    "Authorization": 'Bearer ' + storage.access_token
        						},
    							success: function(result) {
    								if (result.code === "0000") {
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
            
        }
        
    });
	
});