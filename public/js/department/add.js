/**

 @Name：makro 
 @Author：makro
 @Site：/makroDigital/department/add
    
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
    
    var current_parentId = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);

    // 当前部门的id
    var current_id = '';
    //初始化页面
    function init() {
        loadDepartmentList();
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
                    var departmentTree = function (list, level, currentDisabled) {
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
                                departmentTree(tmp.children, level + 1, disabled);
                            }
                        });
                    };
                    list.unshift({
                        id: '0',
                        name: 'Top Level',
                        children: [],
                    });
                    departmentTree(list);
                    $("select[name=parentId]").html(_Html);
                    layui.form.render("select");
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }

});