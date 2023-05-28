/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/approvalWorkflow/edit
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'laydate', 'layer', 'form'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form;
        
    var current_id = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);

    init();

    //初始化页面
    function init() {
        var load = layer.load(1);
        // 载入工作流数据
        loadWorkflowData(null, function() {
            layer.close(load);
        });
    }
    // 载入workflow数据
    var __loadWorkflowData_fail_number = 0;
    function loadWorkflowData(data, success) {
        $.ajax({
            url: getApiUrl('approval.workflow.detail', {id: current_id}),
            type: getApiMethod('approval.workflow.detail'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: data,
            success: function(result) {
                __loadWorkflowData_fail_number = 0;
                if (result.code === "0000") {
                    var workflowData = result.data;
                    form.val('workflowEdit', {
                        name: workflowData.name,
                        code: workflowData.code,
                    });
                    success && success();
                } else {
                    layer.msg(result.msg,{
                        time: 2000,
                        end: function () {
                            var index = parent.layer.getFrameIndex(window.name);
                            parent.layer.close(index);
                        }
                    });
                }
            },
            error: function(e) {
                ++__loadWorkflowData_fail_number;
                console.log('loadWorkflowData: 网络错误！');
                if (__loadWorkflowData_fail_number < 3) {
                    setTimeout(function() {
                        loadWorkflowData(data, success);
                    }, 100);
                } else {
                    console.log('loadWorkflowData: 已累计3次请求失败');
                }
            }
        });
    }

});