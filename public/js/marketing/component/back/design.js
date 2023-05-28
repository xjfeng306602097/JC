/**

 @Name：makro 
 @Author：makro
 @Site：http://mm.makro.com/makroDigital/marketingComponent/design
    
 */
//引入设计页模块JS
var canvas, context, _JC, _CMYK, _DB, userID, slider, mmDetailsData;
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'laydate', 'table', 'layer', 'slider','upload', 'uploadAPI'], function() {
    var $ = layui.$,
        setter = layui.setter,
        form = layui.form,
        laydate = layui.laydate,
        table = layui.table,
        slider = layui.slider,
        upload = layui.upload,
        uploadAPI = layui.uploadAPI,
        layer = layui.layer;
    //页面select值修改监听处理
    form.on("select", function(data) {
        var _name = data.elem.name;
        switch (_name) {
            case "textFont":
                _JC.cunterObj.fontFamily = data.value;
                canvas.renderAll();
                break;
        }
    });
    
    //当前组件code
    window.current_id = getUrlRelativePath(4);
    
    //定义全局授权信息
    window.storage = layui.data(setter.tableName);
    
    //引用Layui jquery
    window.$ = layui.$;
    
    require.config({　
        baseUrl: "/js/marketing/config",
        paths: {　　　
            "rotate": "jquery.rotate.min",
            "designFunction": "function",
            "config": "defaulConfig",
            "localdb": "localdb.class",
            "cmykColor": "cmyk",
            "canvas": "fabric",
            "JC": "jc.class",
            "pagesEvent": "pagesEvent",
        }
    }),
    require(["rotate", "config", "designFunction", "localdb", "canvas", "JC", "pagesEvent", "cmykColor"], function() {
        //设置作业画布空间
        setDrawAreaNew();
        //加载设计字体
        loadFont();　　 //引用本地库
        _DB = new localDB();
        _DB.openDB(dbParma);
        _DB.onsuccess().then(data => {
            console.log('open db success');
        })
        _DB.onupgradeneeded().then(data => {
            _DB.initTable(createTable);
        })
        //设定画布
        canvas = this.__canvas = new fabric.Canvas('paperArea');
        fabric.Object.prototype.transparentCorners = false;
        context = canvas.getContext('2d');
        //引用JC类 初始化
        _JC = new JC();
        _JC.localDB = _DB;
        _JC.canvasPaddX = 0;
        _JC.canvasPaddY = 0;
        _JC.designModule = "component";
        _JC.canvasConfig.defauleBackgroundImage = blankPic;
        //关闭出血线、纸张、页边距边框
        _JC.paperSize.stroke = false;
        //加载商品组件
        loadProductLabel(productElement, "#productElement");
        loadElementShape("#shapeElement");
        //引用CMYK类
        　　
        _CMYK = new cmykColor();　　
        _CMYK.init();　　
        _CMYK.done = function(data) {　　
            _JC.colorConfig(data);　　
        }　　　　 //JC引入颜色器
        　　
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
        getTemplateCode(mydata, function(result) {
            console.log(result);
            if (result.code == "0000") {
                var outData = result.data.content;
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
                };
                _JC.init(parm);
                var loadParm = {
                    pageCode: result.data.code,
                    duplicate: outData.duplicate
                };
                _JC.templateAffair().loadTemplate(loadParm);
                //页面纸张尺寸填写
                $(".pageConfig .sizeWidth .number").html(outData.pageSize.paper.width);
                $(".pageConfig .sizeHeight .number").html(outData.pageSize.paper.height);
                $(".mmName").html(result.pTitle);
                $(".staffInfo").html("Staff:" + result.user);
                //组件画布特殊处理top定位 临时处理
                $("#draw-wrapper").css("padding-top", "50px");
                $(".sizeScale").remove();
            } else {
                layer.msg(result.msg);
            }
        });
    });
});