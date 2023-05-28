/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingActivity/selectTemplate
    
 */
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'laydate', 'layer', 'laypage'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form
        ,laypage = layui.laypage;

    var storage = layui.data(setter.tableName);

    var templateList = [];
    var presetList = [];
    var unitList = [];
    var unitTypes = {};

    // 选中的类型
    var selected_type = '';
    var selected_id = '';
    //init();
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
            if (value == '' || value == null || value * 1 < 72) {
                return 'The Dpi cannot be empty and less than 72';
            } else if (value * 1 > 300) {
                return 'Maximum DPI cannot exceed 300';
            }
        },
        //页边距
        checkMargins: function(value) {
            var _w = $('input[name="width"]').val();
            var _h = $('input[name="height"]').val();
            if (value == '' || value == null || value * 1 < 0) {
                return 'Cannot be empty or less than 0';
            } else if (value * 1 > (_w * 0.1)) {
                return 'Margins cannot be greater than 10% of the page';
            }
        },
        //出血线
        checkBleed: function(value) {
            if (value == '' || value == null || value * 1 < 0) {
                return 'Cannot be empty or less than 0';
            } else if (value * 1 > 20) {
                return 'Bleeding line cannot be larger than 20mm';
            }
        }
    });
    var template_page = 1;
    var template_limit = 8;
    var preset_page = 1;
    var preset_limit = 8;
    var template_pageOption = '';

    //初始化页面
    window.init = function(pageOption='') {

        template_page = 1;
        template_limit = 8;
        preset_page = 1;
        preset_limit = 8;
        template_pageOption = pageOption;
        // 载入unit后再依次载入其他数据
        loadUnit(null, function() {
            loadTemplateData(function(res) {
                if (res.data.totalElements >= 1) {
                    // 载入分页
                    var total = res.data.totalElements;
                    laypage.render({
                        elem: 'templatePage',
                        count: total,
                        curr: template_page,
                        limit: template_limit,
                        limits: [8, 16, 40, 100, 200],
                        prev: 'Prev',
                        next: 'Next',
                        layout: ['prev', 'page', 'next', 'count', 'limit', 'refresh'],
                        jump: function (obj, first) {
                            if (!first) {
                                template_page = obj.curr;
                                template_limit = obj.limit;
                                loadTemplateData();
                            }
                        }
                    });
                }
            });
            loadPresetData(function(res) {
                if (res.data.total >= 1) {
                    // 载入分页
                    var total = res.data.total;
                    laypage.render({
                        elem: 'presetPage',
                        count: total,
                        curr: preset_page,
                        limit: preset_limit,
                        limits: [8, 16, 40, 100, 200],
                        prev: 'Prev',
                        next: 'Next',
                        layout: ['prev', 'page', 'next', 'count', 'limit', 'refresh'],
                        jump: function (obj, first) {
                            if (!first) {
                                preset_page = obj.curr;
                                preset_limit = obj.limit;
                                loadPresetData();
                            }
                        }
                    });
                }
            });
        });
    }
    // 载入unit数据
    var __loadUnit_fail_number = 0;
    function loadUnit(data, success) {
        if (data == undefined) {
            data = {
                req: {
                    status: 1,
                },
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
                            _Html += '<option value="' + tmp.id + '">' + tmp.name + '</option>';
                        });
                        $('select[name="unit"]').html(_Html);
                        layui.form.render("select");
                    }
                    success && success(result);
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
    // 载入模板列表数据
    function loadTemplateData(success) {
        var data = {
            page: template_page,
            limit: template_limit,
            status: 3,
            pageOption: template_pageOption
        };

        $.ajax({
            url: getApiUrl('marketing.template.page'),
            type: getApiMethod('marketing.template.page'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: data,
            success: function(result) {
                if (result.code === "0000") {
                    // 展示模板列表
                    var list = result.data.content;
                    if (list != null && list.length > 0) {
                        var _Html = '';
                        templateList = [];
                        $.each(list, function(index, value) {
                            var tmp = list[index];
                            if (tmp.configDpi == null || tmp.configW == null || tmp.configH == null) {
                                return;
                            }
                            if (unitTypes[tmp.configUnitID] === undefined) {
                                return;
                            }
                            templateList.push(tmp);
                            var active = selected_type == 'template' && selected_id == tmp.id ? 'active' : '';
                            _Html += '<li class="' + active + '" title="' + tmp.name + '">';
                            _Html += '    <div class="tempImg">';
                            _Html += '        <span>' + tmp.configDpi + 'dpi<br>' + tmp.configW + ' x ' + tmp.configH + ' (' + unitTypes[tmp.configUnitID] + ') </span>';
                            _Html += '    </div>';
                            _Html += '    <div class="tempName">' + tmp.name + '</div>';
                            _Html += '</li>';
                        });
                        $("#templateData ul").html(_Html);
                        $("#configTab .layui-tab-title li").removeClass("layui-this");
                        $("#configTab .layui-tab-title").find("li").eq(0).addClass("layui-this");
                        $("#presetData").removeClass("layui-show");
                        $("#templateData").addClass("layui-show");
                    } else {
                        var _Html = '<p style="text-align:center;"><br><br>None Data</p>';
                        $("#templateData ul").html(_Html);
                    }
                    success && success(result);
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }
    // 载入预设尺寸数据
    function loadPresetData(success) {
        var data = {
            req: {
                status: 1,
            },
            page: preset_page,
            limit: preset_limit,
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
            url: getApiUrl('marketing.preset.page'),
            type: getApiMethod('marketing.preset.page'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: JSON.stringify(data),
            success: function(result) {
                if (result.code === "0000") {
                    // 展示预设的模板尺寸列表
                    var list = result.data.records;
                    if (list != null && list.length > 0) {
                        var _Html = '';
                        presetList = [];
                        $.each(list, function(index, value) {
                            var tmp = list[index];
                            if (unitTypes[tmp.unit] === undefined) {
                                return;
                            }
                            presetList.push(tmp);
                            var active = selected_type == 'blank' && selected_id == tmp.id ? 'active' : '';
                            _Html += '<li class="' + active + '" title="' + tmp.name + '">';
                            _Html += '    <div class="tempImg">';
                            _Html += '        <span>' + tmp.dpi + 'dpi<br>' + tmp.width + ' x ' + tmp.height + ' (' + unitTypes[tmp.unit] + ') </span>';
                            _Html += '    </div>';
                            _Html += '    <div class="tempName">' + tmp.name + '</div>';
                            _Html += '</li>';
                        });
                        $("#presetData ul").html(_Html);
                    } else {
                        var _Html = '<p style="text-align:center;"><br><br>None Data</p>';
                        $("#presetData ul").html(_Html);
                    }
                    success && success(result);
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }
    // 切换tab右侧滚动条置顶
    $("#configTab ul").on("click", "li", function() {
        $(".editBox").scrollTop(0);
    });
    // 设置当前选择的类型
    $(".editBox label.name span").click(function() {
        var index = $(this).data('index');
        if (index !== '') {
            $("#configTab .layui-tab-title").find("li").eq(index).click();
        }
    });
    //Tab Template模板选中设置模板参数
    $("#templateData ul").on("click", "li", function() {
        $(".editBox").removeClass("editNone");
        $(".editBox").addClass("editDisabled");
        $(".editBox input, .editBox select").prop('disabled', true);
        $(".editBox label.name span").text('[Template]').data('index', 0);

        var _configVal = templateList[$(this).index()];
        selected_type = 'template';
        selected_id = _configVal.id;
        form.val('selectTemplate', {
            'type': selected_type,
            'mmTemplateCode': _configVal.code,
            'templateName': _configVal.name,
            'width': _configVal.configW,
            'height': _configVal.configH,
            'DPI': _configVal.configDpi,
            'unit': _configVal.configUnitID,
            'bleedLineTop': _configVal.bleedLineTop,
            'bleedLineBottom': _configVal.bleedLineBottom,
            'bleedLineIn': _configVal.bleedLineIn,
            'bleedLineOut': _configVal.bleedLineOut,
            'marginTop': _configVal.marginTop,
            'marginBottom': _configVal.marginBottom,
            'marginIn': _configVal.marginIn,
            'marginOut': _configVal.marginOut,
        });
        $("#marginUnit").html("(" + unitTypes[_configVal.configUnitID] + ")");
        $("#bleedUnit").html("(" + unitTypes[_configVal.configUnitID] + ")");
        $("#templateData ul li").removeClass("active");
        $("#presetData ul li").removeClass("active");
        layui.form.render();
        $(this).addClass("active");
        //计算页面宽、高px
        calculateUnitToPx();
    });
    //Tab Blank Page空白页面尺寸选项赋值新增模板参数
    $("#presetData ul").on("click", "li", function() {
        $(".editBox").removeClass("editNone");
        $(".editBox").removeClass("editDisabled");
        $(".editBox input, .editBox select").prop('disabled', false);
        $(".editBox label.name span").text('[Blank Page]').data('index', 1);

        var _configVal = presetList[$(this).index()];
        selected_type = 'blank';
        selected_id = _configVal.id;
        form.val('selectTemplate', {
            'type': selected_type,
            'mmTemplateCode': '',
            'templateName': _configVal.name,
            'width': _configVal.width,
            'height': _configVal.height,
            'DPI': _configVal.dpi,
            'unit': _configVal.unit,
            'bleedLineTop': _configVal.bleedLineTop,
            'bleedLineBottom': _configVal.bleedLineBottom,
            'bleedLineIn': _configVal.bleedLineIn,
            'bleedLineOut': _configVal.bleedLineOut,
            'marginTop': _configVal.marginTop,
            'marginBottom': _configVal.marginBottom,
            'marginIn': _configVal.marginIn,
            'marginOut': _configVal.marginOut,
        });
        $("#marginUnit").html("(" + unitTypes[_configVal.unit] + ")");
        $("#bleedUnit").html("(" + unitTypes[_configVal.unit] + ")");
        $("#templateData ul li").removeClass("active");
        $("#presetData ul li").removeClass("active");
        layui.form.render();
        $(this).addClass("active");
        //计算页面宽、高px
        calculateUnitToPx();
    });
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
            form.val('selectTemplate', {
                'marginTop': _value,
                'marginBottom': _value,
                'marginIn': _value,
                'marginOut': _value,
            });
        }
    });
    //出血线值输入监控
    $(".bleedInput input").on("input", function(e) {
        var _value = $(this).val();
        if ($("#bleed_link").attr("data") == "lock") {
            form.val('selectTemplate', {
                'bleedLineTop': _value,
                'bleedLineBottom': _value,
                'bleedLineIn': _value,
                'bleedLineOut': _value,
            });
        }
        calculateUnitToPx();
    });
    //根据页面选单尺寸单位、宽、高、dpi、出血线计算转换宽、高px值
    function calculateUnitToPx() {
        var pageWidth = 0;
        var pageHeight = 0;
        var unitIndex = $('select[name="unit"]').find("option:selected").index() * 1;
        var result = form.val('selectTemplate');

        var unitInch = (isEmpty(unitList[unitIndex].unitInch) || unitList[unitIndex].unitInch * 1 < 0) ? 0 : unitList[unitIndex].unitInch * 1;
        var width = isEmpty(result.width) ? 0 : result.width * 1;
        var height = isEmpty(result.height) ? 0 : result.height * 1;
        var dpi = isEmpty(result.DPI) ? 0 : result.DPI * 1;
        var bleedLineTop = (isEmpty(result.bleedLineTop) || result.bleedLineTop * 1 < 0) ? 0 : result.bleedLineTop * 1;
        var bleedLineBottom = (isEmpty(result.bleedLineBottom) || result.bleedLineBottom * 1 < 0) ? 0 : result.bleedLineBottom * 1;
        var bleedLineIn = (isEmpty(result.bleedLineIn) || result.bleedLineIn * 1 < 0) ? 0 : result.bleedLineIn * 1;
        var bleedLineOut = (isEmpty(result.bleedLineOut) || result.bleedLineOut * 1 < 0) ? 0 : result.bleedLineOut * 1;

        if (width > 0 && height > 0 && dpi >= 72 && unitInch > 0) {
            pageWidth = Math.round((width + bleedLineIn + bleedLineOut) / unitInch * dpi);
            pageHeight = Math.round((height + bleedLineTop + bleedLineBottom) / unitInch * dpi);
        }
        if (pageWidth <= 0 || pageHeight <= 0) {
            pageWidth = 0;
            pageHeight = 0;
        }
        form.val('selectTemplate', {
            'pageWidth': pageWidth,
            'pageHeight': pageHeight,
        });
    }
    // 初始化模板信息
    window.initTemplate = function () {
        $(".editBox").addClass("editNone");
        $(".editBox").addClass("editDisabled");
        $(".editBox input, .editBox select").prop('disabled', false);
        $(".editBox label.name span").text('').data('index', null);

        selected_type = '';
        selected_id = '';
        form.val('selectTemplate', {
            'type': '',
            'mmTemplateCode': '',
            'templateName': '',
            'width': '',
            'height': '',
            'DPI': '',
            'unit': '',
            'bleedLineTop': '',
            'bleedLineBottom': '',
            'bleedLineIn': '',
            'bleedLineOut': '',
            'marginTop': '',
            'marginBottom': '',
            'marginIn': '',
            'marginOut': '',
            'pageWidth': '',
            'pageHeight': '',
        });
        $("#templateData ul li").removeClass("active");
        $("#presetData ul li").removeClass("active");
        layui.form.render();
    }
});