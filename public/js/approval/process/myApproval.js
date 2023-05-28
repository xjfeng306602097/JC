/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/approvalProcess/myApproval
    
 */

layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer', 'uploadAPI'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer
        ,uploadAPI = layui.uploadAPI;
    
    var storage = layui.data(setter.tableName);
    
    var current_type = '',
        current_name = '',
        current_code = '',
        current_description = '';

    var workflows = [], workflowTypes = {};

    var filterType = xmSelect.render({
        el: '#type',
        radio: true,
        clickClose: true,
        enableHoverFirst: false,
        model: {
            // type: 'relative',
        },
        style: {
            boxSizing: 'border-box',
        },
        data: [
            {name: 'Select', value: '', selected: true},
        ],
        language: 'en',
        tips: 'Select',
        on: function(data) {
            var arr = data.arr;
            //change, 此次选择变化的数据,数组
            var change = data.change;
            //isAdd, 此次操作是新增还是删除
            var isAdd = data.isAdd;
            if (!isAdd) {
                arr = change;
            }

            var result = arr;
            
            var list = [];
            for (var x in result) {
                list.push(result[x].value);
            }
            current_type = list.join(',');
            return result;
        },
    });
    
    function getApprovalProcessList(){
        table.render({
            id: 'approvalProcessTable'
            ,elem: '#content-approvalProcess-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('approval.process.page')
            ,method: getApiMethod('approval.process.page')
            // ,url: '/json/approval.json'
            // ,method: 'GET'
            ,contentType: 'application/json'
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#approvalProcessToolbar'
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
                // {type:'radio', width: 80, fixed: 'left' }
                {width: 120, title: '', fixed: 'left', templet: '#content-approvalProcess-list-operate', hide: permission.exist(['approval:myApproval:approve']) == 0 }
                ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{field:'gmtCreate', width: 180, title: 'Application Time', sort: true }
                ,{field:'creator', width: 120, title: 'Applicant' }
                ,{field:'type', width: 160, title: 'Workflow', templet: function(res) {
                    return workflowTypes[res.type] || 'Unknown';
                }}
                ,{field:'name', width: 240, title: 'Name' }
                ,{field:'description', minWidth: 120, title: 'Description' }
                ,{field:'status', width: 180, title: 'Status', templet: '#content-approvalProcess-list-status' }
                ,{field:'step', width: 80, title: 'Step' }
                ,{field:'currentRole', width: 200, title: 'current Role', sort: true }
                ,{field:'code', width: 360, title: 'Code', hide: true }
                ,{field:'id', width: 100, title: 'ID', sort: true, hide: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true, hide: true }
            ]],
            where: {
                req: {
                    justMe: true,
                    type: current_type,
                    name: current_name,
                    code: current_code,
                    description: current_description,
                },
                sortItems: [
                    {
                        column: 'gmtCreate',
                        asc: false
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
        workflows = storage.workflow;
        var data = [];
        data.push({
            name: 'Select',
            value: '',
            selected: true
        });
        $.each(workflows, function(index, item) {
            data.push({
                name: item.name,
                value: item.code,
            });
            workflowTypes[item.code] = item.name;
        });
        filterType.update({
            data: data,
        });
        getApprovalProcessList();
    }
    init();
    
    // 搜索
    form.on('submit(LAY-approvalProcess-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);

        current_name = result.name;
        current_code = result.code;
        current_description = result.description;
        getApprovalProcessList();
    });
    // 重置搜索
    form.on('submit(LAY-approvalProcess-front-reset)', function(obj) {
        form.val('approvalProcessSearch', {
            name: '',
            code: '',
            description: '',
        });
        form.render();
        filterType.setValue(['']);
        current_type = '';
        current_name = '';
        current_code = '';
        current_description = '';
        getApprovalProcessList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-approvalProcess-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            case '':
                
                break;
            default:
                break;
        }
    });
    
    // 监听工具条
    table.on('tool(content-approvalProcess-list)', function(obj) {
        var data = obj.data;
        if (obj.event === 'approve') {
            var index_page = layer.open({
                type: 2
                ,title: 'Approve : ' + data.name
                ,id: 'approve'
                ,content: '/makroDigital/approvalProcess/approve/' + data.id
                ,maxmin: true
                ,area: ['70%', '80%']
                ,btn: ['Submit', 'Cancel']
                ,yes: function (index, layero) {
                    var iframeWindow = window['layui-layer-iframe' + index],
                        submitID = 'LAY-process-approval-submit',
                        submit = layero.find('iframe').contents().find('#' + submitID);
                    
                    iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                        var field = JSON.stringify(obj.field);
                        var result = JSON.parse(field);

                        var step = result.returnToStep;
                        if (result.flowOption == 'APPROVE') {
                            step = undefined;
                        }
                        var mydata = {
                            "code": data.id,
                            "flowOption": result.flowOption,
                            "step": step,
                            "htmlRemark": result.remark,
                            "filePath": result.attachment,
                        };
                        
                        AjaxRequest({
                            url: getApiUrl('approval.process.verify'),
                            method: getApiMethod('approval.process.verify'),
                            data: JSON.stringify(mydata),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            loading: true,
                            success: function(result) {
                                if (result.code === "0000") {
                                    // uploadAPI.cancel(iframeWindow.uploadList, picPath);
                                    layer.msg(result.msg);
                                    layer.close(index_page);
                                    table.reload('approvalProcessTable');
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        }).lock();
                        
                    });
                    submit.trigger('click');
                }
                ,cancel: function (index, layero) {
                    var iframeWindow = window['layui-layer-iframe' + index];
                    // uploadAPI.cancel(iframeWindow.uploadList);
                }
                ,btn2: function (index, layero) {
                    var iframeWindow = window['layui-layer-iframe' + index];
                    // uploadAPI.cancel(iframeWindow.uploadList);
                }
            });
        }
    });

    // 获取工作流
    var __loadWorkflow_fail_number = 0;
    function loadWorkflow(success) {
        AjaxRequest({
            url: getApiUrl('approval.workflow.list'),
            method: getApiMethod('approval.workflow.list'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                __loadWorkflow_fail_number = 0;
                if (result.code === "0000") {
                    workflows = result.data;
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__loadProcessLog_fail_number;
                console.log('loadProcessLog: 网络错误！');
                if (__loadProcessLog_fail_number < 3) {
                    setTimeout(function() {
                        loadProcessLog(data, success);
                    }, 100);
                } else {
                    console.log('loadProcessLog: 已累计3次请求失败');
                }
            }
        });
    }
    
});