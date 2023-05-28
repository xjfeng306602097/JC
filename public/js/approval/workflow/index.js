/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/approvalWorkflow/index
    
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
        current_name = '',
        current_code = '';
    
    function getApprovalWorkflowList(){
        table.render({
            id: 'approvalWorkflowTable'
            ,elem: '#content-approvalWorkflow-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('approval.workflow.page')
            ,method: getApiMethod('approval.workflow.page')
            ,contentType: 'application/json'
            // ,url: '/json/workflow.json'
            // ,method: 'GET'
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#approvalWorkflowToolbar'
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
                // {type:'radio',  width: 80, fixed: 'left' }
                {width: 160, title: '', fixed: 'left', templet: '#content-approvalWorkflow-list-operate', hide: permission.exist(['approval:workflow:flowchart', 'approval:workflow:edit']) == 0 }
                ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{field:'name', minWidth: 160, title: 'Name', sort: true }
                ,{field:'code', width: 180, title: 'Code', sort: true }
                ,{field:'status', width: 90, title: 'Status', templet: '#content-approvalWorkflow-list-status'}
                ,{field:'relatePermission', width: 220, title: 'Initiate Permission' }
                // ,{field:'applicantRole', width: 200, title: 'Applicant role', sort: true }
                // ,{field:'reviewerRole', width: 200, title: 'Reviewer role', sort: true }
                ,{field:'id', width: 100, title: 'ID', sort: true }
                ,{field:'creator', width: 160, title: 'Creator' }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true }
            ]],
            where: {
                req: {
                    status: current_status,
                    name: current_name,
                    code: current_code,
                },
                sortItems: [
                    {
                        column: 'name',
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
    
    getApprovalWorkflowList();
    
    // 搜索
    form.on('submit(LAY-approvalWorkflow-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);

        current_status = result.status;
        current_name = result.name;
        current_code = result.code;
        getApprovalWorkflowList();
    });
    // 重置搜索
    form.on('submit(LAY-approvalWorkflow-front-reset)', function(obj) {
        form.val('approvalWorkflowSearch', {
            status: '',
            name: '',
            code: '',
        });
        form.render();
        current_status = '';
        current_name = '';
        current_code = '';
        getApprovalWorkflowList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-approvalWorkflow-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 
            case '':

                break;
            default:
                break;
        }
    });
    
    // 监听工具条
    table.on('tool(content-approvalWorkflow-list)', function(obj) {
        var data = obj.data;
        if (obj.event === 'edit') {// 编辑
            var index_page = layer.open({
                type: 2
                ,title: 'Workflow : ' + data.name
                ,id: 'editWorkflow'
                ,content: '/makroDigital/approvalWorkflow/edit/' + data.id
                ,maxmin: true
                // ,area: ['780px', '540px']
                ,area: ['600px', '400px']
                ,btn: ['Save', 'Cancel']
                ,yes: function (index, layero) {
                    var iframeWindow = window['layui-layer-iframe' + index],
                        submitID = 'LAY-workflow-update-submit',
                        submit = layero.find('iframe').contents().find('#' + submitID);
                    
                    iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                        var field = JSON.stringify(obj.field);
                        var result = JSON.parse(field);

                        var mydata = {
                            "name": result.name,
                            // "relatePermission": result.relatePermission,
                        };
                        
                        AjaxRequest({
                            url: getApiUrl('approval.workflow.update', { id: data.id }),
                            method: getApiMethod('approval.workflow.update'),
                            data: JSON.stringify(mydata),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            lock: true,
                            loading: true,
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    layer.close(index_page);
                                    table.reload('approvalWorkflowTable');
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                        
                    });
                    submit.trigger('click');
                }
            });
        } else if (obj.event === 'flowchart') {// 流程图
            var url = '/makroDigital/approvalWorkflow/flowchart/' + data.id;
            var title = 'Workflow flowchart : ' + data.name;
            layui.admin.openTabsPage(url, title);
        }
    });

    // 监听开关事件
    form.on('switch(switchStatus)', function(obj) {
        var id = obj.value;
        var checked = this.checked;
        var content = '';
        if (checked) {
            content = 'You are turning on review for this workflow. Continue?';
        } else {
            content = 'You are turning off review for this workflow. Continue?';
        }
        obj.elem.checked = !checked;
        form.render('checkbox');
        var status = checked ? 1 : 2;
        layer.confirm(content, {
            icon: 7,
            title: 'Warning',
            btn: ['Continue', 'Cancel'] //按钮
        }, function () {
            var data = {
                status: status,
            };
            $.ajax({
                url: getApiUrl('approval.workflow.update', {id: id}),
                type: getApiMethod('approval.workflow.update'),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + storage.access_token
                },
                data: JSON.stringify(data),
                success: function(result) {
                    if (result.code === "0000") {
                        obj.elem.checked = checked;
                        form.render('checkbox');
                        layer.msg(result.msg);
                    } else {
                        layer.msg(result.msg);
                    }
                },
                error: function(e) {
                    layer.msg('切换失败');
                    console.log(e);
                }
            });
        });
    });
    
});