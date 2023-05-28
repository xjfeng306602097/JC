/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingSize/index
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer;
    
    var sizeRate = $('input[name="bindSizeRate"]').val();

    var storage = layui.data(setter.tableName);
    
    var current_name = '',
        current_sizeRate = sizeRate;
    function getMarketingSizeList(){
        table.render({
            id: 'marketingSizeTable'
            ,elem: '#content-marketingSize-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.size.page')
            ,method: getApiMethod('marketing.size.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            // POST时必须添加contentType
            ,contentType: 'application/json;charset=utf-8'
            ,toolbar: true
            ,toolbar: '#marketingSizeToolbar'
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
                {type:'radio',  width: 80, fixed: 'left' }
                ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{field:'name', width: 200, title: 'Size Name', fixed: 'left', sort: true, fixed: 'left' }
                ,{field:'sizeRate', width: 160, title: 'Size Rate' }
                ,{field:'width', width: 120, title: 'Width' }
                ,{field:'height', width: 120, title: 'Height' }
                ,{field:'remark', width: 240, title: 'Remarks' }
                ,{field:'id', width: 120, title: 'ID', sort: true }
                ,{field:'creator', width: 160, title: 'Creator' }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true }
            ]],
            where: {
                req: {
                    name: current_name,
                    sizeRate: current_sizeRate,
                },
                sortItems: [
                    {
                        column: "sizeRate",
                        asc: false
                    },
                    {
                        column: "gmtCreate",
                        asc: true
                    }
                ],
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
        });
    }
    
    getMarketingSizeList();
    
    // 搜索
    form.on('submit(LAY-marketingSize-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_name = result.name;
        current_sizeRate = result.sizeRate;
        getMarketingSizeList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingSize-front-reset)', function(obj) {
        form.val('sizeSearch', {
            name: '',
            sizeRate: sizeRate,
        });
        form.render();
        current_name = '';
        current_sizeRate = sizeRate;
        getMarketingSizeList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-marketingSize-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加尺寸单位
            case 'add':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Add Size'
                    ,id: 'addUnit'
                    ,content: '/makroDigital/marketingSize/add'
                    ,maxmin: true
                    ,area: ['580px', '470px']
                    ,btn: ['Save', 'Cancel']
                    ,success: function(layero, index) {
                        var iframeWindow = window['layui-layer-iframe' + index];
                        var $ = iframeWindow.layui.$;
                        if (sizeRate != '') {
                            $('input[name="width"]').on("input propertychange", function() {
                                var height = parseInt($(this).val() / parseFloat(sizeRate));
                                $('input[name="height"]').val(height);
                            });
                            $('input[name="height"]').on("input propertychange", function() {
                                var width = parseInt($(this).val() * parseFloat(sizeRate));
                                $('input[name="width"]').val(width);
                            });
                        }
                    }
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-size-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);

                            var rate = round(result.width / result.height, 2);
                            if (sizeRate != '' && rate != sizeRate) {
                                layer.msg('The current width/height ratio does not match the preset ratio', {
                                    icon: 5
                                });
                                return false;
                            }

                            var mydata = {
                                "name": result.name,
                                "width": result.width,
                                "height": result.height,
                                "remark": result.remark
                            };
                            
                            $.ajax({
                                url: getApiUrl('marketing.size.add'),
                                type: getApiMethod('marketing.size.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('marketingSizeTable');
                                    } else {
                                        layer.msg(result.msg);
                                    }
                                }
                            });
                        });
                        submit.trigger('click');
                    }
                });
                //layer.full(index_page);
                break;
            // 编辑尺寸单位
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Size'
                        ,id: 'editUnit'
                        ,content: '/makroDigital/marketingSize/edit/' + id
                        ,maxmin: true
                        ,area: ['580px', '470px']
                        ,btn: ['Save', 'Cancel']
                        ,success: function(layero, index) {
                            var iframeWindow = window['layui-layer-iframe' + index];
                            var $ = iframeWindow.layui.$;
                            if (sizeRate != '') {
                                $('input[name="width"]').on("input propertychange", function() {
                                    var height = parseInt($(this).val() / parseFloat(sizeRate));
                                    $('input[name="height"]').val(height);
                                });
                                $('input[name="height"]').on("input propertychange", function() {
                                    var width = parseInt($(this).val() * parseFloat(sizeRate));
                                    $('input[name="width"]').val(width);
                                });
                            }
                        }
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-size-edit-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);

                                var rate = round(result.width / result.height, 2);
                                if (sizeRate != '' && rate != sizeRate) {
                                    layer.msg('The current width/height ratio does not match the preset ratio', {
                                        icon: 5
                                    });
                                    return false;
                                }
                                
                                var mydata = {
                                    "name": result.name,
                                    "width": result.width,
                                    "height": result.height,
                                    "remark": result.remark
                                };
                                
                                $.ajax({
                                    url: getApiUrl('marketing.size.update', {id: id}),
                                    type: getApiMethod('marketing.size.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('marketingSizeTable');
                                        } else {
                                            layer.msg(result.msg);
                                        }
                                    }
                                });
                            });
                            submit.trigger('click');
                        }
                    });
                }
                break;
            // 删除尺寸单位
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Size',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        var id = data[0].id;
                        $.ajax({
                            url: getApiUrl('marketing.size.delete', {ids: id}),
                            type: getApiMethod('marketing.size.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('marketingSizeTable');
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    });
                }
                break;
            default:
                break;
        }
    });

    // 真正的四舍五入算法
    function round(number, d) {
        var s = number + "";
        if (!d) d = 0;
        if (s.indexOf(".") == -1) s += ".";
        s += new Array(d + 1).join("0");
        if (new RegExp("^(-|\\+)?(\\d+(\\.\\d{0," + (d + 1) + "})?)\\d*$").test(s)) {
            var s = "0" + RegExp.$2,
                pm = RegExp.$1,
                a = RegExp.$3.length,
                b = true;
            if (a == d + 2) {
                a = s.match(/\d/g);
                if (parseInt(a[a.length - 1]) > 4) {
                    for (var i = a.length - 2; i >= 0; i--) {
                        a[i] = parseInt(a[i]) + 1;
                        if (a[i] == 10) {
                            a[i] = 0;
                            b = i != 1;
                        } else break;
                    }
                }
                s = a.join("").replace(new RegExp("(\\d+)(\\d{" + d + "})\\d$"), "$1.$2");
            }
            if (b) s = s.substr(1);
            return (pm + s).replace(/\.$/, "");
        }
        return number + "";
    }
    
});