/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingAnalysis/productClicks
    
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
    
    var current_mmCode = getUrlRelativePath(4);
    var pageNo = getUrlRelativePath(5) || '';
    var storage = layui.data(setter.tableName);

    $('#productClickSearch input[name="pageNo"]').val(pageNo);
    var current_pageNo = pageNo,
        current_goodsCode = '',
        current_nameEn = '',
        current_nameThai = '',
        current_channel = undefined;

    var query = '?' + $.param({
        startTime: getUrlSearchParams('startTime') || '',
        endTime: getUrlSearchParams('endTime') || '',
    });
    var channel = getUrlSearchParams('channel') || '';
    if (channel != '') {
        current_channel = channel.split(',');
    }
    function getMarketingAnalysisProductClickList(){
        table.render({
            id: 'marketingAnalysisProductClickTable'
            ,elem: '#content-marketingAnalysisProductClick-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.analysis.itemClicks') + query
            ,method: getApiMethod('marketing.analysis.itemClicks')
            ,contentType: 'application/json'
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
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
                {field:'goodsCode', width: 120, title: 'Item Code', fixed: 'left', sort: true }
                ,{field:'nameEn', minWidth: 120, title: 'Name (EN)', sort: true }
                ,{field:'nameThai', minWidth: 120, title: 'Name (Thai)', sort: true }
                ,{field:'pageNo', width: 120, title: 'Page', sort: true }
                ,{field:'clicks', width: 120, title: 'Clicks', sort: true }
                ,{field:'visitors', width: 120, title: 'Visitors', sort: true }
            ]],
            where: {
                req: {
                    channel: current_channel,
                    mmCode: current_mmCode,
                    pageNo: current_pageNo,
                    goodsCode: current_goodsCode,
                    nameEn: current_nameEn,
                    nameThai: current_nameThai,
                },
                sortItems: [
                    {
                        column: "pageNo",
                        asc: true
                    },
                    {
                        column: "nameEn",
                        asc: true
                    }
                ],
            },
            // page: true,
            limit: 100000,
            // limits: [10, 20, 30, 50, 100, 150, 200],
        });
    }
    
    getMarketingAnalysisProductClickList();
    
    // 搜索
    form.on('submit(LAY-marketingAnalysisProductClick-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_pageNo = result.pageNo;
        current_goodsCode = result.goodsCode;
        current_nameEn = result.nameEn;
        current_nameThai = result.nameThai;
        getMarketingAnalysisProductClickList();
    });
    // 重置搜索
    form.on('submit(LAY-marketingAnalysisProductClick-front-reset)', function(obj) {
        form.val('productClickSearch', {
            pageNo: pageNo,
            goodsCode: '',
            nameEn: '',
            nameThai: '',
        });
        form.render();
        current_pageNo = pageNo;
        current_goodsCode = '';
        current_nameEn = '';
        current_nameThai = '';
        getMarketingAnalysisProductClickList();
    });

});