/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/MarketingPush/users
    
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

    var current_channel = getUrlRelativePath(4);
    var current_taskId = getUrlRelativePath(5);
    var storage = layui.data(setter.tableName);
    
    var current_status = '',
        current_customerCode = '',
        current_sendTo = '';
    function getMarketingPushList(){
        table.render({
            id: 'marketingPushUsersTable'
            ,elem: '#content-marketingPush-users-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.pushMessage.users')
            ,method: getApiMethod('marketing.pushMessage.users')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            // POST时必须添加contentType
            ,contentType: 'application/json;charset=utf-8'
            ,toolbar: true
            ,toolbar: '#marketingPushToolbar'
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
                {width: 90, title: 'Action', fixed: 'left', templet: '#content-marketingPush-users-list-action', hide: permission.exist(['marketing:activity:push:again']) == 0 }
                ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{field:'customerCode', width: 200, title: 'Customer Code', fixed: 'left', sort: true, fixed: 'left' }
                ,{field:'sendTo', minWidth: 200, title: 'Send To' }
                ,{field:'sendTime', width: 200, title: 'Send Time', sort: true }
                ,{field:'status', width: 200, title: 'Status', templet: '#content-marketingPush-users-list-status' }
                ,{field:'creator', width: 160, title: 'Creator', hide: true }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true, hide: true }
            ]],
            where: {
                req: {
                    channel: current_channel,
                    id: current_taskId,
                    status: current_status,
                    customerCode: current_customerCode,
                    sendTo: current_sendTo,
                },
                sortItems: [
                    {
                        column: "gmtCreate",
                        asc: false
                    },
                    {
                        column: "sendTime",
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
    
    getMarketingPushList();
    
    // 搜索
    form.on('submit(LAY-marketingPush-users-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_status = result.status;
        current_customerCode = result.customerCode;
        current_sendTo = result.sendTo;
        getMarketingPushList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingPush-users-front-reset)', function(obj) {
        form.val('pushUsersSearch', {
            status: '',
            customerCode: '',
            sendTo: '',
        });
        form.render();
        current_status = '';
        current_customerCode = '';
        current_sendTo = '';
        getMarketingPushList();
    });
    
    // 监听工具条
    table.on('tool(content-marketingPush-users-list)', function(obj) {
        var data = obj.data;
        // 重新发送
        if (obj.event === 'again') {
            layer.confirm('Confirm push?', {
                icon: 3,
                title: 'Push Again',
                btn: ['Submit', 'Cancel'],
            }, function(index) {
                var mydata = {
                    channel: current_channel,
                    taskId: data.taskId,
                    customerId: data.customerId,
                    id: data.id,
                };
                var lock = AjaxRequest({
                    url: getApiUrl('marketing.pushMessage.again'),
                    type: getApiMethod('marketing.pushMessage.again'),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + storage.access_token
                    },
                    data: JSON.stringify(mydata),
                    loading: true,
                    interval: 1,
                    success: function(result) {
                        if (result.code === "0000") {
                            layer.msg(result.msg);
                            table.reload('marketingPushUsersTable');
                        } else {
                            layer.msg(result.msg);
                        }
                    }
                }).lock();
            });
        }
    });
    
});