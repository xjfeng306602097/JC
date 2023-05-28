

//页面初始化
function pageInit(){ 
    pageForbid();
}

//禁止页面浏览器事件
function pageForbid(){
   //禁止回退上一页    
   history.pushState(null, null, document.URL);
    window.addEventListener('popstate',function(){
        //console.log("禁止回退上一页");
        history.pushState(null, null, document.URL);
        return
    });
    
    //禁止刷新页面
    // window.onbeforeunload=function(e){
    //     console.log("禁止刷新页面"); 
    //  return 
    // }
}
  

//时间戳转换方法    date:时间戳数字
function timeToDate(timestamp) {
    let time = new Date(timestamp)
    let year = time.getFullYear()
    let month = time.getMonth() + 1
    let date = time.getDate()
    let hours = time.getHours()
    let minute = time.getMinutes()
    let second = time.getSeconds()
    if (month < 10) {
        month = '0' + month
    }
    if (date < 10) {
        date = '0' + date
    }
    if (hours < 10) {
        hours = '0' + hours
    }
    if (minute < 10) {
        minute = '0' + minute
    }
    if (second < 10) {
        second = '0' + second
    }
    return year + '-' + month + '-' + date + ' ' + hours + ':' + minute + ':' + second
}

function onInputInt(event) {
    var regular = /^[0-9]+$/ ; 
        // 正则 ，正整数校验
    var number = $("#number").val();
    if(!regular.test(number)){ 
        // 校验
        return;
    }
}

//删除回车/换行/空格符号
function deleteSpace(text){
    
    text = text.replace(/\r\n/g,"")
    text = text.replace(/\n/g,"");
    text = text.replace(/\s/g,"");
    return text;
}

function dragFileFormat(dragObj){

    var dragFiles = [];
    //拖拽导入word或excel文件功能-yan
    var lastenter = null;

    $(dragObj).bind('dragenter', function(e) {

        lastenter = e.target; 
        // 记录最后进入的元素
        e.preventDefault();
        //阻止浏览器默认打开文件的操作
        //拖入文件后加遮罩层
        if ($(dragObj).find('.mask-zone').length == 0) {
            $(dragObj).append('<div class="mask-zone"></div>');
        }
    })

    // 在ie下需要增加如下代码，否则不会触发drop事件
    $(dragObj).bind('dragover', function(ev) {
        ev.preventDefault();
    });
    $(dragObj).bind('dragleave', function(e) {
        // 如果此时退的元素是最后进入的元素，说明是真正退出了`drag-zone`元素
        if (lastenter === e.target) {
            $('.mask-zone').remove();
        }
    })
    $(dragObj).bind(
            'drop',
            function(e) {
                $('.mask-zone').remove();
                //阻止浏览器默认打开文件的操作
                e.preventDefault();
                //获取到的files即上传的文件对象
                var files = e.originalEvent.dataTransfer.files;
 
                if (files.length) {

                    var dragPos={x:_JC.insertX,y:_JC.insertY};

                    var upMsg=layer.msg("uploading");
          
                    for (var f=0;f<files.length;f++){

                        var fileName = files[f].name; 
                        var fileNameArr = fileName.split('.');
                        //限制文件类型
                        var extName=fileNameArr[fileNameArr.length - 1].toLowerCase();
                        if (extName != 'jpg'
                                && extName != 'pdf'
                                && extName != 'psd'
                                && extName != 'eps'
                                && extName != 'ai'
                                && extName != 'jpeg'
                                && extName != 'png'
                                && extName != 'svg') {
                            layer.msg('Please upload png/jpg/jpeg/svg/ai/psd/eps/pdf files');
                            return;
                        }
                       
                        //进行上传操作，例如拼接参数，ajax调用上传接口等
                        dragCreatElement(files[f],extName,dragPos);

                        if ($("#loadFontSchedule").length==0){
                            $("#drawPanel").append("<div id='loadFontSchedule' style='position:absolute;bottom:20px;left:80px;z-index:9999;color:#333;font-size:10px;'><span><img src='/img/loading.gif' style='height:14px;width:auto;'></span> uploading</div>");
                        }else{
                            $("#loadFontSchedule").html("<span><img src='/img/loading.gif' style='height:14px;width:auto;'></span> uploading");
                        }



                    }
                }
                
    })

}
dragFileFormat(".workArea");


function dragCreatElement(file,extName,dragPos) {


    if (extName=="psd" || extName=="ai" || extName=="eps" || extName=="pdf"){

        var fileContext = btoa(event.target.result);
        layui.uploadAPI.uploadImage({
            type: 'file',
            file: file,
            query: {
                limit: 1000,
            }
        }, function(result){
            
            if (result.code=="0000"){
            
                var parm={
                    filePath:result.data.thumbnailPath,
                    dType:"Picture",
                    cmykPic:result.data.thumbnailPath
                };

                parm.x=dragPos.x;
                parm.y=dragPos.y;

                _JC.componentDraw().insertPicture(parm,function(){
                    canvas.renderAll();
                    $("#loadFontSchedule").html("");
                });

            }else{
               $("#loadFontSchedule").html("");
               layer.msg("Upload File Error");
            }
            
        });

        return;

    }else{

        //创建FileReader对象
        var reader = new FileReader();
        //调用方法,将上面获取的文件信息传入，这个方法会生成base64的格式，其他方法自行查阅
        reader.readAsDataURL(file);
        //调用开始运行的方法
        //e.target.result就会获取到生成的base64的格式
        //传入img的src属性
        reader.onload = function (e) {

            if (extName=="svg"){

                var svgContext = atob(event.target.result.replace(/data:image\/svg\+xml;base64,/, ''));

                var parm={dType:"shape",file:svgContext};
                parm.x=dragPos.x;
                parm.y=dragPos.y;
            
                _JC.componentDraw().insertStringSvg(parm,function(){
                    $("#loadFontSchedule").html("");
                });
            
                return;
            }

            if (extName=="jpg" || extName=="jpeg" || extName=="png"){
                var base64=e.target.result;
                //ajax 上传图片 异步执行
                layui.uploadAPI.uploadImage({
                    type: 'base64',
                    file: base64,
                    query: {
                        limit: 1000,
                    }
                }, function(result){
                    
                    if (result.code=="0000"){
                        
                        var parm={
                            filePath:result.data.thumbnailPath,
                            dType:"Picture",
                            cmykPic:result.data.thumbnailPath
                        };


                        parm.x=dragPos.x;
                        parm.y=dragPos.y;

                        _JC.componentDraw().insertPicture(parm,function(){
                            canvas.renderAll();
                            $("#loadFontSchedule").html("");
                        });
               
                    }else{
                       $("#loadFontSchedule").html(""); 
                       layer.msg("Upload File Error");
                     
                    }
                    
                });

            }

        }
    }
}



//页面加载资源
function loadResource(pageModule){

    if (pageModule=="mm"){
        loadObject=[];
        loadObject[0]={name:"Load system files",status:0};
        loadObject[1]={name:"Load db files",status:0};
        loadObject[2]={name:"Load color files",status:0};

        loadObject[3]={name:"Load component files",status:0};
        loadObject[4]={name:"Load element",status:0};
        loadObject[5]={name:"Load label",status:0};

        loadObject[6]={name:"open activity",status:0};
        loadObject[7]={name:"Load product",status:0};

        loadObject[8]={name:"Load designer config",status:0};
        loadObject[9]={name:"Load fonts files",status:0};

        timer=setInterval(function(){

            if (loadObject[0].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[0].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[1].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[1].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[2].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[2].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[3].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[3].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[4].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[4].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[5].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[5].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[6].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[6].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[7].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[7].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[8].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[8].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[9].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[9].name;
                document.getElementById('pageLoading').style.display='block';        
            }else{
                clearInterval(timer);
            }

        }, 1000);
    }else if (pageModule=="template"){

            loadObject=[];
            loadObject[0]={name:"Load system files",status:0};
            loadObject[1]={name:"Load db files",status:0};
            loadObject[2]={name:"Load color files",status:0};
            loadObject[3]={name:"Load component files",status:0};
            loadObject[4]={name:"Load element",status:0};
            loadObject[5]={name:"Load label",status:0};
            loadObject[6]={name:"open template",status:0};
            loadObject[7]={name:"Load designer config",status:0};
            loadObject[8]={name:"Load fonts files",status:0};

            timer=setInterval(function(){

                if (loadObject[0].status==0){
                    document.getElementById('pageLoading').innerHTML =loadObject[0].name;
                    document.getElementById('pageLoading').style.display='block';
                }else if (loadObject[1].status==0){
                    document.getElementById('pageLoading').innerHTML =loadObject[1].name;
                    document.getElementById('pageLoading').style.display='block';
                }else if (loadObject[2].status==0){
                    document.getElementById('pageLoading').innerHTML =loadObject[2].name;
                    document.getElementById('pageLoading').style.display='block';
                }else if (loadObject[3].status==0){
                    document.getElementById('pageLoading').innerHTML =loadObject[3].name;
                    document.getElementById('pageLoading').style.display='block';
                }else if (loadObject[4].status==0){
                    document.getElementById('pageLoading').innerHTML =loadObject[4].name;
                    document.getElementById('pageLoading').style.display='block';
                }else if (loadObject[5].status==0){
                    document.getElementById('pageLoading').innerHTML =loadObject[5].name;
                    document.getElementById('pageLoading').style.display='block';
                }else if (loadObject[6].status==0){
                    document.getElementById('pageLoading').innerHTML =loadObject[6].name;
                    document.getElementById('pageLoading').style.display='block';
                }else if (loadObject[7].status==0){
                    document.getElementById('pageLoading').innerHTML =loadObject[7].name;
                    document.getElementById('pageLoading').style.display='block';
                }else if (loadObject[8].status==0){
                    document.getElementById('pageLoading').innerHTML =loadObject[8].name;
                    document.getElementById('pageLoading').style.display='block';      
                }else{
                    clearInterval(timer);
                }

        }, 1000);


    }else if (pageModule=="component"){
            loadObject=[];
            loadObject[0]={name:"Load system files",status:0};
            loadObject[1]={name:"Load db files",status:0};
            loadObject[2]={name:"Load color files",status:0};
            loadObject[3]={name:"Load element",status:0};
            loadObject[4]={name:"Load label",status:0};
            loadObject[5]={name:"open component",status:0};
            loadObject[6]={name:"Load designer config",status:0};
            loadObject[7]={name:"Load fonts files",status:0};

            timer=setInterval(function(){

            if (loadObject[0].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[0].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[1].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[1].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[2].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[2].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[3].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[3].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[4].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[4].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[5].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[5].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[6].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[6].name;
                document.getElementById('pageLoading').style.display='block';
            }else if (loadObject[7].status==0){
                document.getElementById('pageLoading').innerHTML =loadObject[7].name;
                document.getElementById('pageLoading').style.display='block';      
            }else{
                clearInterval(timer);
            }

        }, 1000);

    }
}

//取设计所有字体集
function getDesignPageFonts(pageObjects,callback){

    var _pageStr=JSON.stringify(pageObjects);
    var _fonts=getExecStrs(_pageStr);
    var fonts=[];
    for (var i=0;i<_fonts.length;i++){
        if (fonts.indexOf(_fonts[i])==-1){
            fonts.push((_fonts[i]).toLowerCase());
        }
    }
  
    (callback && typeof(callback) === "function") && callback(fonts);
}

function getExecStrs (str) {

    var reg = /\"fontFamily"\:"(.+?)\"/g;
    var list = [];
    var result = null;
    do {
        result = reg.exec(str);
        result && list.push(result[1]);
    } while (result)

    return list;
}


//接口请求MM商品信息
function getMMDetails(mmCode,callback){
    
    var urlParma='?page=1&limit=1000&isvalid=1&mmCode=' + mmCode+ '&mmpage=&itemcode=&nameeng=&namethai=';
    $.ajax({
        url: getApiUrl('marketing.product.page') + urlParma,
        type: getApiMethod('marketing.product.page'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code === "0000") {
                var tmpData = result.data.records;
                var pageData=[];
                for (var i=0;i<tmpData.length;i++){
                    
                    var page=tmpData[i].info.page * 1;
                    
                    if (isEmpty(pageData[page - 1])==true){
                        pageData[page - 1]=[];
                    }
                    
                    //info商品基本信息
                    var productInfo=tmpData[i].info;
                        if (productInfo.linkitemno!=null && productInfo.linkitemno!=""){
                            if ((productInfo.linkitemno).substring(0,1)!="/"){
                                productInfo.moreItemCode=productInfo.itemcode + "/" + productInfo.linkitemno;
                            }else{
                                productInfo.moreItemCode=productInfo.itemcode + productInfo.linkitemno;
                            }
                        }else{
                            productInfo.moreItemCode=productInfo.itemcode;
                        }
                        
                    //pic商品主图信息
                        productInfo.goodsImage={};
                        productInfo.goodsImage.picid=tmpData[i].info.picid;
                        productInfo.goodsImage.itemcode=tmpData[i].info.itemcode;
                        //productInfo.goodsImage.rgbOriginPath=tmpData[i].pic.originPath;
                        productInfo.goodsImage.rgbOriginPath=tmpData[i].pic.thumbnailPath;
                        productInfo.goodsImage.cmykOriginPath=tmpData[i].pic.transformPath;
                        productInfo.goodsImage.width=tmpData[i].pic.originWidth;
                        productInfo.goodsImage.height=tmpData[i].pic.originHeight;
                        
                    //brand商品品牌信息
                    if (tmpData[i].brand!=null){
                        productInfo.brand={};
                        productInfo.brand.picid=tmpData[i].brand.id;
                        productInfo.brand.rgbOriginPath=tmpData[i].brand.pic.originPath;
                        productInfo.brand.cmykOriginPath=tmpData[i].brand.pic.transformPath;
                        productInfo.brand.width=tmpData[i].brand.pic.originWidth;
                        productInfo.brand.height=tmpData[i].brand.pic.originHeight;
                    }else{
                        productInfo.brand=null;
                    }
                    
                    //icon商品图标信息
                    if (tmpData[i].icons!=null){
                        productInfo.icons=[];
                        productInfo.icons[0]=null;
                        productInfo.icons[1]=null;
                        productInfo.icons[2]=null;
                        for (var j=0;j<tmpData[i].icons.length;j++){   
                            
                            switch (tmpData[i].icons[j].iconIndex){
                                case "Icon1":
                                    if (tmpData[i].icons[j].pic!=null){
                                        productInfo.icons[0]={};
                                        productInfo.icons[0].name=tmpData[i].icons[j].name;
                                        productInfo.icons[0].picid=tmpData[i].icons[j].id;

                                        productInfo.icons[0].rgbOriginPath=tmpData[i].icons[j].pic.originPath;
                                        productInfo.icons[0].cmykOriginPath=tmpData[i].icons[j].pic.transformPath;
                                        productInfo.icons[0].width=tmpData[i].icons[j].pic.originWidth;
                                        productInfo.icons[0].height=tmpData[i].icons[j].pic.originHeight;  
                                    }
                                break;
                                case "Icon2":
                                    if (tmpData[i].icons[j].pic!=null){
                                        productInfo.icons[1]={};
                                        productInfo.icons[1].name=tmpData[i].icons[j].name;
                                        productInfo.icons[1].picid=tmpData[i].icons[j].id;

                                        productInfo.icons[1].rgbOriginPath=tmpData[i].icons[j].pic.originPath;
                                        productInfo.icons[1].cmykOriginPath=tmpData[i].icons[j].pic.transformPath;
                                        productInfo.icons[1].width=tmpData[i].icons[j].pic.originWidth;
                                        productInfo.icons[1].height=tmpData[i].icons[j].pic.originHeight;  
                                    }
                                break;
                                case "Icon3":
                                    if (tmpData[i].icons[j].pic!=null){
                                        productInfo.icons[2]={};
                                        productInfo.icons[2].name=tmpData[i].icons[j].name;
                                        productInfo.icons[2].picid=tmpData[i].icons[j].id;

                                        productInfo.icons[2].rgbOriginPath=tmpData[i].icons[j].pic.originPath;
                                        productInfo.icons[2].cmykOriginPath=tmpData[i].icons[j].pic.transformPath;
                                        productInfo.icons[2].width=tmpData[i].icons[j].pic.originWidth;
                                        productInfo.icons[2].height=tmpData[i].icons[j].pic.originHeight;  
                                    }
                                break;
                            }

                        }   
                            
                    }else{
                        productInfo.icons=null;
                    }
                    
                        //gift商品赠品信息
                    if (tmpData[i].gift!=null){
                        if (tmpData[i].gift.pic!=null){
                            productInfo.gift={};
                            // productInfo.gift.picid=tmpData[i].gift.picid;没有该picid字段
                            productInfo.gift.rgbOriginPath=tmpData[i].gift.pic.originPath;
                            productInfo.gift.itemcode=tmpData[i].gift.info.itemcode;
                            
                            productInfo.gift.nameeng=tmpData[i].gift.info.nameeng;
                            productInfo.gift.namethai=tmpData[i].gift.info.namethai;
                            
                            productInfo.gift.cmykOriginPath=tmpData[i].gift.pic.transformPath;
                            productInfo.gift.width=tmpData[i].gift.pic.originWidth;
                            productInfo.gift.height=tmpData[i].gift.pic.originHeight;
                        }else{
                            productInfo.gift=null;
                        } 
                    }else{
                        productInfo.gift=null;
                    }

                    //关联商品赠品信息
                    if (tmpData[i].linkItems!=null){
                        productInfo.linkItems=[];

                        for (var j=0;j<tmpData[i].linkItems.length;j++){

                            var tmp={};
                                tmp.lk_nameen="";
                                tmp.lk_namethai="";
                                tmp.lk_itemcode="";
                                tmp.lk_saleunit="";
                                tmp.lk_pack="";
                                tmp.lk_description="";
                                tmp.lk_model="";
                                tmp.lk_brand="";

                                tmp.rgbOriginPath="";
                                tmp.cmykOriginPath="";
                                tmp.thumbnailPath="";

                            if (tmpData[i].linkItems[j].pic!=null){
                                tmp.rgbOriginPath=tmpData[i].linkItems[j].pic.originPath;
                                tmp.cmykOriginPath=tmpData[i].linkItems[j].pic.transformPath;
                                tmp.thumbnailPath=tmpData[i].linkItems[j].pic.thumbnailPath;
                            }
                            if (tmpData[i].linkItems[j].info.namethai!=null){
                                tmp.lk_namethai=tmpData[i].linkItems[j].info.namethai;
                            }
                            if (tmpData[i].linkItems[j].info.nameen!=null){
                                tmp.lk_nameen=tmpData[i].linkItems[j].info.nameen;
                            }
                            if (tmpData[i].linkItems[j].info.itemcode!=null){
                                tmp.lk_itemcode=tmpData[i].linkItems[j].info.itemcode;
                            }
                                
                            if (tmpData[i].linkItems[j].info.qty1unit!=null){
                                tmp.lk_saleunit=tmpData[i].linkItems[j].info.qty1unit;
                            }
                            if (tmpData[i].linkItems[j].info.pack!=null){
                                tmp.lk_pack=tmpData[i].linkItems[j].info.pack;
                            }                            
                            if (tmpData[i].linkItems[j].info.model!=null){
                                tmp.lk_model=tmpData[i].linkItems[j].info.model;
                            }
                            if (tmpData[i].linkItems[j].info.description!=null){
                                tmp.lk_description=tmpData[i].linkItems[j].info.description;
                            }                              

                            productInfo.linkItems[tmpData[i].linkItems[j].sort*1-1]=tmp;
                           
                        }

                    }else{
                        productInfo.linkItems=null;
                    } 

                        
                    pageData[page - 1][productInfo.sort*1]=productInfo;
                   
                }
            
                (callback && typeof(callback) === "function") && callback(pageData);
                
            } else {
                (callback && typeof(callback) === "function") && callback(false);
            }
        }
    });
    
}


