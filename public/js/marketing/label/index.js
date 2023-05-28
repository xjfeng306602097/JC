/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingLabel/index
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer', 'dict'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer
        ,dict = layui.dict;
    
    var storage = layui.data(setter.tableName);

    var classifys = {};
    var types = {};
    // 渲染选择器
    dict.render([
        // label分类
        { elem: '#classify', dictCode: 'label_classify', value: '', success: function(res) {
            if (res.code === '0000') {
                for (var x in res.data) {
                    var item = res.data[x];
                    classifys[item.value] = item.name;
                }
            }
        }},
        // label类型
        { elem: '#type', dictCode: 'label_type', value: '', success: function(res) {
            if (res.code === '0000') {
                for (var x in res.data) {
                    var item = res.data[x];
                    types[item.value] = item.name;
                }
            }
        }},
    ], function () {
        // 渲染完成后载入table
        getMarketingLabelList();
    });
    
    var current_classify = '',
        current_type = '',
        current_name = '',
        current_status = '';
    function getMarketingLabelList(){
        table.render({
            id: 'marketingLabelTable'
            ,elem: '#content-marketingLabel-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.label.page')
            ,method: getApiMethod('marketing.label.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#marketingLabelToolbar'
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
                ,{field: 'name', width: 200, title: 'Label Name', fixed: 'left', sort: true }
                ,{field: 'value', width: 200, title: 'Value', sort: true }
                ,{field: 'classify', width: 200, title: 'Classify', sort: true, templet: function (res) {
                    return classifys[res.classify] === undefined ? 'Unknown' : classifys[res.classify];
                }}
                ,{field: 'type', width: 200, title: 'Type', sort: true, templet: function (res) {
                    return types[res.type] === undefined ? 'Unknown' : types[res.type];
                }}
                ,{field:'status', width: 90, title: 'Status', templet: '#content-marketingLabel-list-status'}
                ,{field:'sort', width: 120, title: 'Sort', sort: true }
                ,{field: 'id', width: 120, title: 'ID', sort: true }
                ,{field: 'creator', width: 160, title: 'Creator' }
                ,{field: 'gmtCreate', width: 200, title: 'Create Time', sort: true }
                ,{field: 'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field: 'gmtModified', width: 200, title: 'Last Update Time', sort: true }
            ]],
            where: {
                classify: current_classify,
                type: current_type,
                name: current_name,
                status: current_status,
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
        });
    }
    
    // 搜索
    form.on('submit(LAY-marketingLabel-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_classify = result.classify;
        current_type = result.type;
        current_name = result.name;
        current_status = result.status;
        getMarketingLabelList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingLabel-front-reset)', function(obj) {
        form.val('labelSearch', {
            classify: '',
            type: '',
            name: '',
            status: '',
        });
        form.render();
        current_classify = '';
        current_type = '';
        current_name = '';
        current_status = '';
        getMarketingLabelList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-marketingLabel-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加label
            case 'add':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Add Label'
                    ,id: 'addLabel'
                    ,content: '/makroDigital/marketingLabel/add'
                    ,maxmin: true
                    ,area: ['600px', '455px']
                    ,btn: ['Save', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-label-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            var mydata = {
                                "classify": result.classify,
                                "type": result.type,
                                "name": result.name,
                                "value": result.value,
                                "sort": result.sort,
                            };
                            
                            $.ajax({
                                url: getApiUrl('marketing.label.add'),
                                type: getApiMethod('marketing.label.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('marketingLabelTable');
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
            // 编辑label
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Label'
                        ,id: 'editLabel'
                        ,content: '/makroDigital/marketingLabel/edit/' + id
                        ,maxmin: true
                        ,area: ['600px', '455px']
                        ,btn: ['Save', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-label-edit-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                
                                var mydata = {
                                    "classify": result.classify,
                                    "type": result.type,
                                    "name": result.name,
                                    "value": result.value,
                                    "sort": result.sort,
                                };
                                
                                $.ajax({
                                    url: getApiUrl('marketing.label.update', {id: id}),
                                    type: getApiMethod('marketing.label.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('marketingLabelTable');
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
            // 删除label
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Label',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        var id = data[0].id;
                        $.ajax({
                            url: getApiUrl('marketing.label.delete', {ids: id}),
                            type: getApiMethod('marketing.label.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('marketingLabelTable');
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
            url: getApiUrl('marketing.label.update', {id: id}),
            type: getApiMethod('marketing.label.update'),
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