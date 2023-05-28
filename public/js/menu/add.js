/**

 @Name：makro 
 @Author：makro
 @Site：
 @Update: 20211104 09:32 done
 */

layui.config({
    base: '../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'layer', 'form'], function() {
    var $ = layui.$,
        ,setter = layui.setter
        ,layer = layui.layer,
        ,form = layui.form;

    var storage = layui.data(setter.tableName);


});