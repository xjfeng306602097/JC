/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingSvg/index
    
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
        current_status = '';
    function getMarketingSvgList(){
        table.render({
            id: 'marketingSvgTable'
            ,elem: '#content-marketingSvg-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.svg.page')
            ,method: getApiMethod('marketing.svg.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            // POST时必须添加contentType
            ,contentType: 'application/json;charset=utf-8'
            ,toolbar: true
            ,toolbar: '#marketingSvgToolbar'
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
                ,{field:'name', width: 200, title: 'Svg Name', fixed: 'left', sort: true }
                ,{field:'path', width: 100, title: 'Preview', templet: imgTpl}
                ,{field:'status', width: 90, title: 'Status', templet: '#content-marketingSvg-list-status'}
                ,{field:'sort', width: 120, title: 'Sort', sort: true }
                ,{field:'remark', width: 200, title: 'Remarks' }
                ,{field:'path', width: 550, title: 'Svg Path' }
                ,{field:'id', width: 120, title: 'ID', sort: true }
                ,{field:'creator', width: 160, title: 'Creator' }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true }
            ]],
            where: {
                req: {
                    name: current_name,
                    status: current_status,
                },
                sortItems: [
                    {
                        column: "sort",
                        asc: false
                    },
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
    
    getMarketingSvgList();
    
    // 搜索
    form.on('submit(LAY-marketingSvg-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_name = result.name;
        current_status = result.status === '' ? undefined : result.status;
        getMarketingSvgList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingSvg-front-reset)', function(obj) {
        form.val('svgSearch', {
            name: '',
            status: '',
        });
        form.render();
        current_name = '';
        current_status = '';
        getMarketingSvgList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-marketingSvg-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加svg
            case 'add':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Add Svg'
                    ,id: 'addSvg'
                    ,content: '/makroDigital/marketingSvg/add'
                    ,maxmin: true
                    ,area: ['600px', '455px']
                    ,btn: ['Save', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-svg-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            var mydata = {
                                "name": result.name,
                                "path": result.path,
                                "remark": result.remark,
                                "sort": result.sort
                            };
                            
                            $.ajax({
                                url: getApiUrl('marketing.svg.add'),
                                type: getApiMethod('marketing.svg.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        uploadAPI.cancel(iframeWindow.uploadList, mydata.path);
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('marketingSvgTable');
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
            // 编辑svg
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Svg'
                        ,id: 'editSvg'
                        ,content: '/makroDigital/marketingSvg/edit/' + id
                        ,maxmin: true
                        ,area: ['600px', '455px']
                        ,btn: ['Save', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-svg-edit-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                
                                var mydata = {
	                                "name": result.name,
	                                "path": result.path,
	                                "remark": result.remark,
	                                "sort": result.sort
                                };
                                
                                $.ajax({
                                    url: getApiUrl('marketing.svg.update', {id: id}),
                                    type: getApiMethod('marketing.svg.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            iframeWindow.uploadList.push(iframeWindow.currentFile);
                                            uploadAPI.cancel(iframeWindow.uploadList, mydata.path);
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('marketingSvgTable');
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
            // 删除svg
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Svg',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        var id = data[0].id;
                        $.ajax({
                            url: getApiUrl('marketing.svg.delete', {ids: id}),
                            type: getApiMethod('marketing.svg.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('marketingSvgTable');
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
    table.on('tool(content-marketingSvg-list)', function(obj) {
        var data = obj.data;
        if (obj.event === 'showPicture') {
            // 点击预览图放大显示
            if (data.path != null) {
                layer.photos({
                    photos: {
                        "data": [
                            { "src": data.path }
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
            url: getApiUrl('marketing.svg.update', {id: id}),
            type: getApiMethod('marketing.svg.update'),
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