//引用Layui jquery
window.$ = layui.$;
/**
 * 页面元素事件邦定 
 * 
 * 1､页面顶部区域 页面层按钮事件
 *  
 * 2､左则组件区域 选择插入组件按钮邦定事件 
 * 
 * 3､右则属性区域 对组件、页面属性设置
 * 
 * 4､画布操作区域 放大缩小、右键菜单
 */
/**  顶部工具体 **/
//pageList template page 切换事件  
/*$("#pagesItem").on("dblclick",".listOption",function (obj) {
    console.log("dblclick");
    var _listOption=$(this).find(".pageName");
    var _pageTitle=$(_listOption).html();
    $("#pagesItem .resetTitle").remove();
    $("#pagesItem .pageName").show();
    var _Html='<input type="text" class="resetTitle elementRename" contentEditable="true" value="'+_pageTitle+'" style="width: 185px;">';
    $(_listOption).hide();
    $(_listOption).parent().prepend(_Html);
});*/

$("#pagesItem").on("click", ".listOption", function(obj) {

    if ($(this).hasClass("active") || !_JC.switchPage) {
        return;
    } else {

        if (_JC.insertStatus){
            canvas.defaultCursor = 'default';
            canvas.hoverCursor = 'default';
            _JC.canvasDraw().deleteObject({
                id: "panningBox"
            });
            $(".elementOption").removeClass("act");
            canvas.renderAll();
        }
        _JC.minLayer=4;
        _JC.switchPage=false;
        _JC.insertObjectData.dType=null;
        _JC.insertObjectData.name=null;
        _JC.insertObjectData.file=null;
        _JC.insertObjectData.dataFiled=null;
        _JC.insertObjectData.insertText=null;
        _JC.insertStatus=false;

        //双击分组背景色进行合并分组
        if (_JC.undoGroupSource!=null){
            _JC.componentDraw().composeGroup();
            _JC.pageEvent.composeGroup();
            $("#layerTool").click();
            $(".elementOption").removeClass("act");
            $("#selectComponent").click();
        }
        _JC.undoGroupSource=null;

        if (!$("#productElementTool").hasClass("layui-hide")){
            $(".elementOption ").removeClass("act");
            
        }

        //加载loading层
        var loadEvent = layer.load(2, {
            time: 10 * 1000,
            shade: [0.3, '#393D49']
        });

        $("#pagesItem .listOption").removeClass("active");
        $(this).addClass("active");

        var pageCode = $(this).attr("data-pageCode");
        var parm = {};
        parm.cunterPage = $(this).attr("pageSort") * 1;
        parm.templatePages = _JC.templateData.templatePages;


        //生成并保存该副本base64图片 -> 并自动保存上传服务器
        var mapParm = {};
        mapParm.zoom = getThumbnailZoom(_JC.paperSize.bleedWidth, _JC.paperSize.bleedHeight, minThumbnail, maxThumbnail);
        var offset = Math.ceil(mapParm.zoom);
        mapParm.x = _JC.canvasPaddX * mapParm.zoom + offset;
        mapParm.y = _JC.canvasPaddY * mapParm.zoom + offset;
        mapParm.width = _JC.paperSize.bleedWidth - parseInt(mapParm.zoom);
        mapParm.height = _JC.paperSize.bleedHeight - parseInt(mapParm.zoom);
        var canvasCode = canvas.toJSON(_JC.canvasConfig.outFiled);


        //当前页码、副本号
        var pageSort = _JC.cunterPage;
        var pageNo = canvasCode.No;


        //后台执行-生成切换前页面的缩略图到对应副本
        if (_JC.drawing) {

            var _theProcess = {};
            _theProcess.type = "createDupThumbnail";
            _theProcess.parm = {};
            _theProcess.parm.mapParm = mapParm;
            _theProcess.parm.canvasCode = canvasCode;
            _theProcess.parm.pageSort = pageSort + "";
            _theProcess.parm.pageNo = pageNo + "";
            _theProcess.parm.pageCode=canvasCode.pageCode + "";

            var theProcess = JSON.parse(JSON.stringify(_theProcess));
            timerProcess.push(theProcess); 
            transactionProcess();

        }
        _JC.drawing=false;

        var pageParm = {};
        pageParm.pageCode = pageCode;
        pageParm.file = "";

        _JC.templateAffair().cutoverTemplatePage(pageParm, async function() {
            
            canvas.renderAll();

            var canvasObjects=canvas.getObjects();
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

            canvasObjects.sort(compare);
            for (var i=0;i<canvasObjects.length;i++){
                canvasObjects[i].sortPath=i;
            }
            // _JC.layer.init();
            var layerData=_JC.layer.render.objectToLayer(canvasObjects,0);
            _JC.layer.render.renderLayerHtml($("#pageLayer"),0,layerData);

            if(lockStatus==true){
                _JC.componentDraw().editBackgroundReact(true,_JC.editGroupZindex);
                canvas.selection = false;
                canvas.selectable=false;
                canvas.skipTargetFind = true;
                canvas.requestRenderAll();
            }

            setTimeout(function() {
                _JC.switchPage=true;
                zoomScale(true,-1);
                //关闭加载loading层
                layer.close(loadEvent);
                _JC.componentDraw().resetView(async function(){

                });

            }, 1000);
            

        })
    }
});


//刷新该MM商品清单并生成所有页面缩略图
$(".reloadDetails").on("click", function() {
    if ($(this).hasClass("noneClick") || _JC.undoGroupSource != null) {
        return;
    }

    if (_JC.designModule == "mm") {
        var loadEvent = layer.msg("Refreshing please wait", {
            time: 40000,
            shade: 0.4
        });
        getMMDetails(current_id, function(mmDetails) {
            //设置MM商品清单变量
            mmDetailsData = mmDetails;

            //保存当前画布所在页到副本集
            var workCanvas=_JC.screeningDuplicate(canvas.toJSON( _JC.canvasConfig.outFiled ),_JC.canvasPaddX,_JC.canvasPaddY);
            _JC.canvasSave().updatePageDuplicate(_JC.canvasConfig.recordPointer.pointerPageNo,workCanvas,async function(){

                //如果是mm模式 同步商品组件更新mm商品dsort对应信息
                //更新页面活动副本商品组件内容
                
                var pagesData = [];
                var thePageSort=-1;
                var theDupSort=-1;

                for (var p = 0; p < _JC.pagesDuplicate.length; p++) {
                    pagesData.push(p);
                    for (var d=0;d<_JC.pagesDuplicate[p].length;d++){
                        if (_JC.pagesDuplicate[p][d].isValid * 1==0){
                            
                            if (_JC.pagesDuplicate[p][d].pageCode==_JC.canvasConfig.recordPointer.pointerPageCode){
                                _JC.pagesDuplicate[p][d]=workCanvas;
                                thePageSort=p;
                                theDupSort=d;
                            }


                        }
                    }
                }
                _JC.drawing = true;
          
                var prePageZoom=canvas.getZoom();

                fabric.charWidthsCache = {};
                _JC.canvasDraw().reLoadRefreshDetails(mmDetailsData, pagesData, 0, _JC.pagesDuplicate,async function(newPageObjects) {

                    var pageParm = {};
                    pageParm.pageCode =_JC.canvasConfig.recordPointer.pointerPageCode;
                    pageParm.file = "";
                    pageParm.isReload=true;
                    pageParm.canvasCode=_JC.pagesDuplicate[thePageSort][theDupSort];

                    var prePageZoom=canvas.getZoom();
                    _JC.templateAffair().cutoverTemplatePage(pageParm, async function() {
                        
                        zoomScale(false,prePageZoom * 100);

                        canvas.requestRenderAll();
                        _JC.componentDraw().resetView();


                                    var renderLayerTime=setInterval(function(){
                                        if (canvas._objects[3].dType=="BackgroundImage"){
                                            clearInterval(renderLayerTime);


                                            var canvasObjects=canvas.getObjects(); 
                                            var layerData=_JC.layer.render.objectToLayer(canvasObjects,0);
                                            _JC.layer.render.renderLayerHtml($("#pageLayer"),0,layerData);
                                           
                                        }else{
                                            console.log("canvas rendering");
                                        }
                                    },1000);

                        
                        
                        setTimeout(function() {
                            _JC.switchPage=true;

                            //关闭加载loading层
                            layer.close(loadEvent);


                        }, 1000);


                        var mapParm = {};
                        mapParm.zoom = getThumbnailZoom(_JC.paperSize.bleedWidth, _JC.paperSize.bleedHeight, minThumbnail, maxThumbnail);

                        var offset = Math.ceil(mapParm.zoom);
                        mapParm.width = _JC.paperSize.bleedWidth - parseInt(mapParm.zoom);
                        mapParm.height = _JC.paperSize.bleedHeight - parseInt(mapParm.zoom);


                        for (var p = 0; p < _JC.pagesDuplicate.length; p++) { 

                            for (var d=0;d<_JC.pagesDuplicate[p].length;d++){

                                if (_JC.pagesDuplicate[p][d].isValid * 1==0){

                                    if (_JC.pagesDuplicate[p][d].pageCode==_JC.canvasConfig.recordPointer.pointerPageCode){
                                        mapParm.x = _JC.canvasPaddX * mapParm.zoom + offset;
                                        mapParm.y = _JC.canvasPaddY * mapParm.zoom + offset;
                                    }else{
                                        mapParm.x=0;
                                        mapParm.y=0;
                                    }

                                    _JC.pagesDuplicate[p][d].previewUrl="";

                                    var _theProcess = {};
                                        _theProcess.type = "createDupThumbnail";
                                        _theProcess.parm = {};
                                        _theProcess.parm.mapParm = mapParm;
                                        _theProcess.parm.canvasCode = _JC.pagesDuplicate[p][d];
                                        _theProcess.parm.pageSort = p + "";
                                        _theProcess.parm.pageNo = _JC.pagesDuplicate[p][d].No + "";
                                        _theProcess.parm.pageCode=_JC.pagesDuplicate[p][d].pageCode + "";

                                    var theProcess = JSON.parse(JSON.stringify(_theProcess));
                                    timerProcess.push(theProcess); 
                                    
                                }

                            }
                        }
                        transactionProcess();
                    })


                });

            });

        });
    }
});


//顶部导航 刷新按钮
$(".RefreshPage").on("click", function() {
    if ($(this).hasClass("noneClick") || _JC.undoGroupSource != null) {
        return;
    }
    _JC.componentDraw().resetView(function() {
        layer.msg("Success");
    });
});

//顶部导航 左翦头切换页面
$(".prePage").on("click", function() {
    console.log("click prePage");
    if ($(this).hasClass("noneClick") || _JC.undoGroupSource != null) {
        return;
    } else if (_JC.switchPage == false) {
        layer.msg("Please wait", {
            time: 1000,
            shade: [0.3, '#000', true]
        });
        return;
    } else if (_JC.switchPage) {
        $(".prePage").addClass("noneClick");
        _JC.switchPage = false;
        var parm = {};
        parm.cunterPage = _JC.cunterPage - 1;
        parm.templatePages = _JC.templateData.templatePages;
        var pageCount = updatePageNav(parm);
        //加载loading层
        var loadEvent = layer.load(2, {
            time: 10 * 1000,
            shade: [0.3, '#393D49']
        });
        if (parm.cunterPage >= 0) {
            //生成并保存该副本base64图片 -> 并自动保存上传服务器
            var mapParm = {};
            mapParm.zoom = getThumbnailZoom(_JC.paperSize.bleedWidth, _JC.paperSize.bleedHeight, minThumbnail, maxThumbnail);
            var offset = Math.ceil(mapParm.zoom);
            mapParm.x = _JC.canvasPaddX * mapParm.zoom + offset;
            mapParm.y = _JC.canvasPaddY * mapParm.zoom + offset;
            mapParm.width = _JC.paperSize.bleedWidth - parseInt(mapParm.zoom);
            mapParm.height = _JC.paperSize.bleedHeight - parseInt(mapParm.zoom);
            var canvasCode = canvas.toJSON(_JC.canvasConfig.outFiled);
            //当前页码、副本号
            var pageSort = _JC.cunterPage * 1;
            var pageNo = canvasCode.No;
            var _theProcess = {};
            _theProcess.type = "createDupThumbnail";
            _theProcess.parm = {};
            _theProcess.parm.mapParm = mapParm;
            _theProcess.parm.canvasCode = canvasCode;
            _theProcess.parm.pageSort = pageSort + "";
            _theProcess.parm.pageNo = pageNo + "";
            var theProcess = JSON.parse(JSON.stringify(_theProcess));
            timerProcess.push(theProcess);
            //后台执行-生成切换前页面的缩略图到对应副本
            if (_JC.drawing) {
                transactionProcess();
            }
            //_JC.drawing=false;
            //跳转上一页
            var pageParm = {};
            pageParm.pageCode = _JC.templateData.templatePages[_JC.cunterPage - 1].pageCode;
            pageParm.file = "";
            _JC.templateAffair().cutoverTemplatePage(pageParm, function() {
          
                _JC.componentDraw().resetView(function() {
                    if (_JC.switchPage == false) {
                        setTimeout(function() {
                            _JC.switchPage = true;
                            _JC.drawing = false;
                        }, 1000);
                    }
                  
                    //关闭加载loading层
                    layer.close(loadEvent);
                });
                _JC.cunterPage = _JC.cunterPage - 1;
                parm.cunterPage = _JC.cunterPage * 1;
                updatePageNav(parm);
                if (_JC.designModule != "mm") {
                    setTimeout(function() {
                        //关闭加载loading层
                        layer.close(loadEvent);
                    }, 1000);
                }
                //是否刷新图层窗口
                if (levelWindow != null) {
                    setTimeout(function() {
                        levelWindow.loadLayer();
                    }, 1000);
                }
            })
        }
    }
});
//右翦头切换页面 switchPage
$(".nextPage").on("click", function() {
    console.log("click nextPage");
    if ($(this).hasClass("noneClick") || _JC.undoGroupSource != null) {
        return;
    } else if (_JC.switchPage == false) {
        layer.msg("Please wait", {
            time: 1000,
            shade: [0.3, '#000', true]
        });
        return;
    } else if (_JC.switchPage) {
        $(".nextPage").addClass("noneClick");
        _JC.switchPage = false;
        var parm = {};
        parm.cunterPage = _JC.cunterPage + 1;
        parm.templatePages = _JC.templateData.templatePages;
        var pageCount = updatePageNav(parm);
        if (pageCount >= parm.cunterPage) {
            //加载loading层
            var loadEvent = layer.load(2, {
                time: 10 * 1000,
                shade: [0.3, '#393D49']
            });
            //生成并保存该副本base64图片 -> 并自动保存上传服务器
            var mapParm = {};
            mapParm.zoom = getThumbnailZoom(_JC.paperSize.bleedWidth, _JC.paperSize.bleedHeight, minThumbnail, maxThumbnail);
            var offset = Math.ceil(mapParm.zoom);
            mapParm.x = _JC.canvasPaddX * mapParm.zoom + offset;
            mapParm.y = _JC.canvasPaddY * mapParm.zoom + offset;
            mapParm.width = _JC.paperSize.bleedWidth - parseInt(mapParm.zoom);
            mapParm.height = _JC.paperSize.bleedHeight - parseInt(mapParm.zoom);
            var canvasCode = canvas.toJSON(_JC.canvasConfig.outFiled);
            //当前页码、副本号
            var pageSort = _JC.cunterPage * 1;
            var pageNo = canvasCode.No;
            var _theProcess = {};
            _theProcess.type = "createDupThumbnail";
            _theProcess.parm = {};
            _theProcess.parm.mapParm = mapParm;
            _theProcess.parm.canvasCode = canvasCode;
            _theProcess.parm.pageSort = pageSort + "";
            _theProcess.parm.pageNo = pageNo + "";
            var theProcess = JSON.parse(JSON.stringify(_theProcess));
            timerProcess.push(theProcess);
            //后台执行-生成切换前页面的缩略图到对应副本
            if (_JC.drawing) {
                transactionProcess();
            }
            //_JC.drawing=false;
            var pageParm = {};
            pageParm.pageCode = _JC.templateData.templatePages[_JC.cunterPage + 1].pageCode;
            pageParm.file = "";
            _JC.templateAffair().cutoverTemplatePage(pageParm, function() {
                _JC.componentDraw().resetView(function() {
                    setTimeout(function() {
                        _JC.switchPage = true;
                        _JC.drawing = false;
                    }, 1000);
                    //关闭加载loading层
                    layer.close(loadEvent);
                });
                _JC.cunterPage = _JC.cunterPage + 1;
                parm.cunterPage = _JC.cunterPage * 1;
                updatePageNav(parm);
                if (_JC.designModule != "mm") {
                    setTimeout(function() {
                        //关闭加载loading层
                        layer.close(loadEvent);
                    }, 1000);
                }
                //是否刷新图层窗口
                if (levelWindow != null) {
                    setTimeout(function() {
                        levelWindow.loadLayer();
                    }, 1000);
                }
            })
        }
    }
});
//新增页面
$("#newPage").click(function(event) {
    event.stopPropagation();
    if ($(this).hasClass("noneClick") || _JC.undoGroupSource != null) {
        return;
    } else {
        if (_JC.templateData.templateCode == "") {
            layer.msg("Cannot find template configuration");
            return false;
        } else {
            _JC.templateAffair().insertPage(null, function(pageSort) {
                //更新总页数
                // var parm = {};
                // parm.cunterPage = _JC.cunterPage;
                // parm.templatePages = _JC.templateData.templatePages;
                renderPagesItem();
                // layer.msg("Success");
            });
        }
    }
});

//页面子菜单点击事件
$(".pageMenu .menuOption").click(function() {

    var action=$(this).attr("data-action");
    if (!isEmpty(action)){

        switch (action){

            case "newPage":

                if (_JC.templateData.templateCode == "") {
                    layer.msg("Cannot find template configuration");
                    return false;
                } else {
                    _JC.templateAffair().insertPage(null, function(pageSort) {
                        //更新总页数
                        renderPagesItem();
                    });
                }

            break;
            case "copyPage":

                var _pageCode=$(this).parent().attr("data-pageCode");
                var cunterPageCode=_JC.canvasConfig.recordPointer.pointerPageCode;

                if (_pageCode==cunterPageCode && _JC.undoGroupSource!=null){

                    _JC.componentDraw().composeGroup();
                    var parm={pageCode:_pageCode};
                    setTimeout(function() {
                        
                        _JC.templateAffair().copyPage(parm, function(pageSort) {
                            renderPagesItem();
                            layer.msg("Success");
                        });
                        
                    },200);

                }else{
                    
                    if (!isEmpty(_pageCode)){
                        var parm={pageCode:_pageCode};
                        _JC.templateAffair().copyPage(parm, function(pageSort) {
                            renderPagesItem();
                            layer.msg("Success");
                        });
                    }
                }

            break;
            case "deletePage":
                
                var _pageCode=$(this).parent().attr("data-pageCode");
                var cunterPageCode=_JC.canvasConfig.recordPointer.pointerPageCode;
                if (_pageCode==cunterPageCode && _JC.undoGroupSource!=null){
                    //编辑分组时不能删除该页面
                    layer.msg("Edit group prohibits deletion of this page");
                    return;
                }else{
                    
                    if (_JC.templateData.templateCode == "") {
                        layer.msg("Cannot find template configuration");
                        return false;
                    } else {
                        
                        var pageCount = _JC.templateData.templatePages.length;
                        if (pageCount <= 1) {
                            layer.msg("This is the final page");
                        } else {
    
                            var delPageCode=$(this).parent().attr("data-pageCode");
       
                            layer.confirm('Confirm to delete the page? Unrecoverable', {
                                title: 'Warning',
                                btn: ['Confirm', 'Cancel'] //按钮
                            }, function(index) {
                                //确定
                                layer.close();
                                //加载loading层
                                var loadEvent = layer.load(2, {
                                    time: 10 * 1000,
                                    shade: [0.3, '#393D49']
                                });                        
                                
                                var cunterPageCode=_JC.canvasConfig.recordPointer.pointerPageCode +"";
    
                                _JC.templateAffair().deletePage({
                                    pageCode: delPageCode
                                }, async function(toSort) {
                       
                                    if (toSort!==-1){
                                        _JC.componentDraw().resetView();
                                    }
    
                                    var parm = {};
                                    parm.cunterPage = toSort;
                                    parm.templatePages = _JC.templateData.templatePages;
                
                                    if (_JC.templateData.hasOwnProperty("deletePagesCode")) {
                                        _JC.templateData.deletePagesCode.push(delPageCode);
                                    } else {
                                        _JC.templateData.deletePagesCode = [];
                                        _JC.templateData.deletePagesCode.push(delPageCode);
                                    }
                                    var tmpOption = _JC.canvasConfig.pageOption;
                                    var slicesPage = _JC.canvasConfig.slicesPage;
                                    var pageCount = _JC.templateAffair().getTemplateValidPages();
    
                                    var pIndex = _JC.cunterPage;
                                    if (_JC.cunterPage + 1 >= pageCount) {
                                        pIndex = _JC.cunterPage;// - 1;
                     
                                    }
                                    
                                    if (cunterPageCode==delPageCode){
                                        setTimeout(function() {
                                            var _objects = canvas.getObjects();
                                            for (var i = 0; i < _objects.length; i++) {
                                                var _this = _objects[i];
                                                //刷新当前页面组件
                                                if (_this.dType == "PageNo") {
                                                    var pnIndex = 0;
                                                    if (_this.hasOwnProperty("pnIndex") == true) {
                                                        pnIndex = _this.pnIndex * 1;
                                                    }
                                                    _this.set({
                                                        text: ("P" + (pIndex * slicesPage.length + slicesPage[pnIndex]))
                                                    });
                                                }
                                            }
                                            canvas.renderAll();
                                        
                                           var layerData=_JC.layer.render.objectToLayer(_objects,0);
                                           _JC.layer.render.renderLayerHtml($("#pageLayer"),0,layerData);
                                           zoomScale(true,-1);
                                           console.log("delete current page");
                                        }, 500);
                                    }
                                    
                                    
    
                                    renderPagesItem();
                                    hideCreatePagesThumbnail(0, null);
                                    //关闭加载loading层
                                    layer.close(loadEvent);
                                    layer.msg("Success");
                                });
                            }, function() {
                                //取消
                            });
                        }
                    }
                    
                }

            break;
            case "importPage":
                if ( _JC.undoGroupSource == null) {
                    //更新当前页面主副本到模板副本集
                    var canvasJson = _JC.canvasSave().screeningDuplicate(canvas.toJSON(_JC.canvasConfig.outFiled), _JC.canvasPaddX, _JC.canvasPaddY);
                    //更新到当前页的副本集
                    _JC.canvasSave().updatePageDuplicate(_JC.canvasConfig.recordPointer.pointerPageNo, canvasJson);
                    //更新到模板所有页副本集 这里要修改为 当前页 cunterPage
                    _JC.pagesDuplicate[_JC.cunterPage] = _JC.templateData.cunterPageDuplicate;
                    var templateView = layer.open({
                        id: 'importPage',
                        type: 2,
                        title: 'Import Template - Page ' + (_JC.cunterPage + 1),
                        shade: 0,
                        content: "/makroDigital/marketingTemplate/importPage",
                        maxmin: true,
                        yes: function(index, layero) {
                            console.log("open yes");
                        },
                        success: function(layero, index) {
                            console.log("open sucess");
                        },
                        end:function(){
                            console.log("end");
                            console.log(_JC.templateData);
                        }
                    });
                    layer.full(templateView);
                }

            break;
            case "pagesDuplicate":

                if ($(this).hasClass("lock")){
                    return;
                }else{

                    var pageCode=$(this).parent().attr("data-pageCode");
                    if (pageCode!=_JC.canvasConfig.recordPointer.pointerPageCode){
                        return;
                    }else{

                        //生成并保存该副本base64图片 -> 并自动保存上传服务器
                        var mapParm = {};
                        mapParm.zoom = getThumbnailZoom(_JC.paperSize.bleedWidth, _JC.paperSize.bleedHeight, minThumbnail, maxThumbnail);
                        var offset = Math.ceil(mapParm.zoom);
                        mapParm.x = _JC.canvasPaddX * mapParm.zoom + offset;
                        mapParm.y = _JC.canvasPaddY * mapParm.zoom + offset;
                        mapParm.width = _JC.paperSize.bleedWidth - parseInt(mapParm.zoom);
                        mapParm.height = _JC.paperSize.bleedHeight - parseInt(mapParm.zoom);
                        var canvasCode = canvas.toJSON(_JC.canvasConfig.outFiled);
                        //当前页码、副本号
                        var pageSort = _JC.cunterPage;
                        var pageNo = canvasCode.No;




                        //生成切换前页面的缩略图到对应副本
                        createDupThumbnail(mapParm, canvasCode, thumbnailCanvas, _JC, pageSort, pageNo,pageCode, function(previewUrl) {
                            console.log("pagesDuplicate 1");
                            //更新当前页面主副本到模板副本集
                            var canvasJson = _JC.canvasSave().screeningDuplicate(canvas.toJSON(_JC.canvasConfig.outFiled), _JC.canvasPaddX, _JC.canvasPaddY);
                            canvasJson.previewUrl = previewUrl;
                            //更新到当前页的副本集
                            _JC.canvasSave().updatePageDuplicate(_JC.canvasConfig.recordPointer.pointerPageNo, canvasJson);
                            //更新到模板所有页副本集 当前页 设计内容
                            _JC.pagesDuplicate[_JC.cunterPage] = _JC.templateData.cunterPageDuplicate;
                            //更新到模板所有页副本集 当前页 内容缩略图
                            var duplicates = _JC.pagesDuplicate[pageSort];
                            for (var i = 0; i < duplicates.length; i++) {
                                if (duplicates[i].No * 1 == pageNo * 1) {

                                    //删除原缩略图
                                    if (duplicates[i].previewUrl) {
                                        if (duplicates[i].previewUrl.substr(0,4)=="http"){
                                            layui.uploadAPI.cancel([duplicates[i].previewUrl], function() {});
                                        }
                                    }
                                    //更新新图
                                    canvas.previewUrl = previewUrl;
                                    _JC.pagesDuplicate[pageSort][i].previewUrl = previewUrl;
                                    _JC.templateData.cunterPageDuplicate[i].previewUrl = previewUrl;
                                    break;
                                }
                            }
                            var duplicateView = layer.open({
                                id: 'duplicateView',
                                type: 2,
                                title: 'History Version',
                                shade: 0,
                                content: "/makroDigital/marketingTemplate/duplicate",
                                maxmin: false,
                                yes: function(index, layero) {},
                                success: function(layero, index) {}
                            });
                            layer.full(duplicateView);
                        });
                    }
                }

            break;
            case "createDuplicate":

                //更新当前页面主副本到模板副本集
                var canvasJson = _JC.canvasSave().screeningDuplicate(canvas.toJSON(_JC.canvasConfig.outFiled), _JC.canvasPaddX, _JC.canvasPaddY);
                //更新到当前页的副本集
                _JC.canvasSave().updatePageDuplicate(_JC.canvasConfig.recordPointer.pointerPageNo, canvasJson);
                //更新到模板所有页副本集 这里要修改为 当前页 cunterPage
                _JC.pagesDuplicate[_JC.cunterPage] = _JC.templateData.cunterPageDuplicate;
                _JC.canvasSave().createPageDuplicate(function() {
                    layer.msg("Success");
                });

            break;
        }

    }

});

