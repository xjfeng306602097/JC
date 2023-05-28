/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/productActivity/index
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'table', 'layer'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,form = layui.form
        ,table = layui.table
        ,layer = layui.layer;
    
    var storage = layui.data(setter.tableName);

    var current_itemCode = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);

    function getProductActivityList(){
        table.render({
            id: 'productActivityTable'
            ,elem: '#content-productActivity-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.activity.page')
            ,method: getApiMethod('marketing.activity.page')
            ,contentType: 'application/json'
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#productActivityToolbar'
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
                ,{field:'status', width: 240, title: 'Status', fixed: 'left', templet: '#content-productActivity-list-status' }
                ,{field:'title', width: 200, title: 'Name', fixed: 'left', sort: true }
                ,{field:'previewUrl', width: 100, title: 'Preview', templet: imgTpl}
                ,{field:'storeCode', width: 120, title: 'Store', templet: function(res) {
                    if (res.storeCode === null) {
                        return '';
                    }
                    if (res.storeCode == 999) {
                        return 'ALL';
                    }
                    return res.storeCode;
                }}
                ,{field:'remark', minWidth: 200, title: 'Remarks' }
                ,{field:'mmCode', width: 320, title: 'MM Code', hide: true }
                ,{field:'mmTemplateCode', width: 300, title: 'MM Template Code', hide: true }
                ,{width: 310, title: 'Activity Time', templet: function(res) {
                    return res.startTime + ' to ' + res.endTime;
                }}
                ,{field:'creator', width: 160, title: 'Creator' }
            ]],
            where: {
                itemCode: current_itemCode,
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200]
        });
    }
    
    getProductActivityList();
    
    // 监听工具条
    table.on('tool(content-productActivity-list)', function(obj) {
        var data = obj.data;
        if (obj.event === 'showPicture') {
            // 点击预览图放大显示
            if (data.previewUrl != null) {
                layer.photos({
                    photos: {
                        "data": [
                            { "src": data.previewUrl }
                        ]
                    }
                    ,anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机
                    ,shade: [0.8, '#EEEEEE'] //背景遮布
                    ,move: false //禁止拖动
                });
            }
        }
    });

});