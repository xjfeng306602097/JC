/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/segment/add
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'laydate', 'layer','form'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form;
    
    var storage = layui.data(setter.tableName);

    laydate.render({
        elem: '#timePicker'
        ,type: 'datetime'
        ,range: true
        ,value: ''
        ,trigger: 'click'
        ,min: '2021-01-01'
        ,lang: 'en'
        ,done: function(value, date, endDate) {
            var timeRange = value.split(' - ');
            $('input[name="startTime"]').val(timeRange[0]);
            $('input[name="endTime"]').val(timeRange[1]);
        }
    });

}); 