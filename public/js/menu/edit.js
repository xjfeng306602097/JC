/**

 @Name：makro 
 @Author：makro
 @Site：
 @Update: 20211104 09:32 done
    
 */

layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'layer', 'form'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form;

    var current_id = getUrlRelativePath(4);

    var storage = layui.data(setter.tableName);

    // 当前菜单的父级id
    var current_parentId = '';
    //初始化页面
    function init() {
        loadMenuDetail(function(result) {
            current_parentId = result.data.parentId;
            current_id = result.data.id;
            loadMenuList();
        });
    }
    init();

    // 载入菜单列表
    function loadMenuList() {
        $.ajax({
            url: getApiUrl('menu.route'),
            type: getApiMethod('menu.route'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function (result) {
                if (result.code === "0000") {
                    var list = result.data;
                    var _Html = '';
                    var categoryTree = function (list, level, currentDisabled) {
                        if (level === undefined) {
                            level = 0;
                        }
                        $.each(list, function(index, value) {
                            var tmp = list[index];
                            var levelText = new Array(level + 1).join('•');
                            var disabled = currentDisabled;
                            if (disabled === undefined || !disabled) {
                                disabled = tmp.name == current_id;
                            }
                            var selected = tmp.name == current_parentId;
                            _Html += '<option value="' + tmp.name + '"' + (selected ? ' selected' : '') + (disabled ? ' disabled' : '') + '>' + levelText + ' ' + tmp.meta.title + '</option>';
                            if (Array.isArray(tmp.children) && tmp.children.length > 0) {
                                categoryTree(tmp.children, level + 1, disabled);
                            }
                        });
                    };
                    list.unshift({
                        name: '0',
                        meta: {
                            title: 'Top Level',
                        },
                        children: [],
                    });
                    categoryTree(list);
                    $("select[name=parentId]").html(_Html);
                    layui.form.render("select");
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }

    // 获取当前ID数据
    // 载入菜单详情
    function loadMenuDetail(success) {
        $.ajax({
            url: getApiUrl('menu.detail', {id: current_id}),
            type: getApiMethod('menu.detail'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                if (result.code === "0000") {
                    form.val('menuEdit', {
                        "parentId": result.data.parentId,
                        "name": result.data.name,
                        "path": result.data.path,
                        "component": result.data.component,
                        "icon": result.data.icon,
                        "sort": result.data.sort,
                        "visible": result.data.visible,
                    });
                    form.render();
                    success && success(result);
                } else {
                    layer.msg(result.msg,{
                        time: 2000,
                        end: function () {
                            var index = parent.layer.getFrameIndex(window.name);
                            parent.layer.close(index);
                        }
                    });
                }
            }
        });
    }


});