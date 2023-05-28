/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingTemplate/add
    
 */
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'layer'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form;
        
    var storage = layui.data(setter.tableName);
    var mmCode=getUrlRelativePath(4);
    
    //加载MM Template数据    
    loadTemplate(mmCode);  
    function loadTemplate(mmCode){
        $.ajax({
            url: getApiUrl('marketing.activity.template', {
                mmCode: mmCode
            }),
            type: getApiMethod('marketing.activity.template'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: {
                // 不返回模板页面内容
                "content": 0,
            },
            success: function(result) {
                if (result.code === "0000") {
                    
                    var configW=result.data.configW;
                    var configH=result.data.configH;
                    createExprotSize(configW,configH);
                    
                } else {
                    layer.msg(result.msg);
                }
            }
        });
      
    }
    
    // 搜索
    form.on('submit(LAY-marketingActivity-front-export)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        var exportSize = result.pdfSize;
        
        if (exportSize!=undefined && exportSize!=""){
            var loadEvent = layer.load(2, {time: 10*1000,shade: [0.3, '#393D49']});
            
            var _Html='<iframe src="/makroDigital/marketingExport/pdf/'+exportSize+'/FD/' + mmCode+'" width="414" height="736"></iframe>';
             $("#pdfIframe").html(_Html);
            //  layer.close(loadEvent);
        }
        
    });
    
    
    
    //生成可导出比例  
    function createExprotSize(w,h){
        
        //var pi=-1;
        //var pi=Math.floor(w/h*100)/100;
        var pi=(w/h).toFixed(2);

        var mydata={
            limit: 200,
            page: 1,
            req:{name: "",sizeRate: ""}
        };
        
        $.ajax({
            url: getApiUrl('marketing.size.page'),
            type: getApiMethod('marketing.size.page'),
            data: JSON.stringify(mydata),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                if (result.code === "0000") {
                    var tmpData=result.data.records;
                    
                    var _Html='';
                    for (var i=0;i<tmpData.length;i++){
                        if (tmpData[i].sizeRate * 1.0==pi * 1.0){
                            
                            _Html=_Html + "<option value="+(tmpData[i].width+"_"+tmpData[i].height)+">"+(tmpData[i].name)+" </option>";  
                            
                        }
                    }
                    
                    $("#pdfSize").append(_Html);
                    form.render();
                    
                } else {
                    layer.msg(result.msg);
                }
            }
        });
        
    }

    
});