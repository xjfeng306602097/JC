/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/segment/edit
    
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
        
    var current_id = getUrlRelativePath(4);
    
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
    
    // 获取组件信息
    $.ajax({
        url: getApiUrl('segment.detail', {id: current_id}),
        type: getApiMethod('segment.detail'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code === "0000") {
                var time = result.data.startTime == '' || result.data.startTime == null ? '' : result.data.startTime + ' - ' + result.data.endTime;
                form.val('segmentEdit', {
                    "name": result.data.name,
                    "time": time,
                    "startTime": result.data.startTime,
                    "endTime": result.data.endTime,
                });
            } else {
                layer.msg(result.msg);
            }
        }
    });

}); 