//接口返回的商品json转数组格式
function getPageDetails(mmDetailsData, pageNo, dataSort) {
    var result = null
    for (_d in mmDetailsData) {
        if (mmDetailsData[_d].sort * 1 == dataSort * 1 && mmDetailsData[_d].page * 1 == pageNo * 1) {
            result = mmDetailsData[_d];
            break;
        }
    }
    return result;
}

//根据itemCode搜索MM商品清单数据指定字段内容
function detailsDataSearchFiled(parm){

    if (isEmpty(parm)){
        return false;
    }else{

        for (var p=0;p<mmDetailsData.length;p++){

            if (!isEmpty(mmDetailsData[p])){

                var records=mmDetailsData[p];
                for (var d=1;d<records.length;d++){

                    if (parm.itemCode==records[d].itemcode){
            
                        return records[d][parm.filed];

                    }

                }

            }

        }
    }
}

//加载商品信息标签
function loadProductLabel(elem,callback=null) {
    
    layui.dict.request({
        dictCode: 'label_classify',
        success: function (res) {

            if (res.code === '0000') {
                
                // var classify=[];
                window.classify=[];
                for (var i=0;i<res.data.length;i++){
                    classify[res.data[i].sort*1 - 1]={};
                    classify[res.data[i].sort*1 - 1].name=res.data[i].name;
                    classify[res.data[i].sort*1 - 1].value=res.data[i].value;
                    classify[res.data[i].sort*1 - 1].label=[];
                }
        
                    var urlParma='?page=1&limit=1000&status=1';
                    $.ajax({
                        url: getApiUrl('marketing.label.page') + urlParma,
                        type: getApiMethod('marketing.label.page'),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                
                                //商品Label展示类型
                                var dType=[];
                                    dType[1]="productNormalText";
                                    dType[2]="productLineationText";
                                    dType[3]="productPicture";
                                    
                                var tmpData = result.data.records;
                                
                                //Label归类
                                for (var i = 0; i < tmpData.length; i++) {
                                    
                                    for (var j=0;j<classify.length;j++){
                                        if (tmpData[i].classify==classify[j].value){
                                            classify[j].label.push(tmpData[i]);
                                        }
                                    }
                                }
                                
                            
                                var _Html = '<div class="layui-collapse" lay-filter="productElement" lay-accordion>';
                                for (var i = 0; i < classify.length; i++) {
                                    _Html = _Html + '<div class="layui-colla-item">';
                                    _Html = _Html + '<h2 class="layui-colla-title">' + classify[i].name + '</h2>';
                                    _Html = _Html + '<div class="layui-colla-content">';
                                    
                                    // for (var j = 0; j < classify[i].label.length; j++) {
                                    for (var j = classify[i].label.length-1; j >= 0; j--) {
                                        var dataFiled=classify[i].label[j].value;
                                        var dataFiledArr=dataFiled.split("#");
                                        if (dataFiledArr.length!=2){
                                            dataFiledArr[1]="";
                                        }
                                        _Html = _Html + '<div class="layui-col-xs6">';
                                        _Html = _Html + '    <div class="grid-demo grid-demo-bg1">';
                                        _Html = _Html + '        <div class="elementOption insertElement" dName="' + classify[i].label[j].name + '" dFile="" insertText="'+dataFiledArr[1]+'" dataFiled="' + dataFiledArr[0] + '" dType="' + dType[classify[i].label[j].type] + '">';
                                        
                                        _Html = _Html + '            <div class="componetTitle" sort="'+ classify[i].label[j].sort+'" >' + classify[i].label[j].name + '</div>';
                                        
                                        _Html = _Html + '        </div>';
                                        _Html = _Html + '    </div>';
                                        _Html = _Html + '</div>';
                                    
                                    }
                                    
                                    _Html = _Html + '</div>';
                                    _Html = _Html + '</div>';
                                }
                                if (_Html != "") {
                                    _Html=_Html + '</div>';
                                    $(elem).html(_Html);
                                }
                                
                                layui.element.render();
                                (callback && typeof(callback) === "function") && callback(true);
                            }
                        }
                    });
        
        
            }
        }
    });
    
    
}


//加载SVG素材
function loadElementShape(elem,callback=null) {
    var mydata = {
        "page": 1,
        "limit": 100,
        "req": {
            "name": "",
            "status": "1"
        },
        "sortItems": [{
            "column": "name",
            "asc": true
        }]
    };
    $.ajax({
        url: getApiUrl('marketing.svg.page'),
        type: getApiMethod('marketing.svg.page'),
        data: JSON.stringify(mydata),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {

            if (result.code === "0000") {
                var data = result.data.records;
                var _Html = '';
                for (var i = 0; i < data.length; i++) {
                    _Html = _Html + '<div class="layui-col-xs6">';
                    _Html = _Html + '    <div class="grid-demo grid-demo-bg1">';
                    _Html = _Html + '        <div class="elementOption insertElement" dName="' + data[i].name + '" dFile="' + data[i].path + '" dType="shape">';
                    //_Html = _Html + '            <object  data="' + data[i].path + '" type="image/svg+xml"></object>';
                    //_Html = _Html + '            <embed src="' + data[i].path + '" type="image/svg+xml" />';
                    _Html = _Html + '            <img src="' + data[i].path + '" style="width:60px;height:60px;" type="image/svg+xml" />';
                    _Html = _Html + '            <div class="maskClick"></div>';
                    _Html = _Html + '        </div>';
                    _Html = _Html + '    </div>';
                    _Html = _Html + '</div>';
                }
                if (_Html != "") {
                    $(elem).html(_Html);
                }
                (callback && typeof(callback) === "function") && callback(true);
            } else {
                layer.msg(result.msg);
                (callback && typeof(callback) === "function") && callback(false);
            }
        },
        error: function(e) {
            layer.msg(e.responseJSON.code);
            (callback && typeof(callback) === "function") && callback(false);
        }
    });
}

//加载商品组件清单
function loadComponent(toolbarID,callback=null) {
    var componetCount = $(".componetList .componetPic").length;
    
    //加载请求
    var urlParma="?page=1&limit=100&status=1";
    $.ajax({
        url: getApiUrl('marketing.component.page') + urlParma,
        type: getApiMethod('marketing.component.page'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            // var result = JSON.parse(result);
            if (result.code === "0000") {
                var tmpData = result.data.content;
                if (tmpData.length > 0) {
                    var _Html = '';
                    for (var i = 0; i < tmpData.length; i++) {
                        if (isEmpty(tmpData[i].previewUrl)==false){
                            _Html = _Html + '<div class="layui-col-xs6">';
                            _Html = _Html + '    <div class="grid-demo grid-demo-bg1">';
                            _Html = _Html + '        <div class="elementOption insertComponent"  typeCode="Product" elementCode="' + tmpData[i].code + '">';
                            _Html = _Html + '            <div class="componetPic"><img src="' + tmpData[i].previewUrl + '"></div>';
                            _Html = _Html + '            <div class="componetTitle">' + tmpData[i].name + '</div>';
                            _Html = _Html + '        </div>';
                            _Html = _Html + '    </div>';
                            _Html = _Html + '</div>';
                        }
                    }
                    if (_Html != "") {
                        $(toolbarID).html(_Html);
                    }
                    (callback && typeof(callback) === "function") && callback(true);
                } else {
                    layer.msg('No product components');
                    (callback && typeof(callback) === "function") && callback(false);
                }
            } else {
                layer.msg(result.msg);
            }
        }
    });
}

//加载商品关联图片清单
function loadProductPictureList(dataFiled,parm){
    
    $(".listBox").html("");
    
    var mydata = {
        "page": 1,
        "limit": 100, 
    };
    
    if ((["icon1","icon2","icon3"]).indexOf(dataFiled)>-1){
        dataFiled="icon";
    }
    
    switch (dataFiled)
    {
        case "goodsImage":
            var getUrl=getApiUrl('product.picture.page');
            var getType=getApiMethod('product.picture.page');
            var picid=null,bindItemCode=parm.value,proID=parm.proID;
            mydata.req={itemCode:parm.value};
            mydata.sortItems=[
                {
                    column: "gmtCreate",
                    asc: false
                },
            ];
        break;
        case "gift":
            var getUrl=getApiUrl('product.picture.page');
            var getType=getApiMethod('product.picture.page');
            var picid=null,bindItemCode=parm.value,proID=parm.proID;
            mydata.req={itemCode:parm.value};
            mydata.sortItems=[
                {
                    column: "gmtCreate",
                    asc: false
                },
            ];
        break;
        case "brand":
            var getUrl=getApiUrl('product.brand.picture.page');
            var getType=getApiMethod('product.brand.picture.page');
            var picid=parm.value,bindItemCode=null,proID=null;
            mydata.req={brandid:parm.value};
            mydata.sortItems=[
                {
                    column: "gmtCreate",
                    asc: false
                },
            ];
        break;
        case "icon":
            var getUrl=getApiUrl('product.icon.picture.page');
            var getType=getApiMethod('product.icon.picture.page');
            // if (parm.hasOwnProperty("value")==false){return;}
            var picid=parm.value;
            var bindItemCode=null,proID=null;
            mydata.req={iconid:parm.value};
            mydata.sortItems=[
                {
                    column: "gmtCreate",
                    asc: false
                },
            ];
        break;
    }
    
    $.ajax({
        url: getUrl,
        type: getType,
        data: JSON.stringify(mydata),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            
            if (result.code === "0000") {
                
                var pictureData=result.data.records;
                if (pictureData.length>=1){
                    
                    var _Html='';
                    for (var i=0;i<pictureData.length;i++){

                        if (dataFiled=="goodsImage" || dataFiled=="gift"){
                            picid=pictureData[i].basicInfo.id;
                        }

                        _Html=_Html + '<div class="replacePicture" picid="'+picid+'" proID="'+proID+'" bindItemCode="'+bindItemCode+'" rgbPic="' + pictureData[i].originPath + '" cmykPic="' + pictureData[i].transformPath + '" >';
                        _Html=_Html + '<img src="' + pictureData[i].thumbnailPath + '">';
                        _Html=_Html + '</div>';
                    }
                    
                    $(".listBox").html(_Html);
                }
                
            } else {
                layer.msg(result.msg);
            }
        },
        error: function(e) {
            layer.msg(e);
        }
    });
    
}

//更改MM指定商品默认图片
function updateProductDefaultsImage(parm){


    var mydata = {
        "picid": parm.picID,
    };
    $.ajax({
        url: getApiUrl('marketing.product.update', {id: parm.proID}),
        type: getApiMethod('marketing.product.update'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        data: JSON.stringify(mydata),
        success: function(result) {
            if (result.code === "0000") {
                
            } else {
                // layer.msg(result.msg);
            }
        }
    });

}

//加载当前Template设计所用字体
function loadFont(fonts,callback=null) {
    var mydata = {
        "page": 1,
        "limit": 100,
        "req": {
            "name": "",
            "status":1
        },
        "sortItems": [{
            "column": "name",
            "asc": true
        }]
    };
    $.ajax({
        url: getApiUrl('marketing.font.page'),
        type: getApiMethod('marketing.font.page'),
        data: JSON.stringify(mydata),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            $(".pageLoading,.show-mask").hide();
            var _fontPreview = "";
            var loadFontsOption='';
            $("body").append("<div id='fontPreview'></div>");
            if (result.code === "0000") {
                var addFontCss = "";
                var fontData = result.data.records;
                var useFontArr = [];
                
                //默认字体
                if (isEmpty(fonts)){
                    fonts=[];
                }
          
                for (var i = 0; i < fontData.length; i++) {

                    //字体名称大写转小写
                    var lowerName=(fontData[i].name).toLowerCase();
                    var fontValue=lowerName.replace(/\s*/g,"");

                    loadFontsOption=loadFontsOption + "<option value='" + fontValue + "' disabled='' >Loading " + fontData[i].name + "</option>";

                    if (fonts.indexOf(lowerName)>-1 || (fonts.length<=3 && i<3) || fontValue=="freeserif" || fonts.length<1){
              
                        //字体及字体样式
                        designFont[fontValue]={
                            regular:false,
                            bold:false,
                            italics:false,
                            boldItalics:false
                        };
                        if (fontData[i].path!=null){
                            designFont[fontValue].regular=true;
                        }
                        if (fontData[i].boldPath!=null){
                            designFont[fontValue].bold=true;
                        }
                        if (fontData[i].italicsPath!=null){
                            designFont[fontValue].italics=true;
                        }                    
                        if (fontData[i].boldItalicsPath!=null){
                            designFont[fontValue].boldItalics=true;
                        }

                        useFontArr.push({name:fontData[i].name,path:fontData[i].path});
                        fontData[i]=null;

                    }else{

                        //字体及字体样式
                        designFont[fontValue]={
                            regular:false,
                            bold:false,
                            italics:false,
                            boldItalics:false
                        };
                        if (fontData[i].path!=null){
                            designFont[fontValue].regular=true;
                        }
                        if (fontData[i].boldPath!=null){
                            designFont[fontValue].bold=true;
                        }
                        if (fontData[i].italicsPath!=null){
                            designFont[fontValue].italics=true;
                        }                    
                        if (fontData[i].boldItalicsPath!=null){
                            designFont[fontValue].boldItalics=true;
                        }  

                    }
                    
                }
                $("select[name=textFont]").append(loadFontsOption);
                layui.form.render();
                allFonts=fontData;
        
                if (window.FontFace) {
                    //js 排队加载
                    jsLoadFonts(useFontArr,callback);

                }else{
                    //body css 全量加载
                    htmlLoadFonts();
                }

            } else {
                (callback && typeof(callback) === "function") && callback(false);
                layer.msg(result.msg);
            }
        },
        error: function(e) {
            layer.msg(e.responseJSON.code);
        }
    });
}

function htmlLoadFonts(){

    if (isEmpty(allFonts)){
        return;
    }else{

        var fontData=allFonts;
        var _fontPreview='';
        var addFontCss='';
        for (var i = 0; i < fontData.length; i++) {
            
            if (fontData[i]==null){continue;}

            //字体名称大写转小写
            var lowerName=(fontData[i].name).toLowerCase();
            var fontValue=lowerName.replace(/\s*/g,"");
            
            addFontCss = addFontCss + "@font-face { ";
            addFontCss = addFontCss + "    font-family: '" + fontValue + "'; ";
            addFontCss = addFontCss + "    src: url('" + fontData[i].path + "'); ";
            addFontCss = addFontCss + "}";
            
            if (fontValue=="freeserif"){
                fontData[i].name="Default font";
            }
            
            $("select[name=textFont] option[value='"+fontValue+"']").removeAttr("disabled").text(fontData[i].name);
            _fontPreview = _fontPreview + "<span style='font-family:\"" + fontValue + "\"'>" + fontData[i].name + "</span>";
            
            //字体及字体样式
            designFont[fontValue]={
                regular:false,
                bold:false,
                italics:false,
                boldItalics:false
            };
            if (fontData[i].path!=null){
                designFont[fontValue].regular=true;
            }
            if (fontData[i].boldPath!=null){
                designFont[fontValue].bold=true;
            }
            if (fontData[i].italicsPath!=null){
                designFont[fontValue].italics=true;
            }                    
            if (fontData[i].boldItalicsPath!=null){
                designFont[fontValue].boldItalics=true;
            }                      
            
        }

        addFontCss = "<style>" + addFontCss + "</style>";
        //添加字体引入css
        $("body").append(addFontCss);
        //预加载字体文件,防止canvas设置新字体不会变
        $("body").append("<div id='fontPreview2'  >" + _fontPreview + "</div>");
        layui.form.render();
    }

}

function jsLoadFonts(fonts,callback=null){

    // 兼容性判断，防止 IE 浏览器下报错
    if (!isEmpty(fonts)) {

        var fontData=fonts;
        if (fontData[0]!=null){
            var lowerName=(fontData[0].name).toLowerCase();
            var fontValue=lowerName.replace(/\s*/g,"");
            var addFontCss='';
            if (fontValue=="freeserif"){
                //fontData[0].name="Default font";
            }

            if ($("#loadFontSchedule").length==0){
                $("#drawPanel").append("<div id='loadFontSchedule' style='position:absolute;bottom:20px;left:80px;z-index:9999;color:#333;font-size:10px;'></div>");
            }
            $("#loadFontSchedule").html("Loading font: "+fontData[0].name);

            var fontFile = new FontFace(fontData[0].name, 'url('+fontData[0].path+')');
            fontFile.load().then(function (ft) {
                //console.log('成功');
                if (fonts.length>=1){
                    document.fonts.add(ft);
                    $("select[name=textFont] option[value='"+fontValue+"']").removeAttr("disabled").text(fontData[0].name);
                    

                    addFontCss = addFontCss + "@font-face { ";
                    addFontCss = addFontCss + "    font-family: '" + fontValue + "'; ";
                    addFontCss = addFontCss + "    src: url('" + fontData[0].path + "'); ";
                    addFontCss = addFontCss + "}";

                    addFontCss = "<style>" + addFontCss + "</style>";
                    //添加字体引入css
                    $("body").append(addFontCss);
                    layui.form.render();
                    $("#fontPreview").append("<span style='font-family:\"" + fontValue + "\"'>" + fontData[0].name + "</span>");
                    fonts.splice(0,1);
                    jsLoadFonts(fonts,callback);
                }else{
                    //allFonts=null;
                    console.log("Load fonts finash");
                    $("#loadFontSchedule").remove();
                    (callback && typeof(callback) === "function") && callback(true);
                }
                
            }, function (err) {
                $("#loadFontSchedule").remove();
            });
        }else{
            fonts.splice(0,1);
            jsLoadFonts(fonts,callback);
        }
    }else{
        console.log("Load fonts finash");
        $("#loadFontSchedule").remove();
        (callback && typeof(callback) === "function") && callback(true);
    }

}

//月位转两位数
function twoNumber(parm) {
    if (parm * 1 < 10) {
        return "0" + parm;
    } else {
        return parm;
    }
}

//请求模板页面JSON
function getTemplateCode(parm, callback = null) {
    $.ajax({
        type: parm.type,
        url: parm.url,
        // data:JSON.stringify(parm.data),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(data) {
            console.log(data);
            (callback && typeof(callback) === "function") && callback(data);
        },
        error: function(jqXHR) {
            return false;
        }
    });
}

//请求组件JSON
function getComponentDetails(parm,callback=null){
    $.ajax({
        type: parm.type,
        url: parm.url,
        // data:JSON.stringify(parm.data),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(data) {
            
            (callback && typeof(callback) === "function") && callback(data);
        },
        error: function(jqXHR) {
            return false;
        }
    }); 
}

//加载用户设计器配置
function loadMyDesignConfig(userID,callback=null){
    var parm = {
        url: getApiUrl('marketing.designCache.get', {
            id: userID
        }),
        type: getApiMethod('marketing.designCache.get'),
    };
    $.ajax({
        type: parm.type,
        url: parm.url,
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(data) {
            
            (callback && typeof(callback) === "function") && callback(data);
        },
        error: function(jqXHR) {
            return false;
        }
    })

}

