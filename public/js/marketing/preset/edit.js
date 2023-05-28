/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingPreset/edit
    
 */
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'laydate', 'layer'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form;

    var current_id = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    var unitList = [];
    var unitTypes = {};
    init();
    //单位切换事件监控
    form.on('select(unit)', function(data) {
        $("#marginUnit").html("(" + data.elem[data.elem.selectedIndex].text + ")");
        $("#bleedUnit").html("(" + data.elem[data.elem.selectedIndex].text + ")");
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
            loadPresetData();
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
    // 载入preset数据
    var __loadPresetData_fail_number = 0;
    function loadPresetData() {
        $.ajax({
            url: getApiUrl('marketing.preset.detail', {id: current_id}),
            type: getApiMethod('marketing.preset.detail'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                __loadPresetData_fail_number = 0;
                if (result.code === "0000") {
                    var presetData = result.data;
                    $("input[name=name]").val(presetData.name);
                    $("input[name=sort]").val(presetData.sort);
                    $("input[name=width]").val(presetData.width);
                    $("input[name=height]").val(presetData.height);
                    $("input[name=DPI]").val(presetData.dpi);
                    $("select[name=unit]").val(presetData.unit);
                    // 实现被禁用后但正在使用的unit显示
                    $('select[name=unit]>option[disabled][value!='+presetData.unit+']').remove();
                    layui.form.render("select");
                    $("input[name=remark]").val(presetData.remark);
                    var unit = $("select[name=unit]").find("option:selected").index();
                    var theUnitName = 'Unknown';
                    if (unit >= 0) {
                        theUnitName = unitList[unit * 1].name;
                    }
                    $("#bleedUnit").html("(" + theUnitName + ")");
                    $("input[name=bleedLineTop]").val(presetData.bleedLineTop);
                    $("input[name=bleedLineBottom]").val(presetData.bleedLineBottom);
                    $("input[name=bleedLineIn]").val(presetData.bleedLineIn);
                    $("input[name=bleedLineOut]").val(presetData.bleedLineOut);
                    $("#marginUnit").html("(" + theUnitName + ")");
                    $("input[name=marginTop]").val(presetData.marginTop);
                    $("input[name=marginBottom]").val(presetData.marginBottom);
                    $("input[name=marginIn]").val(presetData.marginIn);
                    $("input[name=marginOut]").val(presetData.marginOut);
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
                ++__loadPresetData_fail_number;
                console.log('loadPresetData: 网络错误！');
                if (__loadPresetData_fail_number < 3) {
                    setTimeout(function() {
                        loadPresetData(data, success);
                    }, 100);
                } else {
                    console.log('loadPresetData: 已累计3次请求失败');
                }
            }
        });
    }
    //页边距、出血线输入锁定同步按钮状态监控
    $("#margins_link,#bleed_link").click(function() {
        if ($(this).attr("data") == "lock") {
            $(this).attr("data", "unlock");
            $(this).removeClass("layui-icon-link").addClass("layui-icon-unlink");
        } else {
            $(this).attr("data", "lock");
            $(this).removeClass("layui-icon-unlink").addClass("layui-icon-link");
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
    });
});