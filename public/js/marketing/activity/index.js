/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingActivity/index
    
 */

// 查询指定状态的MM
var only_statusList;
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
    var langData = window.language.data;
    // 切换到中文
    // window.language.setVersion('zh_CN');
    console.log(window.language);

    // 页面显示时刷新数据
    window.onshow = function() {
        getMarketingActivityList();
    };

    var filterStore = xmSelect.render({
        el: '#store',
        style: {
            minHeight: '38px',
            lineHeight: '38px',
            boxSizing: 'border-box',
        },
        data: [],
        language: 'en',
        tips: 'Select',
        template: function(obj) {
            return obj.item.name  + '<span style="position: absolute; right: 0; color: #8799a3">' + obj.value + '</span>';
        },
        on: function(data) {
            var arr = data.arr;
            //change, 此次选择变化的数据,数组
            var change = data.change;
            //isAdd, 此次操作是新增还是删除
            var isAdd = data.isAdd;

            var result = arr;
            
            var list = [];
            for (var x in result) {
                list.push(result[x].value);
            }
            current_storeCode = list;
            return result;
        },
    });
    loadStoreList();
    loadActivityType('');

    laydate.render({
        elem: '#activityDate'
        ,range: true
        ,value: ''
        ,trigger: 'click'
        ,min: '2021-01-01'
        ,lang: 'en'
    });

    // 选中项
    var selectedItem;

    // 存储模板选择信息
    var template_pageOption = '';
    var template_pageConfig = null;
    var template_canvasPages = null;
    
    var current_mmCode = '',
        current_title = '',
        current_storeCode = [],
        current_type = '',
        current_status = '',
        current_statusList = only_statusList || undefined,
        current_startTime = undefined,
        current_endTime = undefined;

    function getMarketingActivityList(){
        var actionBtns = permission.exist(['marketing:activity:design', 'marketing:activity:preview', 'marketing:activity:export', 'marketing:activity:approval:detail']);
        table.render({
            id: 'marketingActivityTable'
            ,elem: '#content-marketingActivity-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.activity.page')
            ,method: getApiMethod('marketing.activity.page')
            ,contentType: 'application/json'
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#marketingActivityToolbar'
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
                {type:'radio', width: 60, fixed: 'left' }
                ,{field:'status', width: 240, title: 'Status', fixed: 'left', templet: '#content-marketingActivity-list-status' }
                ,{width: actionBtns * 80, title: 'Action', fixed: 'left', templet: '#content-marketingActivity-list-action', hide: actionBtns == 0 }
                ,{width: 180, title: 'Product', fixed: 'left', templet: '#content-marketingActivity-list-product', hide: permission.exist(['marketing:activity:importExcel', 'marketing:activity:product:view']) == 0 }
                ,{field:'title', width: 200, title: 'Name', fixed: 'left', sort: true }
                ,{field:'previewUrl', width: 100, title: 'Preview', templet: imgTpl}
                ,{field:'storeCode', width: 120, title: 'Store', templet: function(res) {
                    if (res.storeCode === null) {
                        return '';
                    }
                    if (res.storeCode == 999) {
                        return 'ALL';
                    }
                    return res.storeCode;
                }}
                ,{field:'remark', width: 200, title: 'Remarks' }
                // ,{field:'itemCount', width: 140, title: 'Product Count', sort: true }
                ,{field:'mmCode', width: 320, title: 'MM Code', hide: true }
                ,{field:'mmTemplateCode', width: 300, title: 'MM Template Code', hide: true }
                ,{width: 310, title: 'Activity Time', templet: function(res) {
                    return res.startTime + ' to ' + res.endTime;
                }}
                ,{field:'creator', width: 160, title: 'Creator' }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true }
            ]],
            where: {
                code: current_mmCode,
                title: current_title,
                storeCode: current_storeCode,
                type: current_type,
                status: current_status,
                startTime: current_startTime,
                endTime: current_endTime,
                statusList: current_statusList,
                templateInfo: 1,
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
        });
    }
    
    getMarketingActivityList();
    
    // 搜索
    form.on('submit(LAY-marketingActivity-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_title = result.title;
        current_mmCode = result.mmCode;
        current_type = result.type;
        current_status = result.status;
        var activityDate = result.activityDate;
        if (activityDate === '') {
            current_startTime = undefined;
            current_endTime = undefined;
        } else {
            var begin_end = activityDate.split(' - ');
            current_startTime = begin_end[0] + ' 00:00:00';
            current_endTime = begin_end[1] + ' 23:59:59';
        }
        getMarketingActivityList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingActivity-front-reset)', function(obj) {
        form.val('activitySearch', {
            title: '',
            mmCode: '',
            store: '',
            type: '',
            status: '',
            activityDate: '',
        });
        form.render();
        filterStore.setValue([]);
        current_title = '';
        current_mmCode = '';
        current_storeCode = [];
        current_type = '';
        current_status = '';
        current_startTime = undefined;
        current_endTime = undefined;
        getMarketingActivityList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-marketingActivity-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        selectedItem = data[0];
        
        switch (obj.event) {
            // 快速创建
            case 'quickCreate':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Quick Create Activity'
                    ,id: 'quickCreateActivity'
                    ,content: '/makroDigital/marketingActivity/quickAdd'
                    ,maxmin: true
                    ,area: ['100%', '100%']
                    ,end: function() {
                        table.reload('marketingActivityTable');
                    }
                });
                //layer.full(index_page);
                break;
            // 创建活动
            case 'create':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Create Activity'
                    ,id: 'createActivity'
                    ,content: '/makroDigital/marketingActivity/add'
                    ,maxmin: true
                    ,area: ['1000px', '630px']
                    ,btn: ['Create', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-activity-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            var mydata = {
                                "title": result.title,
                                "type": result.type,
                                "startTime": result.startTime,
                                "endTime": result.endTime,
                                "storeCode": result.store,
                                "memberType": result.memberType,
                                "segment": result.segment,
                                "remark": result.remark,
                                "status": "0"
                            };
                            
                            $.ajax({
                                url: getApiUrl('marketing.activity.add'),
                                type: getApiMethod('marketing.activity.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('marketingActivityTable');
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
            // 编辑活动
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Activity'
                        ,id: 'editActivity'
                        ,content: '/makroDigital/marketingActivity/edit/' + id
                        ,maxmin: true
                        ,area: ['1000px', '630px']
                        ,btn: ['Save', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-activity-update-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                var mydata = {
                                    "title": result.title,
                                    "type": result.type,
                                    "startTime": result.startTime,
                                    "endTime": result.endTime,
                                    "storeCode": result.store,
                                    "memberType": result.memberType,
                                    "segment": result.segment,
                                    "remark": result.remark,
                                };
                                
                                $.ajax({
                                    url: getApiUrl('marketing.activity.update', {id: id}),
                                    type: getApiMethod('marketing.activity.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('marketingActivityTable');
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
            // 删除活动
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Activity',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        $.ajax({
                            url: getApiUrl('marketing.activity.delete', {ids: id}),
                            type: getApiMethod('marketing.activity.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('marketingActivityTable');
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
                    if (data[0].status == '1') {
                        layer.msg("Please design first");
                        return false;
                    }
                    if (data[0].status != '2') {
                        layer.msg("Operation not allowed");
                        return false;
                    }
                    var type = 'MM-DESIGN';
                    var mmCode = data[0].mmCode;
                    var name = data[0].title;
                    getPreviewImage(mmCode, function(images) {
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
                                        "name": "MM-" + name + " [Design Finish]",
                                        "code": mmCode,
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
                                                table.reload('marketingActivityTable');
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
            // 发布活动
            case 'publish':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    if (data[0].status < '4') {
                        layer.msg("This activity has not finished design and cannot be published");
                        return false;
                    }
                    if (data[0].status == '5') {
                        layer.msg("This activity has been submitted for publication review");
                        return false;
                    }
                    if (data[0].status == '6') {
                        layer.msg("This activity has been published successfully");
                        return false;
                    }
                    if (data[0].status != '4') {
                        layer.msg("Operation not allowed");
                        return false;
                    }
                    // var mmCode = data[0].mmCode;
                    // var index_page = layer.open({
                    //     type: 2
                    //     ,title: 'Publish Activity'
                    //     ,id: 'publishActivity'
                    //     ,content: '/makroDigital/marketingActivity/publish/' + mmCode
                    //     ,maxmin: true
                    //     ,area: ['450px', '650px']
                    //     ,btn: ['Publish', 'Cancel']
                    //     ,yes: function (index, layero) {
                    //         var iframeWindow = window['layui-layer-iframe' + index],
                    //             submitID = 'LAY-activity-publish-submit',
                    //             submit = layero.find('iframe').contents().find('#' + submitID);
            
                    //         iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    //             var field = JSON.stringify(obj.field);
                    //             var result = JSON.parse(field);
                    //             if (result.mmCode == '' || result.path == '') {
                    //                 layer.msg('Please wait for loading to complete');
                    //                 return false;
                    //             }

                    //             var mydata = {
                    //                 "mmCode": result.mmCode,
                    //                 "mode": result.mode,
                    //                 "path": result.path,
                    //                 "previewUrl": result.previewUrl,
                    //             };
                                
                    //             AjaxRequest({
                    //                 url: getApiUrl('marketing.activity.publish'),
                    //                 method: getApiMethod('marketing.activity.publish'),
                    //                 headers: {
                    //                     "Content-Type": "application/json",
                    //                     "Authorization": 'Bearer ' + storage.access_token
                    //                 },
                    //                 data: JSON.stringify(mydata),
                    //                 loading: true,
                    //                 success: function(result) {
                    //                     if (result.code === "0000") {
                    //                         // layer.close(index_page);
                    //                         layer.msg(result.msg);
                    //                         table.reload('marketingActivityTable');
                    //                         iframeWindow.publishSuccess(result.publishUrl);
                    //                     } else {
                    //                         layer.msg(result.msg);
                    //                     }
                    //                 }
                    //             }).lock();
                    //         });
                    //         submit.trigger('click');
                    //     }
                    // });
                    // $('#layui-layer' + index_page).find('.layui-layer-btn .layui-layer-btn0').css({
                    //     'border-color': 'rgb(255, 129, 0)',
                    //     'background-color': 'rgb(255, 129, 0)',
                    // });

                    // 提交审核代码，待完善
                    var type = 'MM-PUBLISH';
                    var mmCode = data[0].mmCode;
                    var name = data[0].title;
                    // 弹出提交审核窗口
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Publish Activity : ' + name
                        ,id: 'mmPublish'
                        ,content: '/makroDigital/marketingActivity/publish/' + mmCode
                        ,maxmin: true
                        ,area: ['68%', '600px']
                        ,btn: ['Submit', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-approval-application-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);

                                var channel = {};
                                if (result['channel_h5'] == 'on') {
                                    channel.h5 = {
                                        sendByEmail: result['channel_h5_email'] == 'on' ? 1 : 0,
                                        sendByLine: result['channel_h5_line'] == 'on' ? 1 : 0,
                                        sendBySms: result['channel_h5_sms'] == 'on' ? 1 : 0,
                                    };
                                }
                                if (result['channel_app'] == 'on') {
                                    channel.app = {
                                        appTitle: result['channel_app_title'],
                                    };
                                }
                                if (result['channel_pdf'] == 'on') {
                                    channel.pdf = {
                                        pdfSize: result['channel_pdf_size'],
                                    };
                                }
                                if (result['channel_pdfPrinting'] == 'on') {
                                    channel.pdfPrinting = {};
                                }
                                var mydata = {
                                    "type": type,
                                    "name": "MM-" + name + " [Publish]",
                                    "code": mmCode,
                                    "htmlRemark": result.remark,
                                    "description": result.description,
                                    "previewUrl": result.previewUrl,
                                };
                                
                                var lock = AjaxRequest({
                                    url: getApiUrl('approval.process.add'),
                                    method: getApiMethod('approval.process.add'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    loading: true,
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            // 生成发布文件
                                            generatePublishFile(mmCode, channel, {
                                                relatedFlow: result.data.id,
                                                currentLayer: index_page,
                                                lock: lock,
                                            });
                                            table.reload('marketingActivityTable');
                                        } else {
                                            layer.msg(result.msg);
                                        }
                                    }
                                }).lock();
                            });
                            submit.trigger('click');
                        }
                    });
                }
                break;
            // 发布回滚/设计完成回滚
            case 'rollback':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var mmCode = data[0].mmCode;

                    var title = '';
                    var status = '';
                    if (data[0].status == '3' || data[0].status == '4') {
                        title = 'Rollback [Finish]';
                        status = '2';
                    } else if (data[0].status == '5' || data[0].status == '6') {
                        title = 'Rollback [Publish]';
                        status = '4';
                    } else {
                        layer.msg("Operation not allowed");
                        return false;
                    }
                    layer.confirm('Confirm for rollback?', {
                        icon: 3,
                        title: title,
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        var mydata = {
                            "status": status,
                        };
                        AjaxRequest({
                            url: getApiUrl('marketing.activity.rollback', { mmCode: mmCode }),
                            method: getApiMethod('marketing.activity.rollback'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            data: JSON.stringify(mydata),
                            loading: true,
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('marketingActivityTable');
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        }).lock();
                    });
                }
                break;
            // 推送日志
            case 'pushLog':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Push Log'
                    ,id: 'pushLog'
                    ,content: '/makroDigital/marketingPush/index'
                    ,maxmin: true
                    ,area: ['800px', '500px']
                    ,success: function (layero, index) {
                        
                    }
                });
                layer.full(index_page);
                break;
            default:
                break;
        }
    });
    
    // 监听工具条
    table.on('tool(content-marketingActivity-list)', function(obj) {
        var data = obj.data;
        selectedItem = data;
        // 设计活动
        if (obj.event === 'design') {
            // 开始设计
            startDesign(data.mmCode, 2);
        } else if (obj.event === 'product') {// 产品列表
            var index_page = layer.open({
                type: 2
                ,title: 'Product List : ' + data.title
                ,id: 'productList'
                ,content: '/makroDigital/marketingActivity/product/' + data.mmCode
                ,maxmin: true
                ,area: ['85%', '85%']
                ,success: function (layero, index) {
                    
                }
            });
            layer.full(index_page);
        } else if (obj.event === 'importExcel') {// 导入Excel产品数据
            if (data.status != "0") {
                layer.confirm('TextThai already exists, confirm the replacement?', {
                    icon: 3,
                    title: 'Import product',
                    btn: ['Submit', 'Cancel'],
                }, function(index) {
                    // layer.close(index);
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Import Product : ' + data.title
                        ,id: 'importProduct'
                        ,content: '/makroDigital/marketingActivity/productImport/' + data.mmCode
                        ,maxmin: true
                        ,area: ['800px', '610px']
                        ,yes: function (index, layero) {
                        }
                    });
                });
            } else {
                var index_page = layer.open({
                    type: 2
                    ,title: 'Import Product : ' + data.title
                    ,id: 'importProduct'
                    ,content: '/makroDigital/marketingActivity/productImport/' + data.mmCode
                    ,maxmin: true
                    ,area: ['800px', '610px']
                    ,yes: function (index, layero) {
                    }
                });
            }
        } else if (obj.event === 'approvalDetail') {// 查看审核日志
            var index_page = layer.open({
                type: 2
                ,title: 'Approval Detail : ' + data.title
                ,id: 'approvalDetail'
                ,content: '/makroDigital/approvalProcess/approveDetail/' + data.mmCode
                ,maxmin: true
                ,area: ['700px', '500px']
                ,success: function (layero, index) {
                    
                }
            });
        } else if (obj.event === 'publishDetail') {// 查看发布详情
            var index_page = layer.open({
                type: 2
                ,title: 'Publish Detail : ' + data.title
                ,id: 'publishDetail'
                ,content: '/makroDigital/marketingActivity/publishDetail/' + data.mmCode
                ,maxmin: true
                ,area: ['800px', '500px']
                ,success: function (layero, index) {
                    
                }
            });
        } else if (obj.event === 'exportPDF') {// 导出为PDF格式
            var index_page = layer.open({
                type: 2
                ,title: 'Export PDF : ' + data.title
                ,id: 'exportPDF'
                ,content: '/makroDigital/marketingActivity/exportPDF/' + data.mmCode
                ,maxmin: true
                ,area: ['700px', '500px']
                ,success: function (layero, index) {
                    
                }
            });
        } else if (obj.event === 'preview') {// 预览
            var index_page = layer.open({
                type: 2
                ,title: 'Preview : ' + data.title
                ,id: 'previewH5Pdf'
                ,content: '/makroDigital/marketingActivity/preview/' + data.mmCode
                ,maxmin: true
                ,area: ['85%', '85%']
                ,success: function (layero, index) {
                    
                }
            });
            layer.full(index_page);
        } else if (obj.event === 'showPicture') {
            // 点击预览图放大显示
            getPreviewImage(data.mmCode, function(images) {
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

    // 监听开关事件
    form.on('switch(switchStatus)', function(obj) {
        var id = obj.value;
        var status = this.checked ? 1 : 0;
        var data = {
            status: status,
        };
        $.ajax({
            url: getApiUrl('marketing.activity.update', {id: id}),
            type: getApiMethod('marketing.activity.update'),
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
         
            }
        });
    });

    // 载入store数据
    var __loadStoreList_fail_number = 0;
    function loadStoreList(data, success) {
        $.ajax({
            url: getApiUrl('store.list'),
            type: getApiMethod('store.list'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: data,
            success: function(result) {
                __loadStoreList_fail_number = 0;
                if (result.code === "0000") {
                    var list = result.data;
                    if (list != null && list.length > 0) {
                        var storeData = [];
                        $.each(list, function(index, value) {
                            var tmp = list[index];
                            if (tmp.code != 999) {
                                storeData.push({
                                    name: tmp.name,
                                    value: tmp.code,
                                    selected: false,
                                });
                            }
                        });
                        filterStore.update({
                            data: storeData,
                        });
                    }
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__loadStoreList_fail_number;
                console.log('loadStoreList: 网络错误！');
                if (__loadStoreList_fail_number < 3) {
                    setTimeout(function() {
                        loadStoreList(data, success);
                    }, 100);
                } else {
                    console.log('loadStoreList: 已累计3次请求失败');
                }
            }
        });
    }
    // 载入MM类型列表
    var __loadActivityType_fail_number = 0;
    function loadActivityType(value, success) {
        dict.render({
            elem: 'select[name="type"]',
            dictCode: 'activity_type',
            value: value,
            success: function (res) {
                __loadActivityType_fail_number = 0;
            },
            error: function(e) {
                ++__loadActivityType_fail_number;
                console.log('loadActivityType: 网络错误！');
                if (__loadActivityType_fail_number < 3) {
                    setTimeout(function() {
                        loadActivityType(value, success);
                    }, 100);
                } else {
                    console.log('loadActivityType: 已累计3次请求失败');
                }
            }
        });
    }

    // 获取模板全部预览图
    function getPreviewImage(mmCode, success) {
        AjaxRequest({
            url: getApiUrl('marketing.activity.template', { mmCode: mmCode }),
            method: getApiMethod('marketing.activity.template'),
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

    // 生成需要发布的文件
    function generatePublishFile(mmCode, channel, options) {
        if (channel.h5) {
            channel.h5.mediaType = 'h5';
        }
        if (channel.app) {
            channel.app.mediaType = 'app';
        }
        if (channel.pdf) {
            channel.pdf.mediaType = 'pdf';
        }
        if (channel.pdfPrinting) {
            channel.pdfPrinting.mediaType = 'pdf-printing';
        }
        var jobs = [];
        for (var x in channel) {
            jobs.push(channel[x]);
        }
        var mydata = {
            "mmCode": mmCode,
            "relatedFlow": options.relatedFlow,
            "jobs": jobs,
        };
        AjaxRequest({
            url: getApiUrl('marketing.activity.publish'),
            method: getApiMethod('marketing.activity.publish'),
            data: JSON.stringify(mydata),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            lock: options.lock || null,// 传入上次请求的锁定
            loading: true,
            success: function(result) {
                console.log(result)
                if (result.code === "0000") {
                    options.currentLayer && layer.close(options.currentLayer);
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }

    // 开始设计
    function startDesign(mmCode, status) {
        status = parseInt(status);
        // 设计状态
        var designStatus = [1, 2];
        if (permission.verify('marketing:activity:design') && designStatus.indexOf(status) !== -1) {
            // 如果未选择模板，则弹出选择模板框
            if (selectedItem.mmTemplateCode == null) {
                selectDesignFrame(mmCode);
            } else {
                var url = '/makroDigital/marketingActivity/design/' + mmCode;
                var title = 'Activity Design : ' + selectedItem.title;
                layui.admin.openTabsPage(url, title);
            }
        }
    }

    //选择页面切片，并保留Design Frame筛选模板
    function selectDesignFrame(mmCode, pageOption="1") {
        var pages = selectedItem.pages;
        var index_page = parent.layer.open({
            type: 2
            ,title: 'Config Design Frame'
            ,id: 'configDesignFrame'
            ,content: '/makroDigital/marketingTemplate/configDesignFrame?mmCode=' + mmCode + "&pages=" + pages
            ,maxmin: true
            ,area: ['1040px', '650px']
            ,btn: ['Next']
            ,success: function(layero, index) {
                var pageConfig = $('input[name=pageConfig]').val();
                layero.find('iframe').contents().find('input[name=config]').val(pageConfig);
                setTimeout(function() {
                    if (parent['layui-layer-iframe' + index_page].loadConfig) {
                        if (template_pageConfig != null) {
                            parent['layui-layer-iframe' + index_page].loadConfig(pageOption, template_pageConfig);
                        } else {
                            parent['layui-layer-iframe' + index_page].loadConfig(pageOption, null);
                        }
                    }
                }, 80);
            }
            ,yes: function (index, layero) {
                var iframeWindow = parent['layui-layer-iframe' + index],
                    submitID = 'LAY-configDesignFrame-save-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);

                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
 
                    var canvasPages = [];
                    template_pageConfig = JSON.parse(result.config);
                    for (var i = 0; i < template_pageConfig.length; i++) {
                        var _dPage = template_pageConfig[i].dPage * 1 - 1;
                        if (isEmpty(canvasPages[_dPage])) {
                            canvasPages[_dPage] = {};
                            canvasPages[_dPage].drawCanvas = _dPage;
                            canvasPages[_dPage].textThaiPages = [];
                            canvasPages[_dPage].pageCode = createPageUuid();
                        }

                        canvasPages[_dPage].textThaiPages[template_pageConfig[i].slice * 1 - 1] = template_pageConfig[i].page;

                    }
                    
                    template_pageOption = result.mmPageOption;
                    template_canvasPages = canvasPages;
              
                    parent.layer.close(index);

                    selectTemplate(mmCode, result.mmPageOption, {
                        name: "select Template",
                        success: function() {
                            
                        },
                        end: function() {
                            //layer.close(msgLayer);
                        }
                    });
                    
                });
                submit.trigger('click');
            }
        });
    }

      
    // 选择模板，并绑定
    function selectTemplate(mmCode, pageOption, config) {
        var name = config.name ? ' : ' + config.name : '';
        var success = config.success ? config.success : undefined;
        var end = config.end ? config.end : undefined;
        config.before && config.before();
        var index_page = parent.layer.open({
            type: 2
            ,title: 'Select Template'// + name
            ,id: 'selectTemplate'
            ,content: '/makroDigital/marketingActivity/selectTemplate/' + mmCode
            ,maxmin: true
            ,area: ['1040px', '650px']
            ,btn: ['Confirm', 'Back']
            ,success: function(layero, index) {
                success && success(layero, index);
                setTimeout(function() {
                    if (parent['layui-layer-iframe' + index_page].init) {
                        parent['layui-layer-iframe' + index_page].init(pageOption);
                    }
                }, 80);
            }
            ,end: end
            ,yes: function (index, layero) {
          
                //按钮 Confirm 的回调
                var iframeWindow = parent['layui-layer-iframe' + index],
                    submitID = 'LAY-activity-bindTemplate-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);

                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
                    var type = result.type;
                    if (type == '') {
                        layer.msg('Please select a template');
                        return;
                    }
                    // 成功选择模板后
                    var selectTemplateAfter = function () {
                        parent.layer.close(index_page);
                        table.reload('marketingActivityTable');

                        // 延时打开设计
                        setTimeout(function () {
                            var url = '/makroDigital/marketingActivity/design/' + mmCode;
                            var title = 'Activity Design : ' + selectedItem.title;
                            layui.admin.openTabsPage(url, title);
                        }, 1000);
                    };
                    if (type == 'template') {
                        var bindTemplateCode = result.mmTemplateCode;
                        $.ajax({
                            url: getApiUrl('marketing.activity.bindTemplate', {mmCode: mmCode, templateCode: bindTemplateCode}),
                            type: getApiMethod('marketing.activity.bindTemplate'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    var mmTemplateCode = result.data.code;
                                    //更新MM pageOption、pageConfigs
                                    saveMMDesignFrame(mmCode, mmTemplateCode, pageOption);
                                    layer.msg(result.msg);

                                    selectTemplateAfter();
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    } else if (type == 'blank') {
                        var mydata = {
                            "mmCode": mmCode,
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
                            "pageOption": pageOption,
                            "pageConfigs": template_canvasPages,
                            "templatePageList": [
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
                        
                        $.ajax({
                            url: getApiUrl('marketing.template.add'),
                            type: getApiMethod('marketing.template.add'),
                            data: JSON.stringify(mydata),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    template_canvasPages = null;
                                    template_pageOption = '';
                                    layer.msg(result.msg);

                                    selectTemplateAfter();
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    }
                });
                submit.trigger('click');
            }
            ,btn2: function(index, layero){
                //按钮 Back 的回调
                parent.layer.close(index_page);
                selectDesignFrame(mmCode, pageOption);
            }
        });
        //layer.full(index_page);
    } 

    //设置MM活动 pageOption、pageConfigs
    function saveMMDesignFrame(mmCode, mmTemplateCode, pageOption) {
        var mydata = {
            pageOption: pageOption,
            pageConfigs: template_canvasPages
        };

        $.ajax({
            url: getApiUrl('marketing.template.update', {code: mmTemplateCode}),
            type: getApiMethod('marketing.template.update'),
            data: JSON.stringify(mydata),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                template_canvasPages = null;
                template_pageConfig = null;
            }
        });
    }

    // 预览已上传Excel的指定的sheet
    window.previewExcelSheet = function (importData) {
        if (importData !== undefined && importData.sheet !== undefined) {
            var mmCode = importData.mmCode;
            var isRestore = true;
            var layerox = layer.open({
                type: 1,
                title: 'Sheet [' + importData.sheet + ']',
                id: 'excelData',
                content: '<div style="padding: 0 20px;"><table class="layui-hide" id="excelSheetImportData"></table></div>',
                area: ['600px', '480px'],
                move: false,
                btn: ['Import', 'Back', 'Cancel'],
                success: function(layero, index) {
                    layer.full(index);
                    table.render({
                        elem: '#excelSheetImportData',
                        height: 'full-130',
                        cols: [[ //标题栏
                            {width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                            ,{width: 120, title: 'From', fixed: 'left', templet: function(res) {
                                return res.channelType == '' || res.channelType == null ? 'Database' : 'Excel';
                            }}
                            ,{field:'channelType', minWidth: 120, title: 'Channel Type' }
                            ,{field:'namethai', minWidth: 240, title: 'Name (Thai)' }
                            ,{field:'nameen', minWidth: 240, title: 'Name (EN)' }
                            ,{field:'parentCode', width: 160, title: 'Parent Code' }
                            ,{field:'urlparam', width: 160, title: 'Item Code' }
                            // ,{field:'urlparam', width: 160, title: 'Url Param' }
                            ,{field:'productId', width: 160, title: 'Product ID' }
                            ,{field:'page', width: 120, title: 'Page', sort: true }
                            ,{field:'sort', width: 120, title: 'Sort', sort: true }
                            ,{field:'linkitemno', width: 200, title: 'LinkItemNo' }
                            ,{field:'pack', width: 200, title: 'Package' }
                            ,{field:'model', width: 160, title: 'Model' }
                            ,{field:'normalprice', width: 120, title: 'Normal Price' }
                            ,{field:'promoprice', width: 120, title: 'Promo Price' }
                            ,{field:'promotedesc', width: 300, title: 'Promo Price Description' }
                            ,{field:'categoryid', width: 200, title: 'Category ID' }
                            ,{field:'icon1', width: 160, title: 'Icon (1)' }
                            ,{field:'icon2', width: 160, title: 'Icon (2)' }
                            ,{field:'icon3', width: 160, title: 'Icon (3)' }
                            ,{field:'iconRemark', width: 200, title: 'Icon Remark' }
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
                            ,{field:'qty1', width: 80, title: 'Step1' }
                            ,{field:'qty1unit', width: 160, title: 'Sale Unit' }
                            ,{field:'promoprice1', width: 120, title: 'Promo Price 1' }
                            ,{field:'qty2', width: 80, title: 'Step2' }
                            ,{field:'qty2unit', width: 160, title: 'Step2/Unit' }
                            ,{field:'promoprice2', width: 120, title: 'Promo Price 2' }
                            ,{field:'promoprice2description', width: 240, title: 'Promo Price 2 Description' }
                            ,{field:'qty3', width: 80, title: 'Step3' }
                            ,{field:'qty3unit', width: 160, title: 'Step3/Unit' }
                            ,{field:'promoprice3', width: 120, title: 'Promo Price 3' }
                            ,{field:'promoprice3description', width: 240, title: 'Promo Price 3 Description' }
                            ,{field:'qty4', width: 80, title: 'Step4' }
                            ,{field:'qty4unit', width: 160, title: 'Step4/Unit' }
                            ,{field:'promoprice4', width: 120, title: 'Promo Price 4' }
                            ,{field:'promoprice4description', width: 240, title: 'Promo Price 4 Description' }
                            ,{field:'remark1', width: 200, title: 'Remark 1' }
                            ,{field:'remark2', width: 200, title: 'Remark 2' }
                            ,{field:'remark3', width: 200, title: 'Remark 3' }
                        ]],
                        data: importData.data.dataList,
                        page: false,
                        done: function(res, curr, count) {
                            var that = $(this.elem).next();
                            var mmType = selectedItem.type;
                            if (typeof mmType == 'string') {
                                mmType = mmType.toLowerCase();
                            }
                            //循环遍历返回数据中的data
                            res.data.forEach(function (item, index) {
                                var itemType = typeof item.channelType == 'string' ? item.channelType.toLowerCase() : item.channelType;
                                if (itemType != '' && itemType != null && itemType != mmType) {
                                    //在获取到的DOM元素中找到data-index属性等于当前index的行
                                    var tr = that.find(".layui-table-box tbody tr[data-index='" + index + "']");
                                    //设置该行颜色
                                    tr.css("background-color", "#E74E1E");
                                    tr.css("color", "#FFF");
                                }
                            });
                        }
                    });
                },
                yes: function(index, layero) {
                    if (importData.data == null || importData.data.dataList.length == 0) {
                        layer.msg('The sheet has no data!');
                        return;
                    }
                    isRestore = false;
                    AjaxRequest({
                        url: getApiUrl('import.marketingActivity.confirm', {mmCode: mmCode}),
                        method: getApiMethod('import.marketingActivity.confirm'),
                        data: JSON.stringify(importData.data),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        loading: true,
                        success: function(result) {
                            if (result.code === '0000') {
                                
                                //更新MM status=1 San 2022-05-01
                                var mmStatus = (selectedItem.status=="0") ? "1" : selectedItem.status;
                                var data = {
                                    status: mmStatus,
                                };
                                $.ajax({
                                    url: getApiUrl('marketing.activity.update', {id: selectedItem.id}),
                                    type: getApiMethod('marketing.activity.update'),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    data: JSON.stringify(data),
                                    success: function(result) {
                                        //刷新MM列表
                                        table.reload('marketingActivityTable');
                                    },
                                    error: function(e) {
                                    }
                                });

                                layer.msg(result.msg);
                                layer.close(importData.uploadLayerIndex);
                                layer.close(index);

                                // 导入textthai后直接进入设计
                                startDesign(mmCode, mmStatus);
                            } else {
                                layer.msg(result.msg);
                            }
                        },
                        error: function() {
                            layer.msg('Request failed');
                        }
                    });
                },
                btn2: function() {
                    isRestore = true;
                },
                btn3: function() {
                    isRestore = false;
                    layer.close(importData.uploadLayerIndex);
                },
                end: function() {
                    // 点击back或右上角关闭时还原上传弹窗
                    if (isRestore) {
                        layer.restore(importData.uploadLayerIndex);
                    }
                }
            });
        }
    };
    
});