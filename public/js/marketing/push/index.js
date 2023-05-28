/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/MarketingPush/index
    
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

    var mmCode = $('input[name="mmCode"]').val();
    var storage = layui.data(setter.tableName);

    laydate.render({
        elem: '#workTime'
        ,range: true
        ,value: ''
        ,trigger: 'click'
        ,min: '2021-01-01'
        ,lang: 'en'
    });
    
    var current_channel = 'email',
        current_status = '',
        current_mmCode = mmCode,
        current_subject = '',
        current_startWorkTime = undefined,
        current_endWorkTime = undefined;
    function getMarketingPushList(){
        var fields = [];
        switch (current_channel) {
            case 'email':
                fields = [
                    {width: 140, title: 'Action', fixed: 'left', templet: '#content-marketingPush-list-action' }
                    ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                    ,{field:'subject', minWidth: 300, title: 'Subject', fixed: 'left', sort: true, fixed: 'left' }
                    ,{field:'workTime', width: 200, title: 'Push Time', sort: true }
                    ,{field:'pushTotal', width: 120, title: 'Push Total' }
                    ,{field:'status', width: 160, title: 'Status', templet: '#content-marketingPush-list-status' }
                    ,{field:'mmCode', width: 320, title: 'MM Code' }
                    ,{field:'pageNo', width: 100, title: 'Page' }
                    ,{field:'blacklist', width: 200, title: 'Black List', hide: true }
                    ,{field:'whitelist', width: 200, title: 'White List', hide: true }
                    ,{field:'id', width: 300, title: 'ID', hide: true }
                    ,{field:'creator', width: 160, title: 'Creator' }
                    ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                    ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                    ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true, hide: true }
                ];
                break;
            case 'line':
                fields = [
                    {width: 140, title: 'Action', fixed: 'left', templet: '#content-marketingPush-list-action' }
                    ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                    ,{field:'subject', minWidth: 300, title: 'Subject', fixed: 'left', sort: true, fixed: 'left' }
                    ,{field:'workTime', width: 200, title: 'Push Time' }
                    ,{field:'pushTotal', width: 120, title: 'Push Total' }
                    ,{field:'status', width: 160, title: 'Status', templet: '#content-marketingPush-list-status' }
                    ,{field:'mmCode', width: 320, title: 'MM Code' }
                    ,{field:'pageNo', width: 100, title: 'Page' }
                    ,{field:'blacklist', width: 200, title: 'Black List', hide: true }
                    ,{field:'whitelist', width: 200, title: 'White List', hide: true }
                    ,{field:'id', width: 300, title: 'ID', hide: true }
                    ,{field:'creator', width: 160, title: 'Creator' }
                    ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                    ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                    ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true, hide: true }
                ];
                break;
            case 'sms':
                fields = [
                    {width: 140, title: 'Action', fixed: 'left', templet: '#content-marketingPush-list-action' }
                    ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                    ,{field:'msg', minWidth: 300, title: 'Content', fixed: 'left', sort: true, fixed: 'left' }
                    ,{field:'workTime', width: 200, title: 'Push Time' }
                    ,{field:'pushTotal', width: 120, title: 'Push Total' }
                    ,{field:'status', width: 160, title: 'Status', templet: '#content-marketingPush-list-status' }
                    ,{field:'mmCode', width: 320, title: 'MM Code' }
                    ,{field:'pageNo', width: 100, title: 'Page' }
                    ,{field:'blacklist', width: 200, title: 'Black List', hide: true }
                    ,{field:'whitelist', width: 200, title: 'White List', hide: true }
                    ,{field:'id', width: 300, title: 'ID', hide: true }
                    ,{field:'creator', width: 160, title: 'Creator' }
                    ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true }
                    ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                    ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true, hide: true }
                ];
                break;
            default:
                break;
        }
        table.render({
            id: 'marketingPushTable'
            ,elem: '#content-marketingPush-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.pushMessage.page')
            ,method: getApiMethod('marketing.pushMessage.page')
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
            ,cols: [fields],
            where: {
                req: {
                    channel: current_channel,
                    status: current_status,
                    mmCode: current_mmCode,
                    subject: current_subject,
                    startWorkTime: current_startWorkTime,
                    endWorkTime: current_endWorkTime,
                },
                sortItems: [
                    {
                        column: "gmtCreate",
                        asc: false
                    },
                    {
                        column: "workTime",
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
    form.on('submit(LAY-marketingPush-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_channel = result.channel;
        current_status = result.status;
        current_mmCode = result.mmCode;
        current_subject = result.subject;
        var workTime = result.workTime;
        if (workTime === '') {
            current_startWorkTime = undefined;
            current_endWorkTime = undefined;
        } else {
            var begin_end = workTime.split(' - ');
            current_startWorkTime = begin_end[0] + ' 00:00:00';
            current_endWorkTime = begin_end[1] + ' 23:59:59';
        }
        getMarketingPushList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingPush-front-reset)', function(obj) {
        form.val('pushSearch', {
            // channel: 'email',
            status: '',
            mmCode: mmCode,
            subject: '',
            workTime: '',
        });
        form.render();
        // current_channel = 'email';
        current_status = '';
        current_mmCode = mmCode;
        current_subject = '';
        current_startWorkTime = undefined;
        current_endWorkTime = undefined;
        getMarketingPushList();
    });
    
    // 监听工具条
    table.on('tool(content-marketingPush-list)', function(obj) {
        var data = obj.data;
        // 详情
        if (obj.event === 'detail') {
            var title = data.subject || data.msg || '';
            var channels = {
                email: 'Email',
                line: 'LINE',
                sms: 'SMS',
            };
            var index_page = layer.open({
                type: 2
                ,title: channels[current_channel] + ' Push Detail : ' + title
                ,id: 'pushDetail'
                ,content: '/makroDigital/marketingPush/detail/' + current_channel + '/' + data.id
                ,maxmin: true
                ,area: ['1200px', '85%']
                ,success: function (layero, index) {
                    
                }
            });
        // 取消推送
        } else if (obj.event === 'cancel') {
            layer.confirm('Confirm to cancel push?', {
                icon: 3,
                title: 'Cancel Push',
                btn: ['Submit', 'Cancel'],
            }, function(index) {
                var mydata = {
                    channel: current_channel,
                    id: data.id,
                };
                var lock = AjaxRequest({
                    url: getApiUrl('marketing.pushMessage.cancel'),
                    type: getApiMethod('marketing.pushMessage.cancel'),
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
                            table.reload('marketingPushTable');
                        } else {
                            layer.msg(result.msg);
                        }
                    }
                }).lock();
            });
        }
    });
    
});