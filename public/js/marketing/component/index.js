/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingComponent/index
    
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
    
    var now = new Date(),
        year = now.getFullYear(),
        month = now.getMonth() + 1,
        day = now.getDate();
    laydate.render({
        elem: '#createDate'
        ,range: true
        ,value: ''
        ,trigger: 'click'
        ,min: '2021-01-01'
        ,max: year + '-' + month + '-' + day
        ,lang: 'en'
    });

    var types = {};
    dict.render({
        elem: 'select[name="type"]',
        dictCode: 'component_type',
        value: '',
        success: function (res) {
            if (res.code === '0000') {
                for (var x in res.data) {
                    var item = res.data[x];
                    types[item.value] = item.name;
                }
            }
        },
    }, function() {
        getMarketingComponentList();
    });
    
    var current_isDelete = 0,
        current_name = '',
        current_type = '',
        current_status = '',
        current_begin = undefined,
        current_end = undefined;
    function getMarketingComponentList(){
        table.render({
            id: 'marketingComponentTable'
            ,elem: '#content-marketingComponent-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.component.page')
            ,method: getApiMethod('marketing.component.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#marketingComponentToolbar'
            ,defaultToolbar: ['filter','exports']
            ,parseData: function(res) {
                if (res.code==="0000"){
                    return {
                        code: 0,
                        count: res.data.totalElements,
                        data: res.data.content
                    }
                }
            }
            ,cols: [[
                {type:'radio',  width: 80, fixed: 'left' }
                ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{width: 140, title: 'Action', fixed: 'left', templet: '#content-marketingComponent-list-action', hide: permission.exist('marketing:component:design') == 0 }
                ,{field:'name', minWidth: 200, title: 'Name', fixed: 'left', sort: true }
                ,{field:'code', width: 300, title: 'Code', hide: true }
                ,{field:'previewUrl', width: 100, title: 'Preview', templet: imgTpl }
                ,{field:'type', width: 160, title: 'Type', sort: true, templet: function (res) {
                    return types[res.type] === undefined ? 'Unknown' : types[res.type];
                }}
                ,{field:'status', width: 90, title: 'Status', templet: '#content-marketingComponent-list-status'}
                ,{field:'creator', width: 160, title: 'Creator' }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true }
            ]],
            where: {
                isDelete: current_isDelete,
                name: current_name,
                type: current_type,
                status: current_status,
                begin: current_begin,
                end: current_end,
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
        });
    }
    
    getMarketingComponentList();
    
    // 搜索
    form.on('submit(LAY-marketingComponent-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_name = result.name;
        current_type = result.type;
        current_status = result.status === '' ? undefined : result.status;
        var createDate = result.createDate;
        if (createDate === '') {
            current_begin = undefined;
            current_end = undefined;
        } else {
            var begin_end = createDate.split(' - ');
            current_begin = begin_end[0] + ' 00:00:00';
            current_end = begin_end[1] + ' 23:59:59';
        }
        getMarketingComponentList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingComponent-front-reset)', function(obj) {
        form.val('componentSearch', {
            name: '',
            type: '',
            status: '',
            createDate: '',
        });
        form.render();
        current_name = '';
        current_type = '';
        current_status = '';
        current_begin = undefined;
        current_end = undefined;
        getMarketingComponentList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-marketingComponent-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 创建组件
            case 'create':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Create Component'
                    ,id: 'createComponent'
                    ,content: '/makroDigital/marketingComponent/add'
                    ,maxmin: true
                    ,area: ['580px', '470px']
                    ,btn: ['Create', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-component-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            var mydata = {
                                "name": result.name,
                                "type": result.type,
                                "content":{
                                    "duplicate":[{"version":"4.4.0","objects":[],"width":600,"height":600,"No":(Math.round(new Date() / 1000)),"isValid":0}],
                                    "pageSize":{
                                        "paper":{"width":600,"height":600,"left":0,"top":0},
                                        "bleed":{"width":600,"height":600,"left":0,"top":0},
                                        "margins":{"width":600,"height":600,"left":0,"top":0}
                                    }
                                    
                                }
                            };
                            
                            $.ajax({
                                url: getApiUrl('marketing.component.add'),
                                type: getApiMethod('marketing.component.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('marketingComponentTable');
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
            // 编辑组件信息
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var code = data[0].code;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Component'
                        ,id: 'editComponent'
                        ,content: '/makroDigital/marketingComponent/edit/' + code
                        ,maxmin: true
                        ,area: ['580px', '470px']
                        ,btn: ['Save', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-component-edit-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                
                                var mydata = {
                                    "name": result.name,
                                    "type": result.type
                                };
                                
                                $.ajax({
                                    url: getApiUrl('marketing.component.update', {code: code}),
                                    type: getApiMethod('marketing.component.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('marketingComponentTable');
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
            // 删除组件
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Component',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        var code = data[0].code;
                        $.ajax({
                            url: getApiUrl('marketing.component.delete', {codes: code}),
                            type: getApiMethod('marketing.component.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('marketingComponentTable');
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
    table.on('tool(content-marketingComponent-list)', function(obj) {
        var data = obj.data;
        // 设计组件
        if (obj.event === 'design') {
            // var index_page = layer.open({
            //     type: 2
            //     ,title: 'Component Design : ' + data.name
            //     ,id: 'design'
            //     ,content: '/makroDigital/marketingComponent/design/' + data.code
            //     ,maxmin: true
            //     ,area: ['580px', '470px']
            //     ,btn: []
            //     ,yes: function (index, layero) {
            //         var iframeWindow = window['layui-layer-iframe' + index],
            //             submit = layero.find('iframe').contents().find('#' + submitID);

            //     }
            // });  
            // layer.full(index_page);

            var url = '/makroDigital/marketingComponent/design/' + data.code;
            var title = 'Component Design : ' + data.name;
            layui.admin.openTabsPage(url, title);
        } else if (obj.event === 'showPicture') {
            // 点击预览图放大显示
            if (data.previewUrl != null) {
                layer.photos({
                    photos: {
                        "data": [
                            { "src": data.previewUrl }
                        ]
                    }
                    ,anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机
                    ,shade: [0.8, '#EEEEEE'] //背景遮布
                    ,move: false //禁止拖动
                });
            }
        }
    });
    
});