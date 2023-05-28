/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/approvalProcess/approve
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
    layeditKz: '../layui_exts/layedit/Kz.layedit',
}).use(['index', 'laydate', 'layer', 'form', 'laytpl'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form
        ,laytpl = layui.laytpl;
        
    var current_code = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);

    init();

    // 定义请求拿到的数据存储变量
    var processDetail, processLog, processStep = {}, loadStatus = 'loading';

    //初始化页面
    function init() {
        loadApprovalDetail(null, function () {
            var currentStep = processDetail.step;
            var lastStep = 0;
            var processConfig = processDetail.configJson == null ? [] : JSON.parse(processDetail.configJson);
            processConfig.sort(function(a, b) {
                return a.step - b.step;
            });
            // console.log(processConfig)
            for (var x in processConfig) {
                var title = processConfig[x].title;
                processStep[processConfig[x].step] = {
                    title: title,
                    roleId: processConfig[x].roleId,
                    roleName: processConfig[x].roleName,
                };
                if (processConfig[x].step > lastStep) {
                    lastStep = processConfig[x].step;
                }
            }
            var disabledStatus = [99, 100];
            if (disabledStatus.indexOf(parseInt(processDetail.status)) !== -1) {
                $('#processApprove').find('input, select, textarea').prop('disabled', true);
                $('#processApprove').find('.layui-layedit').addClass('layui-layedit-disabled');
                loadStatus = 'disabled';
            } else {
                loadStatus = 'normal';
            }
            form.render('select');
            if (processLog != null && processLog.length > 0) {
                var tpl = $('#approvalLogTpl').html();
                var _Html = '';
                $.each(processLog, function(index, item) {
                    var content = item.htmlRemark == null ? '' : item.htmlRemark;
                    if (content == '' && item.flowOption == 'CREATE') {
                        content = 'Submit application';
                    }
                    var files = [];
                    if (item.filePath != null && item.filePath.length > 0) {
                        files = item.filePath.split(',');
                    }
                    var icon = null;
                    if (item.flowOption == 'APPROVE') {
                        icon = 'ok';
                    } else if (item.flowOption == 'REJECT') {
                        icon = 'close';
                    }
                    _Html += laytpl(tpl).render({
                        step: item.step,
                        icon: icon,
                        title: item.stepName,
                        time: item.gmtCreate,
                        user: item.authUser,
                        content: content,
                        files: files,
                    });
                });
                // 待审核的状态
                var undoneStatus = [0, 1, 2];
                if (undoneStatus.indexOf(parseInt(processDetail.status)) !== -1 && processStep[currentStep]) {
                    _Html += laytpl(tpl).render({
                        step: currentStep,
                        icon: 'loading layui-anim layui-anim-rotate layui-anim-loop',
                        title: processStep[currentStep].title,
                        time: '',
                        user: '',
                        content: 'To be approved by ' + processStep[currentStep].roleName,
                        files: [],
                    });
                }
                $("#approvalLog").html(_Html);
                var processTpl = $('#approvalProcessTpl').html();
                var _Html = '';
                $.each(processConfig, function(index, item) {
                    _Html += laytpl(processTpl).render({
                        title: 'Step ' + item.step,
                        content: item.title,
                    });
                });
                $("#approvalProcess").html(_Html);
            }
        });
    }
    // 载入当前正在审核的信息
    var __loadApprovalDetail_fail_number = 0;
    function loadApprovalDetail(data, success) {
        $.ajax({
            url: getApiUrl('approval.process.relateByCode', { code: current_code }),
            type: getApiMethod('approval.process.relateByCode'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: data,
            success: function(result) {
                __loadApprovalDetail_fail_number = 0;
                if (result.code === "0000") {
                    processDetail = result.data.flow;
                    processLog = result.data.details;
                    success && success();
                } else {
                    if (window == top) {
                        layer.msg(result.msg);
                    } else {
                        parent.layer.msg(result.msg);
                        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                        parent.layer.close(index);
                    }
                }
            },
            error: function(e) {
                ++__loadApprovalDetail_fail_number;
                console.log('loadApprovalDetail: 网络错误！');
                if (__loadApprovalDetail_fail_number < 3) {
                    setTimeout(function() {
                        loadApprovalDetail(data, success);
                    }, 100);
                } else {
                    console.log('loadApprovalDetail: 已累计3次请求失败');
                    if (window == top) {
                        layer.msg('Error');
                    } else {
                        parent.layer.msg('Error');
                        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                        parent.layer.close(index);
                    }
                }
            }
        });
    }

    $(document).on('click', '.process-log .content img', function() {
        var image = $(this).attr('src');
        layer.photos({
            photos: {
                "data": [
                    { "src": image }
                ]
            }
            ,anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机
            ,shade: [0.8, '#EEEEEE'] //背景遮布
            ,move: false //禁止拖动
        });
    });

});