/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/dict/child
    
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
        
    var current_dictCode = getUrlRelativePath(4);
    var current_parentId = getUrlRelativePath(5);
    
    var storage = layui.data(setter.tableName);

    var current_name = '',
        current_status = '';
    function getDictItemList(){
        table.render({
            id: 'dictItemTable'
            ,elem: '#content-dictItem-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('dict.item.listByDictId', {dictId: current_parentId})
            ,method: getApiMethod('dict.item.listByDictId')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#dictItemToolbar'
            ,defaultToolbar: ['filter','exports']
            ,height: 'full'
            ,parseData: function(res) {
                if (res.code==="0000"){
                    return {
                        code: 0,
                        count: res.data.length,
                        data: res.data
                    }
                }
            }
            ,cols: [[
                {type:'radio',  width: 60, fixed: 'left' }
                ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{field:'name', width: 200, title: 'Name', sort: true }
                ,{field:'value', width: 200, title: 'Value'}
                ,{field:'status', width: 90, title: 'Status', templet: '#content-dictItem-list-status'}
                ,{field:'defaulted', width: 100, title: 'Default', templet: function(res) {
                    return res.defaulted == 1 ? 'yes' : 'no';
                }}
                ,{field:'remark', minWidth: 200, title: 'Remarks' }
                ,{field:'sort', width: 120, title: 'Sort', sort: true }
                ,{field:'id', width: 100, title: 'ID', sort: true }
                // ,{field:'creator', width: 160, title: 'Creator', hide: true }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true, hide: true }
                // ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true, hide: true }
            ]],
            where: {
                dictID: current_parentId,
                name: current_name,
                status: current_status,
            },
            page: false,
            renderAfter: function() {
                permission.render();
            }
        });
    }
    
    getDictItemList();
    
    // 搜索
    form.on('submit(LAY-dictItem-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_name = result.name;
        current_status = result.status === '' ? undefined : result.status;
        getDictItemList();
    });
    // 重置搜索
    form.on('submit(LAY-dictItem-front-reset)', function(obj) {
        form.val('dictItemSearch', {
            name: '',
            status: '',
        });
        form.render();
        current_name = '';
        current_status = '';
        getDictItemList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-dictItem-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加字典项
            case 'add':
                var index_page = layer.open({
                    type: 1
                    ,title: 'Add Dict Item'
                    ,id: 'addDictItem'
                    ,content: $('#content-dictItem-add').html()
                    ,maxmin: true
                    ,area: ['600px', '455px']
                    ,btn: ['Save', 'Cancel']
                    ,yes: function (index, layero) {
                        var submitID = 'LAY-dictItem-add-submit',
                            submit = layero.find('#' + submitID);

                        form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            var mydata = {
                                "dictCode": current_dictCode,
                                "parentId": current_parentId,
                                "defaulted": 0,
                                "name": result.name,
                                "value": result.value,
                                "remark": result.remark,
                                "sort": result.sort,
                            };
                            
                            $.ajax({
                                url: getApiUrl('dict.item.add'),
                                type: getApiMethod('dict.item.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('dictItemTable');
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
            // 编辑字典项
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    if (id == null) {
                        return;
                    }
                    var index_page = layer.open({
                        type: 1
                        ,title: 'Edit Dict Item'
                        ,id: 'editDictItem'
                        ,content: $('#content-dictItem-edit').html()
                        ,maxmin: true
                        ,area: ['600px', '455px']
                        ,btn: ['Save', 'Cancel']
                        ,success: function (layero, index) {
                            $.ajax({
                                url: getApiUrl('dict.item.detail', {id: id}),
                                type: getApiMethod('dict.item.detail'),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        form.val('dictItemEdit', {
                                            name: result.data.name,
                                            value: result.data.value,
                                            remark: result.data.remark,
                                            sort: result.data.sort,
                                        });
                                    } else {
                                        layer.msg(result.msg);
                                    }
                                }
                            });
                        }
                        ,yes: function (index, layero) {
                            var submitID = 'LAY-dictItem-update-submit',
                                submit = layero.find('#' + submitID);

                            form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                var mydata = {
                                    "name": result.name,
                                    "value": result.value,
                                    "remark": result.remark,
                                    "sort": result.sort,
                                };
                                
                                $.ajax({
                                    url: getApiUrl('dict.item.update', {id: id}),
                                    type: getApiMethod('dict.item.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('dictItemTable');
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
            // 删除字典项
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    if (id == null) {
                        return;
                    }
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Dict Item',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        $.ajax({
                            url: getApiUrl('dict.item.delete', {ids: id}),
                            type: getApiMethod('dict.item.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('dictItemTable');
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    });
                }
                break;
            // 设置默认项
            case 'default':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    if (id == null) {
                        return;
                    }
                    var mydata = {
                        "defaulted": 1,
                    };
                    $.ajax({
                        url: getApiUrl('dict.item.update', {id: id}),
                        type: getApiMethod('dict.item.update'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                layer.msg(result.msg);
                                layer.close(index_page);
                                table.reload('dictItemTable');
                            } else {
                                layer.msg(result.msg);
                            }
                        }
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
            url: getApiUrl('dict.item.update', {id: id}),
            type: getApiMethod('dict.item.update'),
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