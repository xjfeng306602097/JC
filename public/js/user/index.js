/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/user/index
    
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
	
	getSelectOption('deptId',getApiUrl('department.table'),storage.access_token,'','');
	getSelectOption('roles',getApiUrl('role.list'),storage.access_token,'','');

    var now = new Date(),
        year = now.getFullYear(),
        month = now.getMonth() + 1,
        day = now.getDate();
    laydate.render({
        elem: '#loginTime'
        ,range: true
        ,value: ''
        ,trigger: 'click'
        ,min: '2021-01-01'
        ,max: year + '-' + month + '-' + day
        ,lang: 'en'
    });
	
	var current_nickname = '',
	    current_phone = '',
        current_deptId = '',
        current_roles = '',
	    current_status = 1,
        current_loginTimeStart = undefined,
        current_loginTimeEnd = undefined;

	function getUserList(){
		table.render({
		    id: 'userTable'
			,elem: '#content-user-list'
			,loading: true
			,even: true
			,url: getApiUrl('user.list')
			,method: getApiMethod('user.list')
			,headers: {'Authorization': 'Bearer ' + storage.access_token}
			,toolbar: true
            ,toolbar: '#userToolbar'
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
				,{field:'username', width: 110, title: 'Username', fixed: 'left', sort: true }
				,{field:'nickname', width: 180, title: 'Nickname', }
                ,{field:'email', width: 200, title: 'Email', }
				,{field:'phone', width: 120, title: 'Phone', }
				,{field:'lang', width: 100, title: 'Lang', }
				,{field:'loginNum', width: 120, title: 'login Num', sort: true }
				,{field:'lastLoginTime', width: 180, title: 'last Login Time', sort: true }
				,{field:'lastLoginIp', width: 140, title: 'last Login Ip', sort: true }
                ,{field:'deptName', width: 160, title: 'Dept', }
				,{field:'roleNames', width: 200, title: 'Role', }
				,{field:'id', width: 300, title: 'ID', sort: true, hide: true }
			]],
			where: {
			    nickname: current_nickname,
			    phone: current_phone,
                deptId: current_deptId,
                roles: current_roles,
			    status: current_status,
                lastLoginTimeStart: current_loginTimeStart,
                lastLoginTimeEnd: current_loginTimeEnd,
			},
			page: true,
			limit: 10,
			limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
		});
	}
	
	getUserList();
	
	// 搜索
	form.on('submit(LAY-user-front-search)', function(obj) {
		var field = JSON.stringify(obj.field);
		var result = JSON.parse(field);

        current_nickname = result.nickname;
        current_phone = result.phone;
        current_deptId = result.deptId;
        current_roles = result.roles;
        current_status = result.status;
        var loginTime = result.loginTime;
        if (loginTime === '') {
            current_loginTimeStart = undefined;
            current_loginTimeEnd = undefined;
        } else {
            var begin_end = loginTime.split(' - ');
            current_loginTimeStart = begin_end[0] + ' 00:00:00';
            current_loginTimeEnd = begin_end[1] + ' 23:59:59';
        }
		getUserList();
	});
    // 重置搜索
    form.on('submit(LAY-user-front-reset)', function(obj) {
        form.val('userSearch', {
            nickname: '',
            phone: '',
            deptId: '',
            roles: '',
            status: 1,
            loginTime: '',
        });
        form.render();
        current_nickname = '';
        current_phone = '';
        current_deptId = '';
        current_roles = '';
        current_status = 1;
        current_loginTimeStart = undefined;
        current_loginTimeEnd = undefined;
        getUserList();
    });
	
	//头工具栏事件
    table.on('toolbar(content-user-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch(obj.event){
        case "new":
            var index_page = layer.open({
    			type: 2
    			,title: 'Add User'
    			,id: 'addData'
    			,content: '/makroDigital/user/add'
    			,maxmin: true
    			,area: ['800px', '600px']
    			,btn: ['Submit', 'Cancel']
    			,yes: function(index, layero){
    				var iframeWindow = window['layui-layer-iframe' + index],
    					submitID = 'LAY-user-add-submit',
    					submit = layero.find('iframe').contents().find('#'+ submitID);
    
    				// 监听提交
    				iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
    					var field = JSON.stringify(obj.field);
    					var result = JSON.parse(field);
    			
                        // 获取role集合
                        var roleIds=[];
                        for (key in result){
                            if (key.indexOf("roleIds[")>-1){
                               var tmpKey=(key.replace("roleIds[","")).replace("]","");
                                roleIds.push(tmpKey);
                            }
                        }
                        // console.log(roleIds);
                        if (roleIds.length == 0) {
                            layer.msg("Select Role please!");
                            return;
                        }
                        
    					var mydata = {
    						"username": result.username,
    						"nickname": result.nickname,
    						"password": result.password,
    						"phone": result.phone,
    						"email": result.email,
    						"deptId": result.deptId,
    						"lang": result.lang,
    						"roleIds": roleIds,
    						"status": "1",
    						"delete": "0",
    					};
    					
    					// console.log(mydata);
    					$.ajax({
    						url: getApiUrl('user.add'),
    						type: getApiMethod('user.add'),
    						data: JSON.stringify(mydata),
    						headers: {
							    "Content-Type": "application/json",
							    "Authorization": 'Bearer ' + storage.access_token
							},
    						success: function(result) {
    							if (result.code === "0000") {
    								table.reload('userTable'); //数据刷新
    								// layer.msg(result.msg);
                                    layer.alert('Username: ' + mydata.username + ' Password: ' + mydata.password, {
                                        title: 'Notice',
                                        btn: ['Close'],
                                    });
    
    								layer.close(index_page); //关闭弹层
    							} else {
    								layer.msg(result.msg);
    							}
    						}
    					});
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
    				,title: 'Edit User '+data[0].username
    				,id:'editData'
    				,content: '/makroDigital/user/edit/' + data[0].id
    				,maxmin: true
    				,area: ['800px', '600px']
    				,btn: ['Submit', 'Cancel']
    				,yes: function(index, layero){
    					var iframeWindow = window['layui-layer-iframe' + index],
    						submitID = 'LAY-user-edit-submit',
    						submit = layero.find('iframe').contents().find('#'+ submitID);
    
    					// 监听提交
    					iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
    						var field = JSON.stringify(obj.field);
    						var result = JSON.parse(field);
    						
    						//console.log(result);
    						// 获取role集合
                            var roleIds=[];
                            for (key in result){
                                if (key.indexOf("roleIds[")>-1){
                                   var tmpKey=(key.replace("roleIds[","")).replace("]","");
                                    roleIds.push(tmpKey);
                                }
                            }
                            // console.log(roleIds);
                            if (roleIds.length == 0) {
                                layer.msg("Select Role please!");
                                return;
                            }
    
    						var mydata = {
    							// "username": result.username,
    							"nickname": result.nickname,
    							"phone": result.phone,
    						    "email": result.email,
    							"deptId": result.deptId,
    						    "lang": result.lang,
    							"roleIds": roleIds,
    						    "status": "1",
    						};
    						
    						$.ajax({
        						url: getApiUrl('user.update', {id: data[0].id}),
        						type: getApiMethod('user.update'),
    							data: JSON.stringify(mydata),
        						headers: {
    							    "Content-Type": "application/json",
    							    "Authorization": 'Bearer ' + storage.access_token
    							},
    							success: function(result) {
    								if (result.code === "0000") {
    									table.reload('userTable'); //数据刷新
    									layer.msg(result.msg);
    
    									layer.close(index_page); //关闭弹层
    								} else {
    									layer.msg(result.msg);
    								}
    							}
    						});
    
    					});
    					submit.trigger('click');
    				}
    			});
            }
            break;
        case "password":
            // 修改密码
            if (data.length==0) {
                layer.msg("Select on record");
            } else {
    			var index_page = layer.open({
    				type: 2
    				,title: 'Edit Password - '+data[0].username
    				,id:'editPassword'
    				,content: '/makroDigital/user/password/' + data[0].id+','+data[0].username
    				,maxmin: true
    				,area: ['680px', '400px']
    				,btn: [ ]
    				,yes: function(index, layero){
    					var iframeWindow = window['layui-layer-iframe' + index],
    						submit = layero.find('iframe').contents().find('#'+ submitID);

    				}
    			});
            }
            break;
        
        // 删除 未启用    
        case "delete":
            if (data.length==0) {
                layer.msg("请选择一条记录");
            } else {
                layer.confirm('您确认删除吗？删除后将不可恢复！', {
    				btn: ['确定', '取消'] //按钮
    			}, function () {
                	var mydata = {
    					"dataID": data[0].dataID
    				};
    				$.ajax({
    					url: "/makroAdmin/m/userAdmin/delete",
    					type: "POST",
    					data: mydata,
    					success: function (result) {
    						var result = JSON.parse(result);
    						if (result.code === 0) {
    							table.reload('userTable'); //数据刷新
    							layer.msg(result.msg);
    						} else {
    							layer.msg(result.msg);
    						}
    					}
    				});
    			}, function () {
    				layer.close();
    			});
            }
            break;
            
        // 关闭账号
        case 'close':
            if (data.length==0) {
                layer.msg("请选择一条记录");
            } else {
                layer.confirm('Are you sure you want to close this user account?', {
                    icon: 5,
                    title: 'Close User Account',
                    btn: ['Submit', 'Cancel'] //按钮
                }, function () {
                    var mydata = {
            			"status": 0
            	    };
            	    $.ajax({
    					url: getApiUrl('user.text', {id: data[0].id}),
    					type: getApiMethod('user.text'),
    					data: JSON.stringify(mydata),
    					headers: {
    					    "Content-Type": "application/json",
    					    "Authorization": 'Bearer ' + storage.access_token
    					},
            			success: function(result){
            				if (result.code ==="0000") {
            					layer.msg(result.msg);
            					table.reload('userTable');
            				}else{
            					layer.msg(result.msg);
            				}
            			}
            		});
                });
            }
            break;
            
        // 启用账号
        case 'enable':
            if (data.length==0) {
                layer.msg("请选择一条记录");
            } else {
                layer.confirm('Are you sure you want to enable this user account?', {
                    icon: 3,
                    title: 'Enable User Account',
                    btn: ['Submit', 'Cancel'] //按钮
                }, function () {
                    var mydata = {
                        "status": 1
                    };
                    $.ajax({
                        url: getApiUrl('user.text', {id: data[0].id}),
                        type: getApiMethod('user.text'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result){
                            if (result.code ==="0000") {
                                layer.msg(result.msg);
                                table.reload('userTable');
                            }else{
                                layer.msg(result.msg);
                            }
                        }
                    });
                });
            }
            break;
            
        // 日志
        case "log":
            var title = 'User Log';
            var userID = '';
            if (data.length > 0) {
                title = 'User Log - ' + data[0].username;
                userID = data[0].id;
            }
        	var index_page = layer.open({
    			type: 2
    			,title: title
    			,id: 'userLog'
    			,content: '/makroDigital/user/log/' + userID
    			,shade: 0
    			,maxmin: true
    			,area: ['480px', '400px']
    		});
    		layer.full(index_page);
            break;
            
        }
    });
});