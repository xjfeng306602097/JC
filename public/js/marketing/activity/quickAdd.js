/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingActivity/quickAdd
    
 */
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
    step: '../layui_exts/step/step',
}).use(['index', 'form', 'laydate', 'layer', 'laypage', 'upload', 'element', 'table', 'carousel', 'step', 'dict'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form
        ,laypage = layui.laypage
        ,upload = layui.upload
        ,element = layui.element
        ,table = layui.table
        ,carousel = layui.carousel
        ,step = layui.step
        ,dict = layui.dict;

    var storage = layui.data(setter.tableName);

    // 分步
    var stepBar = step.render({
        elem: '#quickStepBar',
        width: '100%', //设置容器宽度
        height: '90px',
        stepWidth: '750px',
        stepItems: [{
            title: 'Activity information'
        }, {
            title: 'Import product'
        }, {
            title: 'Select template'
        }, {
            title: 'Finish'
        }]
    });

    var steps = {};
    var currentStep = 0;
    // 跳转到指定步骤
    function toStep(n) {
        // 上一步
        var prevStep = currentStep;
        // 触发上一步onHide()方法
        var prevStepName = 'step' + prevStep;
        if (typeof steps[prevStepName] != 'undefined') {
            steps[prevStepName].onHide && steps[prevStepName].onHide({nextStep: n});
        }
        currentStep = n;
        stepBar.to({index: n - 1});
        $('input[name="step"]').val(n);
        $('.quick-steps>div').addClass('layui-hide');
        $('.quick-steps #quick-step' + n).removeClass('layui-hide');

        var currentStepName = 'step' + n;
        var current = eval(currentStepName);
        console.log(currentStepName);
        if (typeof steps[currentStepName] == 'undefined') {
            if (typeof current == 'function') {
                // 触发onLoad()方法
                steps[currentStepName] = current();
                steps[currentStepName].onLoad && steps[currentStepName].onLoad({prevStep: prevStep});
            } else {
                steps[currentStepName] = null;
            }
        } else {
            // 触发onShow()方法
            steps[currentStepName].onShow && steps[currentStepName].onShow({prevStep: prevStep});
        }
    }
    window.toStep = toStep;

    // 初始化页面
    function init() {
        toStep(1);

        // 第一步
        form.on('submit(LAY-quickAdd-step1-next)', function (data) {
            toStep(2);
            return false;
        });

        // 第二步
        $('#LAY-quickAdd-step2-prev').click(function() {
            toStep(1);
        });
        form.on('submit(LAY-quickAdd-step2-next)', function (data) {
            toStep(3);
            return false;
        });

        // 第三步
        $('#LAY-quickAdd-step3-prev').click(function() {
            toStep(2);
        });
        form.on('submit(LAY-quickAdd-step3-next)', function (data) {
            toStep(4);
            return false;
        });

        // 第四步
        $('#LAY-quickAdd-step4-prev').click(function() {
            if (creating) {
                layer.msg('Creating...');
                return;
            } else if (isCreated) {
                return;
            }
            toStep(3);
        });
        form.on('submit(LAY-quickAdd-step4-next)', function (data) {
            finish();
            return false;
        });
    }

    var creating = false, isCreated = false;
    var createData = null;
    // 结束函数
    function finish() {
        if (creating) {
            layer.msg('Creating...');
            return;
        } else if (isCreated) {
            return;
        }
        creating = true;
        $('#quick-step4 select[name="status"]').prop('disabled', true);
        $('#quick-step4 #LAY-quickAdd-step4-prev, #quick-step4 #LAY-quickAdd-step4-next').addClass('layui-btn-disabled');
        form.render();
        $('.step-progress').addClass('step-progress-show');
        run();
    }

    // 执行创建MM
    function run(n) {
        n = n || 1;
        switch (n) {
            case 1:
                element.progress('step-progress', '20%');
                $('.step-progress .step-progress-content').text('Step 1: Creating activity');

                createData = null;
                var formData = form.val('quick-step1');
                console.log(n, formData);
                var mydata = {
                    "title": formData.title,
                    "type": formData.type,
                    "startTime": formData.startTime,
                    "endTime": formData.endTime,
                    "storeCode": formData.store,
                    "memberType": formData.memberType,
                    "segment": formData.segment,
                    "remark": formData.remark,
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
                            createData = {};
                            createData.status = mydata.status;
                            createData.mmCode = result.data.mmCode;
                            // 创建完成
                            run(2);
                        } else {
                            runError(n, result.msg);
                        }
                    },
                    error: function(e) {
                        runError(n, 'Request failed!');
                    }
                });
                break;
            case 2:
                element.progress('step-progress', '40%');
                $('.step-progress .step-progress-content').text('Step 2: Importing products');
                if (window.productData) {
                    $.ajax({
                        url: getApiUrl('import.marketingActivity.confirm', {mmCode: createData.mmCode}),
                        type: getApiMethod('import.marketingActivity.confirm'),
                        data: JSON.stringify(window.productData),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === '0000') {
                                // 导入商品完成
                                run(3);
                            } else {
                                runError(n, result.msg);
                            }
                        },
                        error: function(e) {
                            runError(n, 'Request failed!');
                        }
                    });
                } else {
                    // 无商品信息直接跳过
                    run(3);
                }
                break;
            case 3:
                // 更新MM状态
                element.progress('step-progress', '60%');
                $('.step-progress .step-progress-content').text('Step 3: Update MM information');
                if (createData.status == '0') {
                    var mydata = {
                        status: "1",
                    };
                    $.ajax({
                        url: getApiUrl('marketing.activity.updateByCode', {mmCode: createData.mmCode}),
                        type: getApiMethod('marketing.activity.updateByCode'),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        data: JSON.stringify(mydata),
                        success: function(result) {
                            if (result.code === '0000') {
                                run(4);
                            } else {
                                runError(n, result.msg);
                            }
                        },
                        error: function(e) {
                            runError(n, 'Request failed!');
                        }
                    });
                } else {
                    run(4);
                }
                break;
            case 4:
                element.progress('step-progress', '80%');
                $('.step-progress .step-progress-content').text('Step 4: Activity binding template');

                var formData = form.val('quick-step3');
                console.log(n, formData);
                var bindTemplateCode = formData.templateCode;
                $.ajax({
                    url: getApiUrl('marketing.activity.bindTemplate', {mmCode: createData.mmCode, templateCode: bindTemplateCode}),
                    type: getApiMethod('marketing.activity.bindTemplate'),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + storage.access_token
                    },
                    success: function(result) {
                        if (result.code === "0000") {
                            var templateData = result.data;
                            createData.templateCode = templateData.code;
                            createData.templateData = templateData;
                            run(5);
                        } else {
                            runError(n, result.msg);
                        }
                    },
                    error: function(e) {
                        runError(n, 'Request failed!');
                    }
                });
                break;
            case 5:
                element.progress('step-progress', '99%');
                $('.step-progress .step-progress-content').text('Step 5: Update template information');

                var mydata = {
                    pageOption: window.templatePage.pageOption,
                    pageConfigs: window.templatePage.canvasPages,
                };

                $.ajax({
                    url: getApiUrl('marketing.template.update', {code: createData.templateCode}),
                    type: getApiMethod('marketing.template.update'),
                    data: JSON.stringify(mydata),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + storage.access_token
                    },
                    success: function(result) {
                        if (result.code === "0000") {
                            run(6);
                        } else {
                            runError(n, result.msg);
                        }
                    },
                    error: function(e) {
                        runError(n, 'Request failed!');
                    }
                });
                break;
            case 6:
                // 更新MM状态
                element.progress('step-progress', '100%');
                $('.step-progress .step-progress-content').text('Step 6: Update MM information');

                var formData = form.val('quick-step4');
                console.log(n, formData);
                var mydata = {
                    status: formData.status,
                };
                $.ajax({
                    url: getApiUrl('marketing.activity.updateByCode', {mmCode: createData.mmCode}),
                    type: getApiMethod('marketing.activity.updateByCode'),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + storage.access_token
                    },
                    data: JSON.stringify(mydata),
                    success: function(result) {
                        if (result.code === '0000') {
                            creating = false;
                            isCreated = true;
                            $('.step-progress .step-progress-content').text('Finish');
                            $('.step-progress .step-progress-tips').addClass('layui-hide');
                        } else {
                            runError(n, result.msg);
                        }
                    },
                    error: function(e) {
                        runError(n, 'Request failed!');
                    }
                });
                break;
        }
    }

    // 运行错误
    function runError(n, message) {
        $('.step-progress .step-progress-content').text('Step ' + n + ': Error: ' + message);
        if (n == 1) {
            creating = false;
            $('#quick-step4 select[name="status"]').prop('disabled', false);
            $('#quick-step4 #LAY-quickAdd-step4-prev, #quick-step4 #LAY-quickAdd-step4-next').removeClass('layui-btn-disabled');
            form.render();
            if (message == 'Request failed!') {
                layer.msg('Please check whether the network is normal.');
            }
        } else {
            layer.msg('Try again in 3 seconds. Please check whether the network is normal. Do not close it', {
                time: 3000,
            });
            setTimeout(function () {
                run(n);
            }, 3000);
        }
    }

    init();
});