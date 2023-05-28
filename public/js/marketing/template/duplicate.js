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
    var imgHeight=windowHeight-170;
    
    //各副本预临图片数组对象 pageMap[sort]={"No","","sort":"","Pic":"base64"};
    var pageMap=[];
    
    var _JC=parent._JC;


    loadDuplicate(_JC.cunterPage,parent._JC);
    
    //获取指定页面副本集列表  
    function loadDuplicate(pageSort,_JC){

        var theDuplicate=_JC.pagesDuplicate[pageSort];
        for (var i=0;i<theDuplicate.length;i++){
            
            var tmp={};
                tmp.pageNo=theDuplicate[i].No;
                tmp.pageSort=pageSort;
                tmp.isValid=theDuplicate[i].isValid;
                tmp.pic=theDuplicate[i].previewUrl;

            if (theDuplicate[i].duplicateRemark){
                tmp.duplicateRemark=(theDuplicate[i].duplicateRemark!=undefined)?theDuplicate[i].duplicateRemark:"";
            }else{
                tmp.duplicateRemark="";
            }
                
            pageMap.push(tmp);

        }
    
        //调用生成副本集预览图列表生成函数
        duplicateReview();
    
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
            _Html=_Html + '         <div class="list-input">';
            _Html=_Html + '             <input type="text" value="'+pageMap[i].duplicateRemark+'" placeholder="Exceeds the 50 limit" maxlength="50" >';
            _Html=_Html + '             <button class="layui-btn layuiadmin-btn-order wDuplicate" data="'+pageMap[i].pageNo+'" >Submit</button>';
            _Html=_Html + '         </div>';
            _Html=_Html + '     </div>';

            _Html=_Html + '     <div class="cmdlist-text">';
            
            //处理复制页面或导入外部页面时产生的特殊副本号
            var createTime=pageMap[i].pageNo+'';
            if (createTime.length>10){
                createTime=createTime.substring(0,10);
            }
            
            _Html=_Html + '       <p class="info">' + parent.timeToDate(createTime*1000) + isValid + '</p>';
            
            _Html=_Html + '         <p>';

            if (pageMap[i].isValid!=0){
                _Html=_Html + '         <span class="chooseDup" data="'+pageMap[i].pageNo+'" >Choose</span>';
                _Html=_Html + '         <span class="deleteDup" data="'+pageMap[i].pageNo+'" >Delete</span>';
            }else{
                _Html=_Html + '         <span class="chooseNoneclick" data="'+pageMap[i].pageNo+'" >Choose</span>';
                _Html=_Html + '         <span class="chooseNoneclick" data="'+pageMap[i].pageNo+'" >Delete</span>';
            }

            
            _Html=_Html + '         </p>';
            
            _Html=_Html + '     </div>';
            _Html=_Html + ' </div>';
            _Html=_Html + '</div>';
            
        }
        
        $("#duplicateList").html(_Html);
        layer.close(loadEvent);
    }

    //填写版本备注
    $(document).on("click",".wDuplicate",function(){
        var remarks=$(this).parent().find("input").val();
        var pageNo=$(this).attr("data");
        if (pageNo!=undefined){
            
            var duplicates=_JC.templateData.cunterPageDuplicate;
            for (var i=0;i<duplicates.length;i++){
                
                if (duplicates[i].No*1 == pageNo*1){
                    duplicates[i].duplicateRemark=remarks;
                    _JC.templateData.cunterPageDuplicate=duplicates;
                    _JC.pagesDuplicate[_JC.cunterPage]=_JC.templateData.cunterPageDuplicate;
                    layer.msg("Success");

                    if (duplicates[i].isValid==0){
                        console.log(parent.canvas);
                        parent.canvas.set({duplicateRemark:remarks});
                    }

                    break;
                }
                
            }
        }else{
            layer.msg("Please refresh the page");
        }
        
    });
    
    //选择版本
    $(document).on("click",".chooseDup",function(){
        
        var pageNo=$(this).attr("data");
        if (pageNo){
            
            //更新模板副本集
            //_JC.pagesDuplicate[_JC.cunterPage]=_JC.templateData.cunterPageDuplicate;
            
            var workCanvas=_JC.screeningDuplicate(parent.canvas.toJSON( _JC.canvasConfig.outFiled ),_JC.canvasPaddX,self.canvasPaddY);
            _JC.canvasSave().updatePageDuplicate(_JC.canvasConfig.recordPointer.pointerPageNo,workCanvas);
            
            
            var parm={};
                parm.No=pageNo;
                parm.pageSort=_JC.cunterPage;
                parm.pageCode=_JC.canvasConfig.recordPointer.pointerPageCode;
                parm.parentCanvas=parent.canvas;
                
            _JC.canvasSave().cutoverPageDuplicate(parm,function(){
                
                _JC.drawing=true;
                //主设计页是否有打开图层窗口
                if (parent.levelWindow!=null){
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
                    parm.pageSort=_JC.cunterPage;
                _JC.canvasSave().deletePageDuplicate(parm,function(status){
                    
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