//复制页面
$(".copyPage").click(function() {
    if ($(this).hasClass("noneClick") || _JC.undoGroupSource != null) {
        // || _JC.canvasConfig.isMorePagesDraw 
        return;
    } else {
        if (_JC.templateData.templateCode == "") {
            layer.msg("Cannot find template configuration");
            return false;
        } else {
            _JC.templateAffair().copyPage(null, function(pageSort) {
                //更新总页数
                var parm = {};
                parm.cunterPage = _JC.cunterPage;
                parm.templatePages = _JC.templateData.templatePages;
                renderPagesItem(parm);
                layer.msg("Success");
            });
        }
    }
});
//删除页面
$(".deletePage").click(function() {
    if ($(this).hasClass("noneClick") || _JC.undoGroupSource != null) {
        //|| _JC.canvasConfig.isMorePagesDraw
        return;
    }

    if (_JC.templateData.templateCode == "") {
        layer.msg("Cannot find template configuration");
        return false;
    } else {
        var pageCount = _JC.templateData.templatePages.length;
        if (pageCount <= 1) {
            layer.msg("This is the final page");
        } else {
            layer.confirm('Confirm to delete the page? Unrecoverable', {
                title: 'Warning',
                btn: ['Confirm', 'Cancel'] //按钮
            }, function(index) {
                //确定
                layer.close();
                //加载loading层
                var loadEvent = layer.load(2, {
                    time: 10 * 1000,
                    shade: [0.3, '#393D49']
                });

                var delPageCode = _JC.templateData.templatePages[_JC.cunterPage].pageCode;
                _JC.templateAffair().deletePage({
                    pageSort: _JC.cunterPage
                }, function(toSort) {
                    //更新总页数
                    var parm = {};
                    parm.cunterPage = toSort;
                    parm.templatePages = _JC.templateData.templatePages;
                    updatePageNav(parm);
                    //是否刷新图层窗口
                    if (levelWindow != null) {
                        levelWindow.loadLayer();
                    }
                    if (_JC.templateData.hasOwnProperty("deletePagesCode")) {
                        _JC.templateData.deletePagesCode.push(delPageCode);
                    } else {
                        _JC.templateData.deletePagesCode = [];
                        _JC.templateData.deletePagesCode.push(delPageCode);
                    }
                    var tmpOption = _JC.canvasConfig.pageOption;
                    var slicesPage = _JC.canvasConfig.slicesPage;
                    var pageCount = _JC.templateAffair().getTemplateValidPages();
                    var pIndex = _JC.cunterPage;
                    if (_JC.cunterPage + 1 >= pageCount) {
                        pIndex = _JC.cunterPage - 1;
                        _JC.cunterPage--;
                    }
                    var _objects = canvas.getObjects();
                    for (var i = 0; i < _objects.length; i++) {
                        var _this = _objects[i];
                        //刷新当前页面组件
                        if (_this.dType == "PageNo") {
                            var pnIndex = 0;
                            if (_this.hasOwnProperty("pnIndex") == true) {
                                pnIndex = _this.pnIndex * 1;
                            }
                            _this.set({
                                text: ("P" + (pIndex * slicesPage.length + slicesPage[pnIndex]))
                            });
                        }
                    }
                    canvas.renderAll();
                    hideCreatePagesThumbnail(0, null);
                    //关闭加载loading层
                    layer.close(loadEvent);
                    layer.msg("Success");
                });
            }, function() {
                //取消
            });
        }
    }
});
//打开MM商品清单层
$(".mmDetails").on("click", function() {
    var mmName = $(".mmName").html();
    var winW = $(document.body).width();
    var index_page = layer.open({
        type: 2,
        title: 'Product List ' + mmName,
        id: 'Product List',
        content: '/makroDigital/marketingActivity/product/' + current_id,
        maxmin: true,
        area: [parseInt(winW * 0.8) + 'px', parseInt(winW * 0.4) + 'px'],
        btn: [],
        yes: function(index, layero) {
            var iframeWindow = window['layui-layer-iframe' + index],
                submitID = 'LAY-picture-select-submit',
                submit = layero.find('iframe').contents().find('#' + submitID);
        }
    });
});
//打开图层显示层
$("#preViewH5").click(function() {
    /*
    if ($(this).hasClass("noneClick")!=true && _JC.undoGroupSource==null){ 
        var _mmCode=getUrlParm(-1);
        var features = "height="+(_JC.paperSize.paperHeight * (600/_JC.paperSize.paperWidth))+", width=600, top=0, left=0, toolbar=no, menubar=no,scrollbars=no,resizable=no, location=no, status=no";  //
        var url="/mmAdmin/MM/preView/"+_mmCode;
        window.open(url, "newW", features);
    }*/
    if ($(this).hasClass("noneClick") != true && _JC.undoGroupSource == null) {
        var index_page = layer.open({
            type: 2,
            title: 'Preview ',
            id: 'PreviewH5',
            content: '/makroDigital/marketingActivity/preview/' + current_id,
            maxmin: true,
            area: ['800px', '600px'],
            btn: [],
            yes: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index],
                    submitID = 'LAY-picture-select-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);
            }
        });
        layer.full(index_page);
    }
});
//打开图层面板
$(".pageEvent.pageLevel").click(function() {
    if ($(this).hasClass("noneClick") != true) {
        _JC.pageEvent.openPageLevel(null, function() {
            var _top = $('.pageEvent.pageLevel').offset().top;
            var _left = $('.pageEvent.pageLevel').offset().left;
            var level_page = layer.open({
                id: 'Level',
                type: 2,
                title: 'Layer',
                shade: 0,
                content: "/makroDigital/marketingTemplate/level",
                maxmin: true,
                area: ['330px', '560px'],
                offset: [(_top + 40) + 'px', _left + 'px'],
                yes: function(index, layero) {},
                success: function(layero, index) {
                    levelWindow = window[layero.find('iframe')[0]['name']];
                    setTimeout(function() {
                        layero.css({
                            'max-width': '330px'
                        })
                    })
                },
                end: function() {
                    //用于识别图层弹出窗是否有打开，在切换页面时刷新当前图层
                    levelWindow = null;
                }
            });
        });
    }
});
//打开同屏预览面板
$(".pageEvent.preview").click(function() {
    if ($(this).hasClass("noneClick") != true && _JC.undoGroupSource == null) {
        //更新当前页面主副本到模板副本集
        var canvasJson = _JC.canvasSave().screeningDuplicate(canvas.toJSON(_JC.canvasConfig.outFiled), _JC.canvasPaddX, _JC.canvasPaddY);
        //更新到当前页的副本集
        _JC.canvasSave().updatePageDuplicate(_JC.canvasConfig.recordPointer.pointerPageNo, canvasJson);
        //更新到模板所有页副本集 这里要修改为 当前页 cunterPage
        _JC.pagesDuplicate[_JC.cunterPage] = _JC.templateData.cunterPageDuplicate;
        //生成并保存该副本base64图片 -> 并自动保存上传服务器
        var mapParm = {};
        mapParm.zoom = getThumbnailZoom(_JC.paperSize.bleedWidth, _JC.paperSize.bleedHeight, minThumbnail, maxThumbnail);
        var offset = Math.ceil(mapParm.zoom);
        mapParm.x = _JC.canvasPaddX * mapParm.zoom + offset;
        mapParm.y = _JC.canvasPaddY * mapParm.zoom + offset;
        mapParm.width = _JC.paperSize.bleedWidth - parseInt(mapParm.zoom);
        mapParm.height = _JC.paperSize.bleedHeight - parseInt(mapParm.zoom);
        var canvasCode = canvas.toJSON(_JC.canvasConfig.outFiled);
        //当前页码、副本号
        var pageSort = _JC.cunterPage;
        var pageNo = canvasCode.No;
        //生成切换前页面的缩略图到对应副本
        createDupThumbnail(mapParm, canvasCode, thumbnailCanvas, _JC, pageSort, pageNo, function(previewUrl) {
            //更新当前页面主副本
            var duplicates = _JC.pagesDuplicate[pageSort];
            if (duplicates != undefined) {
                for (var i = 0; i < duplicates.length; i++) {
                    if (duplicates[i].No * 1 == pageNo * 1) {
                        //删除原缩略图
                        if (duplicates[i].previewUrl) {
                            layui.uploadAPI.cancel([duplicates[i].previewUrl], function() {});
                        }
                        //更新新图
                        canvas.previewUrl = previewUrl;
                        _JC.pagesDuplicate[pageSort][i].previewUrl = previewUrl;
                        _JC.templateData.cunterPageDuplicate[i].previewUrl = previewUrl;
                        break;
                    }
                }
            }
            var templateView = layer.open({
                id: 'templateView',
                type: 2,
                title: 'Template pages view',
                shade: 0,
                content: "/makroDigital/marketingTemplate/preview",
                maxmin: false,
                yes: function(index, layero) {},
                success: function(layero, index) {}
            });
            layer.full(templateView);
        });
    }
});
//打开Design Frame窗口
$(".pageEvent.designFrame").click(function() {
    var templateView = layer.open({
        id: 'designFrame',
        type: 2,
        title: 'Template Design Frame',
        shade: 0,
        content: "/makroDigital/marketingTemplate/previewDesignFrame",
        maxmin: true,
        area: ['1040px', '650px'],
        yes: function(index, layero) {},
        success: function(layero, index) {}
    });
});
//模板导入页面
$(".pageEvent.importPage").click(function() {
    if ($(this).hasClass("noneClick") != true && _JC.undoGroupSource == null) {
        //更新当前页面主副本到模板副本集
        var canvasJson = _JC.canvasSave().screeningDuplicate(canvas.toJSON(_JC.canvasConfig.outFiled), _JC.canvasPaddX, _JC.canvasPaddY);
        //更新到当前页的副本集
        _JC.canvasSave().updatePageDuplicate(_JC.canvasConfig.recordPointer.pointerPageNo, canvasJson);
        //更新到模板所有页副本集 这里要修改为 当前页 cunterPage
        _JC.pagesDuplicate[_JC.cunterPage] = _JC.templateData.cunterPageDuplicate;
        var templateView = layer.open({
            id: 'importPage',
            type: 2,
            title: 'Import Template - Page ' + (_JC.cunterPage + 1),
            shade: 0,
            content: "/makroDigital/marketingTemplate/importPage",
            maxmin: true,
            yes: function(index, layero) {},
            success: function(layero, index) {}
        });
        layer.full(templateView);
    }
});
/** 画布操作类按钮事件邦定 **/
//撤消
$("#unDo").click(function() {
    _JC.canvasDraw().canvasUndo();
})
//重做
$("#toDo").click(function() {
    _JC.canvasDraw().canvasTodo();
})
//参考线
$("#DesignLine").click(function() {
    if ($(this).hasClass("act")) {
        $("#hLine,#vLine").hide();
        $(this).removeClass("act");
        _JC.canvasDraw().referenceLineShow(false);
    } else {
        $("#hLine,#vLine").show();
        $(this).addClass("act");
        _JC.canvasDraw().referenceLineShow(true);
    }
})
$("#hLine").mousedown(function(e) {
    $(".horizontalLine").show();
    $(".horizontalLine").css("top", "0px");
})
$("#vLine").mousedown(function(e) {
    $(".verticalLine").show();
    $(".verticalLine").css("left", "0px");
})
/** new UI/UX start */
//左则工具条大图标点击事件，
$(".toolOption .iconBox").click(function() {

    if (lockStatus){
        return;
    }else{

        $(".toolOption").removeClass("act");
        var currentTool = $(this).parent().attr("currentTool");
        console.log(currentTool);
        if (!isEmpty(currentTool)) {
            if (currentTool=="drawPicture") {
                var toolSubMenu = $(this).parent().find(".toolSubMenu");
                var isShowSubMenu = toolSubMenu.css('display') == 'none';

                $(".toolSubMenu").hide();
                if (isShowSubMenu) {
                    toolSubMenu.show();
                } else {
                    toolSubMenu.hide();
                }
            } else {
                $(this).parent().addClass("act");
                $(".toolSubMenu").hide();
                $("#" + currentTool).click();
            }
        }
    }
});
//选择工具类型
$("#selectComponent").click(function() {

    $(this).parent().hide();
    $(this).parent().parent().find(".selectedToolIcon svg").html($(this).find(".icon svg").html());
    $(".toolOption").removeClass("act");
    $(this).parent().parent().addClass("act");
    $(".toolSubMenu").hide();

    _JC.mouseMode = 0;
    _JC.pannStart = false;
    _JC.panning = false;
    

    if (!lockStatus){

        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'default';
        _JC.canvasDraw().deleteObject({
            id: "panningBox"
        });

        canvas.selection = true;
        canvas.skipTargetFind = false;
        _JC.mouseDrawShapeStatus = false;
        canvas.selectable=true;
        canvas.renderAll();
        var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><g opacity="1" transform="translate(2 2)  rotate(0 6 6)"><path id="形状结合" fill-rule="evenodd" fill="currentColor" transform="translate(0.6366642549999142 1.9602259944999787)  rotate(0 5.363335745 4.039774005500001)" opacity="1" d="M3.57,5.82L1.59,3.84C1.3,3.55 0.82,3.55 0.53,3.84L0.53,3.84C0.39,3.98 0.31,4.17 0.31,4.37C0.31,4.57 0.39,4.76 0.53,4.9L3,7.37C3.39,7.76 4.02,7.76 4.41,7.37L10.2,1.59C10.49,1.3 10.49,0.82 10.2,0.53L10.2,0.53C10.06,0.39 9.87,0.31 9.67,0.31C9.47,0.31 9.28,0.39 9.14,0.53L3.85,5.82C3.77,5.9 3.65,5.9 3.57,5.82Z "></path></g></g></svg>';
        $(this).parent().find(".activeSelectBox svg").html("");
        $(this).find(".activeSelectBox").html(iconSvg);
        $(this).find(".activeSelectBox svg path").css({
            "color": "#008efa",
            "fill": "currentColor"
        });
        $(this).parent().parent().attr("title", $(this).find(".menuName").html());
        $(this).parent().parent().attr("currentTool", $(this).attr("id"));
        if (_JC.isPixSelect != true) {
            canvas.set({
                selectionFullyContained: false,
                selectionKey: "shiftKey",
                preserveObjectStacking: true
            });
            _JC.canvasDraw().reDrawComponentControls();
            _JC.isPixSelect = true;
            _JC.selectedObject = null;
            _JC.cunterObj = null;
            _JC.mouseDrawShapeStatus=false;
            canvas.discardActiveObject();
            canvas.renderAll();
            _JC.pageEvent.showBackgroundImage();
            $(".mouseComponentBtn").addClass("selected");
            $(".mouseGroupBtn").removeClass("selected");
        }

    }else{

        canvas.skipTargetFind = true;
        canvas.selection = false;
        _JC.mouseDrawShapeStatus = false;
        canvas.selectable=false;
        canvas.renderAll();

    }
    

})
$("#mouseGroupBtnTool").click(function() {
    $(this).parent().hide();
    $(this).parent().parent().find(".selectedToolIcon svg").html($(this).find(".icon svg").html());
    _JC.mouseMode = 0;
    _JC.canvasDraw().deleteObject({
        id: "panningBox"
    });
    _JC.pannStart = false;
    _JC.panning = false;
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'default';
    canvas.skipTargetFind = false;
    canvas.renderAll();

    var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><g opacity="1" transform="translate(2 2)  rotate(0 6 6)"><path id="形状结合" fill-rule="evenodd" fill="currentColor" transform="translate(0.6366642549999142 1.9602259944999787)  rotate(0 5.363335745 4.039774005500001)" opacity="1" d="M3.57,5.82L1.59,3.84C1.3,3.55 0.82,3.55 0.53,3.84L0.53,3.84C0.39,3.98 0.31,4.17 0.31,4.37C0.31,4.57 0.39,4.76 0.53,4.9L3,7.37C3.39,7.76 4.02,7.76 4.41,7.37L10.2,1.59C10.49,1.3 10.49,0.82 10.2,0.53L10.2,0.53C10.06,0.39 9.87,0.31 9.67,0.31C9.47,0.31 9.28,0.39 9.14,0.53L3.85,5.82C3.77,5.9 3.65,5.9 3.57,5.82Z "></path></g></g></svg>';
    $(this).parent().find(".activeSelectBox svg").html("");
    $(this).find(".activeSelectBox").html(iconSvg);
    $(this).find(".activeSelectBox svg path").css({
        "color": "#008efa",
        "fill": "currentColor"
    });

    $(this).parent().parent().attr("title", $(this).find(".menuName").html());
    $(this).parent().parent().attr("currentTool", $(this).attr("id"));


    canvas.set({
        selectionFullyContained: false,
        selectionKey: null,
        preserveObjectStacking: true
    });
    if (_JC.isPixSelect != false) {
        _JC.isPixSelect = false;
        _JC.selectedObject = null;
        _JC.cunterObj = null;
        canvas.discardActiveObject();
        canvas.renderAll();
        _JC.pageEvent.showBackgroundImage();
        $(".mouseGroupBtn").addClass("selected");
        $(".mouseComponentBtn").removeClass("selected");
    }
})

$(".mouseGroupBtn").click(function(){
    canvas.set({selectionFullyContained:false,selectionKey:null,preserveObjectStacking:true});
    if (_JC.isPixSelect!=false){
        _JC.isPixSelect=false;
        _JC.selectedObject=null;
        _JC.cunterObj=null;
        canvas.discardActiveObject();
        canvas.renderAll();
        _JC.pageEvent.showBackgroundImage();
        $(".mouseGroupBtn").addClass("selected");
        $(".mouseComponentBtn").removeClass("selected");
    }

})

//移动视图
$("#handCanvas").click(function() {
    $(this).parent().hide();
    $(this).parent().parent().find(".selectedToolIcon svg").html($(this).find(".icon svg").html());
    $(".toolOption").removeClass("act");
    $(this).parent().parent().addClass("act");
    $(".toolSubMenu").hide();
    _JC.mouseMode = 1;
    // _JC.isPixSelect = true;
    /*if (_JC.panning == true) {
        _JC.canvasDraw().deleteObject({
            id: "panningBox"
        });
    }else{
        _JC.canvasDraw().drawPanningBox();
    }*/
    var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><g opacity="1" transform="translate(2 2)  rotate(0 6 6)"><path id="形状结合" fill-rule="evenodd" fill="currentColor" transform="translate(0.6366642549999142 1.9602259944999787)  rotate(0 5.363335745 4.039774005500001)" opacity="1" d="M3.57,5.82L1.59,3.84C1.3,3.55 0.82,3.55 0.53,3.84L0.53,3.84C0.39,3.98 0.31,4.17 0.31,4.37C0.31,4.57 0.39,4.76 0.53,4.9L3,7.37C3.39,7.76 4.02,7.76 4.41,7.37L10.2,1.59C10.49,1.3 10.49,0.82 10.2,0.53L10.2,0.53C10.06,0.39 9.87,0.31 9.67,0.31C9.47,0.31 9.28,0.39 9.14,0.53L3.85,5.82C3.77,5.9 3.65,5.9 3.57,5.82Z "></path></g></g></svg>';
    $(this).parent().find(".activeSelectBox svg").html("");
    $(this).find(".activeSelectBox").html(iconSvg);
    $(this).find(".activeSelectBox svg path").css({
        "color": "#008efa",
        "fill": "currentColor"
    });
    $(this).parent().parent().attr("title", $(this).find(".menuName").html());
    $(this).parent().parent().attr("currentTool", $(this).attr("id"));
    event.returnValue = false;
    canvas.selection = false;
    _JC.panning = true;
    canvas.defaultCursor = 'grab';
    canvas.hoverCursor = 'grab';
    $(".upper-canvas").css("cursor", "grab");
    canvas.discardActiveObject();
    canvas.selections = false;
    _JC.mouseDrawShapeStatus=false;
    canvas.skipTargetFind = true;
    canvas.renderAll();

    if (!isEmpty(_JC.selectedObject) && _JC.isPixSelect==false){
        _JC.canvasDraw().drawSelectedControls();
    }

    //_JC.attributesShow().paper();
});
//矩形
$("#drawRect").click(function() {

    if (lockStatus){
        return;
    }

    _JC.mouseMode = 0;
    $(".elementOption").removeClass("act");
    $(".toolOption").removeClass("act");
    $(this).parent().parent().addClass("act");
    $(this).parent().hide();
    $(this).parent().parent().find(".selectedToolIcon svg").html($(this).find(".icon svg").html());
    var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><g opacity="1" transform="translate(2 2)  rotate(0 6 6)"><path id="形状结合" fill-rule="evenodd" fill="currentColor" transform="translate(0.6366642549999142 1.9602259944999787)  rotate(0 5.363335745 4.039774005500001)" opacity="1" d="M3.57,5.82L1.59,3.84C1.3,3.55 0.82,3.55 0.53,3.84L0.53,3.84C0.39,3.98 0.31,4.17 0.31,4.37C0.31,4.57 0.39,4.76 0.53,4.9L3,7.37C3.39,7.76 4.02,7.76 4.41,7.37L10.2,1.59C10.49,1.3 10.49,0.82 10.2,0.53L10.2,0.53C10.06,0.39 9.87,0.31 9.67,0.31C9.47,0.31 9.28,0.39 9.14,0.53L3.85,5.82C3.77,5.9 3.65,5.9 3.57,5.82Z "></path></g></g></svg>';
    $(this).parent().find(".activeSelectBox svg").html("");
    $(this).find(".activeSelectBox").html(iconSvg);
    $(this).find(".activeSelectBox svg path").css({
        "color": "#008efa",
        "fill": "currentColor"
    });
    $(this).parent().parent().attr("title", $(this).find(".menuName").html());
    $(this).parent().parent().attr("currentTool", $(this).attr("id"));
    $(".toolSubMenu").hide();

    canvas.skipTargetFind = true;

    //还原画布鼠标模式
    if (_JC.panning) {
        _JC.canvasDraw().deleteObject({
            id: "panningBox"
        });

        

        _JC.pannStart = false;
        _JC.panning = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'default';

        canvas.renderAll();
    }
    _JC.canvasDraw().drawPanningBox();
    _JC.componentDraw().mouseDrawRect();

});
//直线
$("#drawLine").click(function() {

    if (lockStatus){
        return;
    }

    $(".elementOption").removeClass("act");
    _JC.mouseMode = 0;
    $(".toolOption").removeClass("act");
    $(this).parent().parent().addClass("act");
    $(this).parent().hide();
    $(this).parent().parent().find(".selectedToolIcon svg").html($(this).find(".icon svg").html());
    var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><g opacity="1" transform="translate(2 2)  rotate(0 6 6)"><path id="形状结合" fill-rule="evenodd" fill="currentColor" transform="translate(0.6366642549999142 1.9602259944999787)  rotate(0 5.363335745 4.039774005500001)" opacity="1" d="M3.57,5.82L1.59,3.84C1.3,3.55 0.82,3.55 0.53,3.84L0.53,3.84C0.39,3.98 0.31,4.17 0.31,4.37C0.31,4.57 0.39,4.76 0.53,4.9L3,7.37C3.39,7.76 4.02,7.76 4.41,7.37L10.2,1.59C10.49,1.3 10.49,0.82 10.2,0.53L10.2,0.53C10.06,0.39 9.87,0.31 9.67,0.31C9.47,0.31 9.28,0.39 9.14,0.53L3.85,5.82C3.77,5.9 3.65,5.9 3.57,5.82Z "></path></g></g></svg>';
    $(this).parent().find(".activeSelectBox svg").html("");
    $(this).find(".activeSelectBox").html(iconSvg);
    $(this).find(".activeSelectBox svg path").css({
        "color": "#008efa",
        "fill": "currentColor"
    });
    $(this).parent().parent().attr("title", $(this).find(".menuName").html());
    $(this).parent().parent().attr("currentTool", $(this).attr("id"));
    $(".toolSubMenu").hide();

    canvas.skipTargetFind = true;

    //还原画布鼠标模式
    if (_JC.panning) {
        _JC.canvasDraw().deleteObject({
            id: "panningBox"
        });
        _JC.pannStart = false;
        _JC.panning = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'default';
        canvas.renderAll();
    }

    _JC.canvasDraw().drawPanningBox();
    _JC.componentDraw().mouseDrawLine();

});

