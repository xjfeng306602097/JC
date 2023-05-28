/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingPreset/index
    
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
    
    var storage = layui.data(setter.tableName);

    // 尺寸单位数据
    var unitTypes = {};
    // 载入unit数据
    var __loadUnit_fail_number = 0;
    function loadUnit(data, success) {
        if (data == undefined) {
            data = {
                req: {},
                page: 1,
                limit: 50,
                sortItems: [
                    {
                        column: "sort",
                        asc: false
                    },
                    {
                        column: "gmtCreate",
                        asc: true
                    }
                ],
            };
        }
        $.ajax({
            url: getApiUrl('marketing.unit.page'),
            type: getApiMethod('marketing.unit.page'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: JSON.stringify(data),
            success: function(result) {
                __loadUnit_fail_number = 0;
                if (result.code === "0000") {
                    var units = result.data.records;
                    if (units != null && units.length > 0) {
                        unitTypes = {};
                        $.each(units, function(index, value) {
                            var tmp = units[index];
                            unitTypes[tmp.id] = tmp.name;
                        });
                    }
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__loadUnit_fail_number;
                console.log('loadUnit: 网络错误！');
                if (__loadUnit_fail_number < 3) {
                    setTimeout(function() {
                        loadUnit(data, success);
                    }, 100);
                } else {
                    console.log('loadUnit: 已累计3次请求失败');
                }
            }
        });
    }
    
    var current_name = '',
        current_status = '';
    function getMarketingPresetList(){
        table.render({
            id: 'marketingPresetTable'
            ,elem: '#content-marketingPreset-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.preset.page')
            ,method: getApiMethod('marketing.preset.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            // POST时必须添加contentType
            ,contentType: 'application/json;charset=utf-8'
            ,toolbar: true
            ,toolbar: '#marketingPresetToolbar'
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
                ,{width: 120, title: 'Action', fixed: 'left', templet: '#content-marketingPreset-list-action', hide: permission.exist('marketing:size:list') == 0 }
                ,{field:'name', width: 200, title: 'Preset Name', fixed: 'left', sort: true }
                ,{field:'status', width: 90, title: 'Status', templet: '#content-marketingPreset-list-status'}
                ,{field:'sort', width: 120, title: 'Sort', sort: true }
                ,{field:'remark', width: 240, title: 'Remarks' }
                ,{field:'type', width: 120, title: 'Type' }
                ,{field:'sizeRate', width: 120, title: 'Size Rate' }
                ,{field:'width', width: 120, title: 'Width' }
                ,{field:'height', width: 120, title: 'Height' }
                ,{field:'unit', width: 120, title: 'Unit', templet: function(res) {
                    return unitTypes[res.unit] === undefined ? 'Unknown' : unitTypes[res.unit];
                }}
                ,{field:'dpi', width: 120, title: 'DPI' }
                ,{field:'marginTop', width: 140, title: 'margin Top' }
                ,{field:'marginBottom', width: 140, title: 'margin Bottom' }
                ,{field:'marginIn', width: 140, title: 'margin In' }
                ,{field:'marginOut', width: 140, title: 'margin Out' }
                ,{field:'bleedLineTop', width: 150, title: 'bleed Line Top' }
                ,{field:'bleedLineBottom', width: 150, title: 'bleed Line Bottom' }
                ,{field:'bleedLineIn', width: 150, title: 'bleed Line In' }
                ,{field:'bleedLineOut', width: 150, title: 'bleed Line Out' }
                ,{field:'id', width: 120, title: 'ID', sort: true }
                ,{field:'creator', width: 160, title: 'Creator' }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true }
            ]],
            where: {
                req: {
                    name: current_name,
                    status: current_status,
                },
                sortItems: [
                    {
                        column: "sort",
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

    //初始化页面
    function init() {
        // 载入unit后再依次载入其他数据
        loadUnit(null, function() {
            getMarketingPresetList();
        });
    }
    init();
    
    // 搜索
    form.on('submit(LAY-marketingPreset-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_name = result.name;
        current_status = result.status === '' ? undefined : result.status;
        getMarketingPresetList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingPreset-front-reset)', function(obj) {
        form.val('presetSearch', {
            name: '',
            status: '',
        });
        form.render();
        current_name = '';
        current_status = '';
        getMarketingPresetList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-marketingPreset-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加预设
            case 'add':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Add Preset'
                    ,id: 'addPreset'
                    ,content: '/makroDigital/marketingPreset/add'
                    ,maxmin: true
                    ,area: ['800px', '701px']
                    ,btn: ['Save', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-preset-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            var mydata = {
                                "name": result.name,
                                "sort": result.sort,
                                "width": result.width,
                                "height": result.height,
                                "unit": result.unit,
                                "dpi": result.DPI,
                                "remark": result.remark,
                                "marginTop": result.marginTop,
                                "marginBottom": result.marginBottom,
                                "marginIn": result.marginIn,
                                "marginOut": result.marginOut,
                                "bleedLineTop": result.bleedLineTop,
                                "bleedLineBottom": result.bleedLineBottom,
                                "bleedLineIn": result.bleedLineIn,
                                "bleedLineOut": result.bleedLineOut,
                            };
                            
                            $.ajax({
                                url: getApiUrl('marketing.preset.add'),
                                type: getApiMethod('marketing.preset.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('marketingPresetTable');
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
            // 编辑预设
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Preset'
                        ,id: 'editPreset'
                        ,content: '/makroDigital/marketingPreset/edit/' + id
                        ,maxmin: true
                        ,area: ['800px', '701px']
                        ,btn: ['Save', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-preset-edit-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                
                                var mydata = {
                                    "name": result.name,
                                    "sort": result.sort,
                                    "width": result.width,
                                    "height": result.height,
                                    "unit": result.unit,
                                    "dpi": result.DPI,
                                    "remark": result.remark,
                                    "marginTop": result.marginTop,
                                    "marginBottom": result.marginBottom,
                                    "marginIn": result.marginIn,
                                    "marginOut": result.marginOut,
                                    "bleedLineTop": result.bleedLineTop,
                                    "bleedLineBottom": result.bleedLineBottom,
                                    "bleedLineIn": result.bleedLineIn,
                                    "bleedLineOut": result.bleedLineOut,
                                };
                                
                                $.ajax({
                                    url: getApiUrl('marketing.preset.update', {id: id}),
                                    type: getApiMethod('marketing.preset.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('marketingPresetTable');
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
            // 删除预设
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Preset',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        var id = data[0].id;
                        $.ajax({
                            url: getApiUrl('marketing.preset.delete', {ids: id}),
                            type: getApiMethod('marketing.preset.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('marketingPresetTable');
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
    
    // 监听工具条
    table.on('tool(content-marketingPreset-list)', function(obj) {
        var data = obj.data;
        // 设计组件
        if (obj.event === 'size') {
            var index_page = layer.open({
                type: 2
                ,title: 'Preset Size : ' + data.name
                ,id: 'size'
                ,content: '/makroDigital/marketingSize/index?sizeRate=' + data.sizeRate
                ,maxmin: true
                ,area: ['1100px', '680px']
                ,yes: function (index, layero) {
                    var iframeWindow = window['layui-layer-iframe' + index],
                        submit = layero.find('iframe').contents().find('#' + submitID);

                }
            });
            // layer.full(index_page);
        }
    });

    // 监听开关事件
    form.on('switch(switchStatus)', function(obj) {
        var id = obj.value;
        var status = this.checked ? 1 : 0;
        var data = {
            status: status,
        };
        $.ajax({
            url: getApiUrl('marketing.preset.update', {id: id}),
            type: getApiMethod('marketing.preset.update'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: JSON.stringify(data),
            success: function(result) {
                if (result.code === "0000") {
                    layer.msg(result.msg);
                } else {
                    obj.elem.checked = !status;
                    form.render('checkbox');
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                obj.elem.checked = !status;
                form.render('checkbox');
                layer.msg('切换失败');
                console.log(e);
            }
        });
    });
    
});