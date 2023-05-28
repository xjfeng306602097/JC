/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/product/linkProductSelect
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'table', 'layer'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,table = layui.table
        ,layer = layui.layer;
    
    var storage = layui.data(setter.tableName);
    var current_id = getUrlRelativePath(4);
    
    var current_search = '';

    var current_itemCode = '',
        current_productId = '';
    function init() {
        getProductDetail(function(data) {
            current_itemCode = data.urlparam;
            current_productId = data.productId;
            current_search = current_itemCode;
            form.val('linkProductSearch', {
                search: current_search,
            });
            if (current_productId) {
                form.val('linkProductSelect', {
                    productId: current_productId,
                });
            }
            getLinkProductList();
        });
    }
    init();
    function getLinkProductList(){
        table.render({
            id: 'linkProductTable'
            ,elem: '#content-linkProduct-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('product.pro.search')
            ,method: getApiMethod('product.pro.search')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            // POST时必须添加contentType
            ,contentType: 'application/json;charset=utf-8'
            ,toolbar: false
            ,height: 'full-95'
            ,parseData: function(res) {
                if (res.code==="0000"){
                    return {
                        code: 0,
                        count: res.data.total,
                        data: res.data.records
                    }
                }
            }
            ,cols: [[
                {type:'radio',  width: 80, fixed: 'left' }
                ,{field:'title', minWidth: 200, title: 'Title', fixed: 'left', sort: true, fixed: 'left' }
                ,{field:'images', width: 200, title: 'Image', templet: '#content-linkProduct-list-images' }
                ,{field:'sku', width: 120, title: 'SKU' }
                ,{field:'productId', width: 160, title: 'Product Id' }
                ,{field:'displayPrice', width: 120, title: 'Price', sort: true }
                ,{field:'originalPrice', width: 160, title: 'Original Price', sort: true }
                ,{field:'unitSize', width: 120, title: 'Unit Size' }
                ,{width: 120, title: 'Link', templet: '#content-linkProduct-list-link' }
                ,{field:'id', width: 120, title: 'ID', sort: true, hide: true }
            ]],
            where: {
                q: current_search,
                querySuggestions: true,
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
                // 重置选择的模板
                form.val('linkProductSelect', {
                    productId: '',
                });
            }
        });
    }
    
    
    // 搜索
    form.on('submit(LAY-linkProduct-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);

        current_search = result.search;
        getLinkProductList();
    });
    // 重置搜索
    form.on('submit(LAY-linkProduct-front-reset)', function(obj) {
        form.val('linkProductSearch', {
            search: current_itemCode,
        });
        form.render();
        current_search = current_itemCode;
        getLinkProductList();
    });
    
    // 监听工具条
    table.on('tool(content-linkProduct-list)', function(obj) {
        var data = obj.data;
        var event_showPicture = 'showPicture';
        if (obj.event.substr(0, event_showPicture.length) == event_showPicture) {
            var start = obj.event.substr(event_showPicture.length + 1);
            // 点击预览图放大显示
            var previewData = [];
            for (var i in data.images) {
                previewData.push({
                    src: data.images[i],
                });
            }
            parent.layer.photos({
                photos: {
                    "start": start || 0,
                    "data": previewData
                }
                ,anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机
                ,shade: [0.8, '#EEEEEE'] //背景遮布
                ,move: false //禁止拖动
            });
        }
    });

    table.on('radio(content-linkProduct-list)', function(obj){
        var field = JSON.stringify(obj.data);
        var result = JSON.parse(field);
        // console.log(result);
        form.val('linkProductSelect', {
            productId: result.productId,
        });
    });

    function getProductDetail(success) {
        $.ajax({
            url: getApiUrl('marketing.product.detail', {id: current_id}),
            type: getApiMethod('marketing.product.detail'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function (result) {
                if (result.code === "0000") {
                    success && success(result.data);
                }
            }
        });
    }
    
});