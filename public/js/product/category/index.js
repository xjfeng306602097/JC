/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/productCategory/index
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
    treeTable: '../layui_exts/treeTable/treeTable'
}).use(['index', 'common', 'layer', 'form', 'table', 'laytpl', 'treeTable', 'dict'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,layer = layui.layer
        ,form = layui.form
        ,table = layui.table
        ,laytpl = layui.laytpl
        ,treeTable = layui.treeTable
        ,dict = layui.dict;

    var storage = layui.data(setter.tableName);
    
    var levels = {};
    // 请求 [商品类别层级] 字典列表
    dict.request({
        dictCode: 'product_category',
        success: function (res) {
            if (res.code === '0000') {
                for (var x in res.data) {
                    var item = res.data[x];
                    levels[item.value] = item.name;
                }
            }
            // 载入商品类别层级后再渲染table
            getProductCategoryList();
        }
    });

    var current_name = '',
        current_status = '';
    function getProductCategoryList() {
        $.ajax({
            url: getApiUrl('product.category.table') + '?hasChild=false',
            type: getApiMethod('product.category.table'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: {
                name: current_name,
                status: current_status,
            },
            success: function(result) {
                if (result.code === "0000") {
                    var list = result.data;
                    if (current_status != '' || current_name != '') {
                        for (var x in list) {
                            list[x].parent = '000000';
                        }
                        getList(list, 'parent');
                    } else {
                        getList(list, 'parentCode');
                    }
                } else if (result.code === "0017" || result.code === "0018") {
                    window.location.replace('/makroDigital/login');
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }

    function getList(data, parent_key) {
        var re = treeTable.render({
            id: 'treeTable',
            elem: '#content-productCategory-list',
            data: data,
            primary_key: 'code',
            parent_key: parent_key,
            icon_key: 'name',
            treeDefaultClose: false,
            is_checkbox: false,
            checked: {
                key: 'id',
                data: [],
            },
            end: function(e) {
                permission.render();
                form.render('checkbox');
            },
            cols: [
	            { title: 'Action', align: 'center', width: '200px', fixed: 'left', template: function(item) {
                    return $('#content-productCategory-list-action').html();
	            }}
	            ,{ key: 'name', width: '200px', title: 'Name', fixed: 'left' }
                ,{ width: '120px', title: 'Level', align: 'center', template: function(item) {
                    // var level = item.level + 1;
                    var level = getCharCount(item.treePath, ',') + 1;
                    return levels[level] === undefined ? 'Unknown' : levels[level];
                }}
	            ,{ key: 'code', width: '80px', title: 'Code', align: 'center' }
	            ,{ key: 'sort', width: '80px', title: 'Sort', align: 'center' }
	            ,{ key: 'status', width: '80px', title: 'Status', align: 'center', template: function(item) {
                    var html = $('#content-productCategory-list-status').html();
                    item.permission = permission.verify('product:category:switchStatus');
                    laytpl(html).render(item, function (content) {
                        html = content;
                    });
                    return html;
                }}
	            ,{ key: 'parentCode', width: '80px', title: 'Parent Code', align: 'center' }
	            ,{ key: 'id', width: '80px', title: 'ID', align: 'center' }
            ]
        });
        form.render('checkbox');
    }
    
    // 搜索
    form.on('submit(LAY-productCategory-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_name = result.name;
        current_status = result.status;
        getProductCategoryList();
    });
    // 重置搜索
    form.on('submit(LAY-productCategory-front-reset)', function(obj) {
        form.val('categorySearch', {
            name: '',
            status: '',
        });
        form.render();
        current_name = '';
        current_status = '';
        getProductCategoryList();
    });

	$("#productCategory-add-button").on("click",function(){
		var index_page = layer.open({
			type: 2,
			title: 'Add Category',
			id:'addCategory',
			content: '/makroDigital/productCategory/add/',
			maxmin: true,
			area: ['600px', '480px'],
			btn: ['Submit', 'Cancel'],
			yes: function(index, layero) {
				var iframeWindow = window['layui-layer-iframe' + index]
					,submitID = 'LAY-productCategory-add-submit'
					,submit = layero.find('iframe').contents().find('#' + submitID);

				// 监听提交
				iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
					var field = JSON.stringify(obj.field);
					var result = JSON.parse(field);
					
					var mydata = {
                        "parentCode": result.parentCode,
                        "name": result.name,
                        "code": result.code,
                        "sort": result.sort,
                        "status": 1,
					};
					$.ajax({
						url: getApiUrl('product.category.add'),
						type: getApiMethod('product.category.add'),
						data: JSON.stringify(mydata),
						headers: {
						    "Content-Type": "application/json",
						    "Authorization": 'Bearer ' + storage.access_token
						},
						success: function(result) {
							if (result.code === "0000") {
								layer.msg(result.msg);
								getProductCategoryList();
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
	});

	// 监听自定义
    treeTable.on('tree(add)', function(obj) {
        var field = JSON.stringify(obj);
        var data = JSON.parse(field);
        var index_page = layer.open({
            type: 2,
            title: 'Add Category',
            id: 'addCategory',
            content: '/makroDigital/productCategory/add/' + data.item.code,
            maxmin: true,
            area: ['600px', '480px'],
            btn: ['Submit', 'Cancel'],
            yes: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index],
                    submitID = 'LAY-productCategory-add-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);
                // 监听提交
                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
                    var mydata = {
                        "parentCode": result.parentCode,
                        "name": result.name,
                        "code": result.code,
                        "sort": result.sort,
                        "status": 1,
                    };
                    $.ajax({
                        url: getApiUrl('product.category.add'),
                        type: getApiMethod('product.category.add'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                layer.msg(result.msg);
                                getProductCategoryList();
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
    });

    treeTable.on('tree(edit)', function(obj) {
        var field = JSON.stringify(obj);
        var data = JSON.parse(field);
        // console.log(data.item.id);
        // 修改
        var index_page = layer.open({
            type: 2,
            title: 'Edit Category - ' + data.item.name,
            id: 'editCategory',
            content: '/makroDigital/productCategory/edit/' + data.item.id,
            maxmin: true,
            area: ['600px', '480px'],
            btn: ['Submit', 'Cancel'],
            yes: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index],
                    submitID = 'LAY-productCategory-edit-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);
                // 监听提交
                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
                    var mydata = {
                        "parentCode": result.parentCode,
                        "name": result.name,
                        "code": result.code,
                        "sort": result.sort,
                    };
                    $.ajax({
                        url: getApiUrl('product.category.update', {id: data.item.id}),
                        type: getApiMethod('product.category.update'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                layer.msg(result.msg);
                                getProductCategoryList();
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
    });

    treeTable.on('tree(del)', function(obj) {
        var field = JSON.stringify(obj);
        var data = JSON.parse(field);
        layer.confirm('Confirm for delete？', {
            icon: 3,
            title: 'Delete Category',
            btn: ['Submit', 'Cancel'],
        }, function(index) {
            $.ajax({
                url: getApiUrl('product.category.delete', {ids: data.item.id}),
                type: getApiMethod('product.category.delete'),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + storage.access_token
                },
                success: function(result) {
                    if (result.code === "0000") {
                        layer.msg(result.msg);
                        getProductCategoryList();
                    } else {
                        layer.msg(result.msg);
                    }
                }
            });
        });
    });

    // 监听开关事件
    form.on('switch(switchStatus)', function(obj) {
        var id = obj.value;
        var status = this.checked ? 1 : 0;
        var data = {
            status: status,
        };
        $.ajax({
            url: getApiUrl('product.category.update', {id: id}),
            type: getApiMethod('product.category.update'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: JSON.stringify(data),
            success: function(result) {
                if (result.code === "0000") {
                    layer.msg(result.msg);
                } else {
                    obj.elem.checked = !status;
                    form.render('checkbox');
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                obj.elem.checked = !status;
                form.render('checkbox');
                layer.msg('切换失败');
                console.log(e);
            }
        });
    });

});