//加载系统配置颜色 
function loadSystemColor(callback=null){
    var parm = {
        url: getApiUrl('marketing.color.page', {
            id: userID
        }),
        type: getApiMethod('marketing.color.page'),
    };

    var data={
                req: {
                    status: 1,
                    rgb: "",
                    cmyk: "",
                },
                sortItems: [
                    {
                        column: "sort",
                        asc: false
                    },
                    {
                        column: "gmtCreate",
                        asc: true
                    }
                ],
            };

    $.ajax({
        type: parm.type,
        url: parm.url,
        data:JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(data) {
            
            (callback && typeof(callback) === "function") && callback(data);
        },
        error: function(jqXHR) {
            return false;
        }
    })

}

//更新用户设计器配置
function updateMyDesignConfig(confingData,userID,callback=null){
    var parm = {
        url: getApiUrl('marketing.designCache.save'),
        type: getApiMethod('marketing.designCache.save'),
    };
    var myData={
        id:userID,
        jsonObject:confingData
    }
    $.ajax({
        type: parm.type,
        url: parm.url,
        data: JSON.stringify(myData),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(data) {
            
            (callback && typeof(callback) === "function") && callback(data);
        },
        error: function(jqXHR) {
            return false;
        }
    })
}


//上传图片点击监听
function uploadImageListenEvent(uploadResult, imageTitle, imageType){
    var mydata = {
        "nameEn": imageTitle,
        "filePath": JSON.stringify(uploadResult),
        "type": imageType
    };
    $.ajax({
        url: getApiUrl('marketing.element.add'),
        type: getApiMethod('marketing.element.add'),
        data: JSON.stringify(mydata),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code === "0000") {
                layer.msg(result.msg);
            } else {
                layer.msg(result.msg);
            }
        }
    });
}


//更新导航工具菜单页面数量
function updatePageNav(parm){
    
    //页面在模板排序数值
    var pageSort=0;
    var pageCount=_JC.templateData.templatePages.length;
    for (var p=0;p<_JC.templateData.templatePages.length;p++){
        if (_JC.canvasConfig.recordPointer.pointerPageCode==_JC.templateData.templatePages[p].pageCode){
            pageSort=_JC.templateData.templatePages[p].sort;
        }
    }
    
    //左翦头
    if (pageSort<=1){
        $(".prePage").addClass("noneClick");
    }else{
        $(".prePage").removeClass("noneClick");
    }
    
    //右翦头
    if (pageSort>=pageCount){
        $(".nextPage").addClass("noneClick");
    }else{
        $(".nextPage").removeClass("noneClick");
    }  
    
    //更新页码数量
    $(".activationPage").html(pageSort + "/" + pageCount);
    
    return pageCount;
}


//new ux/ui 更新导航工具菜单页面Data
function renderPagesItem (status=0){


    var pageCount=_JC.templateData.templatePages.length;
    
    var _Html='';
    var pageIndex=0;
    for (var p=0;p<_JC.templateData.templatePages.length;p++){
        
        if (_JC.templateData.templatePages[p].isDelete==0){

            pageIndex++;

            var isAct="";
            if (p==_JC.cunterPage){
                isAct="active";
            }

            _Html=_Html + '<div class=" listOption ' + isAct + '" data-pageCode="' + _JC.templateData.templatePages[p].pageCode + '" data-pageSort="'+_JC.templateData.templatePages[p].sort+'">';
            _Html=_Html +     '<div  class="optionIcon" style="pointer-events: auto;">';

            _Html=_Html +         '<div class="svgBox" style="pointer-events: none;">';

            _Html=_Html + svgElement.selectedIcon;

            _Html=_Html +         '</div>';
            _Html=_Html +     '</div>';

            _Html=_Html +     '<div class="optionBody">';
            _Html=_Html +         '<div class=" bodyContent">';

            if (_JC.templateData.templatePages[p].hasOwnProperty("pageTitle")){


                _Html=_Html +             '<div class="readonly-input pageName" >'+ (_JC.templateData.templatePages[p].pageTitle) +'</div>';
                // _Html=_Html +             '<input type="text" class="resetTitle elementRename"   value="页面 '+((p+1))+'" style="width: 185px;">';
                _Html=_Html +             '<pre>Page '+ (_JC.templateData.templatePages[p].pageTitle) + '</pre>';


            }else{

                _Html=_Html +             '<div class="readonly-input pageName" >Page '+ (p+1) +'</div>';
                // _Html=_Html +             '<input type="text" class="resetTitle elementRename"   value="页面 '+((p+1))+'" style="width: 185px;">';
                _Html=_Html +             '<pre>Page '+ (p+1) + '</pre>';

            }

            _Html=_Html +         '</div>';
            _Html=_Html +     '</div>';
            _Html=_Html + '</div>';
        }

    }

    $("#pageCount").html("Total Pages: " + pageIndex);
    
    $("#pagesItem").html(_Html);


}

//渲染当前页图层列表
var layerGrid;
var layerNested = '.listGrid';
var layerIdentifier = 'sortableId';
var layerSortData = document.getElementById('pageLayer');

function renderPageLayer(){

    //当前页面组件集
    var canvasObjects;
    var tableScrollTop=0;
    var layerData=[];

    canvasObjects=canvas.getObjects();
    canvasObjects.sort((a,b)=>{
        return a.zIndex -  b.zIndex
    });

    //20220815
    if (_JC.undoGroupSource!=null){
        var hideObjects=_JC.undoGroupSource.canvasOtherObjects;
    }else{
        var hideObjects=[];
    }

    var disableComponent=_JC.disableComponent;
    var newzIndex=_JC.minLayer;
    var typeObj={"image":0,"shape":0,"text":0,"group":0};
    

    for(key in canvasObjects){
        if (canvasObjects[key].dType && canvasObjects[key].id){
            if (disableComponent.indexOf(canvasObjects[key].dType)==-1 && canvasObjects[key].dType!="" && hideObjects.indexOf(canvasObjects[key].id)==-1 ){
                var subGroup=null;
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
                    case "shape":
                        typeObj.shape++;
                        canvasObjects[key].layerTitle="Shape " + typeObj.shape;
                        layerIcon=svgElement.shapeIcon;
                    break;
                    case "textbox":
                        typeObj.text++;
                        canvasObjects[key].layerTitle="" + canvasObjects[key].text;
                        layerIcon=svgElement.textIcon;
                    break;
                    case "group":
                        layerIcon=svgElement.groupIcon;
                        subGroup=getGroupLayerDetail(canvasObjects[key].objects);
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


                layerData.unshift({
                        sort:(key *1),
                        isGroup:(canvasObjects[key].type=="group")?true:false,
                        groupData:subGroup,
                        id:canvasObjects[key].id,
                        dType:canvasObjects[key].dType,
                        selectable:canvasObjects[key].selectable,
                        //name:(key *1),
                        layerIcon:layerIcon,
                        layerTitle:layerTitle,
                        zIndex:canvasObjects[key].zIndex*1,
                        visible:canvasObjects[key].visible,
                        selectable:canvasObjects[key].selectable
                });

            }

        }

    }
     
    var _Html='';
    for (var i=0;i<layerData.length;i++){

        _Html=_Html +'        <div class="listOption">';
        _Html=_Html +'            <div class="optionBox">';
        _Html=_Html +'                <div style="width: 6px; height: 100%; flex-shrink: 0;"></div>';
        _Html=_Html +'                <div data-drag="hide" class="optionIcon"></div>';
        _Html=_Html +'                <div class="_3k6A7 layerTypeIcon">';
        _Html=_Html +'                    <div class="_1566t svgBox">';

        _Html=_Html + layerData[i].layerIcon;

        _Html=_Html +'                    </div>';
        _Html=_Html +'                </div>';
        _Html=_Html +'                <div class="_2pv0V layerTitle">';
        _Html=_Html +'                    <div class="_1iUrS _2hfj- titleContent">';
        _Html=_Html +'                        <div class="readonly-input" style="width: 177px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" >'+layerData[i].layerTitle+'</div>';
        _Html=_Html +'                        <pre>'+layerData[i].layerTitle+'</pre>';
        _Html=_Html +'                    </div>';
        _Html=_Html +'                </div>';
        _Html=_Html +'                <div data-drag="hide" class="qTnQ3 layerTool">';

                                        /* layer tool icon start */

        _Html=_Html +'                    <div data-eventkey="" class="_1dJFM _9r-RK _34ZCy undefined _3iVfV showLayer" style="pointer-events: auto;">';

        if (layerData[i].visible==false){
            _Html=_Html +'                        <div class="_11XjX afPna _2iU7h _1OUWP eg-t6 svgBox" style="pointer-events: none;">';
            _Html=_Html + svgElement.hideLayerIcon;
            _Html=_Html +'                        </div>';
        }
        if (layerData[i].selectable==false){
            _Html=_Html +'                        <div class="_11XjX afPna _2iU7h _1OUWP eg-t6 svgBox" style="pointer-events: none;">';
            _Html=_Html + svgElement.lockLayerIcon;
            _Html=_Html +'                        </div>';
        }


        
        _Html=_Html +'                    </div>';

                                        /* layer tool icon end */


        _Html=_Html +'                </div>';
        _Html=_Html +'            </div>';
        _Html=_Html +'        </div>';

    }


    //$("#pageLayer").html(_Html);

    renderLayerHtml(layerData,$("#pageLayer"),0);

    
}



function getGroupLayerDetail(canvasObjects){

    var layerData=[];
    var disableComponent=_JC.disableComponent;
    var newzIndex=_JC.minLayer;
    var typeObj={"image":0,"shape":0,"text":0,"group":0};


    for(key in canvasObjects){
        if (canvasObjects[key].dType && canvasObjects[key].id){
            if (disableComponent.indexOf(canvasObjects[key].dType)==-1 && canvasObjects[key].dType!="" && hideObjects.indexOf(canvasObjects[key].id)==-1 ){

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
                    case "shape":
                        typeObj.shape++;
                        canvasObjects[key].layerTitle="Shape " + typeObj.shape;
                        layerIcon=svgElement.shapeIcon;
                    break;
                    case "textbox":
                        typeObj.text++;
                        canvasObjects[key].layerTitle="" + canvasObjects[key].text;
                        layerIcon=svgElement.textIcon;
                    break;
                    case "group":
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


                layerData.unshift({
                        sort:(key *1),
                        isGroup:(canvasObjects[key].type=="group")?true:false,
                        groupData:subGroup,
                        id:canvasObjects[key].id,
                        dType:canvasObjects[key].dType,
                        selectable:canvasObjects[key].selectable,
                        //name:(key *1),
                        layerIcon:layerIcon,
                        layerTitle:layerTitle,
                        zIndex:canvasObjects[key].zIndex*1,
                        visible:canvasObjects[key].visible,
                        selectable:canvasObjects[key].selectable
                });

            }

        }

    }

    return layerData;

}


function renderLayerHtml(layerData,ele,insertType){

    var _Html='';
    for (var i=0;i<layerData.length;i++){

        var groupType="";
        if (layerData[i].isGroup){
            groupType=" groupType";
        }

        _Html=_Html +'        <div class="listOption ' + groupType + '">';
        _Html=_Html +'            <div class="optionBox">';
        _Html=_Html +'                <div style="width: 6px; height: 100%; flex-shrink: 0;"></div>';
        _Html=_Html +'                <div data-drag="hide" class="optionIcon"></div>';
        _Html=_Html +'                <div class="_3k6A7 layerTypeIcon">';
        _Html=_Html +'                    <div class="_1566t svgBox">';

        _Html=_Html + layerData[i].layerIcon;

        _Html=_Html +'                    </div>';
        _Html=_Html +'                </div>';
        _Html=_Html +'                <div class="_2pv0V layerTitle">';
        _Html=_Html +'                    <div class="_1iUrS _2hfj- titleContent">';
        _Html=_Html +'                        <div class="readonly-input" style="width: 177px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" >'+layerData[i].layerTitle+'</div>';
        _Html=_Html +'                        <pre>'+layerData[i].layerTitle+'</pre>';
        _Html=_Html +'                    </div>';
        _Html=_Html +'                </div>';
        _Html=_Html +'                <div data-drag="hide" class="qTnQ3 layerTool">';

                                        /* layer tool icon start */

        _Html=_Html +'                    <div data-eventkey="" class="_1dJFM _9r-RK _34ZCy undefined _3iVfV showLayer" style="pointer-events: auto;">';

        if (layerData[i].visible==false){
            _Html=_Html +'                        <div class="_11XjX afPna _2iU7h _1OUWP eg-t6 svgBox" style="pointer-events: none;">';
            _Html=_Html + svgElement.hideLayerIcon;
            _Html=_Html +'                        </div>';
        }
        if (layerData[i].selectable==false){
            _Html=_Html +'                        <div class="_11XjX afPna _2iU7h _1OUWP eg-t6 svgBox" style="pointer-events: none;">';
            _Html=_Html + svgElement.lockLayerIcon;
            _Html=_Html +'                        </div>';
        }


        
        _Html=_Html +'                    </div>';

                                        /* layer tool icon end */


        _Html=_Html +'                </div>';
        _Html=_Html +'            </div>';
        _Html=_Html +'        </div>';

    }

    if (insertType===0){
        $(ele).html(_Html);
    }else if (insertType==1){
        $(ele).after(_Html);
    }

    layerGrid = [].slice.call(document.querySelectorAll('.leftMenuListPanel .listGrid'));

    for (var i = 0; i < layerGrid.length; i++) {
        new Sortable(layerGrid[i], {
            group: 'layer',
            animation: 150,
            fallbackOnBody: true,
            swapThreshold: 0.65,
            
            // 元素被选中
            onChoose: function (/**Event*/evt) {
                evt.oldIndex;  // element index within parent
                // console.log(layerSerialize(layerSortData));
            },
        });
    }    

}


function layerSerialize(sortable) {
    
  var serialized = [];
  var children = [].slice.call(sortable.children);
  for (var i in children) {
    var nested = children[i].querySelector(layerNested);
    serialized.push({
      id: children[i].dataset[layerIdentifier],
      children: nested ? layerSerialize(nested) : []
    });
  }
  return serialized
}


//生成指定代码缩略图并更新相应页码、副本集中
function createDupThumbnail(mapParm,canvasCode,thumbnailCanvas,_JC,pageSort,pageNo,pageCode,callback){

    _JC.canvasBase64(mapParm,canvasCode,thumbnailCanvas,function(base64){

        (callback && typeof(callback) === "function") && callback(base64);
        
    })
}

function createDupThumbnail_bak(mapParm,canvasCode,thumbnailCanvas,_JC,pageSort,pageNo,callback){

    _JC.canvasBase64(mapParm,canvasCode,thumbnailCanvas,function(base64){
        
        //ajax 上传图片 异步执行
        layui.uploadAPI.uploadImage({
            type: 'base64',
            file: base64,
            query: {
                limit: 1000,
            }
        }, function(result){
            
            if (result.code=="0000"){
                
                var previewUrl=result.data.thumbnailPath;
 
                (callback && typeof(callback) === "function") && callback(previewUrl);
            }else{
                (callback && typeof(callback) === "function") && callback(false);
            }
            
        });
        
    })
}

//后台隐藏式处理事务
function transactionProcess(){

    if (!isEmpty(timerProcess)){

        var theProcess=timerProcess[0];
        switch (theProcess.type)
        {
            //生成缩略图
            case "createDupThumbnail":

                var parm=theProcess.parm;
                console.log("生成缩略图"+parm.pageCode);
                
                var mapParm=parm.mapParm;
                var canvasCode=parm.canvasCode;
                var pageSort=parm.pageSort;
                var pageNo=parm.pageNo;
                var pageCode=parm.pageCode;


                //获取
                var tmpOption=_JC.canvasConfig.pageOption;
                var displayPage=[];
                switch (tmpOption)
                {
                    case "1":
                        displayPage=[1];
                    break;
                    case "2LR":
                        displayPage=[1,2];
                    break;
                    case "2TB":
                        displayPage=[1,2];
                    break;
                    case "4LRTB":
                        displayPage=[1,2,3,4];
                    break;
                }

                var outObjects=[];
                for (var i=0;i<canvasCode.objects.length;i++){

                    if (canvasCode.objects[i].hasOwnProperty("dType")){

                        if (canvasCode.objects[i].dType=="PageNo"){
                            var pnIndex=0;
                            if (canvasCode.objects[i].hasOwnProperty("pnIndex")){
                                pnIndex=canvasCode.objects[i].pnIndex*1;
                            }
                            
                            canvasCode.objects[i].text="" + (pageSort * displayPage.length + displayPage[pnIndex]);
                        }

                        if (_JC.disableComponent.indexOf(canvasCode.objects[i].dType)<=-1){
                            outObjects.push(canvasCode.objects[i]);
                        }

                    }
                }

                canvasCode.objects=outObjects;
        
                //生成切换前页面的缩略图到对应副本
                createDupThumbnail(mapParm,canvasCode,thumbnailCanvas,_JC,pageSort,pageNo,pageCode,async function(previewUrl){

                    //更新当前页面主副本
                    var duplicates=null;

                    pageFor:for (var p=0;p<_JC.pagesDuplicate.length;p++){

                        for (var d=0;d<_JC.pagesDuplicate[p].length;d++){

                            if (_JC.pagesDuplicate[p][d].pageCode==pageCode){
                                duplicates=_JC.pagesDuplicate[p];
                                pageSort=p;

                                break pageFor;
                            }

                        }
                    }

                    if (duplicates==null){
                        timerProcess.splice(0,1);
                        transactionProcess();
                        return;
                    }

                    for (var i=0;i<duplicates.length;i++){

                        if (pageCode==duplicates[i].pageCode){

                            if (duplicates[i].No*1 == pageNo*1){
                  
                                //删除原缩略图
                                var deleteImage="";
                                if (duplicates[i].previewUrl){
                                    deleteImage=duplicates[i].previewUrl;
                                }
                           
                                //更新新图
                                //canvas.previewUrl=previewUrl;
                                //_JC.templateData.cunterPageDuplicate[i].previewUrl=previewUrl;
                                timerProcess.splice(0,1);
                                _JC.pagesDuplicate[pageSort][i].previewUrl=previewUrl;
                                
                                var taskParm={};
                                taskParm.type="uploadPageThumb";
                                taskParm.lock=false;
                                taskParm.pageCode=_JC.pagesDuplicate[pageSort][i].pageCode;
                                taskParm.pageNo=_JC.pagesDuplicate[pageSort][i].No;
                                taskParm.runTime=Date.parse(new Date())*1 + 5000;
                                timeTask.push(taskParm);


                                transactionProcess();
                                break;
                            }
                        
                        }


                    }
                    
                });



            break;
            //当保存页面缩略图未完成时点击保存按钮，这时保存改为后台任务。
            case "saveDesign":
                console.log("timer saveDesign");
                console.log("timerProcess",timerProcess);
                console.log("timeTask",timeTask);
                timerProcess.splice(0,1);
                $("#saveComponent").click();
            break;

        }


    }else{
        console.log("timerProcess is null");
    }
}


