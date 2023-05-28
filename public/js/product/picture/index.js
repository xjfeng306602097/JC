/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroAdmin/productPicture/index
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer', 'upload', 'uploadAPI'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer
        ,upload = layui.upload
        ,uploadAPI = layui.uploadAPI;
    
    var storage = layui.data(setter.tableName);
    
    var param = getUrlRelativePath(4);
    $('#pictureSearch input[name="itemCode"]').val(param);

    var current_itemCode = param;
    
    function getProductPictureList(){
        var mydata = {
            req: {
                itemCode: current_itemCode,
            },
            sortItems: [
                {
                    column: "gmtCreate",
                    asc: false
                },
            ],
        };
		table.render({
		    id: 'productPictureTable'
			,elem: '#content-productPicture-list'
			,loading: true
			,even: true
			,url: getApiUrl('product.picture.page')
			,method: getApiMethod('product.picture.page')
			,headers: {'Authorization': 'Bearer ' + storage.access_token}
			,contentType: "application/json"
			,toolbar: true
            ,toolbar: '#productPictureToolbar'
			,defaultToolbar: ['filter']
            ,parseData: function(res) {
                // 重新渲染upload
                uploadPicture();
                if (res.code === "0000") {
                    var data = [];
                    for (var x in res.data.records) {
                        var item = res.data.records[x].basicInfo;
                        for (var key in res.data.records[x]) {
                            if (key != 'basicInfo') {
                                item[key] = res.data.records[x][key];
                            }
                        }
                        data.push(item);
                    }
                    return {
                        code: 0,
                        count: res.data.total,
                        data: data
                    }
                }
            }
			,cols: [[
			    {type:'radio',  width: 80 }
                ,{width: 80, title: 'Serial', type: 'numbers' }
				,{field:'defaulted', width: 130, title: 'Default', templet: function(res) {
                    return res.defaulted == 1 ? 'yes' : 'no';
                }}
				,{field:'itemCode', width: 140, title: 'Item Code' }
				,{field:'thumbnailPath', minWidth: 130, title: 'Picture', templet: imgTpl }
                ,{field:'creator', width: 160, title: 'Creator' }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true, hide: true }
				,{field:'id', width: 80, title: 'ID', sort: true }
			]]
			,where: mydata
			,page: true
			,limit: 10
			,limits: [10, 20, 30, 50, 100],
            renderAfter: function() {
                permission.render();
            }
		});
	}
	
	getProductPictureList();

    // 上传接口
    function uploadPicture() {
        var files = {};
        var uploadRender = upload.render({
            elem: '#upload',
            url: getApiUrl('file.uploadImage'),
            method: getApiMethod('file.uploadImage'),
            field: api('file.uploadImage').file.field,
            headers: {
                'Authorization': 'Bearer ' + storage.access_token
            },
            accept: 'file',
            exts: api('file.uploadImage').file.exts,
            choose: function(obj) {
                //将每次选择的文件追加到文件队列
                files = obj.pushFile();
            },
            done: function(res, index, upload) {
                delete files[index];
                if (res.code === '0000') {
                    var imageData = res.data;
                    var mydata = {
                        itemCode: current_itemCode,
                        defaulted: 1,
                        filePath: JSON.stringify(imageData),
                    };
                    $.ajax({
                        url: getApiUrl('product.picture.add'),
                        type: getApiMethod('product.picture.add'),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        data: JSON.stringify(mydata),
                        success: function(res) {
                            if (res.code === '0000') {
                                table.reload('productPictureTable');
                            } else {
                                console.log('插入商品图片数据失败');
                                uploadAPI.cancel([imageData.originPath, imageData.thumbnailPath]);
                            }
                        },
                        error: function(e) {
                            console.log(e);
                        }
                    });
                } else {
                    layer.msg(res.msg);
                }
            },
            error: function() {
                delete files[index];
                layer.msg('upload failed', {icon: 5});
            }
        });
    }
    
    // 搜索
    form.on('submit(LAY-productPicture-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);

        current_itemCode = result.itemCode || undefined;
        getProductPictureList();
    });
    // 重置搜索
    form.on('submit(LAY-productPicture-front-reset)', function(obj) {
        form.val('pictureSearch', {
            itemCode: param || '',
        });
        form.render();
        current_itemCode = param;
        getProductPictureList();
    });
	
	//头工具栏事件
    table.on('toolbar(content-productPicture-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            case "batchUpload":
                // 批量上传
                var index_page = layer.open({
                    type: 2
                    ,title: 'Batch Upload Picture'
                    ,id: 'batchUpload'
                    ,content: '/makroDigital/productPicture/batch'
                    ,maxmin: true
                    ,area: ['900px', '700px']
                    ,btn: ['Upload', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-picture-batchUpload-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
                        
                        // 监听提交
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);

                            if (result.number == 0) {
                                layer.msg('Please add files first');
                            }
                        });
                        submit.trigger('click');
                    }
                });
                break;
            case "default":
                // 操作设置默认
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var mydata = {
                        defaulted: 1,
                    };
                    $.ajax({
                        url: getApiUrl('product.picture.update', {id: id}),
                        type: getApiMethod('product.picture.update'),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        data: JSON.stringify(mydata),
                        success: function(res) {
                            if (res.code === '0000') {
                                layer.msg('Set the default success');
                                table.reload('productPictureTable');
                            } else {
                                layer.msg(res.msg);
                            }
                        },
                        error: function(e) {
                            console.log(e);
                        }
                    });
                }
                break;
                
            case "delete":
                // 操作删除
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    if (data[0].defaulted == 1) {
                        layer.msg("The current picture is the default, please modify the operation");
                    } else {
                        var id = data[0].id;
                        layer.confirm('Confirm for delete?', {
                            icon: 3,
                            title: 'Delete Picture',
                            btn: ['Submit', 'Cancel'],
                        }, function(index) {
                            $.ajax({
                                url: getApiUrl('product.picture.delete', {ids: id}),
                                type: getApiMethod('product.picture.delete'),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(res) {
                                    if (res.code === '0000') {
                                        layer.msg('Success');
                                        table.reload('productPictureTable');
                                    } else {
                                        layer.msg(res.msg);
                                    }
                                },
                                error: function(e) {
                                    console.log(e);
                                }
                            });
                        });
                    }
                }
                break;
        }
    });
    
    // 监听工具条
    table.on('tool(content-productPicture-list)', function(obj) {
        var data = obj.data;
        if (obj.event === 'showPicture') {
            // 点击商品列表图片放大显示
            if (data.thumbnailPath != null) {
                layer.photos({
                    photos: {
                        "data": [
                            { "src": data.thumbnailPath }
                        ]
                    }
                    ,anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机
                    ,shade: [0.8, '#EEEEEE'] //背景遮布
                    ,move: false //禁止拖动
                });
            }
        }
    });
});