//箭头
$("#drawArrow").click(function() {

    if (lockStatus){
        return;
    }

    $(".elementOption").removeClass("act");
    _JC.mouseMode = 0;
    $(".toolOption").removeClass("act");
    $(this).parent().parent().addClass("act");
    $(this).parent().hide();
    $(this).parent().parent().find(".selectedToolIcon svg").html($(this).find(".icon svg").html());
    var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><g opacity="1" transform="translate(2 2)  rotate(0 6 6)"><path id="形状结合" fill-rule="evenodd" fill="currentColor" transform="translate(0.6366642549999142 1.9602259944999787)  rotate(0 5.363335745 4.039774005500001)" opacity="1" d="M3.57,5.82L1.59,3.84C1.3,3.55 0.82,3.55 0.53,3.84L0.53,3.84C0.39,3.98 0.31,4.17 0.31,4.37C0.31,4.57 0.39,4.76 0.53,4.9L3,7.37C3.39,7.76 4.02,7.76 4.41,7.37L10.2,1.59C10.49,1.3 10.49,0.82 10.2,0.53L10.2,0.53C10.06,0.39 9.87,0.31 9.67,0.31C9.47,0.31 9.28,0.39 9.14,0.53L3.85,5.82C3.77,5.9 3.65,5.9 3.57,5.82Z "></path></g></g></svg>';
    $(this).parent().find(".activeSelectBox svg").html("");
    $(this).find(".activeSelectBox").html(iconSvg);
    $(this).find(".activeSelectBox svg path").css({
        "color": "#008efa",
        "fill": "currentColor"
    });
    $(this).parent().parent().attr("title", $(this).find(".menuName").html());
    $(this).parent().parent().attr("currentTool", $(this).attr("id"));
 
    $(".toolSubMenu").hide();

    canvas.skipTargetFind = true;

    //还原画布鼠标模式
    if (_JC.panning) {
        _JC.canvasDraw().deleteObject({
            id: "panningBox"
        });
        _JC.pannStart = false;
        _JC.panning = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'default';
        canvas.renderAll();
    }

    _JC.canvasDraw().drawPanningBox();
    _JC.componentDraw().mouseDrawArrow();

});
//圆形
$("#drawCircle").click(function() {

    if (lockStatus){
        return;
    }


    $(".elementOption").removeClass("act");
    _JC.mouseMode = 0;
    $(".toolOption").removeClass("act");
    $(this).parent().parent().addClass("act");
    $(this).parent().hide();
    $(this).parent().parent().find(".selectedToolIcon svg").html($(this).find(".icon svg").html());
    var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><g opacity="1" transform="translate(2 2)  rotate(0 6 6)"><path id="形状结合" fill-rule="evenodd" fill="currentColor" transform="translate(0.6366642549999142 1.9602259944999787)  rotate(0 5.363335745 4.039774005500001)" opacity="1" d="M3.57,5.82L1.59,3.84C1.3,3.55 0.82,3.55 0.53,3.84L0.53,3.84C0.39,3.98 0.31,4.17 0.31,4.37C0.31,4.57 0.39,4.76 0.53,4.9L3,7.37C3.39,7.76 4.02,7.76 4.41,7.37L10.2,1.59C10.49,1.3 10.49,0.82 10.2,0.53L10.2,0.53C10.06,0.39 9.87,0.31 9.67,0.31C9.47,0.31 9.28,0.39 9.14,0.53L3.85,5.82C3.77,5.9 3.65,5.9 3.57,5.82Z "></path></g></g></svg>';
    $(this).parent().find(".activeSelectBox svg").html("");
    $(this).find(".activeSelectBox").html(iconSvg);
    $(this).find(".activeSelectBox svg path").css({
        "color": "#008efa",
        "fill": "currentColor"
    });
    $(this).parent().parent().attr("title", $(this).find(".menuName").html());
    $(this).parent().parent().attr("currentTool", $(this).attr("id"));
 
    $(".toolSubMenu").hide();

    canvas.skipTargetFind = true;
    //还原画布鼠标模式
    if (_JC.panning) {
        _JC.canvasDraw().deleteObject({
            id: "panningBox"
        });
        _JC.pannStart = false;
        _JC.panning = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'default';
        canvas.renderAll();
    }

    _JC.canvasDraw().drawPanningBox();
    _JC.componentDraw().mouseDrawCircle();

});
//三角形
$("#drawTriangle").click(function() {

    if (lockStatus){
        return;
    }


    $(".elementOption").removeClass("act");
    _JC.mouseMode = 0;
    $(".toolOption").removeClass("act");
    $(this).parent().parent().addClass("act");
    $(this).parent().hide();
    $(this).parent().parent().find(".selectedToolIcon svg").html($(this).find(".icon svg").html());
    var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><g opacity="1" transform="translate(2 2)  rotate(0 6 6)"><path id="形状结合" fill-rule="evenodd" fill="currentColor" transform="translate(0.6366642549999142 1.9602259944999787)  rotate(0 5.363335745 4.039774005500001)" opacity="1" d="M3.57,5.82L1.59,3.84C1.3,3.55 0.82,3.55 0.53,3.84L0.53,3.84C0.39,3.98 0.31,4.17 0.31,4.37C0.31,4.57 0.39,4.76 0.53,4.9L3,7.37C3.39,7.76 4.02,7.76 4.41,7.37L10.2,1.59C10.49,1.3 10.49,0.82 10.2,0.53L10.2,0.53C10.06,0.39 9.87,0.31 9.67,0.31C9.47,0.31 9.28,0.39 9.14,0.53L3.85,5.82C3.77,5.9 3.65,5.9 3.57,5.82Z "></path></g></g></svg>';
    $(this).parent().find(".activeSelectBox svg").html("");
    $(this).find(".activeSelectBox").html(iconSvg);
    $(this).find(".activeSelectBox svg path").css({
        "color": "#008efa",
        "fill": "currentColor"
    });
    $(this).parent().parent().attr("title", $(this).find(".menuName").html());
    $(this).parent().parent().attr("currentTool", $(this).attr("id"));

    $(".toolSubMenu").hide();
 
    canvas.skipTargetFind = true;

    //还原画布鼠标模式
    if (_JC.panning) {
        _JC.canvasDraw().deleteObject({
            id: "panningBox"
        });
        _JC.pannStart = false;
        _JC.panning = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'default';
        canvas.renderAll();
    }

    _JC.canvasDraw().drawPanningBox();
    _JC.componentDraw().mouseDrawTriangle();

});
//星形
$("#drawStar").click(function() {

    if (lockStatus){
        return;
    }


    $(".elementOption").removeClass("act");
    _JC.mouseMode = 0;
    $(".toolOption").removeClass("act");
    $(this).parent().parent().addClass("act");
    $(this).parent().hide();
    $(this).parent().parent().find(".selectedToolIcon svg").html($(this).find(".icon svg").html());
    var iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><g opacity="1" transform="translate(2 2)  rotate(0 6 6)"><path id="形状结合" fill-rule="evenodd" fill="currentColor" transform="translate(0.6366642549999142 1.9602259944999787)  rotate(0 5.363335745 4.039774005500001)" opacity="1" d="M3.57,5.82L1.59,3.84C1.3,3.55 0.82,3.55 0.53,3.84L0.53,3.84C0.39,3.98 0.31,4.17 0.31,4.37C0.31,4.57 0.39,4.76 0.53,4.9L3,7.37C3.39,7.76 4.02,7.76 4.41,7.37L10.2,1.59C10.49,1.3 10.49,0.82 10.2,0.53L10.2,0.53C10.06,0.39 9.87,0.31 9.67,0.31C9.47,0.31 9.28,0.39 9.14,0.53L3.85,5.82C3.77,5.9 3.65,5.9 3.57,5.82Z "></path></g></g></svg>';
    $(this).parent().find(".activeSelectBox svg").html("");
    $(this).find(".activeSelectBox").html(iconSvg);
    $(this).find(".activeSelectBox svg path").css({
        "color": "#008efa",
        "fill": "currentColor"
    });
    $(this).parent().parent().attr("title", $(this).find(".menuName").html());
    $(this).parent().parent().attr("currentTool", $(this).attr("id"));
 
    $(".toolSubMenu").hide();

    canvas.skipTargetFind = true;

    //还原画布鼠标模式
    if (_JC.panning) {
        _JC.canvasDraw().deleteObject({
            id: "panningBox"
        });
        _JC.pannStart = false;
        _JC.panning = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'default';
        canvas.renderAll();
    }

    _JC.canvasDraw().drawPanningBox();
    _JC.componentDraw().mouseDrawStar();

});

//文本
$("#drawText").click(function() {

    if (lockStatus){
        return;
    }else{

        $(".elementOption").removeClass("act");
        _JC.mouseMode = 0;
        $(".toolOption").removeClass("act");
        $(this).addClass("act");
        $(".toolSubMenu").hide();

        canvas.skipTargetFind = true;

        //还原画布鼠标模式
        if (_JC.panning) {
            _JC.canvasDraw().deleteObject({
                id: "panningBox"
            });
            _JC.pannStart = false;
            _JC.panning = false;
            canvas.selection = false;
            canvas.selectable=false;
            canvas.defaultCursor = 'default';
            canvas.hoverCursor = 'default';
            canvas.renderAll();
        }

        _JC.canvasDraw().drawPanningBox();
        _JC.componentDraw().mouseDrawText();
    }
});

//图片
$(".uploadDrawImage").click(function() {

    if (lockStatus){
        return;
    }

    var uploadImageType=$(this).attr("data-type");
    var uploadImageCode=$(this).attr("type-code");

    $(".elementOption").removeClass("act");
    _JC.mouseMode = 0;
    $(".toolOption").removeClass("act");
    $(this).addClass("act");
    $(".toolSubMenu").hide();

    $("#uploadImage-btn").attr("imageType",uploadImageCode);
    $(this).parent().parent().attr("title", $(this).find(".menuName").html());
    // $(this).parent().parent().attr("currentTool",uploadImageCode);


    //还原画布鼠标模式
    if (_JC.panning) {
        _JC.canvasDraw().deleteObject({
            id: "panningBox"
        });
        _JC.pannStart = false;
        _JC.panning = false;

    }

    self.cunterObj=null;
    self.mouseDrawShapeStatus = false;
    canvas.selection = true;
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'default';
    canvas.renderAll();

    $('#uploadImage-btn').click();

});

//页码
$("#drawPageNo").click(function() {

    if (lockStatus){
        return;
    }

    $(".elementOption").removeClass("act");
    _JC.mouseMode = 0;
    $(".toolOption").removeClass("act");
    $(this).addClass("act");
    $(".toolSubMenu").hide();

    //还原画布鼠标模式
    if (_JC.panning) {
        _JC.canvasDraw().deleteObject({
            id: "panningBox"
        });
        _JC.pannStart = false;
        _JC.panning = false;
        canvas.selection = false;
        canvas.selectable=false;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'default';
        canvas.renderAll();
    }
    _JC.componentDraw().mouseDrawPageNo();

});


//弹出子菜单
$(".toolOption .topMenuPoint").click(function() {

    if (lockStatus){
        return;
    }
    $(".toolSubMenu").hide();
    $(this).parent().find(".toolSubMenu").show();
});


//页面右键菜单事件监控
$('body').delegate('.pagesArea .listContent .listOption','mousedown', function(e){

    e.preventDefault();
    if (3 == e.which) {
        // 鼠标右键
        var actionPage=$(this).attr("data-pageCode");
        if (actionPage==_JC.canvasConfig.recordPointer.pointerPageCode){
            $("#pagesDuplicate").removeClass("lock").addClass("unlock");
            $("#createDuplicate").removeClass("lock").addClass("unlock");
        }else{
            $("#pagesDuplicate").removeClass("unlock").addClass("lock");
            $("#createDuplicate").removeClass("unlock").addClass("lock");
        }

        $(".pageMenu").attr("data-pageCode",actionPage).css({"left":(event.pageX ),top:(event.pageY )}).show();
    }
    
    return false;
});



//伸展/收缩页面列表
$("#showPageList").click(function(){

    var status=$(this).attr("data-status");
    if (!isEmpty(status)){

        switch (status*1)
        {
            case 1:
                $(".pagesArea").css("height","30px");
                $(this).attr("data-status","0");
                $("#showPageList .svgIcon").html(svgElement.downward);
            break;
            case 0:
                $(".pagesArea").css("height","300px");
                $(this).attr("data-status","1");
                $("#showPageList .svgIcon").html(svgElement.upwardsIcon);
            break;
        }

    }else{
        return;
    }

});









/** new UI/UX end */
//画布缩小
$("#decreaseScale").click(function() {
    var paperNum = (_JC.paperSize.bleedHeight > _JC.paperSize.bleedWidth) ? _JC.paperSize.bleedHeight : _JC.paperSize.bleedWidth;
    if (paperNum * (canvas.getZoom() + 0.05) >= _JC.minZoomCanvasVal) {
        _JC.canvasDraw().canvasZoom(canvas.getZoom() - 0.05);
    } else {
        _JC.pageEvent.errMsg("Canvas zoom cannot be less than " + _JC.minZoomCanvasVal + "px and greater than " + _JC.maxZoomCanvasVal + "px");
    }
})
//画布放大
$("#amplifyScale").click(function() {
    var paperNum = (_JC.paperSize.bleedHeight > _JC.paperSize.bleedWidth) ? _JC.paperSize.bleedHeight : _JC.paperSize.bleedWidth;
    if (paperNum * (canvas.getZoom() + 0.05) < _JC.maxZoomCanvasVal) {
        _JC.canvasDraw().canvasZoom(canvas.getZoom() + 0.05);
    } else {
        //_JC.pageEvent.errMsg("Canvas zoom cannot be less than "+_JC.minZoomCanvasVal+"px and greater than "+_JC.maxZoomCanvasVal+"px");
        layer.msg("Canvas zoom cannot be less than " + _JC.minZoomCanvasVal + "px and greater than " + _JC.maxZoomCanvasVal + "px");
    }
})
//显示自定义缩放菜单
$(".zoomOperate,.zoomIcon").click(function() {
    
    var theScale = parseInt(canvas.getZoom() * 100) + "";
    $("#zoomInputProcess").val(theScale);
    $(".zoomMenu").css({"display":"block"});
    var input = document.querySelector('#zoomInputProcess');
    input.focus();
    input.setSelectionRange(0, theScale.length);
    _JC.isEditText=false;
})

$(".zoomOperate .menuOption").click(function() {

    var type=$(this).attr("data-type");
    switch (type)
    {

        case "zoomIn":
            var theScale = parseInt(canvas.getZoom() * 100);
            
            if (theScale + 50>1000){
                var zoomNum=1000;
            }else{
                var zoomNum=theScale + 50;
            }

            if (zoomNum * _JC.paperSize.bleedWidth * 0.01>_JC.minZoomCanvasVal && zoomNum * _JC.paperSize.bleedWidth * 0.01<=_JC.maxZoomCanvasVal){
                zoomScale(false,zoomNum);
            }else{
                _JC.pageEvent.errMsg("Canvas zoom cannot be less than " + _JC.minZoomCanvasVal + "px and greater than " + _JC.maxZoomCanvasVal + "px");
            }

        break;
        case "zoomOut":
            var theScale = parseInt(canvas.getZoom() * 100);
  
            if (theScale>100){

                if (theScale - 50 <100){
                    var zoomNum=100;
                }else{
                    var zoomNum=theScale - 50;
                }

            }else{

                if (theScale <=5){
                    var zoomNum=5;
                }else if (theScale - 20 > 5) {
                    var zoomNum=theScale -20;
                }else if (theScale - 10 >= 5){
                    var zoomNum=theScale -10;
                }else if (theScale - 10 < 5){
                    var zoomNum=5;
                }else {
                    var zoomNum=theScale;
                } 
            }

            if (zoomNum * _JC.paperSize.bleedWidth * 0.01>_JC.minZoomCanvasVal && zoomNum * _JC.paperSize.bleedWidth * 0.01<=_JC.maxZoomCanvasVal){
                zoomScale(false,zoomNum);
            }else{
                _JC.pageEvent.errMsg("Canvas zoom cannot be less than " + _JC.minZoomCanvasVal + "px and greater than " + _JC.maxZoomCanvasVal + "px");
            }

        break;
        case "zoom":

            var val=$(this).attr("data-value");

            switch (val)
            {
                case "Fit":
                    zoomScale(true,-1);
                break;
                case "50":
                    zoomScale(false,50);
                break;
                case "75":
                    zoomScale(false,75);
                break;
                case "100":
                    zoomScale(false,100);
                break;
                case "150":
                    zoomScale(false,150);
                break;
                case "200":
                    zoomScale(false,200);
                break;
            }

        break;
        case "guides":
            //智能参考线开启及关闭
            showGuides();
        break;

    }
    $(".zoomMenu").hide();

});

//自定义缩放
$('#zoomInputProcess').bind('keypress', function(event) {

    _JC.isEditText=false;
    if (event.keyCode == "13") {
        var newScale = $(this).val() * 1;
        //var paperNum = (_JC.paperSize.bleedHeight > _JC.paperSize.bleedWidth) ? _JC.paperSize.bleedHeight : _JC.paperSize.bleedWidth;
        if (newScale * _JC.paperSize.bleedWidth * 0.01>_JC.minZoomCanvasVal && newScale * _JC.paperSize.bleedWidth * 0.01<=_JC.maxZoomCanvasVal){
            zoomScale(false,newScale);
            $("#scaleNumber").html(newScale + "%");
            $(".zoomMenu").hide();
        } else {
            _JC.pageEvent.errMsg("Canvas zoom cannot be less than " + _JC.minZoomCanvasVal + "px and greater than " + _JC.maxZoomCanvasVal + "px");
        }

        
    }
})