//后台生成所有页面缩略图
function hideCreatePagesThumbnail(pIndex=0,pageCount=null,callback=null){

        if (pageCount==null){
            pageCount=_JC.templateAffair().getTemplateValidPages(); 
        }

        if (pageCount>pIndex){
            
            //获取
            var tmpOption=_JC.canvasConfig.pageOption;
            var displayPage=[];
            switch (tmpOption)
            {
                case "1":
                    displayPage=[1];
                break;
                case "2LR":
                    displayPage=[1,2];
                break;
                case "2TB":
                    displayPage=[1,2];
                break;
                case "4LRTB":
                    displayPage=[1,2,3,4];
                break;
            }



            //生成并保存该副本base64图片 -> 并自动保存上传服务器
            /*var mapParm={};
                mapParm.zoom=0.9;
                mapParm.x=0;
                mapParm.y=0;
                mapParm.width=_JC.paperSize.bleedWidth;
                mapParm.height=_JC.paperSize.bleedHeight;
            */


            var mapParm={};
                mapParm.zoom=getThumbnailZoom(_JC.paperSize.bleedWidth,_JC.paperSize.bleedHeight,minThumbnail,maxThumbnail);
            
            var offset=Math.ceil(mapParm.zoom);
                mapParm.x=_JC.canvasPaddX * mapParm.zoom + offset;
                mapParm.y=_JC.canvasPaddY * mapParm.zoom + offset;
                mapParm.width=_JC.paperSize.bleedWidth - parseInt(mapParm.zoom);
                mapParm.height=_JC.paperSize.bleedHeight - parseInt(mapParm.zoom);




            var canvasCode=null;
            var duplicates=_JC.pagesDuplicate[pIndex];
            var dupIndex=0;
            //副本index
            if (duplicates!=undefined){    
                for (var p=0;p<duplicates.length;p++){
                    if (duplicates[p].isValid==0){

                        dupIndex=p;
                        canvasCode=duplicates[p];
                        var canvasObjects=canvasCode.objects;

                        //更新页面中的页码组件数据
                        for (var i=0;i<canvasObjects.length;i++){
                            
                            //这里对页码计算数值
                            if (canvasObjects[i].dType=="PageNo"){
                                var pnIndex=0;
                                if (canvasObjects[i].hasOwnProperty("pnIndex")){
                                    pnIndex=canvasObjects[i].pnIndex*1;
                                }
                                
                                canvasObjects[i].text="P" + (pIndex * displayPage.length + displayPage[pnIndex]);

                            }

                        }

                        canvasCode.objects=canvasObjects;
                        break;
                    }
                }
            }
            
            if (canvasCode!=null){
                
                if (mapParm.width!=canvasCode.width){
                    mapParm.x=(canvasCode.width - mapParm.width)/2  + offset;
                    mapParm.y=(canvasCode.height - mapParm.height)/2 + offset;
                }    
          
                _JC.canvasBase64(mapParm,canvasCode,thumbnailCanvas,function(base64){
                    
                    //ajax 上传图片 异步执行
                    layui.uploadAPI.uploadImage({
                        type: 'base64',
                        file: base64,
                        query: {
                            limit: 1000,
                        }
                    }, function(result){
                        
                        if (result.code=="0000"){
                            console.log(result.data.originPath);
                            if (_JC.pagesDuplicate[pIndex]){
                                if (_JC.pagesDuplicate[pIndex][dupIndex]){
                                    _JC.pagesDuplicate[pIndex][dupIndex].previewUrl=result.data.originPath;
                                }
                            }
                            
                            hideCreatePagesThumbnail((pIndex+1),pageCount,callback);
                        }else{
                            hideCreatePagesThumbnail((pIndex+1),pageCount,callback);
                        }
                        
                    });
                    
                })
            
            }
            
        }else{
            //执行完成
            (callback && typeof(callback) === "function") && callback(); 
        }
    
}


//锁定不能操作处理页面事件
function disablePagesEvent(){
    $("#saveComponent").attr("id","lockBtn");
    $("#lockBtn").addClass("noneClick").text("Lock"); 
    
    $(".pageEvent.reloadDetails").addClass("noneClick").removeClass("newPage");
    $(".pageButton.newPage").addClass("noneClick").removeClass("newPage");
    $(".pageButton.copyPage").addClass("noneClick").removeClass("copyPage");
    $(".pageButton.disPage").addClass("noneClick").removeClass("disPage");
    $(".pageButton.nextPage").addClass("noneClick").removeClass("nextPage");
    $(".pageButton.prePage").addClass("noneClick").removeClass("prePage");
    $(".pageEvent.importPage").addClass("noneClick").removeClass("importPage");
    $(".pageEvent.RefreshPage").addClass("noneClick").removeClass("RefreshPage");
    $(".pageEvent.pageLevel").addClass("noneClick").removeClass("pageLevel");
    $(".pageEvent.deletePage").addClass("noneClick").removeClass("deletePage");
    $(".pageEvent.mmDetails").addClass("noneClick").removeClass("mmDetails").css({"pointer-events":"none","cursor":"not-allowed"});
    $(".pageEvent.preview").addClass("noneClick").removeClass("preview");
    $("#DesignLine").addClass("noneClick").attr("id","");
    $(".helpIcon").remove();
    
    $("#pageBackground").remove();
    $(".insertComponent").removeClass("insertComponent");
    $(".insertElement").removeClass("insertElement");

    $("#drawText,#drawPicture,#drawPageNo,#drawShape,#newPage").css({"opacity":"0.3","pointer-events":"none"}); 

    $(".fileBtnBox .noneClick").css({"pointer-events":"none","cursor":"not-allowed"});
    $(".replaceBackground").remove();
}

//定时任务执行
function timeKeeping(){

    var timestamp = Date.parse(new Date());
    if (isEmpty(timeTask)){
        return;
    }else{

        taskFor:for (var i=0;i<timeTask.length;i++){
            
                
                switch (timeTask[i].type)
                {
                    case "lockTemplate":
                        if ((timeTask[i].runTime - timestamp)<-5000){
                            timeTask[i].runTime=timestamp + timing;
                            lockTemplate(timeTask[i].designTemplateCode);
                        }
                    break;
                    case "uploadPageThumb":
                    if ((timeTask[i].runTime - timestamp)<-5000){    
                        timeTask[i].runTime=timestamp + 5000;
                        // if (timeTask[i].lock==false) {
                        if (timeTask[i].hasOwnProperty("lock")) {

                            timeTask[i].lock=true;

                            var duplicates=null;
                            var pageSort=-1;
                            var dupSort=-1;
                            var base64="";
                            var taskIndex=-1;
                            console.log("start");
                            var pageCode=timeTask[i].pageCode;
                            var pageNo=timeTask[i].pageNo;

                            pageFor:for (var p=0;p<_JC.pagesDuplicate.length;p++){

                                        
                                        for (var d=0;d<_JC.pagesDuplicate[p].length;d++){

                                            if (_JC.pagesDuplicate[p][d].pageCode==pageCode){

                                                if (_JC.pagesDuplicate[p][d].previewUrl!="" && _JC.pagesDuplicate[p][d].previewUrl.substr(0,4)=="data" && _JC.pagesDuplicate[p][d].No*1==pageNo*1 ){
                                             
                                                    duplicates=_JC.pagesDuplicate[p];
                                                    pageSort=p;
                                                    dupSort=d;
                                                    console.log("test " + pageSort);
                                                    base64=_JC.pagesDuplicate[p][d].previewUrl;
                                                    taskIndex=i;
                                                    break pageFor;
                                                }
                                            }
                                    }

                            }
                            
                   
                  
                            if (pageSort===-1 || dupSort===-1){
                                timeTask[i].lock=false;
                                timeTask.splice(i,1);
                                timeKeeping();
                                return;
                            }else{
                                
                                if (base64!="" && base64.substr(0,4)!="http" && taskIndex!==-1 ){

                                    

                                    console.log("base64");
                                    //ajax 上传图片 异步执行
                                    layui.uploadAPI.uploadImage({
                                        type: 'base64',
                                        file: base64,
                                        query: {
                                            limit: 1000,
                                        }
                                    }, function(result){
                                        
                                        if (result.code=="0000"){
                                            
                                            pageFor:for (var p=0;p<_JC.pagesDuplicate.length;p++){

                                                    for (var d=0;d<_JC.pagesDuplicate[p].length;d++){
                                                        
                                                        if (_JC.pagesDuplicate[p][d].pageCode==pageCode && _JC.pagesDuplicate[p][d].No*1==pageNo*1){


                                                            var previewUrl=result.data.thumbnailPath;
                                                            _JC.pagesDuplicate[p][d].previewUrl=previewUrl;
                                                            console.log("up img OK taskIndex=" + taskIndex);
                                                            console.log(previewUrl);
                                                            timeTask.splice(taskIndex,1);

                                                            if (timeTask.length>1){

                                                                if (timeTask[1].hasOwnProperty("lock")){
                                                                    timeTask[1].lock=false;
                                                                }
                                                            }

                                                            timeKeeping();
                                                            break pageFor;

                                                        }
                                                    }
                                               }

                                        }else{
                                            console.log("up Img err " + taskIndex)
                                            timeTask.splice(taskIndex,1);
                                            if (timeTask[i].hasOwnProperty("lock")){
                                                timeTask[i].lock=false;
                                            }
                                            timeKeeping();
                                        }

                                        
                                        return;
                                    });

                                    break taskFor;
                                }
                            }
                        }

                    }

                    break;

                }
            
        }

        

    }


}
function timeKeeping_bak(){

    var timestamp = Date.parse(new Date());
    if (isEmpty(timeTask)){
        return;
    }else{

        for (var i=0;i<timeTask.length;i++){

            if (Math.abs(timeTask[i].runTime - timestamp)>5000){
                
                
                switch (timeTask[i].type)
                {
                    case "lockTemplate":
                        if ((timeTask[i].runTime - timestamp)<-20000){
                            timeTask[i].runTime=timestamp + timing;
                            lockTemplate(timeTask[i].designTemplateCode);
                        }
                    break;
                    case "uploadPageThumb":
                        // console.log(timeTask);
                        timeTask[i].runTime=timestamp + 5000;
                        if (timeTask[i].lock==false) {

                            timeTask[i].lock=true;

                            var duplicates=null;
                            var pageSort=-1;
                            var dupSort=-1;
                            var base64="";
                            var taskIndex=-1;

                            pageFor:for (var p=0;p<_JC.pagesDuplicate.length;p++){

                                for (var d=0;d<_JC.pagesDuplicate[p].length;d++){
                                

                                    if (_JC.pagesDuplicate[p][d].previewUrl!="" && _JC.pagesDuplicate[p][d].previewUrl.substr(0,4)=="data"){
                                   
                                        duplicates=_JC.pagesDuplicate[p];
                                        pageSort=p;
                                        dupSort=d;
                                        console.log("test " + pageSort);
                                        base64=_JC.pagesDuplicate[p][d].previewUrl;
                                        taskIndex=i;
                                        break pageFor;
                                    }

                                }

                            }
                            
                   
                  
                            if (pageSort===-1 || dupSort===-1){
                            
                                timeTask[i].lock=false;
                                return;
                            }else{
                                
                                if (base64!="" && base64.substr(0,4)!="http" && taskIndex!==-1){
                                    
                                    //ajax 上传图片 异步执行
                                    layui.uploadAPI.uploadImage({
                                        type: 'base64',
                                        file: base64,
                                        query: {
                                            limit: 1000,
                                        }
                                    }, function(result){
                                        
                                        if (result.code=="0000"){
                                            
                                            var previewUrl=result.data.thumbnailPath;
                                            _JC.pagesDuplicate[pageSort][dupSort].previewUrl=previewUrl;
                                        }

                                        timeTask[taskIndex].lock=false;
                                        return;
                                    });
                                }
                            }
                        }
                    break;

                }
            }
        }

        

    }


}



//锁定模板
function lockTemplate(code, fail) {
    console.log("lockTemplate");
    if (fail === undefined) {
        fail = function(result) {
            lockStatus=true;
            disablePagesEvent();
            layer.msg(result.msg);
        };
    }
    $.ajax({
        url: getApiUrl('marketing.template.lock', {code: code}),
        type: getApiMethod('marketing.template.lock'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code !== "0000") {
                fail && fail(result);
            }else{
                lockStatus=false;
            } 
        }
    });
}

//解锁模板
function unlockTemplate(code, fail) {
    if (fail === undefined) {
        fail = function(result) {
            layer.msg(result.msg);
        };
    }
    $.ajax({
        url: getApiUrl('marketing.template.unlock', {code: code}),
        type: getApiMethod('marketing.template.unlock'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code !== "0000") {
                fail && fail(result);
            }
        }
    });
}

//定时保存模板
function autoTimeSave(){
 
    if (_JC.undoGroupSource==null && lockStatus==false ) {
        var parm={
            url:getApiUrl('marketing.template.update', {
                    code: _JC.templateData.templateCode
                }),
            type: getApiMethod('marketing.template.update'),
            code:_JC.templateData.templateCode,
            access_token:storage.access_token,
            template:{
                code:_JC.templateData.templateCode,
                isDelete:0,
            }
                
        };
       
        _JC.canvasSave().autoTimeSave(parm, function(mydata){
   
            //保存template async
            $.ajax({
                url: parm.url,
                type: parm.type,
                data: JSON.stringify(mydata),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + parm.access_token
                },
                success: function(result){
               
                    if (result.code ==="0000") {
                        console.log("保存 " + result.msg);
                    }else{
                        console.log("保存 " + result.msg);
                    }
                    
                }
            }); 
        
        });
    }
}

//分辨率单位转换
function UnitName(parm){
    switch (parm*1)
    {
        case 72:
            return "px";
        break;
        case 25.4:
            return "mm";
        break;
        case 2.54:
            return "cm";
        break;
        case 1:
            return "inch";
        break;
    }
}

//pt值转设计单位mm/cm/px/inch
function ptConvertUnit(unitPi,val){
    return val * 1;
    if (!isEmpty(unitPi) && !isEmpty(val) && unitPi>0 && val>0){
        //return (val * unitPi / 72).toFixed(2)*1;
        return (val * unitPi * 2 / 72 );
    }else{
        return 0;
    }
}

//设计单位mm/cm/px/inch值转pt
function unitConvertPt(unitPi,val){
    return val * 1;
    if (!isEmpty(unitPi) && !isEmpty(val) && unitPi>0 && val>0){
        return (Math.round((val * 72 / unitPi) * 100) / 100 / 2);
    }else{
        return 0;
    }
}

//计算生成缩略图比例
function getThumbnailZoom(w,h,minThumbnail,maxThumbnail){

    if (w>=h){
        var parm=h;
    }else{
        var parm=w;
    }

    if (parm==minThumbnail){
        return 1;
    }else if (parm<minThumbnail){
        return (minThumbnail/parm).toFixed(1)*1;
    }else if (parm>minThumbnail && parm<maxThumbnail){
        return (minThumbnail/parm).toFixed(1)*1;
    }else if (parm>=maxThumbnail){
        return (maxThumbnail/parm).toFixed(1)*1;
    }

}

//base64图片压缩
function convert(base64) {
    compress(base64, 800, 0.5).then(function(val) {
        imgb.src = val;
    });
}

//缩放画布
//positionCanvas 画布是否居中显示
function zoomScale(positionCanvas,zoomVal){

    $("#menu").hide();
    if (zoomVal<0){
        switch (zoomVal) 
        {
            case -1:

                var zoomNum=_JC.canvasConfig.zoomParm.zoomNum;
                var canvasNode = canvas.getElement();
                var upperCanvasEl=canvas.upperCanvasEl;
                var canvasID=upperCanvasEl.previousSibling.id;
                var drawWrapper=document.getElementById(canvasID).parentNode.parentNode.id;
                canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), zoomNum);

                if (document.getElementById(_JC.pageEventObject.zoomValue.id)){
                    document.getElementById(_JC.pageEventObject.zoomValue.id).innerText=parseInt(zoomNum * 100) + "%";
                }
                
                var canvasHeight=_JC.paperSize.bleedHeight + 2 * _JC.canvasPaddY;
                if (_JC.device.height>canvasHeight){
                    document.getElementById(drawWrapper).scrollTop=(_JC.device.height - canvasHeight )/2;
                }else{
                    document.getElementById(drawWrapper).scrollTop=(canvasHeight  - _JC.device.height)/2;
                }
       
                canvas.viewportTransform[4]=_JC.canvasConfig.zoomParm.vt4;
                canvas.viewportTransform[5]=_JC.canvasConfig.zoomParm.vt5;
             
            break;
            case -2:
                _JC.componentDraw().resetView(function() {
                    layer.msg("Success");
                });
            break;
        }
    }else{

        //在小尺寸MM中性能低
        var zoom=zoomVal * 0.01;
        document.getElementById(_JC.pageEventObject.zoomValue.id).innerText=parseInt(zoom * 100) + "%";
        canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), zoom);

    }
    

}

//智能参考线
function showGuides(){
    
    if (_JC.disAlignmentLine==true){
        //删除智能对齐辅助线
        _JC.canvasDraw().clearAlignLine();
        _JC.alignmentLineObject=null;
        _JC.disAlignmentLine=false;
    }else{
        _JC.alignmentLineObject=null;
        _JC.disAlignmentLine=true;
    }
    
    $("#zoomMenu,.menu-x").hide();
    
}

//刷新画布
function refreshCanvas(){
    if ($(this).hasClass("noneClick") || _JC.undoGroupSource != null) {
        return;
    }
    _JC.componentDraw().resetView(function() {
        layer.msg("Success");
    });
}



/**
 * 计算字体大小
 */
function computeFontSize(str, size, family) {
    let spanDom = document.createElement("span");
    spanDom.style.fontSize = size;
    spanDom.style.opacity = "1";
    spanDom.style.lineHeight = "1";
    spanDom.style.fontFamily = family;
    /*
    spanDom.style.position = "fixed";
    spanDom.style.top = "1px";
    spanDom.style.left = "100px";
    spanDom.style.zIndex = 9999;*/
    spanDom.innerHTML = str;
    document.body.append(spanDom);
    let sizeD = {};
    sizeD.width = spanDom.offsetWidth;
    sizeD.height = spanDom.offsetHeight;
    spanDom.remove();
    return sizeD;
}

/**
 * MM模板转为普通模板，去除多余的内容，并返回新的模板内容
 * @author siliang
 * @Date   2023-03-28
 * @param  array   templatePageList 模板的templatePageList字段
 * @return array
 */
