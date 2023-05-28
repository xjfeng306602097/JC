/**

 @Name：makro 
 @Author：makro
 @Site：http://mm.makro.com/makroDigital/marketingActivity/design
    
 */

//引入设计页模块JS
var canvas,penCanvas,penCxt,context, _JC, _CMYK, _DB, pageLayer,userID, slider, mmDetailsData,designFont,lockStatus,designerConfig,myColorData,myTextStyle,allFonts,loadObject,timer,timeTask,timing,timerProcess;

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
    coloreditor: '../layui_exts/coloreditor/coloreditor',
}).use(['index', 'form', 'laydate', 'table', 'layer', 'slider', 'upload', 'uploadAPI', 'dict', 'dropdown', 'common', 'coloreditor'], function() {
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
        layer = layui.layer,
        http = layui.http,
        admin = layui.admin,
        coloreditor = layui.coloreditor,
        httpHeader = layui.common.httpHeader;
 
    //全屏模式
    //parent.layui.admin.fullScreen();
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
                        
                        if (_JC.cunterObj.hasOwnProperty("preFont")){
                            delete _JC.cunterObj.preFont;
                        }

                        _JC.cunterObj.set({fontFamily:data.value});
                        _JC.canvasConfig.lastFontFamily=_JC.cunterObj.fontFamily;
                        canvas.renderAll();


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

                    canvas.discardActiveObject();

                    for (var i=0;i<composingObject.length;i++){
                        if (composingObject[i].hasOwnProperty("preFont")){
                            delete composingObject[i].preFont;
                        }

                        composingObject[i].set({fontFamily:data.value});

                        if (composingObject[i].hasOwnProperty("group")) {
                            composingObject[i].group.addWithUpdate();
                        }
                        if (composingObject[i].hasOwnProperty("sourceGroup")) {
                            composingObject[i].sourceGroup.addWithUpdate();
                        }

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
        
        canvas.discardActiveObject();
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

            if (composingObject[i].hasOwnProperty("group")) {
                composingObject[i].group.addWithUpdate();
            }
            if (composingObject[i].hasOwnProperty("sourceGroup")) {
                composingObject[i].sourceGroup.addWithUpdate();
            }


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

    //当前MM模板code
    window.current_id = getUrlRelativePath(4);
    
    //当前MM邦定的设计template code
    window.designTemplateCode;

    //定义全局授权信息
    window.storage = layui.data(setter.tableName);
    
    //定义图层弹出层窗口
    window.levelWindow=null;
    
    //引用Layui jquery
    window.$ = layui.$;

    //多语言
    var langData = window.language.data;

    //用户工号
    userID = storage.username;
    
    //定时任务表
    timeTask=[];
    //计时设置 15分钟
    timing=900 * 1000;
// "localdb"
    //引用相关js
    require.config({　
        // baseUrl: "https://factory.gzgongfeng.com/js/marketing/config",
        baseUrl: "/js/marketing/config",
        paths: {　　　
            "rotate": "jquery.rotate.min",
            "pageLayer": "layer",
            // "sortable":"Sortable.min",
            "designFunction": "function",
            "config": "defaulConfig",
            // "localdb": "localdb",
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
        loadResource("mm");
        loadObject[0].status=1;

        /**
         * 页面初始化
         * 1､获取用户信息
         * 2､计算画布区域
         * 3､禁止页面事件：返回上一页事件、页面文字选择事件
         * 
         */

        pageInit();

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
            console.log("createTable");
            loadObject[1].status=1;
            _DB.initTable(createTable);
        })
        
        
        //创建用于生成预览图画布控件
        window.thumbnailCanvas= new fabric.Canvas('thumbnailCanvas');
        window.thumbnailContext = thumbnailCanvas.getContext("2d");
        
        
        //设定作业画布 
        canvas = this.__canvas = new fabric.Canvas('paperArea',{
            preserveObjectStacking:true,
            selectionKey: "shiftKey",
            //perPixelTargetFind:true,//精确点击组件可见颜色点选中组件
            fireRightClick: true, // 启用右键，button的数字为3
            stopContextMenu: true, // 禁止默认右键菜单
     
        });

        fabric.Object.prototype.transparentCorners = false;
        context = canvas.getContext('2d');
        context.textBaseline="middle";
        //context.scale(2, 2); // 放大2倍
        
        penCanvas =this.__canvas = new fabric.Canvas('penCanvas',{
            preserveObjectStacking:true,
        });
        penCxt = penCanvas.getContext('2d');

        //引用JC类 初始化
        _JC = new JC();
        _JC.localDB = _DB;
        // _JC.canvasPaddX = 1000;
        // _JC.canvasPaddY = 380;

        _JC.canvasPaddX = drawCanvasSize.width/2;
        _JC.canvasPaddY = drawCanvasSize.height/2;

        _JC.designModule = "mm";
        _JC.blankPic=blankPic;
        _JC.canvasConfig.defauleBackgroundImage = blankPic;
        _JC.canvasConfig.defauleFontFamily="freeserif";        
        
        //开启出血线、纸张、页边距边框
        _JC.paperSize.stroke = true;
        
        //处理事务
        timerProcess=[];

        //加载商品组件
        loadComponent("#component",function(data){
            if (data){
                loadObject[3].status=1;
            }else{
                loadObject[3].status=1;
            }
        });
        loadElementShape("#shapeElement",function(data){
            if (data){
                loadObject[4].status=1;
            }else{
                loadObject[4].status=1;
            }
        });
        loadProductLabel("#productElement",function(data){
            if (data){
                loadObject[5].status=1;
            }else{
                loadObject[5].status=1;
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
            url: getApiUrl('marketing.activity.template', {
                mmCode: current_id
            }),
            type: getApiMethod('marketing.activity.template'),
        };

        var loadDbTimer=setInterval(function(){ 

            if (_JC.localDB.db.transaction){
           
                clearInterval(loadDbTimer);
                getTemplateCode(mydata, function(result) {
              
                    loadObject[6].status=1;
                    if (result.code == "0000") {
                        
                        _JC.templateData.templateVersion=result.data.version;
                        var outData = result.data;

                        //锁定模板
                        designTemplateCode=outData.code
                        lockTemplate(designTemplateCode);
                  
                        //MOREPAGES-CANVAS
                        var canvasPages;
                        var isMorePagesDraw=false;

                        if (outData.pageOption && outData.pageOption!=null){
                            if (outData.pageOption!="1")
                            {
                               isMorePagesDraw=true;
                            }
                        }else{
                            outData.pageOption="1";
                        }

                        if (outData.pageConfigs && outData.pageConfigs!=null){
                            canvasPages=outData.pageConfigs;
                        }

                        //遍历模板所有有效单页及取副本集
                        //var templatePageList=outData.templatePageList;

                        var _templatePageList=outData.templatePageList;

                        var templatePageList=[];
                        /* 处理多个有效页面sort相同的异常处理 */
                        for(var i=0;i<_templatePageList.length;i++){

                            if (_templatePageList[i]!=undefined){

                                if (_templatePageList[i].isValid * 1 ==1){

                                    templatePageList.push(_templatePageList[i]);

                                }

                            }

                        }

                        //重新排页面顺序
                        var compare = function (obj1, obj2) {
                            var val1 = obj1.sort * 1;
                            var val2 = obj2.sort * 1;
                            if (val1 < val2) {
                                return -1;
                            } else if (val1 > val2) {
                                return 1;
                            } else {
                                return 0;
                            }            
                        } 
                        
                        templatePageList.sort(compare);

                        //处理保存空白页产生的异常数据空副本数据，产生的sort断点
                        if (templatePageList[templatePageList.length-1].sort*1!=templatePageList.length){
                            for (var i=0;i<templatePageList.length;i++){
                                templatePageList[i].sort=i+1;
                            }
                        }

                        /* End */




                        //当前Template所有字体
                        getDesignPageFonts(templatePageList,function(fonts){
                            //console.log("design use fonts:",fonts);
                            loadFont(fonts,function(data){
                                loadObject[9].status=1;
                            });　
                        });
        　

                        //模板单页集信息
                        var templatePages=[];
                        var _pagesDuplicate=[];

                        var _pageIndex=1;

                        for(var i=0;i<templatePageList.length;i++){
                            
                            if (templatePageList[i]!=undefined){

                                //在所有页面副本中加上所属页面的页码标记 
                                for (var j=0;j<templatePageList[i].content.duplicate.length;j++){
                                    
                                    templatePageList[i].content.duplicate[j].pageCode=templatePageList[i].code;
                                   
                                }

                                //temp 临时解决页面中所有副本集无效的处理
                                if (templatePageList[i].content.duplicate.length==1){
                                    templatePageList[i].content.duplicate[0].isValid=0;
                                }



                                //取有效单页
                                if (templatePageList[i].isValid * 1 ==1){
                                    
                                    //组装模板单页信息集
                                    var tmp={};
                                    tmp.sort=_pageIndex;
                                    tmp.pageCode=templatePageList[i].code;
                                    tmp.templateCode=outData.code;
                                    tmp.version=templatePageList[i].version;
                                    tmp.templateFile="";

                                    if (templatePageList[i].hasOwnProperty("pageTitle")){
                                        tmp.pageTitle=templatePageList[i].pageTitle;
                                    }else{
                                        tmp.pageTitle="Page " + tmp.sort;
                                    }
                                    
                                    //该页面是否已删除 0未，1删
                                    tmp.isDelete=0;
                                    templatePages[(tmp.sort-1)]=tmp;
                                    // console.log("isValid=1",tmp.sort);
                                    _JC.pagesDuplicate[(tmp.sort-1)]=templatePageList[i].content.duplicate;

                                    _pageIndex++;

                                }else{
                                    console.log(templatePageList[i].isValid);
                                }

                            }
                        }
                         
                        
                        //计算每尺寸单位转位率
                        var bleedWidth=(outData.bleedLineIn *1 + outData.bleedLineOut * 1 + outData.configW * 1);
                        var bleedHeight=(outData.bleedLineTop *1 + outData.bleedLineBottom * 1 + outData.configH * 1);
                        var DPI=outData.configDpi * 1;
                        var pageWidth=outData.pageWidth * 1;
                        var unitPx=(bleedWidth/(pageWidth/DPI)).toFixed(1);
                        var unitInch=outData.unitInch;

                        var parm = {
                            deviceWidth: $("#drawPanel").width(),
                            deviceHeight: $("#drawPanel").height(),
                            templateCode: templatePages[0].templateCode,
                            templatePages: templatePages,
                            pageCode: templatePages[0].pageCode,
                            
                            //新计算算法（设置宽度 / unitPx * 72） 105mm / 25.4 * 72
                            //支持出血线、页边距单边不同值设置
                            configW:outData.configW,
                            configH:outData.configH,
                            paperWidth: Math.round(outData.configW * 72 / unitPx),
                            paperHeight: Math.round(outData.configH * 72 / unitPx),
                            paperLeft: Math.round(outData.bleedLineIn * 72 / unitPx),
                            paperTop: Math.round(outData.bleedLineTop * 72 / unitPx),
                            paperBackgroundColor: "#ffffff",
                            paperBackgroundImage: '',
                            
                            bleedWidth: Math.round(bleedWidth * 72 / unitPx),
                            bleedHeight: Math.round(bleedHeight * 72 / unitPx),
                            bleedLeft: 0,
                            bleedTop: 0,
                            
                            marginWidth:Math.round((outData.configW - outData.marginIn - outData.marginOut ) * 72 / unitPx) ,
                            marginHeight: Math.round((outData.configH - outData.marginTop - outData.marginBottom ) * 72 / unitPx) ,
                            marginLeft:Math.round((outData.bleedLineIn + outData.marginIn ) * 72 / unitPx ) ,
                            marginTop: Math.round((outData.bleedLineTop + outData.marginTop ) * 72 / unitPx),
                            
                            paperDPI: DPI,
                            paperUnitIndex: outData.configUnitID,
                            paperUnitName: '',
                            paperUnitToPx:unitPx,


                            //MOREPAGES-CANVAS
                            canvasPages:canvasPages,
                            pageOption:outData.pageOption,
                            isMorePagesDraw:isMorePagesDraw,

                            mmCode: current_id,
                            //模板状态
                            templateStatus: outData.status

                        };
                        
                        try {
                            _JC.init(parm);
                        }
                        catch(err) {
                            _JC.init(parm);
                        }                

                        
                        var loadParm = {
                            pageCode: templatePages[0].pageCode,
                            file:""
                        };
                        
                        //设置首页副本集为当前页副本集
                        _JC.templateData.cunterPageDuplicate=_JC.pagesDuplicate[0];
                        
                        //获取MM商品清单
                        getMMDetails(current_id,function(mmDetails){

                            loadObject[7].status=1;

                            //设置MM商品清单变量
                            mmDetailsData=mmDetails;
                            console.log(mmDetailsData[0]);
                            //切换当前页为工作页
                            _JC.templateAffair().cutoverTemplatePage(loadParm,async function(){


                                //图层
                                redefinePageLayer(_JC);
                                _JC.layer.init();

                                var renderLayerTime=setInterval(function(){

                                    if (_JC.isDrawBackgroundImage(canvas._objects)==false){
                                        _JC.canvasDraw().drawBackgroundImage(null,null);
                                    }

                                    if (canvas._objects.length>3){

                                        if (canvas._objects[3].dType=="BackgroundImage"){
                                            clearInterval(renderLayerTime);

                                            _JC.localDB.deleteAfterData(
                                                {name:_JC.dbConfig.historyRecordTable,type:'readwrite'} 
                                                ,"templateCode"
                                                ,-1
                                                ,_JC.canvasConfig.recordPointer.pointerTemplateCode);

                                            var canvasObjects=canvas.getObjects(); 
                                            var layerData=_JC.layer.render.objectToLayer(canvasObjects,0);
                                            _JC.layer.render.renderLayerHtml($("#pageLayer"),0,layerData);
                                            _JC.canvasSave().canvasHistoryRecordSave(userID,'loadPage','Load file');
                                            layer.close(loadEvent);
                                        }else{
                                            console.log("canvas rendering");
                                        }
                                    }else{

                                            clearInterval(renderLayerTime);

                                            _JC.localDB.deleteAfterData(
                                                {name:_JC.dbConfig.historyRecordTable,type:'readwrite'} 
                                                ,"templateCode"
                                                ,-1
                                                ,_JC.canvasConfig.recordPointer.pointerTemplateCode);

                                            var canvasObjects=canvas.getObjects(); 
                                            var layerData=_JC.layer.render.objectToLayer(canvasObjects,0);
                                            _JC.layer.render.renderLayerHtml($("#pageLayer"),0,layerData);
                                            _JC.canvasSave().canvasHistoryRecordSave(userID,'loadPage','Load file');
                                            layer.close(loadEvent);

                                    }

                                },1000);


                                setTimeout(function() {

                                    fabric.charWidthsCache = {}; 
                                    if (canvas.getZoom()>1){
                                        zoomScale(true,-1);
                                    }

                                    if (!lockStatus){
                                        _JC.componentDraw().editBackgroundReact(false,_JC.editGroupZindex);
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

                                        //定时任务执行
                                        var taskParm={};
                                        taskParm.type="lockTemplate";
                                        taskParm.designTemplateCode=designTemplateCode;
                                        taskParm.runTime=Date.parse(new Date())*1 + timing;
                                        timeTask.push(taskParm);
                                        setInterval(timeKeeping,5000);

                                    }else{
                                      
                                        _JC.componentDraw().editBackgroundReact(true,_JC.editGroupZindex);
                                        canvas.selection = false;
                                        canvas.selectable=false;
                                        canvas.skipTargetFind = true;
                                        canvas.requestRenderAll();
                                        layer.close(loadEvent);
                                    }
 

                                },2000);

                                if (!lockStatus){
                                    //启用定时保存,锁定模板 2分钟
                                    setInterval(function(){
                                        autoTimeSave();
                                    }, 120000);
                                }
                                //penCanvasInit();



                                $(function(){
                                    fabric.charWidthsCache = {};
                                    
                                    clearInterval(timer);
                                    _JC.switchPage=true;
                                    $("#pageLoading").remove();
                                    jsLoadFonts(allFonts,function(data){
                                        _JC.componentDraw().resetView();
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
                                
                                loadObject[8].status=1;
                            });
                            
                        });
                        
                        
                        //设置工具体页面数值
                        renderPagesItem();
                        
                        //页面纸张尺寸填写
                        $(".pageConfig .sizeWidth .number").html(parm.configW);
                        $(".pageConfig .sizeHeight .number").html(parm.configH);
                        $("#pageUnitInfo").html("Size ("+UnitName(unitInch)+")");
                        $("#pageDpi").html(parm.paperDPI + " dpi").show();
                        $(".mmName").html(outData.name );
                        
                        //页面加载后画布设为焦点元素
                        //鼠标滑过画布并设画布为焦点元素
                        $("#paperArea").click();
                        $('#drawPanel').mouseover(function() {
                            $("#paperArea").click();
                        });



                        //重写JC类页面属性显示
                        redefinePageEvent(_JC);
                        
                        //释放变量 防止数据过大
                        templatePageList=null;
                        _pagesDuplicate=null;
                        
                    } else {
                        layer.msg(result.msg);
                    }
                    
                    
                });

            }


        },1500);


    }, 1000);

    window.onbeforeunload = function() {
        // 解锁MM
        console.log("解锁MM designTemplateCode= "+designTemplateCode);
        http.proxyRequest({
            url: getApiUrl('marketing.template.unlock', {code: designTemplateCode}),
            method: getApiMethod('marketing.template.unlock'),
            headers: httpHeader.getAll(),
        });
    };


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
        $("#fileMenuList").height($(".design-edit-content").height() - $(".createTemplatePageTop").height() - 400);

        return {width:w,height:h};
    }


});