/**

 @Name：makro 
 @Author：makro
 @Site：http://web-host/makroDigital/marketingTemplate/add
    
 */
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'laydate', 'layer','table'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,table=layui.table
        ,laydate = layui.laydate
        ,form = layui.form;
    
    var mmCode=getUrlRelativePath(4);
    
    //加载Html数据    
    loadHtml5(mmCode);
    loadPDF(mmCode);
    function loadHtml5(mmCode){
        if (!$("#H5Box iframe").length || $("#H5Box iframe").length==0){
        
            /*
            //未生成，调用生成Html源码保存web-host,可用于发布
            $.ajax({
                url: "/makroDigital/marketingExport/html/" + mmCode,
                type: "POST",
                data: {},
                success: function(result) {
        
                    if (result.code === "0000") {
                        _Html='<iframe src="/html/'+mmCode+'/index.html" width="768" height="1024"></iframe>';
                        $("#H5Box").html(_Html);
                    }
                }
            });
            */
            //在线实时生成H5源码，用于预览
            _Html='<iframe src="/makroDigital/marketingExport/reviewHtml/' + mmCode + '" width="768" style="border:0px" height="1024"></iframe>';
            $("#H5Box").html(_Html);
        }
    }
      
    function loadPDF(mmCode){
        if (!$("#PdfBox iframe").length || $("#PdfBox iframe").length==0){
            //OS原尺寸，I在线预览模式
            _Html='<iframe src="/makroDigital/marketingExport/pdf/Preview/I/'+mmCode+'" width="90%" height="736"></iframe>';
            $("#PdfBox").html(_Html);
        }
    }
    
});