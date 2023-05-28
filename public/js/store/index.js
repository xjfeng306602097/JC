/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/store/index
    
 */

layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer;

    var storage = layui.data(setter.tableName);

    var current_isDelete = 0,
        current_status = '',
        current_name = '',
        current_code = '';

    function getStoreList() {
        table.render({
            id: 'storeTable',
            elem: '#content-store-list',
            loading: true,
            even: true,
            url: getApiUrl('store.page'),
            method: getApiMethod('store.page'),
            headers: { 'Authorization': 'Bearer ' + storage.access_token },
            // POST时必须添加contentType
            contentType: 'application/json;charset=utf-8',
            toolbar: true,
            toolbar: '#storeToolbar',
            defaultToolbar: ['filter', 'exports'],
            parseData: function(res) {
                if (res.code === "0000") {
                    return {
                        code: 0,
                        count: res.data.total,
                        data: res.data.records
                    }
                }
            },
            cols: [[
                { type: 'radio', width: 80, fixed: 'left' },
                { width: 80, title: 'Serial', type: 'numbers', fixed: 'left' },
                { field: 'name', width: 240, title: 'Store Name', fixed: 'left', sort: true },
                { field: 'code', width: 180, title: 'Code', sort: true },
                { field: 'status', width: 90, title: 'Status', templet: '#content-store-list-status' },
                { field: 'sort', width: 180, title: 'Sort', sort: true },
                { field: 'id', width: 80, title: 'ID', sort: true }
            ]],
            where: {
                req: {
                    deleted: current_isDelete,
                    status: current_status,
                    name: current_name,
                    code: current_code,
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

    getStoreList();

    // 搜索
    form.on('submit(LAY-store-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_status = result.status;
        current_name = result.name;
        current_code = result.code;
        getStoreList();
    });
    // 重置搜索
    form.on('submit(LAY-store-front-reset)', function(obj) {
        form.val('storeSearch', {
            status: '',
            name: '',
            code: '',
        });
        form.render();
        current_status = '';
        current_name = '';
        current_code = '';
        getStoreList();
    });

    // 监听头部工具栏
    table.on('toolbar(content-store-list)', function(obj) {
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data; //获取选中行数据

        switch (obj.event) {
            // 同步数据
            case 'sync':
                layer.confirm('Confirm for sync?', {
                    icon: 3,
                    title: 'Sync Store',
                    btn: ['Submit', 'Cancel'],
                }, function(index) {
                    $.ajax({
                        url: getApiUrl('store.sync'),
                        type: getApiMethod('store.sync'),
                        headers: {
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                layer.msg(result.msg);
                                table.reload('storeTable');
                            } else {
                                layer.msg(result.msg);
                            }
                        }
                    });
                });
                break;
            // 添加门店
            case 'add':
                var index_page = layer.open({
                    type: 2,
                    title: 'Add Store',
                    id: 'addStore',
                    content: '/makroDigital/store/add',
                    maxmin: true,
                    area: ['580px', '400px'],
                    btn: ['Save', 'Cancel'],
                    yes: function(index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-store-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);

                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            var mydata = {
                                "name": result.name,
                                "code": result.code,
                                "sort": result.sort,
                            };

                            $.ajax({
                                url: getApiUrl('store.add'),
                                type: getApiMethod('store.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('storeTable');
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
            // 编辑门店
            case 'edit':
                if (data.length == 0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2,
                        title: 'Edit Store',
                        id: 'editStore',
                        content: '/makroDigital/store/edit/' + id,
                        maxmin: true,
                        area: ['580px', '400px'],
                        btn: ['Save', 'Cancel'],
                        yes: function(index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-store-edit-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);

                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);

                                var mydata = {
                                    "name": result.name,
                                    "code": result.code,
                                    "sort": result.sort,
                                };

                                $.ajax({
                                    url: getApiUrl('store.update', { id: id }),
                                    type: getApiMethod('store.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('storeTable');
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
            // 删除门店
            case 'delete':
                if (data.length == 0) {
                    layer.msg("Select one record");
                } else {
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Store',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        var id = data[0].id;
                        $.ajax({
                            url: getApiUrl('store.delete', { ids: id }),
                            type: getApiMethod('store.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('storeTable');
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
            url: getApiUrl('store.update', { id: id }),
            type: getApiMethod('store.update'),
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