/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/user/log
    
 */
 
layui.config({
    base: '../layuiadmin/' //静态资源所在路径
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
    
    var userId = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    var types = {};
    dict.request({
        elem: 'select[name="type"]',
        dictCode: 'user_log_type',
        value: '',
        renderElement: function(result, dictCode, value, lang) {
            var html = '';
            if (result.code === '0000') {
                html += '<option value="">ALL</option>';
                if (result.data.length > 0) {
                    $.each(result.data, function(i, o) {
                        if (value == o.value) {
                            selected = ' selected="selected"';
                        } else {
                            selected = '';
                        }
                        html += '<option value="' + o.value + '" ' + selected + '>' + o.name + '</option>';
                    });
                }
            }
            return html;
        },
        success: function (res) {
            if (res.code === '0000') {
                for (var x in res.data) {
                    var item = res.data[x];
                    types[item.value] = item.name;
                }
            }
        },
        complete: function() {
            getUserLogList();
        },
    });

    var now = new Date(),
        year = now.getFullYear(),
        month = now.getMonth() + 1,
        day = now.getDate();
    laydate.render({
        elem: '#createTime'
        ,range: true
        ,value: ''
        ,trigger: 'click'
        ,min: '2021-01-01'
        ,max: year + '-' + month + '-' + day
        ,lang: 'en'
    });
    
    var current_type = '',
        current_userId = userId,
        current_userIp = '',
        current_userName = '',
        current_content = '',
        current_createTimeStart = undefined,
        current_createTimeEnd = undefined;

    function getUserLogList(){
        table.render({
            id: 'userLogTable'
            ,elem: '#content-userLog-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('user.log')
            ,method: getApiMethod('user.log')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            // POST时必须添加contentType
            ,contentType: 'application/json;charset=utf-8'
            ,toolbar: true
            ,toolbar: '#userLogToolbar'
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
                {width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{field:'createTime', width: 180, title: 'Time', sort: true }
                ,{field:'userName', width: 180, title: 'Username' }
                ,{field:'userId', width: 300, title: 'User ID', hide: true }
                ,{field:'userIp', width: 200, title: 'IP' }
                ,{field:'type', width: 160, title: 'Event', templet: function(res) {
                    return types[res.type] === undefined ? 'Unknown' : types[res.type];
                }}
                ,{field:'content', mimWidth: 200, title: '', }
            ]],
            where: {
                req: {
                    type: current_type,
                    userId: current_userId,
                    userIp: current_userIp,
                    userName: current_userName,
                    content: current_content,
                    createTimeStart: current_createTimeStart,
                    createTimeEnd: current_createTimeEnd,
                },
                sortItems: [
                    {
                        column: "createTime",
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
    
    // 选择Type
    var select_type = '';
    form.on('select(type)', function(data) {
        if (data.value != select_type && select_type != '') {
            form.val('userLogSearch', {
                content: '',
            });
        }
        select_type = data.value;
    });
    // 搜索
    form.on('submit(LAY-userLog-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);

        current_type = result.type;
        current_userIp = result.userIp;
        current_userName = result.userName;
        current_content = result.content;
        var createTime = result.createTime;
        if (createTime === '') {
            current_createTimeStart = undefined;
            current_createTimeEnd = undefined;
        } else {
            var begin_end = createTime.split(' - ');
            current_createTimeStart = begin_end[0] + ' 00:00:00';
            current_createTimeEnd = begin_end[1] + ' 23:59:59';
        }
        getUserLogList();
    });
    // 重置搜索
    form.on('submit(LAY-userLog-front-reset)', function(obj) {
        form.val('userLogSearch', {
            type: '',
            userIp: '',
            userName: '',
            content: '',
            createTime: '',
        });
        form.render();
        current_type = '';
        current_userIp = '';
        current_userName = '';
        current_content = '';
        current_createTimeStart = undefined;
        current_createTimeEnd = undefined;
        getUserLogList();
    });
});