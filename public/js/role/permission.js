/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroAdmin/permission/index
    
 */
layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
    treeTable: '../layui_exts/treeTable/treeTable'
}).use(['index', 'form', 'laydate', 'table', 'layer', 'treeTable'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer
        ,treeTable = layui.treeTable;

    var storage = layui.data(setter.tableName);

    var current_roleId = getUrlRelativePath(4);
    var current_menuId = 0;
    var current_roleMenus = [],
        current_rolePermission = [];

    // 获取该角色的菜单ID集合
    function getRoleMenus() {
        $.ajax({
            url: getApiUrl('role.getMenus', {id: current_roleId}),
            type: getApiMethod('role.getMenus'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                // console.log(result.data);
                current_roleMenus = result.data;
                getRoleMenuList();
                getRolePermission();
            }
        });
    }
    // 获取所有菜单列表
    function getRoleMenuList() {
        $.ajax({
            url: getApiUrl('menu.table') + '?hasChild=false',
            type: getApiMethod('menu.table'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                if (result.code === "0000") {
                    getList(result.data);
                }
            }
        });
    }
    // 树列展开
    function getList(data) {
        var re = treeTable.render({
            elem: '#content-roleMenu-list',
            data: data,
            icon_key: 'name',
            treeDefaultClose: false,
            is_checkbox: true,
            checked: {
                key: 'id',
                data: current_roleMenus,
            },
            end: function(e) {
                form.render();
            },
            cols: [
                { key: 'name', width: '200px', title: 'Name' }
                ,{ title: 'Action', align: 'center', width: '280px', template: function(item) {
                    var html = '';
                    html += '<a class="layui-btn layui-btn-warm layui-btn-xs" lay-filter="permission">Permission</a>';
                    return html;
                }}
            ]
        });
        $('#content-roleMenu-list').off('click', '.cbx');
    }
    getRoleMenus();
    // 打开该角色的菜单权限详情
    treeTable.on('tree(permission)', function(obj) {
        var field = JSON.stringify(obj);
        var data = JSON.parse(field);
        current_menuId = data.item.id;
        getPermissionList(data.item.id);
    });

    function getRolePermission() {
        $.ajax({
            url: getApiUrl('role.getPermissions', {id: current_roleId}),
            type: getApiMethod('role.getPermissions'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                current_rolePermission = result.data;
                // console.log('初始化',current_rolePermission);
            }
        });
    }

    var id_page_permission = [],
        id_page_permission_checked = [];
    function getPermissionList(m) {
        table.render({
            id: 'permissionTable',
            elem: '#content-permission-list',
            loading: true,
            even: true,
            url: getApiUrl('permission.list'),
            method: getApiMethod('permission.list'),
            headers: {
                'Authorization': 'Bearer ' + storage.access_token
            },
            parseData: function(res) {
                if (res.code === "0000") {
                    id_page_permission = [];
                    id_page_permission_checked = [];
                    //  根据内容判断选中
                    $.each(res.data, function(i, d) {
                        id_page_permission.push(d.id);
                        var index = $.inArray(d.id, current_rolePermission);
                        if (index >= 0) {
                            res.data[i].LAY_CHECKED = true;
                            id_page_permission_checked.push(d.id);
                        } else {
                            res.data[i].LAY_CHECKED = false;
                        }
                    });
                    return {
                        code: 0,
                        data: res.data
                    }
                }
            },
            cols: [[
                { field: 'LAY_CHECKED', type: 'checkbox', width: 80 }
                ,{ field: 'name', title: 'Permission Name' }
                ,{field:'btnPerm', width: 240, title: 'btnPerm' }
                // ,{field:'urlPerm', width: 300, title: 'urlPerm' }
                // ,{field:'id', width: 80, title: 'id' }
            ]],
            where: {
                menuId: m
            },
            page: false
        });
    }
    // 
    table.on('checkbox(content-permission-list)', function(obj) {
        var data = obj.data;
        if (obj.type == 'all') {
            if (obj.checked) {// 全选
                id_page_permission_checked = id_page_permission;
            } else {// 取消全选
                id_page_permission_checked = [];
            }
            $.each(id_page_permission, function(i, id) {
                var index = $.inArray(id, current_rolePermission);
                if (obj.checked) {
                    if (index === -1) {
                        current_rolePermission.push(id);
                    }
                } else {
                    if (index !== -1) {
                        current_rolePermission.splice(index, 1);
                    }
                }
            });
        } else {
            // 单选
            if (obj.checked) {
                // 选中
                id_page_permission_checked.push(data.id);
                current_rolePermission.push(data.id);
            } else {
                id_page_permission_checked.splice($.inArray(data.id, id_page_permission_checked), 1);
                current_rolePermission.splice($.inArray(data.id, current_rolePermission), 1);
            }
        }
        // console.log(current_rolePermission, id_page_permission_checked)
        var mydata = {
            menuId: current_menuId,
            permissionIds: id_page_permission_checked,
            roleId: current_roleId
        };
        // console.log('提交',id_page_permission_checked);
        $.ajax({
            url: getApiUrl('role.updatePermissions', {id: current_roleId}),
            type: getApiMethod('role.updatePermissions'),
            data: JSON.stringify(mydata),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                if (result.code === "0000") {
                    layer.msg(result.msg);
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    });
});