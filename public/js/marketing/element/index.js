/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingElement/index
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer', 'dict', 'uploadAPI'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer
        ,dict = layui.dict
        ,uploadAPI = layui.uploadAPI;
    
    var storage = layui.data(setter.tableName);
    
    //上传图片返回Data对象转字符串
    window.filePath = '';

    var types = {};
    dict.render({
        elem: 'select[name="type"]',
        dictCode: 'element_type',
        value: '',
        success: function (res) {
            if (res.code === '0000') {
                for (var x in res.data) {
                    var item = res.data[x];
                    types[item.value] = item.name;
                }
            }
        },
    }, function() {
        getMarketingElementList();
    });
    
    var current_name = '',
        current_type = '',
        current_status = '';
    function getMarketingElementList(){
        table.render({
            id: 'marketingElementTable'
            ,elem: '#content-marketingElement-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.element.page')
            ,method: getApiMethod('marketing.element.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            // POST时必须添加contentType
            ,contentType: 'application/json;charset=utf-8'
            ,toolbar: true
            ,toolbar: '#marketingElementToolbar'
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
                ,{field:'nameEn', width: 200, title: 'Name', fixed: 'left', sort: true }
                // ,{field:'nameThai', width: 200, title: 'nameThai', fixed: 'left', sort: true }
                ,{field:'thumbnailPath', width: 100, title: 'Picture', templet: imgTpl }
                ,{field:'type', minWidth: 160, title: 'Type', sort: true, templet: function (res) {
                    return types[res.type] === undefined ? 'Unknown' : types[res.type];
                }}
                ,{field:'status', width: 90, title: 'Status', templet: '#content-marketingElement-list-status'}
                ,{field:'id', width: 120, title: 'ID', sort: true }
                ,{field:'creator', width: 160, title: 'Creator' }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true }
            ]],
            where: {
                req: {
                    nameEn: current_name,
                    // nameThai: current_name,
                    type: current_type,
                    status: current_status,
                },
                sortItems: [
                    {
                        column: "gmtCreate",
                        asc: true
                    }
                ],
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
        });
    }
    
    // 搜索
    form.on('submit(LAY-marketingElement-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        
        current_name = result.name;
        current_type = result.type;
        current_status = result.status;
        getMarketingElementList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingElement-front-reset)', function(obj) {
        form.val('elementSearch', {
            name: '',
            type: '',
            status: '',
        });
        form.render();
        current_name = '';
        current_type = '';
        current_status = '';
        getMarketingElementList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-marketingElement-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加Element
            case 'add':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Add Element'
                    ,id: 'addElement'
                    ,content: '/makroDigital/marketingElement/add'
                    ,maxmin: true
                    ,area: ['600px', '455px']
                    ,btn: ['Save', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-element-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
                        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            
                            if (filePath==''){
                                layer.msg('Please upload pictures.');
                            }else{    
                                var mydata = {
                                    "nameEn": result.name,
                                    // "nameThai": result.nameThai,
                                    "filePath": filePath,
                                    "type": result.type
                                };
                                
                                $.ajax({
                                    url: getApiUrl('marketing.element.add'),
                                    type: getApiMethod('marketing.element.add'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            uploadAPI.cancel(iframeWindow.uploadList, result.path);
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('marketingElementTable');
                                        } else {
                                            layer.msg(result.msg);
                                        }
                                    }
                                });
                            }  
                            
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
            // 编辑Element
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Element'
                        ,id: 'editElement'
                        ,content: '/makroDigital/marketingElement/edit/' + id
                        ,maxmin: true
                        ,area: ['600px', '455px']
                        ,btn: ['Save', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-element-edit-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                
                                var mydata = {
	                                "nameEn": result.name,
	                                // "nameThai": result.nameThai,
	                                "filePath": filePath,
	                                "type": result.type
                                };
                                
                                $.ajax({
                                    url: getApiUrl('marketing.element.update', {id: id}),
                                    type: getApiMethod('marketing.element.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            
                                            if (!isEmpty(result.path) && !isEmpty(iframeWindow.currentFile) ){
                                                iframeWindow.uploadList.push(iframeWindow.currentFile);
                                                uploadAPI.cancel(iframeWindow.uploadList, result.path);
                                            }
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('marketingElementTable');
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
                }
                break;
            // 删除Element
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Element',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        var id = data[0].id;
                        $.ajax({
                            url: getApiUrl('marketing.element.delete', {ids: id}),
                            type: getApiMethod('marketing.element.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('marketingElementTable');
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
    table.on('tool(content-marketingElement-list)', function(obj) {
        var data = obj.data;
        if (obj.event === 'showPicture') {
            // 点击商品列表图片放大显示
            if (data.originPath != null) {
                layer.photos({
                    photos: {
                        "data": [
                            { "src": data.originPath }
                        ]
                    }
                    ,anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机
                    ,shade: [0.8, '#EEEEEE'] //背景遮布
                    ,move: false //禁止拖动
                });
            }
        }
    });

    // 监听开关事件
    form.on('switch(switchStatus)', function(obj) {
        var id = obj.value;
        var status = this.checked ? 1 : 0;
        var data = {
            status: status,
        };
        $.ajax({
            url: getApiUrl('marketing.element.update', {id: id}),
            type: getApiMethod('marketing.element.update'),
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