/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/store/add
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'laydate', 'layer', 'form'], function() {
    var $ = layui.$
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form;

    form.verify({
        number: function(value, item) {
            var reg = /^[0-9]*$/;
            if (value && !reg.test(value)) {
                return 'Only allow to fill in pure numbers';
            }
        },
    });

});