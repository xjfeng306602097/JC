function redefinePageLayer(_JC){

    //初始化
    _JC.layer.init=function(){

        jQuery.fn.extend({
            /**
             * 在同辈元素中向上或向下移动
             * @param direction 'up'或'down'
             */
            move: function(direction){
                var me = this;
                var another = null;
                if(direction == 'up'){
                    another = me.prev();
                    another.before(me);
                }else if(direction == 'down'){
                    another = me.next();
                    another.after(me);
                }
                return this;
            }
        });


        //分组伸缩事件
        $("#pageLayer").on("click",".groupType .optionIcon",function(event){
            _JC.layer.mouseOperation.menuAdjustable(this,_JC.canvasConfig.recordPointer.pointerPageCode,_JC.canvasConfig.recordPointer.pointerPageNo,event);
        });

        //选中对象事件
        $("#pageLayer").on("click",".optionObj",function(event){
            _JC.layer.mouseOperation.componentChoose($(this),event);
        });

        //选中分组事件
        $("#pageLayer").on("click",".groupType",function(event){
           _JC.layer.mouseOperation.groupChoose($(this),event);
        });

        $("#pageLayer").on("click",".visibleComponent",function(event){
           _JC.layer.mouseOperation.visibleComponent($(this),event);
        });

        $("#pageLayer").on("click",".lockComponent",function(event){
           _JC.layer.mouseOperation.lockComponent($(this),event);
        });

    }

    /** 数据渲染类 */
    _JC.layer.render.objectToLayer=function(canvasObjects,deep,config=null){
    
        var layerData=[];
        var idArr=[];
        //防止画布中因异步产生多个背景图
        var hasBackground=false;
        var disableComponent=_JC.disableComponent;
        var newzIndex=_JC.minLayer;
        var typeObj={image:0,shape:0,text:0,group:0};

        //20220815
        if (_JC.undoGroupSource!=null){
            var hideObjects=_JC.undoGroupSource.canvasOtherObjects;
        }else{
            var hideObjects=[];
        }


        for(key in canvasObjects){
            
            if (canvasObjects[key].hasOwnProperty("id")==false){
                canvasObjects[key].id=_JC.createID();
            }

            if (canvasObjects[key].dType && canvasObjects[key].id){
                if (disableComponent.indexOf(canvasObjects[key].dType)==-1 && canvasObjects[key].dType!="" && hideObjects.indexOf(canvasObjects[key].id)==-1 ){

                    if (canvasObjects[key].id=="BackgroundImage" && hasBackground==false){
                        hasBackground=true
                    }else if (canvasObjects[key].id=="BackgroundImage" && hasBackground==true){
                        canvas.remove(canvasObjects[key]);
                        canvas.renderAll();
                        continue;
                    }


                    if (canvasObjects[key].hasOwnProperty("group")){
                        var sortPath=canvasObjects[key].group.sortPath;
                            if (sortPath==undefined){
                                // console.log(canvasObjects[key].group);
                                sortPath=$("#"+canvasObjects[key].group.id).attr("data-sortpath");
                                canvasObjects[key].group.set({sortPath:sortPath});
                            }
                            sortPath=sortPath + "," + key;
                            canvasObjects[key].parentID=canvasObjects[key].group.id;
                    }else{
                        if (config!=null){
                            var sortPath=config.sortPath;
                        }else{
                            var sortPath=key;
                        }
                        
                        canvasObjects[key].sortPath=sortPath;
                    }
                    
                    var isGroup=false;
                    var layerIcon='';
                    switch (canvasObjects[key].type)
                    {
                        case "image":
                            if (canvasObjects[key].dType!="BackgroundImage"){
                                typeObj.image++;
                                canvasObjects[key].layerTitle="Picture " + typeObj.image;
                                layerIcon=svgElement.pictureIcon;
                            }else{
                                canvasObjects[key].layerTitle="BackgroundImage";
                                layerIcon=svgElement.pictureIcon;
                            }

                        break;
                        case "rect":
                        case "line":
                        case "circle":
                        case "triangle":
                        case "arrow":
                        case "ellipse":
                        case "path":
                        case "polygon":
                            typeObj.shape++;
                            canvasObjects[key].layerTitle="Shape " + typeObj.shape;
                            layerIcon=svgElement.shapeIcon;
                        break;
                        case "textbox":
                        case "i-text":
                            typeObj.text++;
                            canvasObjects[key].layerTitle="" + canvasObjects[key].text;
                            layerIcon=svgElement.textIcon;
                        break;
                        case "group":

                            
                            if (canvasObjects[key].hasOwnProperty("dType")){
                                if (canvasObjects[key].dType=="Product"){
                                    isGroup=true;
                                    if (!canvasObjects[key].hasOwnProperty("layerTitle")){
                                        var mmSort=canvasObjects[key].dSort;
                                        canvasObjects[key].layerTitle="Product " + mmSort;
                                    }
                                    layerIcon=svgElement.groupIcon;
                                }else if (canvasObjects[key].dType=="productPriceGroup"){
                                    canvasObjects[key].layerTitle="Normal Price";
                                    layerIcon=svgElement.textIcon;
                                }else if (canvasObjects[key].dType=="productPicture"){
                                    canvasObjects[key].layerTitle="Product Image";
                                    layerIcon=svgElement.pictureIcon;
                                }else{
                                    typeObj.group++;
                                    canvasObjects[key].layerTitle="Group " + typeObj.group;
                                    layerIcon=svgElement.groupIcon;
                                    isGroup=true;
                                }
                            }
                            
                        break;
                        case "group_bak":

                            layerIcon=svgElement.groupIcon;
                            if (canvasObjects[key].hasOwnProperty("dType")){
                                if (canvasObjects[key].dType=="Product"){
                                    if (!canvasObjects[key].hasOwnProperty("layerTitle")){
                                        var mmSort=canvasObjects[key].dSort;
                                        canvasObjects[key].layerTitle="Product " + mmSort;
                                    }

                                }else if (canvasObjects[key].dType=="productPriceGroup"){
                                    canvasObjects[key].layerTitle="Normal Price";
                                }else{
                                    typeObj.group++;
                                    canvasObjects[key].layerTitle="Group " + typeObj.group;
                                }
                            }
                            
                        break;

                        
                    }
                    
                    if (canvasObjects[key].hasOwnProperty("layerTitle")){
                        var layerTitle=canvasObjects[key].layerTitle;
                    }else{
                        var layerTitle="Other Type";
                    }
                    
                    if (idArr.indexOf(canvasObjects[key].id)>-1){
                        canvasObjects[key].id=_JC.createID();
                    }    
                        idArr.push(canvasObjects[key].id);
                        
                        layerData.unshift({
                            deep:deep,
                            sortPath:sortPath,
                            sort:(key *1),
                            layerTitle:layerTitle,
                            layerID:canvasObjects[key].id,
                            parentID:(canvasObjects[key].hasOwnProperty("group"))?canvasObjects[key].group.id:"",
                            spreadOut:false, //是否展开
                            visible: canvasObjects[key].visible, //是否显示
                            lock: canvasObjects[key].lockMovementX, //是否锁住
                            type:canvasObjects[key].type,
                            dType:canvasObjects[key].dType,
                            zIndex:canvasObjects[key].zIndex*1,
                            isGroup:isGroup,//(canvasObjects[key].type=="group")?true:false,// 是否分组
                            layerIcon:layerIcon, //显示ICON
                            group:(canvasObjects[key].type=="group")?canvasObjects[key].group:null,
                            lowerObject:(canvasObjects[key].type=="group")?canvasObjects[key]._objects:null, //子分组内容
                            lowerLayer:null, //下层图层内容
                        });
                    

                }

            }

        }

        return layerData;

    }

    //生成图层面板HTML
    _JC.layer.render.renderLayerHtml=function(ele,insertType,layerData){

        if (isEmpty(layerData)){return;}

        var _Html='';
        for (var i=0;i<layerData.length;i++){

            var groupType="optionObj";
            if (layerData[i].isGroup){
                groupType=" groupType";
            }

            var hideLayerCss="";
            if (layerData[i].visible!=true){
                hideLayerCss=" hideLayer";
            }
            

            _Html=_Html +'        <div class="listOption ' + groupType + hideLayerCss + '"  data-sortable-id="' + layerData[i].layerID + '" data-sortpath="' + layerData[i].sortPath + '"  id="' + layerData[i].layerID + '" data-deep="' + layerData[i].deep + '">';
            
            if (layerData[i].isGroup){
                _Html=_Html +'        <div class="' + groupType + '" data-sortable-id="' + layerData[i].layerID + '"  data-sortpath="' + layerData[i].sortPath + '" data-id="' + layerData[i].layerID + '" data-deep="' + layerData[i].deep + '">';
            }
            
            _Html=_Html +'            <div class="optionBox">';
            _Html=_Html +'                <div style="width: 0px; height: 100%; flex-shrink: 0;" class="optPre"></div>';
            _Html=_Html +'                <div data-drag="hide" data-id="' + layerData[i].layerID + '" class="optionIcon"></div>';
            _Html=_Html +'                <div class="layerTypeIcon">';
            _Html=_Html +'                    <div class="svgBox">';

            _Html=_Html + layerData[i].layerIcon;

            _Html=_Html +'                    </div>';
            _Html=_Html +'                </div>';
            _Html=_Html +'                <div class="layerTitle">';
            _Html=_Html +'                    <div class="titleContent">';
            _Html=_Html +'                        <div class="readonly-input"  >'+layerData[i].layerTitle+'</div>';
            _Html=_Html +'                        <pre>'+layerData[i].layerTitle+'</pre>';
            _Html=_Html +'                    </div>';
            _Html=_Html +'                </div>';
            _Html=_Html +'                <div data-drag="hide" class="layerTool">';

                                            /* layer tool icon start */

            _Html=_Html +'                    <div data-eventkey="" class="showLayer "   style="pointer-events: auto;">';
            
            var visibleLayerIcon=svgElement.showLayerIcon;
            if (layerData[i].visible!=true){
                visibleLayerIcon=svgElement.hideLayerIcon;
            }

            _Html=_Html +'                        <div class="svgBox visibleComponent"   data-id="' + layerData[i].layerID + '" style="pointer-events: auto;">';
            _Html=_Html + visibleLayerIcon
            _Html=_Html +'                        </div>';

            var lockLayerIcon=svgElement.unLockLayerIcon;
            if (layerData[i].lock==true){
                lockLayerIcon=svgElement.lockLayerIcon;
            }

            _Html=_Html +'                        <div class="svgBox lockComponent"  data-id="' + layerData[i].layerID + '"  style="pointer-events: auto;">';
            _Html=_Html + lockLayerIcon;
            _Html=_Html +'                        </div>';

            _Html=_Html +'                    </div>';

                                            /* layer tool icon end */


            _Html=_Html +'                </div>';
            _Html=_Html +'            </div>';
            
            if (layerData[i].isGroup){
                _Html=_Html +'        </div>';
            }
            
            _Html=_Html +'        </div>';

        }

        if (insertType===0){
            //替换ele对象内容
            $(ele).html(_Html);
        }else if (insertType==1){
            //在ele对象内部第一个子元素前插入子元素
            $(ele).prepend(_Html);
        }else if (insertType==2){
            //在ele对象外部后面追加同级元素
            $(ele).after(_Html);
        }else if (insertType==3){
            //在ele对象外部前面追加同级元素
            $(ele).before(_Html);
        }


    }

    //获取图层面板HTML
    _JC.layer.render.getLayerHtml=function(){
        var _Html=$("#pageLayer").html();
        return _Html;
    }

    //重设图层面板HTML
    _JC.layer.render.setLayerHtml=function(parm){

        if (parm!=null){
            $("#pageLayer").html(parm.htmlCode);
        }

    }

    //获取元素前一个同级元素
    _JC.layer.render.getLayerPreEle=function(layerID){
        var preLayer=$("#" + layerID).prev();
        if (preLayer.length<1){
            return "";
        }else{
            var preLayerID=$(preLayer).attr("id");
            return preLayerID;
        }
    }    

    //图层面板调整排序
    _JC.layer.render.layerMove=function(layerID,parm=null){

        if (parm==null){
            return;
        }else{

            switch (parm.type)
            {
                //向上移一层
                case "layerToForward":

                    //原先同级pre元素 prevAll是指当前元素所有前面同级元素
                    var preLayer=$("#" + layerID).prev();
                    var preLayerID=$(preLayer).attr("id");
                    var _oldPrePath=$("#" + preLayerID).attr("data-sortpath");
                    var _oldPrePathArr=_oldPrePath.split(",");
                    var _newPreSortPath="";
                    for (var i=0;i<_oldPrePathArr.length;i++){
                        if (i<_oldPrePathArr.length - 1){
                            _newPreSortPath=_newPreSortPath + _oldPrePathArr[i] + ",";
                        }else{
                            _newPreSortPath=_newPreSortPath + (_oldPrePathArr[i]*1 - 1);
                        }
                    }

                    $("#" + preLayerID).attr("data-sortpath",_newPreSortPath);
                    $("#" + preLayerID + " > .groupType").attr("data-sortpath",_newPreSortPath);
                    var _preLayers=$("#" + preLayerID + " > .sortItems ").find(".listOption");
                    for (var i=0;i<_preLayers.length;i++){

                        var _preSortPath=$(_preLayers[i]).attr("data-sortpath");
                        var _newPrePath=_preSortPath.replace(_oldPrePath+",",_newPreSortPath + ",");
          
                        $(_preLayers[i]).attr("data-sortpath",_newPrePath);
                    }



                    $("#" + layerID).move("up");
                    var _oldPath=$("#" + layerID).attr("data-sortpath");

                    $("#" + layerID).attr("data-sortpath",parm.sortPath);
                    $("#" + layerID + " > .groupType").attr("data-sortpath",parm.sortPath);
                    var _layers=$("#" + layerID + " > .sortItems ").find(".listOption");
                    for (var i=0;i<_layers.length;i++){
                        var _sortPath=$(_layers[i]).attr("data-sortpath");
              
                        var _newPath=_sortPath.replace(_oldPath+",",parm.sortPath + ",");
          
                        $(_layers[i]).attr("data-sortpath",_newPath);
                    }

                break;
                //向下移一层
                case "layerToBackward":

                    //原先同级next元素 nextAll是指当前元素所有后面同级元素
                    var nextLayer=$("#" + layerID).next();
                    var nextLayerID=$(nextLayer).attr("id");
                    var _oldNextPath=$("#" + nextLayerID).attr("data-sortpath");
                    var _oldNextPathArr=_oldNextPath.split(","); 
                    var _newNextSortPath="";
                    for (var i=0;i<_oldNextPathArr.length;i++){
                        if (i<_oldNextPathArr.length - 1){
                            _newNextSortPath=_newNextSortPath + _oldNextPathArr[i] + ",";
                        }else{
                            _newNextSortPath=_newNextSortPath + (_oldNextPathArr[i]*1 + 1);
                        }
                    }

                    $("#" + nextLayerID).attr("data-sortpath",_newNextSortPath);
                    $("#" + nextLayerID + " > .groupType").attr("data-sortpath",_newNextSortPath);
                    var _nextLayers=$("#" + nextLayerID + " > .sortItems ").find(".listOption");
                    for (var i=0;i<_nextLayers.length;i++){

                        var _nextSortPath=$(_nextLayers[i]).attr("data-sortpath");
                        var _newNextPath=_nextSortPath.replace(_oldNextPath+",",_newNextSortPath + ",");
          
                        $(_nextLayers[i]).attr("data-sortpath",_newNextPath);
                    }

                    var _oldPath=$("#" + layerID).attr("data-sortpath");
                    $("#" + layerID).move("down");
                    $("#" + layerID).attr("data-sortpath",parm.sortPath);
                    $("#" + layerID + " > .groupType").attr("data-sortpath",parm.sortPath);
                    var _layers=$("#" + layerID + " > .sortItems ").find(".listOption");
                    for (var i=0;i<_layers.length;i++){
                        var _sortPath=$(_layers[i]).attr("data-sortpath");
              
                        var _newPath=_sortPath.replace(_oldPath+",",parm.sortPath + ",");
          
                        $(_layers[i]).attr("data-sortpath",_newPath);
                    }
                break;
                //移到顶层
                case "layerToTop":

                    var parentEle=$("#" + layerID).parent();
                    var _Html=$("#" + layerID).prop("outerHTML");
                    $("#" + layerID).remove();
                    $(parentEle).prepend(_Html);

                break;
                //移到底层
                case "layerToBottom":
                    var parentEle=$("#" + layerID).parent();
                    var _Html=$("#" + layerID).prop("outerHTML");
                    $("#" + layerID).remove();
                    if (parm.hasOwnProperty("before")){
                        $("#" + parm.before).before(_Html);
                    }else{
                        $(parentEle).append(_Html);
                    }
                break;
                case "moveToLayerBackward":
              
                    var _Html=$("#" + layerID).prop("outerHTML");
                    $("#"+layerID).remove();
                    $("#" + parm.preObjectID).after(_Html);
                    //before

                break;
            }



        }

    }


    /** 面板鼠标操作类 */
    //编组伸缩事件
    _JC.layer.mouseOperation.menuAdjustable=function(ths,pageCode,pageNo,event){

        var ele=$("#pageLayer #" + $(ths).attr("data-id") + " > .sortItems");
        
        //检查该伸缩元素是否重新生成子菜单
        if (_JC.undoGroupSource!=null){
            
            //如果是当前编辑分组或当前编辑分组上层的ele，只需隐藏或显示sortItems，否则强制生成sortItems子菜单
            var isParent=false;
            var eleID=$(ths).attr("data-id");
            var searchLayerID=_JC.undoGroupSource.id;
            var theSortItems=$("#pageLayer #" + eleID + " >.sortItems");
            if (searchLayerID==eleID){
                isParent=true;
            }else{
                var topLayerID="pageLayer";
                var layerIdArr=[];
                var maxWhile=20;
                var w=1;
                while (searchLayerID!=topLayerID && w<maxWhile) {
                    
                    if ($("#pageLayer #" + searchLayerID).parent().hasClass("sortItems")){
                        var pID=$("#pageLayer #" + searchLayerID).parent().attr("data-id");
                        if (pID==eleID){
                            isParent=true;
                            break;
                        }else{
                            searchLayerID=pID;
                        }
                    }else{
                        var searchLayerID=$("#pageLayer #" + searchLayerID).parent().attr("id");
                    }
      
                    w++;
                }  
            }

            if (isParent==true){
                
                if ($(ths).attr("dis")=="Y"){
                    $(theSortItems).hide();
                    $(ths).attr("dis","N");
                    $(ths).removeClass("show").addClass("hide");
                }else{
                    $(theSortItems).show();
                    $(ths).attr("dis","Y");
                    $(ths).removeClass("hide").addClass("show");
                }
                return;
            }
            
        }
        
        var ele=$(ths).parent().parent().parent().find(".sortItems");
        //检查该分组是否存在已渲染过
        if (ele.length<1 || 1==1){
            //未渲染过
            var layerData=null;
            var layerID=$(ths).parent().parent().parent().attr("data-sortable-id");
            var layerID=$(ths).attr("data-id");
            var layerDeep=$(ths).parent().parent().parent().attr("data-deep");
            var sortPath=$(ths).parent().parent().parent().attr("data-sortpath");
            var groupEle=$("#" + layerID);
             
            if (_JC.undoGroupSource==null){

                var groupObject=_JC.layer.proto.find(sortPath,layerID);
                var lowerObject=groupObject._objects;    
                var layerData=_JC.layer.render.objectToLayer(lowerObject,layerDeep * 1 + 1 );

            }else{

                var lowerObject=[];
                var canvasObjects=canvas.getObjects();
                for (var i=0;i<canvasObjects.length;i++){

                    if (canvasObjects[i].hasOwnProperty("parentID")){
                        console.log("PPPPP222=>" + canvasObjects[i].parentID,layerID);
                        if (canvasObjects[i].parentID.toString()==layerID.toString()){
                            lowerObject.push(canvasObjects[i]);
                        }else{
                            lowerObject.push({});
                        }
                        
                    }else{
                        lowerObject.push({});
                    }
          
                    if (canvasObjects[i].hasOwnProperty("id")){
                        $("#" + canvasObjects[i].id).attr("data-sortpath",i);
                    }
                    
                }
                
                var config=null;
                //通过面板选取编组中子组件搜索
                if (lowerObject[0].hasOwnProperty("type")==false){
                    var groupObject=_JC.layer.proto.find(sortPath,layerID,{type:0});
                    var lowerObject=groupObject._objects; 
                    config={sortPath:sortPath};
                }
                var layerData=_JC.layer.render.objectToLayer(lowerObject,layerDeep * 1 + 1,config );

            }
            
            var _Html='';
                _Html=_Html + '<div class="sortItems lower" data-sortable-id="'+ layerID +'" data-id="'+ layerID +'" style="display:block;" >';
                _Html=_Html + '</div>';
            
            if ($(groupEle).find(".sortItems").length==0){
                $(groupEle).append(_Html);  
            }    
            var insertEle=$(groupEle).find(".sortItems")[0];
            _JC.layer.render.renderLayerHtml(insertEle,0,layerData);
        }


        if (event!="show"){        
            if ($(ths).attr("dis")=="Y"){
                $(ele).hide();
                $(ths).attr("dis","N");
                $(ths).removeClass("show").addClass("hide");
            }else{
                $(ele).show();
                $(ths).attr("dis","Y");
                $(ths).removeClass("hide").addClass("show");
            }
            event.stopPropagation();
        }else{
            $(ele).show();
            $(ths).attr("dis","Y");
            $(ths).removeClass("hide").addClass("show");
        }
    }

    //组件选择
    _JC.layer.mouseOperation.componentChoose=function(ths,event){
        event.stopPropagation();
        
        //清空画布鼠标滑出组件保存变量
        _JC.mouseoverObject=null;
        
        var sortPath=$(ths).attr("data-sortpath");
        var layerID=$(ths).attr("data-sortable-id");       

        var sortPathArr=sortPath.split(",");
        if (_JC.undoGroupSource!=null){
           
            var isEditCurrentGroup=false;
            $("#" + _JC.undoGroupSource.id + " > .sortItems > .listOption").each(function(index,domEle){

                if ($(domEle).attr("id")==layerID){
                    isEditCurrentGroup=true;
                    return false;
                }
            })

            if (isEditCurrentGroup==false){
                _JC.componentDraw().composeGroup();
            }

        }

        var theObject=_JC.layer.proto.find(sortPath,layerID,{type:0});
        if (isEmpty(theObject)){
            return;
        }

        if (_JC.undoGroupSource!=null){
            //处理编辑分组下，在图层面板选择子分组下的组件处理，zIndex > _JC.editGroupZindex才可以选中
            if (theObject.zIndex<_JC.editGroupZindex){
                theObject.zIndex=theObject.zIndex * 1 + _JC.editGroupZindex * 1;
            }
        }

        if (_JC.selectedObject==null){
            _JC.selectedObject=[];
        }

        if (copyPreKeyCode[0]==16){
       
            _JC.selectedObject.push(theObject);
            canvas.discardActiveObject();
            _JC.canvasDraw().drawSelectedControls();
            
        }else{
       
            _JC.selectedObject.length=0;
            _JC.selectedObject=[];
            _JC.selectedObject.push(theObject);
            _JC.cunterObj=theObject;
            $("#pageLayer .listOption,#pageLayer .groupType").removeClass("active").removeClass("act");
            $("#pageLayer .sortItems").removeClass("lower");
        }

       $(ths).addClass("active");
       _JC.layer.canvasOperation.setActiveObject();
       

    }

    //分组选择
    _JC.layer.mouseOperation.groupChoose=function(ths,event){
        
        //清空画布鼠标滑出组件保存变量
        _JC.mouseoverObject=null;
        
        var sortPath=$(ths).attr("data-sortpath");
        var layerID=$(ths).attr("data-sortable-id");

        var isEditCurrentGroup=false;
        if (_JC.undoGroupSource!=null){

            if (_JC.undoGroupSource.id==layerID){
                //选中当前编辑分组图层标题项，进行合并分组，结束编辑状态
                _JC.componentDraw().composeGroup();
            }else{
                //识别是否选中当前编辑分组中的下层子组件，是：不进行合并分组，否则：进行合并分组，结束编辑状态
                
                $("#" + _JC.undoGroupSource.id + " > .sortItems > .listOption").each(function(index,domEle){
    
                    if ($(domEle).attr("id")==layerID){
                        isEditCurrentGroup=true;
                        return false;
                    }
    
                })
    
                if (isEditCurrentGroup==false){
                    _JC.componentDraw().composeGroup();
                }else{
                    isEditCurrentGroup=true;
                }
                
            }

        }else{
            isEditCurrentGroup=false;
        }

        if (isEditCurrentGroup==false){
            // console.log("OKI 003");
            var theObject=_JC.layer.proto.find(sortPath,layerID);
  
            if (_JC.selectedObject==null){
                _JC.selectedObject=[];
            }
            
            if (copyPreKeyCode[0]==16){
                _JC.selectedObject.push(theObject);
                _JC.canvasDraw().drawSelectedControls();
            }else{
                _JC.selectedObject.length=0;
                _JC.selectedObject=[];
                _JC.selectedObject.push(theObject);
                $("#pageLayer .listOption,#pageLayer .groupType").removeClass("active").removeClass("act");
            }    
            
            if (isEmpty(_JC.selectedObject)==false){
                if (_JC.selectedObject.length>=1){
                    _JC.layer.canvasOperation.setActiveObject();
                }  
            }
            
           $("#pageLayer .sortItems").removeClass("lower");
           $(ths).parent().find(".sortItems").eq(0).addClass("lower");
           $(ths).addClass("active");
           $(ths).parent().addClass("act");
       }else{
           //选中编辑分组下层子分组

            var theObject=_JC.layer.proto.find(sortPath,layerID);
            
            /*分组图标改成画布中该分组的缩略图
            var svgImage=_JC.componentDraw().objectToBase64(theObject);
            var imgHtml='<img src="' + svgImage + '" width="16" height="16" >';
            $("#" + layerID + " >.groupType > .optionBox > .layerTypeIcon > .svgBox").html(imgHtml);*/

            if (_JC.selectedObject==null){
                _JC.selectedObject=[];
            }
            if (copyPreKeyCode[0]==16){
    
                _JC.selectedObject.push(theObject);
                _JC.canvasDraw().drawSelectedControls();
            }else{
                _JC.selectedObject.length=0;
                _JC.selectedObject=[];
                _JC.selectedObject.push(theObject);
                $("#pageLayer .listOption,#pageLayer .groupType").removeClass("active").removeClass("act");
            }    
            
           _JC.layer.canvasOperation.setActiveObject();    
            $("#pageLayer #" + layerID).addClass("act");
            $(ths).addClass("active");
            $(ths).parent().find(".sortItems").eq(0).addClass("lower");

       }

       event.stopPropagation();

    }


    //显示或隐藏对象/分组事件
    _JC.layer.mouseOperation.visibleComponent=function(ths,event){

       
        if (_JC.undoGroupSource!=null){
            
            //如果是当前编辑分组或当前编辑分组上层的ele，需要合并分组后再隐藏事件
            var isParent=false;
            var eleID=$(ths).attr("data-id");
            var searchLayerID=_JC.undoGroupSource.id;
            var theSortItems=$("#pageLayer #" + eleID + " >.sortItems");
            if (searchLayerID==eleID){
                isParent=true;
            }else{
                var topLayerID="pageLayer";
                var layerIdArr=[];
                var maxWhile=20;
                var w=1;
                while (searchLayerID!=topLayerID && w<maxWhile) {
                    
                    if ($("#pageLayer #" + searchLayerID).parent().hasClass("sortItems")){
                        var pID=$("#pageLayer #" + searchLayerID).parent().attr("data-id");
                        if (pID==eleID){
                            isParent=true;
                            break;
                        }else{
                            searchLayerID=pID;
                        }
                    }else{
                        var searchLayerID=$("#pageLayer #" + searchLayerID).parent().attr("id");
                    }
      
                    w++;
                }  
            }

            if (isParent==true){
                //如果是当前编辑分组或上层，就合并分组
                _JC.canvasDraw().composeGroup();
            }
            
        }



        var layerID=$(ths).attr("data-id");
        var sortPath=$("#" + layerID).attr("data-sortpath");
        var theObject=_JC.layer.proto.find(sortPath,layerID);

        if (theObject.visible==true){
            theObject.set({visible:false});
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            $(ths).html(svgElement.hideLayerIcon);
            $("#" + layerID).addClass("hideLayer");

        }else{
            theObject.set({visible:true});
            canvas.requestRenderAll();
            $(ths).html(svgElement.showLayerIcon);
            $("#" + layerID).removeClass("hideLayer");
        }

        event.stopPropagation();
    }

    //锁定/解锁对象/分组事件
    _JC.layer.mouseOperation.lockComponent=function(ths,event){

        if (_JC.undoGroupSource!=null){
            
            //如果是当前编辑分组或当前编辑分组上层的ele，需要合并分组后再隐藏事件
            var isParent=false;
            var eleID=$(ths).attr("data-id");
            var searchLayerID=_JC.undoGroupSource.id;
            var theSortItems=$("#pageLayer #" + eleID + " >.sortItems");
            if (searchLayerID==eleID){
                isParent=true;
            }else{
                var topLayerID="pageLayer";
                var layerIdArr=[];
                var maxWhile=20;
                var w=1;
                while (searchLayerID!=topLayerID && w<maxWhile) {
                    
                    if ($("#pageLayer #" + searchLayerID).parent().hasClass("sortItems")){
                        var pID=$("#pageLayer #" + searchLayerID).parent().attr("data-id");
                        if (pID==eleID){
                            isParent=true;
                            break;
                        }else{
                            searchLayerID=pID;
                        }
                    }else{
                        var searchLayerID=$("#pageLayer #" + searchLayerID).parent().attr("id");
                    }
      
                    w++;
                }  
            }

            if (isParent==true){
                //如果是当前编辑分组或上层，就合并分组
                _JC.canvasDraw().composeGroup();
            }
            
        }


        var layerID=$(ths).attr("data-id");
        var sortPath=$("#" + layerID).attr("data-sortpath");
        var theObject=_JC.layer.proto.find(sortPath,layerID);

        _JC.selectedObject=[];
        _JC.selectedObject[0]=theObject;
        if (theObject.lockMovementX==true){
            $(ths).html(svgElement.unLockLayerIcon);
        }else{
            $(ths).html(svgElement.lockLayerIcon);
        }
        _JC.componentDraw().lockBtnBtnObj();
        event.stopPropagation();
    }


    /** Canvas */
    //通过图层面板设置 画布组件为活动组件
    _JC.layer.canvasOperation.setActiveObject=function(){

        if (_JC.selectedObject!=null){
            
            if (_JC.selectedObject.length>1){
                
                _JC.cunterObj=self.selectedObject;
                _JC.attributesShow().selectedMultiple();
                _JC.canvasDraw().drawSelectedControls();
                canvas.discardActiveObject();
                
            }else if (_JC.selectedObject.length==1){
                
                var e={};
                    e.target=_JC.selectedObject[0];
                    e.selected=_JC.selectedObject;
                _JC.cunterObj=_JC.selectedObject[0];
                
                if (_JC.cunterObj.hasOwnProperty("group")){
                    
                    var parentGroup=_JC.cunterObj.group;
                    if (_JC.cunterObj.hasOwnProperty("sourceGroup")){
                        parentGroup=_JC.cunterObj.sourceGroup;
                        if (_JC.cunterObj.sourceGroup.id!=_JC.cunterObj.group.id){
                            parentGroup=_JC.cunterObj.group;
                        }
                    }
                    
                    canvas.discardActiveObject();
                    _JC.canvasDraw().editGroup(parentGroup);
                    canvas.setActiveObject(_JC.cunterObj);
                    canvas.requestRenderAll();
                    _JC.componentListener().selectedComponent(e);
                    
                }else{
                    
                    canvas.discardActiveObject();
                    canvas.setActiveObject(_JC.cunterObj);
                    canvas.requestRenderAll();
                    _JC.componentListener().selectedComponent(e);
                    
                }
                
            }

        }

    }
    
    
    //通过画布事件更改面板组件sortPath
    _JC.layer.canvasOperation.setLayerSortPath=function(layerID,sortPath){

        $("#" + layerID).attr("data-sortpath",sortPath);

    }


    //指定某图层/锁定/解锁/显示/隐藏
    _JC.layer.canvasOperation.setLayerStatus=function(layerID,parm=null){

        if (parm!=null){

            if (parm.displayStatus==1){
                //显示
                $("#pageLayer #" + layerID).removeClass("hideLayer");
                $("#pageLayer #" + layerID + " .optionBox").eq(0).find(".visibleComponent").html(svgElement.showLayerIcon);
            }else if (parm.displayStatus==0){
                //隐藏
                $("#pageLayer #" + layerID).addClass("hideLayer");
                $("#pageLayer #" + layerID + " .optionBox").eq(0).find(".visibleComponent").html(svgElement.hideLayerIcon);
            }

            if (parm.lockStatus==1){
                //锁定
                $("#pageLayer #" + layerID + " .optionBox").eq(0).find(".lockComponent").html(svgElement.lockLayerIcon);
            }else if (parm.lockStatus==0){
                //解锁
                $("#pageLayer #" + layerID + " .optionBox").eq(0).find(".lockComponent").html(svgElement.unLockLayerIcon);
            }

        }

    }

    _JC.layer.canvasOperation.cannelLayer=function(){
        
        $("#pageLayer .listOption,#pageLayer .groupType").removeClass("active").removeClass("act");
        $("#pageLayer .sortItems").removeClass("lower");
    }

    //通过画布选择组件 更新图层面板设置对应图层选中
    _JC.layer.canvasOperation.chooseLayer=function(parm=null){
     
        if (parm!=null){

            var layerID=parm.layerID;
            $("#pageLayer .listOption,#pageLayer .groupType").removeClass("active");
            $("#pageLayer .sortItems").removeClass("lower");
            
            $("#" + layerID).addClass("active");
            
            $("#pageLayer #" + layerID + " >.groupType").addClass("active");
            $("#pageLayer #" + layerID + " .sortItems").addClass("lower");
            
            if ($("#" + layerID).length<1){
               
               if (_JC.cunterObj!=null){
                   
                    if (_JC.cunterObj.type=="group"){
                        $("#pageLayer #" + layerID).addClass("act");
                        $("#pageLayer #" + layerID + " .sortItems").addClass("lower");
                    }
                   
                   if (_JC.cunterObj.hasOwnProperty("group")){
                       
                       var parentObj=_JC.cunterObj.group;
                       for (var i=0;i<10;i++){
                           
                           if ($("#" + parentObj.id).length>=1){
                                $("#fileMenuList").scrollTop($("#fileMenuList").scrollTop() + $("#" + parentObj.id).offset().top - $("#fileMenuList").offset().top + 20);
                               break;
                           }
                           
                       }
                       
                   }
               }
                
            }else{
                
                if (_JC.cunterObj.type=="group"){
                    $("#pageLayer #" + layerID).addClass("act");
                    $("#pageLayer #" + layerID + " .sortItems").addClass("lower");
                }
                
                $("#fileMenuList").scrollTop($("#fileMenuList").scrollTop() + $("#" + layerID).offset().top - $("#fileMenuList").offset().top);
                
            }
            

        }else{
          
            $("#pageLayer .listOption,#pageLayer .groupType").removeClass("active");
            $("#pageLayer .sortItems").removeClass("lower");
            $("#pageLayer .listOption").removeClass("act");
            if (_JC.selectedObject!=null){
                for (var i=0;i<_JC.selectedObject.length;i++){
                    var layerID=_JC.selectedObject[i].id;
                    if (_JC.selectedObject[i].type=="group"){
                        $("#" + layerID).addClass("act");
                        $("#" + layerID).find(".groupType").addClass("active");
                        $("#" + layerID).find(".sortItems").addClass("lower");
                    }else {
                        $("#" + layerID).addClass("active");
                    }
                    
                }
            }


        }

    }

    //通过画布框选组件 更新图层面板设置对应图层选中
    _JC.layer.canvasOperation.chooseMultipleLayer=function(){

        $("#pageLayer .listOption,#pageLayer .groupType").removeClass("active").removeClass("act");
        $("#pageLayer .sortItems").removeClass("lower");
        if (_JC.selectedObject!=null){
            for (var i=0;i<_JC.selectedObject.length;i++){
                
                var layerID=_JC.selectedObject[i].id;
                $("#pageLayer #" + layerID).addClass("active");
                if (_JC.selectedObject[i].type=="group"){
                    $("#pageLayer #" + layerID).addClass("act");
                    $("#pageLayer #" + layerID + " .sortItems").addClass("lower");
                }
                
            }
        }

    }

    //通过画布修改文本框或文本组件属性框修改内容时更新图层标题
    _JC.layer.canvasOperation.updateTextBoxLayerTitle=function(parm=null){
        if (parm!=null){
            $("#" + parm.layerID + " .readonly-input").html(parm.layerTitle.slice(0,20));
        }
    }

    //画布新增组件事务
    _JC.layer.canvasOperation.createComponent=function(parm){
     
        if (parm!=null){

            if (_JC.undoGroupSource!=null){
                
                //编辑分组中
                parm.parentID=_JC.undoGroupSource.id;
                var parentGroupSortPath=$("#" + parm.parentID).attr("data-sortpath");
                var parentGroupDeep=$("#" + parm.parentID).attr("data-deep");
                
                var isShow=false;
                if ($("#" + parm.parentID + " > .groupType > .optionBox .optionIcon").attr("dis")=="Y"){
                    isShow=true;
                }

                var canvasObjects,insertType;
                if (parm.type!="group"){
                    canvasObjects=[parm];
                    insertType=1;
                    var layerData=_JC.layer.render.objectToLayer(canvasObjects,parentGroupDeep*1,{sortPath:parm.sortPath});
                    parm.parentID=_JC.undoGroupSource.id;
                }else{
             
                    /*canvasObjects=parm._objects;
                    insertType=0;//20230424*/
                    canvasObjects=[parm];
                    insertType=1;
                    
                    var layerData=_JC.layer.render.objectToLayer(canvasObjects,parentGroupDeep*1);
                    parm.parentID=_JC.undoGroupSource.id;
                }
                
                var eleItem=$("#" + parm.parentID + " .sortItems");
                if (eleItem.length>=1){
                    _JC.layer.render.renderLayerHtml(eleItem.eq(0),insertType,layerData);
                }

            }else{

                var canvasObjects,insertType;
                if (parm.type!="group"){
                    canvasObjects=[parm];
                    insertType=1;
                    var layerData=_JC.layer.render.objectToLayer(canvasObjects,0,{sortPath:parm.sortPath});

                    var eleItem=$("#pageLayer");
                    if (eleItem.length>=1){
                        _JC.layer.render.renderLayerHtml(eleItem.eq(0),insertType,layerData);
                    }

                }else{
                    if (parm.type==="activeSelection"){
                        canvasObjects=parm._objects;
                        //删除原有面板图层DIV
                        for (var i=0;i<canvasObjects.length;i++){
                            if (canvasObjects[i].hasOwnProperty("id")){
                                $("#" + canvasObjects[i].id).remove();
                            }
                        }

                        console.log("createGroup 1");
                        insertType=1;
                        var eleItem=$("#pageLayer");
                    }else{
                        canvasObjects=[parm];
                        console.log("createGroup 2");
                        insertType=1;
                        var eleItem=$("#pageLayer");
                    }
                    
                    var layerData=_JC.layer.render.objectToLayer(canvasObjects,parentGroupDeep*1);
                    if (eleItem.length>=1){
                        _JC.layer.render.renderLayerHtml(eleItem.eq(0),insertType,layerData);
                    }

                }

            }


        }

    }
    
    //画布新增组件向在图层面板指定位置插入组件的图层项
    _JC.layer.canvasOperation.insertComponent=function(parm){

        if (parm!=null){
            var ele=$("#" + parm.afterID);
            var parentGroupDeep=1;
            var canvasObjects=parm.objects;
            var insertType=2;
            var layerData=_JC.layer.render.objectToLayer(canvasObjects,parentGroupDeep*1,{sortPath:parm.sortPath});
            _JC.layer.render.renderLayerHtml(ele,insertType,layerData);
        }

    }

    //画布解散分组更新图层面板
    _JC.layer.canvasOperation.ungroup=function(parm){

        if (parm!=null){
            $("#" + parm.layerID).remove();
        }
        
    }

    //画布删除组件更新图层面板
    _JC.layer.canvasOperation.deleteComponent=function(parm){
        if (parm!=null){
            $("#" + parm.layerID).remove();
        }

    }

    //强制展开指定编组子组件列表
    _JC.layer.canvasOperation.showGroupLayers=function(theGroup){
      
        if (theGroup.hasOwnProperty("_objects")==true){
            
            if (theGroup.type=="group"){
                
                var layerID=theGroup.id;
                var groupEle=$("#pageLayer #" + layerID);
                var layerDeep=$(groupEle).attr("data-deep");
                var sortPath=$(groupEle).attr("data-sortpath");
                var ths="#" + layerID + " >.groupType .optionBox .optionIcon";
                
                if ($("#pageLayer #" + layerID  + " > .sortItems").length==0){
                    
                    if (_JC.undoGroupSource==null){
                     
                        var groupObject=_JC.layer.proto.find(sortPath,layerID);
                        var lowerObject=groupObject._objects;    
                        var layerData=_JC.layer.render.objectToLayer(lowerObject,layerDeep * 1 + 1 );
        
                    }else{
                       
                        var lowerObject=theGroup._objects;
                        var layerData=_JC.layer.render.objectToLayer(lowerObject,layerDeep * 1 + 1 );
        
                    }
                    

                    if ($(groupEle).find(".sortItems").length==0){
                  
                        var _Html='';
                            _Html=_Html + '<div class="sortItems lower" data-sortable-id="'+ layerID +'" data-id="'+ layerID +'" style="display:block;" >';
                            _Html=_Html + '</div>';
                        $(groupEle).append(_Html);  
                    }    
                    
                    var insertEle=$(groupEle).find(".sortItems")[0];
                    _JC.layer.render.renderLayerHtml(insertEle,0,layerData);
                    $(ths).attr("dis","Y");
                    $(ths).removeClass("hide").addClass("show");
                    
                }else{
                 
                    $("#pageLayer #" + layerID + " > .sortItems").eq(0).addClass("lower").css("display","block");
                    $(ths).attr("dis","Y");
                    $(ths).removeClass("hide").addClass("show");
                }
                
                
            }
        }
            
        
    }

    /** other function */
    // config ={};
    // config.type=0 不刷新原面板内容
    _JC.layer.proto.find=function(pathStr,layerID,config=null){
        
        var topLayerID="pageLayer";
        var searchLayerID=layerID;
        var layerIdArr=[];
        var ths=$("#" + layerID);
        var maxWhile=20;
        var w=1;
        while (searchLayerID!=topLayerID && w<maxWhile) {
            
            layerIdArr.push(searchLayerID);
            
            if ($(ths).parent().hasClass("sortItems")){
                ths=$(ths).parent().parent();
            }else {
                ths=$(ths).parent();
            }
            searchLayerID=$(ths).attr("id");
            w++;
        }        

        if (_JC.undoGroupSource!=null){

            var checkSortIndex=layerIdArr.indexOf(_JC.undoGroupSource.id);
            if (checkSortIndex>-1){
                layerIdArr.splice(checkSortIndex,1);
            }

        }
        
        var groupObject=null;
        var canvasObjects=canvas.getObjects();
        var sortIndex=layerIdArr.length-1;
        for (var i=0;i<canvasObjects.length;i++){
            if (canvasObjects[i].hasOwnProperty("id")==false){
                canvasObjects[i].id=_JC.createID();
            }
            
            if (canvasObjects[i].id.toString()==layerIdArr[sortIndex]){
      
                if (sortIndex>0){
                    canvasObjects=canvasObjects[i]._objects;
                    sortIndex--;
                    i=-1;
                }else{
                    groupObject=canvasObjects[i];

                }
                
            }
            
        }
        

        if (isEmpty(groupObject)){

            canvasObjects=canvas.getObjects();
            for (var i=0;i<canvasObjects.length;i++){

                if (canvasObjects[i].hasOwnProperty("id")){
           
                    if (layerID.toString()==canvasObjects[i].id.toString()){
                        groupObject=canvasObjects[i];
                        $("#" + layerID).attr("data-sortpath",i);
                        break;
                    }
                }
            }
        }
        
        if (isEmpty(groupObject)){
            // layer.msg("groupObject is null");
            canvas.discardActiveObject();
            _JC.cunterObj=null;
            _JC.selectedObject=null;
            return;
        }
        
        if (groupObject.hasOwnProperty("group")){
            groupObject.sourceGroup=groupObject.group;
        }

        if (layerID.toString()!=groupObject.id.toString()){
            
            var canvasObjects=canvas.getObjects();
       
            for (var i=0;i<canvasObjects.length;i++){
                $("#" + canvasObjects[i].id).attr("data-sortpath",i+"");
                if (canvasObjects[i].hasOwnProperty("group")){
                    $("#" + canvasObjects[i].id).find(".groupType").eq(0).attr("data-sortable-id",canvasObjects[i].id);
                    $("#" + canvasObjects[i].id).find(".groupType").eq(0).attr("data-id",canvasObjects[i].id);
                    $("#" + canvasObjects[i].id).find(".groupType").eq(0).attr("data-sortpath",i);
                    $("#" + canvasObjects[i].id).find(".groupType").eq(0).find(".visibleComponent").attr("data-id",canvasObjects[i].id);
                    $("#" + canvasObjects[i].id).find(".groupType").eq(0).find(".lockComponent").attr("data-id",canvasObjects[i].id);
                }
                if (layerID==canvasObjects[i].id){
                    groupObject=canvasObjects[i];
                }
            }
           
            if (config==null){
                var isRender=true;
            }else if (config.type==1){
                var isRender=true;
            }else if (config.type==0){
                var isRender=false;
            }

            if (isRender){
                var layerData=_JC.layer.render.objectToLayer(canvasObjects,0);
                _JC.layer.render.renderLayerHtml($("#pageLayer"),0,layerData);
            }
            return groupObject;

        }else{

            for (var i=0;i<groupObject.length;i++){
                $("#" + groupObject[i].id).attr("data-sortpath",i+"");
                if (groupObject[i].hasOwnProperty("group")){
                    $("#" + groupObject[i].id).find(".groupType").eq(0).attr("data-sortable-id",groupObject[i].id);
                    $("#" + groupObject[i].id).find(".groupType").eq(0).attr("data-id",groupObject[i].id);
                    $("#" + groupObject[i].id).find(".groupType").eq(0).attr("data-sortpath",i);
                    $("#" + groupObject[i].id).find(".groupType").eq(0).find(".visibleComponent").attr("data-id",groupObject[i].id);
                    $("#" + groupObject[i].id).find(".groupType").eq(0).find(".lockComponent").attr("data-id",groupObject[i].id);
                }
            }

            return groupObject;
        }

        

    } 

}