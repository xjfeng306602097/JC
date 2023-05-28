/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/segment/index
    
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
        current_invalid = '';
    function getSegmentList(){
        table.render({
            id: 'segmentTable'
            ,elem: '#content-segment-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('segment.page')
            ,method: getApiMethod('segment.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            // POST时必须添加contentType
            ,contentType: 'application/json;charset=utf-8'
            ,toolbar: true
            ,toolbar: '#segmentToolbar'
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
                ,{field:'name', width: 300, title: 'Segment Name', fixed: 'left', sort: true, fixed: 'left' }
                ,{field:'invalid', width: 90, title: 'Status', templet: '#content-segment-list-status'}
                ,{field:'startTime', width: 200, title: 'Start Time' }
                ,{field:'endTime', width: 200, title: 'End Time' }
                ,{field:'id', width: 120, title: 'ID', sort: true }
            ]],
            where: {
                req: {
                    name: current_name,
                    invalid: current_invalid,
                },
                sortItems: [
                    {
                        column: "name",
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
    
    getSegmentList();
    
    // 搜索
    form.on('submit(LAY-segment-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_name = result.name;
        current_invalid = result.status === '' ? undefined : result.status;
        getSegmentList();
    });
    // 重置搜索
    form.on('submit(LAY-segment-front-reset)', function(obj) {
        form.val('segmentSearch', {
            name: '',
            status: '',
        });
        form.render();
        current_name = '';
        current_invalid = '';
        getSegmentList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-segment-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加Segment
            case 'add':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Add Segment'
                    ,id: 'addSegment'
                    ,content: '/makroDigital/segment/add'
                    ,maxmin: true
                    ,area: ['715px', '580px']
                    ,btn: ['Save', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-segment-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            var mydata = {
                                "name": result.name,
                                "startTime": result.startTime,
                                "endTime": result.endTime,
                                "invalid": 0
                            };
                            
                            $.ajax({
                                url: getApiUrl('segment.add'),
                                type: getApiMethod('segment.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('segmentTable');
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
            // 编辑Segment
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Segment'
                        ,id: 'editSegment'
                        ,content: '/makroDigital/segment/edit/' + id
                        ,maxmin: true
                        ,area: ['715px', '580px']
                        ,btn: ['Save', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-segment-edit-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                
                                var mydata = {
                                    "name": result.name,
                                    "startTime": result.startTime,
                                    "endTime": result.endTime
                                };
                                
                                $.ajax({
                                    url: getApiUrl('segment.update', {id: id}),
                                    type: getApiMethod('segment.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('segmentTable');
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
            // 删除Segment
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Segment',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        var id = data[0].id;
                        $.ajax({
                            url: getApiUrl('segment.delete', {ids: id}),
                            type: getApiMethod('segment.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('segmentTable');
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    });
                }
                break;
            // 获取对应的客户列表
            case 'customer':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var name = data[0].name;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Customer List - Segment : ' + name
                        ,id: 'customerList'
                        ,content: '/makroDigital/memberCustomer/index/?segment=' + id
                        ,maxmin: true
                        ,area: ['90%', '90%']
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
        var checked = this.checked;
        var invalid = checked ? 0 : 1;
        var data = {
            invalid: invalid,
        };
        $.ajax({
            url: getApiUrl('segment.update', {id: id}),
            type: getApiMethod('segment.update'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: JSON.stringify(data),
            success: function(result) {
                if (result.code === "0000") {
                    layer.msg(result.msg);
                } else {
                    obj.elem.checked = !checked;
                    form.render('checkbox');
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                obj.elem.checked = !checked;
                form.render('checkbox');
                layer.msg('切换失败');
                console.log(e);
            }
        });
    });
    
});