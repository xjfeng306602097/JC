/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingTemplate/index
    
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

    // 选中项
    var selectedItem;
    
    var current_isDelete = 0,
        current_name = '',
        current_status = '',
        current_begin = undefined,
        current_end = undefined,
        current_pageOption = '';
    function getMarketingTemplateList(){
        var actionBtns = permission.exist(['marketing:template:design', 'marketing:template:approval:detail']);
        table.render({
            id: 'marketingTemplateTable'
            ,elem: '#content-marketingTemplate-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.template.page')
            ,method: getApiMethod('marketing.template.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#marketingTemplateToolbar'
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
                ,{field:'status', width: 180, title: 'Status', fixed: 'left', templet: '#content-marketingTemplate-list-status' }
                ,{width: actionBtns * 95, title: 'Action', fixed: 'left', templet: '#content-marketingTemplate-list-action', hide: actionBtns == 0 }
                ,{field:'name', minWidth: 200, title: 'Name', fixed: 'left', sort: true }
                ,{field:'code', width: 300, title: 'Code', hide: true }
                ,{field:'previewPath', width: 100, title: 'Preview', templet: imgTpl}
                ,{width: 200, title: 'Size', templet: function(res) {
                    var unit = res.configUnitName || '';
                    return res.configW + ' * ' + res.configH + ' ' + unit;
                }}
                ,{field:'configDpi', width: 100, title: 'DPI' }
                ,{field:'pageOption', width: 100, title: 'Slice' }
                ,{field:'templatePageTotal', width: 100, title: 'Page' }
                ,{field:'version', width: 120, title: 'Version', hide: true }
                // ,{field:'id', width: 240, title: 'ID', sort: true }
                ,{field:'creator', width: 160, title: 'Creator' }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true }
            ]],
            where: {
                isDelete: current_isDelete,
                name: current_name,
                status: current_status,
                begin: current_begin,
                end: current_end,
                pageOption: current_pageOption
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
        });
    }
    
    getMarketingTemplateList();
    
    // 搜索
    form.on('submit(LAY-marketingTemplate-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_name = result.name;
        current_status = result.status;
        var createDate = result.createDate;
        if (createDate === '') {
            current_begin = undefined;
            current_end = undefined;
        } else {
            var begin_end = createDate.split(' - ');
            current_begin = begin_end[0] + ' 00:00:00';
            current_end = begin_end[1] + ' 23:59:59';
        }
        current_pageOption = result.pageOption;
        getMarketingTemplateList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingTemplate-front-reset)', function(obj) {
        form.val('templateSearch', {
            name: '',
            pageOption: '',
            status: '',
            createDate: '',
        });
        form.render();
        current_name = '';
        current_status = '';
        current_begin = undefined;
        current_end = undefined;
        current_pageOption = '';
        getMarketingTemplateList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-marketingTemplate-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        selectedItem = data[0];
        
        switch (obj.event) {
            // 创建模板
            case 'create':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Create Template'
                    ,id: 'createTemplate'
                    ,content: '/makroDigital/marketingTemplate/add'
                    ,maxmin: true
                    ,area: ['1040px', '650px']
                    ,btn: ['Create', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-template-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);

                            var mydata = {
                                "name": result.templateName,
                                "bleedLineTop": result.bleedLineTop,
                                "bleedLineBottom": result.bleedLineBottom,
                                "bleedLineIn": result.bleedLineIn,
                                "bleedLineOut": result.bleedLineOut,
                                "configDpi": result.DPI,
                                "configW": result.width,
                                "configH": result.height,
                                "configUnitID": result.unit,
                                "marginTop": result.marginTop,
                                "marginBottom": result.marginBottom,
                                "marginIn": result.marginIn,
                                "marginOut": result.marginOut,
                                "pageWidth": result.pageWidth,
                                "pageHeight": result.pageHeight,
                                "createType": 0,
                                "status": 1,
                                "presetId": result.presetId,
                                "pageOption": result.pageOption,
                                "templatePageList":[
                                    {
                                        "content": {
                                            "duplicate":[{"version":"4.4.0","objects":[],"width":result.pageWidth,"height":result.pageHeight,"No":(Math.round(new Date() / 1000)),"isValid":0}],
                                        },
                                        "isValid": 1,
                                        "sort": 1,
                                        "storageType": 1
                                    }
                                ]
                            };
                            
                            AjaxRequest({
                                url: getApiUrl('marketing.template.add'),
                                method: getApiMethod('marketing.template.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                loading: true,
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('marketingTemplateTable');
                                    } else {
                                        layer.msg(result.msg);
                                    }
                                },
                            }).lock();
                        });
                        submit.trigger('click');
                    }
                });
                //layer.full(index_page);
                break;
            // 编辑模板信息
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var code = data[0].code;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Template'
                        ,id: 'editTemplate'
                        ,content: '/makroDigital/marketingTemplate/edit/' + code
                        ,maxmin: true
                        ,area: ['1040px', '650px']
                        ,btn: ['Save', 'Cancel']
                        ,success: function() {
                            lockTemplate(code);
                        }
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-template-update-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                var mydata = {
                                    "name": result.templateName,
                                    "bleedLineTop": result.bleedLineTop,
                                    "bleedLineBottom": result.bleedLineBottom,
                                    "bleedLineIn": result.bleedLineIn,
                                    "bleedLineOut": result.bleedLineOut,
                                    "configDpi": result.DPI,
                                    "configW": result.width,
                                    "configH": result.height,
                                    "configUnitID": result.unit,
                                    "marginTop": result.marginTop,
                                    "marginBottom": result.marginBottom,
                                    "marginIn": result.marginIn,
                                    "marginOut": result.marginOut,
                                    "pageWidth": result.pageWidth,
                                    "pageHeight": result.pageHeight,
                                    "zoomPosition": result.zoomPosition,
                                };
                                
                                $.ajax({
                                    url: getApiUrl('marketing.template.update', {code: code}),
                                    type: getApiMethod('marketing.template.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('marketingTemplateTable');
                                        } else {
                                            layer.msg(result.msg);
                                        }
                                    }
                                });
                            });
                            submit.trigger('click');
                        }
                        ,end: function() {
                            unlockTemplate(code);
                        }
                    });
                }
                break;
            // 删除模板
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var code = data[0].code;
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Template',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        $.ajax({
                            url: getApiUrl('marketing.template.delete', {codes: code}),
                            type: getApiMethod('marketing.template.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('marketingTemplateTable');
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    });
                }
                break;
            // 设计完成
            case 'finish':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    if (data[0].status == '0') {
                        layer.msg("Please design first");
                        return false;
                    }
                    if (data[0].status != '1') {
                        layer.msg("Operation not allowed");
                        return false;
                    }
                    var type = 'TEMPLATE';
                    var code = data[0].code;
                    var name = data[0].name;
                    getPreviewImage(code, function(images) {
                        // 弹出提交审核窗口
                        var index_page = layer.open({
                            type: 2
                            ,title: 'Design Finish'
                            ,id: 'designFinish'
                            ,content: '/makroDigital/approvalApplication/index/' + type
                            ,maxmin: true
                            ,area: ['60%', '500px']
                            ,btn: ['Submit', 'Cancel']
                            ,yes: function (index, layero) {
                                var iframeWindow = window['layui-layer-iframe' + index],
                                    submitID = 'LAY-approval-application-submit',
                                    submit = layero.find('iframe').contents().find('#' + submitID);
                
                                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                    var field = JSON.stringify(obj.field);
                                    var result = JSON.parse(field);
                                    var mydata = {
                                        "type": type,
                                        "name": "Template-" + name + " [Design Finish]",
                                        "code": code,
                                        "htmlRemark": result.remark,
                                        "description": result.description,
                                        "previewUrl": images.join(','),
                                    };
                                    
                                    $.ajax({
                                        url: getApiUrl('approval.process.add'),
                                        type: getApiMethod('approval.process.add'),
                                        data: JSON.stringify(mydata),
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": 'Bearer ' + storage.access_token
                                        },
                                        success: function(result) {
                                            if (result.code === "0000") {
                                                layer.msg(result.msg);
                                                layer.close(index_page);
                                                table.reload('marketingTemplateTable');
                                            } else {
                                                layer.msg(result.msg);
                                            }
                                        }
                                    });
                                });
                                submit.trigger('click');
                            }
                        });
                    });
                }
                break;
            // 设计完成回滚
            case 'rollback':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var code = data[0].code;

                    if (data[0].status != '3') {
                        layer.msg("Operation not allowed");
                        return false;
                    }
                    layer.confirm('Confirm for rollback?', {
                        icon: 3,
                        title: 'Rollback',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        AjaxRequest({
                            url: getApiUrl('marketing.template.rollback', { code: code }),
                            method: getApiMethod('marketing.template.rollback'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            loading: true,
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('marketingTemplateTable');
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        }).lock();
                    });
                }
                break;
            default:
                break;
        }
    });
    
    // 监听工具条
    table.on('tool(content-marketingTemplate-list)', function(obj) {
        var data = obj.data;
        selectedItem = data;
        // 设计模板
        if (obj.event === 'design') {
            // var index_page = layer.open({
            //     type: 2
            //     ,title: 'Template Design : ' + data.name
            //     ,id: 'design'
            //     ,content: '/makroDigital/marketingTemplate/design/' + data.code
            //     ,maxmin: true
            //     ,area: ['580px', '470px']
            //     ,btn: []
            //     ,yes: function (index, layero) {
            //         var iframeWindow = window['layui-layer-iframe' + index],
            //             submitID = 'LAY-goods-edit-submit',
            //             submit = layero.find('iframe').contents().find('#' + submitID);


            //     }
            // });  
            // layer.full(index_page);

            var url = '/makroDigital/marketingTemplate/design/' + data.code;
            var title = 'Template Design : ' + data.name;
            layui.admin.openTabsPage(url, title);
        } else if (obj.event === 'approvalDetail') {// 查看审核日志
            var index_page = layer.open({
                type: 2
                ,title: 'Approval Detail : ' + data.name
                ,id: 'approvalDetail'
                ,content: '/makroDigital/approvalProcess/approveDetail/' + data.code
                ,maxmin: true
                ,area: ['700px', '500px']
                ,success: function (layero, index) {
                    
                }
            });
        } else if (obj.event === 'showPicture') {
            // 点击预览图放大显示
            getPreviewImage(data.code, function(images) {
                if (images.length > 0) {
                    var previewData = [];
                    for (var i in images) {
                        var page = parseInt(i) + 1;
                        previewData.push({
                            alt: 'p' + page,
                            src: images[i],
                        });
                    }
                    layer.photos({
                        photos: {
                            "data": previewData
                        }
                        ,anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机
                        ,shade: [0.8, '#EEEEEE'] //背景遮布
                        ,move: false //禁止拖动
                    });
                } else {
                    layer.msg('No preview');
                }
            });
        }
    });

    // 获取模板全部预览图
    function getPreviewImage(code, success) {
        AjaxRequest({
            url: getApiUrl('marketing.template.detail', { code: code }),
            method: getApiMethod('marketing.template.detail'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: {
                // 不返回模板页面内容
                "content": 0,
            },
            loading: true,
            success: function(result) {
                if (result.code === "0000") {
                    var previewUrl = [];
                    if (result.data.previewMap != null) {
                        var previewMap = JSON.parse(result.data.previewMap);
                        if (Array.isArray(previewMap.data)) {
                            for (var i in previewMap.data) {
                                previewUrl.push(previewMap.data[i].previewUrl);
                            }
                        }
                    }
                    success && success(previewUrl);
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                layer.msg('Error');
            }
        }).lock();
    }

    // 锁定的模板code
    var lockTemplateCode = null;

    // 锁定模板
    function lockTemplate(code, fail) {
        if (fail === undefined) {
            fail = function(result) {
                layer.msg(result.msg);
            };
        }
        $.ajax({
            url: getApiUrl('marketing.template.lock', {code: code}),
            type: getApiMethod('marketing.template.lock'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                if (result.code !== "0000") {
                    fail && fail(result);
                } else {
                    lockTemplateCode = code;
                }
            }
        });
    }

    // 解锁模板
    function unlockTemplate(code, fail) {
        if (fail === undefined) {
            fail = function(result) {
                layer.msg(result.msg);
            };
        }
        $.ajax({
            url: getApiUrl('marketing.template.unlock', {code: code}),
            type: getApiMethod('marketing.template.unlock'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                if (result.code !== "0000") {
                    fail && fail(result);
                } else {
                    lockTemplateCode = null;
                }
            }
        });
    }

    window.onbeforeunload = function() {
        // 将锁定的模板解锁
        if (lockTemplateCode != null) {
            unlockTemplate(lockTemplateCode);
        }
    };
    
});