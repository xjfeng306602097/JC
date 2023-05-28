/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/approvalApplication/publishDetail
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
}).use(['index', 'common', 'laydate', 'layer', 'form', 'laytpl', 'element'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form
        ,laytpl = layui.laytpl
        ,element = layui.element;
        
    var mmCode = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);

    var tpl = $('#channelTpl').html();
    loadPublishJobs(mmCode, function(result) {
        var _Html = '';
        $.each(result.data, function(index, item) {
            _Html += laytpl(tpl).render(item);
        });
        $('#publishList').html(_Html);
        $('#publishList').find('.layui-colla-item').first().find('.layui-colla-content').addClass('layui-show');
        element.render('collapse', 'publishList');
    });

    // 载入发布任务
    var __loadPublishJobs_fail_number = 0;
    function loadPublishJobs(mmCode, success, lock) {
        AjaxRequest({
            url: getApiUrl('marketing.publishJob.relateByMMCode', {mmCode: mmCode}),
            method: getApiMethod('marketing.publishJob.relateByMMCode'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            lock: lock,
            success: function(result) {
                __loadPublishJobs_fail_number = 0;
                if (result.code === "0000") {
                    success && success(result);
                    permission.render();
                } else {
                    layer.msg(result.msg, {
                        time: 2000,
                        end: function () {
                            var index = parent.layer.getFrameIndex(window.name);
                            parent.layer.close(index);
                        }
                    });
                }
            },
            error: function(e) {
                ++__loadPublishJobs_fail_number;
                console.log('loadPublishJobs: 网络错误！');
                if (__loadPublishJobs_fail_number < 3) {
                    setTimeout(function() {
                        loadPublishJobs();
                    }, 100);
                } else {
                    console.log('loadPublishJobs: 已累计3次请求失败');
                }
            }
        });
    }

    $(document).on('click', '.rebuild-btn', function() {
        var jobID = $(this).data('jobid');
        layer.confirm('Confirm for re build?', {
            icon: 3,
            title: 'Re Build',
            btn: ['Submit', 'Cancel'],
        }, function(index) {
            rebuild(jobID, function(result) {
                layer.msg(result.msg);
                layer.close(index);
                // 0.5秒后刷新
                setTimeout(function() {
                    loadPublishJobs(mmCode, function(result) {
                        var _Html = '';
                        $.each(result.data, function(index, item) {
                            _Html += laytpl(tpl).render(item);
                        });
                        var i = 0;
                        $('#publishList').find('.layui-colla-item').each(function(o) {
                            if ($(this).find('.layui-colla-content').hasClass('layui-show')) {
                                i = o;
                            }
                        });
                        $('#publishList').html(_Html);
                        $('#publishList').find('.layui-colla-item').eq(i).find('.layui-colla-content').addClass('layui-show');
                        element.render('collapse', 'publishList');
                    });
                }, 500);
            }, function() {
                layer.msg('Error');
            });
        });
    });

    // 重新编译文件
    function rebuild(jobID, success, fail) {
        AjaxRequest({
            url: getApiUrl('marketing.activity.rebuild', {jobID: jobID}),
            method: getApiMethod('marketing.activity.rebuild'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            loading: true,
            interval: 3,
            success: function(result) {
                if (result.code === "0000") {
                    success && success(result);
                } else {
                    fail && fail();
                }
            },
            error: function(e) {
                fail && fail();
            }
        });
    }

    // 设置APP渠道title
    $(document).on('click', '.setAppTitle-btn', function() {
        var jobID = $(this).data('jobid');
        var appTitle = $(this).data('apptitle');
        layer.prompt({
            formType: 0,
            value: appTitle,
            title: 'Set APP Title',
            btn: ['Submit', 'Cancel'],
        }, function(value, index, elem) {
            var data = {
                appTitle: value,
            };
            var lock = AjaxRequest({
                url: getApiUrl('marketing.publishJob.update', {id: jobID}),
                method: getApiMethod('marketing.publishJob.update'),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + storage.access_token
                },
                data: JSON.stringify(data),
                loading: true,
                interval: 3,
                success: function(result) {
                    if (result.code === "0000") {
                        layer.msg(result.msg);
                        layer.close(index);
                        loadPublishJobs(mmCode, function(result) {
                            var _Html = '';
                            $.each(result.data, function(index, item) {
                                _Html += laytpl(tpl).render(item);
                            });
                            var i = 0;
                            $('#publishList').find('.layui-colla-item').each(function(o) {
                                if ($(this).find('.layui-colla-content').hasClass('layui-show')) {
                                    i = o;
                                }
                            });
                            $('#publishList').html(_Html);
                            $('#publishList').find('.layui-colla-item').eq(i).find('.layui-colla-content').addClass('layui-show');
                            element.render('collapse', 'publishList');
                        }, lock);
                    } else {
                        layer.msg(result.msg);
                    }
                },
                error: function(e) {
                    layer.msg('Error');
                }
            }).lock();
        });
    });

    // 推送Email
    $(document).on('click', '.pushEmail-btn', function() {
        var jobID = $(this).data('jobid');
        var index_page = parent.layer.open({
            type: 2
            ,title: 'Push Email'
            ,id: 'pushEmail'
            ,content: '/makroDigital/marketingPush/email/' + mmCode
            ,maxmin: true
            ,area: ['1100px', '650px']
            ,btn: ['Push', 'Cancel']
            ,yes: function (index, layero) {
                var iframeWindow = parent['layui-layer-iframe' + index],
                    submitID = 'LAY-publish-pushEmail-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);

                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
                    var mydata = {
                        "jobId": jobID,
                        "subject": result.subject,
                        "pageNo": result.pageNo,
                        "reviewUrl": result.coverUrl,
                        "workTime": result.workTime,
                    };
                    if (result.type == 'single') {
                        mydata.mmCustomerId = split(result.mmCustomerId, ',');
                    } else if (result.type == 'batch') {
                        mydata.sendList = {
                            segmentIds: split(result['sendList.segmentIds'], ','),
                            memberTypeIds: split(result['sendList.memberTypeIds'], ','),
                            customersS3Url: result['sendList.customersS3Url'],
                        };
                        mydata.exceptList = {
                            segmentIds: split(result['exceptList.segmentIds'], ','),
                            memberTypeIds: split(result['exceptList.memberTypeIds'], ','),
                            customersS3Url: result['exceptList.customersS3Url'],
                        };
                    }
                    
                    var lock = AjaxRequest({
                        url: getApiUrl('marketing.pushMessage.email'),
                        method: getApiMethod('marketing.pushMessage.email'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        loading: true,
                        interval: 1,
                        success: function(result) {
                            if (result.code === "0000") {
                                parent.layer.msg(result.msg);
                                parent.layer.close(index_page);
                                loadPublishJobs(mmCode, function(result) {
                                    var _Html = '';
                                    $.each(result.data, function(index, item) {
                                        _Html += laytpl(tpl).render(item);
                                    });
                                    var i = 0;
                                    $('#publishList').find('.layui-colla-item').each(function(o) {
                                        if ($(this).find('.layui-colla-content').hasClass('layui-show')) {
                                            i = o;
                                        }
                                    });
                                    $('#publishList').html(_Html);
                                    $('#publishList').find('.layui-colla-item').eq(i).find('.layui-colla-content').addClass('layui-show');
                                    element.render('collapse', 'publishList');
                                }, lock);
                            } else {
                                parent.layer.msg(result.msg);
                            }
                        }
                    }).lock();
                });
                submit.trigger('click');
            }
        });
    });

    // 推送LINE
    $(document).on('click', '.pushLine-btn', function() {
        var jobID = $(this).data('jobid');
        var index_page = parent.layer.open({
            type: 2
            ,title: 'Push LINE'
            ,id: 'pushLine'
            ,content: '/makroDigital/marketingPush/line/' + mmCode
            ,maxmin: true
            ,area: ['1100px', '650px']
            ,btn: ['Push', 'Cancel']
            ,yes: function (index, layero) {
                var iframeWindow = parent['layui-layer-iframe' + index],
                    submitID = 'LAY-publish-pushLine-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);

                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
                    var mydata = {
                        "jobId": jobID,
                        "subject": result.subject,
                        "templateNo": result.templateNo,
                        "pageNo": result.pageNo,
                        "coverUrl": result.coverUrl,
                        "workTime": result.workTime,
                        "isBroadcast": false,
                    };
                    if (result.type == 'single') {
                        mydata.mmCustomerId = split(result.mmCustomerId, ',');
                    } else if (result.type == 'batch') {
                        mydata.sendList = {
                            segmentIds: split(result['sendList.segmentIds'], ','),
                            memberTypeIds: split(result['sendList.memberTypeIds'], ','),
                            customersS3Url: result['sendList.customersS3Url'],
                        };
                        mydata.exceptList = {
                            segmentIds: split(result['exceptList.segmentIds'], ','),
                            memberTypeIds: split(result['exceptList.memberTypeIds'], ','),
                            customersS3Url: result['exceptList.customersS3Url'],
                        };
                    }
                    
                    var lock = AjaxRequest({
                        url: getApiUrl('marketing.pushMessage.line'),
                        type: getApiMethod('marketing.pushMessage.line'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        loading: true,
                        interval: 1,
                        success: function(result) {
                            if (result.code === "0000") {
                                parent.layer.msg(result.msg);
                                parent.layer.close(index_page);
                                loadPublishJobs(mmCode, function(result) {
                                    var _Html = '';
                                    $.each(result.data, function(index, item) {
                                        _Html += laytpl(tpl).render(item);
                                    });
                                    var i = 0;
                                    $('#publishList').find('.layui-colla-item').each(function(o) {
                                        if ($(this).find('.layui-colla-content').hasClass('layui-show')) {
                                            i = o;
                                        }
                                    });
                                    $('#publishList').html(_Html);
                                    $('#publishList').find('.layui-colla-item').eq(i).find('.layui-colla-content').addClass('layui-show');
                                    element.render('collapse', 'publishList');
                                }, lock);
                            } else {
                                parent.layer.msg(result.msg);
                            }
                        }
                    }).lock();
                });
                submit.trigger('click');
            }
        });
    });

    // 推送SMS
    $(document).on('click', '.pushSms-btn', function() {
        var jobID = $(this).data('jobid');
        var index_page = parent.layer.open({
            type: 2
            ,title: 'Push SMS'
            ,id: 'pushSms'
            ,content: '/makroDigital/marketingPush/sms/' + mmCode
            ,maxmin: true
            ,area: ['1100px', '650px']
            ,btn: ['Push', 'Cancel']
            ,yes: function (index, layero) {
                var iframeWindow = parent['layui-layer-iframe' + index],
                    submitID = 'LAY-publish-pushSms-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);

                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
                    var mydata = {
                        "jobId": jobID,
                        "msg": result.msg,
                        "pageNo": result.pageNo,
                        "workTime": result.workTime,
                    };
                    if (result.type == 'single') {
                        mydata.mmCustomerId = split(result.mmCustomerId, ',');
                    } else if (result.type == 'batch') {
                        mydata.sendList = {
                            segmentIds: split(result['sendList.segmentIds'], ','),
                            memberTypeIds: split(result['sendList.memberTypeIds'], ','),
                            customersS3Url: result['sendList.customersS3Url'],
                        };
                        mydata.exceptList = {
                            segmentIds: split(result['exceptList.segmentIds'], ','),
                            memberTypeIds: split(result['exceptList.memberTypeIds'], ','),
                            customersS3Url: result['exceptList.customersS3Url'],
                        };
                    }
                    
                    var lock = AjaxRequest({
                        url: getApiUrl('marketing.pushMessage.sms'),
                        type: getApiMethod('marketing.pushMessage.sms'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        loading: true,
                        interval: 1,
                        success: function(result) {
                            if (result.code === "0000") {
                                parent.layer.msg(result.msg);
                                parent.layer.close(index_page);
                                loadPublishJobs(mmCode, function(result) {
                                    var _Html = '';
                                    $.each(result.data, function(index, item) {
                                        _Html += laytpl(tpl).render(item);
                                    });
                                    var i = 0;
                                    $('#publishList').find('.layui-colla-item').each(function(o) {
                                        if ($(this).find('.layui-colla-content').hasClass('layui-show')) {
                                            i = o;
                                        }
                                    });
                                    $('#publishList').html(_Html);
                                    $('#publishList').find('.layui-colla-item').eq(i).find('.layui-colla-content').addClass('layui-show');
                                    element.render('collapse', 'publishList');
                                }, lock);
                            } else {
                                parent.layer.msg(result.msg);
                            }
                        }
                    }).lock();
                });
                submit.trigger('click');
            }
        });
    });

    // 推送日志
    $(document).on('click', '.pushLog-btn', function() {
        var jobID = $(this).data('jobid');
        var index_page = parent.layer.open({
            type: 2
            ,title: 'Push Log'
            ,id: 'pushLog'
            ,content: '/makroDigital/marketingPush/index?mmCode=' + mmCode
            ,maxmin: true
            ,area: ['800px', '500px']
            ,success: function (layero, index) {
                
            }
        });
        parent.layer.full(index_page);
    });

    // 多行文本框转为逗号隔开
    function toComma(str) {
        return str.replace(/\n/g, ',').replace(/[,]+/g, ',').replace(/^[,]?(.*?)[,]?$/g, '$1');
    }

    // 字符串拆分为数组，并过滤空字符串
    function split(str, separator) {
        return str.split(separator).filter(function(item) {
            if (item != '') {
                return item;
            }
        });
    }

});