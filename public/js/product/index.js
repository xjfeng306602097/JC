/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroAdmin/product/index
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
    autocomplete: '../layui_exts/autoComplete/autocomplete'
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer', 'autocomplete'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer
        ,autocomplete = layui.autocomplete;

    var storage = layui.data(setter.tableName);
    
    var current_nameen = '',
        current_namethai = '',
        current_itemcode = '',
        current_categoryid = '',
        current_isvalid = 1;
    function getProductList(){
        table.render({
            id: 'productTable'
            ,elem: '#content-product-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('product.page')
            ,method: getApiMethod('product.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#productToolbar'
            ,defaultToolbar: ['filter','exports']
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
                {width: 450, title: '', templet: '#content-product-list-operate', hide: permission.exist(['product:edit', 'product:price:view', 'product:picture:view', 'product:activity:view', 'product:log:view']) == 0 }
                ,{width: 80, title: 'Serial', type: 'numbers' }
                ,{field:'itemcode', width: 140, title: 'Item Code' }
                ,{field:'nameen', width: 240, title: 'Name (EN)', sort: true }
                ,{field:'namethai', width: 240, title: 'Name (Thai)', sort: true }
                ,{field:'normalprice', width: 160, title: 'Normal Price' }
                ,{field:'promoprice', width: 160, title: 'Promotion Price' }
                ,{field:'model', width: 200, title: 'Model' }
                ,{field:'pack', width: 200, title: 'Pack' }
                ,{field:'qty1unit', width: 200, title: 'Unit' }
                ,{field:'id', width: 120, title: 'ID', sort: true }
            ]],
            where: {
                nameen: current_nameen,
                namethai: current_namethai,
                itemcode: current_itemcode,
                categoryid: current_categoryid,
                isvalid: current_isvalid,
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
        });
    }
    
    getProductList();

    function initSearch() {
        // $.ajax({
        //     url: getApiUrl('product.brand.select'),
        //     type: getApiMethod('product.brand.select'),
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Authorization": 'Bearer ' + storage.access_token
        //     },
        //     success: function (result) {
        //         if (result.code == '0000') {
        //             autocomplete.render({
        //                 elem: $('input[name="brand"]'),
        //                 cache: true,
        //                 data: result.data,
        //                 template_val: '{{d}}',
        //                 template_txt: '{{d}}',
        //             });
        //         }
        //     }
        // });

        // 载入分类
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
                    var categoryTree = function (list, level) {
                        if (level === undefined) {
                            level = 0;
                        }
                        $.each(list, function(index, value) {
                            var tmp = list[index];
                            var levelText = new Array(level + 1).join('—');
                            _Html += '<option value="' + tmp.code + '"' + '>' + levelText + ' ' + tmp.name + '</option>';
                            if (Array.isArray(tmp.children) && tmp.children.length > 0) {
                                categoryTree(tmp.children, level + 1);
                            }
                        });
                    };
                    list.unshift({
                        id: '',
                        code: '',
                        name: 'Select',
                        children: [],
                    });
                    categoryTree(list);
                    $("select[name=categoryid]").html(_Html);
                    layui.form.render("select");
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }
    initSearch();
    
    // 搜索
    form.on('submit(LAY-product-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);

        current_nameen = result.nameen;
        current_namethai = result.namethai;
        current_itemcode = result.itemcode;
        current_categoryid = result.categoryid;
        getProductList();
    });
    // 重置搜索
    form.on('submit(LAY-product-front-reset)', function(obj) {
        form.val('productSearch', {
            nameen: '',
            namethai: '',
            itemcode: '',
            categoryid: '',
        });
        form.render();
        current_nameen = '';
        current_namethai = '';
        current_itemcode = '';
        current_categoryid = '';
        current_isvalid = 1;
        getProductList();
    });
    
    //头工具栏事件
    table.on('toolbar(content-product-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch(obj.event){
        case "new":
            var index_page = layer.open({
                type: 2
                ,title: 'Add Product'
                ,id: 'addData'
                ,content: '/makroDigital/product/add'
                ,maxmin: true
                ,area: ['800px', '600px']
                ,btn: ['Submit', 'Cancel']
                ,yes: function(index, layero){
                    var iframeWindow = window['layui-layer-iframe' + index],
                        submitID = 'LAY-product-add-submit',
                        submit = layero.find('iframe').contents().find('#'+ submitID);
    
                    // 监听提交
                    iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                        var field = JSON.stringify(obj.field);
                        var result = JSON.parse(field);
                        
                        var mydata = {
                            "itemcode": result.itemcode,
                            "nameen": result.nameen,
                            "namethai": result.namethai,
                            "normalprice": result.normalprice,
                            "promoprice": result.promoprice,
                            "qty1unit": result.saleunit,
                            "pack": result.pack,
                            "model": result.model,
                        };
                        
                        // console.log(mydata);
                        $.ajax({
                            url: getApiUrl('product.add'),
                            type: getApiMethod('product.add'),
                            data: JSON.stringify(mydata),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    table.reload('productTable'); //数据刷新
                                    layer.msg(result.msg);
    
                                    layer.close(index_page); //关闭弹层
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
        }
    });
    
    // 监听工具条
    table.on('tool(content-product-list)', function(obj) {
        var data = obj.data;
        // 设计组件
        if (obj.event === 'edit') {
            var index_page = layer.open({
                type: 2
                ,title: 'Edit Product - ' + data.nameen
                ,id: 'design'
                ,content: '/makroDigital/product/edit/' + data.id
                ,maxmin: true
                ,area: ['800px', '600px']
                ,btn: ['Submit','Cancel']
                ,yes: function (index, layero) {
                    var iframeWindow = window['layui-layer-iframe' + index],
                        submitID = 'LAY-product-edit-submit',
                        submit = layero.find('iframe').contents().find('#' + submitID);
                    
                    // 监听提交
                    iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                        var field = JSON.stringify(obj.field);
                        var result = JSON.parse(field);
                        
                        var mydata = {
                            "itemcode": result.itemcode,
                            "nameen": result.nameen,
                            "namethai": result.namethai,
                            "normalprice": result.normalprice,
                            "promoprice": result.promoprice,
                            "qty1unit": result.saleunit,
                            "pack": result.pack,
                            "model": result.model,
                        };
                        
                        // console.log(mydata);
                        $.ajax({
                            url: getApiUrl('product.update', {id: data.id}),
                            type: getApiMethod('product.update'),
                            data: JSON.stringify(mydata),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    table.reload('productTable'); //数据刷新
                                    layer.msg(result.msg);
    
                                    layer.close(index_page); //关闭弹层
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    });
                    submit.trigger('click');
                }
            });  
            // layer.full(index_page);
        } else if (obj.event === 'price') {
            var index_page = layer.open({
                type: 2
                ,title: 'Product Price & Promotion - ' + data.nameen
                ,id: 'design'
                ,content: '/makroDigital/product/price/' + data.id+'/'
                ,maxmin: true
                ,area: ['580px', '470px']
                ,btn: []
                ,yes: function (index, layero) {
                    var iframeWindow = window['layui-layer-iframe' + index],
                        submit = layero.find('iframe').contents().find('#' + submitID);


                }
            });  
            layer.full(index_page);
        } else if (obj.event === 'activity') {
            var index_page = layer.open({
                type: 2
                ,title: 'Product Activity - ' + data.nameen
                ,id: 'design'
                ,content: '/makroDigital/product/activity/' + data.id
                ,maxmin: true
                ,area: ['580px', '470px']
                ,btn: []
                ,yes: function (index, layero) {
                    var iframeWindow = window['layui-layer-iframe' + index],
                        submit = layero.find('iframe').contents().find('#' + submitID);


                }
            });  
            layer.full(index_page);
        } else if (obj.event === 'picture') {
            var index_page = layer.open({
                type: 2
                ,title: 'Product Picture - ' + data.nameen
                ,id: 'design'
                ,content: '/makroDigital/product/picture/' + data.id
                ,maxmin: true
                ,area: ['580px', '470px']
                ,btn: []
                ,yes: function (index, layero) {
                    var iframeWindow = window['layui-layer-iframe' + index],
                        submit = layero.find('iframe').contents().find('#' + submitID);


                }
            });  
            layer.full(index_page);
        }
    });
});