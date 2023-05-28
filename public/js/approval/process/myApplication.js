/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/approvalProcess/myApplication
    
 */

layui.config({
    base: '../layuiadmin/' //静态资源所在路径
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
    
    var current_type = '',
        current_name = '';

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
            {name: 'Template', value: 'Template'},
            {name: 'Design Review', value: 'MM-Design'},
            {name: 'Publish', value: 'MM-Publish'},
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
    
    function getMyApplicationList(){
        table.render({
            id: 'myApplicationTable'
            ,elem: '#content-myApplication-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('approval.process.page')
            ,method: getApiMethod('approval.process.page')
            // ,url: '/json/approval.json'
            // ,method: 'GET'
            ,contentType: 'application/json'
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#myApplicationToolbar'
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
                {width: 140, title: '', templet: '#content-myApplication-list-operate', hide: permission.exist(['']) == 0 }
                ,{width: 80, title: 'Serial', type: 'numbers' }
                ,{field:'gmtCreate', width: 180, title: 'Application Time', sort: true }
                ,{field:'creator', width: 120, title: 'Applicant' }
                ,{field:'type', width: 160, title: 'Workflow' }
                ,{field:'name', width: 200, title: 'Name' }
                ,{field:'', minWidth: 200, title: 'Application Instructions' }
                ,{field:'status', width: 180, title: 'Status', templet: function(res) {
                    switch(res.status) {
                        case 1:
                            return 'Pending';
                        case 2:
                            return 'Processing';
                        case 3:
                            return 'Completed';
                        case 4:
                            return 'Closed';
                        default:
                            return 'Unknown';
                    }
                }}
                // ,{field:'step', width: 80, title: 'Step' }
                // ,{field:'currentRole', width: 200, title: 'current Role', sort: true }
                // ,{field:'id', width: 100, title: 'ID', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true, hide: true }
            ]],
            where: {
                req: {
                    type: current_type,
                    name: current_name,
                    // currentRole: current_currentRole,
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
    
    getMyApplicationList();
    
    // 搜索
    form.on('submit(LAY-myApplication-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);

        current_name = result.name;
        getMyApplicationList();
    });
    // 重置搜索
    form.on('submit(LAY-myApplication-front-reset)', function(obj) {
        form.val('myApplicationSearch', {
            name: '',
        });
        form.render();
        filterType.setValue(['']);
        current_type = '';
        current_name = '';
        getMyApplicationList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-myApplication-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 审核
            case 'approve':

                break;
            default:
                break;
        }
    });
    
    // 监听工具条
    table.on('tool(content-myApplication-list)', function(obj) {
        var data = obj.data;
        if (obj.event === '') {
        }
    });
    
});