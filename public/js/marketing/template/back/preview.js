/**

 @Name：makro 
 @Author：makro
 @Site：http://mm.makrogo.com/makroDigital/marketingElement/select
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'layer','laypage'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,form = layui.form
        ,laypage=layui.laypage
        ,layer = layui.layer;
    
    var loadEvent = layer.load(2, {time: 10*1000,shade: [0.3, '#393D49']});
        
    var storage=parent.storage;   
    
    //弹出窗可操作区域高度
    var windowHeight=window.innerHeight;
    $(".pictureList").css("height",(windowHeight-50) + "px");
    var imgHeight=windowHeight-100;
    // $(".imgBox").css("height",windowHeight + "px");
    
    //各副本预临图片数组对象 pageMap[sort]={"No","","sort":"","Pic":"base64"};
    var pageMap=[];
    
    //template模板宽高
    var pageWidth=parent._JC.paperSize.bleedWidth;
    var pageHeight=parent._JC.paperSize.bleedHeight;
    
    //定义预览画布
    var canvas = document.createElement("canvas");
    
    //设置画布宽高
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    
    canvas= new fabric.Canvas('canvas');
    var context = canvas.getContext("2d");


    loadTemplatePages(0,parent._JC);
    
    //获取指定页面副本集列表  
    function loadTemplatePages(pageSort,_JC){

        var parm={};
            parm.pageSort=pageSort;
            parm.width=pageWidth;
            parm.height=pageHeight;
        
        var theDuplicate=_JC.pagesDuplicate[pageSort];

        for (var i=0;i<theDuplicate.length;i++){
            
            //该副本是否有出血线、纸张、页边距，有以出血线左上角坐标开始
            var x=0,y=0;
            
            //当前页主副本
            if (theDuplicate[i].isValid==0){    
                
                var objects=theDuplicate[i].objects;
                for (var j=0;j<objects.length;j++){
                    if (objects[j].dType){
                        if (objects[j].dType=="paperBleed"){
                            x=objects[j].left;
                            y=objects[j].top;
                        }
                    }
                }
            
                parm.x=x;
                parm.y=y;
                
                //副本集页面编码
                parm.pageNo=theDuplicate[i].No;
                parm.isValid=theDuplicate[i].isValid;
            
                //以下代码为了防止for遍历大量占用内存
                if (pageSort<_JC.pagesDuplicate.length-1){
                    
                    //非最后一页,输出base64后,pageSort + 1 -> 调用本身
                    var _map=_JC.canvasSave().canvasBase64(parm,theDuplicate[i],canvas,function(base64){
                        
                        var tmp={};
                            tmp.pageNo=parm.pageNo;
                            tmp.pageSort=parm.pageSort;
                            tmp.isValid=parm.isValid;
                            tmp.pic=base64;
                            
                        pageMap.push(tmp);
                        loadTemplatePages(pageSort + 1,parent._JC);
                    });
                    break;
                }else{
                    
                    //最后一页,输出base64后，调用生成副本集预览图列表生成函数
                    var _map=_JC.canvasSave().canvasBase64(parm,theDuplicate[i],canvas,function(base64){
                        
                        var tmp={};
                            tmp.pageNo=parm.pageNo;
                            tmp.pageSort=parm.pageSort;
                            tmp.isValid=parm.isValid;
                            tmp.pic=base64;
                            
                        pageMap.push(tmp);
                        
                        //调用生成副本集预览图列表生成函数
                        pagesReview();
                    });
                    
                }
            
            }
        }
    
    }
    
    //生成预览图列表
    function pagesReview(){
        
        //追加到图片容器
        var _Html='';
        for(var i=0;i<pageMap.length;i++){
            
            var isValid=(pageMap[i].isValid==0)?" (Current)":"";
            
            _Html=_Html + '<div class="layui-col-md4 layui-col-sm4">';
            _Html=_Html + ' <div class="cmdlist-container choosePicture" >';
            _Html=_Html + '     <div class="imgBox" style="width:auto;height:'+imgHeight+'px;">';
            _Html=_Html + '         <img src="' + pageMap[i].pic +'"  data="'+pageMap[i].pageNo+'"  >';
            _Html=_Html + '     </div>';
            _Html=_Html + '     <div class="cmdlist-text">';
            
            if (i==0){
                var _title='Home page';
            }else if (i>0 && i<pageMap.length-1){
                var _title='Page ' + (i+1);
            }else if (i==pageMap.length-1){
                var _title='Last page';
            }
            
            _Html=_Html + '       <p class="info">' + _title + '</p>';
            
            _Html=_Html + '     </div>';
            _Html=_Html + ' </div>';
            _Html=_Html + '</div>';
            
        }
        
        $("#pagesList").html(_Html);

        layer.close(loadEvent);
    }
    
    window.loadTemplatePages= function(){
       loadTemplatePages();
    };
});