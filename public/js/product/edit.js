/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/product/add
    
 */

layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
}).use(['index', 'form', 'layer'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,form = layui.form
        ,layer = layui.layer;
    
    var current_id = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);
    
    // 获取当前ID数据
    $.ajax({
        url: getApiUrl('product.detail', {id: current_id}),
        type: getApiMethod('product.detail'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function (result) {
            if (result.code === "0000") {
                form.val('productEdit', {
                    "itemcode": result.data.itemcode,
                    "nameen": result.data.nameen,
                    "namethai": result.data.namethai,
                    "normalprice": result.data.normalprice,
                    "promoprice": result.data.promoprice,
                    "saleunit": result.data.qty1unit,
                    "model": result.data.model,
                    "pack": result.data.pack,
                });
                form.render();
            } else {
                layer.msg(result.msg);
            }
        }
    });

});