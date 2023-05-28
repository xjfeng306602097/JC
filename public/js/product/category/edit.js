/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/productCategory/edit
    
 */
 
layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'layer', 'form'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form;
    
    var current_id = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);

    //表单form值验证
    form.verify({
        // code验证
        code: function(value) {
            if (value === '000000') {
                return 'Code is not allowed to enter 000000';
            }
        },
    });
    // 当前分类的code
    var current_parentCode = '',
        current_code = '';
    //初始化页面
    function init() {
        loadCategoryDetail(function(result) {
            current_parentCode = result.data.parentCode;
            current_code = result.data.code;
            loadCategoryList();
        });
    }
    init();

    // 载入分类
    function loadCategoryList() {
        $.ajax({
            url: getApiUrl('product.category.select'),
            type: getApiMethod('product.category.select'),
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
                                disabled = tmp.code == current_code;
                            }
                            var selected = tmp.code == current_parentCode;
                            _Html += '<option value="' + tmp.code + '"' + (selected ? ' selected' : '') + (disabled ? ' disabled' : '') + '>' + levelText + ' ' + tmp.name + '</option>';
                            if (Array.isArray(tmp.children) && tmp.children.length > 0) {
                                categoryTree(tmp.children, level + 1, disabled);
                            }
                        });
                    };
                    list.unshift({
                        code: '000000',
                        name: 'Top Level',
                        children: [],
                    });
                    categoryTree(list);
                    $("select[name=parentCode]").html(_Html);
                    layui.form.render("select");
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }

    // 载入分类详情
    function loadCategoryDetail(success) {
        // 获取当前ID数据
        $.ajax({
            url: getApiUrl('product.category.detail', {id: current_id}),
            type: getApiMethod('product.category.detail'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function (result) {
                if (result.code === "0000") {
                    form.val('categoryEdit', {
                        "parentCode": result.data.parentCode,
                        "name": result.data.name,
                        "code": result.data.code,
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