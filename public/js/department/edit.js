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

    // 当前部门的父级id
    var current_parentId = '';
    //初始化页面
    function init() {
        loadDepartmentDetail(function(result) {
            current_parentId = result.data.parentId;
            current_id = result.data.id;
            loadDepartmentList();
        });
    }
    init();

    // 载入部门
    function loadDepartmentList() {
        $.ajax({
            url: getApiUrl('department.select'),
            type: getApiMethod('department.select'),
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
                            var levelText = new Array(level + 1).join('—');
                            var disabled = currentDisabled;
                            if (disabled === undefined || !disabled) {
                                disabled = tmp.id == current_id;
                            }
                            var selected = tmp.id == current_parentId;
                            _Html += '<option value="' + tmp.id + '"' + (selected ? ' selected' : '') + (disabled ? ' disabled' : '') + '>' + levelText + ' ' + tmp.name + '</option>';
                            if (Array.isArray(tmp.children) && tmp.children.length > 0) {
                                categoryTree(tmp.children, level + 1, disabled);
                            }
                        });
                    };
                    list.unshift({
                        id: '0',
                        name: 'Top Level',
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

    // 载入部门详情
    function loadDepartmentDetail(success) {
        // 获取当前ID数据
        $.ajax({
            url: getApiUrl('department.detail', {id: current_id}),
            type: getApiMethod('department.detail'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function (result) {
                if (result.code === "0000") {
                    form.val('departmentEdit', {
                        "parentId": result.data.parentId,
                        "name": result.data.name,
                        "sort": result.data.sort,
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