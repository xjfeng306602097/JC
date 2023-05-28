/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingActivity/product
    
 */

parent.importData = {};
var sheet = '';
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'upload', 'table', 'layer'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,upload = layui.upload
        ,table = layui.table
        ,layer = layui.layer;

    var mmCode = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);
    var productID = null;

    form.val('marketingProductSearch', {
        isValid: 1,
        mmCode: mmCode,
    });

    var current_isvalid = 1,
        current_mmCode = mmCode,
        current_channelType = '',
        current_mmpage = '',
        current_itemcode = '',
        current_productId = '',
        current_nameen = '',
        current_namethai = '';
    function getMarketingProductList(){
        table.render({
            id: 'marketingProductTable'
            ,elem: '#content-marketingProduct-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.product.page')
            ,method: getApiMethod('marketing.product.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#marketingProductToolbar'
            ,defaultToolbar: ['filter','exports']
            ,parseData: function(res) {
                if (res.code==="0000") {
                    var data = [];
                    for (var x in res.data.records) {
                        var item = res.data.records[x].info;
                        item.pic = res.data.records[x].pic;
                        data.push(item);
                    }
                    return {
                        code: 0,
                        count: res.data.total,
                        data: data
                    }
                }
            }
            ,cols: [[
                {width: 120, title: 'Action', templet: '#content-marketingProduct-list-action', fixed: 'left', hide: permission.exist(['marketing:activity:product:delete', 'marketing:activity:product:restore']) == 0 }
                ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{field:'channelType', minWidth: 120, title: 'Channel Type' }
				,{field:'thumbnailPath', width: 140, title: 'Picture', templet: imgTpl }
                ,{field:'namethai', minWidth: 240, title: 'Name (Thai)', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'nameen', minWidth: 240, title: 'Name (EN)', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'parentCode', width: 160, title: 'Parent Code' }
                ,{field:'itemcode', width: 160, title: 'Item Code' }
                // ,{field:'urlparam', width: 160, title: 'Url Param' }
                ,{field:'productId', width: 160, title: 'Product ID', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '', hide: true }
                ,{field:'productId', width: 140, title: 'Link', templet: '#content-marketingProduct-list-link' }
                ,{field:'page', width: 120, title: 'Page', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '', sort: true }
                ,{field:'sort', width: 120, title: 'Sort', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '', sort: true }
                ,{field:'linkitemno', width: 200, title: 'LinkItemNo' }
                ,{field:'pack', width: 200, title: 'Package', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'model', width: 160, title: 'Model', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'normalprice', width: 120, title: 'Normal Price', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'promoprice', width: 120, title: 'Promo Price', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'promotedesc', width: 300, title: 'Promo Price Description', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'categoryid', width: 200, title: 'Category ID' }
                ,{field:'icon1', width: 160, title: 'Icon (1)' }
                ,{field:'icon2', width: 160, title: 'Icon (2)' }
                ,{field:'icon3', width: 160, title: 'Icon (3)' }
                ,{field:'iconRemark', width: 200, title: 'Icon Remark', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'promotype', width: 120, title: 'Promo Type', templet: function(res) {
                    switch (res.promotype) {
                        case 1:
                            return 'Normal';
                        case 2:
                            return 'Link Item';
                        default:
                            return 'Unknown';
                    }
                }}
                ,{field:'qty1', width: 80, title: 'Step1', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'qty1unit', width: 160, title: 'Sale Unit', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'promoprice1', width: 120, title: 'Promo Price 1', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'qty2', width: 80, title: 'Step2', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'qty2unit', width: 160, title: 'Step2/Unit', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'promoprice2', width: 120, title: 'Promo Price 2', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'promoprice2description', width: 240, title: 'Promo Price 2 Description', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'qty3', width: 80, title: 'Step3', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'qty3unit', width: 160, title: 'Step3/Unit', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'promoprice3', width: 120, title: 'Promo Price 3', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'promoprice3description', width: 240, title: 'Promo Price 3 Description', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'qty4', width: 80, title: 'Step4', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'qty4unit', width: 160, title: 'Step4/Unit', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'promoprice4', width: 120, title: 'Promo Price 4', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'promoprice4description', width: 240, title: 'Promo Price 4 Description', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'remark1', width: 200, title: 'Remark 1', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'remark2', width: 200, title: 'Remark 2', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'remark3', width: 200, title: 'Remark 3', edit: permission.verify('marketing:activity:product:edit') ? 'text' : '' }
                ,{field:'creator', width: 160, title: 'Creator' }
                ,{field:'gmtCreate', width: 180, title: 'Create Time', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 180, title: 'Last Update Time', sort: true }
            ]],
            where: {
                isvalid: current_isvalid,
                mmCode: current_mmCode,
                channelType: current_channelType,
                mmpage: current_mmpage,
                itemcode: current_itemcode,
                productId: current_productId,
                nameen: current_nameen,
                namethai: current_namethai,
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
        });
    }
    
    getMarketingProductList();
    
    // 搜索
    form.on('submit(LAY-marketingProduct-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_isvalid = result.isValid;
        current_mmCode = result.mmCode;
        current_channelType = result.channelType;
        current_mmpage = result.mmPage;
        current_itemcode = result.itemCode;
        current_productId = result.productId;
        getMarketingProductList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingProduct-front-reset)', function(obj) {
        form.val('marketingProductSearch', {
            isValid: 1,
            mmCode: mmCode,
            channelType: '',
            mmPage: '',
            itemCode: '',
            productId: '',
        });
        form.render();
        current_isvalid = 1;
        current_mmCode = mmCode;
        current_channelType = '';
        current_mmpage = '';
        current_itemcode = '';
        current_productId = '';
        getMarketingProductList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-marketingProduct-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加MM商品
            case 'add':
                console.log(data);
                break;
        }
    });
    
    // 监听工具条
    table.on('tool(content-marketingProduct-list)', function(obj) {
        var data = obj.data;
        // 删除产品
        if (obj.event === 'delete') {
            var id = data.id;
            layer.confirm('Confirm for delete?', {
                icon: 3,
                shade: 0.06,
                title: 'Delete Product',
                btn: ['Submit', 'Cancel'],
            }, function(index) {
                $.ajax({
                    url: getApiUrl('marketing.product.delete', {id: id}),
                    type: getApiMethod('marketing.product.delete'),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + storage.access_token
                    },
                    success: function(result) {
                        if (result.code === "0000") {
                            layer.msg(result.msg);
                            table.reload('marketingProductTable');
                        } else {
                            layer.msg(result.msg);
                        }
                    }
                });
            });
        } else if (obj.event === 'restore') {// 恢复产品
            var id = data.id;
            layer.confirm('Confirm for restore?', {
                icon: 3,
                shade: 0.06,
                title: 'Restore Product',
                btn: ['Submit', 'Cancel'],
            }, function(index) {
                $.ajax({
                    url: getApiUrl('marketing.product.restore', {id: id}),
                    type: getApiMethod('marketing.product.restore'),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + storage.access_token
                    },
                    success: function(result) {
                        if (result.code === "0000") {
                            layer.msg(result.msg);
                            table.reload('marketingProductTable');
                        } else {
                            layer.msg(result.msg);
                        }
                    }
                });
            });
        } else if (obj.event === 'replacePicture') {// 选择图片替换
            var id = data.id;
            var layerIndex = parent.layer.open({
                type: 2
                ,title: false
                ,id: 'selectProductPicture'
                ,content: '/makroDigital/product/pictureSelect/' + data.itemcode
                ,area: ['900px', '550px']
                ,closeBtn: 0
                ,shadeClose: true
                ,skin: 'layui-layer-transparent'
                ,success: function(layero, index) {
                    var iframeWindow = layero.find('iframe')[0].contentWindow,
                        submitID = 'LAY-picture-selected-submit';
                    iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                        var field = JSON.stringify(obj.field);
                        var result = JSON.parse(field);
                        var mydata = {
                            "picid": result.picID,
                        };
                        $.ajax({
                            url: getApiUrl('marketing.product.update', {id: id}),
                            type: getApiMethod('marketing.product.update'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            data: JSON.stringify(mydata),
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('marketingProductTable');
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    });
                }
            });
        } else if (obj.event === 'bindLink') {// 从Makro Pro选择链接的商品
            var id = data.id;
            var layerIndex = parent.layer.open({
                type: 2
                ,title: 'Select Link Product'
                ,id: 'selectLinkProduct'
                ,content: '/makroDigital/product/linkProductSelect/' + id
                ,maxmin: true
                ,area: ['1300px', '680px']
                ,btn: ['Confirm', 'Cancel']
                ,yes: function (index, layero) {
                    var iframeWindow = parent['layui-layer-iframe' + index],
                        submitID = 'LAY-linkProduct-select-submit',
                        submit = layero.find('iframe').contents().find('#' + submitID);

                    iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                        var field = JSON.stringify(obj.field);
                        var result = JSON.parse(field);
                        var mydata = {
                            "productId": result.productId,
                        };
                        $.ajax({
                            url: getApiUrl('marketing.product.update', {id: id}),
                            type: getApiMethod('marketing.product.update'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            data: JSON.stringify(mydata),
                            success: function(result) {
                                if (result.code === "0000") {
                                    parent.layer.close(index);
                                    layer.msg(result.msg);
                                    table.reload('marketingProductTable');
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    });
                    submit.trigger('click');
                }
            });
        } else if (obj.event === 'showPicture') {
            // 点击商品列表图片放大显示
            if (data.pic.originPath != null) {
                layer.photos({
                    photos: {
                        "data": [
                            { "src": data.pic.originPath }
                        ]
                    }
                    ,anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机
                    ,shade: [0.8, '#EEEEEE'] //背景遮布
                    ,move: false //禁止拖动
                });
            }
        }
    });

    table.on('edit(content-marketingProduct-list)', function(obj) {
        var data = obj.data;
        var value = obj.value;
        var originalValue = $(this).prev().text();// 修改之前的值
        if (obj.field == 'page' || obj.field == 'sort') {
            if (value == '' || !IsNumber(value) || value < 1 || data.promotype == 2) {
                obj.tr.find('td[data-field="' + obj.field + '"] input').val(originalValue);
                obj.data[obj.field] = originalValue;
                obj.update(obj.data);
                if (data.promotype == 2) {
                    layer.msg('this can not be done as it is linkItem');
                }
                return;
            }
        }
        var id = data.id;
        var mydata = {
            [obj.field]: value
        };
        $.ajax({
            url: getApiUrl('marketing.product.update', {id: id}),
            type: getApiMethod('marketing.product.update'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: JSON.stringify(mydata),
            success: function(result) {
                if (result.code === "0000") {
                    layer.msg(result.msg);
                    table.reload('marketingProductTable');
                } else {
                    obj.tr.find('td[data-field="' + obj.field + '"] input').val(originalValue);
                    obj.data[obj.field] = originalValue;
                    obj.update(obj.data);
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                obj.tr.find('td[data-field="' + obj.field + '"] input').val(originalValue);
                obj.data[obj.field] = originalValue;
                obj.update(obj.data);
                layer.msg('操作失败');
                console.log(e);
            }
        });
    });

});