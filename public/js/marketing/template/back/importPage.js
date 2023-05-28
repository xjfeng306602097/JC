/**

 @Name：makro 
 @Author：makro
 @Site：http://mm.makrogo.com/makroDigital/marketingElement/select
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'layer','laypage','laydate','table'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,form = layui.form
        ,laydate=layui.laydate
        ,laypage=layui.laypage
        ,table = layui.table
        ,layer = layui.layer;
    
    var now = new Date(),
        year = now.getFullYear(),
        month = now.getMonth() + 1,
        day = now.getDate();
    laydate.render({
        elem: '#createDate'
        ,range: true
        ,value: ''
        ,trigger: 'click'
        ,min: '2021-01-01'
        ,max: year + '-' + month + '-' + day
        ,lang: 'en'
    });
    
    var storage=parent.storage;   
    
    //弹出窗可操作区域高度
    var windowHeight=window.innerHeight;
    $(".pictureList").css("height",(windowHeight-100) + "px");
    var imgHeight=windowHeight-100;
    
    //请求加载的模板集
    var browseTemplateData=[];
    
    //已选择的模板页面 
    var choosesPages=[];
    
    //各副本预临图片数组对象 pageMap[sort]={"No","","sort":"","Pic":"base64"};
    var pageMap=[];
    
    //引入父窗口_JC
    var _JC=parent._JC;
    
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


    //模板搜索入参
    var current_isDelete = 0,
        current_name = '',
        current_begin = undefined,
        current_end = undefined;
        
    function getMarketingTemplateList(){
        table.render({
            id: 'marketingTemplateTable'
            ,elem: '#content-marketingTemplate-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('marketing.template.page')
            ,method: getApiMethod('marketing.template.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,parseData: function(res) {
                if (res.code==="0000"){
                    return {
                        code: 0,
                        count: res.data.totalElements,
                        data: res.data.content
                    }
                }
            }
            ,cols: [[
                {width: 80, title: 'Serial', type: 'numbers'}
                ,{field:'name', title: 'Template Name', sort: true}
                ,{width: 88, title: 'Browse', templet: '#content-marketingTemplate-list-browse'}
            ]],
            where: {
                isDelete: current_isDelete,
                name: current_name,
                begin: current_begin,
                end: current_end,
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200]
        });
    } 

    // 搜索
    form.on('submit(LAY-marketingTemplate-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_name = result.name;
        current_status = result.status === '' ? undefined : result.status;
        var createDate = result.createDate;
        if (createDate === '') {
            current_begin = undefined;
            current_end = undefined;
        } else {
            var begin_end = createDate.split(' - ');
            current_begin = begin_end[0] + ' 00:00:00';
            current_end = begin_end[1] + ' 23:59:59';
        }
        getMarketingTemplateList();
    });

    //监听头部工具栏 浏览模板页面
    table.on('tool(content-marketingTemplate-list)', function(obj){
        
        //选中行
        var rowData=obj.data;
        
        switch (obj.event) {
            case 'open':
                
                //切换页面清空变量
                browseTemplateData.length=0;
                pageMap.length=0;
                pageMap=[];
                
                //遍历页面
                var _pagesData=rowData.templatePageList;
                for (var i=0;i<_pagesData.length;i++){
                    
                    var tmpPage={};
                        tmpPage.templateCode=rowData.code;
                        tmpPage.pageSort=_pagesData[i].sort;
                        tmpPage.pageCode=_pagesData[i].code;
                    
                    var duplicate=[];
                    if (_pagesData[i].content.duplicate){
                        
                        //取该页面副本集
                        duplicate=_pagesData[i].content.duplicate;
                        
                        //取该副本集主版本
                        for (var j=0;j<duplicate.length;j++){
                            
                            if (duplicate[j].isValid==0){
                                tmpPage.canvasCode=duplicate;
                                tmpPage.pageWidth=duplicate[j].width;
                                tmpPage.pageHeight=duplicate[j].height;
                            }
                            
                        }
                    
                    }
                    
                    //添加页面
                    if (tmpPage.canvasCode){
                        browseTemplateData[tmpPage.pageSort * 1 - 1]=tmpPage;
                    }
                    
                }
                
                if (browseTemplateData.length>0){
                    
                    $("#pagesList").html("");
                    
                    //加载模板页面
                    loadTemplatePages(0,browseTemplateData,_JC);
                    
                }else{
                    layer.msg("err");
                }
                
            break;
        }
        
    });


    //获取指定页面副本集列表  
    function loadTemplatePages(pageSort,browseTemplateData,_JC){

        

        var theDuplicate=browseTemplateData[pageSort].canvasCode;
        
        var parm={};
            parm.pageSort=pageSort;
            parm.width=browseTemplateData[pageSort].pageWidth;
            parm.height=browseTemplateData[pageSort].pageHeight;
        
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
                            parm.width=objects[j].width;
                            parm.height=objects[j].height;
                        }
                    }
                }
            
                parm.x=x;
                parm.y=y;
                
                //副本集页面编码
                parm.pageNo=theDuplicate[i].No;
                parm.isValid=theDuplicate[i].isValid;
            
                var tmp={};
                    tmp.templateCode=browseTemplateData[pageSort].templateCode;
                    tmp.pageCode=browseTemplateData[pageSort].pageCode;
                    tmp.pageNo=parm.pageNo;
                    tmp.pageSort=parm.pageSort;
                    tmp.isValid=parm.isValid;
                    // tmp.pic=base64;
                    tmp.canvasCode=theDuplicate[i];
                    
                pageMap.push(tmp);
                
            }
        }
        
        if (pageSort<browseTemplateData.length-1){
            loadTemplatePages(pageSort + 1,browseTemplateData,_JC);
        }else{
            //调用生成副本集预览图列表生成函数
            pagesReview();
        }
    }

    //获取指定页面副本集列表  
    function loadTemplatePages_copy(pageSort,browseTemplateData,_JC){

        var theDuplicate=browseTemplateData[pageSort].canvasCode;
        
        var parm={};
            parm.pageSort=pageSort;
            parm.width=browseTemplateData[pageSort].pageWidth;
            parm.height=browseTemplateData[pageSort].pageHeight;
        
        

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
                            parm.width=objects[j].width;
                            parm.height=objects[j].height;
                        }
                    }
                }
            
                parm.x=x;
                parm.y=y;
                
                //副本集页面编码
                parm.pageNo=theDuplicate[i].No;
                parm.isValid=theDuplicate[i].isValid;
            
                //以下代码为了防止for遍历大量占用内存
                if (pageSort<browseTemplateData.length-1){
                    
                    //非最后一页,输出base64后,pageSort + 1 -> 调用本身
                    var _map=_JC.canvasSave().canvasBase64(parm,theDuplicate[i],canvas,function(base64){
                        
                        var tmp={};
                            tmp.templateCode=browseTemplateData[pageSort].templateCode;
                            tmp.pageCode=browseTemplateData[pageSort].pageCode;
                            tmp.pageNo=parm.pageNo;
                            tmp.pageSort=parm.pageSort;
                            tmp.isValid=parm.isValid;
                            tmp.pic=base64;
                            tmp.canvasCode=theDuplicate[i];
                            
                        pageMap.push(tmp);
                        loadTemplatePages(pageSort + 1,browseTemplateData,_JC);
                    });
                    break;
                }else{
                    
                    //最后一页,输出base64后，调用生成副本集预览图列表生成函数
                    var _map=_JC.canvasSave().canvasBase64(parm,theDuplicate[i],canvas,function(base64){
                        
                        var tmp={};
                            tmp.templateCode=browseTemplateData[pageSort].templateCode;
                            tmp.pageCode=browseTemplateData[pageSort].pageCode;
                            tmp.pageNo=parm.pageNo;
                            tmp.pageSort=parm.pageSort;
                            tmp.isValid=parm.isValid;
                            tmp.pic=base64;
                            tmp.canvasCode=theDuplicate[i];
                            
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
            
            _Html=_Html + '<div class="layui-col-md3 layui-col-sm3">';
            _Html=_Html + ' <div class="cmdlist-container choosePicture" >';
            // _Html=_Html + '     <div class="imgBox" >';
            // _Html=_Html + '         <img src="' + pageMap[i].pic +'"  data="'+pageMap[i].pageNo+'"  >';
            // _Html=_Html + '     </div>';
            _Html=_Html + '     <div class="cmdlist-text">';
            
            if (i==0){
                var _title='Home page';
            }else if (i>0 && i<pageMap.length-1){
                var _title='Page ' + (i+1);
            }else if (i==pageMap.length-1){
                var _title='Last page';
            }
            
            _Html=_Html + '       <p class="info">' + _title + '</p>';
            
            _Html=_Html + '         <p>';
            
            var searchStatus=searchChoosePage(pageMap[i].templateCode,pageMap[i].pageCode);
            if (searchStatus!=true){
                _Html=_Html + '         <span class="choosePage" data="'+i+'"  >Choose</span>';
            }else{
                _Html=_Html + '         <span class="choosePage act" data="'+i+'"  >Choose</span>';
            }
            
            _Html=_Html + '         </p>';
            
            _Html=_Html + '     </div>';
            _Html=_Html + ' </div>';
            _Html=_Html + '</div>';
            
        }
        
        $("#pagesList").html(_Html);

        //layer.close(loadEvent);
    }
    
    //选择模板页面
    $(document).on("click",".choosePage",function(){
        
        var pageSort=$(this).attr("data");
        if (pageSort){
            
            //获取该页面
            var canvasCode=pageMap[pageSort*1].canvasCode;
            
            //更新父窗口当前页，替换当前副本
            //追加当前已过滤组件作业画布到当前页面副本集
            var lastSort=_JC.templateData.cunterPageDuplicate.length-1;
                canvasCode.No=Math.round(new Date() / 1000);
                canvasCode.isValid=1;
                
            _JC.templateData.cunterPageDuplicate[lastSort]=(canvasCode);
            
            
            //更新当前页面所有副本集到模板所有页副本变量集
            _JC.pagesDuplicate[_JC.canvasConfig.recordPointer.pointerPageCode]=_JC.templateData.cunterPageDuplicate;
            
            //渲染当前画布
            var parm={};
                parm.No=canvasCode.No;
                parm.pageSort=_JC.cunterPage;
                parm.pageCode=_JC.canvasConfig.recordPointer.pointerPageCode;
                parm.parentCanvas=parent.canvas;
            _JC.canvasSave().cutoverPageDuplicate(parm,function(){
                
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
    
    
    window.loadTemplatePages= function(){
       loadTemplatePages();
    };
});