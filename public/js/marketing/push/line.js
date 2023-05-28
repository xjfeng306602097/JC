/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingPush/line
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'laydate', 'layer', 'form', 'upload'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form
        ,upload = layui.upload;
        
    var current_mmCode = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);

    // 推送
    var push = pushInit(current_mmCode, 'line');
    // 初始化页面
    function init() {
        var pushUser = push.pushUserRender();
        var pushTime = push.pushTimeRender();
        var pushPage = push.pushPageRender(true);
    }
    init();

}); 