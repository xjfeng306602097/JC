/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingUnit/index
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
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
    
    var current_name = '',
        current_status = '';
    function getMarketingUnitList(){
        table.render({
            id: 'marketingUnitTable'
            ,elem: '#content-marketingUnit-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.unit.page')
            ,method: getApiMethod('marketing.unit.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            // POST时必须添加contentType
            ,contentType: 'application/json;charset=utf-8'
            ,toolbar: true
            ,toolbar: '#marketingUnitToolbar'
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
                ,{field:'name', width: 200, title: 'Unit Name', fixed: 'left', sort: true, fixed: 'left' }
                ,{field:'unitInch', width: 120, title: 'Unit Inch' }
                ,{field:'status', width: 90, title: 'Status', templet: '#content-marketingUnit-list-status'}
                ,{field:'sort', width: 120, title: 'Sort', sort: true }
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
    
    getMarketingUnitList();
    
    // 搜索
    form.on('submit(LAY-marketingUnit-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_name = result.name;
        current_status = result.status === '' ? undefined : result.status;
        getMarketingUnitList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingUnit-front-reset)', function(obj) {
        form.val('unitSearch', {
            name: '',
            status: '',
        });
        form.render();
        current_name = '';
        current_status = '';
        getMarketingUnitList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-marketingUnit-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加尺寸单位
            case 'add':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Add Unit'
                    ,id: 'addUnit'
                    ,content: '/makroDigital/marketingUnit/add'
                    ,maxmin: true
                    ,area: ['580px', '470px']
                    ,btn: ['Save', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-unit-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            var mydata = {
                                "name": result.name,
                                "unitInch": result.unitInch,
                                "sort": result.sort
                            };
                            
                            $.ajax({
                                url: getApiUrl('marketing.unit.add'),
                                type: getApiMethod('marketing.unit.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('marketingUnitTable');
                                    } else {
                                        layer.msg(result.msg);
                                    }
                                }
                            });
                        });
                        submit.trigger('click');
                    }
                });
                //layer.full(index_page);
                break;
            // 编辑尺寸单位
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Unit'
                        ,id: 'editUnit'
                        ,content: '/makroDigital/marketingUnit/edit/' + id
                        ,maxmin: true
                        ,area: ['580px', '470px']
                        ,btn: ['Save', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-unit-edit-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                
                                var mydata = {
                                    "name": result.name,
                                    "unitInch": result.unitInch,
                                    "sort": result.sort
                                };
                                
                                $.ajax({
                                    url: getApiUrl('marketing.unit.update', {id: id}),
                                    type: getApiMethod('marketing.unit.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('marketingUnitTable');
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
            // 删除尺寸单位
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Unit',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        var id = data[0].id;
                        $.ajax({
                            url: getApiUrl('marketing.unit.delete', {ids: id}),
                            type: getApiMethod('marketing.unit.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('marketingUnitTable');
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

    // 监听开关事件
    form.on('switch(switchStatus)', function(obj) {
        var id = obj.value;
        var status = this.checked ? 1 : 0;
        var data = {
            status: status,
        };
        $.ajax({
            url: getApiUrl('marketing.unit.update', {id: id}),
            type: getApiMethod('marketing.unit.update'),
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