/**

 @Name：makro 
 @Author：makro
 @Site：http://mm.makrogo.com/makroDigital/marketingElement/select
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'laydate', 'table', 'laypage', 'layer', 'dict', 'uploadAPI'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,laypage = layui.laypage
        ,layer = layui.layer
        ,dict = layui.dict
        ,uploadAPI = layui.uploadAPI;

    var storage = parent.storage || layui.data(setter.tableName);
    var _JC = parent._JC;
    var elementType = getUrlRelativePath(4) || '';
    switch (elementType) {
        // 背景图
        case 'background':
            elementType = '1';
            break;
        // 除去背景图其余的图片
        case 'picture':

            break;
    }

    //上传Element图片返回Data对象转字符串
    window.filePath = '';
    //Element类型字典
    window.typeDict = [];
    //禁止未渲染重复点选图片
    var disableClick = false;
    var current_page = 1,
        current_limit = 8,
        current_elementType = '';

    init();
    // 载入分页
    function loadPage(total) {
        laypage.render({
            elem: 'pageBox',
            count: total,
            curr: current_page,
            limit: current_limit,
            limits: [8, 24, 40, 100, 200],
            // theme: '#ee1c1d',
            prev: 'Prev',
            next: 'Next',
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
            jump: function(obj, first) {
                if (!first) {
                    current_page = obj.curr;
                    current_limit = obj.limit;
                    loadElement();
                }
            }
        });
    }
    // 初始化，获取Element类型
    function init() {
        if (_JC.cunterObj == null) {
            //当前为没有选中组件，为页面配置状态,图片设置为背景图
            var objType = "BackgroundImage";
            var canvasObjects = parent.canvas.getObjects();
            _JC.cunterObj = _JC.canvasDraw().searchObject({
                id: "BackgroundImage"
            }, canvasObjects);
        }
        if (_JC.cunterObj.dType == "IconElement") {
            $(".upNewImage").remove();
            $(".upNewIcon").show();
            $("#elementType").append('<dd class="act">ICON List</dd>');
            current_page = 1;
            current_limit = 8;
            loadElement(function(res) {
                if (res.data.total >= 1) {
                    loadPage(res.data.total);
                }
            });
        } else if (_JC.cunterObj.dType == "BackgroundImage") {
            $(".upNewImage").show();
            $(".upNewIcon").remove();
            $("#elementType").append('<dd class="act" data="1">Background</dd>');
            current_page = 1;
            current_limit = 8;
            current_elementType = '1';
            loadElement(function(res) {
                if (res.data.total >= 1) {
                    loadPage(res.data.total);
                }
            });
        } else {
            $(".upNewImage").show();
            $(".upNewIcon").remove();
            dict.request({
                dictCode: 'element_type',
                success: function(result) {
                    if (result.code === "0000") {
                        var dictItem = result.data;
                        //Element类型字典 用于add页
                        typeDict = dictItem;
                        current_elementType = '';
                        var _Html = '';
                        for (var i = 0; i < dictItem.length; i++) {
                            if (dictItem[i].value == '1') {
                                continue;
                            }
                            if (current_elementType == '') {
                                //调用加载图片
                                current_elementType = dictItem[i].value;
                            }
                            var isAct = dictItem[i].value == current_elementType ? 'act' : '';
                            _Html = _Html + '<dd class="' + isAct + '" data="' + dictItem[i].value + '">' + dictItem[i].name + '</dd>';
                        }
                        $("#elementType").append(_Html);
                        current_page = 1;
                        loadElement(function(res) {
                            if (res.data.total >= 1) {
                                loadPage(res.data.total);
                            }
                        });
                    } else {
                        layer.msg(result.msg);
                    }
                }
            });
        }
    }
    //获取Element列表  
    function loadElement(success) {
        if (_JC.cunterObj == null) {
            //当前为没有选中组件，为页面配置状态,图片设置为背景图
            var objType = "BackgroundImage";
            var canvasObjects = parent.canvas.getObjects();
            _JC.cunterObj = _JC.canvasDraw().searchObject({
                id: "BackgroundImage"
            }, canvasObjects);
        } else {
            var objType = _JC.cunterObj.dType;
        }
        if (objType == "IconElement") {
            //图标ICON 
            var getData = "page=" + current_page + "&limit=" + current_limit + "&isvalid=1";
            var getUrl = getApiUrl('product.icon.page');
            var getType = getApiMethod('product.icon.page');
        } else {
            //图片Element/背景图
            var getUrl = getApiUrl('marketing.element.page');
            var getType = getApiMethod('marketing.element.page');
            var mydata = {
                limit: current_limit,
                page: current_page,
                req: {
                    type: current_elementType,
                    status: 1,
                },
                sortItems: [{
                    column: "gmtCreate",
                    isAsc: true
                }],
            };
            var getData = JSON.stringify(mydata);
        }
        $.ajax({
            url: getUrl,
            type: getType,
            data: getData,
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                // console.log(result);
                if (result.code === "0000") {
                    var elementData = result.data.records;
                    if (_JC.cunterObj.dType == "IconElement") {
                        //追加到ICON图片容器
                        var _Html = '';
                        for (var i = 0; i < elementData.length; i++) {
                            if (elementData[i].pic != null) {
                                _Html = _Html + '<div class="layui-col-md3 layui-col-sm4">';
                                _Html = _Html + ' <div class="cmdlist-container choosePicture" title="' + elementData[i].name + '">';
                                _Html = _Html + '     <div class="imgBox">';
                                //_Html = _Html + '         <img src="' + elementData[i].pic.thumbnailPath + '"  data="' + elementData[i].pic.transformPath + '" cmyk="' + elementData[i].pic.transformPath + '" >';
                                _Html = _Html + '         <img src="' + elementData[i].pic.thumbnailPath + '"  data="' + elementData[i].pic.thumbnailPath + '" cmyk="' + elementData[i].pic.transformPath + '" >';
                                _Html = _Html + '     </div>';
                                _Html = _Html + '     <div class="cmdlist-text">';
                                _Html = _Html + '         <p class="info">' + elementData[i].name + '</p>';
                                _Html = _Html + '     </div>';
                                _Html = _Html + ' </div>';
                                _Html = _Html + '</div>';
                            }
                        }
                    } else {
                        //追加到Element/BackgroundImage图片容器
                        var _Html = '';
                        for (var i = 0; i < elementData.length; i++) {
                            _Html = _Html + '<div class="layui-col-md3 layui-col-sm4">';
                            _Html = _Html + ' <div class="cmdlist-container choosePicture" title="' + elementData[i].nameEn + '">';
                            _Html = _Html + '     <div class="imgBox">';
                            //_Html = _Html + '         <img src="' + elementData[i].thumbnailPath + '"  data="' + elementData[i].originPath + '" cmyk="' + elementData[i].transformPath + '" >';
                            if (elementData[i].rgb) {
                                _Html = _Html + '         <img src="' + elementData[i].thumbnailPath + '"  data="' + elementData[i].thumbnailPath + '" cmyk="' + elementData[i].transformPath + '" >';
                            } else {
                                _Html = _Html + '         <img src="' + elementData[i].transformThumbnailPath + '"  data="' + elementData[i].transformThumbnailPath + '" cmyk="' + elementData[i].thumbnailPath + '" >';
                            }
                            _Html = _Html + '     </div>';
                            _Html = _Html + '     <div class="cmdlist-text">';
                            _Html = _Html + '         <p class="info">' + elementData[i].nameEn + '</p>';
                            _Html = _Html + '     </div>';
                            _Html = _Html + ' </div>';
                            _Html = _Html + '</div>';
                        }
                    }
                    $("#elementList").html(_Html);
                    success && success(result);
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }
    //选择图片
    $(document).on("click", ".choosePicture", function() {
        $(this).removeClass("choosePicture");
        if (disableClick == false) {
            disableClick = true;
            var selectPicture_Url = $(this).find("img").attr("data");
            var selectPicture_cmyk = $(this).find("img").attr("cmyk");
            if (isEmpty(selectPicture_Url) == false) {
                //var _JC = parent._JC;
                if (_JC.cunterObj == null) {
                    //当前为没有选中组件，为页面配置状态,图片设置为背景图
                    var objType = "BackgroundImage";
                    var canvasObjects = parent.canvas.getObjects();
                    _JC.cunterObj = _JC.canvasDraw().searchObject({
                        id: "BackgroundImage"
                    }, canvasObjects);
                } else {
                    var objType = _JC.cunterObj.dType;
                }
                var parm = {
                    dType: objType,
                    src: selectPicture_Url,
                    cmykPic: selectPicture_cmyk
                };

                //在背景图设置属性面板更改背景图后，同步更新图层面板背景图显示/隐藏
                if (_JC.cunterObj.id=="BackgroundImage"){
                    _JC.layer.canvasOperation.setLayerStatus(_JC.cunterObj.id,{displayStatus:1,lockStatus:0});
                }

                _JC.componentDraw().setPicture(parm, function() {
                    //刷新当前页面所有层
                    _JC.canvasDraw().canvasRefresh();
                    _JC.componentDraw().resetView();
                    if (_JC.undoGroupSource == null) {
                        _JC.pageEvent.showBackgroundImage();
                    } else {
                        _JC.pageEvent.groupAttributes();
                    }
                    _JC.cunterObj = null;
                    parent.canvas.discardActiveObject();
                    _JC.selectedObject=null;
                    _JC.mouseoverObject=null;
                    
                    //关闭弹出层
                    var index = parent.layer.getFrameIndex(window.name);
                    parent.layer.close(index);
                    disableClick = false;
                });
            } else {
                disableClick = false;
                layer.msg("The picture missing parameters");
            }
        }
    });
    //切换Element type
    $("#elementType").on('click', 'dd', function() {
        $("#elementType dd").removeClass("act");
        $(this).addClass("act");
        current_elementType = $(this).attr("data");
        current_page = 1;
        loadElement(function(res) {
            if (res.data.total >= 1) {
                loadPage(res.data.total);
            }
        });
    });
    //新增Element
    $(".upNewImage").click(function() {
        var index_page = layer.open({
            type: 2,
            title: 'Add Element',
            id: 'addElement',
            content: '/makroDigital/marketingElement/add/' + current_elementType,
            maxmin: true,
            area: ['600px', '455px'],
            btn: ['Save', 'Cancel'],
            yes: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index],
                    submitID = 'LAY-element-add-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);

                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
                    
                    if (filePath == '') {
                        layer.msg('Please upload pictures.');
                    } else {
                        var mydata = {
                            "nameEn": result.name,
                            // "nameThai": result.nameThai,
                            "filePath": filePath,
                            "type": result.type
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
                                    uploadAPI.cancel(iframeWindow.uploadList, result.path);
                                    layer.msg(result.msg);
                                    layer.close(index_page);
                                    loadElement();
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    }
                });
                submit.trigger('click');
            },
            cancel: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index];
                uploadAPI.cancel(iframeWindow.uploadList);
            },
            btn2: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index];
                uploadAPI.cancel(iframeWindow.uploadList);
            }
        });
    });
    //新增Icon
    $(".upNewIcon").click(function() {
        var index_page = layer.open({
            type: 2,
            title: 'Add Icon',
            id: 'addIcon',
            content: '/makroDigital/productIcon/add',
            maxmin: true,
            area: ['600px', '510px'],
            btn: ['Save', 'Cancel'],
            yes: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index],
                    submitID = 'LAY-productIcon-add-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);

                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);

                    var picPath = result.path;
                    var mydata = {
                        "name": result.name,
                        "picid": result.picid,
                        "remark": result.remark
                    };
                    $.ajax({
                        url: getApiUrl('product.icon.add'),
                        type: getApiMethod('product.icon.add'),
                        data: JSON.stringify(mydata),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                uploadAPI.cancel(iframeWindow.uploadList, picPath);
                                // 插入上传的icon图片数据
                                if (result.data && iframeWindow.iconImage !== undefined) {
                                    var picdata = {
                                        iconid: result.data.id,
                                        defaulted: 1,
                                        filePath: JSON.stringify(iframeWindow.iconImage),
                                    };
                                    $.ajax({
                                        url: getApiUrl('product.icon.picture.add'),
                                        type: getApiMethod('product.icon.picture.add'),
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": 'Bearer ' + storage.access_token
                                        },
                                        data: JSON.stringify(picdata),
                                        success: function(res) {
                                            if (res.code === '0000') {
                                                loadElement();
                                            } else {
                                                console.log('插入icon图片数据失败');
                                            }
                                        },
                                        error: function(e) {
                                            console.log(e);
                                        }
                                    });
                                }
                                layer.msg(result.msg);
                                layer.close(index_page);
                            } else {
                                layer.msg(result.msg);
                            }
                        }
                    });
                });
                submit.trigger('click');
            },
            cancel: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index];
                uploadAPI.cancel(iframeWindow.uploadList);
            },
            btn2: function(index, layero) {
                var iframeWindow = window['layui-layer-iframe' + index];
                uploadAPI.cancel(iframeWindow.uploadList);
            }
        });
    });

    window.loadElement = function() {
        loadElement();
    };
});