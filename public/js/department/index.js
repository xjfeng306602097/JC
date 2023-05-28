/**

 @Name：makro 
 @Author：makro
 @Site：
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
    treeTable: '../layui_exts/treeTable/treeTable'
}).use(['index', 'common', 'layer', 'form', 'table', 'laytpl', 'treeTable'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,layer = layui.layer
        ,form = layui.form
        ,table = layui.table
        ,laytpl = layui.laytpl
        ,treeTable = layui.treeTable;

    var storage = layui.data(setter.tableName);

    var current_name = '',
        current_status = '';
    function getDepartmentList() {
        $.ajax({
            url: getApiUrl('department.table'),
            type: getApiMethod('department.table'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: {
                hasChild: false,
                name: current_name
            },
            success: function(result) {
                if (result.code === "0000") {
                    // getList(result.data);
                    var list = result.data;
                    if (current_status != '' || current_name != '') {
                        for (var x in list) {
                            list[x].parent = '000000';
                        }
                        getList(list, 'parent');
                    } else {
                        getList(list, 'parentId');
                    }
                } else if (result.code === "0017" || result.code === "0018") {
                    window.location.replace('/makroDigital/login');
                } else {
                    layer.msg(result.msg);
                }
            }
        })
    };
    getDepartmentList();

    // 搜索
    form.on('submit(LAY-department-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_name = result.name;
        getDepartmentList();
    });
    // 重置搜索
    form.on('submit(LAY-department-front-reset)', function(obj) {
        form.val('departmentSearch', {
            name: '',
        });
        form.render();
        current_name = '';
        current_status = '';
        getDepartmentList();
    });

    function getList(data, parent_key) {
        var re = treeTable.render({
            id: 'treeTable',
            elem: '#content-department-list',
            data: data,
            primary_key: 'id',
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
                form.render();
            },
            cols: [
                { title: 'Action', align: 'center', width: '280px', fixed: 'left', template: function(item) {
                    return $('#content-department-list-action').html();
                }}
                ,{ key: 'name', width: '200px', title: 'Name', fixed: 'left' }
                ,{ key: 'sort', width: '80px', title: 'Sort', align: 'center' }
                ,{ key: 'status', width: '80px', title: 'Status', align: 'center' }
                ,{ key: 'parentId', width: '80px', title: 'Parent ID', align: 'center' }
                ,{ key: 'id', width: '80px', title: 'ID', align: 'center' }
            ]
        });
    };


    $("#department-add-button").on("click", function() {
        var index_page = layer.open({
            type: 2,
            title: 'Add Department',
            id: 'addDepartment',
            content: '/makroDigital/department/add/',
            maxmin: true,
            area: ['600px', '480px'],
            btn: ['Submit', 'Cancel'],
            yes: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index],
                    submitID = 'LAY-department-add-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);

                // 监听提交
                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);

                    var mydata = {
                        "parentId": "0",
                        "name": result.name,
                        "sort": result.sort,
                        "status": 1,
                    };
                    $.ajax({
                        url: getApiUrl('department.add'),
                        type: getApiMethod('department.add'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                layer.msg(result.msg);
                                getDepartmentList();
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
            title: 'Add Department',
            id: 'addDepartment',
            content: '/makroDigital/department/add/' + data.item.id,
            maxmin: true,
            area: ['600px', '480px'],
            btn: ['Submit', 'Cancel'],
            yes: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index],
                    submitID = 'LAY-department-add-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);

                // 监听提交
                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);

                    var mydata = {
                        "parentId": result.parentId,
                        "name": result.name,
                        "sort": result.sort,
                        "status": 1,
                    };
                    // console.log(JSON.stringify(mydata));
                    $.ajax({
                        url: getApiUrl('department.add'),
                        type: getApiMethod('department.add'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                layer.msg(result.msg);
                                getDepartmentList();
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
            title: 'Edit Department',
            id: 'editDepartment',
            content: '/makroDigital/department/edit/' + data.item.id,
            maxmin: true,
            area: ['600px', '480px'],
            btn: ['Submit', 'Cancel'],
            yes: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index],
                    submitID = 'LAY-department-edit-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);

                // 监听提交
                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);

                    var mydata = {
                        "id": data.item.id,
                        "name": result.name,
                        "parentId": result.parentId,
                        "sort": result.sort,
                        // "status": 1,
                    };
                    $.ajax({
                        url: getApiUrl('department.update', { id: data.item.id }),
                        type: getApiMethod('department.update'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                layer.msg(result.msg);
                                getDepartmentList();
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
            btn: ['Submit', 'Cancel'] //按钮
        }, function() {
            $.ajax({
                url: getApiUrl('department.delete', { ids: data.item.id }),
                type: getApiMethod('department.delete'),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + storage.access_token
                },
                success: function(result) {
                    if (result.code === "0000") {
                        layer.msg(result.msg);
                        getDepartmentList();
                    } else {
                        layer.msg(result.msg);
                    }
                }
            });
        });
    });

});