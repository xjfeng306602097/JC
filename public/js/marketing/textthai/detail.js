/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingTextthai/detail
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'element', 'table', 'layer'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,form = layui.form
        ,element = layui.element
        ,table = layui.table
        ,layer = layui.layer;
    
    var current_id = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    // Excel数据
    function getMarketingTextthaiList() {
        table.render({
            id: 'marketingTextthaiOriginalTable'
            ,elem: '#content-marketingTextthai-detail'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.product.page')
            ,method: getApiMethod('marketing.product.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,defaultToolbar: ['filter','exports']
            ,parseData: function(res) {
                if (res.code==="0000"){
                    var data = [];
                    for (var x in res.data.records) {
                        var item = res.data.records[x].info;
                        item.pic = res.data.records[x].pic;
                        data.push(item);
                    }
                    return {
                        code: 0,
                        count: res.data.total,
                        data: data
                    }
                }
            }
            ,cols: [[
                {width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{field:'channelType', minWidth: 120, title: 'Channel Type' }
                // ,{field:'thumbnailPath', width: 180, title: 'Picture', templet: imgTpl }
                ,{field:'namethai', minWidth: 240, title: 'Name (Thai)' }
                ,{field:'nameen', minWidth: 240, title: 'Name (EN)' }
                ,{field:'itemcode', width: 160, title: 'Item Code' }
                // ,{field:'urlparam', width: 160, title: 'Url Param' }
                ,{field:'productId', width: 160, title: 'Product ID' }
                ,{field:'page', width: 120, title: 'Page', sort: true }
                ,{field:'sort', width: 120, title: 'Sort', sort: true }
                ,{field:'linkitemno', width: 200, title: 'LinkItemNo' }
                ,{field:'pack', width: 200, title: 'Package' }
                ,{field:'model', width: 160, title: 'Model' }
                ,{field:'normalprice', width: 120, title: 'Normal Price' }
                ,{field:'promoprice', width: 120, title: 'Promo Price' }
                ,{field:'promotedesc', width: 300, title: 'Promo Price Description' }
                ,{field:'categoryid', width: 200, title: 'Category ID' }
                ,{field:'icon1', width: 160, title: 'Icon (1)' }
                ,{field:'icon2', width: 160, title: 'Icon (2)' }
                ,{field:'icon3', width: 160, title: 'Icon (3)' }
                ,{field:'iconRemark', width: 200, title: 'Icon Remark' }
                ,{field:'promotype', width: 120, title: 'Promo Type', templet: function(res) {
                    switch (res.promotype) {
                        case 1:
                            return 'Normal';
                        case 2:
                            return 'Link Item';
                        default:
                            return 'Unknown';
                    }
                }}
                ,{field:'qty1', width: 80, title: 'Step1' }
                ,{field:'qty1unit', width: 160, title: 'Sale Unit' }
                ,{field:'promoprice1', width: 120, title: 'Promo Price 1' }
                ,{field:'qty2', width: 80, title: 'Step2' }
                ,{field:'qty2unit', width: 160, title: 'Step2/Unit' }
                ,{field:'promoprice2', width: 120, title: 'Promo Price 2' }
                ,{field:'promoprice2description', width: 240, title: 'Promo Price 2 Description' }
                ,{field:'qty3', width: 80, title: 'Step3' }
                ,{field:'qty3unit', width: 160, title: 'Step3/Unit' }
                ,{field:'promoprice3', width: 120, title: 'Promo Price 3' }
                ,{field:'promoprice3description', width: 240, title: 'Promo Price 3 Description' }
                ,{field:'qty4', width: 80, title: 'Step4' }
                ,{field:'qty4unit', width: 160, title: 'Step4/Unit' }
                ,{field:'promoprice4', width: 120, title: 'Promo Price 4' }
                ,{field:'promoprice4description', width: 240, title: 'Promo Price 4 Description' }
                ,{field:'remark1', width: 200, title: 'Remark 1' }
                ,{field:'remark2', width: 200, title: 'Remark 2' }
                ,{field:'remark3', width: 200, title: 'Remark 3' }
                ,{field:'creator', width: 160, title: 'Creator' }
                ,{field:'gmtCreate', width: 180, title: 'Create Time', sort: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 180, title: 'Last Update Time', sort: true }
            ]],
            where: {
                infoid: current_id,
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200]
        });
    }
    getMarketingTextthaiList();

});