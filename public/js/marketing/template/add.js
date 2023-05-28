/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingTemplate/add
    
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

    var storage = layui.data(setter.tableName);

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
            if (value == "" || value == null || value * 1 < 72) {
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
            loadRecentData();
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
    // 载入最近创建的模板数据
    function loadRecentData(data) {
        if (data === undefined) {
            data = {
                page: 1,
                limit: 30,
                creator: storage.username,
            };
        }
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
                    // 展示最近使用的模板尺寸列表
                    var recent = result.data.content;
                    if (recent != null && recent.length > 0) {
                        var _Html = '';
                        $.each(recent, function(index, value) {
                            var tmp = recent[index];
                            if (tmp.configDpi == null || tmp.configW == null || tmp.configH == null) {
                                return;
                            }
                            if (unitTypes[tmp.configUnitID] === undefined) {
                                return;
                            }
                            recentSize.push(tmp);
                            _Html += '<li title="' + tmp.name + '">';
                            _Html += '    <div class="preView">';
                            _Html += '        <span>' + tmp.configDpi + 'dpi<br>' + tmp.configW + ' x ' + tmp.configH + ' (' + unitTypes[tmp.configUnitID] + ') </span>';
                            _Html += '    </div>';
                            _Html += '    <div class="tempName">' + tmp.name + '</div>';
                            _Html += '</li>';
                        });
                        $("#recentData ul").html(_Html);
                    } else {
                        var _Html = '<p style="text-align:center;"><br><br>None Data</p>';
                        $("#recentData ul").html(_Html);
                    }
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }
    // 载入预设尺寸数据
    function loadPresetData(data) {
        if (data === undefined) {
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
                    var preset = result.data.records;
                    if (preset != null && preset.length > 0) {
                        var _Html = '';
                        $.each(preset, function(index, value) {
                            var tmp = preset[index];
                            if (unitTypes[tmp.unit] === undefined) {
                                return;
                            }
                            presetSize.push(tmp);
                            _Html += '<li>';
                            _Html += '    <div class="preView">';
                            _Html += '        <span>' + tmp.dpi + 'dpi<br>' + tmp.width + ' x ' + tmp.height + ' (' + unitTypes[tmp.unit] + ') </span>';
                            _Html += '    </div>';
                            _Html += '    <div class="tempName">' + tmp.name + '</div>';
                            _Html += '</li>';
                        });
                        $("#presetData ul").html(_Html);
                        $("#presetData ul").find("li").eq(0).click();
                        $("#configTab .layui-tab-title li").removeClass("layui-this");
                        $("#configTab .layui-tab-title").find("li").eq(1).addClass("layui-this");
                        $("#recentData").removeClass("layui-show");
                        $("#presetData").addClass("layui-show");
                    } else {
                        var _Html = '<p style="text-align:center;"><br><br>None Data</p>';
                        $("#presetData ul").html(_Html);
                        $("#configTab .layui-tab-title li").removeClass("layui-this");
                        $("#configTab .layui-tab-title").find("li").eq(0).addClass("layui-this");
                        $("#presetData").removeClass("layui-show");
                        $("#recentData").addClass("layui-show");
                    }
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
    //Tab Recent的最近创建的模板选中设置模板参数
    $("#recentData ul ").on("click", "li", function() {
        var _configVal = recentSize[$(this).index()];
        console.log(_configVal);
        $("input[name=presetId]").val(_configVal.presetId);
        $("input[name=width]").val(_configVal.configW);
        $("input[name=height]").val(_configVal.configH);
        $("input[name=DPI]").val(_configVal.configDpi);
        $("select[name=unit]").val(_configVal.configUnitID);
        $("select[name=pageOption]").val(_configVal.pageOption);
        layui.form.render("select");
        $("input[name=bleedLineTop]").val(_configVal.bleedLineTop);
        $("input[name=bleedLineBottom]").val(_configVal.bleedLineBottom);
        $("input[name=bleedLineIn]").val(_configVal.bleedLineIn);
        $("input[name=bleedLineOut]").val(_configVal.bleedLineOut);
        $("input[name=marginTop]").val(_configVal.marginTop);
        $("input[name=marginBottom]").val(_configVal.marginBottom);
        $("input[name=marginIn]").val(_configVal.marginIn);
        $("input[name=marginOut]").val(_configVal.marginOut);
        $("#marginUnit").html("(" + unitTypes[_configVal.configUnitID] + ")");
        $("#bleedUnit").html("(" + unitTypes[_configVal.configUnitID] + ")");
        $("#recentData ul li .preView").removeClass("active");
        $("#presetData ul li .preView").removeClass("active");
        $(this).find(".preView").addClass("active");
        //计算页面宽、高px
        calculateUnitToPx();
    });
    //Tab Preset预设页面尺寸选项赋值新增模板参数
    $("#presetData ul").on("click", "li", function() {
        var _configVal = presetSize[$(this).index()];
        $("input[name=presetId]").val(_configVal.id);
        $("input[name=width]").val(_configVal.width);
        $("input[name=height]").val(_configVal.height);
        $("input[name=DPI]").val(_configVal.dpi);
        $("select[name=unit]").val(_configVal.unit);
        layui.form.render("select");
        $("input[name=bleedLineTop]").val(_configVal.bleedLineTop);
        $("input[name=bleedLineBottom]").val(_configVal.bleedLineBottom);
        $("input[name=bleedLineIn]").val(_configVal.bleedLineIn);
        $("input[name=bleedLineOut]").val(_configVal.bleedLineOut);
        $("input[name=marginTop]").val(_configVal.marginTop);
        $("input[name=marginBottom]").val(_configVal.marginBottom);
        $("input[name=marginIn]").val(_configVal.marginIn);
        $("input[name=marginOut]").val(_configVal.marginOut);
        $("#marginUnit").html("(" + unitTypes[_configVal.unit] + ")");
        $("#bleedUnit").html("(" + unitTypes[_configVal.unit] + ")");
        $("#recentData ul li .preView").removeClass("active");
        $("#presetData ul li .preView").removeClass("active");
        $(this).find(".preView").addClass("active");
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
    //根据页面选单尺寸单位、宽、高、dpi、出血线计算转换宽、高px值
    function calculateUnitToPx() {
        $("input[name=pageWidth]").val(0);
        $("input[name=pageHeight]").val(0);
        var unitIndex = $("select[name=unit]").find("option:selected").index() * 1;
        var parma = {};
        parma.unitInch = unitList[unitIndex].unitInch == undefined ? 0 : unitList[unitIndex].unitInch;
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

    $('#pageConfig').click(function() {
        var rowPages = $('select[name=rowPages]').val();
        var index_page = parent.layer.open({
            type: 2
            ,title: 'Config Design Frame'
            ,id: 'configDesignFrame'
            ,content: '/makroDigital/marketingTemplate/configDesignFrame?rowPages=' + rowPages
            ,maxmin: true
            ,area: ['600px', '580px']
            ,btn: ['Save', 'Cancel']
            ,success: function(layero, index) {
                var pageConfig = $('input[name=pageConfig]').val();
                layero.find('iframe').contents().find('input[name=config]').val(pageConfig);
                var interval = setInterval(function() {
                    if (parent['layui-layer-iframe' + index_page].loadConfig) {
                        clearInterval(interval);
                        parent['layui-layer-iframe' + index_page].loadConfig();
                    }
                }, 20);
            }
            ,yes: function (index, layero) {
                var iframeWindow = parent['layui-layer-iframe' + index],
                    submitID = 'LAY-configDesignFrame-save-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);

                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);

                    $('input[name=pageConfig]').val(result.config);
                    
                    var canvasPages = [];
                    var tmpConfig = JSON.parse(result.config);
                    for (var i=0;i<tmpConfig.length;i++){
                        var _dPage = tmpConfig[i].dPage * 1 - 1;
                        if (isEmpty(canvasPages[_dPage])) {
                            canvasPages[_dPage] = {};
                            canvasPages[_dPage].drawCanvas = _dPage;
                            canvasPages[_dPage].textThaiPages = [];
                            canvasPages[_dPage].pageCode = createPageUuid();
                        }

                        canvasPages[_dPage].textThaiPages[tmpConfig[i].sort * 1 - 1] = tmpConfig[i].page;

                    }
                    console.log(canvasPages);

                    parent.layer.close(index);
                });
                submit.trigger('click');
            }
        });
    });


});