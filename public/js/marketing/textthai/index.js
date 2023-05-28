/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingTextthai/index
    
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

    var now = new Date(),
        year = now.getFullYear(),
        month = now.getMonth() + 1,
        day = now.getDate();
    laydate.render({
        elem: '#createDate'
        ,range: true
        ,value: ''
        ,trigger: 'click'
        ,min: '2021-01-01'
        ,max: year + '-' + month + '-' + day
        ,lang: 'en'
    });
    
    var current_isvalid = undefined,
        current_mmCode = '',
        current_username = '',
        current_begin = undefined,
        current_end = undefined;
    function getMarketingTextthaiList(){
        table.render({
            id: 'marketingTextthaiTable'
            ,elem: '#content-marketingTextthai-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.textthai.page')
            ,method: getApiMethod('marketing.textthai.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#marketingTextthaiToolbar'
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
                {width: 100, title: '', templet: '#content-marketingTextthai-list-action', fixed: 'left', align: 'center', hide: permission.exist('marketing:textthai:detail') == 0 }
                ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{field:'gmtCreate', width: 180, title: 'Import Time', sort: true }
                ,{field:'mmCode', width: 320, title: 'MM Code' }
                ,{field:'isvalid', width: 100, title: 'Status', templet: function(res) {
                    switch (res.isvalid) {
                        case 0:
                            return '<span style="color: #FF5722;">Invalid</span>';
                        case 1:
                            return '<span style="color: #5FB878;">Valid</span>';
                    }
                }}
                ,{field:'creator', width: 160, title: 'Operator' }
                ,{field:'filename', width: 300, title: 'File'}
                ,{field:'sheetname', width: 160, title: 'Sheet' }
                ,{field:'datanum', width: 120, title: 'Data Total', align: 'center' }
                ,{field:'status', width: 120, title: 'Import Status', templet: function(res) {
                    switch (res.status) {
                        case 0:
                            return '<span style="color: #FFB800;">Warning</span>';
                        case 1:
                            return '<span style="color: #5FB878;">Success</span>';
                        default:
                            return 'Unknown';
                    }
                }}
                ,{field:'importresult', width: 240, title: 'Import Result' }
                ,{field:'id', width: 280, title: 'ID', sort: true }
            ]],
            where: {
                isvalid: current_isvalid,
                mmCode: current_mmCode,
                userName: current_username,
                begin: current_begin,
                end: current_end,
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
        });
    }
    
    getMarketingTextthaiList();
    
    // 搜索
    form.on('submit(LAY-marketingTextthai-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_isvalid = result.isvalid === '' ? undefined : result.isvalid;
        current_mmCode = result.mmCode;
        current_username = result.username;
        var createDate = result.createDate;
        if (createDate === '') {
            current_begin = undefined;
            current_end = undefined;
        } else {
            var begin_end = createDate.split(' - ');
            current_begin = begin_end[0] + ' 00:00:00';
            current_end = begin_end[1] + ' 23:59:59';
        }
        getMarketingTextthaiList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingTextthai-front-reset)', function(obj) {
        form.val('textThaiSearch', {
            isvalid: '',
            mmCode: '',
            createDate: '',
            username: '',
        });
        form.render();
        current_isvalid = undefined;
        current_mmCode = '';
        current_username = '';
        current_begin = undefined;
        current_end = undefined;
        getMarketingTextthaiList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-marketingTextthai-list)', function(obj){
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
    table.on('tool(content-marketingTextthai-list)', function(obj) {
        var data = obj.data;
        // 查看数据
        if (obj.event === 'detail') {
            var index_page = layer.open({
                type: 2
                ,title: 'View Data'
                ,id: 'detail'
                ,content: '/makroDigital/marketingTextthai/detail/' + data.id
                ,maxmin: true
                ,area: ['80%', '80%']
                ,yes: function (index, layero) {
                    var iframeWindow = window['layui-layer-iframe' + index],
                        submitID = 'LAY-goods-edit-submit',
                        submit = layero.find('iframe').contents().find('#' + submitID);


                }
            });
            // layer.full(index_page);
        }
    });
    
});