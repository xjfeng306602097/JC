/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingColor/index
    
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
    
    var current_status = '',
        current_rgb = '',
        current_cmyk = '';
    function getMarketingColorList(){
        table.render({
            id: 'marketingColorTable'
            ,elem: '#content-marketingColor-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.color.page')
            ,method: getApiMethod('marketing.color.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            // POST时必须添加contentType
            ,contentType: 'application/json;charset=utf-8'
            ,toolbar: true
            ,toolbar: '#marketingColorToolbar'
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
                ,{field:'hex', minWidth: 200, title: 'Color', templet: '#content-marketingColor-list-color' }
                ,{field:'rgb', minWidth: 200, title: 'RGB', sort: true }
                ,{field:'cmyk', minWidth: 200, title: 'CMYK' }
                ,{field:'status', width: 90, title: 'Status', templet: '#content-marketingColor-list-status'}
                ,{field:'sort', width: 120, title: 'Sort', sort: true }
                ,{field:'id', width: 120, title: 'ID', sort: true }
                ,{field:'creator', width: 160, title: 'Creator', hide: true }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true, hide: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true, hide: true }
            ]],
            where: {
                req: {
                    status: current_status,
                    rgb: current_rgb,
                    cmyk: current_cmyk,
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
    
    getMarketingColorList();
    
    // 搜索
    form.on('submit(LAY-marketingColor-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_status = result.status === '' ? undefined : result.status;
        current_rgb = result.rgb;
        current_cmyk = result.cmyk;
        getMarketingColorList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingColor-front-reset)', function(obj) {
        form.val('colorSearch', {
            status: '',
            rgb: '',
            cmyk: '',
        });
        form.render();
        current_status = '';
        current_rgb = '';
        current_cmyk = '';
        getMarketingColorList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-marketingColor-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加颜色
            case 'add':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Add Color'
                    ,id: 'addColor'
                    ,content: '/makroDigital/marketingColor/add'
                    ,maxmin: true
                    ,area: ['600px', '455px']
                    ,btn: ['Save', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-color-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            var mydata = {
                                "rgb": result.rgb,
                                "hex": result.hex,
                                "cmyk": result.cmyk,
                                "sort": result.sort
                            };
                            
                            $.ajax({
                                url: getApiUrl('marketing.color.add'),
                                type: getApiMethod('marketing.color.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('marketingColorTable');
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
            // 编辑颜色
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Color'
                        ,id: 'editColor'
                        ,content: '/makroDigital/marketingColor/edit/' + id
                        ,maxmin: true
                        ,area: ['600px', '455px']
                        ,btn: ['Save', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-color-edit-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                
                                var mydata = {
                                    "rgb": result.rgb,
                                    "hex": result.hex,
                                    "cmyk": result.cmyk,
                                    "sort": result.sort
                                };
                                
                                $.ajax({
                                    url: getApiUrl('marketing.color.update', {id: id}),
                                    type: getApiMethod('marketing.color.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('marketingColorTable');
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
            // 删除颜色
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Color',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        var id = data[0].id;
                        $.ajax({
                            url: getApiUrl('marketing.color.delete', {ids: id}),
                            type: getApiMethod('marketing.color.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('marketingColorTable');
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

    // 监听开关事件
    form.on('switch(switchStatus)', function(obj) {
        var id = obj.value;
        var status = this.checked ? 1 : 0;
        var data = {
            status: status,
        };
        $.ajax({
            url: getApiUrl('marketing.color.update', {id: id}),
            type: getApiMethod('marketing.color.update'),
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