//创建当前页副本
/*$("#createDuplicate").click(function() {
    //更新当前页面主副本到模板副本集
    var canvasJson = _JC.canvasSave().screeningDuplicate(canvas.toJSON(_JC.canvasConfig.outFiled), _JC.canvasPaddX, _JC.canvasPaddY);
    //更新到当前页的副本集
    _JC.canvasSave().updatePageDuplicate(_JC.canvasConfig.recordPointer.pointerPageNo, canvasJson);
    //更新到模板所有页副本集 这里要修改为 当前页 cunterPage
    _JC.pagesDuplicate[_JC.cunterPage] = _JC.templateData.cunterPageDuplicate;
    _JC.canvasSave().createPageDuplicate(function() {
        layer.msg("Success");
    });
})*/
/** 左则工作条 插入组件事件邦定 **/
$(".edit-tool-panel").on("click", ".insertElement", function(e) {


    if (lockStatus){
        return;
    }


    $("#selectComponent").click();

    if (!$(this).hasClass("act")) {
        $(".elementOption").removeClass("act");
        $(".edit-tool-panel .insertElement").removeClass("act");
        var elementData = {
            name: $(this).attr("dName"),
            dType: $(this).attr("dType"),
            file: $(this).attr("dFile"),
            dataFiled: $(this).attr("dataFiled"),
            insertText: $(this).attr("insertText")
        };
        if (!isEmpty(elementData.dType)) {
            $(this).addClass("act");
            _JC.componentDraw().saveComponentTask(elementData);
        }
    } else {
        $(".elementOption").removeClass("act");
        $(this).removeClass("act");
        _JC.insertObjectData.dType = null;
        _JC.insertObjectData.name = null;
        _JC.insertObjectData.file = null;
        _JC.insertObjectData.dataFiled = null;
        _JC.insertObjectData.insertText = null;
        _JC.insertStatus = false;
        canvas.defaultCursor = 'default', canvas.hoverCursor = 'default';
    }
})
//插入商品组件
$(".edit-tool-panel").on("click", ".insertComponent", function(e) {

    // 

    if (_JC.undoGroupSource == null) {

        if (!$(this).hasClass("act")) {

            $("#selectComponent").click();
            $(".elementOption").removeClass("act");
            $(this).addClass("act");

            var elementData = {
                name: "Product",
                elementCode: ($(this).attr("elementCode")),
                dType: ($(this).attr("typeCode")),
            };
            if (!isEmpty(elementData.elementCode)) {
                //获取组件代码
                var mydata = {
                    url: getApiUrl('marketing.component.detail', {
                        code: elementData.elementCode
                    }),
                    type: getApiMethod('marketing.component.detail'),
                };
                getTemplateCode(mydata, function(result) {
                    if (result.code == "0000") {
                        var outData = result.data.content;
                        var duplicate = outData.duplicate;
                        elementData.file = duplicate;
                        _JC.componentDraw().saveComponentTask(elementData);
                    } else {
                        layer.msg(result.msg);
                    }
                });
            }
        }else{
            $(".elementOption").removeClass("act");
            $(this).removeClass("act");
            _JC.insertObjectData.dType = null;
            _JC.insertObjectData.name = null;
            _JC.insertObjectData.file = null;
            _JC.insertObjectData.dataFiled = null;
            _JC.insertObjectData.insertText = null;
            _JC.insertStatus = false;
            canvas.defaultCursor = 'default', canvas.hoverCursor = 'default';
        }

    } else {
        layer.msg("Grouping prohibits insertion");
        //禁止分组内插入商品组件
    }

})
/** 右则组件属性邦定 **/
//MM设计页 某商品查看详细信息
$("#productDetails").on("click", function() {
    if (_JC.designModule == "mm") {
        if (isEmpty(_JC.cunterObj.dSort) == false) {
            var _pD = _JC.cunterObj.dSort;
            if (isEmpty(_pD)) {
                layer.msg("None Data");
                return;
            }
            var _pDArr = _pD.split("-");
            //console.log(mmDetailsData[_pDArr[0]][_pDArr[1]]);
            if (_pDArr[0] * 1 >= 1 && _pDArr[1] * 1 >= 1) {
                var itemCode = mmDetailsData[_pDArr[0] - 1][_pDArr[1]].itemcode;
                var winW = $(document.body).width();
                var index_page = layer.open({
                    type: 2,
                    title: 'Product detail ' + itemCode,
                    id: 'Productdetail' + itemCode,
                    content: '/makroDigital/marketingActivity/productDetails/' + itemCode,
                    maxmin: true,
                    shade: 0,
                    area: ['346px', '465px'],
                    btn: [],
                    yes: function(index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-picture-select-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
                    }
                });
            } else {
                layer.msg("Invalid data");
            }
        } else {
            layer.msg("None data");
        }
    }
});
//MM设计模式下切换LinkItem切换关联商品图片
$(".LinItemConfig").on("click", ".lkPic", function() {
    //商品图片
    var pic = $(this).attr("src");
    var cmykPic = $(this).attr("cmykOriginPath");
    var picid = null;
    _JC.cunterObj.lkSort = $(this).attr("data");
    $(".LinItemConfig").find("input[name=lkSort]").val(_JC.cunterObj.lkSort);
    $(".LinItemConfig .lkPic").removeClass("act");
    $(this).addClass("act");
    _JC.componentDraw().updateProductTheDtypePicture({
        src: pic,
        cmykPic: cmykPic,
        picid: picid,
        dType: _JC.cunterObj.dType
    }, _JC.cunterObj, function() {})
});
//给文字类型 input输入框邦定回车事件
$('.inputBox input').bind('keypress', function(event) {

    _JC.isEditText=true;

    var _name = $(this).attr("name");
    var _value = $(this).val();
    if (event.keyCode == "13") {
        switch (_name) {
            case "objLeft":
                _JC.cunterObj.left = _value * 1;
                if (_JC.cunterObj.hasOwnProperty("group")) {
                    _JC.cunterObj.group.addWithUpdate();
                    _JC.cunterObj.group.setCoords();
                }
                _JC.componentDraw().setObjectrotateXY();
                canvas.renderAll();
                break;
            case "objTop":
                _JC.cunterObj.top = _value * 1;
                if (_JC.cunterObj.hasOwnProperty("group")) {
                    _JC.cunterObj.group.addWithUpdate();
                    _JC.cunterObj.group.setCoords();
                }
                _JC.componentDraw().setObjectrotateXY();
                canvas.renderAll();
                break;
            case "objWidth":
                _JC.cunterObj.width = _value * 1;
                if (_JC.cunterObj.hasOwnProperty("group")) {
                    _JC.cunterObj.group.addWithUpdate();
                    _JC.cunterObj.group.setCoords();
                }
                _JC.componentDraw().setObjectrotateXY();
                canvas.renderAll();
                break;
            case "objHeight":
                _JC.cunterObj.height = _value * 1;
                if (_JC.cunterObj.hasOwnProperty("group")) {
                    _JC.cunterObj.group.addWithUpdate();
                    _JC.cunterObj.group.setCoords();
                }
                _JC.componentDraw().setObjectrotateXY();
                canvas.renderAll();
                break;
            case "objText":
                if (_JC.cunterObj.dType != "productPriceGroup") {
                    _JC.cunterObj.text = _value;
                    if (_JC.cunterObj.hasOwnProperty("group")) {
                        _JC.cunterObj.group.addWithUpdate();
                        _JC.cunterObj.group.setCoords();
                    }
                    _JC.componentDraw().setObjectrotateXY();
                    canvas.renderAll();
                    _JC.layer.canvasOperation.updateTextBoxLayerTitle({layerID:_JC.cunterObj.id,layerTitle:_value});
                } else {
                    _JC.componentDraw().updateProductLineText({
                        text: _value
                    });
                    _JC.componentDraw().setObjectrotateXY();
                    _JC.layer.canvasOperation.updateTextBoxLayerTitle({layerID:_JC.cunterObj.id,layerTitle:_value});
                }
                break;
            case "textColor":
                _value = (_value == "" || _value == null || _value == undefined) ? "#333333" : _value;
                setfontColor(_value);
                canvas.renderAll();
                break;
            case "textSize":
                _value = (_value == "" || _value == null || _value == undefined) ? 14 : _value * 1;
                if (_JC.isPixSelect == false && _JC.cunterObj != null && _JC.selectedObject != null) {
                    if (!_JC.cunterObj.hasOwnProperty("dType")) {
                        _JC.cunterObj = null;
                    } else if (_JC.cunterObj.hasOwnProperty("type")) {
                        if (_JC.cunterObj.type == "activeSelection") {
                            _JC.cunterObj = null;
                        }
                    }
                } else if (_JC.isPixSelect && _JC.cunterObj != null && _JC.selectedObject != null) {
                    if (!_JC.cunterObj.hasOwnProperty("dType")) {
                        _JC.cunterObj = null;
                    } else if (_JC.cunterObj.hasOwnProperty("type")) {
                        if (_JC.cunterObj.type == "activeSelection") {
                            _JC.cunterObj = null;
                        }
                    }
                }
                if (_JC.cunterObj != null) {
                 
                    if (_JC.cunterObj.dType != "productPriceGroup") {
                      
                        if (_JC.cunterObj.type != "activeSelection") {
                          
                            _JC.cunterObj.fontPt = _value;
                            _JC.cunterObj.fontSize = _value;
                            if (_JC.cunterObj.hasOwnProperty("group")) {
                             
                                _JC.cunterObj.group.addWithUpdate();
                                _JC.cunterObj.group.setCoords();
                            }
                        } else {
                         
                            if (_JC.cunterObj.hasOwnProperty("_objects")) {
                            
                                for (var i = 0; i < _JC.cunterObj._objects.length; i++) {
                                    if (_JC.cunterObj._objects[i].hasOwnProperty("type")) {
                                   
                                        if (_JC.cunterObj._objects[i].type == "textbox" || _JC.cunterObj._objects[i].type == "i-text") {
                                            _JC.cunterObj._objects[i].set({
                                                fontSize: _value,
                                                fontPt: _value
                                            });
                                            if (_JC.cunterObj._objects[i].hasOwnProperty("group")) {
                                                _JC.cunterObj._objects[i].group.addWithUpdate();
                                                _JC.cunterObj._objects[i].group.setCoords();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        _JC.componentDraw().setObjectrotateXY();
                        canvas.renderAll();
                    } else {
                        _JC.componentDraw().updateProductLineText({
                            fontSize: _value
                        });
                        _JC.componentDraw().setObjectrotateXY();
                    }
                } else if (_JC.cunterObj == null && _JC.selectedObject != null) {
                    canvas.discardActiveObject();
     
                    if (_JC.selectedObject.length > 1) {
                        var composingObject = _JC.selectedObject;
                    } else {
                        var composingObject = _JC.selectedObject[0]._objects;
                    }
                    for (var i = 0; i < composingObject.length; i++) {
               
                        composingObject[i].set({
                            fontSize: _value,
                            fontPt: _value
                        });
                        if (composingObject[i].hasOwnProperty("group")) {
                            composingObject[i].group.addWithUpdate();
                            composingObject[i].group.setCoords();
                        }
                        if (composingObject[i].hasOwnProperty("sourceGroup")) {
                            composingObject[i].sourceGroup.addWithUpdate();
                            composingObject[i].sourceGroup.setCoords();
                        }
                        _JC.componentDraw().setObjectrotateXY(composingObject[i]);
                    }
                    canvas.renderAll();
                }
                break;
            case "moreTextStroke":
                _value = (_value == "" || _value == null || _value == undefined) ? 0 : _value * 1;
                _value = _value.toFixed(2);
                $(this).val(_value);
                if (_JC.selectedObject.length > 1) {
                    var composingObject = _JC.selectedObject;
                } else {
                    var composingObject = _JC.selectedObject[0]._objects;
                }
                for (var i = 0; i < composingObject.length; i++) {
                    composingObject[i].set({
                        strokeWidth: ptConvertUnit(_JC.paperSize.paperUnitToPx, _value),
                        strokePt: _value
                    });
                    _JC.componentDraw().setObjectrotateXY(composingObject[i]);
                }
                canvas.renderAll();
                break;
            case "textWeight":
                _value = (_value == "" || _value == null || _value == undefined) ? 14 : _value * 1;
                _JC.cunterObj.fontWeight = _value;
                _JC.componentDraw().setObjectrotateXY();
                canvas.renderAll();
                break;
            case "textStroke":
                _value = (_value == "" || _value == null || _value == undefined) ? 0 : _value * 1;
                _value = _value.toFixed(2);
                $(this).val(_value);
                if (_JC.cunterObj.dType != "productPriceGroup") {
                    _JC.cunterObj.set({
                        strokeWidth: ptConvertUnit(_JC.paperSize.paperUnitToPx, _value),
                        strokePt: _value
                    });
                    _JC.componentDraw().setObjectrotateXY();
                    canvas.renderAll();
                } else {
                    //划线文本组件属性显示
                    if (_JC.cunterObj._objects[0].type == "i-text") {
                        var _textObj = _JC.cunterObj._objects[0];
                        var _lineObj = _JC.cunterObj._objects[1];
                        var _textIndex = 0,
                            _lineIndex = 1;
                    } else {
                        var _textObj = _JC.cunterObj._objects[1];
                        var _lineObj = _JC.cunterObj._objects[0];
                        var _textIndex = 1,
                            _lineIndex = 0;
                    }
                    _JC.cunterObj.item(_textIndex).set({
                        strokeWidth: ptConvertUnit(_JC.paperSize.paperUnitToPx, _value),
                        strokePt: _value
                    });
                    _JC.componentDraw().setObjectrotateXY();
                    canvas.renderAll();
                }
                break;
            case "objScaleX":
                _value = (_value == "" || _value == null || _value == undefined) ? 1 : _value * 0.01;
                //San 2022-04-14
                if (_JC.cunterObj.dType == "productPicture") {
                    var tmpObjects = _JC.cunterObj._objects;
                    for (var t = 0; t < tmpObjects.length - 1; t++) {
                        if (tmpObjects[t].dType) {
                            if (tmpObjects[t].dType == "previewPicture") {
                                var tmpImage = tmpObjects[t];
                                _JC.cunterObj.scaleX = _value / tmpImage.scaleX;
                            }
                        }
                    }
                } else {
                    _JC.cunterObj.scaleX = _value;
                }
                if (_JC.cunterObj.hasOwnProperty("group")) {
                    _JC.cunterObj.group.addWithUpdate();
                    _JC.cunterObj.group.setCoords();
                }
                _JC.componentDraw().setObjectrotateXY();
                canvas.renderAll();
                break;
            case "objScaleY":
                _value = (_value == "" || _value == null || _value == undefined) ? 1 : _value * 0.01;
                //San 2022-04-14
                if (_JC.cunterObj.dType == "productPicture") {
                    var tmpObjects = _JC.cunterObj._objects;
                    for (var t = 0; t < tmpObjects.length - 1; t++) {
                        if (tmpObjects[t].dType) {
                            if (tmpObjects[t].dType == "previewPicture") {
                                var tmpImage = tmpObjects[t];
                                _JC.cunterObj.scaleY = _value / tmpImage.scaleY
                            }
                        }
                    }
                } else {
                    _JC.cunterObj.scaleY = _value;
                }
                if (_JC.cunterObj.hasOwnProperty("group")) {
                    _JC.cunterObj.group.addWithUpdate();
                    _JC.cunterObj.group.setCoords();
                }
                _JC.componentDraw().setObjectrotateXY();
                canvas.renderAll();
                break;
            case "objzIndex":
                if (_JC.undoGroupSource == null) {
                    var _value = $(this).val();
                    if (_value.length > 1) {
                        _value = (_value == "" || _value == null || _value == undefined) ? (_JC.getCanvasObjCount() + 1) : _value * 1;
                        if (_value < 10) {
                            _value = 10;
                            $(this).val(10);
                        }
                        _JC.cunterObj.set({
                            zIndex: _value
                        });
                        canvas.renderAll();
                        _JC.componentDraw().resetView();
                    }
                } else {
                    var _value = $(this).val();
                    if (_value.length >= 1 && _value * 1 > 0) {
                        _JC.cunterObj.set({
                            zIndex: (_JC.editGroupZindex + _value * 1)
                        });
                        canvas.renderAll();
                        _JC.componentDraw().resetView();
                    }
                }
                break;
            case "objPageSort":
                if (_JC.designModule == "template") {
                    _value = (_value == "" || _value == null || _value == undefined) ? "" : _value;
                    //检查值合法性
                    if (_value != "") {
                        this.value = _value.replace(/[^-0-9]/g, '');
                        _value = this.value;
                    }
                    if (_value != "") {
                        var _vArr = _value.split("-");
                        if (_vArr.length != 2) {
                            _JC.cunterObj.dSort = "";
                            this.value = "";
                            layer.msg("Void Data");
                            return;
                        }
                    }
                    _JC.cunterObj.dSort = _value;
                } else if (_JC.designModule == "mm") {
                    _value = (_value == "" || _value == null || _value == undefined) ? "" : _value;
                    //检查值合法性 页面-sort
                    if (_value != "") {
                        this.value = _value.replace(/[^-0-9]/g, '');
                        _value = this.value;
                    }
                    if (_value != "") {
                        var _vArr = _value.split("-");
                        if (_vArr.length != 2) {
                            _JC.cunterObj.dSort = "";
                            this.value = "";
                            layer.msg("Void Data");
                            return;
                        }
                    }
                    var pt = _value.indexOf("-");
                    var textThaiPageIndex = _value.substr(0, pt) * 1 - 1;
                    var dSort = _value.substr(pt + 1, _value.length - pt - 1) * 1;
                    if (mmDetailsData[textThaiPageIndex] == undefined) {
                        $("input[name=objPageSort]").val("");
                        layer.msg("None data");
                        return;
                    }
                    if (mmDetailsData[textThaiPageIndex][dSort] == undefined) {
                        layer.msg("None data");
                        $("input[name=objPageSort]").val("");
                        return;
                    } else {
                        _JC.cunterObj.dSort = _value;
                        viewObject = mmDetailsData[textThaiPageIndex * 1][dSort * 1];
                        if (viewObject != null && viewObject.sort) {
                            _JC.cunterObj.textInfogmtCreate = null;
                            _JC.canvasDraw().updateProduct(_JC.cunterObj, viewObject, function() {
                                _JC.cunterObj.addWithUpdate();
                                _JC.cunterObj.setCoords();
                                //事务描述
                                var msg = "Edit element";
                                _JC.canvasSave().canvasHistoryRecordCall(msg);
                            });
                            layer.msg("success");
                        } else {
                            layer.msg("None data");
                            return;
                        }
                    }
                }
                break;
            case "rectStroke":
                _value = (_value == "" || _value == null || _value == undefined) ? 0.25 : _value * 1;
                _value = _value.toFixed(2);
                $(this).val(_value);
                var newStrokeWidth = ptConvertUnit(_JC.paperSize.paperUnitToPx, _value);
                _JC.cunterObj.set({
                    strokeWidth: (newStrokeWidth),
                    strokePt: _value
                });
                _JC.componentDraw().setObjectrotateXY();
                canvas.renderAll();
                break;
            case "rectRx":
                _value = (_value == "" || _value == null || _value == undefined) ? 0 : _value * 1;
                _JC.cunterObj.set({
                    rx: _value,
                    ry: _value
                });
                _JC.componentDraw().setObjectrotateXY();
                canvas.renderAll();
                break;
            case "rectRy":
                _value = (_value == "" || _value == null || _value == undefined) ? 0 : _value * 1;
                _JC.cunterObj.set({
                    ry: _value,
                    rx: _value
                });
                _JC.componentDraw().setObjectrotateXY();
                canvas.renderAll();
                break;
            case "lineSpace":
                _value = (_value == "" || _value == null || _value == undefined) ? 1 : _value * 1;
                if ($("input[name=lineLen]").val() != "") {
                    var _lineLen = $("input[name=lineLen]").val() * 1;
                } else {
                    var _lineLen = 1;
                }
                var _strokeDashArray = [_lineLen, _value];
                _JC.cunterObj.set({
                    strokeDashArray: _strokeDashArray
                });
                _JC.componentDraw().setObjectrotateXY();
                canvas.renderAll();
                break;
            case "lineLen":
                _value = (_value == "" || _value == null || _value == undefined) ? 1 : _value * 1;
                if ($("input[name=lineSpace]").val() != "") {
                    var _lineSpace = $("input[name=lineSpace]").val() * 1;
                } else {
                    var _lineSpace = 1;
                }
                var _strokeDashArray = [_value, _lineSpace];
                _JC.cunterObj.set({
                    strokeDashArray: _strokeDashArray
                });
                _JC.componentDraw().setObjectrotateXY();
                canvas.renderAll();
                break;
            case "lkSort":
                _value = (_value == "" || _value == null || _value == undefined) ? 1 : _value * 1;
                _value = (_value < 1) ? 1 : _value;
                _JC.cunterObj.set({
                    lkSort: _value
                });
                //单独更新商品组件中关联商品文本信息
                if (_JC.designModule == "mm" && _JC.undoGroupSource != null && isEmpty(_JC.undoGroupSource.dSort) == false) {
                    if (_JC.cunterObj.dType == "productNormalText") {
                        var setStatus = true;
                        _JC.componentDraw().updateProductLinkText({
                            dataFiled: _JC.cunterObj.dataFiled,
                            lkSort: _value
                        }, _JC.cunterObj, function(status) {
                            if (status) {
                                canvas.renderAll();
                            } else {
                                setStatus = status;
                                layer.msg("Data is empty");
                            }
                        })
                        if (status == false) {
                            return;
                        }
                    } else if (_JC.cunterObj.dType == "productPicture") {
                        var lkPic = $(".LinItemConfig").find(".lkPic");
                        if (_value > lkPic.length) {
                            layer.msg("None data");
                        } else {
                            if (lkPic.length >= 1) {
                                //商品图片
                                var pic = $(lkPic).eq(_value - 1).attr("src");
                                var cmykPic = $(lkPic).eq(_value - 1).attr("cmykOriginPath");
                                var picid = null;
                                _JC.componentDraw().updateProductTheDtypePicture({
                                    src: pic,
                                    cmykPic: cmykPic,
                                    picid: picid,
                                    dType: _JC.cunterObj.dType
                                }, _JC.cunterObj, function() {})
                            }
                        }
                    }
                } else {
                    canvas.renderAll();
                    return;
                }
                break;
            case "underlineStrokeWidth":
                _value = (_value == "" || _value == null || _value == undefined) ? 0.25 : _value * 1;
                _value = _value.toFixed(2);
                $(this).val(_value);
                var newStrokeWidth = ptConvertUnit(_JC.paperSize.paperUnitToPx, _value);
                //划线文本组件属性显示
                if (_JC.cunterObj._objects[0].type == "i-text") {
                    var _textObj = _JC.cunterObj._objects[0];
                    var _lineObj = _JC.cunterObj._objects[1];
                    var _textIndex = 0,
                        _lineIndex = 1;
                } else {
                    var _textObj = _JC.cunterObj._objects[1];
                    var _lineObj = _JC.cunterObj._objects[0];
                    var _textIndex = 1,
                        _lineIndex = 0;
                }
                _JC.cunterObj.item(_lineIndex).set({
                    strokeWidth: newStrokeWidth,
                    strokePt: _value
                });
                
                _JC.componentDraw().updateProductLineText({
                    fontSize: _textObj.fontSize
                });
                
                _JC.componentDraw().setObjectrotateXY();
                canvas.renderAll();
                break;
        }

        _JC.drawing = true;
        //事务描述
        var msg = "Edit element";
        _JC.canvasSave().canvasHistoryRecordCall(msg);
        layer.msg("success");
    }
});
$('input[name=objzIndex]').keyup(function(event) {
    if (_JC.undoGroupSource == null) {
        var _value = $(this).val();
        if (_value.length > 1) {
            _value = (_value == "" || _value == null || _value == undefined) ? (_JC.getCanvasObjCount() + 1) : _value * 1;
            if (_value < 10) {
                _value = 10;
                $(this).val(10);
            }
            _JC.cunterObj.set({
                zIndex: _value
            });
            canvas.renderAll();
            _JC.componentDraw().resetView();
        }
    } else {
        //在编辑分组时，禁用录入就更新zIndex
    }
});
$('input[name=objzIndex]').change(function() {
    var _value = $(this).val();
    _value = (_value == "" || _value == null || _value == undefined) ? (_JC.getCanvasObjCount() + 1) : _value * 1;
    if (_value < 10 && _JC.undoGroupSource == null) {
        layer.msg("Level must be greater than 10");
    }
});


/* 组件Layer操作 */
//向上移一层
$("#layerToForward").on("click", function() {

    if (_JC.cunterObj != null && !$(this).hasClass("noneClick")) {

        if (_JC.cunterObj.type!="activeSelection"){
            $("#layerToBottom").removeClass("noneClick");
            $("#layerToBackward").removeClass("noneClick");
    
            if (_JC.cunterObj.hasOwnProperty("group")) {
                var _group = _JC.cunterObj.group;
                var _sort = -1;
                //获取当前对象在组的排序位置
                for (var i = 0; i < _group._objects.length; i++) {
                    if (_group._objects[i].id == _JC.cunterObj.id) {
                        _sort = i;
                    }
                }
                _group._objects[_sort].moveTo(_sort + 1);
                _group.dirty = true;
                _group.addWithUpdate();
                canvas.requestRenderAll();
                _JC.cunterObj.group = _group;
                for (var i = 0; i < _group._objects.length; i++) {
                    _group._objects[i].zIndex = i + 1;
                    if (_group.hasOwnProperty("sortPath")){
                        _group._objects[i].sortPath=_group.sortPath + "," + i;
                        _JC.layer.canvasOperation.setLayerSortPath(_group._objects[i].id,_group._objects[i].sortPath);
                    }
                }
    
                if (_sort==_group._objects.length-1){
                    $("#layerToTop,#layerToForward").addClass("noneClick");
                }
    
                _JC.layer.render.layerMove(_JC.cunterObj.id,{type:"layerToForward",sortPath:_JC.cunterObj.sortPath});
                _JC.drawing = true;
                //事务描述
                var msg = "Edit element";
                _JC.canvasSave().canvasHistoryRecordCall(msg);
            } else {
    
                var nextObjSort = -1;
                for (var i = 0; i < canvas._objects.length; i++) {
                    if (canvas._objects[i].id == _JC.cunterObj.id) {
                        nextObjSort = i + 1;
                        if (i==canvas._objects.length-1){
                            layer.msg("Already Top");
                            break;
                        }
                    }
                }
                if (nextObjSort >= canvas._objects.length) {
                    return;
                } else {
                    var newzIndex=canvas._objects[nextObjSort].zIndex;
                    canvas._objects[nextObjSort].zIndex = _JC.cunterObj.zIndex * 1 ;
                    _JC.cunterObj.set({
                        zIndex: newzIndex
                    });
    
                    _JC.cunterObj.moveTo(nextObjSort);
    
                    canvas.discardActiveObject();
                    canvas.setActiveObject(_JC.cunterObj);
                    canvas.renderAll();
    
                    if (canvas._objects.length-1==nextObjSort){
                        $("#layerToTop,#layerToForward").addClass("noneClick");
                    }
    
                    _JC.cunterObj.sortPath=nextObjSort;
                    _JC.layer.render.layerMove(_JC.cunterObj.id,{type:"layerToForward",sortPath:_JC.cunterObj.sortPath});
                    _JC.layer.canvasOperation.setLayerSortPath(_JC.cunterObj.id,_JC.cunterObj.sortPath);
    
    
                }
            }
        }    
            
    } 
});
//移到顶层
$("#layerToTop").on("click", function() {
    if (_JC.cunterObj != null && !$(this).hasClass("noneClick")) {
        
        if (_JC.cunterObj.type!="activeSelection"){
            
            $(this).addClass("noneClick");
            $("#layerToForward,#layerToTop").addClass("noneClick");
            $("#layerToBottom,#layerToBackward").removeClass("noneClick");
            
            if (_JC.cunterObj.hasOwnProperty("group")) {
                var _group = _JC.cunterObj.group;
                var _sort = -1;
                //获取当前对象在组的排序位置
                for (var i = 0; i < _group._objects.length; i++) {
                    if (_group._objects[i].id == _JC.cunterObj.id) {
                        _sort = i;
                    }
                }
                _JC.layer.render.layerMove(_group._objects[_sort].id,{type:"layerToTop"});
                _group._objects[_sort].moveTo(_group._objects.length - 1);
                _group.dirty = true;
                _group.addWithUpdate();
                canvas.requestRenderAll();
                _JC.cunterObj.group = _group;
                for (var i = 0; i < _group._objects.length; i++) {
                    _group._objects[i].zIndex = i + 1;
                }
                _JC.drawing = true;
                //事务描述
                var msg = "Edit element";
                _JC.canvasSave().canvasHistoryRecordCall(msg);
            } else {
        
                if (_JC.undoGroupSource==null){
        
                    var objects = canvas.getObjects();
                    if (objects[objects.length - 1]==_JC.cunterObj){
                        layer.msg("Already Top");
                        return;
                    }else{
                        var oldSort=-1;
                        for (var i = 0; i < objects.length; i++) {
                            if (objects[i]==_JC.cunterObj){
                                oldSort=i;
                            }
                        }
                        _JC.layer.render.layerMove(_JC.cunterObj.id,{type:"layerToTop"});
                        _JC.cunterObj.moveTo(objects.length - 1);
                        canvas.discardActiveObject();
                        canvas.renderAll();
                        canvas.setActiveObject(_JC.cunterObj);
        
                        var oldIndex=_JC.cunterObj.zIndex;
                        var step=0;
                        for (var i = oldSort; i < objects.length; i++) {
                            objects[i].zIndex=oldIndex * 1 + step;
                            step++; 
                        }
        
        
        
                    }
        
        
                }else{
                    
                    var objects=canvas.getObjects();
                    var maxIndex=objects[objects.length-1].zIndex;
                    if (objects[objects.length-1]==_JC.cunterObj){
                        layer.msg("Already Top");
                        return;
                    }
                    var step=1;
                    for (var i=objects.length -1;i>0;i--){
        
                        if (objects[i]!=_JC.cunterObj){
                            objects[i].zIndex=objects[i].zIndex * 1 - step;
                        }else{
                            _JC.layer.render.layerMove(_JC.cunterObj.id,{type:"layerToTop"});
                            _JC.cunterObj.moveTo(objects.length-1);
                            _JC.cunterObj.zIndex=maxIndex;
                            canvas.discardActiveObject();
                            canvas.renderAll();
                            canvas.setActiveObject(_JC.cunterObj);
                            break;
                        }
        
                    }
        
                }
        
                return;
        
                var objects = canvas.getObjects();
                _JC.cunterObj.bringToFront();
                _JC.cunterObj.set({
                    zIndex: (_JC.minLayer * 1 + objects.length)
                });
                _JC.componentDraw().reSortComponent(function() {
                    canvas.renderAll();
                    //是否刷新图层窗口
                    if (levelWindow != null) {
                        //图层窗口打开中
                        levelWindow.loadLayer();
                    }
                    _JC.drawing = true;
                    //事务描述
                    var msg = "Edit element";
                    _JC.canvasSave().canvasHistoryRecordCall(msg);
                });
            }
            
        }    
    }
});
//向下移一层
$("#layerToBackward").on("click", function() {

    if (_JC.cunterObj != null && !$(this).hasClass("noneClick")) {
        
         if (_JC.cunterObj.type!="activeSelection"){

            $("#layerToTop,#layerToForward").removeClass("noneClick");
    
            if (_JC.cunterObj.hasOwnProperty("group")) {
                var _group = _JC.cunterObj.group;
                var _sort = -1;
                //获取当前对象在组的排序位置
                for (var i = 0; i < _group._objects.length; i++) {
                    if (_group._objects[i].id == _JC.cunterObj.id) {
                        _sort = i;
                    }
                }
                if (_sort - 1 >= 0) {
                    _group._objects[_sort].moveTo(_sort - 1);
                    _group.dirty = true;
                    _group.addWithUpdate();
                    canvas.requestRenderAll();
                    _JC.cunterObj.group = _group;
                    for (var i = 0; i < _group._objects.length; i++) {
                        _group._objects[i].zIndex = i + 1;
                        if (_group.hasOwnProperty("sortPath")){
                            _group._objects[i].sortPath=_group.sortPath + "," + i;
                            _JC.layer.canvasOperation.setLayerSortPath(_group._objects[i].id,_group._objects[i].sortPath);
                        }
                    }
    
                    _JC.layer.render.layerMove(_JC.cunterObj.id,{type:"layerToBackward",sortPath:_JC.cunterObj.sortPath});
                    _JC.drawing = true;
                    //事务描述
                    var msg = "Edit element";
                    _JC.canvasSave().canvasHistoryRecordCall(msg);
                }else{
                    layer.msg("Already Bottom");
                    $("#layerToBackward,#layerToBottom").addClass("noneClick");
                }
            } else {
    
                var preObjIndex = 1;
                if (canvas._objects[_JC.minLayer].id == _JC.cunterObj.id) {
                    $("#layerToBackward,#layerToBottom").addClass("noneClick");
                    layer.msg("Already Bottom");
                    return;
                }
    
                // var minLayer = (_JC.undoGroupSource != null) ? 1000 : _JC.minLayer * 1;
                var minLayer,cunterObjSort;
                if (_JC.undoGroupSource != null) {
    
                    for (var i=canvas._objects.length-1;i>0;i--){
                        if (canvas._objects[i].hasOwnProperty("dType")){
                            if (canvas._objects[i].dType=="editGroupBg"){
                                minLayer=i;
                                break;
                            }
                        }
                    }
    
                    for (var i=canvas._objects.length-1;i>0;i--){
                        if (canvas._objects[i]==_JC.cunterObj){
                            cunterObjSort=i;
                            break;
                        }
                    }
    
                    if (minLayer >= cunterObjSort -1) {
                        $("#layerToBackward,#layerToBottom").addClass("noneClick");
                        layer.msg("Already Bottom");
                        return;
                    }
                }
    
                for (var i=0;i<canvas._objects.length;i++){
    
                    if (canvas._objects[i]==_JC.cunterObj){
                        var zIndex=canvas._objects[i].zIndex;
                        canvas._objects[i-1].zIndex=zIndex;
                        canvas._objects[i].zIndex=zIndex * 1 -1;
                        // console.log(canvas._objects[i-1].sortPath,i-1);
                        _JC.cunterObj.sendBackwards();
                        canvas._objects[i-1].sortPath=i - 1;
                        _JC.layer.render.layerMove(_JC.cunterObj.id,{type:"layerToBackward",sortPath:_JC.cunterObj.sortPath});
                        _JC.layer.canvasOperation.setLayerSortPath(_JC.cunterObj.id,i - 1);
    
                        canvas.discardActiveObject();
                        canvas.setActiveObject(_JC.cunterObj);
                        canvas.renderAll();
    
                        
                        break;
                    }
                }
    
    
    
    
                return;
    
            }
        
         }
    }
});
//移到底层
$("#layerToBottom").on("click", function() {

    if (_JC.cunterObj != null && !$(this).hasClass("noneClick")) {
         if (_JC.cunterObj.type!="activeSelection"){
         
            $(this).addClass("noneClick");
            $("#layerToBackward,#layerToBottom").addClass("noneClick");
            $("#layerToTop,#layerToForward").removeClass("noneClick");
            if (_JC.cunterObj.hasOwnProperty("group")) {
                console.log("OKI 1");
                if (_JC.undoGroupSource==null){
                    console.log("OKI 2");
                    if (_JC.cunterObj.hasOwnProperty("group")){ 
                        var _group = _JC.cunterObj.group;
                        console.log("OKI 3");
                        var _sort = -1;
                        //获取当前对象在组的排序位置
                        for (var i = 0; i < _group._objects.length; i++) {
                            if (_group._objects[i].id == _JC.cunterObj.id) {
                                _sort = i;
                            }
                        }
                        
                        _JC.layer.render.layerMove(_group._objects[_sort].id,{type:"layerToBottom"});
                        _group._objects[_sort].moveTo(0);
                        _group.dirty = true;
                        _group.addWithUpdate();
                        canvas.requestRenderAll();
                        
                        _JC.cunterObj.group = _group;
                        for (var i = 0; i < _group._objects.length; i++) {
                            _group._objects[i].zIndex = i + 1;
                        }
                    } 
                    
                }else{
                    console.log("OKI 4");
                    var _sort = -1;
                    _JC.layer.render.layerMove(_JC.cunterObj.id,{type:"layerToBottom"});
                    _JC.cunterObj.moveTo(_JC.minLayer * 1);
                    _JC.cunterObj.zIndex=(_JC.editGroupZindex * 1 + 1);
                    canvas.renderAll();
                    
                }
    
                _JC.drawing = true;
                //事务描述
                var msg = "Edit element";
                _JC.canvasSave().canvasHistoryRecordCall(msg);
            } else {
                
                
                if (_JC.undoGroupSource==null){  
                    console.log("OKI 5");
                    
                    _JC.layer.render.layerMove(_JC.cunterObj.id,{type:"layerToBottom",before:"BackgroundImage"});
                    _JC.cunterObj.moveTo(_JC.minLayer * 1);
                    canvas.renderAll();
                    _JC.cunterObj.zIndex=(_JC.minLayer * 1 + 1);
                }else{
                    console.log("OKI 6");
                    var _sort = _JC.minLayer + 1;
                    _JC.layer.render.layerMove(_JC.cunterObj.id,{type:"layerToBottom"});
                    for (var i = canvas._objects.length-1; i>=0 ; i--) {
                        
                        if (canvas._objects[i].hasOwnProperty("id")){
                            if (canvas._objects[i].id=="editGroupBg"){
                                _sort= i + 1;
                            }
                        }
                    }
                    
                    _JC.cunterObj.moveTo(_sort);
                    
                    _JC.cunterObj.zIndex=(_JC.editGroupZindex * 1 + 1);
                    canvas.requestRenderAll();
                    console.log(canvas._objects);
                }
                _JC.drawing = true;
                //事务描述
                var msg = "Edit element";
                _JC.canvasSave().canvasHistoryRecordCall(msg);
    
            }
            
         }
        
    }
});


//文字类排版处理类
$(".textAlignMode").on("click", function() {
    var _type = $(this).attr("data");
    if (_type != "" && _JC.cunterObj != null && _JC.cunterObj.hasOwnProperty("type")) {
        switch (_type) {
            case "align-left":
                if (_JC.cunterObj.dType != "productPriceGroup") {
                    _JC.cunterObj.textAlign = "left";
                    if (_JC.cunterObj.hasOwnProperty("group")) {
                        _JC.cunterObj.group.addWithUpdate();
                        _JC.cunterObj.group.setCoords();
                    }
                } else {
                    //划线文本组件属性显示
                    if (_JC.cunterObj._objects[0].type == "i-text") {
                        var _textObj = _JC.cunterObj._objects[0];
                        var _lineObj = _JC.cunterObj._objects[1];
                        var _textIndex = 0,
                            _lineIndex = 1;
                    } else {
                        var _textObj = _JC.cunterObj._objects[1];
                        var _lineObj = _JC.cunterObj._objects[0];
                        var _textIndex = 1,
                            _lineIndex = 0;
                    }
                    _JC.cunterObj.item(_textIndex).set({
                        textAlign: "left"
                    });
                    _JC.cunterObj.addWithUpdate();
                    _JC.cunterObj.setCoords();
                }
                break;
            case "align-center":
                if (_JC.cunterObj.dType != "productPriceGroup") {
                    _JC.cunterObj.textAlign = "center";
                    if (_JC.cunterObj.hasOwnProperty("group")) {
                        _JC.cunterObj.group.addWithUpdate();
                        _JC.cunterObj.group.setCoords();
                    }
                } else {
                    //划线文本组件属性显示
                    if (_JC.cunterObj._objects[0].type == "i-text") {
                        var _textObj = _JC.cunterObj._objects[0];
                        var _lineObj = _JC.cunterObj._objects[1];
                        var _textIndex = 0,
                            _lineIndex = 1;
                    } else {
                        var _textObj = _JC.cunterObj._objects[1];
                        var _lineObj = _JC.cunterObj._objects[0];
                        var _textIndex = 1,
                            _lineIndex = 0;
                    }
                    _JC.cunterObj.item(_textIndex).set({
                        textAlign: "center"
                    });
                    _JC.cunterObj.addWithUpdate();
                    _JC.cunterObj.setCoords();
                }
                break;
            case "align-right":
                if (_JC.cunterObj.dType != "productPriceGroup") {
                    _JC.cunterObj.textAlign = "right";
                    if (_JC.cunterObj.hasOwnProperty("group")) {
                        _JC.cunterObj.group.addWithUpdate();
                        _JC.cunterObj.group.setCoords();
                    }
                } else {
                    //划线文本组件属性显示
                    if (_JC.cunterObj._objects[0].type == "i-text") {
                        var _textObj = _JC.cunterObj._objects[0];
                        var _lineObj = _JC.cunterObj._objects[1];
                        var _textIndex = 0,
                            _lineIndex = 1;
                    } else {
                        var _textObj = _JC.cunterObj._objects[1];
                        var _lineObj = _JC.cunterObj._objects[0];
                        var _textIndex = 1,
                            _lineIndex = 0;
                    }
                    _JC.cunterObj.item(_textIndex).set({
                        textAlign: "right"
                    });
                    _JC.cunterObj.addWithUpdate();
                    _JC.cunterObj.setCoords();
                }
                break;
            case "align-lineSpace":
                //行间距 lineHeight 0.5〜3倍
                //弹出滑块，
                $(".textAlignMode").attr("show", "1");
                if (!$("#textLineSpace").is(":visible")) {
                    $(".sliderTextBox").show();
                    $(".sliderTextBox .demo-slider").hide();
                    $("#textLineSpace").show();
                    //默认滑块
                    layui.slider.render({
                        elem: '#textLineSpace',
                        value: _JC.cunterObj.lineHeight * 10,
                        min: 5 //最小值
                            ,
                        max: 30 //最大值
                            ,
                        step: 1 //步长
                            ,
                        input: false,
                        setTips: function(value) { //自定义提示文本
                            return ((value * 10).toFixed(0) + "%");
                        },
                        change: function(value) {
                            if (value >= 5 && value <= 30) {
                                _JC.cunterObj.lineHeight = (value * 0.1).toFixed(1);
                                if (_JC.cunterObj.hasOwnProperty("group")) {
                                    _JC.cunterObj.group.addWithUpdate();
                                }
                                canvas.renderAll();
                            }
                        }
                    });
                }
                break;
            case "align-fontSpace":
                //字间距
                $(".textAlignMode").attr("show", "1");
                if (!$("#textFontSpace").is(":visible")) {
                    $(".sliderTextBox").show();
                    $(".sliderTextBox .demo-slider").hide();
                    $("#textFontSpace").show();
                    //默认滑块
                    layui.slider.render({
                        elem: '#textFontSpace',
                        value: _JC.cunterObj.charSpacing,
                        min: 0 //最小值
                            ,
                        max: 300 //最大值
                            ,
                        step: 10 //步长
                            ,
                        setTips: function(value) { //自定义提示文本
                            return value;
                        },
                        change: function(value) {
                            if (value >= 0 && value <= 300) {
                                _JC.cunterObj.charSpacing = value;
                                canvas.renderAll();
                            }
                        }
                    });
                }
                break;
            case "align-fontAngle":
                //字旋转
                $(".textAlignMode").attr("show", "1");
                if (!$("#textFontSpace").is(":visible")) {
                    $(".sliderTextBox").show();
                    $(".sliderTextBox .demo-slider").hide();
                    $("#textFontAglin").show();
                    //默认滑块
                    layui.slider.render({
                        elem: '#textFontAglin',
                        value: _JC.cunterObj.angle,
                        min: 0 //最小值
                            ,
                        max: 360 //最大值
                            ,
                        step: 5 //步长
                            ,
                        setTips: function(value) { //自定义提示文本
                            return value;
                        },
                        change: function(value) {
                            if (value >= 0 && value <= 360) {
                                _JC.cunterObj.angle = value;
                                canvas.renderAll();
                            }
                        }
                    });
                }
                break;
        }
        canvas.renderAll();
        _JC.drawing = true;
        //事务描述
        var msg = "Edit element";
        _JC.canvasSave().canvasHistoryRecordCall(msg);
        
    } else if (_type != "" && _JC.selectedObject != null) {
        if (_JC.selectedObject.length > 1) {
            var composingObject = _JC.selectedObject;
        } else {
            var composingObject = _JC.selectedObject[0]._objects;
        }
        switch (_type) {
            case "align-left":
                for (var i = 0; i < composingObject.length; i++) {
                    if (composingObject[i].dType != "productPriceGroup") {
                        composingObject[i].textAlign = "left";
                    } else {
                        //划线文本组件属性显示
                        if (composingObject[i]._objects[0].type == "i-text") {
                            var _textObj = composingObject[i]._objects[0];
                            var _lineObj = composingObject[i]._objects[1];
                            var _textIndex = 0,
                                _lineIndex = 1;
                        } else {
                            var _textObj = composingObject[i]._objects[1];
                            var _lineObj = composingObject[i]._objects[0];
                            var _textIndex = 1,
                                _lineIndex = 0;
                        }
                        composingObject[i].item(_textIndex).set({
                            textAlign: "left"
                        });
                    }
                    if (composingObject[i].hasOwnProperty("group")) {
                        composingObject[i].group.addWithUpdate();
                        composingObject[i].group.setCoords();
                    }
                }
                break;
            case "align-center":
                for (var i = 0; i < composingObject.length; i++) {
                    if (composingObject[i].dType != "productPriceGroup") {
                        composingObject[i].textAlign = "center";
                    } else {
                        //划线文本组件属性显示
                        if (composingObject[i]._objects[0].type == "i-text") {
                            var _textObj = composingObject[i]._objects[0];
                            var _lineObj = composingObject[i]._objects[1];
                            var _textIndex = 0,
                                _lineIndex = 1;
                        } else {
                            var _textObj = composingObject[i]._objects[1];
                            var _lineObj = composingObject[i]._objects[0];
                            var _textIndex = 1,
                                _lineIndex = 0;
                        }
                        composingObject[i].item(_textIndex).set({
                            textAlign: "center"
                        });
                    }
                    if (composingObject[i].hasOwnProperty("group")) {
                        composingObject[i].group.addWithUpdate();
                        composingObject[i].group.setCoords();
                    }
                }
                break;
            case "align-right":
                for (var i = 0; i < composingObject.length; i++) {
                    if (composingObject[i].dType != "productPriceGroup") {
                        composingObject[i].textAlign = "right";
                    } else {
                        //划线文本组件属性显示
                        if (composingObject[i]._objects[0].type == "i-text") {
                            var _textObj = composingObject[i]._objects[0];
                            var _lineObj = composingObject[i]._objects[1];
                            var _textIndex = 0,
                                _lineIndex = 1;
                        } else {
                            var _textObj = composingObject[i]._objects[1];
                            var _lineObj = composingObject[i]._objects[0];
                            var _textIndex = 1,
                                _lineIndex = 0;
                        }
                        composingObject[i].item(_textIndex).set({
                            textAlign: "right"
                        });
                    }
                    if (composingObject[i].hasOwnProperty("group")) {
                        composingObject[i].group.addWithUpdate();
                        composingObject[i].group.setCoords();
                    }
                }
                break;
            case "align-lineSpace":
                //行间距 lineHeight 0.5〜3倍
                //弹出滑块，
                $(".textAlignMode").attr("show", "1");
                if (!$("#moreTextLineSpace").is(":visible")) {
                    $(".sliderTextBox").show();
                    $(".sliderTextBox .demo-slider").hide();
                    $("#moreTextLineSpace").show();
                    //默认滑块
                    layui.slider.render({
                        elem: '#moreTextLineSpace',
                        value: 0,
                        min: 5 //最小值
                            ,
                        max: 30 //最大值
                            ,
                        step: 1 //步长
                            ,
                        setTips: function(value) { //自定义提示文本
                            return ((value * 10).toFixed(0) + "%");
                        },
                        change: function(value) {
                            if (value >= 5 && value <= 30) {
                                for (var i = 0; i < composingObject.length; i++) {
                                    composingObject[i].lineHeight = (value * 0.1).toFixed(1);
                                    if (composingObject[i].hasOwnProperty("group")) {
                                        composingObject[i].group.addWithUpdate();
                                    }
                                }
                                canvas.renderAll();
                            }
                        }
                    });
                }
                break;
            case "align-fontSpace":
                //字间距
                $(".textAlignMode").attr("show", "1");
                if (!$("#moreTextFontSpace").is(":visible")) {
                    $(".sliderTextBox").show();
                    $(".sliderTextBox .demo-slider").hide();
                    $("#moreTextFontSpace").show();
                    //默认滑块
                    layui.slider.render({
                        elem: '#moreTextFontSpace',
                        value: 0,
                        min: 0 //最小值
                            ,
                        max: 300 //最大值
                            ,
                        step: 10 //步长
                            ,
                        setTips: function(value) { //自定义提示文本
                            return value;
                        },
                        change: function(value) {
                            if (value >= 0 && value <= 300) {
                                for (var i = 0; i < composingObject.length; i++) {
                                    composingObject[i].set({
                                        charSpacing: value
                                    });
                                }
                                canvas.renderAll();
                            }
                        }
                    });
                }
                break;
            case "align-fontAngle":
                //字旋转
                $(".textAlignMode").attr("show", "1");
                if (!$("#moreTextFontSpace").is(":visible")) {
                    $(".sliderTextBox").show();
                    $(".sliderTextBox .demo-slider").hide();
                    $("#moreTextFontAglin").show();
                    //默认滑块
                    layui.slider.render({
                        elem: '#moreTextFontAglin',
                        value: 0,
                        min: 0 //最小值
                            ,
                        max: 360 //最大值
                            ,
                        step: 5 //步长
                            ,
                        setTips: function(value) { //自定义提示文本
                            return value;
                        },
                        change: function(value) {
                            if (value >= 0 && value <= 360) {
                                for (var i = 0; i < composingObject.length; i++) {
                                    composingObject[i].angle = value;
                                }
                                canvas.renderAll();
                            }
                        }
                    });
                }
                break;
        }
        canvas.renderAll();
        _JC.drawing = true;
        //事务描述
        var msg = "Edit element";
        _JC.canvasSave().canvasHistoryRecordCall(msg);
        
    }
});
//文字粗、细、斜体方式
$(".layui-fontStyle").on("click", function() {
    var _mode = $(this).attr("data");
    if (_mode != "" && !$(this).hasClass("noneClick")) {
        if (_JC.cunterObj != null && _JC.cunterObj.hasOwnProperty("type")) {
            switch (_mode) {
                case "Bold":
                    if (_JC.cunterObj.dType != "productPriceGroup") {
                        _JC.cunterObj.fontWeight = "bold";
                    } else {
                        //划线文本组件属性显示
                        if (_JC.cunterObj._objects[0].type == "i-text") {
                            var _textObj = _JC.cunterObj._objects[0];
                            var _lineObj = _JC.cunterObj._objects[1];
                            var _textIndex = 0,
                                _lineIndex = 1;
                        } else {
                            var _textObj = _JC.cunterObj._objects[1];
                            var _lineObj = _JC.cunterObj._objects[0];
                            var _textIndex = 1,
                                _lineIndex = 0;
                        }
                        _JC.cunterObj.item(_textIndex).set({
                            fontWeight: "bold"
                        });
                    }
                    $(this).addClass("act");
                    $(".layui-fontStyle.Regualar").removeClass("act");
                    break;
                case "Regualar":
                    if (_JC.cunterObj.dType != "productPriceGroup") {
                        _JC.cunterObj.fontWeight = "normal";
                    } else {
                        //划线文本组件属性显示
                        if (_JC.cunterObj._objects[0].type == "i-text") {
                            var _textObj = _JC.cunterObj._objects[0];
                            var _lineObj = _JC.cunterObj._objects[1];
                            var _textIndex = 0,
                                _lineIndex = 1;
                        } else {
                            var _textObj = _JC.cunterObj._objects[1];
                            var _lineObj = _JC.cunterObj._objects[0];
                            var _textIndex = 1,
                                _lineIndex = 0;
                        }
                        _JC.cunterObj.item(_textIndex).set({
                            fontWeight: "normal"
                        });
                    }
                    $(this).addClass("act");
                    $(".layui-fontStyle.Bold").removeClass("act");
                    break;
                case "Italic":
                    if (_JC.cunterObj.dType != "productPriceGroup") {
                        if ($(this).hasClass("act")) {
                            _JC.cunterObj.fontStyle = 'normal';
                            $(this).removeClass("act");
                        } else {
                            _JC.cunterObj.fontStyle = 'italic';
                            $(this).addClass("act");
                        }
                    } else {
                        //划线文本组件属性显示
                        if (_JC.cunterObj._objects[0].type == "i-text") {
                            var _textObj = _JC.cunterObj._objects[0];
                            var _lineObj = _JC.cunterObj._objects[1];
                            var _textIndex = 0,
                                _lineIndex = 1;
                        } else {
                            var _textObj = _JC.cunterObj._objects[1];
                            var _lineObj = _JC.cunterObj._objects[0];
                            var _textIndex = 1,
                                _lineIndex = 0;
                        }
                        if ($(this).hasClass("act")) {
                            _JC.cunterObj.item(_textIndex).set({
                                fontStyle: "normal"
                            });
                            $(this).removeClass("act");
                        } else {
                            _JC.cunterObj.item(_textIndex).set({
                                fontStyle: "italic"
                            });
                            $(this).addClass("act");
                        }
                    }
                    break;
            }
            if (_JC.cunterObj.hasOwnProperty("group")) {
                _JC.cunterObj.group.addWithUpdate();
                _JC.cunterObj.group.setCoords();
            }
        } else if (_JC.selectedObject != null) {
            if (_JC.selectedObject.length > 1) {
                var composingObject = _JC.selectedObject;
            } else {
                var composingObject = _JC.selectedObject[0]._objects;
            }
            switch (_mode) {
                case "Bold":
                    for (var i = 0; i < composingObject.length; i++) {
                        if (composingObject[i].dType != "productPriceGroup") {
                            composingObject[i].fontWeight = "bold";
                        } else {
                            //划线文本组件属性显示
                            if (composingObject[i]._objects[0].type == "i-text") {
                                var _textObj = composingObject[i]._objects[0];
                                var _lineObj = composingObject[i]._objects[1];
                                var _textIndex = 0,
                                    _lineIndex = 1;
                            } else {
                                var _textObj = composingObject[i]._objects[1];
                                var _lineObj = composingObject[i]._objects[0];
                                var _textIndex = 1,
                                    _lineIndex = 0;
                            }
                            composingObject[i].item(_textIndex).set({
                                fontWeight: "bold"
                            });
                        }
                        if (composingObject[i].hasOwnProperty("group")) {
                            composingObject[i].group.addWithUpdate();
                            composingObject[i].group.setCoords();
                        }
                    }
                    $(this).addClass("act");
                    $(".layui-fontStyle.Regualar").removeClass("act");
                    break;
                case "Regualar":
                    for (var i = 0; i < composingObject.length; i++) {
                        if (composingObject[i].dType != "productPriceGroup") {
                            composingObject[i].fontWeight = "normal";
                        } else {
                            //划线文本组件属性显示
                            if (composingObject[i]._objects[0].type == "i-text") {
                                var _textObj = composingObject[i]._objects[0];
                                var _lineObj = composingObject[i]._objects[1];
                                var _textIndex = 0,
                                    _lineIndex = 1;
                            } else {
                                var _textObj = composingObject[i]._objects[1];
                                var _lineObj = composingObject[i]._objects[0];
                                var _textIndex = 1,
                                    _lineIndex = 0;
                            }
                            composingObject[i].item(_textIndex).set({
                                fontWeight: "normal"
                            });
                        }
                        if (composingObject[i].hasOwnProperty("group")) {
                            composingObject[i].group.addWithUpdate();
                            composingObject[i].group.setCoords();
                        }
                    }
                    $(this).addClass("act");
                    $(".layui-fontStyle.Bold").removeClass("act");
                    break;
                case "Italic":
                    if (composingObject[0].fontStyle == 'normal') {
                        $(this).addClass("act");
                        for (var i = 0; i < composingObject.length; i++) {
                            if (composingObject[i].dType != "productPriceGroup") {
                                composingObject[i].fontStyle = 'italic';
                            } else {
                                if (composingObject[i]._objects[0].type == "i-text") {
                                    var _textObj = composingObject[i]._objects[0];
                                    var _lineObj = composingObject[i]._objects[1];
                                    var _textIndex = 0,
                                        _lineIndex = 1;
                                } else {
                                    var _textObj = composingObject[i]._objects[1];
                                    var _lineObj = composingObject[i]._objects[0];
                                    var _textIndex = 1,
                                        _lineIndex = 0;
                                }
                                composingObject[i].item(_textIndex).set({
                                    fontStyle: "italic"
                                });
                            }
                            if (composingObject[i].hasOwnProperty("group")) {
                                composingObject[i].group.addWithUpdate();
                                composingObject[i].group.setCoords();
                            }
                        }
                    } else {
                        $(this).removeClass("act");
                        for (var i = 0; i < composingObject.length; i++) {
                            if (composingObject[i].dType != "productPriceGroup") {
                                composingObject[i].fontStyle = 'normal';
                            } else {
                                if (composingObject[i]._objects[0].type == "i-text") {
                                    var _textObj = composingObject[i]._objects[0];
                                    var _lineObj = composingObject[i]._objects[1];
                                    var _textIndex = 0,
                                        _lineIndex = 1;
                                } else {
                                    var _textObj = composingObject[i]._objects[1];
                                    var _lineObj = composingObject[i]._objects[0];
                                    var _textIndex = 1,
                                        _lineIndex = 0;
                                }
                                composingObject[i].item(_textIndex).set({
                                    fontStyle: "normal"
                                });
                            }
                            if (composingObject[i].hasOwnProperty("group")) {
                                composingObject[i].group.addWithUpdate();
                                composingObject[i].group.setCoords();
                            }
                        }
                    }
                    break;
            }
        }
        canvas.renderAll();
        _JC.drawing = true;
        //事务描述
        var msg = "Edit element";
        _JC.canvasSave().canvasHistoryRecordCall(msg);
    }
});
/** 组件阴影特效 **/
//给阴影场景 输入框邦定回车事件 单组件
$('.componentShadow input').bind('keypress', function(event) {
    if (event.keyCode == "13") {
        var _parent = $(this).parent().parent().parent();
        var shadowColor = $(_parent).find(".colorPreview").attr("hex");
        if (shadowColor == "" || shadowColor == null || shadowColor == undefined) {
            shadowColor = "#000000";
        }
        var angleVal = $(_parent).find(".angleNum").html();
        angleVal = angleVal * 1;
        var filterBlur = $(_parent).find("input[name=filterBlur]").val();
        filterBlur = (filterBlur <= 0 || filterBlur == "") ? 0 : filterBlur;
        var offset = $(_parent).find("input[name=filterDistance]").val();
        var offsetX = offset * angleVal / 360;
        var offsetY = offset * angleVal / 360;
        var shadow = _JC.cunterObj.shadow;
        if (shadow != null) {
            if (shadow.color == null || shadow.color == undefined || shadow.color == 'undefined') {
                shadow.color = _JC.cunterObj.shadowColor;
            }
            if (!shadow.hasOwnProperty("angle")) {
                shadow.angle = angleVal;
            }
            shadow.offsetX = offsetX;
            shadow.offsetY = offsetY;
            shadow.shadowOffset = offsetX;
            shadow.blur = filterBlur;
            shadow.angle = angleVal;
            var shadowConfig = new fabric.Shadow(shadow);
            _JC.cunterObj.set({
                shadow: shadowConfig,
                shadowOffset: offset,
                shadowAngle: angleVal
            });
            canvas.renderAll();
            //为了解决：阴影模糊特效在输出PDF时，改用base64方式输出
            var drawObject = _JC.cunterObj;
            _JC.createObjectPng(drawObject, function(imageData, pngWidth, pngHeight) {
                //console.log(imageData);
                if (imageData.length > 500) {
                    _JC.cunterObj.shadowBase64 = imageData;
                    _JC.cunterObj.base64Width = pngWidth;
                    _JC.cunterObj.base64Height = pngHeight;
                } else {
                    _JC.cunterObj.shadowBase64 = '';
                    _JC.cunterObj.base64Width = 0;
                    _JC.cunterObj.base64Height = 0;
                }
            })
        } else {
            var parm = {
                color: shadowColor,
                blur: '0',
                offsetX: offsetX,
                offsetY: offsetY,
                shadowOffset: offset,
                angle: angleVal
            };
            _JC.cunterObj.shadowBase64 = '';
            _JC.cunterObj.base64Width = 0;
            _JC.cunterObj.base64Height = 0;
            _JC.componentDraw().componentShadow(parm);
        }
        _JC.drawing = true;
        //事务描述
        var msg = "Edit element";
        _JC.canvasSave().canvasHistoryRecordCall(msg);
    }
})
//角度选择器 单组件
$(".roundShape").mousedown(function(event) {
    var _this = $(this);
    var preX, preY; //上一次鼠标点的坐标
    var curX, curY; //本次鼠标点的坐标
    var preAngle; //上一次鼠标点与圆心(150,150)的X轴形成的角度(弧度单位)
    var transferAngle; //当前鼠标点与上一次preAngle之间变化的角度
    var angleVal = 0;
    preX = event.clientX;
    preY = event.clientY;
    //计算当前点击的点与圆心(150,150)的X轴的夹角(弧度)
    //上半圆为负(0 ~ -180), 下半圆未正[0 ~ 180]
    var _Y = $(_this).offset().top + ($('.roundShape').height() / 2);
    var _X = $(_this).offset().left + ($('.roundShape').width() / 2);
    preAngle = Math.atan2(preY - _Y, preX - _X);
    angleVal += (preAngle * 180 / Math.PI);
    angleVal = parseInt(angleVal);
    $(_this).rotate(angleVal);
    var _parent = $(_this).parent().parent();
    $(_parent).find(".angleNum").html(angleVal);
    var shadowColor = $(_parent).find(".colorPreview").attr("hex");
    if (shadowColor == "" || shadowColor == null || shadowColor == undefined) {
        shadowColor = "#000000";
    }
    var shadowBlur = $(_parent).find("input[name=filterBlur]").val();
    var offset = $(_parent).find("input[name=filterDistance]").val();
    var offsetX = offset * angleVal / 360;
    var offsetY = offset * angleVal / 360;
    var shadow = _JC.cunterObj.shadow;
    if (shadow != null) {
        if (shadow.color == null || shadow.color == undefined || shadow.color == 'undefined') {
            shadow.color = _JC.cunterObj.shadowColor;
        }
        shadow.offsetX = offsetX;
        shadow.offsetY = offsetY;
        shadow.shadowOffset = offsetX;
        shadow.angle = angleVal;
        var shadowConfig = new fabric.Shadow(shadow);
        _JC.cunterObj.set({
            shadow: shadowConfig,
            shadowOffset: offset,
            shadowAngle: angleVal
        });
        canvas.renderAll();
    } else {
        var parm = {
            color: shadowColor,
            blur: shadowBlur,
            offsetX: offsetX,
            offsetY: offsetY,
            shadowOffset: offset,
            angle: angleVal
        };
        _JC.componentDraw().componentShadow(parm);
    }
    //移动事件
    $("html").mousemove(function(event) {
        curX = event.clientX;
        curY = event.clientY;
        //计算当前点击的点与圆心(Y,X)的X轴的夹角(弧度)
        //上半圆为负(0 ~ -180), 下半圆未正[0 ~ 180]
        var curAngle = Math.atan2(curY - _Y, curX - _X);
        transferAngle = curAngle - preAngle;
        angleVal += (transferAngle * 180 / Math.PI);
        angleVal = parseInt(angleVal);
        $(_this).rotate(angleVal);
        $(_parent).find(".angleNum").html(angleVal);
        preX = curX;
        preY = curY;
        preAngle = curAngle;
        var offsetX = offset * angleVal / 360;
        var offsetY = offset * angleVal / 360;
        var shadow = _JC.cunterObj.shadow;
        if (shadow != null) {
            if (shadow.color == null || shadow.color == undefined || shadow.color == 'undefined') {
                shadow.color = _JC.cunterObj.shadowColor;
            }
            shadow.offsetX = offsetX;
            shadow.offsetY = offsetY;
            shadow.shadowOffset = offsetX;
            shadow.angle = angleVal;
            var shadowConfig = new fabric.Shadow(shadow);
            _JC.cunterObj.set({
                shadow: shadowConfig,
                shadowOffset: offset,
                shadowAngle: angleVal
            });
            canvas.renderAll();
        } else {
            var parm = {
                color: shadowColor,
                blur: shadowBlur,
                offsetX: offsetX,
                offsetY: offsetY,
                shadowOffset: offset,
                angle: angleVal
            };
            _JC.componentDraw().componentShadow(parm);
        }
    });
    //释放事件
    $("html").mouseup(function(event) {
        $("html").unbind("mousemove");
    });
    _JC.drawing = true;
    //事务描述
    var msg = "Edit element";
    _JC.canvasSave().canvasHistoryRecordCall(msg);
});
/* 多选组件批量设置阴影 Start **/
//给阴影场景 输入框邦定回车事件
$('.moreComponentShadow input').bind('keypress', function(event) {
    if (event.keyCode == "13") {
        var _parent = $(this).parent().parent().parent();
        var shadowColor = $(_parent).find(".colorPreview").attr("hex");
        if (shadowColor == "" || shadowColor == null || shadowColor == undefined) {
            shadowColor = "#000000";
        }
        var angleVal = $(_parent).find(".moreAngleNum").html();
        angleVal = angleVal * 1;
        var filterBlur = $(_parent).find("input[name=moreFilterBlur]").val();
        filterBlur = (filterBlur <= 0 || filterBlur == "") ? 0 : filterBlur;
        var offset = $(_parent).find("input[name=moreFilterDistance]").val();
        var offsetX = offset * angleVal / 360;
        var offsetY = offset * angleVal / 360;
        if (_JC.selectedObject.length > 1) {
            var composingObject = _JC.selectedObject;
        } else {
            var composingObject = _JC.selectedObject[0]._objects;
        }
        for (var i = 0; i < composingObject.length; i++) {
            _JC.cunterObj = composingObject[i];
            var shadow = _JC.cunterObj.shadow;
            if (shadow != null) {
                if (shadow.color == null || shadow.color == undefined || shadow.color == 'undefined') {
                    shadow.color = _JC.cunterObj.shadowColor;
                }
                if (!shadow.hasOwnProperty("angle")) {
                    shadow.angle = angleVal;
                }
                shadow.offsetX = offsetX;
                shadow.offsetY = offsetY;
                shadow.shadowOffset = offsetX;
                shadow.blur = filterBlur;
                shadow.angle = angleVal;
                var shadowConfig = new fabric.Shadow(shadow);
                _JC.cunterObj.set({
                    shadow: shadowConfig,
                    shadowOffset: offset,
                    shadowAngle: angleVal
                });
                canvas.renderAll();
                //为了解决：阴影模糊特效在输出PDF时，改用base64方式输出
                var drawObject = _JC.cunterObj;
                _JC.createObjectPng(drawObject, function(imageData, pngWidth, pngHeight) {
                    //console.log(imageData);
                    if (imageData.length > 500) {
                        _JC.cunterObj.shadowBase64 = imageData;
                        _JC.cunterObj.base64Width = pngWidth;
                        _JC.cunterObj.base64Height = pngHeight;
                    } else {
                        _JC.cunterObj.shadowBase64 = '';
                        _JC.cunterObj.base64Width = 0;
                        _JC.cunterObj.base64Height = 0;
                    }
                })
            } else {
                var parm = {
                    color: shadowColor,
                    blur: '0',
                    offsetX: offsetX,
                    offsetY: offsetY,
                    shadowOffset: offset,
                    angle: angleVal
                };
                _JC.cunterObj.shadowBase64 = '';
                _JC.cunterObj.base64Width = 0;
                _JC.cunterObj.base64Height = 0;
                _JC.componentDraw().componentShadow(parm);
            }
        }
        _JC.cunterObj = null;
        _JC.drawing = true;
        //事务描述
        var msg = "Edit element";
        _JC.canvasSave().canvasHistoryRecordCall(msg);
    }
})
//角度选择器
$(".moreRoundShape").mousedown(function(event) {
    var _this = $(this);
    var preX, preY; //上一次鼠标点的坐标
    var curX, curY; //本次鼠标点的坐标
    var preAngle; //上一次鼠标点与圆心(150,150)的X轴形成的角度(弧度单位)
    var transferAngle; //当前鼠标点与上一次preAngle之间变化的角度
    var angleVal = 0;
    preX = event.clientX;
    preY = event.clientY;
    //计算当前点击的点与圆心(150,150)的X轴的夹角(弧度)
    //上半圆为负(0 ~ -180), 下半圆未正[0 ~ 180]
    var _Y = $(_this).offset().top + ($('.moreRoundShape').height() / 2);
    var _X = $(_this).offset().left + ($('.moreRoundShape').width() / 2);
    preAngle = Math.atan2(preY - _Y, preX - _X);
    angleVal += (preAngle * 180 / Math.PI);
    angleVal = parseInt(angleVal);
    $(_this).rotate(angleVal);
    var _parent = $(_this).parent().parent();
    $(_parent).find(".moreAngleNum").html(angleVal);
    var shadowColor = $(_parent).find(".colorPreview").attr("hex");
    if (shadowColor == "" || shadowColor == null || shadowColor == undefined) {
        shadowColor = "#000000";
    }
    var shadowBlur = $(_parent).find("input[name=moreFilterBlur]").val();
    var offset = $(_parent).find("input[name=moreFilterDistance]").val();
    var offsetX = offset * angleVal / 360;
    var offsetY = offset * angleVal / 360;
    if (_JC.selectedObject.length > 1) {
        var composingObject = _JC.selectedObject;
    } else {
        var composingObject = _JC.selectedObject[0]._objects;
    }
    for (var i = 0; i < composingObject.length; i++) {
        _JC.cunterObj = composingObject[i];
        var shadow = _JC.cunterObj.shadow;
        if (shadow != null) {
            if (shadow.color == null || shadow.color == undefined || shadow.color == 'undefined') {
                shadow.color = _JC.cunterObj.shadowColor;
            }
            shadow.offsetX = offsetX;
            shadow.offsetY = offsetY;
            shadow.shadowOffset = offsetX;
            shadow.angle = angleVal;
            var shadowConfig = new fabric.Shadow(shadow);
            _JC.cunterObj.set({
                shadow: shadowConfig,
                shadowOffset: offset,
                shadowAngle: angleVal
            });
            canvas.renderAll();
        } else {
            var parm = {
                color: shadowColor,
                blur: shadowBlur,
                offsetX: offsetX,
                offsetY: offsetY,
                shadowOffset: offset,
                angle: angleVal
            };
            _JC.componentDraw().componentShadow(parm);
        }
    }
    //移动事件
    $("html").mousemove(function(event) {
        curX = event.clientX;
        curY = event.clientY;
        //计算当前点击的点与圆心(Y,X)的X轴的夹角(弧度)
        //上半圆为负(0 ~ -180), 下半圆未正[0 ~ 180]
        var curAngle = Math.atan2(curY - _Y, curX - _X);
        transferAngle = curAngle - preAngle;
        angleVal += (transferAngle * 180 / Math.PI);
        angleVal = parseInt(angleVal);
        $(_this).rotate(angleVal);
        $(_parent).find(".moreAngleNum").html(angleVal);
        preX = curX;
        preY = curY;
        preAngle = curAngle;
        var offsetX = offset * angleVal / 360;
        var offsetY = offset * angleVal / 360;
        if (_JC.selectedObject.length > 1) {
            var composingObject = _JC.selectedObject;
        } else {
            var composingObject = _JC.selectedObject[0]._objects;
        }
        for (var i = 0; i < composingObject.length; i++) {
            _JC.cunterObj = composingObject[i];
            var shadow = _JC.cunterObj.shadow;
            if (shadow != null) {
                if (shadow.color == null || shadow.color == undefined || shadow.color == 'undefined') {
                    shadow.color = _JC.cunterObj.shadowColor;
                }
                shadow.offsetX = offsetX;
                shadow.offsetY = offsetY;
                shadow.shadowOffset = offsetX;
                shadow.angle = angleVal;
                var shadowConfig = new fabric.Shadow(shadow);
                _JC.cunterObj.set({
                    shadow: shadowConfig,
                    shadowOffset: offset,
                    shadowAngle: angleVal
                });
                canvas.renderAll();
            } else {
                var parm = {
                    color: shadowColor,
                    blur: shadowBlur,
                    offsetX: offsetX,
                    offsetY: offsetY,
                    shadowOffset: offset,
                    angle: angleVal
                };
                _JC.componentDraw().componentShadow(parm);
            }
        }
    });
    //释放事件
    $("html").mouseup(function(event) {
        $("html").unbind("mousemove");
    });
    _JC.drawing = true;
    //事务描述
    var msg = "Edit element";
    _JC.canvasSave().canvasHistoryRecordCall(msg);
});
/** End */
/**  图片选择. **/
//弹出素材图列表
$("#elementPicture,#pageBackground").on("click", function() {

    if ($(this).attr("id")=="pageBackground"){
        if (!_JC.canvasDraw().isDrawBackgroundImage(canvas._objects)){
            _JC.canvasDraw().drawBackgroundImage();
        }else{
            _JC.cunterObj=_JC.componentDraw().searchObject({id:'BackgroundImage'},canvas._objects);
        }
    }

    var index_page = layer.open({
        type: 2,
        title: 'Picture',
        id: 'marketingPicture',
        content: '/makroDigital/marketingElement/select/background',
        area: ['1080px', '600px'],
        btn: [],
        yes: function(index, layero) { 
            var iframeWindow = window['layui-layer-iframe' + index],
                submitID = 'LAY-picture-Save-submit',
                submit = layero.find('iframe').contents().find('#' + submitID);
            submit.trigger('click');
        }
    });
});
//商品关联图片替换事件 
$(".productPictureList").on("click", ".replacePicture", function() {
    var rgbPic = $(this).attr("rgbPic");
    var cmykPic = $(this).attr("cmykPic");
    var picid = $(this).attr("picid");
    var proID=  $(this).attr("proID");
    picid = (picid == "null") ? null : picid;
    proID = (proID == "null") ? null : proID;
    var bindItemCode = $(this).attr("bindItemCode");
    bindItemCode = (bindItemCode == "null") ? null : bindItemCode;

    if (isEmpty(rgbPic) == false) {

        //更改MM指定商品默认图片
        updateProductDefaultsImage({picID:picid,proID:proID});

        var _img = _JC.cunterObj;
        newParm = {
            src: rgbPic,
            dType: "productPicture",
            cmykSrc: cmykPic, 
            picid: picid,
            itemcode: bindItemCode,
            customSetPic: true
        };
        _JC.canvasDraw().setProductPicture(newParm, null, _img, function(newImg, objectSort) {

            var _pi=(_img._objects[0].width * _img._objects[0].scaleX * _img.scaleX ) / newImg.width;
            newImg.scale(_pi);
            var picBoxHeight = _img.height;
            var newImgBoxHeight = newImg.height * newImg.scaleY;

            _img._objects[0] = newImg;
            _img._objects[0].visible = true;
            _img._objects[1].visible = false;
            _img._objects[2].visible = false;
            if (_img._objects[3]) {
                _img._objects[3].visible = false;
            }
         
            _img.scaleX=1;
            _img.scaleY=1;
            _img.scale(1);
            _JC.cunterObj.scale(1);

            for (var i=0;i<_img._objects.length;i++){
                if (_img._objects[i].type!="textbox" && _img._objects[i].type!="image"){

                    _img._objects[i].width=_img._objects[0].width * _img._objects[0].scaleX;
                    _img._objects[i].height=_img._objects[0].height * _img._objects[0].scaleY;
                    _img._objects[i].scaleX=1;
                    _img._objects[i].scaleY=1;
                    _img._objects[i].left=-0.5 * _img._objects[i].width;
                    _img._objects[i].top=-0.5 * _img._objects[i].height;
                }else{
       
                    if (_img._objects[i].type=="textbox"){
                        _img._objects[i].fontSize=10;
                        _img._objects[i].scaleX=1;
                        _img._objects[i].scaleY=1;
                    }
                    _img._objects[i].left=-0.5 * _img._objects[i].width * _img._objects[i].scaleX;
                    _img._objects[i].top=-0.5 * _img._objects[i].height * _img._objects[i].scaleY;
                }

            }

            _img.addWithUpdate();
            _img.setCoords();
            canvas.renderAll();
            //事务描述
            var msg = "Replace Picture";
            _JC.canvasSave().canvasHistoryRecordCall(msg);
        });
    } else {
        layer.msg("Void Data");
    }
});
//缩放背景图适应到纸张
$("#zoomToPaper").on("click", function() {
    var _w = _JC.paperSize.bleedWidth - 1;
    var _h = _JC.paperSize.bleedHeight;
    var _x = _JC.canvasPaddX + 1;
    var _y = _JC.canvasPaddY + 1;
    var objType = "BackgroundImage";
    var canvasObjects = canvas.getObjects();
    _JC.cunterObj = _JC.canvasDraw().searchObject({
        id: "BackgroundImage"
    }, canvasObjects);
    
    if (_JC.cunterObj.angle*1!=0){
        _JC.cunterObj.angle=0;
    }
    
    var pi = 1;
    if (_w > _JC.cunterObj.width) {
        pi = _w / _JC.cunterObj.width;
    } else if (_w < _JC.cunterObj.width) {
        //pi=_JC.cunterObj.width / _w;
        pi = _w / _JC.cunterObj.width;
    }
    _JC.cunterObj.set({
        scaleX: pi,
        scaleY: pi,
        left: _x,
        top: _y
    });
    canvas.renderAll();
});
//锁定背景图
$("#LockBackgroundImage").on("click", function() {
    var canvasObjects = canvas.getObjects();
    _JC.cunterObj = _JC.canvasDraw().searchObject({
        id: "BackgroundImage"
    }, canvasObjects);


    var isLock = _JC.cunterObj.lockMovementX;
    _JC.componentDraw().lockBtnBtnObj();
    // var isLock=_JC.cunterObj.selectable;

    _JC.cunterObj.set({
        lockMovementX: (!isLock),
        lockMovementY:(!isLock),
        lockRotation:(!isLock)
    });
    if (!isLock) {
        canvas.discardActiveObject();
        canvas.renderAll();
        //$("#LockBackgroundImage").html("Lock Background");
        $("#LockBackgroundImage").html("Unlock Background");
    } else {
        canvas.setActiveObject(_JC.cunterObj);
        canvas.renderAll();
        $("#LockBackgroundImage").html("Lock Background");
        //$("#LockBackgroundImage").html("Unlock Background");
    }
});
//查看副本
$(".helpIcon").click(function() {
    if ($(this).hasClass("noneClick") == false) {
        $(".pushMenu").show();
    }
});
$(".pushMenu").hover(function() {}, function() {
    undefined
    $(".pushMenu").hide();
});
//弹出层窗口切换当前页面副本
$("#pagesDuplicate").on("click", function() {


    //生成并保存该副本base64图片 -> 并自动保存上传服务器
    var mapParm = {};
    mapParm.zoom = getThumbnailZoom(_JC.paperSize.bleedWidth, _JC.paperSize.bleedHeight, minThumbnail, maxThumbnail);
    var offset = Math.ceil(mapParm.zoom);
    mapParm.x = _JC.canvasPaddX * mapParm.zoom + offset;
    mapParm.y = _JC.canvasPaddY * mapParm.zoom + offset;
    mapParm.width = _JC.paperSize.bleedWidth - parseInt(mapParm.zoom);
    mapParm.height = _JC.paperSize.bleedHeight - parseInt(mapParm.zoom);
    var canvasCode = canvas.toJSON(_JC.canvasConfig.outFiled);
    //当前页码、副本号
    var pageSort = _JC.cunterPage;
    var pageNo = canvasCode.No;
    //生成切换前页面的缩略图到对应副本
    createDupThumbnail(mapParm, canvasCode, thumbnailCanvas, _JC, pageSort, pageNo, function(previewUrl) {
        //更新当前页面主副本到模板副本集
        var canvasJson = _JC.canvasSave().screeningDuplicate(canvas.toJSON(_JC.canvasConfig.outFiled), _JC.canvasPaddX, _JC.canvasPaddY);
        canvasJson.previewUrl = previewUrl;
        //更新到当前页的副本集
        _JC.canvasSave().updatePageDuplicate(_JC.canvasConfig.recordPointer.pointerPageNo, canvasJson);
        //更新到模板所有页副本集 当前页 设计内容
        _JC.pagesDuplicate[_JC.cunterPage] = _JC.templateData.cunterPageDuplicate;
        //更新到模板所有页副本集 当前页 内容缩略图
        var duplicates = _JC.pagesDuplicate[pageSort];
        for (var i = 0; i < duplicates.length; i++) {
            if (duplicates[i].No * 1 == pageNo * 1) {
                //删除原缩略图
                if (duplicates[i].previewUrl) {
                    layui.uploadAPI.cancel([duplicates[i].previewUrl], function() {});
                }
                //更新新图
                canvas.previewUrl = previewUrl;
                _JC.pagesDuplicate[pageSort][i].previewUrl = previewUrl;
                _JC.templateData.cunterPageDuplicate[i].previewUrl = previewUrl;
                break;
            }
        }
        var duplicateView = layer.open({
            id: 'duplicateView',
            type: 2,
            title: 'History Version',
            shade: 0,
            content: "/makroDigital/marketingTemplate/duplicate",
            maxmin: false,
            yes: function(index, layero) {},
            success: function(layero, index) {}
        });
        layer.full(duplicateView);
    });

});
//顶部模板各单页清单
$(".disPage").click(function() {
    if ($(this).hasClass("noneClick") != true && _JC.undoGroupSource == null) {
        var pageData = _JC.templateData.templatePages;
        var _Html = '';
        for (var i = 0; i < pageData.length; i++) {
            var isAct = "";
            if (pageData[i].sort * 1 - 1 == _JC.cunterPage) {
                isAct = 'act';
                templateFile = pageData[i].templateFile;
            }
            _Html = _Html + '<div class="pageDt ' + isAct + '" pageSort="' + (pageData[i].sort * 1) + '" pageCode="' + pageData[i].pageCode + '" file="' + pageData[i].templateFile + '" >' + (i + 1) + '</div>';
        }
        $(".pageList .listDl").html(_Html);
        $(".pageList").addClass("moveDown");
    }
})
/** 画布组件操作类 **/
//克隆组件
$(".copyComponent").on("click", function() {
    if (!$(this).hasClass("noneClick")) {
        _JC.componentDraw().duplicateObj();
    } else {
        layer.msg("Please select components");
    }
});
//恢复组件初始状态
$(".RevertBtn").on("click", function() {
    if (!$(this).hasClass("noneClick")) {
        var _Left = _JC.cunterObj.x;
        _JC.cunterObj.scaleY = 1;
        _JC.cunterObj.scaleX = 1;
        _JC.cunterObj.x = _Left;
        canvas.renderAll();
    } else {
        layer.msg("Please select components");
    }
});
//从组件原设计稿中刷新当前组件
$(".RefreshBtn").on("click", function() {
    if (!$(this).hasClass("noneClick")) {
        if (_JC.cunterObj != null) {
            if (_JC.cunterObj.dType == "Product") {
                var _elementCode = _JC.cunterObj.elementCode;
                if (_elementCode != "") {
                    $(".insertComponent").each(function(index) {
                        if ($(this).attr("elementcode") == _elementCode) {
                            var _index = index;
                            // $(".insertComponent").eq(_index).click();
                            var elementData = {
                                name: "Product",
                                elementCode: _elementCode,
                                dType: ($(this).attr("typeCode")),
                            };
                            if (!isEmpty(elementData.elementCode)) {
                                //获取组件代码
                                var mydata = {
                                    url: getApiUrl('marketing.component.detail', {
                                        code: elementData.elementCode
                                    }),
                                    type: getApiMethod('marketing.component.detail'),
                                };
                                getTemplateCode(mydata, function(result) {
                                    if (result.code == "0000") {
                                        var outData = result.data.content;
                                        var duplicate = outData.duplicate;
                                        elementData.file = duplicate;
                                        _JC.componentDraw().saveComponentTask(elementData);
                                        //临时保存原先组件属性
                                        _JC.insertX = _JC.cunterObj.left;
                                        _JC.insertY = _JC.cunterObj.top;
                                        var scaleX = _JC.cunterObj.scaleX;
                                        var scaleY = _JC.cunterObj.scaleY;
                                        var dSort = _JC.cunterObj.dSort;
                                        //从画布删除原cunterObj
                                        canvas.remove(_JC.cunterObj);
                                        _JC.cunterObj = null;
                                        _JC.componentDraw().drawComponentTask(function() {
                                            _JC.cunterObj.dSort = dSort;
                                            _JC.cunterObj.scaleX = scaleX;
                                            _JC.cunterObj.scaleY = scaleY;
                                            canvas.renderAll();
                                            if (_JC.designModule == "mm") {
                                                viewObject = mmDetailsData[_JC.cunterPage * 1][dSort * 1];
                                                if (viewObject != null && viewObject.sort) {
                                                    _JC.canvasDraw().updateProduct(_JC.cunterObj, viewObject);
                                                }
                                            }
                                        });
                                    } else {
                                        layer.msg(result.msg);
                                    }
                                });
                            }
                        }
                    });
                }
            }
            _JC.drawing = true;
        }
    } else {
        layer.msg("Please select components");
    }
});
//文本格式刷事件
$(".copyStyleBtn").on("click", function() {
    //复制文本样式
    if ($(this).hasClass("selected") == false) {
        if (_JC.textStyle == null) {
            $(this).addClass("selected");
            _JC.textStyle = {};
            _JC.textStyle.scaleX = _JC.cunterObj.scaleX;
            _JC.textStyle.scaleY = _JC.cunterObj.scaleY;
            _JC.textStyle.fill = _JC.cunterObj.fill;
            _JC.textStyle.fillCmyk = _JC.cunterObj.fillCmyk;
            //字体、大小、颜色、样式
            _JC.textStyle.fontSize = _JC.cunterObj.fontSize;
            _JC.textStyle.fontFamily = _JC.cunterObj.fontFamily;
            _JC.textStyle.textAlign = _JC.cunterObj.textAlign;
            _JC.textStyle.fontStyle = _JC.cunterObj.fontStyle;
            if (!_JC.cunterObj.fontPt) {
                _JC.cunterObj.fontPt = _JC.cunterObj.fontSize;
            }
            _JC.textStyle.fontPt = _JC.cunterObj.fontPt;
            //字间距、行间距、加粗
            _JC.textStyle.charSpacing = _JC.cunterObj.charSpacing;
            _JC.textStyle.lineHeight = _JC.cunterObj.lineHeight;
            _JC.textStyle.fontWeight = _JC.cunterObj.fontWeight;
            //阴影
            _JC.textStyle.shadow = _JC.cunterObj.shadow;
            //边框
            _JC.textStyle.strokeWidth = _JC.cunterObj.strokeWidth;
            if (_JC.cunterObj.hasOwnProperty("strokePt")) {
                _JC.textStyle.strokePt = _JC.cunterObj.strokePt;
            }
            _JC.textStyle.stroke = _JC.cunterObj.stroke;
            _JC.textStyle.strokeCmyk = _JC.cunterObj.strokeCmyk;
            //背景色
            _JC.textStyle.backgroundColor = _JC.cunterObj.backgroundColor;
            _JC.textStyle.backgroundColorCmyk = _JC.cunterObj.backgroundColorCmyk;
            //旋转角度
            _JC.textStyle.angle = _JC.cunterObj.angle;
            canvas.defaultCursor = 'crosshair', canvas.hoverCursor = 'crosshair';
        }
    } else {
        $(this).removeClass("selected");
        _JC.textStyle = null;
        canvas.defaultCursor = 'default', canvas.hoverCursor = 'default';
    }
});
//从组件原设计稿中锁定与解锁当前组件
$(".LockBtn").on("click", function() {
    if (!$(this).hasClass("noneClick")) {
        _JC.componentDraw().lockBtnBtnObj();
    } else {
        layer.msg("Please select components");
    }
});
//分组合拼与分解
$(".GroupBtn").on("click", function() {
    if (!$(this).hasClass("noneClick")) {
        if ($(this).attr("data") == "undo") {

            _JC.componentDraw().undoGroup();
        } else if ($(this).attr("data") == "group") {
            _JC.componentDraw().composeGroup();
            $(".insertElement").removeClass("act");
            _JC.insertObjectData.dType = null;
            _JC.insertObjectData.name = null;
            _JC.insertObjectData.file = null;
            _JC.insertObjectData.dataFiled = null;
            _JC.insertObjectData.insertText = null;
            _JC.insertStatus = false;
            //还原画布鼠标图标
            canvas.defaultCursor = 'default', canvas.hoverCursor = 'default';
        }
        _JC.drawing = true;
    } else {
        layer.msg("Please select components");
    }
});
//删除组件
$(".deleteBtn").on("click", function() {
    if (!$(this).hasClass("noneClick")) {
        _JC.componentDraw().componentDelete();
    } else {
        layer.msg("Please select components");
    }
});
/**** 组件排版对齐事件 ****/
$(".elementAlignMode").on("click", function() {
    if (_JC.selectedObject != null) {
        var mode = $(this).attr("data");
        if (isEmpty(mode) == false) {
            _JC.componentDraw().composingElement(mode);
        }
    }
});
/** 保存操作类按钮事件邦定 **/
//水平辅助线
$('.horizontalLine,#hLine').mousedown(function(e) {
    var thisObj = $(this);
    var positionDiv = $(this).offset();
    var distenceX = e.pageX - positionDiv.left;
    var distenceY = e.pageY - positionDiv.top;
    var tmpY = distenceY;
    var defH = $(".createTemplatePageTop").height();
    thisObj = $(".horizontalLine");
    $(document).mousemove(function(e) {
        var x = e.pageX - distenceX;
        var y = e.pageY - distenceY;
        tmpY = y - defH;
        $(thisObj).css({
            'left': '0px',
            'top': (tmpY + 0) + 'px'
        });
    });
    $(document).mouseup(function(e) {
        var x = e.pageX - distenceX;
        var y = e.pageY - distenceY;
        $(thisObj).css({
            'left': '0px',
            'top': (0) + 'px'
        });
        $(thisObj).hide();
        _JC.canvasDraw().canvasReferenceLine('h', (y - e.view.canvas._offset.top));
        $(document).off('mousemove');
        $(document).off('mouseup');
    });
});
//垂直辅助线
$('.verticalLine,#vLine').mousedown(function(e) {
    var positionDiv = $(this).offset();
    var distenceX = e.pageX - positionDiv.left;
    var distenceY = e.pageY - positionDiv.top;
    var tmpX = distenceX;
    var defW = $(".edit-tool-panel").width() + $("#toolBar").width();
    $(document).mousemove(function(e) {
        var x = e.pageX - distenceX;
        var y = e.pageY - distenceY;
        tmpX = x - defW;
        $('.verticalLine').css({
            'left': tmpX + 'px',
            'top': '0px'
        });
    });
    $(document).mouseup(function(e) {
        console.log("OKI333");
        var x = e.pageX - distenceX;
        var y = e.pageY - distenceY;
        $('.verticalLine').css({
            'left': tmpX + 'px',
            'top': '0px'
        });
        $('.verticalLine').hide();
        _JC.canvasDraw().canvasReferenceLine('v', (x - e.view.canvas._offset.left));
        $(document).off('mousemove');
        $(document).off('mouseup');
    });
});
//***   画布快捷键监听 start  ***/
var copyPasteData = null;
//被复制待粘贴组件
var copyPreStatus = false;
var canvasFouseStatus = false;
var copyPreKeyCode = [0, 0, 0];
var functionKey = [17, 91, 16];
//特殊组合功能键 ctrl[Mac control]->17 ,alt[Mac option]->18 shift->16 Mac command->91
document.onkeydown = function(event) {
    // event.preventDefault();
    var cunterObj = _JC.cunterObj;
    e = event ? event : (window.event ? window.event : null);
 
    //是否开启滑轮缩放画布
    if (e.keyCode == 17) {
        _JC.isWheelStart = true;
    }else{
        _JC.isWheelStart = false;
    }
    
    if (_JC.isEditText == false){

        if (lockStatus && (e.keyCode != 86 && e.keyCode != 72)){
            _JC.cunterObj=null;
            canvas.discardActiveObject();
            canvas.selection=false;
            canvas.selectable=false;
            canvas.skipTargetFind = true;
            return;
        }


        if (e.keyCode == 16) {
            _JC.isShift = true;
        } else {
            _JC.isShift = false;
        }
        
        if (e.keyCode == 17 || e.keyCode == 91) {
            copyPreKeyCode = [e.keyCode, 0, 0];
        }
        
        if (copyPreKeyCode.indexOf(e.keyCode)==-1){
            if (copyPreKeyCode[0]==0){
                copyPreKeyCode[0] = e.keyCode;
            }else if (copyPreKeyCode[1]==0){
                copyPreKeyCode[1] = e.keyCode;
            }else if (copyPreKeyCode[2]==0){
                copyPreKeyCode[2] = e.keyCode;
            }
            
        }

        console.log(copyPreKeyCode);

        //选中的组件集进行编组
        if ((copyPreKeyCode[0] == 17 || copyPreKeyCode[0] == 91) && copyPreKeyCode[1] == 71 && _JC.selectedObject != null) {
            event.returnValue=false;
            console.log("选中的组件集进行编组");
            copyPreKeyCode = [0, 0, 0];
            if (_JC.undoGroupSource==null){
                //合并当前编辑中的分组
                _JC.componentDraw().createLayerGroup();
                
            }else{
                //在编辑分组中创建子分组
                _JC.componentDraw().createLayerGroup();
            }
            return;
        }
        //选中的分组进行打散
        if ((copyPreKeyCode[0] == 17 || copyPreKeyCode[0] == 91) && copyPreKeyCode[1] == 16 && copyPreKeyCode[2] == 71 && _JC.cunterObj != null) {
            event.returnValue=false;
            if (_JC.cunterObj.type=="group"){
                //选中的分组进行打散（不是分组临时解散编辑
                copyPreKeyCode = [0, 0, 0];
                _JC.componentDraw().ungroup(_JC.cunterObj);
                
            }else{
                layer.msg("Please select a group");
            }
            return;
        }


        //复制选中组件  && canvasFouseStatus == true)
        if ((copyPreKeyCode[0] == 17 || copyPreKeyCode[0] == 91) && copyPreKeyCode[1] == 67 && _JC.selectedObject != null) {
            event.returnValue=false;
            _JC.componentDraw().copyPageObj();
            copyPreKeyCode[1]=0;
            copyPreKeyCode[2]=0;
            return;
        }
        //粘贴已选组件 && canvasFouseStatus == true
        if ((copyPreKeyCode[0] == 17 || copyPreKeyCode[0] == 91 ) && (copyPreKeyCode[1] == 86 || copyPreKeyCode[2] == 86 ) ) {
            event.returnValue=false;
            console.log("paste OK");
            copyPreKeyCode[1]=0;
            copyPreKeyCode[2]=0;
            if (_JC.cunterObj != null) {
                if (_JC.cunterObj.type == "textbox" && _JC.cunterObj.isEditing) {
                   
                    return;
                } else {
                    _JC.componentDraw().pastePageObj();
                    return;
                }
            } else {
                _JC.componentDraw().pastePageObj();
                return;
            }
        }
        //删除选中组件
        if ((e.keyCode == 8 || e.keyCode == 46) && _JC.selectedObject != null && e.target.nodeName == "BODY" && _JC.mouseInfo.status!=0 ) {
            _JC.mouseoverObject = null;
            _JC.componentDraw().componentDelete(async function(){

            });
            canvas.discardActiveObject();
            copyPreKeyCode = [0, 0, 0];

            return;
        }
        
        //智能参考线开启及关闭
        if ((copyPreKeyCode[0] == 17 || copyPreKeyCode[0] == 91) && copyPreKeyCode[1] == 85) {
            event.returnValue=false;
            copyPreKeyCode[1]=0;
            copyPreKeyCode[2]=0;
            showGuides();
            return;
        }
        
        
        //特殊处理当选中背景图时，DEL快捷键 对背景图进行隐藏
        if ((e.keyCode == 8 || e.keyCode == 46) && _JC.cunterObj != null) {
            if (_JC.cunterObj.hasOwnProperty("dType")) {
                if (_JC.cunterObj.dType == "BackgroundImage") {
                          
                    _JC.cunterObj.set({
                        visible: false
                    });
                    canvas.discardActiveObject();
                    _JC.cunterObj = null;
                    _JC.selectedObject=null;
                    canvas.renderAll();
                    copyPreKeyCode = [0, 0, 0];
                    return;
                }
            }
            copyPreKeyCode = [0, 0, 0];
            return;
        }
        //图层排序调整
        if ((((copyPreKeyCode[0] == 17 || copyPreKeyCode[0] == 91) && copyPreKeyCode[1] == 221) || ((copyPreKeyCode[1] == 17 || copyPreKeyCode[1] == 91) && copyPreKeyCode[2] == 221)) && _JC.cunterObj != null) {
            event.returnValue=false;
            //向上移一层
            copyPreKeyCode[1] = -1;
            $("#layerToForward").click();
            return;
        } else if ((((copyPreKeyCode[0] == 17 || copyPreKeyCode[0] == 91) && copyPreKeyCode[1] == 219) || ((copyPreKeyCode[1] == 17 || copyPreKeyCode[1] == 91) && copyPreKeyCode[2] == 219)) && _JC.cunterObj != null) {
            event.returnValue=false;
            //向下移一层
            copyPreKeyCode[1] = -1;
            $("#layerToBackward").click();
            return;
        } else if ((copyPreKeyCode[0] == 17 || copyPreKeyCode[0] == 91) && copyPreKeyCode[1] == 16 && copyPreKeyCode[2] == 221 && _JC.cunterObj != null) {
            event.returnValue=false;
            //移到顶层
            copyPreKeyCode[2] = -1;
            $("#layerToTop").click();
            return;
        } else if ((copyPreKeyCode[0] == 17 || copyPreKeyCode[0] == 91) && copyPreKeyCode[1] == 16 && copyPreKeyCode[2] == 219 && _JC.cunterObj != null) {
            event.returnValue=false;
            //移到底层
            copyPreKeyCode[2] = -1;
            $("#layerToBottom").click();
            return;
        }
        //快捷键调启 鼠标移动画布/缩放画布 Template MM
        if (_JC.designModule != "") {

            if (_JC.isEditText == false) {
                if (e.keyCode == 72) {
                    copyPreKeyCode = [0, 0, 0];
                    $("#handCanvas").click();
                    return;
                } else if (e.keyCode == 86) {
                    copyPreKeyCode = [0, 0, 0];
                    $("#selectComponent").click();
                    return;
                } else if (e.keyCode==65 && _JC.undoGroupSource==null){
                    copyPreKeyCode = [0, 0, 0];
                    $("#mouseGroupBtnTool").click();
                }
            }
        }

    

        if (_JC.isEditText == false){

            if (copyPreKeyCode[0] == 82 || (copyPreKeyCode[0] != 16 && copyPreKeyCode[0] != 91 && copyPreKeyCode[0] != 17 && copyPreKeyCode[1] == 82 )) { 
                copyPreKeyCode = [0, 0, 0];
                $("#drawRect").click();
                return;
            }

            if (copyPreKeyCode[0] == 76 || (copyPreKeyCode[0] != 16 && copyPreKeyCode[0] != 91 && copyPreKeyCode[0] != 17 && copyPreKeyCode[1] == 76 )) { 
                copyPreKeyCode = [0, 0, 0];
                $("#drawLine").click();
                return;
            }

            if (copyPreKeyCode[0] == 79 || (copyPreKeyCode[0] != 16 && copyPreKeyCode[0] != 91 && copyPreKeyCode[0] != 17 && copyPreKeyCode[1] == 79)) { 
                copyPreKeyCode = [0, 0, 0];
                $("#drawCircle").click();
                return;
            }

            if ( (copyPreKeyCode[0] == 16 && copyPreKeyCode[1] == 76 ) || (copyPreKeyCode[1] == 16 && copyPreKeyCode[2] == 76)) { 
                copyPreKeyCode = [0, 0, 0];
                $("#drawArrow").click();
                return;
            }

            if (copyPreKeyCode[0] == 84 || (copyPreKeyCode[0] != 16 && copyPreKeyCode[0] != 91 && copyPreKeyCode[0] != 17 && copyPreKeyCode[1] == 84 )) {
                copyPreKeyCode = [0, 0, 0]; 
                $("#drawText").click();
                return;
            }

            if (copyPreKeyCode[0] == 80 || (copyPreKeyCode[0] != 16 && copyPreKeyCode[0] != 91 && copyPreKeyCode[0] != 17 && copyPreKeyCode[1] == 80 )) { 
                copyPreKeyCode = [0, 0, 0];
                $("#uploadImage-btn").click();
                $("#selectComponent").click();
                return;
            }

            if (copyPreKeyCode[0] == 68 || (copyPreKeyCode[0] != 16 && copyPreKeyCode[0] != 91 && copyPreKeyCode[0] != 17 && copyPreKeyCode[1] == 68 )) {
                copyPreKeyCode = [0, 0, 0]; 
                $("#drawPageNo").click();
                return;
            }

        }



        //画布放大187、缩小快捷键189
        if (event.returnValue && e.keyCode == 187) {
            event.returnValue = false;
            $("#zoomMenu").find(".menuOption").eq(0).click();
            $("#zoomMenu").hide();
            copyPreKeyCode = [0, 0, 0];
            return;

        }
        if (event.returnValue && e.keyCode  == 189) {
            event.returnValue = false;
            $("#zoomMenu").find(".menuOption").eq(1).click();
            $("#zoomMenu").hide();
            copyPreKeyCode = [0, 0, 0];
            return;
        }

        //选中对象左37 上38 右39 下40 移动对象
        if (copyPreKeyCode[0] == 16 && copyPreKeyCode[1] == 37 && cunterObj != null) {

            event.returnValue = false;
            if (cunterObj.hasOwnProperty("left")){
                cunterObj.set({
                    left: cunterObj.left - 100
                });
                $("input[name=objLeft]").val(parseInt(cunterObj.left));
                canvas.renderAll();
            }else{
              
                for (var i=0;i<cunterObj.length;i++){
                    cunterObj[i].left=cunterObj[i].left - 100;
                    if (cunterObj[i].hasOwnProperty("group")){
                        cunterObj[i].group.setCoords();
                    }
                }
                canvas.renderAll();
            }

            return;
        } else if (copyPreKeyCode[0] ==37 && cunterObj != null && e.target.nodeName == "BODY") {

            copyPreKeyCode = [0, 0, 0];
            if (cunterObj.hasOwnProperty("left")){
                cunterObj.set({
                    left: cunterObj.left - 1
                });
                $("input[name=objLeft]").val(parseInt(cunterObj.left));
                canvas.renderAll();
            }else{
              
                for (var i=0;i<cunterObj.length;i++){
                    cunterObj[i].left=cunterObj[i].left - 1;
                    if (cunterObj[i].hasOwnProperty("group")){
                        cunterObj[i].group.setCoords();
                    }
                }
                canvas.renderAll();
            }
            event.returnValue = false;
            return;
        }
        if (copyPreKeyCode[0] == 16 && copyPreKeyCode[1] == 38 && cunterObj != null) {
 
            event.returnValue = false;
            if (cunterObj.hasOwnProperty("top")){
                cunterObj.set({
                    top: cunterObj.top - 100
                });
                $("input[name=objLeft]").val(parseInt(cunterObj.top));
                canvas.renderAll();
            }else{
              
                for (var i=0;i<cunterObj.length;i++){
                    cunterObj[i].top=cunterObj[i].top - 100;
                    if (cunterObj[i].hasOwnProperty("group")){
                        cunterObj[i].group.setCoords();
                    }
                }
                canvas.renderAll();
            }

            return;
        } else if (copyPreKeyCode[0] == 38 && cunterObj != null && e.target.nodeName == "BODY") {
         
            copyPreKeyCode = [0, 0, 0];
            if (cunterObj.hasOwnProperty("top")){
                cunterObj.set({
                    top: cunterObj.top - 1
                });
                $("input[name=objTop]").val(parseInt(cunterObj.top));
                canvas.renderAll();
            }else{
              
                for (var i=0;i<cunterObj.length;i++){
                    cunterObj[i].top=cunterObj[i].top - 1;
                    if (cunterObj[i].hasOwnProperty("group")){
                        cunterObj[i].group.setCoords();
                    }
                }
                canvas.renderAll();
            }
            event.returnValue = false;

            return;
        }
        if (copyPreKeyCode[0] == 16 && copyPreKeyCode[1] == 39 && cunterObj != null) {

            if (cunterObj.hasOwnProperty("left")){
                cunterObj.set({
                    left: cunterObj.left + 100
                });
                $("input[name=objLeft]").val(parseInt(cunterObj.left));
                canvas.renderAll();
            }else{
              
                for (var i=0;i<cunterObj.length;i++){
                    cunterObj[i].left=cunterObj[i].left + 100;
                    if (cunterObj[i].hasOwnProperty("group")){
                        cunterObj[i].group.setCoords();
                    }
                }
                canvas.renderAll();
            }
            event.returnValue = false;
           
            return;
        } else if (copyPreKeyCode[0] == 39 && cunterObj != null && e.target.nodeName == "BODY") {
         
            copyPreKeyCode = [0, 0, 0];
            if (cunterObj.hasOwnProperty("left")){
                cunterObj.set({
                    left: cunterObj.left + 1
                });
                $("input[name=objLeft]").val(parseInt(cunterObj.left));
                canvas.renderAll();
            }else{
              
                for (var i=0;i<cunterObj.length;i++){
                    cunterObj[i].left=cunterObj[i].left + 1;
                    if (cunterObj[i].hasOwnProperty("group")){
                        cunterObj[i].group.setCoords();
                    }
                }
                canvas.renderAll();
            }
            event.returnValue = false;
         
            return;
        }
        if (copyPreKeyCode[0] == 16 && copyPreKeyCode[1] == 40 && cunterObj != null) {

            if (cunterObj.hasOwnProperty("top")){
                cunterObj.set({
                    top: cunterObj.top + 100
                });
                $("input[name=objTop]").val(parseInt(cunterObj.top));
                canvas.renderAll();
            }else{
              
                for (var i=0;i<cunterObj.length;i++){
                    cunterObj[i].top=cunterObj[i].top + 100;
                    if (cunterObj[i].hasOwnProperty("group")){
                        cunterObj[i].group.setCoords();
                    }
                }
                canvas.renderAll();
            }
            event.returnValue = false;            
            return;
        } else if (copyPreKeyCode[0] == 40 && cunterObj != null && e.target.nodeName == "BODY") {

            copyPreKeyCode = [0, 0, 0];
            if (cunterObj.hasOwnProperty("top")){
                cunterObj.set({
                    top: cunterObj.top + 1
                });
                $("input[name=objTop]").val(parseInt(cunterObj.top));
                canvas.renderAll();
            }else{
              
                for (var i=0;i<cunterObj.length;i++){
                    cunterObj[i].top=cunterObj[i].top + 1;
                    if (cunterObj[i].hasOwnProperty("group")){
                        cunterObj[i].group.setCoords();
                    }
                }
                canvas.renderAll();
            }
            event.returnValue = false;

            return;
        }

        //CTRL + Z 撤消
        if ((copyPreKeyCode[0] == 91 && copyPreKeyCode[1] == 90) || (copyPreKeyCode[0] == 17 && copyPreKeyCode[1] == 90)) {
            _JC.canvasDraw().canvasUndo();
            return;
        }
        //SHIFT + Z 重做
        if (copyPreKeyCode[0] == 16 && copyPreKeyCode[1] == 90) {
            _JC.canvasDraw().canvasTodo();
            return;
        }
        //支持跨页复制组件
        if ((copyPreKeyCode[0] == 17 || copyPreKeyCode[0] == 91) && copyPreKeyCode[1] == 219 && _JC.selectedObject != null && canvasFouseStatus == true) {
            _JC.componentDraw().copyPageObj();
            return;
        }
        //支持跨页粘贴组件
        if ((copyPreKeyCode[0] == 17 || copyPreKeyCode[0] == 91) && copyPreKeyCode[1] == 221 && canvasFouseStatus == true) {
            _JC.componentDraw().pastePageObj();
            return;
        }

    }
}
/** 保存模板事件 **/
$("#saveComponent").click(function() {
    if ($(this).hasClass("noneClick")) {} else {
        if (_JC.saveStatus == false) {
            switch (_JC.designModule) {
                case "component":

                    var zoom = getThumbnailZoom(_JC.paperSize.bleedWidth, _JC.paperSize.bleedHeight, minThumbnail, maxThumbnail);
                    //接口入参
                    var parm = {
                        url: getApiUrl('marketing.component.update', {
                            code: current_id
                        }),
                        type: getApiMethod('marketing.component.update'),
                        code: current_id,
                        access_token: storage.access_token,
                        component: {
                            type: 1,
                            code: current_id,
                            isDelete: 0,
                        },
                        zoom: zoom,
                    };
                    

                    _JC.saveStatus = false;
                    //获取保存组件设计及生成组件缩略图
                    _JC.canvasSave().componentSave(parm, 1, function(mydata, base64) {
                        _JC.saveStatus = false;
                        //上传缩略图
                        layui.uploadAPI.uploadImage({
                            type: 'base64',
                            file: base64,
                        }, function(result) {
                            //上传成功
                            if (result.code == "0000") {
                                var previewUrl = result.data.thumbnailPath;
                                mydata.previewUrl = previewUrl;
                                //保存组件
                                $.ajax({
                                    url: parm.url,
                                    type: parm.type,
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + parm.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                        } else {
                                            layre.msg(result.msg);
                                        }
                                    }
                                });
                            } else {
                                layer.msg(result.msg);
                            }
                        }, function(e) {
                            //上传失败
                            layer.msg(e.msg);
                        });
                    });
                    break;
                case "template_bak":
                    if (isEmpty(timerProcess)) {
                        var zoom = getThumbnailZoom(_JC.paperSize.bleedWidth, _JC.paperSize.bleedHeight, minThumbnail, maxThumbnail);
                        //接口入参
                        var parm = {
                            url: getApiUrl('marketing.template.update', {
                                code: current_id
                            }),
                            type: getApiMethod('marketing.template.update'),
                            code: current_id,
                            access_token: storage.access_token,
                            template: {
                                code: current_id,
                                isDelete: 0,
                            },
                            zoom: zoom,
                        };
                        var loadEvent = layer.load(2, {
                            time: 10 * 1000,
                            shade: [0.3, '#393D49']
                        });
                        //获取保存模板设计及生成缩略图
                        _JC.canvasSave().templateSave(parm, 1, function(mydata, base64) {
                            _JC.saveStatus = false;
                            //上传缩略图
                            layui.uploadAPI.uploadImage({
                                type: 'base64',
                                file: base64,
                                query: {
                                    limit: 1000
                                }
                            }, function(result) {
                                //上传成功
                                if (result.code == "0000") {
                                    var thumbUrl = result.data.thumbnailPath;
                                    var originUrl = result.data.originPath;
                                    var theDuplicate = _JC.pagesDuplicate[_JC.cunterPage];
                                    for (var i = 0; i < theDuplicate.length; i++) {
                                        if (theDuplicate[i].isValid * 1 == 0) {
                                            theDuplicate[i].previewUrl = originUrl + "_thumb";
                                            _JC.pagesDuplicate[_JC.cunterPage][i].previewUrl = originUrl + "_thumb";
                                            break;
                                        }
                                    }
                                    //MOREPAGES-CANVAS 生成previewMap
                                    var previewMap = {};
                                    previewMap.width = 0;
                                    previewMap.height = 0;
                                    previewMap.data = [];
                                    for (var i = 0; i < _JC.pagesDuplicate.length; i++) {
                                        var theDuplicate = _JC.pagesDuplicate[i];
                                        for (var j = 0; j < theDuplicate.length; j++) {
                                            if (theDuplicate[j].isValid * 1 == 0) {
                                                var tmp = {
                                                    "previewUrl": theDuplicate[j].previewUrl,
                                                    "sort": i
                                                };
                                                previewMap.data[i] = tmp;
                                                if (i == 0) {
                                                    //if (theDuplicate[j].previewUrl.indexOf("_thumb")==-1){
                                                    mydata.previewPath = theDuplicate[j].previewUrl;
                                                    //}
                                                }
                                            }
                                        }
                                    }
                                    mydata.previewMap = JSON.stringify(previewMap);
                                    //保存template
                                    $.ajax({
                                        url: parm.url,
                                        type: parm.type,
                                        data: JSON.stringify(mydata),
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": 'Bearer ' + parm.access_token
                                        },
                                        success: function(result) {
                                            layer.close(loadEvent);
                                            if (result.code === "0000") {
                                                layer.msg("Save success");
                                            } else {
                                                layer.msg("Save failed");
                                            }
                                        }
                                    });
                                } else {
                                    layer.msg(result.msg);
                                }
                            }, function(e) {
                                //上传失败
                                layer.msg("Save failed");
                            });
                        });
                    } else {
                        if (timerProcess[timerProcess.length - 1].type != "saveDesign") {
                            var loadEvent = layer.load(2, {
                                time: 10 * 1000,
                                shade: [0.3, '#393D49']
                            });
                            var _theProcess = {};
                            _theProcess.type = "saveDesign";
                            var theProcess = JSON.parse(JSON.stringify(_theProcess));
                            timerProcess.push(theProcess);
                            //后台执行-生成切换前页面的缩略图到对应副本
                            transactionProcess();
                        }
                    }
                    break;

                case "template":

                    if (!isEmpty(timerProcess) || timeTask.length>1) {

                        var loadEvent = layer.load(2, {
                            time: 10 * 1000,
                            shade: [0.3, '#393D49']
                        });


                        setTimeout(function() {
                            
                            var _theProcess = {};
                            _theProcess.type = "saveDesign";
                            var theProcess = JSON.parse(JSON.stringify(_theProcess));
                            timerProcess.push(theProcess);
                            //后台执行-生成切换前页面的缩略图到对应副本
                            transactionProcess();

                        },3000);


                    } else if (isEmpty(timerProcess) && timeTask.length==1) {
                        var zoom = getThumbnailZoom(_JC.paperSize.bleedWidth, _JC.paperSize.bleedHeight, minThumbnail, maxThumbnail);
                        //接口入参
                        var parm = {
                            url: getApiUrl('marketing.template.update', {
                                code: current_id
                            }),
                            type: getApiMethod('marketing.template.update'),
                            code: current_id,
                            access_token: storage.access_token,
                            template: {
                                code: current_id,
                                isDelete: 0,
                            },
                            zoom: zoom,
                        };
                        var loadEvent = layer.load(2, {
                            time: 10 * 1000,
                            shade: [0.3, '#393D49']
                        });
                        //获取保存模板设计及生成缩略图
                        _JC.canvasSave().templateSave(parm, 1,async function(mydata, base64) {
                            _JC.saveStatus = false;
                            //上传缩略图
                            layui.uploadAPI.uploadImage({
                                type: 'base64',
                                file: base64,
                                query: {
                                    limit: 1000
                                }
                            }, function(result) {
                                //上传成功
                                if (result.code == "0000") {
                                    var thumbUrl = result.data.thumbnailPath;
                                    var originUrl = result.data.originPath;
                                    var theDuplicate = _JC.pagesDuplicate[_JC.cunterPage];
                                    for (var i = 0; i < theDuplicate.length; i++) {
                                        if (theDuplicate[i].isValid * 1 == 0) {
                                            theDuplicate[i].previewUrl = originUrl + "_thumb";
                                            _JC.pagesDuplicate[_JC.cunterPage][i].previewUrl = originUrl + "_thumb";
                                            break;
                                        }
                                    }
                                    //MOREPAGES-CANVAS 生成previewMap
                                    var previewMap = {};
                                    previewMap.width = 0;
                                    previewMap.height = 0;
                                    previewMap.data = [];
                                    for (var i = 0; i < _JC.pagesDuplicate.length; i++) {
                                        var theDuplicate = _JC.pagesDuplicate[i];
                                        for (var j = 0; j < theDuplicate.length; j++) {
                                            if (theDuplicate[j].isValid * 1 == 0) {
                                                var tmp = {
                                                    "previewUrl": theDuplicate[j].previewUrl,
                                                    "sort": i
                                                };
                                                previewMap.data[i] = tmp;
                                                if (i == 0) {
                                                    //if (theDuplicate[j].previewUrl.indexOf("_thumb")==-1){
                                                    mydata.previewPath = theDuplicate[j].previewUrl;
                                                    //}
                                                }
                                            }

                                            if (theDuplicate[j].previewUrl.substr(0,4)=="data"){

                                                setTimeout(function() {
                                                    $("#saveComponent").click();
                                                },2000);

                                                return;
                                            }

                                        }
                                    }
                                    mydata.previewMap = JSON.stringify(previewMap);
                                    //保存template
                                    $.ajax({
                                        url: parm.url,
                                        type: parm.type,
                                        data: JSON.stringify(mydata),
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": 'Bearer ' + parm.access_token
                                        },
                                        success: function(result) {
                                            layer.close(loadEvent);
                                            if (result.code === "0000") {
                                                layer.msg("Save success");
                                            } else {
                                                layer.msg("Save failed");
                                            }
                                        }
                                    });
                                } else {
                                    layer.msg(result.msg);
                                }
                            }, function(e) {
                                //上传失败
                                layer.msg("Save failed");
                            });
                        });
                    }
                    break;

                case "mm":

                    if (!isEmpty(timerProcess) || timeTask.length>1) {

                        var loadEvent = layer.load(2, {
                            time: 10 * 1000,
                            shade: [0.3, '#393D49']
                        });


                        setTimeout(function() {
                            
                            var _theProcess = {};
                            _theProcess.type = "saveDesign";
                            var theProcess = JSON.parse(JSON.stringify(_theProcess));
                            timerProcess.push(theProcess);
                            //后台执行-生成切换前页面的缩略图到对应副本
                            transactionProcess();

                        },3000);


                    }else{

                        var zoom = getThumbnailZoom(_JC.paperSize.bleedWidth, _JC.paperSize.bleedHeight, minThumbnail, maxThumbnail);
                        //接口入参
                        var parm = {
                            url: getApiUrl('marketing.template.update', {
                                code: _JC.templateData.templateCode
                            }),
                            type: getApiMethod('marketing.template.update'),
                            code: _JC.templateData.templateCode,
                            access_token: storage.access_token,
                            template: {
                                code: _JC.templateData.templateCode,
                                isDelete: 0,
                            },
                            zoom: zoom,
                        };
                        var mmCode = _JC.templateData.mmCode;
                        var loadEvent = layer.load(2, {
                            time: 10 * 1000,
                            shade: [0.3, '#393D49']
                        });

                        //获取保存模板设计及生成缩略图
                        _JC.canvasSave().templateSave(parm, 1,async function(mydata, base64) {

                            // 获取MM信息，更新指定信息
                            $.ajax({
                                url: getApiUrl('marketing.activity.detailByCode', {
                                    mmCode: mmCode
                                }),
                                type: getApiMethod('marketing.activity.detailByCode'),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + parm.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                       
                                        // 待设计状态保存时，更改状态为2
                                        if (result.data.status == 1) {
                                            var mydata = {
                                                status: 2,
                                            };
                                            $.ajax({
                                                url: getApiUrl('marketing.activity.updateByCode', {
                                                    mmCode: mmCode
                                                }),
                                                type: getApiMethod('marketing.activity.updateByCode'),
                                                data: JSON.stringify(mydata),
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    "Authorization": 'Bearer ' + parm.access_token
                                                },
                                                success: function(result) {
                                                    if (result.code === "0000") {} else {
                                                        layer.msg(result.msg);
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                            _JC.saveStatus = false;
                            //上传缩略图
                            layui.uploadAPI.uploadImage({
                                type: 'base64',
                                file: base64,
                                query: {
                                    limit: 1000
                                }
                            }, function(result) {
                                //上传成功
                                if (result.code == "0000") {
                                    var mmData = {
                                        previewUrl: undefined,
                                    };
                                    var thumbUrl = result.data.thumbnailPath;
                                    var originUrl = result.data.originPath;


                                    //MOREPAGES-CANVAS 生成previewMap
                                    var previewMap = {};
                                    previewMap.width = 0;
                                    previewMap.height = 0;
                                    previewMap.data = [];
                                    for (var i = 0; i < _JC.pagesDuplicate.length; i++) {
                                        var theDuplicate = _JC.pagesDuplicate[i];
                                        for (var j = 0; j < theDuplicate.length; j++) {
                                            if (theDuplicate[j].isValid * 1 == 0) {

                                                if (theDuplicate[j].pageCode == _JC.canvasConfig.recordPointer.pointerPageCode) {
                                                     theDuplicate[j].previewUrl=originUrl;
                                                }


                                                var tmp = {
                                                    "previewUrl": theDuplicate[j].previewUrl,
                                                    "sort": i
                                                };
                                                previewMap.data[i] = tmp;
                                                if (i == 0) {
                                                    //if (theDuplicate[j].previewUrl.indexOf("_thumb")==-1){
                                                    mydata.previewPath = theDuplicate[j].previewUrl;
                                                    mmData.previewUrl = theDuplicate[j].previewUrl;
                                                    //}
                                                }
                                            }




                                        }
                                    }
                                    mydata.previewMap = JSON.stringify(previewMap);
                                    //保存template
                                    $.ajax({
                                        url: parm.url,
                                        type: parm.type,
                                        data: JSON.stringify(mydata),
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": 'Bearer ' + parm.access_token
                                        },
                                        success: function(result) {
                                            layer.close(loadEvent);
                                            if (result.code === "0000") {
                                                layer.msg("Save success");
                                            } else {
                                                layer.msg("Save failed");
                                            }
                                        }
                                    });
                                    // 更新MM的previewUrl等
                                    if (mmData.previewUrl) {
                                        $.ajax({
                                            url: getApiUrl('marketing.activity.updateByCode', {
                                                mmCode: mmCode
                                            }),
                                            type: getApiMethod('marketing.activity.updateByCode'),
                                            data: JSON.stringify(mmData),
                                            headers: {
                                                "Content-Type": "application/json",
                                                "Authorization": 'Bearer ' + parm.access_token
                                            },
                                            success: function(result) {
                                                if (result.code === "0000") {} else {
                                                    layer.msg(result.msg);
                                                }
                                            }
                                        });
                                    }
                                } else {
                                    layer.msg(result.msg);
                                }
                            }, function(e) {
                                //上传失败
                                layer.msg("Save failed");
                            });
                        });
                    }


                    break;
            }
        } else {
            layer.msg("saving");
        }
    }
});
/** 另存为新模板事件 **/
$("#saveAsTemplate").click(function() {
    if (_JC.saveStatus == false) {
        var defaultName = '';
        var index = layer.prompt({
            title: 'Please enter a template name',
            formType: 0,
            value: defaultName,
            area: ['500px', '350px'],
            btn: ['Save As', 'Cancel'],
        }, function(name, index) {
            if (name == '') {
                layer.msg('Please enter a template name');
                return;
            }
            var templateCode = '';
            switch (_JC.designModule) {
                case 'template':
                    templateCode = current_id;
                    break;
                case 'mm':
                    templateCode = _JC.templateData.templateCode;
                    break;
            }
            if (templateCode == '') {
                return;
            }
            var lock = AjaxRequest({
                url: getApiUrl('marketing.template.detail', {
                    code: templateCode
                }),
                method: getApiMethod('marketing.template.detail'),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + storage.access_token
                },
                loading: true,
                success: function(result) {
                    if (result.code === "0000") {
                        var data = result.data;
                        // 初始化模板记录
                        delete data.id;
                        delete data.code;
                        delete data.mmCode;
                        delete data.gmtCreate;
                        delete data.gmtModified;
                        delete data.creator;
                        delete data.lastUpdater;
                        delete data.isDelete;
                        delete data.status;
                        delete data.version;
                        delete data.release;
                        delete data.originCode;
                        delete data.originVersion;
                        data.name = name;
                        data.templatePageList = mmToTemplate(data.templatePageList);
                        AjaxRequest({
                            url: getApiUrl('marketing.template.add'),
                            method: getApiMethod('marketing.template.add'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            data: JSON.stringify(data),
                            lock: lock, // 从上级请求获取锁
                            loading: true,
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    layer.close(index);
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    } else {
                        layer.msg(result.msg);
                    }
                }
            }).lock();
        });
        var text = 'When saving new templates, please save the original first, otherwise data maybe lost.';
        $('#layui-layer' + index).find('.layui-layer-content').prepend('<div class="layui-card-body layui-bg-red" style="max-width: 302px;margin-bottom: 15px;">' + text + '</div>');
        $('#layui-layer' + index).find('.layui-layer-content input').width(320).attr('placeholder', 'Template Name').val('');
    }
});
// 点击更多按钮显示/隐藏操作选项
$(document).on('click', '.mmMore', function() {
    var mainBtn = $(this).prev();
    var more = $(this).next('.layui-nav-child');
    if (!mainBtn.hasClass('noneClick') && more.length > 0) {
        if (more.hasClass('layui-show')) {
            more.removeClass('layui-show');
        } else {
            more.addClass('layui-show');
        }
    }
});
/** 离开页面监控 **/
/*
window.onbeforeunload = function (e) {
    
    //触发离开页面时，请求保存
    // autoTimeSave();
    var e = e || window.event,
        dialogText = 'Are you sure you want to leave?';
    // 兼容IE8和Firefox 4之前的版本
    if (e) {
        e.returnValue = dialogText;
    };
    // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
    return dialogText;
    
};*/
/**  body click 监控  **/
$(document).click(function(e) {
    if ($(".textAlignMode").attr("show") == "1") {
        $(".sliderTextBox").hide();
        $(".textAlignMode").attr("show", "0");
    }
    $(".sliderProductBox").hide();
    // $("#zoomMenu").hide();
    $(".design-edit-content .pageList").removeClass("moveDown");
    // “更多”按钮控件 操作选项隐藏
    var _con = $('.mmBtn-group');
    if (!_con.is(e.target) && _con.has(e.target).length === 0) {
        $('.mmBtn-group .layui-nav-child').removeClass('layui-show');
    }

    if (e.target.id=="scaleNumber"){
        $(".zoomMenu").show();
    }else{

        var _con = $('.zoomMenu');
        if ($("#zoomMenu").is(':visible')){
            if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                $(".zoomMenu").hide();
            }else{
                $(".zoomMenu").show();
            }

        }

    }



});
$(".sliderTextBox,.textAlignMode,.disPage").click(function() {
    event.stopPropagation();
});
document.onkeyup = function(event) {
    e = event ? event : (window.event ? window.event : null);
    if (functionKey.indexOf(e.keyCode) > -1) {
        copyPreKeyCode[0] = 0;
        copyPreKeyCode[1] = 0;
        copyPreKeyCode[2] = 0;
    }else{
        copyPreKeyCode[1] = 0;
        copyPreKeyCode[2] = 0;
    }
    _JC.isShift = false;
    //释放按键快捷键
    if (e.keyCode == 17) {
        //释放滑轮快捷键
        _JC.isWheelStart = false;
    }

    console.log("_JC.isEditText",_JC.isEditText);
}
document.addEventListener('click', function(e) {

    if (e.target.localName == "canvas") {
        canvasFouseStatus = true;
    } else {
        canvasFouseStatus = false;
    }

    $(".menuWin").hide();


}, false);
document.addEventListener('mousewheel', function(e) {
    e = e || window.event;
    if ((e.wheelDelta && event.ctrlKey) || e.detail) {
        event.preventDefault();
    }
}, {
    passive: false
});