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


    loadDuplicate(parent._JC.cunterPage,parent._JC,0);
    
    //获取指定页面副本集列表  
    function loadDuplicate(pageSort,_JC,index){

        var parm={};
            parm.pageSort=_JC.cunterPage;
            parm.width=pageWidth;
            parm.height=pageHeight;
        
        var theDuplicate=_JC.pagesDuplicate[pageSort];

        for (var i=index;i<theDuplicate.length;i++){
            
            //该副本是否有出血线、纸张、页边距，有以出血线左上角坐标开始
            var x=0,y=0;
            
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
            
            //是否主副本
            parm.isValid=theDuplicate[i].isValid;
            
            //以下代码为了防止for遍历大量占用内存
            if (i<theDuplicate.length-1){
                //非最后一个副本,输出base64后,index + 1 -> 调用本身
                var _map=_JC.canvasSave().canvasBase64(parm,theDuplicate[i],canvas,function(base64){
                    
                    var tmp={};
                        tmp.pageNo=parm.pageNo;
                        tmp.pageSort=parm.pageSort;
                        tmp.isValid=parm.isValid;
                        tmp.pic=base64;
                        
                    pageMap.push(tmp);
                    loadDuplicate(pageSort,parent._JC,index+1);
                });
                break;
            }else{
                //最后一个副本,输出base64后，调用生成副本集预览图列表生成函数
                var _map=_JC.canvasSave().canvasBase64(parm,theDuplicate[i],canvas,function(base64){
                    
                    var tmp={};
                        tmp.pageNo=parm.pageNo;
                        tmp.pageSort=parm.pageSort;
                        tmp.isValid=parm.isValid;
                        tmp.pic=base64;
                        
                    pageMap.push(tmp);
                    
                    //调用生成副本集预览图列表生成函数
                    duplicateReview();
                });
                
            }
            

        }
    
    }
    
    //生成预览图列表
    function duplicateReview(){
        
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
            _Html=_Html + '       <p class="info">' + parent.timeToDate(pageMap[i].pageNo*1000) + isValid + '</p>';
            
            _Html=_Html + '         <p>';
            _Html=_Html + '         <span class="chooseDup" data="'+pageMap[i].pageNo+'" >Choose</span>';
            _Html=_Html + '         <span class="deleteDup" data="'+pageMap[i].pageNo+'" >Delete</span>';
            _Html=_Html + '         </p>';
            
            _Html=_Html + '     </div>';
            _Html=_Html + ' </div>';
            _Html=_Html + '</div>';
            
        }
        
        $("#duplicateList").html(_Html);

        layer.close(loadEvent);
    }
    
    //选择版本
    $(document).on("click",".chooseDup",function(){
        
        var pageNo=$(this).attr("data");
        if (pageNo){
            var parm={};
                parm.No=pageNo;
                parm.pageSort=parent._JC.cunterPage;
                parm.pageCode=parent._JC.canvasConfig.recordPointer.pointerPageCode;
                parm.parentCanvas=parent.canvas;
            parent._JC.canvasSave().cutoverPageDuplicate(parm,function(){
                
                //主设计页是否有打开图层窗口
                if (parent.levelWindow!=null){
                    console.log("图层窗口打开中");
                    parent.levelWindow.loadLevel();
                }
                
                //关闭本弹出窗口
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index); 
                
            });
            
        }else{
            //参数异常
            layer.msg("Parameter Exception");
        }
        
    });
    
    //删除版本
    $(document).on("click",".deleteDup",function(){
        var dupOption=$(this).parent().parent().parent().parent();
        var pageNo=$(this).attr("data");
        if (pageNo){
            
          layer.confirm('Confirm to delete ? Unrecoverable', {title:'Warning',
                btn: ['Confirm','Cancel'] //按钮
            }, function(index){
            
                var parm={};
                    parm.pageNo=pageNo;
                    parm.pageSort=parent._JC.cunterPage;
                parent._JC.canvasSave().deletePageDuplicate(parm,function(status){
                    
                    if (status){
                        //删成功
                        $(dupOption).remove();
                        layer.msg("Success")
                    }else{
                        //删除失败
                        layer.msg("Fail");
                    }
                    
                });
            }, function(){
                //取消
                
            });
            
            
        }else{
            //参数异常
            layer.msg("Parameter Exception");
        }
    });
    
    window.loadDuplicate= function(){
       loadDuplicate();
    };
});