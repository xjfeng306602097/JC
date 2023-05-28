/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/productIcon/index
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer', 'uploadAPI'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer
        ,uploadAPI = layui.uploadAPI;
    
    var storage = layui.data(setter.tableName);
    
    var current_name = '',
        current_isvalid = 1;
    
    function getProductBrandList(){
        table.render({
            id: 'productIconTable'
            ,elem: '#content-productIcon-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('product.icon.page')
            ,method: getApiMethod('product.icon.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#productIconToolbar'
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
                ,{field:'name', width: 220, title: 'Icon Name', fixed: 'left', sort: true }
                ,{field:'thumbnailPath', width: 180, title: 'Picture', templet: imgTpl }
                // ,{field:'status', width: 90, title: 'Status', templet: '#content-productIcon-list-status'}
                ,{field:'remark', minWidth: 200, title: 'Remarks' }
                ,{field:'id', width: 300, title: 'ID', sort: true }
                ,{field:'creator', width: 160, title: 'Creator' }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true }
            ]],
            where: {
                isvalid: current_isvalid,
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
    
    getProductBrandList();
    
    // 搜索
    form.on('submit(LAY-productIcon-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);

        current_name = result.name;
        getProductBrandList();
    });
    // 重置搜索
    form.on('submit(LAY-productIcon-front-reset)', function(obj) {
        form.val('iconSearch', {
            name: '',
        });
        form.render();
        current_name = '';
        getProductBrandList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-productIcon-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加Icon
            case 'add':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Add Icon'
                    ,id: 'addIcon'
                    ,content: '/makroDigital/productIcon/add'
                    ,maxmin: true
                    ,area: ['600px', '510px']
                    ,btn: ['Save', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-productIcon-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
                        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);

                            var picPath = result.path;
                            var mydata = {
                                "name": result.name,
                                "picid": result.picid,
                                "remark": result.remark
                            };
                            
                            $.ajax({
                                url: getApiUrl('product.icon.add'),
                                type: getApiMethod('product.icon.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        uploadAPI.cancel(iframeWindow.uploadList, picPath);
                                        // 插入上传的icon图片数据
                                        if (result.data && iframeWindow.iconImage !== undefined) {
                                            var picdata = {
                                                iconid: result.data.id,
                                                defaulted: 1,
                                                filePath: JSON.stringify(iframeWindow.iconImage),
                                            };
                                            $.ajax({
                                                url: getApiUrl('product.icon.picture.add'),
                                                type: getApiMethod('product.icon.picture.add'),
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    "Authorization": 'Bearer ' + storage.access_token
                                                },
                                                data: JSON.stringify(picdata),
                                                success: function(res) {
                                                    if (res.code === '0000') {
                                                        
                                                    } else {
                                                        console.log('插入icon图片数据失败');
                                                    }
                                                },
                                                error: function(e) {
                                                    console.log(e);
                                                }
                                            });
                                        }
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('productIconTable');
                                    } else {
                                        layer.msg(result.msg);
                                    }
                                }
                            });
                            
                        });
                        submit.trigger('click');
                    }
                    ,cancel: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index];
                        uploadAPI.cancel(iframeWindow.uploadList);
                    }
                    ,btn2: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index];
                        uploadAPI.cancel(iframeWindow.uploadList);
                    }
                });
                //layer.full(index_page);
                break;
            // 编辑Icon
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Icon'
                        ,id: 'editIcon'
                        ,content: '/makroDigital/productIcon/edit/' + id
                        ,maxmin: true
                        ,area: ['600px', '510px']
                        ,btn: ['Save', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-productIcon-edit-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                
                                var mydata = {
	                                "name": result.name,
	                                "picid": result.picid,
	                                "remark": result.remark
                                };
                                
                                $.ajax({
                                    url: getApiUrl('product.icon.update', {id: id}),
                                    type: getApiMethod('product.icon.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('productIconTable');
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
            // 删除Icon
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Icon',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        var id = data[0].id;
                        $.ajax({
                            url: getApiUrl('product.icon.delete', {ids: id}),
                            type: getApiMethod('product.icon.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('productIconTable');
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    });
                }
                break;
            default:
                break;
        }
    });
    
    // 监听工具条
    table.on('tool(content-productIcon-list)', function(obj) {
        var data = obj.data;
        if (obj.event === 'replacePicture') {// 选择图片替换
            var id = data.id;
            var layerIndex = layer.open({
                type: 2
                ,title: false
                ,id: 'selectIconPicture'
                ,content: '/makroDigital/productIcon/pictureSelect/' + data.id
                ,area: ['900px', '550px']
                ,closeBtn: 0
                ,shadeClose: true
                ,skin: 'layui-layer-transparent'
                ,success: function(layero, index) {
                    var iframeWindow = layero.find('iframe')[0].contentWindow,
                        submitID = 'LAY-picture-selected-submit';
                    iframeWindow.iconName = data.name;
                    iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                        var field = JSON.stringify(obj.field);
                        var result = JSON.parse(field);
                        var mydata = {
                            "picid": result.picID,
                        };
                        $.ajax({
                            url: getApiUrl('product.icon.update', {id: id}),
                            type: getApiMethod('product.icon.update'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            data: JSON.stringify(mydata),
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('productIconTable');
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    });
                }
            });
        } else if (obj.event === 'showPicture') {
            // 点击商品列表图片放大显示
            if (data.pic.originPath != null) {
                layer.photos({
                    photos: {
                        "data": [
                            { "src": data.pic.originPath }
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