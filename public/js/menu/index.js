/**

 @Name：makro 
 @Author：makro
 @Site：
 @Update: 20211104 09:32 done
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
    treeTable: '../layui_exts/treeTable/treeTable'
}).use(['index', 'common', 'layer', 'form', 'table', 'element', 'treeTable'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,layer = layui.layer
        ,form = layui.form
        ,table = layui.table
        ,element = layui.element
        ,treeTable = layui.treeTable;

    var storage = layui.data(setter.tableName);

    var current_name = '';

    function getMenuList() {
        $.ajax({
            url: getApiUrl('menu.list') + '/table?hasChild=false&name=' + current_name, // table不展开
            type: getApiMethod('menu.list'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                if (result.code === "0000") {
                    getList(result.data);
                    var list = result.data;
                    if (current_name != '') {
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
        });
    }
    getMenuList();
    // 搜索
    form.on('submit(LAY-menu-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_name = result.name;
        getMenuList();
    });
    // 重置搜索
    form.on('submit(LAY-menu-front-reset)', function(obj) {
        form.val('menuSearch', {
            name: '',
        });
        form.render();
        current_name = '';
        getMenuList();
    });

    function getList(data, parent_key) {
        for (var x in data) {
            if (data[x].icon === undefined) {
                data[x].icon = '';
            }
            if (data[x].path === undefined) {
                data[x].path = '';
            }
            if (data[x].component === undefined) {
                data[x].component = '';
            }
        }
        var re = treeTable.render({
            id: 'treeTable',
            elem: '#content-menu-list',
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
                    return $('#content-menu-list-action').html();
                }}
                ,{ key: 'name', width: '200px', title: 'Name', fixed: 'left' }
                ,{ key: 'path', width: '180px', title: 'Path' }
                ,{ key: 'icon', width: '180px', title: 'Icon', template: function(item) {
                    return '<i class="layui-icon layui-icon-' + item.icon + '"></i> ' + item.icon;
                }}
                ,{ key: 'component', width: '100px', title: 'Component' }
                ,{ key: 'sort', width: '80px', title: 'Sort' }
                ,{ key: 'visible', width: '80px', title: 'Visible', template: function(item) {
                    switch (item.visible) {
                        case 1:
                            return 'Yes';
                        case 0:
                            return 'No';
                        default:
                            return 'Unknown';
                    }
                }}
                ,{ key: 'parentId', width: '80px', title: 'PID', align: 'center' }
                ,{ key: 'id', width: '80px', title: 'ID', align: 'center' }
            ]
        });
    };
    $("#menu-add-button").on("click", function() {
        var index_page = layer.open({
            type: 2,
            title: 'Add Menu',
            id: 'addMenu',
            content: '/makroDigital/menu/add/',
            maxmin: true,
            area: ['600px', '480px'],
            btn: ['Submit', 'Cancel'],
            yes: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index],
                    submitID = 'LAY-menu-add-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);
                // 监听提交
                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
                    var mydata = {
                        "name": result.name,
                        "parentId": "0",
                        "path": result.path,
                        "component": result.component,
                        "icon": result.icon,
                        "sort": result.sort,
                        "visible": result.visible
                    };
                    $.ajax({
                        url: getApiUrl('menu.add'),
                        type: getApiMethod('menu.add'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                layer.msg(result.msg);
                                getMenuList();
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
            title: 'Add Children of Menu - ' + data.item.name,
            id: 'addMenu',
            content: '/makroDigital/menu/add/',
            maxmin: true,
            area: ['600px', '480px'],
            btn: ['Submit', 'Cancel'],
            yes: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index],
                    submitID = 'LAY-menu-add-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);
                // 监听提交
                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
                    var mydata = {
                        "name": result.name,
                        "parentId": data.item.id,
                        "path": result.path,
                        "component": result.component,
                        "icon": result.icon,
                        "sort": result.sort,
                        "visible": result.visible,
                    };
                    // console.log(JSON.stringify(mydata));
                    $.ajax({
                        url: getApiUrl('menu.add'),
                        type: getApiMethod('menu.add'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                layer.msg(result.msg);
                                getMenuList();
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
            title: 'Edit Menu - ' + data.item.name,
            id: 'editMenu',
            content: '/makroDigital/menu/edit/' + data.item.id,
            maxmin: true,
            area: ['600px', '530px'],
            btn: ['Submit', 'Cancel'],
            yes: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index],
                    submitID = 'LAY-menu-edit-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);
                // 监听提交
                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
                    var mydata = {
                        "id": data.item.id,
                        "name": result.name,
                        "parentId": result.parentId,
                        "path": result.path,
                        "component": result.component,
                        "icon": result.icon,
                        "sort": result.sort,
                        "visible": result.visible,
                    };
                    $.ajax({
                        url: getApiUrl('menu.update', {id: data.item.id}),
                        type: getApiMethod('menu.update'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                layer.msg(result.msg);
                                getMenuList();
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

    treeTable.on('tree(permission)', function(obj) {
        var field = JSON.stringify(obj);
        var data = JSON.parse(field);
        var index_page = layer.open({
            type: 2,
            title: 'Permission of Menu - ' + data.item.name,
            id: 'menuPermission',
            content: '/makroDigital/permission/index?menu=' + data.item.id,
            maxmin: true,
            area: ['1200px', '630px'],
            yes: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index],
                    submitID = 'LAY-menu-permission-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);

                submit.trigger('click');
            }
        });
    });

});