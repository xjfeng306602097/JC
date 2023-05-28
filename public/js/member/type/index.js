/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/memberType/index
    
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
    
    var current_active = '',
        current_nameEn = '',
        current_nameTh = '';
    function getMemberTypeList(){
        table.render({
            id: 'memberTypeTable'
            ,elem: '#content-memberType-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('member.type.page')
            ,method: getApiMethod('member.type.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            // POST时必须添加contentType
            ,contentType: 'application/json;charset=utf-8'
            ,toolbar: true
            ,toolbar: '#memberTypeToolbar'
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
                ,{field:'nameEn', minWidth: 200, title: 'Name (En)', sort: true }
                ,{field:'nameTh', minWidth: 200, title: 'Name (Thai)', sort: true }
                ,{field:'invalid', width: 90, title: 'Status', templet: '#content-memberType-list-status'}
                ,{field:'id', width: 120, title: 'ID', sort: true }
                ,{field:'creator', width: 160, title: 'Creator', hide: true }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true }
            ]],
            where: {
                req: {
                    active: current_active,
                    nameEn: current_nameEn,
                    nameTh: current_nameTh,
                },
                sortItems: [
                    {
                        column: "id",
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
    
    getMemberTypeList();
    
    // 搜索
    form.on('submit(LAY-memberType-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_active = result.active;
        current_nameEn = result.nameEn;
        current_nameTh = result.nameTh;
        getMemberTypeList();
    });
    // 重置搜索
    form.on('submit(LAY-memberType-front-reset)', function(obj) {
        form.val('memberTypeSearch', {
            active: '',
            nameEn: '',
            nameTh: '',
        });
        form.render();
        current_active = '';
        current_nameEn = '';
        current_nameTh = '';
        getMemberTypeList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-memberType-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加客户类型
            case 'add':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Add Member Type'
                    ,id: 'addType'
                    ,content: '/makroDigital/memberType/add'
                    ,maxmin: true
                    ,area: ['600px', '455px']
                    ,btn: ['Save', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-memberType-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            var mydata = {
                                "nameEn": result.nameEn,
                                "nameTh": result.nameTh,
                            };
                            
                            $.ajax({
                                url: getApiUrl('member.type.add'),
                                type: getApiMethod('member.type.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('memberTypeTable');
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
            // 编辑客户类型
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Member Type'
                        ,id: 'editType'
                        ,content: '/makroDigital/memberType/edit/' + id
                        ,maxmin: true
                        ,area: ['600px', '455px']
                        ,btn: ['Save', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-memberType-edit-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                
                                var mydata = {
                                    "nameEn": result.nameEn,
                                    "nameTh": result.nameTh,
                                };
                                
                                $.ajax({
                                    url: getApiUrl('member.type.update', {id: id}),
                                    type: getApiMethod('member.type.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('memberTypeTable');
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
            // 删除客户类型
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Member Type',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        var id = data[0].id;
                        $.ajax({
                            url: getApiUrl('member.type.delete', {id: id}),
                            type: getApiMethod('member.type.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('memberTypeTable');
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
        var checked = this.checked;
        var active = checked ? true : false;
        var data = {
            active: active,
        };
        $.ajax({
            url: getApiUrl('member.type.update', {id: id}),
            type: getApiMethod('member.type.update'),
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