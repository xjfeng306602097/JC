/**

 @Name：makro 
 @Author：makro
 @Site：http://mm.makro.com/makroDigital/marketingComponent/design
    
 */
//引入设计页模块JS
var canvas, context, _JC, _CMYK, _DB, userID, slider, lockStatus,mmDetailsData,designFont,designerConfig,myColorData,myTextStyle,allFonts,loadObject,timer,timerProcess,loadDbTimer;

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
    coloreditor: '../layui_exts/coloreditor/coloreditor',
}).use(['index', 'form', 'laydate', 'table', 'layer', 'slider', 'upload', 'uploadAPI', 'dict', 'dropdown', 'coloreditor'], function() {
    var $ = layui.$,
        setter = layui.setter,
        form = layui.form,
        laydate = layui.laydate,
        table = layui.table,
        slider = layui.slider,
        upload = layui.upload,
        uploadAPI = layui.uploadAPI,
        dict = layui.dict,
        element = layui.element, 
        coloreditor = layui.coloreditor,
        layer = layui.layer; 

     //全屏模式
    parent.layui.admin.sideFlexible('null'); 

    //页面划线文本select值修改监听处理
    form.on('select(underlineTextFont)', function (data) { 

        //触发内容
        if (_JC.cunterObj.dType=="productPriceGroup"){
   
            //划线文本组件属性显示
            if (_JC.cunterObj._objects[0].type=="i-text"){
                var _textObj=_JC.cunterObj._objects[0];
                var _lineObj=_JC.cunterObj._objects[1]; 
                var _textIndex=0,_lineIndex=1;
            }else{
                var _textObj=_JC.cunterObj._objects[1];
                var _lineObj=_JC.cunterObj._objects[0];
                var _textIndex=1,_lineIndex=0;
            }

            if (_JC.cunterObj.item(_textIndex).fontFamily!=data.value){
                _JC.cunterObj.item(_textIndex).set({fontFamily:data.value});
                canvas.renderAll();
                _JC.componentDraw().updateProductLineText();
             
            }

            //检查该字体样式，B、I、BI控制是否可选样式
            if (data.value!="freeserif"){
                if (designFont[data.value].regular==true){
                    $(".layui-fontStyle.Regualar").removeClass("noneClick");
                }else{
                    $(".layui-fontStyle.Regualar").addClass("noneClick");
                }
                if (designFont[data.value].bold==true){
                    $(".layui-fontStyle.Bold").removeClass("noneClick");
                }else{
                    $(".layui-fontStyle.Bold").addClass("noneClick");
                    if (_JC.cunterObj.item(_textIndex).fontWeight=="bold"){
                        _JC.cunterObj.item(_textIndex).set({fontWeight:"normal"});
                        $(".layui-fontStyle.Bold").removeClass("act");
                        $(".layui-fontStyle.Regualar").addClass("act");
                    }
                }
                if (designFont[data.value].italics==true){
                    $(".layui-fontStyle.Italic").removeClass("noneClick");
                }else{
                    $(".layui-fontStyle.Italic").addClass("noneClick");
                    if (_JC.cunterObj.item(_textIndex).fontStyle=="italic"){
                        _JC.cunterObj.item(_textIndex).set({fontStyle:"normal"});
                        $(".layui-fontStyle.Italic").removeClass("act");
                    }
                }                
            }else{
                $(".layui-fontStyle.Regualar,.layui-fontStyle.Italic,.layui-fontStyle.Bold").removeClass("noneClick");
            }
    

        }

   });

    //页面普通文本select值修改监听处理
    form.on("select(textFont)", function(data) {
 
        var _name = data.elem.name;
        switch (_name) {
            case "textFont":

                if (_JC.cunterObj!=null){

                    if (_JC.cunterObj.type=="textbox"){
                        
                        _JC.cunterObj.set({fontFamily:data.value});
                        canvas.renderAll();
                        
                        if (_JC.cunterObj.hasOwnProperty("preFont")){
                            delete _JC.cunterObj.preFont;
                        }

                        //检查该字体样式，B、I、BI控制是否可选样式
                        if (data.value!="freeserif"){
                            if (designFont[data.value].regular==true){
                                $(".layui-fontStyle.Regualar").removeClass("noneClick");
                            }else{
                                $(".layui-fontStyle.Regualar").addClass("noneClick");
                            }

                            if (designFont[data.value].bold==true){
                                $(".layui-fontStyle.Bold").removeClass("noneClick");
                            }else{
                                $(".layui-fontStyle.Bold").addClass("noneClick");
                                if (_JC.cunterObj.fontWeight=="bold"){
                                    _JC.cunterObj.fontWeight="normal";
                                    $(".layui-fontStyle.Bold").removeClass("act");
                                    $(".layui-fontStyle.Regualar").addClass("act");
                                }
                            }
                            if (designFont[data.value].italics==true){
                                $(".layui-fontStyle.Italic").removeClass("noneClick");
                            }else{
                                $(".layui-fontStyle.Italic").addClass("noneClick");
                                if (_JC.cunterObj.fontStyle=="italic"){
                                    _JC.cunterObj.fontStyle="normal";
                                    $(".layui-fontStyle.Italic").removeClass("act");
                                }
                            }                
                        }else{
                            $(".layui-fontStyle.Regualar,.layui-fontStyle.Italic,.layui-fontStyle.Bold").removeClass("noneClick");
                        }

                    }else if (_JC.cunterObj.type=="activeSelection"){

                        if (_JC.cunterObj.hasOwnProperty("_objects")){
                           
                            for (var i=0;i<_JC.cunterObj._objects.length;i++){

                                if (_JC.cunterObj._objects[i].hasOwnProperty("preFont")){
                                    delete _JC.cunterObj._objects[i].preFont;
                                }

                                if (_JC.cunterObj._objects[i].hasOwnProperty("type")){

                                    if (_JC.cunterObj._objects[i].type=="textbox" || _JC.cunterObj._objects[i].type=="i-text" ){

                                        _JC.cunterObj._objects[i].set({fontFamily:data.value});

                                    }

                                }
                            }

                            //事务描述
                            var msg="Edit element";
                            _JC.canvasSave().canvasHistoryRecordCall(msg);

                        }

                    }

                }else if (_JC.cunterObj==null && _JC.selectedObject!=null){

                    if (_JC.selectedObject.length>1){
                        var composingObject=_JC.selectedObject;
                    }else{
                        var composingObject=_JC.selectedObject[0]._objects;
                    }

                    for (var i=0;i<composingObject.length;i++){
                        if (composingObject[i].hasOwnProperty("preFont")){
                            delete composingObject[i].preFont;
                        }

                        composingObject[i].set({fontFamily:data.value});
                    }

                    //事务描述
                    var msg="Edit element";
                    _JC.canvasSave().canvasHistoryRecordCall(msg);

                }

                canvas.renderAll();
            break;
        }
    }); 
    

    //鼠标滑过字体菜单option选项时，被选文本模拟当前option字体效果
    $('.preViewFont').on('mouseenter', '.layui-form-selected dl dd', function (obj) {
        var preSize=$(this).parent().parent().parent().parent().find("input[name=textSize]").val();
        var preViewFont=obj.target.attributes[0].value;
        if (_JC.cunterObj.type=="textbox"){
            _JC.cunterObj.set({fontFamily:preViewFont,fontSize:preSize});
            canvas.renderAll();
        }else if (_JC.cunterObj.type=="group" && _JC.cunterObj.dType=="productPriceGroup"){


            //划线文本组件属性显示
            if (_JC.cunterObj._objects[0].type=="i-text"){
                var _textObj=_JC.cunterObj._objects[0];
                var _lineObj=_JC.cunterObj._objects[1]; 
                var _textIndex=0,_lineIndex=1;
            }else{
                var _textObj=_JC.cunterObj._objects[1];
                var _lineObj=_JC.cunterObj._objects[0];
                var _textIndex=1,_lineIndex=0;
            }

            if (_JC.cunterObj.item(_textIndex).fontFamily!=preViewFont){
                _JC.cunterObj.item(_textIndex).set({fontFamily:preViewFont,fontSize:preSize});
                canvas.renderAll();
                _JC.componentDraw().updateProductLineText();
             
            }

        }

    });

    //鼠标不在滑过并移出option区域时事件
    $('.preViewFont').on('mouseout', '.layui-form-selected dl', function () {
        var preSize=$(this).parent().parent().parent().parent().find("input[name=textSize]").val();
        var preFont=$(this).find(".layui-this").attr("lay-value");
        if (_JC.cunterObj.type=="textbox"){
            _JC.cunterObj.set({fontFamily:preFont});
            canvas.renderAll();
        }else if (_JC.cunterObj.type=="group" && _JC.cunterObj.dType=="productPriceGroup"){

            //划线文本组件属性显示
            if (_JC.cunterObj._objects[0].type=="i-text"){
                var _textObj=_JC.cunterObj._objects[0];
                var _lineObj=_JC.cunterObj._objects[1]; 
                var _textIndex=0,_lineIndex=1;
            }else{
                var _textObj=_JC.cunterObj._objects[1];
                var _lineObj=_JC.cunterObj._objects[0];
                var _textIndex=1,_lineIndex=0;
            }

            if (_JC.cunterObj.item(_textIndex).fontFamily!=preFont){
                _JC.cunterObj.item(_textIndex).set({fontFamily:preFont,fontSize:(preSize-1)});
                canvas.renderAll();
                _JC.componentDraw().updateProductLineText();
             
            }

        }

    });

    //鼠标滑过字体菜单option选项时，被选文本模拟当前option字体效果
    $('.preViewMoreFont').on('mouseenter', '.layui-form-selected dl dd', function (obj) {

        if (_JC.selectedObject.length>1){
            var composingObject=_JC.selectedObject;
        }else{
            var composingObject=_JC.selectedObject[0]._objects;
        }

        for (var i=0;i<composingObject.length;i++){

            if (composingObject[i].hasOwnProperty("preFont")){

                if (composingObject.preFont==""){
                    var _fontFamily=composingObject[i].fontFamily;
                    composingObject[i].set({preFont:_fontFamily});
                }

            }else{
                var _fontFamily=composingObject[i].fontFamily;
                composingObject[i].set({preFont:_fontFamily});
            }   

            composingObject[i].set({fontFamily:obj.target.attributes[0].value});

        }

        canvas.renderAll();


    });

    //鼠标不在滑过并移出option区域时事件
    $('.preViewMoreFont').on('mouseout', '.layui-form-selected dl', function (){


        if (_JC.selectedObject.length>1){
            var composingObject=_JC.selectedObject;
        }else{
            var composingObject=_JC.selectedObject[0]._objects;
        }

        for (var i=0;i<composingObject.length;i++){

            if (composingObject[i].hasOwnProperty("preFont")){

                if (composingObject[i].preFont!=""){
                    var _preFont=composingObject[i].preFont;
                    composingObject[i].set({fontFamily:_preFont});
                }

            }                

        }

        canvas.renderAll();

    });

    
    //禁止页面URL直接在地址栏打开 
    if (top.window.location.href == window.location.href){
        layer.msg("Invalid way to open page!");
        return true;
    } 

    //商品Label监听折叠
    element.on('collapse(productElement)', function(data){
        // layer.msg('展开状态：'+ data.show);
    });
    
    //多语言
    var langData = window.language.data;
    
    //当前组件code
    window.current_id = getUrlRelativePath(4);
    
    //定义全局授权信息
    window.storage = layui.data(setter.tableName);
    
    //定义图层弹出层窗口
    window.levelWindow=null;
    
    //引用Layui jquery
    window.$ = layui.$;
    
    //用户工号
    userID = storage.username;


    require.config({　
        baseUrl: "/js/marketing/config",
        // baseUrl: "https://factory.gzgongfeng.com/js/marketing/config",
        paths: {　　　
            "rotate": "jquery.rotate.min",
            "pageLayer": "layer",
            "designFunction": "function",
            "config": "defaulConfig",
            "cmykColor": "cmyk",
            "canvas": "fabric",
            "JC": "jc.class",
            "pagesEvent": "pagesEvent",
        }
    }),
    requireJS(["rotate","pageLayer", "config", "designFunction", "canvas", "JC", "pagesEvent", "cmykColor"], function() {
  
        //加载loading层
        $(".loadingTip").remove();
        var loadEvent = layer.load(2, {time: 1000000,shade: [0.3, '#393D49']});

        //页面加载进度
        loadResource("component");
        loadObject[0].status=1;

        //设置作业画布空间
        var drawCanvasSize=setDrawAreaNew();
        
        langRender($(".updateLang"),langData.design);

        //加载设计字体
        designFont=[]; 
        
        //引用本地库
        _DB = new localDB();
        _DB.openDB(dbParma);
        _DB.onsuccess().then(data => {
            console.log('open db success');
            loadObject[1].status=1;
        })
        _DB.onupgradeneeded().then(data => {
            loadObject[1].status=1;
            _DB.initTable(createTable);
        })
        
        
        //创建用于生成预览图画布控件
        window.thumbnailCanvas= new fabric.Canvas('thumbnailCanvas');
        window.thumbnailContext = thumbnailCanvas.getContext("2d");

        
        //设定画布
        canvas = this.__canvas = new fabric.Canvas('paperArea',{
            preserveObjectStacking:true,
            selectionKey: "shiftKey",
            fireRightClick: true, // 启用右键，button的数字为3
            stopContextMenu: true, // 禁止默认右键菜单
        }); 

        fabric.Object.prototype.transparentCorners = false;
        context = canvas.getContext('2d');
        //context.scale(2, 2); // 放大2倍
        context.textBaseline="middle";
        
        //引用JC类 初始化
        _JC = new JC();
        _JC.localDB = _DB;
        _JC.canvasPaddX = drawCanvasSize.width/2;
        _JC.canvasPaddY = drawCanvasSize.height/2;
        _JC.designModule = "component";
        _JC.blankPic=blankPic;
        _JC.canvasConfig.defauleBackgroundImage = blankPic;
        _JC.canvasConfig.defauleFontFamily="freeserif";
        
        //关闭出血线、纸张、页边距边框
        _JC.paperSize.stroke = false;
        
        //处理事务
        timerProcess=[];

        loadElementShape("#shapeElement",function(data){
            if (data){
                loadObject[3].status=1;
            }else{
                loadObject[3].status=1;
            }
        });

        //加载商品组件
        loadProductLabel("#productElement",function(data){
            if (data){
                loadObject[4].status=1;
            }else{
                loadObject[4].status=1;
            }
        });

        
        //引用CMYK类
        _CMYK = new cmykColor();　　
        _CMYK.init();　　
        loadObject[2].status=1;
        //_CMYK.loadDefaultColor();
        _CMYK.done = function(data) {　　
            _JC.colorConfig(data);
        }
        _CMYK.updateMyColor=function(data){

            if (isEmpty(designerConfig)){
                designerConfig={};
            }
            if (isEmpty(data)){
                designerConfig.myColorData=null;
            }else{
                designerConfig.myColorData=data;
            }
            updateMyDesignConfig(designerConfig,userID);
        }　
        
        //JC引入颜色器
        _JC.colorPlugin = _CMYK;
        
        /**
         * 根据页面MM、模板、组件code编码入参请求接口获取模板JSON数据
         * @ getUrlParm 获取路由参数 mmCode or templateCode or elementCode 
         */
        var mydata = {
            url: getApiUrl('marketing.component.detail', {
                code: current_id
            }),
            type: getApiMethod('marketing.component.detail'),
        };

        loadDbTimer=setInterval(function(){ 

            if (_JC.localDB.db.transaction){
           
                clearInterval(loadDbTimer);
                getTemplateCode(mydata, function(result) {
               
                    loadObject[5].status=1;

                    if (result.code == "0000") {
                        $(".mmName").html(result.data.name);
                        var outData = result.data.content;

                        //当前Template所有字体
                        getDesignPageFonts(outData.duplicate,function(fonts){
                            loadFont(fonts,function(data){
                                loadObject[7].status=1;
                            });  
                        });

                        //MOREPAGES-CANVAS
                        var isMorePagesDraw=false;
                        //多页面排版模式
                        var canvasPages=[];
               
                        var _tmp={};
                            _tmp.textThaiPages=[1];
                            _tmp.drawCanvas=0;
                            _tmp.pageCode=result.data.code;
                        canvasPages[0]=_tmp;
                       

                        var parm = {
                            deviceWidth: $("#drawPanel").width(),
                            deviceHeight: $("#drawPanel").height(),
                            templateCode: result.data.code,
                            templatePages: [{
                                "elementCode": result.data.code,
                                "pageCode": result.data.code,
                                "sort": 1,
                                "templateFile": ""
                            }],
                            pageCode: result.data.code,
                            
                            //支持出血线、页边距单边不同值设置
                            paperWidth: outData.pageSize.paper.width,
                            paperHeight: outData.pageSize.paper.height,
                            paperLeft: outData.pageSize.paper.left,
                            paperTop: outData.pageSize.paper.top,
                            paperBackgroundColor: "#ffffff",
                            paperBackgroundImage: '',
                            bleedWidth: (!outData.pageSize.bleed) ? outData.pageSize.paper.width * 1 : outData.pageSize.bleed.width * 1 - 4,
                            bleedHeight: (!outData.pageSize.bleed) ? outData.pageSize.pager.height * 1 : outData.pageSize.bleed.height * 1 - 4,
                            bleedLeft: (!outData.pageSize.bleed) ? 0 : outData.pageSize.bleed.left * 1,
                            bleedTop: (!outData.pageSize.bleed) ? 0 : outData.pageSize.bleed.top * 1,
                            marginWidth: (!outData.pageSize.margins) ? outData.pageSize.pager.width * 1 : outData.pageSize.margins.width * 1,
                            marginHeight: (!outData.pageSize.margins) ? outData.pageSize.pager.height * 1 : outData.pageSize.margins.height * 1,
                            marginLeft: (!outData.pageSize.margins) ? outData.pageSize.pager.left * 1 : outData.pageSize.margins.left * 1,
                            marginTop: (!outData.pageSize.margins) ? outData.pageSize.pager.top * 1 : outData.pageSize.margins.top * 1,
                            paperDPI: (!outData.pageSize.paperDPI) ? 300 : outData.pageSize.paperDPI * 1,
                            paperUnitIndex: (!outData.pageSize.paperUnitIndex) ? 1 : outData.pageSize.paperUnitIndex * 1,
                            paperUnitName: (!outData.pageSize.paperUnitName) ? 'mm' : outData.pageSize.paperUnitName,
                            paperUnitToPx: (!outData.pageSize.paperUnitToPx) ? 25.4 : outData.pageSize.paperUnitToPx * 1,

                            //MOREPAGES-CANVAS
                            canvasPages:canvasPages,
                            drawCanvasIndex:0,
                            isMorePagesDraw:isMorePagesDraw

                        };

                        try {
                            _JC.init(parm);
                        }
                        catch(err) {
                        } 

                        
                        var loadParm = {
                            pageCode: result.data.code,
                            duplicate: outData.duplicate
                        };
                        _JC.templateAffair().loadTemplate(loadParm,async function(){    

                            lockStatus=false;
                            zoomScale(true,-1);
                            _JC.pageEvent.showBackgroundImage();
                            var isReview=false;
                            setTimeout(function(isReview) {
                                _JC.localDB.deleteAfterData(
                                    {name:_JC.dbConfig.historyRecordTable,type:'readwrite'} 
                                    ,"templateCode"
                                    ,-1
                                    ,_JC.canvasConfig.recordPointer.pointerTemplateCode);


                                //图层
                                redefinePageLayer(_JC);
                                _JC.layer.init();
                                var layerData=_JC.layer.render.objectToLayer(canvas.getObjects(),0);
                                _JC.layer.render.renderLayerHtml($("#pageLayer"),0,layerData);
                                _JC.canvasSave().canvasHistoryRecordSave(userID,'loadPage','Load file');

                                fabric.charWidthsCache = {};
                                if (isReview==false){
                                    isReview=true;
                                    _JC.componentDraw().resetView(function(){}); 
                                }

                                // 上传图片点击监听
                                uploadImageInit('#uploadImage-btn', function(result, file) {
                            
                                    var originalName = file.name;
                                    var name = originalName.substr(0, originalName.lastIndexOf('.'));
                                    var filePath = result.thumbnailPath;
                                    var imageType = $("#uploadImage-btn").attr("imageType") || '4';// 默认为Other
                                    drawPictureInsertElement(filePath);
                                    uploadImageListenEvent(result, name, imageType);
                                }, function(e) {
                                    layer.msg("Upload Failed");
                                });



                            },2000);


                            $(function(){
                                fabric.charWidthsCache = { };
                                layer.close(loadEvent);
                                clearInterval(timer);
                                $("#pageLoading").remove();

                                jsLoadFonts(allFonts,async function(data){
                             
                                    if (isReview==false){
                                       
                                        isReview=true;

                                        setTimeout(function(isReview) {
                                            _JC.componentDraw().resetView(function(){
                                                layer.close(loadEvent);
                                                clearInterval(timer);
                                                console.log("OKI CC");
                                            });
                                        },2000);
                                    }
                                });



                            })

                        });
                        
                        //加载用户设计器配置
                        loadMyDesignConfig(userID,function(result){ 
                            designerConfig=null;
                            myColorData=null;
                            myTextStyle=null;
                            if (result.code=="0000"){
                                if (result.data!=null){
                                    designerConfig=result.data.jsonObject;
                                    if (designerConfig.myColorData){
                                        myColorData=designerConfig.myColorData;
                                    }
                                    if (designerConfig.myTextStyle){
                                        myTextStyle=designerConfig.myTextStyle;
                                    }
                                }
                                _CMYK.loadMyColor(myColorData);
                            }else{
                                layer.msg("Load My Config Error");
                            } 

                            //暂时注释用户设计师新增颜色，改为系统颜色
                            loadSystemColor(function(result){ 
                                if (result.data!=null){
                                    var myColorData=result.data.records;
                                    if (!isEmpty(myColorData)){
                                        _CMYK.loadSystemColor(myColorData);
                                    }
                                }
                                
                            });

                            loadObject[6].status=1;
                        });

                        //重写JC类页面属性显示
                        redefinePageEvent(_JC);
                        
                        //页面纸张尺寸填写
                        $(".pageConfig .sizeWidth .number").html(outData.pageSize.paper.width);
                        $(".pageConfig .sizeHeight .number").html(outData.pageSize.paper.height);
                        $(".mmName").html(result.pTitle);
                        $(".staffInfo").html("Staff:" + result.user);
                        

                        //页面加载后画布设为焦点元素
                        //鼠标滑过画布并设画布为焦点元素
                        $("#paperArea").click();
                        $('#drawPanel').mouseover(function() {
                            $("#paperArea").click();
                        });


                        //组件画布特殊处理top定位 临时处理
                        // $("#draw-wrapper").css("padding-top", "50px");
                        $(".sizeScale").remove();
                        
                    } else {
                        layer.msg(result.msg);
                    }
                });
            }else{
                layer.msg("load db err");
            }
        },1000);


    },200);

    window.onload = function() {
      // 禁止在菜单上的默认右键事件
      menu.oncontextmenu = function(e) {
        e.preventDefault()
      }
    }

    // 加载js，并设置延迟回调
    function requireJS(deps, callback, delay) {
        delay = parseInt(delay);
        if (delay > 0) {
            var startTime = new Date().getTime();
            require(deps, function() {
                var endTime = new Date().getTime();
                // 重新计算延迟时间，减去加载时间
                delay = delay - parseInt(endTime - startTime);
                console.log('require js time: ' + parseInt(endTime - startTime) + 'ms');
                var that = this;
                if (delay > 0) {
                    setTimeout(function() {
                        callback.call(that);
                    }, delay);
                } else {
                    callback.call(that);
                }
            });
        } else {
            require(deps, callback);
        }
    }

    //作业画布设计区域尺寸计算及设置
    function setDrawAreaNew(){

        $("#drawPanel").width($(".design-edit-content").width() - $(".edit-tool-panel").width() - $(".edit-attribute-panel").width() - $("#toolBar").width());
        $("#drawPanel").height($(".design-edit-content").height() - $(".createTemplatePageTop").height());
        $("#drawPanel").css("left", ($(".edit-tool-panel").width() + $("#toolBar").width()) + "px");
        $("#drawPanel").css("top", $(".createTemplatePageTop").height() + "px");

        var w = $("#drawPanel").width();
        var h = $("#drawPanel").height();
        $("#draw-wrapper").width(w).height(h);
        
        $("#tabContent").height($(".design-edit-content").height() - $(".createTemplatePageTop").height() - 50);
        // $("#fileMenuList").height($(".design-edit-content").height() - $(".createTemplatePageTop").height() - 400);
        $("#fileMenuList").css("height","100%");
        return {width:w,height:h};
    }


});