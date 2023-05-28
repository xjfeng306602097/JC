// 第三步
var step3 = function() {
    var $ = layui.$,
        setter = layui.setter,
        layer = layui.layer,
        form = layui.form,
        table = layui.table,
        laypage = layui.laypage,
        carousel = layui.carousel;

    var storage = layui.data(setter.tableName);

    var productExcel_filename = '';
    var productExcel_sheetname = '';
    
    // 步骤初始化
    function onLoad() {
        showStep();
        if (window.productData.mmDetails == null) {
            loadProductData();
        }
        initPageConfig();
        // 保存导入的商品Excel信息
        productExcel_filename = window.productData.info.filename;
        productExcel_sheetname = window.productData.info.sheetname;
    }

    // 步骤重新显示
    function onShow(params) {
        showStep();
        if (window.productData.mmDetails == null) {
            loadProductData();
        }
        if (window.productData.info.filename != productExcel_filename || window.productData.info.sheetname != productExcel_sheetname) {
            initPageConfig();
            productExcel_filename = window.productData.info.filename;
            productExcel_sheetname = window.productData.info.sheetname;

            layer.alert('It is detected that the imported product data has changed and the page configuration has been reset', {
                maxWidth: 400,
                time: 8000,
                title: 'Tips',
                btn: 'Close',
                icon: 7
            });
        }
    }

    // 在当前步骤时触发
    function showStep() {
        // 表单form值验证
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
                var _w = $('input[name="template.width"]').val();
                var _h = $('input[name="template.height"]').val();
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
            },
        });
    }
    var previewCarousel;
    var previewPage = 1;
    var pageData = [];
    previewCarousel = carousel.render({
        elem: '#preview',
        width: '100%', //设置容器宽度
        height: '561px', //设置容器高度
        arrow: 'hover', //始终显示箭头
        autoplay: false,
    });
    // 切换页面事件
    carousel.on('change(preview)', function(obj) {
        previewPage = obj.index + 1;
        $('.preview-page .preview-page-current').text(previewPage);
        console.log('page', previewPage);
        preview(previewPage);
    });

    var templateList = [];
    var unitList = [];
    var unitTypes = {};
    // 选中的类型
    var selected_type = '';
    var selected_id = '';
    var selected_template = null;
    // 单位切换事件监控
    form.on('select(unit)', function(data) {
        $("#marginUnit").html("(" + data.elem[data.elem.selectedIndex].text + ")");
        $("#bleedUnit").html("(" + data.elem[data.elem.selectedIndex].text + ")");
        calculateUnitToPx();
    });
    var template_page = 1;
    var template_limit = 8;
    var template_pageOption = '1';
    var template_pageConfig = [];
    // 切换Design Frame
    form.on('select(pageOption)', function(data) {
        if (data.value != template_pageOption) {
            template_page = 1;
            template_limit = 8;
            template_pageOption = data.value;
            initTemplate();
            initPageConfig();
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
                        jump: function(obj, first) {
                            if (!first) {
                                template_page = obj.curr;
                                template_limit = obj.limit;
                                loadTemplateData();
                            }
                        }
                    });
                }
            });
        }
    });
    $(".template").on("click", "#pageConfig", function() {
        var pageConfig = JSON.parse(JSON.stringify(template_pageConfig));
        console.log(pageConfig);
        layer.open({
            type: 1
            ,title: 'Page Config'
            ,id: 'configDesignFrame'
            ,content: $('#pageConfigHtml').html()
            // ,maxmin: true
            ,area: ['600px', '600px']
            ,btn: ['Save', 'Cancel']
            ,success: function(layero, index) {
                table.render({
                    id: 'configDesignFrameTable'
                    ,elem: '#content-configDesignFrame-list'
                    ,loading: true
                    ,even: true
                    ,height: '460px'
                    ,data: pageConfig
                    ,defaultToolbar: false
                    ,cols: [[
                        {field:'slice', minWidth: 100, title: 'Slice' }
                        ,{field:'dPage', minWidth: 100, title: 'Design Frame' }
                        ,{field:'page', minWidth: 100, title: 'TextThai Page', edit: 'text' }
                    ]],
                    page: false,
                });

                table.on('edit(content-configDesignFrame-list)', function(obj) {
                    var data = obj.data;
                    var value = obj.value;
                    var originalValue = $(this).prev().text();// 修改之前的值
                    if (obj.field == 'page' || obj.field == 'dPage') {
                        if (value !== '' && (!IsNumber(value) || value < 1)) {
                            // obj.tr.find('td[data-field="' + obj.field + '"] input').val(originalValue);
                            obj.data[obj.field] = originalValue;
                            obj.update(obj.data, true);
                            return;
                        }
                    // console.log(obj)

                    } else if (obj.field == 'sort') {
                        if (value == '' || !IsNumber(value) || value < 1) {
                            // obj.tr.find('td[data-field="' + obj.field + '"] input').val(originalValue);
                            obj.data[obj.field] = originalValue;
                            obj.update(obj.data, true);
                            return;
                        }

                    }
                });
            }
            ,yes: function (index, layero) {
                // 修改页面配置
                template_pageConfig = pageConfig;
                setPageConfig(template_pageOption, pageConfig);
                layer.close(index);
            }
        });
    });
    // 载入商品数据
    function loadProductData() {
        $.ajax({
            url: getApiUrl('import.marketingActivity.excelDataToProductData'),
            type: getApiMethod('import.marketingActivity.excelDataToProductData'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: JSON.stringify(window.productData),
            success: function(result) {
                if (result.code === '0000') {
                    window.productData.mmDetails = toMMDetails(result.data);
                } else {
                    layer.alert(result.msg, {
                        maxWidth: 400,
                        title: 'Error',
                        btn: 'Close',
                        icon: 5
                    });
                }
            },
        });
    }
    // 转为MM商品数据
    function toMMDetails(tmpData) {
        var pageData = [];
        for (var i = 0; i < tmpData.length; i++) {
            var page = tmpData[i].info.page * 1;
            if (isEmpty(pageData[page - 1]) == true) {
                pageData[page - 1] = [];
            }
            //info商品基本信息
            var productInfo = tmpData[i].info;
            if (productInfo.linkitemno != null && productInfo.linkitemno != "") {
                if ((productInfo.linkitemno).substring(0, 1) != "/") {
                    productInfo.moreItemCode = productInfo.itemcode + "/" + productInfo.linkitemno;
                } else {
                    productInfo.moreItemCode = productInfo.itemcode + productInfo.linkitemno;
                }
            } else {
                productInfo.moreItemCode = productInfo.itemcode;
            }
            //pic商品主图信息
            productInfo.goodsImage = {};
            productInfo.goodsImage.picid = tmpData[i].info.picid;
            productInfo.goodsImage.itemcode = tmpData[i].info.itemcode;
            //productInfo.goodsImage.rgbOriginPath=tmpData[i].pic.originPath;
            productInfo.goodsImage.rgbOriginPath = tmpData[i].pic.thumbnailPath;
            productInfo.goodsImage.cmykOriginPath = tmpData[i].pic.transformPath;
            productInfo.goodsImage.width = tmpData[i].pic.originWidth;
            productInfo.goodsImage.height = tmpData[i].pic.originHeight;
            //brand商品品牌信息
            if (tmpData[i].brand != null) {
                productInfo.brand = {};
                productInfo.brand.picid = tmpData[i].brand.id;
                productInfo.brand.rgbOriginPath = tmpData[i].brand.pic.originPath;
                productInfo.brand.cmykOriginPath = tmpData[i].brand.pic.transformPath;
                productInfo.brand.width = tmpData[i].brand.pic.originWidth;
                productInfo.brand.height = tmpData[i].brand.pic.originHeight;
            } else {
                productInfo.brand = null;
            }
            //icon商品图标信息
            if (tmpData[i].icons != null) {
                productInfo.icons = [];
                productInfo.icons[0] = null;
                productInfo.icons[1] = null;
                productInfo.icons[2] = null;
                for (var j = 0; j < tmpData[i].icons.length; j++) {
                    switch (tmpData[i].icons[j].iconIndex) {
                        case "Icon1":
                            if (tmpData[i].icons[j].pic != null) {
                                productInfo.icons[0] = {};
                                productInfo.icons[0].name = tmpData[i].icons[j].name;
                                productInfo.icons[0].picid = tmpData[i].icons[j].id;
                                productInfo.icons[0].rgbOriginPath = tmpData[i].icons[j].pic.originPath;
                                productInfo.icons[0].cmykOriginPath = tmpData[i].icons[j].pic.transformPath;
                                productInfo.icons[0].width = tmpData[i].icons[j].pic.originWidth;
                                productInfo.icons[0].height = tmpData[i].icons[j].pic.originHeight;
                            }
                            break;
                        case "Icon2":
                            if (tmpData[i].icons[j].pic != null) {
                                productInfo.icons[1] = {};
                                productInfo.icons[1].name = tmpData[i].icons[j].name;
                                productInfo.icons[1].picid = tmpData[i].icons[j].id;
                                productInfo.icons[1].rgbOriginPath = tmpData[i].icons[j].pic.originPath;
                                productInfo.icons[1].cmykOriginPath = tmpData[i].icons[j].pic.transformPath;
                                productInfo.icons[1].width = tmpData[i].icons[j].pic.originWidth;
                                productInfo.icons[1].height = tmpData[i].icons[j].pic.originHeight;
                            }
                            break;
                        case "Icon3":
                            if (tmpData[i].icons[j].pic != null) {
                                productInfo.icons[2] = {};
                                productInfo.icons[2].name = tmpData[i].icons[j].name;
                                productInfo.icons[2].picid = tmpData[i].icons[j].id;
                                productInfo.icons[2].rgbOriginPath = tmpData[i].icons[j].pic.originPath;
                                productInfo.icons[2].cmykOriginPath = tmpData[i].icons[j].pic.transformPath;
                                productInfo.icons[2].width = tmpData[i].icons[j].pic.originWidth;
                                productInfo.icons[2].height = tmpData[i].icons[j].pic.originHeight;
                            }
                            break;
                    }
                }
            } else {
                productInfo.icons = null;
            }
            //gift商品赠品信息
            if (tmpData[i].gift != null) {
                if (tmpData[i].gift.pic != null) {
                    productInfo.gift = {};
                    // productInfo.gift.picid=tmpData[i].gift.picid;没有该picid字段
                    productInfo.gift.rgbOriginPath = tmpData[i].gift.pic.originPath;
                    productInfo.gift.itemcode = tmpData[i].gift.info.itemcode;
                    productInfo.gift.nameeng = tmpData[i].gift.info.nameeng;
                    productInfo.gift.namethai = tmpData[i].gift.info.namethai;
                    productInfo.gift.cmykOriginPath = tmpData[i].gift.pic.transformPath;
                    productInfo.gift.width = tmpData[i].gift.pic.originWidth;
                    productInfo.gift.height = tmpData[i].gift.pic.originHeight;
                } else {
                    productInfo.gift = null;
                }
            } else {
                productInfo.gift = null;
            }
            //关联商品赠品信息
            if (tmpData[i].linkItems != null) {
                productInfo.linkItems = [];
                for (var j = 0; j < tmpData[i].linkItems.length; j++) {
                    var tmp = {};
                    tmp.lk_nameen = "";
                    tmp.lk_namethai = "";
                    tmp.lk_itemcode = "";
                    tmp.lk_saleunit = "";
                    tmp.lk_pack = "";
                    tmp.lk_description = "";
                    tmp.lk_model = "";
                    tmp.lk_brand = "";
                    tmp.rgbOriginPath = "";
                    tmp.cmykOriginPath = "";
                    tmp.thumbnailPath = "";
                    if (tmpData[i].linkItems[j].pic != null) {
                        tmp.rgbOriginPath = tmpData[i].linkItems[j].pic.originPath;
                        tmp.cmykOriginPath = tmpData[i].linkItems[j].pic.transformPath;
                        tmp.thumbnailPath = tmpData[i].linkItems[j].pic.thumbnailPath;
                    }
                    if (tmpData[i].linkItems[j].info.namethai != null) {
                        tmp.lk_namethai = tmpData[i].linkItems[j].info.namethai;
                    }
                    if (tmpData[i].linkItems[j].info.nameen != null) {
                        tmp.lk_nameen = tmpData[i].linkItems[j].info.nameen;
                    }
                    if (tmpData[i].linkItems[j].info.itemcode != null) {
                        tmp.lk_itemcode = tmpData[i].linkItems[j].info.itemcode;
                    }
                    if (tmpData[i].linkItems[j].info.qty1unit != null) {
                        tmp.lk_saleunit = tmpData[i].linkItems[j].info.qty1unit;
                    }
                    if (tmpData[i].linkItems[j].info.pack != null) {
                        tmp.lk_pack = tmpData[i].linkItems[j].info.pack;
                    }
                    if (tmpData[i].linkItems[j].info.model != null) {
                        tmp.lk_model = tmpData[i].linkItems[j].info.model;
                    }
                    if (tmpData[i].linkItems[j].info.description != null) {
                        tmp.lk_description = tmpData[i].linkItems[j].info.description;
                    }
                    productInfo.linkItems[tmpData[i].linkItems[j].sort * 1 - 1] = tmp;
                }
            } else {
                productInfo.linkItems = null;
            }
            pageData[page - 1][productInfo.sort * 1] = productInfo;
        }
        return pageData;
    }
    // 初始化页面配置数据
    function initPageConfig() {
        template_pageConfig = [];
        var textThaiPages = window.productPages;
        switch (template_pageOption) {
            case "1":
                for (var i = 0; i < textThaiPages.length; i++) {
                    template_pageConfig.push({
                        page: textThaiPages[i],
                        slice: 1,
                        dPage: (i + 1),
                        index: i,
                    });
                }
                break;
            case "2LR":
                var _slice = 1;
                for (var i = 0; i < textThaiPages.length; i++) {
                    template_pageConfig.push({
                        page: textThaiPages[i],
                        slice: (_slice),
                        dPage: Math.ceil((i + 1) / 2),
                        index: i,
                    });
                    _slice = (_slice + 1 > 2) ? 1 : _slice + 1;
                }
                break;
            case "2TB":
                var _slice = 1;
                for (var i = 0; i < textThaiPages.length; i++) {
                    template_pageConfig.push({
                        page: textThaiPages[i],
                        slice: (_slice),
                        dPage: Math.ceil((i + 1) / 2),
                        index: i,
                    });
                    _slice = (_slice + 1 > 2) ? 1 : _slice + 1;
                }
                break;
            case "4LRTB":
                var _slice = 1;
                for (var i = 0; i < textThaiPages.length; i++) {
                    template_pageConfig.push({
                        page: textThaiPages[i],
                        slice: (_slice),
                        dPage: Math.ceil((i + 1) / 4),
                        index: i,
                    });
                    _slice = (_slice + 1 > 4) ? 1 : _slice + 1;
                }
                break;
        }
        setPageConfig(template_pageOption, template_pageConfig);
    }
    // 设置模板页面配置
    function setPageConfig(pageOption, pageConfig) {
        setTimeout(function() {
            var canvasPages = [];
            for (var i = 0; i < pageConfig.length; i++) {
                var _dPage = pageConfig[i].dPage * 1 - 1;
                if (isEmpty(canvasPages[_dPage])) {
                    canvasPages[_dPage] = {};
                    canvasPages[_dPage].drawCanvas = _dPage;
                    canvasPages[_dPage].textThaiPages = [];
                    canvasPages[_dPage].pageCode = createPageUuid();
                }
                canvasPages[_dPage].textThaiPages[pageConfig[i].slice * 1 - 1] = pageConfig[i].page;
            }
            window.templatePage = {
                pageOption: pageOption,
                pageConfig: pageConfig,
                canvasPages: canvasPages,
            };
        });
    }
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
                    jump: function(obj, first) {
                        if (!first) {
                            template_page = obj.curr;
                            template_limit = obj.limit;
                            loadTemplateData();
                        }
                    }
                });
            }
        });
    });
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
                sortItems: [{
                    column: "sort",
                    asc: false
                }, {
                    column: "gmtCreate",
                    asc: true
                }],
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
                        $('select[name="template.unit"]').html(_Html);
                        form.render("select");
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
    //Tab Template模板选中设置模板参数
    $("#templateData ul").on("click", "li", function() {
        $(".editBox").removeClass("editNone");
        $(".editBox").addClass("editDisabled");
        $(".editBox input, .editBox select").prop('disabled', true);
        var _configVal = templateList[$(this).index()];
        selected_type = 'template';
        selected_id = _configVal.id;
        selected_template = _configVal;
        form.val('quick-step3', {
            'templateCode': _configVal.code,
            'template.name': _configVal.name,
            'template.width': _configVal.configW,
            'template.height': _configVal.configH,
            'template.DPI': _configVal.configDpi,
            'template.unit': _configVal.configUnitID,
            'template.bleedLineTop': _configVal.bleedLineTop,
            'template.bleedLineBottom': _configVal.bleedLineBottom,
            'template.bleedLineIn': _configVal.bleedLineIn,
            'template.bleedLineOut': _configVal.bleedLineOut,
            'template.marginTop': _configVal.marginTop,
            'template.marginBottom': _configVal.marginBottom,
            'template.marginIn': _configVal.marginIn,
            'template.marginOut': _configVal.marginOut,
        });
        $("#marginUnit").html("(" + unitTypes[_configVal.configUnitID] + ")");
        $("#bleedUnit").html("(" + unitTypes[_configVal.configUnitID] + ")");
        $("#templateData ul li").removeClass("active");
        form.render();
        $(this).addClass("active");
        //计算页面宽、高px
        calculateUnitToPx();
        selectTemplate(_configVal.code);
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
            form.val('quick-step3', {
                'template.marginTop': _value,
                'template.marginBottom': _value,
                'template.marginIn': _value,
                'template.marginOut': _value,
            });
        }
    });
    //出血线值输入监控
    $(".bleedInput input").on("input", function(e) {
        var _value = $(this).val();
        if ($("#bleed_link").attr("data") == "lock") {
            form.val('quick-step3', {
                'template.bleedLineTop': _value,
                'template.bleedLineBottom': _value,
                'template.bleedLineIn': _value,
                'template.bleedLineOut': _value,
            });
        }
        calculateUnitToPx();
    });
    //根据页面选单尺寸单位、宽、高、dpi、出血线计算转换宽、高px值
    function calculateUnitToPx() {
        var pageWidth = 0;
        var pageHeight = 0;
        var unitIndex = $('select[name="template.unit"]').find("option:selected").index() * 1;
        var result = form.val('quick-step3');
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
        form.val('quick-step3', {
            'template.pageWidth': pageWidth,
            'template.pageHeight': pageHeight,
        });
    }
    // 初始化模板信息
    function initTemplate() {
        $(".editBox").addClass("editNone");
        $(".editBox").addClass("editDisabled");
        $(".editBox input, .editBox select").prop('disabled', false);
        selected_type = '';
        selected_id = '';
        selected_template = null;
        form.val('quick-step3', {
            'templateCode': '',
            'template.name': '',
            'template.width': '',
            'template.height': '',
            'template.DPI': '',
            'template.unit': '',
            'template.bleedLineTop': '',
            'template.bleedLineBottom': '',
            'template.bleedLineIn': '',
            'template.bleedLineOut': '',
            'template.marginTop': '',
            'template.marginBottom': '',
            'template.marginIn': '',
            'template.marginOut': '',
            'template.pageWidth': '',
            'template.pageHeight': '',
        });
        form.render();
    }
    // 选择模板
    function selectTemplate(templateCode) {
        $('.template').addClass('template-checked');
        initPreview(templateCode);
        AjaxRequest({
            url: getApiUrl('marketing.template.detail', { code: templateCode }),
            method: getApiMethod('marketing.template.detail'),
            success: function(result) {
                if (result.code === "0000") {
                    selected_template = result.data;
                    preview(1);
                    // var templateList = selected_template.templatePageList;
                    // var pageArr = {};
                    // for (var i = 0; i < templateList.length; i++) {
                    //     if (templateList[i].isValid * 1 == 1) {
                    //         var templatePage = templateList[i];
                    //         var duplicate = templatePage.content.duplicate;
                    //         //取有效副本主版
                    //         for (var n in duplicate) {
                    //             var row = duplicate[n];
                    //             if (row.isValid * 1 == 0) {
                    //                 var page = templatePage.sort * 1;
                    //                 pageArr[page] = row.objects || [];
                    //             }
                    //         }
                    //     }
                    // }
                    // // 模板页面商品位置
                    // pageData = [];
                    // var mmSortList = [];
                    // var sort = 1;
                    // for (var page in pageArr) {
                    //     for (var i = 0; i < pageArr[page].length; i++) {
                    //         var item = pageArr[page][i];
                    //         if (item.dType == 'Product' && item.dSort && item.visible) {
                    //             if (mmSortList.indexOf(item.dSort) === -1) {
                    //                 mmSortList.push(item.dSort);
                    //                 pageData.push({
                    //                     page: page * 1,
                    //                     index: i, // 组件索引
                    //                     sort: sort, // 商品所在序号
                    //                     mmSort: item.dSort, // 模板的MM sort
                    //                     itemCode: '',
                    //                     product: null,
                    //                 });
                    //                 ++sort;
                    //             }
                    //         }
                    //     }
                    // }
                    // initPageDataTable(pageData);
                    // console.log(pageData);
                } else {
                    layer.msg(result.msg);
                }
            },
        });
        // var productSegment = chooseProductSegment.getValue();
        // var productSegmentHtml = '';
        // for (var i in productSegment) {
        //     productSegmentHtml += '<option value="' + productSegment[i].value + '">' + productSegment[i].name + '</option>'
        // }
        // $('#marketingProductSearch select[name="segmentId"]').html(productSegmentHtml);
        // layui.form.render();
        // var segmentId = chooseProductSegment.getValue('value')[0];
        // initSelectProductTable(segmentId, {});
    }
    // 预览初始化
    function initPreview() {
        previewPage = 1;
        var pages = selected_template.templatePageList.length;
        // 加载时的图片
        var loadingImage = '/img/loading.gif';
        var previewHtml = '';
        for (var i = 1; i <= pages; i++) {
            previewHtml += '<div class="item"><div class="item-image"><a href="" target="_blank"><img src="' + loadingImage + '" data-src="" alt="page ' + i + '"></a></div></div>';
        }
        $('#preview [carousel-item]').html(previewHtml);
        $('#preview>[carousel-item]').siblings().remove();
        $('.preview-page .preview-page-total').text(pages);
        $('.preview-page .preview-page-current').text(previewPage);
        $('#preview-refresh').removeClass('layui-btn-disabled');
        previewCarousel.reload({
            index: 0,
        });
        $(document).on('click', '#preview-refresh', function(e) {
            console.log('page', previewPage, 'refresh');
            preview(previewPage, true);
        });
    }
    // 预览
    function preview(page, force) {
        // 模板code
        var templateCode = selected_template.code;
        // 模板页面数据
        var templatePageList = selected_template.templatePageList;
        // 商品数据
        var mmDetails = window.productData.mmDetails || [];
        // 页面配置
        var pageConfigs = window.templatePage.canvasPages;
        console.log('模板：' + templateCode);
        // console.log(templatePageList, mmDetails, pageConfigs);

        var previewUrl = [];
        if (selected_template.previewMap != null) {
            var previewMap = JSON.parse(selected_template.previewMap);
            if (Array.isArray(previewMap.data)) {
                for (var i in previewMap.data) {
                    previewUrl.push(previewMap.data[i].previewUrl);
                }
            }
        }
        var pageIndex = page - 1;
        // 使用模板预览图
        var src = previewUrl[pageIndex] || '';
        var item = $('#preview [carousel-item] .item').eq(pageIndex);
        if (item.find('.item-image img').data('src') == '' || force) {
            item.find('.item-image a').attr('href', src);
            item.find('.item-image img').attr('src', src);
            item.find('.item-image img').data('src', src);
        }
    }
    // var selectIndex = 0;
    // var selectObj = null;
    // var selectProduct = null;
    // // 载入模板页面数据
    // function initPageDataTable(data) {
    //     var tableObj = table.render({
    //         id: 'activityPageProductTable',
    //         elem: '#content-activity-pageProduct-list',
    //         height: 'full-97',
    //         loading: true,
    //         toolbar: true,
    //         toolbar: '#activityPageProductToolbar',
    //         defaultToolbar: ['filter', 'exports'],
    //         cols: [[
    //             {width: 80, title: 'Serial', type: 'numbers' }
    //             ,{field: 'page', width: 90, title: 'Page', sort: true, hide: true }
    //             ,{field: 'mmSort', width: 100, title: 'MM Sort' }
    //             ,{minWidth: 120, title: 'Product', templet: '#content-activity-pageProduct-product' }
    //         ]],
    //         data: data,
    //         page: false,
    //         renderAfter: function() {
    //             var tr = $('#content-activity-pageProduct-list+.layui-table-view .layui-table-body tbody>tr').eq(selectIndex);
    //             // 触发选中
    //             setTimeout(function() {
    //                 tr.trigger('click');
    //             });
    //         },
    //     });
    //     table.on('row(content-activity-pageProduct-list)', function(obj) {
    //         var index = obj.tr.index();
    //         selectObj = obj;
    //         obj.tr.addClass('layui-table-click').siblings().removeClass('layui-table-click');
    //         obj.tr.find('i[class="layui-anim layui-icon"]').trigger('click');
    //         // 当切换MM Sort时，清空商品选中状态
    //         if (index != selectIndex && selectProduct) {
    //             var checkSelectProduct = table.checkStatus('activitySelectProductTable');
    //             if (checkSelectProduct.data.length > 0) {
    //                 checkSelectProduct.data[0].LAY_CHECKED = false;
    //             }
    //             table.reload('activitySelectProductTable');
    //             selectProduct = null;
    //         }
    //         selectIndex = index;
    //     });
    //     return tableObj;
    // }
    // // 选择商品table
    // function initSelectProductTable(segmentId, search) {
    //     $('#marketingProductSearch select[name="segmentId"]').val(segmentId);
    //     layui.form.render();
    //     var tableObj = table.render({
    //         id: 'activitySelectProductTable',
    //         elem: '#content-activity-selectProduct-list',
    //         height: 'full-213',
    //         loading: true,
    //         even: true,
    //         url: getApiUrl('product.page'),
    //         method: getApiMethod('product.page'),
    //         headers: {
    //             'Authorization': 'Bearer ' + storage.access_token
    //         },
    //         toolbar: true,
    //         defaultToolbar: ['filter', 'exports'],
    //         parseData: function(res) {
    //             if (res.code === "0000") {
    //                 return {
    //                     code: 0,
    //                     count: res.data.total,
    //                     data: res.data.records
    //                 }
    //             }
    //         },
    //         cols: [[
    //             {type: 'radio', width: 60, fixed: 'left'}
    //             ,{field: 'itemcode', width: 100, title: 'Item Code'}
    //             ,{field: 'thumbnailPath', width: 80, title: 'Picture', templet: imgTpl}
    //             ,{field: 'namethai', minWidth: 120, title: 'Name (Thai)'}
    //             ,{field: 'nameen', minWidth: 120, title: 'Name (EN)'}
    //         ]],
    //         where: {
    //             segmentId: segmentId,
    //             nameen: search.nameen || '',
    //             namethai: search.namethai || '',
    //             itemcode: search.itemcode || '',
    //             isvalid: 1,
    //         },
    //         page: true,
    //         limit: 10,
    //         limits: [10, 20, 30, 50, 100, 150, 200],
    //     });
    //     table.on('radio(content-activity-selectProduct-list)', function(obj) {
    //         var index = obj.tr.index();
    //         selectProduct = obj.checked ? obj : null;
    //         selectObj.update({
    //             itemCode: obj.data.itemcode,
    //             product: obj.data,
    //         }, true);
    //         // 兼容layui老版本
    //         // table.reload('activityPageProductTable');
    //     });
    //     return tableObj;
    // }
    // // 搜索商品
    // form.on('submit(LAY-marketingProduct-front-search)', function(obj) {
    //     var field = JSON.stringify(obj.field);
    //     var result = JSON.parse(field);
    //     var segmentId = result.segmentId;
    //     initSelectProductTable(segmentId, {
    //         itemcode: result.itemcode,
    //     });
    // });
    // // 重置搜索商品
    // form.on('submit(LAY-marketingProduct-front-reset)', function(obj) {
    //     form.val('marketingProductSearch', {
    //         segmentId: '',
    //         itemcode: '',
    //     });
    //     form.render();
    //     var segmentId = chooseProductSegment.getValue('value')[0];
    //     initSelectProductTable(segmentId, {
    //         itemcode: '',
    //     });
    // });

    return {
        onLoad: onLoad,
        onShow: onShow,
    };
};