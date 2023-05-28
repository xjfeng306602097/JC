/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingAnalysis/visitor
    
 */

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
    
    var current_mmCode = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    // 初始mmCode
    var mmCode = current_mmCode;

    // 定义初始化的日期
    var startDate = getDateStr(-7),
        endDate = getDateStr(0);

    var current_startTime = startDate + ' 00:00:00',
        current_endTime = endDate + ' 23:59:59',
        current_channel = '',
        current_platform = '',
        current_ip = '';

    var now = new Date();
    laydate.render({
        elem: '#time'
        ,range: true
        ,value: startDate + ' - ' + endDate
        ,trigger: 'click'
        ,min: getDateStr(0, now.setMonth(now.getMonth() - 6))
        ,max: endDate
        ,lang: 'en'
    });
    // 渠道
    dict.render({
        elem: 'select[name="channel"]',
        dictCode: 'channel',
        value: '',
    });
    // 来源平台
    dict.render({
        elem: 'select[name="platform"]',
        dictCode: 'platform',
        value: '',
    });

    // 返回对应日期
    function getDateStr(day, dateTime) {
        var date = dateTime == null ? new Date() : new Date(dateTime);
        date.setDate(date.getDate() + day);
        var y = date.getFullYear();
        var m = ('0' + (date.getMonth() + 1)).slice(-2);//获取当前月份的日期
        var d = ('0' + date.getDate()).slice(-2);
        return y + '-' + m + '-' + d;
    }

    function getMarketingAnalysisVisitorList(){
        table.render({
            id: 'marketingAnalysisVisitorTable'
            ,elem: '#content-marketingAnalysisVisitor-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.analysis.visitDetails')
            ,method: getApiMethod('marketing.analysis.visitDetails')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#marketingAnalysisVisitorToolbar'
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
                ,{field:'createTime', width: 180, title: 'Time' }
                ,{field:'mmCode', width: 340, title: 'MM Code', hide: mmCode == '' ? false : true }
                ,{field:'url', minWidth: 300, title: 'Page URL' }
                ,{field:'memberNo', width: 160, title: 'Member No.' }
                ,{field:'memberType', width: 160, title: 'Member Type', hide: true }
                ,{field:'storeCode', width: 160, title: 'Store Code', hide: true }
                ,{field:'channel', width: 140, title: 'Channel', templet: function(res) {
                    switch (res.channel) {
                        case 'email':
                            return 'Email';
                        case 'sms':
                            return 'SMS';
                        case 'line':
                            return 'LINE';
                        case 'facebook':
                            return 'Facebook';
                        default:
                            return firstUpperCase(res.channel);
                    }
                }}
                ,{field:'platform', width: 200, title: 'Platform' }
                ,{field:'ip', width: 140, title: 'IP' }
            ]],
            where: {
                mmCode: current_mmCode,
                startTime: current_startTime,
                endTime: current_endTime,
                channel: current_channel,
                platform: current_platform,
                ip: current_ip,
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200]
        });
    }
    
    getMarketingAnalysisVisitorList();
    
    form.verify({
        time: function(value, item) {
            var evt = event || window.event || {};
            if (evt.type == 'click' && ($(evt.target).attr('lay-filter') != 'LAY-marketingAnalysisVisitor-front-reset')) {
                if (value == '') {
                    return 'Please select a time period';
                }
            }
            return false;
        }
    });
    // 搜索
    form.on('submit(LAY-marketingAnalysisVisitor-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        var time = result.time.split(' - ');
        current_startTime = time[0] + ' 00:00:00';
        current_endTime = time[1] + ' 23:59:59';
        current_channel = result.channel;
        current_platform = result.platform;
        current_ip = result.ip;
        if (result.mmCode) {
            current_mmCode = result.mmCode;
        }
        getMarketingAnalysisVisitorList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingAnalysisVisitor-front-reset)', function(obj) {
        form.val('analysisVisitorSearch', {
            time: startDate + ' - ' + endDate,
            channel: '',
            platform: '',
            ip: '',
            mmCode: '',
        });
        form.render();
        current_startTime = startDate + ' 00:00:00';
        current_endTime = endDate + ' 23:59:59';
        current_channel = '';
        current_platform = '';
        current_ip = '';
        current_mmCode = mmCode;
        getMarketingAnalysisVisitorList();
    });

    function firstUpperCase(str) {
        newStr = str.slice(0,1).toUpperCase() +str.slice(1).toLowerCase();
        return newStr;
    }

});