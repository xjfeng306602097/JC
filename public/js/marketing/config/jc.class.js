var JC=function(parm=null){
    var self=this;
    
    //设计模式
    self.designModule="";
    
    //JC 默认值配置
    self.blankPic;
    
    //设备信息
    self.device={
        width:0,
        height:0
    }

    //本地数据库配置
    self.localDB;
    self.dbConfig={
        //本地数据库名
        dbName:"makroMM",
        //画布操作记录
        historyRecordTable:"historyRecord",
        //模板列表页表
        tempPageSaveTable:"tempPageSave"
    };
    
    //引入外部颜色插件
    self.colorPlugin;
    
    //模板数据信息
    self.templateData={
        templateVersion:"",
        mmCode:"",
        templateCode:"",
        //模板各个单页信息，从接口获取
        templatePages:[],
        //删除页面的pageCode记录数组
        deletePagesCode:[],
        //当前页副本集
        cunterPageDuplicate:[]
    }; 
    //模板各个单页副本集数组 [pageCode]=[],[pageCode]=[]
    self.pagesDuplicate=[]; 
    
    //模板页面尺寸信息
    self.paperSize={
        paperWidth:2600,
        paperHeight:1600,
        paperLeft:0,
        paperTop:0,
        paperBackgroundColor:"#ffffff",
        paperBackgroundImage:'',
        bleedWidth:2620,
        bleedHeight:1620,
        bleedTop:0,
        bleedLeft:0,
        marginWidth:2580,
        marginHeight:1580,
        marginLeft:0,
        marginTop:0,
        paperDPI:300,
        paperUnitIndex:1,
        paperUnitName:'mm',
        paperUnitToPx:25.4,
        //是否显示出血线、页边距、纸张边框
        stroke:true,
        
    };
    
    //画布最近点击鼠标坐标
    self.insertX=0,self.insertY=0;
    
    //画布加载偏移量
    self.canvasPaddX=2000;
    self.canvasPaddY=200;
    self.zoomPoint={x:0,y:0};

    //画布最小尺寸/最大尺寸
    self.minZoomCanvasVal=100;
    self.maxZoomCanvasVal=20000;

    //是正在否编辑画布文本中
    self.isEditText=false;
    //是否可以编辑路径状态
    self.isEditDrawLine=false;
    //鼠标模式 0鼠标绘制图形状态 1鼠标正常操作事件状态
    self.mouseMode=1;
    //移动画布，开启移动
    self.panning=false;
    self.pannStart=false;
    //是否开启滑轮缩放画布
    self.isWheelStart=false;
    //鼠标绘制图形状态
    self.mouseDrawShapeStatus=false;
    //鼠标绘制图形类型
    self.mouseDrawShapeType=null;

    //是否限制移出画布监控
    self.isMoveLimit=false;
    //是否可以切换页面，防止上一次切换页面没加载完又通过切换按钮切换其他页面事件时把上一次页面内容丢失。
    self.switchPage=false;

    //用户component最底层值
    self.minLayer=4;
    self.disableComponent=["paperBleed","paperBox","paperMargins","editGroupBg","referenceLine","paperSlice","panningBox","alignmentLine"];//,"BackgroundImage"

    //画布设置、输出参数配置
    self.canvasConfig={
        //保存json输出自定义字段
        outFiled:['id','scaleX','angle','pageCode','pageTitle','layerTitle','parentID','controlType','sortPath','shadowAngle','shadowBase64','base64Width','base64Height','scaleY','stroke','selectable','opacity','fontFamily','textLines','fill','strokeWidth','top','left','width','height','dType','zIndex','type','codeVal','text','pic','dataSort','dSort','elementCode','itemCode','pageBgMode','radius','fillRule','path','lineCoords','strokeDashArray','d','aCoords','bl','x','y','points','options','fontCmyk','hex','strokeCmyk','backgroundColorCmyk','fillCmyk','shadowColor','shadowColorCmyk','shadowOffset','isValid',"No",'dtypeIndex','previewUrl','dataFiled','cmykPic','picid','namethai','nameeng','bindItemCode','customSetPic','pathOffset','textInfogmtCreate','padding','splitByGrapheme','lkSort','insertText','pnIndex','fontPt','strokePt','duplicateRemark','rotateXY','viewBoxWidth','viewBoxHeight','lockMovementX','lockMovementY','lockScalingX','lockScalingY','lockRotation','nanTop'],
        
        /*
         * 多页面排版 MOREPAGES-CANVAS
         * @ canvasPages 模块页面多TextThai页数据组合结构
         * @ isMorePagesDraw 是否一版多页模式
         */

         canvasPages:null,
         pageOption:null,
         isMorePagesDraw:false,
         slicesPage:null,
         //MM模板状态
         templateStatus:null,

        /*
         * 当前画布操作记录指针
         * @ pointerIndex historyRecord表中当前索引位置
         * @ pointerTemplateCode 当前模板单页编码
         * @ pointerPageCode 当前模板中单页面编码
         * @ pointerPageNo 当前操作模板单页面中多个副本中内部编号
         * @ recordUUID 本次模板设计器打开生成监听UUID码 
             取值随机生成16位数字
         */
         
        recordPointer:{
            pointerIndex:-1,
            pointerTemplateCode:"",
            pointerPageCode:"",
            pointerPageNo:"",
            recordUUID:""
        },
        //默认背景图
        defauleBackgroundImage:"",
        //默认文本字号
        defauleFontPt:24,
        defauleFontSize:24,
        //用户最后选择字号
        lastFontSize:24,

        //默认文本字体
        defauleFontFamily:'freeserif',
        //用户最后选择字体
        lastFontFamily:'freeserif',

        //画布自适应居中偏移量
        zoomParm:{vt4:0,vt5:0}
    };
    
    /**
     * 元件类变量
     * @ cunterObj 当前选中组件(或多选中组件) Object
     * @ selectedObject 选中组件合组 Array 
     * @ insertObjectType 准备插入组件类型 String
     * @ insertStatus 是否准备插入组件状态 true false
     * @ undoGroupSource 拆分组 临时保存原组信息 Object 需写入indexDB库
     * @ clipboard 剪贴板数据
     * @ editGroupZindex 编辑分组时，背景区域zIndex值
     * @ mouseInfo {status:0:onDownPos:{x:0,y:0},onUpPos:{x:0,y:0}}
     *   status 鼠标mouseDown=0 按下鼠标坐标,mouseUp=1 弹起鼠标坐标 onDownPos
     */ 
    self.cunterObj=null;
    self.selectedObject=null;
    self.insertObjectData={};
    self.insertStatus=false;
    self.undoGroupSource=null;
    self.clipboard;
    self.editGroupZindex=1000;
    //文本样式格式刷
    self.textStyle=null;
    //选择工具类型：true 组件选择模式，false穿透编组直接选择内部元素模式
    self.isPixSelect=true;
    //是否按键shift中
    self.isShift=false;
    self.mouseInfo={status:1};

    /**
     * 模板类变量
     * @ saveStatus 当前操作保存到网上是否可保存操作中状态 false可以保存，true在保存中，不可再点保存
     * @ cunterPage 当前页码 Int 当前页在模板中排序
     * @ pageArrJson 模板页加载列表 Array  
     *   ->sort 当前页排序
     *   ->pageJson 当前页加载或切换时，临时保存画布json
     *   ->pageCode 当前模板单页编码
     *   ->del 当前模板单页是否临时删除
     *  @ drawing 当前加载到画布是否有更改，用于是否生成新缩略图
     *  @ mouseoverObject 鼠标滑过的组件
     *  @ alignmentLineObject 当拖动组件时，显示智能辅助线
     *  @ disAlignmentLine 是否显示智能辅助线
     */ 
    self.saveStatus=false;
    self.cunterPage=0;
    self.pageArrJson=[];
    self.drawing=false;
    self.mouseoverObject=null;
    self.alignmentLineObject=null;
    self.disAlignmentLine=false;

    /**  
     * 预览页面类
     * @ previewCanvas预览画布
     * @ previewStatus 预览区画布是否初始化状态 true false
    */
    self.previewCanvas;
    self.previewStatus=false;
    self.previewCanvasSize={
        width:0,
        height:0
    }
    /**
     * 页面元素邦定事件
     * @ undo 撤消操作事件
     * @ toD0 重做操作事件
     */ 
    
    self.pageEventObject={
        //事件类型，元素ID,[禁用class,可用class]
        unDo:{id:"unDo",disableClass:["noneClick",""]},
        toDo:{id:"toDo",disableClass:["noneClick",""]},
        zoomValue:{id:"scaleNumber",value:"100%"},
    }
    
    /**
     * 模板类操作
     */ 
    self.templateAffair=function(parm=null){
        var _parent=this;
        
        //加载模板文件
        this.loadTemplate=function(parm=null,callback=null){
            
            canvas.loadFromJSON(parm,function(){ 
                
                canvas.renderAll.bind(canvas);
                    
                //获取该模板当前单页面所有副本内容集合
                self.templateData.cunterPageDuplicate=parm.duplicate;
                self.pagesDuplicate[parm.pageCode]=parm.duplicate;   
                    
                //更新历史面板当前页码
                self.canvasConfig.recordPointer.pointerPageCode=parm.pageCode;    
                    
                /**
                 * 从副本主中取出活动版本
                 * [{"objects":[],"width":600,"height":600,"isValid":0,"No":"0001"}]
                 * @ isValid 0为活动中的主版本， 1为普通副本
                 * @ No 副本的内部编号
                 */
                var pageData=parm.duplicate; 
                var data={};
                
                for (i in pageData){
                    if (pageData[i].isValid==0){
                        data=pageData[i];
                        //通知历史记录指针，获取当前操作的副本内部编号
                        self.canvasConfig.recordPointer.pointerPageNo=data.No;
                    }
                }
                
                data.width=data.width + self.canvasPaddX * 2;
                data.height=data.height + self.canvasPaddY * 2;
                if (data.objects){
                    
                    //监时处理，要删除，加载旧模板所有对象增加偏移量 / MM的商品信息更新
                    for (var i=0;i<data.objects.length;i++){
                        data.objects[i].left=data.objects[i].left + self.canvasPaddX;
                        data.objects[i].top=data.objects[i].top + self.canvasPaddY;
                    }

                    self.canvasDraw().canvasLoad(data,callback);
                }else{
                    return false;
                } 
                 
                    
            });
            
        }
        
        //页面切换
        this.cutoverTemplatePage=function(parm=null,callback=null){
            
                //模板集遍历
                pageFor:for (var p=0;p<self.templateData.templatePages.length;p++){
                    
                    if (self.templateData.templatePages[p].isDelete==0 && self.templateData.templatePages[p].pageCode==parm.pageCode){
                        
                        var theSort=p;

                        if (theSort<0){
                            //layer.msg("theSort<0");
                            return;
                        }

                        self.cunterPage=p;

                        //副本集遍历    
                        for (var i=0;i<self.pagesDuplicate[theSort].length;i++){
                            
                            if (self.pagesDuplicate[theSort][i].isValid==0){
                               
                                parm.No=self.pagesDuplicate[theSort][i].No;
                                parm.pageSort=theSort;
                                self.canvasSave().cutoverPageDuplicate(parm,callback);
                     
                                break pageFor;
                                
                            }
                        }
                        
                        // if (parm.pageSort){
                        //     break;
                        // }
                    }
                }
                
            // (callback && typeof(callback) === "function") && callback();
        }
        
        //刷新重新加载指定页面
        this.reloadTemplatePage=function(parm=null,callback=null){
            self.canvasConfig.recordPointer.pointerIndex=-1;
            _parent.templateAffair().loadTemplate(parm);
            
        }
        
        //模板新增空白页面
        this.insertPage=function(parm=null,callback=null){
            
            //获取当前有效最大页数
            var pageSort=_parent.getTemplateValidPages() + 1;
            
            //在templateData.templatePageList 追加新页
            var tmpPage={};

                tmpPage.sort=pageSort;
                
                //New- 用于新增页面历史操作面板记录主键用，在保存模板时，识别过滤清空不提交该code
                
                tmpPage.pageCode=_parent.createPageUuid();
                tmpPage.templateCode=self.templateData.templateCode;
                tmpPage.mmCode=self.templateData.mmCode;
                tmpPage.version=0;
                tmpPage.isDelete=0;
                tmpPage.templateFile="";
                           
            self.templateData.templatePages.push(tmpPage);
            
            //在self.pagesDuplicate 追加新下标
            var tmpOption=self.canvasConfig.pageOption;
            var slicesPage=self.canvasConfig.slicesPage;
            /*
            var maxPage=[];
            switch (tmpOption)
            {
                case "1":
                    maxPage=[1];
                break;
                case "2LR":
                    maxPage=[1,2];
                break;
                case "2TB":
                    maxPage=[1,2];
                break;
                case "4LRTB":
                    maxPage=[1,2,3,4];
                break;
            }*/
            var textObj=new fabric.Textbox(("P" + pageSort), { 
              fontFamily: "freeserif", 
              fontPt: self.canvasConfig.defauleFontPt, 
              fontSize:self.canvasConfig.defauleFontSize, 
              fill:"#000000",
              fillCmyk:"75,68,67,90",
              left:0,
              top: self.paperSize.bleedHeight - self.canvasConfig.defauleFontSize,
              zIndex:12,
              dtypeIndex:self.createTypeIndex("text"),
              id:self.createID(),
              text:("P" + ((pageSort-1)*slicesPage.length+1)),
              pnIndex:0,
              editable:false,
              // width:80,
              dType:"PageNo",
              strokeWidth: 0,
             }); 

            var newPageDuplicate=[];
                newPageDuplicate[0]={};
                newPageDuplicate[0].No=Math.round(new Date().getTime()/1000).toString();
                newPageDuplicate[0].width=self.paperSize.paperWidth;
                newPageDuplicate[0].height=self.paperSize.paperHeight;
                newPageDuplicate[0].version="4.4.0";
                newPageDuplicate[0].objects=[];
                newPageDuplicate[0].isValid=0;
                newPageDuplicate[0].pageCode=tmpPage.pageCode;
                newPageDuplicate[0].previewUrl="";
            
            newPageDuplicate[0].objects.push(textObj);


              var img = new Image();//创建新的图片对象
              img.src = self.blankPic;
              
              img.setAttribute("crossOrigin",'Anonymous')
              img.onload = function(e){//图片加载完，再draw 和 toDataURL
                        
                    if (e.path){
                      var imgWidth=e.path[0].width;
                      var imgHeight=e.path[0].height;
                    }else{
                      var imgWidth=this.width;
                      var imgHeight=this.height;
                    }
                    
                    // context.drawImage(img,0,0);    
                    var fabricImage = new fabric.Image(img, {
                        // left:self.paperSize.paperLeft + self.canvasPaddX,
                        // top:self.paperSize.paperTop + self.canvasPaddY,
                        left:0,
                        top:0,
                        scaleX:1,
                        scaleY:1,
                        zIndex:4,
                        visible:false,
                        lockMovementX:true,
                        lockMovementY:true,
                        lockScalingX:true,
                        lockScalingY:true,
                        dtypeIndex:1,
                        width:imgWidth,
                        height:imgHeight,
                        angle:0,
                        id:"BackgroundImage",
                        dType:"BackgroundImage",
                    });
                            
                    newPageDuplicate[0].objects.push(fabricImage);

                    self.pagesDuplicate.push(newPageDuplicate);
                    
                    (callback && typeof(callback) === "function") && callback(pageSort);


               };



            
        }
        
        //复制页面
        this.copyPage=function(parm=null,callback=null){

            if (parm.hasOwnProperty("pageCode")==false){
                return;
            }
            
            //获取当前有效最大页数
            var pageSort=_parent.getTemplateValidPages() + 1;

            //在templateData.templatePageList 追加新页
            var tmpPage={};
                tmpPage.sort=pageSort;
                
                //New- 用于新增页面历史操作面板记录主键用，在保存模板时，识别过滤清空不提交该code
                tmpPage.pageCode=_parent.createPageUuid();
                
                tmpPage.templateCode=self.templateData.templateCode;
                tmpPage.mmCode=self.templateData.mmCode;
                tmpPage.version=0;
                tmpPage.isDelete=0;
                tmpPage.templateFile="";
                           
            self.templateData.templatePages.push(tmpPage);
            
            if (parm.pageCode!=self.canvasConfig.recordPointer.pointerPageCode){

                var canvasCode=null;

                for (var p=0;p<self.pagesDuplicate.length;p++){

                    var _pagesDuplicate=self.pagesDuplicate[p];

                    for (var d=0;d<_pagesDuplicate.length;d++){

                        if (_pagesDuplicate[d].hasOwnProperty("pageCode")){ 

                            if (parm.pageCode==_pagesDuplicate[d].pageCode && _pagesDuplicate[d].isValid==0){
                                var codeStr=JSON.stringify(_pagesDuplicate[d]);
                                canvasCode=JSON.parse(codeStr);

                            }
                        }

                    }

                }

                if (canvasCode==null){
                    console.log("copyPage is Error",parm.pageCode,self.pagesDuplicate);
                }

            }else{

                //当前画布转json
                var canvasCode=canvas.toJSON( self.canvasConfig.outFiled ); 

                //过滤出血线等  
                canvasCode=_parent.screeningDuplicate(canvasCode,self.canvasPaddX,self.canvasPaddY);

            }

            //更新新页面 PageNo 数据
            if (canvasCode.hasOwnProperty("objects")){

                var slicesPage=self.canvasConfig.slicesPage;
                var disableComponent=self.disableComponent;

                for (var i=0;i<canvasCode.objects.length;i++){

                    if (canvasCode.objects[i].hasOwnProperty("dType")){

                        if (canvasCode.objects[i].dType=="PageNo"){
                            var pnIndex=0;
                            if (canvasCode.objects[i].hasOwnProperty("pnIndex")){
                                pnIndex=canvasCode.objects[i].pnIndex*1;
                            }

                            var pageNoText="P" + ((pageSort-1)*slicesPage.length +slicesPage[pnIndex]);
                            canvasCode.objects[i].text=pageNoText;
                            
                        }

                        if (canvasCode.objects[i].hasOwnProperty("id")){

                            if (disableComponent.indexOf(canvasCode.objects[i].dType)==-1){ 

                                canvasCode.objects[i].id=self.createID()
                            } 


                        }

                    }

                }

            }



            //更新页面副本集编码
            // canvasCode.No= Math.round(new Date() / 1000);
            canvasCode.No=self.createID();
            canvasCode.pageCode=tmpPage.pageCode;
            
            //更新到模板副本集
            var newPageDuplicate=[canvasCode];
            self.pagesDuplicate.push(newPageDuplicate);
            
            (callback && typeof(callback) === "function") && callback(pageSort);
            
        }
        
        //模板删除指定页面
        this.deletePage=function(parm=null,callback=null){
            
            //删除指定页
            var pageSort=-1;

            for (var i=0;i<self.templateData.templatePages.length;i++){
                if (self.templateData.templatePages[i].pageCode==parm.pageCode){

                    pageSort=i;
                    break;
                }

            }

            if (pageSort===-1){

                (callback && typeof(callback) === "function") && callback(false);
                return;
            }

            //获取模板有效页数量
            var pageCount=_parent.getTemplateValidPages();
            
            //根据模板页有效页面数量>1可删,=1不可删
            if (pageCount==1){
                
                (callback && typeof(callback) === "function") && callback(false);
                return;

            }else{
                
                if (self.cunterPage!=pageSort){
                    //删除非当前页
                    
                    //删除模板对应副本集
                    self.pagesDuplicate.splice(pageSort,1);
                    
                    //删除模板页面列表数组对应状态
                    self.templateData.templatePages.splice(pageSort,1);
                    if (self.cunterPage>pageSort){
                        self.cunterPage--;
                    }
                    
                    (callback && typeof(callback) === "function") && callback(-1);

                }else{   
                    //删除当前页


                    //先切换页面后再删除对数下标数组

                    if (pageSort==0){
                        //删除首页
                        
                        var toSort=1;

                    }else if (pageSort+1==pageCount){
                        //删除最后一页
                        
                        var toSort=pageSort-1;

                    }else{
                        //删除中间页
                
                        var toSort=pageSort + 1;
                    }


                    var pageParm={};
                        pageParm.pageCode=self.templateData.templatePages[toSort].pageCode;
                        pageParm.file="";
                

                    //替换删除当前页后页面的PageNo数据
                    _parent.cutoverTemplatePage(pageParm,async function(){
                        
                        //删除模板对应副本集
                        self.pagesDuplicate.splice(pageSort,1);
                        
                        //删除模板页面列表数组对应状态
                        self.templateData.templatePages.splice(pageSort,1);
                        
                        var pnIndex=0;
                        var tmpOption=_JC.canvasConfig.pageOption;

                        //重新设置templatePages的sort值
                        for (var i=0;i<self.templateData.templatePages.length;i++){
                            self.templateData.templatePages[i].sort=i+1;
                            if (pageParm.pageCode==self.templateData.templatePages[i].pageCode){
                                self.cunterPage=i;
                            }
                        }
                        
                        (callback && typeof(callback) === "function") && callback(toSort);
                        
                    });
                }
            }
        }
        
        //模板页面排序调整
        
        //获取模板当前有效页面数量
        this.getTemplateValidPages=function(){
            
            var pageCount=0;
            var pagesList=self.templateData.templatePages;
            for (var i=0;i<pagesList.length;i++){
                
                if (pagesList[i].isDelete==0){
                    ++pageCount;
                }
                
            } 
            
            return pageCount;
        }
        

        //生成模板页面uuid
        this.createPageUuid=function (len, radix) {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        
        
        return this;
    }
    
    
    
    /**
     * 画布初始化
     * @ 重设画布尺寸、绘制出血线、绘制纸张、绘制页边距
     *.@ 根据页面出血线尺寸计算画布大小。
     * @ 画布宽为 出血线宽 + 600
     * @ 画布高为出血线高度
     */
    
    self.init=function(parm=null){
        
        //组件控制器样式默认设置 
        self.canvasDraw().setCornerStyle();
        //画布扩展事件
        self.canvasDraw().canvasExtend();

        //清空历史操作记录表及模板列表临时表，
        //根据templateCode查找历史库并删除对应的记录
            
        //历史记录初始化
        self.canvasConfig.recordPointer={
            pointerIndex:-1,
            pointerTemplateCode:parm.templateCode,
            pointerPageCode:parm.pageCode,
            recordUUID:(self.createUUID())
        }

        self.localDB.deleteAfterData(
            {name:self.dbConfig.historyRecordTable,type:'readwrite'} 
            ,"templateCode"
            ,-1
            ,self.canvasConfig.recordPointer.pointerTemplateCode);
            
        self.localDB.deleteAfterData(
            {name:self.dbConfig.tempPageSaveTable,type:'readwrite'}
            ,"templateCode"
            ,-1
            ,self.canvasConfig.recordPointer.pointerTemplateCode);

        
        //模板参数
        self.templateData={
            mmCode:parm.mmCode,
            templateCode:parm.templateCode,
            //模板各个单页信息，从接口获取
            templatePages:parm.templatePages,
            //当前页副本集
            cunterPageDuplicate:[]
        };
        
        //纸张参数
        self.paperSize.paperWidth=parm.paperWidth;
        self.paperSize.paperHeight=parm.paperHeight;
        self.paperSize.paperLeft=parm.paperLeft;
        self.paperSize.paperTop=parm.paperTop;
        self.paperSize.paperBackgroundColor=parm.paperBackgroundColor;
        self.paperSize.paperBackgroundImage=parm.paperBackgroundImage;
        
        self.paperSize.bleedWidth=parm.bleedWidth;
        self.paperSize.bleedHeight=parm.bleedHeight;
        self.paperSize.bleedLeft=parm.bleedLeft;
        self.paperSize.bleedTop=parm.bleedTop;
        
        self.paperSize.marginWidth=parm.marginWidth;
        self.paperSize.marginHeight=parm.marginHeight;
        self.paperSize.marginLeft=parm.marginLeft;
        self.paperSize.marginTop=parm.marginTop;
        
        self.paperSize.paperDPI=parm.paperDPI;
        self.paperSize.paperUnitIndex=parm.paperUnitIndex;
        self.paperSize.paperUnitName=parm.paperUnitName;
        self.paperSize.paperUnitToPx=parm.paperUnitToPx;
        self.defauleFontSize=self.defauleFontPt;
            
        self.canvasConfig.templateStatus=parm.templateStatus;

        //MOREPAGES-CANVAS
        self.canvasConfig.canvasPages=parm.canvasPages;
        self.canvasConfig.pageOption=parm.pageOption;
        self.canvasConfig.isMorePagesDraw=parm.isMorePagesDraw;
        if (isEmpty(self.canvasConfig.pageOption)==false){
            switch (self.canvasConfig.pageOption)
            {
                case "1":
                    self.canvasConfig.slicesPage=[1];
                break;
                case "2LR":
                    self.canvasConfig.slicesPage=[1,2];
                break;
                case "2TB":
                    self.canvasConfig.slicesPage=[1,2];
                break;
                case "4LRTB":
                    self.canvasConfig.slicesPage=[1,2,3,4];
                break;
            }
        }

        //画布容器尺寸
        self.device.width=parm.deviceWidth;
        self.device.height=parm.deviceHeight;
        
        //画布尺寸配置
        self.canvasConfig.width=self.paperSize.bleedWidth*1+(self.canvasPaddX * 2);
        self.canvasConfig.height=self.paperSize.bleedHeight*1+(self.canvasPaddY * 2);

        //更新画布尺寸
        self.canvasDraw().canvasSize(self.canvasConfig);

        //设置画布鼠标默认图标
        canvas.defaultCursor ='default';
        canvas.hoverCursor='default';
        
        if (self.designModule!="component"){
            self.isMoveLimit=false;
        }else{
            self.minLayer=3;
            self.isMoveLimit=true;
        }

        //自适应缩放
        self.canvasDraw().autoZoom();
        setTimeout(function() {
            self.canvasDraw().autoZoom();
        },1000);
        /**
         * 启用画布临听
         */
        
        //监听鼠标滚轮缩放事件
        canvas.on('mouse:wheel', opt => {

            if (self.isWheelStart && self.designModule!=""){  
                const delta = opt.e.deltaY 
                // 滚轮，向上滚一下是 -100，向下滚一下是 100
                let zoom = canvas.getZoom() 
                // 获取画布当前缩放值
                zoom *= 0.999 ** delta
                if (zoom > 20) zoom = 20 
                // 限制最大缩放级别
                if (zoom < 0.01) zoom = 0.01 
                // 限制最小缩放级别
               
                if (zoom * self.paperSize.bleedWidth<self.minZoomCanvasVal || zoom * self.paperSize.bleedWidth>=self.maxZoomCanvasVal){
               
                    //画布缩放不能小于100px及大于10000px,不处理
                    self.pageEvent.errMsg("Canvas zoom cannot be less than "+self.minZoomCanvasVal+"pt and greater than "+self.maxZoomCanvasVal+"pt");
                    return;
                }
                
                document.getElementById(self.pageEventObject.zoomValue.id).innerText=parseInt(zoom * 100) + "%";
                // 以鼠标所在位置为原点缩放
                canvas.zoomToPoint(
                  { // 关键点
                    x: opt.e.offsetX,
                    y: opt.e.offsetY
                  },
                  zoom 
                  // 传入修改后的缩放级别
                )

                // if (!isEmpty(self.selectedObject)){
                //     setTimeout(function() {
                //         self.canvasDraw().drawSelectedControls();
                //     },500);
                // }

            }
        });


        //鼠标左键按下事件监控
        canvas.on('mouse:down', e => {
            
            //锁定画布不能做任何操作
            if (lockStatus){
                self.attributesShow().paper();
                canvas.discardActiveObject();
                return;
            }

            self.mouseInfo={status:0,onDownPos:{x:e.absolutePointer.x,y:e.absolutePointer.y,onUpPos:{x:-1,y:-1}}};
   
            if (self.mouseDrawShapeStatus){


                self.insertObjectData.dType = null;
                self.insertObjectData.name = null;
                self.insertObjectData.file = null;
                self.insertObjectData.dataFiled = null;
                self.insertObjectData.insertText = null;
                self.insertStatus = false;

                canvas.skipTargetFind = true;
                canvas.selection=false;
                canvas.selectable=false;
                canvas.discardActiveObject();
                canvas.renderAll();
                switch (self.mouseDrawShapeType)
                {
                    case "Rect":

                        var data={};
                            data.left=e.absolutePointer.x;
                            data.top=e.absolutePointer.y;
                            data.width=10;
                            data.height=10;
                            data.type="rect";
                            data.fill="#eeeeee";
                            data.opacity=1;
                            data.dType="shape";
                            data.stroke='#eeeeee';
                            data.strokeWidth=0.5;
                            data.scaleX=1;
                            data.scaleY=1;
                            data.zIndex=self.getCanvasObjCount();
                            data.id=self.createID();
                            data.visible=true;
                        
                        var rect = new fabric.Rect(data);
                        canvas.add(rect).setActiveObject(rect).renderAll();
                        self.cunterObj=rect;
                        if (self.undoGroupSource!=null){
                            self.cunterObj.parentID=self.undoGroupSource.id;
                        }
                        self.cunterObj.sortPath=canvas._objects.length - 2 ;

                        self.layer.canvasOperation.createComponent(self.cunterObj);
                        self.componentDraw().setObjectrotateXY();

                    break;
                    case "Line":

                        var points = [{
                            x: e.absolutePointer.x, y: e.absolutePointer.y
                        }, {
                            x: (e.absolutePointer.x + 1), y: (e.absolutePointer.y+1)
                        }];

                        var line = new fabric.Polygon(points, {
                            left: e.absolutePointer.x,
                            top: e.absolutePointer.y,
                            x:e.absolutePointer.x,
                            y:e.absolutePointer.y,
                            fill: '',
                            fillCmyk:'',
                            dType:"shape",
                            type:"polygon",
                            strokeWidth: 0.1,
                            stroke: '#000000',
                            strokeCmyk:'75,68,67,90',
                            scaleX: 1,
                            scaleY: 1,
                            padding:5,
                            id:(self.createID()),
                            zIndex:self.getCanvasObjCount(),
                            dtypeIndex:self.createTypeIndex("dottedLine"),
                            strokeDashArray:[1,0],
                            objectCaching: false,
                            transparentCorners: false,
                            cornerColor: 'blue',
                            hasBorders: false,
                            hasControls: true,
                            controlType:"line",//自定义属性，用于控制器管理样式
                        });

                        canvas.add(line).setActiveObject(line).renderAll();
                        self.cunterObj=line;
                        if (self.undoGroupSource!=null){
                            self.cunterObj.parentID=self.undoGroupSource.id;
                        }
                        self.cunterObj.sortPath=canvas._objects.length - 2 ;
                        self.layer.canvasOperation.createComponent(self.cunterObj);
                        self.componentDraw().setObjectrotateXY();
                        self.componentDraw().drawLine();
                    break;

                    case "Arrow":
                 
                        var Arrow = new fabric.Path(self.componentDraw().drawArrow(e.absolutePointer.x, e.absolutePointer.y, e.absolutePointer.x + 5, e.absolutePointer.y + 5, 10, 10), {
                          stroke: "#000000",
                          strokeCmyk:'75,68,67,90',
                          fill: "",
                          dType:"shape",
                          type:"path",
                          strokeWidth: 0.5,
                          id:self.createID(),
                          zIndex:self.getCanvasObjCount(),
                          controlType:"arrow",//自定义属性，用于控制器管理样式
                        });

                        canvas.add(Arrow).renderAll();
                        self.cunterObj=Arrow;
                        if (self.undoGroupSource!=null){
                            self.cunterObj.parentID=self.undoGroupSource.id;
                        }
                        self.cunterObj.sortPath=canvas._objects.length - 2 ;
                        self.layer.canvasOperation.createComponent(self.cunterObj);
                        self.componentDraw().setObjectrotateXY();
                    break;
                    case "Circle":
                        //var fileContent='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="0 0 20 20" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 10 10)"><path id="✏️ (轮廓)" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(3.149999000000207 3.1499989956600984)  rotate(0 6.850000500000001 6.850000500000001)" opacity="1" d="M2.01 11.69C2.64 12.33 3.36 12.81 4.18 13.16Q5.455 13.7 6.85 13.7Q8.245 13.7 9.52 13.16C10.34 12.81 11.06 12.33 11.69 11.69C12.33 11.06 12.81 10.34 13.16 9.52Q13.7 8.245 13.7 6.85Q13.7 5.455 13.16 4.18C12.81 3.36 12.33 2.64 11.69 2.01C11.06 1.38 10.34 0.89 9.52 0.54Q8.245 0 6.85 0Q5.455 0 4.18 0.54C3.36 0.89 2.64 1.38 2.01 2.01C1.38 2.64 0.89 3.36 0.54 4.18Q0 5.455 0 6.85Q0 8.245 0.54 9.52C0.89 10.34 1.38 11.06 2.01 11.69ZM4.65 12.06C3.98 11.77 3.38 11.37 2.86 10.84C2.33 10.32 1.93 9.72 1.64 9.05C1.35 8.35 1.2 7.62 1.2 6.85C1.2 6.08 1.35 5.35 1.64 4.65C1.93 3.98 2.33 3.38 2.86 2.86C3.38 2.33 3.98 1.93 4.65 1.64C5.35 1.35 6.08 1.2 6.85 1.2C7.62 1.2 8.35 1.35 9.05 1.64C9.72 1.93 10.32 2.33 10.84 2.86C11.37 3.38 11.77 3.98 12.06 4.65C12.35 5.35 12.5 6.08 12.5 6.85C12.5 7.62 12.35 8.35 12.06 9.05C11.77 9.72 11.37 10.32 10.84 10.84C10.32 11.37 9.72 11.77 9.05 12.06C8.35 12.35 7.62 12.5 6.85 12.5C6.08 12.5 5.35 12.35 4.65 12.06Z"></path></g></svg>';
                        //var svgParm={file:fileContent,x:e.absolutePointer.x,y:e.absolutePointer.y};
                        //self.componentDraw().insertStringSvg(svgParm,null);

                        var ellipse = new fabric.Ellipse({
                            top: e.absolutePointer.x,
                            left: e.absolutePointer.y,
                            rx: 5,
                            ry: 5,
                            radiusX:(e.absolutePointer.x + 2.5),
                            radiusY:(e.absolutePointer.y + 2.5),
                            fill: '',
                            id:self.createID(),
                            stroke: "#000000",
                            strokeCmyk:'75,68,67,90',
                            dType:"shape",
                            type:"ellipse",
                            zIndex:self.getCanvasObjCount()
                          })
                          canvas.add(ellipse).setActiveObject(ellipse).renderAll();
                          self.cunterObj=ellipse;
                          self.componentDraw().setObjectrotateXY();
                          if (self.undoGroupSource!=null){
                                self.cunterObj.parentID=self.undoGroupSource.id;
                          }
                          self.cunterObj.sortPath=canvas._objects.length - 2 ;
                          self.layer.canvasOperation.createComponent(self.cunterObj);
                    break;
                    case "Triangle":

                        var path = "M " + e.absolutePointer.x + " " + e.absolutePointer.y + " L " + (e.absolutePointer.x) + " " + (e.absolutePointer.y + 10) + " L " + (e.absolutePointer.x + 10) + " " + (e.absolutePointer.y + 10) + " z";
                        var triangle = new fabric.Path(path, {
                          left: e.absolutePointer.x,
                          top: e.absolutePointer.y,
                          stroke: "#000000",
                          strokeCmyk:'75,68,67,90',
                          strokeWidth: 0.5,
                          fill: "rgba(255, 255, 255, 0)",
                          dType:"shape",
                          type:"path",
                          id:self.createID(),
                          zIndex:self.getCanvasObjCount()
                        });
                        canvas.add(triangle).setActiveObject(triangle).renderAll();
                        self.cunterObj=triangle;
                        self.componentDraw().setObjectrotateXY();
                        if (self.undoGroupSource!=null){
                            self.cunterObj.parentID=self.undoGroupSource.id;
                        }
                        self.cunterObj.sortPath=canvas._objects.length - 2 ;
                        self.layer.canvasOperation.createComponent(self.cunterObj);

                    break;

                    case "Text":
                        var parm={"fontFamily":self.canvasConfig.lastFontFamily};
                        
                        self.componentDraw().insertText(parm,function(){

                            if (self.cunterObj!=null){
                                if (self.cunterObj.type=="textbox"){
                                    self.cunterObj.text="Text";

                                    self.componentDraw().setObjectrotateXY();
                                    // canvas.selection = false;
                                    canvas.defaultCursor = 'default';
                                    canvas.hoverCursor = 'default';
                                    canvas.renderAll();
                                    canvas.setActiveObject(self.cunterObj);
                                    self.cunterObj.enterEditing();
                                    self.cunterObj.hiddenTextarea.focus();
                                    self.cunterObj.selectAll();
                                    self.isEditText=true;
                                }
                            }


                        });
                    break;
                    case "PageNo":
    
                       self.componentDraw().insertPageNo({name:"P",dType:"PageNo"},function(result){
                            if (result==true){
                                msg="Insert PageNo";
                                self.canvasSave().canvasHistoryRecordCall(msg);
                            }else{
                                layer.msg(result);
                            }
          

                            self.componentDraw().setObjectrotateXY();
                            canvas.selection = true;
                            canvas.defaultCursor = 'default';
                            canvas.hoverCursor = 'default';
                            canvas.renderAll();

                            $("#selectComponent").click();

                        });   


                    break;


                }

                return;
            }
 

            self.mouseoverObject=null;
            if (e.target){
                console.log(e.target);
                if (e.target.type){

                    if (e.target.type!="activeSelection"){

                        if (e.target.hasOwnProperty("dType")==false){

                            switch (e.target.type)
                            {

                                case "group":
                                    e.target.dType="tmpGroup";
                                break;
                                case "image":
                                    e.target.dType="Picture";
                                break;
                                case "line":
                                    e.target.dType="shape";
                                break;
                                case "rect":
                                    e.target.dType="shape";
                                break;
                                case "circle":
                                    e.target.dType="shape";
                                break;
                                case "path":
                                    e.target.dType="shape";
                                break;
                                case "polygon":
                                    e.target.dType="shape";
                                break;
                                case "ellipse":
                                    e.target.dType="shape";
                                break;
                                case "textbox":
                                    e.target.dType="text";
                                break;
                                case "i-text":
                                    e.target.dType="text";
                                break;
                            }

                        }

                    }


                    if (self.isEditDrawLine){
                 
                        self.componentDraw().exitDrawLine(e);
                    }

          
                }
                var elementType=["paperBleed","paperBox","paperMargins","editGroupBg","paperSlice","BackgroundImage","alignmentLine"];//"referenceLine","BackgroundImage"
                if (e.target.dType=="referenceLine"){
                    if (e.target.left*1==0){
                        e.target.set({
                            padding:20,
                            hasBorders: false,
                            hasControls: false,
                            lockMovementX: true,
                            lockMovementY: false,
                            strokeWidth:0.5,
                            stroke: 'red',
                            selectable:true
                        })
                    }else if (e.target.top * 1==0){
                        e.target.set({
                            padding:20,
                            hasBorders: false,
                            hasControls: false,
                            lockMovementX: false,
                            lockMovementY: true,
                            strokeWidth:0.5,
                            stroke: 'red',
                            selectable:true
                        })
                    }
                }


                if (elementType.indexOf(e.target.dType)==-1){

                    if (e.target.id!="BackgroundImage"){
                        e.target.selectable=true;
                    }
                    


                    //智能对齐辅助线 记录画布顶层对象坐标点
                    if (self.disAlignmentLine && self.alignmentLineObject==null && self.panning==false && e.target.dType!="referenceLine"){
                        self.alignmentLineObject={level:[],vertical:[]};
                        var _level=[],_vertical=[];
                        for (var i=0;i<canvas._objects.length;i++){
                            if (canvas._objects[i].dType!="alignmentLine" && canvas._objects[i].dType!="referenceLine" && canvas._objects[i].id!=e.target.id && canvas._objects[i].visible){
                                
                                var _left=parseInt(canvas._objects[i].left);
                                var _centerPointX=parseInt(_left + canvas._objects[i].width * canvas._objects[i].scaleX * 0.5 + canvas._objects[i].strokeWidth * canvas._objects[i].scaleX);
                                var _right=parseInt(_left + canvas._objects[i].width * canvas._objects[i].scaleX + canvas._objects[i].strokeWidth * canvas._objects[i].scaleX * 2);

                                _level.push(_left);
                                _level.push(_centerPointX);
                                _level.push(_right);

                                var _top=parseInt(canvas._objects[i].top);
                                var _centerPointY=parseInt(_top + canvas._objects[i].height * canvas._objects[i].scaleY * 0.5 + canvas._objects[i].strokeWidth * canvas._objects[i].scaleY);
                                var _bottom=parseInt(_top + canvas._objects[i].height * canvas._objects[i].scaleY + canvas._objects[i].strokeWidth * canvas._objects[i].scaleY * 2);

                                _vertical.push(_top);
                                _vertical.push(_centerPointY);
                                _vertical.push(_bottom);

                            }
                        }

                        //去重
                        self.alignmentLineObject.level=Array.from(new Set(_level));
                        self.alignmentLineObject.vertical=Array.from(new Set(_vertical));
                    }

                }

            }else{
                if (self.isEditDrawLine){
                    self.componentDraw().exitDrawLine(e);
                }
                /*if (self.cunterObj!=null){
                    if (self.cunterObj.hasOwnProperty("dType")){
                        if (self.cunterObj.dType=="shape" && self.cunterObj.type=="polygon"){
                            self.isEditDrawLine=false;
                            self.cunterObj.set({
                                controls:fabric.Object.prototype.controls,
                                cornerColor:'white',
                                cornerStyle:'rect',
                                borderColor:"#b3cdfd",
                                cornerSize:6
                            });
                            canvas.renderAll();

                        }
                    }
                }*/

            }

            self.canvasListener().mouseDown(e);

            if (self.panning==true){
                self.pannStart=true;
                canvas.selection = false;
                canvas.selectable=false;

                self.canvasDraw().drawPanningBox();
                canvas.skipTargetFind = true;
                canvas.discardActiveObject();
                canvas.renderAll();

                if (!isEmpty(self.selectedObject) && self.isPixSelect==false){
                    self.canvasDraw().drawSelectedControls();
                }

            }

            //只支持 Template/MM 鼠标右击菜单
            if (self.designModule!=""){
            
                self.canvasDraw().canvasOnMouseDown(e);
            }

        });

        //鼠标移动事件监控
        canvas.on('mouse:move', e => {

            self.mouseInfo.onUpPos={x:e.absolutePointer.x,y:e.absolutePointer.y};            
            if (self.mouseDrawShapeStatus && self.cunterObj!=null){
                var mx=e.absolutePointer.x;
                var my=e.absolutePointer.y;
                switch (self.cunterObj.type)
                {
                    case "textbox":

                    break;
                    case "rect":

                        var moveX=e.absolutePointer.x;
                        var moveY=e.absolutePointer.y;

                        if (moveX>self.mouseInfo.onDownPos.x){
                            var _width=moveX - self.mouseInfo.onDownPos.x;
                        }else{
                            self.cunterObj.left=moveX;
                            var _width=self.mouseInfo.onDownPos.x - moveX;
                        }

                        if (moveY>self.mouseInfo.onDownPos.y){
                            var _height=moveY - self.mouseInfo.onDownPos.y;
                        }else{
                            self.cunterObj.top=moveY;
                            var _height=self.mouseInfo.onDownPos.y - moveY;
                        }

                        self.cunterObj.set({width:_width,height:_height});
                        canvas.renderAll();

                    break;
                    case "ellipse":

                          var downPoint=self.mouseInfo.onDownPos;
                          var currentPoint = e.absolutePointer;

                          let rx = Math.abs(downPoint.x - currentPoint.x) / 2;
                          let ry = Math.abs(downPoint.y - currentPoint.y) / 2;

                          let top = currentPoint.y > downPoint.y ? downPoint.y : downPoint.y - ry * 2;
                          let left = currentPoint.x > downPoint.x ? downPoint.x :  downPoint.x - rx * 2;

                          // 设置椭圆尺寸和所在位置
                          self.cunterObj.set('rx', rx);
                          self.cunterObj.set('ry', ry);
                          self.cunterObj.set('radiusX',rx);
                          self.cunterObj.set('radiusY',ry);
                          self.cunterObj.set('top', top);
                          self.cunterObj.set('left', left);
                          // 刷新一下画布
                          canvas.renderAll();
                          self.componentDraw().setObjectrotateXY();

                    break;
                    case "path":
                        
                        if (self.mouseDrawShapeType=="Arrow"){
                    
                            var _zoom=canvas.getZoom();
                                _zoom=1;

                            var controlCoord=[];
                                controlCoord[0]={};
                                controlCoord[0].x=self.cunterObj.oCoords.p0.x;
                                controlCoord[0].y=self.cunterObj.oCoords.p0.y;
                                controlCoord[1]={};
                                controlCoord[1].x=self.cunterObj.oCoords.p1.x;
                                controlCoord[1].y=self.cunterObj.oCoords.p1.y;

                            canvas.remove(self.cunterObj);
                            canvas.renderAll();
                            var points=[];
                            points.push({x:self.mouseInfo.onDownPos.x,y:self.mouseInfo.onDownPos.y});
                            points.push({x:e.absolutePointer.x,y:e.absolutePointer.y});

                            // points.push({x:self.mouseInfo.onDownPos.x,y:self.mouseInfo.onDownPos.y});
                            // points.push({x:e.absolutePointer.x,y:e.absolutePointer.y});

                            var pathStr=self.componentDraw().drawArrow(controlCoord[0].x,controlCoord[0].y, controlCoord[1].x,controlCoord[1].y,30, 10);

                            // var pathStr=self.componentDraw().drawArrow(self.mouseInfo.onDownPos.x * _zoom,self.mouseInfo.onDownPos.y * _zoom,e.absolutePointer.x, e.absolutePointer.y,30, 10);

                            var Arrow = new fabric.Path(pathStr, {
                              stroke: "#000000",
                              strokeCmyk:'75,68,67,90',
                              fill: "",
                              dType:"shape",
                              type:"path",
                              id:self.cunterObj.id,
                              strokeWidth: 0.5,
                              zIndex:self.getCanvasObjCount(),
                              controlType:"arrow",//自定义属性，用于控制器管理样式
                            });

                            canvas.add(Arrow).renderAll();
                            self.cunterObj=Arrow;
                            self.cunterObj.set({points:points});
                            self.componentDraw().setObjectrotateXY();
                            self.componentDraw().drawArrowControl();

                            if (self.undoGroupSource!=null){
                                self.cunterObj.parentID=self.undoGroupSource.id;
                            }
                            self.cunterObj.sortPath=canvas._objects.length -1 ; 

                        }else if (self.mouseDrawShapeType=="Circle"){

                            var moveX=e.absolutePointer.x;
                            var moveY=e.absolutePointer.y;

                            if (moveX>self.mouseInfo.onDownPos.x){
                                var _width=moveX - self.mouseInfo.onDownPos.x;
                            }else{
                                self.cunterObj.left=moveX;
                                var _width=self.mouseInfo.onDownPos.x - moveX;
                            }

                            if (moveY>self.mouseInfo.onDownPos.y){
                                var _height=moveY - self.mouseInfo.onDownPos.y;
                            }else{
                                self.cunterObj.top=moveY;
                                var _height=self.mouseInfo.onDownPos.y - moveY;
                            }

                            var _scaleX=self.cunterObj.width/_width;
                            var _scaleY=self.cunterObj.height/_height;
                            self.cunterObj.set({scaleX:_scaleX,scaleY:_scaleY,strokeWidth:1});

                            canvas.renderAll();
                            self.componentDraw().setObjectrotateXY();

                        }else if (self.mouseDrawShapeType=="Triangle"){
                            canvas.remove(self.cunterObj);
     
                            var _width=Math.abs(self.mouseInfo.onDownPos.x - e.absolutePointer.x);
                            var pathStr = "M " + self.mouseInfo.onDownPos.x + " " + self.mouseInfo.onDownPos.y + " L " + (self.mouseInfo.onDownPos.x - _width/2) + " " + (e.absolutePointer.y) + " L " + (e.absolutePointer.x - _width/2) + " " + (e.absolutePointer.y) + " z";
                            var triangle = new fabric.Path(pathStr, {
                              left: self.mouseInfo.onDownPos.x,
                              top: self.mouseInfo.onDownPos.y,
                              stroke: "#000000",
                              strokeCmyk:'75,68,67,90',
                              strokeWidth: 0.5,
                              fill: "rgba(255, 255, 255, 0)",
                              dType:"shape",
                              type:"path",
                              id:self.cunterObj.id,//self.createID(),
                              zIndex:self.getCanvasObjCount()
                            });
                            canvas.add(triangle).setActiveObject(triangle).renderAll();
                            self.cunterObj=triangle;
                            self.componentDraw().setObjectrotateXY();
                            canvas.renderAll();

                            if (self.undoGroupSource!=null){
                                self.cunterObj.parentID=self.undoGroupSource.id;
                            }
                            self.cunterObj.sortPath=canvas._objects.length - 2 ;

                        }
                    break;
                    case "polygon":
                        var lastIndex=self.cunterObj.points.length-1;
                        self.cunterObj.points[lastIndex].x=mx;
                        self.cunterObj.points[lastIndex].y=my;

                        canvas.renderAll();
                    break;
                    case "Triangle":

                        var triangle = new fabric.Triangle({
                            top: e.absolutePointer.x,
                            left: e.absolutePointer.y,
                            width: 5,
                            height: 5,
                            fill: '',
                            stroke: "#000000",
                            strokeCmyk:'75,68,67,90',
                            dType:"shape",
                            type:"polygon",
                            id:self.cunterObj.id,//self.createID(),
                            zIndex:self.getCanvasObjCount()
                        });
                        canvas.add(triangle).setActiveObject(triangle).renderAll();
                        self.cunterObj=triangle;
                        self.componentDraw().setObjectrotateXY();

                        if (self.undoGroupSource!=null){
                            self.cunterObj.parentID=self.undoGroupSource.id;
                        }
                        self.cunterObj.sortPath=canvas._objects.length - 2 ;

                    break;

                    break;

                }
                // self.cunterObj
                return;
            }

            
            //拖动画布功能    //暂时关闭 
            if (self.panning && self.pannStart && e && e.e) {

                canvas.discardActiveObject();
                var delta = new fabric.Point(e.e.movementX, e.e.movementY);
                canvas.relativePan(delta);
                canvas.renderAll();
                if (!isEmpty(self.selectedObject) && self.isPixSelect==false){
                    self.canvasDraw().drawSelectedControls();
                }

                
            }

            self.canvasListener().mouseMove(e);

        });

        //鼠标左键弹起事件监控
        canvas.on('mouse:up', e => {
        
            //锁定画布不能做任何操作
            if (lockStatus){
                self.attributesShow().paper();
                canvas.discardActiveObject();
                return;
            }
        
            self.mouseInfo.status=1;
            self.mouseInfo.onUpPos={x:e.absolutePointer.x,y:e.absolutePointer.y};
       

            //删除智能对齐辅助线
            self.canvasDraw().clearAlignLine();

            if (self.mouseMode==0){

                //鼠标绘制图形事件
                if (self.mouseDrawShapeStatus && self.cunterObj!=null){
                    canvas.skipTargetFind = false;
                    switch (self.cunterObj.type)
                    {
                        case "textbox":
                            $("#selectComponent").click();
                        break;
                        case "polygon":
                            //console.log("鼠标绘制图形事件 polygon");
                            var points=self.cunterObj.points;

                            self.cunterObj.width=Math.abs(points[0].x - points[1].x);
                            self.cunterObj.height=Math.abs(points[0].y - points[1].y);

                            if (points[0].x<points[1].x){
                                self.cunterObj.points[0].x=self.cunterObj.points[0].x - self.cunterObj.width/2;
                                self.cunterObj.points[1].x=self.cunterObj.points[1].x - self.cunterObj.width/2;
                            }else{
                                self.cunterObj.points[0].x=self.cunterObj.points[0].x + self.cunterObj.width/2;
                                self.cunterObj.points[1].x=self.cunterObj.points[1].x + self.cunterObj.width/2;
                                self.cunterObj.left=self.cunterObj.left - self.cunterObj.width;
                            }

                            if (points[0].y<points[1].y){    
                                self.cunterObj.points[0].y=self.cunterObj.points[0].y - self.cunterObj.height/2;
                                self.cunterObj.points[1].y=self.cunterObj.points[1].y - self.cunterObj.height/2;
                            }else{
                                self.cunterObj.points[0].y=self.cunterObj.points[0].y + self.cunterObj.height/2;
                                self.cunterObj.points[1].y=self.cunterObj.points[1].y + self.cunterObj.height/2;
                                self.cunterObj.top=self.cunterObj.top - self.cunterObj.height;
                            }

                            self.cunterObj.setCoords();
                            self.componentDraw().drawLine();
                       
                            canvas.renderAll();

                        break;
                    }

                    canvas.defaultCursor = 'default';
                    canvas.hoverCursor = 'default';

                    self.mouseDrawShapeType=null;
                    self.mouseDrawShapeStatus=false;
                    canvas.selection=true;
                    canvas.skipTargetFind = false;
                    self.canvasDraw().deleteObject({id:"panningBox"});
                    canvas.renderAll();
                    return;
                }


                //鼠标移动画布
                if (self.panning==true){
                    self.canvasDraw().deleteObject({id:"panningBox"});
                }
                

                self.pannStart=false;
                self.panning=false;
                canvas.selection = true;
                canvas.defaultCursor = 'default';
                canvas.hoverCursor='default';

            }else if (self.mouseMode==1){


                self.canvasDraw().deleteObject({
                    id: "panningBox"
                });

                if (self.panning==true){
                    self.panning=true;
                    self.pannStart=false;
                    canvas.selection = false;
                    canvas.selectable=false;
                    canvas.skipTargetFind = true;
                }else{
                    canvas.selection = true;
                    canvas.skipTargetFind = false;
                }

                // self.isPixSelect=true;
                // canvas.discardActiveObject();
            
            }

            self.alignmentLineObject=null;
            if (e.target){
                if (e.target.hasOwnProperty("dType")){
                    if (e.target.dType=="referenceLine"){
                        return;
                    }
                }
            }
            self.canvasListener().mouseUp(e); 
        });
        
        canvas.on('mouse:dblclick', e => {
            
            //锁定画布不能做任何操作
            if (lockStatus){
                self.attributesShow().paper();
                canvas.discardActiveObject();
                return;
            }
            
            if (e.target){

                if (self.disableComponent.indexOf(e.target.id)>-1){
                    if (self.undoGroupSource!=null){
                        self.canvasDraw().composeGroup();
                        return;
                    }
                }

                if (e.target.hasOwnProperty("selectable")){
                    if (self.layer.canvasOperation.hasOwnProperty("setLayerSortPath")){
                        self.canvasListener().dblclick(e);
                        self.mouseoverObject=null;
                    }
                }
            }else{
                
                if (self.undoGroupSource!=null){
                    self.canvasDraw().composeGroup();
                }
                
            }
        });

        canvas.on('mouse:over', e => {
            if (e.target){
                if (self.designModule!="component"){
                    canvasFouseStatus=true;
                }
            }
        });

        
        //鼠标框选组件事件监控
        canvas.on('selection:created', function(e) { 
           
            //锁定画布不能做任何操作
            if (lockStatus){
                self.attributesShow().paper();
                canvas.discardActiveObject();
                return;
            }
           
           
            if (e.selected){
             
                if (e.selected.length>1){
                    
                    if (self.undoGroupSource==null){
                        //非编辑分组
                      
                        for(var i=0;i<e.selected.length;i++){

                            if (e.selected[i].dType=="BackgroundImage" || e.selected[i].dType=="referenceLine" || e.selected[i].dType=="paperSlice" || e.selected[i].lockScalingX==true){
                                //背景图只能点击选中，不能框选
                                var activeGroup = canvas.getActiveObject(); 
                                activeGroup.removeWithUpdate(e.selected[i]); 
                                e.selected.splice(i,1);
                                i--;
                                canvas.renderAll(); 
                            }

                        }
                    }else{
                        //编辑分组
                        for(var i=0;i<e.selected.length;i++){

                            if (e.selected[i].zIndex<self.editGroupZindex || e.selected[i].dType=="BackgroundImage" || e.selected[i].dType=="referenceLine" || e.selected[i].dType=="paperSlice" || e.selected[i].lockScalingX==true){
                                //背景图只能点击选中，不能框选
                                var activeGroup = canvas.getActiveObject(); 
                                activeGroup.removeWithUpdate(e.selected[i]); 
                                e.selected.splice(i,1);
                                i--;
                                canvas.renderAll(); 
                            }

                        }
                    }

                }else{
                            
                    if (e.selected[0].hasOwnProperty("dType")){
                        if (e.selected[0].dType=="referenceLine"){
                            return;
                        }
                    }
                    
                }
            }else{
              
            }
           
            self.canvasListener().mouseSelection(e);
        });
 
        //组件新增后事件监控
        canvas.on('object:added', e => {
            self.pageEvent.refreshLevel();
        }); 
        
        //组件编辑后事件监控(包括:缩放、旋转、移动、编辑) 
        canvas.on('object:modified', e => {

            if (e.target.dType=="referenceLine"){
                return;
            }

            if (e.target.type){
                self.componentDraw().setObjectrotateXY();
                if (e.target.type=="group" || e.target.type=="activeSelection" ){
                    self.componentDraw().groupObjectsAddWithUpdate(e.target);
                }

                /*
                var _rotate=e.target.getCenterPoint();
                _rotate.x=_rotate.x - self.canvasPaddX;
                _rotate.y=_rotate.y - self.canvasPaddY;
                if (self.cunterObj!=null){
                    self.cunterObj.set({rotateXY:_rotate});
                }*/
                
            }

            self.drawing=true;
            //事务描述
            var msg="Edit element";
            if (e.action){
                if (e.action=="drag"){
                    msg="Drag " + e.target.type;
                }
            }else{
                msg="Edit " + e.target.type;
            }
            self.pageEvent.showAttributesTip(0,"","");
            self.isEditText=false;
            self.canvasSave().canvasHistoryRecordCall(msg);
        });    


        canvas.on('text:changed', function(e) {
            //console.log('text:changed');
            if (e.target){
                if (e.target.hasOwnProperty("id")){
                    self.layer.canvasOperation.updateTextBoxLayerTitle({layerID:e.target.id,layerTitle:e.target.text});
                }
            }
            
        });

        
        //组件移动中事件监控
        canvas.on('object:moving', e => {
            self.componentListener().moveingComponent(e);
        });
        
        //组件移动完成事件监控
        canvas.on('object:moved', e => {
            self.componentListener().movedComponent(e);
        });    
        
        //组件对象监控拉伸事件
        canvas.on("object:scaling", function (e) { 
            self.componentListener().scalingComponent(e);
        });
        canvas.on("object:scaled", function (e) { 
            if (e.target.type=="group"){
                
                //处理偏组中子分组位置刷新
                self.canvasDraw().groupObjectsAddWithUpdate(e.target);
    
                e.target.addWithUpdate();
                e.target.setCoords();
            }
            self.componentListener().scaledComponent(e);
        });
        
        //组件对象监控旋转事件
        canvas.on("object:rotating", function (e) { 
            
            if (e.target){
                if (e.target.type){

                    var angle=Math.round(e.target.angle);
                    if (angle<1 && angle>-0){
                        angle=0;
                        e.target.angle=0;
                    }
                    e.target.angle=angle;
                    var zoomNum=canvas.getZoom();
                    var pointer = canvas.getPointer(e);
                    var posX = pointer.x * zoomNum;
                    var posY = pointer.y * zoomNum;
                    var pointer={x:posX,y:posY};
                    self.pageEvent.showAttributesTip(1,pointer,"angle:" +angle);
                }
            }

        });



    }
    
    //画布绘制操作类
    self.canvasDraw=function(parm=null){
        var _parent=this;

        this.groupObjectsAddWithUpdate=function(theObj){
            
            if (theObj.hasOwnProperty("_objects")){
                

                if (theObj.hasOwnProperty("dType")){
                    if (theObj.dType=="productPriceGroup"){
                        
                        if (theObj._objects[0].hasOwnProperty("fontSize")){
                          
                            if (theObj._objects[0].scaleX!=theObj._objects[0].scaleY){
                                theObj._objects[0].scaleX=theObj._objects[0].scaleY;
                            }
                            theObj._objects[0].fontSize=theObj._objects[0].fontSize * theObj._objects[0].scaleX;
                            // theObj._objects[0].fontSize=Math.round(theObj._objects[0].fontSize*2+0.5)/2;
                            theObj._objects[0].fontSize=parseInt((theObj._objects[0].fontSize*2+0.5)/2);
                            theObj._objects[0].fontPt=theObj._objects[0].fontSize;
                            //if (isEmpty(theObj._objects[0].top) || theObj._objects[0].top!==theObj._objects[0].top){
                            theObj._objects[0].top=-0.5 * theObj._objects[0].height * theObj._objects[0].scaleX;
                            //}
                            theObj._objects[0].scaleX=1;
                            theObj._objects[0].scaleY=1;
                            theObj._objects[0].setCoords();
                         
                        }
                        if (theObj._objects[1].type=="line"){
                            var x1=theObj._objects[1].x1;
                            var y1=theObj._objects[1].y1;
                            var x2=theObj._objects[1].x2;
                            var y2=theObj._objects[1].y2;
                            var w=theObj._objects[1].width;
                            var h=theObj._objects[1].height;
                            var strokeWidth=theObj._objects[1].strokeWidth;
                            var scaleX=theObj._objects[1].scaleX;
                            var scaleY=theObj._objects[1].scaleY;
                            
                            theObj._objects[1].scaleX=1;
                            theObj._objects[1].scaleY=1;
                            theObj._objects[1].strokeWidth=strokeWidth * scaleX;
                            theObj._objects[1].x1=x1 * scaleX;
                            theObj._objects[1].y1=y1 * scaleY;
                            theObj._objects[1].x2=x2 * scaleX;
                            theObj._objects[1].y2=y2 * scaleY;
                            theObj._objects[1].width=w * scaleX;
                            theObj._objects[1].height=h * scaleY;
                        }
                    }
                }
                theObj.addWithUpdate();
                theObj.setCoords();
                
                for (var l=0;l<theObj._objects.length;l++){
                    
                    if (theObj._objects[l].hasOwnProperty("_objects")){
                        theObj._objects[l].addWithUpdate();
                        theObj._objects[l].setCoords();
                        _parent.groupObjectsAddWithUpdate(theObj._objects[l]);
                    }
                    
                }
                
            }
            
        }

        //设置画布尺寸
        this.canvasSize=function(parm=null){
            canvas.setWidth(parm.width);
            canvas.setHeight(parm.height);
            canvas.renderAll();
        }
        
        //自适应大小显示
        this.autoZoom=function(){
            
            var paperNum=(self.paperSize.bleedHeight>self.paperSize.bleedWidth)?self.paperSize.bleedHeight:self.paperSize.bleedWidth;
            //取屏幕宽/高最小一边做为自适应屏幕适应计算
            //在上面的代码中处理组件移右边过界出现重影问题
            if (self.paperSize.bleedHeight>=self.paperSize.bleedWidth){
                var deviceNum=self.device.height;

                //减去滚动条占位
                if (deviceNum-50>=0){
                    deviceNum=deviceNum-50;
                }

            }else{
                var deviceNum=self.device.width;
                //减去滚动条占位
            }
            
            if (paperNum>deviceNum){
                var zoomNum=Math.floor(deviceNum/paperNum*100)/100;
                console.log("paperNum>deviceNum");
            }else if (paperNum<deviceNum){
                var zoomNum=Math.floor(deviceNum/paperNum*76)/100;
                console.log("paperNum<deviceNum ="+zoomNum);
            }else{
                var zoomNum=1;
            }
            
            if (self.designModule=="component"){
                zoomNum=1;
            }



            var canvasNode = canvas.getElement();
            var upperCanvasEl=canvas.upperCanvasEl;
            var canvasID=upperCanvasEl.previousSibling.id;
            var drawWrapper=document.getElementById(canvasID).parentNode.parentNode.id;    

            var drawPanel=document.getElementById(canvasID).parentNode.parentNode.parentNode.id;
            var drawPanelWidth=parseInt(document.getElementById(drawPanel).style.width);
            var drawPanelHeight=parseInt(document.getElementById(drawPanel).style.height);

            var paperAreaWidth=parseInt(document.getElementById("paperArea").style.width);
            document.getElementById(canvasID).parentNode.style.marginLeft=((drawPanelWidth - paperAreaWidth)*0.5) + "px";

            var moveX=(drawPanelWidth - canvas.width) / 4;
            var moveY=(drawPanelHeight - canvas.height) / 4;

            canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), zoomNum);


            if (document.getElementById(self.pageEventObject.zoomValue.id)){
                document.getElementById(self.pageEventObject.zoomValue.id).innerText=parseInt(zoomNum * 100) + "%";
            }
            
            var canvasHeight=self.paperSize.bleedHeight + 2 * self.canvasPaddY; 

            if (self.device.height>canvasHeight){
                document.getElementById(drawWrapper).scrollTop=(self.device.height - canvasHeight)/2;
            }else{
                document.getElementById(drawWrapper).scrollTop=(canvasHeight - self.device.height)/2;
            }


            //画布自适应居中偏移量
            self.canvasConfig.zoomParm={vt4:canvas.viewportTransform[4],vt5:canvas.viewportTransform[5],zoomNum:zoomNum};

            fabric.charWidthsCache = {};
            canvas.renderAll();
            
        }


        //画布缩放
        this.canvasZoom=function(zoomNum=null){
            if (zoomNum==null || zoomNum==0){
                //当为空时，1
                zoomNum=0.05;
            }else if (zoomNum<0.05){
                zoomNum=0.05;
            }else if (zoomNum>=3 ){
                //zoomNum=3;
            }
            if (zoomNum * self.paperSize.bleedWidth<self.minZoomCanvasVal || zoomNum * self.paperSize.bleedWidth>=self.maxZoomCanvasVal){
                //画布缩放不能小于100px及大于10000px,不处理
                
                self.pageEvent.errMsg("Canvas zoom cannot be less than "+self.minZoomCanvasVal+"pt and greater than "+self.maxZoomCanvasVal+"pt");
                return;
            }
            
            //以画布纸张左上角作为坐标缩放
            var canvasNode = canvas.getElement();
            var upperCanvasEl=canvas.upperCanvasEl;
            var canvasID=upperCanvasEl.previousSibling.id;
            var drawWrapper=document.getElementById(canvasID).parentNode.parentNode.id;
            var drawPanel=document.getElementById(canvasID).parentNode.parentNode.parentNode.id;
            var drawPanelWidth=parseInt(document.getElementById(drawPanel).style.width);
            if (zoomNum * self.paperSize.bleedWidth<drawPanelWidth){
                
                canvas.setZoom(zoomNum);
                canvas.setWidth(self.canvasConfig.width * zoomNum);
                canvas.setHeight(self.canvasConfig.height * zoomNum);
                
                var moveX=(self.device.width - (self.canvasConfig.width * zoomNum))/2;
                var canvasNode = canvas.getElement();
                var upperCanvasEl=canvas.upperCanvasEl;
                document.getElementById("draw-wrapper").scrollLeft=0-moveX;
                fabric.charWidthsCache = {};
                canvas.renderAll();

            }else if (zoomNum * self.paperSize.bleedWidth>drawPanelWidth){
                
                var preZoom=canvas.getZoom();
                var modeZoom=(preZoom-zoomNum>0)?-1:1;
                canvas.setZoom(zoomNum);
                canvas.setWidth(self.canvasConfig.width * zoomNum);
                canvas.setHeight(self.canvasConfig.height * zoomNum);

                var moveX=(self.device.width - (self.canvasConfig.width * zoomNum))/2;
                var canvasNode = canvas.getElement();
                var upperCanvasEl=canvas.upperCanvasEl;
                fabric.charWidthsCache = {};
                canvas.renderAll();
                
                if (moveX<=0){
                    
                    document.getElementById("draw-wrapper").scrollLeft=0 - moveX;
                }else{
                   
                    document.getElementById("draw-wrapper").scrollLeft=moveX ;
                }

            }else if (zoomNum * self.paperSize.bleedWidth==drawPanelWidth){
                
                canvas.setZoom(zoomNum);
                canvas.setWidth(self.canvasConfig.width * zoomNum);
                canvas.setHeight(self.canvasConfig.height * zoomNum);

                var moveX=(self.device.width - (self.canvasConfig.width * zoomNum))/2;
                var canvasNode = canvas.getElement();
                var upperCanvasEl=canvas.upperCanvasEl;
                fabric.charWidthsCache = {};
                canvas.renderAll();
                
                if (moveX<=0){
             
                    document.getElementById("draw-wrapper").scrollLeft=0 - moveX;
                }else{
                
                    document.getElementById("draw-wrapper").scrollLeft=moveX ;
                }


            }
            document.getElementById(self.pageEventObject.zoomValue.id).innerText=parseInt(zoomNum * 100) + "%";

            var canvasHeight=self.paperSize.bleedHeight + 2 * self.canvasPaddY;
            if (self.device.height>canvasHeight * zoomNum){
                document.getElementById(drawWrapper).scrollTop=(self.device.height - canvasHeight * zoomNum)/2;
            }else{
                document.getElementById(drawWrapper).scrollTop=(canvasHeight * zoomNum - self.device.height)/2;
            }

        }


        //绘制背景图层
        this.drawBackgroundImage=function(parm=null,callback=null){
 
          var img = new Image();//创建新的图片对象
          img.src = self.blankPic;
          
          img.setAttribute("crossOrigin",'Anonymous')
          img.onload = function(e){//图片加载完，再draw 和 toDataURL
                    
                if (e.path){
                  var imgWidth=e.path[0].width;
                  var imgHeight=e.path[0].height;
                }else{
                  var imgWidth=this.width;
                  var imgHeight=this.height;
                }
                
                context.drawImage(img,0,0);    
                var fabricImage = new fabric.Image(img, {
                    left:self.paperSize.paperLeft + self.canvasPaddX,
                    top:self.paperSize.paperTop + self.canvasPaddY,
                    scaleX:1,
                    scaleY:1,
                    zIndex:4,
                    visible:false,
                    lockMovementX:true,
                    lockMovementY:true,
                    lockScalingX:true,
                    lockScalingY:true,
                    dtypeIndex:1,
                    width:imgWidth,
                    height:imgHeight,
                    angle:0,
                    id:"BackgroundImage",
                    dType:"BackgroundImage"
                    
                });
                //canvas.add(fabricImage).setActiveObject(fabricImage); 加载并选中背景图
                // canvas.add(fabricImage).setActiveObject(fabricImage);
           
                canvas.add(fabricImage);
                fabricImage.moveTo(3);
                canvas.renderAll();
                (callback && typeof(callback) === "function") && callback(true);
           };
               
        }
        
        //绘制出页面血线
        this.insertBleed=function(parm=null){

            var paperShadow = new fabric.Shadow({ 
                color:'#a0a0b4', 
                blur:25 
            });
            var data={};
            //原先的，不支持单边出血线、页边距
            data.left=self.paperSize.bleedLeft + self.canvasPaddX,
            data.top=self.paperSize.bleedTop + self.canvasPaddY,
            data.width=self.paperSize.bleedWidth;
            data.height=self.paperSize.bleedHeight;
            data.type="rect";
            data.fill="#ffffff";//#cb020e",
            data.opacity=1;
            data.stroke='#cb020e';
            data.strokeWidth=(self.paperSize.stroke)?1:0;
            data.zIndex=1;
            data.id="paperBleed",
            data.name="Bleed",
            data.scaleX=1;
            data.scaleY=1;
            //data.rx=10,圆角
            //data.ry=10,圆角
            data.shadow=paperShadow;
            data.dType="paperBleed";
            data.selectable=false;
            var rect = new fabric.Rect(data);
            
            canvas.add(rect);
            rect.moveTo(0);
            canvas.renderAll();
        }
        
        //绘制纸张
        this.insertPaper=function(parm=null){

            var data={};
            //原先的，不支持单边出血线、页边距
            data.left=self.paperSize.paperLeft + self.canvasPaddX;
            data.top=self.paperSize.paperTop + self.canvasPaddY;
            data.width=self.paperSize.paperWidth;
            data.height=self.paperSize.paperHeight;
            data.type="rect";
            //data.fill="";//self.paperSize.paperBackgroundColor,

            if (parm!=null){
                data.fill="";
            }else{
                data.fill="#ffffff";
            }
            data.opacity=1;
            data.stroke='#000000';
            data.strokeWidth=(self.paperSize.stroke)?1:0;
            data.zIndex=2;
            data.scaleX=1;
            data.scaleY=1;
            data.dType="paperBox";
            data.id="paperBox",
            data.name="Paper",
            data.selectable=false;
            var rect = new fabric.Rect(data);
            canvas.add(rect);
            rect.moveTo(1);
            canvas.renderAll();
        }

        //绘制页边距
        this.insertMargins=function(parm=null){

            var data={};
            data.left=self.paperSize.marginLeft + self.canvasPaddX;
            data.top=self.paperSize.marginTop + self.canvasPaddY;
            data.width=self.paperSize.marginWidth;
            data.height=self.paperSize.marginHeight;
            data.type="rect";

            if (parm!=null){
                data.fill="";
                $(".pictureSizeBox").show();
                $(".preViewPageBackground img").attr("src",parm.src);
            }else{
                data.fill="#ffffff";
            }

            data.opacity=1;
            data.stroke='#1D983A';
            data.strokeWidth=(self.paperSize.stroke)?1:0;
            data.zIndex=3;
            data.scaleX=1;
            data.scaleY=1;
            data.id="paperMargins",
            data.name="Margins",
            data.dType="paperMargins";
            data.selectable=false;
            var rect = new fabric.Rect(data);
            canvas.add(rect);
            rect.moveTo(2);
            canvas.renderAll();


            //MOREPAGE-CANVAS
            if (self.canvasConfig.isMorePagesDraw==true && self.designModule!="component"){
                _parent.drawPageSlice();
            }

        }
        
    
        //绘制页面切片
        this.drawPageSlice=function(callback=null){

            var parm={};
                parm.strokeWidth=1;
            var pageOption=self.canvasConfig.pageOption;
            switch (pageOption)
            {
                case "2LR":

                    parm.x1=self.paperSize.paperLeft + self.canvasPaddX + self.paperSize.paperWidth/2;
                    parm.y1=self.paperSize.paperTop + self.canvasPaddY;
                    parm.x2=parm.x1;
                    parm.y2=parm.y1 + self.paperSize.paperHeight;
                    parm.moveTo=4;
                    parm.zIndex=5;
                    _parent.drawSliceRect(parm);
                    self.minLayer=self.minLayer + 1;
                break;
                case "2TB":

                    parm.x1=self.paperSize.paperLeft + self.canvasPaddX;
                    parm.y1=self.paperSize.paperTop + self.canvasPaddY + self.paperSize.paperHeight/2;
                    parm.x2=parm.x1 + self.paperSize.paperWidth;
                    parm.y2=parm.y1;
                    parm.moveTo=4;
                    parm.zIndex=5;
                    _parent.drawSliceRect(parm);
                    self.minLayer=self.minLayer + 1;
                break;
                case "4LRTB":
                    parm.x1=self.paperSize.paperLeft + self.canvasPaddX + self.paperSize.paperWidth/2;
                    parm.y1=self.paperSize.paperTop + self.canvasPaddY;
                    parm.x2=parm.x1;
                    parm.y2=parm.y1 + self.paperSize.paperHeight;
                    parm.moveTo=4;
                    parm.zIndex=5;
                    _parent.drawSliceRect(parm);    

                    parm.x1=self.paperSize.paperLeft + self.canvasPaddX;
                    parm.y1=self.paperSize.paperTop + self.canvasPaddY + self.paperSize.paperHeight/2;
                    parm.x2=parm.x1 + self.paperSize.paperWidth;
                    parm.y2=parm.y1;
                    parm.moveTo=5;
                    parm.zIndex=6;
                    _parent.drawSliceRect(parm);               
                    self.minLayer=self.minLayer + 2;
                break;
            }
        }

        //切片矩形
        this.drawSliceRect=function(parm){

            var line=new fabric.Line([parm.x1,parm.y1,parm.x2,parm.y2],{
                id:"paperSlice",
                name:"paperSlice",
                dType:"paperSlice",
                stroke:"#1793cc",
                selectable:false,
                zIndex:parm.zIndex
            })

            canvas.add(line);
            line.moveTo(parm.moveTo);
            canvas.renderAll();
        }

        //画布刷新
        this.canvasRefresh=function(){
        
            var _objects=canvas.getObjects();
            
            //是否有背景图设置并显示
            var backgroundImage=_parent.searchObject({id:'BackgroundImage'},_objects);

            for (var i=0 ;i< _objects.length;i++){
                
                var _this=_objects[i];
                
                if (_this.dType !="paperMargins" && _this.dType!="paperBox" && _this.dType!="paperBleed" && _this.dType!="paperSlice" && _this.dType!="BackgroundImage" && _this.dType!="alignmentLine"){

                    _this.set({zIndex:(_this.zIndex*1)});
                    _this.setCoords();
                    canvas.moveTo(_this,(_this.zIndex*1));
                    canvas.renderAll();
                    
                }else{
                    if (_this.dType=="BackgroundImage"){
                        if (backgroundImage!=false){
                            if (backgroundImage.visible==false){
                                
                                var _paperMargins=_parent.searchObject({id:'paperMargins'},_objects);


                                //纸张画背景色
                                _paperMargins.set({fill:"#ffffff"});
                                canvas.renderAll();
                                
                            }else{
                                var _paperMargins=_parent.searchObject({id:'paperMargins'},_objects);
                                //纸张清除背景色
                                _paperMargins.set({fill:""});
                                canvas.renderAll();
                                
                            }
                        }
                    }
                    
                }
            }

        }
        
        //画布Json加载
        this.canvasLoad=function(parm=null,callback=null){
            if (parm==null){
                return false;
            }else{
         
                canvas.loadFromJSON(parm,function(){ 
                    canvas.renderAll.bind(canvas);
                                        
                    //区分mm、template与component设计页不同处理
                    if (self.designModule=="component"){
                        
                        self.canvasDraw().insertBleed();
                        self.canvasDraw().insertPaper();
                        self.canvasDraw().insertMargins();      
                                    
                        if (self.canvasConfig.recordPointer.pointerIndex==-1){

                            canvas._objects.sort((a, b) => (a.zIndex > b.zIndex) ? 1 : -1);
                            var canvasObjects=canvas.getObjects();
                            canvas.renderAll();

                            //初始化 init加载打开模板页后生成原史记录
                            self.canvasSave().canvasHistoryRecordSave(userID,'loadPage','Load file');
                            (callback && typeof(callback) === "function") && callback();

                            /* 20220818                              
                            self.componentDraw().resetView(function(){
                                //初始化 init加载打开模板页后生成原史记录
                                self.canvasSave().canvasHistoryRecordSave(userID,'loadPage','Load file');
                                (callback && typeof(callback) === "function") && callback();
                            });*/
                        }
                        
                    }else if (self.designModule=="template" || self.designModule=="mm"){

                        //绘制出血线、页边距、背景图处理 
                        var canvasObjects=canvas.getObjects();

                        if (_parent.isDrawBackgroundImage(canvasObjects)==false){
                            
                            //没有背景图
                            self.canvasDraw().drawBackgroundImage(null,function(){
                                self.canvasDraw().insertBleed();
                                self.canvasDraw().insertPaper();
                                self.canvasDraw().insertMargins();      
                                canvas.renderAll();
                                
                                //如果是mm模式 同步商品组件更新mm商品dsort对应信息
                                if (self.designModule=="mm"){
                                    var objs = canvas.getObjects();
                                    _parent.updatePageProduct(objs);
                                }
                                
                                //self.canvasDraw().canvasRefresh();
                                self.componentDraw().resetView();
                                if (self.canvasConfig.recordPointer.pointerIndex==-1){
                                    //初始化 init加载打开模板页后生成原史记录
                                    self.canvasSave().canvasHistoryRecordSave(userID,'loadPage','Load file');
                                }
                                
                                (callback && typeof(callback) === "function") && callback();

                            });
                            
                            
                        }else{
                            
                            //有背景图
                            canvasObjects[0].set({lockMovementX:true,lockMovementY:true,lockScalingX:true,lockScalingY:true});
                            self.canvasDraw().insertBleed();
                            self.canvasDraw().insertPaper({src:canvasObjects[0].src});
                            self.canvasDraw().insertMargins({src:canvasObjects[0].src});      
                            
                            if (self.designModule=="mm"){
                                
                                //如果是mm模式 同步商品组件更新mm商品dsort对应信息
                                var objs = canvas.getObjects();
                                _parent.updatePageProduct(objs);
                            }
                            
                            self.canvasDraw().canvasRefresh();
                            if (self.canvasConfig.recordPointer.pointerIndex==-1){
                                
                                //初始化 init加载打开模板页后生成原史记录
                                self.canvasSave().canvasHistoryRecordSave(userID,'loadPage','Load file');
                                
                            }
                            
                        }
                        
                    }
                    
                    
                 });
               
                //(callback && typeof(callback) === "function") && callback();
            }
        }
        
        //画布扩展事件
        this.canvasExtend=function(){
            
            fabric.util.object.extend(fabric.Polyline.prototype, {
            _calcDimensions_dd:function(){
              
                  if (!isEmpty(this.points)){
                      var pointsArr=[];
                      if (!Array.isArray(this.points)){
                          for(var k in this.points) {
                              pointsArr.push(this.points[k]);
                          }
                          this.points=pointsArr;
                      }
                  }
                  
                  var points = this.points,
                      minX = fabric.Point.prototype.min(points, 'x') || 0,
                      minY = fabric.Point.prototype.min(points, 'y') || 0,
                      maxX = fabric.Point.prototype.max(points, 'x') || 0,
                      maxY = fabric.Point.prototype.max(points, 'y') || 0,
                      width = (maxX - minX),
                      height = (maxY - minY);
            
                  return {
                    left: minX,
                    top: minY,
                    width: width,
                    height: height
                  };
                }
            });

            fabric.util.object.extend(fabric.Path.prototype, {
                /**导入页面时，如果要导入的canvasCode中的path图形中的path字段内容数据格式从[objectObject]，
                   转成[object Array]格式，在这里重写该渲染方法做类型转换*/
                initialize: function(path, options) {
                  options = options || { };
                  this.callSuper('initialize', options);
                  if (!path) {
                    path = [];
                  }
                  
                  if (Object.prototype.toString.call(path)=="[object Object]"){
                      var _path=[];
                      for (var i in path){          
                        _path[i]=[];  
                        for (var j in path[i]){
                            _path[i].push(path[i][j]);
                        }
            
                      }
                      path=_path;
                  }
                  
                  var fromArray = Object.prototype.toString.call(path) === '[object Array]';
            
                  this.path = fromArray
                    ? fabric.util.makePathSimpler(path)
            
                    : fabric.util.makePathSimpler(
                      fabric.util.parsePath(path)
                    );
                    
                  if (!this.path) {
                    return;
                  }
                  fabric.Polyline.prototype._setPositionDimensions.call(this, options);
                },

            });
            
            fabric.util.object.extend(fabric.Gradient.prototype, {
                /**导入页面时，如果要导入的canvasCode中的图形中渐变色的字段内容数据格式从[object Object]，
                   转成[object Array]格式，在这里重写该渲染方法做类型转换*/
                initialize: function(options) {
                  options || (options = { });
                  
                  if (Object.prototype.toString.call(options.colorStops)==="[object Object]"){
                      var _colorStops=[];
                      for (var i in options.colorStops){          
                        _colorStops[i]=(options.colorStops[i]);  
                      }
                      options.colorStops=_colorStops;
                  }
                  
                  if (Object.prototype.toString.call(options.gradientTransform)==="[object Object]"){
                      var _gradientTransform=[];
                      for (var i in options.gradientTransform){          
                        _gradientTransform[i]=options.gradientTransform[i];  
                      }
                      options.gradientTransform=_gradientTransform;
                  }
                  
                  options.coords || (options.coords = { });
                  var coords, _this = this;
                     
                  // sets everything, then coords and colorstops get sets again
                  Object.keys(options).forEach(function(option) {
                    _this[option] = options[option];
                  });
            
                  if (this.id) {
                    this.id += '_' + fabric.Object.__uid++;
                  }
                  else {
                    this.id = fabric.Object.__uid++;
                  }
                    
                  coords = {
                    x1: options.coords.x1 || 0,
                    y1: options.coords.y1 || 0,
                    x2: options.coords.x2 || 0,
                    y2: options.coords.y2 || 0
                  };
            
                  if (this.type === 'radial') {
                    coords.r1 = options.coords.r1 || 0;
                    coords.r2 = options.coords.r2 || 0;
                  }
            
                  this.coords = coords;
                  this.colorStops = options.colorStops.slice();
                }, 
            });
            
            fabric.util.object.extend(fabric.Object.prototype, {
                getAbsoluteCenterPoint: function() {
                  var point = this.getCenterPoint();
                  if (!this.group)
                    return point;
                  var groupPoint = this.group.getAbsoluteCenterPoint();
                  return {
                    x: point.x + groupPoint.x,
                    y: point.y + groupPoint.y
                  };
                },
                containsInGroupPoint: function(point) {
                  if (!this.group)
                    return this.containsPoint(point);
                  
                  var center = this.getAbsoluteCenterPoint();
                  var thisPos = {
                      xStart: center.x - this.width/2 * this.scaleX,
                      xEnd: center.x + this.width/2 * this.scaleX,
                      yStart: center.y - this.height/2 * this.scaleY,
                      yEnd: center.y + this.height/2 * this.scaleY
                  };
                  
                  if (point.x >= thisPos.xStart && point.x <= (thisPos.xEnd)) {
                      if (point.y >= thisPos.yStart && point.y <= thisPos.yEnd) {
                          return true;
                      }
                  }
                  return false;
                },
                /**导入页面时，如果要导入的canvasCode中的图形有边框虚线设置时，
                   因保存在数据库的代码strokeDashArray变成了对象，
                   但画布是数组类型，在这里重写该渲染方法做类型转换*/
                _renderStroke: function(ctx) {
                  if (!this.stroke || this.strokeWidth === 0) {
                    return;
                  }

                  if (this.shadow && !this.shadow.affectStroke) {
                    this._removeShadow(ctx);
                  }

                  ctx.save();
                  if (this.strokeUniform && this.group) {
                    var scaling = this.getObjectScaling();
                    ctx.scale(1 / scaling.scaleX, 1 / scaling.scaleY);
                  }
                  else if (this.strokeUniform) {
                    ctx.scale(1 / this.scaleX, 1 / this.scaleY);
                  }
                     
                  //类型转换            
                  if (this.hasOwnProperty("strokeDashArray")){
                    //边框线  
                    if (!Array.isArray(this.strokeDashArray) && this.strokeDashArray!=null){
                        var dashArray=[];
                            dashArray[0]=this.strokeDashArray[0];
                            dashArray[1]=this.strokeDashArray[1];
                        this.strokeDashArray=dashArray;
                    }
                  }
                  
                  this._setLineDash(ctx, this.strokeDashArray, this._renderDashedStroke);
                  this._setStrokeStyles(ctx, this);
                  ctx.stroke();
                  ctx.restore();
                },
                /**导入页面时，如果要导入的canvasCode中的图形有points设置时，
                   因保存在数据库的代码points变成了对象，
                   但画布是数组类型，在这里重写该渲染方法做类型转换*/

                _calcDimensions: function() {
                    
                  if (!isEmpty(this.points)){
                      var pointsArr=[];
                      if (!Array.isArray(this.points)){
                          for(var k in this.points) {
                              pointsArr.push(this.points[k]);
                          }
                          this.points=pointsArr;
                      }
                  }
                    
                  var points = this.points,
                      minX = min(points, 'x') || 0,
                      minY = min(points, 'y') || 0,
                      maxX = max(points, 'x') || 0,
                      maxY = max(points, 'y') || 0,
                      width = (maxX - minX),
                      height = (maxY - minY);
            
                  return {
                    left: minX,
                    top: minY,
                    width: width,
                    height: height
                  };
                },
                
                

            });

        }

        this.canvasExtend_bak_20230324=function(){

            fabric.util.object.extend(fabric.Object.prototype, {
                getAbsoluteCenterPoint: function() {
                  var point = this.getCenterPoint();
                  if (!this.group)
                    return point;
                  var groupPoint = this.group.getAbsoluteCenterPoint();
                  return {
                    x: point.x + groupPoint.x,
                    y: point.y + groupPoint.y
                  };
                },
                containsInGroupPoint: function(point) {
                  if (!this.group)
                    return this.containsPoint(point);
                  
                  var center = this.getAbsoluteCenterPoint();
                  var thisPos = {
                      xStart: center.x - this.width/2 * this.scaleX,
                      xEnd: center.x + this.width/2 * this.scaleX,
                      yStart: center.y - this.height/2 * this.scaleY,
                      yEnd: center.y + this.height/2 * this.scaleY
                  };
                  
                  if (point.x >= thisPos.xStart && point.x <= (thisPos.xEnd)) {
                      if (point.y >= thisPos.yStart && point.y <= thisPos.yEnd) {
                          return true;
                      }
                  }
                  return false;
                }
            });

        }


        //清空绘制智能对齐辅助线
        this.clearAlignLine=function(){

            if (self.alignmentLineObject!=null){

                //清除画布中智能辅助线
                var objs = canvas.getObjects().filter(function(o) {
                    if (o.get('dType') === 'alignmentLine') {
                        return o.set('active', true);
                    }
                });
                for (var i=objs.length-1;i>=0;i--){
                    canvas.remove(objs[i]);
                }
                canvas.renderAll();
            }
        }


        //根据商品清单更新所有页面商品信息
        //@ mmDetailsData 商品清单
        //@ pagesData 需要更新的页面 [0,1,2,3,...]
        //@ pagesDuplicate 所有页面活动页面主副本设计内容
        //@ pageIndex 当前处理pagesData位置
        this.reLoadRefreshDetails=function(mmDetailsData,pagesData,pageIndex=0,pagesDuplicate,callback=null){
           
            if (pageIndex<pagesData.length){
              
                var _pageNum=pagesData[pageIndex];
                var thePageDuplicate=pagesDuplicate[_pageNum];

                if (thePageDuplicate.length>0){

                    for (var i=0;i<thePageDuplicate.length;i++){

                        if (thePageDuplicate[i].isValid*1==0){

                            var theActivePageObjects=thePageDuplicate[i].objects;

                            for (var j=0;j<theActivePageObjects.length;j++){

                                var _obj=theActivePageObjects[j];
                                if (_obj.visible==true && _obj.hasOwnProperty("dType") && _obj.hasOwnProperty("objects")){

                                    //商品组件

                                    if (_obj.dType=="Product" && _obj.hasOwnProperty("dSort")){
                                        
                                        if (!isEmpty(_obj.dSort)){

                                            var page_sort=(_obj.dSort).split("-");
                                            var _page=page_sort[0];
                                            var _sort=page_sort[1];

                                            if (_page!=null && _page!="" && _sort!=null && _sort!=""){

                                                if (!mmDetailsData[_page*1 - 1]){
                                                    continue;
                                                }else if (!mmDetailsData[_page*1 - 1][_sort*1]){
                                                    continue;
                                                }


                                                var _product=mmDetailsData[_page*1 - 1][_sort*1];

                                                if (!isEmpty(_product)){
                                            
                                                    var _obj_objects=_obj.objects;
                                                    for (var k=0;k<_obj_objects.length;k++){
                                                        if (_obj_objects[k].hasOwnProperty("dType")){

                                                            //商品普通文本标签
                                                            if (_obj_objects[k].dType=="productNormalText" || _obj_objects[k].dType=="productLineationText"){

                                                                if (_obj_objects[k].hasOwnProperty("dataFiled")){


                                                                    var tmpText=null;
                                                                    var dataFiled=_obj_objects[k].dataFiled;
                                                                    var insertText="";
                                                                    tmpText="";
                                                                    if (dataFiled.substr(0,3)=="lk_"){
                                                                        if (_obj_objects[k].hasOwnProperty("lkSort")){
                                                                
                                                                            if (_obj_objects[k].lkSort!='' && _obj_objects[k].lkSort*1>=1){

                                                                                if (isEmpty(_product.linkItems)==false){

                                                                                    var _lkSort=_obj_objects[k].lkSort*1 -1;

                                                                                    for (var key in _product.linkItems[_lkSort]){
                                                                                        if (key.toLowerCase()==dataFiled.toLowerCase()){

                                                                                            if (_obj_objects[k].hasOwnProperty("insertText")){
                                                                                                insertText=_obj_objects[k].insertText;
                                                                                                insertText=(isEmpty(insertText)==false)?insertText:"";
                                                                                            }else{
                                                                                                insertText="";
                                                                                            }

                                                                                            tmpText=insertText+_product.linkItems[_lkSort][key];
                                                                                            break;
                                                                                        }
                                                                                    }

                                                                                }
                                                                            }
                                                                        }


                                                                    }else{

                                                                        for (var key in _product){
                                                                            if (key.toLowerCase()==dataFiled.toLowerCase()){

                                                                                if (_obj_objects[k].hasOwnProperty("insertText")){
                                                                                    insertText=_obj_objects[k].insertText;
                                                                                    insertText=(isEmpty(insertText)==false)?insertText:"";
                                                                                }else{
                                                                                    insertText="";
                                                                                }

                                                                                tmpText=insertText+_product[key];
                                                                                break;
                                                                            }
                                                                        }
                                                                    }

                                                            
                                                                    if (!isEmpty(tmpText) && tmpText!="null"){
                                                    
                                                                        var _sourceText=deleteSpace(_obj_objects[k].text);
                                                                        var _newText=deleteSpace(tmpText);
                                                                        if (_sourceText!=_newText){
                                                                            
                                                                            _obj_objects[k].text=(""+tmpText);
                                                                            _obj_objects[k].visible=true;
    
                                                                            //多行文字处理 textLines
                                                                            if (_obj_objects[k].textLines.length>1){
    
                                                                                for (var r=0;r<_obj_objects[k].textLines.length;r++){
    
                                                                                }
    
                                                                            }else{
                                                                                _obj_objects[k].textLines[0]=(""+tmpText);
                                                                            }
                                                                        }

                                                                    }else{
                                                                        _obj_objects[k].text="";
                                                                        _obj_objects[k].visible=false;
                                                                    }


                                                                }

                                                            }

                                                            //划线价
                                                            if (_obj_objects[k].dType=="productPriceGroup"){
                                                               
                                                                if (_obj_objects[k].objects[0].type=="i-text"){
                                                                    var _textObj=_obj_objects[k].objects[0];
                                                                    var _lineObj=_obj_objects[k].objects[1]; 
                                                                    var _textIndex=0,_lineIndex=1;
                                                                }else{
                                                                    var _textObj=_obj_objects[k].objects[1];
                                                                    var _lineObj=_obj_objects[k].objects[0];
                                                                    var _textIndex=1,_lineIndex=0;
                                                                }

                                                                if (!isEmpty(_product.normalprice)){ 
                                                                    _obj_objects[k].objects[_textIndex].textLines[0]=_product.normalprice+"";
                                                                    _obj_objects[k].objects[_textIndex].text=_product.normalprice+"";

                                                                }else{
                                                                    _obj_objects[k].objects[_textIndex].textLines[0]="";
                                                                    _obj_objects[k].objects[_textIndex].text="";
                                                                    _obj_objects[k].visible=false;
                                                                }

                                                            }

                                                            //商品图片/ICON
                                                            if (_obj_objects[k].dType=="productPicture"){

                                                                var _img=_obj_objects[k].objects[0];
                                                                
                                                                //在这识别是商品主图、Icon、Brand
                                                                var newImgSrc=null;
                                                                var cmykSrc=null;
                                                                var picid=null;
                                                                var newParm=null;

                                                                switch (_obj_objects[k].dataFiled)
                                                                {
                                                                    case "goodsImage":
                                                                        newImgSrc=_product.goodsImage.rgbOriginPath;
                                                                        cmykSrc=_product.goodsImage.cmykOriginPath;
                                                                        var itemcode=_product.goodsImage.itemcode;
                                                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                                                    break;
                                                                    case "brand":
                                                                        if (_product.brand!=null){
                                                                            newImgSrc=_product.brand.rgbOriginPath;
                                                                            cmykSrc=_product.brand.cmykOriginPath;
                                                                            picid=_product.brand.picid;
                                                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                                                        }
                                                                    break;
                                                                    case "gift":
                                                                        newImgSrc=_product.gift.rgbOriginPath;
                                                                        cmykSrc=_product.gift.cmykOriginPath;
                                                                        var itemcode=_product.gift.itemcode;
                                                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                                                    break;
                                                                    case "icon1":
                                                                        if (_product.icons[0]!=null){
                                                                            newImgSrc=_product.icons[0].rgbOriginPath;
                                                                            cmykSrc=_product.icons[0].cmykOriginPath;
                                                                            picid=_product.icons[0].picid;
                                                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                                                        }
                                                                    break;
                                                                    case "icon2":
                                                                        
                                                                            if (_product.icons[1]!=null){
                                                                                newImgSrc=_product.icons[1].rgbOriginPath;
                                                                                cmykSrc=_product.icons[1].cmykOriginPath;
                                                                                picid=_product.icons[1].picid;
                                                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                                                            }
                                                                    break;
                                                                    case "icon3":
                                                                        
                                                                            if (_product.icons[2]!=null){
                                                                                newImgSrc=_product.icons[2].rgbOriginPath;
                                                                                cmykSrc=_product.icons[2].cmykOriginPath;
                                                                                picid=_product.icons[2].picid;
                                                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                                                            }
                                                                    break;
                                                                    case "lk_goodsImage":
                                                                      
                                                                        if (_obj_objects[k].hasOwnProperty("objects")){    
                                                                            if (_obj_objects[k].objects[i].hasOwnProperty("lkSort")){
                                                                                if (_obj_objects[k].objects[i].lkSort!='' && _obj_objects[k].objects[i].lkSort*1>=1){
                                                                                    if (isEmpty(_product.linkItems)==false){
                                                                                        var _lkSort=_obj_objects[k].objects[i].lkSort*1 -1;
                                                                                        if (isEmpty(_product.linkItems[_lkSort])==false){
                                                                                            if (_product.linkItems[_lkSort].hasOwnProperty("rgbOriginPath") && _product.linkItems[_lkSort].hasOwnProperty("cmykOriginPath")){
                                                                                                newImgSrc=_product.linkItems[_lkSort].rgbOriginPath;
                                                                                                cmykSrc=_product.linkItems[_lkSort].cmykOriginPath;
                                                                                                var itemcode=_product.linkItems[_lkSort].itemcode;
                                                                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode}; 
                                                                                            }                                              
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }


                                                                    
                                                                    break;

                                                                }


                                                                if (newParm!=null){
                                                                    if (newParm.src!=_img.src && !isEmpty(newParm.src)){

                                                                        _img.src=newParm.src;

                                                                       var theObj=_obj_objects[k];
                                                             
                                                                        _parent.setProductPicture(newParm,k,_img,async function(newImg,objectSort){
                                                                         
                                                                            /*if (newImg.width>newImg.height){
                                                                                var _pi=theObj.width * theObj.scaleX/newImg.width;
                                                                            }else{
                                                                                var _pi=theObj.height * theObj.scaleY/newImg.height;
                                                                            }
                                                         
                                                                            newImg.scaleX=_pi;
                                                                            newImg.scaleY=_pi;*/
                                                                        


                                            if (newImg.width>newImg.height){
                                                var _pi=theObj.objects[objectSort].width/newImg.width;
                                            }else{
                                                var _pi=theObj.objects[objectSort].height/newImg.height;
                                            }
                                            newImg.scale(_pi);
                                            newImg.scaleX=_pi;
                                            newImg.scaleY=_pi;
                                                                        

                                            var picBoxHeight=theObj.objects[objectSort].height ;
                                            var newImgBoxHeight=newImg.height * _pi;
                                            
                                            if (picBoxHeight>newImgBoxHeight){
                                                newImg.left=-1 * theObj.objects[objectSort].width/2;
                                                newImg.top=-1 * theObj.objects[objectSort].height/2 + (picBoxHeight-newImgBoxHeight)/2;
                                                
                                            }else{
                                            
                                                newImg.left=0 - theObj.objects[objectSort].width/2;
                                                newImg.top=0 - theObj.objects[objectSort].height/2;
                                                
                                            }

                                            theObj.objects[objectSort].objects[0]=newImg;
                                            theObj.item(objectSort).item(0).set({src:newParm.src});

                                            theObj.objects[objectSort].objects[0].visible=true;
                                            theObj.objects[objectSort].objects[1].visible=false;
                                            theObj.objects[objectSort].objects[2].visible=false;
                                            if (theObj.objects[objectSort].objects[3]){
                                                theObj.objects[objectSort].objects[3].visible=false;
                                            }
                                            //2021-12-18
                                            theObj.objects[objectSort].objects[1].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});
                                            theObj.objects[objectSort].objects[2].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});  
                                            
                                            if (theObj.objects[objectSort].objects[3]){
                                                theObj.objects[objectSort].objects[3].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});     
                                            }
                                            _obj_objects[k]=theObj;

                                                                            
                                                                        });
                                                                    }
                                                                    
                                                                }





                                                                //End product image
                                                            }



                                                        }
                                                    }

                                                    _obj.objects=_obj_objects;

                                                }
                                            }
                                        }
                                    }

                                    //页码组件

                                }

                                theActivePageObjects[j]=_obj;

                            }

                            thePageDuplicate[i].objects=theActivePageObjects;


                        }
                    }
                    _parent.reLoadRefreshDetails(mmDetailsData,pagesData,pageIndex+1,pagesDuplicate,callback);
                }else{

                    //next
                }


            }else{
                console.log("update product finash");
                self.pagesDuplicate=pagesDuplicate;
                (callback && typeof(callback) === "function") && callback(pagesDuplicate);
            }


        }

        this.reLoadRefreshDetails_bak=function(mmDetailsData,pagesData,pageIndex=0,pagesDuplicate,callback=null){
           
            if (pageIndex<pagesData.length){
              
                var _pageNum=pagesData[pageIndex];
                var thePageDuplicate=pagesDuplicate[_pageNum];
                if (thePageDuplicate.length>0){

                    for (var i=0;i<thePageDuplicate.length;i++){

                        if (thePageDuplicate[i].isValid*1==0){

                            var theActivePageObjects=thePageDuplicate[i].objects;

                            for (var j=0;j<theActivePageObjects.length;j++){

                                var _obj=theActivePageObjects[j];
                                if (_obj.visible==true && _obj.hasOwnProperty("dType") && _obj.hasOwnProperty("objects")){

                                    //商品组件

                                    if (_obj.dType=="Product" && _obj.hasOwnProperty("dSort")){
                                        
                                        if (!isEmpty(_obj.dSort)){

                                            var page_sort=(_obj.dSort).split("-");
                                            var _page=page_sort[0];
                                            var _sort=page_sort[1];

                                            if (_page!=null && _page!="" && _sort!=null && _sort!=""){

                                                if (!mmDetailsData[_page*1 - 1]){
                                                    continue;
                                                }else if (!mmDetailsData[_page*1 - 1][_sort*1]){
                                                    continue;
                                                }


                                                var _product=mmDetailsData[_page*1 - 1][_sort*1];

                                                if (!isEmpty(_product)){
                                            
                                                    var _obj_objects=_obj.objects;
                                                    for (var k=0;k<_obj_objects.length;k++){
                                                        if (_obj_objects[k].hasOwnProperty("dType")){

                                                            //商品普通文本标签
                                                            if (_obj_objects[k].dType=="productNormalText" || _obj_objects[k].dType=="productLineationText"){

                                                                if (_obj_objects[k].hasOwnProperty("dataFiled")){


                                                                    var tmpText=null;
                                                                    var dataFiled=_obj_objects[k].dataFiled;
                                                                    var insertText="";
                                                                    tmpText="";
                                                                    if (dataFiled.substr(0,3)=="lk_"){
                                                                        if (_obj_objects[k].hasOwnProperty("lkSort")){
                                                                
                                                                            if (_obj_objects[k].lkSort!='' && _obj_objects[k].lkSort*1>=1){

                                                                                if (isEmpty(_product.linkItems)==false){

                                                                                    var _lkSort=_obj_objects[k].lkSort*1 -1;

                                                                                    for (var key in _product.linkItems[_lkSort]){
                                                                                        if (key.toLowerCase()==dataFiled.toLowerCase()){

                                                                                            if (_obj_objects[k].hasOwnProperty("insertText")){
                                                                                                insertText=_obj_objects[k].insertText;
                                                                                                insertText=(isEmpty(insertText)==false)?insertText:"";
                                                                                            }else{
                                                                                                insertText="";
                                                                                            }

                                                                                            tmpText=insertText+_product.linkItems[_lkSort][key];
                                                                                            break;
                                                                                        }
                                                                                    }

                                                                                }
                                                                            }
                                                                        }


                                                                    }else{
                                                                        for (var key in _product){
                                                                            if (key.toLowerCase()==dataFiled.toLowerCase()){

                                                                                if (_obj_objects[k].hasOwnProperty("insertText")){
                                                                                    insertText=_obj_objects[k].insertText;
                                                                                    insertText=(isEmpty(insertText)==false)?insertText:"";
                                                                                }else{
                                                                                    insertText="";
                                                                                }

                                                                                tmpText=insertText+_product[key];
                                                                                break;
                                                                            }
                                                                        }
                                                                    }

                                                            
                                                                    if (!isEmpty(tmpText) && tmpText!="null"){
                                                                        _obj_objects[k].text=(""+tmpText);
                                                                        _obj_objects[k].visible=true;
                                                                        //多行文字处理 textLines
                                                                        if (_obj_objects[k].textLines.length>1){

                                                                            for (var r=0;r<_obj_objects[k].textLines.length;r++){

                                                                            }

                                                                        }else{
                                                                            _obj_objects[k].textLines[0]=(""+tmpText);
                                                                        }


                                                                    }else{
                                                                        _obj_objects[k].text="";
                                                                        _obj_objects[k].visible=false;
                                                                    }


                                                                }

                                                            }

                                                            //划线价
                                                            if (_obj_objects[k].dType=="productPriceGroup"){
                                                               
                                                                if (_obj_objects[k].objects[0].type=="i-text"){
                                                                    var _textObj=_obj_objects[k].objects[0];
                                                                    var _lineObj=_obj_objects[k].objects[1]; 
                                                                    var _textIndex=0,_lineIndex=1;
                                                                }else{
                                                                    var _textObj=_obj_objects[k].objects[1];
                                                                    var _lineObj=_obj_objects[k].objects[0];
                                                                    var _textIndex=1,_lineIndex=0;
                                                                }

                                                                if (!isEmpty(_product.normalprice)){ 
                                                                    _obj_objects[k].objects[_textIndex].textLines[0]=_product.normalprice+"";
                                                                    _obj_objects[k].objects[_textIndex].text=_product.normalprice+"";

                                                                }else{
                                                                    _obj_objects[k].objects[_textIndex].textLines[0]="";
                                                                    _obj_objects[k].objects[_textIndex].text="";
                                                                    _obj_objects[k].visible=false;
                                                                }

                                                            }

                                                            //商品图片/ICON
                                                            if (_obj_objects[k].dType=="productPicture"){

                                                                var _img=_obj_objects[k].objects[0];
                                                                
                                                                //在这识别是商品主图、Icon、Brand
                                                                var newImgSrc=null;
                                                                var cmykSrc=null;
                                                                var picid=null;
                                                                var newParm=null;

                                                                switch (_obj_objects[k].dataFiled)
                                                                {
                                                                    case "goodsImage":
                                                                        newImgSrc=_product.goodsImage.rgbOriginPath;
                                                                        cmykSrc=_product.goodsImage.cmykOriginPath;
                                                                        var itemcode=_product.goodsImage.itemcode;
                                                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                                                    break;
                                                                    case "brand":
                                                                        if (_product.brand!=null){
                                                                            newImgSrc=_product.brand.rgbOriginPath;
                                                                            cmykSrc=_product.brand.cmykOriginPath;
                                                                            picid=_product.brand.picid;
                                                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                                                        }
                                                                    break;
                                                                    case "gift":
                                                                        newImgSrc=_product.gift.rgbOriginPath;
                                                                        cmykSrc=_product.gift.cmykOriginPath;
                                                                        var itemcode=_product.gift.itemcode;
                                                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                                                    break;
                                                                    case "icon1":
                                                                        if (_product.icons[0]!=null){
                                                                            newImgSrc=_product.icons[0].rgbOriginPath;
                                                                            cmykSrc=_product.icons[0].cmykOriginPath;
                                                                            picid=_product.icons[0].picid;
                                                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                                                        }
                                                                    break;
                                                                    case "icon2":
                                                                        
                                                                            if (_product.icons[1]!=null){
                                                                                newImgSrc=_product.icons[1].rgbOriginPath;
                                                                                cmykSrc=_product.icons[1].cmykOriginPath;
                                                                                picid=_product.icons[1].picid;
                                                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                                                            }
                                                                    break;
                                                                    case "icon3":
                                                                        
                                                                            if (_product.icons[2]!=null){
                                                                                newImgSrc=_product.icons[2].rgbOriginPath;
                                                                                cmykSrc=_product.icons[2].cmykOriginPath;
                                                                                picid=_product.icons[2].picid;
                                                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                                                            }
                                                                    break;
                                                                    case "lk_goodsImage":
                                                                      
                                                                        if (_obj_objects[k].hasOwnProperty("objects")){    
                                                                            if (_obj_objects[k].objects[i].hasOwnProperty("lkSort")){
                                                                                if (_obj_objects[k].objects[i].lkSort!='' && _obj_objects[k].objects[i].lkSort*1>=1){
                                                                                    if (isEmpty(_product.linkItems)==false){
                                                                                        var _lkSort=_obj_objects[k].objects[i].lkSort*1 -1;
                                                                                        if (isEmpty(_product.linkItems[_lkSort])==false){
                                                                                            if (_product.linkItems[_lkSort].hasOwnProperty("rgbOriginPath") && _product.linkItems[_lkSort].hasOwnProperty("cmykOriginPath")){
                                                                                                newImgSrc=_product.linkItems[_lkSort].rgbOriginPath;
                                                                                                cmykSrc=_product.linkItems[_lkSort].cmykOriginPath;
                                                                                                var itemcode=_product.linkItems[_lkSort].itemcode;
                                                                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode}; 
                                                                                            }                                              
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }


                                                                    
                                                                    break;

                                                                }


                                                                if (newParm!=null){
                                                                    if (newParm.src!=_img.src && !isEmpty(newParm.src)){

                                                                       var theObj=_obj_objects[k];
                                                             
                                                                        _parent.setProductPicture(newParm,k,_img,function(newImg,objectSort){
                                                                         
                                                                            if (newImg.width>newImg.height){
                                                                                var _pi=theObj.width/newImg.width;
                                                                            }else{
                                                                                var _pi=theObj.height/newImg.height;
                                                                            }
                                                         
                                                                            newImg.scaleX=_pi;
                                                                            newImg.scaleY=_pi;
                                                                        
                                                                            var picBoxHeight=theObj.height ;
                                                                            var newImgBoxHeight=newImg.height * _pi;
                                                                            
                                                                            if (picBoxHeight>newImgBoxHeight){
                                                                                newImg.left=-1 * theObj.width/2;
                                                                                newImg.top=-1 * theObj.height/2 + (picBoxHeight-newImgBoxHeight)/2;
                                                                                
                                                                            }else{
                                                                            
                                                                                newImg.left=0 - theObj.width/2;
                                                                                newImg.top=0 - theObj.height/2;
                                                                                
                                                                            }
                                                                            
                                                                            theObj.objects[0]=newImg;
                                                                            
                                                                            theObj.objects[0].visible=true;
                                                                            theObj.objects[1].visible=false;
                                                                            theObj.objects[2].visible=false;
                                                                            if (theObj.objects[3]){
                                                                                theObj.objects[3].visible=false;
                                                                            }
                                                                            
                                                                            theObj.objects[1].width=(newImg.width * newImg.scaleX);
                                                                            theObj.objects[1].height=(newImg.height * newImg.scaleY);
                                                                            theObj.objects[2].width=(newImg.width * newImg.scaleX);
                                                                            theObj.objects[2].height=(newImg.height * newImg.scaleY);

                                                                            if (theObj.objects[3]){
                                                                                theObj.objects[3].width=(newImg.width * newImg.scaleX);
                                                                                theObj.objects[3].height=(newImg.height * newImg.scaleY);
                                                                            }
                                                                            
                                                                            
                                                                        });
                                                                    }
                                                                    
                                                                }





                                                                //End product image
                                                            }



                                                        }
                                                    }

                                                }
                                            }
                                        }
                                    }

                                    //页码组件

                                }

                            }

                        }
                    }
                    _parent.reLoadRefreshDetails(mmDetailsData,pagesData,pageIndex+1,pagesDuplicate,callback);
                }else{

                    //next
                }


            }else{
                console.log("update product finash");
                (callback && typeof(callback) === "function") && callback(pagesDuplicate);
            }


        }


        //根据MM当前页所有商品清单刷新商品组件内容
        this.updatePageProduct=function(objs,pageSort=null,objSort=0){
           
            pageSort=(pageSort==null)?self.cunterPage*1:pageSort;
            
            if (isEmpty(mmDetailsData[pageSort])==false || 1==1){
                
                if (objSort<objs.length){
            
                    var i=objSort;
                              
                    if (isEmpty(mmDetailsData)==false){
                       
                       if (objs[i]._objects){
                   
                         if ("Product"==objs[i].dType && objs[i].dSort!=undefined){
                      
                            var proPageSort=(objs[i].dSort).split("-");
                            var dSort=proPageSort[1] * 1;
                            var viewObject={};
                          
                            if (isEmpty(mmDetailsData[proPageSort[0] * 1 - 1])==false && isEmpty(dSort)==false){
                         
                        
                               if (isEmpty(mmDetailsData[proPageSort[0] * 1 - 1])==false){ 
                                  
                                    if (mmDetailsData[proPageSort[0] * 1 - 1].indexOf(dSort)){
                                       
                                        viewObject=mmDetailsData[proPageSort[0] * 1 - 1][dSort];
                                        if (viewObject!=null && viewObject.sort){
                                            //console.log("do=>" + objs[i].id);
                                            _parent.updateListProduct(objs[i],viewObject,0,function(newObj){
                                               
                                                objs[objSort]=newObj;
                                                _parent.updatePageProduct(objs,pageSort,objSort+1);
                                            });
                                       
                                        }
                                    }else{
                                        console.log("mmDetailsData sort of page is null");
                                    }

                                }

                            }else{
                                console.log("mmDetailsData page is null");
                            }
                                             

                         }else{
                            _parent.updatePageProduct(objs,pageSort,objSort+1);
                         }
                       }else{
                            _parent.updatePageProduct(objs,pageSort,objSort+1);
                       }
                    }else{
                        console.log("mmDetailsData is null");
                    }

                    
                }else{

                    // for完所有组件
                    canvas._objects=objs;
                    self.componentDraw().resetView(function(){
                        self.switchPage=true;                        
                    });

                }

            }else{

                setTimeout(function() {
                    self.switchPage=true;
                },1000);


            }
        }
        
        this.callbackUpdate=function(theObj,callback=null){
            
            (callback && typeof(callback) === "function") && callback(theObj);
        }

        //替换遍历当前页所有商品组件内容
        this.updateListProduct=function(theObj,viewObject,objIndex=0,callback=null){

   
            var preImg={};
            var _pictureIndex=-1;

            theObj.set("productData",viewObject);
            theObj.set("itemCode",viewObject.itemcode);
            
     
            //商品图片框
            var i=objIndex;
            if (isEmpty(theObj._objects[i])==false){
                //console.log("dType=>" + theObj._objects[i].dType);
            }else{
                //console.log(objIndex,theObj._objects[i],theObj);
            }
            if (objIndex<theObj._objects.length){  
    
                if (theObj._objects[i].dType=="productPicture"){
                        
                        if (theObj.item(i).dType=="productPicture"){
                             
                                theObj._objects[i]._objects[0].visible=true;
                                theObj._objects[i]._objects[1].visible=false;
                                theObj._objects[i]._objects[2].visible=false;
                                if (theObj._objects[i]._objects[3]){
                                    theObj._objects[i]._objects[3].visible=false;
                                }

                                if (theObj._objects[i]._objects[0].hasOwnProperty("customSetPic")){
                                    if (theObj._objects[i]._objects[0].customSetPic==true){
                                        //_parent.updateListProduct(theObj,viewObject,objIndex+1,callback);
                                        //break;
                                    }
                                }
                            
                                var img = new Image();
                                img.setAttribute('crossOrigin', 'anonymous');
                                
                                var _group=theObj._objects[i];
                                
                                //图片组件中的Image元件
                                var _img=theObj._objects[i]._objects[0];
                                
                                //在这识别是商品主图、Icon、Brand
                                var newImgSrc=null;
                                var cmykSrc=null;
                                var picid=null;
                                var newParm=null;
                               
                                switch (theObj.item(i).dataFiled)
                                {
                                    case "goodsImage":
                                        newImgSrc=viewObject.goodsImage.rgbOriginPath; 
                                        cmykSrc=viewObject.goodsImage.cmykOriginPath;
                                        var itemcode=viewObject.goodsImage.itemcode;
                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                    
                                    break;
                                    case "brand":
                                        if (viewObject.brand!=null){
                                            newImgSrc=viewObject.brand.rgbOriginPath;
                                            cmykSrc=viewObject.brand.cmykOriginPath;
                                            picid=viewObject.brand.picid;
                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                        }
                                    break;
                                    case "gift":
                                        newImgSrc=viewObject.gift.rgbOriginPath;
                                        cmykSrc=viewObject.gift.cmykOriginPath;
                                        var itemcode=viewObject.gift.itemcode;
                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                    break;
                                    case "icon1":
                                        if (viewObject.icons[0]!=null){
                                            newImgSrc=viewObject.icons[0].rgbOriginPath;
                                            cmykSrc=viewObject.icons[0].cmykOriginPath;
                                            picid=viewObject.icons[0].picid;
                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                        }
                                    break;
                                    case "icon2":
                                        
                                            if (viewObject.icons[1]!=null){
                                                newImgSrc=viewObject.icons[1].rgbOriginPath;
                                                cmykSrc=viewObject.icons[1].cmykOriginPath;
                                                picid=viewObject.icons[1].picid;
                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                            }
                                    break;
                                    case "icon3":
                                        
                                            if (viewObject.icons[2]!=null){
                                                newImgSrc=viewObject.icons[2].rgbOriginPath;
                                                cmykSrc=viewObject.icons[2].cmykOriginPath;
                                                picid=viewObject.icons[2].picid;
                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                            }
                                    break;
                                    case "lk_goodsImage":
                                        if (theObj.item(i).hasOwnProperty("lkSort")){
                                            if (theObj.item(i).lkSort!='' && theObj.item(i).lkSort*1>=1){
                                                if (isEmpty(viewObject.linkItems)==false){
                                                    var _lkSort=theObj.item(i).lkSort*1 -1;
                                                    if (isEmpty(viewObject.linkItems[_lkSort])==false){
                                                        if (viewObject.linkItems[_lkSort].hasOwnProperty("rgbOriginPath") && viewObject.linkItems[_lkSort].hasOwnProperty("cmykOriginPath")){
                                                            newImgSrc=viewObject.linkItems[_lkSort].rgbOriginPath;
                                                            cmykSrc=viewObject.linkItems[_lkSort].cmykOriginPath;
                                                            var itemcode=viewObject.linkItems[_lkSort].itemcode;
                                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode}; 
                                                        }                                              
                                                    }
                                                }
                                            }
                                        }

                                    
                                    break;
                                }
                               
                                if (newParm!=null){
                               
                                    if (newParm.src!=_img.src && !isEmpty(newParm.src)){
                                     
                                        self.drawing=true;
                                        _parent.setProductPicture(newParm,i,_img,function(newImg,objectSort){
                                          
                                            if (newImg.width>newImg.height){
                                                var _pi=theObj._objects[objectSort].width/newImg.width;
                                            }else{
                                                var _pi=theObj._objects[objectSort].height/newImg.height;
                                            }
                                            newImg.scale(_pi);
                                            newImg.scaleX=_pi;
                                            newImg.scaleY=_pi;
                                        
                                            var picBoxHeight=theObj._objects[objectSort].height ;
                                            var newImgBoxHeight=newImg.height * _pi;
                                            
                                            if (picBoxHeight>newImgBoxHeight){
                                                newImg.left=-1 * theObj._objects[objectSort].width/2;
                                                newImg.top=-1 * theObj._objects[objectSort].height/2 + (picBoxHeight-newImgBoxHeight)/2;
                                                
                                            }else{
                                            
                                                newImg.left=0 - theObj._objects[objectSort].width/2;
                                                newImg.top=0 - theObj._objects[objectSort].height/2;
                                                
                                            }
                                            
                                            theObj._objects[objectSort]._objects[0]=newImg;
                                            theObj.item(objectSort).item(0).set({src:newParm.src});

                                            theObj._objects[objectSort]._objects[0].visible=true;
                                            theObj._objects[objectSort]._objects[1].visible=false;
                                            theObj._objects[objectSort]._objects[2].visible=false;
                                            if (theObj._objects[objectSort]._objects[3]){
                                                theObj._objects[objectSort]._objects[3].visible=false;
                                            }
                                            //2021-12-18
                                            theObj._objects[objectSort]._objects[1].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});
                                            theObj._objects[objectSort]._objects[2].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});  
                                            
                                            if (theObj._objects[objectSort]._objects[3]){
                                                theObj._objects[objectSort]._objects[3].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});     
                                            }
                             
                                            _parent.updateListProduct(theObj,viewObject,objIndex+1,callback);
                                            
                                        });
                                    }else{
                                        _parent.updateListProduct(theObj,viewObject,objIndex+1,callback);
                                        return;
                                    }
                                    
                                }else{
                                
                                    var data={};
                                    data.left=theObj._objects[i]._objects[1].left;
                                    data.top=theObj._objects[i]._objects[1].top
                                    data.width=theObj._objects[i]._objects[1].width;
                                    data.height=theObj._objects[i]._objects[1].height;
                                    data.type="rect";
                                    data.fill="#ffffff",
                                    data.opacity=1;
                                    data.stroke='#999999';
                                    data.strokeWidth=1;
                                    data.scaleX=theObj._objects[i]._objects[1].scaleX;
                                    data.scaleY=theObj._objects[i]._objects[1].scaleY;
                                    data.visible=false;
                                    
                                    var rect = new fabric.Rect(data);

                                    //测试如果该商品没有对应的图片，显示标签图框
                                    theObj._objects[i]._objects[0]=rect;
                                    theObj._objects[i]._objects[1].visible=false;
                                    theObj._objects[i]._objects[2].visible=false;
                                    if (theObj._objects[i]._objects[3]){
                                        theObj._objects[i]._objects[3].visible=false;
                                    }
                                    //theObj.addWithUpdate();
                                    //theObj.setCoords();
                                    //canvas.renderAll(); 
                                    _parent.updateListProduct(theObj,viewObject,objIndex+1,callback);
                                }
                            
                        }else{
                            console.log("item i not productPicture");
                        }
                    
                }else{
              
                    var j=objIndex;
                    self.drawing=true;
                    
                    switch (theObj._objects[j].dType)
                    {
                        //处理商品组件中的商品标签编组时，数据更新处理
                        case "tmpGroup":

                                var P = new Promise(function (resolve, reject) {
                                   
                                    _parent.updateProductGroupLabel(theObj._objects[j],viewObject,function(resObj){
                                        theObj._objects[j]=resObj;
                                    });

                                    resolve();
                           
                                });
                                P.then(function (res) {
                                    
                                    _parent.updateListProduct(theObj,viewObject,objIndex+1,callback);
                                  
                                });
  
                        break;
                        
                        case "productNormalText":
                        case "productLineationText":
                            
                            var tmpText=null;
                            var dataFiled=theObj._objects[j].dataFiled;
                            var insertText="";
                            tmpText="";
                            if (dataFiled.substr(0,3)=="lk_"){
                                if (theObj._objects[j].hasOwnProperty("lkSort")){
                        
                                    if (theObj._objects[j].lkSort!='' && theObj._objects[j].lkSort*1>=1){
                                        if (isEmpty(viewObject.linkItems)==false){
                                            var _lkSort=theObj._objects[j].lkSort*1 -1;
                                            for (var k in viewObject.linkItems[_lkSort]){
                                                if (k.toLowerCase()==dataFiled.toLowerCase()){

                                                    if (theObj._objects[j].hasOwnProperty("insertText")){
                                                        insertText=theObj._objects[j].insertText;
                                                        insertText=(isEmpty(insertText)==false)?insertText:"";
                                                    }else{
                                                        insertText="";
                                                    }

                                                    tmpText=insertText+viewObject.linkItems[_lkSort][k];
                                                    break;
                                                }
                                            }

                                        }
                                    }
                                }


                            }else{
                                for (var k in viewObject){

                                    if (k.toLowerCase()==dataFiled.toLowerCase()){

                                        if (theObj._objects[j].hasOwnProperty("insertText")){
                                            insertText=theObj._objects[j].insertText;
                                            insertText=(isEmpty(insertText)==false)?insertText:"";
                                        }else{
                                            insertText="";
                                        }

                                        tmpText=insertText+viewObject[k];
                                        break;
                                    }
                                }
                            }

                            if (!isEmpty(tmpText) && tmpText!="null"){
                                
                                var _sourceText=deleteSpace(theObj.item(j).text);
                                var _newText=deleteSpace(tmpText);
                                if (_sourceText!=_newText){
                                    theObj.item(j).set({text:(""+tmpText),visible:true});
                                }
                                
                            }else{
                                theObj.item(j).set({text:"",visible:false});
                            }
                            
                            theObj.item(j).set({zIndex:theObj.item(j).zIndex});
                            _parent.updateListProduct(theObj,viewObject,objIndex+1,callback);
                            
                        break;
                        case "productPriceGroup":
                            var tmpText=null;
                            var dataFiled=theObj._objects[j].dataFiled;
                            var insertText="";
                            tmpText="";
                            if (dataFiled.substr(0,3)=="lk_"){
                                if (theObj._objects[j].hasOwnProperty("lkSort")){
                        
                                    if (theObj._objects[j].lkSort!='' && theObj._objects[j].lkSort*1>=1){
                                        if (isEmpty(viewObject.linkItems)==false){
                                            var _lkSort=theObj._objects[j].lkSort*1 -1;
                                            for (var k in viewObject.linkItems[_lkSort]){
                                                if (k.toLowerCase()==dataFiled.toLowerCase()){

                                                    if (theObj._objects[j].hasOwnProperty("insertText")){
                                                        insertText=theObj._objects[j].insertText;
                                                        insertText=(isEmpty(insertText)==false)?insertText:"";
                                                    }else{
                                                        insertText="";
                                                    }

                                                    tmpText=insertText+viewObject.linkItems[_lkSort][k];
                                                    break;
                                                }
                                            }

                                        }
                                    }
                                }


                            }else{
                                for (var k in viewObject){
                                    if (k.toLowerCase()==dataFiled.toLowerCase()){

                                        if (theObj._objects[j].hasOwnProperty("insertText")){
                                            insertText=theObj._objects[j].insertText;
                                            insertText=(isEmpty(insertText)==false)?insertText:"";
                                        }else{
                                            insertText="";
                                        }

                                        tmpText=insertText+viewObject[k];
                                        break;
                                    }
                                }
                            }

                            //处理划线价
                            if (theObj.item(j)._objects[0].type=="i-text"){
                                var _textObj=theObj.item(j)._objects[0];
                                var _lineObj=theObj.item(j)._objects[1]; 
                                var _textIndex=0,_lineIndex=1;
                            }else{
                                var _textObj=theObj.item(j)._objects[1];
                                var _lineObj=theObj.item(j)._objects[0];
                                var _textIndex=1,_lineIndex=0;
                            }


                            if (tmpText!=null && tmpText!="null"){

                                theObj.item(j).set({visible:true});

                                var sourceText=_textObj.text;
                                var isPoint=sourceText.indexOf(".");

                                var _sTextLen=sourceText.length;
                                var _nTextLen=tmpText.length;
                                var _len=_textObj.width/_sTextLen;

                                var _sourceLeft=theObj.item(j).left;
                                var _sourceTop=theObj.item(j).top;

                                var _lineY1=_lineObj.y1;
                                var _lineY2=_lineObj.y2;

                                _textObj.set({text:(""+tmpText)});

                                if (_sTextLen > _nTextLen){

                                    //计算新的分组宽度
                                    var newGroupWidth=_len * _nTextLen;

                                    var offsetX1=-0.2 * _textObj.fontSize;
                                    var offsetX2=0.1 * _textObj.fontSize;

                                    //var offsetX1=(0.1 * res.w<3)?-3:-0.1 * newGroupWidth;
                                    //var offsetX2=(0.1 * res.w<3)?3:0.1 * newGroupWidth;

                                    newGroupWidth=newGroupWidth + Math.abs(offsetX1) + offsetX2;
                            
                                    _lineObj.set({x1:0,x2:2});
                                    _textObj.set({x1:(theObj.item(j).width/2*-1)});
                                    theObj.item(j).set({width:newGroupWidth,left:_sourceLeft});
                     
                                    var _x1=newGroupWidth/2*-1;
                                    var _x2=newGroupWidth/2;
                                    _lineObj.set({x1:_x1,x2:_x2});
                                    _textObj.set({left:(_x1 - offsetX1)});
                                                                            
                                    theObj.item(j).set({left:_sourceLeft,top:_sourceTop,width:(_x2 - _x1)});
                                    theObj._objects[j].left=_sourceLeft;
                                    theObj._objects[j].top=_sourceTop;
                                    theObj.item(j).setCoords();


                                }else if (_sTextLen < _nTextLen){

                                    //计算新的分组宽度
                                    var newGroupWidth=_len * _nTextLen;

                                    var offsetX1=-0.2 * _textObj.fontSize;
                                    var offsetX2=0.1 * _textObj.fontSize;

                                    //var offsetX1=(0.1 * res.w<3)?-3:-0.1 * newGroupWidth;
                                    //var offsetX2=(0.1 * res.w<3)?3:0.1 * newGroupWidth;


                                    newGroupWidth=newGroupWidth + Math.abs(offsetX1) + offsetX2;
                                    _lineObj.set({x1:0,x2:2});
                                    _textObj.set({x1:(theObj.item(j).width/2*-1)});
                                    theObj.item(j).set({width:newGroupWidth,left:_sourceLeft});
                   
                                    var _x1=newGroupWidth/2*-1;
                                    var _x2=newGroupWidth/2;
                                    _lineObj.set({x1:_x1,x2:_x2});
                                    _textObj.set({left:(_x1 - offsetX1)});

                                    theObj.item(j).set({left:_sourceLeft,top:_sourceTop});
                                    theObj.item(j).setCoords();

                                }

                            }else{
                                theObj.item(j)._objects[_textIndex].set({text:""});
                                theObj.item(j).set({visible:false});
                            }
                            
                            theObj.item(j).set({zIndex:theObj.item(j).zIndex});
                            _parent.updateListProduct(theObj,viewObject,objIndex+1,callback);
                            
                        break;
                        default:
                            theObj.item(j).set({zIndex:theObj.item(j).zIndex});
                            _parent.updateListProduct(theObj,viewObject,objIndex+1,callback);
                    }
                    
                    // theObj.item(j).set({zIndex:theObj.item(j).zIndex});
                    // _parent.updateListProduct(theObj,viewObject,objIndex+1,callback);
                }

                
            }else{
                theObj.addWithUpdate();
                theObj.setCoords();
                canvas.renderAll(); 
                self.switchPage=true;
                (callback && typeof(callback) === "function") && callback(theObj);                
            }


        }
        
        this.updateListProduct_bak_20230429=function(theObj,viewObject,objIndex=0,callback=null){
          
            var preImg={};
            var _pictureIndex=-1;

            theObj.set("productData",viewObject);
            theObj.set("itemCode",viewObject.itemcode);
            
     
            //商品图片框
            var i=objIndex;

            if (objIndex<theObj._objects.length){  
               
                if (theObj._objects[i].dType=="productPicture"){
                         
                        if (theObj.item(i).dType=="productPicture"){
                              
                                theObj._objects[i]._objects[0].visible=true;
                                theObj._objects[i]._objects[1].visible=false;
                                theObj._objects[i]._objects[2].visible=false;
                                if (theObj._objects[i]._objects[3]){
                                    theObj._objects[i]._objects[3].visible=false;
                                }

                                if (theObj._objects[i]._objects[0].hasOwnProperty("customSetPic")){
                                    if (theObj._objects[i]._objects[0].customSetPic==true){
                                        //_parent.updateListProduct(theObj,viewObject,objIndex+1,callback);
                                        //break;
                                    }
                                }
                            
                                var img = new Image();
                                img.setAttribute('crossOrigin', 'anonymous');
                                
                                var _group=theObj._objects[i];
                                
                                //图片组件中的Image元件
                                var _img=theObj._objects[i]._objects[0];
                                
                                //在这识别是商品主图、Icon、Brand
                                var newImgSrc=null;
                                var cmykSrc=null;
                                var picid=null;
                                var newParm=null;
                               
                                switch (theObj.item(i).dataFiled)
                                {
                                    case "goodsImage":
                                        newImgSrc=viewObject.goodsImage.rgbOriginPath;
                                        cmykSrc=viewObject.goodsImage.cmykOriginPath;
                                        var itemcode=viewObject.goodsImage.itemcode;
                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                    
                                    break;
                                    case "brand":
                                        if (viewObject.brand!=null){
                                            newImgSrc=viewObject.brand.rgbOriginPath;
                                            cmykSrc=viewObject.brand.cmykOriginPath;
                                            picid=viewObject.brand.picid;
                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                        }
                                    break;
                                    case "gift":
                                        newImgSrc=viewObject.gift.rgbOriginPath;
                                        cmykSrc=viewObject.gift.cmykOriginPath;
                                        var itemcode=viewObject.gift.itemcode;
                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                    break;
                                    case "icon1":
                                        if (viewObject.icons[0]!=null){
                                            newImgSrc=viewObject.icons[0].rgbOriginPath;
                                            cmykSrc=viewObject.icons[0].cmykOriginPath;
                                            picid=viewObject.icons[0].picid;
                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                        }
                                    break;
                                    case "icon2":
                                        
                                            if (viewObject.icons[1]!=null){
                                                newImgSrc=viewObject.icons[1].rgbOriginPath;
                                                cmykSrc=viewObject.icons[1].cmykOriginPath;
                                                picid=viewObject.icons[1].picid;
                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                            }
                                    break;
                                    case "icon3":
                                        
                                            if (viewObject.icons[2]!=null){
                                                newImgSrc=viewObject.icons[2].rgbOriginPath;
                                                cmykSrc=viewObject.icons[2].cmykOriginPath;
                                                picid=viewObject.icons[2].picid;
                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                            }
                                    break;
                                    case "lk_goodsImage":
                                        if (theObj.item(i).hasOwnProperty("lkSort")){
                                            if (theObj.item(i).lkSort!='' && theObj.item(i).lkSort*1>=1){
                                                if (isEmpty(viewObject.linkItems)==false){
                                                    var _lkSort=theObj.item(i).lkSort*1 -1;
                                                    if (isEmpty(viewObject.linkItems[_lkSort])==false){
                                                        if (viewObject.linkItems[_lkSort].hasOwnProperty("rgbOriginPath") && viewObject.linkItems[_lkSort].hasOwnProperty("cmykOriginPath")){
                                                            newImgSrc=viewObject.linkItems[_lkSort].rgbOriginPath;
                                                            cmykSrc=viewObject.linkItems[_lkSort].cmykOriginPath;
                                                            var itemcode=viewObject.linkItems[_lkSort].itemcode;
                                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode}; 
                                                        }                                              
                                                    }
                                                }
                                            }
                                        }

                                    
                                    break;
                                }
                               
                                if (newParm!=null){
                                    if (newParm.src!=_img.src && !isEmpty(newParm.src)){
                             
                                        self.drawing=true;
                                        _parent.setProductPicture(newParm,i,_img,function(newImg,objectSort){
                                            
                                            if (newImg.width>newImg.height){
                                                var _pi=theObj._objects[objectSort].width/newImg.width;
                                            }else{
                                                var _pi=theObj._objects[objectSort].height/newImg.height;
                                            }
                                            newImg.scale(_pi);
                                            newImg.scaleX=_pi;
                                            newImg.scaleY=_pi;
                                        
                                            var picBoxHeight=theObj._objects[objectSort].height ;
                                            var newImgBoxHeight=newImg.height * _pi;
                                            
                                            if (picBoxHeight>newImgBoxHeight){
                                                newImg.left=-1 * theObj._objects[objectSort].width/2;
                                                newImg.top=-1 * theObj._objects[objectSort].height/2 + (picBoxHeight-newImgBoxHeight)/2;
                                                
                                            }else{
                                            
                                                newImg.left=0 - theObj._objects[objectSort].width/2;
                                                newImg.top=0 - theObj._objects[objectSort].height/2;
                                                
                                            }
                                            
                                            theObj._objects[objectSort]._objects[0]=newImg;
                                            theObj.item(objectSort).item(0).set({src:newParm.src});

                                            theObj._objects[objectSort]._objects[0].visible=true;
                                            theObj._objects[objectSort]._objects[1].visible=false;
                                            theObj._objects[objectSort]._objects[2].visible=false;
                                            if (theObj._objects[objectSort]._objects[3]){
                                                theObj._objects[objectSort]._objects[3].visible=false;
                                            }
                                            //2021-12-18
                                            theObj._objects[objectSort]._objects[1].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});
                                            theObj._objects[objectSort]._objects[2].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});  
                                            
                                            if (theObj._objects[objectSort]._objects[3]){
                                                theObj._objects[objectSort]._objects[3].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});     
                                            }
                             
                                            _parent.updateListProduct(theObj,viewObject,objIndex+1,callback);
                                            
                                        });
                                    }
                                    
                                }else{
                                 
                                    var data={};
                                    data.left=theObj._objects[i]._objects[1].left;
                                    data.top=theObj._objects[i]._objects[1].top
                                    data.width=theObj._objects[i]._objects[1].width;
                                    data.height=theObj._objects[i]._objects[1].height;
                                    data.type="rect";
                                    data.fill="#ffffff",
                                    data.opacity=1;
                                    data.stroke='#999999';
                                    data.strokeWidth=1;
                                    data.scaleX=theObj._objects[i]._objects[1].scaleX;
                                    data.scaleY=theObj._objects[i]._objects[1].scaleY;
                                    data.visible=false;
                                    
                                    var rect = new fabric.Rect(data);


                                    //测试如果该商品没有对应的图片，显示标签图框
                                    theObj._objects[i]._objects[0]=rect;
                                    theObj._objects[i]._objects[1].visible=false;
                                    theObj._objects[i]._objects[2].visible=false;
                                    if (theObj._objects[i]._objects[3]){
                                        theObj._objects[i]._objects[3].visible=false;
                                    }
                                    //theObj.addWithUpdate();
                                    //theObj.setCoords();
                                    //canvas.renderAll(); 
                                    _parent.updateListProduct(theObj,viewObject,objIndex+1,callback);
                                }
                            
                        }
                    
                }else{
              
                    var j=objIndex;
                    self.drawing=true;
                    switch (theObj._objects[j].dType)
                    {
                        case "productNormalText":
                        case "productLineationText":
                            
                            var tmpText=null;
                            var dataFiled=theObj._objects[j].dataFiled;
                            var insertText="";
                            tmpText="";
                            if (dataFiled.substr(0,3)=="lk_"){
                                if (theObj._objects[j].hasOwnProperty("lkSort")){
                        
                                    if (theObj._objects[j].lkSort!='' && theObj._objects[j].lkSort*1>=1){
                                        if (isEmpty(viewObject.linkItems)==false){
                                            var _lkSort=theObj._objects[j].lkSort*1 -1;
                                            for (var k in viewObject.linkItems[_lkSort]){
                                                if (k.toLowerCase()==dataFiled.toLowerCase()){

                                                    if (theObj._objects[j].hasOwnProperty("insertText")){
                                                        insertText=theObj._objects[j].insertText;
                                                        insertText=(isEmpty(insertText)==false)?insertText:"";
                                                    }else{
                                                        insertText="";
                                                    }

                                                    tmpText=insertText+viewObject.linkItems[_lkSort][k];
                                                    break;
                                                }
                                            }

                                        }
                                    }
                                }


                            }else{
                                for (var k in viewObject){

                                    if (k.toLowerCase()==dataFiled.toLowerCase()){

                                        if (theObj._objects[j].hasOwnProperty("insertText")){
                                            insertText=theObj._objects[j].insertText;
                                            insertText=(isEmpty(insertText)==false)?insertText:"";
                                        }else{
                                            insertText="";
                                        }

                                        tmpText=insertText+viewObject[k];
                                        break;
                                    }
                                }
                            }

                       
                            if (!isEmpty(tmpText) && tmpText!="null"){
                                theObj.item(j).set({text:(""+tmpText),visible:true});
                            }else{
                                theObj.item(j).set({text:"",visible:false});
                            }

                        break;
                        case "productPriceGroup":
                            var tmpText=null;
                            var dataFiled=theObj._objects[j].dataFiled;
                            var insertText="";
                            tmpText="";
                            if (dataFiled.substr(0,3)=="lk_"){
                                if (theObj._objects[j].hasOwnProperty("lkSort")){
                        
                                    if (theObj._objects[j].lkSort!='' && theObj._objects[j].lkSort*1>=1){
                                        if (isEmpty(viewObject.linkItems)==false){
                                            var _lkSort=theObj._objects[j].lkSort*1 -1;
                                            for (var k in viewObject.linkItems[_lkSort]){
                                                if (k.toLowerCase()==dataFiled.toLowerCase()){

                                                    if (theObj._objects[j].hasOwnProperty("insertText")){
                                                        insertText=theObj._objects[j].insertText;
                                                        insertText=(isEmpty(insertText)==false)?insertText:"";
                                                    }else{
                                                        insertText="";
                                                    }

                                                    tmpText=insertText+viewObject.linkItems[_lkSort][k];
                                                    break;
                                                }
                                            }

                                        }
                                    }
                                }


                            }else{
                                for (var k in viewObject){
                                    if (k.toLowerCase()==dataFiled.toLowerCase()){

                                        if (theObj._objects[j].hasOwnProperty("insertText")){
                                            insertText=theObj._objects[j].insertText;
                                            insertText=(isEmpty(insertText)==false)?insertText:"";
                                        }else{
                                            insertText="";
                                        }

                                        tmpText=insertText+viewObject[k];
                                        break;
                                    }
                                }
                            }

                            //处理划线价
                            if (theObj.item(j)._objects[0].type=="i-text"){
                                var _textObj=theObj.item(j)._objects[0];
                                var _lineObj=theObj.item(j)._objects[1]; 
                                var _textIndex=0,_lineIndex=1;
                            }else{
                                var _textObj=theObj.item(j)._objects[1];
                                var _lineObj=theObj.item(j)._objects[0];
                                var _textIndex=1,_lineIndex=0;
                            }


                            if (tmpText!=null && tmpText!="null"){

                                theObj.item(j).set({visible:true});

                                var sourceText=_textObj.text;
                                var isPoint=sourceText.indexOf(".");

                                var _sTextLen=sourceText.length;
                                var _nTextLen=tmpText.length;
                                var _len=_textObj.width/_sTextLen;

                                var _sourceLeft=theObj.item(j).left;
                                var _sourceTop=theObj.item(j).top;

                                var _lineY1=_lineObj.y1;
                                var _lineY2=_lineObj.y2;

                                _textObj.set({text:(""+tmpText)});

                                if (_sTextLen > _nTextLen){

                                    //计算新的分组宽度
                                    var newGroupWidth=_len * _nTextLen;

                                    var offsetX1=-0.2 * _textObj.fontSize;
                                    var offsetX2=0.1 * _textObj.fontSize;

                                    //var offsetX1=(0.1 * res.w<3)?-3:-0.1 * newGroupWidth;
                                    //var offsetX2=(0.1 * res.w<3)?3:0.1 * newGroupWidth;

                                    newGroupWidth=newGroupWidth + Math.abs(offsetX1) + offsetX2;
                            
                                    _lineObj.set({x1:0,x2:2});
                                    _textObj.set({x1:(theObj.item(j).width/2*-1)});
                                    theObj.item(j).set({width:newGroupWidth,left:_sourceLeft});
                     
                                    var _x1=newGroupWidth/2*-1;
                                    var _x2=newGroupWidth/2;
                                    _lineObj.set({x1:_x1,x2:_x2});
                                    _textObj.set({left:(_x1 - offsetX1)});
                                                                            
                                    theObj.item(j).set({left:_sourceLeft,top:_sourceTop,width:(_x2 - _x1)});
                                    theObj._objects[j].left=_sourceLeft;
                                    theObj._objects[j].top=_sourceTop;
                                    theObj.item(j).setCoords();


                                }else if (_sTextLen < _nTextLen){

                                    //计算新的分组宽度
                                    var newGroupWidth=_len * _nTextLen;

                                    var offsetX1=-0.2 * _textObj.fontSize;
                                    var offsetX2=0.1 * _textObj.fontSize;

                                    //var offsetX1=(0.1 * res.w<3)?-3:-0.1 * newGroupWidth;
                                    //var offsetX2=(0.1 * res.w<3)?3:0.1 * newGroupWidth;


                                    newGroupWidth=newGroupWidth + Math.abs(offsetX1) + offsetX2;
                                    _lineObj.set({x1:0,x2:2});
                                    _textObj.set({x1:(theObj.item(j).width/2*-1)});
                                    theObj.item(j).set({width:newGroupWidth,left:_sourceLeft});
                   
                                    var _x1=newGroupWidth/2*-1;
                                    var _x2=newGroupWidth/2;
                                    _lineObj.set({x1:_x1,x2:_x2});
                                    _textObj.set({left:(_x1 - offsetX1)});

                                    theObj.item(j).set({left:_sourceLeft,top:_sourceTop});
                                    theObj.item(j).setCoords();

                                }

                            }else{
                                theObj.item(j)._objects[_textIndex].set({text:""});
                                theObj.item(j).set({visible:false});
                            }

                        break;
                    }
                    
                    theObj.item(j).set({zIndex:theObj.item(j).zIndex});
                    _parent.updateListProduct(theObj,viewObject,objIndex+1,callback);
                }


            }else{
             
                theObj.addWithUpdate();
                theObj.setCoords();
                canvas.renderAll(); 
                self.switchPage=true;
                (callback && typeof(callback) === "function") && callback(theObj);                
            }


        }
        
        
        //处理商品组件中的商品标签编组时，数据更新处理
        this.updateProductGroupLabel=function (subGroup,productDetails,callback=null){
            
            if (subGroup.hasOwnProperty("_objects")){
                
                for (var l=0;l<subGroup._objects.length;l++){
                    
                    if (subGroup._objects[l].hasOwnProperty("_objects")==false){
                    
                        if (subGroup._objects[l].hasOwnProperty("dType") && subGroup._objects[l].hasOwnProperty("dataFiled")){
                            
                            if (subGroup._objects[l].dType=="productNormalText"){
                                //商品标签文本
                                var dataFiled=subGroup._objects[l].dataFiled;
                                if (dataFiled.substr(0,3)=="lk_"){
                                    //关联商品标签
                                    if (subGroup._objects[l].hasOwnProperty("lkSort")){
                                        if (subGroup._objects[l].lkSort!='' && subGroup._objects[l].lkSort*1>=1){
                                            if (isEmpty(productDetails.linkItems)==false){
                                                if (productDetails.linkItems[0].hasOwnProperty("lk_namethai")){
                                                    var _lkSort=subGroup._objects[l].lkSort*1 -1;
                                                    var tmpText="";
                                                    for (var k in productDetails.linkItems[_lkSort]){
                                                        if (k.toLowerCase()==dataFiled.toLowerCase()){
    
                                                            if (subGroup._objects[l].hasOwnProperty("insertText")){
                                                                insertText=subGroup._objects[l].insertText;
                                                                insertText=(isEmpty(insertText)==false)?insertText:"";
                                                            }else{
                                                                insertText="";
                                                            }
    
                                                            tmpText=insertText+productDetails.linkItems[_lkSort][k];
                                                            break;
                                                        }
                                                    }
                                                    if (isEmpty(tmpText)==false){
                                                        
                                                        var _sourceText=deleteSpace(subGroup._objects[l].text);
                                                        var _newText=deleteSpace(tmpText);
                                                        if (_sourceText!=_newText){
                                                            subGroup._objects[l].set({text:tmpText});
                                                        }
                                                        
                                                    }else{
                                                        subGroup._objects[l].set({text:"",visible:false});
                                                    }
                                                }else{
                                                    subGroup._objects[l].set({text:"",visible:false});
                                                }
                                                
                                                canvas.requestRenderAll();
                                            }else{
                                                subGroup._objects[l].set({text:"",visible:false});
                                                canvas.requestRenderAll();
                                            }
                                        }
                                    }
                                } else if (productDetails.hasOwnProperty(subGroup._objects[l].dataFiled)){
                                    
                       
                                        //正常标签
                                        var updateText=productDetails[subGroup._objects[l].dataFiled];
                                        var insertText="";
                                        if (subGroup._objects[l].hasOwnProperty("insertText")){
                                            insertText=subGroup._objects[l].insertText;
                                            insertText=(isEmpty(insertText)==false)?insertText + "":"";
                                        }else{
                                            insertText="";
                                        }
                                        
                                        if (isEmpty(updateText)){
                                            updateText="";
                                            subGroup._objects[l].set({text:"",visible:false});
                                        }else{
                                            updateText=insertText  + updateText.toString();
                                            var _sourceText=deleteSpace(subGroup._objects[l].text);
                                            var _newText=deleteSpace(updateText);
                                            if (_sourceText!=_newText){
                                                subGroup._objects[l].set({text:updateText});
                                            }
                                            
                                        }
                                        
                                        canvas.requestRenderAll();
                                    
                                }
                                
                                
                            }
                            
                        }
                    }else{
                       
                        if (subGroup._objects[l].dType=="productPriceGroup2" && subGroup._objects[l].dataFiled=="normalprice"){
                            //商品划线价
                            var updateText=productDetails[subGroup._objects[l].dataFiled];
                            if (isEmpty(updateText)){
                                updateText="";
                            }else{
                                updateText=updateText.toString();
                            }
                            console.log("sourceWidth=>" + subGroup._objects[l]._objects[0].width);
                            subGroup._objects[l]._objects[0].set({text:updateText,textLines:[updateText]});
                            subGroup._objects[l].addWithUpdate();
                            subGroup._objects[l].setCoords();
                            console.log("newWidth=>" + subGroup._objects[l]._objects[0].width);
                            var newWidth=subGroup._objects[l]._objects[0].width * subGroup._objects[l]._objects[0].scaleX;

                            subGroup._objects[l]._objects[1].x2=subGroup._objects[l]._objects[1].x1 + newWidth + (subGroup._objects[l]._objects[0].left - subGroup._objects[l]._objects[1].x1)*2;
                            subGroup._objects[l]._objects[1].x2=-1 * subGroup._objects[l]._objects[1].x1;
                            // subGroup._objects[l]._objects[1].width=newWidth + subGroup._objects[l]._objects[1].strokeWidth;
                            subGroup._objects[l]._objects[1].width=newWidth + subGroup._objects[l]._objects[1].strokeWidth;
                            subGroup._objects[l]._objects[1].strokeWidth=subGroup._objects[l]._objects[1].strokeWidth * subGroup._objects[l]._objects[1].scaleX;
                            console.log("x2=>" + subGroup._objects[l]._objects[1].x2);
                            subGroup._objects[l]._objects[1].scaleX=1;
                            subGroup._objects[l]._objects[1].scaleY=1;

                            subGroup._objects[l].addWithUpdate();
                            subGroup._objects[l].setCoords();
                        }else if (subGroup._objects[l].dType=="productPriceGroup1" && subGroup._objects[l].dataFiled=="normalprice"){//商品划线价
                            var updateText=productDetails[subGroup._objects[l].dataFiled];
                            if (isEmpty(updateText)){
                                updateText="";
                            }else{
                                updateText=updateText.toString();
                            }
                            subGroup._objects[l]._objects[0].set({text:updateText,textLines:[updateText]});
                            subGroup._objects[l].addWithUpdate();
                            subGroup._objects[l].setCoords();
                            
                        }else if (subGroup._objects[l].dType=="productPriceGroup" && subGroup._objects[l].dataFiled=="normalprice"){

                            //商品划线价
                            var updateText=productDetails[subGroup._objects[l].dataFiled];
                            if (isEmpty(updateText)){
                                updateText="";
                            }else{
                                updateText=updateText.toString();
                            }
                            
                            var _textObj=subGroup._objects[l]._objects[0];
                            var _lineObj=subGroup._objects[l]._objects[1];
                            // console.log(_textObj.left,_lineObj.left,_lineObj.x1);
                            
                            if (isEmpty(_textObj.top)){
                                _textObj.top=-1 * _textObj.height * _textObj.scaleY /2;
                            }
                            
                            var _sourceTextWidth=_textObj.width;// * _textObj.scaleX;
                            var _sourceTextLength=_textObj.text.length;
                            var _txtWidth=_sourceTextWidth/_sourceTextLength;
                            
                            var _newTxtLength=updateText.length;
                            var _newWidth=_txtWidth * _newTxtLength;
                            var _preLineWidth=Math.abs(_lineObj.left) - Math.abs(_textObj.left);
                            
                            console.log("_sourceTextWidth= " , _sourceTextWidth);
                            console.log("_sourceTextLength= " , _sourceTextLength);
                            console.log("_txtWidth= " , _txtWidth);
                            console.log("_newTxtLength= " , _newTxtLength);
                            console.log("_newWidth= " , _newWidth);
                            console.log("_deffWidth= " , (_newTxtLength - _sourceTextLength) * _txtWidth);
                            
                            subGroup._objects[l]._objects[0].set({text:updateText,textLines:[updateText]});
                            
                            var _lineObj_y1=_lineObj.y1;
                            var _lineObj_y2=_lineObj.y2;
                            var _strokeWidth=subGroup._objects[l]._objects[1].strokeWidth;
                            _lineObj.x1=0;
                            _lineObj.x2=0;
                            _lineObj.width=1;
                            subGroup._objects[l].addWithUpdate();
                            subGroup._objects[l].setCoords();
                            
                            var _groupScaleX=subGroup._objects[l].scaleX;
                            var _groupWidth=subGroup._objects[l].width;
                            subGroup._objects[l]._objects[1].x1=-1 * _groupWidth/2;
                            subGroup._objects[l]._objects[1].x2=_groupWidth/2;
                            subGroup._objects[l]._objects[1].width=_groupWidth;
                            subGroup._objects[l]._objects[1].strokeWidth=_strokeWidth * subGroup._objects[l]._objects[1].scaleX;
                            subGroup._objects[l]._objects[1].scaleX=1;
                            subGroup._objects[l]._objects[1].scaleY=1;
                            subGroup._objects[l].addWithUpdate();
                            
                            var deffLeft=Math.abs(subGroup._objects[l]._objects[1].x1) -  Math.abs(subGroup._objects[l]._objects[1].left);
                            subGroup._objects[l]._objects[1].x2=subGroup._objects[l]._objects[1].x2 + deffLeft + _strokeWidth;
                            subGroup._objects[l]._objects[1].width=subGroup._objects[l]._objects[1].width  + deffLeft + _strokeWidth;
                            subGroup._objects[l].addWithUpdate();
                            subGroup._objects[l].setCoords();
                            
                            
                            
                        }else if (subGroup._objects[l].dType=="productPicture"){
                            //商品图片组件
                            
                            subGroup._objects[l]._objects[0].visible=true;
                            subGroup._objects[l]._objects[1].visible=false;
                            subGroup._objects[l]._objects[2].visible=false;
                            if (subGroup._objects[l]._objects[3]){
                                subGroup._objects[l]._objects[3].visible=false;
                            }

                            if (subGroup._objects[l]._objects[0].hasOwnProperty("customSetPic")){
                                if (subGroup._objects[l]._objects[0].customSetPic==true){
                                    continue;
                                }
                            }
                        
                            var img = new Image();
                            img.setAttribute('crossOrigin', 'anonymous');
                            
                            var _group=subGroup._objects[l];
                            
                            //图片组件中的Image元件
                            var _img=subGroup._objects[l]._objects[0];
                            
                            //在这识别是商品主图、Icon、Brand
                            var newImgSrc=null;
                            var cmykSrc=null;
                            var picid=null;
                            var newParm=null;
               
                            if (isEmpty(subGroup.item(l).dataFiled)){
                                console.log(l,subGroup.item(l));
                            }
                            switch (subGroup.item(l).dataFiled)
                            {
                                case "goodsImage":
                                    newImgSrc=productDetails.goodsImage.rgbOriginPath;
                                    cmykSrc=productDetails.goodsImage.cmykOriginPath;
                                    var itemcode=productDetails.goodsImage.itemcode;
                                    newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                    
                                   
                                break;
                                case "brand":
                                    if (productDetails.brand!=null){
                                        newImgSrc=productDetails.brand.rgbOriginPath;
                                        cmykSrc=productDetails.brand.cmykOriginPath;
                                        picid=productDetails.brand.picid;
                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                    }
                                break;
                                case "gift":
                                    newImgSrc=productDetails.gift.rgbOriginPath;
                                    cmykSrc=productDetails.gift.cmykOriginPath;
                                    var itemcode=productDetails.gift.itemcode;
                                    newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                break;
                                case "icon1":
                                    if (productDetails.icons[0]!=null){
                                        newImgSrc=productDetails.icons[0].rgbOriginPath;
                                        cmykSrc=productDetails.icons[0].cmykOriginPath;
                                        picid=productDetails.icons[0].picid;
                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                    }
                                break;
                                case "icon2":
                                    
                                        if (productDetails.icons[1]!=null){
                                            newImgSrc=productDetails.icons[1].rgbOriginPath;
                                            cmykSrc=productDetails.icons[1].cmykOriginPath;
                                            picid=productDetails.icons[1].picid;
                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                        }
                                break;
                                case "icon3":
                                    
                                        if (productDetails.icons[2]!=null){
                                            newImgSrc=productDetails.icons[2].rgbOriginPath;
                                            cmykSrc=productDetails.icons[2].cmykOriginPath;
                                            picid=productDetails.icons[2].picid;
                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                        }
                                break;
                                case "lk_goodsImage":
                                    if (subGroup.item(l).hasOwnProperty("lkSort")){
                                        if (subGroup.item(l).lkSort!='' && subGroup.item(l).lkSort*1>=1){
                                            if (isEmpty(productDetails.linkItems)==false){
                                                var _lkSort=subGroup.item(l).lkSort*1 -1;
                                                if (isEmpty(productDetails.linkItems[_lkSort])==false){
                                                    if (productDetails.linkItems[_lkSort].hasOwnProperty("rgbOriginPath") && productDetails.linkItems[_lkSort].hasOwnProperty("cmykOriginPath")){
                                                        newImgSrc=productDetails.linkItems[_lkSort].rgbOriginPath;
                                                        cmykSrc=productDetails.linkItems[_lkSort].cmykOriginPath;
                                                        var itemcode=productDetails.linkItems[_lkSort].itemcode;
                                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode}; 
                                                    }                                              
                                                }
                                            }
                                        }
                                    }

                                
                                break;
                            }
                            
                            if (newParm!=null){
                                if (newParm.src!=_img.src && !isEmpty(newParm.src)){
                                    console.log("update Image src= " + newParm.src);
                                    self.drawing=true;
                                    _parent.setProductPicture(newParm,l,_img,function(newImg,objectSort){
                                    
                                        if (newImg.width>newImg.height){
                                            var _pi=subGroup._objects[objectSort].width/newImg.width;
                                        }else{
                                            var _pi=subGroup._objects[objectSort].height/newImg.height;
                                        }
                                        newImg.scale(_pi);
                                        newImg.scaleX=_pi;
                                        newImg.scaleY=_pi;
                                    
                                        var picBoxHeight=subGroup._objects[objectSort].height ;
                                        var newImgBoxHeight=newImg.height * _pi;
                                        
                                        if (picBoxHeight>newImgBoxHeight){
                                            newImg.left=-1 * subGroup._objects[objectSort].width/2;
                                            newImg.top=-1 * subGroup._objects[objectSort].height/2 + (picBoxHeight-newImgBoxHeight)/2;
                                            
                                        }else{
                                        
                                            newImg.left=0 - subGroup._objects[objectSort].width/2;
                                            newImg.top=0 - subGroup._objects[objectSort].height/2;
                                            
                                        }
                                        
                                        subGroup._objects[objectSort]._objects[0]=newImg;
                                        subGroup.item(objectSort).item(0).set({src:newImg.src});

                                        subGroup._objects[objectSort]._objects[0].visible=true;
                                        subGroup._objects[objectSort]._objects[1].visible=false;
                                        subGroup._objects[objectSort]._objects[2].visible=false;
                                        if (subGroup._objects[objectSort]._objects[3]){
                                            subGroup._objects[objectSort]._objects[3].visible=false;
                                        }
                                        //2021-12-18
                                        subGroup._objects[objectSort]._objects[1].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});
                                        subGroup._objects[objectSort]._objects[2].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});  
                                        
                                        if (subGroup._objects[objectSort]._objects[3]){
                                            subGroup._objects[objectSort]._objects[3].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});     
                                        }
                                        
                                        subGroup._objects[objectSort].addWithUpdate();
                                        subGroup._objects[objectSort].setCoords();
                                        canvas.requestRenderAll(); 
                                        console.log("update product Image OK " + objectSort);
                                        
                                    });
                                }
                                
                            }else{
                        
                                var data={};
                                data.left=subGroup._objects[l]._objects[1].left;
                                data.top=subGroup._objects[l]._objects[1].top
                                data.width=subGroup._objects[l]._objects[1].width;
                                data.height=subGroup._objects[l]._objects[1].height;
                                data.type="rect";
                                data.fill="#ffffff",
                                data.opacity=1;
                                data.stroke='#999999';
                                data.strokeWidth=1;
                                data.scaleX=subGroup._objects[l]._objects[1].scaleX;
                                data.scaleY=subGroup._objects[l]._objects[1].scaleY;
                                data.visible=false;
                                
                                var rect = new fabric.Rect(data);


                                //测试如果该商品没有对应的图片，显示标签图框
                                subGroup._objects[l]._objects[0]=rect;
                                subGroup._objects[l]._objects[1].visible=false;
                                subGroup._objects[l]._objects[2].visible=false;
                                if (subGroup._objects[l]._objects[3]){
                                    subGroup._objects[l]._objects[3].visible=false;
                                }
                                subGroup.addWithUpdate();
                                subGroup.setCoords();
                                canvas.renderAll(); 
                                console.log("update image err");
                            }
                            
        
                        }else{
                            subGroup._objects[l]=_parent.updateProductGroupLabel(subGroup._objects[l],productDetails,callback);
                        }
                        
                    }
                }
               
                (callback && typeof(callback) === "function") && callback(subGroup);
                return subGroup;
                
            }
        }
        
        //替换指定商品组件内容
        this.updateProduct=function(theObj,viewObject,callback=null){
           
                var preImg={};
                var _pictureIndex=-1;
                //theObj.dSort=viewObject.sort;
                theObj.set("productData",viewObject);
                theObj.set("itemCode",viewObject.itemcode);
                
                var _isPreView=false;
                
                for (var i=0;i<theObj._objects.length;i++){
                    if (theObj._objects[i].dType=="productPicture"){
                       _isPreView=true; 
                    }
                }
            
                //商品图片框
                if (_isPreView==false){
                    //目前数据结构算法基本不走 本_isPreView==false 流程，但保留处理环节，可能遇到特殊场景使用
                    for (var i=0;i<theObj._objects.length;i++){
                        
                        if (theObj._objects[i].dType=="productPicture"){
                            
                            _pictureIndex=i;
                            if (theObj.item(i).visible==true){
                               
                                preImg.width=theObj.item(_pictureIndex).width;
                                preImg.height=theObj.item(_pictureIndex).height;
                                preImg.top=theObj.item(_pictureIndex).top;
                                preImg.left=theObj.item(_pictureIndex).left;
                                preImg.scaleX=theObj.item(_pictureIndex).scaleX;
                                preImg.scaleY=theObj.item(_pictureIndex).scaleY;
                                preImg.zIndex=theObj.item(_pictureIndex).zIndex;
                                preImg.angle=theObj.item(_pictureIndex).angle;
                
                                theObj.item(_pictureIndex).visible=false;
                                theObj.dSort=viewObject.sort;// * 1;
                                var reactW=preImg.width * preImg.scaleX * theObj.scaleX;
                                var reactH=preImg.height * preImg.scaleY * theObj.scaleY;
                                var reactL=reactW * -0.5 + preImg.left;
                                reactL=preImg.left *theObj.scaleX;
                                var reactT=reactH * -0.5;
                                var reactZindex=preImg.zIndex;
                                
                                //商品图片
                                var pic=viewObject.goodsImage.rgbOriginPath;
                                var cmykPic=viewObject.goodsImage.cmykOriginPath;
                                var picid=viewObject.goodsImage.picid;
                                self.componentDraw().setPicture({src:pic,cmykPic:cmykPic,picid:picid},function(){
                                    
                                })
                                
                                theObj.addWithUpdate();
                                theObj.setCoords();
                                canvas.renderAll();
                            }
                        }
                    }
                }else{
                    //商品预览图
                        for (var i=0;i<theObj._objects.length;i++){
                            
                            if (theObj.item(i).dType=="productPicture"){
                                
                                theObj._objects[i]._objects[0].visible=true;
                                theObj._objects[i]._objects[1].visible=false;
                                theObj._objects[i]._objects[2].visible=false;
                                if (theObj._objects[i]._objects[3]){
                                    theObj._objects[i]._objects[3].visible=false;
                                }

                                if (theObj._objects[i]._objects[0].hasOwnProperty("customSetPic")){
                                    if (theObj._objects[i]._objects[0].customSetPic==true){
                                        continue;
                                    }
                                }
                            
                                var img = new Image();
                                img.setAttribute('crossOrigin', 'anonymous');
                                
                                var _group=theObj._objects[i];
                                
                                //图片组件中的Image元件
                                var _img=theObj._objects[i]._objects[0];
                                
                                //在这识别是商品主图、Icon、Brand
                                var newImgSrc=null;
                                var cmykSrc=null;
                                var picid=null;
                                var newParm=null;
                               
                                switch (theObj.item(i).dataFiled)
                                {
                                    case "goodsImage":
                                        newImgSrc=viewObject.goodsImage.rgbOriginPath;
                                        cmykSrc=viewObject.goodsImage.cmykOriginPath;
                                        var itemcode=viewObject.goodsImage.itemcode;
                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                  
                                    break;
                                    case "brand":
                                        if (viewObject.brand!=null){
                                            newImgSrc=viewObject.brand.rgbOriginPath;
                                            cmykSrc=viewObject.brand.cmykOriginPath;
                                            picid=viewObject.brand.picid;
                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                        }
                                    break;
                                    case "gift":
                                        newImgSrc=viewObject.gift.rgbOriginPath;
                                        cmykSrc=viewObject.gift.cmykOriginPath;
                                        var itemcode=viewObject.gift.itemcode;
                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                    break;
                                    case "icon1":
                                        if (viewObject.icons[0]!=null){
                                            newImgSrc=viewObject.icons[0].rgbOriginPath;
                                            cmykSrc=viewObject.icons[0].cmykOriginPath;
                                            picid=viewObject.icons[0].picid;
                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                        }
                                    break;
                                    case "icon2":
                                        
                                            if (viewObject.icons[1]!=null){
                                                newImgSrc=viewObject.icons[1].rgbOriginPath;
                                                cmykSrc=viewObject.icons[1].cmykOriginPath;
                                                picid=viewObject.icons[1].picid;
                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                            }
                                    break;
                                    case "icon3":
                                        
                                            if (viewObject.icons[2]!=null){
                                                newImgSrc=viewObject.icons[2].rgbOriginPath;
                                                cmykSrc=viewObject.icons[2].cmykOriginPath;
                                                picid=viewObject.icons[2].picid;
                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                            }
                                    break;
                                    case "lk_goodsImage":
                                        if (theObj.item(i).hasOwnProperty("lkSort")){
                                            if (theObj.item(i).lkSort!='' && theObj.item(i).lkSort*1>=1){
                                                if (isEmpty(viewObject.linkItems)==false){
                                                    var _lkSort=theObj.item(i).lkSort*1 -1;
                                                    if (isEmpty(viewObject.linkItems[_lkSort])==false){
                                                        if (viewObject.linkItems[_lkSort].hasOwnProperty("rgbOriginPath") && viewObject.linkItems[_lkSort].hasOwnProperty("cmykOriginPath")){
                                                            newImgSrc=viewObject.linkItems[_lkSort].rgbOriginPath;
                                                            cmykSrc=viewObject.linkItems[_lkSort].cmykOriginPath;
                                                            var itemcode=viewObject.linkItems[_lkSort].itemcode;
                                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode}; 
                                                        }                                              
                                                    }
                                                }
                                            }
                                        }

                                    
                                    break;
                                }
                                
                                if (newParm!=null){
                                    if (newParm.src!=_img.src && !isEmpty(newParm.src)){
                                     
                                        self.drawing=true;
                                        _parent.setProductPicture(newParm,i,_img,function(newImg,objectSort){
                                        
                                            if (newImg.width>newImg.height){
                                                var _pi=theObj._objects[objectSort].width/newImg.width;
                                            }else{
                                                var _pi=theObj._objects[objectSort].height/newImg.height;
                                            }
                                            newImg.scale(_pi);
                                            newImg.scaleX=_pi;
                                            newImg.scaleY=_pi;
                                        
                                            var picBoxHeight=theObj._objects[objectSort].height ;
                                            var newImgBoxHeight=newImg.height * _pi;
                                            
                                            if (picBoxHeight>newImgBoxHeight){
                                                newImg.left=-1 * theObj._objects[objectSort].width/2;
                                                newImg.top=-1 * theObj._objects[objectSort].height/2 + (picBoxHeight-newImgBoxHeight)/2;
                                                
                                            }else{
                                            
                                                newImg.left=0 - theObj._objects[objectSort].width/2;
                                                newImg.top=0 - theObj._objects[objectSort].height/2;
                                                
                                            }
                                            
                                            theObj._objects[objectSort]._objects[0]=newImg;
                                            theObj.item(objectSort).item(0).set({src:newImg.src});

                                            theObj._objects[objectSort]._objects[0].visible=true;
                                            theObj._objects[objectSort]._objects[1].visible=false;
                                            theObj._objects[objectSort]._objects[2].visible=false;
                                            if (theObj._objects[objectSort]._objects[3]){
                                                theObj._objects[objectSort]._objects[3].visible=false;
                                            }
                                            //2021-12-18
                                            theObj._objects[objectSort]._objects[1].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});
                                            theObj._objects[objectSort]._objects[2].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});  
                                            
                                            if (theObj._objects[objectSort]._objects[3]){
                                                theObj._objects[objectSort]._objects[3].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});     
                                            }
                                            
                                            theObj.addWithUpdate();
                                            theObj.setCoords();
                                            canvas.renderAll(); 

                                            
                                        });
                                    }
                                    
                                }else{
                            
                                    var data={};
                                    data.left=theObj._objects[i]._objects[1].left;
                                    data.top=theObj._objects[i]._objects[1].top
                                    data.width=theObj._objects[i]._objects[1].width;
                                    data.height=theObj._objects[i]._objects[1].height;
                                    data.type="rect";
                                    data.fill="#ffffff",
                                    data.opacity=1;
                                    data.stroke='#999999';
                                    data.strokeWidth=1;
                                    data.scaleX=theObj._objects[i]._objects[1].scaleX;
                                    data.scaleY=theObj._objects[i]._objects[1].scaleY;
                                    data.visible=false;
                                    
                                    var rect = new fabric.Rect(data);


                                    //测试如果该商品没有对应的图片，显示标签图框
                                    theObj._objects[i]._objects[0]=rect;
                                    theObj._objects[i]._objects[1].visible=false;
                                    theObj._objects[i]._objects[2].visible=false;
                                    if (theObj._objects[i]._objects[3]){
                                        theObj._objects[i]._objects[3].visible=false;
                                    }
                                    theObj.addWithUpdate();
                                    theObj.setCoords();
                                    canvas.renderAll(); 
                                    
                                }
                            
                        }
                    
                    }
                }
    
                //商品其他信息处理
                var isUpdateInfo=false;
                if (theObj.hasOwnProperty("textInfogmtCreate")==false){   
                    theObj.set("textInfogmtCreate",viewObject.gmtCreate);
                    //设置商品最后一次更新资料时间
                    isUpdateInfo=true;
                }else if (theObj.hasOwnProperty("textInfogmtCreate") && theObj.textInfogmtCreate!=viewObject.gmtCreate){
                    theObj.set("textInfogmtCreate",viewObject.gmtCreate);
                    //更新商品最后一次更新资料时间
                    isUpdateInfo=true;
                }

                if(isUpdateInfo==true){
                   
                    self.drawing=true;
                    for (var j=0;j<theObj._objects.length;j++){
                        
                        switch (theObj._objects[j].dType)
                        {
                            //处理商品组件中的商品标签编组时，数据更新处理
                            case "tmpGroup":
                              
                               
                                theObj._objects[j]=_parent.updateProductGroupLabel(theObj._objects[j],viewObject);
                                
                                
                            break;
                            case "productNormalText":
                            case "productLineationText":
                                
                                var tmpText=null;
                                var dataFiled=theObj._objects[j].dataFiled;

                                if(!isEmpty(dataFiled)){    
                                    var insertText="";
                                    tmpText="";

                                    if (dataFiled.substr(0,3)=="lk_"){
                                        if (theObj._objects[j].hasOwnProperty("lkSort")){
                                
                                            if (theObj._objects[j].lkSort!='' && theObj._objects[j].lkSort*1>=1){
                                                if (isEmpty(viewObject.linkItems)==false){
                                                    var _lkSort=theObj._objects[j].lkSort*1 -1;
                                                    for (var k in viewObject.linkItems[_lkSort]){
                                                        if (k.toLowerCase()==dataFiled.toLowerCase()){

                                                            if (theObj._objects[j].hasOwnProperty("insertText")){
                                                                insertText=theObj._objects[j].insertText;
                                                                insertText=(isEmpty(insertText)==false)?insertText:"";
                                                            }else{
                                                                insertText="";
                                                            }

                                                            tmpText=insertText+viewObject.linkItems[_lkSort][k];
                                                            break;
                                                        }
                                                    }

                                                }
                                            }
                                        }


                                    }else{
                                        for (var k in viewObject){
                                            if (k.toLowerCase()==dataFiled.toLowerCase()){

                                                if (theObj._objects[j].hasOwnProperty("insertText")){
                                                    insertText=theObj._objects[j].insertText;
                                                    insertText=(isEmpty(insertText)==false)?insertText:"";
                                                }else{
                                                    insertText="";
                                                }

                                                tmpText=insertText+viewObject[k];
                                                break;
                                            }
                                        }
                                    }

                               
                                    if (!isEmpty(tmpText) && tmpText!="null"){
                                        theObj.item(j).set({text:(""+tmpText),visible:true});
                                    }else{
                                        theObj.item(j).set({text:"",visible:false});
                                    }
                                }
                            break;
                            case "productPriceGroup":
                                var tmpText=null;
                                var dataFiled=theObj._objects[j].dataFiled;
                                var insertText="";
                                tmpText="";

                                if(!isEmpty(dataFiled)){ 

                                    if (dataFiled.substr(0,3)=="lk_"){
                                        if (theObj._objects[j].hasOwnProperty("lkSort")){
                                
                                            if (theObj._objects[j].lkSort!='' && theObj._objects[j].lkSort*1>=1){
                                                if (isEmpty(viewObject.linkItems)==false){
                                                    var _lkSort=theObj._objects[j].lkSort*1 -1;
                                                    for (var k in viewObject.linkItems[_lkSort]){
                                                        if (k.toLowerCase()==dataFiled.toLowerCase()){

                                                            if (theObj._objects[j].hasOwnProperty("insertText")){
                                                                insertText=theObj._objects[j].insertText;
                                                                insertText=(isEmpty(insertText)==false)?insertText:"";
                                                            }else{
                                                                insertText="";
                                                            }

                                                            tmpText=insertText+viewObject.linkItems[_lkSort][k];
                                                            break;
                                                        }
                                                    }

                                                }
                                            }
                                        }


                                    }else{
                                        for (var k in viewObject){
                                            if (k.toLowerCase()==dataFiled.toLowerCase()){

                                                if (theObj._objects[j].hasOwnProperty("insertText")){
                                                    insertText=theObj._objects[j].insertText;
                                                    insertText=(isEmpty(insertText)==false)?insertText:"";
                                                }else{
                                                    insertText="";
                                                }

                                                tmpText=insertText+viewObject[k];
                                                break;
                                            }
                                        }
                                    }

                                    //处理划线价
                                    if (theObj.item(j)._objects[0].type=="i-text"){
                                        var _textObj=theObj.item(j)._objects[0];
                                        var _lineObj=theObj.item(j)._objects[1]; 
                                        var _textIndex=0,_lineIndex=1;
                                    }else{
                                        var _textObj=theObj.item(j)._objects[1];
                                        var _lineObj=theObj.item(j)._objects[0];
                                        var _textIndex=1,_lineIndex=0;
                                    }


                                    if (tmpText!=null && tmpText!="null"){

                                        theObj.item(j).set({visible:true});

                                        var sourceText=_textObj.text;
                                        var isPoint=sourceText.indexOf(".");

                                        var _sTextLen=sourceText.length;
                                        var _nTextLen=tmpText.length;
                                        var _len=_textObj.width/_sTextLen;

                                        var _sourceLeft=theObj.item(j).left;
                                        var _sourceTop=theObj.item(j).top;

                                        var _lineY1=_lineObj.y1;
                                        var _lineY2=_lineObj.y2;

                                        _textObj.set({text:(""+tmpText)});

                                        if (_sTextLen > _nTextLen){

                                            //计算新的分组宽度
                                            var newGroupWidth=_len * _nTextLen;

                                            var offsetX1=-0.2 * _textObj.fontSize;
                                            var offsetX2=0.1 * _textObj.fontSize;

                                            //var offsetX1=(0.1 * res.w<3)?-3:-0.1 * newGroupWidth;
                                            //var offsetX2=(0.1 * res.w<3)?3:0.1 * newGroupWidth;

                                            newGroupWidth=newGroupWidth + Math.abs(offsetX1) + offsetX2;
                                    
                                            _lineObj.set({x1:0,x2:2});
                                            _textObj.set({x1:(theObj.item(j).width/2*-1)});
                                            theObj.item(j).set({width:newGroupWidth,left:_sourceLeft});
                             
                                            var _x1=newGroupWidth/2*-1;
                                            var _x2=newGroupWidth/2;
                                            _lineObj.set({x1:_x1,x2:_x2});
                                            _textObj.set({left:(_x1 - offsetX1)});
                                                                                    
                                            theObj.item(j).set({left:_sourceLeft,top:_sourceTop,width:(_x2 - _x1)});
                                            theObj._objects[j].left=_sourceLeft;
                                            theObj._objects[j].top=_sourceTop;
                                            theObj.item(j).setCoords();


                                        }else if (_sTextLen < _nTextLen){

                                            //计算新的分组宽度
                                            var newGroupWidth=_len * _nTextLen;

                                            var offsetX1=-0.2 * _textObj.fontSize;
                                            var offsetX2=0.1 * _textObj.fontSize;

                                            //var offsetX1=(0.1 * res.w<3)?-3:-0.1 * newGroupWidth;
                                            //var offsetX2=(0.1 * res.w<3)?3:0.1 * newGroupWidth;


                                            newGroupWidth=newGroupWidth + Math.abs(offsetX1) + offsetX2;
                                            _lineObj.set({x1:0,x2:2});
                                            _textObj.set({x1:(theObj.item(j).width/2*-1)});
                                            theObj.item(j).set({width:newGroupWidth,left:_sourceLeft});
                           
                                            var _x1=newGroupWidth/2*-1;
                                            var _x2=newGroupWidth/2;
                                            _lineObj.set({x1:_x1,x2:_x2});
                                            _textObj.set({left:(_x1 - offsetX1)});

                                            theObj.item(j).set({left:_sourceLeft,top:_sourceTop});
                                            theObj.item(j).setCoords();

                                        }

                                    }else{
                                        theObj.item(j)._objects[_textIndex].set({text:""});
                                        theObj.item(j).set({visible:false});
                                    }
                                }

                            break;
                        }
                        
                        theObj.item(j).set({zIndex:theObj.item(j).zIndex});
                    }
                    
                    (callback && typeof(callback) === "function") && callback(theObj);
                    
                }
        }
        
        this.updateProduct_bak_20230428=function(theObj,viewObject,callback=null){
           
                var preImg={};
                var _pictureIndex=-1;
                //theObj.dSort=viewObject.sort;
                theObj.set("productData",viewObject);
                theObj.set("itemCode",viewObject.itemcode);
                
                var _isPreView=false;
                
                for (var i=0;i<theObj._objects.length;i++){
                    if (theObj._objects[i].dType=="productPicture"){
                       _isPreView=true; 
                    }
                }
            
                //商品图片框
                if (_isPreView==false){
                    //目前数据结构算法基本不走 本_isPreView==false 流程，但保留处理环节，可能遇到特殊场景使用
                    for (var i=0;i<theObj._objects.length;i++){
                        
                        if (theObj._objects[i].dType=="productPicture"){
                            _pictureIndex=i;
                            if (theObj.item(i).visible==true){
                               
                                preImg.width=theObj.item(_pictureIndex).width;
                                preImg.height=theObj.item(_pictureIndex).height;
                                preImg.top=theObj.item(_pictureIndex).top;
                                preImg.left=theObj.item(_pictureIndex).left;
                                preImg.scaleX=theObj.item(_pictureIndex).scaleX;
                                preImg.scaleY=theObj.item(_pictureIndex).scaleY;
                                preImg.zIndex=theObj.item(_pictureIndex).zIndex;
                                preImg.angle=theObj.item(_pictureIndex).angle;
                
                                theObj.item(_pictureIndex).visible=false;
                                theObj.dSort=viewObject.sort;// * 1;
                                var reactW=preImg.width * preImg.scaleX * theObj.scaleX;
                                var reactH=preImg.height * preImg.scaleY * theObj.scaleY;
                                var reactL=reactW * -0.5 + preImg.left;
                                reactL=preImg.left *theObj.scaleX;
                                var reactT=reactH * -0.5;
                                var reactZindex=preImg.zIndex;
                                
                                //商品图片
                                var pic=viewObject.goodsImage.rgbOriginPath;
                                var cmykPic=viewObject.goodsImage.cmykOriginPath;
                                var picid=viewObject.goodsImage.picid;
                                self.componentDraw().setPicture({src:pic,cmykPic:cmykPic,picid:picid},function(){
                                    
                                })
                                
                                theObj.addWithUpdate();
                                theObj.setCoords();
                                canvas.renderAll();
                            }
                        }
                    }
                }else{
                    //商品预览图
                        for (var i=0;i<theObj._objects.length;i++){
                            
                            if (theObj.item(i).dType=="productPicture"){
                                theObj._objects[i]._objects[0].visible=true;
                                theObj._objects[i]._objects[1].visible=false;
                                theObj._objects[i]._objects[2].visible=false;
                                if (theObj._objects[i]._objects[3]){
                                    theObj._objects[i]._objects[3].visible=false;
                                }

                                if (theObj._objects[i]._objects[0].hasOwnProperty("customSetPic")){
                                    if (theObj._objects[i]._objects[0].customSetPic==true){
                                        //return;
                                        continue;
                                    }
                                }
                            
                                var img = new Image();
                                img.setAttribute('crossOrigin', 'anonymous');
                                
                                var _group=theObj._objects[i];
                                
                                //图片组件中的Image元件
                                var _img=theObj._objects[i]._objects[0];
                                
                                //在这识别是商品主图、Icon、Brand
                                var newImgSrc=null;
                                var cmykSrc=null;
                                var picid=null;
                                var newParm=null;
                               
                                switch (theObj.item(i).dataFiled)
                                {
                                    case "goodsImage":
                                        newImgSrc=viewObject.goodsImage.rgbOriginPath;
                                        cmykSrc=viewObject.goodsImage.cmykOriginPath;
                                        var itemcode=viewObject.goodsImage.itemcode;
                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                  
                                    break;
                                    case "brand":
                                        if (viewObject.brand!=null){
                                            newImgSrc=viewObject.brand.rgbOriginPath;
                                            cmykSrc=viewObject.brand.cmykOriginPath;
                                            picid=viewObject.brand.picid;
                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                        }
                                    break;
                                    case "gift":
                                        newImgSrc=viewObject.gift.rgbOriginPath;
                                        cmykSrc=viewObject.gift.cmykOriginPath;
                                        var itemcode=viewObject.gift.itemcode;
                                        newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode};
                                    break;
                                    case "icon1":
                                        if (viewObject.icons[0]!=null){
                                            newImgSrc=viewObject.icons[0].rgbOriginPath;
                                            cmykSrc=viewObject.icons[0].cmykOriginPath;
                                            picid=viewObject.icons[0].picid;
                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                        }
                                    break;
                                    case "icon2":
                                        
                                            if (viewObject.icons[1]!=null){
                                                newImgSrc=viewObject.icons[1].rgbOriginPath;
                                                cmykSrc=viewObject.icons[1].cmykOriginPath;
                                                picid=viewObject.icons[1].picid;
                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                            }
                                    break;
                                    case "icon3":
                                        
                                            if (viewObject.icons[2]!=null){
                                                newImgSrc=viewObject.icons[2].rgbOriginPath;
                                                cmykSrc=viewObject.icons[2].cmykOriginPath;
                                                picid=viewObject.icons[2].picid;
                                                newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:picid,itemcode:null};
                                            }
                                    break;
                                    case "lk_goodsImage":
                                        if (theObj.item(i).hasOwnProperty("lkSort")){
                                            if (theObj.item(i).lkSort!='' && theObj.item(i).lkSort*1>=1){
                                                if (isEmpty(viewObject.linkItems)==false){
                                                    var _lkSort=theObj.item(i).lkSort*1 -1;
                                                    if (isEmpty(viewObject.linkItems[_lkSort])==false){
                                                        if (viewObject.linkItems[_lkSort].hasOwnProperty("rgbOriginPath") && viewObject.linkItems[_lkSort].hasOwnProperty("cmykOriginPath")){
                                                            newImgSrc=viewObject.linkItems[_lkSort].rgbOriginPath;
                                                            cmykSrc=viewObject.linkItems[_lkSort].cmykOriginPath;
                                                            var itemcode=viewObject.linkItems[_lkSort].itemcode;
                                                            newParm={src:newImgSrc,dType:"productPicture",cmykSrc:cmykSrc,picid:null,itemcode:itemcode}; 
                                                        }                                              
                                                    }
                                                }
                                            }
                                        }

                                    
                                    break;
                                }
                                
                                if (newParm!=null){
                                    if (newParm.src!=_img.src && !isEmpty(newParm.src)){
                                     
                                        self.drawing=true;
                                        _parent.setProductPicture(newParm,i,_img,function(newImg,objectSort){
                                        
                                            if (newImg.width>newImg.height){
                                                var _pi=theObj._objects[objectSort].width/newImg.width;
                                            }else{
                                                var _pi=theObj._objects[objectSort].height/newImg.height;
                                            }
                                            newImg.scale(_pi);
                                            newImg.scaleX=_pi;
                                            newImg.scaleY=_pi;
                                        
                                            var picBoxHeight=theObj._objects[objectSort].height ;
                                            var newImgBoxHeight=newImg.height * _pi;
                                            
                                            if (picBoxHeight>newImgBoxHeight){
                                                newImg.left=-1 * theObj._objects[objectSort].width/2;
                                                newImg.top=-1 * theObj._objects[objectSort].height/2 + (picBoxHeight-newImgBoxHeight)/2;
                                                
                                            }else{
                                            
                                                newImg.left=0 - theObj._objects[objectSort].width/2;
                                                newImg.top=0 - theObj._objects[objectSort].height/2;
                                                
                                            }
                                            
                                            theObj._objects[objectSort]._objects[0]=newImg;
                                            theObj.item(objectSort).item(0).set({src:newImg.src});

                                            theObj._objects[objectSort]._objects[0].visible=true;
                                            theObj._objects[objectSort]._objects[1].visible=false;
                                            theObj._objects[objectSort]._objects[2].visible=false;
                                            if (theObj._objects[objectSort]._objects[3]){
                                                theObj._objects[objectSort]._objects[3].visible=false;
                                            }
                                            //2021-12-18
                                            theObj._objects[objectSort]._objects[1].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});
                                            theObj._objects[objectSort]._objects[2].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});  
                                            
                                            if (theObj._objects[objectSort]._objects[3]){
                                                theObj._objects[objectSort]._objects[3].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});     
                                            }
                                            
                                            theObj.addWithUpdate();
                                            theObj.setCoords();
                                            canvas.renderAll(); 

                                            
                                        });
                                    }
                                    
                                }else{
                            
                                    var data={};
                                    data.left=theObj._objects[i]._objects[1].left;
                                    data.top=theObj._objects[i]._objects[1].top
                                    data.width=theObj._objects[i]._objects[1].width;
                                    data.height=theObj._objects[i]._objects[1].height;
                                    data.type="rect";
                                    data.fill="#ffffff",
                                    data.opacity=1;
                                    data.stroke='#999999';
                                    data.strokeWidth=1;
                                    data.scaleX=theObj._objects[i]._objects[1].scaleX;
                                    data.scaleY=theObj._objects[i]._objects[1].scaleY;
                                    data.visible=false;
                                    
                                    var rect = new fabric.Rect(data);


                                    //测试如果该商品没有对应的图片，显示标签图框
                                    theObj._objects[i]._objects[0]=rect;
                                    theObj._objects[i]._objects[1].visible=false;
                                    theObj._objects[i]._objects[2].visible=false;
                                    if (theObj._objects[i]._objects[3]){
                                        theObj._objects[i]._objects[3].visible=false;
                                    }
                                    theObj.addWithUpdate();
                                    theObj.setCoords();
                                    canvas.renderAll(); 
                                    
                                }
                            
                        }
                    
                    }
                }
    
                //商品其他信息处理
                var isUpdateInfo=false;
                if (theObj.hasOwnProperty("textInfogmtCreate")==false){   
                    theObj.set("textInfogmtCreate",viewObject.gmtCreate);
                    //设置商品最后一次更新资料时间
                    isUpdateInfo=true;
                }else if (theObj.hasOwnProperty("textInfogmtCreate") && theObj.textInfogmtCreate!=viewObject.gmtCreate){
                    theObj.set("textInfogmtCreate",viewObject.gmtCreate);
                    //更新商品最后一次更新资料时间
                    isUpdateInfo=true;
                }

                if(isUpdateInfo==true){
                   
                    self.drawing=true;
                    for (var j=0;j<theObj._objects.length;j++){
                        switch (theObj._objects[j].dType)
                        {
                            //处理商品组件中的商品标签编组时，数据更新处理
                            case "tmpGroup":
                                
                                _parent.updateProductGroupLabel(theObj._objects[j],theObj,viewObject);
                                
                                
                            break;
                            case "productNormalText":
                            case "productLineationText":
                                
                                var tmpText=null;
                                var dataFiled=theObj._objects[j].dataFiled;

                                if(!isEmpty(dataFiled)){    
                                    var insertText="";
                                    tmpText="";

                                    if (dataFiled.substr(0,3)=="lk_"){
                                        if (theObj._objects[j].hasOwnProperty("lkSort")){
                                
                                            if (theObj._objects[j].lkSort!='' && theObj._objects[j].lkSort*1>=1){
                                                if (isEmpty(viewObject.linkItems)==false){
                                                    var _lkSort=theObj._objects[j].lkSort*1 -1;
                                                    for (var k in viewObject.linkItems[_lkSort]){
                                                        if (k.toLowerCase()==dataFiled.toLowerCase()){

                                                            if (theObj._objects[j].hasOwnProperty("insertText")){
                                                                insertText=theObj._objects[j].insertText;
                                                                insertText=(isEmpty(insertText)==false)?insertText:"";
                                                            }else{
                                                                insertText="";
                                                            }

                                                            tmpText=insertText+viewObject.linkItems[_lkSort][k];
                                                            break;
                                                        }
                                                    }

                                                }
                                            }
                                        }


                                    }else{
                                        for (var k in viewObject){
                                            if (k.toLowerCase()==dataFiled.toLowerCase()){

                                                if (theObj._objects[j].hasOwnProperty("insertText")){
                                                    insertText=theObj._objects[j].insertText;
                                                    insertText=(isEmpty(insertText)==false)?insertText:"";
                                                }else{
                                                    insertText="";
                                                }

                                                tmpText=insertText+viewObject[k];
                                                break;
                                            }
                                        }
                                    }

                               
                                    if (!isEmpty(tmpText) && tmpText!="null"){
                                        theObj.item(j).set({text:(""+tmpText),visible:true});
                                    }else{
                                        theObj.item(j).set({text:"",visible:false});
                                    }
                                }
                            break;
                            case "productPriceGroup":
                                var tmpText=null;
                                var dataFiled=theObj._objects[j].dataFiled;
                                var insertText="";
                                tmpText="";

                                if(!isEmpty(dataFiled)){ 

                                    if (dataFiled.substr(0,3)=="lk_"){
                                        if (theObj._objects[j].hasOwnProperty("lkSort")){
                                
                                            if (theObj._objects[j].lkSort!='' && theObj._objects[j].lkSort*1>=1){
                                                if (isEmpty(viewObject.linkItems)==false){
                                                    var _lkSort=theObj._objects[j].lkSort*1 -1;
                                                    for (var k in viewObject.linkItems[_lkSort]){
                                                        if (k.toLowerCase()==dataFiled.toLowerCase()){

                                                            if (theObj._objects[j].hasOwnProperty("insertText")){
                                                                insertText=theObj._objects[j].insertText;
                                                                insertText=(isEmpty(insertText)==false)?insertText:"";
                                                            }else{
                                                                insertText="";
                                                            }

                                                            tmpText=insertText+viewObject.linkItems[_lkSort][k];
                                                            break;
                                                        }
                                                    }

                                                }
                                            }
                                        }


                                    }else{
                                        for (var k in viewObject){
                                            if (k.toLowerCase()==dataFiled.toLowerCase()){

                                                if (theObj._objects[j].hasOwnProperty("insertText")){
                                                    insertText=theObj._objects[j].insertText;
                                                    insertText=(isEmpty(insertText)==false)?insertText:"";
                                                }else{
                                                    insertText="";
                                                }

                                                tmpText=insertText+viewObject[k];
                                                break;
                                            }
                                        }
                                    }

                                    //处理划线价
                                    if (theObj.item(j)._objects[0].type=="i-text"){
                                        var _textObj=theObj.item(j)._objects[0];
                                        var _lineObj=theObj.item(j)._objects[1]; 
                                        var _textIndex=0,_lineIndex=1;
                                    }else{
                                        var _textObj=theObj.item(j)._objects[1];
                                        var _lineObj=theObj.item(j)._objects[0];
                                        var _textIndex=1,_lineIndex=0;
                                    }


                                    if (tmpText!=null && tmpText!="null"){

                                        theObj.item(j).set({visible:true});

                                        var sourceText=_textObj.text;
                                        var isPoint=sourceText.indexOf(".");

                                        var _sTextLen=sourceText.length;
                                        var _nTextLen=tmpText.length;
                                        var _len=_textObj.width/_sTextLen;

                                        var _sourceLeft=theObj.item(j).left;
                                        var _sourceTop=theObj.item(j).top;

                                        var _lineY1=_lineObj.y1;
                                        var _lineY2=_lineObj.y2;

                                        _textObj.set({text:(""+tmpText)});

                                        if (_sTextLen > _nTextLen){

                                            //计算新的分组宽度
                                            var newGroupWidth=_len * _nTextLen;

                                            var offsetX1=-0.2 * _textObj.fontSize;
                                            var offsetX2=0.1 * _textObj.fontSize;

                                            //var offsetX1=(0.1 * res.w<3)?-3:-0.1 * newGroupWidth;
                                            //var offsetX2=(0.1 * res.w<3)?3:0.1 * newGroupWidth;

                                            newGroupWidth=newGroupWidth + Math.abs(offsetX1) + offsetX2;
                                    
                                            _lineObj.set({x1:0,x2:2});
                                            _textObj.set({x1:(theObj.item(j).width/2*-1)});
                                            theObj.item(j).set({width:newGroupWidth,left:_sourceLeft});
                             
                                            var _x1=newGroupWidth/2*-1;
                                            var _x2=newGroupWidth/2;
                                            _lineObj.set({x1:_x1,x2:_x2});
                                            _textObj.set({left:(_x1 - offsetX1)});
                                                                                    
                                            theObj.item(j).set({left:_sourceLeft,top:_sourceTop,width:(_x2 - _x1)});
                                            theObj._objects[j].left=_sourceLeft;
                                            theObj._objects[j].top=_sourceTop;
                                            theObj.item(j).setCoords();


                                        }else if (_sTextLen < _nTextLen){

                                            //计算新的分组宽度
                                            var newGroupWidth=_len * _nTextLen;

                                            var offsetX1=-0.2 * _textObj.fontSize;
                                            var offsetX2=0.1 * _textObj.fontSize;

                                            //var offsetX1=(0.1 * res.w<3)?-3:-0.1 * newGroupWidth;
                                            //var offsetX2=(0.1 * res.w<3)?3:0.1 * newGroupWidth;


                                            newGroupWidth=newGroupWidth + Math.abs(offsetX1) + offsetX2;
                                            _lineObj.set({x1:0,x2:2});
                                            _textObj.set({x1:(theObj.item(j).width/2*-1)});
                                            theObj.item(j).set({width:newGroupWidth,left:_sourceLeft});
                           
                                            var _x1=newGroupWidth/2*-1;
                                            var _x2=newGroupWidth/2;
                                            _lineObj.set({x1:_x1,x2:_x2});
                                            _textObj.set({left:(_x1 - offsetX1)});

                                            theObj.item(j).set({left:_sourceLeft,top:_sourceTop});
                                            theObj.item(j).setCoords();

                                        }

                                    }else{
                                        theObj.item(j)._objects[_textIndex].set({text:""});
                                        theObj.item(j).set({visible:false});
                                    }
                                }

                            break;
                        }
                        
                        theObj.item(j).set({zIndex:theObj.item(j).zIndex});
                    }
                    
                    (callback && typeof(callback) === "function") && callback(theObj);
                    
                }
        }
        
        //单独更新商品组件中商品图片
        this.updateProductTheDtypePicture=function(newParm=null,updateObj,callback=null){

                if (newParm!=null && updateObj!=null){

                    var _img=null;
                    //图片组件中的Image元件
                    for (var i=0;i<updateObj._objects.length;i++){
                        if (updateObj._objects[i].hasOwnProperty("dType")){
                            if (updateObj._objects[i].dType=="previewPicture"){
                                _img=updateObj._objects[i];
                                var theImgIndex=i;
                                break;
                            }
                        }
                    }
                    

                    if (_img!=null){

                        if (newParm.src!=_img.src && !isEmpty(newParm.src)){
                            _parent.setProductPicture(newParm,theImgIndex,_img,function(newImg,objectSort){

                                var theObj=updateObj;
                                if (newImg.width>newImg.height){
                                    var _pi=theObj.width/newImg.width;
                                }else{
                                    var _pi=theObj.height/newImg.height;
                                }

                                newImg.scale(_pi);
                                newImg.scaleX=_pi;
                                newImg.scaleY=_pi;

                                var picBoxHeight=theObj.height;
                                var newImgBoxHeight=newImg.height;

                                var picBoxWidth=theObj.width;
                                var newImgBoxWidth=newImg.width;
                                
                                if (picBoxHeight>newImgBoxHeight){
                                    newImg.top=-1 * theObj.height/2;
                                }else{
                                    newImg.top=-1 * theObj.height/2 + (picBoxHeight-newImgBoxHeight)/2;
                                }

                                if (picBoxWidth>newImgBoxWidth){
                                    newImg.left=-1 * theObj.width/2;
                                }else{
                                    newImg.left=-1 * theObj.width/2 + (picBoxWidth-newImgBoxWidth)/2;
                                }
                                

                                for (var i=0;i<theObj._objects.length;i++){
                                    if (i==objectSort){
                                        theObj._objects[objectSort]=newImg;
                                        theObj._objects[objectSort].visible=true;
                                    }else{
                                        theObj._objects[i].visible=false;
                                        theObj._objects[i].set({width:(newImg.width * newImg.scaleX ),height:(newImg.height * newImg.scaleY )});
                                    }
                                }
                            
                                theObj.addWithUpdate();
                                theObj.setCoords();
                                canvas.renderAll(); 
                                
                            });
                        }
                    }

                }else{
                        
                        var theObj=updateObj;

                        var data={};
                        data.left=theObj._objects[1].left;
                        data.top=theObj._objects[1].top
                        data.width=theObj._objects[1].width;
                        data.height=theObj._objects[1].height;
                        data.type="rect";
                        data.fill="#ffffff",
                        data.opacity=1;
                        data.stroke='#999999';
                        data.strokeWidth=1;
                        data.scaleX=theObj._objects[1].scaleX;
                        data.scaleY=theObj._objects[1].scaleY;
                        data.visible=false;
                        
                        //var rect = new fabric.Rect(data);


                        //测试如果该商品没有对应的图片，显示标签图框
                        //theObj._objects[0]=rect;
                        theObj._objects[0].visible=false;
                        theObj._objects[1].visible=true;
                        theObj._objects[2].visible=true;
                        if (theObj._objects[3]){
                            theObj._objects[3].visible=true;
                        }
                        theObj.addWithUpdate();
                        theObj.setCoords();
                        canvas.renderAll(); 
                    
                }


        }

        //单独更新商品组件中关联商品文本信息
        this.updateProductLinkText=function(parm=null,updateObj,callback=null){

            if (parm!=null && updateObj!=null){

                self.drawing=true;
                var dataFiled=updateObj.dataFiled;
                var _dSort=self.undoGroupSource.dSort;
                var _dSortArr=[-1,-1];
                if (!isEmpty(_dSort)){
        
                    _dSortArr=_dSort.split("-");
                    if (_dSortArr[0] * 1>=1 && _dSortArr[1]*1>=1){    
                        _dSortArr[0]=_dSortArr[0] * 1 -1;
                        _dSortArr[1]=_dSortArr[1]*1;
                    }
                }

                if (isEmpty(mmDetailsData[_dSortArr[0]])==false){
                    if (isEmpty(mmDetailsData[_dSortArr[0]][_dSortArr[1]])==false){
                        var theProductDetails=mmDetailsData[_dSortArr[0]][_dSortArr[1]];
                        var lineItemArr=theProductDetails.linkItems;
                        if (!isEmpty(lineItemArr)){

                            for (var i=0;i<lineItemArr.length;i++){
                                if (i==parm.lkSort*1-1){
                                    for (key in lineItemArr[i]){
                                        if (key==parm.dataFiled){
                                            if (!isEmpty(lineItemArr[i][key])){
                                                updateObj.text="" + updateObj.insertText + lineItemArr[i][key];
                                                (callback && typeof(callback) === "function") && callback(true);
                                                return;
                                            }else{
                                                (callback && typeof(callback) === "function") && callback(false);
                                                return;
                                            }
                                        }
                                        
                                    }
                                }
                            }

                        }

                    }
                }
            }

        }
        

        //替换图片
        this.setProductPicture=function(parm=null,objectSort,_img,callback=null){

              self.drawing=true;
              var img = new Image();//创建新的图片对象
              img.src = parm.src;
              img.setAttribute("crossOrigin",'Anonymous');

              img.onload = function(e){

                    //图片加载完，再draw 和 toDataURL
                    if (e.path){
                        var imgWidth=e.path[0].width;
                        var imgHeight=e.path[0].height;
                    }else{
                        var imgWidth=this.width;
                        var imgHeight=this.height;
                    }

                    context.drawImage(img,0,0);    
                    var fabricImage = new fabric.Image(img, {
                        left:_img.left,
                        top:_img.top,
                        scaleX:_img.scaleX,
                        scaleY:_img.scaleY,
                        zIndex:_img.zIndex,
                        type:'image',
                        dtypeIndex:_img.dtypeIndex,
                        width:imgWidth,
                        height:imgHeight,
                        customSetPic:(isEmpty(parm.customSetPic)?false:parm.customSetPic),
                        angle:_img.angle,
                        id:_img.id,
                        dType:"previewPicture",//parm.dType,
                        bindItemCode:(isEmpty(parm.itemcode)?null:parm.itemcode),
                        cmykPic:parm.cmykSrc,
                        src:parm.src,
                        visible:true,
                        picid:(isEmpty(parm.picid)?null:parm.picid)
                    });
              
                    //调用图层排序
                    (callback && typeof(callback) === "function") && callback(fabricImage,objectSort);
               };
            
        }
        
        
        //撤消上一步
        //当撤消上几步操作后，又重新做其他编辑，即删除当前操作记录后原先历史记录，仿ps
        this.canvasUndo=function(parm=null,callback=null){
            if(parm!=null){
                self.pageEventObject.undoID=parm;
            }
            var _p=self.canvasConfig.recordPointer.pointerIndex-1;
            if (_p>=0){ 
                self.canvasSave().canvasHistoryRecordGet(_p);
            }

            self.pageEvent.showBackgroundImage();
            (callback && typeof(callback) === "function") && callback(_p);
        }
        
        //重做下一步
        this.canvasTodo=function(parm=null,callback=null){
            if(parm!=null){
                self.pageEventObject.todoID=parm;
            }
            var _p=self.canvasConfig.recordPointer.pointerIndex+1;
            self.canvasSave().canvasHistoryRecordGet(_p);

            self.pageEvent.showBackgroundImage();
            (callback && typeof(callback) === "function") && callback(_p);
        }
        
        //画布参考线
        this.canvasReferenceLine=function(mode="h",offset=0){
    
            if (mode=="h"){
                var pannY=canvas.viewportTransform[5];
                offset=(offset - pannY)/canvas.getZoom();
                var data={
                        left:0,
                        top: (offset),
                        padding:20,
                        dType:'referenceLine',
                        hasBorders: false,
                        hasControls: false,
                        lockMovementX: true,
                        lockMovementY: false,
                        strokeWidth:0.5,
                        zIndex:9999,
                        stroke: 'red'
                    }
                var point=[0, 0,self.canvasConfig.width,0];
            }else if (mode=="v"){
                var pannX=canvas.viewportTransform[4];
                offset=(offset - pannX)/canvas.getZoom();
                var data={
                        left:(offset),
                        top: 0,
                        padding:20,
                        dType:'referenceLine',
                        hasBorders: false,
                        hasControls: false,
                        lockMovementX: false,
                        lockMovementY: true,
                        strokeWidth:0.5,
                        zIndex:9999,
                        stroke: 'red'
                    }
                var point=[0, 0,0,self.canvasConfig.height];
            }else{
                return;
            }
            
            var line=new fabric.Line(point, data)
            canvas.add(line).setActiveObject(line);
            self.cunterObj=line;
            canvas.renderAll();
            self.attributesShow().paper();
        }
        
        //显示或隐藏参考线
        this.referenceLineShow=function(v=true){
            var objects=canvas.getObjects();
            for (var i=0;i<objects.length;i++){
                if (objects[i].dType){
                    if (objects[i].dType=="referenceLine"){
                        objects[i].set({visible:v});
                        canvas.renderAll();
                    }
                }
            }
        }
        
        
        // 查询指定对象或组件（出血线、纸张、页边距、背景层、其他组件）
        // @ parm {id:""}
        // 返回对象 或 false
        this.searchObject=function(parm,objects){
            var theObj=false;
            for (key in objects){
             
                if (objects[key].id){
                    if (objects[key].id==parm.id){
                        theObj=objects[key];
                        return theObj;
                    }
                }
            }
            return theObj;
        }

        // 删除指定对象或组件
        // @ parm {id:""}
        // 返回对象 或 false
        this.deleteObject=function(parm){
            var objects=canvas.getObjects();
            for (key in objects){
                if (objects[key].id){
                    if (objects[key].id==parm.id){
                        canvas.remove(objects[key]);
                    }
                }
            }
        }        
        
        //查询某组件是否被选中
        this.isSelected=function(parm){
            if (isEmpty(self.selectedObject)){
                return false;
            }else{
                var _is=false;
                for (var i=0;i<self.selectedObject.length;i++){
                    
                    if (self.selectedObject[i].id==parm){
                        _is= true;
                        return _is;
                    }
                }
                
                return _is;
            }
        }

        //鼠标经过组件显示简约版控制器
        this.componentMouseover=function(object){
            
            if ((self.mouseoverObject==null || self.mouseoverObject!=object) && object.hasOwnProperty("selectable")){

                if (self.mouseoverObject!=null){
                    if (self.mouseoverObject.id==object.id || !object.selectable){
                        return;
                    }
                }

                _parent.componentMouseout();
                self.mouseoverObject=object;
                object.set({borderColor:'#b3cdfd',dirty:false});

                object.hasBorders=true;
                
                if (object.hasOwnProperty("group")){
                    object.hasControls = false;
                    object.setControlsVisibility({
                              mt: false, 
                              mb: false, 
                              bl: false,
                              br: false, 
                              tl: false, 
                              tr: false,
                              mtr: false, 
                         }); 
                }else{
                    object.hasControls = true;
                    object.setControlsVisibility({
                              mt: true, 
                              mb: true, 
                              bl: true,
                              br: true, 
                              tl: true, 
                              tr: true,
                              mtr: false, 
                         });
                }

                
                object.selectable=true;
                object._renderControls(context);
            }
            
        }

        //鼠标滑出组件显示简约版控制器
        this.componentMouseout=function(){
         
            if (self.mouseoverObject!=null){

                var object=self.mouseoverObject;
                
                if (self.selectedObject!=null){
                    if (self.selectedObject.indexOf(object)>-1){
                        return;
                    }
                }
                
                object.set({borderColor:'#b3cdfd',dirty:false});

                if (object.hasOwnProperty("controlType")){
                    object.paintFirst="stroke";
                    object.hasControls = true;
                }else{

                    object.hasControls = true;
                    object.hasBorders=true;

                }

                
                object.set({borderColor:'#b3cdfd'});
                object.setControlsVisibility({
                      mt: true, 
                      mb: true, 
                      bl: true,
                      br: true, 
                      tl: true, 
                      tr: true,
                      mtr: true, 
                 });
            
                object.selectable=true;

                // if (canvas.getRetinaScaling){
                //     object._renderControls(context);
                //     object.setCoords();
                // } 
                
                try {
                    if (canvas.getRetinaScaling){
                        object._renderControls(context);
                        object.setCoords();
                    }
                }
                catch (err){
                    console.log(err);
                }
                
                
                
                self.mouseoverObject=null;
                canvas.renderAll();
                //重绘选中组件控制器
                if (self.selectedObject!=null){
                    self.canvasDraw().drawSelectedControls();
                }
            }

        }

        //当选择模式为：穿透分组选中元素模式，绘制选中组件控制器
        this.drawSelectedControls=function(){
            
            if (isEmpty(self.selectedObject)){
                return;
            }

            for (var i=0;i<self.selectedObject.length;i++){
                
                var object=self.selectedObject[i];
                if (!isEmpty(object)){
             
                    object.hasControls = false;
                    object.hasBorders=true;
                    object.selectable=true;
                    object.set({borderColor:'#008efa',dirty:true,visible:true,active:true});

                    object.setControlsVisibility({
                          mt: false, 
                          mb: false, 
                          bl: false,
                          br: false, 
                          tl: false, 
                          tr: false,
                          mtr: false
                     });
                     

                    //if (object.hasOwnProperty("_renderControls")){
                        // console.log(object);
                        try {
                            if (self.undoGroupSource!=null){
                                if (object.hasOwnProperty("id")){

                                    if (object.id!=self.undoGroupSource.id){
                                        // self.layer.canvasOperation.chooseLayer({layerID:object.id});
                                        object._renderControls(context); 
                                    }
                                }else{
                                    // self.layer.canvasOperation.chooseLayer({layerID:object.id});
                                    object._renderControls(context); 
                                }
                            }else{
                                // self.layer.canvasOperation.chooseLayer({layerID:object.id});
                                object._renderControls(context); 
                                // console.log("AAAAAA");
                            }
                        }
                        catch (err){
                            console.log(err);
                        }
                    //}
                      
                }
            }
            
            self.layer.canvasOperation.chooseMultipleLayer();
        }

        //还原组件默认选中时控制器样式
        this.reDrawComponentControls=function(){
 
            //处理穿透模式下，从一个分组穿透选中后又穿透右一个分组中的元素无法更改原样式补充处理
            var canvasObjects=canvas.getObjects();
            for (var i=0;i<canvasObjects.length;i++){
            
                if (canvasObjects[i].hasOwnProperty("isPixSelect")){
                   
                    delete canvasObjects[i].isPixSelect;
                    canvasObjects[i].set({
                        lockMovementX:false,
                        lockMovementY:false,
                        hasBorders:true,
                        selectable:true
                    });
                    canvasObjects[i]._renderControls(context);
                }

            }

            if (isEmpty(self.selectedObject)){
                return;
            }

            for (var i=0;i<self.selectedObject.length;i++){
                
                var object=self.selectedObject[i];
                object.hasControls = true;
                object.hasBorders=true;
                object.selectable=true;
                object.set({borderColor:'#b3cdfd',dirty:false,visible:true,lockMovementX:false,lockMovementY:false,hasBorders:true});

                object.setControlsVisibility({
                      mt: true, 
                      mb: true, 
                      bl: true,
                      br: true, 
                      tl: true, 
                      tr: true,
                      mtr: true, 
                 });
                if (object.hasOwnProperty("group")){
                    object.group.set({
                        lockMovementX:false,
                        lockMovementY:false,
                        hasBorders:true
                    });
                    object.group._renderControls(context);
                }

                try {
                    if (self.undoGroupSource!=null){
                        if (object.hasOwnProperty("id")){
                            if (object.id!=self.undoGroupSource.id){
                                object._renderControls(context); 
                            }
                        }else{
                            object._renderControls(context); 
                        }
                    }else{
                        object._renderControls(context); 
                    }
                }
                catch (err){
                    console.log(err);
                }
                
            }

        }

        //从选中的组件群中删除指定组件或清空选中组件群
        this.deleteSelected=function(parm){

            if (isEmpty(self.selectedObject)){
                return;
            }

            if (parm!=""){
                for (var i=0;i<self.selectedObject.length;i++){
                    
                    if (self.selectedObject[i].id==parm){
                        self.selectedObject[i].hasBorders=false;
                        self.selectedObject[i]._renderControls(context);
                        self.selectedObject.splice(i,1);
                        return;
                    }
                
                }
            }else{
                for (var i=0;i<self.selectedObject.length;i++){
                    self.selectedObject[i].hasBorders=false;
                }
                self.selectedObject=null;
            }

        }

        //检查是否设置背景图
        this.isDrawBackgroundImage=function(canvasObjects){
            var theObj=_parent.searchObject({id:"BackgroundImage"},canvasObjects);
            if (theObj!=false){
                if (theObj.hasOwnProperty("src")){
                    if (theObj.src==""){
                        return true;
                    }else{
                        return true;
                    }
                }else{
                    return true;
                }
            }else{
                return false;
            }
        }

        //平移画布时，绘制最顶层透明react
        this.drawPanningBox=function(){

            var data={};
            data.left=0;
            data.top=0;
            data.width=self.paperSize.marginWidth + self.canvasPaddX * 2;
            data.height=self.paperSize.marginHeight + self.canvasPaddY * 2;
            data.type="rect";
            data.fill="#ffffff";
            data.opacity=0;
            data.stroke='#1D983A';
            data.strokeWidth=0;
            data.zIndex=9999;
            data.scaleX=1;
            data.scaleY=1;
            data.id="panningBox",
            data.name="panningBox",
            data.dType="panningBox";
            data.selectable=false;
            data.lockMovementX=true;
            data.lockMovementY=true;
            var rect = new fabric.Rect(data);
            canvas.add(rect).renderAll();

        }


        //鼠标在画布上的右击点击事件
        this.canvasOnMouseDown=function(opt) {

          // 判断：右键，且在元素上右键
          // opt.button: 1-左键；2-中键；3-右键
          // 在画布上点击：opt.target 为 null && opt.target
          if (opt.button === 3 ) {
            // 获取当前元素
            activeEl = opt.target;

            menu.domReady = function() {
              
            }

            // 显示菜单，设置右键菜单位置
            // 获取菜单组件的宽高
            const menuWidth = menu.offsetWidth
            const menuHeight = menu.offsetHeight

            // 当前鼠标位置
            let pointX = opt.e.clientX;
            let pointY = opt.e.clientY;

            // 计算菜单出现的位置
            // 如果鼠标靠近画布右侧，菜单就出现在鼠标指针左侧
            if (canvas.width - pointX <= menuWidth) {
              pointX -= menuWidth
            }
            // 如果鼠标靠近画布底部，菜单就出现在鼠标指针上方
            if (canvas.height - pointY <= menuHeight) {
              pointY -= menuHeight
            }

            // 将菜单展示出来
            menu.style ="visibility:visible;left:"+pointX+"px;top:"+pointY+"px;z-index:100;position:fixed;"
            
          }else{
            _parent.hiddenMenu()
          }
        }

        //隐藏自定义右键菜单
        this.hiddenMenu=function(parm=null){
            menu.style ="visibility:hidden;left:0px;top:0px;z-index:-100;"
        }

        //重设组件控制点样式
        this.setCornerStyle=function(){


            //控制器边框颜色
            fabric.Object.prototype.borderColor = "#b3cdfd";
            // 修改控制点的形状，默认为`rect`矩形，可选的值还有`circle`圆形
            fabric.Object.prototype.cornerStyle = "rect";
            // 修改控制点的填充色为白色
            fabric.Object.prototype.cornerColor = "white";
            // 修改控制点的大小为10px
            fabric.Object.prototype.cornerSize = 6;
            // 设置控制点不透明，即可以盖住其下的控制线
            fabric.Object.prototype.transparentCorners = false;
            // 修改控制点的边框颜色为`gray`灰色
            fabric.Object.prototype.cornerStrokeColor = "#003dea";
      
            // 单独修改旋转控制点距离主体的纵向距离为-20px
            fabric.Object.prototype.controls.mtr.offsetY = -20;
            // 单独修改旋转控制点，光标移动到该点上时的样式为`pointer`，一个手的形状
            fabric.Object.prototype.controls.mtr.cursorStyle = "alias";
            fabric.Object.prototype.controls.mtr.withConnection = false;

            /*
            fabric.Object.prototype.controls.mtr.originX='center';
            fabric.Object.prototype.controls.mtr.originY='center';

            var iconURL="../img/xuanzhuan.png";
            fabric.Image.fromURL(iconURL,function(image, isError){

              if (!isError) {
                fabric.Object.prototype.controls.mtr = new fabric.Control({
                    x: 0,
                    y: -0.5,
                    offsetY: -20,
                    cursorStyle: 'pointer',
                    actionHandler: fabric.controlsUtils.rotationWithSnapping,
                    cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
                    // 渲染图标
                    render: _parent.renderIcon(image._element, 0),
                    // 设置控制点大小
                    cornerSize: 10,
                });
              }
            });

            */


        }


        //渲染图标的方法
        this.renderIcon=function(image, initialAngle) {
              return function (ctx, left, top, styleOverride, fabricObject) {
                  let size = this.cornerSize;
                  ctx.save();
                  ctx.translate(left, top);
                  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle + initialAngle));
                  ctx.drawImage(image, -size / 2, -size / 2, size, size);
                  ctx.restore();
              }
        }


        this.testControls=function(){




        }



        return this;
    }
    
    //画布鼠标事件监控
    self.canvasListener=function(parm=null){
        
        //鼠标按下左键 画布、组件事件
        this.mouseDown=function(e,callback=null){

            self.insertX=e.absolutePointer.x;
            self.insertY=e.absolutePointer.y;
            self.isEditText=false;

            if (e.target==null){
                //点击空白画布
                if (self.panning==false){
                    self.cunterObj=null;
                    self.selectedObject=null;
                    self.attributesShow().paper();
                }
                
            }else if (e.target!=null){
                //鼠标点击组件 
                
                //如果是分组执行组刷新
                if (e.target.type=="group"){
                    e.target.addWithUpdate();
                    e.target.setCoords();
                }

                if (e.target.dType=="paperBleed" || e.target.dType=="paperMargins" || e.target.dType=="paperBox" || e.target.dType=="paperSlice" || e.target.dType=="alignmentLine" || e.target.dType=="referenceLine"){
             
                    if (e.target.dType!="referenceLine"){
                        self.cunterObj=null;
                        self.selectedObject=null;
                    }

                    self.attributesShow().paper();

                }else{
                    
                    if (self.undoGroupSource!=null){
                        if (e.target.hasOwnProperty("id")==false && e.target.type!="activeSelection"){
                         
                            self.canvasDraw().composeGroup();
                        }else{
                            
                            if (self.undoGroupSource.canvasOtherObjects.indexOf(e.target.id)>-1){
                              
                                self.canvasDraw().composeGroup();
                                self.selectedObject=null;
                                canvas.setActiveObject(e.target);
                            }
                        }
                    }
                    
                    self.cunterObj=e.target;
                    //组件选择还是穿透编组选择 isPixSelect=true组件选择 , isPixSelect=false穿透编组选择
                    if (self.isPixSelect==false && e.target.selectable==true){
                      
                        var newActive=null;
                        if (isEmpty(self.selectedObject)){
                            self.selectedObject=[];
                        }
                        if (e.target.isType('group') && e.target.hasOwnProperty("group")==false ){
                           
                            canvas.discardActiveObject();
                            canvas.renderAll();

                            var mousePos = canvas.getPointer(e.e);
                            e.target.forEachObject(function(object,i) {

                                if(object.containsInGroupPoint(mousePos)){
                                  
                                    e.target.lockMovementX = true;
                                    e.target.lockMovementY = true;
                                  
                                    object.hasControls = false;
                                    object.hasBorders=true;
                                    object.selectable=true;
                                    object.lockMovementX=false;
                                    object.lockMovementY=false;
                                    
                                    newActive=object;
                                }
                                
                            });  

                            if (newActive!=null){
                                var object=newActive;
                                var _id=object.id+"";
                                if (self.isShift){
                                    if (self.canvasDraw().isSelected(_id)==false){
                                        object.setControlsVisibility({
                                              mt: false, 
                                              mb: false, 
                                              bl: false,
                                              br: false, 
                                              tl: false, 
                                              tr: false,
                                              mtr: false, 
                                         });
                                        object.set({active:true});
                                        // canvas.setActiveObject(object);
                                        self.selectedObject.push(object);
                                    }else{
                                        // self.canvasDraw().deleteSelected(_id);
                                    }
                                
                                }else{
                                    if (self.canvasDraw().isSelected(_id)==false){
                                        self.canvasDraw().deleteSelected("");
                                        self.selectedObject=[];
                                        object.setControlsVisibility({
                                              mt: true, 
                                              mb: true, 
                                              bl: true,
                                              br: true, 
                                              tl: true, 
                                              tr: true,
                                              mtr: true, 
                                         });
                                        object.set({active:true});
                                        //记录当前编组被穿透选中过，在切换为直接选择模式时要还原默认的控制器样式
                                        object.group.set({isPixSelect:true});
                                        canvas.setActiveObject(object);
                                    }
                                    
                                }

                            }
                              
                            setTimeout(function() {
                                canvas.renderAll();
                                self.canvasDraw().drawSelectedControls();
                                if (newActive!=null){
                                    // canvas.setActiveObject(newActive);
                                }
                            },100);
                              
                              
                        }else{


                            if (self.isShift){
                                self.selectedObject.push(e.target);
                            }else{
                                self.cunterObj=e.target;
                                self.selectedObject=[];
                                self.selectedObject.push(e.target);
                            }


                        }

                    }

                }
            }
            
        }

        this.mouseMove=function(e,callback=null){
            self.insertX=e.absolutePointer.x;
            self.insertY=e.absolutePointer.y;

            //处理穿透分组多个内部组件移动方法
            if (self.isPixSelect==false && self.selectedObject!=null && !self.panning){
                if (self.mouseInfo.status==0){    
                    var moveOffsetX=self.mouseInfo.onDownPos.x - e.absolutePointer.x;
                    var moveOffsetY=self.mouseInfo.onDownPos.y - e.absolutePointer.y;

                    if (Math.abs(moveOffsetX)>1 || Math.abs(moveOffsetX)>1){

                        for (var i=0;i<self.selectedObject.length;i++){
                            self.selectedObject[i].left = self.selectedObject[i].left - moveOffsetX/2;
                            self.selectedObject[i].top = self.selectedObject[i].top - moveOffsetY/2;

                            if (self.selectedObject[i].hasOwnProperty("group")){
                                self.selectedObject[i].group.addWithUpdate();
                                self.selectedObject[i].group.setCoords();
                            }
                        }
                        canvas.renderAll();
                        self.mouseInfo.onDownPos.x=e.absolutePointer.x;
                        self.mouseInfo.onDownPos.y=e.absolutePointer.y;
                    }

                }
            }

            if (e.target==null){
                //点击空白画布
                //console.log("鼠标滑出");
                if (self.mouseInfo.status==1){
                    self.canvasDraw().componentMouseout();
                }
            }else if (e.target){

                
                var isEvent=false;
                if (e.target.hasOwnProperty("id")) {
                    if (self.mouseoverObject==null){
                        isEvent=true;
                    }else if (self.mouseoverObject.id!=e.target.id){
                        if (self.cunterObj!=null){
                            if (self.isPixSelect==false && !self.cunterObj.hasOwnProperty("group")){
                                isEvent=true;
                            }
                        }
                    }
                }
              

                if (isEvent){
                   
                    var elementType=["paperBleed","paperBox","paperMargins","editGroupBg","paperSlice","referenceLine","alignmentLine","panningBox"];
                    if (elementType.indexOf(e.target.dType)==-1){
                        self.canvasDraw().componentMouseover(e.target);
                    }else{
                        self.canvasDraw().componentMouseout();
                    }
                }
                if (self.mouseInfo.status==1){
                    var elementType=["paperBleed","paperBox","paperMargins","editGroupBg","paperSlice","referenceLine","alignmentLine","panningBox"];
                    if (elementType.indexOf(e.target.dType)==-1){
                        self.canvasDraw().componentMouseover(e.target);
                    }else{
                        self.canvasDraw().componentMouseout();
                    }
                }
            }

        
            if (self.isPixSelect==false && self.selectedObject!=null){    
                self.canvasDraw().drawSelectedControls();
            }
        }        
        
        //鼠标抬起左键 画布、组件事件
        this.mouseUp=function(e,callback=null){
            self.insertX=e.absolutePointer.x;
            self.insertY=e.absolutePointer.y;

            if (e.target==null){
                //点击空白画布
                self.layer.canvasOperation.chooseLayer({layerID:"null"});
                if (self.panning==false){ 
                    //是否有框选
                    if (canvas.getActiveObjects().length){
                        //有框选
                    }else{
                        self.attributesShow().paper();
                    }
                }
            }else if (e.target ){
                //鼠标点击组件
                if (e.target.id=="BackgroundImage"){
                    self.layer.canvasOperation.chooseLayer({layerID:"BackgroundImage"});
                }

                if (!self.selectedObject && (e.target.dType=="paperBleed" || e.target.dType=="paperMargins" || e.target.dType=="paperBox" || e.target.dType=="paperSlice" || e.target.dType=="editGroupBg" || e.target.dType=="alignmentLine" || e.target.dType=="referenceLine_bak" || e.target.dType=="panningBox")){
                    if ( e.target.dType=="editGroupBg"){
                        self.attributesShow().group();
                    }else{
                        self.attributesShow().paper();
                    }
                    self.layer.canvasOperation.chooseLayer({layerID:"null"});                    
                }else if (self.selectedObject==null && (e.target.dType=="paperBleed" || e.target.dType=="paperMargins" || e.target.dType=="paperBox"  || e.target.dType=="paperSlice" || e.target.dType=="editGroupBg" || e.target.dType=="alignmentLine"  || e.target.dType=="referenceLine_bak" || e.target.dType=="panningBox")){
                    self.attributesShow().paper();
                    self.layer.canvasOperation.chooseLayer({layerID:"null"});
                }else if (self.selectedObject!=null && self.cunterObj!=null && e.target.dType!="editGroupBg"){
           
                    //测试框选被干扰 self.selectedObject.length==1
                    if (e.target.dType!="paperBleed" && e.target.dType!="paperMargins" && e.target.dType!="paperBox" && e.target.dType!="paperSlice" && e.target.dType!="editGroupBg" && e.target.dType!="alignmentLine" && e.target.dType!="referenceLine_bak" && self.selectedObject.length==1 && e.target.dType!="panningBox"){
                
                        if (self.isPixSelect==true){
                            self.cunterObj=e.target;
                            canvas.preserveObjectStacking=true;
                    
                            self.componentListener().selectedComponent(e);
                        }else{
                            //当选择模式为：穿透分组选中元素模式
                            canvas.preserveObjectStacking=false;
 
                        }
                        
                        
                    }else if (e.target.dType!="paperBleed" && e.target.dType!="paperMargins" && e.target.dType!="paperBox" && e.target.dType!="paperSlice" && e.target.dType!="editGroupBg" && e.target.dType!="alignmentLine" && e.target.dType!="referenceLine_bak" && e.target.dType!="panningBox" && self.selectedObject.length>1){
                        //shift + 单击组件多选处理
                        //过滤背景图，背景图只能单选

                            if (e.target.type=="activeSelection"){
                                self.selectedObject=e.target._objects;
            
                            }else{
                                //self.selectedObject.push(e.target._objects[0]);
                  
                            }

                        self.cunterObj=self.selectedObject;
                        self.attributesShow().selectedMultiple();
                        self.canvasDraw().drawSelectedControls();
                    }

                }else if (e.target.dType=="editGroupBg"){

                    if (isEmpty(self.selectedObject) || self.cunterObj.dType=="editGroupBg"){
                        self.selectedObject=null;
                        self.attributesShow().group();
                        self.layer.canvasOperation.chooseLayer({layerID:"null"});
                    }else{
                        self.cunterObj=null;
                        self.attributesShow().selectedMultiple();
                    }
                    
                }else{
                    if (e.target.type!="activeSelection"){
                        self.componentListener().selectedComponent(e);
                        
                    }else{
                        self.selectedObject=e.target._objects;
                        self.attributesShow().selectedMultiple();
                    }
                }
            }
            
            if (self.insertStatus){
                //插入组件事务
                self.componentDraw().drawComponentTask();
            }else{
                //选中画布组件时，同时匹配图层面板对应的图层设为选中
                if (e.target){
    
                    if(self.selectedObject!=null){    
                        if (self.selectedObject.length==1){
                            self.layer.canvasOperation.chooseLayer({layerID:e.target.id});
                        }else if (self.selectedObject.length>1){
                            self.layer.canvasOperation.chooseMultipleLayer();
                        }
                    } 
                }
            }

            if (!isEmpty(self.selectedObject) && _JC.isPixSelect==false && self.panning){
                self.canvasDraw().drawSelectedControls();
            }




        }
        
        //鼠标双击
        this.dblclick=function(e,callback=null){
            if (e.target.type=="group" ){
                //组件选择模式时，双击分组才可以编辑
                if (self.isPixSelect){
                    canvas.discardActiveObject();
                    self.componentDraw().undoGroup();
                }
            }else{

                
                if (e.target.hasOwnProperty("dType")){

                    //双击分组背景色进行合并分组
                    if (e.target.dType=="editGroupBg"){
                        self.pageEvent.composeGroup();
                        self.componentDraw().composeGroup();
                        
                    }


                    //双击图片弹出图片选择窗
                    if (e.target.dType=="Picture"){
                        self.pageEvent.openWindow({type:"Picture"}); 
                    }else if (e.target.dType=="IconElement"){
                        self.pageEvent.openWindow({type:"IconElement"});
                    }

                    //如果是背景图，进行解锁
                    /*if (e.target.dType=="BackgroundImage"){
                        e.target.set({selectable:true});
                        self.cunterObj=e.target;
                        canvas.setActiveObject(self.cunterObj);
                        canvas.renderAll();
                    }*/

     
                    //如果type是path/line/polygon，当鼠标双击该对象时，转为可编辑路径/控制点状态，当失去焦点时自动退出可编辑状态
                    if (e.target.dType=="shape" && e.target.type=="polygon"){
           
                        if (self.isEditDrawLine==false){
                            self.isEditDrawLine=true;
                            self.componentDraw().drawLine();
                        }else{
                            self.isEditDrawLine=true;
                            self.componentDraw().drawLine();
                        }

                    }

                    if (e.target.hasOwnProperty("controlType")){

                        switch (e.target.controlType)
                        {
                            case "arrow":
                                self.cunterObj=e.target;
                                self.componentDraw().drawArrowControl();
                            break;
                        }

                    }

                    


                }
    
            }
        }
        
        //鼠标框选组件事件监控
        this.mouseSelection=function(e){
            if (e.selected){
            //框选中组件
                if (e.selected.length==1){

                    if (self.isPixSelect==true || (self.isPixSelect==false && self.isShift==false)){
                        self.cunterObj=e.target;
                        self.selectedObject=[];
                        self.selectedObject[0]=e.selected[0];//self.cunterObj;
                        self.cunterObj=e.selected[0];
                        self.componentListener().selectedComponent(e);
                        return;
                    }else if (self.isPixSelect==false && self.isShift){

                        if (isEmpty(self.selectedObject)){
                            self.selectedObject=[];
                        }

                        if (e.target.hasOwnProperty("group")){
                            if (self.canvasDraw().isSelected(e.target.id)==false){
                                self.selectedObject.push(e.target);
                            }
                        }
                        return;

                    }
                    
                }
                self.selectedObject=e.selected; 
                self.cunterObj=self.selectedObject;
                self.attributesShow().selectedMultiple(e);

            }else if (e.target){
                    if (e.target.dType=="editGroupBg"){
                        //选中分组编辑背景
                        self.attributesShow().group();
                        return;
                    }
                    self.cunterObj=e.target;
                    self.selectedObject=[];
                    self.selectedObject[0]=self.cunterObj;
                    self.componentListener().selectedComponent(e);
                    return;
            }else{
            //框选未选中组件 
                self.cunterObj=null;
                self.selectedObject=null;
            }
        }

        
        return this;
    }
    
    //组件事件监控
    self.componentListener=function(parm=null){
        
        //选中组件事件
        this.selectedComponent=function(e,callback=null){
            // console.log("this.selectedComponent");
            if (e.hasOwnProperty("target") && e.target.hasOwnProperty("dType")){
                // if (e.target.dType=="editGroupBg" || (e.target.zIndex<self.editGroupZindex && self.undoGroupSource!=null)){
                if (e.target.dType=="editGroupBg"){
                    canvas.discardActiveObject(); 
                    canvas.renderAll();
                    return;
                }
            }
            self.selectedObject=[];
            if (e.selected){
                // console.log("this.selectedComponent 1");
                if (self.isPixSelect==true){
                    // console.log("this.selectedComponent 2");
                    self.selectedObject=e.selected;
                }else {
                    // console.log("this.selectedComponent 3");
                    if (!self.isShift){
                        self.selectedObject=e.selected;
                        // console.log("this.selectedComponent 4");
                    }else{

                        if (e.selected.hasOwnProperty("type")){
                            // console.log("this.selectedComponent 5");
                        }else{
                            // console.log("this.selectedComponent 6");
                            for (var i=0;i<e.selected;i++){

                                var _id=e.selected[i].id;
                                if (self.canvasDraw().isSelected(_id)==false){
                                    //add
                                    self.selectedObject.push(e.selected[i]);
                                }else{
                                    //delete
                                }

                            }

                        }


                    }

                }


            }else{
                self.selectedObject[0]=self.cunterObj;
                // console.log("this.selectedComponent 7");
            }
            if (self.cunterObj!=null){
                // console.log("this.selectedComponent 8");
                if (self.cunterObj.type){
                    if (self.cunterObj.dType){
                        if (self.cunterObj.dType=="paperBleed" || self.cunterObj.dType=="paperMargins" || self.cunterObj.dType=="paperBox" || self.cunterObj.dType=="paperSlice" || self.cunterObj.dType=="BackgroundImage" || self.cunterObj.dType=="alignmentLine" || self.cunterObj.dType=="panningBox"){
                            if (self.cunterObj.dType=="BackgroundImage" && self.cunterObj.lockMovementX==false){
                                self.cunterObj.set({lockScalingX:false,lockScalingY:false});
                            }
                            self.attributesShow().paper();
                            return;
                        }
                    }
                    // console.log("this.selectedComponent 9");
                    switch(self.cunterObj.type)
                    {
                        case "textbox":
                            if (!self.cunterObj.hasOwnProperty("dType")){
                                self.cunterObj.set({dType:'text'});
                            }
                            //如果是文格格式刷状态
                            if (self.textStyle!=null){
                                //颜色这里要分开处理，要不不生效。
                                self.cunterObj.set({
                                    fill:self.textStyle.fill,
                                    fillCmyk:self.textStyle.fillCmyk,
                                })
                                canvas.renderAll();
                                
                                self.cunterObj.fill=self.textStyle.fill;
                                self.cunterObj.fillCmyk=self.textStyle.fillCmyk;
                                
                                //字间距、行间距
                                self.cunterObj.lineHeight=self.textStyle.lineHeight;
                                self.cunterObj.charSpacing=self.textStyle.charSpacing;
                                
                                //字体、大小、斜体、正体、加粗、对齐
                                self.cunterObj.fontSize=self.textStyle.fontSize;
                                self.cunterObj.fontFamily=self.textStyle.fontFamily;
                                self.cunterObj.textAlign=self.textStyle.textAlign;
                                self.cunterObj.fontStyle=self.textStyle.fontStyle;
                                self.cunterObj.fontWeight=self.textStyle.fontWeight;
                                self.cunterObj.fontPt=self.textStyle.fontPt;

                                //阴影
                                self.cunterObj.shadow=self.textStyle.shadow;
                                //比例
                                self.cunterObj.scaleX=self.textStyle.scaleX;
                                self.cunterObj.scaleY=self.textStyle.scaleY;
                                
                                //边框
                                self.cunterObj.strokeWidth=self.textStyle.strokeWidth;
                                if (self.textStyle.hasOwnProperty("strokePt")){
                                    self.cunterObj.strokePt=self.textStyle.strokePt;
                                }
                                self.cunterObj.stroke=self.textStyle.stroke;
                                self.cunterObj.strokeCmyk=self.textStyle.strokeCmyk;
                                
                                //背景
                                self.cunterObj.backgroundColor=self.textStyle.backgroundColor;
                                self.cunterObj.backgroundColorCmyk=self.textStyle.backgroundColorCmyk;
                                
                                //角度
                                self.cunterObj.angle=self.textStyle.angle;
                                
                                self.textStyle=null;
                                canvas.defaultCursor ='default',canvas.hoverCursor='default';
                                canvas.renderAll();
                            }

                            if (self.cunterObj.hasOwnProperty("isEditing")){

                                if (self.cunterObj.isEditing==true){
                                    self.isEditText=true;
                                }else{
                                    self.isEditText=false;
                                }

                            }else{
                                self.isEditText=false;
                            }

                            self.componentDraw().drawComponentControls(self.cunterObj);
                            self.attributesShow().textBox();
                        break;
                        case "shape":
                            self.componentDraw().drawComponentControls(self.cunterObj);
                            self.attributesShow().shape();
                        break;
                        case "rect":
                            if (!self.cunterObj.hasOwnProperty("dType")){
                                self.cunterObj.set({dType:'shape'});
                            }
                            self.componentDraw().drawComponentControls(self.cunterObj);
                            self.attributesShow().shape();
                        break;
                        case "circle":
                        case "ellipse":
                            if (!self.cunterObj.hasOwnProperty("dType")){
                                self.cunterObj.set({dType:'shape'});
                            }
                            self.componentDraw().drawComponentControls(self.cunterObj);
                            self.attributesShow().shape();
                        break;
                        case "polygon":
                            if (!self.cunterObj.hasOwnProperty("dType")){
                                self.cunterObj.set({dType:'shape'});
                            }
                            self.componentDraw().drawComponentControls(self.cunterObj);
                            self.attributesShow().shape();
                            //self.componentDraw().drawLine();
                        break;
                        case "line":
                            if (!self.cunterObj.hasOwnProperty("dType")){
                                self.cunterObj.set({dType:'shape'});
                            }
                            self.attributesShow().shape();
                            self.componentDraw().drawLine();
                        break;
                        case "path":
                            if (!self.cunterObj.hasOwnProperty("dType")){
                                self.cunterObj.set({dType:'shape'});
                            }
                            self.componentDraw().drawComponentControls(self.cunterObj);
                            self.attributesShow().shape();
                        break;
                        case "image":
                            if (!self.cunterObj.hasOwnProperty("dType")){
                                self.cunterObj.set({dType:'Picture'});
                            }
                            if (self.cunterObj.dType=="Picture"){
                                self.attributesShow().picture();
                            }else if (self.cunterObj.dType=="productPicture"){
                                self.pageEvent.productPictureAttributes();
                            }else if (self.cunterObj.dType=="IconElement"){
                                self.attributesShow().iconElement();
                            }
                            self.componentDraw().drawComponentControls(self.cunterObj);
                        break;
                        case "group":
                            if (self.cunterObj.dType=="productPicture" || self.cunterObj.dType=="ProductPicture"){
                                self.cunterObj.dType="productPicture";//历史元件兼容
                                self.attributesShow().productPicture();
                            }else if (self.cunterObj.dType=="tmpGroup"){
                                self.attributesShow().group();
                            }else if (self.cunterObj.dType=="Product"){
                                self.attributesShow().product();
                            }else if (self.cunterObj.dType=="shape"){
                                self.cunterObj.dType='tmpGroup';
                                self.cunterObj.set({dType:'tmpGroup'});
                                self.attributesShow().group();
                                canvas.renderAll();
                            }else if (self.cunterObj.dType=="productPriceGroup"){
                            
                                self.cunterObj.set({lockScalingX:true,lockScalingY:true});
                                self.attributesShow().underlineText();
                            }
                            self.componentDraw().drawComponentControls(self.cunterObj);
                        break;
                        case "activeSelection":
                            var activeGroup = canvas.getActiveObject(); 
                            if (!isEmpty(activeGroup) && activeGroup.hasOwnProperty("_objects")){    
                                if (activeGroup._objects.length>1 && activeGroup.type=="activeSelection"){
                                    if (self.selectedObject[0]._objects){
                                        for(var i=0;i<self.selectedObject[0]._objects.length;i++){
                                            if (self.selectedObject[0]._objects[i].lockMovementX==true || self.selectedObject[0]._objects[i].lockMovementY==true || self.selectedObject[0]._objects[i].dType=="referenceLine"){
                                                //背景图只能点击选中，不能框选
                                                activeGroup.removeWithUpdate(self.selectedObject[0]._objects[i]);
                                                canvas.requestRenderAll();
                                            }
                                        }
                                        if (activeGroup._objects.length>1){
                                            self.selectedObject=activeGroup._objects;
                                        }
                                    }
                                    canvas.requestRenderAll();
                                    self.attributesShow().selectedMultiple();
                                    return false;
                                }
                            }
                        break;
                        
                    }
               
                }else{
                    //console.log(self.cunterObj);
                }
            }
        }
        
        //组件移动中监控事件
        this.moveingComponent=function(e,callback=null){

            if (e.target){

                //当选择模式为：穿透分组选中元素模式
                if (self.isPixSelect==false && e.target.type=="group"){
                    e.target.group.addWithUpdate();
                    e.target.group.setCoords();
                }

                if (self.isMoveLimit==true){
                    //限制组件移出画布外
                    var _this=e.target;
                    var theZoom=canvas.getZoom();

                    //画布偏移量
                    var pannPoint={x:canvas.viewportTransform[4],y:canvas.viewportTransform[5]};
                    var _thisZoom={};
                        _thisZoom.left=_this.left;
                        _thisZoom.top=_this.top;
                        _thisZoom.width=_this.width * _this.scaleX ;
                        _thisZoom.height=_this.height * _this.scaleY ;

                    var maxWidth=(theZoom<1)?canvas.width:canvas.width*theZoom;
                    var maxHeight=(theZoom<1)?canvas.height:canvas.height*theZoom;

                    if (_thisZoom.left<0){
                        _this.left=0;
                        if (_thisZoom.top<0){_this.top=0;}
                    }else if (_thisZoom.left+_thisZoom.width>maxWidth){

                        _this.left=(maxWidth  - _thisZoom.width) ;

                        if (_thisZoom.top + _thisZoom.height>maxHeight){

                            _this.top=(maxHeight - _thisZoom.height);

                        }else if (_thisZoom.top<0){
                            _this.top=0;
                        }
                    }else if (_thisZoom.top<0){
                        _this.top=0;
                    }else if (_thisZoom.top + _thisZoom.height>maxHeight){

                        _this.top=(maxHeight - _thisZoom.height);

                    }else if (_thisZoom.top + _thisZoom.height<0){
                        _this.left=0;
                        _this.top=0;
                    }

                    self.cunterObj=_this;
                    self.selectedObject=[];
                    self.selectedObject[0]=e.selected; 
                }

                //绘制智能对齐辅助线
                if (self.disAlignmentLine && self.alignmentLineObject!=null){

                    //清除画布中智能辅助线
                    var objs = canvas.getObjects().filter(function(o) {
                        if (o.get('dType') === 'alignmentLine') {
                            return o.set('active', true);
                        }
                    });
                    for (var i=objs.length-1;i>=0;i--){
                        canvas.remove(objs[i]);
                    }
                    canvas.renderAll();


                    var _canvasZoom=canvas.getZoom();
                    if (_canvasZoom>1){
                        var alignmentLineStrokeWidth=1 / _canvasZoom;
                    }else{
                        var alignmentLineStrokeWidth=1 / _canvasZoom;
                    }
                    
                    /* 绘制辅助线 */
                    //垂直绘线
                    if (self.alignmentLineObject.level.length){

                        var _left=parseInt(e.target.left);
                        var _centerPoint=parseInt(_left + e.target.width * e.target.scaleX * 0.5);
                        var _right=parseInt(_left + e.target.width * e.target.scaleX);

                        if (self.alignmentLineObject.level.indexOf(_left)!==-1){
                            var i=self.alignmentLineObject.level.indexOf(_left);
                            canvas.add(
                                 new fabric.Line([self.alignmentLineObject.level[i], 0,self.alignmentLineObject.level[i] ,canvas.height], {
                                     left: self.alignmentLineObject.level[i],
                                     top: 0, 
                                     dType:"alignmentLine",
                                     stroke: 'blue',
                                     strokeWidth:alignmentLineStrokeWidth 
                                 })
                            );
                            canvas.renderAll();
                        }


                        if (self.alignmentLineObject.level.indexOf(_centerPoint)!==-1){
                            var i=self.alignmentLineObject.level.indexOf(_centerPoint);
                            canvas.add(
                                 new fabric.Line([self.alignmentLineObject.level[i], 0,self.alignmentLineObject.level[i] ,canvas.height], {
                                     left: self.alignmentLineObject.level[i],
                                     top: 0, 
                                     dType:"alignmentLine",
                                     stroke: 'blue',
                                     strokeWidth:alignmentLineStrokeWidth
                                 })
                            );
                            canvas.renderAll();
                        }

                        if (self.alignmentLineObject.level.indexOf(_right)!==-1){
                            var i=self.alignmentLineObject.level.indexOf(_right);
                            canvas.add(
                                 new fabric.Line([self.alignmentLineObject.level[i], 0,self.alignmentLineObject.level[i] ,canvas.height], {
                                     left: self.alignmentLineObject.level[i],
                                     top: 0, 
                                     dType:"alignmentLine",
                                     stroke: 'blue',
                                     strokeWidth:alignmentLineStrokeWidth
                                 })
                            );
                            canvas.renderAll();
                        }

                    }

                    //水平绘线
                    if (self.alignmentLineObject.vertical.length){

                        var _top=parseInt(e.target.top);
                        var _centerPoint=parseInt(_left + e.target.height * e.target.scaleY * 0.5);
                        var _bottom=parseInt(_left + e.target.height * e.target.scaleY);

                        if (self.alignmentLineObject.vertical.indexOf(_top)!==-1){
                            var i=self.alignmentLineObject.vertical.indexOf(_top);
                            canvas.add(
                                 new fabric.Line([0,self.alignmentLineObject.vertical[i],canvas.width, self.alignmentLineObject.vertical[i]], {
                                     left: 0,
                                     top: self.alignmentLineObject.vertical[i], 
                                     dType:"alignmentLine",
                                     stroke: 'blue',
                                     strokeWidth:alignmentLineStrokeWidth 
                                 })
                            );
                            canvas.renderAll();
                        }


                        if (self.alignmentLineObject.vertical.indexOf(_centerPoint)!==-1){
                            var i=self.alignmentLineObject.vertical.indexOf(_centerPoint);
                            canvas.add(
                                 new fabric.Line([0,self.alignmentLineObject.vertical[i],canvas.width, self.alignmentLineObject.vertical[i]], {
                                     left: 0,
                                     top: self.alignmentLineObject.vertical[i], 
                                     dType:"alignmentLine",
                                     stroke: 'blue',
                                     strokeWidth:alignmentLineStrokeWidth
                                 })
                            );
                            canvas.renderAll();
                        }

                        if (self.alignmentLineObject.vertical.indexOf(_bottom)!==-1){
                            var i=self.alignmentLineObject.vertical.indexOf(_bottom);
                            canvas.add(
                                 new fabric.Line([0,self.alignmentLineObject.vertical[i],canvas.width, self.alignmentLineObject.vertical[i]], {
                                     left: 0,
                                     top: self.alignmentLineObject.vertical[i], 
                                     dType:"alignmentLine",
                                     stroke: 'blue',
                                     strokeWidth:alignmentLineStrokeWidth
                                 })
                            );
                            canvas.renderAll();
                        }

                    }

                }



            }else{
                self.cunterObj=null;
                self.selectedObject=[];
            }
        }

    
        //组件移动完成监控事件
        this.movedComponent=function(e,callback=null){
          
            if (e.target){
                if (self.isMoveLimit==true){    
                    //限制组件移出画布外
                    var _this=e.target;
                    var theZoom=canvas.getZoom();
                    //画布偏移量
                    var pannPoint={x:canvas.viewportTransform[4],y:canvas.viewportTransform[5]};

                    var _thisZoom={};
                        _thisZoom.left=_this.left;
                        _thisZoom.top=_this.top;
                        _thisZoom.width=_this.width * _this.scaleX;
                        _thisZoom.height=_this.height * _this.scaleY;
                    
                    var maxWidth=(theZoom<1)?canvas.width:canvas.width*theZoom;
                    var maxHeight=(theZoom<1)?canvas.height:canvas.height*theZoom;

                    if (_thisZoom.left<0){
                        _this.left=0;
                        if (_thisZoom.top<0){_this.top=0;}
                    }else if (_thisZoom.left+_thisZoom.width>maxWidth){

                        _this.left=(maxWidth  - _thisZoom.width);

                        if (_thisZoom.top + _thisZoom.height>maxHeight){

                            _this.top=(maxHeight - _thisZoom.height);

                        }else if (_thisZoom.top<0){
                            _this.top=0;
                        }
                    }else if (_thisZoom.top<0){
                        _this.top=0;
                    }else if (_thisZoom.top + _thisZoom.height>maxHeight){

                        _this.top=(maxHeight - _thisZoom.height);

                    }else if (_thisZoom.top + _thisZoom.height<0){
                        _this.left=0;
                        _this.top=0;
                    }
                    self.cunterObj=_this;
                    self.selectedObject=[];
                    self.selectedObject[0]=e.selected; 
                }
            }else{
                self.cunterObj=null;
                self.selectedObject=[];
            }

        }   
    
        //拉伸正行中组件事件
        this.scalingComponent=function(e,callback=null){
          
        }
        
        //拉伸已完成组件事件
        this.scaledComponent=function(e,callback=null){
            if (e.target){
                var _this=e.target;
                //文本类组件限制拉伸
                if (_this.type=="textbox"){
                    _this.width=_this.width * _this.scaleX;
                    _this.height=_this.height * _this.scaleY;
                    _this.fontSize=parseInt(_this.fontSize * _this.scaleY);
                    _this.fontPt=parseInt(_this.fontPt * _this.scaleY);
                    _this.scaleX=1;
                    _this.scaleY=1;
                    self.cunterObj=_this;
                    canvas.renderAll();
                }else if (_this.type=="circle"){

                    var sourceStrokeWidth=self.cunterObj.strokeWidth;

                    if (e.transform.original.scaleX==_this.scaleX && e.transform.original.scaleY>_this.scaleY){
                        //缩小
                        var newStrokeWidth=Math.ceil(_this.strokeWidth * _this.scaleY);

                    }else if (e.transform.original.scaleX==_this.scaleX && e.transform.original.scaleY<_this.scaleY){
                        
                        var newStrokeWidth=Math.ceil(_this.strokeWidth * _this.scaleY);

                    }else if (e.transform.original.scaleX>_this.scaleX && e.transform.original.scaleY==_this.scaleY){
                        
                        var newStrokeWidth=Math.ceil(_this.strokeWidth * _this.scaleX);

                    }else if (e.transform.original.scaleX<_this.scaleX && e.transform.original.scaleY==_this.scaleY){
                        
                        var newStrokeWidth=Math.ceil(_this.strokeWidth * _this.scaleX);

                    }else if (e.transform.original.scaleX!=_this.scaleX && e.transform.original.scaleY!=_this.scaleY){
                        
                        if (_this.scaleX>_this.scaleY){
                            var newStrokeWidth=Math.ceil(_this.strokeWidth * _this.scaleX);
                        }else{
                            var newStrokeWidth=Math.ceil(_this.strokeWidth * _this.scaleY);
                        }

                    }else{
                        // console.log("Scale=>",_this.scaleX,_this.scaleY);
                    }

                    newStrokeWidth=sourceStrokeWidth*0.99;
                    self.cunterObj.set({strokeWidth:newStrokeWidth,width:_this.width,height:_this.height});
                    canvas.renderAll();
                    canvas.requestRenderAll();

                }else if (_this.type=="rect"){

                    var sourceStrokeWidth=self.cunterObj.strokeWidth;
                    _this.width=_this.width * _this.scaleX;
                    _this.height=_this.height * _this.scaleY;
                    canvas.requestRenderAll();
                    
                    if (e.transform.original.scaleX==_this.scaleX && e.transform.original.scaleY>_this.scaleY){
                        //缩小
                        var newStrokeWidth=Math.ceil(_this.strokeWidth * _this.scaleY)

                    }else if (e.transform.original.scaleX==_this.scaleX && e.transform.original.scaleY<_this.scaleY){
                        
                        var newStrokeWidth=Math.ceil(_this.strokeWidth * _this.scaleY);

                    }else if (e.transform.original.scaleX>_this.scaleX && e.transform.original.scaleY==_this.scaleY){
                        
                        var newStrokeWidth=Math.ceil(_this.strokeWidth * _this.scaleX);

                    }else if (e.transform.original.scaleX<_this.scaleX && e.transform.original.scaleY==_this.scaleY){
                        
                        var newStrokeWidth=Math.ceil(_this.strokeWidth * _this.scaleX);

                    }else if (e.transform.original.scaleX!=_this.scaleX && e.transform.original.scaleY!=_this.scaleY){
                        
                        if (_this.scaleX>_this.scaleY){
                            var newStrokeWidth=Math.ceil(_this.strokeWidth * _this.scaleX);
                        }else{
                            var newStrokeWidth=Math.ceil(_this.strokeWidth * _this.scaleY);
                        }

                    }else{
                        // console.log("Scale=>",_this.scaleX,_this.scaleY);
                    }
                    
                    if (newStrokeWidth==e.transform.target.strokeWidth){
                        if (newStrokeWidth-1>=1){
                            newStrokeWidth=newStrokeWidth-1;
                        }
                    }else{
                        if (newStrokeWidth<1){
                            newStrokeWidth=1;
                        }
                    }

                    self.componentDraw().scaleObjectFill(self.cunterObj,_this.scaleX*1,_this.scaleY * 1);
            
                    newStrokeWidth=sourceStrokeWidth*1;
                    self.cunterObj.scaleX=1;
                    self.cunterObj.scaleY=1;
                    self.cunterObj.set({strokeWidth:newStrokeWidth,width:(_this.width+newStrokeWidth*1),height:(_this.height+newStrokeWidth*1)});
                    canvas.renderAll();
                    self.cunterObj.setCoords();
                    self.cunterObj.set({width:(self.cunterObj.width-newStrokeWidth*1),height:(self.cunterObj.height-newStrokeWidth*1)});
                    //self.cunterObj.setCoords();
                    //canvas.renderAll();
                    canvas.requestRenderAll();

                }else{

                    if (_this.dType=="productPriceGroup"){
                        self.componentListener().updateProductLineText();
                    }

                    if (_this.type=="group"){
                        _this.addWithUpdate();
                        _this.setCoords();
                    }

                }

            }

            //e.target._clearCache();
        }
        


        return this;
    }
    
    //组件会制
    self.componentDraw=function(parm=null){
        var _parent=this;
        
        //缩放图形时，渐变色处理
        this.scaleObjectFill=function(scaleObj,scaleX,scaleY){

            if (scaleObj.fill.hasOwnProperty("coords") && scaleObj.fill.hasOwnProperty("type")){

                switch (scaleObj.fill.type){
                    case "radial":
                        scaleObj.fill.gradientTransform[0]=scaleX * scaleObj.fill.gradientTransform[0];
                        scaleObj.fill.gradientTransform[3]=scaleY * scaleObj.fill.gradientTransform[3];
                        scaleObj.fill.gradientTransform[4]=scaleX * scaleObj.fill.gradientTransform[4];
                        scaleObj.fill.gradientTransform[5]=scaleY * scaleObj.fill.gradientTransform[5];
                        scaleObj.fill.offsetX=scaleX * scaleObj.fill.offsetX;
                        scaleObj.fill.offsetY=scaleY * scaleObj.fill.offsetY;
                    break;
                    case "linear":
                        scaleObj.fill.gradientTransform[4]=scaleX * scaleObj.fill.gradientTransform[4];
                        scaleObj.fill.gradientTransform[5]=scaleY * scaleObj.fill.gradientTransform[5];
                        scaleObj.fill.gradientTransform[0]=scaleX * scaleObj.fill.gradientTransform[0];
                        scaleObj.fill.gradientTransform[3]=scaleY * scaleObj.fill.gradientTransform[3];
                        scaleObj.fill.offsetX=scaleX * scaleObj.fill.offsetX;
                        scaleObj.fill.offsetY=scaleY * scaleObj.fill.offsetY;
                    break;

                }

            }
        }
    
        //获取组件旋转中心点
        this.setObjectrotateXY=function(setObj=null){

            if (setObj==null && self.cunterObj!=null){
                setObj=self.cunterObj;
            }

            if (setObj!=null){
                var _rotate=setObj.getCenterPoint();
                _rotate.x=_rotate.x - self.canvasPaddX;
                _rotate.y=_rotate.y - self.canvasPaddY;
                setObj.set({rotateXY:_rotate});
            }   

        }


        //插入普通文本
        this.insertText=function(parm=null,callback=null){
            var textObj=new fabric.Textbox("Text", { 
              fontFamily: (!parm.fontFamily)?self.canvasConfig.defauleFontFamily:parm.fontFamily, 
              fontPt: self.canvasConfig.defauleFontPt,
              fontSize: self.canvasConfig.lastFontSize, 
              fill:"#000000",
              fillCmyk:"75,68,67,90",
              left:self.insertX,
              top: self.insertY,
              lineHeight:1,
              zIndex:self.getCanvasObjCount(),
              id:self.createID(),
              dtypeIndex:self.createTypeIndex("text"),
              text:"Text",
              insertText:'',
              //path: 文字整体的走向(新增的,我写文档的时候处于测试阶段);比如实现文字的环绕
              //paintFirst: 先绘制描边还是填充，默认fill,先绘制填充添加的描边是内描边,修改stroke，将变成外描边
              //paintFirst:'stroke',
              width:(self.canvasConfig.defauleFontSize * 4.5),
              dType:"text",
              type:"textbox",
              strokeWidth: 0,
              paintFirst:'stroke', 
              //先绘制描边还是填充，默认fill,先绘制填充添加的描边是内描边,修改stroke，将变成外描边
              splitByGrapheme:true
              //禁止自动换行
             }); 
             
             canvas.add(textObj).setActiveObject(textObj).renderAll();
             self.cunterObj=textObj;
             if (self.undoGroupSource!=null){
                self.cunterObj.parentID=self.undoGroupSource.id;
                self.cunterObj.sortPath=canvas._objects.length - 2;
             }else{
                self.cunterObj.sortPath=canvas._objects.length - 3;
             }
             
             self.layer.canvasOperation.createComponent(self.cunterObj);
             
            //事务描述
            var msg = "Insert Text";
            self.canvasSave().canvasHistoryRecordCall(msg);

             (callback && typeof(callback) === "function") && callback();
        };
                
        //插入商品 非划线 文本类组件
        this.insertProductText=function(parm=null,callback=null){
            var textObj=new fabric.Textbox(parm.name, { 
              fontFamily: "freeserif", 
              fontPt: self.canvasConfig.defauleFontPt, 
              fontSize: self.canvasConfig.defauleFontSize, 
              lineHeight:1,
              fill:"#000000",
              fillCmyk:"75,68,67,90",
              left:self.insertX,
              top: self.insertY,
              zIndex:self.getCanvasObjCount(),
              dtypeIndex:self.createTypeIndex("text"),
              id:self.createID(),
              text:parm.name,
              //邦定数据字段
              dataFiled:parm.dataFiled,
              insertText:parm.insertText,
              //附加在标签前文本
              editable:false,
              width:140,
              dType:parm.dType,
              strokeWidth: 0,
              scaleX:1,
              scaleY:1,
              type:"textbox",
              paintFirst:'stroke',
              splitByGrapheme:true,
              //lockScalingY:true,
              //lockScalingX:true
             }); 
             
             if (parm.hasOwnProperty("lkSort")){
                 textObj.set({lkSort:parm.lkSort});
             }
             
             canvas.add(textObj).setActiveObject(textObj).renderAll();
             self.cunterObj=textObj;
             if (self.undoGroupSource!=null){
                self.cunterObj.parentID=self.undoGroupSource.id;
                self.cunterObj.sortPath=canvas._objects.length - 1;
             }else{
                self.cunterObj.sortPath=canvas._objects.length;
             }
             
             self.layer.canvasOperation.createComponent(self.cunterObj);
             (callback && typeof(callback) === "function") && callback();
        };        
        
        //插入商品 划线 文本类组件
        this.insertProductLineText=function(parm=null,callback=null){

            var _fontSize=12;
            var textObj=new fabric.IText(parm.name, { 
              fontFamily:'freeserif', 
              fontSize: _fontSize, 
              fontPt:(_fontSize * 72 / self.paperSize.paperDPI).toFixed(1), 
              fill:"#000000",
              fillCmyk:"75,68,67,90",
              textAlign:'left',
              lineHeight:1,
              left:self.insertX,
              top: self.insertY,
              text:parm.name,
              dType:"productPriceText",
              strokeWidth: 0,
              visible:true,
              originY:'middle',
              scaleX:1,
              scaleY:1
             });


            self.computeFontSize(parm.name, textObj.fontSize, textObj.fontFamily,2,thumbnailCanvas,thumbnailContext,function(res){

                //console.log("res",res);

                if (res.y1==res.y2){

                }

                var data={};
                data.left=self.insertX;
                data.top=self.insertY;
                data.width=textObj.width;
                data.height=textObj.height;
                data.scaleX=1;
                data.scaleY=1;

                var x1,y1,x2,y2;
                
                    x1=textObj.left;
                    y1=textObj.top + textObj.fontSize - (textObj.height - textObj.fontSize)/1;
                    
                    x2=textObj.left + textObj.width;
                    y2=y1-0;


                var line = new fabric.Line(
                    [x1, y1, x2, y2], 
                    {
                        fill: '#000000',
                        fillCmyk:"75,68,67,90",
                        stroke: '#000000',
                        strokeCmyk:"75,68,67,90",
                        visible:true,
                        strokeWidth:1
                });
               

                var idName=self.createID();

                var configParma={};
                configParma.width=textObj.width;
                configParma.height=textObj.height;
                configParma.left=textObj.left;
                configParma.top=textObj.top;
                configParma.lockScalingX=true;
                configParma.lockScalingY=true;

                configParma.zIndex=self.getCanvasObjCount();
                configParma.dType="productPriceGroup";
                configParma.dtypeIndex=self.createTypeIndex(parm.dType),
                configParma.dataFiled=parm.dataFiled,
                configParma.insertText=parm.insertText,
                //附加在标签前文本
                configParma.id=idName;
                configParma.angle=0;

                _parent.createGroup(configParma,[textObj,line],function(group){

                    var offsetX1=(0.1 * res.w<3)?-3:-0.1 * res.w;
                    var offsetX2=(0.1 * res.w<3)?3:0.1 * res.w;

                    group.set({height:res.y2,width: (textObj.width - offsetX1 + offsetX2) });

                    var new_y2=group.height/2 - (group.height - res.y1) - 3;
                    var new_y1=group.height/2 - (group.height - res.y2) - 3;

                    group.item(0).set({left:(textObj.width/2*-1),top:(textObj.height/2 * -1)});
                    group.item(1).set({x1:(textObj.width/2*-1 + offsetX1),y1:new_y1,x2:(textObj.width/2 + offsetX2),y2:new_y2});
                    
                    if (group.item(1).scaleX*1!=1 || group.item(1).scaleY*1!=1){
                        var _pi=(group.item(1).scaleX>group.item(1).scaleY)?group.item(1).scaleX:group.item(1).scaleY;
                        var _strokeWidth=group.item(1).strokeWidth * _pi;
                        group.item(1).set({strokeWidth:_strokeWidth,scaleX:1,scaleY:1});
                    }
                    
                    group.setCoords();
                    canvas.setActiveObject(group);
                    canvas.renderAll();
                    self.cunterObj=group;
                    if (self.undoGroupSource!=null){
                       self.cunterObj.parentID=self.undoGroupSource.id;
                    }
                    self.cunterObj.sortPath=canvas._objects.length -1 ;
                    // self.layer.canvasOperation.createComponent(self.cunterObj);

                });
                (callback && typeof(callback) === "function") && callback(true);
            });
        }; 


        //更新划线文本
        this.updateProductLineText=function(parm=null,callback=null){

            if (self.cunterObj!=null && self.cunterObj.dType=="productPriceGroup"){

                var _this=self.cunterObj;
                var _left=_this.left;
                var _top=_this.top;

                //划线价文本组件(type=group)
                if (_this._objects[0].type=="i-text"){
                    var _textObj=_this._objects[0]; 
                    var _lineObj=_this._objects[1]; 
                    var _textIndex=0,_lineIndex=1;
                }else{
                    var _textObj=_this._objects[1];
                    var _lineObj=_this._objects[0];
                    var _textIndex=1,_lineIndex=0;
                }

                var maxScale=(_this.scaleX>_this.scaleY)?_this.scaleX:_this.scaleY;
                var setSize=null,setText=null;
                if (parm!=null){
                    if (parm.fontSize){
                        setSize=parm.fontSize;
                    }
                    if (parm.text){
                        setText=parm.text;
                    }

                }

                
                if (setSize==null){
                    if (_this.scaleX==1){
                        // height zoom
                        var newSize=parseInt(_this.scaleY * _this._objects[_textIndex].fontSize);
                        
                    }else{
                        // width zoom
                        if (_this.width>_this.width * _this.scaleX){
                            //缩小
                            var pi=1 - (_this.width - _this.width * _this.scaleX)/ (_this.width * (_this._objects[_textIndex].text).length * _this._objects[_textIndex].fontSize);
                            var newSize=Math.ceil(pi * _this._objects[_textIndex].fontSize);
                            maxScale=pi;
                        }else{
                            //放大
                            var pi=1 - (_this.width - _this.width * _this.scaleX)/ (_this.width * (_this._objects[_textIndex].text).length * _this._objects[_textIndex].fontSize);
                            var newSize=Math.ceil(pi * _this._objects[_textIndex].fontSize);
                            maxScale=pi;
                        }
                   
                    }

                }else{
                    var newSize=setSize;
                }

                if (setText!=null){
                    _this._objects[_textIndex].set({text:setText});
                }

                _this._objects[_textIndex].set({fontSize:newSize});
                _this._objects[_textIndex].set({fontPt:newSize});
                _this._objects[_textIndex].set({scaleX:1});
                _this._objects[_textIndex].set({scaleY:1});

                var sourceStrokeWidth=_this._objects[_lineIndex].strokeWidth;
                var newStrokeWidth=(sourceStrokeWidth * maxScale).toFixed(1)*1; //2022-11-15临时注释
                // var newStrokeWidth=sourceStrokeWidth;
                if (newStrokeWidth < 0.1){
                    _this._objects[_lineIndex].set({strokeWidth:0.1});
                }else{
                    _this._objects[_lineIndex].set({strokeWidth:newStrokeWidth});
                }
                _this._objects[_lineIndex].set({scaleX:1});
                _this._objects[_lineIndex].set({scaleY:1});

                var lineWidth=_this.item(1).strokeWidth;
                _this.setCoords();

                /*self.computeFontSize(_this._objects[_textIndex].text, newSize, _this._objects[_textIndex].fontFamily,lineWidth,thumbnailCanvas,thumbnailContext,function(res){
                    

                    if (newSize>=12){
                        var new_y2=newSize/2- (newSize - res.y1) - 3 - lineWidth;
                        var new_y1=newSize/2 - (newSize - res.y2) - 3 + lineWidth;
                            new_y1=(new_y1 - new_y2<=res.h/2)?new_y1+3:new_y1;
                    }else{
                        var new_y2=Math.abs(newSize - res.y2)/2*-1 - lineWidth;
                        var new_y1=newSize/2 - (newSize - res.y2) ;
                            new_y1=(new_y1 - new_y2<=res.h/2)?new_y1:new_y1;
                    }


                    var offsetX1=(0.1 * res.w<3)?-3:-0.1 * res.w;
                    var offsetX2=(0.1 * res.w<3)?3:0.1 * res.w;

                    _this.item(0).set({left:(_this.item(0).width/2*-1),top:(_this.item(0).height/2 * -1)});
                 
                    _this.item(1).set({x1:(_this.item(0).left + offsetX1),y1:new_y1,x2:(_this.item(0).width + _this.item(0).left + offsetX2),y2:new_y2});
                    
                    if (_this.item(1).hasOwnProperty("id")==false){
                        _this.item(1).id=self.createID();
                    }
                    
                    _this.set({left:_left,top:_top,width:(_this.item(1).x2-_this.item(1).x1),height:(res.h)});
                    _this.setCoords();
                    
                    //_this.addWithUpdate();

                    canvas.renderAll();

                });*/
       
                self.computeFontSize(_this._objects[_textIndex].text, newSize, _this._objects[_textIndex].fontFamily,lineWidth,thumbnailCanvas,thumbnailContext,function(res){
                    console.log(res);
                    if (newSize>=12){
                        var new_y2=newSize/2- (newSize - res.y1) - 3 - lineWidth;
                        var new_y1=newSize/2 + lineWidth;
                    }else{
                        var new_y2=Math.abs(newSize)/2*-1 + lineWidth;
                        var new_y1=newSize/2 + lineWidth;
                    }
                   
                    var offsetX1=-0.2 * newSize;
                    var offsetX2=0.2 * newSize;

                    // _this.item(0).set({left:(_this.item(0).width/2*-1),top:(_this.item(0).height/2 * -1)});20230511
                    var textHeight=_this.item(0).height;
                    _this.item(0).set({left:(_this.item(0).width/2*-1),top:(textHeight/2 * -1),nanTop:(textHeight/2 * -1)});
                    _this.item(1).set({x1:(_this.item(0).left + offsetX1),y1:new_y1,x2:(_this.item(0).width + _this.item(0).left + offsetX2),y2:new_y2});
                    
                    if (_this.item(1).hasOwnProperty("id")==false){
                        _this.item(1).id=self.createID();
                    }
                    console.log(_this);
                    _this.addWithUpdate();
                    _this.setCoords();
                    // _this._objects[0].top=(textHeight/2 * -1);
                    // _this.left=_this.left - lineWidth/2;
                    // _this.top=_this.top - lineWidth/2;
                    _this.left=_left;
                    _this.top=_top;
                    
                    canvas.renderAll();

                });

            }         
        }

        //批量更新划线价
        this.updateMoreProductLineText=function(parm=null,callback=null){

            if (parm.cunterObj!=null && parm.cunterObj.dType=="productPriceGroup"){
                console.log("批量更新划线价");
                var _this=parm.cunterObj;
                var _left=_this.left;
                var _top=_this.top;

                //划线价文本组件(type=group)
                if (_this._objects[0].type=="i-text"){
                    var _textObj=_this._objects[0]; 
                    var _lineObj=_this._objects[1]; 
                    var _textIndex=0,_lineIndex=1;
                }else{
                    var _textObj=_this._objects[1];
                    var _lineObj=_this._objects[0];
                    var _textIndex=1,_lineIndex=0;
                }

                var maxScale=(_this.scaleX>_this.scaleY)?_this.scaleX:_this.scaleY;
                var setSize=null,setText=null;
                if (parm!=null){
                    if (parm.fontSize){
                        setSize=parm.fontSize;
                    }
                    if (parm.text){
                        setText=parm.text;
                    }

                }

                
                if (setSize==null){
                    if (_this.scaleX==1){
                        // height zoom
                        var newSize=parseInt(_this.scaleY * _this._objects[_textIndex].fontSize);
                        
                    }else{
                        // width zoom
                        if (_this.width>_this.width * _this.scaleX){
                            //缩小
                            var pi=1 - (_this.width - _this.width * _this.scaleX)/ (_this.width * (_this._objects[_textIndex].text).length * _this._objects[_textIndex].fontSize);
                            var newSize=Math.ceil(pi * _this._objects[_textIndex].fontSize);
                            maxScale=pi;
                        }else{
                            //放大
                            var pi=1 - (_this.width - _this.width * _this.scaleX)/ (_this.width * (_this._objects[_textIndex].text).length * _this._objects[_textIndex].fontSize);
                            var newSize=Math.ceil(pi * _this._objects[_textIndex].fontSize);
                            maxScale=pi;
                        }
                   
                    }

                }else{
                    var newSize=setSize;
                }

                if (setText!=null){
                    _this._objects[_textIndex].set({text:setText});
                }

                _this._objects[_textIndex].set({fontSize:newSize});
                _this._objects[_textIndex].set({fontPt:newSize});
                _this._objects[_textIndex].set({scaleX:1});
                _this._objects[_textIndex].set({scaleY:1});

                var sourceStrokeWidth=_this._objects[_lineIndex].strokeWidth;
                //var newStrokeWidth=(sourceStrokeWidth * maxScale).toFixed(1)*1; 2022-11-15临时注释
                var newStrokeWidth=sourceStrokeWidth;
                if (newStrokeWidth < 0.1){
                    _this._objects[_lineIndex].set({strokeWidth:0.1});
                }else{
                    _this._objects[_lineIndex].set({strokeWidth:newStrokeWidth});
                }
                _this._objects[_lineIndex].set({scaleX:1});
                _this._objects[_lineIndex].set({scaleY:1});

                var lineWidth=_this.item(1).strokeWidth;
                _this.setCoords();

                self.computeFontSize(_this._objects[_textIndex].text, newSize, _this._objects[_textIndex].fontFamily,lineWidth,thumbnailCanvas,thumbnailContext,function(res){
                    

                    if (newSize>=12){
                        var new_y2=newSize/2- (newSize - res.y1) - 3 - lineWidth;
                        var new_y1=newSize/2 - (newSize - res.y2) - 3 + lineWidth;
                            new_y1=(new_y1 - new_y2<=res.h/2)?new_y1+3:new_y1;
                    }else{
                        var new_y2=Math.abs(newSize - res.y2)/2*-1 - lineWidth;
                        var new_y1=newSize/2 - (newSize - res.y2) ;
                            new_y1=(new_y1 - new_y2<=res.h/2)?new_y1:new_y1;
                    }


                    var offsetX1=(0.1 * res.w<3)?-3:-0.1 * res.w;
                    var offsetX2=(0.1 * res.w<3)?3:0.1 * res.w;

                    _this.item(0).set({left:(_this.item(0).width/2*-1),top:(_this.item(0).height/2 * -1)});
                 
                    _this.item(1).set({x1:(_this.item(0).left + offsetX1),y1:new_y1,x2:(_this.item(0).width + _this.item(0).left + offsetX2),y2:new_y2});

                    _this.set({left:_left,top:_top,width:(_this.item(1).x2-_this.item(1).x1),height:(res.h)});
                    _this.setCoords();
                    
                    //_this.addWithUpdate();

                    canvas.renderAll();

                });


            }         
        }


        this.updateProductLineText_bak=function(parm=null,callback=null){

            if (self.cunterObj!=null && self.cunterObj.dType=="productPriceGroup"){

                var _this=self.cunterObj;
                var _left=_this.left;
                var _top=_this.top;

                //划线价文本组件(type=group)
                if (_this._objects[0].type=="i-text"){
                    var _textObj=_this._objects[0]; 
                    var _lineObj=_this._objects[1]; 
                    var _textIndex=0,_lineIndex=1;
                }else{
                    var _textObj=_this._objects[1];
                    var _lineObj=_this._objects[0];
                    var _textIndex=1,_lineIndex=0;
                }

                var maxScale=(_this.scaleX>_this.scaleY)?_this.scaleX:_this.scaleY;
                var setSize=null,setText=null;
                if (parm!=null){
                    if (parm.fontSize){
                        setSize=parm.fontSize;
                    }
                    if (parm.text){
                        setText=parm.text;
                    }

                }

                
                if (setSize==null){
                    if (_this.scaleX==1){
                        // height zoom
                        var newSize=parseInt(_this.scaleY * _this._objects[_textIndex].fontSize);
                        
                    }else{
                        // width zoom
                        if (_this.width>_this.width * _this.scaleX){
                            //缩小
                            var pi=1 - (_this.width - _this.width * _this.scaleX)/ (_this.width * (_this._objects[_textIndex].text).length * _this._objects[_textIndex].fontSize);
                            var newSize=Math.ceil(pi * _this._objects[_textIndex].fontSize);
                            maxScale=pi;
                        }else{
                            //放大
                            var pi=1 - (_this.width - _this.width * _this.scaleX)/ (_this.width * (_this._objects[_textIndex].text).length * _this._objects[_textIndex].fontSize);
                            var newSize=Math.ceil(pi * _this._objects[_textIndex].fontSize);
                            maxScale=pi;
                        }
                   
                    }

                }else{
                    var newSize=setSize;
                }

                if (setText!=null){
                    _this._objects[_textIndex].set({text:setText});
                }

                _this._objects[_textIndex].set({fontSize:newSize});
                _this._objects[_textIndex].set({fontPt:newSize});
                _this._objects[_textIndex].set({scaleX:1});
                _this._objects[_textIndex].set({scaleY:1});

                var sourceStrokeWidth=_this._objects[_lineIndex].strokeWidth;
                var newStrokeWidth=(sourceStrokeWidth * maxScale).toFixed(1)*1;

                if (newStrokeWidth < 0.1){
                    _this._objects[_lineIndex].set({strokeWidth:0.1});
                }else{
                    _this._objects[_lineIndex].set({strokeWidth:newStrokeWidth});
                }
                _this._objects[_lineIndex].set({scaleX:1});
                _this._objects[_lineIndex].set({scaleY:1});

                var lineWidth=_this.item(1).strokeWidth;
                _this.setCoords();

                self.computeFontSize(_this._objects[_textIndex].text, newSize, _this._objects[_textIndex].fontFamily,lineWidth,thumbnailCanvas,thumbnailContext,function(res){

                    var new_y2=newSize/2- (newSize - res.y1) - 3;
                    var new_y1=newSize/2 - (newSize - res.y2) - 3;
                        new_y1=(new_y1 - new_y2<=res.h/2)?new_y1+3:new_y1;

                    var offsetX1=(0.1 * res.w<3)?-3:-0.1 * res.w;
                    var offsetX2=(0.1 * res.w<3)?3:0.1 * res.w;

                    _this.item(0).set({left:(_this.item(0).width/2*-1),top:(_this.item(0).height/2 * -1)});
                    _this.item(1).set({x1:(_this.item(0).left + offsetX1),y1:new_y1,x2:(_this.item(0).width + _this.item(0).left + offsetX2),y2:new_y2});

                    _this.set({left:_left,top:_top,width:(_this.item(1).x2-_this.item(1).x1),height:(res.h)});
                    _this.setCoords();
                    
                    //_this.addWithUpdate();

                    canvas.renderAll();

                });


            }         
        }

        //插入当前页面码
        this.insertPageNo=function(parm=null,callback=null){
            
            if (self.undoGroupSource!=null){
                self.componentDraw().composeGroup();
                setTimeout(function() {    
                    canvas.discardActiveObject();
                    self.cunterObj=null;
                    self.selectedObject=null;
                    _parent.insertPageNo(parm,callback);
                },1000);
                return;
            }else {
            
            var tmpOption=self.canvasConfig.pageOption;
            var slicesPage=self.canvasConfig.slicesPage;
            var pageNoArr=[];
            var pnIndex=slicesPage.length-1;
            var tmpObject=canvas.getObjects();
            var pageNoText="P" + ( self.cunterPage*(slicesPage.length)+slicesPage[slicesPage.length-1] );

            for (var i=0;i<tmpObject.length;i++){
                if ("PageNo"==tmpObject[i].dType){
                    if (tmpObject[i].hasOwnProperty("pnIndex")==true){
                        pageNoArr.push(tmpObject[i].pnIndex);
                    }
                }
            }

            for (var i=0;i<slicesPage.length;i++){
               
                if (pageNoArr.indexOf(i)==-1){
                    pageNoText="P" + (self.cunterPage*(slicesPage.length)+slicesPage[i]);
                    pnIndex=i;
                    break;
                }
            }

            if (pageNoText==null){    
                
                //首页、尾页不能插入码
                (callback && typeof(callback) === "function") && callback("Can't inserted on the Home page and End page");
                
            }else{
            
                var textObj=new fabric.Textbox(parm.name, { 
                  fontFamily: "freeserif", 
                  fontSize: self.canvasConfig.defauleFontSize, 
                  fontPt: self.canvasConfig.defauleFontPt, 
                  lineHeight:1,
                  fill:"#000000",
                  fillCmyk:"75,68,67,90",
                  left:self.insertX,
                  top: self.insertY,
                  zIndex:self.getCanvasObjCount(),
                  dtypeIndex:self.createTypeIndex("text"),
                  id:self.createID(),
                  text:pageNoText,
                  pnIndex:pnIndex,
                  //text:"PN",
                  editable:false,
                  // width:60,
                  type:"textbox",
                  dType:parm.dType,
                  strokeWidth: 0,
                 }); 
                 
                 canvas.add(textObj).setActiveObject(textObj).renderAll();
                 self.cunterObj=textObj;
                 self.cunterObj.sortPath=canvas._objects.length - 2;
                 self.layer.canvasOperation.createComponent(self.cunterObj);
                 (callback && typeof(callback) === "function") && callback(true);
            }
            
          }
        };           
   
        //插入商品图片组件
        this.insertProductPicture=function(parm=null,callback=null){
            //检查画布中是否存在商品图框
            var _objects=canvas.getObjects();
            for (var i in _objects) {
                if (_objects[i].dataFiled=="goodsImage" && parm.dataFiled=="goodsImage"){
                    layer.msg("Only one product image");
                    (callback && typeof(callback) === "function") && callback(false);
                    return;
                }
            } 
            
            if (parm.blankPic && parm.blankPic!=undefined && parm.blankPic!="undefined"){
                var blankPic=parm.blankPic;
            }else{
                var blankPic=self.blankPic;
            }
            
            var data={};
            data.left=self.insertX;
            data.top=self.insertY;
            data.width=(parm.dataFiled=="goodsImage" || parm.dataFiled=="lk_goodsImage")?200:100;
            data.height=(parm.dataFiled=="goodsImage" || parm.dataFiled=="lk_goodsImage")?200:100;
            data.type="rect";
            data.fill="#ffffff",
            data.opacity=1;
            data.stroke='#999999';
            data.strokeWidth=1;
            data.scaleX=1;
            data.scaleY=1;
            data.visible=(parm.blankPic)?false:true;
            
            var rect = new fabric.Rect(data);
            var line = new fabric.Line(
                [data.left * 1, data.top * 1, data.left * 1 + data.scaleX * data.width, data.top * 1 + data.scaleY * data.height], 
                {
                    fill: '#999999',
                    stroke: '#999999',
                    visible:(parm.blankPic)?false:true
            });
           
            var textObj=new fabric.Textbox(parm.name, { 
              fontFamily: 'freeserif', 
              fontSize: 20, 
              fontPt:(20 * 72 / self.paperSize.paperDPI).toFixed(1), 
              fill:"#000000",
              textAlign:'center',
              width:data.width,
              left:self.insertX,
              top: self.insertY + data.height/2 -10,
              text:parm.name,
              dType:"sortText",
              strokeWidth: 0,
              visible:(parm.blankPic)?false:true
             });
           
            var groupWidth=data.width;
            var groupHeight=data.height;
            var idName=self.createID();
            var configParma={};
            configParma.width=data.width;
            configParma.height=data.height;
            configParma.left=self.insertX;
            configParma.top=self.insertY;
            configParma.zIndex=self.getCanvasObjCount();
            configParma.dType=parm.dType;//"productPicture";
            configParma.dtypeIndex=self.createTypeIndex(parm.dType),
            configParma.id=idName;
            configParma.angle=0;
            //邦定图片路径字段
            configParma.dataFiled=parm.dataFiled;
            
          var img = new Image();//创建新的图片对象
          img.src = blankPic;
          img.setAttribute("crossOrigin",'Anonymous')
          img.onload = function(e){//图片加载完，再draw 和 toDataURL

                if (e.path){
                  var imgWidth=e.path[0].width;
                  var imgHeight=e.path[0].height;
                }else{
                  var imgWidth=this.width;
                  var imgHeight=this.height;
                }
                
                var pi=1;
                
                if (imgWidth>imgHeight){
                    
                    if (configParma.width<imgWidth){
                        pi=configParma.width/imgWidth;
                    }else{
                        pi=imgWidth/configParma.width;
                    }
                    
                }else{
                    
                    if (configParma.height<imgHeight){
                        pi=configParma.height/imgHeight;
                    }else{
                        pi=imgHeight/configParma.height;
                    }
                    
                }
                
                
                //计算商品组件关联图位置                    
                var picBoxHeight=rect.height;
                var newImgBoxHeight=imgHeight * pi;
                if (picBoxHeight>newImgBoxHeight){
                    
                    var newImgLeft=rect.left;
                    var newImgTop=rect.top + (picBoxHeight-newImgBoxHeight)/2;
                    
                }else{
                
                    var newImgLeft=rect.left;
                    var newImgTop=rect.top;
                }
                
                context.drawImage(img,0,0);    
                var fabricImage = new fabric.Image(img, {
                    left:newImgLeft,//data.left,//self.insertX,
                    top:newImgTop,//data.top,//self.insertY,
                    scaleX:pi,
                    scaleY:pi,
                    zIndex:self.getCanvasObjCount(),
                    dtypeIndex:self.createTypeIndex("previewPicture"),
                    width:imgWidth,
                    height:imgHeight,
                    angle:0,
                    id:self.createID(),
                    dType:"previewPicture",
                    picid:parm.picid,
                    bindItemCode:parm.itemcode
                    
                });
                
                _parent.createGroup(configParma,[fabricImage,rect,line,textObj]);
                (callback && typeof(callback) === "function") && callback(true);
                
                
           };
            
        }

        
        //插入图片素材
        this.insertPicture=function(parm=null,callback=null){
           
              var img = new Image();//创建新的图片对象
              if (!parm.hasOwnProperty("filePath")){
                img.src = self.blankPic;
              }else{
                img.src=parm.filePath;
              }

              var insertX=(parm.hasOwnProperty("x")?parm.x:self.insertX);
              var insertY=(parm.hasOwnProperty("y")?parm.y:self.insertY);

              img.setAttribute("crossOrigin",'Anonymous');
              img.onload = function(e){//图片加载完，再draw 和 toDataURL
              
                    if (e.path){
                        var imgWidth=e.path[0].width;
                        var imgHeight=e.path[0].height;
                    }else{
                        var imgWidth=this.width;
                        var imgHeight=this.height;
                    }
                    context.drawImage(img,0,0);    
                    var fabricImage = new fabric.Image(img, {
                        left:insertX,
                        top:insertY,
                        scaleX:0.4,//1,
                        scaleY:0.4,//1,
                        zIndex:self.getCanvasObjCount(),
                        dtypeIndex:self.createTypeIndex("Picture"),
                        width:imgWidth,
                        height:imgHeight,
                        angle:0,
                        id:self.createID(),
                        //dType:"Picture",
                        dType:parm.dType,
                        cmykPic:((isEmpty(parm.cmykPic))?null:parm.cmykPic),
                        picid:null
                        
                    });
                    canvas.add(fabricImage).setActiveObject(fabricImage);
                    self.cunterObj=fabricImage;
                    canvas.renderAll();
                    if (self.undoGroupSource!=null){
                        self.cunterObj.parentID=self.undoGroupSource.id;
                    }
                    self.cunterObj.sortPath=canvas._objects.length -1 ;
                    self.layer.canvasOperation.createComponent(self.cunterObj);
                    (callback && typeof(callback) === "function") && callback(true);
               };
              
        }
        
        //替换图片
        this.setPicture=function(parm=null,callback=null){
             
              self.drawing=true;
              var pictureObj=self.cunterObj;

              if (pictureObj.hasOwnProperty("sortPath")==false){

                 if (pictureObj.hasOwnProperty("group")){
                    var parentGroup=pictureObj.group;
                    var sortIndex=parentGroup._objects.indexOf(pictureObj);
                    sortPath=parentGroup.sortPath + "," + sortIndex;
                    pictureObj.sortPath=sortPath + "";

                 }else{
                    var sortIndex=canvas._objects.indexOf(pictureObj);
                    pictureObj.sortPath=sortIndex + "";
                 }

              }else{
                if (isEmpty(pictureObj.sortPath)){
                    var sortIndex=canvas._objects.indexOf(pictureObj);
                    pictureObj.sortPath=sortIndex + "";
                }
              }
              pictureObj.sortPath=pictureObj.sortPath.toString(); 
              if (self.undoGroupSource!=null){
                var objPathArr=pictureObj.sortPath.split(",");
                var sortIndex=objPathArr[objPathArr.length-1];
              }else{
                var objPathArr=pictureObj.sortPath.split(",");
                var sortIndex=objPathArr[objPathArr.length-1];
              }

              var img = new Image();//创建新的图片对象
              img.src = parm.src;
              img.setAttribute("crossOrigin",'Anonymous'); 

              img.onload = function(e){
                    
                    if (e.path){
                      var imgWidth=e.path[0].width;
                      var imgHeight=e.path[0].height;
                    }else{
                      var imgWidth=this.width;
                      var imgHeight=this.height;
                    }

                    context.drawImage(img,0,0);    
                    var fabricImage = new fabric.Image(img, {
                        left:pictureObj.left,
                        top:pictureObj.top,
                        scaleX:pictureObj.scaleX,
                        scaleY:pictureObj.scaleY,
                        zIndex:pictureObj.zIndex,
                        dtypeIndex:pictureObj.dtypeIndex,
                        width:imgWidth,
                        height:imgHeight,
                        angle:pictureObj.angle,
                        id:pictureObj.id,
                        dType:parm.dType,
                        cmykPic:((isEmpty(parm.cmykPic))?null:parm.cmykPic),
                        picid:((isEmpty(parm.picid))?"":parm.picid),
                        parentID:pictureObj.parentID,
                        sortPath:pictureObj.sortPath,
                    });

                    if (self.isPixSelect || !pictureObj.hasOwnProperty("group")){    
                        canvas.remove(pictureObj);
                        canvas.renderAll();
                        canvas.add(fabricImage);
                        fabricImage.moveTo(sortIndex * 1);
                        canvas.setActiveObject(fabricImage);
                        canvas.renderAll();
                    }else{

                        var _group=pictureObj.group;
                        _group.remove(pictureObj);
                        _group.add(fabricImage);
                        _group.moveTo(fabricImage,sortIndex * 1);
                        _group.addWithUpdate();
                        _group.setCoords();
                        canvas.renderAll();
                    }
                    //调用图层排序
                    
                    (callback && typeof(callback) === "function") && callback(true);
                    
               
               };
            
        }
        

        //svg文件形式 插入shape svg组件
        this.insertShape=function(parm=null,callback=null){
            fabric.loadSVGFromURL(parm.file, function(objects, options) { 
                
                //识别形状是否直线
                if (objects[0].height==1){
                    _parent.insertLine();
                }else{
                
                    var dollars = fabric.util.groupSVGElements(objects, options);
                    var dollarsdType=parm.dType;
             
                    //SVG是否单体还是分组类型，如果是分组类型需要for objects更改子对象dType
                    if (dollars.hasOwnProperty("_objects")==true){

                        dollarsdType="tmpGroup";
                        var svgObjects=dollars._objects;
                        for (var i=0;i<svgObjects.length;i++){
                            dollars._objects[i].id=self.createID();
                            
                            if (dollars._objects[i].hasOwnProperty("fill")){
                                //处理插入的svg图形边框颜色(非渐变色)，填充颜色值格式处理
                                if (!isEmpty(dollars._objects[i].fill) && dollars._objects[i].fill.hasOwnProperty("type")==false){
                                 
                                    if (dollars._objects[i].fill.substr(0,4)=="rgba"){
                                      
                                        var rgbStr=dollars._objects[i].fill.toLowerCase();
                                            rgbStr=rgbStr.replace("rgba(","");
                                            rgbStr=rgbStr.replace(")","");
                                            rgbArr=rgbStr.split(",");
                                        var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                        
                                        var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                        dollars._objects[i].fill=_hex;
                                        _CMYK.colorConverter._RGBtoCMYK_API(rgbObj,dollars._objects[i], function(cmykColor,theObj) {
                                            //赋值cmyk
                                            theObj.fillCmyk=cmykColor;
                                        });
                                        
                                    }else if (dollars._objects[i].fill.substr(0,3)=="rgb"){
                                        
                                        var rgbStr=dollars._objects[i].fill.toLowerCase();
                                            rgbStr=rgbStr.replace("rgb(","");
                                            rgbStr=rgbStr.replace(")","");
                                            rgbArr=rgbStr.split(",");
                                        var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                        
                                        var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                        dollars._objects[i].fill=_hex;
                                        _CMYK.colorConverter._RGBtoCMYK_API(rgbObj,dollars._objects[i], function(cmykColor,theObj) {
                                            //赋值cmyk
                                            theObj.fillCmyk=cmykColor;
                                        });
                                        
                                    }else if (dollars._objects[i].fill.substr(0,1)=="#"){
                                        //Hex转RGB取CMYK值
                                        
                                        if (dollars._objects[i].fill.length==4){
                                            //处理十六进制缩写颜色，如： #F2B => #FF22BB 
                                            var abridgeHex=dollars._objects[i].fill;
                                            var hexArr=abridgeHex.split("");
                                            dollars._objects[i].fill="#" + hexArr[1] + hexArr[1] + hexArr[2] + hexArr[2] + hexArr[3] + hexArr[3];
                                        }
                                        
                                        var rgbObj=_CMYK.colorConverter._HexToRgba(dollars._objects[i].fill);
                                        _CMYK.colorConverter._RGBtoCMYK_API(rgbObj,dollars._objects[i], function(cmykColor,theObj) {
                                            //赋值cmyk
                                            theObj.fillCmyk=cmykColor;
                                        });
                                        
                                    }
                                    
                                }
                            }
                            
                            if (dollars._objects[i].hasOwnProperty("stroke")){
                                //处理插入的svg图形边框颜色(非渐变色)，边框颜色值格式处理
                                if (!isEmpty(dollars._objects[i].stroke) && dollars._objects[i].stroke.hasOwnProperty("type")==false){
                                 
                                    if (dollars._objects[i].stroke.substr(0,4)=="rgba"){
                                      
                                        var rgbStr=dollars._objects[i].stroke.toLowerCase();
                                            rgbStr=rgbStr.replace("rgba(","");
                                            rgbStr=rgbStr.replace(")","");
                                            rgbArr=rgbStr.split(",");
                                        var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                        
                                        var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                        dollars._objects[i].stroke=_hex;
                                        _CMYK.colorConverter._RGBtoCMYK_API(rgbObj,dollars._objects[i], function(cmykColor,theObj) {
                                            //赋值cmyk
                                            theObj.strokeCmyk=cmykColor;
                                        });
                                        
                                    }else if (dollars._objects[i].stroke.substr(0,3)=="rgb"){
                                        
                                        var rgbStr=dollars._objects[i].stroke.toLowerCase();
                                            rgbStr=rgbStr.replace("rgb(","");
                                            rgbStr=rgbStr.replace(")","");
                                            rgbArr=rgbStr.split(",");
                                        var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                        
                                        var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                        dollars._objects[i].stroke=_hex;
                                        _CMYK.colorConverter._RGBtoCMYK_API(rgbObj,dollars._objects[i], function(cmykColor,theObj) {
                                            //赋值cmyk
                                            theObj.strokeCmyk=cmykColor;
                                        });
                                        
                                    }else if (dollars._objects[i].stroke.substr(0,1)=="#"){
                                        //Hex转RGB取CMYK值
                                        
                                        if (dollars._objects[i].stroke.length==4){
                                            //处理十六进制缩写颜色，如： #F2B => #FF22BB 
                                            var abridgeHex=dollars._objects[i].stroke;
                                            var hexArr=abridgeHex.split("");
                                            dollars._objects[i].stroke="#" + hexArr[1] + hexArr[1] + hexArr[2] + hexArr[2] + hexArr[3] + hexArr[3];
                                        }
                                        
                                        var rgbObj=_CMYK.colorConverter._HexToRgba(dollars._objects[i].stroke);
                                        _CMYK.colorConverter._RGBtoCMYK_API(rgbObj,dollars._objects[i], function(cmykColor,theObj) {
                                            //赋值cmyk
                                            theObj.strokeCmyk=cmykColor;
                                        });
                                        
                                    }
                                    
                                }
                            }
                            
                            switch (svgObjects[i].type)
                            {
                                case "text":
                                    dollars._objects[i].dType='text';dollars._objects[i].type='textbox';
                                    var fontFamily=dollars._objects[i].fontFamily;
                                    
                                    if (!isEmpty(fontFamily)){
                                        var fontArr=fontFamily.split(",");
                                        dollars._objects[i].fontFamily=fontArr[0].toLowerCase();
                                    }
                                break;
                                case "rect":
                                case "circle":
                                case "polygon":
                                case "path":
                                    dollars._objects[i].dType='shape';
                                break;
                                case "image":
                                    dollars._objects[i].dType='Picture';
                                break;
                                case "line":

                                    //line更改为多边形
                                    var points = [{
                                        x: dollars._objects[i].x1, y: dollars._objects[i].y1
                                    }, {
                                        x: dollars._objects[i].x2, y: dollars._objects[i].y2
                                    }];


                                    var _strokeWidth=(isEmpty(svgObjects[i].strokeWidth)?1:svgObjects[i].strokeWidth);

                                    var polygon = new fabric.Polygon(points, {
                                        left: svgObjects[i].left,
                                        top: svgObjects[i].top,
                                        x:svgObjects[i].left,
                                        y:svgObjects[i].top,
                                        fill: '',
                                        fillCmyk:'',
                                        angle:svgObjects[i].angle,
                                        dType:"dottedLine",
                                        type:"polygon",
                                        strokeWidth: _strokeWidth,
                                        stroke: (isEmpty(svgObjects[i].stroke)?'#000000':svgObjects[i].stroke),
                                        strokeCmyk:(isEmpty(svgObjects[i].strokeCmyk)?'75,68,67,90':svgObjects[i].strokeCmyk),
                                        scaleX: 1,
                                        scaleY: 1,
                                        padding:8,
                                        id:(self.createID()),
                                        zIndex:self.getCanvasObjCount(),
                                        dtypeIndex:self.createTypeIndex("dottedLine"),
                                        strokeDashArray:[_strokeWidth * 2,0],
                                        objectCaching: false,
                                        transparentCorners: false,
                                        cornerColor: 'blue',
                                    });
                                    
                                    dollars._objects[i]=polygon;
                                    

                                break;

                            }


                            //多边形 如果边为0，又无填充背景色值，要设默认值
                            if (svgObjects[i].type=="polygon" || svgObjects[i].type=="line" || svgObjects[i].type=="path"  || svgObjects[i].type=="circle"  || svgObjects[i].type=="rect"){
                                if((isEmpty(svgObjects[i].strokeWidth) || svgObjects[i].strokeWidth=="NaN" ) && (isEmpty(svgObjects[i].fill) || svgObjects[i].fill=="NaN" )){

                                    svgObjects[i].strokeWidth=1;
                                    if (isEmpty(svgObjects[i].stroke)){
                                        svgObjects[i].stroke="#000000";
                                        svgObjects[i].strokeCmyk="75,68,67,90";                                       
                                    }else{
                                        svgObjects[i].strokeCmyk=svgObjects[i].stroke
                                    }


                                }
                            }

                         
                            if (isNaN(svgObjects[i].left)){
                                if (svgObjects[i].hasOwnProperty("pathOffset")){
                                    dollars._objects[i].left=svgObjects[i].pathOffset.x - svgObjects[i].width/2 - dollars.width/2;
                                    dollars._objects[i].top=svgObjects[i].pathOffset.y - svgObjects[i].height/2 - dollars.height/2;
                                }else{
                                    dollars._objects[i].left=dollars.width/2 - svgObjects[i].width/2;
                                    dollars._objects[i].top=dollars.height/2 - svgObjects[i].height/2;
                                }
                                
                            }

                        }

                    }else{

                        if (dollars.hasOwnProperty("fill")){
                            //处理插入的svg图形边框颜色(非渐变色)，填充颜色值格式处理
                            if (!isEmpty(dollars.fill) && dollars.fill.hasOwnProperty("type")==false){
                             
                                if (dollars.fill.substr(0,4)=="rgba"){
                                  
                                    var rgbStr=dollars.fill.toLowerCase();
                                        rgbStr=rgbStr.replace("rgba(","");
                                        rgbStr=rgbStr.replace(")","");
                                        rgbArr=rgbStr.split(",");
                                    var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                    
                                    var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                    dollars.fill=_hex;
                                    _CMYK.colorConverter._RGBtoCMYK_API(rgbObj, dollars, function(cmykColor,theObj) {
                                        //赋值cmyk
                                        theObj.fillCmyk=cmykColor;
                                    });
                                    
                                }else if (dollars.fill.substr(0,3)=="rgb"){
                                    
                                    var rgbStr=dollars.fill.toLowerCase();
                                        rgbStr=rgbStr.replace("rgb(","");
                                        rgbStr=rgbStr.replace(")","");
                                        rgbArr=rgbStr.split(",");
                                    var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                    
                                    var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                    dollars.fill=_hex;
                                    _CMYK.colorConverter._RGBtoCMYK_API(rgbObj, dollars, function(cmykColor,theObj) {
                                        //赋值cmyk
                                        theObj.fillCmyk=cmykColor;
                                    });
                                    
                                }else if (dollars.fill.substr(0,1)=="#"){
                                    //Hex转RGB取CMYK值
                                    
                                    if (dollars.fill.length==4){
                                        //处理十六进制缩写颜色，如： #F2B => #FF22BB 
                                        var abridgeHex=dollars.fill;
                                        var hexArr=abridgeHex.split("");
                                        dollars.fill="#" + hexArr[1] + hexArr[1] + hexArr[2] + hexArr[2] + hexArr[3] + hexArr[3];
                                    }
                                        
                                    var rgbObj=_CMYK.colorConverter._HexToRgba(dollars.fill);
                                    _CMYK.colorConverter._RGBtoCMYK_API(rgbObj, dollars, function(cmykColor,theObj) {
                                        //赋值cmyk
                                        theObj.fillCmyk=cmykColor;
                                    });
                                    
                                }
                                
                            }
                        }
                        
                        if (dollars.hasOwnProperty("stroke")){
                            //处理插入的svg图形边框颜色(非渐变色)，边框颜色值格式处理
                            if (!isEmpty(dollars.stroke) && dollars.stroke.hasOwnProperty("type")==false){
                             
                                if (dollars.stroke.substr(0,4)=="rgba"){
                                  
                                    var rgbStr=dollars.stroke.toLowerCase();
                                        rgbStr=rgbStr.replace("rgba(","");
                                        rgbStr=rgbStr.replace(")","");
                                        rgbArr=rgbStr.split(",");
                                    var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                    
                                    var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                    dollars.stroke=_hex;
                                    _CMYK.colorConverter._RGBtoCMYK_API(rgbObj, dollars, function(cmykColor,theObj) {
                                        //赋值cmyk
                                        theObj.strokeCmyk=cmykColor;
                                    });
                                    
                                }else if (dollars.stroke.substr(0,3)=="rgb"){
                                    
                                    var rgbStr=dollars.stroke.toLowerCase();
                                        rgbStr=rgbStr.replace("rgb(","");
                                        rgbStr=rgbStr.replace(")","");
                                        rgbArr=rgbStr.split(",");
                                    var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                    
                                    var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                    dollars.stroke=_hex;
                                    _CMYK.colorConverter._RGBtoCMYK_API(rgbObj, dollars, function(cmykColor,theObj) {
                                        //赋值cmyk
                                        theObj.strokeCmyk=cmykColor;
                                    });
                                    
                                }else if (dollars.stroke.substr(0,1)=="#"){
                                    //Hex转RGB取CMYK值
                                    
                                    if (dollars.stroke.length==4){
                                        //处理十六进制缩写颜色，如： #F2B => #FF22BB 
                                        var abridgeHex=dollars.stroke;
                                        var hexArr=abridgeHex.split("");
                                        dollars.stroke="#" + hexArr[1] + hexArr[1] + hexArr[2] + hexArr[2] + hexArr[3] + hexArr[3];
                                    }
                                    
                                    var rgbObj=_CMYK.colorConverter._HexToRgba(dollars.stroke);
                                    _CMYK.colorConverter._RGBtoCMYK_API(rgbObj, dollars, function(cmykColor,theObj) {
                                        //赋值cmyk
                                        theObj.strokeCmyk=cmykColor;
                                    });
                                    
                                }
                                
                            }
                        }


                        switch (dollars.type)
                        {

                            case "i-text":
                            case "textbox":
                            case "text":
                                dollarsdType='text';
                                dollars.type="textbox";
                            break;
                            case "rect":
                            case "circle":
                            case "polygon":
                            case "path":
                                dollarsdType='shape';
                                dollars.dType="shape";
                            break;
                            case "image":
                                dollarsdType='Picture';
                                dollars.dType="Picture";
                            break;
                            case "line":
                                //line更改为多边形
                                var points = [{
                                    x: dollars.x1, y: dollars.y1
                                }, {
                                    x: dollars.x2, y: dollars.y2
                                }];


                                var _strokeWidth=(isEmpty(dollars.strokeWidth)?1:dollars.strokeWidth);

                                var polygon = new fabric.Polygon(points, {
                                    left: dollars.left,
                                    top: dollars.top,
                                    x:dollars.left,
                                    y:dollars.top,
                                    fill: '',
                                    fillCmyk:'',
                                    angle:dollars.angle,
                                    dType:"dottedLine",
                                    type:"polygon",
                                    strokeWidth: _strokeWidth,
                                    stroke: (isEmpty(dollars.stroke)?'#000000':dollars.stroke),
                                    strokeCmyk:(isEmpty(dollars.strokeCmyk)?'75,68,67,90':dollars.strokeCmyk),
                                    scaleX: 1,
                                    scaleY: 1,
                                    padding:8,
                                    id:(self.createID()),
                                    zIndex:self.getCanvasObjCount(),
                                    dtypeIndex:self.createTypeIndex("dottedLine"),
                                    strokeDashArray:[_strokeWidth * 2,0],
                                    objectCaching: false,
                                    transparentCorners: false,
                                    cornerColor: 'blue',
                                });
                                
                                dollars=polygon;


                            break;

                        }

                        //多边形 如果边为0，又无填充背景色值，要设默认值
                        if (dollars.type=="polygon" || dollars.type=="line" || dollars.type=="path"  || dollars.type=="circle"  || dollars.type=="rect"){
                            if(isEmpty(dollars.strokeWidth) && isEmpty(dollars.fill)){

                                dollars.strokeWidth=1;
                                if (isEmpty(dollars.stroke)){
                                    dollars.stroke="#000000";
                                    dollars.strokeCmyk="75,68,67,90";                                       
                                }else{
                                    dollars.stroke="#000000";
                                    dollars.strokeCmyk="75,68,67,90";
                                }


                            }
                        }

                    }


                  var insertX=(parm.hasOwnProperty("x")?parm.x:self.insertX);
                  var insertY=(parm.hasOwnProperty("y")?parm.y:self.insertY);

                    dollars.set({
                        stroke: "#000000", 
                        strokeCmyk:"75,68,67,90",
                        opacity: 1,
                        left:insertX,
                        top:insertY,
                        dType:dollarsdType,
                        scaleX:1,
                        scaleY:1,
                        zIndex:self.getCanvasObjCount(),
                        dtypeIndex:self.createTypeIndex(dollarsdType),
                        id:(self.createID())
                    });

                    canvas.add(dollars).setActiveObject(dollars);

                    canvas.calcOffset();
                    canvas.renderAll();
                    self.insertStatus=false;
                    self.cunterObj=dollars;
                    if (self.undoGroupSource!=null){
                        self.cunterObj.parentID=self.undoGroupSource.id;
                    }
                    self.cunterObj.sortPath=canvas._objects.length -1 ;
                    self.layer.canvasOperation.createComponent(self.cunterObj);
                    (callback && typeof(callback) === "function") && callback();
                }
                
            }); 
        }
        
        //svg字符串形式 插入shape svg组件
        this.insertStringSvg=function(parm=null,callback=null){

            fabric.loadSVGFromString(parm.file, function(objects, options) { 
                
                //识别形状是否直线
                if (objects[0].height==1){
                    _parent.insertLine();
                }else{
                
                    var dollars = fabric.util.groupSVGElements(objects, options);
                    var dollarsdType=parm.dType;
             
                    //SVG是否单体还是分组类型，如果是分组类型需要for objects更改子对象dType
                    if (dollars.hasOwnProperty("_objects")==true){

                        dollarsdType="tmpGroup";
                        var svgObjects=dollars._objects;
                        for (var i=0;i<svgObjects.length;i++){
                            
                            dollars._objects[i].id=self.createID();
                            
                            if (dollars._objects[i].hasOwnProperty("fill")){
                                //处理插入的svg图形边框颜色(非渐变色)，填充颜色值格式处理
                                if (!isEmpty(dollars._objects[i].fill) && dollars._objects[i].fill.hasOwnProperty("type")==false){
                                 
                                    if (dollars._objects[i].fill.substr(0,4)=="rgba"){
                                      
                                        var rgbStr=dollars._objects[i].fill.toLowerCase();
                                            rgbStr=rgbStr.replace("rgba(","");
                                            rgbStr=rgbStr.replace(")","");
                                            rgbArr=rgbStr.split(",");
                                        var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                        
                                        var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                        dollars._objects[i].fill=_hex;
                                        _CMYK.colorConverter._RGBtoCMYK_API(rgbObj,dollars._objects[i], function(cmykColor,theObj) {
                                            //赋值cmyk
                                            theObj.fillCmyk=cmykColor;
                                        });
                                        
                                    }else if (dollars._objects[i].fill.substr(0,3)=="rgb"){
                                        
                                        var rgbStr=dollars._objects[i].fill.toLowerCase();
                                            rgbStr=rgbStr.replace("rgb(","");
                                            rgbStr=rgbStr.replace(")","");
                                            rgbArr=rgbStr.split(",");
                                        var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                        
                                        var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                        dollars._objects[i].fill=_hex;
                                        _CMYK.colorConverter._RGBtoCMYK_API(rgbObj,dollars._objects[i], function(cmykColor,theObj) {
                                            //赋值cmyk
                                            theObj.fillCmyk=cmykColor;
                                        });
                                        
                                    }else if (dollars._objects[i].fill.substr(0,1)=="#"){
                                        //Hex转RGB取CMYK值
                                        
                                        if (dollars._objects[i].fill.length==4){
                                            //处理十六进制缩写颜色，如： #F2B => #FF22BB 
                                            var abridgeHex=dollars._objects[i].fill;
                                            var hexArr=abridgeHex.split("");
                                            dollars._objects[i].fill="#" + hexArr[1] + hexArr[1] + hexArr[2] + hexArr[2] + hexArr[3] + hexArr[3];
                                        }
                                        
                                        var rgbObj=_CMYK.colorConverter._HexToRgba(dollars._objects[i].fill);
                                        _CMYK.colorConverter._RGBtoCMYK_API(rgbObj, dollars._objects[i], function(cmykColor,theObj) {
                                            //赋值cmyk
                                            theObj.fillCmyk=cmykColor;
                                        });
                                        
                                    }
                                    
                                }
                            }
                            
                            if (dollars._objects[i].hasOwnProperty("stroke")){
                                //处理插入的svg图形边框颜色(非渐变色)，边框颜色值格式处理
                                if (!isEmpty(dollars._objects[i].stroke) && dollars._objects[i].stroke.hasOwnProperty("type")==false){
                                 
                                    if (dollars._objects[i].stroke.substr(0,4)=="rgba"){
                                      
                                        var rgbStr=dollars._objects[i].stroke.toLowerCase();
                                            rgbStr=rgbStr.replace("rgba(","");
                                            rgbStr=rgbStr.replace(")","");
                                            rgbArr=rgbStr.split(",");
                                        var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                        
                                        var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                        dollars._objects[i].stroke=_hex;
                                        _CMYK.colorConverter._RGBtoCMYK_API(rgbObj, dollars._objects[i], function(cmykColor,theObj) {
                                            //赋值cmyk
                                            theObj.strokeCmyk=cmykColor;
                                        });
                                        
                                    }else if (dollars._objects[i].stroke.substr(0,3)=="rgb"){
                                        
                                        var rgbStr=dollars._objects[i].stroke.toLowerCase();
                                            rgbStr=rgbStr.replace("rgb(","");
                                            rgbStr=rgbStr.replace(")","");
                                            rgbArr=rgbStr.split(",");
                                        var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                        
                                        var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                        dollars._objects[i].stroke=_hex;
                                        _CMYK.colorConverter._RGBtoCMYK_API(rgbObj,dollars._objects[i], function(cmykColor,theObj) {
                                            //赋值cmyk
                                            theObj.strokeCmyk=cmykColor;
                                        });
                                        
                                    }else if (dollars._objects[i].stroke.substr(0,1)=="#"){
                                        //Hex转RGB取CMYK值
                                        
                                        if (dollars._objects[i].stroke.length==4){
                                            //处理十六进制缩写颜色，如： #F2B => #FF22BB 
                                            var abridgeHex=dollars._objects[i].stroke;
                                            var hexArr=abridgeHex.split("");
                                            dollars._objects[i].stroke="#" + hexArr[1] + hexArr[1] + hexArr[2] + hexArr[2] + hexArr[3] + hexArr[3];
                                        }
                                        
                                        var rgbObj=_CMYK.colorConverter._HexToRgba(dollars._objects[i].stroke);
                                        _CMYK.colorConverter._RGBtoCMYK_API(rgbObj,dollars._objects[i], function(cmykColor,theObj) {
                                            //赋值cmyk
                                            theObj.strokeCmyk=cmykColor;
                                        });
                                        
                                    }
                                    
                                }
                            }
                            
                            switch (svgObjects[i].type)
                            {
                                case "text":
                                    dollars._objects[i].dType='text';dollars._objects[i].type='textbox';
                                    var fontFamily=dollars._objects[i].fontFamily;
                                    
                                    if (!isEmpty(fontFamily)){
                                        var fontArr=fontFamily.split(",");
                                        dollars._objects[i].fontFamily=fontArr[0].toLowerCase();
                                    }
                                break;
                                case "rect":
                                case "circle":
                                case "polygon":
                                case "path":
                                    dollars._objects[i].dType='shape';
                                break;
                                case "image":
                                    dollars._objects[i].dType='Picture';
                                break;
                                case "line":

                                    //line更改为多边形
                                    var points = [{
                                        x: dollars._objects[i].x1, y: dollars._objects[i].y1
                                    }, {
                                        x: dollars._objects[i].x2, y: dollars._objects[i].y2
                                    }];


                                    var _strokeWidth=(isEmpty(svgObjects[i].strokeWidth)?1:svgObjects[i].strokeWidth);

                                    var polygon = new fabric.Polygon(points, {
                                        left: svgObjects[i].left,
                                        top: svgObjects[i].top,
                                        x:svgObjects[i].left,
                                        y:svgObjects[i].top,
                                        fill: '',
                                        fillCmyk:'',
                                        angle:svgObjects[i].angle,
                                        dType:"dottedLine",
                                        type:"polygon",
                                        strokeWidth: _strokeWidth,
                                        stroke: (isEmpty(svgObjects[i].stroke)?'#000000':svgObjects[i].stroke),
                                        strokeCmyk:(isEmpty(svgObjects[i].strokeCmyk)?'75,68,67,90':svgObjects[i].strokeCmyk),
                                        scaleX: 1,
                                        scaleY: 1,
                                        padding:8,
                                        id:(self.createID()),
                                        zIndex:self.getCanvasObjCount(),
                                        dtypeIndex:self.createTypeIndex("dottedLine"),
                                        strokeDashArray:[_strokeWidth * 2,0],
                                        objectCaching: false,
                                        transparentCorners: false,
                                        cornerColor: 'blue',
                                    });
                                    
                                    dollars._objects[i]=polygon;
                                    

                                break;

                            }


                            //多边形 如果边为0，又无填充背景色值，要设默认值
                            if (svgObjects[i].type=="polygon" || svgObjects[i].type=="line" || svgObjects[i].type=="path"  || svgObjects[i].type=="circle"  || svgObjects[i].type=="rect"){
                                
                                if((isEmpty(svgObjects[i].strokeWidth) || svgObjects[i].strokeWidth=="NaN" ) && (isEmpty(svgObjects[i].fill) || svgObjects[i].fill=="NaN" )){

                                    svgObjects[i].strokeWidth=1;
                                    if (isEmpty(svgObjects[i].stroke)){
                                        svgObjects[i].stroke="#000000";
                                        svgObjects[i].strokeCmyk="75,68,67,90";                                       
                                    }else{
                                        svgObjects[i].strokeCmyk=svgObjects[i].stroke
                                    }


                                }
                            }

                         
                            if (isNaN(svgObjects[i].left)){
                                if (svgObjects[i].hasOwnProperty("pathOffset")){
                                    dollars._objects[i].left=svgObjects[i].pathOffset.x - svgObjects[i].width/2 - dollars.width/2;
                                    dollars._objects[i].top=svgObjects[i].pathOffset.y - svgObjects[i].height/2 - dollars.height/2;
                                }else{
                                    dollars._objects[i].left=dollars.width/2 - svgObjects[i].width/2;
                                    dollars._objects[i].top=dollars.height/2 - svgObjects[i].height/2;
                                }
                                
                            }

                        }

                    }else{

                        if (dollars.hasOwnProperty("fill")){
                            //处理插入的svg图形边框颜色(非渐变色)，填充颜色值格式处理
                            if (!isEmpty(dollars.fill) && dollars.fill.hasOwnProperty("type")==false){
                             
                                if (dollars.fill.substr(0,4)=="rgba"){
                                  
                                    var rgbStr=dollars.fill.toLowerCase();
                                        rgbStr=rgbStr.replace("rgba(","");
                                        rgbStr=rgbStr.replace(")","");
                                        rgbArr=rgbStr.split(",");
                                    var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                    
                                    var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                    dollars.fill=_hex;
                                    _CMYK.colorConverter._RGBtoCMYK_API(rgbObj,dollars, function(cmykColor,theObj) {
                                        //赋值cmyk
                                        theObj.fillCmyk=cmykColor;
                                    });
                                    
                                }else if (dollars.fill.substr(0,3)=="rgb"){
                                    
                                    var rgbStr=dollars.fill.toLowerCase();
                                        rgbStr=rgbStr.replace("rgb(","");
                                        rgbStr=rgbStr.replace(")","");
                                        rgbArr=rgbStr.split(",");
                                    var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                    
                                    var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                    dollars.fill=_hex;
                                    _CMYK.colorConverter._RGBtoCMYK_API(rgbObj,dollars, function(cmykColor,theObj) {
                                        //赋值cmyk
                                        theObj.fillCmyk=cmykColor;
                                    });
                                    
                                }else if (dollars.fill.substr(0,1)=="#"){
                                    //Hex转RGB取CMYK值
                                    
                                    if (dollars.fill.length==4){
                                        //处理十六进制缩写颜色，如： #F2B => #FF22BB 
                                        var abridgeHex=dollars.fill;
                                        var hexArr=abridgeHex.split("");
                                        dollars.fill="#" + hexArr[1] + hexArr[1] + hexArr[2] + hexArr[2] + hexArr[3] + hexArr[3];
                                    }
                                        
                                    var rgbObj=_CMYK.colorConverter._HexToRgba(dollars.fill);
                                    _CMYK.colorConverter._RGBtoCMYK_API(rgbObj,dollars, function(cmykColor,theObj) {
                                        //赋值cmyk
                                        theObj.fillCmyk=cmykColor;
                                    });
                                    
                                }
                                
                            }
                        }
                        
                        if (dollars.hasOwnProperty("stroke")){
                            //处理插入的svg图形边框颜色(非渐变色)，边框颜色值格式处理
                            if (!isEmpty(dollars.stroke) && dollars.stroke.hasOwnProperty("type")==false){
                             
                                if (dollars.stroke.substr(0,4)=="rgba"){
                                  
                                    var rgbStr=dollars.stroke.toLowerCase();
                                        rgbStr=rgbStr.replace("rgba(","");
                                        rgbStr=rgbStr.replace(")","");
                                        rgbArr=rgbStr.split(",");
                                    var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                    
                                    var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                    dollars.stroke=_hex;
                                    _CMYK.colorConverter._RGBtoCMYK_API(rgbObj, dollars, function(cmykColor,theObj) {
                                        //赋值cmyk
                                        theObj.strokeCmyk=cmykColor;
                                    });
                                    
                                }else if (dollars.stroke.substr(0,3)=="rgb"){
                                    
                                    var rgbStr=dollars.stroke.toLowerCase();
                                        rgbStr=rgbStr.replace("rgb(","");
                                        rgbStr=rgbStr.replace(")","");
                                        rgbArr=rgbStr.split(",");
                                    var rgbObj={r:rgbArr[0]*1,g:rgbArr[1]*1,b:rgbArr[2]*1};
                                    
                                    var _hex = "#"+ _CMYK.dec2Hex(rgbObj.r).toString() + _CMYK.dec2Hex(rgbObj.g).toString() + _CMYK.dec2Hex(rgbObj.b).toString();
                                    dollars.stroke=_hex;
                                    _CMYK.colorConverter._RGBtoCMYK_API(rgbObj, dollars, function(cmykColor,theObj) {
                                        //赋值cmyk
                                        theObj.strokeCmyk=cmykColor;
                                    });
                                    
                                }else if (dollars.stroke.substr(0,1)=="#"){
                                    //Hex转RGB取CMYK值
                                    var rgbObj=_CMYK.colorConverter._HexToRgba(dollars.stroke);
                                    _CMYK.colorConverter._RGBtoCMYK_API(rgbObj, dollars, function(cmykColor,theObj) {
                                        //赋值cmyk
                                        theObj.strokeCmyk=cmykColor;
                                    });
                                    
                                }
                                
                            }
                        }
                        

                        switch (dollars.type)
                        {

                            case "i-text":
                            case "textbox":
                            case "text":
                                dollarsdType='text';
                                dollars.type="textbox";
                            break;
                            case "rect":
                            case "circle":
                            case "polygon":
                            case "path":
                                dollarsdType='shape';
                                dollars.dType="shape";
                            break;
                            case "image":
                                dollarsdType='Picture';
                                dollars.dType="Picture";
                            break;
                            case "line":

                                //line更改为多边形
                                var points = [{
                                    x: dollars.x1, y: dollars.y1
                                }, {
                                    x: dollars.x2, y: dollars.y2
                                }];


                                var _strokeWidth=(isEmpty(dollars.strokeWidth)?1:dollars.strokeWidth);

                                var polygon = new fabric.Polygon(points, {
                                    left: dollars.left,
                                    top: dollars.top,
                                    x:dollars.left,
                                    y:dollars.top,
                                    fill: '',
                                    fillCmyk:'',
                                    angle:svgObjects[i].angle,
                                    dType:"dottedLine",
                                    type:"polygon",
                                    strokeWidth: _strokeWidth,
                                    stroke: (isEmpty(dollars.stroke)?'#000000':dollars.stroke),
                                    strokeCmyk:(isEmpty(dollars.strokeCmyk)?'75,68,67,90':dollars.strokeCmyk),
                                    scaleX: 1,
                                    scaleY: 1,
                                    padding:8,
                                    id:(self.createID()),
                                    zIndex:self.getCanvasObjCount(),
                                    dtypeIndex:self.createTypeIndex("dottedLine"),
                                    strokeDashArray:[_strokeWidth * 2,0],
                                    objectCaching: false,
                                    transparentCorners: false,
                                    cornerColor: 'blue',
                                });
                                
                                dollars=polygon;
                                

                            break;



                        }

                        //多边形 如果边为0，又无填充背景色值，要设默认值
                        if (dollars.type=="polygon" || dollars.type=="line" || dollars.type=="path"  || dollars.type=="circle"  || dollars.type=="rect"){
                            
                            if(isEmpty(dollars.strokeWidth) && isEmpty(dollars.fill)){

                                dollars.strokeWidth=1;
                                if (isEmpty(dollars.stroke)){
                                    dollars.stroke="#000000";
                                    dollars.strokeCmyk="75,68,67,90";                                       
                                }else{
                                    dollars.stroke="#000000";
                                    dollars.strokeCmyk="75,68,67,90";
                                }

                            }
                        }

                    }


                    var insertX=(parm.hasOwnProperty("x")?parm.x:self.insertX);
                    var insertY=(parm.hasOwnProperty("y")?parm.y:self.insertY);

                    dollars.set({
                        opacity: 1,
                        left:insertX,
                        top:insertY,
                        dType:dollarsdType,
                        scaleX:1,
                        scaleY:1,
                        zIndex:self.getCanvasObjCount(),
                        dtypeIndex:self.createTypeIndex(dollarsdType),
                        id:(self.createID())
                    });

                    canvas.add(dollars).setActiveObject(dollars);

                    canvas.calcOffset();
                    canvas.renderAll();
                    self.insertStatus=false;
                    self.cunterObj=dollars;

                    if (self.undoGroupSource!=null){
                        self.cunterObj.parentID=self.undoGroupSource.id;
                    }
                    self.cunterObj.sortPath=canvas._objects.length -1 ;
                    self.layer.canvasOperation.createComponent(self.cunterObj);
                    (callback && typeof(callback) === "function") && callback();
                }
                
            }); 
        }

        //组件颜色转换及设置 rgb=>hex rgb=>cmyk
        this.componentColorConverter=function(colorFiled,colorCmykFiled,theObject,type){
           
          
        }

        //绘制线条
        this.insertLine=function(parm=null,callback=null){
            var points = [{
                x: self.insertX, y: self.insertY
            }, {
                x: (self.insertX+100), y: self.insertY
            }];
            
            var polygon = new fabric.Polygon(points, {
                left: self.insertX,
                top: self.insertY,
                x:self.insertX,
                y:self.insertY,
                fill: '',
                fillCmyk:'',
                dType:"dottedLine",
                type:"polygon",
                strokeWidth: 8,
                stroke: '#000000',
                strokeCmyk:'75,68,67,90',
                scaleX: 1,
                scaleY: 1,
                padding:8,
                id:(self.createID()),
                zIndex:self.getCanvasObjCount(),
                dtypeIndex:self.createTypeIndex("dottedLine"),
                strokeDashArray:[4,8],
                objectCaching: false,
                transparentCorners: false,
                cornerColor: 'blue',
            });
            
            self.insertStatus=false;
            
            canvas.add(polygon).renderAll();
            (callback && typeof(callback) === "function") && callback();
            self.cunterObj=polygon;
            if (self.undoGroupSource!=null){
                self.cunterObj.parentID=self.undoGroupSource.id;
            }
            self.cunterObj.sortPath=canvas._objects.length -1 ;
            self.layer.canvasOperation.createComponent(self.cunterObj);
            _parent.drawLine();
        }
        
        //插入商品组件
        this.insertProduct=function(parm=null,callback=null){
              self.insertStatus=false;
              
              var pageData=parm.file;
              if (pageData.length>=1){
                  
                  //取组件中活动的主版本
                  var data={};
                  for (var i=0;i<pageData.length;i++){
                      if (pageData[i].isValid==0){
                          data=pageData[i];
                      }
                  }
                  
                  if (data.objects){
                    //获取原画布 object 
                    var jsonData = (canvas.toJSON( self.canvasConfig.outFiled )); 
                    var objJson=jsonData.objects;
                    
                    //分析组件元件，并进行分组
                    var eleData=data.objects;
                    
                    eleData=self.eachObjectsCreateID(eleData);
                    
                    //计算分组宽、高
                    var minLeft=8000;
                    var minTop=8000;
                    var maxRight=0;
                    var maxBottom=0;
                    for (var i=0;i<eleData.length;i++){
                        if (eleData[i]["left"] * 1 < minLeft){
                            minLeft=eleData[i]["left"] * 1;
                        }
                        if (eleData[i]["top"] * 1 < minTop){
                            minTop=eleData[i]["top"] * 1;
                        } 
                        if (eleData[i]["left"] * 1 + eleData[i]["width"] * eleData[i]["scaleX"] > maxRight){
                            maxRight=eleData[i]["left"] * 1 + eleData[i]["width"]  * eleData[i]["scaleX"] ;
                        }               
                        if (eleData[i]["top"] * 1 + eleData[i]["height"] * eleData[i]["scaleY"]> maxBottom){
                            maxBottom=eleData[i]["top"] * 1 + eleData[i]["height"] * eleData[i]["scaleY"];
                        }
                        //重新设置元素ID
                        if (eleData[i].hasOwnProperty("id")){
                            eleData[i].id=self.createID();
                        }
                    }
                    
                    var groupJson={};
                    groupJson.type="group";
                    // groupJson.left=(jsonData.width - (maxRight - minLeft))/2 + 0;
                    // groupJson.top=(jsonData.height - (maxBottom - minTop))/2 + 0;
                    
                    // groupJson.left=self.insertX + (maxRight - minLeft)/2;
                    groupJson.left=self.insertX;
                    groupJson.top=self.insertY;
                    
                    groupJson.originX="left";//center
                    groupJson.originY="top";
                    groupJson.skewX=0;
                    groupJson.skewY=0;
                    groupJson.itemCode="";//邦定商品编码
                    groupJson.width=maxRight - minLeft;
                    groupJson.height=maxBottom - minTop;
                    groupJson.dType=parm.dType;
                    groupJson.elementCode=parm.elementCode;//原组件idCode
                    groupJson.hrefUrl=""; //扩展字段，用于后期开发
                    groupJson.dSort="";//与dType关联，如果是商品组件时，该字段用于商品在MM商品排序相对应
                    groupJson.id=self.createID();
                    groupJson.zIndex=self.getCanvasObjCount();
                    groupJson.dtypeIndex=self.createTypeIndex(parm.dType),
                    
                    groupJson.objects=[];
                    groupJson.x=0;
                    groupJson.y=0;
                    for (var i=0;i<eleData.length;i++){
                        eleData[i]["left"]=eleData[i]["left"] - minLeft - (maxRight - minLeft)/2;
                        eleData[i]["top"]=eleData[i]["top"] - minTop  - (maxBottom - minTop)/2;
                        groupJson.objects.push(eleData[i]);
                    }
                    objJson.push(groupJson);
                    // canvas.clear();
                    jsonData.objects=objJson;
                    // canvas.loadFromJSON(jsonData, canvas.renderAll.bind(canvas));原先OK
                    
                    //插入商品组件设为选中状态
                    var newID=groupJson.id;
                    canvas.loadFromJSON(jsonData,function(){ 
                        canvas.renderAll.bind(canvas);
                        var canvasObjects=canvas.getObjects();
                        for (var i=0;i<=canvasObjects.length-1;i++){
                            if (canvasObjects[i].id+""==newID+""){
                                canvas.setActiveObject(canvasObjects[i]);
                                self.cunterObj=canvasObjects[i];
                                self.cunterObj.scaleX=0.25;//1;
                                self.cunterObj.scaleY=0.25;//1;
                                self.cunterObj.addWithUpdate();
                                self.cunterObj.setCoords(); 
                                canvas.requestRenderAll();
                                self.layer.canvasOperation.createComponent(self.cunterObj);
                            }
                        }
                        (callback && typeof(callback) === "function") && callback(true);
                    });
                    // (callback && typeof(callback) === "function") && callback(true);
                    layer.msg("Success"); 
                  }
              }
            
        }
        
        //根据入参对像创建分组
        this.createGroup=function(configParma,parmArr,callback=null){
          var group = new fabric.Group(parmArr, configParma); 
          canvas.add(group).setActiveObject(group).renderAll();
          self.cunterObj=group;
          self.layer.canvasOperation.createComponent(self.cunterObj);
          (callback && typeof(callback) === "function") && callback(group);
        }


        //绘制箭头
        this.drawArrow=function (fromX, fromY, toX, toY, theta, headlen) {
            theta = typeof theta != "undefined" ? theta : 30;
            headlen = typeof theta != "undefined" ? headlen : 10;
            // 计算各角度和对应的P2,P3坐标
            var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
                angle1 = (angle + theta) * Math.PI / 180,
                angle2 = (angle - theta) * Math.PI / 180,
                topX = headlen * Math.cos(angle1),
                topY = headlen * Math.sin(angle1),
                botX = headlen * Math.cos(angle2),
                botY = headlen * Math.sin(angle2);
            var arrowX = fromX - topX,
                arrowY = fromY - topY;
            var path = " M " + fromX + " " + fromY;
                path += " L " + toX + " " + toY;
                arrowX = toX + topX;
                arrowY = toY + topY;
                path += " M " + arrowX + " " + arrowY;
                path += " L " + toX + " " + toY;
                arrowX = toX + botX;
                arrowY = toY + botY;
                path += " L " + arrowX + " " + arrowY;
            return path;
        }
        this.drawArrow_bak_20230317=function (fromX, fromY, toX, toY, theta, headlen) {
            theta = typeof theta != "undefined" ? theta : 30;
            headlen = typeof theta != "undefined" ? headlen : 10;
            // 计算各角度和对应的P2,P3坐标
            var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
                angle1 = (angle + theta) * Math.PI / 180,
                angle2 = (angle - theta) * Math.PI / 180,
                topX = headlen * Math.cos(angle1),
                topY = headlen * Math.sin(angle1),
                botX = headlen * Math.cos(angle2),
                botY = headlen * Math.sin(angle2);
            var arrowX = fromX - topX,
                arrowY = fromY - topY;
            var path = " M " + fromX + " " + fromY;
                path += " L " + toX + " " + toY;
                arrowX = toX + topX;
                arrowY = toY + topY;
                path += " M " + arrowX + " " + arrowY;
                path += " L " + toX + " " + toY;
                arrowX = toX + botX;
                arrowY = toY + botY;
                path += " L " + arrowX + " " + arrowY;
            return path;
        }


        
        //鼠标按下弹起状态绘制直线
        this.mouseDrawLine=function(){

            canvas.defaultCursor = 'crosshair';
            canvas.hoverCursor = 'crosshair';
            canvas.renderAll();
            self.cunterObj=null;
            self.mouseDrawShapeStatus = true;
            self.mouseDrawShapeType="Line";

        }

        this.mouseDrawRect=function(){

            canvas.defaultCursor = 'crosshair';
            canvas.hoverCursor = 'crosshair';
            canvas.renderAll();
            self.cunterObj=null;
            self.mouseDrawShapeStatus = true;
            self.mouseDrawShapeType="Rect";

        }

        this.mouseDrawArrow=function(){

            canvas.defaultCursor = 'crosshair';
            canvas.hoverCursor = 'crosshair';
            canvas.renderAll();
            self.cunterObj=null;
            self.mouseDrawShapeStatus = true;
            self.mouseDrawShapeType="Arrow";

        }

        this.mouseDrawCircle=function(){

            canvas.defaultCursor = 'crosshair';
            canvas.hoverCursor = 'crosshair';
            canvas.renderAll();
            self.cunterObj=null;
            self.mouseDrawShapeStatus = true;
            self.mouseDrawShapeType="Circle";

        }

        this.mouseDrawTriangle=function(){

            canvas.defaultCursor = 'crosshair';
            canvas.hoverCursor = 'crosshair';
            canvas.renderAll();
            self.cunterObj=null;
            self.mouseDrawShapeStatus = true;
            self.mouseDrawShapeType="Triangle";

        }

        this.mouseDrawText=function(){

            canvas.defaultCursor = 'crosshair';
            canvas.hoverCursor = 'crosshair';
            canvas.selection=false;
            canvas.selectable=false;
            canvas.renderAll();
            self.cunterObj=null;
            self.mouseDrawShapeStatus = true;
            self.mouseDrawShapeType="Text";

        }

        this.mouseDrawPageNo=function(){

            canvas.defaultCursor = 'crosshair';
            canvas.hoverCursor = 'crosshair';
            canvas.selection=false;
            canvas.selectable=false;
            canvas.renderAll();
            self.cunterObj=null;
            self.mouseDrawShapeStatus = true;
            self.mouseDrawShapeType="PageNo";

        }



        //接受插入组件任务
        this.saveComponentTask=function(parm,callback=null){
            self.insertObjectData.dType=parm.dType;
            self.insertObjectData.name=parm.name;
            self.insertObjectData.file=parm.file;
            self.insertObjectData.dataFiled=parm.dataFiled;
            self.insertObjectData.insertText=parm.insertText;
            self.insertObjectData.elementCode=(parm.elementCode!=""&&parm.elementCode!=null&&parm.elementCode!=undefined)?parm.elementCode:"";
            self.insertStatus=true;
            canvas.defaultCursor = 'crosshair';
            canvas.hoverCursor='crosshair';
            
        }
        
        //执行插入组件任务
        this.drawComponentTask=function(callback=null){

            canvas.discardActiveObject();
            self.cunterObj=null;
            canvas.renderAll();

            $(".elementOption").removeClass("act");
            switch (self.insertObjectData.dType)
            {
                case "Text":
                    _parent.insertText({},function(){
                        msg="Insert text";
                        self.canvasSave().canvasHistoryRecordCall(msg);
                        self.insertObjectData.dType=null;
                        self.insertObjectData.name=null;
                        self.insertObjectData.file=null;
                        self.insertObjectData.dataFiled=null;
                        self.insertObjectData.insertText=null;
                        self.insertStatus=false;
                    });

                break;
                //商品普通文本
                case "productNormalText":  
                //case "productLineationText": 非分组方式
                    var parm={name:self.insertObjectData.name,dType:self.insertObjectData.dType,dataFiled:self.insertObjectData.dataFiled,insertText:self.insertObjectData.insertText};
                    
                    if (isEmpty(self.insertObjectData.dataFiled)==false){
                        if (self.insertObjectData.dataFiled.substr(0,3)=="lk_"){
                            parm.lkSort=1;
                        }
                    }
                    //如果当前是mm设计模式，并且该商品组件已邦定了商品，且当前是商品组件分组编辑状态，当插入Label时，直接带出该商品对应字段信息
                    if (self.designModule=="mm" &&  self.undoGroupSource!=null && isEmpty(self.undoGroupSource.dSort)==false){
                        
                        if (self.undoGroupSource.hasOwnProperty("dType")){
                            if (self.undoGroupSource.dType=="Product"){
                                var _dSort=self.undoGroupSource.dSort;
                                if (!isEmpty(_dSort)){
                        
                                    var _dSortArr=_dSort.split("-");
                                    if (_dSortArr[0] * 1>=1 && _dSortArr[1]*1>=1){    
                                        _dSortArr[0]=_dSortArr[0] * 1 -1;
                                        _dSortArr[1]=_dSortArr[1]*1;
                                        if (isEmpty(mmDetailsData[_dSortArr[0]])==false){
                                            if (isEmpty(mmDetailsData[_dSortArr[0]][_dSortArr[1]])==false){
                                            
                                                var theProductDetails=mmDetailsData[_dSortArr[0]][_dSortArr[1]];
                                                if (isEmpty(theProductDetails)==false){
                                        
                                                    if (parm.hasOwnProperty("lkSort")){
                                                        var lkData=theProductDetails.linkItems[parm.lkSort*1-1];
                                                        for (var k in lkData){
                                                            if (k==parm.dataFiled){
                                                                //要转为字符串，数值型不支持
                                                                parm.name=lkData[k]+"";
                                                                if (self.insertObjectData.insertText!=null){
                                                                    parm.name=self.insertObjectData.insertText + parm.name;
                                                                }
                                                                break;
                                                            }
                                                        }
                                                    }else{
                                                            
                                                        for (var k in theProductDetails){
                                                            if (k==parm.dataFiled){
                                                                //要转为字符串，数值型不支持
                                                                parm.name=theProductDetails[k]+"";
                                                                if (self.insertObjectData.insertText!=null){
                                                                    parm.name=self.insertObjectData.insertText + parm.name;
                                                                }
                                                                break;
                                                            }
                                                        }
                                                        
                                                        
                                                    }
                                                    
                                                    
                                                }
                                            }
                                        }
        
                                    }
                                }
                            }
                        }
                       
                    }
                    
                    _parent.insertProductText(parm,function(){
                        msg="Insert " + self.insertObjectData.name;
                        self.canvasSave().canvasHistoryRecordCall(msg);
                        self.insertObjectData.dType=null;
                        self.insertObjectData.name=null;
                        self.insertObjectData.file=null;
                        self.insertObjectData.dataFiled=null;
                        self.insertObjectData.insertText=null;
                        self.insertStatus=false;
                    });

                break;
                //商品划线文本 非分组方式
                case "productLineationText_old":  
                    _parent.insertProductText({name:self.insertObjectData.name,dType:self.insertObjectData.dType,dataFiled:self.insertObjectData.dataFiled},function(){
                        msg="Insert " + self.insertObjectData.name;
                        self.canvasSave().canvasHistoryRecordCall(msg);
                        self.insertObjectData.dType=null;
                        self.insertObjectData.name=null;
                        self.insertObjectData.file=null;
                        self.insertObjectData.dataFiled=null;
                        self.insertObjectData.insertText=null;
                        self.insertStatus=false;
                    });

                break;
                //商品划线文本 分组方式
                case "productLineationText":  
                    var parm={name:self.insertObjectData.name,dType:self.insertObjectData.dType,dataFiled:self.insertObjectData.dataFiled};

                    //如果当前是mm设计模式，并且该商品组件已邦定了商品，且当前是商品组件分组编辑状态，当插入Label时，直接带出该商品对应字段信息
                    if (self.designModule=="mm" && self.undoGroupSource.dType=="Product" && self.undoGroupSource!=null && isEmpty(self.undoGroupSource.dSort)==false){
                        
                        var _dSort=self.undoGroupSource.dSort;
                        if (!isEmpty(_dSort)){
                
                            var _dSortArr=_dSort.split("-");
                            if (_dSortArr[0] * 1>=1 && _dSortArr[1]*1>=1){    
                                _dSortArr[0]=_dSortArr[0] * 1 -1;
                                _dSortArr[1]=_dSortArr[1]*1;
                                if (isEmpty(mmDetailsData[_dSortArr[0]])==false){
                                    if (isEmpty(mmDetailsData[_dSortArr[0]][_dSortArr[1]])==false){
                                    
                                        var theProductDetails=mmDetailsData[_dSortArr[0]][_dSortArr[1]];
                                        if (isEmpty(theProductDetails)==false){
                                            for (var k in theProductDetails){
                                                if (k==parm.dataFiled){
                                                    //要转为字符串，数值型不支持
                                                    parm.name=theProductDetails[k]+"";
                                                    if (self.insertObjectData.insertText!=null){
                                                        parm.name=self.insertObjectData.insertText + parm.name;
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }

                            }
                        }
                       
                    }


                    _parent.insertProductLineText(parm,function(){
                        msg="Insert " + self.insertObjectData.name;
                        self.canvasSave().canvasHistoryRecordCall(msg);
                        self.insertObjectData.dType=null;
                        self.insertObjectData.name=null;
                        self.insertObjectData.file=null;
                        self.insertObjectData.dataFiled=null;
                        self.insertObjectData.insertText=null;
                        self.insertStatus=false;
                    });

                break;

                case "productPicture":
                    
                    var parm={name:self.insertObjectData.name,dType:self.insertObjectData.dType,dataFiled:self.insertObjectData.dataFiled};
                    if (isEmpty(self.insertObjectData.dataFiled)==false){
                        if (self.insertObjectData.dataFiled.substr(0,3)=="lk_"){
                            parm.lkSort=1;
                        }
                    }
                    //如果当前是mm设计模式，并且该商品组件已邦定了商品，且当前是商品组件分组编辑状态，当插入Label时，直接带出该商品对应字段信息
                    if (self.designModule=="mm" && self.undoGroupSource.dType=="Product" && self.undoGroupSource!=null && isEmpty(self.undoGroupSource.dSort)==false ){
                        
                        var _dSort=self.undoGroupSource.dSort;
                        var _dSortArr=[-1,-1];
                        if (!isEmpty(_dSort)){
                
                            _dSortArr=_dSort.split("-");
                            if (_dSortArr[0] * 1>=1 && _dSortArr[1]*1>=1){    
                                _dSortArr[0]=_dSortArr[0] * 1 -1;
                                _dSortArr[1]=_dSortArr[1]*1;
                            }
                        }
 
                        if (isEmpty(mmDetailsData[_dSortArr[0]])==false){
                            if (isEmpty(mmDetailsData[_dSortArr[0]][_dSortArr[1]])==false){
                                
                                var theProductDetails=mmDetailsData[_dSortArr[0]][_dSortArr[1]];
                           
                                if (isEmpty(theProductDetails)==false){
                                    for (var k in theProductDetails){
                                        
                                        if (k==parm.dataFiled){
                                    
                                            if (typeof(theProductDetails[k])=="object"){
                                                //goodsImage、Brand、giftImage
                                                //要转为字符串，数值型不支持
                                                parm.blankPic=theProductDetails[k].rgbOriginPath+"";
                                                parm.cmykBlankPic=theProductDetails[k].cmykOriginPath+"";
                                                parm.picid=null;
                                                parm.itemcode=theProductDetails[k].itemcode;
                                                break;
                                                
                                            }else{
                                                //icon1 icon2 icon3
                                                var icons=theProductDetails.icons;
                                                for (var p=0;p<icons.length;p++){
                                                    
                                                    if ((icons[p].name).toLowerCase()==parm.dataFiled){
                                                        parm.blankPic=icons[p].rgbOriginPath+"";
                                                        parm.cmykBlankPic=icons[p].cmykOriginPath+"";
                                                        parm.itemcode=null;
                                                        parm.picid=icons[p].picid;
                                                        break;
                                                    }
                                                    
                                                }
                                                
                                            }
                                        }
                                        
                                    }
                                }
                                
                            }
                        }
                       
                    }
                    
                    _parent.insertProductPicture(parm,function(data){
                        if (data==false){
                            self.insertObjectData.dType=null;
                            self.insertObjectData.name=null;
                            self.insertObjectData.file=null;
                            self.insertObjectData.dataFiled=null;
                            self.insertStatus=false;
                            return;
                        }
                        msg="Insert " + self.insertObjectData.name;
                        self.canvasSave().canvasHistoryRecordCall(msg);
                        self.insertObjectData.dType=null;
                        self.insertObjectData.name=null;
                        self.insertObjectData.file=null;
                        self.insertObjectData.dataFiled=null;
                        self.insertStatus=false;
                    });
                break;
                case "shape":
                    if (self.insertObjectData.file==""){
                        self.insertObjectData.dType=null;
                        self.insertObjectData.name=null;
                        self.insertObjectData.file=null;
                        self.insertObjectData.dataFiled=null;
                        self.insertStatus=false;
                        return
                    }

                    var insertX=self.insertX;
                    var insertY=self.insertY;

                    _parent.insertShape({dType:self.insertObjectData.dType,file:self.insertObjectData.file,x:insertX,y:insertY},function(){
                        msg="Insert " + self.insertObjectData.name;
                        self.canvasSave().canvasHistoryRecordCall(msg);
                        self.insertObjectData.dType=null;
                        self.insertObjectData.name=null;
                        self.insertObjectData.file=null;
                        self.insertObjectData.dataFiled=null;
                        self.insertStatus=false;
                    })
                    
                break;
                case "dottedLine":
                    _parent.insertLine({dType:self.insertObjectData.dType,file:self.insertObjectData.file},function(){
                        msg="Insert " + self.insertObjectData.name;
                        self.canvasSave().canvasHistoryRecordCall(msg);
                        self.insertObjectData.dType=null;
                        self.insertObjectData.name=null;
                        self.insertObjectData.file=null;
                        self.insertObjectData.dataFiled=null;
                        self.insertStatus=false;
                    })  
                break;
                case "Picture":

                    var insertX=self.insertX;
                    var insertY=self.insertY;

                    _parent.insertPicture({dType:self.insertObjectData.dType,file:self.insertObjectData.file,x:insertX,y:insertY},function(){
                        msg="Insert " + self.insertObjectData.name;
                        self.canvasSave().canvasHistoryRecordCall(msg);
                        self.insertObjectData.dType=null;
                        self.insertObjectData.name=null;
                        self.insertObjectData.file=null;
                        self.insertObjectData.dataFiled=null;
                        self.insertStatus=false;
                    })  
                break;
                case "IconElement":

                    var insertX=self.insertX;
                    var insertY=self.insertY;

                    _parent.insertPicture({dType:self.insertObjectData.dType,file:self.insertObjectData.file,x:insertX,y:insertY},function(){
                        msg="Insert " + self.insertObjectData.name;
                        self.canvasSave().canvasHistoryRecordCall(msg);
                        self.insertObjectData.dType=null;
                        self.insertObjectData.name=null;
                        self.insertObjectData.file=null;
                        self.insertObjectData.dataFiled=null;
                        self.insertStatus=false;
                    })  
                break;                
                case "Product":
                    _parent.insertProduct({
                            dType:self.insertObjectData.dType,
                            file:self.insertObjectData.file,
                            elementCode:self.insertObjectData.elementCode
                        
                    },function(){
                        msg="Insert " + self.insertObjectData.name;
                        self.canvasSave().canvasHistoryRecordCall(msg);
                        self.insertObjectData.dType=null;
                        self.insertObjectData.name=null;
                        self.insertObjectData.file=null;
                        self.insertObjectData.dataFiled=null;
                        self.insertStatus=false;
                        (callback && typeof(callback) === "function") && callback(true);
                    })  
                break;
                case "PageNo":
                    _parent.insertPageNo({name:self.insertObjectData.name,dType:self.insertObjectData.dType},function(result){
                        if (result==true){
                            msg="Insert " + self.insertObjectData.name;
                            self.canvasSave().canvasHistoryRecordCall(msg);
                        }else{
                            layer.msg(result);
                        }
                        self.insertObjectData.dType=null;
                        self.insertObjectData.name=null;
                        self.insertObjectData.file=null;
                        self.insertObjectData.dataFiled=null;
                        self.insertStatus=false;
                    });    
                break;
            }
            self.drawing=true;
            //还原画布鼠标图标
            canvas.defaultCursor ='default',canvas.hoverCursor='default';
   
        }
        



        /** 组件控制默认样式 */
        this.drawComponentControls=function(obj){


            obj.hasBorders=true;
            obj.hasControls = true;
            obj.set({borderColor:'#008efa',dirty:true,visible:true,active:true});
            obj.setControlsVisibility({
                  mt: true, 
                  mb: true, 
                  bl: true,
                  br: true, 
                  tl: true, 
                  tr: true,
                  mtr: true, 
             });
            
            obj.selectable=true;

            if (canvas.getRetinaScaling){
                obj._renderControls(context);
                obj.setCoords();
            }

            obj.setCoords();
            canvas.renderAll();

        }


        /** 线条描点控制 Start */
        this.drawLine=function(){
            if (self.cunterObj.hasOwnProperty("dType")){
                if (self.cunterObj.dType=="referenceLine"){
                    return;
                }
            }
    
            self.cunterObj.set({objectCaching: false,transparentCorners: false,hasBorders:false});

            var poly=self.cunterObj;
            poly.edit=false;
            poly.edit = !poly.edit;
            if (poly.edit) {
          
                  var lastControl = poly.points.length - 1;
                  poly.cornerStyle = 'circle';
                  poly.cornerColor = 'rgba(0,0,255,0.5)';
                  poly.controls = poly.points.reduce(function(acc, point, index) {
                            acc['p' + index] = new fabric.Control({
                                positionHandler: _parent.polygonPositionHandler,
                                actionHandler: _parent.anchorWrapper(index > 0 ? index - 1 : lastControl, _parent.actionHandler),
                                actionName: 'modifyPolygon',
                                pointIndex: index
                            });
                            return acc;
                  }, {});
                  
            } else {
                poly.cornerColor = 'blue';
                poly.cornerStyle = 'rect';
                poly.hasBorders=false;
                poly.controls = fabric.Object.prototype.controls;
         
                poly.setCoords();
            }
            poly.hasBorders = !poly.edit;
            canvas.requestRenderAll();
        }
        
        this.polygonPositionHandler=function(dim, finalMatrix, fabricObject) {
      
            var x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
                y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
                
            //在这里做线条 按shift 直线处理    
            if (copyPreKeyCode[0]==16 && self.cunterObj.points.length==2){
          
                var _points=self.cunterObj.points;
                var points=[];
                if (_points!=undefined){    
                    if (Math.abs(_points[0].x-_points[1].x)<Math.abs(_points[0].y-_points[1].y)){
                        points[0]=_points[0];
                        points[1]={x:_points[0].x,y:_points[1].y}; 
                    }else{
                        points[0]=_points[0];
                        points[1]={x:_points[1].x,y:_points[0].y};  
                    }
                    
                    self.cunterObj.set({
                        points: points,
                    });
                }
            }    
            
            if(!fabricObject.canvas){
                return;
            }

            if (fabricObject.canvas.hasOwnProperty("viewportTransform")==false){
                return ;
            }else{
            
                return fabric.util.transformPoint(
                      { x: x, y: y },
                      fabric.util.multiplyTransformMatrices(
                        fabricObject.canvas.viewportTransform,
                        fabricObject.calcTransformMatrix()
                      )
                      
                );
            }
        }
        
        this.actionHandler=function(eventData, transform, x, y) {
            var polygon = transform.target,
                currentControl = polygon.controls[polygon.__corner],
                mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
                polygonBaseSize = polygon._getNonTransformedDimensions(),
                    size = polygon._getTransformedDimensions(0, 0),
                    finalPointPosition = {
                        x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
                        y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y 
                    };
                    
            polygon.points[currentControl.pointIndex] = finalPointPosition;
            return polygon;
        }
        
        this.anchorWrapper=function(anchorIndex, fn) {
            return function(eventData, transform, x, y) {
           
              var fabricObject = transform.target,
                  absolutePoint = fabric.util.transformPoint({
                      x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
                      y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
                  }, fabricObject.calcTransformMatrix()),
                  actionPerformed = fn(eventData, transform, x, y);
                
              var newDim = fabricObject._setPositionDimensions({});
              

              var polygonBaseSize = fabricObject._getNonTransformedDimensions(),
                  newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
                  newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
                  
              fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
          
              canvas.renderAll();
              return actionPerformed;
            }
        }
        
        /** 线条对象控制点调整 End */
        
        this.exitDrawLine = function(e){

            self.isEditDrawLine=false;
            if (e.target==null){

                if (self.cunterObj!=null){  
                    if (self.cunterObj.dType=="shape" && self.cunterObj.type=="polygon"){
                        
                        self.cunterObj.set({
                            controls:fabric.Object.prototype.controls,
                            cornerColor:'white',
                            cornerStyle:'rect',
                            borderColor:"#b3cdfd",
                            cornerSize:6
                        });
                        canvas.renderAll();
                    }
                } 

            }else if (e.target && e.target.hasOwnProperty("id")==false){

                if (self.cunterObj!=null){  
                    if (self.cunterObj.dType=="shape" && self.cunterObj.type=="polygon"){
                        
                        self.cunterObj.set({
                            controls:fabric.Object.prototype.controls,
                            cornerColor:'white',
                            cornerStyle:'rect',
                            borderColor:"#b3cdfd",

                            cornerSize:6
                        });
                        canvas.renderAll();

                    }
                } 

            }else if (e.target && e.target.hasOwnProperty("id")){

                if (self.cunterObj!=null){    
                    if (self.cunterObj.id!=e.target.id){
                        if (self.cunterObj.dType=="shape" && self.cunterObj.type=="polygon"){
                            self.isEditDrawLine=false;
                            self.cunterObj.set({
                                controls:fabric.Object.prototype.controls,
                                cornerColor:'white',
                                cornerStyle:'rect',
                                borderColor:"#b3cdfd",
                                cornerSize:6
                            });
                            canvas.renderAll();

                        }
                    }
                }
            }

        }


        /** path对象控制 Start */

        this.drawArrowControl=function(){

            self.cunterObj.set({objectCaching: false,transparentCorners: false,hasBorders:false});

            var poly=self.cunterObj;
            poly.edit=false;
            poly.edit = !poly.edit;
            if (poly.edit) {
                  if (poly.oCoords.hasOwnProperty("p0")){
                      poly.points=[];
                      poly.points[0]={x:0,y:0};
                      poly.points[0].x=poly.oCoords.p0.x;
                      poly.points[0].y=poly.oCoords.p0.y;
                      poly.points[1]={x:0,y:0};
                      poly.points[1].x=poly.oCoords.p1.x;
                      poly.points[1].y=poly.oCoords.p1.y;
                  }else{



                  }

                  var lastControl = poly.points.length - 1;
                  poly.cornerStyle = 'circle';
                  poly.cornerColor = 'rgba(0,0,255,0.5)';
                  poly.hasBorders=false;
                  poly.controls = poly.points.reduce(function(acc, point, index) {
                            
                            acc['p' + index] = new fabric.Control({
                                positionHandler: _parent.pathPositionHandler,
                                actionHandler: _parent.path_anchorWrapper(index > 0 ? index - 1 : lastControl, _parent.path_actionHandler),
                                actionName: 'modifyPolygon',
                                pointIndex: index
                            });

                            return acc;
                  }, {

                  });




                  
            } else {
                poly.cornerColor = 'blue';
                poly.cornerStyle = 'rect';
                poly.hasBorders=false;
                poly.controls = fabric.Object.prototype.controls;
         
                poly.setCoords();
            }
            poly.hasBorders = !poly.edit;
            canvas.requestRenderAll();
        }

        this.pathPositionHandler=function(dim, finalMatrix, fabricObject) {
               
            var x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
                y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
                
            
            if(!fabricObject.canvas){
                return;
            }

            if (fabricObject.canvas.hasOwnProperty("viewportTransform")==false){
                return ;
            }else{
            
                return fabric.util.transformPoint(
                      { x: x, y: y },
                      fabric.util.multiplyTransformMatrices(
                        fabricObject.canvas.viewportTransform,
                        fabricObject.calcTransformMatrix()
                      )
                      
                );
            }


        }
        
        this.path_actionHandler=function(eventData, transform, x, y) {

            var zoom=canvas.getZoom();
            zoom=1;
            var polygon = transform.target,
                currentControl = polygon.controls[polygon.__corner],
                mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
                polygonBaseSize = polygon._getNonTransformedDimensions(),
                    size = polygon._getTransformedDimensions(0, 0),
                    finalPointPosition = {
                        x: mouseLocalPosition.x * polygonBaseSize.x * zoom / size.x + polygon.pathOffset.x * zoom,
                        y: mouseLocalPosition.y * polygonBaseSize.y * zoom / size.y + polygon.pathOffset.y * zoom
                    };
            polygon.points[currentControl.pointIndex] = finalPointPosition;
            return polygon;
        }
        
        this.path_anchorWrapper=function(anchorIndex, fn) {
            return function(eventData, transform, x, y) {

              var fabricObject = transform.target,
                  absolutePoint = fabric.util.transformPoint({
                      x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
                      y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
                  }, fabricObject.calcTransformMatrix()),
                  actionPerformed = fn(eventData, transform, x, y);
              var polygonBaseSize = fabricObject._getNonTransformedDimensions(),
                  newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
                  newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
              
              fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);

              // var zoom=1 / canvas.getZoom();
              var zoom=1;

              if (anchorIndex!=0){
                var pathStr=self.componentDraw().drawArrow(x * zoom,y * zoom,self.cunterObj.oCoords.p1.x * zoom,fabricObject.oCoords.p1.y * zoom,30, 10);
              }else{
                var pathStr=self.componentDraw().drawArrow(self.cunterObj.oCoords.p0.x * zoom,fabricObject.oCoords.p0.y * zoom,x * zoom,y * zoom,30, 10);
              }
              

              fabricObject.initialize(pathStr);
              fabricObject.setCoords();

              canvas.renderAll(); 

              return actionPerformed;
            }
        }


        this.path_anchorWrapper_bak_20230317=function(anchorIndex, fn) {
            return function(eventData, transform, x, y) {

              var fabricObject = transform.target,
                  absolutePoint = fabric.util.transformPoint({
                      x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
                      y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
                  }, fabricObject.calcTransformMatrix()),
                  actionPerformed = fn(eventData, transform, x, y);
              var polygonBaseSize = fabricObject._getNonTransformedDimensions(),
                  newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
                  newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
              
              fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);

              

              if (anchorIndex!=0){
                var pathStr=self.componentDraw().drawArrow(x,y,self.cunterObj.oCoords.p1.x,fabricObject.oCoords.p1.y,30, 10);
              }else{
                var pathStr=self.componentDraw().drawArrow(self.cunterObj.oCoords.p0.x,fabricObject.oCoords.p0.y,x,y,30, 10);
              }
              

              fabricObject.initialize(pathStr);
              fabricObject.setCoords();

              canvas.renderAll(); 

              return actionPerformed;
            }
        }




        /** path对象控制点调整 End */

        //组件阴影设置
        this.componentShadow=function(parm=null){
            if (parm==null || self.cunterObj==null){
                return;
            }
          var shadowConfig = new fabric.Shadow({ 
                color:parm.color, 
                blur:parm.blur,
                offsetX:parm.offsetX,
                offsetY:parm.offsetY,
                angle:parm.angle
            }); 
            self.cunterObj.set({shadow:shadowConfig,shadowOffset:parm.shadowOffset});
            
            canvas.renderAll();
            
        }
        
        //从组件原设计稿中刷新当前模板组件
        this.refreshBtnObj=function(){
            
          var _cunterObj=self.cunterObj;

        }
        
        //组件转svg string
        this.objectToBase64=function(theObject){
            
            if (!isEmpty(theObject)){
                
                var groupSvg=theObject.toSVG();
                groupSvg='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+theObject.width+'" height="'+theObject.height+'" viewBox="' + theObject.left + ' ' + theObject.top + ' ' + theObject.width + ' ' + theObject.height + '" fill="none">' + groupSvg + '</svg>';
                var svgImage='data:image/svg+xml;base64,'+ window.btoa(groupSvg);
                return svgImage;
            }
        }
        
        //锁定与解锁组件
        this.lockBtnBtnObj=function(){
            
            if (self.selectedObject!=null){
                var activeObj = self.selectedObject;
                if (activeObj.length>=1){

                    if (activeObj[0].lockMovementX==true){
                        var _value={lockMovementX:false,lockMovementY:false,lockScalingX:false,lockScalingY:false,lockRotation:false};
                        $(".LockBtn i").css("color","#666");
                        // $("#" + activeObj[0].id).
                    }else{
                        var _value={lockMovementX:true,lockMovementY:true,lockScalingX:true,lockScalingY:true,lockRotation:true};
                        $(".LockBtn i").css("color","#d93732");
                    }  
                    
                    for (var i=0;i<activeObj.length;i++){
                        activeObj[i].set(_value);
                    }
                    canvas.discardActiveObject();
                    canvas.renderAll();
                }
            }else{
                //self.cunterObj.set('selectable',true);
            }
        }
        
        //解散分组(不是 组分解编辑)
        this.ungroup=function(editGroup){

            if(editGroup.type=="group"){
                if (editGroup.hasOwnProperty("group")==false){
                    var sortIndex=canvas._objects.indexOf(editGroup);
                    var editGroupID=editGroup.id;
                   
                    var items = editGroup._objects;
                    editGroup._restoreObjectsState();
                    canvas.remove(editGroup);
                    
                    if (_JC.undoGroupSource==null){
                        var zIndex=0;
                    }else{
                        var zIndex=_JC.editGroupZindex;
                    }
                    
                    for(var i = 0; i < items.length; i++) {
                      items[i].zIndex=items[i].zIndex + zIndex;    
                      canvas.add(items[i]);
                      canvas.item(canvas.size()-1).hasControls = true;
                      canvas.item(canvas.size()-1).moveTo(sortIndex + i);
                    }
                    var parm={};
                        parm.afterID=editGroupID;
                        parm.objects=items;
                    self.layer.canvasOperation.insertComponent(parm);
                    self.layer.canvasOperation.ungroup({layerID:editGroupID});
                    canvas.renderAll();
                    
                    self.mouseoverObject=null;
                    self.cunterObj=null;
                    self.selectedObject=null;
                    setTimeout(function() {    
                        //事务描述
                        var msg = "Disband Group";
                        self.canvasSave().canvasHistoryRecordCall(msg);
                    },100);
                    
                }else{
                    console.log("the compoent has prent group");
                }
                
                
            }
            
        }
        
        //组分解
        this.undoGroup=function(){
            var activeObj = self.selectedObject;

            if (activeObj!=null){
                if (activeObj.length>1){
                    layer.msg("Only one group can be selected");
             
                }else if (activeObj.length==1){
                    //如果是商品图片组合，禁止折分
                    if (activeObj[0].dType){
                        if (activeObj[0].dType=="productPicture" || activeObj[0].dType=="productPriceGroup"){
                            return;
                        }else{
              
                            if (isEmpty(self.cunterObj)){
                                self.pageEvent.errMsg("Please select a group");
                                return;
                            }else {
                                if (self.cunterObj.type!="group"){
                                    self.pageEvent.errMsg("Please select a group");
                                    return;
                                }else{
                                    
                                    //处理分组异常数据 dType值
                                    if (self.cunterObj.dType!="Product"){
                                        self.cunterObj.dType="tmpGroup";
                                    }
                                    self.selectedObject=null;
                                    _parent.editGroup(self.cunterObj);
                                }
                            }
              
                            
                        }
                    }

                } 
            }
        }
        
        //根据指定对象获取对象画布路径
        this.getComponentPath=function(theObj){
            
            var level=0;
            var pathArr=["top"];
            while (theObj.hasOwnProperty("group") && level<20){
                
                level++;
                //防止死循环
                
                var parentObj=theObj.group;
                pathArr.push(parentObj.id);
                theObj=parentObj;

            }
            
            return pathArr;
            
        }
        
        //根据对象ID路径集查找指定子对象
        this.pathSearchComponent=function(pathArr,canvasObjects){
            
            var groupObject;
            var sortIndex=1;
            for (var i=0;i<canvasObjects.length;i++){
                
                if (canvasObjects[i].id.toString()==pathArr[sortIndex]){
                    
                    if (sortIndex<pathArr.length-1){
                        canvasObjects=canvasObjects[i]._objects;
                        sortIndex++;
                        i=-1;
                    }else{
                        groupObject=canvasObjects[i];
                        return groupObject;
                    }
                    
                }
                
            }
            
            return groupObject;
        }
        
        //返回当前画布所有对象ID集数组
        this.getCanvasObjectsID=function(){
            
            var objs = canvas.getObjects();
            var idArr=[];
            var index=0;
            for (var i=0;i<objs.length;i++){
         
                idArr.push(objs[i].id);

            }
            
            return idArr;
        }
        
        //检查是否当前编辑分组是否属于商品组件
        this.getEditGroupType=function(theGroup){
            
            if (theGroup.type!="group"){return false;}
            
            if (theGroup.hasOwnProperty("dType")){
                
                if (theGroup.dType=="Product"){
                    return true;
                }else{
                    
                    if (theGroup.hasOwnProperty("group")){
                        
                        var theObj=theGroup;
                        var result=false;
                        while (theObj.hasOwnProperty("group")==true){
                            
                            if (theObj.hasOwnProperty("dType")){
                                
                                if (theObj.dType=="Product"){
                                    result= true;
                                    break;
                                }else {
                                    if (theObj.group.dType!="Product"){
                                        theObj=theObj.group;
                                    }else{
                                        result=true;
                                        break;
                                    }
                                }
                            }else{
                                //result= false;
                            }
                            
                        }
                        return result;
                        
                    }else{
                        return false;
                    }
                    
                }
                
            }else{
                return false;
            }
        }
        
        //在画布对分解的组进行活动状态，画布其他对象处理非活动状态
        this.editGroup=function(editGroup,parm=null){
            
            // console.log(_parent.getEditGroupType(editGroup),editGroup);
            //是否编辑分组中
            if (self.undoGroupSource==null){
                //否->获取editGroup 画布路径/参数->编辑分组(获取editGroup子组件集，移除editGroup子组件，在画布Add子组件集)->取消选中editGroup状态 
                
                self.undoGroupSource={};
                self.undoGroupSource.id=editGroup.id;
                self.undoGroupSource.sortPath=editGroup.sortPath;
                self.undoGroupSource.editGroupPath=_parent.getComponentPath(editGroup);
                // console.log(self.undoGroupSource.editGroupPath);
                
                self.undoGroupSource.isEditProduct=_parent.getEditGroupType(editGroup);
                //检查是否编辑商品组件
                if (self.designModule!="component"){
                    if (editGroup.dType=="Product"){
                        self.undoGroupSource.isEditProduct=true;
                    }
                }else{
                    self.undoGroupSource.isEditProduct=true;
                }
                
                if(editGroup.dType){self.undoGroupSource.dType=editGroup.dType;}
                if(editGroup.elementCode){self.undoGroupSource.elementCode=editGroup.elementCode;}
                if(editGroup.itemCode){self.undoGroupSource.itemCode=editGroup.itemCode;}
                if(editGroup.zIndex){self.undoGroupSource.zIndex=editGroup.zIndex;}
                if(editGroup.left){self.undoGroupSource.left=editGroup.left;}
                if(editGroup.top){self.undoGroupSource.top=editGroup.top;}
                if(editGroup.dSort){self.undoGroupSource.dSort=editGroup.dSort;}
                if(editGroup.textInfogmtCreate){self.undoGroupSource.textInfogmtCreate=editGroup.textInfogmtCreate;}
                
                //绘制编辑分组遮罩层对象
                // _parent.editBackgroundReact(true,self.editGroupZindex);
                
                //画布非当前分解组件ID数组，用于合并分组使用
                self.undoGroupSource.canvasOtherObjects=[];
                self.undoGroupSource.canvasOtherObjects=_parent.getCanvasObjectsID();
                // console.log(self.undoGroupSource.canvasOtherObjects);
                
                //记录当前editGroup子组件集
                var groupObjects=editGroup._objects;
                var sortIndex=canvas._objects.length;
                var index=0;
                for (var j=0;j<groupObjects.length;j++){
                    groupObjects[j].selectable=true;
                    groupObjects[j].zIndex=self.editGroupZindex + j+1;
                    groupObjects[j].parentID=editGroup.id;
                    groupObjects[j].sortPath=sortIndex + index;
                    
                    //记录解散分组前，子集组件在画布绝对坐标
                    var pointer=groupObjects[j].getAbsoluteCenterPoint();
                    var strokeWidth=0;
                    if (groupObjects[j].hasOwnProperty("strokeWidth")){
                        strokeWidth=groupObjects[j].strokeWidth*1;
                    }
                    var _x1=pointer.x - (groupObjects[j].width+strokeWidth*1)/2 * groupObjects[j].scaleX;
                    var _x2=pointer.x + (groupObjects[j].width+strokeWidth*1)/2 * groupObjects[j].scaleX;
                    var _y1=pointer.y - (groupObjects[j].height+strokeWidth*1)/2 * groupObjects[j].scaleY;
                    var _y2=pointer.y + (groupObjects[j].height+strokeWidth*1)/2 * groupObjects[j].scaleY;
                    groupObjects[j].absolutePoint={_x1:_x1,_y1:_y1,_x2:_x2,_y2:_y2};
                    
                    self.layer.canvasOperation.setLayerSortPath(groupObjects[j].id,groupObjects[j].sortPath);
                    
                    groupObjects[j].set({selected:false,dirty:true,editable:true,hasControls:true,active:false,selectable:true,zIndex:(self.editGroupZindex + j+1)});
                    index++;
                }
        
                //editGroup移取remove子组件
                for (var j=0;j<editGroup._objects.length;j++){
                    editGroup.remove(j);
                    editGroup.addWithUpdate();
                    editGroup.setCoords();
                }
                editGroup.visible=false;
                editGroup.selectable=false;
                canvas.discardActiveObject();
                canvas.renderAll();
                
                self.undoGroupSource.editGroup=editGroup;
       
                
                //绘制编辑分组遮罩层对象
                _parent.editBackgroundReact(true,self.editGroupZindex);
                //向画布add editGroup子组件
                editGroup._restoreObjectsState(); 
                
                var offsetX=0;
                var offsetY=0;
                var offWidth=0;
                var offHeight=0;
                if (parm!=null){
                    self.undoGroupSource.sortIndex=parm.sortIndex;
                    if (parm.hasOwnProperty("pos")){
                        
                        offsetX=parm.pointer.x;
                        offsetY=parm.pointer.y;
                        
                        offWidth=parm.pos.w;
                        offHeight=parm.pos.h;
                    }
                }
                
                for (var j=0;j<groupObjects.length;j++){
                    
                    if (parm!=null){ 
                        var _x=parm.objects[j].x;
                        var _y=parm.objects[j].y;
                        groupObjects[j].set({left:_x,top:_y});
                    }
                    
                    if (groupObjects[j].hasOwnProperty("absolutePoint")){
                        groupObjects[j].set({left:groupObjects[j].absolutePoint._x1,top:groupObjects[j].absolutePoint._y1});
                    }
                    
                    canvas.add(groupObjects[j]);
                    groupObjects[j].set({selected:false,dirty:true,editable:true,hasControls:true,active:false,selectable:true,azIndex:(self.editGroupZindex + j+1)});
                    canvas.renderAll();
                }
     
                //强制展开分组下拉组件面板
                self.layer.canvasOperation.showGroupLayers(editGroup);
                //解锁当前编辑分组
                self.layer.canvasOperation.setLayerStatus(_JC.undoGroupSource.id,{lockStatus:0});
            }else{
                //是->记录editGroup的ID->合并当前编辑分组->获取editGroup在画布路径/参数->编辑分组(获取editGroup子组件集，移除editGroup子组件，在画布Add子组件集)->取消选中editGroup状态
          
                var editGroupID=editGroup.id;
                var editGroupPath=self.undoGroupSource.editGroupPath;
                editGroupPath.push(self.undoGroupSource.id);
                editGroupPath.push(editGroupID);

                var pointer=canvas.getPointer(editGroup,true);
                var parm={pos:{x:editGroup.left,y:editGroup.top,w:editGroup.width,h:editGroup.height},pointer:pointer,objects:[]};
                
                for (var i=0;i<editGroup._objects.length;i++){
                    if (editGroup._objects[i].hasOwnProperty("id")==false){
                        editGroup._objects[i].id=self.createID();
                    }
                    parm.objects.push({x:(editGroup.left + editGroup.width/2 + editGroup._objects[i].left),y:(editGroup.top + editGroup.height/2 + editGroup._objects[i].top)});
                }
              
                _parent.composeGroup();
                canvas.renderAll();
                
                setTimeout(function() { 
                    
                    var canvasObjects=canvas.getObjects();
                    var searchObject=_parent.pathSearchComponent(editGroupPath,canvasObjects);
                    
                    if (isEmpty(searchObject)==true){
                        console.log("searchObject is undefined");
                    }else{
                
                        for (var i=0;i<searchObject.group._objects.length;i++){
                            if (searchObject.group._objects[i].id==searchObject.id){
                                parm.sortIndex=i;
                                break;
                            }
                        }
                        
                        //强制展开分组下拉组件面板
                        self.layer.canvasOperation.showGroupLayers(searchObject);
                        
                        _parent.editGroup(searchObject,parm);
                    }
                }, 100);
       
                
                
                
            }
            
            //调事页面元素显示事件
            self.pageEvent.editGroup();
     
        }
        
        this.editGroup_bak=function(theID){
            self.undoGroupSource={};
            self.undoGroupSource.id=self.cunterObj.id;
            self.undoGroupSource.sortPath=self.cunterObj.sortPath;
            self.undoGroupSource.canvasOtherObjects=[];
            //画布非当前分解组件ID数组，用于合并分组使用
            
            if (self.cunterObj.dType!="Product"){
                self.cunterObj.dType="tmpGroup";
            }
            
            if(self.cunterObj.dType){self.undoGroupSource.dType=self.cunterObj.dType;}
            if (self.cunterObj.elementCode){self.undoGroupSource.elementCode=self.cunterObj.elementCode;}
            if(self.cunterObj.itemCode){self.undoGroupSource.itemCode=self.cunterObj.itemCode;}
            if(self.cunterObj.zIndex){self.undoGroupSource.zIndex=self.cunterObj.zIndex;}
            if(self.cunterObj.zIndex){self.undoGroupSource.left=self.cunterObj.left;}
            if(self.cunterObj.zIndex){self.undoGroupSource.top=self.cunterObj.top;}
            if(self.cunterObj.dSort){self.undoGroupSource.dSort=self.cunterObj.dSort;}
            if(self.cunterObj.textInfogmtCreate){self.undoGroupSource.textInfogmtCreate=self.cunterObj.textInfogmtCreate;}
            
            // _parent.editBackgroundReact(true,self.undoGroupSource.zIndex);
            var sortIndex=canvas._objects.length;
            _parent.editBackgroundReact(true,self.editGroupZindex);
            var objs = canvas.getObjects();
            
            var index=0;
            for (var i=0;i<objs.length;i++){
                if (self.cunterObj.id!=objs[i].id){//theID
                    self.undoGroupSource.canvasOtherObjects.push(objs[i].id);
                }else{
                    self.undoGroupSource.sortIndex=i;
                    if (objs[i].hasOwnProperty("_objects")){
                        for (var j=0;j<objs[i]._objects.length;j++){
                            objs[i]._objects[j].selectable=true;
                            // objs[i]._objects[j].zIndex=self.undoGroupSource.zIndex*1 + j+1;
                            objs[i]._objects[j].zIndex=self.editGroupZindex + j+1;
                            objs[i]._objects[j].parentID=objs[i].id;
                            objs[i]._objects[j].sortPath=sortIndex + index;
                       
                            _JC.layer.canvasOperation.setLayerSortPath(objs[i]._objects[j].id,objs[i]._objects[j].sortPath);
                            objs[i]._objects[j].set({selected:false,editable:true,hasControls:true,active:false,selectable:true,zIndex:(self.editGroupZindex + j+1)});
                            index++;
                        }
                       
                        objs[i].toActiveSelection();
                        //如果是组，就进行分解
                        
                        setTimeout(function() {
                            canvas.discardActiveObject();
                            canvas.renderAll();
                        }, 100);
                    }
                    

                }
            }
            //调事页面元素显示事件
            self.pageEvent.editGroup();
            
        }
        
        //组合分解时，生成灰色背景层 true 显示，false删除
        this.editBackgroundReact=function(status,zIndex){
            if (status==true){
                var data={};
                data.left=0;
                data.top=0;
                // data.width=self.canvasConfig.width;
                // data.height=self.canvasConfig.height;
                
                data.width=0;
                data.height=0;
                
                data.type="rect";
                data.fill="#7a7a7a",
                data.opacity=0;
                data.stroke='#7a7a7a';
                data.backgroundColor='#7a7a7a';
                data.strokeWidth=1;
                data.zIndex=zIndex*1;
                data.scaleX=1;
                data.scaleY=1;
                data.dType="editGroupBg";
                data.id="editGroupBg";
                data.selectable=false;
                var rect = new fabric.Rect(data);
                canvas.add(rect);
                canvas.renderAll();
            }else{
                var objs = canvas.getObjects();
                for (var i=0;i<objs.length;i++){
                    if ("editGroupBg"==objs[i].dType){
                        canvas.remove(objs[i]); 
                    }
                }
                
            }
        }
        
        //选择对象创建组 
        this.createLayerGroup=function(objs,parentGroup=null,callback=null){
            
            if (self.undoGroupSource==null){
                //在画布中非编辑分组下创建编组
    
                if (self.selectedObject.length>1){
          
                    var _tmpID=Date.parse(new Date());
                    var _dType='tmpGroup';
                    var _zIndex=self.getCanvasObjCount();
                    var minLeft=9999990;
                    var minTop=9999990;
                    var selectedObjectID=[];

                    var preLayerID=null;


                    //处理通过图层面板多选组件 layerActiveSelection -> 拆分子组件到self.selectedObject
                    for (var i=0;i<self.selectedObject.length;i++){
                        if (self.selectedObject[i].hasOwnProperty("group")){ 

                            if (self.selectedObject[i].dType=="Product"){
                                self.pageEvent.errMsg("Product components must not be grouped with other components");
                                return;
                            }
                            
                            if (self.selectedObject[i].dType=="PageNo"){
                                self.pageEvent.errMsg("PageNo  must not be grouped with other components");
                                return;
                            }
                            
                            if (self.selectedObject[i].id=="BackgroundImage"){
                                self.pageEvent.errMsg("BackgroundImage must not be grouped with other components");
                                return;
                            }

                            if (self.selectedObject[i].group.dType=="layerActiveSelection"){
                                
                                //所选组不是同一分组或不同一层次,不能编组
                                self.pageEvent.errMsg("Unable to create a set of objects belonging to different groups");
                                
                                return;
                                // for (var j=0;j<self.selectedObject[i].group._objects.length;j++){
                                //     self.selectedObject.push(self.selectedObject[i].group._objects[j]);
                                // }
                                // self.selectedObject.splice(i,1);
                            }
                        }
                    }
                    
                    //所选组件的上层分组ID，用于识别所选组是否同一分组同一层次（不是层级），是->可以编组，否不能编组
                    var parentObj=[];
                    for (var i=0;i<self.selectedObject.length;i++){
                        
                        if (self.selectedObject[i].hasOwnProperty("group")){
                            
                            if (self.selectedObject[i].group.left<minLeft){
                                minLeft=self.selectedObject[i].group.left;
                            }
                            if (self.selectedObject[i].group.top<minTop){
                                minTop=self.selectedObject[i].group.top;
                            }
                        }else{
                            if (self.selectedObject[i].left<minLeft){
                                minLeft=self.selectedObject[i].left;
                            }
                            if (self.selectedObject[i].top<minTop){
                                minTop=self.selectedObject[i].top;
                            }
                        }
                        
                        selectedObjectID.push(self.selectedObject[i].id);
                        
                        if (self.selectedObject[i].hasOwnProperty("group")){
                            if (parentObj.indexOf(self.selectedObject[i].group.id)==-1){
                                parentObj.push(self.selectedObject[i].group.id);
                            }
                        }else {
                            if (parentObj.indexOf("top")==-1){
                                parentObj.push("top");
                            }
                        }
                    }
                   
                    if (parentObj.length>1){
                        //所选组不是同一分组或不同一层次,不能编组
                        self.pageEvent.errMsg("Unable to create a set of objects belonging to different groups");
                        return;
                    }else{

                        var objs = canvas.getObjects();
                        var maxSortIndex=-1;
                        var _tmp=[];
                        
                        for (var i=0;i<objs.length;i++){
                            if (objs[i]!=null && objs[i]!=undefined){
                                if (selectedObjectID.indexOf(objs[i].id)>-1){
                                    _tmp.push(objs[i]);
                                    if (i>maxSortIndex){
                                        maxSortIndex=i;
                                    }

                                    if (preLayerID==null){
                                        var preID=_JC.layer.render.getLayerPreEle(objs[i].id);
                                        if (selectedObjectID.indexOf(preID)==-1){
                                            preLayerID=preID;
                                        }
                                    }
                                }
                            }
                        }
                
                        var sel = new fabric.ActiveSelection(_tmp, {
                          canvas: canvas,
                        });
                        var group=sel.toGroup();
                        group.set(
                            {id:_tmpID,
                             dType:_dType,
                             zIndex:_zIndex,
                             left:minLeft,
                             top:minTop,
                             visible:true,
                             type:'group',
                             sortPath:_tmpID+""
                            });
                        canvas.setActiveObject(group);
                        canvas.requestRenderAll();
                        //在画面删除选中编组原组件
                        for (var i=0;i<self.selectedObject.length;i++){
                            self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                            canvas.remove(self.selectedObject[i]);
                        }
                        console.log("maxSortIndex= " + maxSortIndex);
                        if (maxSortIndex - self.selectedObject.length + 1 >0){
                            maxSortIndex=maxSortIndex - self.selectedObject.length + 1;
                        }
                        group.moveTo(maxSortIndex);
                        canvas.renderAll();
                        self.cunterObj=group;
                        self.selectedObject=[]
                        self.selectedObject.push(group);
                        self.undoGroupSource=null;
                        _parent.resetObjectSeledted();
                        self.layer.canvasOperation.createComponent(self.cunterObj);

                        if (isEmpty(preLayerID)==false){
                            self.layer.render.layerMove(self.cunterObj.id,{type:"moveToLayerBackward",preObjectID:preLayerID});
                        }

                        self.layer.canvasOperation.chooseLayer({layerID:self.cunterObj.id});
    
                        //选择对象创建组页面元素事件
                        self.pageEvent.composeGroup();
                        _parent.editBackgroundReact(false,null);
                        self.pageEvent.groupAttributes();
                    }
                }else{
                    layer.msg("must select two objects to combine");
                }
            }else{
                //在编辑分组中，筛选组件创建子分组
                
                if (self.selectedObject==null){
                    //console.log("在编辑分组中创建子分组 1");
                    return;
                }else if (self.selectedObject.length==1){
                    //console.log("在编辑分组中创建子分组 2");
                    return;
                }else if (self.selectedObject.length>1){
                    //console.log("在编辑分组中创建子分组 3");
                    var minLeft=9999990;
                    var minTop=9999990;
                    var _tmp=[];
                    var disableComponent=self.disableComponent;
                    var _sortPath=self.undoGroupSource.sortPath;
                    var objs=canvas._objects;
                    var _tmpID=Date.parse(new Date());
                    var _dType='tmpGroup';
                    var _zIndex=self.editGroupZindex * 1;
                    var minLeft=9999990;
                    var minTop=9999990;
                    var maxZindex=-1;
                    
                    for (var i=0;i<self.selectedObject.length;i++){
                        if (self.selectedObject[i]!=null){
                       
                            if (self.selectedObject[i].hasOwnProperty("dType")){ 
                                
                                if (disableComponent.indexOf(self.selectedObject[i].dType)==-1){   
                                    
                                    self.selectedObject[i].zIndex=i+1;
                                    self.selectedObject[i].sortPath=_sortPath + "," + i;
                                    _tmp.push(self.selectedObject[i]);
                                    
                                    if (self.selectedObject[i].left<minLeft){
                                        minLeft=self.selectedObject[i].left;
                                    }
                                    
                                    if (self.selectedObject[i].top<minTop){
                                        minTop=self.selectedObject[i].top;
                                    }
                                    
                                  
                                    
                                }
                            }
                                
                         
                        }
                    }
                    
                    canvas.discardActiveObject();
                    var sel = new fabric.ActiveSelection(_tmp, {
                      canvas: canvas,
                    });
                    var group=sel.toGroup();
                    group.set(
                        {id:_tmpID,
                         dType:_dType,
                         zIndex:_zIndex,
                        //  left:minLeft,
                        //  top:minTop,
                         visible:true,
                         parentID:self.undoGroupSource.id,
                         sortPath:_tmpID+""
                        });
                     
                    canvas.setActiveObject(group);
                    canvas.requestRenderAll();
                    
                    var parm={};
                        parm.afterID=self.selectedObject[0].id;
                        parm.objects=[group];
                    self.layer.canvasOperation.insertComponent(parm);
                    
                    //在画面删除选中编组原组件
                    for (var i=0;i<self.selectedObject.length;i++){
                        
                        self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                        canvas.remove(self.selectedObject[i]);
                    }
   
                    canvas.renderAll();
                    self.cunterObj=group;
                    self.selectedObject.length=0;
                    self.selectedObject.push(group);
                   

                    
                    
                }
                
                
            }
            
        }
        
      
        //退出编辑分组
        this.composeGroup=function(){
            //console.log("composeGroup 编辑分组下合并分组"); 
            if (self.undoGroupSource!=null){
                //编辑分组下创建分组
                //console.log(self.undoGroupSource);
                var _tmpID=self.undoGroupSource.id + "";
                var _dType=self.undoGroupSource.dType+'';
                var _elementCode=self.undoGroupSource.elementCode;
                var _itemCode=self.undoGroupSource.itemCode;
                var _dSort=self.undoGroupSource.dSort;
                var _zIndex=self.undoGroupSource.zIndex;
                var _textInfogmtCreate=self.undoGroupSource.textInfogmtCreate;
                var _sortPath=self.undoGroupSource.sortPath;
                
                var createType=-1;
                if (self.selectedObject==null){
                    canvas.discardActiveObject();
                    var objs = canvas.getObjects();
                }else if (self.selectedObject.length==1){
                    canvas.discardActiveObject();
                    var objs = canvas.getObjects();
                }else{
                    canvas.discardActiveObject();
                    // var objs = self.selectedObject;
                    var objs = canvas.getObjects();
                    createType=0;
                }
                
                var minLeft=9999990;
                var minTop=9999990;
                var _tmp=[];
                var disableComponent=self.disableComponent;

                for (var i=0;i<objs.length;i++){
                    if (objs[i]!=null && objs[i]!=undefined){
                        //objs[i].selectable==true
                        if (self.undoGroupSource.canvasOtherObjects.indexOf(objs[i].id)==-1){
                            
                            if (objs[i].hasOwnProperty("dType")){ 
                                if (disableComponent.indexOf(objs[i].dType)==-1){   
                                    objs[i].zIndex=objs[i].zIndex -  self.editGroupZindex;
                                    objs[i].sortPath=_sortPath + "," + i;
                                    _tmp.push(objs[i]);
                                    if (objs[i].left<minLeft){
                                        minLeft=objs[i].left;
                                    }
                                    if (objs[i].top<minTop){
                                        minTop=objs[i].top;
                                    }
                                }
                            }
                            
                        }
                    }
                }
            
                if (self.cunterObj!=null){
                    if (self.cunterObj.id==self.undoGroupSource.id){
                        minLeft=self.cunterObj.aCoords.tl.x;
                        minTop=self.cunterObj.top;
                    }
                }
                
                var _type;
                //_type=0代表正常合并组，_type=1代表合并当前编组后再去编辑另一个组
                if (self.undoGroupSource.editGroup.hasOwnProperty("group")){
                    var parentObj=self.undoGroupSource.editGroup.group;
                    _type=1;
                    
                }else{
                    var parentObj=canvas;
                    _type=0;
                }
        
                // canvas.remove(self.undoGroupSource.editGroup);
                parentObj.remove(self.undoGroupSource.editGroup);
                
                _parent.editBackgroundReact(false,null);

                if (_type===1){
                    
                    var group = new fabric.Group();
                    for (var i=0;i<_tmp.length;i++){
                        group.addWithUpdate(_tmp[i]);
                        canvas.remove(_tmp[i]);
                    }
          
                    var pointer=parentObj.getAbsoluteCenterPoint();
                    
                    group.set({
                        id:self.undoGroupSource.id,
                        padding:0,
                        selectable: true,
                        visible:true,
                        dType:self.undoGroupSource.dType
                    });
                    
                 
                    parentObj.add(group);
                    
                    var _x=minLeft - pointer.x;
                    var _y=minTop - pointer.y ;
                    parentObj._objects[parentObj._objects.length -1].set({left:_x,top:_y});

                    self.cunterObj=parentObj._objects[parentObj._objects.length -1];

                    self.selectedObject=[]
                    self.selectedObject.push(self.cunterObj);


                    parentObj._objects[parentObj._objects.length -1].moveTo(self.undoGroupSource.sortIndex);
                    parentObj.dirty = true;
                    
                    parentObj.addWithUpdate();
                    parentObj.setCoords();
                    

                }else{
                    
                    var sel = new fabric.ActiveSelection(_tmp, {
                      canvas: canvas,
                    });
                    
                    var group=sel.toGroup();
                    group.set({
                        id:_tmpID,
                        dType:_dType,
                        itemCode:_itemCode,
                        dSort:_dSort,
                        sortPath:_sortPath,
                        elementCode:_elementCode,
                        zIndex:_zIndex,
                        
                        textInfogmtCreate:_textInfogmtCreate,
                        visible:true
                    });
                    
                    group.moveTo(self.undoGroupSource.sortIndex);
                    
                    
                }
                
                
                canvas.setActiveObject(group);
                self.cunterObj=group;
                
                if (_type==1){
                    //待测试是否注释
                    // self.layer.canvasOperation.createComponent(self.cunterObj);
                }
                
                parentObj._objects.sort((a, b) => (a.zIndex > b.zIndex) ? 1 : -1);
                canvas.renderAll();

                self.undoGroupSource=null;
                _parent.resetObjectSeledted();

                //选择对象创建组页面元素事件
                if (_dType=="Product"){
                    self.pageEvent.composeGroup();
                    self.pageEvent.productAttributes();
                    
                }else if (_dType=="tmpGroup"){
                    self.pageEvent.composeGroup();
                }
                
            }else{
                //非编辑分组下创建分组
                if (self.selectedObject.length>1){
          
                    var _tmpID=Date.parse(new Date());
                    var _dType='tmpGroup';
                    var _zIndex=self.getCanvasObjCount();
                    var minLeft=9999990;
                    var minTop=9999990;
                    var selectedObjectID=[];
                    
                    //处理通过图层面板多选组件 layerActiveSelection -> 拆分子组件到self.selectedObject
                    for (var i=0;i<self.selectedObject.length;i++){
                        if (self.selectedObject[i].hasOwnProperty("group")){ 

                            if (self.selectedObject[i].dType=="Product"){
                                self.pageEvent.errMsg("Product components must not be grouped with other components");
                                return;
                            }
                            
                            if (self.selectedObject[i].dType=="PageNo"){
                                self.pageEvent.errMsg("PageNo  must not be grouped with other components");
                                return;
                            }
                            
                            if (self.selectedObject[i].id=="BackgroundImage"){
                                self.pageEvent.errMsg("BackgroundImage must not be grouped with other components");
                                return;
                            }

                            if (self.selectedObject[i].group.dType=="layerActiveSelection"){
                                
                                //所选组不是同一分组或不同一层次,不能编组
                                self.pageEvent.errMsg("Unable to create a set of objects belonging to different groups");
                                
                                return;
                                // for (var j=0;j<self.selectedObject[i].group._objects.length;j++){
                                //     self.selectedObject.push(self.selectedObject[i].group._objects[j]);
                                // }
                                // self.selectedObject.splice(i,1);
                            }
                        }
                    }
                    
                    //所选组件的上层分组ID，用于识别所选组是否同一分组同一层次（不是层级），是->可以编组，否不能编组
                    var parentObj=[];
                    for (var i=0;i<self.selectedObject.length;i++){
                       
                        if (self.selectedObject[i].group.left<minLeft){
                            minLeft=self.selectedObject[i].group.left;
                        }
                        if (self.selectedObject[i].group.top<minTop){
                            minTop=self.selectedObject[i].group.top;
                        }
                        
                        selectedObjectID.push(self.selectedObject[i].id);
                        
                        if (self.selectedObject[i].hasOwnProperty("group")){
                            if (parentObj.indexOf(self.selectedObject[i].group.id)==-1){
                                parentObj.push(self.selectedObject[i].group.id);
                            }
                        }else {
                            if (parentObj.indexOf("top")==-1){
                                parentObj.push("top");
                            }
                        }
                    }
                   
                    if (parentObj.length>1){
                        //所选组不是同一分组或不同一层次,不能编组
                        self.pageEvent.errMsg("Unable to create a set of objects belonging to different groups");
                        return;
                    }else{

                        var objs = canvas.getObjects();
                        var maxSortIndex=-1;
                        var _tmp=[];
                        for (var i=0;i<objs.length;i++){
                            if (objs[i]!=null && objs[i]!=undefined){
                                if (selectedObjectID.indexOf(objs[i].id)>-1){
                                    _tmp.push(objs[i]);
                                    if (i>maxSortIndex){
                                        maxSortIndex=i;
                                    }
                                }
                            }
                        }
                
                        var sel = new fabric.ActiveSelection(_tmp, {
                          canvas: canvas,
                        });
                        var group=sel.toGroup();
                        group.set(
                            {id:_tmpID,
                             dType:_dType,
                             zIndex:_zIndex,
                             left:minLeft,
                             top:minTop,
                             visible:true,
                             sortPath:_tmpID+""
                            });
                        canvas.setActiveObject(group);
                        canvas.requestRenderAll();
                        //在画面删除选中编组原组件
                        for (var i=0;i<self.selectedObject.length;i++){
                            self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                            canvas.remove(self.selectedObject[i]);
                        }
                        console.log("maxSortIndex= " + maxSortIndex);
                        if (maxSortIndex - self.selectedObject.length + 1 >0){
                            maxSortIndex=maxSortIndex - self.selectedObject.length + 1;
                        }
                        group.moveTo(maxSortIndex);
                        canvas.renderAll();
                        self.cunterObj=group;
                        self.selectedObject=[]
                        self.selectedObject.push(group);
                        self.undoGroupSource=null;
                        _parent.resetObjectSeledted();
                        self.layer.canvasOperation.createComponent(self.cunterObj);
                        self.layer.canvasOperation.chooseLayer({layerID:self.cunterObj.id});
    
                        //选择对象创建组页面元素事件
                        self.pageEvent.composeGroup();
                        _parent.editBackgroundReact(false,null);
                        self.pageEvent.groupAttributes();
                    }
                }else{
                    layer.msg("must select two objects to combine");
                }
            }
        }
        
        this.composeGroup_bak_20230424=function(){
    
            if (self.undoGroupSource!=null){
                //编辑分组下创建分组
                
                var _tmpID=self.undoGroupSource.id + "";
                var _dType=self.undoGroupSource.dType+'';
                var _elementCode=self.undoGroupSource.elementCode;
                var _itemCode=self.undoGroupSource.itemCode;
                var _dSort=self.undoGroupSource.dSort;
                var _zIndex=self.undoGroupSource.zIndex;
                var _textInfogmtCreate=self.undoGroupSource.textInfogmtCreate;
                var _sortPath=self.undoGroupSource.sortPath;
                
                if (self.selectedObject==null){
                    canvas.discardActiveObject();
                    var objs = canvas.getObjects();
                }else if (self.selectedObject.length==1){
                    canvas.discardActiveObject();
                    var objs = canvas.getObjects();
                }else{
                    var objs = self.selectedObject;
                }

                var minLeft=9999990;
                var minTop=9999990;
                var _tmp=[];
                var disableComponent=self.disableComponent;
                
                for (var i=0;i<objs.length;i++){
                    if (objs[i]!=null && objs[i]!=undefined){
                        //objs[i].selectable==true
                        if (self.undoGroupSource.canvasOtherObjects.indexOf(objs[i].id)==-1){
                            
                            if (objs[i].hasOwnProperty("dType")){ 
                                if (disableComponent.indexOf(objs[i].dType)==-1){   
                                    objs[i].zIndex=objs[i].zIndex -  self.editGroupZindex;
                                    objs[i].sortPath=_sortPath + "," + i;
                                    _tmp.push(objs[i]);
                                    if (objs[i].left<minLeft){
                                        minLeft=objs[i].left;
                                    }
                                    if (objs[i].top<minTop){
                                        minTop=objs[i].top;
                                    }
                                }
                            }
                            
                        }
                    }
                }
            
                if (self.cunterObj!=null){
                    if (self.cunterObj.id==self.undoGroupSource.id){
                        minLeft=self.cunterObj.aCoords.tl.x;
                        minTop=self.cunterObj.top;
                    }
                }
                
                var _type;
                if (self.undoGroupSource.editGroup.hasOwnProperty("group")){
                    var parentObj=self.undoGroupSource.editGroup.group;
                    _type=1;
                }else{
                    var parentObj=canvas;
                    _type=0;
                }
                // canvas.remove(self.undoGroupSource.editGroup);
                parentObj.remove(self.undoGroupSource.editGroup);
                
                _parent.editBackgroundReact(false,null);

                if (_type===1){
                    
                    var group = new fabric.Group();
                    for (var i=0;i<_tmp.length;i++){
                        group.addWithUpdate(_tmp[i]);
                        canvas.remove(_tmp[i]);
                    }
          
                    var pointer=parentObj.getAbsoluteCenterPoint();
                    
                    group.set({
                        id:self.undoGroupSource.id,
                        padding:0,
                        selectable: true,
                        dType:self.undoGroupSource.dType
                    });
                    
                 
                    parentObj.add(group);
                    //console.log(self.undoGroupSource.sortIndex,parentObj);
                    
                    var _x=minLeft - pointer.x;
                    var _y=minTop - pointer.y ;
                    parentObj._objects[parentObj._objects.length -1].set({left:_x,top:_y});

                    self.cunterObj=parentObj._objects[parentObj._objects.length -1];

                    self.selectedObject=[]
                    self.selectedObject.push(self.cunterObj);


                    parentObj._objects[parentObj._objects.length -1].moveTo(self.undoGroupSource.sortIndex);
                    parentObj.dirty = true;
                    
                    parentObj.addWithUpdate();
                    parentObj.setCoords();
                    

                }else{
                    
                    var sel = new fabric.ActiveSelection(_tmp, {
                      canvas: canvas,
                    });
                    
                    var group=sel.toGroup();
                    group.set({
                        id:_tmpID,
                        dType:_dType,
                        itemCode:_itemCode,
                        dSort:_dSort,
                        sortPath:_sortPath,
                        elementCode:_elementCode,
                        zIndex:_zIndex,
                        
                        textInfogmtCreate:_textInfogmtCreate,
                        visible:true
                    });
                    
                    group.moveTo(self.undoGroupSource.sortIndex);
                }
                
                
                canvas.setActiveObject(group);
                self.cunterObj=group;
                
                if (_type==1){
                    self.layer.canvasOperation.createComponent(self.cunterObj);
                }
                
                parentObj._objects.sort((a, b) => (a.zIndex > b.zIndex) ? 1 : -1);
                canvas.renderAll();

                self.undoGroupSource=null;
                _parent.resetObjectSeledted();

                //选择对象创建组页面元素事件
                if (_dType=="Product"){
                    self.pageEvent.composeGroup();
                    self.pageEvent.productAttributes();
                    
                }else if (_dType=="tmpGroup"){
                    self.pageEvent.composeGroup();
                }
                
            }else{
                //非编辑分组下创建分组
                if (self.selectedObject.length>1){
          
                    var _tmpID=Date.parse(new Date());
                    var _dType='tmpGroup';
                    var _zIndex=self.getCanvasObjCount();
                    var minLeft=9999990;
                    var minTop=9999990;
                    var selectedObjectID=[];
                    
                    //处理通过图层面板多选组件 layerActiveSelection -> 拆分子组件到self.selectedObject
                    for (var i=0;i<self.selectedObject.length;i++){
                        if (self.selectedObject[i].hasOwnProperty("group")){ 

                            if (self.selectedObject[i].dType=="Product"){
                                self.pageEvent.errMsg("Product components must not be grouped with other components");
                                return;
                            }
                            
                            if (self.selectedObject[i].dType=="PageNo"){
                                self.pageEvent.errMsg("PageNo  must not be grouped with other components");
                                return;
                            }
                            
                            if (self.selectedObject[i].id=="BackgroundImage"){
                                self.pageEvent.errMsg("BackgroundImage must not be grouped with other components");
                                return;
                            }

                            if (self.selectedObject[i].group.dType=="layerActiveSelection"){
                                
                                //所选组不是同一分组或不同一层次,不能编组
                                self.pageEvent.errMsg("Unable to create a set of objects belonging to different groups");
                                
                                return;
                       
                            }
                        }
                    }
                    
                    //所选组件的上层分组ID，用于识别所选组是否同一分组同一层次（不是层级），是->可以编组，否不能编组
                    var parentObj=[];
                    for (var i=0;i<self.selectedObject.length;i++){
                       
                        if (self.selectedObject[i].group.left<minLeft){
                            minLeft=self.selectedObject[i].group.left;
                        }
                        if (self.selectedObject[i].group.top<minTop){
                            minTop=self.selectedObject[i].group.top;
                        }
                        
                        selectedObjectID.push(self.selectedObject[i].id);
                        
                        if (self.selectedObject[i].hasOwnProperty("group")){
                            if (parentObj.indexOf(self.selectedObject[i].group.id)==-1){
                                parentObj.push(self.selectedObject[i].group.id);
                            }
                        }else {
                            if (parentObj.indexOf("top")==-1){
                                parentObj.push("top");
                            }
                        }
                    }
                    //console.log("parentObj",parentObj,self.selectedObject);
                    if (parentObj.length>1){
                        //所选组不是同一分组或不同一层次,不能编组
                        self.pageEvent.errMsg("Unable to create a set of objects belonging to different groups");
                        return;
                    }else{

                        var objs = canvas.getObjects();
                        var maxSortIndex=-1;
                        var _tmp=[];
                        for (var i=0;i<objs.length;i++){
                            if (objs[i]!=null && objs[i]!=undefined){
                                if (selectedObjectID.indexOf(objs[i].id)>-1){
                                    _tmp.push(objs[i]);
                                    if (i>maxSortIndex){
                                        maxSortIndex=i;
                                    }
                                }
                            }
                        }
                
                        var sel = new fabric.ActiveSelection(_tmp, {
                          canvas: canvas,
                        });
                        var group=sel.toGroup();
                        group.set(
                            {id:_tmpID,
                             dType:_dType,
                             zIndex:_zIndex,
                             left:minLeft,
                             top:minTop,
                             visible:true,
                             sortPath:_tmpID+""
                            });
                        canvas.setActiveObject(group);
                        canvas.requestRenderAll();
                        //在画面删除选中编组原组件
                        for (var i=0;i<self.selectedObject.length;i++){
                            self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                            canvas.remove(self.selectedObject[i]);
                        }
                        console.log("maxSortIndex= " + maxSortIndex);
                        if (maxSortIndex - self.selectedObject.length + 1 >0){
                            maxSortIndex=maxSortIndex - self.selectedObject.length + 1;
                        }
                        group.moveTo(maxSortIndex);
                        canvas.renderAll();
                        self.cunterObj=group;
                        self.selectedObject=[]
                        self.selectedObject.push(group);
                        self.undoGroupSource=null;
                        _parent.resetObjectSeledted();
                        self.layer.canvasOperation.createComponent(self.cunterObj);
                        self.layer.canvasOperation.chooseLayer({layerID:self.cunterObj.id});
    
                        //选择对象创建组页面元素事件
                        self.pageEvent.composeGroup();
                        _parent.editBackgroundReact(false,null);
                        self.pageEvent.groupAttributes();
                    }
                }else{
                    layer.msg("must select two objects to combine");
                }
            }
        }
        
        
        this.composeGroup_bak_20230422=function(){
    
            if (self.undoGroupSource!=null){
                //编辑分组下创建分组
                
                var _tmpID=self.undoGroupSource.id + "";
                var _dType=self.undoGroupSource.dType+'';
                var _elementCode=self.undoGroupSource.elementCode;
                var _itemCode=self.undoGroupSource.itemCode;
                var _dSort=self.undoGroupSource.dSort;
                var _zIndex=self.undoGroupSource.zIndex;
                var _textInfogmtCreate=self.undoGroupSource.textInfogmtCreate;
                var _sortPath=self.undoGroupSource.sortPath;
                
                if (self.selectedObject==null){
                    canvas.discardActiveObject();
                    var objs = canvas.getObjects();
                }else if (self.selectedObject.length==1){
                    canvas.discardActiveObject();
                    var objs = canvas.getObjects();
                }else{
                    var objs = self.selectedObject;
                }

                var minLeft=9999990;
                var minTop=9999990;
                var _tmp=[];
                var disableComponent=self.disableComponent;
                
                for (var i=0;i<objs.length;i++){
                    if (objs[i]!=null && objs[i]!=undefined){
                        //objs[i].selectable==true
                        if (self.undoGroupSource.canvasOtherObjects.indexOf(objs[i].id)==-1){
                            if (objs[i].hasOwnProperty("dType")){ 
                                if (disableComponent.indexOf(objs[i].dType)==-1){   
                                    objs[i].zIndex=objs[i].zIndex -  self.editGroupZindex;
                                    objs[i].sortPath=_sortPath + "," + i;
                                    _tmp.push(objs[i]);
                                    if (objs[i].left<minLeft){
                                        minLeft=objs[i].left;
                                    }
                                    if (objs[i].top<minTop){
                                        minTop=objs[i].top;
                                    }
                                }
                            }
                        }
                    }
                }
            
                if (self.cunterObj!=null){
                    if (self.cunterObj.id==self.undoGroupSource.id){
                        minLeft=self.cunterObj.aCoords.tl.x;
                        minTop=self.cunterObj.top;
                    }
                }
                
                var _type;
                if (self.undoGroupSource.editGroup.hasOwnProperty("group")){
                    var parentObj=self.undoGroupSource.editGroup.group;
                    _type=1;
                }else{
                    var parentObj=canvas;
                    _type=0;
                }
                // canvas.remove(self.undoGroupSource.editGroup);
                parentObj.remove(self.undoGroupSource.editGroup);
                
                _parent.editBackgroundReact(false,null);


                if (_type===1){
                    
                    var group = new fabric.Group();
                    for (var i=0;i<_tmp.length;i++){
                        group.addWithUpdate(_tmp[i]);
                        canvas.remove(_tmp[i]);
                    }
          
                    var pointer=parentObj.getAbsoluteCenterPoint();
                    
                    group.set({
                        id:self.undoGroupSource.id,
                        padding:0,
                        selectable: true,
                        dType:self.undoGroupSource.dType
                    });
                    
                 
                    parentObj.add(group);
                    //console.log(self.undoGroupSource.sortIndex,parentObj);
                    
                    var _x=minLeft - pointer.x;
                    var _y=minTop - pointer.y ;
                    parentObj._objects[parentObj._objects.length -1].set({left:_x,top:_y});

                    self.cunterObj=parentObj._objects[parentObj._objects.length -1];

                    self.selectedObject=[]
                    self.selectedObject.push(self.cunterObj);


                    parentObj._objects[parentObj._objects.length -1].moveTo(self.undoGroupSource.sortIndex);
                    parentObj.dirty = true;
                    
                    parentObj.addWithUpdate();
                    parentObj.setCoords();
                    

                }else{
                    
                    var sel = new fabric.ActiveSelection(_tmp, {
                      canvas: canvas,
                    });
                    
                    var group=sel.toGroup();
                    group.set({
                        id:_tmpID,
                        dType:_dType,
                        itemCode:_itemCode,
                        dSort:_dSort,
                        sortPath:_sortPath,
                        elementCode:_elementCode,
                        zIndex:_zIndex,
                        
                        textInfogmtCreate:_textInfogmtCreate,
                        visible:true
                    });
                    
                    group.moveTo(self.undoGroupSource.sortIndex);
                }
                
                
                canvas.setActiveObject(group);
                self.cunterObj=group;
                
                self.layer.canvasOperation.createComponent(self.cunterObj);
                
                parentObj._objects.sort((a, b) => (a.zIndex > b.zIndex) ? 1 : -1);
                canvas.renderAll();

                self.undoGroupSource=null;
                _parent.resetObjectSeledted();

                //选择对象创建组页面元素事件
                if (_dType=="Product"){
                    self.pageEvent.composeGroup();
                    self.pageEvent.productAttributes();
                    
                }else if (_dType=="tmpGroup"){
                    self.pageEvent.composeGroup();
                }
                
            }else{
                //非编辑分组下创建分组
                if (self.selectedObject.length>1){
          
                    var _tmpID=Date.parse(new Date());
                    var _dType='tmpGroup';
                    var _zIndex=self.getCanvasObjCount();
                    var minLeft=9999990;
                    var minTop=9999990;
                    var selectedObjectID=[];
                    
                    //处理通过图层面板多选组件 layerActiveSelection -> 拆分子组件到self.selectedObject
                    for (var i=0;i<self.selectedObject.length;i++){
                        if (self.selectedObject[i].hasOwnProperty("group")){ 

                            if (self.selectedObject[i].dType=="Product"){
                                self.pageEvent.errMsg("Product components must not be grouped with other components");
                                return;
                            }
                            
                            if (self.selectedObject[i].dType=="PageNo"){
                                self.pageEvent.errMsg("PageNo  must not be grouped with other components");
                                return;
                            }
                            
                            if (self.selectedObject[i].id=="BackgroundImage"){
                                self.pageEvent.errMsg("BackgroundImage must not be grouped with other components");
                                return;
                            }

                            if (self.selectedObject[i].group.dType=="layerActiveSelection"){
                                
                                //所选组不是同一分组或不同一层次,不能编组
                                self.pageEvent.errMsg("Unable to create a set of objects belonging to different groups");
                                
                                return;
                                // for (var j=0;j<self.selectedObject[i].group._objects.length;j++){
                                //     self.selectedObject.push(self.selectedObject[i].group._objects[j]);
                                // }
                                // self.selectedObject.splice(i,1);
                            }
                        }
                    }
                    
                    //所选组件的上层分组ID，用于识别所选组是否同一分组同一层次（不是层级），是->可以编组，否不能编组
                    var parentObj=[];
                    for (var i=0;i<self.selectedObject.length;i++){
                       
                        if (self.selectedObject[i].group.left<minLeft){
                            minLeft=self.selectedObject[i].group.left;
                        }
                        if (self.selectedObject[i].group.top<minTop){
                            minTop=self.selectedObject[i].group.top;
                        }
                        
                        selectedObjectID.push(self.selectedObject[i].id);
                        
                        if (self.selectedObject[i].hasOwnProperty("group")){
                            if (parentObj.indexOf(self.selectedObject[i].group.id)==-1){
                                parentObj.push(self.selectedObject[i].group.id);
                            }
                        }else {
                            if (parentObj.indexOf("top")==-1){
                                parentObj.push("top");
                            }
                        }
                    }
                
                    if (parentObj.length>1){
                        //所选组不是同一分组或不同一层次,不能编组
                        self.pageEvent.errMsg("Unable to create a set of objects belonging to different groups");
                        return;
                    }else{

                        var objs = canvas.getObjects();
                        var maxSortIndex=-1;
                        var _tmp=[];
                        for (var i=0;i<objs.length;i++){
                            if (objs[i]!=null && objs[i]!=undefined){
                                if (selectedObjectID.indexOf(objs[i].id)>-1){
                                    _tmp.push(objs[i]);
                                    if (i>maxSortIndex){
                                        maxSortIndex=i;
                                    }
                                }
                            }
                        }
                
                        var sel = new fabric.ActiveSelection(_tmp, {
                          canvas: canvas,
                        });
                        var group=sel.toGroup();
                        group.set(
                            {id:_tmpID,
                             dType:_dType,
                             zIndex:_zIndex,
                             left:minLeft,
                             top:minTop,
                             visible:true,
                             sortPath:_tmpID+""
                            });
                        canvas.setActiveObject(group);
                        canvas.requestRenderAll();
                        //在画面删除选中编组原组件
                        for (var i=0;i<self.selectedObject.length;i++){
                            self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                            canvas.remove(self.selectedObject[i]);
                        }
                     
                        if (maxSortIndex - self.selectedObject.length + 1 >0){
                            maxSortIndex=maxSortIndex - self.selectedObject.length + 1;
                        }
                        group.moveTo(maxSortIndex);
                        canvas.renderAll();
                        self.cunterObj=group;
                        self.selectedObject=[]
                        self.selectedObject.push(group);
                        self.undoGroupSource=null;
                        _parent.resetObjectSeledted();
                        self.layer.canvasOperation.createComponent(self.cunterObj);
                        self.layer.canvasOperation.chooseLayer({layerID:self.cunterObj.id});
    
                        //选择对象创建组页面元素事件
                        self.pageEvent.composeGroup();
                        _parent.editBackgroundReact(false,null);
                        self.pageEvent.groupAttributes();
                    }
                }else{
                    layer.msg("must select two objects to combine");
                }
            }
        }
        
        //恢复画布所有对象可选状态
        this.resetObjectSeledted=function(){
            var objs = canvas.getObjects().map(function(o) {
              return o.set('active', true);
            });
            for (var i=0;i<objs.length;i++){
                if (objs[i].dType!="paperBleed" && objs[i].dType!="paperMargins"  && objs[i].dType!="paperBox"  && objs[i].dType!="paperSlice" && objs[i].dType!="alignmentLine" ){
                    var _value={selectable:true};
                    objs[i].set(_value);
                }
            }
        }
        
        //克隆对象
        this.duplicateObj=function() {
            canvas.getActiveObject().clone(function(cloned) {
                
                //复制操作
                self.clipboard = cloned;
                if (cloned.type === 'activeSelection') {
                    //选中多个组件 处理自定义属性
                    $.each(self.clipboard._objects, function(i) {  
                        if (self.selectedObject[i].dType=="Product"){
                            self.clipboard._objects[i].set({
                                dType:self.selectedObject[i].dType,
                                elementCode:self.selectedObject[i].elementCode,
                                dSort:self.selectedObject[i].dSort,
                                // dtypeIndex:self.selectedObject[i].dtypeIndex,
                                zIndex:self.selectedObject[i].zIndex,
                                itemCode:self.selectedObject[i].itemCode,
                                
                            }); 
                        }else{
                            self.clipboard._objects[i].set({zIndex:self.selectedObject[i].zIndex,dType:self.selectedObject[i].dType}); 
                            if (self.selectedObject[i].elementCode){
                                self.clipboard._objects[i].set({elementCode:self.selectedObject[i].elementCode});
                            }
                            if (self.selectedObject[i].viewBoxWidth){
                                self.clipboard._objects[i].set({viewBoxWidth:self.selectedObject[i].viewBoxWidth,viewBoxHeight:self.selectedObject[i].viewBoxHeight});
                            }
                            if (self.selectedObject[i].rotateXY){
                                self.clipboard._objects[i].set({rotateXY:self.selectedObject[i].rotateXY});
                            }
                        }
                        
                        //组件子组件
                        if (self.selectedObject[i]._objects){
                            if (self.selectedObject[i]._objects.length>=1){
                                $.each(self.clipboard._objects[i]._objects, function(j) { 
                                    
                                    self.clipboard._objects[i]._objects[j].set({
                                        zIndex:self.selectedObject[i]._objects[j].zIndex,
                                        dType:self.selectedObject[i]._objects[j].dType
                                    });
                                    
                                    if (self.selectedObject[i]._objects[j].hasOwnProperty("dataFiled")){
                                        self.clipboard._objects[i]._objects[j].set({dataFiled:self.selectedObject[i]._objects[j].dataFiled});
                                    }

                                    if (self.selectedObject[i]._objects[j].hasOwnProperty("viewBoxWidth")){
                                        self.clipboard._objects[i]._objects[j].set({viewBoxWidth:self.selectedObject[i]._objects[j].viewBoxWidth,viewBoxHeight:self.selectedObject[i]._objects[j].viewBoxHeight});
                                    }
                                    
                                    if (self.selectedObject[i]._objects[j].hasOwnProperty("rotateXY")){
                                        self.clipboard._objects[i]._objects[j].set({rotateXY:self.selectedObject[i]._objects[j].rotateXY});
                                    }

                                    if (self.selectedObject[i]._objects[j].hasOwnProperty("_objects")){
                                        
                                        $.each(self.selectedObject[i]._objects[j]._objects, function(k) {
                                            if (self.selectedObject[i]._objects[j]._objects[k].hasOwnProperty("dType")){
                                                self.clipboard._objects[i]._objects[j]._objects[k].set({dType:self.selectedObject[i]._objects[j]._objects[k].dType});
                                            }
                                            if (self.selectedObject[i]._objects[j]._objects[k].hasOwnProperty("bindItemCode")){
                                                self.clipboard._objects[i]._objects[j]._objects[k].set({bindItemCode:self.selectedObject[i]._objects[j]._objects[k].bindItemCode});
                                            }
                                            if (self.selectedObject[i]._objects[j]._objects[k].hasOwnProperty("viewBoxWidth")){
                                                self.clipboard._objects[i]._objects[j]._objects[k].set({viewBoxWidth:self.selectedObject[i]._objects[j]._objects[k].viewBoxWidth,viewBoxHeight:self.selectedObject[i]._objects[j]._objects[k].viewBoxHeight});
                                            }
                                            if (self.selectedObject[i]._objects[j]._objects[k].hasOwnProperty("rotateXY")){
                                                self.clipboard._objects[i]._objects[j]._objects[k].set({rotateXY:self.selectedObject[i]._objects[j]._objects[k].rotateXY});
                                            }

                                        });
                                    }
                                    
                                    
                                    
                                });
                            }
                        }
                    }); 
                    
                }else{
                    //选中单个组件 处理自定义属性
                    self.clipboard.dType=self.selectedObject[0].dType;
                    self.clipboard.zIndex=self.selectedObject[0].zIndex;
                    if (self.selectedObject[0].hasOwnProperty("viewBoxWidth")){
                        self.clipboard.viewBoxWidth=self.selectedObject[0].viewBoxWidth;
                        self.clipboard.viewBoxHeight=self.selectedObject[0].viewBoxHeight;
                    }
                    if (self.selectedObject[0].hasOwnProperty("rotateXY")){
                        self.clipboard.rotateXY=self.selectedObject[0].rotateXY;
                    }

                    if (self.selectedObject[0].hasOwnProperty("group")){
                        self.clipboard.left=self.selectedObject[0].group.left + self.selectedObject[0].group.width * self.selectedObject[0].group.scaleX/2 + self.selectedObject[0].left;
                        self.clipboard.top=self.selectedObject[0].group.top + self.selectedObject[0].group.height * self.selectedObject[0].group.scaleY/2 + self.selectedObject[0].top;
                        self.clipboard.zIndex=self.selectedObject[0].group.zIndex * 1 + 1;
                    }else{
                    }
                    if (self.selectedObject[0].elementCode){
                        self.clipboard.elementCode=self.selectedObject[0].elementCode;
                    }
                    if (self.selectedObject[0].dType=="Product"){
                        self.clipboard.elementCode=self.selectedObject[0].elementCode;
                        self.clipboard.dSort=self.selectedObject[0].dSort;
                        self.clipboard.itemCode=self.selectedObject[0].itemCode;
                      //  self.clipboard.dataFiled=self.selectedObject[0].dataFiled;
                    }
                    
                    //组件子组件
                    if (self.selectedObject[0]._objects){
                        if (self.selectedObject[0]._objects.length>=1){
                            $.each(self.clipboard._objects, function(j) { 
                                
                                self.clipboard._objects[j].set({dType:self.selectedObject[0]._objects[j].dType});
                                self.clipboard._objects[j].set({zIndex:self.selectedObject[0]._objects[j].zIndex});
                                
                                if (self.selectedObject[0]._objects[j].hasOwnProperty("dataFiled")){
                                    self.clipboard._objects[j].set({dataFiled:self.selectedObject[0]._objects[j].dataFiled});
                                }
                                
                                if (self.selectedObject[0]._objects[j].hasOwnProperty("viewBoxWidth")){
                                    self.clipboard._objects[j].set({viewBoxWidth:self.selectedObject[0]._objects[j].viewBoxWidth});
                                    self.clipboard._objects[j].set({viewBoxHeight:self.selectedObject[0]._objects[j].viewBoxHeight});
                                }

                                if (self.selectedObject[0]._objects[j].hasOwnProperty("rotateXY")){
                                    self.clipboard._objects[j].set({rotateXY:self.selectedObject[0]._objects[j].rotateXY});
                                }

                                if (self.selectedObject[0]._objects[j].hasOwnProperty("_objects")){
                                    $.each(self.selectedObject[0]._objects[j]._objects, function(k) {
                                        if (self.selectedObject[0]._objects[j]._objects[k].hasOwnProperty("dType")){
                                            self.clipboard._objects[j]._objects[k].set({dType:self.selectedObject[0]._objects[j]._objects[k].dType});
                                        }
                                        if (self.selectedObject[0]._objects[j]._objects[k].hasOwnProperty("bindItemCode")){
                                            self.clipboard._objects[j]._objects[k].set({bindItemCode:self.selectedObject[0]._objects[j]._objects[k].bindItemCode});
                                        }
                                        if (self.selectedObject[0]._objects[j]._objects[k].hasOwnProperty("viewBoxWidth")){
                                            self.clipboard._objects[j]._objects[k].set({viewBoxWidth:self.selectedObject[0]._objects[j]._objects[k].viewBoxWidth,viewBoxHeight:self.selectedObject[0]._objects[j]._objects[k].viewBoxHeight});
                                            
                                        }
                                        if (self.selectedObject[0]._objects[j]._objects[k].hasOwnProperty("rotateXY")){
                                            self.clipboard._objects[j]._objects[k].set({rotateXY:self.selectedObject[0]._objects[j]._objects[k].rotateXY});
                                        }
                                    });
                                }
                                
                                
                            });
                        }
                    }
                }
                
                //定时器 定时粘贴被克隆组件
                setTimeout(function () {
                    self.clipboard.clone(function(clonedObj) {
                
                        var offsetLeft=10,offsetTop=10;
                        self.drawing=true;
                        canvas.discardActiveObject();
                        clonedObj.set({
                            left: clonedObj.left + offsetLeft,
                            top: clonedObj.top + offsetTop,
                            evented: true,//是否清空剪贴板?
                        });
                        if (clonedObj.type === 'activeSelection') {
                            // active selection needs a reference to the canvas.
                            clonedObj.canvas = canvas;
                            var i=0;
                            clonedObj.forEachObject(function(obj) {
                                if (self.clipboard._objects[i].dType!="Product"){
                                    obj.set({
                                        dtypeIndex:self.createTypeIndex(self.clipboard._objects[i].dType),
                                        id:self.createID(),
                                        dType:self.clipboard._objects[i].dType,
                                        zIndex:self.clipboard._objects[i].zIndex
                                    });
                                    if (self.clipboard._objects[i].elementCode){
                                        obj.set({elementCode:self.clipboard._objects[i].elementCode});
                                    }
                                    if (self.clipboard._objects[i].viewBoxWidth){
                                        obj.set({viewBoxWidth:self.clipboard._objects[i].viewBoxWidth});
                                    }
                                    if (self.clipboard._objects[i].viewBoxHeight){
                                        obj.set({viewBoxHeight:self.clipboard._objects[i].viewBoxHeight});
                                    }
                                    if (self.clipboard._objects[i].rotateXY){
                                        obj.set({rotateXY:self.clipboard._objects[i].rotateXY});
                                    }

                                }else{
                                    obj.set({
                                        dtypeIndex:self.createTypeIndex(self.clipboard._objects[i].dType),
                                        id:self.createID(),
                                        dType:self.clipboard._objects[i].dType,
                                        elementCode:self.clipboard._objects[i].elementCode,
                                        itemCode:self.clipboard._objects[i].itemCode,
                                        dSort:self.clipboard._objects[i].dSort,
                                        zIndex:self.clipboard._objects[i].zIndex
                                    });
                                }
                                
                                //组件子组件处理
                                if (self.clipboard._objects[i]._objects){
                                    $.each(self.clipboard._objects[i]._objects, function(j) {
                                        
                                        if(self.clipboard._objects[i]._objects[j].zIndex){
                                            var _zIndex=self.clipboard._objects[i]._objects[j].zIndex;
                                        }else{
                                           var _zIndex=j+1; 
                                        }
                                        
                                        if(self.clipboard._objects[i]._objects[j].viewBoxWidth){
                                            obj._objects[j].set({viewBoxWidth:self.clipboard._objects[i]._objects[j].viewBoxWidth,viewBoxHeight:self.clipboard._objects[i]._objects[j].viewBoxHeight});
                                        }

                                        if(self.clipboard._objects[i]._objects[j].rotateXY){
                                            obj._objects[j].set({rotateXY:self.clipboard._objects[i]._objects[j].rotateXY});
                                        }

                                        obj._objects[j].set({
                                           dtypeIndex:self.createTypeIndex(self.clipboard._objects[i]._objects[j].dType),
                                           dType:self.clipboard._objects[i]._objects[j].dType,
                                           id:self.createID(),
                                           zIndex:_zIndex
                                        });
                                        
                                        if (self.clipboard._objects[i].dType=="Product"){
                                            obj._objects[j].set({dataFiled:self.clipboard._objects[i]._objects[j].dataFiled});
                                            
                                            if (self.clipboard._objects[i]._objects[j].hasOwnProperty("_objects")){
                                                $.each(self.clipboard._objects[i]._objects[j]._objects, function(k) {
                                                
                                                    if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("dType")){
                                                        obj._objects[j]._objects[k].set({dType:self.clipboard._objects[i]._objects[j]._objects[k].dType});
                                                    }
                                                    if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("bindItemCode")){
                                                        obj._objects[j]._objects[k].set({bindItemCode:self.clipboard._objects[i]._objects[j]._objects[k].bindItemCode});
                                                    }                                               
                                                    if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("viewBoxWidth")){
                                                        obj._objects[j]._objects[k].set({viewBoxWidth:self.clipboard._objects[i]._objects[j]._objects[k].viewBoxWidth,viewBoxHeight:self.clipboard._objects[i]._objects[j]._objects[k].viewBoxHeight});
                                                    }   
                                                    if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("rotateXY")){
                                                        obj._objects[j]._objects[k].set({rotateXY:self.clipboard._objects[i]._objects[j]._objects[k].rotateXY});
                                                    }

                                                });        
                                            }
                                            
                                            
                                        }
                                        
                                    });
                                }                   
                                canvas.add(obj);
                                self.layer.canvasOperation.createComponent(obj);
                                i++;
                            });
                            // this should solve the unselectability
                            clonedObj.setCoords();
                        } else {
                            clonedObj.set({
                                dtypeIndex:self.createTypeIndex(self.clipboard.dType),
                                zIndex:self.clipboard.zIndex,
                                id:self.createID(),
                                dType:self.clipboard.dType
                            })
                            if (self.clipboard.elementCode){
                                clonedObj.set({elementCode:self.clipboard.elementCode});
                            }
                            if (self.clipboard.viewBoxWidth){
                                clonedObj.set({viewBoxWidth:self.clipboard.viewBoxWidth});
                            }
                            if (self.clipboard.viewBoxHeight){
                                clonedObj.set({viewBoxHeight:self.clipboard.viewBoxHeight});
                            }
                            if (self.clipboard.rotateXY){
                                clonedObj.set({rotateXY:self.clipboard.rotateXY});
                            }

                            if (self.clipboard.dType=="Product"){
                                clonedObj.set({
                                   elementCode:self.clipboard.elementCode,
                                   itemCode:self.clipboard.itemCode,
                                   dSort:self.clipboard.dSort,
                                });
                            }
                            if (self.clipboard.type=="polygon"){
                                
                                //如果是线条
                                self.cunterObj=clonedObj;
                                self.componentDraw().drawLine();
                                
                            }
                            
                            
                            //组件子组件处理
                            if (self.clipboard._objects){
                                $.each(self.clipboard._objects, function(j) { 
                                    if(self.clipboard._objects[j].zIndex){
                                        var _zIndex=self.clipboard._objects[j].zIndex;
                                    }else{
                                       var _zIndex=j+1; 
                                    }
                                    
                                    clonedObj._objects[j].set({
                                       dtypeIndex:self.createTypeIndex(self.clipboard._objects[j].dType),
                                       dType:self.clipboard._objects[j].dType,
                                       id:self.createID(),
                                       zIndex:_zIndex
                                    });

                                    if(self.clipboard._objects[j].viewBoxWidth){
                                        clonedObj._objects[j].set({viewBoxWidth:self.clipboard._objects[j].viewBoxWidth,viewBoxHeight:self.clipboard._objects[j].viewBoxHeight});
                                    }

                                    if(self.clipboard._objects[j].rotateXY){
                                        clonedObj._objects[j].set({rotateXY:self.clipboard._objects[j].rotateXY});
                                    }

                                    if (self.clipboard.dType=="Product"){
                                        clonedObj._objects[j].set({dataFiled:self.clipboard._objects[j].dataFiled});
                                        
                                        if (self.clipboard._objects[j].hasOwnProperty("_objects")){
                                            $.each(self.clipboard._objects[j]._objects, function(k) { 
                                                
                                                if (self.clipboard._objects[j]._objects[k].hasOwnProperty("dType")){
                                                    clonedObj._objects[j]._objects[k].set({dType:self.clipboard._objects[j]._objects[k].dType});
                                                }
                                                if (self.clipboard._objects[j]._objects[k].hasOwnProperty("bindItemCode")){
                                                    clonedObj._objects[j]._objects[k].set({bindItemCode:self.clipboard._objects[j]._objects[k].bindItemCode});
                                                }   
                                                if (self.clipboard._objects[j]._objects[k].hasOwnProperty("viewBoxWidth")){
                                                    clonedObj._objects[j]._objects[k].set({viewBoxWidth:self.clipboard._objects[j]._objects[k].viewBoxWidth,viewBoxHeight:self.clipboard._objects[j]._objects[k].viewBoxHeight});
                                                } 
                                                if (self.clipboard._objects[j]._objects[k].hasOwnProperty("rotateXY")){
                                                    clonedObj._objects[j]._objects[k].set({rotateXY:self.clipboard._objects[j]._objects[k].rotateXY});
                                                } 
                                                
                                            });
                                        }
                                        
                                    }
                                    
                                });
                            
                            }
                            canvas.add(clonedObj);
                            self.layer.canvasOperation.createComponent(clonedObj);
                        }
                        self.clipboard.top += 100;
                        self.clipboard.left += 100;
                        canvas.setActiveObject(clonedObj);
                        canvas.requestRenderAll();
                        
                        //事务描述
                        var msg="Edit element";
                        _JC.canvasSave().canvasHistoryRecordSave(userID,'editPage',msg);
                        
                    });
                }, 300);
                
            });
        }
        
        //跨页复制 （测试开发中）
        this.copyPageObj=function() {

            var activeObjects=canvas.getActiveObject();
            if (isEmpty(activeObjects)){
                 //通过图层面板多选后复制粘贴
                 var cloneObjs=[];
                 for (var i=0;i<self.selectedObject.length;i++){

                     if (self.selectedObject[i].hasOwnProperty("group")){
                         
                          var theObj=fabric.util.object.clone(self.selectedObject[i]);
                          var center = self.selectedObject[i].getAbsoluteCenterPoint();
                          var thisPos = {
                              xStart: center.x - theObj.width/2 * theObj.scaleX,
                              xEnd: center.x + theObj.width/2 * theObj.scaleX,
                              yStart: center.y - theObj.height/2 * theObj.scaleY,
                              yEnd: center.y + theObj.height/2 * theObj.scaleY
                          };
                          theObj.left=thisPos.xStart;
                          theObj.top=thisPos.yStart;
                          cloneObjs.push(theObj);
                     }else{
                        cloneObjs.push(fabric.util.object.clone(self.selectedObject[i]));
                     }
                 }
                 activeObjects = new fabric.ActiveSelection(cloneObjs, {
                    canvas: canvas,
                 });
           
            }
            activeObjects.clone(function(cloned) {
              
                //复制操作
                self.clipboard = cloned;
                //复制->原组件当前页
                self.clipboard.page=self.cunterPage;
                if (cloned.type === 'activeSelection') {
                 
                    //选中多个组件 处理自定义属性
                    $.each(self.clipboard._objects, function(i) {  
                        if (self.selectedObject[i].dType=="Product"){
                            self.clipboard._objects[i].set({
                                dType:self.selectedObject[i].dType,
                                elementCode:self.selectedObject[i].elementCode,
                                dSort:self.selectedObject[i].dSort,
                                // dtypeIndex:self.selectedObject[i].dtypeIndex,
                                zIndex:self.selectedObject[i].zIndex,
                                itemCode:self.selectedObject[i].itemCode,
                            }); 
                        }else{
                             self.clipboard._objects[i].set({zIndex:self.selectedObject[i].zIndex,dType:self.selectedObject[i].dType}); 
                            if (self.selectedObject[i].elementCode){
                                self.clipboard._objects[i].set({elementCode:self.selectedObject[i].elementCode});
                            }
                            if (self.selectedObject[i].viewBoxWidth){
                                self.clipboard._objects[i].set({viewBoxWidth:self.selectedObject[i].viewBoxWidth,viewBoxHeight:self.selectedObject[i].viewBoxHeight});
                            }
                            if (self.selectedObject[i].rotateXY){
                                self.clipboard._objects[i].set({rotateXY:self.selectedObject[i].rotateXY});
                            }
                            if (self.selectedObject[i].dataFiled){
                                self.clipboard._objects[i].set({dataFiled:self.selectedObject[i].dataFiled});
                            }
                            
                            if (self.selectedObject[i].insertText){
                                self.clipboard._objects[i].set({insertText:self.selectedObject[i].insertText});
                            }
                            
                            //复制自定义属性
                            _parent.copyComponentAttr(self.selectedObject[i],self.clipboard._objects[i]);
                            

                        }
                        
                        //组件子组件
                        if (self.selectedObject[i]._objects){
                            
                            if (self.selectedObject[i]._objects.length>=1){
                                $.each(self.clipboard._objects[i]._objects, function(j) { 
                                    
                                    self.clipboard._objects[i]._objects[j].set({
                                        zIndex:self.selectedObject[i]._objects[j].zIndex,
                                        dType:self.selectedObject[i]._objects[j].dType,
                                    });
                                    
                                    if (self.selectedObject[i]._objects[j].hasOwnProperty("dataFiled")){
                                        self.clipboard._objects[i]._objects[j].set({dataFiled:self.selectedObject[i]._objects[j].dataFiled});
                                    }
                                    
                                    if (self.selectedObject[i]._objects[j].hasOwnProperty("viewBoxWidth")){
                                        self.clipboard._objects[i]._objects[j].set({viewBoxWidth:self.selectedObject[i]._objects[j].viewBoxWidth,viewBoxHeight:self.selectedObject[i]._objects[j].viewBoxHeight});
                                    }

                                    if (self.selectedObject[i]._objects[j].hasOwnProperty("rotateXY")){
                                        self.clipboard._objects[i]._objects[j].set({rotateXY:self.selectedObject[i]._objects[j].rotateXY});
                                    }
                                    
                                    if (self.selectedObject[i]._objects[j].hasOwnProperty("insertText")){
                                        self.clipboard._objects[i]._objects[j].set({insertText:self.selectedObject[i]._objects[j].insertText});
                                    }

                                    //复制自定义属性
                                    _parent.copyComponentAttr(self.selectedObject[i]._objects[j],self.clipboard._objects[i]._objects[j]);

                                    if (self.selectedObject[i]._objects[j].hasOwnProperty("_objects")){
                                        
                                        $.each(self.selectedObject[i]._objects[j]._objects, function(k) {
                                            if (self.selectedObject[i]._objects[j]._objects[k].hasOwnProperty("dType")){
                                                self.clipboard._objects[i]._objects[j]._objects[k].set({dType:self.selectedObject[i]._objects[j]._objects[k].dType});
                                            }
                                            if (self.selectedObject[i]._objects[j]._objects[k].hasOwnProperty("bindItemCode")){
                                                self.clipboard._objects[i]._objects[j]._objects[k].set({bindItemCode:self.selectedObject[i]._objects[j]._objects[k].bindItemCode});
                                            }
                                            if (self.selectedObject[i]._objects[j]._objects[k].hasOwnProperty("viewBoxWidth")){
                                                self.clipboard._objects[i]._objects[j]._objects[k].set({viewBoxWidth:self.selectedObject[i]._objects[j]._objects[k].viewBoxWidth,viewBoxHeight:self.selectedObject[i]._objects[j]._objects[k].viewBoxHeight});
                                            }
                                            if (self.selectedObject[i]._objects[j]._objects[k].hasOwnProperty("rotateXY")){
                                                self.clipboard._objects[i]._objects[j]._objects[k].set({rotateXY:self.selectedObject[i]._objects[j]._objects[k].rotateXY});
                                            }
                                            if (self.selectedObject[i]._objects[j]._objects[k].hasOwnProperty("dataFiled")){
                                                self.clipboard._objects[i]._objects[j]._objects[k].set({dataFiled:self.selectedObject[i]._objects[j]._objects[k].dataFiled});
                                            }
                                            if (self.selectedObject[i]._objects[j]._objects[k].hasOwnProperty("insertText")){
                                                self.clipboard._objects[i]._objects[j]._objects[k].set({insertText:self.selectedObject[i]._objects[j]._objects[k].insertText});
                                            }
                                            
                                            //复制自定义属性
                                            _parent.copyComponentAttr(self.selectedObject[i]._objects[j]._objects[k],self.clipboard._objects[i]._objects[j]._objects[k]);
                                            
                                            
                                        });
                                    }
                                    
                                    
                                    
                                });
                            }
                        }
                    }); 
                    
                }else{
                    
                    if (self.selectedObject==undefined || self.selectedObject==null ){
                        return;
                    }
                    //选中单个组件 处理自定义属性
                    self.clipboard.dType=self.selectedObject[0].dType;
                    self.clipboard.zIndex=self.selectedObject[0].zIndex;

                    //如果是分组内的子对象
                    if (self.selectedObject[0].hasOwnProperty("group")){
                        var _zIndex=canvas._objects[canvas._objects.length-1].zIndex*1+1;
                        self.clipboard.zIndex=_zIndex;
                        self.clipboard.left=self.selectedObject[0].group.left + self.selectedObject[0].left + self.selectedObject[0].group.width/2;
                        self.clipboard.top=self.selectedObject[0].group.top + self.selectedObject[0].top + self.selectedObject[0].group.height/2;
                    }


                    if (self.selectedObject[0].elementCode){
                        self.clipboard.elementCode=self.selectedObject[0].elementCode;
                    }

                    if (self.selectedObject[0].viewBoxWidth){
                        self.clipboard.viewBoxWidth=self.selectedObject[0].viewBoxWidth;
                        self.clipboard.viewBoxHeight=self.selectedObject[0].viewBoxHeight;
                    }

                    if (self.selectedObject[0].rotateXY){
                        self.clipboard.rotateXY=self.selectedObject[0].rotateXY;
                    }

                    if (self.selectedObject[0].dataFiled){
                        self.clipboard.dataFiled=self.selectedObject[0].dataFiled;
                    }
                    if (self.selectedObject[0].insertText){
                        self.clipboard.insertText=self.selectedObject[0].insertText;
                    }

                    //复制自定义属性
                    _parent.copyComponentAttr(self.selectedObject[0],self.clipboard);

                    if (self.selectedObject[0].dType=="Product"){
                        self.clipboard.elementCode=self.selectedObject[0].elementCode;
                        self.clipboard.dSort=self.selectedObject[0].dSort;
                        self.clipboard.itemCode=self.selectedObject[0].itemCode;
                        
                    }
                    
                    //组件子组件
                    if (self.selectedObject[0]._objects){
                        if (self.selectedObject[0]._objects.length>=1){
                            $.each(self.clipboard._objects, function(j) { 
                                
                                if (self.selectedObject[0]._objects[j].hasOwnProperty("dataFiled")){
                                    self.clipboard._objects[j].set({dataFiled:self.selectedObject[0]._objects[j].dataFiled});
                                }

                                if (self.selectedObject[0]._objects[j].hasOwnProperty("viewBoxWidth")){
                                    self.clipboard._objects[j].set({viewBoxWidth:self.selectedObject[0]._objects[j].viewBoxWidth,viewBoxHeight:self.selectedObject[0]._objects[j].viewBoxHeight});
                                }

                                if (self.selectedObject[0]._objects[j].hasOwnProperty("rotateXY")){
                                    self.clipboard._objects[j].set({rotateXY:self.selectedObject[0]._objects[j].rotateXY});
                                }
                                
                                if (self.selectedObject[0]._objects[j].hasOwnProperty("insertText")){
                                    self.clipboard._objects[j].set({insertText:self.selectedObject[0]._objects[j].insertText});
                                }

                                //复制自定义属性
                                _parent.copyComponentAttr(self.selectedObject[0]._objects[j],self.clipboard._objects[j]);


                                self.clipboard._objects[j].set({dType:self.selectedObject[0]._objects[j].dType});
                                self.clipboard._objects[j].set({zIndex:self.selectedObject[0]._objects[j].zIndex});
                                
                                if (self.selectedObject[0]._objects[j].hasOwnProperty("_objects")){
                                    $.each(self.selectedObject[0]._objects[j]._objects, function(k) {
                                        if (self.selectedObject[0]._objects[j]._objects[k].hasOwnProperty("dType")){
                                            self.clipboard._objects[j]._objects[k].set({dType:self.selectedObject[0]._objects[j]._objects[k].dType});
                                        }
                                        if (self.selectedObject[0]._objects[j]._objects[k].hasOwnProperty("bindItemCode")){
                                            self.clipboard._objects[j]._objects[k].set({bindItemCode:self.selectedObject[0]._objects[j]._objects[k].bindItemCode});
                                        }
                                        if (self.selectedObject[0]._objects[j]._objects[k].hasOwnProperty("viewBoxWidth")){
                                            self.clipboard._objects[j]._objects[k].set({viewBoxWidth:self.selectedObject[0]._objects[j]._objects[k].viewBoxWidth,viewBoxHeight:self.selectedObject[0]._objects[j]._objects[k].viewBoxHeight});
                                        }
                                        if (self.selectedObject[0]._objects[j]._objects[k].hasOwnProperty("rotateXY")){
                                            self.clipboard._objects[j]._objects[k].set({rotateXY:self.selectedObject[0]._objects[j]._objects[k].rotateXY});
                                        }
                                        if (self.selectedObject[0]._objects[j]._objects[k].hasOwnProperty("dataFiled")){
                                            self.clipboard._objects[j]._objects[k].set({dataFiled:self.selectedObject[0]._objects[j]._objects[k].dataFiled});
                                        }
                                        if (self.selectedObject[0]._objects[j]._objects[k].hasOwnProperty("insertText")){
                                            self.clipboard._objects[j]._objects[k].set({insertText:self.selectedObject[0]._objects[j]._objects[k].insertText});
                                        }
                                        
                                        //复制自定义属性
                                        _parent.copyComponentAttr(self.selectedObject[0]._objects[j]._objects[k],self.clipboard._objects[j]._objects[k],1);
                                        




                                    });
                                }
                                
                                
                            });
                        }
                    }
                }
                
            });
        }


        //跨页粘贴
        this.pastePageObj=function(){
    
            if (self.clipboard==undefined){
                return ;
            }
            self.clipboard.clone(function(clonedObj) {
        
                var disableCopyToCreateType=["Product","PageNo","BackgroundImage"];
                
                self.drawing=true;
                //同页粘贴坐标偏移100,跨页不偏移
                var moveOffset=10;
                if (self.clipboard.page!=self.cunterPage){
                    var moveOffset=0;
                }

                canvas.discardActiveObject();
                clonedObj.set({
                    left: clonedObj.left + moveOffset,
                    top: clonedObj.top + moveOffset,
                    evented: true,//是否清空剪贴板?
                });

                if (self.undoGroupSource!=null){
                    self.clipboard.zIndex=self.clipboard.zIndex + self.editGroupZindex;
                }
            
                //处理数据流程
                var pasterStep="";

                if (clonedObj.type === 'activeSelection') {
                    // active selection needs a reference to the canvas.
                    clonedObj.canvas = canvas;

                    //识别禁止复制粘贴商品组件到Group
                    var hasProductGroup=false;
                    var i=0;
                    if (self.undoGroupSource!=null){
                        clonedObj.forEachObject(function(obj) {
                            
                            if (!isEmpty(self.clipboard._objects[i])){
                                if (self.clipboard._objects[i].hasOwnProperty("dType")){
                                    //self.clipboard._objects[i].dType=="Product"
                                    if (disableCopyToCreateType.indexOf(self.clipboard._objects[i].dType)>-1){
                                       
                                        hasProductGroup=true;
                                    }
                                }
                            }
                        });
                    }
                    if (hasProductGroup){
                        //产品组件禁止插入Group
                        self.pageEvent.errMsg("The " + self.clipboard._objects[i].dType + "  prohibits the insertion of Group");
                        return;
                    }
                    
                    var i=0;
                    clonedObj.forEachObject(function(obj) {
                        
                        if (self.undoGroupSource!=null){
                            self.clipboard._objects[i].zIndex=self.clipboard._objects[i].zIndex + self.editGroupZindex;
                        }
                        
                        if (self.clipboard._objects[i].dType!="Product"){
                            
                            obj.set({
                                dtypeIndex:self.createTypeIndex(self.clipboard._objects[i].dType),
                                id:self.createID(),
                                dType:self.clipboard._objects[i].dType,
                                zIndex:self.clipboard._objects[i].zIndex
                            });
                            if (self.clipboard._objects[i].elementCode){
                                obj.set({elementCode:self.clipboard._objects[i].elementCode});
                            }
                            if (self.clipboard._objects[i].viewBoxWidth){
                                obj.set({viewBoxWidth:self.clipboard._objects[i].viewBoxWidth,viewBoxHeight:self.clipboard._objects[i].viewBoxHeight});
                            }
                            if (self.clipboard._objects[i].rotateXY){
                                obj.set({rotateXY:self.clipboard._objects[i].rotateXY});
                            }
                            if (self.clipboard._objects[i].dataFiled){
                                obj.set({dataFiled:self.clipboard._objects[i].dataFiled});
                            }
                            if (self.clipboard._objects[i].insertText){
                                obj.set({insertText:self.clipboard._objects[i].insertText});
                            }
                            
                            //粘贴自定义属性
                            _parent.pasterComponentAttr(self.clipboard._objects[i],obj);
                            
                            
                            //20230419 多层子组件分组处理ID及dType
                            if (self.clipboard._objects[i].hasOwnProperty("_objects")){
                  
                                _parent.moreLayersGroup(self.clipboard._objects[i],obj);
                                
                            } 


                        }else{

                            /** 跨页复制粘贴商品组件处理流程 
                              * 1､原组件已邦定dSort,在同一页粘贴时，可以完全数据粘贴。 流程 A1
                              * 2､原组件已邦定dSort，跨页粘贴时，在新页面需要识别是否有该 page + dSort。
                              *   a、第2点如果没有达到 page + dSort条件，达到以新商品信息替换原组件。 流程 A2
                              *   b、达不到以组件原 Label 类型名称替换原组件。 流程 A3
                              * 3､原组件未邦定dSort,可以完全数据粘贴。 流程 A1
                            */

                          
                            if (self.clipboard._objects[i].dSort==null || self.clipboard._objects[i].dSort=="" || self.designModule!="mm"){
                                //流程 A1
                                pasterStep="A1";

                            }else{

                                if (self.clipboard.page==self.cunterPage || 1==1){
                                    //流程 A1 , 1==1 取消了跨页粘贴自动根据当前页 dSort的商品数据，改为复制是什么粘贴就是什么
                                    pasterStep="A1";
                                }else if (self.clipboard.page!=self.cunterPage){

                                    /*
                                    if (mmDetailsData[self.cunterPage]!=null){
                                        //该MM商品清单有该页码数据
                                        if (mmDetailsData[self.cunterPage][self.clipboard._objects[i].dSort]!=null){
                                            //有dSort对应数据 流程 A2
                                            pasterStep="A2";

                                        }else{
                                            //该MM商品清单有该页码数据,但没有dSort对应数据 流程 A3
                                            pasterStep="A3";
                                        }

                                    }else{
                                        //该MM商品清单没有该页码数据 流程 A3
                                        pasterStep="A3";

                                    }*/



                                    var _dSort=self.clipboard._objects[i].dSort;
                                    var _dSortArr=_dSort.split("-");                                    

                                    if (mmDetailsData[_dSortArr[0]]!=null){
                                        //该MM商品清单有该页码数据
                                        if (mmDetailsData[_dSortArr[0]][_dSortArr[1]]!=null){
                                            //有dSort对应数据 流程 A2
                                            pasterStep="A2";

                                        }else{
                                            //该MM商品清单有该页码数据,但没有dSort对应数据 流程 A3
                                            pasterStep="A3";
                                        }

                                    }else{
                                        //该MM商品清单没有该页码数据 流程 A3
                                        pasterStep="A3";

                                    }

                                }

                            }

                           

                            obj.set({
                                dtypeIndex:self.createTypeIndex(self.clipboard._objects[i].dType),
                                id:self.createID(),
                                dType:self.clipboard._objects[i].dType,
                                elementCode:self.clipboard._objects[i].elementCode,
                                itemCode:self.clipboard._objects[i].itemCode,
                                dSort:self.clipboard._objects[i].dSort,
                                zIndex:self.clipboard._objects[i].zIndex
                            });
                        }
                        
                        //组件子组件处理
                        if (self.clipboard._objects[i]._objects){
                            $.each(self.clipboard._objects[i]._objects, function(j) { 
                                if(self.clipboard._objects[i]._objects[j].zIndex){
                                    var _zIndex=self.clipboard._objects[i]._objects[j].zIndex;
                                }else{
                                   var _zIndex=j+1; 
                                }
                                
                                obj._objects[j].set({
                                   dtypeIndex:self.createTypeIndex(self.clipboard._objects[i]._objects[j].dType),
                                   dType:self.clipboard._objects[i]._objects[j].dType,
                                   id:self.createID(),
                                   zIndex:_zIndex
                                });
                                
                                if(self.clipboard._objects[i]._objects[j].viewBoxWidth){
                                    obj._objects[j].set({viewBoxWidth:self.clipboard._objects[i]._objects[j].viewBoxWidth,viewBoxHeight:self.clipboard._objects[i]._objects[j].viewBoxHeight});
                                }

                                if(self.clipboard._objects[i]._objects[j].rotateXY){
                                    obj._objects[j].set({rotateXY:self.clipboard._objects[i]._objects[j].rotateXY});
                                }
                                if(self.clipboard._objects[i]._objects[j].dataFiled){
                                    obj._objects[j].set({dataFiled:self.clipboard._objects[i]._objects[j].dataFiled});
                                }
                                if(self.clipboard._objects[i]._objects[j].insertText){
                                    obj._objects[j].set({insertText:self.clipboard._objects[i]._objects[j].insertText});
                                }
                                
                                //粘贴自定义属性
                                _parent.pasterComponentAttr(self.clipboard._objects[i]._objects[j],obj._objects[j]);
                                
                                if (self.clipboard._objects[i]._objects[j].hasOwnProperty("_objects")){
                                    $.each(self.clipboard._objects[i]._objects[j]._objects, function(k) {
                                    
                                        if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("dType")){
                                            obj._objects[j]._objects[k].set({dType:self.clipboard._objects[i]._objects[j]._objects[k].dType});
                                        }
                                        if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("bindItemCode")){
                                            obj._objects[j]._objects[k].set({bindItemCode:self.clipboard._objects[i]._objects[j]._objects[k].bindItemCode});
                                        }                                               
                                        if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("viewBoxWidth")){
                                            obj._objects[j]._objects[k].set({viewBoxWidth:self.clipboard._objects[i]._objects[j]._objects[k].viewBoxWidth,viewBoxHeight:self.clipboard._objects[i]._objects[j]._objects[k].viewBoxHeight});
                                        } 
                                        if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("rotateXY")){
                                            obj._objects[j]._objects[k].set({rotateXY:self.clipboard._objects[i]._objects[j]._objects[k].rotateXY});
                                        }
                                        if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("dataFiled")){
                                            obj._objects[j]._objects[k].set({dataFiled:self.clipboard._objects[i]._objects[j]._objects[k].dataFiled});
                                        }
                                        if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("insertText")){
                                            obj._objects[j]._objects[k].set({insertText:self.clipboard._objects[i]._objects[j]._objects[k].insertText});
                                        }
                                        
                                        //粘贴自定义属性
                                        _parent.pasterComponentAttr(self.clipboard._objects[i]._objects[j]._objects[k],obj._objects[j]._objects[k]);

                                        //20230419 多层子组件分组处理ID及dType
                                        if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("_objects")){
                              
                                            _parent.moreLayersGroup(self.clipboard._objects[i]._objects[j]._objects[k],obj._objects[j]._objects[k]);
                                            
                                        } 



                                    });        
                                }
                                
                                //2022-03-15
                                if (self.clipboard._objects[i].dType=="Product"){
                                 
                                    obj._objects[j].set({dataFiled:self.clipboard._objects[i]._objects[j].dataFiled});
                                    
                                    if (self.clipboard._objects[i]._objects[j].hasOwnProperty("_objects")){
                                        $.each(self.clipboard._objects[i]._objects[j]._objects, function(k) { 
                                            
                                            if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("dType")){
                                                obj._objects[j]._objects[k].set({dType:self.clipboard._objects[i]._objects[j]._objects[k].dType});
                                            }
                                            if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("bindItemCode")){
                                                obj._objects[j]._objects[k].set({bindItemCode:self.clipboard._objects[i]._objects[j]._objects[k].bindItemCode});
                                            }                                               
                                            if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("viewBoxWidth")){
                                                obj._objects[j]._objects[k].set({viewBoxWidth:self.clipboard._objects[i]._objects[j]._objects[k].viewBoxWidth,viewBoxHeight:self.clipboard._objects[i]._objects[j]._objects[k].viewBoxHeight});
                                            }
                                            if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("rotateXY")){
                                                obj._objects[j]._objects[k].set({rotateXY:self.clipboard._objects[i]._objects[j]._objects[k].rotateXY});
                                            } 
                                            if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("dataFiled")){
                                                obj._objects[j]._objects[k].set({dataFiled:self.clipboard._objects[i]._objects[j]._objects[k].dataFiled});
                                            } 
                                            if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("insertText")){
                                                obj._objects[j]._objects[k].set({insertText:self.clipboard._objects[i]._objects[j]._objects[k].insertText});
                                            } 

                                            //粘贴自定义属性
                                            _parent.pasterComponentAttr(self.clipboard._objects[i]._objects[j]._objects[k],obj._objects[j]._objects[k]);

                                            //20230419 多层子组件分组处理ID及dType
                                            if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("_objects")){
                                  
                                                _parent.moreLayersGroup(self.clipboard._objects[i]._objects[j]._objects[k],obj._objects[j]._objects[k]);
                                                
                                            } 


                                        });
                                    }
                                    
                                    if (self.clipboard._objects[i]._objects[j].dType=="productNormalText" || self.clipboard._objects[i]._objects[j].dType=="productLineationText"){
                                    }
                                    if (self.clipboard._objects[i]._objects[j].hasOwnProperty("dataFiled")){
                                  
                                        obj._objects[j].set({
                                            dataFiled:self.clipboard._objects[i]._objects[j].dataFiled
                                        });
                                    }
                                    
                                    if (self.clipboard._objects[i]._objects[j].hasOwnProperty("viewBoxWidth")){
                                        obj._objects[j].set({
                                            viewBoxWidth:self.clipboard._objects[i]._objects[j].viewBoxWidth,
                                            viewBoxHeight:self.clipboard._objects[i]._objects[j].viewBoxHeight
                                        });
                                    }

                                    if (self.clipboard._objects[i]._objects[j].hasOwnProperty("rotateXY")){
                                        obj._objects[j].set({
                                            rotateXY:self.clipboard._objects[i]._objects[j].rotateXY,
                                        });
                                    }
                                    
                                    if (self.clipboard._objects[i]._objects[j].hasOwnProperty("dataFiled")){
                                        obj._objects[j].set({
                                            dataFiled:self.clipboard._objects[i]._objects[j].dataFiled,
                                        });
                                    }
                                    
                                    if (self.clipboard._objects[i]._objects[j].hasOwnProperty("insertText")){
                                        obj._objects[j].set({
                                            insertText:self.clipboard._objects[i]._objects[j].insertText,
                                        });
                                    }
                                    
                                    //粘贴自定义属性
                                    _parent.pasterComponentAttr(self.clipboard._objects[i]._objects[j],obj._objects[j]);
                                    
                                    
                                }




                            });
                        }                   
                        canvas.add(obj);
                        self.layer.canvasOperation.createComponent(obj);

                        //处理 pasterStep流程
                        if (pasterStep=="A2"){
                            //var viewObject=mmDetailsData[self.cunterPage][self.clipboard._objects[i].dSort];
                            
                            //取消跨页复制粘贴自动更新商品组件数据
                            /*var _dSort=self.clipboard._objects[i].dSort;
                            var _dSortArr=_dSort.split("-");
                            var viewObject=mmDetailsData[_dSortArr[0]][_dSortArr[1]];
                            self.canvasDraw().updateProduct(obj,viewObject);*/
                            
                            pasterStep="";
                        }else if (pasterStep=="A3"){
                            _parent.clearComponentProduct(obj);
                            pasterStep="";
                        }

                        i++;
                    });
                    // this should solve the unselectability
                    clonedObj.setCoords();


                } else {

                    //禁止复制商品组件到group内
                    if (self.undoGroupSource!=null){
                        //self.clipboard.dType=="Product"
                        if (disableCopyToCreateType.indexOf(self.clipboard.dType)>-1){
                            self.pageEvent.errMsg("The " + self.clipboard.dType +" prohibits the insertion of Group");
                            return;
                        }

                    }

                    clonedObj.set({
                        dtypeIndex:self.createTypeIndex(self.clipboard.dType),
                        zIndex:self.clipboard.zIndex,
                        id:self.createID(),
                        dType:self.clipboard.dType
                    })
                    if (self.clipboard.elementCode){
                        clonedObj.set({elementCode:self.clipboard.elementCode});
                    }
                    if (self.clipboard.viewBoxWidth){
                        clonedObj.set({viewBoxWidth:self.clipboard.viewBoxWidth,viewBoxHeight:self.clipboard.viewBoxHeight});
                    }
                    if (self.clipboard.rotateXY){
                        clonedObj.set({rotateXY:self.clipboard.rotateXY});
                    }
                    if (self.clipboard.dataFiled){
                        clonedObj.set({dataFiled:self.clipboard.dataFiled});
                    }
                    if (self.clipboard.insertText){
                        clonedObj.set({insertText:self.clipboard.insertText});
                    }
                    
                    //粘贴自定义属性
                    _parent.pasterComponentAttr(self.clipboard,clonedObj);

                    if (self.clipboard.dType=="Product"){

                            /** 跨页复制粘贴商品组件处理流程 
                              * 1､原组件已邦定dSort,在同一页粘贴时，可以完全数据粘贴。 流程 A1
                              * 2､原组件已邦定dSort，跨页粘贴时，在新页面需要识别是否有该 page + dSort。
                              *   a、第2点如果没有达到 page + dSort条件，达到以新商品信息替换原组件。 流程 A2
                              *   b、达不到以组件原 Label 类型名称替换原组件。 流程 A3
                              * 3､原组件未邦定dSort,可以完全数据粘贴。 流程 A1
                            */

                            
                            if (self.clipboard.dSort==null || self.clipboard.dSort=="" || 1==1){
                                //流程 A1 , 1==1 取消了跨页粘贴自动根据当前页 dSort的商品数据，改为复制是什么粘贴就是什么
                                pasterStep="A1";

                            }else{

                                if (self.clipboard.page==self.cunterPage){
                                    //流程 A1
                                    pasterStep="A1";
                                }else if (self.clipboard.page!=self.cunterPage){

                                    /*if (mmDetailsData[self.cunterPage]!=null){
                                        //该MM商品清单有该页码数据
                                        if (mmDetailsData[self.cunterPage][self.clipboard.dSort]!=null){
                                            //有dSort对应数据 流程 A2
                                            pasterStep="A2";

                                        }else{
                                            //该MM商品清单有该页码数据,但没有dSort对应数据 流程 A3
                                            pasterStep="A3";
                                        }

                                    }else{
                                        //该MM商品清单没有该页码数据 流程 A3
                                        pasterStep="A3";

                                    }*/

                                    var _dSort=self.clipboard.dSort;
                                    var _dSortArr=_dSort.split("-");
                                    if (mmDetailsData[self.cunterPage]!=null){
                                        //该MM商品清单有该页码数据
                                        if (mmDetailsData[_dSortArr[0]][_dSortArr[1]]!=null){
                                            //有dSort对应数据 流程 A2
                                            pasterStep="A2";

                                        }else{
                                            //该MM商品清单有该页码数据,但没有dSort对应数据 流程 A3
                                            pasterStep="A3";
                                        }

                                    }else{
                                        //该MM商品清单没有该页码数据 流程 A3
                                        pasterStep="A3";

                                    }



                                }

                            }



                        clonedObj.set({
                           elementCode:self.clipboard.elementCode,
                           itemCode:self.clipboard.itemCode,
                           dSort:self.clipboard.dSort,
                        });
                    }
                    if (self.clipboard.type=="polygon"){
                        
                        //如果是线条
                        self.cunterObj=clonedObj;
                        self.componentDraw().drawLine();
                        
                    }
                    
                    
                    //组件子组件处理
                    if (self.clipboard._objects && self.clipboard._objects.length>=1){

                        $.each(self.clipboard._objects, function(j) { 
                            // console.log("print",self.clipboard._objects[j]);
                            if(self.clipboard._objects[j].zIndex){
                                var _zIndex=self.clipboard._objects[j].zIndex;
                            }else{
                               var _zIndex=j+1; 
                            }
                            
                            clonedObj._objects[j].set({
                               dtypeIndex:self.createTypeIndex(self.clipboard._objects[j].dType),
                               dType:self.clipboard._objects[j].dType,
                               id:self.createID(),
                               zIndex:_zIndex
                            });

                            if(self.clipboard._objects[j].viewBoxWidth){
                                clonedObj._objects[j].set({viewBoxWidth:self.clipboard._objects[j].viewBoxWidth,viewBoxHeight:self.clipboard._objects[j].viewBoxHeight});
                            }

                            if(self.clipboard._objects[j].rotateXY){
                                clonedObj._objects[j].set({rotateXY:self.clipboard._objects[j].rotateXY});
                            }
                            
                            if(self.clipboard._objects[j].dataFiled){
                                clonedObj._objects[j].set({dataFiled:self.clipboard._objects[j].dataFiled});
                            }
                            
                            if(self.clipboard._objects[j].insertText){
                                clonedObj._objects[j].set({insertText:self.clipboard._objects[j].insertText});
                            }
                            
                            //粘贴自定义属性
                            _parent.pasterComponentAttr(self.clipboard._objects[j],clonedObj._objects[j]);
                            
                            if (self.clipboard.dType=="Product"){
                                clonedObj._objects[j].set({dataFiled:self.clipboard._objects[j].dataFiled});
                                
                                if (self.clipboard._objects[j].hasOwnProperty("_objects")){
                                    $.each(self.clipboard._objects[j]._objects, function(k) { 
                                        
                                        if (self.clipboard._objects[j]._objects[k].hasOwnProperty("dType")){
                                            clonedObj._objects[j]._objects[k].set({dType:self.clipboard._objects[j]._objects[k].dType});
                                        }
                                        if (self.clipboard._objects[j]._objects[k].hasOwnProperty("bindItemCode")){
                                            clonedObj._objects[j]._objects[k].set({bindItemCode:self.clipboard._objects[j]._objects[k].bindItemCode});
                                        }                                               
                                        if (self.clipboard._objects[j]._objects[k].hasOwnProperty("viewBoxWidth")){
                                            clonedObj._objects[j]._objects[k].set({viewBoxWidth:self.clipboard._objects[j]._objects[k].viewBoxWidth,viewBoxHeight:self.clipboard._objects[j]._objects[k].viewBoxHeight});
                                        } 
                                        if (self.clipboard._objects[j]._objects[k].hasOwnProperty("rotateXY")){
                                            clonedObj._objects[j]._objects[k].set({rotateXY:self.clipboard._objects[j]._objects[k].rotateXY});
                                        } 
                                        if (self.clipboard._objects[j]._objects[k].hasOwnProperty("dataFiled")){
                                            clonedObj._objects[j]._objects[k].set({dataFiled:self.clipboard._objects[j]._objects[k].dataFiled});
                                        }                                         
                                        if (self.clipboard._objects[j]._objects[k].hasOwnProperty("insertText")){
                                            clonedObj._objects[j]._objects[k].set({insertText:self.clipboard._objects[j]._objects[k].insertText});
                                        }                                         
                                        
                                        //粘贴自定义属性
                                        _parent.pasterComponentAttr(self.clipboard._objects[j]._objects[k],clonedObj._objects[j]._objects[k]);
                                        
                                    });
                                }
                                
                                if (self.clipboard._objects[j].dType=="productNormalText" || self.clipboard._objects[j].dType=="productLineationText"){
                                
                                }
                                if (self.clipboard._objects[j].hasOwnProperty("dataFiled")){
                                    
                                    clonedObj._objects[j].set({
                                        dataFiled:self.clipboard._objects[j].dataFiled
                                    });
                                }
                                if (self.clipboard._objects[j].hasOwnProperty("viewBoxWidth")){
                                    
                                    clonedObj._objects[j].set({
                                        viewBoxWidth:self.clipboard._objects[j].viewBoxWidth,
                                        viewBoxHeight:self.clipboard._objects[j].viewBoxHeight
                                    });
                                }
                                if (self.clipboard._objects[j].hasOwnProperty("rotateXY")){
                                    
                                    clonedObj._objects[j].set({
                                        rotateXY:self.clipboard._objects[j].rotateXY,
                                    });
                                }
                                if (self.clipboard._objects[j].hasOwnProperty("insertText")){
                                    
                                    clonedObj._objects[j].set({
                                        insertText:self.clipboard._objects[j].insertText,
                                    });
                                }

                                //粘贴自定义属性
                                _parent.pasterComponentAttr(self.clipboard._objects[j],clonedObj._objects[j]);

                            }

                            //20230419 多层子组件分组处理ID及dType
                            if (self.clipboard._objects[j].hasOwnProperty("_objects")){
                  
                                _parent.moreLayersGroup(self.clipboard._objects[j],clonedObj._objects[j]);
                                // clonedObj._objects[j]=lowerLayer;
                            }

                        });
                    
                    }
                    canvas.add(clonedObj);

                    self.layer.canvasOperation.createComponent(clonedObj);
                    //处理 pasterStep流程
                    if (pasterStep=="A2"){

                        //var viewObject=mmDetailsData[self.cunterPage][self.clipboard._objects[i].dSort];
                        
                        //取消跨页复制粘贴自动更新商品组件数据
                        /*var _dSort=self.clipboard.dSort;
                        var _dSortArr=_dSort.split("-");
                        var viewObject=mmDetailsData[_dSortArr[0]][_dSortArr[1]];
                        self.canvasDraw().updateProduct(clonedObj,viewObject);*/
                        
                        pasterStep="";
                    }else if (pasterStep=="A3"){
                        _parent.clearComponentProduct(clonedObj);
                        pasterStep="";
                    }


                    
                }
                self.clipboard.top += 100;
                self.clipboard.left += 100;
                canvas.setActiveObject(clonedObj);
                canvas.requestRenderAll();
                
                //事务描述
                var msg="Copy element";
                self.canvasSave().canvasHistoryRecordCall(msg);
                
            });
        
        }

        //复制自定义属性
        this.copyComponentAttr=function(_selectedObject,_clipboard,_type=null){
            
            var _attr=["shadowAngle","shadowBase64","shadowColor","shadowColorCmyk","shadowOffset","dataFiled","bindItemCode","viewBoxWidth","viewBoxWidth","dType","nanTop"];
            for (let key in _selectedObject){
                
                if (_attr.indexOf(key)>-1){
                    _clipboard[key]=_selectedObject[key];
                }
                
                if (_type!=null){
                    _type=_type + 1;
                    if (_type>5){_type=null;}
                    if (_selectedObject.hasOwnProperty("_objects")){
                        for (var j=0;j<_selectedObject._objects.length;j++){
                            _parent.copyComponentAttr(_selectedObject._objects[j],_clipboard._objects[j],_type);
                        }
                    }
                }

            }
            
        }

        this.copyComponentAttr_bak=function(_selectedObject,_clipboard){
            
            var _attr=["shadowAngle","shadowBase64","shadowColor","shadowColorCmyk","shadowOffset","dataFiled","bindItemCode","viewBoxWidth","viewBoxWidth","dType","nanTop"];
            for (let key in _selectedObject){
                
                if (_attr.indexOf(key)>-1){
                    _clipboard[key]=_selectedObject[key];
                }
                
            }
            
        }

        
        //粘贴自定义属性
        this.pasterComponentAttr=function(_clipboard,_obj){
            
            var _attr=["shadowAngle","shadowBase64","shadowColor","shadowColorCmyk","shadowOffset","dataFiled","bindItemCode","viewBoxWidth","viewBoxWidth","dType","nanTop"];
            for (let key in _clipboard){
                
                if (_attr.indexOf(key)>-1){
                    _obj[key]=_clipboard[key];
                }
                
            }

        }

        //处理多层分组copy的自定义属性
        this.moreLayersGroup=function(groupObj,newLayer){

            for (var l=0;l<groupObj._objects.length;l++){

                if (groupObj._objects[l].type!="group"){
                    if (groupObj._objects[l].hasOwnProperty("dType") && newLayer._objects[l].hasOwnProperty("dType")==false){
                        newLayer._objects[l].dType=groupObj._objects[l].dType;
                    }
                    if (newLayer._objects[l].hasOwnProperty("id")==false){
                        newLayer._objects[l].id=self.createID();
                    }

                    if (groupObj._objects[l].hasOwnProperty("viewBoxWidth") && newLayer._objects[l].hasOwnProperty("viewBoxWidth")==false){
                        newLayer._objects[l].viewBoxWidth=groupObj._objects[l].viewBoxWidth;
                    }

                    if (groupObj._objects[l].hasOwnProperty("rotateXY") && newLayer._objects[l].hasOwnProperty("rotateXY")==false){
                        newLayer._objects[l].rotateXY=groupObj._objects[l].rotateXY;
                    } 
                    if (groupObj._objects[l].hasOwnProperty("dataFiled") && newLayer._objects[l].hasOwnProperty("dataFiled")==false){
                        newLayer._objects[l].dataFiled=groupObj._objects[l].dataFiled;
                    } 
                    if (groupObj._objects[l].hasOwnProperty("insertText") && newLayer._objects[l].hasOwnProperty("insertText")==false){
                        newLayer._objects[l].insertText=groupObj._objects[l].insertText;
                    } 

                    //粘贴自定义属性
                    _parent.pasterComponentAttr(groupObj._objects[l],newLayer._objects[l]);

                }else{
                    if (groupObj._objects[l].hasOwnProperty("dataFiled") && newLayer._objects[l].hasOwnProperty("dataFiled")==false){
                        newLayer._objects[l].dataFiled=groupObj._objects[l].dataFiled;
                    } 
                    if (groupObj._objects[l].hasOwnProperty("insertText") && newLayer._objects[l].hasOwnProperty("insertText")==false){
                        newLayer._objects[l].insertText=groupObj._objects[l].insertText;
                    } 
                    //粘贴自定义属性
                    _parent.pasterComponentAttr(groupObj._objects[l],newLayer._objects[l]);
                    
                    _parent.moreLayersGroup(groupObj._objects[l],newLayer._objects[l]);
                }

            }

        }

        //2022-03-14 不能删，原跨页粘贴原组件一比一到新页 可能以后会有作用
         this.pastePageObj_copy=function(){
            if (self.clipboard==undefined){
                return ;
            }
            self.clipboard.clone(function(clonedObj) {
                canvas.discardActiveObject();
                clonedObj.set({
                    left: clonedObj.left + 100,
                    top: clonedObj.top + 100,
                    evented: true,//是否清空剪贴板?
                });
                if (clonedObj.type === 'activeSelection') {
                    // active selection needs a reference to the canvas.
                    clonedObj.canvas = canvas;
                    var i=0;
                    clonedObj.forEachObject(function(obj) {
                        if (self.clipboard._objects[i].dType!="Product"){
                            obj.set({
                                dtypeIndex:self.createTypeIndex(self.clipboard._objects[i].dType),
                                id:self.createID(),
                                dType:self.clipboard._objects[i].dType,
                                zIndex:self.clipboard._objects[i].zIndex
                            });
                            if (self.clipboard._objects[i].elementCode){
                                obj.set({elementCode:self.clipboard._objects[i].elementCode});
                            }
                        }else{
                            obj.set({
                                dtypeIndex:self.createTypeIndex(self.clipboard._objects[i].dType),
                                id:self.createID(),
                                dType:self.clipboard._objects[i].dType,
                                elementCode:self.clipboard._objects[i].elementCode,
                                itemCode:self.clipboard._objects[i].itemCode,
                                dSort:self.clipboard._objects[i].dSort,
                                zIndex:self.clipboard._objects[i].zIndex
                            });
                        }
                        
                        //组件子组件处理
                        if (self.clipboard._objects[i]._objects){
                            $.each(self.clipboard._objects[i]._objects, function(j) { 
                                if(self.clipboard._objects[i]._objects[j].zIndex){
                                    var _zIndex=self.clipboard._objects[i]._objects[j].zIndex;
                                }else{
                                   var _zIndex=j+1; 
                                }
                                
                                obj._objects[j].set({
                                   dtypeIndex:self.createTypeIndex(self.clipboard._objects[i]._objects[j].dType),
                                   dType:self.clipboard._objects[i]._objects[j].dType,
                                   id:self.createID(),
                                   zIndex:_zIndex
                                });
                                
                                
                                if (self.clipboard._objects[i]._objects[j].hasOwnProperty("_objects")){
                                    $.each(self.clipboard._objects[i]._objects[j]._objects, function(k) {
                                    
                                        if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("dType")){
                                            obj._objects[j]._objects[k].set({dType:self.clipboard._objects[i]._objects[j]._objects[k].dType});
                                        }
                                        if (self.clipboard._objects[i]._objects[j]._objects[k].hasOwnProperty("bindItemCode")){
                                            obj._objects[j]._objects[k].set({bindItemCode:self.clipboard._objects[i]._objects[j]._objects[k].bindItemCode});
                                        }                                               
                                            
                                    });        
                                }
                                
                                
                                
                            });
                        }                   
                        canvas.add(obj);
                        i++;
                    });
                    // this should solve the unselectability
                    clonedObj.setCoords();
                } else {
                    clonedObj.set({
                        dtypeIndex:self.createTypeIndex(self.clipboard.dType),
                        zIndex:self.clipboard.zIndex,
                        id:self.createID(),
                        dType:self.clipboard.dType
                    })
                    if (self.clipboard.elementCode){
                        clonedObj.set({elementCode:self.clipboard.elementCode});
                    }
                    if (self.clipboard.dType=="Product"){
                        clonedObj.set({
                           elementCode:self.clipboard.elementCode,
                           itemCode:self.clipboard.itemCode,
                           dSort:self.clipboard.dSort,
                        });
                    }
                    if (self.clipboard.type=="polygon"){
                        
                        //如果是线条
                        self.cunterObj=clonedObj;
                        self.componentDraw().drawLine();
                        
                    }
                    
                    
                    //组件子组件处理
                    if (self.clipboard._objects && self.clipboard._objects.length>=1){
                        $.each(self.clipboard._objects, function(j) { 
                            if(self.clipboard._objects[j].zIndex){
                                var _zIndex=self.clipboard._objects[j].zIndex;
                            }else{
                               var _zIndex=j+1; 
                            }
                            
                            clonedObj._objects[j].set({
                               dtypeIndex:self.createTypeIndex(self.clipboard._objects[j].dType),
                               dType:self.clipboard._objects[j].dType,
                               id:self.createID(),
                               zIndex:_zIndex
                            });
                            
                            if (self.clipboard.dType=="Product"){
                                clonedObj._objects[j].set({dataFiled:self.clipboard._objects[j].dataFiled});
                                
                                if (self.clipboard._objects[j].hasOwnProperty("_objects")){
                                    $.each(self.clipboard._objects[j]._objects, function(k) { 
                                        
                                        if (self.clipboard._objects[j]._objects[k].hasOwnProperty("dType")){
                                            clonedObj._objects[j]._objects[k].set({dType:self.clipboard._objects[j]._objects[k].dType});
                                        }
                                        if (self.clipboard._objects[j]._objects[k].hasOwnProperty("bindItemCode")){
                                            clonedObj._objects[j]._objects[k].set({bindItemCode:self.clipboard._objects[j]._objects[k].bindItemCode});
                                        }                                               
                                        
                                    });
                                }
                                
                                if (self.clipboard._objects[j].dType=="productNormalText" || self.clipboard._objects[j].dType=="productLineationText"){
                                }
                                if (self.clipboard._objects[j].hasOwnProperty("dataFiled")){
                                    
                                    clonedObj._objects[j].set({
                                        dataFiled:self.clipboard._objects[j].dataFiled
                                    });
                                }
                                
                                
                            }
                        });
                    
                    }
                    canvas.add(clonedObj);
                }
                self.clipboard.top += 100;
                self.clipboard.left += 100;
                canvas.setActiveObject(clonedObj);
                canvas.requestRenderAll();
                
                //事务描述
                var msg="Copy element";
                self.canvasSave().canvasHistoryRecordCall(msg);
                
            });
        
        }
        
        //清空商品组件商品信息，还原组件初始数据
        this.clearComponentProduct=function(theObj){
            //console.log(theObj);
            for (var i=0;i<theObj._objects.length;i++){

                var objectSort=i;

                switch (theObj.item(i).dataFiled)
                {
                    case "goodsImage":
                    case "brand":
                    case "gift":
                    case "icon1":
                    case "icon2":
                    case "icon3":

                        var data={};
                        data.left=theObj._objects[i]._objects[1].left;
                        data.top=theObj._objects[i]._objects[1].top
                        data.width=theObj._objects[i]._objects[1].width;
                        data.height=theObj._objects[i]._objects[1].height;
                        data.type="rect";
                        data.fill="#ffffff",
                        data.opacity=1;
                        data.stroke='#999999';
                        data.strokeWidth=1;
                        data.scaleX=theObj._objects[i]._objects[1].scaleX;
                        data.scaleY=theObj._objects[i]._objects[1].scaleY;
                        data.visible=true;
                        
                        var rect = new fabric.Rect(data);


                        theObj._objects[i]._objects[0]=rect;
                        theObj._objects[i]._objects[1].visible=true;
                        theObj._objects[i]._objects[2].visible=true;
                        if (theObj._objects[i]._objects[3]){
                            theObj._objects[i]._objects[3].visible=true;
                        }
         
                        theObj.addWithUpdate();
                        theObj.setCoords();

                    break;
                 }
       
                switch (theObj._objects[i].dType)
                {
           
                    case "productNormalText":
                    case "productLineationText":
                        theObj.item(i).set({text:(""+theObj.item(i).dataFiled)});
                        theObj.addWithUpdate();
                        theObj.setCoords();

                    break;
                    
                }
                
            }

        }

        //组件排版对齐
        this.composingElement=function(mode){
            //计算选中组件最左、最上、最右、最下值
            var minLeft_Val=9000;
            var maxRight_Val=-9000;
            var minTop_Val=9000;
            var maxBottom_Val=-9000;
            
            var minLeft_Obj=null;
            var maxRight_Obj=null;
            var minTop_Obj=null;
            var maxBottom_Obj=null;
            
            if (self.selectedObject.length>1){
                var composingObject=self.selectedObject;
            }else{
                if(self.selectedObject[0].hasOwnProperty("_objects")){
                    var composingObject=self.selectedObject[0]._objects;
                }else{
                    var composingObject=self.selectedObject[0];
                }
            }

            for (var i=0;i<composingObject.length;i++){

                var groupOffsetLeft=0,groupOffsetTop=0;
                
                /*if (!self.isPixSelect){
                    if (composingObject[i].hasOwnProperty("group")){
                        groupOffsetLeft=composingObject[i].group.left + composingObject[i].group.width * composingObject[i].group.scaleX/2;
                        groupOffsetTop=composingObject[i].group.top + composingObject[i].group.height * composingObject[i].group.scaleY/2;

                    }
                }*/
                
                var strokeWidth=0;
                if (composingObject[i].hasOwnProperty("strokeWidth")){
                    strokeWidth=composingObject[i].strokeWidth * 1;
                }
                
                var absoluterCenterPoint=composingObject[i].getAbsoluteCenterPoint();
                
                //组件中心点绝对坐标
                composingObject[i].absoluterCenterX=absoluterCenterPoint.x;
                composingObject[i].absoluterCenterY=absoluterCenterPoint.y;
                
                //组件上下左右绝对坐标
                composingObject[i].absoluterLeft=absoluterCenterPoint.x - (composingObject[i].width + strokeWidth * 1) *  composingObject[i].scaleX/2;
                composingObject[i].absoluterTop=absoluterCenterPoint.y - (composingObject[i].height + strokeWidth * 1) *  composingObject[i].scaleY/2;
                composingObject[i].absoluterRight=absoluterCenterPoint.x + (composingObject[i].width + strokeWidth * 1) *  composingObject[i].scaleY/2;
                composingObject[i].absoluterBottom=absoluterCenterPoint.y + (composingObject[i].height + strokeWidth * 1) *  composingObject[i].scaleY/2;
                
                

                if (composingObject[i].absoluterLeft + groupOffsetLeft<minLeft_Val){
                    minLeft_Val=composingObject[i].absoluterLeft + groupOffsetLeft;
                    minLeft_Obj=composingObject[i].id;
                }
                if (composingObject[i].absoluterLeft + groupOffsetLeft + (composingObject[i].width + strokeWidth * 1) * composingObject[i].scaleX >=maxRight_Val){

                    maxRight_Val=composingObject[i].absoluterLeft + groupOffsetLeft + (composingObject[i].width + strokeWidth * 1) * composingObject[i].scaleX;
                    maxRight_Obj=composingObject[i].id;
                } 
                
                if (composingObject[i].absoluterTop + groupOffsetTop<minTop_Val){
                    minTop_Val=composingObject[i].absoluterTop + groupOffsetTop;
                    minTop_Obj=composingObject[i].id;
                }        
                if (composingObject[i].absoluterTop + groupOffsetTop + (composingObject[i].height + strokeWidth * 1) * composingObject[i].scaleY >=maxBottom_Val){
                    maxBottom_Val=composingObject[i].absoluterTop + groupOffsetTop + (composingObject[i].height + strokeWidth * 1) * composingObject[i].scaleY;
                    maxBottom_Obj=composingObject[i].id;
                }            
            }
            

            if (mode=="align-v-up"){
                //向上对齐

                for (var i=0;i<composingObject.length;i++){
                    if (composingObject[i].hasOwnProperty("group")){
                        
                        if (composingObject[i].group.type!="activeSelection"){
                            //分组内对象
                            if (minTop_Val<composingObject[i].absoluterTop){
                                composingObject[i].top=composingObject[i].top + (minTop_Val - composingObject[i].absoluterTop);
                                self.canvasDraw().groupObjectsAddWithUpdate(composingObject[i].group);
                            }
                        }else{
                            //框选中的对象
                            if (minTop_Val<composingObject[i].absoluterTop){
                                composingObject[i].top=composingObject[i].top + (minTop_Val - composingObject[i].absoluterTop);
                                if (composingObject[i].hasOwnProperty("group")){
                                    self.canvasDraw().groupObjectsAddWithUpdate(composingObject[i]);
                                }
                                
                            }
                        }
                        
                    }else{
                        composingObject[i].top=minTop_Val;
                    }
                    
                }
                
                canvas.renderAll();
            }else if (mode=="align-v-bottom"){
                //向下对齐
                for (var i=0;i<composingObject.length;i++){
                    if (composingObject[i].hasOwnProperty("group")){
                        
                        if (composingObject[i].group.type!="activeSelection"){
                            //分组内对象
                            if (maxBottom_Val>composingObject[i].absoluterBottom){
                                composingObject[i].top=composingObject[i].top + (maxBottom_Val - composingObject[i].absoluterBottom);
                                self.canvasDraw().groupObjectsAddWithUpdate(composingObject[i].group);
                            }
                        }else{
                            //框选中的对象
                            if (maxBottom_Val>composingObject[i].absoluterTop){
                                composingObject[i].top=composingObject[i].top + (maxBottom_Val - composingObject[i].absoluterBottom);
                                composingObject[i].group.addWithUpdate();
                                composingObject[i].group.setCoords();
                                if (composingObject[i].group.hasOwnProperty("group")){
                                    self.canvasDraw().groupObjectsAddWithUpdate(composingObject[i].group);
                                }
                            }
                        }
                        
                    }else{
                      
                        if (maxBottom_Val>composingObject[i].absoluterBottom){
                            composingObject[i].top=composingObject[i].top + (maxBottom_Val - composingObject[i].absoluterBottom);
                        }
                    }
                    
                }

            }else if (mode=="align-v-centered"){
                //垂直居中

                var v_centered_y=minTop_Val + (maxBottom_Val - minTop_Val)/2;
                for (var i=0;i<composingObject.length;i++){
                    if (composingObject[i].hasOwnProperty("group")){
                        
                        if (composingObject[i].group.type!="activeSelection"){
                            //分组内对象
                            if (v_centered_y>composingObject[i].absoluterCenterY){
                                composingObject[i].top=composingObject[i].top + (v_centered_y - composingObject[i].absoluterCenterY);
                            }else{
                                composingObject[i].top=composingObject[i].top - (composingObject[i].absoluterCenterY - v_centered_y);
                            }
                            self.canvasDraw().groupObjectsAddWithUpdate(composingObject[i]);
                        }else{
                            //框选中的对象
                            if (v_centered_y>composingObject[i].absoluterCenterY){
                                composingObject[i].top=composingObject[i].top + (v_centered_y - composingObject[i].absoluterCenterY);
                                self.canvasDraw().groupObjectsAddWithUpdate(composingObject[i]);
                            }else{
                                composingObject[i].top=composingObject[i].top - (composingObject[i].absoluterCenterY - v_centered_y);
                                self.canvasDraw().groupObjectsAddWithUpdate(composingObject[i]);
                            }
                        }
                        
                    }else{
                      
                        if (v_centered_y>composingObject[i].absoluterCenterY){
                            composingObject[i].top=composingObject[i].top + (v_centered_y - composingObject[i].absoluterCenterY);
                        }else{
                            composingObject[i].top=composingObject[i].top - (composingObject[i].absoluterCenterY - v_centered_y);
                        }
                    }
                    
                }
        
            }else if (mode=="align-h-left"){
                //向左对齐
                for (var i=0;i<composingObject.length;i++){
                    if (composingObject[i].hasOwnProperty("group")){
                        
                        if (composingObject[i].group.type!="activeSelection"){
                            //分组内对象
                            if (minLeft_Val<composingObject[i].absoluterLeft){
                                composingObject[i].left=composingObject[i].left + (minLeft_Val - composingObject[i].absoluterLeft);
                                self.canvasDraw().groupObjectsAddWithUpdate(composingObject[i]);
                            }
                        }else{
                            //框选中的对象
                            if (minLeft_Val<composingObject[i].absoluterLeft){
                                composingObject[i].left=composingObject[i].left + (minLeft_Val - composingObject[i].absoluterLeft);
                                if (composingObject[i].hasOwnProperty("group")){
                                    self.canvasDraw().groupObjectsAddWithUpdate(composingObject[i]);
                                }
                                
                            }
                        }
                        
                    }else{
                        composingObject[i].left=minLeft_Val;
                    }
                    
                }
                
                canvas.renderAll();
       
            }else if (mode=="align-h-right"){
                //向右对齐
                for (var i=0;i<composingObject.length;i++){
                    
                    var absoluterRight=composingObject[i].absoluterLeft + (composingObject[i].width + composingObject[i].strokeWidth*1)*composingObject[i].scaleX;
                    if (composingObject[i].hasOwnProperty("group")){
                        
                        if (composingObject[i].group.type!="activeSelection"){
                            //分组内对象
                            if (maxRight_Val>composingObject[i].absoluterRight){
                                composingObject[i].left=composingObject[i].left + (maxRight_Val - absoluterRight);
                                self.canvasDraw().groupObjectsAddWithUpdate(composingObject[i]);
                            }
                        }else{
                            //框选中的对象
                            if (maxRight_Val>absoluterRight){
                                composingObject[i].left=composingObject[i].left + (maxRight_Val - absoluterRight);
                            }
                        }
                        
                    }else{
                      
                        if (maxRight_Val>absoluterRight){
                            composingObject[i].left=composingObject[i].left + (maxRight_Val - absoluterRight);
                        }
                    }
                    
                }

            }else if (mode=="align-h-center"){
                //水平居中
                var h_centered_x=minLeft_Val + (maxRight_Val - minLeft_Val)/2;
                for (var i=0;i<composingObject.length;i++){
                    if (composingObject[i].hasOwnProperty("group")){
                        
                        if (composingObject[i].group.type!="activeSelection"){
                            //分组内对象
                            if (h_centered_x>composingObject[i].absoluterCenterX){
                                composingObject[i].left=composingObject[i].left + (h_centered_x - composingObject[i].absoluterCenterX);
                            }else{
                                composingObject[i].left=composingObject[i].left - (composingObject[i].absoluterCenterX - h_centered_x);
                            }
                            self.canvasDraw().groupObjectsAddWithUpdate(composingObject[i]);
                        }else{
                            //框选中的对象
                            if (h_centered_x>composingObject[i].absoluterCenterX){
                                composingObject[i].left=composingObject[i].left + (h_centered_x - composingObject[i].absoluterCenterX);
                                self.canvasDraw().groupObjectsAddWithUpdate(composingObject[i]);
                            }else{
                                composingObject[i].left=composingObject[i].left - (composingObject[i].absoluterCenterX - h_centered_x);
                                self.canvasDraw().groupObjectsAddWithUpdate(composingObject[i]);
                            }
                        }
                        
                    }else{
                      
                        if (h_centered_x>composingObject[i].absoluterCenterX){
                            composingObject[i].left=composingObject[i].left + (h_centered_x - composingObject[i].absoluterCenterX);
                        }else{
                            composingObject[i].left=composingObject[i].left - (composingObject[i].absoluterCenterX - h_centered_x);
                        }
                    }
                    
                }
            }
            
            canvas.renderAll(); 

            self.drawing=true;
            //事务描述
            var msg="Edit element";
            self.canvasSave().canvasHistoryRecordCall(msg);
            
        }

        this.composingElement_bak_20230509=function(mode){
            //计算选中组件最左、最上、最右、最下值
            var minLeft_Val=9000;
            var maxRight_Val=-9000;
            var minTop_Val=9000;
            var maxBottom_Val=-9000;
            
            var minLeft_Obj=null;
            var maxRight_Obj=null;
            var minTop_Obj=null;
            var maxBottom_Obj=null;
            
            if (self.selectedObject.length>1){
                var composingObject=self.selectedObject;
            }else{
                if(self.selectedObject[0].hasOwnProperty("_objects")){
                    var composingObject=self.selectedObject[0]._objects;
                }else{
                    var composingObject=self.selectedObject[0];
                }
            }

            for (var i=0;i<composingObject.length;i++){

                var groupOffsetLeft=0,groupOffsetTop=0;
                if (!self.isPixSelect){
                    if (composingObject[i].hasOwnProperty("group")){
                        groupOffsetLeft=composingObject[i].group.left + composingObject[i].group.width * composingObject[i].group.scaleX/2;
                        groupOffsetTop=composingObject[i].group.top + composingObject[i].group.height * composingObject[i].group.scaleY/2;

                    }
                }

                var strokeWidth=0;
                if (composingObject[i].hasOwnProperty("strokeWidth")){
                    strokeWidth=composingObject[i].strokeWidth * 1;
                }

                if (composingObject[i].left + groupOffsetLeft<minLeft_Val){
                    minLeft_Val=composingObject[i].left + groupOffsetLeft;
                    minLeft_Obj=composingObject[i].id;
                }
                if (composingObject[i].left + groupOffsetLeft + (composingObject[i].width + strokeWidth * 1) * composingObject[i].scaleX >=maxRight_Val){

                    maxRight_Val=composingObject[i].left + groupOffsetLeft + (composingObject[i].width + strokeWidth * 1) * composingObject[i].scaleX;
                    maxRight_Obj=composingObject[i].id;
                } 
                
                if (composingObject[i].top + groupOffsetTop<minTop_Val){
                    minTop_Val=composingObject[i].top + groupOffsetTop;
                    minTop_Obj=composingObject[i].id;
                }        
                if (composingObject[i].top + groupOffsetTop + (composingObject[i].height + strokeWidth * 1) * composingObject[i].scaleY >=maxBottom_Val){
                    maxBottom_Val=composingObject[i].top + groupOffsetTop + (composingObject[i].height + strokeWidth * 1) * composingObject[i].scaleY;
                    maxBottom_Obj=composingObject[i].id;
                }            
            }
            

            if (mode=="align-v-up"){
                //向上对齐
                if (self.isPixSelect){
                    for (var i=0;i<composingObject.length;i++){
                        composingObject[i].top=minTop_Val;
                    }
                }else{

                    for (var i=0;i<composingObject.length;i++){
                        if (minTop_Obj==composingObject[i].id){
                            continue;
                        }
                        var _groupOffsetTop=0;
                        if (composingObject[i].hasOwnProperty("group")){
                            var _groupOffsetTop=composingObject[i].group.top + composingObject[i].group.height * composingObject[i].group.scaleY/2;
                            var _theObjTop=minTop_Val - _groupOffsetTop;
                            composingObject[i].top=_theObjTop;
                            composingObject[i].group.addWithUpdate();
                            composingObject[i].group.setCoords();
                        }else{
                            composingObject[i].top=minTop_Val;
                            composingObject[i].setCoords();
                        }
                        
                    }

                }
                canvas.renderAll();
            }else if (mode=="align-v-bottom"){
                //向下对齐
                if (self.isPixSelect){
                    for (var i=0;i<composingObject.length;i++){
                        
                        var strokeWidth=0;
                        if (composingObject[i].hasOwnProperty("strokeWidth")){
                            strokeWidth=composingObject[i].strokeWidth * 1;
                        }
                        composingObject[i].top=maxBottom_Val - (composingObject[i].height+strokeWidth*1)* composingObject[i].scaleY;
                    } 
                }else{


                    for (var i=0;i<composingObject.length;i++){
                        if (maxBottom_Obj==composingObject[i].id){
                            continue;
                        }
                        
                        var strokeWidth=0;
                        if (composingObject[i].hasOwnProperty("strokeWidth")){
                            strokeWidth=composingObject[i].strokeWidth * 1;
                        }
                        
                        var _groupOffsetTop=0;
                        if (composingObject[i].hasOwnProperty("group")){
                            var _groupOffsetTop=composingObject[i].group.top + (composingObject[i].group.height+strokeWidth*2) * composingObject[i].group.scaleY/2;
                            var _theObjTop=maxBottom_Val - _groupOffsetTop;
                            composingObject[i].top=_theObjTop -  (composingObject[i].group.height+strokeWidth*1)* composingObject[i].scaleY;
                            composingObject[i].group.addWithUpdate();
                            composingObject[i].group.setCoords();
                        }else{
                            composingObject[i].top=maxBottom_Val - (composingObject[i].group.height+strokeWidth*1)* composingObject[i].scaleY;
                            composingObject[i].setCoords();
                        }
                    }

                }

            }else if (mode=="align-v-centered"){
                //垂直居中
                
                if (self.isPixSelect){
                
                    var v_centered_y=minTop_Val + (maxBottom_Val - minTop_Val)/2;
                    for (var i=0;i<composingObject.length;i++){
                        
                        var strokeWidth=0;
                        if (composingObject[i].hasOwnProperty("strokeWidth")){
                            strokeWidth=composingObject[i].strokeWidth * 1;
                            // v_centered_y=v_centered_y - strokeWidth * 0.5;
                        }
                        
                        var tmpObj_centerd_y=composingObject[i].top + ((composingObject[i].height+strokeWidth*1)* composingObject[i].scaleY/2);
                        if (tmpObj_centerd_y>v_centered_y){
                            
                            composingObject[i].top=v_centered_y  - ((composingObject[i].height+strokeWidth*1) * composingObject[i].scaleY/2);
                            
                        }else if (tmpObj_centerd_y<v_centered_y){
                            composingObject[i].top=tmpObj_centerd_y + (v_centered_y-tmpObj_centerd_y) - ((composingObject[i].height+strokeWidth*1)/2);
                        }
                    } 
                }else{
                
                    var v_centered_y=minTop_Val + (maxBottom_Val - minTop_Val)/2;
                    for (var i=0;i<composingObject.length;i++){

                        var strokeWidth=0;
                        if (composingObject[i].hasOwnProperty("strokeWidth")){
                            strokeWidth=composingObject[i].strokeWidth * 1;
                            // v_centered_y=v_centered_y - strokeWidth * 0.5;
                        }
                        
                        var _groupOffsetTop=0;
                        if (composingObject[i].hasOwnProperty("group")){

                            var _groupOffsetTop=composingObject[i].group.top + (composingObject[i].group.height+strokeWidth*1) * composingObject[i].group.scaleY/2;
                            var tmpObj_centerd_y=composingObject[i].top + ((composingObject[i].group.height+strokeWidth*1) * composingObject[i].scaleY/2);
                            var _theObjTop=v_centered_y - _groupOffsetTop;
                            composingObject[i].top=_theObjTop -  (composingObject[i].group.height+strokeWidth*1)* composingObject[i].scaleY/2;
                            composingObject[i].group.addWithUpdate();
                            composingObject[i].group.setCoords();

                        }else{
                            var tmpObj_centerd_y=composingObject[i].top + ((composingObject[i].group.height+strokeWidth*1)* composingObject[i].scaleY/2);
                            composingObject[i].top=tmpObj_centerd_y + (v_centered_y-tmpObj_centerd_y) - ((composingObject[i].group.height+strokeWidth*1)/2);
                            composingObject[i].setCoords();
                        }

                    }

                }

            }else if (mode=="align-h-left"){
                //向左对齐
                if (self.isPixSelect){
                    for (var i=0;i<composingObject.length;i++){
                        composingObject[i].left=minLeft_Val;
                    }
                }else{

                    for (var i=0;i<composingObject.length;i++){
                        if (minLeft_Obj==composingObject[i].id){
                            continue;
                        }
                        var _groupOffsetLeft=0;
                        if (composingObject[i].hasOwnProperty("group")){
                            var _groupOffsetLeft=composingObject[i].group.left + composingObject[i].group.width * composingObject[i].group.scaleX/2;
                            var _theObjLeft=minLeft_Val - _groupOffsetLeft;
                            composingObject[i].left=_theObjLeft;
                            composingObject[i].group.addWithUpdate();
                            composingObject[i].group.setCoords();
                        }else{
                            composingObject[i].left=minLeft_Val;
                            composingObject[i].setCoords();
                        }
                        
                    }


                }
            }else if (mode=="align-h-right"){
                //向右对齐
                if (self.isPixSelect){
                    for (var i=0;i<composingObject.length;i++){
                        
                        var strokeWidth=0;
                        if (composingObject[i].hasOwnProperty("strokeWidth")){
                            strokeWidth=composingObject[i].strokeWidth * 1;
                        }
              
                        composingObject[i].left=maxRight_Val - (composingObject[i].width+strokeWidth)* composingObject[i].scaleX;
       
                    }
                }else{

                    for (var i=0;i<composingObject.length;i++){

                        var strokeWidth=0;
                        if (composingObject[i].hasOwnProperty("strokeWidth")){
                            strokeWidth=composingObject[i].strokeWidth * 1;
                        }

                        if (maxRight_Obj==composingObject[i].id){
                            continue;
                        }else{
                            var _groupOffsetLeft=0;
                            if (composingObject[i].hasOwnProperty("group")){

                                var _groupOffsetLeft=composingObject[i].group.left + composingObject[i].group.width * composingObject[i].group.scaleX/2;
                                
                                var _theObjLeft=maxRight_Val - _groupOffsetLeft;
                                composingObject[i].left=_theObjLeft -  (composingObject[i].width+strokeWidth*3)* composingObject[i].scaleX;
                                composingObject[i].group.addWithUpdate();
                                composingObject[i].group.setCoords();
                                console.log("ABAB");
                            }else{
                                console.log("CDCD");
                                composingObject[i].left=maxRight_Val - (composingObject[i].width+strokeWidth)* composingObject[i].scaleX;
                                composingObject[i].setCoords();
                            }
                        }
                    }
                }

            }else if (mode=="align-h-center"){
                //水平居中
                console.log("水平居中");
                if (!self.isPixSelect){
                    console.log("align-h-center false");
                    var v_centered_x=minLeft_Val + (maxRight_Val - minLeft_Val)/2;
                    for (var i=0;i<composingObject.length;i++){
                        if (!composingObject[i].hasOwnProperty("group")){   
                            // var v_centered_x=minLeft_Val + (maxRight_Val - minLeft_Val)/2;
                            var strokeWidth=0;
                            if (composingObject[i].hasOwnProperty("strokeWidth")){
                                strokeWidth=composingObject[i].strokeWidth * 1;
                                v_centered_x=v_centered_x - strokeWidth * 0.5;
                            }

                            var tmpObj_centerd_x=composingObject[i].left + ((composingObject[i].width+strokeWidth*2)* composingObject[i].scaleX/2);
                            if (tmpObj_centerd_x>v_centered_x){
                                console.log("align-OKI a");
                                composingObject[i].left=v_centered_x  - ((composingObject[i].width+strokeWidth*2)* composingObject[i].scaleX/2);
                                
                            }else if (tmpObj_centerd_x<v_centered_x){
                                console.log("align-OKI b");
                                composingObject[i].left=tmpObj_centerd_x + (v_centered_x-tmpObj_centerd_x) - ((composingObject[i].width+strokeWidth*2)* composingObject[i].scaleX/2);
                            }
                            composingObject[i].setCoords();
                        }else{
                            var v_centered_x=minLeft_Val + (maxRight_Val - minLeft_Val)/2;
                            var strokeWidth=0;
                            if (composingObject[i].hasOwnProperty("strokeWidth")){
                                strokeWidth=composingObject[i].strokeWidth * 1;
                                // v_centered_x=v_centered_x - strokeWidth * 0.5;
                            }
                            
                            var _groupOffsetLeft=composingObject[i].group.left + composingObject[i].group.width * composingObject[i].group.scaleX/2;
                            var tmpObj_centerd_x=composingObject[i].left + _groupOffsetLeft + ((composingObject[i].width+strokeWidth*2)* composingObject[i].scaleX/2);

                            if (tmpObj_centerd_x>v_centered_x){
                                var deff_val=tmpObj_centerd_x - v_centered_x;
                                composingObject[i].left=composingObject[i].left - deff_val;
                             
                            }else if (tmpObj_centerd_x<v_centered_x){
                                var deff_val=v_centered_x - tmpObj_centerd_x;
                                composingObject[i].left=composingObject[i].left + deff_val;
                             
                            }

                            composingObject[i].group.addWithUpdate();
                            composingObject[i].group.setCoords();

                        }
                    }

                }else{
                    console.log("align-h-center true");
                    var v_centered_x=minLeft_Val + (maxRight_Val - minLeft_Val)/2;
                    for (var i=0;i<composingObject.length;i++){
                        
                        var strokeWidth=0;
                        if (composingObject[i].hasOwnProperty("strokeWidth")){
                            strokeWidth=composingObject[i].strokeWidth * 1;
                            // v_centered_x=v_centered_x - strokeWidth * 0.5;
                        }
                        
                        var tmpObj_centerd_x=composingObject[i].left + ((composingObject[i].width+strokeWidth*1)* composingObject[i].scaleX/2);
                        if (tmpObj_centerd_x>v_centered_x){
                            
                            composingObject[i].left=v_centered_x - ((composingObject[i].width+strokeWidth*1)* composingObject[i].scaleX/2);
                            
                        }else if (tmpObj_centerd_x<v_centered_x){
                            
                            composingObject[i].left=tmpObj_centerd_x + (v_centered_x-tmpObj_centerd_x) - ((composingObject[i].width+strokeWidth*1)* composingObject[i].scaleX/2);
                        }
                    }


                }

            }
            
            canvas.renderAll(); 

            self.drawing=true;
            //事务描述
            var msg="Edit element";
            self.canvasSave().canvasHistoryRecordCall(msg);
            
        }


        //重新排列zIndex
        this.reSortComponent=function (callback=null) {

            //20220813
            canvas._objects.sort((a, b) => (a.zIndex > b.zIndex) ? 1 : -1);
            (callback && typeof(callback) === "function") && callback();
        }
        
        //根据画布对象层级重新先后加载渲染
        this.resetView=function(callback=null){

            var jsonData = (canvas.toJSON( self.canvasConfig.outFiled )); 
            var objJson=jsonData.objects;

            var isDrawBgColor=false;
            var _backgroundImage=_parent.searchObject({id:'BackgroundImage'},objJson);
            if (_backgroundImage!=false){

                if (_backgroundImage.visible==false || _backgroundImage.src=="" || _backgroundImage.src.indexOf(self.blankPic)>0){
                    isDrawBgColor=true;
                }else{}
            }else{}

            var compare = function (obj1, obj2) {
                var val1 = obj1.zIndex * 1;
                var val2 = obj2.zIndex * 1;
                if (val1 < val2) {
                    return -1;
                } else if (val1 > val2) {
                    return 1;
                } else {
                    return 0;
                }            
            } 
            objJson.sort(compare)

            for (var i=0 ;i< objJson.length;i++){
                
                var _this=objJson[i];
                if (_this.dType =="paperMargins"){
                    
                    if (isDrawBgColor){
                        objJson[i].fill="#ffffff";
                    }else{
                        objJson[i].fill="";
                    }

                }
            }

            //canvas.clear(); 2023-03-13
            jsonData.objects=objJson;
            canvas.loadFromJSON(jsonData,canvas.renderAll.bind(canvas), function(){
                fabric.charWidthsCache = {};
                canvas.renderAll.bind(canvas);

                (callback && typeof(callback) === "function") && callback();
            });
        
        }
        
        //删除选中组件
        this.componentDelete=function(callback=null){
           
            if (self.selectedObject==null || self.selectedObject.length==1){
              
                if (self.selectedObject!=null){

                    if (self.selectedObject.hasOwnProperty("type")){

                        if (self.selectedObject.type=="activeSelection"){

                            var composingObject=_JC.selectedObject[0]._objects;

                        }else{

                            var composingObject=_JC.selectedObject;
                        }

                        for (var i=0;i<composingObject.length;i++){

                            if (composingObject[i].hasOwnProperty("dType")){

                                if (composingObject[i].dType=="BackgroundImage"){
                                    composingObject[i].set({visible:false});
                                }else{
                                    
                                    self.layer.canvasOperation.deleteComponent({layerID:composingObject[i].id});
                                    canvas.remove(composingObject[i]); 
                                }
                            }else{
                                self.layer.canvasOperation.deleteComponent({layerID:composingObject[i].id});
                                canvas.remove(composingObject[i]);
                            }   
                                     
                        }
                        self.cunterObj=null;
                        self.selectedObject=null;

                    }else{

                        for (var i=0;i<self.selectedObject.length;i++){
                         
                            if (self.selectedObject[i].hasOwnProperty("dType")){

                                if (self.selectedObject[i].dType=="BackgroundImage"){
                                    self.selectedObject[i].set({visible:false});
                                }else{
                                    if (self.selectedObject[i].hasOwnProperty("group")){
                                        var tmpGroup=self.selectedObject[i].group;
                                        
                                        self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                                        tmpGroup.remove(self.selectedObject[i]);
                                        tmpGroup.addWithUpdate();
                                        tmpGroup.setCoords();
                                        if (tmpGroup._objects){
                                            if (tmpGroup._objects.length<1){
                                                self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                                                self.layer.canvasOperation.deleteComponent({layerID:tmpGroup.id});
                                                canvas.remove(tmpGroup);
                                            }
                                        }
                                    }else{
                                        self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                                        canvas.remove(self.selectedObject[i]); 
                                    }
                                    
                                }
                            }else{
                                self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                                canvas.remove(self.selectedObject[i]);
                            }   
                                     
                        }

                        self.cunterObj=null;
                        self.selectedObject=null;

                    }



                }
            }else{

                //删除组件后取消选中框控制器
                canvas.discardActiveObject();
                // canvas.renderAll();
                $.each(self.selectedObject, function(i) {
                
                    if (self.selectedObject[i].hasOwnProperty("dType")){
                        if (self.selectedObject[i].dType=="BackgroundImage"){
                            self.selectedObject[i].set({visible:false});
                        }else{
                            
                            if (self.selectedObject[i].hasOwnProperty("group")){
                           
                                if (self.selectedObject[i].group.type!="activeSelection"){
                                    var tmpGroup=self.selectedObject[i].group;
                                    self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                                    tmpGroup.remove(self.selectedObject[i]);
                          
                                    tmpGroup.addWithUpdate();
                                    tmpGroup.setCoords();
                                    if (tmpGroup._objects){
                                        if (tmpGroup._objects.length<1){
                                            self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                                            self.layer.canvasOperation.deleteComponent({layerID:tmpGroup.id});
                                            canvas.remove(tmpGroup);
                                          
                                        }
                                    }
                                }else{
                                    self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                                    canvas.remove(self.selectedObject[i]);
                                 
                                }
                            }else{
                            
                                if (self.selectedObject[i].hasOwnProperty("sourceGroup")){
                                    
                                    var sourceGroup=self.selectedObject[i].sourceGroup;
                                    sourceGroup.remove(self.selectedObject[i]);
                                    self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                                    if (sourceGroup._objects.length<1){
                                        self.layer.canvasOperation.deleteComponent({layerID:sourceGroup.id});
                                        canvas.remove(sourceGroup);
                                    }
                                    
                                }else{
                                    self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                                    canvas.remove(self.selectedObject[i]);
                                }
                                
                            }
                            
                        }
                    }else{
                        self.layer.canvasOperation.deleteComponent({layerID:self.selectedObject[i].id});
                        canvas.remove(self.selectedObject[i]);
                   
                    }     
                             
                });  
                self.selectedObject=null; 
                self.cunterObj=null;
                
            }
           
            self.cunterObj=null;
            self.selectedObject=null;
            canvas.discardActiveObject();
            canvas.renderAll();
            self.attributesShow().paper(); 
            
            self.drawing=true;
            //事务描述
            var msg="Delete element";
            self.canvasSave().canvasHistoryRecordCall(msg);

            (callback && typeof(callback) === "function") && callback();
        }
        
        return this;
    }
    
    //属性面板区域
    self.attributesShow=function(parm=null){
        
        //文本类
        this.textBox=function(){
            
            var fontColor=self.cunterObj.fill;
            if (!self.cunterObj.fontCmyk && fontColor!=""){
                var _rgb =self.colorPlugin.colorConverter._HexToRgba(fontColor,1);
                var _cmykObj=self.colorPlugin.colorConverter._RGBtoCMYK(_rgb);
                var _cmykStr=_cmykObj.c+","+_cmykObj.m+","+_cmykObj.y+","+_cmykObj.k;
                self.cunterObj.set({fontCmyk:_cmykStr});
            }
            _CMYK.createCmykColor({
                elem:'test-form',
                color:fontColor,
                cmyk:self.cunterObj.fillCmyk,
                hex:fontColor,
                colorType:'fill'
            });
        
            //本文背景色
            var backgroundColor=self.cunterObj.backgroundColor;
            if (!self.cunterObj.backgroundColorCmyk && backgroundColor!=""){
                var _rgb = self.colorPlugin.colorConverter._HexToRgba(backgroundColor,1);
                var _cmykObj=self.colorPlugin.colorConverter._RGBtoCMYK(_rgb);
                var _cmykStr=_cmykObj.c+","+_cmykObj.m+","+_cmykObj.y+","+_cmykObj.k;
                self.cunterObj.set({backgroundColorCmyk:_cmykStr});
            }
            _CMYK.createCmykColor({
                elem:'textBackgroundColor-form',
                color:backgroundColor,
                cmyk:self.cunterObj.backgroundColorCmyk,
                hex:backgroundColor,
                colorType:'backgroundColor'
            });
            
            //文本边框颜色
            var strokeColor=self.cunterObj.stroke;
            if (!self.cunterObj.strokeCmyk && strokeColor!=""){
                var _rgb = self.colorPlugin.colorConverter._HexToRgba(strokeColor,1);
                var _cmykObj=self.colorPlugin.colorConverter._RGBtoCMYK(_rgb);
                var _cmykStr=_cmykObj.c+","+_cmykObj.m+","+_cmykObj.y+","+_cmykObj.k;
                self.cunterObj.set({strokeCmyk:_cmykStr});
            }
            _CMYK.createCmykColor({
                elem:'textStrokeColor-form',
                color:strokeColor,
                cmyk:self.cunterObj.strokeCmyk,
                hex:strokeColor,
                colorType:'stroke'
            });
            
            //文本阴影颜色
            var shadowColor=self.cunterObj.shadowColor;
            if (!self.cunterObj.shadowColorCmyk && shadowColor!=""){
                var _rgb = self.colorPlugin.colorConverter._HexToRgba(shadowColor,1);
                var _cmykObj=self.colorPlugin.colorConverter._RGBtoCMYK(_rgb);
                var _cmykStr=_cmykObj.c+","+_cmykObj.m+","+_cmykObj.y+","+_cmykObj.k;
                self.cunterObj.set({shadowColorCmyk:_cmykStr});
            }
            _CMYK.createCmykColor({
                elem:'shadow-form',
                color:shadowColor,
                cmyk:self.cunterObj.shadowColorCmyk,
                hex:shadowColor,
                colorType:'shadowColor'
            });            
            
            //对被分组拉大的文本进行 比例重新设置为1,计算字体大小
            if (self.cunterObj.scaleX!=1){
                var _w=self.cunterObj.width * self.cunterObj.scaleX;
                var _h=self.cunterObj.height * self.cunterObj.scaleY;
                var _l=self.cunterObj.left;
                var _t=self.cunterObj.top;
                var _fontSize=self.cunterObj.fontSize;
                var newSize=parseInt(_fontSize * self.cunterObj.scaleX);
                var newFontPt=newSize *  72 / self.paperSize.paperDPI;
                self.cunterObj.set({fontSize:newSize,fontPt:newFontPt,scaleX:1,scaleY:1,left:_l,top:_t,width:_w,height:_h});
            }
            
            //文本页面元素属性
            self.pageEvent.textBoxAttributes();
        
        }

        //划线文本
        this.underlineText=function(){
            
            //划线文本组件属性显示
            if (self.cunterObj._objects[0].type=="i-text"){
                var _textObj=self.cunterObj._objects[0];
                var _lineObj=self.cunterObj._objects[1]; 
                var _textIndex=0,_lineIndex=1;
            }else{
                var _textObj=self.cunterObj._objects[1];
                var _lineObj=self.cunterObj._objects[0];
                var _textIndex=1,_lineIndex=0;
            }

            var fontColor=_textObj.fill;
            if (!_textObj.fillCmyk && fontColor!=""){
                var _rgb =self.colorPlugin.colorConverter._HexToRgba(fontColor,1);
                var _cmykObj=self.colorPlugin.colorConverter._RGBtoCMYK(_rgb);
                var _cmykStr=_cmykObj.c+","+_cmykObj.m+","+_cmykObj.y+","+_cmykObj.k;
                _textObj.fillCmyk=_cmykStr;
                self.cunterObj.item(_textIndex).set({
                    fontCmyk:_cmykStr,
                    fillCmyk:_cmykStr
                });
            }
            _CMYK.createCmykColor({
                elem:'underlineTextColor-form',
                color:fontColor,
                cmyk:_textObj.fillCmyk,
                hex:fontColor,
                colorType:'fill'
            });
            
            //文本边框颜色
            var strokeColor=_textObj.stroke;
            if (!_textObj.strokeCmyk && strokeColor!=""){
                var _rgb = self.colorPlugin.colorConverter._HexToRgba(strokeColor,1);
                var _cmykObj=self.colorPlugin.colorConverter._RGBtoCMYK(_rgb);
                var _cmykStr=_cmykObj.c+","+_cmykObj.m+","+_cmykObj.y+","+_cmykObj.k;
                _textObj.strokeCmyk=_cmykStr;
                self.cunterObj.item(_textIndex).set({
                    strokeCmyk:_cmykStr
                });
            }
            _CMYK.createCmykColor({
                elem:'underlineTextStrokeColor-form',
                color:strokeColor,
                cmyk:_textObj.strokeCmyk,
                hex:strokeColor,
                colorType:'stroke'
            });
            
            //划线颜色
            var strokeColor=_lineObj.stroke;
            if (!_lineObj.strokeCmyk && strokeColor!=""){
                var _rgb = self.colorPlugin.colorConverter._HexToRgba(strokeColor,1);
                var _cmykObj=self.colorPlugin.colorConverter._RGBtoCMYK(_rgb);
                var _cmykStr=_cmykObj.c+","+_cmykObj.m+","+_cmykObj.y+","+_cmykObj.k;
                _textObj.strokeCmyk=_cmykStr;
                self.cunterObj.item(_lineIndex).set({
                    strokeCmyk:_cmykStr
                });
            }
            _CMYK.createCmykColor({
                elem:'underlineColor-form',
                color:strokeColor,
                cmyk:_lineObj.strokeCmyk,
                hex:strokeColor,
                colorType:'underlineColor'
            });            
            
            //对被分组拉大的文本进行 比例重新设置为1,计算字体大小
            if (self.cunterObj.scaleX!=1){
                var _w=self.cunterObj.width * self.cunterObj.scaleX;
                var _h=self.cunterObj.height * self.cunterObj.scaleY;
                var _l=self.cunterObj.left;
                var _t=self.cunterObj.top;
                var _fontSize=_textObj.fontSize;
                var newSize=parseInt(_fontSize * self.cunterObj.scaleX);
                var newFontPt=newSize *  72 / self.paperSize.paperDPI;
                //self.cunterObj.set({fontSize:newSize,fontPt:newFontPt,scaleX:1,scaleY:1,left:_l,top:_t,width:_w,height:_h});
               
                /* 20220930
                self.cunterObj.item(_textIndex).set({
                    fontSize:newSize,
                    fontPt:newFontPt,
                    scaleX:1,
                    scaleY:1
                });*/
            }
            
            //文本页面元素属性
            self.pageEvent.underlineTextAttributes();
        
        }
        
        
        //形状类
        this.shape=function(){
            
            var fillColor=self.cunterObj.fill;
            if (typeof(fillColor)=="string"){
                if (!self.cunterObj.fillCmyk && fillColor!=""){
                    var _rgb =self.colorPlugin.colorConverter._HexToRgba(fillColor,1);
                    var _cmykObj=self.colorPlugin.colorConverter._RGBtoCMYK(_rgb);
                    var _cmykStr=_cmykObj.c+","+_cmykObj.m+","+_cmykObj.y+","+_cmykObj.k;
                    self.cunterObj.set({fillCmyk:_cmykStr});
                }
                self.colorPlugin.createCmykColor({elem:'rectBackgroundColor-form',color:fillColor,cmyk:self.cunterObj.fillCmyk,hex:fillColor,colorType:'fill'});
            }else{
                //console.log("渐变色",fillColor);
            }
            
            var strokeColor=self.cunterObj.stroke;
            if (!self.cunterObj.strokeCmyk && strokeColor!=""){
                var _rgb = self.colorPlugin.colorConverter._HexToRgba(strokeColor,1);
                var _cmykObj=self.colorPlugin.colorConverter._RGBtoCMYK(_rgb);
                var _cmykStr=_cmykObj.c+","+_cmykObj.m+","+_cmykObj.y+","+_cmykObj.k;
                self.cunterObj.set({strokeCmyk:_cmykStr});
            }
            self.colorPlugin.createCmykColor({elem:'rectColor-form',color:strokeColor,cmyk:self.cunterObj.strokeCmyk,hex:strokeColor,colorType:'stroke'}); 
            //形状、SVG页面元素属性
            self.pageEvent.shapeAttributes();
            
        }
        
        //图片类
        this.picture=function(){
            
            self.pageEvent.pictureAttributes();
            
            //图片阴影
            var shadowColor=self.cunterObj.shadowColor;
            if (!self.cunterObj.shadowColorCmyk && shadowColor!=""){
                var _rgb = self.colorPlugin.colorConverter._HexToRgba(shadowColor,1);
                var _cmykObj=self.colorPlugin.colorConverter._RGBtoCMYK(_rgb);
                var _cmykStr=_cmykObj.c+","+_cmykObj.m+","+_cmykObj.y+","+_cmykObj.k;
                self.cunterObj.set({shadowColorCmyk:_cmykStr});
            }
            _CMYK.createCmykColor({
                elem:'shadow-picture',
                color:shadowColor,
                cmyk:self.cunterObj.shadowColorCmyk,
                hex:shadowColor,
                colorType:'shadowColor'
            });   
            
        }

        //图片ICON类
        this.iconElement=function(){
            
            self.pageEvent.iconElementAttributes();
            
            //图片阴影
            var shadowColor=self.cunterObj.shadowColor;
            if (!self.cunterObj.shadowColorCmyk && shadowColor!=""){
                var _rgb = self.colorPlugin.colorConverter._HexToRgba(shadowColor,1);
                var _cmykObj=self.colorPlugin.colorConverter._RGBtoCMYK(_rgb);
                var _cmykStr=_cmykObj.c+","+_cmykObj.m+","+_cmykObj.y+","+_cmykObj.k;
                self.cunterObj.set({shadowColorCmyk:_cmykStr});
            }
            _CMYK.createCmykColor({
                elem:'shadow-picture',
                color:shadowColor,
                cmyk:self.cunterObj.shadowColorCmyk,
                hex:shadowColor,
                colorType:'shadowColor'
            });   
            
        }

        //线条类
        this.polygon=function(){
            
        }
        
        //普通组合类
        this.group=function(){
            //普通分组页面属性
            self.pageEvent.groupAttributes();
        }
        
        //商品图片元件
        this.productPicture=function(){
            
            //商品图片类页面属性 GoodsImage、Icon、Brand
            self.pageEvent.productPictureAttributes();
            
        }
        
        //商品组件类
        this.product=function(){
            //商品组件页面元素属性
            self.pageEvent.productAttributes();
        }
        
        //框选多组件
        this.selectedMultiple=function(e){
            //框选多组件页面元素事件
            console.log("框选多组件页面元素事件");
            self.pageEvent.selectedMultiple();
            self.layer.canvasOperation.chooseMultipleLayer();
        }
        
        //画布属性
        this.paper=function(){
            self.pageEvent.showBackgroundImage();
        }
        
        return this;
    }


    //组件、画布 色彩类操作
    self.colorConfig=function(parm=null){

        if (self.isPixSelect==false && self.cunterObj!=null && self.selectedObject!=null){
            if (!self.cunterObj.hasOwnProperty("dType")){
                self.cunterObj=null;
            }else if (self.cunterObj.hasOwnProperty("type")){
                if (self.cunterObj.type=="activeSelection"){
                    self.cunterObj=null;
                }
            }
        }else if (self.isPixSelect && self.cunterObj!=null && self.selectedObject!=null){
            if (!self.cunterObj.hasOwnProperty("dType")){
                self.cunterObj=null;
            }else if (self.cunterObj.hasOwnProperty("type")){
                if (self.cunterObj.type=="activeSelection"){
                    self.cunterObj=null;
                }
            }
        }

        if (self.cunterObj!=null && self.cunterObj.hasOwnProperty("dType")){
            var isCall=false;
            if (self.cunterObj.dType!="productPriceGroup"){
         
                if (self.cunterObj.type!="activeSelection"){    

                    //非划线文本类
                    switch (parm.colorType)
                    {
                        case "fill":
                            if (self.cunterObj.fillCmyk!=parm.Cmyk){
                                self.cunterObj.set({fill:parm.Hex,fillCmyk:parm.Cmyk});
                                isCall=true;
                            }
                        break;
                        case "backgroundColor":
                            if (self.cunterObj.backgroundColorCmyk!=parm.Cmyk){
                                self.cunterObj.set({backgroundColor:parm.Hex,backgroundColorCmyk:parm.Cmyk});
                                isCall=true;
                            }
                        break;
                        case "stroke":
                            if (self.cunterObj.strokeCmyk!=parm.Cmyk){
                                self.cunterObj.set({stroke:parm.Hex,strokeCmyk:parm.Cmyk});
                                isCall=true;
                            }
                        break;
                        case "shadowColor":
                            if (self.cunterObj.shadowColorCmyk!=parm.Cmyk){
                                self.cunterObj.set({shadowColor:parm.Hex,shadowColorCmyk:parm.Cmyk});
                                isCall=true;
                                var shadow=self.cunterObj.shadow;
                                if (shadow!=null){
                                    shadow.color=parm.Hex;
                                    var shadowConfig = new fabric.Shadow(shadow); 
                                    self.cunterObj.set({shadow:shadowConfig});
                                }

                            }
                        break;
                    }

                }else{


                    //多选组件批量修改组件属性
                    if (self.cunterObj.hasOwnProperty("_objects")){

                        for (var i=0;i<self.cunterObj._objects.length;i++){

                            switch (parm.colorType)
                            {
                                case "fill":
                                    if (self.cunterObj._objects[i].fillCmyk!=parm.Cmyk){
                                        self.cunterObj._objects[i].set({fill:parm.Hex,fillCmyk:parm.Cmyk});
                                        isCall=true;
                                    }
                                break;
                                case "backgroundColor":
                                    if (self.cunterObj._objects[i].backgroundColorCmyk!=parm.Cmyk){
                                        self.cunterObj._objects[i].set({backgroundColor:parm.Hex,backgroundColorCmyk:parm.Cmyk});
                                        isCall=true;
                                    }
                                break;
                                case "stroke":
                                   
                                    if (self.cunterObj._objects[i].strokeCmyk!=parm.Cmyk){
                                        self.cunterObj._objects[i].set({stroke:parm.Hex,strokeCmyk:parm.Cmyk});
                                        isCall=true;
                                    }
                                break;
                                case "shadowColor":
                                    if (self.cunterObj._objects[i].shadowColorCmyk!=parm.Cmyk){
                                        self.cunterObj._objects[i].set({shadowColor:parm.Hex,shadowColorCmyk:parm.Cmyk});
                                        isCall=true;
                                        var shadow=self.cunterObj._objects[i].shadow;
                                        if (shadow!=null){
                                            shadow.color=parm.Hex;
                                            var shadowConfig = new fabric.Shadow(shadow); 
                                            self.cunterObj._objects[i].set({shadow:shadowConfig});
                                        }

                                    }
                                break;
                            }
            

                        }

                        canvas.renderAll();
                    }


                }


            }else{

                if (self.cunterObj._objects[0].type=="i-text"){
                    var _textObj=self.cunterObj._objects[0];
                    var _lineObj=self.cunterObj._objects[1]; 
                    var _textIndex=0,_lineIndex=1;
                }else{

                    var _textObj=self.cunterObj._objects[1];
                    var _lineObj=self.cunterObj._objects[0];
                    var _textIndex=1,_lineIndex=0;
                }                

                //划线文本类
                switch (parm.colorType)
                {
                    case "fill":
                        if (_textObj.fillCmyk!=parm.Cmyk){
                            self.cunterObj.item(_textIndex).set({
                                fill:parm.Hex,
                                fillCmyk:parm.Cmyk
                            });                     
                            isCall=true;
                        }
                    break;
                    case "backgroundColor":
                        if (_textObj.backgroundColorCmyk!=parm.Cmyk){
                            self.cunterObj.set({backgroundColor:parm.Hex,backgroundColorCmyk:parm.Cmyk});
                            isCall=true;
                        }
                    break;
                    case "stroke":
                        if (_textObj.strokeCmyk!=parm.Cmyk){
                            self.cunterObj.item(_textIndex).set({
                                stroke:parm.Hex,
                                strokeCmyk:parm.Cmyk,
                                paintFirst:'stroke'
                            });                     
                            isCall=true;
                        }
                    break;
                    case "shadowColor":
                        if (_textObj.shadowColorCmyk!=parm.Cmyk){
                            self.cunterObj.set({shadowColor:parm.Hex,shadowColorCmyk:parm.Cmyk});
                            isCall=true;
                            var shadow=self.cunterObj.shadow;
                            if (shadow!=null){
                                shadow.color=parm.Hex;
                                var shadowConfig = new fabric.Shadow(shadow); 
                                self.cunterObj.set({shadow:shadowConfig});
                            }

                        }
                    break;
                    case "underlineColor":
                        if (_lineObj.strokeCmyk!=parm.Cmyk){
                            self.cunterObj.item(_lineIndex).set({
                                stroke:parm.Hex,
                                strokeCmyk:parm.Cmyk
                            });       
                        }
                    break; 
                }


            }

            self.drawing=true;
            canvas.renderAll();
            if (isCall==true){
                var msg="Edit element";
                self.canvasSave().canvasHistoryRecordCall(msg);
            }
        }else if (self.cunterObj==null && self.selectedObject!=null){

            //多选组件批量设置
            
            if (self.selectedObject.length>1){
                var composingObject=self.selectedObject;
            }else{
                var composingObject=self.selectedObject[0]._objects;
            }
            canvas.discardActiveObject();
            for (var i=0;i<composingObject.length;i++){

                switch (parm.colorType)
                {
                    case "fill":
                        if (composingObject[i].fill!=parm.Hex){
                            composingObject[i].set({fill:parm.Hex,fillCmyk:parm.Cmyk});
                            isCall=true;
                        }
                    break;
                    case "backgroundColor":
                        if (composingObject[i].backgroundColorCmyk!=parm.Cmyk){
                            composingObject[i].set({backgroundColor:parm.Hex,backgroundColorCmyk:parm.Cmyk});
                            isCall=true;
                        }
                    break;
                    case "stroke":
                        if (composingObject[i].strokeCmyk!=parm.Cmyk){
                            composingObject[i].set({stroke:parm.Hex,strokeCmyk:parm.Cmyk});
                            isCall=true;
                        }
                    break;
                    case "shadowColor":
                        if (composingObject[i].shadowColorCmyk!=parm.Cmyk){
                            composingObject[i].set({shadowColor:parm.Hex,shadowColorCmyk:parm.Cmyk});
                            isCall=true;
                            var shadow=composingObject[i].shadow;
                            if (shadow!=null){
                                shadow.color=parm.Hex;
                                var shadowConfig = new fabric.Shadow(shadow); 
                                composingObject[i].set({shadow:shadowConfig});
                            }

                        }
                    break;
                }

                if (composingObject[i].hasOwnProperty("group")) {
                    composingObject[i].group.addWithUpdate();
                }
                if (composingObject[i].hasOwnProperty("sourceGroup")) {
                    composingObject[i].sourceGroup.addWithUpdate();
                }

            }

            self.drawing=true;
            canvas.renderAll();
            if (isCall==true){
                var msg="Edit element";
                self.canvasSave().canvasHistoryRecordCall(msg);
            }

        }   
    }

    //实例存储操作
    self.canvasSave=function(parm=null){
        var _parent=this;
        
        //副本集更新
        this.updatePageDuplicate=function(No,canvasJson,callback=null){
        
            if (isEmpty(No)){
          
                (callback && typeof(callback) === "function") && callback(); 
                return;
            }
            for (key in self.templateData.cunterPageDuplicate){
                if (self.templateData.cunterPageDuplicate[key].No*1 == No * 1){
                    canvasJson.No=No;
                    self.templateData.cunterPageDuplicate[key]=canvasJson;
              
                    (callback && typeof(callback) === "function") && callback(); 
                    break;
                }
            }
        }
        
        /**
         * 记录画布操作到本地存储
         * @ mode 模板级单页操作类型
         *   addPage 新增单页、editPage 单页组件等操作、delPage 删除该页
         *   sortPage 调整单页排序位置、loadPage加载模板单页
         */
        this.canvasHistoryRecordSave=function(userID=null,mode=null,msg='',callback=null){
            //self.drawing=true;

            //删除智能对齐辅助线
            self.canvasDraw().clearAlignLine();
            //删除平移画布遮罩层
            self.canvasDraw().deleteObject({
                id: "panningBox"
            });
            var canvasJson= (canvas.toJSON( self.canvasConfig.outFiled ));
            
            //根据当前单页内部版本号 更新当前单页内容到对应的副本集
            _parent.updatePageDuplicate(self.canvasConfig.recordPointer.pointerPageNo,canvasJson);        

            var table={
                name:self.dbConfig.historyRecordTable,
                type:'readwrite'
            };
            var insertData=[];
            var tmp={
                time:Date.parse(new Date()),
                UUID:self.canvasConfig.recordPointer.pointerPageNo,
                userID:userID,
                mmCode:self.templateData.mmCode,
                templateCode:self.templateData.templateCode,
                pageCode:self.canvasConfig.recordPointer.pointerPageCode,
                jsonCode:JSON.stringify(canvasJson),
                mode:mode,
                msg:msg,
                active:0,
                
                //当前内存变量保存
                //当前模板各单页列表信息
                templatePages:JSON.stringify(self.templateData.templatePages),
                
                pageArrJson:JSON.stringify(self.pageArrJson),
                cunterPage:self.cunterPage,
                //副本的内部编号
                pageNo:self.canvasConfig.recordPointer.pointerPageNo,
                undoGroupSource:JSON.stringify(self.undoGroupSource)
            };

            //存储图层面板HTML
            var layerHtmlCode="";
            if (self.designModule!=""){
                layerHtmlCode=self.layer.render.getLayerHtml();
            }

            tmp.layerHtmlCode=layerHtmlCode;
       
            insertData.push(tmp);
            self.localDB.saveData(table,insertData);
            //历史记录指针
            console.log("canvasHistoryRecordSave 前历史记录指针=>"+self.canvasConfig.recordPointer.pointerIndex);
            self.canvasConfig.recordPointer.pointerIndex++;
            console.log("写入 指针",self.canvasConfig.recordPointer.pointerIndex);

            (callback && typeof(callback) === "function") && callback();
            
            //更新模板本地单页列表
            var base64="";
            var pageSaveTable={
                name:self.dbConfig.tempPageSaveTable,
                type:'readwrite'
            };
            var pageSaveData=[]
            pageSaveData[0]={
                time:insertData[0].time,
                UUID:self.canvasConfig.recordPointer.pointerPageNo,
                userID:userID,
                mmCode:self.templateData.mmCode,
                templateCode:self.templateData.templateCode,
                pageCode:self.canvasConfig.recordPointer.pointerPageCode,
                jsonCode:JSON.stringify(canvasJson),
                preView:base64,
                status:0
            };
            if (mode=="loadPage"){
                self.localDB.saveData(pageSaveTable,pageSaveData);
            }else{
                self.localDB.updateRowData(pageSaveTable,"pageCode",0,self.canvasConfig.recordPointer.pointerPageCode,pageSaveData);
                
                //这里组件设计页会去掉 unDo的noneClick bug
                if (self.canvasConfig.recordPointer.pointerIndex>0){
                    document.getElementById(self.pageEventObject.unDo.id).classList.remove(self.pageEventObject.unDo.disableClass[0]);
                }
            }
            
        }
        this.canvasHistoryRecordSave_copy=function(userID=null,mode=null,msg='',callback=null){

            var canvasJson= (canvas.toJSON( self.canvasConfig.outFiled ));
            
            //根据当前单页内部版本号 更新当前单页内容到对应的副本集
            _parent.updatePageDuplicate(self.canvasConfig.recordPointer.pointerPageNo,canvasJson);
            
            var table={
                name:self.dbConfig.historyRecordTable,
                type:'readwrite'
            };
            var insertData=[];
            var tmp={
                time:Date.parse(new Date()),
                UUID:self.canvasConfig.recordPointer.recordUUID,
                userID:userID,
                mmCode:self.templateData.mmCode,
                templateCode:self.templateData.templateCode,
                pageCode:self.canvasConfig.recordPointer.pointerPageCode,
                jsonCode:JSON.stringify(canvasJson),
                mode:mode,
                msg:msg,
                active:0,
                
                //当前内存变量保存
                //当前模板各单页列表信息
                templatePages:JSON.stringify(self.templateData.templatePages),
                
                pageArrJson:JSON.stringify(self.pageArrJson),
                cunterPage:self.cunterPage,
                //副本的内部编号
                pageNo:self.canvasConfig.recordPointer.pointerPageNo,
                undoGroupSource:JSON.stringify(self.undoGroupSource)
            };
            insertData.push(tmp);
            self.localDB.saveData(table,insertData);
            
            //历史记录指针
            self.canvasConfig.recordPointer.pointerIndex++;
            (callback && typeof(callback) === "function") && callback();
            
            //更新模板本地单页列表
            // var base64=this.canvasBase64();
            var base64="";
            var pageSaveTable={
                name:self.dbConfig.tempPageSaveTable,
                type:'readwrite'
            };
            var pageSaveData=[]
            pageSaveData[0]={
                time:insertData[0].time,
                UUID:self.canvasConfig.recordPointer.recordUUID,
                userID:userID,
                mmCode:self.templateData.mmCode,
                templateCode:self.templateData.templateCode,
                pageCode:self.canvasConfig.recordPointer.pointerPageCode,
                jsonCode:JSON.stringify(canvasJson),
                preView:base64,
                status:0
            };
            if (mode=="loadPage"){
                self.localDB.saveData(pageSaveTable,pageSaveData);
            }else{
                self.localDB.updateRowData(pageSaveTable,"pageCode",0,self.canvasConfig.recordPointer.pointerPageCode,pageSaveData);
                
                //这里组件设计页会去掉 unDo的noneClick bug
                if (self.canvasConfig.recordPointer.pointerIndex>0){
                    document.getElementById(self.pageEventObject.unDo.id).classList.remove(self.pageEventObject.unDo.disableClass[0]);
                }
            }
            
        }


        //取指定索引位置历史记录
        this.canvasHistoryRecordGet=function(_p){
            console.log("取指定索引位置历史记录="+_p);
            self.localDB.getKeyData({
                        name: self.dbConfig.historyRecordTable,
                        type: 'readonly'}
            ,"UUID",self.canvasConfig.recordPointer.pointerPageNo,(_p),function(data,_pMax){
                console.log(data);
                if (_p==0){
                    document.getElementById(self.pageEventObject.unDo.id).classList.add(self.pageEventObject.unDo.disableClass[0]);
                }else if (_p>0 && _pMax>=_p){
                    document.getElementById(self.pageEventObject.unDo.id).classList.remove(self.pageEventObject.unDo.disableClass[0]);
                }
                
                if (_p==_pMax && _pMax!=-1){
                    document.getElementById(self.pageEventObject.toDo.id).classList.add(self.pageEventObject.unDo.disableClass[0]);
                }else if (_p<_pMax){
                    document.getElementById(self.pageEventObject.toDo.id).classList.remove(self.pageEventObject.unDo.disableClass[0]);
                }
                
                if (data.length==0){
                    console.log("0000000");
                    //"取指定索引位置历史记录"+_p+"返回空"
                    return;
                }
                
                //从历史记录的jsonCode替换临时页保存表的jsonCode
                self.canvasConfig.recordPointer.pointerIndex=_p;
                console.log("1 撤消 指针=>",self.canvasConfig.recordPointer.pointerIndex);

                var _newCanvasCode=JSON.parse(data[0].jsonCode);
                canvas.loadFromJSON(_newCanvasCode, function(){
                    canvas.renderAll.bind(canvas);
                    self.componentDraw().reSortComponent(function(){
                        canvas.renderAll();

                        var layerHtmlCode="";
                        if (self.designModule!=""){
                            layerHtmlCode=(data[0].layerHtmlCode);
                            self.layer.render.setLayerHtml({htmlCode:layerHtmlCode,'id':"test"});
                        }


                    });
                });
                
                /*还原更新内部变量*/
                
                //当前模板各单页列表信息
                //self.templateData.templatePages=JSON.parse(data[0].templatePages); 2022-02-23
                
                //模板所有页面json对象数组 已作废
                self.pageArrJson=JSON.parse(data[0].pageArrJson);
                
                //当前页在模板中排序
                self.cunterPage=data[0].cunterPage;
                
                //副本的内部编号
                self.canvasConfig.recordPointer.pointerPageNo=data[0].pageNo;
                
                //分解组合临时变量
                self.undoGroupSource=JSON.parse(data[0].undoGroupSource);
                
                //还原当前页副本集中的内部版本号 更新当前单页内容到对应的副本集
                _parent.updatePageDuplicate(self.canvasConfig.recordPointer.pointerPageNo,_newCanvasCode);
                
                //更新模板本地单页列表
                // var base64=self.canvasSave().canvasBase64();
                var base64="";
                var pageSaveTable={
                    name:self.dbConfig.tempPageSaveTable,
                    type:'readwrite'
                };
                var pageSaveData=[]
                pageSaveData[0]={
                    time:Date.parse(new Date()),
                    UUID:self.canvasConfig.recordPointer.recordUUID,
                    userID:userID,
                    mmCode:self.templateData.mmCode,
                    templateCode:self.templateData.templateCode,
                    pageCode:self.canvasConfig.recordPointer.pointerPageCode,
                    jsonCode:JSON.stringify(_newCanvasCode),
                    preView:base64,
                    status:0
                };
                
                self.localDB.updateRowData(pageSaveTable,"pageCode",_p,self.canvasConfig.recordPointer.pointerPageCode,pageSaveData);
                
            });
            
            

        }
        
        //统一保存操作记录调用
        this.canvasHistoryRecordCall=function(msg=""){

            if (!isEmpty(self.selectedObject)){
                self.canvasDraw().drawSelectedControls();
            }


            _parent.canvasHistoryRecordSave(userID,'editPage',msg);
            self.localDB.deleteAfterData(
                {name:self.dbConfig.historyRecordTable,type:'readwrite'}
                ,"pageNo"
                ,self.canvasConfig.recordPointer.pointerIndex-1
                ,self.canvasConfig.recordPointer.pointerPageNo);
        }
        
        /** 
         * 模板、组件、页面副本存储
         * @ mode 0定时保存，1手工强制保存
         */ 
        this.componentSave=function(parm,mode=0,callback=null){
            
            self.saveStatus=true;
            var _canvasCode=canvas.toJSON( self.canvasConfig.outFiled );
            var canvasCode=JSON.parse(JSON.stringify(_canvasCode));            
            var outObjects=[];
            
            //过滤出血线、页边距 注意：只有保存MM不过滤
            for (var i=0;i<canvasCode.objects.length;i++){

                canvasCode.objects[i].left=(canvasCode.objects[i].left - self.canvasPaddX);
                canvasCode.objects[i].top=(canvasCode.objects[i].top - self.canvasPaddY);
                if (canvasCode.objects[i].hasOwnProperty("dType")){

                    if (canvasCode.objects[i].dType!="referenceLine" 
                        && canvasCode.objects[i].dType!="paperBleed" 
                        && canvasCode.objects[i].dType!="paperBox"  
                        && canvasCode.objects[i].dType!="paperMargins" 
                    ){
                        if (self.disableComponent.indexOf(canvasCode.objects[i].dType)<=-1){
                            outObjects.push(canvasCode.objects[i]);
                        }
                    }
                }

            }
            canvasCode.objects=outObjects;
            canvasCode.width=canvasCode.width - self.canvasPaddX*2;
            canvasCode.height=canvasCode.height - self.canvasPaddY*2;

            var mapParm={};
                mapParm.zoom=parm.zoom;
                mapParm.x=0;
                mapParm.y=0;
                mapParm.width=self.paperSize.bleedWidth;
                mapParm.height=self.paperSize.bleedHeight;
                mapParm.strokeOffset=Math.ceil(parm.zoom);
                mapParm.canvasStroke=parseInt(parm.zoom);

            _parent.canvasBase64(mapParm,canvasCode,thumbnailCanvas,async function(base64){

                    var dataURL=base64;

                    //组装保存内容
                    var mydata={};
                    _parent.updatePageDuplicate(self.canvasConfig.recordPointer.pointerPageNo,canvasCode);
                    

                    //传参副本集
                    mydata.code=parm.code,
                    mydata.type=parm.component.type;
                    mydata.status=1;
                    
                    
                    var jsonCode={};
                    jsonCode.duplicate=self.templateData.cunterPageDuplicate;
                    jsonCode.pageSize={
                        bleed:{
                            left:self.paperSize.bleedLeft,
                            top:self.paperSize.bleedTop,
                            width:self.paperSize.bleedWidth,
                            height:self.paperSize.bleedHeight
                        },
                        margins:{
                            left:self.paperSize.marginLeft,
                            top:self.paperSize.marginTop,
                            width:self.paperSize.marginWidth,
                            height:self.paperSize.marginHeight 
                        },
                        paper:{
                            left:self.paperSize.paperLeft,
                            top:self.paperSize.paperTop,
                            width:self.paperSize.paperWidth,
                            height:self.paperSize.paperHeight 
                        }
                    };
                    
                    mydata.content=jsonCode;
                    
                    (callback && typeof(callback) === "function") && callback(mydata,dataURL);
            });
        }

        this.componentSave_bak=function(parm,mode=0,callback=null){
            
            self.saveStatus=true;
            
            var currentZoom=canvas.getZoom();
            if (currentZoom!=1){
                canvas.viewportTransform[4]=0;
                canvas.viewportTransform[5]=0;
                self.canvasDraw().canvasZoom(1);
            }

            //获取当前画布内容
            var canvasCode=canvas.toJSON( self.canvasConfig.outFiled );
            var outObjects=canvas.getObjects();
            
            //过滤出血线、页边距 注意：只有保存MM不过滤
            for (var i=0;i<outObjects.length;i++){
                //if (outObjects[i].dType=="paperBleed" || outObjects[i].dType=="paperMargins" || outObjects[i].dType=="paperBox" || outObjects[i].dType=="paperSlice"){
                if (self.disableComponent.indexOf(outObjects[i].dType)>-1){
                    canvas.remove(outObjects[i]);
                }else{
                    outObjects[i].set({left:(outObjects[i].left - self.canvasPaddX),top:(outObjects[i].top - self.canvasPaddY)  });
                }
            }
            canvas.renderAll();
            
            //画布转为base64
            var dataURL=canvas.toDataURL('image/jpeg');
                
            //组装保存内容
            var mydata={};
            
            var newCanvasCode=canvas.toJSON( self.canvasConfig.outFiled );
                newCanvasCode.width=self.paperSize.bleedWidth;
                newCanvasCode.height=self.paperSize.bleedHeight;
            _parent.updatePageDuplicate(self.canvasConfig.recordPointer.pointerPageNo,newCanvasCode);
            
            //还原画布内容
            canvas.loadFromJSON(canvasCode,function(){
                canvas.renderAll.bind(canvas);
                self.canvasDraw().canvasZoom(currentZoom);
                canvas.renderAll();
            });

            //传参副本集
            mydata.code=parm.code,
            mydata.type=parm.component.type;
            mydata.status=1;
            
            
            var jsonCode={};
            jsonCode.duplicate=self.templateData.cunterPageDuplicate;
            jsonCode.pageSize={
                bleed:{
                    left:self.paperSize.bleedLeft,
                    top:self.paperSize.bleedTop,
                    width:self.paperSize.bleedWidth,
                    height:self.paperSize.bleedHeight
                },
                margins:{
                    left:self.paperSize.marginLeft,
                    top:self.paperSize.marginTop,
                    width:self.paperSize.marginWidth,
                    height:self.paperSize.marginHeight 
                },
                paper:{
                    left:self.paperSize.paperLeft,
                    top:self.paperSize.paperTop,
                    width:self.paperSize.paperWidth,
                    height:self.paperSize.paperHeight 
                }
            };
            
            mydata.content=jsonCode;
            
            (callback && typeof(callback) === "function") && callback(mydata,dataURL);
        }
        
        //保存模板
        this.templateSave=function(parm,mode=0,callback=null){
            
            self.saveStatus=true;
            var _canvasCode=canvas.toJSON( self.canvasConfig.outFiled );

            var canvasCode=JSON.parse(JSON.stringify(_canvasCode));            
            var outObjects=[];
            
            //过滤出血线、页边距 注意：只有保存MM不过滤
            for (var i=0;i<canvasCode.objects.length;i++){

                canvasCode.objects[i].left=(canvasCode.objects[i].left - self.canvasPaddX);
                canvasCode.objects[i].top=(canvasCode.objects[i].top - self.canvasPaddY);
                if (canvasCode.objects[i].hasOwnProperty("dType")){

                    //if (canvasCode.objects[i].dType=="referenceLine"){
                    if (self.disableComponent.indexOf(canvasCode.objects[i].dType)<=-1){
                        outObjects.push(canvasCode.objects[i]);
                    }

                }

            }
            canvasCode.objects=outObjects;
            canvasCode.width=canvasCode.width - self.canvasPaddX*2;
            canvasCode.height=canvasCode.height - self.canvasPaddY*2;
            //canvasCode.previewUrl="";
            var mapParm={};
                mapParm.zoom=parm.zoom;
                mapParm.x=0;
                mapParm.y=0;
                mapParm.width=self.paperSize.bleedWidth;
                mapParm.height=self.paperSize.bleedHeight;
                mapParm.strokeOffset=Math.ceil(parm.zoom);
                mapParm.canvasStroke=parseInt(parm.zoom);

            _parent.canvasBase64(mapParm,canvasCode,thumbnailCanvas,async function(base64){
                
                _parent.updatePageDuplicate(self.canvasConfig.recordPointer.pointerPageNo,canvasCode);
                //组装保存内容
                var mydata={};
                
                mydata.code=parm.code;
                mydata.status=1;

                mydata.isDelete=0;
                mydata.pageOption=self.canvasConfig.pageOption;
                mydata.pageConfigs=self.canvasConfig.canvasPages;
                
                //组装templatePageList
                var templatePageList=[];
                $.each(self.templateData.templatePages, function(key) {     
                    
                    if (key!=undefined){
                        
                        var tmp={};
                        tmp.code=self.templateData.templatePages[key].pageCode;
                        tmp.content={};
                        tmp.content.duplicate=self.pagesDuplicate[key];
                        tmp.sort=self.templateData.templatePages[key].sort;
                        tmp.storageType=1;
                        tmp.isValid=1;
                        tmp.templateCode=parm.code;
                        tmp.version=self.templateData.templatePages[key].version +1;
                        
                        templatePageList.push(tmp);
                    }
                              
                });  
                
                //已删除页面
                if (isEmpty(self.templateData.deletePagesCode)==false){
                    
                    for (var i=0;i<self.templateData.deletePagesCode.length;i++){
                        
                        var tmp={};
                        tmp.code=self.templateData.deletePagesCode[i];
                        tmp.content={};
                        tmp.content.duplicate=[];
                        tmp.sort=0;
                        tmp.storageType=1;
                        tmp.isValid=0;
                        tmp.templateCode=parm.code;
                        tmp.version=0;
                        templatePageList.push(tmp);
                        
                    }
                    
                }
                
                mydata.templatePageList=templatePageList;
                mydata.version=self.templateData.templateVersion;
                // console.log(mydata.templatePageList);
                (callback && typeof(callback) === "function") && callback(mydata,base64);
                
            })            
            
        }
        
        //定时保存
        this.autoTimeSave=function(parm,callback){
  
            //是否还有副本预览图base64没上传为图片
            // if (!isEmpty(timerProcess) || timeTask.length>1) { 
            if (isEmpty(timerProcess) || timeTask.length==1) {    

                //首页缩略图
                var firstPagePic="";
                
                //获取当前画布内容，组装当前页、当前副本
                var canvasCode=canvas.toJSON( self.canvasConfig.outFiled );
                var canvasObjects=canvasCode.objects;
                var outObjects=[];
                //过滤出血线、页边距 注意：只有保存MM不过滤
                for (var i=0;i<canvasObjects.length;i++){
               
                    if (self.disableComponent.indexOf(canvasObjects[i].dType)>-1){
                 
                    }else{
                        canvasObjects[i].left=canvasObjects[i].left - self.canvasPaddX;
                        canvasObjects[i].top=canvasObjects[i].top - self.canvasPaddY;
                        outObjects.push(canvasObjects[i]);
                    }
                }
                canvasCode.objects=outObjects;
                //当前页副本集
                var pagesDuplicate=self.pagesDuplicate;
                for (var p in pagesDuplicate){
                    /*
                    if (p==0){
                        firstPagePic=pagesDuplicate[0].content.duplicate[0].previewUrl;
                    }*/
                    
                    if (p==self.cunterPage){
                        var tmpDup=pagesDuplicate[p];
                        for (var j in tmpDup){
                            if (tmpDup[j].No+''==canvasCode.No+''){
                                pagesDuplicate[p][j].objects=outObjects;
                            }
                            
                        }
                    }
                }
                
                
                //组装保存内容
                var mydata={};
                mydata.previewUrl=firstPagePic;
                mydata.code=parm.code;
                mydata.status=1;
                mydata.isDelete=0;
                
                //组装templatePageList
                var templatePageList=[];
                $.each(self.templateData.templatePages, function(key) {     
                    
                    if (key!=undefined){
                        
                        var tmp={};
                        tmp.code=self.templateData.templatePages[key].pageCode;
                        tmp.content={};
                        tmp.content.duplicate=pagesDuplicate[key]; //会不会只保存当前副本，还是保存所有副本
                        tmp.sort=self.templateData.templatePages[key].sort;
                        tmp.storageType=0;
                        tmp.isValid=1;
                        tmp.templateCode=parm.code;
                        tmp.version=self.templateData.templatePages[key].version +1;
                        
                        templatePageList.push(tmp);
                    }
                              
                });  
                
                //已删除页面
                if (isEmpty(self.templateData.deletePagesCode)==false){
                    
                    for (var i=0;i<self.templateData.deletePagesCode.length;i++){
                        
                        var tmp={};
                        tmp.code=self.templateData.deletePagesCode[i];
                        tmp.content={};
                        tmp.content.duplicate=[];
                        tmp.sort=0;
                        tmp.storageType=1;
                        tmp.isValid=0;
                        tmp.templateCode=parm.code;
                        tmp.version=0;
                        templatePageList.push(tmp);
                        
                    }
                    
                }
                
                mydata.version=self.templateData.templateVersion;
                mydata.templatePageList=templatePageList;
                (callback && typeof(callback) === "function") && callback(mydata);
            }
        }
        
        //创建当前页面副本
        this.createPageDuplicate=function(callback=null){

            var canvasCode=_parent.screeningDuplicate(canvas.toJSON( self.canvasConfig.outFiled ),self.canvasPaddX,self.canvasPaddY);
            
            //以当前时间做为编号
            canvasCode.No=self.createID();
            
            //新建副本缩略图
            for (key in self.templateData.cunterPageDuplicate){
                if (self.templateData.cunterPageDuplicate[key].isValid==0){
                    canvasCode.previewUrl=self.templateData.cunterPageDuplicate[key].previewUrl;
                }
            }
            
            //新建副本为非主版
            canvasCode.isValid=1;
            
            //追加当前已过滤组件作业画布到当前页面副本集
            self.templateData.cunterPageDuplicate.push(canvasCode);
            
            //更新当前页面所有副本集到模板所有页副本变量集
            self.pagesDuplicate[self.cunterPage]=self.templateData.cunterPageDuplicate;
            
            
            (callback && typeof(callback) === "function") && callback();
        }
    
        //过滤画布偏移量及去除出血线、页边距、纸张、组件位置处理
        this.screeningDuplicate=function(canvasCode,paddX,paddY){
            var outObjects=[];
            for (var i=0;i<canvasCode.objects.length;i++){
                if (canvasCode.objects[i].dType=="BackgroundImage"){
                    canvasCode.objects[i].zIndex=5;
                }
                //if (canvasCode.objects[i].dType!="paperBleed" && canvasCode.objects[i].dType!="paperMargins" && canvasCode.objects[i].dType!="paperBox"){
                    
                    canvasCode.objects[i].left=(canvasCode.objects[i].left - paddX);
                    canvasCode.objects[i].top=(canvasCode.objects[i].top - paddY);
                    outObjects.push(canvasCode.objects[i]);
                    
                //}
            }
            canvasCode.objects=outObjects;
            canvasCode.width=canvasCode.width - paddX *2;
            canvasCode.height=canvasCode.height - paddY *2;
            return canvasCode;
        }
    
        //切换当前页副本
        this.cutoverPageDuplicate=function(parm=null,callback=null){
         
            var cutoverPage=null;
            if (parm.pageSort || parm.pageSort===0){
                cutoverPage=parm.pageSort;
            }
            
            //切换前页码
            var cunterPage=self.cunterPage;
            
            if (parm.parentCanvas){
                canvas=parm.parentCanvas;
            }
            
            if (!parm.hasOwnProperty("isReload")){
                //保存当前画布所在页到副本集
                var workCanvas=_parent.screeningDuplicate(canvas.toJSON( self.canvasConfig.outFiled ),self.canvasPaddX,self.canvasPaddY);
            }else{
                var workCanvas=parm.canvasCode;
            }

            _parent.canvasSave().updatePageDuplicate(self.canvasConfig.recordPointer.pointerPageNo,workCanvas,async function(){
                //self.drawing=false;

                //更新当前作业画布页码
                self.canvasConfig.recordPointer.pointerPageCode=parm.pageCode;
                
                //更新当前作业画布内容为新切换页内容
                for (var p=0;p<self.pagesDuplicate.length;p++){
                    var _pagesDuplicate=self.pagesDuplicate[p];
                    for (var d=0;d<_pagesDuplicate.length;d++){

                            if (_pagesDuplicate[d].pageCode==parm.pageCode && _pagesDuplicate[d].isValid==0 ){
                                self.templateData.cunterPageDuplicate=self.pagesDuplicate[p];
                     
                            }

                    }
                }
             
               
                //计算当前页PageNo组件页码
                var tmpOption=self.canvasConfig.pageOption;
                var slicesPage=self.canvasConfig.slicesPage;


                //作业画布内容更新
                for (key in self.templateData.cunterPageDuplicate){
             
                    if (self.templateData.cunterPageDuplicate[key].No*1==parm.No*1){
              
                        //获取副本内容
                        var newCanvasCode=self.templateData.cunterPageDuplicate[key];
                        newCanvasCode.width=self.paperSize.bleedWidth;
                        newCanvasCode.height=self.paperSize.bleedHeight;
                        
                        //更新历史指针副本当前编号
                        self.canvasConfig.recordPointer.pointerPageNo=parm.No;
                        console.log("更新历史指针副本当前编号=>"+parm.No);
                        //更改当前副本为主版本
                        self.templateData.cunterPageDuplicate[key].isValid=0;
                        
                        self.localDB.getKeyData({
                                    name: self.dbConfig.historyRecordTable,
                                    type: 'readonly'}
                        ,"UUID",self.canvasConfig.recordPointer.pointerPageNo,(999),function(data,_pMax){
                            console.log("_pMax",self.cunterPage,_pMax);
                            //2022-02-21增加 _pMax 是否有数据
                            if (_pMax>-1){
                           
                                self.canvasConfig.recordPointer.pointerIndex=_pMax;
                            }else{
                                self.canvasConfig.recordPointer.pointerIndex=-1;
                            }
                            
                            if (self.canvasConfig.recordPointer.pointerIndex>0){
                                document.getElementById(self.pageEventObject.unDo.id).classList.remove(self.pageEventObject.unDo.disableClass[0]);
                            }else{
                                document.getElementById(self.pageEventObject.unDo.id).classList.add(self.pageEventObject.unDo.disableClass[0]);
                            }
                            document.getElementById(self.pageEventObject.toDo.id).classList.add(self.pageEventObject.toDo.disableClass[0]);
                            
            
                        });
                        
              
                        //更新画布
                        newCanvasCode.width=newCanvasCode.width + self.canvasPaddX*2;
                        newCanvasCode.height=newCanvasCode.height + self.canvasPaddY*2;
                        
                        //更新副本对象位置
                        var canvasObjects=newCanvasCode.objects;
                        
                        var updateObjects=[];
                        
                        //存储辅助线
                        var referenceLineArr=[];

                        var _zIndex=1;
                        var minLyaer=self.minLayer + 2;
                        for (var i=0;i<canvasObjects.length;i++){
                      
                            if (canvasObjects[i].dType!="paperBleed" && canvasObjects[i].dType!="paperMargins" && canvasObjects[i].dType!="paperBox" && canvasObjects[i].dType!="paperSlice" && canvasObjects[i].dType!="alignmentLine"){
                                
                                canvasObjects[i].left=canvasObjects[i].left + self.canvasPaddX;
                                canvasObjects[i].top=canvasObjects[i].top + self.canvasPaddY;

                                if(canvasObjects[i].dType!="BackgroundImage"){    
                                    canvasObjects[i].zIndex=minLyaer + _zIndex;
                                    _zIndex++;
                                }else{
                                    canvasObjects[i].zIndex=4;
                                }
                                
                                
                                
                                //这里对页码计算数值
                                if (canvasObjects[i].dType=="PageNo"){
                                    var pnIndex=0;
                                    if (canvasObjects[i].hasOwnProperty("pnIndex")){
                                        pnIndex=canvasObjects[i].pnIndex*1;
                                    }

                                    if (!canvasObjects[i].hasOwnProperty("id")){
                                        canvasObjects[i].id=self.createID();
                                    }

                                    
                                    canvasObjects[i].text="P" + (cutoverPage * slicesPage.length + slicesPage[pnIndex]);
                                }else if (canvasObjects[i].dType=="BackgroundImage"){
                                    if (canvasObjects[i].zIndex>10){
                                        canvasObjects[i].zIndex=10;
                                    }
                                }                          

                                updateObjects.push(canvasObjects[i]);
                            }
                        }
                        
                        updateObjects.sort((a,b)=>{
                            return a.zIndex -  b.zIndex
                        });  

                        newCanvasCode.objects=updateObjects;
                      
                        updateObjects=null;
                        canvas.loadFromJSON(newCanvasCode,function(){ 
           
                            canvas.renderAll.bind(canvas);
                            
                            //重新获取加载组件
                            var canvasObjects=canvas.getObjects();
                        
                            /* 绘制出血线、页边距、背景图处理  */
                            
                            //是否设置背景，是纸张透明或白色底图
                            var parm=null;
                            var hasBg=true;
                            if (self.canvasDraw().isDrawBackgroundImage(canvasObjects)){
                                var BackgroundImage=self.canvasDraw().searchObject({id:"BackgroundImage"},canvasObjects);
                                if (BackgroundImage!=false){
                                    if (!isEmpty(BackgroundImage.src)){
                                        parm={src:BackgroundImage.src};
                                        //找到背景图
                                        hasBg=true;
                                        BackgroundImage.moveTo(3);
                                    }
                                    
                                }else{
                                    //没有背景图
                                    hasBg=false;
                                } 
                            }else{
                                //没有背景图
                                // self.canvasDraw().drawBackgroundImage();
                                hasBg=false;
                            }

                            
                            if (canvasObjects.length==0){
                                self.canvasDraw().drawBackgroundImage();
                            }
                            
                            var paperBleed=self.canvasDraw().searchObject({id:"paperBleed"},canvasObjects);
                            if (paperBleed==false){
                                self.canvasDraw().insertBleed(parm);
                            }
                            
                            var paperBox=self.canvasDraw().searchObject({id:"paperBox"},canvasObjects);
                            if (paperBox==false){
                                self.canvasDraw().insertPaper(parm);
                            }
                            
                            var paperMargins=self.canvasDraw().searchObject({id:"paperMargins"},canvasObjects);
                            if (paperMargins==false){
                                self.canvasDraw().insertMargins(parm);
                            }
                            
                            canvas.renderAll();
                            
                            //如果是mm模式 同步商品组件更新mm商品dsort对应信息 152
                            if (self.designModule=="mm"){
                                var objs = canvas.getObjects();
                                self.canvasDraw().updatePageProduct(objs,cutoverPage,0);
                                if (!hasBg){
                                    //self.canvasDraw().drawBackgroundImage();
                                }
                            }else{
                                if (!hasBg){
                                    //self.canvasDraw().drawBackgroundImage();
                                }
                                self.componentDraw().resetView(async function(){
                                    self.switchPage=true;
                                });
                            }

                            if (self.canvasConfig.recordPointer.pointerIndex==-1){

                                var loadPageTimer=setInterval(function(){

                                    var tmpObjs=canvas._objects;
                                    if (tmpObjs.hasOwnProperty("length")){
                                        var objlen=tmpObjs.length;
                                        if (objlen>=newCanvasCode.objects.length + 3){
                                            //初始化 init加载打开模板页后生成原史记录
                                            self.canvasSave().canvasHistoryRecordSave(userID,'loadPage','Load file');
                                            clearInterval(loadPageTimer);
                                        }
                                    }
                                    
                                }, 1000);
                                
                            }
                            
                            //切换副本后，显示页面属性面板
                            self.pageEvent.showBackgroundImage();
                            
                            (callback && typeof(callback) === "function") && callback();
                            
                            
                        });
                        
                        break;
                        
                    }else{
                        self.templateData.cunterPageDuplicate[key].isValid=1;
                    }
                    
                }





            });
            



        }
        
        //删除指定页指定副本编号
        this.deletePageDuplicate=function(parm=null,callback=null){
            
            //只有一页不能删除
            if (self.pagesDuplicate[parm.pageSort].length==1){
                (callback && typeof(callback) === "function") && callback(false);
            }else{
                
                //如果删除是当前页,删除当前页编辑副本集
                if (parm.pageSort==self.cunterPage){
                    var currentDup=self.templateData.cunterPageDuplicate;
                    for (var i=0;i<currentDup.length;i++){
                        if (currentDup[i].No==parm.pageNo){
                            
                            if (currentDup[i].isValid==0){
                                //主副本不能删除
                                (callback && typeof(callback) === "function") && callback(false);
                                return;
                            }else{
                                currentDup.splice(i,1);
                                break;
                            }
                            
                        }
                    }
                    
                    self.templateData.cunterPageDuplicate=currentDup;
                }
            
                //删除模板页副本集
                var templateDup=self.pagesDuplicate[parm.pageSort];
                for (var i=0;i<templateDup.length;i++){
                    
                    if (templateDup[i].No==parm.pageNo){
                        
                        if (templateDup[i].isValid==0){
                            //主副本不能删除
                            (callback && typeof(callback) === "function") && callback(false);
                        }else{
                            templateDup.splice(i,1);
                        }
                        
                    }
                    
                }
                
                self.pagesDuplicate[parm.pageSort]=templateDup;
                (callback && typeof(callback) === "function") && callback(true);
            }
        }
        
        //获取画布base64图片
        this.canvasBase64=function(parm=null,pageJson=null,viewCanvas,callback=null){

            var preZoom=1;
            if(parm.zoom){
                //是否缩放戴图
                preZoom=parm.zoom;
            }
            
            //如果pageJson==null从模板副集取，非null从外部入参
            if (pageJson==null){
                //从这里遍历取
            }
            
            viewCanvas.setWidth(parm.width);
            viewCanvas.setHeight(parm.height);
            
            //缩放画布
            if (preZoom!=1){
                viewCanvas.setZoom(preZoom);
                viewCanvas.renderAll();
            }
            
            var strokeOffset=0;
            var canvasStroke=0;
            if (parm.hasOwnProperty("strokeOffset")){
                strokeOffset=parm.strokeOffset;
            }
            if (parm.hasOwnProperty("canvasStroke")){
                canvasStroke=parm.canvasStroke;
            }
            
            viewCanvas.loadFromJSON(pageJson,function(){ 
                
                viewCanvas.renderAll.bind(viewCanvas);
                
                //画布转为base64
                var dataURL = viewCanvas.toDataURL({
                  format: 'image/jpeg', // jpeg或png
                  quality: 1, // 图片质量，仅jpeg时可用
                  // 截取指定位置和大小
                  left: parm.x + strokeOffset, 
                  top: parm.y + strokeOffset,
                  width: parm.width  * preZoom - canvasStroke,
                  height: parm.height * preZoom - canvasStroke
                });
                
                (callback && typeof(callback) === "function") && callback(dataURL);
                
            });
        }
        
        return this;
    }
    
    //获取页面顶层对象数量
    self.getCanvasObjCount=function(){
        var jsonData = (canvas.toJSON( ['id','zIndex'] )); 
        var allObj=jsonData.objects;

        allObj.sort((a,b)=>{
            return a.zIndex -  b.zIndex
        });

        var lastzIndex=allObj[allObj.length-1].zIndex;

        if (isNaN(lastzIndex)){

            if (canvas.getObjects().length){
                lastzIndex=canvas.getObjects().length + 1;
            }else{
                lastzIndex=11;
            }

        }


        if (lastzIndex<=10){
            return 11;
        }else {
            return (lastzIndex + 1);
        }
        // return allObj.length;
    }

    
    //生成画布对象名称，以类型排序规则
    self.createTypeIndex=function(t){
        var _dTypeIndex=0;
        // var jsonData = (canvas.toJSON( ['id','type','dType'] )); 
        var objects=canvas.getObjects();
        if (objects.length>=1){
            for (key in objects){
                if(t==objects[key].dType){
                    if (_dTypeIndex<objects[key].dtypeIndex*1){
                        _dTypeIndex=objects[key].dtypeIndex*1;
                    }
                }
            }
        }
        return (_dTypeIndex+1);
    }
    
    //生成对象ID
    self.createID=function(){
        return Date.parse(new Date()) + '' + (Math.round(Math.random() * 10000));
    }
    
    self.eachObjectsCreateID=function(objects,callback=null){
        
        if (isEmpty(objects)==false){
            
            for (var i=0;i<objects.length;i++){
                
                if (objects[i].type=="group"){
                    
                    objects[i].id=self.createID();
                    objects[i]=self.eachObjectsCreateID(objects[i]);
                    
                }else{
                    if (objects[i].hasOwnProperty("id")){
                        objects[i].id=self.createID();
                    }
                }
            }
            return objects;
        }else{
            return objects;
        }
        
    }
    
    //生成历史记录UUID
    self.createUUID=function(){
        var mydate=new Date();
        return ("JC"+mydate.getDay()+ mydate.getHours()+ mydate.getMinutes()+mydate.getSeconds()+mydate.getMilliseconds()+ Math.round(Math.random() * 10000));
    
    }

    //生成特定对象png图
    self.createObjectPng=function (obj,callback=null){
 
        var pi=2;
        if (obj.scaleX<1){
            var outWidth=obj.width * pi;
            var outHeight=obj.height * pi;
            
        }else{
            var outWidth=obj.width * pi;
            var outHeight=obj.height * pi;
        }

        
        if (outWidth<canvas.width){
            outWidth=canvas.width;
        }
        if (outHeight<canvas.height){
            outHeight=canvas.height;
        }

        thumbnailCanvas.setWidth(outWidth);
        thumbnailCanvas.setHeight(outHeight);
        thumbnailCanvas.setZoom(1);

        thumbnailContext.clearRect(0, 0, outWidth,outHeight);
        thumbnailCanvas.renderAll(); 

        //阴影偏移量处理
        var shawParm={};
            shawParm.offsetX=obj.shadow.offsetX;
            shawParm.offsetY=obj.shadow.offsetY;

        var jsonData = (thumbnailCanvas.toJSON( self.canvasConfig.outFiled )); 
        var objJson=jsonData.objects;
        objJson[0]=obj;
        jsonData.objects=objJson;
        
        if (obj.type=="image"){    
            thumbnailCanvas.loadFromJSON(jsonData, function(){

                setTimeout(function() {
                    
                    if (shawParm.offsetX<0){
                        var clipOffsetX=shawParm.offsetX;
                    }else{
                        var clipOffsetX=0;
                    }

                    if (shawParm.offsetY<0){
                        var clipOffsetY=shawParm.offsetY;
                    }else{
                        var clipOffsetY=0;
                    }
                    var tmpObj=thumbnailCanvas._objects;
                    var tmpLeft=tmpObj[0].left;
                    var tmpTop=tmpObj[0].top;
                    tmpObj[0].set({
                        left:(200),
                        top:(200),
                    });

                    tmpObj[0].scale(1);

                    var pngWidth=(tmpObj[0].width + Math.abs(shawParm.offsetX));
                    var pngHeight=(tmpObj[0].height + Math.abs(shawParm.offsetY));

                    var dataURL = thumbnailCanvas.toDataURL({
                      format: 'image/png', // jpeg或png
                      quality: 1, // 图片质量，仅jpeg时可用
                      // 截取指定位置和大小
                      left: (tmpObj[0].left + clipOffsetX), 
                      top:(tmpObj[0].top + clipOffsetY),
                      width: pngWidth,
                      height: pngHeight,
                      multiplier:1
                    });

                    (callback && typeof(callback) === "function") && callback(dataURL);
                },2000);
            });

        }else if (obj.type=="textbox"){

            var parm={};
                parm.text=obj.text;
                parm.fontFamily=obj.fontFamily;
                parm.fontSize=obj.fontSize;
                parm.lineHeight=obj.lineHeight;
                parm.fill=obj.fill;
                parm.left=obj.left;
                parm.top=obj.top;
                parm.width=obj.width;
                parm.height=obj.height;
                parm.scaleX=obj.scaleX;
                parm.scaleY=obj.scaleY;
                parm.shadow=obj.shadow;
                parm.strokeWidth=obj.strokeWidth;
                parm.fontWeight=obj.fontWeight;
                parm.fontStyle=obj.fontStyle;
                parm.textAlign=obj.textAlign;
                parm.stroke=obj.stroke;
                parm.charSpacing=obj.charSpacing;

                var shawParm=obj.shadow;
                if (shawParm.offsetX<0){
                    var clipOffsetX=shawParm.offsetX;
                }else{
                    var clipOffsetX=0;
                }

                if (shawParm.offsetY<0){
                    var clipOffsetY=shawParm.offsetY;
                }else{
                    var clipOffsetY=0;
                }

            var textObj=new fabric.Textbox(parm.text, { 
              fontFamily: parm.fontFamily, 
              fontSize: (parm.fontSize),  
              lineHeight:parm.lineHeight,
              fill:parm.fill,
              left:parm.left,
              top: parm.top,
              zIndex:1,
              text:parm.text,
              textAlign:parm.textAlign,
              fontStyle:parm.fontStyle,
              fontWeight:parm.fontWeight,
              charSpacing:parm.charSpacing,
              editable:false,
              width:140,
              stroke:parm.stroke,
              strokeWidth: parm.strokeWidth,
              shadow:parm.shadow,
              scaleX:3,
              scaleY:3
             }); 
             
             thumbnailCanvas.add(textObj).renderAll();
             var pngWidth=Math.round(textObj.width + Math.abs(shawParm.offsetX) * 3 + textObj.width * 2 );
             var pngHeight=Math.round(textObj.height + Math.abs(shawParm.offsetY) * 3 + textObj.height * 2);
             var dataURL = thumbnailCanvas.toDataURL({
              format: 'image/png', // jpeg或png
              quality: 1, // 图片质量，仅jpeg时可用
              // 截取指定位置和大小
              left: (textObj.left + clipOffsetX), 
              top:(textObj.top + clipOffsetY),
              width: pngWidth,
              height: pngHeight,
              multiplier:1
            });

            (callback && typeof(callback) === "function") && callback(dataURL,pngWidth,pngHeight);


        }



    }

    //计算文本实际占用宽/高 =>内容+字体+字号
    self.computeFontSize=function(strText, size, family,lineWidth,thumbnailCanvas,thumbnailContext,callback=null){

        thumbnailCanvas.setZoom(1);
        thumbnailCanvas.clear();
        thumbnailContext.clearRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        thumbnailCanvas.renderAll(); 
        
        var strLen=strText.length;
        if (strText.indexOf(".")>-1){
            strText="8.";
            for (var i=2;i<strLen;i++){
                strText=strText + "8";
            }
        }else{
            strText="";
            for (var i=0;i<strLen;i++){
                strText=strText + "8";
            }
        }
        console.log(strText);
        var startTop=10;
        var startLeft=10;
        
        var textObj=new fabric.IText(strText, {
          fontSize: size, 
          fontFamily:family,
          fill:"#000000",
          left:startTop,
          top: startLeft,
          lineHeight:1,
          zIndex:1,
          id:"adtest",
          text:strText,
          dType:"text",
          strokeWidth: 0,
          paintFirst:'stroke',
          //先绘制描边还是填充，默认fill,先绘制填充添加的描边是内描边,修改stroke，将变成外描边
          splitByGrapheme:false
          //禁止自动换行
         }); 
    

        var configParma={};
        configParma.left=10;
        configParma.top=10;
        configParma.lockScalingX=true;
        configParma.lockScalingY=true;

        configParma.zIndex=2;
        //附加在标签前文本
        configParma.id="getXY";
    
         var group = new fabric.Group([textObj], configParma); 
         thumbnailCanvas.add(group).renderAll();

         var res=self.getVisiblePixelsBoundingBox(thumbnailContext,group.left,group.top,group.width,group.height);
     
         var new_y2=group.height/2 - (group.height - res.y1);
         var new_y1=group.height/2 - (group.height - res.y2);

         (callback && typeof(callback) === "function") && callback(res);


    }


    //模拟计算划线价样式
    self.getVisiblePixelsBoundingBox=function (thumbnailContext,x1,y1,w,h) {

        w=parseInt(w);
        h=parseInt(h);

        const imageData = thumbnailContext.getImageData(x1,y1,w, h).data;
        let minX = -1, minY = -1, maxX = 0, maxY = 0;
        var pointArr=[];
        var subGroupLength=4 * w;
  
        var p=[];
        for (var _y=0;_y<h;_y++){
            p[_y]=[];
            for (var _x=0;_x<w;_x++){
                //第_x行第_y列的像素
                var pi=_x * w + _y;
                var r=imageData[4 * pi +0]*1;
                var g=imageData[4 * pi +1]*1;
                var b=imageData[4 * pi +2]*1;
                var a=imageData[4 * pi +3]*1;
                // if (minY==-1 && (r+g+b))
                p[_y].push([r,g,b,a]);
                
                if (a>0 && minX==-1){
                    minX=_x;
                }else if (a>0 && minX>-1){
                    if (minX>_x){
                        minX=_x;
                    }
                }
                
                if (a>0 && minY==-1){
                    minY=_y;
                }else if (a>0 && minY>-1){
                    if (minY>_y){
                        minY=_y;
                    }
                }
                
                if (a>0 && maxX<_x){
                    maxX=_x;
                }
                
                if (a>0 && maxY<_y){
                    maxY=_y;
                }
                
            }
            
        }
        
        /*let index = 0;
        while(index < imageData.length) {
            //一行一行的分割
            pointArr.push(imageData.slice(index, index += subGroupLength));
        }
        
        for (var i=0;i<h;i++){
            
            var _str=pointArr[i].toString();
            console.log(_str);
            console.log(i + " =============");

            if (_str.length!=pointArr[i].length*2-1){
                minY =i;
                break;
            }
            
        }

        for (var i=h-1;i>1;i--){
            if (pointArr[i]!=null){
                var _str=pointArr[i].toString();
                console.log(_str);
                console.log(i + " >>>>>>>>>>>>>>");

                if (_str.length!=pointArr[i].length*2-1){
                    maxY = i;
                    break;
                }

            }
        }
        
        if (minY>=maxY){
            maxY=minY+h;
        }*/

        return {
            x1:(x1 + minX/2),
            y1:(y1 + minY),
            x2:w,
            y2:maxY,
            w:(w),
            h:(maxY-minY)
        };
    }
    
    
    
    
    //计算文本实际占用宽/高 =>内容+字体+字号
    self.computeFontSize_bak_20230512=function(strText, size, family,lineWidth,thumbnailCanvas,thumbnailContext,callback=null){

        thumbnailCanvas.setZoom(1);
        thumbnailCanvas.clear();
        thumbnailContext.clearRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        thumbnailCanvas.renderAll(); 

        var textObj=new fabric.IText(strText, {
          fontSize: size, 
          fontFamily:family,
          fill:"#333333",
          left:10,
          top: 10,
          lineHeight:1,
          zIndex:1,
          id:"adtest",
          text:strText,
          dType:"text",
          strokeWidth: 0,
          paintFirst:'stroke',
          //先绘制描边还是填充，默认fill,先绘制填充添加的描边是内描边,修改stroke，将变成外描边
          splitByGrapheme:false
          //禁止自动换行
         }); 

        var x1,y1,x2,y2;
            x1=textObj.left;
            y1=textObj.top + textObj.fontSize - (textObj.height - textObj.fontSize)/1;
            x2=textObj.left + textObj.width;
            y2=y1-0;

        var line = new fabric.Line(
            [x1, y1, x2, y2], 
            {
                fill: '#333333',
                fillCmyk:"100,100,100,100",
                stroke: '#333333',
                strokeCmyk:"100,100,100,100",
                visible:true,
                angle:0,
                originX:"center",
                oringY:"center",
                strokeWidth:lineWidth
        });
  
        var configParma={};
        configParma.left=10;
        configParma.top=10;
        configParma.lockScalingX=true;
        configParma.lockScalingY=true;

        configParma.zIndex=2;
        //附加在标签前文本
        configParma.id="getXY";
         
         var group = new fabric.Group([textObj,line], configParma); 
         thumbnailCanvas.add(group).renderAll();

         var res=self.getVisiblePixelsBoundingBox(thumbnailContext,group.left,group.top,group.width,group.height);
     
         var new_y2=group.height/2 - (group.height - res.y1);
         var new_y1=group.height/2 - (group.height - res.y2);

         (callback && typeof(callback) === "function") && callback(res);


    }


    //模拟计算划线价样式
    self.getVisiblePixelsBoundingBox_bak_20230512=function (thumbnailContext,x1,y1,w,h) {

        w=parseInt(w);
        h=parseInt(h);

        const imageData = thumbnailContext.getImageData(x1,y1,w, h).data;
        let minX = 0, minY = 0, maxX = w, maxY = h;
        var pointArr=[];
        var subGroupLength=4 * w;

        let index = 0;
        while(index < imageData.length) {
            pointArr.push(imageData.slice(index, index += subGroupLength));
        }

        for (var i=0;i<h;i++){
            
            var _str=pointArr[i].toString();

            /*if (_str.indexOf("51")!==-1){
                minY =i;
                break;
            }*/

            if (_str.length!=pointArr[i].length*2-1){
                minY =i;
                break;
            }
            
        }

        for (var i=h-1;i>1;i--){
            if (pointArr[i]!=null){
                var _str=pointArr[i].toString();
                /*
                if (_str.indexOf("51")!=-1){
                    maxY = i;
                    break;
                }*/
                
                if (_str.length!=pointArr[i].length*2-1){
                    maxY = i;
                    break;
                }

            }
        }
        
        if (minY>=maxY){
            maxY=minY+h;
        }

        return {
            x1:x1,
            y1:minY,
            x2:w,
            y2:maxY,
            w:(w-x1),
            h:(maxY)
        };
    }
    
    
    
        
    function group(array, subGroupLength) {
          let index = 0;
          let newArray = [];
          while(index < array.length) {
              newArray.push(array.slice(index, index += subGroupLength));
          }
          return newArray;
    }
    
    /**
     *  邦定回调外部页面元素事件类操作
     */ 
    self.pageEvent={
        
        //打开当前页图层面板窗口 (外部重定义function,这里不能删除)
        openPageLevel:function(parm=null,callback=null){
            (callback && typeof(callback) === "function") && callback();
        },

        //打开指定选择窗
        openWindow:function(parm=null){},
        
        //刷新图层面板内容 (外部重定义function,这里不能删除)
        refreshLevel:function(parm=null,callback=null){},
        
        //编辑分组页面元素事件
        editGroup:function(){},
        
        //选择对象创建组页面元素事件
        composeGroup:function(){},
        
        //普通文本页面元素属性
        textBoxAttributes:function(){},
        
        //划线文本页面元素属性
        underlineTextAttributes:function(){},

        //形状、SVG页面元素属性
        shapeAttributes:function(){},
        
        //图片类页面元素属性
        pictureAttributes:function(){},
        
        //ICON类页面元素属性
        iconElementAttributes:function(){},

        //普通组页面属性
        groupAttributes:function(){},
        
        //商品图片类页面属性 GoodsImage、Icon、Brand
        productPictureAttributes:function(){},
        
        //商品组件页面属性
        productAttributes:function(){},
        
        //页面背景属性显示
        showBackgroundImage:function(){},

        //在画布浮动标示信息
        showAttributesTip:function(mode,pointer,msgText){},

        //提示框
        errMsg:function(msgText){}
    
    };


    //图层管理
    self.layer={

        //数据渲染类
        render:{

            //切换页面获取最新画布组件
            cutoverPageLayer:function(){},

            //根据组件数据转为图层结构数据
            objectToLayer:function(canvasObjects,deep=0){},

            //根据图层结构数据渲染图层HTML面板
            renderLayerHtml:function (parm=null,callback=null){},
            
            //获取图层面板HTML
            getLayerHtml:function(){},

            //重设图层面板HTML
            setLayerHtml:function(){},


        },
        //面板鼠标操作类
        mouseOperation:{

            //分组伸缩事件
            menuAdjustable:function(){},

            //component选择
            componentChoose:function(){},

            //Group组选择
            groupChoose:function(){},

        },

        //canvas 
        canvasOperation:{

            //通过图层菜单选中画布中的组件
            setActiveObject:function(parm=null){},
            
            //画布选中组件时，设置图层面板对应的图层设为选中状态
            chooseLayer:function(){},
        },

        //sortable
        sortEvent:{

            sortInit:function(){},

        },

        proto:{

            find:function(parm){},

        },

    };

}