function mmToTemplate(templatePageList) {
    // 数据处理方法
    var handle = function(obj) {
        if (obj.type == 'group') {
            if (obj.dType == 'Product') {
                obj.itemCode = '';
            } else if (obj.dType == 'productPicture') {
                // dataFiled: goodsImage、lk_goodsImage、icon1、icon2、icon3
                var array = ['goodsImage', 'lk_goodsImage'];
                if (array.indexOf(obj.dataFiled) !== -1 && obj.objects) {
                    // 移除商品图片
                    for (var i = obj.objects.length - 1; i >= 0; i--) {
                        var child = obj.objects[i];
                        if (child.type == 'image' && child.dType == 'previewPicture') {
                            obj.objects.splice(i, 1);
                        } else {
                            child.visible = true;
                        }
                    }
                }
            }
        } else if (obj.type == 'image') {
            if (obj.dType == 'Picture') {
                
            }
        } else if (obj.type == 'textbox' || obj.type == 'i-text') {
            // i-text是不可换行的文本
            var text = '';
            if (obj.dataFiled && labels[obj.dataFiled]) {
                if (labels[obj.dataFiled].classify == 3) {
                    // 如果是价格标签，针对处理
                    if (obj.text.indexOf('.') !== -1) {
                        text = '0.0';
                    } else {
                        text = '0';
                    }
                } else {
                    text = labels[obj.dataFiled].name;
                }
                obj.text = text;
                if (obj.textLines) {
                    obj.textLines = [text];
                }
            } else if (obj.dType == 'productPriceText') {
                // 如果是商品价格文本，针对处理
                if (obj.text.indexOf('.') !== -1) {
                    text = '0.0';
                } else {
                    text = '0';
                }
                obj.text = text;
                if (obj.textLines) {
                    obj.textLines = [text];
                }
            }
        }
        if (obj.objects) {
            for (var i = 0; i < obj.objects.length; i++) {
                handle(obj.objects[i]);
            }
        }
    };
    // 深拷贝一份新的templatePageList
    var pageList = [];
    if (templatePageList) {
        pageList = JSON.parse(JSON.stringify(templatePageList));
    }
    // label标签
    var labels = {};
    $.ajax({
        url: getApiUrl('marketing.label.page'),
        type: getApiMethod('marketing.label.page'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        data: {
            page: 1,
            limit: 1000,
            status: 1,
        },
        async: false,
        success: function(result) {
            if (result.code == '0000') {
                var list = result.data.records || [];
                for (var i = 0; i < list.length; i++) {
                    labels[list[i].value] = {
                        id: list[i].id,
                        name: list[i].name,
                        sort: list[i].sort,
                        classify: list[i].classify,
                    };
                }
            }
        }
    });
    for (var p = 0; p < pageList.length; p++) {
        var templatePage = pageList[p];
        delete templatePage.templateCode;
        var duplicate = templatePage.content.duplicate;
        //取有效副本主版
        for (var n = 0; n < duplicate.length; n++) {
            var row = duplicate[n];
            // 重新生成No字段
            row.No = _JC.createID();
            if (row.objects) {
                handle(row);
            }
        }
    }
    return pageList;
}

//根据当前选择组件控制组件属性面板的图层操作按钮
function refreshLayerToBtn(theObj){

    if (isEmpty(theObj)){
        $("#layerToForward").addClass("noneClick");
        $("#layerToBackward").addClass("noneClick");
        $("#layerToTop").addClass("noneClick");
        $("#layerToBottom").addClass("noneClick");
    }else{

        $("#layerToForward").addClass("noneClick");
        $("#layerToBackward").addClass("noneClick");
        $("#layerToTop").addClass("noneClick");
        $("#layerToBottom").addClass("noneClick");
        if (theObj.hasOwnProperty("group")){

            var parentObj=theObj.group;
            var sortIndex=parentObj._objects.indexOf(theObj);
            var objLen=parentObj._objects.length;
            if (sortIndex==0){
                //子对象在分组最前面最底层
                $("#layerToForward").removeClass("noneClick");
                $("#layerToTop").removeClass("noneClick");
            }else if (sortIndex>0 && sortIndex<objLen - 1){
                //子对象在分组中间层
                $("#layerToForward").removeClass("noneClick");
                $("#layerToBackward").removeClass("noneClick");
                $("#layerToTop").removeClass("noneClick");
                $("#layerToBottom").removeClass("noneClick");
            }else if (sortIndex==objLen - 1){
                //子对象在分组最顶层
                $("#layerToBackward").removeClass("noneClick");
                $("#layerToBottom").removeClass("noneClick");
            }

        }else{

            if (_JC.undoGroupSource==null){
                //非分组编辑场景

                var canvasObjects=canvas._objects;
                var objLen=canvasObjects.length;
                var sortIndex=canvasObjects.indexOf(theObj);
                if (sortIndex<=_JC.minLayer){
                    //在分组最前面最底层
                    $("#layerToForward").removeClass("noneClick");
                    $("#layerToTop").removeClass("noneClick");
                }else if (sortIndex>_JC.minLayer && sortIndex<objLen -1){
                    //在分组中间层
                    $("#layerToForward").removeClass("noneClick");
                    $("#layerToBackward").removeClass("noneClick");
                    $("#layerToTop").removeClass("noneClick");
                    $("#layerToBottom").removeClass("noneClick");
                }else if (sortIndex==objLen - 1){
                    //在分组最顶层
                    $("#layerToBackward").removeClass("noneClick");
                    $("#layerToBottom").removeClass("noneClick");
                }

            }else{
                //分组编辑场景

                var canvasObjects=canvas._objects;
                var objLen=canvasObjects.length;
                var sortIndex=canvasObjects.indexOf(theObj);
                var editGroupBg=_JC.canvasDraw().searchObject({id:'editGroupBg'},canvasObjects);
                var editGroupSort=canvasObjects.indexOf(editGroupBg);
                if (sortIndex==editGroupSort+1){
                    //在分组最前面最底层
                    $("#layerToForward").removeClass("noneClick");
                    $("#layerToTop").removeClass("noneClick");
                }else if (sortIndex>editGroupSort && sortIndex<objLen -1){
                    //在分组中间层
                    $("#layerToForward").removeClass("noneClick");
                    $("#layerToBackward").removeClass("noneClick");
                    $("#layerToTop").removeClass("noneClick");
                    $("#layerToBottom").removeClass("noneClick");
                }else if (sortIndex==objLen - 1){
                    //在分组最顶层
                    $("#layerToBackward").removeClass("noneClick");
                    $("#layerToBottom").removeClass("noneClick");
                }

            }


        }



    }


}

//当设计模式为MM/Template时，检查当前编辑分组是否为商品组件，是显示Label标签，否隐藏Label标签
function showEditGroupTool(){
    
    if (_JC.undoGroupSource!=null){
        var isEditProduct=false;
        if (_JC.undoGroupSource.hasOwnProperty("isEditProduct")){
            if (_JC.undoGroupSource.isEditProduct){
                isEditProduct=true;
            }else{
                isEditProduct=false;
            }
        }else{
            isEditProduct=false;
        }
        if (isEditProduct){
            if ($("#componentTool").hasClass("layui-this")){
                $("#productElementTool").click();
            }
            $("#productElement").removeClass("layui-hide");
            $("#componentTool").addClass("layui-hide");
            $("#productElementTool").removeClass("layui-hide");
            
        }else{
            if ($("#productElementTool").hasClass("layui-this")){
                $("#componentTool").click();
            }
            $("#productElement").addClass("layui-hide");
            $("#componentTool,#component").removeClass("layui-hide");
            $("#productElementTool").addClass("layui-hide");
        }
    }else{
        if (_JC.designModule!="component"){
            if ($("#productElementTool").hasClass("layui-this")){
                $("#componentTool").click();
            }
            $("#productElement").addClass("layui-hide");
            $("#componentTool,#component").removeClass("layui-hide");
            $("#productElementTool").addClass("layui-hide");
        }
    }
}

//重新定义 _JC类组件操作回调请求页面元素事件
function redefinePageEvent(_JC){
    
    //普通非划线文本页面元素属性
    _JC.pageEvent.textBoxAttributes=function(){
        
        var dType=_JC.cunterObj.dType;
        var active=_JC.cunterObj;
        
        $(".saveBtn,.copyBtn").show();
        $(".saveBtn,.RefreshBtn").show();
        $("#objTitle").html(_JC.cunterObj.dType);
    
        //组件操作按钮
        $(".attribute-btn .componentSelected").addClass("noneClick");
        $(".attribute-btn .copyComponent").removeClass("noneClick");
        
        $(".attribute-btn .deleteBtn").removeClass("noneClick");
        $(".attribute-btn .GroupBtn").hide();
        $(".attribute-btn .RefreshBtn").hide();
        
        $(".attribute-btn .copyStyleBtn").show().removeClass("noneClick").removeClass("selected");
        
        if (_JC.undoGroupSource!=null){
            $(".attribute-btn .GroupBtn").find("i").removeClass("layui-icon-unlink").removeClass("layui-icon-link").addClass("layui-icon-ok");
            $(".attribute-btn .GroupBtn").removeClass("noneClick").attr("data","group").show();
        }
        
        $(".attribute-btn").show();
        $(".attribute-btn.qkey").hide();
        $(".attribute-btn.elementLever").show();
        $(".productPictureList").hide();
    
        //组件属性显示
        $(".attriblute").css("display","block");
        $(".setPictureBox").css("display","none");  
        $(".productBox").css("display","none");
        $("input[name=objWidth]").val(parseInt(_JC.cunterObj.width));
        $("input[name=objHeight]").val(parseInt(_JC.cunterObj.height));
        $("input[name=objLeft]").val(parseInt(_JC.cunterObj.left));
        $("input[name=objTop]").val(parseInt(_JC.cunterObj.top));
        
        if (_JC.undoGroupSource==null){
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex);
        }else{
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex-_JC.editGroupZindex);
        }
        
        if (_JC.cunterObj.zIndex>_JC.minLayer+1){
            $("#layerToBackward").removeClass("noneClick");
            $("#layerToBottom").removeClass("noneClick");
        }else{
            //$("#layerToBackward").addClass("noneClick");
            //$("#layerToBottom").addClass("noneClick");
        }

        //根据当前选择组件控制组件属性面板的图层操作按钮
        refreshLayerToBtn(_JC.cunterObj);

        $(".panelTitle").html("Text config");
        $(".attribute-panel").hide();
        $(".textConfig").show();
        $(".RevertBtn").addClass("noneClick");
        
        if (dType=="text" || dType=="PageNo"){
            $("input[name=objText]").removeAttr("disabled");
            $(".linkItemClass").hide();

            //为了兼容历史设计的文本类组件描边为外描边,如果该值是fill表示为内描边
            _JC.cunterObj.set({paintFirst:'stroke'});
            
        }else{

            //处理关联商品标签设置
            if (_JC.cunterObj.hasOwnProperty("dataFiled")==true){
                if ((_JC.cunterObj.dataFiled).substr(0,3)=="lk_"){
                    $(".textConfig .linkItemClass").show();
                    var lkSort=(_JC.cunterObj.hasOwnProperty("lkSort")==true)?_JC.cunterObj.lkSort:"";
                    $(".textConfig").find("input[name=lkSort]").val(lkSort);
                }else{
                    $(".linkItemClass").hide();
                }
            }else{
                $(".linkItemClass").hide();
            }
            
            if (_JC.designModule!="mm"){
                $("input[name=objText]").removeAttr("disabled");
            }else{
                $("input[name=objText]").attr("disabled","");
            }
        }
        
        
        if (_JC.cunterObj.hasOwnProperty("paintFirst")==true){
            _JC.cunterObj.paintFirst='stroke';
            _JC.cunterObj.set({paintFirst:'stroke'});
        }else{
            _JC.cunterObj.paintFirst='stroke';
            _JC.cunterObj.set({paintFirst:'stroke'});
        }

        //如果是商品组件就显示对应的dataFiled字段
        if (_JC.cunterObj.hasOwnProperty("dataFiled")){
            $("#textBoxAttributes-dataFiled").html(_JC.cunterObj.dataFiled);
            if (_JC.designModule=="mm"){
                if (["promoprice","promoprice1","promoprice2","promoprice3","promoprice4"].indexOf(_JC.cunterObj.dataFiled)>-1){
                    _JC.cunterObj.editable=false;
                }
            }
        }else{
            $("#textBoxAttributes-dataFiled").html("");
        }
        
        //文本字体风格属性 是否加粗
        if (_JC.cunterObj.fontWeight=="bold"){
            $(".layui-fontStyle.Bold").addClass("act");
            $(".layui-fontStyle.Regualar").removeClass("act");
        }else{
            $(".layui-fontStyle.Bold").removeClass("act");
            $(".layui-fontStyle.Regualar").addClass("act");
        }
        
        //是否正常斜体
        if (_JC.cunterObj.fontStyle=="italic"){
            $(".layui-fontStyle.Italic").addClass("act");
        }else{
            $(".layui-fontStyle.Italic").removeClass("act");
        }
        
    
        $(".panelTitle").html("Text config");
        $(".attribute-panel").hide();
        $(".textConfig").show();
        
        $(".textBox.textConfig").css("display","block");
        $(".setPictureBox").css("display","none");
        $(".rectBox").css("display","none");
        $(".productBox").css("display","none");
        $(".underlineTextConfig").css("display","none");
        $("input[name=objText]").val(_JC.cunterObj.text);
        $("input[name=textColor]").val(_JC.cunterObj.fill);

        $("input[name=textSize]").val(_JC.cunterObj.fontSize);

        //$("input[name=textStroke]").val(_JC.cunterObj.strokeWidth);
        if (_JC.cunterObj.hasOwnProperty("strokePt")){
            $("input[name=textStroke]").val(_JC.cunterObj.strokePt);
        }else{
            var strokePt=unitConvertPt(_JC.paperSize.paperUnitToPx,_JC.cunterObj.strokeWidth);
            _JC.cunterObj.set({strokePt:strokePt});
            $("input[name=textStroke]").val(strokePt);
        }


        $("input[name=strokeColor]").val(_JC.cunterObj.stroke);
        $("input[name=textWeight]").val(_JC.cunterObj.fontWeight);
    
        //阴影属性
        var shadowOffset=(_JC.cunterObj.shadowOffset)?_JC.cunterObj.shadowOffset:0;
        var shadowBlur=(_JC.cunterObj.shadow!=null)?_JC.cunterObj.shadow.blur:0;
        var shadowAngle=(_JC.cunterObj.hasOwnProperty("shadowAngle"))?_JC.cunterObj.shadowAngle:0;
        $(".textConfig .roundShape").css("transform","rotate("+(shadowAngle)+"deg)").css("transform-origin","50% 50%");
        $("input[name=filterDistance]").val(shadowOffset);
        $("input[name=filterBlur]").val(shadowBlur);
        $(".angleNum").text(shadowAngle);
    
    
        var S0 = 'dd[lay-value='+ _JC.cunterObj.fontFamily+']';
        $('select[name=\'textFont\']').siblings("div.layui-form-select").find('dl').find(S0).click();
        //如果是当前页原有设计字体未加载完处理
        $('select[name=\'textFont\']').siblings("div.layui-form-select").find('dl').find(S0).removeClass("layui-disabled");
        
        var S1 = 'dd[lay-value='+ _JC.cunterObj.textAlign+']';
        $('select[name=\'textAlign\']').siblings("div.layui-form-select").find('dl').find(S1).click();
    
        $("input[name=objWidth]").removeAttr("readonly").css("background-color","#ffffff");
        $("input[name=objHeight]").removeAttr("readonly").css("background-color","#ffffff");
        
        
        //当设计模式为MM/Template时，检查当前编辑分组是否为商品组件，是显示Label标签，否隐藏Label标签
        if (_JC.designModule!="component"){
            showEditGroupTool();
        }
    }


    //划线文本页面元素属性
    _JC.pageEvent.underlineTextAttributes=function(){
        
        var dType=_JC.cunterObj.dType;
        var active=_JC.cunterObj;
        
        $(".saveBtn,.copyBtn").show();
        $(".saveBtn,.RefreshBtn").show();
        $("#objTitle").html(_JC.cunterObj.dType);
    
        //组件操作按钮
        $(".attribute-btn .componentSelected").addClass("noneClick");
        $(".attribute-btn .copyComponent").removeClass("noneClick");

        $(".attribute-btn .deleteBtn").removeClass("noneClick");
        $(".attribute-btn .GroupBtn").hide();
        $(".attribute-btn .RefreshBtn").hide();
        
        $(".attribute-btn .copyStyleBtn").show().removeClass("noneClick").removeClass("selected");
        
        if (_JC.undoGroupSource!=null){
            $(".attribute-btn .GroupBtn").find("i").removeClass("layui-icon-unlink").removeClass("layui-icon-link").addClass("layui-icon-ok");
            $(".attribute-btn .GroupBtn").removeClass("noneClick").attr("data","group").show();
        }
        
        $(".attribute-btn").show();
        $(".attribute-btn.qkey").hide();
        $(".attribute-btn.elementLever").show();
        
        $(".productPictureList").hide();
    
        //划线文本组件属性显示
        if (_JC.cunterObj._objects[0].type=="i-text"){
            var _textObj=_JC.cunterObj._objects[0];
            var _lineObj=_JC.cunterObj._objects[1]; 
        }else{
            var _textObj=_JC.cunterObj._objects[1];
            var _lineObj=_JC.cunterObj._objects[0];
        }

        $(".attriblute").css("display","block");
        $(".setPictureBox").css("display","none");  
        $(".productBox").css("display","none");
        $("input[name=objWidth]").val(parseInt(_JC.cunterObj.width));
        $("input[name=objHeight]").val(parseInt(_JC.cunterObj.height));
        $("input[name=objLeft]").val(parseInt(_JC.cunterObj.left));
        $("input[name=objTop]").val(parseInt(_JC.cunterObj.top));
        
        if (_JC.undoGroupSource==null){
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex);
        }else{
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex-_JC.editGroupZindex);
        }
        
        if (_JC.cunterObj.zIndex>_JC.minLayer+1){
            $("#layerToBackward").removeClass("noneClick");
            $("#layerToBottom").removeClass("noneClick");
        }else{
            //$("#layerToBackward").addClass("noneClick");
            //$("#layerToBottom").addClass("noneClick");
        }

        //根据当前选择组件控制组件属性面板的图层操作按钮
        refreshLayerToBtn(_JC.cunterObj);

        $(".panelTitle").html("Underlined Price");
        $(".attribute-panel").hide();
        $(".textConfig").hide();
        $(".underlineTextConfig").show();
        $(".RevertBtn").addClass("noneClick");
        
        if (dType=="productPriceGroup"){
            $("input[name=objText]").removeAttr("disabled");
            $(".linkItemClass").hide();
        }
        
        //如果是商品组件就显示对应的dataFiled字段
        if (_JC.cunterObj.hasOwnProperty("dataFiled")){
            $("#textBoxAttributes-dataFiled").html(_JC.cunterObj.dataFiled);
        }else{
            $("#textBoxAttributes-dataFiled").html("");
        }
        
        //文本字体风格属性 是否加粗
        if (_textObj.fontWeight=="bold"){
            $(".layui-fontStyle.Bold").addClass("act");
            $(".layui-fontStyle.Regualar").removeClass("act");
        }else{
            $(".layui-fontStyle.Bold").removeClass("act");
            $(".layui-fontStyle.Regualar").addClass("act");
        }
        
        //是否正常斜体
        if (_textObj.fontStyle=="italic"){
            $(".layui-fontStyle.Italic").addClass("act");
        }else{
            $(".layui-fontStyle.Italic").removeClass("act");
        }
        
    
        $(".attribute-panel").hide();
        $(".underlineTextConfig").show();
        
        $(".underlineTextConfig").css("display","block");
        $(".setPictureBox").css("display","none");
        $(".rectBox").css("display","none");
        $(".productBox").css("display","none");
        $(".textConfig").css("display","none");
        $("input[name=objText]").val(_textObj.text);
        $("input[name=textColor]").val(_textObj.fill);

        $("input[name=textSize]").val(_textObj.fontSize);

        if (_textObj.hasOwnProperty("strokePt")){
            $("input[name=textStroke]").val(_textObj.strokePt);
        }else{
            var strokePt=unitConvertPt(_JC.paperSize.paperUnitToPx,_textObj.strokeWidth);
            //_JC.cunterObj.set({strokePt:strokePt});
            $("input[name=textStroke]").val(strokePt);
        }


        $("input[name=strokeColor]").val(_textObj.stroke);
        $("input[name=textWeight]").val(_textObj.fontWeight);
    
        //划线属性
        var _underlineColor=(_lineObj.stroke)?_lineObj.stroke:"";
        var _underlineStrokeWidth=(_lineObj.strokeWidth!=null)?_lineObj.strokeWidth:0;
        //$("input[name=filterDistance]").val(shadowOffset);
        $("input[name=underlineStrokeWidth]").val(_underlineStrokeWidth);
    
    
        var S0 = 'dd[lay-value='+ _textObj.fontFamily+']';
        $('select[name=\'textFont\']').siblings("div.layui-form-select").find('dl').find(S0).click();
        //如果是当前页原有设计字体未加载完处理
        $('select[name=\'textFont\']').siblings("div.layui-form-select").find('dl').find(S0).removeClass("layui-disabled");
        
        var S1 = 'dd[lay-value='+ _textObj.textAlign+']';
        $('select[name=\'textAlign\']').siblings("div.layui-form-select").find('dl').find(S1).click();
    
        $("input[name=objWidth]").removeAttr("readonly").css("background-color","#ffffff");
        $("input[name=objHeight]").removeAttr("readonly").css("background-color","#ffffff");
        
        //当设计模式为MM/Template时，检查当前编辑分组是否为商品组件，是显示Label标签，否隐藏Label标签
        if (_JC.designModule!="component"){
            showEditGroupTool();
        }
        
    }

    
    //形状、SVG页面元素属性
    _JC.pageEvent.shapeAttributes=function(){
    
        $(".componentSelected").removeClass("noneClick");
        if (_JC.cunterObj.dType!="Product"){
            $(".RefreshBtn").addClass("noneClick");
        }
        
        //$(".savePage").hide();
        $(".saveBtn,.copyBtn").show();
        $(".saveBtn,.RefreshBtn").show();
        $("#objTitle").html(_JC.cunterObj.dType);
        
        //组件操作按钮
        $(".attribute-btn .componentSelected").addClass("noneClick");
        $(".attribute-btn .copyComponent").removeClass("noneClick");


        $(".attribute-btn .RevertBtn").removeClass("noneClick");
        $(".attribute-btn .deleteBtn").removeClass("noneClick");
        $(".attribute-btn .copyStyleBtn").hide().addClass("noneClick").removeClass("selected");
        
        $(".attribute-btn .GroupBtn").hide();
        if (_JC.undoGroupSource!=null){
            $(".attribute-btn .GroupBtn").find("i").removeClass("layui-icon-unlink").removeClass("layui-icon-link").addClass("layui-icon-ok");
            $(".attribute-btn .GroupBtn").removeClass("noneClick").attr("data","group").show();
        }
        
        $(".attribute-btn").show();
        $(".attribute-btn.qkey").hide();
        $(".attribute-btn.elementLever").show();
        $(".productPictureList").hide();
        
        //console.log(cunterObj);
        $(".attriblute").css("display","block");
        $(".setPictureBox").css("display","none");  
        $(".productBox").css("display","none");
        $("input[name=objWidth]").val(parseInt(_JC.cunterObj.width));// * active.scaleX
        $("input[name=objHeight]").val(parseInt(_JC.cunterObj.height));// * active.scaleY
        $("input[name=objLeft]").val(parseInt(_JC.cunterObj.left));
        $("input[name=objTop]").val(parseInt(_JC.cunterObj.top));
        // $("input[name=objzIndex]").val(_JC.cunterObj.zIndex);
        
        if (_JC.undoGroupSource==null){
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex);
        }else{
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex-_JC.editGroupZindex);
        }
        
        if (_JC.cunterObj.zIndex>_JC.minLayer+1){
            $("#layerToBackward").removeClass("noneClick");
            $("#layerToBottom").removeClass("noneClick");
        }else{
            //$("#layerToBackward").addClass("noneClick");
            //$("#layerToBottom").addClass("noneClick");
        }

        //根据当前选择组件控制组件属性面板的图层操作按钮
        refreshLayerToBtn(_JC.cunterObj);
        
        $(".textBox").css("display","none");
        $(".setPictureBox").css("display","none"); 
        $(".productBox").css("display","none");
        $(".rectBox").css("display","block");
        $("input[name=objWidth]").removeAttr("readonly");
        $("input[name=objWidth]").css("background-color","#ffffff");
        $("input[name=objHeight]").removeAttr("readonly");
        $("input[name=objHeight]").css("background-color","#ffffff");
        
        $("input[name=rectBackground]").val(_JC.cunterObj.fill);
        $("input[name=rectColor]").val(_JC.cunterObj.stroke);

        //$("input[name=rectStroke]").val(Math.ceil(_JC.cunterObj.strokeWidth));
        if (_JC.cunterObj.hasOwnProperty("strokePt")){
            $("input[name=rectStroke]").val(_JC.cunterObj.strokePt);
        }else{
            var strokePt=unitConvertPt(_JC.paperSize.paperUnitToPx,_JC.cunterObj.strokeWidth);
            _JC.cunterObj.set({strokePt:strokePt});
            $("input[name=rectStroke]").val(strokePt);
        }
        $("input[name=objScaleX]").val((_JC.cunterObj.scaleX * 100).toFixed(2));
        $("input[name=objScaleY]").val((_JC.cunterObj.scaleY * 100).toFixed(2));
        
        $(".panelTitle").html("Shape config");
        $(".attribute-panel").hide();
        
        //选中组件宽高值展示
        $(".productConfig .templateSizeBox .sizeWidth .number").html(parseInt(_JC.cunterObj.width) );
        $(".productConfig .templateSizeBox .sizeHeight .number").html(parseInt(_JC.cunterObj.height) );
        $(".copyComponent").removeClass("noneClick");
        $(".rectConfig").show();
    
    
        if (_JC.cunterObj.strokeDashArray){
          $("input[name=lineLen]").val(_JC.cunterObj.strokeDashArray[0]);
          $("input[name=lineSpace]").val(_JC.cunterObj.strokeDashArray[1]);
        }else{
          $("input[name=lineLen]").val(0);
          $("input[name=lineSpace]").val(0); 
        } 

        if (_JC.cunterObj.type=="rect"){
            $("input[name=rectRx]").val(_JC.cunterObj.rx);
            $("input[name=rectRy]").val(_JC.cunterObj.ry);
            $(".roundedCorners").show();
        }else{
            $(".roundedCorners").hide();
            $("input[name=rectRx]").val(0);
            $("input[name=rectRy]").val(0);
        }
        
        //特殊处理线条类型，不需要 Fill/Scale
        var hasFill=true;
        if (_JC.cunterObj.type=="polygon"){
            if (_JC.cunterObj.hasOwnProperty("points")){
                if (_JC.cunterObj.points.length<3){
                    hasFill=false;
                }
            }
        }
        if (hasFill){
            $("#shapeScale").click();
            $("#shapeScale,#shapeFill").removeClass("layui-hide");
        }else{
            $("#shapeStroke").click();
            $("#shapeScale,#shapeFill").addClass("layui-hide");
        }
    
        
        if (_JC.cunterObj.type!="rect"){
            $(".rectConfig.attribute-panel input[name=objWidth],.rectConfig.attribute-panel input[name=objHeight]").attr("readonly","true").css("background-color","#f9f9f9");
            $(".rectConfig.attribute-panel input[name=objWidth],.rectConfig.attribute-panel input[name=objHeight]").attr("unselectable","on");
        }else{
            $(".rectConfig.attribute-panel input[name=objWidth],.rectConfig.attribute-panel input[name=objHeight]").removeAttr("unselectable");
            $(".rectConfig.attribute-panel input[name=objWidth],.rectConfig.attribute-panel input[name=objHeight]").removeAttr("readonly").css("background-color","#fff");
        }
    
        //当设计模式为MM/Template时，检查当前编辑分组是否为商品组件，是显示Label标签，否隐藏Label标签
        if (_JC.designModule!="component"){
            showEditGroupTool();
        }
    
    }
    
    //图片类页面元素属性
    _JC.pageEvent.pictureAttributes=function(){
    
        var dType=_JC.cunterObj.dType;
        var active=_JC.cunterObj;
        
        _JC.cunterObj.set({crossOrigin:'anonymous'});
        $(".replacePictureElement").show();
        $(".componentSelected").removeClass("noneClick");
        if (_JC.cunterObj.dType!="Product"){
            $(".RefreshBtn").addClass("noneClick");
        }
        
        //$(".savePage").hide();
        $(".saveBtn,.copyBtn").show();
        $(".saveBtn,.RefreshBtn").show();
        $("#objTitle").html(_JC.cunterObj.dType);
        
        //组件操作按钮
        $(".attribute-btn .componentSelected").addClass("noneClick");
        $(".attribute-btn .copyComponent").removeClass("noneClick");

        $(".attribute-btn .RevertBtn").removeClass("noneClick");
        $(".attribute-btn .deleteBtn").removeClass("noneClick");
        $(".attribute-btn .copyStyleBtn").hide().addClass("noneClick").removeClass("selected");
        
        $(".attribute-btn .GroupBtn").hide();
        if (_JC.undoGroupSource!=null){
            $(".attribute-btn .GroupBtn").find("i").removeClass("layui-icon-unlink").removeClass("layui-icon-link").addClass("layui-icon-ok");
            $(".attribute-btn .GroupBtn").removeClass("noneClick").attr("data","group").show();
        }
        
        $(".attribute-btn").show();
        $(".attribute-btn.qkey").hide();
        $(".attribute-btn.elementLever").show();
        
        $(".attriblute").css("display","block");
        $(".setPictureBox").css("display","none");  
        $(".productBox").css("display","none");
        $("input[name=objWidth]").val(parseInt(_JC.cunterObj.width));// * active.scaleX
        $("input[name=objHeight]").val(parseInt(_JC.cunterObj.height));// * active.scaleY
        $("input[name=objLeft]").val(parseInt(_JC.cunterObj.left));
        $("input[name=objTop]").val(parseInt(_JC.cunterObj.top));
        
        if (_JC.undoGroupSource==null){
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex);
        }else{
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex-_JC.editGroupZindex);
        }

        if (_JC.cunterObj.zIndex>_JC.minLayer+1){
            $("#layerToBackward").removeClass("noneClick");
            $("#layerToBottom").removeClass("noneClick");
        }else{
            //$("#layerToBackward").addClass("noneClick");
            //$("#layerToBottom").addClass("noneClick");
        }       

        //根据当前选择组件控制组件属性面板的图层操作按钮
        refreshLayerToBtn(_JC.cunterObj);

        
        $(".productPictureList").hide();
        
        $(".panelTitle").html("Picture config");
        $(".attribute-panel").hide();
        $(".pictureConfig").show();
        $("#elementPicture").html("Select Picture");
        $("#elementPicture").attr("elementType","picture");
        
        $(".textBox").css("display","none");
        $(".setPictureBox").css("display","block"); 
        $(".rectBox").css("display","none");
        $(".productBox").css("display","none");
        $("input[name=objScaleX]").val((_JC.cunterObj.scaleX * 100).toFixed(2));
        $("input[name=objScaleY]").val((_JC.cunterObj.scaleY * 100).toFixed(2));
        
        $("input[name=objWidth]").attr("readonly","");
        $("input[name=objWidth]").css("background-color","#f7f7f7");
        $("input[name=objHeight]").attr("readonly","");
        $("input[name=objHeight]").css("background-color","#f7f7f7");

        //阴影属性
        var shadowOffset=(_JC.cunterObj.shadowOffset)?_JC.cunterObj.shadowOffset:0;
        var shadowBlur=(_JC.cunterObj.shadow!=null)?_JC.cunterObj.shadow.blur:0;
        var shadowAngle=(_JC.cunterObj.hasOwnProperty("shadowAngle"))?_JC.cunterObj.shadowAngle:0;
        $(".pictureConfig .roundShape").css("transform","rotate("+(shadowAngle)+"deg)").css("transform-origin","50% 50%");
        $("input[name=filterDistance]").val(shadowOffset);
        $("input[name=filterBlur]").val(shadowBlur);
        $(".angleNum").text(shadowAngle);

        //当设计模式为MM/Template时，检查当前编辑分组是否为商品组件，是显示Label标签，否隐藏Label标签
        if (_JC.designModule!="component"){
            showEditGroupTool();
        }


    }

    //图片ICON类页面元素属性
    _JC.pageEvent.iconElementAttributes=function(){
    
        var dType=_JC.cunterObj.dType;
        var active=_JC.cunterObj;
        
        _JC.cunterObj.set({crossOrigin:'anonymous'});
        $(".replacePictureElement").show();
        $(".componentSelected").removeClass("noneClick");
        if (_JC.cunterObj.dType!="Product"){
            $(".RefreshBtn").addClass("noneClick");
        }
        
        //$(".savePage").hide();
        $(".saveBtn,.copyBtn").show();
        $(".saveBtn,.RefreshBtn").show();
        $("#objTitle").html(_JC.cunterObj.dType);
        
        //组件操作按钮
        $(".attribute-btn .componentSelected").addClass("noneClick");
        $(".attribute-btn .copyComponent").removeClass("noneClick");
        
        $(".attribute-btn .RevertBtn").removeClass("noneClick");
        $(".attribute-btn .deleteBtn").removeClass("noneClick");
        $(".attribute-btn .copyStyleBtn").hide().addClass("noneClick").removeClass("selected");
        
        $(".attribute-btn .GroupBtn").hide();
        if (_JC.undoGroupSource!=null){
            $(".attribute-btn .GroupBtn").find("i").removeClass("layui-icon-unlink").removeClass("layui-icon-link").addClass("layui-icon-ok");
            $(".attribute-btn .GroupBtn").removeClass("noneClick").attr("data","group").show();
        }
        
        $(".attribute-btn").show();
        $(".attribute-btn.qkey").hide();
        $(".attribute-btn.elementLever").show();
        
        $(".attriblute").css("display","block");
        $(".setPictureBox").css("display","none");  
        $(".productBox").css("display","none");
        $("input[name=objWidth]").val(parseInt(_JC.cunterObj.width));// * active.scaleX
        $("input[name=objHeight]").val(parseInt(_JC.cunterObj.height));// * active.scaleY
        $("input[name=objLeft]").val(parseInt(_JC.cunterObj.left));
        $("input[name=objTop]").val(parseInt(_JC.cunterObj.top));
        
        if (_JC.undoGroupSource==null){
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex);
        }else{
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex-_JC.editGroupZindex);
        }

        if (_JC.cunterObj.zIndex>_JC.minLayer+1){
            $("#layerToBackward").removeClass("noneClick");
            $("#layerToBottom").removeClass("noneClick");
        }else{
            //$("#layerToBackward").addClass("noneClick");
            //$("#layerToBottom").addClass("noneClick");
        }       
        
        //根据当前选择组件控制组件属性面板的图层操作按钮
        refreshLayerToBtn(_JC.cunterObj);


        $(".productPictureList").hide();
        
        $(".panelTitle").html("Icon config");
        $("#elementPicture").html("Select Icon");
        $("#elementPicture").attr("elementType","icon");
        $(".attribute-panel").hide();
        $(".pictureConfig").show();
        
        $(".textBox").css("display","none");
        $(".setPictureBox").css("display","block"); 
        $(".rectBox").css("display","none");
        $(".productBox").css("display","none");
        $("input[name=objScaleX]").val((_JC.cunterObj.scaleX * 100).toFixed(2));
        $("input[name=objScaleY]").val((_JC.cunterObj.scaleY * 100).toFixed(2));
        
        $("input[name=objWidth]").attr("readonly","");
        $("input[name=objWidth]").css("background-color","#f7f7f7");
        $("input[name=objHeight]").attr("readonly","");
        $("input[name=objHeight]").css("background-color","#f7f7f7");
        
        //当设计模式为MM/Template时，检查当前编辑分组是否为商品组件，是显示Label标签，否隐藏Label标签
        if (_JC.designModule!="component"){
            showEditGroupTool();
        }
        
    }

    //打开指定选择窗
    _JC.pageEvent.openWindow=function(parm=null){

        if (parm!=null){
            if (parm.hasOwnProperty("type")){

                switch (parm.type){
                    //图片选择窗
                    case "Picture":

                        var index_page = layer.open({
                            type: 2
                            , title: 'Picture'
                            , id: 'marketingPicture'
                            , content: '/makroDigital/marketingElement/select/picture'
                            , area: ['1080px', '600px']
                            , btn: []
                            , yes: function (index, layero) {
                                var iframeWindow = window['layui-layer-iframe' + index],
                                    submitID = 'LAY-picture-Save-submit',
                                    submit = layero.find('iframe').contents().find('#' + submitID);

                                submit.trigger('click');
                            }
                        });
 
                    break;
                    case "IconElement":

                        var index_page = layer.open({
                            type: 2
                            , title: 'Picture'
                            , id: 'marketingPicture'
                            , content: '/makroDigital/marketingElement/select/icon'
                            , area: ['1080px', '600px']
                            , btn: []
                            , yes: function (index, layero) {
                                var iframeWindow = window['layui-layer-iframe' + index],
                                    submitID = 'LAY-picture-Save-submit',
                                    submit = layero.find('iframe').contents().find('#' + submitID);

                                submit.trigger('click');
                            }
                        });

                    break;
                }
            }
        }

    }
    
    //显示分组页面元素属性
    _JC.pageEvent.groupAttributes=function(){
        
        $(".panelTitle").html("Group");
        
        $(".attribute-btn").css("display","none");
        $(".attribute-btn.elementLever").show();
        
        $(".attribute-panel").hide();
        $(".composingConfig").hide();
        
        $(".elementLever").show();
        $("#layerToForward").removeClass("noneClick");
        $("#layerToBackward").removeClass("noneClick");
        $("#layerToTop").removeClass("noneClick");
        $("#layerToBottom").removeClass("noneClick");


        $(".productPictureList").hide();
        
        $(".GroupBtn").removeClass("noneClick");
        if (_JC.undoGroupSource!=null){
       
            $(".attribute-btn .RefreshBtn").addClass("noneClick");
            $(".attribute-btn .deleteBtn").addClass("noneClick");
            // $(".attribute-btn .LockBtn").addClass("noneClick");
            $(".attribute-btn .RevertBtn").addClass("noneClick");
            $(".attribute-btn .copyComponent").addClass("noneClick");
            $(".attribute-btn .copyStyleBtn").hide().addClass("noneClick").removeClass("selected");
            
            $(".GroupBtn").attr("data","group").show();
            $(".GroupBtn").find("i").removeClass("layui-icon-unlink").removeClass("layui-icon-link");
            $(".GroupBtn").find("i").addClass("layui-icon-ok");  

            // $(".attribute-btn.elementLever").hide();
        }else{
            
            $(".attribute-btn .RefreshBtn").removeClass("noneClick");
            $(".attribute-btn .deleteBtn").removeClass("noneClick");
            // $(".attribute-btn .LockBtn").removeClass("noneClick");
            $(".attribute-btn .RevertBtn").removeClass("noneClick");
            $(".attribute-btn .copyComponent").removeClass("noneClick");
            $(".attribute-btn .copyStyleBtn").hide().addClass("noneClick").removeClass("selected");
            
            $(".GroupBtn").find("i").addClass("layui-icon-unlink").removeClass("layui-icon-ok").addClass("layui-icon-link");
            $(".GroupBtn").attr("data","undo").show();
        } 

        //根据当前选择组件控制组件属性面板的图层操作按钮
        refreshLayerToBtn(_JC.cunterObj);
        
        //当设计模式为MM/Template时，检查当前编辑分组是否为商品组件，是显示Label标签，否隐藏Label标签
        if (_JC.designModule!="component"){
            showEditGroupTool();
        }
        
    }
    
    //商品组件页面元素属性
    _JC.pageEvent.productAttributes=function(){
      
        var cunterObj=_JC.cunterObj;        
        var dType=cunterObj.dType;
        var active=cunterObj;
        
        $(".componentSelected").removeClass("noneClick");
        if (cunterObj.dType!="Product"){
            $(".RefreshBtn").addClass("noneClick");
        }
        
        //$(".savePage").hide();
        $(".saveBtn,.copyBtn").show();
        $(".saveBtn,.RefreshBtn").show();
        $("#objTitle").html(active.dType);
        
        //组件操作按钮
        $(".attribute-btn .componentSelected").addClass("noneClick");
        $(".attribute-btn .copyComponent").removeClass("noneClick");
        
        $(".attribute-btn .RefreshBtn").removeClass("noneClick");
        $(".attribute-btn .deleteBtn").removeClass("noneClick");
        $(".attribute-btn .GroupBtn").find("i").removeClass("layui-icon-ok").removeClass("layui-icon-link").addClass("layui-icon-unlink");
        $(".attribute-btn .GroupBtn").removeClass("noneClick").attr("data","undo").show();
        $(".attribute-btn .copyStyleBtn").hide().addClass("noneClick").removeClass("selected");
        
        $(".attribute-btn").show();
        $(".attribute-btn.qkey").hide();
        $(".attribute-btn.elementLever").show();
        $(".productPictureList").hide();
        
        //console.log(cunterObj);
        $(".attriblute").css("display","block");
        $(".setPictureBox").css("display","none");  
        $(".productBox").css("display","none");
        $("input[name=objWidth]").val(parseInt(active.width));// * active.scaleX
        $("input[name=objHeight]").val(parseInt(active.height));// * active.scaleY
        $("input[name=objLeft]").val(parseInt(active.left));
        $("input[name=objTop]").val(parseInt(active.top));
        // $("input[name=objzIndex]").val(active.zIndex);
    

        $(".panelTitle").html("Product config");
        $(".attribute-panel").hide();
   
        if (_JC.undoGroupSource==null){
            
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex);
            //关闭商品组标标签
            if (!$("#productElementTool").hasClass("layui-hide")){
                $("#layerTool").click();
            }
            $(".productConfig").show();
            $(".productConfig.attribute-panel.inputBox").show();
        
        }else{
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex-_JC.editGroupZindex);
            $(".productConfig").hide();
            $(".productConfig.attribute-panel.inputBox").hide();
        }

        if (_JC.cunterObj.zIndex>_JC.minLayer+1){
            $("#layerToBackward").removeClass("noneClick");
            $("#layerToBottom").removeClass("noneClick");
        }else{
            //$("#layerToBackward").addClass("noneClick");
            //$("#layerToBottom").addClass("noneClick");
        }       

        //根据当前选择组件控制组件属性面板的图层操作按钮
        refreshLayerToBtn(_JC.cunterObj);

    
        $(".textBox").css("display","none");
        $(".setPictureBox").css("display","none"); 
        $(".productBox").css("display","block");
        $(".rectBox").css("display","none");
        $("input[name=objPageSort]").val(active.dSort);
        $("input[name=testItemCode]").val(active.itemCode);
        $("input[name=objWidth]").attr("readonly","");
        $("input[name=objWidth]").css("background-color","#f7f7f7");
        $("input[name=objHeight]").attr("readonly","");
        $("input[name=objHeight]").css("background-color","#f7f7f7");
                
        //选中组件宽高值展示
        $(".productConfig .templateSizeBox .sizeWidth .number").html(parseInt(active.width));
        $(".productConfig .templateSizeBox .sizeHeight .number").html(parseInt(active.height));
        
        //当设计模式为MM/Template时，检查当前编辑分组是否为商品组件，是显示Label标签，否隐藏Label标签
        if (_JC.designModule!="component"){
            showEditGroupTool();
        }
        
    }
    
    //商品图片类页面属性 GoodsImage、Icon、Brand
    _JC.pageEvent.productPictureAttributes=function(){
        
        
        var dType=_JC.cunterObj.dType;
        
        $(".componentSelected").removeClass("noneClick");
        if (_JC.cunterObj.dType!="Product"){
            $(".RefreshBtn").addClass("noneClick");
        }
        
        //$(".savePage").hide();
        $(".saveBtn,.copyBtn").hide();
        $(".saveBtn,.RefreshBtn").hide();
        $("#objTitle").html(_JC.cunterObj.dType);
        
        //组件操作按钮
        $(".attribute-btn .componentSelected").addClass("noneClick");
        $(".attribute-btn .copyComponent").addClass("noneClick");
        
        $(".attribute-btn .RevertBtn").removeClass("noneClick");
        $(".attribute-btn .deleteBtn").removeClass("noneClick");
        $(".attribute-btn .copyStyleBtn").hide().addClass("noneClick").removeClass("selected");
        
        $(".productPictureList").hide();
        
        $(".attribute-btn .GroupBtn").hide();
        if (_JC.undoGroupSource!=null){
            $(".attribute-btn .GroupBtn").find("i").removeClass("layui-icon-unlink").removeClass("layui-icon-link").addClass("layui-icon-ok");
            $(".attribute-btn .GroupBtn").removeClass("noneClick").attr("data","group").show();
            
            $(".productPictureList").hide();
            
            //显示商品关联图片可切换图弹出层 && _JC.cunterObj.dSort!=null
            if (_JC.cunterObj.dType=="productPicture" && _JC.undoGroupSource.dSort!=null && _JC.designModule=="mm" ){
                

                
                var _objects=_JC.cunterObj._objects;
                for (var i=0;i<_objects.length;i++){
                    //屏蔽关联商品图片标签，不显示可替换图

                    if (_objects[i].dType=="previewPicture") {

                        if (_objects[i].bindItemCode!=null){
                            $(".productPictureList .replacePicture").remove();
                            var productRecordID=detailsDataSearchFiled({filed:"id",itemCode:_objects[i].bindItemCode});
                            var parm={value:_objects[i].bindItemCode,proID:productRecordID};
                            loadProductPictureList(_JC.cunterObj.dataFiled,parm);
                            $(".productPictureList").show();
                        }
                        if (_objects[i].picid!=null){
                            $(".productPictureList .replacePicture").remove();
                            var parm={value:_objects[i].picid};
                            loadProductPictureList(_JC.cunterObj.dataFiled,parm);
                            $(".productPictureList").show();
                        }
                        
                    }

                }

                if (_JC.cunterObj.dataFiled=="lk_goodsImage"){
                    $(".productPictureList .replacePicture").remove();
                }

            }
            
        }
        
        $(".attribute-btn").show();
        $(".attribute-btn.qkey").hide();
        $(".attribute-btn.elementLever").show();
        
        //console.log(cunterObj);
        $(".attriblute").css("display","block");
        $(".setPictureBox").css("display","none");  
        $(".productBox").css("display","none");
        $("input[name=objWidth]").val(parseInt(_JC.cunterObj.width));// * active.scaleX
        $("input[name=objHeight]").val(parseInt(_JC.cunterObj.height));// * active.scaleY
        $("input[name=objLeft]").val(parseInt(_JC.cunterObj.left));
        $("input[name=objTop]").val(parseInt(_JC.cunterObj.top));
        // $("input[name=objzIndex]").val(_JC.cunterObj.zIndex);
        
        if (_JC.undoGroupSource==null){
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex);
        }else{
            $("input[name=objzIndex]").val(_JC.cunterObj.zIndex-_JC.editGroupZindex);

                
            // San 2022-04-14
            var theScaleX=_JC.cunterObj.scaleX;
            var theScaleY=_JC.cunterObj.scaleY;
            var tmpObjects=_JC.cunterObj._objects;
            for (var t=0;t<tmpObjects.length-1;t++){
                if (tmpObjects[t].dType){
                    if (tmpObjects[t].dType=="previewPicture"){
                        var tmpImage=tmpObjects[t];
                        $(".productPictureList input[name=objWidth]").val(tmpImage.width);
                        $(".productPictureList input[name=objHeight]").val(tmpImage.height);
                        $(".productPictureList input[name=objScaleX]").val((tmpImage.scaleX * theScaleX * 100).toFixed(2));
                        $(".productPictureList input[name=objScaleY]").val( (tmpImage.scaleY * theScaleY * 100).toFixed(2));
                    }
                }
            }  

            
        }

        if (_JC.cunterObj.zIndex>_JC.minLayer+1){
            $("#layerToBackward").removeClass("noneClick");
            $("#layerToBottom").removeClass("noneClick");
        }else{
            //$("#layerToBackward").addClass("noneClick");
            //$("#layerToBottom").addClass("noneClick");
        }    
        
        //根据当前选择组件控制组件属性面板的图层操作按钮
        refreshLayerToBtn(_JC.cunterObj);


        $(".textBox").css("display","none");
        $(".setPictureBox").css("display","none"); 
        $(".productBox").css("display","none");
        $(".rectBox").css("display","none");
        
        $(".panelTitle").html("Image");
        $(".attribute-panel").hide();

        //处理关联商品标签设置
        $(".linkItemClass").hide();
        if (_JC.cunterObj.hasOwnProperty("dataFiled")==true){

            if ((_JC.cunterObj.dataFiled).substr(0,3)=="lk_"){
                $(".LinItemConfig,.LinItemConfig .linkItemClass").show();
                var lkSort=(_JC.cunterObj.hasOwnProperty("lkSort")==true)?_JC.cunterObj.lkSort:"";
                $(".LinItemConfig").find("input[name=lkSort]").val(lkSort);

                $(".LinItemConfig .lineItemPicture").remove();

                if (_JC.designModule=="mm" && _JC.undoGroupSource!=null && isEmpty(_JC.undoGroupSource.dSort)==false){
                    var _dSort=_JC.undoGroupSource.dSort;
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

                                var _Html='';
                                for (var i=0;i<lineItemArr.length;i++){
                                    var act=((i+1)==lkSort*1)?'act':'';
                                    _Html=_Html + '<img src="'+ lineItemArr[i].thumbnailPath +'" cmykOriginPath="'+lineItemArr[i].cmykOriginPath+'" rgbOriginPath="'+lineItemArr[i].rgbOriginPath+'" picid="" class="lkPic" style="'+act+'" data="'+(i+1)+'">';

                                }

                                if (_Html!=''){
                                    _Html='<div class="lineItemPicture">' + _Html + '</div>';
                                    $(".LinItemConfig").append(_Html);

                                }

                            }

                        }
                    }

                }


            }else{
                $(".linkItemClass").hide();
            }
        }else{
            $(".linkItemClass").hide();
        }

        //选中组件宽高值展示
        $(".productConfig .templateSizeBox .sizeWidth .number").html(parseInt(_JC.cunterObj.width) );
        $(".productConfig .templateSizeBox .sizeHeight .number").html(parseInt(_JC.cunterObj.height) );
        
        //当设计模式为MM/Template时，检查当前编辑分组是否为商品组件，是显示Label标签，否隐藏Label标签
        if (_JC.designModule!="component"){
            showEditGroupTool();
        }
        
    }
    
    //编辑分组
    _JC.pageEvent.editGroup=function(){
        
        var activeToolID=$("#componentTool").parent().find(".layui-this").eq(0).attr("id");
        $("#componentTool").parent().attr("activeToolID",activeToolID);
        
        $(".pageButton.componentSelected").addClass("noneClick");
        $(".GroupBtn").attr("data","group").removeClass("noneClick");
        $(".GroupBtn").find("i").removeClass("layui-icon-unlink").removeClass("layui-icon-link");
        $(".GroupBtn").find("i").addClass("layui-icon-ok");
        $(".productPictureList").hide();
        
        //顶部导航 页面操作按钮 禁用
        $(".newPage").addClass("noneClick");
        $(".disPage").addClass("noneClick");
        // $(".prePage").addClass("noneClick");
        // $(".nextPage").addClass("noneClick");
        $(".RefreshPage").addClass("noneClick");
        $(".deletePage").addClass("noneClick");

        //禁用刷新MM商品清单按钮
        $(".reloadDetails").addClass("noneClick");
        
        //禁用切换页面按钮
        $(".pageButton.nextPage,.pageButton.prePage").addClass("forbidClick");

        $(".copyPage").addClass("noneClick");
        $(".importPage").addClass("noneClick");
        $(".preview").addClass("noneClick");
        //$(".pageLevel").addClass("noneClick");
        
        //禁用保存按钮
        $("#saveComponent").addClass("noneClick");

        //编辑分组时 屏蔽穿透分组选择工具
        $("#mouseGroupBtnTool").addClass("noneClick");


        
        //副本按钮
        $(".helpIcon").addClass("noneClick");
        $(".attribute-btn .copyStyleBtn").hide().addClass("noneClick").removeClass("selected");
        //如果该分组是商品组件，左则显示商品Label标签
        if (_JC.cunterObj.dType=="Product"){
            
            //左则Tab栏是否有加载Label，没有就请求生成
            $("#componentTool").parent().find("li").removeClass("layui-this");
            $("#component").removeClass("layui-show");
            $("#tabContent > div").removeClass("layui-show");
            $("#componentTool,#component").addClass("layui-hide");//,#layerTabContent
            
            $("#productElementTool,#productElement").removeClass("layui-hide");
            $("#productElementTool").addClass("layui-this");
            $("#productElement").addClass("layui-show");
            
            
            //如果是已邦定mm Sort的商品组件，过滤该商品dataFiled值为空的Label，进行隐藏
            if (_JC.designModule=="mm"){

                
                if (isEmpty(_JC.cunterObj.dSort)==false){
                    
                    var _dSort=_JC.cunterObj.dSort;
                    var _dSortArr=_dSort.split("-");

                    if (isEmpty(mmDetailsData[_dSortArr[0] *1-1])==false && isEmpty(mmDetailsData[_dSortArr[0] *1-1][_dSortArr[1]])==false){

                        //当前商品dataFiled数组
                        var theProductDetails=mmDetailsData[_dSortArr[0]*1-1][_dSortArr[1]];
                        //console.log(theProductDetails);
                        var keyArr=[];
                        for (var k in theProductDetails){

                                if (isEmpty(theProductDetails[k])==false){
                                    if (["icon1","icon2","icon3"].indexOf(k)==-1){
                                        keyArr.push(k);
                                    }else{
                                        if ( isEmpty(theProductDetails[k])==false && (theProductDetails[k]==null || typeof(theProductDetails[k])=="object" ) ){
                                            keyArr.push(k);
                                        }
                                    }
                                }
                            
                        }
                    }

                    if (isEmpty(theProductDetails)==false){
                        
                        //获取所有商品组件标签Label
                        $("#productElement .layui-colla-content .insertElement").each(function(){
                            
                            //Label
                            var labelBox=$(this).parent().parent();
                            $(labelBox).removeClass("layui-hide");
                            var labelDataFiled=$(this).attr("dataFiled");
                            var dType=$(this).attr("dType");
                            // var tmpObjects=canvas.getActiveObject()._objects;
                                //改为展开所有标签
                            var tmpObjects=[];
                            if (keyArr.indexOf(labelDataFiled)>-1){
                                
                                if (dType=="productNormalText"){
                                    
                                    if (isEmpty(labelDataFiled)==false  && theProductDetails.hasOwnProperty(labelDataFiled)){
                                        $(labelBox).removeClass("layui-hide");
                                    }else{
                                        $(labelBox).addClass("layui-hide");
                                    }
                                    
                                    
                                }else if (dType=="productPicture"){
                                    
                                    if (labelDataFiled=="goodsImage"){
                                    
                                        for (var j=0;j<tmpObjects.length;j++){
                                            if (tmpObjects[j].dataFiled=="goodsImage"){
                                                $(labelBox).addClass("layui-hide");
                                                break;
                                            }
                                        }
                                        
                                    }else if (labelDataFiled=="icon1" || labelDataFiled=="icon2" || labelDataFiled=="icon3"){
                                        $(labelBox).removeClass("layui-hide");
                                    }
                                    
                                    
                                }
                            
                            }else{
                                $(labelBox).addClass("layui-hide");
                            }

                            //关联商品标签都显示
                            if (labelDataFiled.substr(0,3)=="lk_"){
                                $(labelBox).removeClass("layui-hide");
                            }

                        });
                        
                        
                    }else{
                        //商品数据异常
                        $("#productElement").addClass("layui-hide");
                    }
                }


            }else if (_JC.designModule=="template"){
                
                
                        //获取所有商品组件标签Label
                        $("#productElement .layui-colla-content .insertElement").each(function(){
                            
                            //Label
                            var labelBox=$(this).parent().parent();
                            $(labelBox).removeClass("layui-hide");
                            var labelDataFiled=$(this).attr("dataFiled");
                            var dType=$(this).attr("dType");
                            // var tmpObjects=canvas.getActiveObject()._objects;
                                //改为展示所有商品组件标签
                            var tmpObjects=[];
                            
                                
                                if (dType=="productNormalText"){
                                    
                                    $(labelBox).removeClass("layui-hide");
                                    
                                }else if (dType=="productPicture"){
                                    
                                    if (labelDataFiled=="goodsImage"){
                                    
                                        for (var j=0;j<tmpObjects.length;j++){
                                            if (tmpObjects[j].dataFiled=="goodsImage"){
                                                $(labelBox).addClass("layui-hide");
                                                break;
                                            }
                                        }
                                        
                                    }else if (labelDataFiled=="brand"){
                                        $(labelBox).removeClass("layui-hide");
                                    }
                                    
                                    
                                }
                            
                         $(labelBox).removeClass("layui-hide");
                        });
                        
            }
            
            
        }else if (_JC.cunterObj.dType=="tmpGroup"){
            
            if (!$("#elementTool").hasClass("layui-this")){

                $("#layerTool").click();

            }
            $("#componentTool").addClass("layui-hide");

   
        }

        $("#selectComponent").click();
        $(".attribute-btn.elementLever").hide();
        $(".productConfig.attribute-panel.inputBox").hide();

        //当设计模式为MM/Template时，检查当前编辑分组是否为商品组件，是显示Label标签，否隐藏Label标签
        if (_JC.designModule!="component"){
            showEditGroupTool();
        }


    }
    
    
    //选择对象创建组页面元素事件
    _JC.pageEvent.composeGroup=function(){
        $(".GroupBtn i").attr("data","undo");
        $(".GroupBtn i").addClass("layui-icon-unlink");
        $(".GroupBtn i").removeClass("layui-icon-ok");
        $(".productPictureList").hide();
        
        //顶部导航 页面操作按钮 禁用
        if (_JC.canvasConfig.isMorePagesDraw==false){
            $(".newPage").removeClass("noneClick");
            $(".deletePage").removeClass("noneClick");
            $(".copyPage").removeClass("noneClick");
        }

        $(".disPage").removeClass("noneClick");
        $(".RefreshPage").removeClass("noneClick");
        $(".importPage").removeClass("noneClick");
        $(".preview").removeClass("noneClick");
        $(".pageLevel").removeClass("noneClick");

        //切换页面按钮启用
        $(".pageButton.nextPage,.pageButton.prePage").removeClass("forbidClick");
        

        //启用刷新MM商品清单按钮
        $(".reloadDetails").removeClass("noneClick");
        
        //启用保存按钮
        $("#saveComponent").removeClass("noneClick");
   
        //分组后取消屏蔽穿透分组选择工具
        $("#mouseGroupBtnTool").removeClass("noneClick");


        //副本按钮
        $(".helpIcon").removeClass("noneClick");
        $(".attribute-btn .copyStyleBtn").hide().addClass("noneClick").removeClass("selected");
        //如果该分组是商品组件，左则显示商品Label标签
        if (_JC.undoGroupSource!=null){
            if (_JC.undoGroupSource.dType=="Product"){
                
                //左则Tab栏是否有加载Label，没有就请求生成
                
                $("#componentTool,#component").removeClass("layui-hide");
                var activeToolID=$("#componentTool").parent().attr("activeToolID");
   
                if (!isEmpty(activeToolID)){
                    $("#" + activeToolID).parent().find("li").removeClass("layui-this");
                    $("#componentTool").removeClass("layui-this");
                    $("#component").removeClass("layui-show");
                    $("#" + activeToolID).click();
                }else{
                    $("#componentTool").addClass("layui-this");
                    $("#component").addClass("layui-show");
                    $("#componentTool").click();
                }
                
                $("#productElementTool,#productElement").addClass("layui-hide");
                $("#productElementTool").removeClass("layui-this");
                $("#productElement").removeClass("layui-show");                
                
                
                
            }else if (_JC.undoGroupSource.dType=="tmpGroup"){

                if (!$("#elementTool").hasClass("layui-this") && !$("#layerTool").hasClass("layui-this")){
                    $("#layerTool").click();
                }
            }        

        }else{

            if (_JC.cunterObj.dType=="tmpGroup"){

                $("#componentTool").removeClass("layui-hide");
                
            }else if (_JC.cunterObj.dType=="Product"){
                
                $("#elementTool").removeClass("layui-this");
                $("#element").removeClass("layui-show");  
                $("#componentTool,#component").removeClass("layui-hide");
                var activeToolID=$("#componentTool").parent().attr("activeToolID");
                if (!isEmpty(activeToolID)){
                    $("#" + activeToolID).parent().find("li").removeClass("layui-this");
                    $("#componentTool").removeClass("layui-this");
                    $("#component").removeClass("layui-show");
                    $("#" + activeToolID).click();
                }else{
                    $("#componentTool").addClass("layui-this");
                    $("#component").addClass("layui-show");
                    $("#componentTool").click();
                }
                
                
                // $("#componentTool").addClass("layui-this").removeClass("layui-hide");
                // $("#component").removeClass("layui-hide").addClass("layui-show");
                
                $("#productElementTool,#productElement").addClass("layui-hide");
                $("#productElementTool").removeClass("layui-this");
                $("#productElement").addClass("layui-hide");
                
            }
            
        }

        //当设计模式为MM/Template时，检查当前编辑分组是否为商品组件，是显示Label标签，否隐藏Label标签
        if (_JC.designModule!="component"){
            showEditGroupTool();
        }

    }
    
    //框选多组件页面元素事件
    _JC.pageEvent.selectedMultiple=function(){
  
        var dblclickTimestamp=0;
        if (_JC.selectedObject.length>1){ 

            $(".panelTitle").html("Typesetting");
            $(".attribute-btn .copyComponent").removeClass("noneClick");
            
            $(".attribute-btn .RefreshBtn").addClass("noneClick");
            $(".attribute-btn .deleteBtn").removeClass("noneClick");
            $(".attribute-btn .LockBtn").removeClass("noneClick");
            $(".attribute-btn").css("display","none");
            $(".attribute-btn.elementLever").show();
            
            $(".attribute-panel").hide();
            $(".attribute-btn .copyStyleBtn").hide().addClass("noneClick").removeClass("selected");
            
            $(".elementLever").hide();
            $(".productPictureList").hide();
            
            // $(".attribute-btn .LockBtn").find("i").css("color","#666666");
            $(".GroupBtn").removeClass("noneClick");
            if (_JC.undoGroupSource!=null){
                $(".GroupBtn").attr("data","group").show();
                $(".GroupBtn").find("i").removeClass("layui-icon-unlink").removeClass("layui-icon-link");
                $(".GroupBtn").find("i").addClass("layui-icon-ok");
            }else{
                $(".GroupBtn").find("i").removeClass("layui-icon-unlink").removeClass("layui-icon-ok").addClass("layui-icon-link");
                $(".GroupBtn").attr("data","group").show();
            }    

            $(".composingConfig").show();

            $(".preViewMoreFont").find("select[name=textFont]").parent().find(".layui-input.layui-unselect").attr("placeholder","select");

            //穿透选择模式不允许对组件锁定
            /*if (!_JC.isPixSelect){
                $(".attribute-btn .LockBtn").addClass("noneClick");
                $(".attribute-btn .LockBtn").find("i").css("color","#eee");
            }*/

            //处理框选多个组件时，如果包含有商品组件，禁用分组功能
            if (_JC.selectedObject.length>1){
                var isGroup=true;
                for (var i=0;i<_JC.selectedObject.length;i++){
                    if (_JC.selectedObject[i].dType=="Product" || _JC.selectedObject[i].dType=="tmpGroup"){
                        isGroup=false;
                    }
                }
                if(isGroup==false || _JC.isPixSelect==false){
                    $(".GroupBtn").addClass("noneClick");
                }else{
                    $(".GroupBtn").removeClass("noneClick");
                }
            }                    
            
            //处理框选中的元件都是文本或都是shape，实现统一修改 属性 aaa
            if (_JC.selectedObject.length>1){

                var shapeType=["path","rect","circle","polygon"];
                var textType=["textbox","i-text"];
                var dTypeName=[];
                for (var i=0;i<_JC.selectedObject.length;i++){
                 
                    if (_JC.selectedObject[i].hasOwnProperty("type")){
       
                        if (shapeType.indexOf(_JC.selectedObject[i].type)>-1){
                            if (dTypeName.indexOf("shape")==-1){
                                dTypeName.push("shape");
                            }
                        }else if (textType.indexOf(_JC.selectedObject[i].type)>-1){
                            if (dTypeName.indexOf("text")==-1){
                                dTypeName.push("text");
                            }
                        }

                    }
                }
                console.log(dTypeName);
                $(".moreSetText").hide();
                if (!isEmpty(dTypeName)){
                    //代表本次框选元件都是统一类型，可以进行统一属性设置，在这显示该类型属性面板
                    
                        if (dTypeName.indexOf("text")>-1){
                            $(".moreSetText").show();
                          
                            //检查所选的多个文本框字体、颜色、对齐、边框、阴影、背景色是否一至，如果不同即显示 "-"
                            var _textColor="";
                            var _textSize="";
                            var _fontFamily="";
                            var _strokeWidth="";
                            var _stroke="";
                            var _textAlign="";
                            var _textStyle="";
                            var _textBgColor="";
                            var _textShawColor="";
                            for (var i=0;i<_JC.selectedObject.length;i++){

                                if (_textColor==""){
                                    _textColor=_JC.selectedObject[i].fill;
                                }
                                if (_textColor!="-1" && _textColor!=_JC.selectedObject[i].fill){
                                    _textColor="-1";
                                }

                                if (_textSize==""){
                                    _textSize=_JC.selectedObject[i].fontSize;
                                }
                                if (_textSize!="-1" && _textSize!=_JC.selectedObject[i].fontSize){
                                    _textSize="-1";
                                }

                                if (_fontFamily==""){
                                    _fontFamily=_JC.selectedObject[i].fontFamily;
                                }
                                if (_fontFamily!="-1" && _fontFamily!=_JC.selectedObject[i].fontFamily){
                                    _fontFamily="-1";
                                }

                                if (_strokeWidth==""){
                                    _strokeWidth=_JC.selectedObject[i].strokeWidth;
                                }
                                if (_strokeWidth!="-1" && _strokeWidth!=_JC.selectedObject[i].strokeWidth){
                                    _strokeWidth="-1";
                                }

                                if (_stroke==""){
                                    _stroke=_JC.selectedObject[i].stroke;
                                }
                                if (_stroke!="-1" && _stroke!=_JC.selectedObject[i].stroke){
                                    _stroke="-1";
                                }

                                if (_textShawColor==""){
                                    if (_JC.selectedObject[i].hasOwnProperty("shadowColor")){
                                       _textShawColor=_JC.selectedObject[i].shadowColor; 
                                    }
                                }
                                if (_JC.selectedObject[i].hasOwnProperty("shadowColor")){   
                                    if (_textShawColor!="-1" && _textShawColor!=_JC.selectedObject[i].shadowColor){
                                        _textShawColor="-1";
                                    }
                                }


                            }

                            //多组件文字颜色
                            _CMYK.createCmykColor({
                                elem:'more-test-form',
                                color:_textColor,
                                cmyk:"",
                                hex:"",
                                colorType:'fill'
                            });
                            if (_textColor=="-1"){
                                $("#more-test-form").find(".disColor").html("?");
                            }else{
                                $("#more-test-form").find(".disColor").html("");
                            }

                            //多组件文字大小
                            _textSize=(_textSize=="-1")?"?":_textSize;
                            $(".moreSetText input[name=textSize]").val(_textSize);

                            if (_fontFamily=="-1"){
                                $(".preViewMoreFont").find("select[name=textFont]").parent().find(".layui-input.layui-unselect").val("?");
                            }

                            //多组件边框大小
                            _strokeWidth=(_strokeWidth=="-1")?"?":_strokeWidth;
                            $(".moreSetText input[name=moreTextStroke]").val(_strokeWidth);

                            //多组件边框颜色
                            _CMYK.createCmykColor({
                                elem:'moreTextStrokeColor-form',
                                color:_stroke,
                                cmyk:"",
                                hex:"",
                                colorType:'stroke'
                            });
                            if (_stroke=="-1"){
                                $("#moreTextStrokeColor-form").find(".disColor").html("?");
                            }else{
                                $("#moreTextStrokeColor-form").find(".disColor").html("");
                            }

                            $(".moreSetText").find(".layui-fontStyle").removeClass("act");

                            //多组件阴影颜色
                            _CMYK.createCmykColor({
                                elem:'moreShadow-form',
                                color:"",
                                cmyk:"",
                                hex:"",
                                colorType:'shadowColor'
                            });
                            if (_textShawColor=="-1"){
                                $("#moreShadow-form").find(".disColor").html("?");
                            }else{
                                $("#moreShadow-form").find(".disColor").html("");
                            }


                            //多组件背景颜色
                            _CMYK.createCmykColor({
                                elem:'moreTextBackgroundColor-form',
                                color:"",
                                cmyk:"",
                                hex:"",
                                colorType:'backgroundColor'
                            });
                            if (_textShawColor=="-1"){
                                $("#moreTextBackgroundColor-form").find(".disColor").html("?");
                            }else{
                                $("#moreTextBackgroundColor-form").find(".disColor").html("");
                            }

                        }

                        if (dTypeName.indexOf("shape")>-1){

                        }

                  

                }


            }
            
            
        }else if (_JC.selectedObject.length==1){
            //选中一个对象
            $(".elementLever").show();
            $(".GroupBtn").hide();
            _JC.cunterObj=_JC.selectedObject[0];
        } 
        
        
        
        
    }
    
    //显示页面背景
    _JC.pageEvent.showBackgroundImage=function(){
        
        $(".attribute-panel").hide();
        $(".attribute-btn").hide();
        $(".pageConfig").show();
        $(".componentSelected").addClass("noneClick");
        $(".panelTitle").html("Page config");
        $(".attribute-btn .copyStyleBtn").hide().addClass("noneClick").removeClass("selected");
        $(".productPictureList").hide();
        
        //刷新页面属性面板 背景显示图
        if ($(".preViewPageBackground img").length>0){

            var canvasObjects = canvas.getObjects();
            if (canvasObjects.length>0){   
                var bgImg = _JC.canvasDraw().searchObject({ id: "BackgroundImage" }, canvasObjects);
                var bgPic="";
                if (!isEmpty(bgImg)){    
                    if (bgImg.dType=="BackgroundImage"){
                        if ($(".preViewPageBackground img").attr("src")!=bgImg.src ){
                            bgPic=bgImg.src;
                            $(".pageConfig .pictureSizeBox .sizeWidth .number").html(bgImg.width);
                            $(".pageConfig .pictureSizeBox .sizeHeight .number").html(bgImg.height);
                        }
                    }
                    $(".pictureSizeBox,.pageConfig .rowTitle.originalImageInfo").show();
                    $(".preViewPageBackground img").attr("src",bgPic);

                    if (!bgImg.lockMovementX){
                        $("#LockBackgroundImage").html("Lock Background");
                    }else{
                        $("#LockBackgroundImage").html("Unlock Background");
                    }

                }
            }
        }    
        //防止分组编辑状态清空当前配置对象
        if (_JC.undoGroupSource==null){
            //_JC.cunterObj=null;
            _JC.selectedObject=null
        }
        
        //当设计模式为MM/Template时，检查当前编辑分组是否为商品组件，是显示Label标签，否隐藏Label标签
        if (_JC.designModule!="component"){
            showEditGroupTool();
        }
        
    }

    //
    _JC.pageEvent.refreshLevel=function(parm,callback){

        //是否刷新图层窗口
        if (levelWindow!=null){
            setTimeout(function() {
                levelWindow.loadLayer();
            }, 1000);                    
        }
        
    }

    //在画布浮动标示信息
    _JC.pageEvent.showAttributesTip=function (mode,pointer,msgText) {
        
        if (mode==1){
            if ($("#showAttributesTip").length<1){
                $("#draw-wrapper").append("<div id='showAttributesTip' style='left:"+pointer.x+"px;top:"+pointer.y+"px'>" + msgText + "</div>");
            }else{
                $("#showAttributesTip").html(msgText);
            }
        }else{
            $("#showAttributesTip").remove();
        }
    }


    //提示框
    _JC.pageEvent.errMsg=function (msgText) {
        layer.msg(msgText);
    }
    
}

