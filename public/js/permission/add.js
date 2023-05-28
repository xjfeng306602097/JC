layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'layer', 'form'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form;

    var storage = layui.data(setter.tableName);
    
    var current_menuId = getUrlSearchParams('menu') || '';

    //初始化页面
    function init() {
        loadMenuList();
    }
    init();

    // 载入菜单
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
                            var selected = tmp.name == current_menuId;
                            _Html += '<option value="' + tmp.name + '"' + (selected ? ' selected' : '') + (disabled ? ' disabled' : '') + '>' + levelText + ' ' + tmp.meta.title + '</option>';
                            if (Array.isArray(tmp.children) && tmp.children.length > 0) {
                                categoryTree(tmp.children, level + 1, disabled);
                            }
                        });
                    };
                    list.unshift({
                        name: '',
                        meta: {
                            title: 'Select',
                        },
                        children: [],
                    });
                    categoryTree(list);
                    $("select[name=menuId]").html(_Html);
                    if (current_menuId) {
                        $("select[name=menuId]").prop('disabled', true);
                    }
                    layui.form.render("select");
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }

});