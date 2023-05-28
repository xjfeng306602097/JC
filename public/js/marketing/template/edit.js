/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingTemplate/edit
    
 */
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'laydate', 'layer', 'form'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form;

    var current_id = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    //当对模板页面尺寸增大或载取时，从哪个方向开始 1~9
    var zoomPosition = 0;

    var recentSize = [];
    var presetSize = [];
    var unitList = [];
    var unitTypes = {};
    init();
    //单位切换事件监控
    form.on('select(unit)', function(data) {
        $("#marginUnit").html("(" + data.elem[data.elem.selectedIndex].text + ")");
        $("#bleedUnit").html("(" + data.elem[data.elem.selectedIndex].text + ")");
        calculateUnitToPx();
    });
    //表单form值验证
    form.verify({
        //最小值验证
        minValue: function(value) {
            if (value * 1 <= 0) {
                return 'Cannot be empty or less than 0!';
            }
        },
        checkDPI: function(value) {
            if (value == "" || value == null || value * 1 <= 72) {
                return 'The Dpi cannot be empty and less than 72';
            } else if (value * 1 > 300) {
                return 'Maximum DPI cannot exceed 300';
            }
        },
        //页边距
        checkMargins: function(value) {
            var _w = $("input[name=width]").val();
            var _h = $("input[name=height]").val();
            if (value == "" || value == null || value * 1 < 0) {
                return 'Cannot be empty or less than 0';
            } else if (value * 1 > (_w * 0.1)) {
                return 'Margins cannot be greater than 10% of the page';
            }
        },
        //出血线
        checkBleed: function(value) {
            if (value == "" || value == null || value * 1 < 0) {
                return 'Cannot be empty or less than 0';
            } else if (value * 1 > 20) {
                return 'Bleeding line cannot be larger than 20mm';
            }
        }
    });
    //初始化页面
    function init() {
        // 载入unit后再依次载入其他数据
        loadUnit(null, function() {
            loadTemplateData();
        });
    }
    // 载入unit数据
    var __loadUnit_fail_number = 0;
    function loadUnit(data, success) {
        if (data == undefined) {
            data = {
                req: {},
                page: 1,
                limit: 50,
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
        }
        $.ajax({
            url: getApiUrl('marketing.unit.page'),
            type: getApiMethod('marketing.unit.page'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: JSON.stringify(data),
            success: function(result) {
                __loadUnit_fail_number = 0;
                if (result.code === "0000") {
                    // 应优先设置长度单位
                    var units = result.data.records;
                    if (units != null && units.length > 0) {
                        var _Html = '';
                        unitTypes = {};
                        $.each(units, function(index, value) {
                            var tmp = units[index];
                            unitList.push(tmp);
                            unitTypes[tmp.id] = tmp.name;
                            _Html += '<option value="' + tmp.id + '"' + (tmp.status == 1 ? '' : 'disabled') + '>' + tmp.name + '</option>';
                        });
                        $("select[name=unit]").html(_Html);
                        layui.form.render("select");
                    }
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__loadUnit_fail_number;
                console.log('loadUnit: 网络错误！');
                if (__loadUnit_fail_number < 3) {
                    setTimeout(function() {
                        loadUnit(data, success);
                    }, 100);
                } else {
                    console.log('loadUnit: 已累计3次请求失败');
                }
            }
        });
    }
    // 载入模板数据
    var __loadTemplateData_fail_number = 0;
    function loadTemplateData() {
        $.ajax({
            url: getApiUrl('marketing.template.detail', {code: current_id}),
            type: getApiMethod('marketing.template.detail'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: {
                // 不返回模板页面内容
                "content": 0,
            },
            success: function(result) {
                __loadTemplateData_fail_number = 0;
                if (result.code === "0000") {
                    var templateData = result.data;
                    $("input[name=templateName]").val(templateData.name);
                    $("input[name=width]").val(templateData.configW);
                    $("input[name=height]").val(templateData.configH);
                    $("input[name=DPI]").val(templateData.configDpi);
                    $("select[name=unit]").val(templateData.configUnitID);
                    // 实现被禁用后但正在使用的unit显示
                    $('select[name=unit]>option[disabled][value!='+templateData.configUnitID+']').remove();
                    layui.form.render("select");
                    var unit = $("select[name=unit]").find("option:selected").index();
                    var theUnitName = 'Unknown';
                    if (unit >= 0) {
                        theUnitName = unitList[unit * 1].name;
                    }
                    $("#bleedUnit").html("(" + theUnitName + ")");
                    $("input[name=bleedLineTop]").val(templateData.bleedLineTop);
                    $("input[name=bleedLineBottom]").val(templateData.bleedLineBottom);
                    $("input[name=bleedLineIn]").val(templateData.bleedLineIn);
                    $("input[name=bleedLineOut]").val(templateData.bleedLineOut);
                    $("#marginUnit").html("(" + theUnitName + ")");
                    $("input[name=marginTop]").val(templateData.marginTop);
                    $("input[name=marginBottom]").val(templateData.marginBottom);
                    $("input[name=marginIn]").val(templateData.marginIn);
                    $("input[name=marginOut]").val(templateData.marginOut);
                    //Original config赋值
                    $("#sourceConfigInfo .originalBasic").children("label").eq(0).html("Width: " + templateData.configW);
                    $("#sourceConfigInfo .originalBasic").children("label").eq(1).html("Height: " + templateData.configH);
                    $("#sourceConfigInfo .originalBasic").children("label").eq(2).html("Unit: " + theUnitName);
                    $("#sourceConfigInfo .originalBasic").children("label").eq(3).html("DPI: " + templateData.configDpi);
                    $("#sourceConfigInfo .originalBleed").children("label").eq(0).html("Top: " + templateData.bleedLineTop);
                    $("#sourceConfigInfo .originalBleed").children("label").eq(1).html("Bottom: " + templateData.bleedLineBottom);
                    $("#sourceConfigInfo .originalBleed").children("label").eq(2).html("Inside: " + templateData.bleedLineIn);
                    $("#sourceConfigInfo .originalBleed").children("label").eq(3).html("Outside: " + templateData.bleedLineOut);
                    $("#sourceConfigInfo .originalMargins").children("label").eq(0).html("Top: " + templateData.marginTop);
                    $("#sourceConfigInfo .originalMargins").children("label").eq(1).html("Bottom: " + templateData.marginBottom);
                    $("#sourceConfigInfo .originalMargins").children("label").eq(2).html("Inside: " + templateData.marginIn);
                    $("#sourceConfigInfo .originalMargins").children("label").eq(3).html("Outside: " + templateData.marginOut);
                    zoomPosition = 0;
                    if (templateData.zoomPosition != null) {
                        zoomPosition = parseInt(templateData.zoomPosition);
                    }
                    $("#resetPoint table tr td").removeClass("active");
                    $("#resetPoint table tr td[data="+zoomPosition+"]").addClass("active");
                    $("input[name=zoomPosition]").val(zoomPosition);

                    calculateUnitToPx();
                } else {
                    layer.msg(result.msg,{
                        time: 2000,
                        end: function () {
                            var index = parent.layer.getFrameIndex(window.name);
                            parent.layer.close(index);
                        }
                    });
                }
            },
            error: function(e) {
                ++__loadTemplateData_fail_number;
                console.log('loadTemplateData: 网络错误！');
                if (__loadTemplateData_fail_number < 3) {
                    setTimeout(function() {
                        loadTemplateData(data, success);
                    }, 100);
                } else {
                    console.log('loadTemplateData: 已累计3次请求失败');
                }
            }
        });
    }
    //页面宽、高、dpi、单位录入或更新事件监控
    $(".basicInput input").on("input", function(e) {
        calculateUnitToPx();
    });
    //页边距、出血线输入锁定同步按钮状态监控
    $("#margins_link,#bleed_link").click(function() {
        if ($(this).attr("data") == "lock") {
            $(this).attr("data", "unlock");
            $(this).find("i").removeClass("layui-icon-link").addClass("layui-icon-unlink");
            $(this).find("span").text("unlocked");
        } else {
            $(this).attr("data", "lock");
            $(this).find("i").removeClass("layui-icon-unlink").addClass("layui-icon-link");
            $(this).find("span").text("locked");
        }
    });
    //页边距值输入监控
    $(".marginsInput input").on("input", function(e) {
        var _value = $(this).val();
        if ($("#margins_link").attr("data") == "lock") {
            $("input[name=marginTop]").val(_value);
            $("input[name=marginBottom]").val(_value);
            $("input[name=marginIn]").val(_value);
            $("input[name=marginOut]").val(_value);
        }
    });
    //出血线值输入监控
    $(".bleedInput input").on("input", function(e) {
        var _value = $(this).val();
        if ($("#bleed_link").attr("data") == "lock") {
            $("input[name=bleedLineTop]").val(_value);
            $("input[name=bleedLineBottom]").val(_value);
            $("input[name=bleedLineIn]").val(_value);
            $("input[name=bleedLineOut]").val(_value);
        }
        calculateUnitToPx();
    });
    //zoom Position点击监控
    $("#resetPoint table tr td").click(function() {
        zoomPosition = $(this).attr("data");
        $("#resetPoint table tr td").removeClass("active");
        $(this).addClass("active");
        $("input[name=zoomPosition]").val(zoomPosition);
    });
    //根据页面选单尺寸单位、宽、高、dpi、出血线计算转换宽、高px值
    function calculateUnitToPx() {
        $("input[name=pageWidth]").val(0);
        $("input[name=pageHeight]").val(0);
        var parma = {};
        parma.unitInch = unitList[$("select[name=unit]").find("option:selected").index() * 1].unitInch;
        parma.dpi = $("input[name=DPI]").val();
        parma.width = $("input[name=width]").val();
        parma.height = $("input[name=height]").val();
        parma.bleedLineIn = $("input[name=bleedLineIn]").val();
        parma.bleedLineOut = $("input[name=bleedLineOut]").val();
        parma.bleedLineTop = $("input[name=bleedLineTop]").val();
        parma.bleedLineBottom = $("input[name=bleedLineBottom]").val();
        parma.bleedLineTop = (isEmpty(parma.bleedLineTop) || parma.bleedLineTop * 1 < 0) ? 0 : parma.bleedLineTop * 1;
        parma.bleedLineBottom = (isEmpty(parma.bleedLineBottom) || parma.bleedLineBottom * 1 < 0) ? 0 : parma.bleedLineBottom * 1;
        parma.bleedLineIn = (isEmpty(parma.bleedLineIn) || parma.bleedLineIn * 1 < 0) ? 0 : parma.bleedLineIn * 1;
        parma.bleedLineOut = (isEmpty(parma.bleedLineOut) || parma.bleedLineOut * 1 < 0) ? 0 : parma.bleedLineOut * 1;
        if (parma.width == "" || parma.width * 1 <= 0) {
            return;
        } else if (parma.height == "" || parma.height * 1 <= 0) {
            return;
        } else if (parma.dpi == "" || parma.dpi * 1 < 72) {
            return;
        } else if (parma.unitInch == "" || parma.unitInch == null || parma.unitInch == undefined || parma.unitInch * 1 <= 0) {
            return;
        } else {
            var pageWidth = Math.round((parma.width * 1 + parma.bleedLineIn * 1 + parma.bleedLineOut * 1) / (parma.unitInch * 1) * (parma.dpi * 1));
            var pageHeight = Math.round((parma.height * 1 + parma.bleedLineTop * 1 + parma.bleedLineBottom * 1) / (parma.unitInch * 1) * (parma.dpi * 1));
            if (pageWidth <= 0 || pageHeight <= 0) {
                return;
            } else {
                $("input[name=pageWidth]").val(pageWidth);
                $("input[name=pageHeight]").val(pageHeight);
            }
        }
    }
});