//图片压缩 
function compress(base64String, w, quality) {
    var getMimeType = function(urlData) {
        var arr = urlData.split(',');
        var mime = arr[0].match(/:(.*?);/)[1];
        // return mime.replace("image/", "");
        return mime;
    };
    var newImage = new Image();
    var imgWidth, imgHeight;
    var promise = new Promise(resolve => newImage.onload = resolve);
    newImage.src = base64String;
    return promise.then(() => {
        imgWidth = newImage.width;
        imgHeight = newImage.height;
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        if (Math.max(imgWidth, imgHeight) > w) {
            if (imgWidth > imgHeight) {
                canvas.width = w;
                canvas.height = w * imgHeight / imgWidth;
            } else {
                canvas.height = w;
                canvas.width = w * imgWidth / imgHeight;
            }
        } else {
            canvas.width = imgWidth;
            canvas.height = imgHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(newImage, 0, 0, canvas.width, canvas.height);
        var base64 = canvas.toDataURL(getMimeType(base64String), quality);
 
        return base64;
    });
}

//图片上传初始化
function uploadImageInit(elem, success, fail) {
    console.log(api('file.uploadImage').file.exts);
    var files = {};
    var clearUploadFile = function(files) {

        for (var x in files) {
            delete files[x];
        }
    };

    return layui.upload.render({
        elem: elem,
        url: getApiUrl('file.uploadImage'),
        method: getApiMethod('file.uploadImage'),
        field: api('file.uploadImage').file.field,
        headers: {
            'Authorization': 'Bearer ' + storage.access_token
        },
        data: {
            limit: 1500, // 限制最长边1500px
        },
        accept: 'file',
        exts: (api('file.uploadImage').file.exts + '|svg'),
        multiple: true,
        drag: false,
        choose: function(obj) {
            clearUploadFile(files);
            //将每次选择的文件追加到文件队列
            files = obj.pushFile();
            //console.log(obj);
        },
        before: function(obj) {
            layer.load(); // 打开loading

        },
        done: function(res, index, upload) {
            layer.closeAll('loading'); // 关闭loading
            if (res.code === '0000') {
                var file = files[index];
                delete files[index];
                success && success(res.data, file);
            } else {
                fail && fail(res.msg);
            }
        },
        error: function() {
            layer.msg('upload error', {icon: 5});
            clearUploadFile(files);
        }
    });
}

function langRender(ele,langData){


    $.each(ele, function(index, value) {
        var langCode=($(ele[index]).attr("data-langCode"));
        var renderType=($(ele[index]).attr("data-renderType"));
        if (!isEmpty(langCode) && !isEmpty(renderType)){

            var langValue=langTransform(langCode,langData);
            switch (renderType)
            {
                case "1":
                    $(ele[index]).html(langValue);
                break;
                case "2":
                    $(ele[index]).attr("title",langValue);
                break;
                case "3":
                    $(ele[index]).attr("alt",langValue);
                break;
            }
        }

    });    

}

function langTransform(code,langData){
    if (langData.hasOwnProperty(code)){
        return langData[code];
    }else{
        return "";
    }
}


function drawPictureInsertElement(filePath){

    var parm={x:CenterCoord().x,y:CenterCoord().y,filePath:filePath,dType:"Picture"};
    _JC.componentDraw().insertPicture(parm,function(){

        if (_JC.cunterObj!=null){ 
            var _offW=_JC.cunterObj.width * _JC.cunterObj.scaleX * 0.5;
            var _offH=_JC.cunterObj.height * _JC.cunterObj.scaleY * 0.5;
            _JC.cunterObj.set({left:(_JC.cunterObj.left - _offW),top:(_JC.cunterObj.top - _offH),selectable:true,dType:"Picture"});
            canvas.renderAll();
        }

    });

}

function CenterCoord(){
   var zoom=canvas.getZoom(); 
   return{
      x:fabric.util.invertTransform(canvas.viewportTransform)[4]+(canvas.width/zoom)/2,
      y:fabric.util.invertTransform(canvas.viewportTransform)[5]+(canvas.height/zoom)/2
   }
}



function penCanvasInit(){
    
    var canvasWidth=$("#draw-wrapper canvas").width();
    var canvasHeight=$("#draw-wrapper canvas").height();
    $(".drawShapeCanvas canvas").css({width:canvasWidth,height:canvasHeight});
    $(".drawShapeCanvas").hide();
    //penCanvas =document.getElementById("penCanvas");
    $("#penCanvas").parent().css({width:canvasWidth,height:canvasHeight});



    penCanvas.on('mouse:down', function (option) {


        console.log(option);
        if (option.target != null) {
            console.log("A");
            return;
        } else {
            console.log(option);
            var startY = option.absolutePointer.y,
                startX = option.absolutePointer.x;

            console.log(startX, startY);

            var rect2 = new fabric.Rect({
                top : startY,
                left : startX,
                width : 10,
                height : 10,
                fill : 'transparent',
                stroke: 'red',
                strokewidth: 4
            });

            //penCanvas.add(rect2);
            //penCanvas.renderAll();
            canvas.add(rect2).setActiveObject(rect2).renderAll();

            console.log("added");
            // penCanvas.on('mouse:move', function (option) {
            //     var e = option.e;
            //     rect2.set('width', e.offsetX - startX);
            //     rect2.set('height', e.offsetY - startY);
            //     rect2.saveState();

            // });



        }
    });


   penCanvas.on('mouse:up', function () {
        penCanvas.off('mouse:move');
        penCanvas.renderAll();
    });

}



