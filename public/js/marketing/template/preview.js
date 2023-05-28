/**

 @Name：makro 
 @Author：makro
 @Site：http://mm.makrogo.com/makroDigital/marketingElement/select
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'layer', 'carousel'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,form = layui.form
        ,carousel = layui.carousel
        ,layer = layui.layer;
    
    var loadEvent = layer.load(2, {
        time: 10*1000,
        shade: [0.3, '#393D49']
    });
        
    var storage = parent.storage;   
    
    //弹出窗可操作区域高度
    var windowHeight = window.innerHeight;
    $(".pictureList").css("height",(windowHeight-50) + "px");
    var imgHeight = windowHeight - 100;
    
    //各副本预临图片数组对象 pageMap[sort]={"No","","sort":"","Pic":"base64"};
    var pageMap = [];
    
    //template模板宽高
    var pageWidth = parent._JC.paperSize.bleedWidth;
    var pageHeight = parent._JC.paperSize.bleedHeight;

    // 轮播初始化
    var carouselIns = carousel.render({
        elem: '#pagesList',
        width: '100%', //设置容器宽度
        height: 'calc(100vh - 30px)', //设置容器高度
        arrow: 'always', //始终显示箭头
        autoplay: false,
    });
    
    loadTemplatePages(0, parent._JC);
    
    //获取指定页面副本集列表  
    function loadTemplatePages(pageSort, _JC) {
        var theDuplicate = _JC.pagesDuplicate;
        for (var i = pageSort; i < theDuplicate.length; i++) {
            
            for (var j = 0; j < theDuplicate[i].length; j++) {    
                
                if (theDuplicate[i][j].isValid * 1 == 0) {
                    
                    var pageData = theDuplicate[i][j];
                    var tmp = {};
                        tmp.pageNo = theDuplicate[i].code;
                        tmp.pageSort = theDuplicate[i].sort;
                        tmp.pic = pageData.previewUrl;
                        
                    pageMap.push(tmp);
                    
                }
            }
        }
        
        //生成预览图列表
        pagesPreview();
    }
    
    //生成预览图列表
    function pagesPreview() {
        var previewHtml = '';
        for (var i = 0; i < pageMap.length; i++) {
            var _title = 'Page ' + (i + 1);
            if (i == 0) {
                var _title = 'Home page';
            } else if (i == pageMap.length - 1) {
                var _title = 'Last page';
            }
            previewHtml += '<div class="item"><div class="item-image"><a href="' + pageMap[i].pic + '" target="_blank" title="' + _title + '"><img src="' + pageMap[i].pic + '"></a></div><div class="item-title"><strong>' + _title + '</strong></div></div>';
        }
        $('#pagesList [carousel-item]').html(previewHtml);
        carouselIns.reload();

        layer.close(loadEvent);
    }
    
    window.loadTemplatePages = function(){
       loadTemplatePages();
    };
});