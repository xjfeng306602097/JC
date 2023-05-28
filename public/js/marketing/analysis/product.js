/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingAnalysis/product
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer', 'dropdown', 'element'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer
        ,dropdown = layui.dropdown
        ,element = layui.element;
    
    var mmCode = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    // 数据更新的时间（昨天）
    var current_time = new Date(new Date().setDate(new Date().getDate() - 1));

    var selectMM1Default = '',
        selectMM2Default = '';

    // 载入商品的MM选择器
    function loadProductActivity(itemCode) {
        var data = {
            itemCode: itemCode,
            page: 1,
            limit: 10000,
        };
        AjaxRequest({
            url: getApiUrl('marketing.activity.page'),
            method: getApiMethod('marketing.activity.page'),
            data: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
            success: function(result) {
                var oldMM2 = $('#analysisProductSearch select[name="mmCode2"]').val();
                var list = arrayColumn(result.data.records || [], 'mmCode');
                var _MMHtml = '';
                for (var x in parent.mmList) {
                    var disabled = 'disabled';
                    if (list.indexOf(parent.mmList[x].mmCode) !== -1 && parent.mmList[x].mmCode != mmCode) {
                        disabled = '';
                    }
                    _MMHtml += '<option value="' + parent.mmList[x].mmCode + '" ' + disabled + '>' + parent.mmList[x].title + '</option>';
                }
                $('#analysisProductSearch select[name="mmCode"]').html(selectMM1Default + _MMHtml);
                $('#analysisProductSearch select[name="mmCode2"]').html(selectMM2Default + _MMHtml);
                if (mmCode != '' && oldMM2 != '' && list.indexOf(oldMM2) !== -1) {
                    $('#analysisProductSearch select[name="mmCode2"]').val(oldMM2);
                }
                form.render();
            }
        });
    }
    $(document).ready(function(){
        $('#analysisProductSearch input[name="goodsCode"]').change(function() {
            var itemCode = $(this).val();
            if (itemCode != '') {
                current_goodsCode = itemCode;
                loadProductActivity(itemCode);
            }
        });
    });

    // 展示页面
    var _MMHtml = '';
    for (var x in parent.mmList) {
        var disabled = parent.mmList[x].mmCode == mmCode ? 'disabled' : '';
        _MMHtml += '<option value="' + parent.mmList[x].mmCode + '" ' + disabled + '>' + parent.mmList[x].title + '</option>';
    }
    if (mmCode == '') {
        selectMM1Default = '<option value="">Select MM 1</option>';
        selectMM2Default = '<option value="">Select MM 2</option>';
        $('body').prepend($('#body_all').html());
        $('#analysisProductSearch select[name="mmCode"]').html(selectMM1Default + _MMHtml);
        $('#analysisProductSearch select[name="mmCode2"]').html(selectMM2Default + _MMHtml);
        form.render();
    } else {
        selectMM2Default = '<option value="">Select</option>';
        $('body').prepend($('#body_mm').html());
        $('#analysisProductSearch select[name="mmCode"]').html(selectMM1Default + _MMHtml);
        $('#analysisProductSearch select[name="mmCode2"]').html(selectMM2Default + _MMHtml);
        form.render();
        var current_nameEn = '';
        var current_filter = {
            isvalid: 1,
            mmCode: mmCode,
            itemcode: '',
            namethai: current_nameEn,
            page: 1,
            limit: 10000,
        };
        function loadActivityProduct() {
            AjaxRequest({
                url: getApiUrl('marketing.product.page'),
                method: getApiMethod('marketing.product.page'),
                data: current_filter,
                success: function(result) {
                    var _html = '';
                    var list = result.data.records;
                    for (var x in list) {
                        if (list[x].info.itemcode != null && list[x].info.page != null && list[x].info.sort != null) {
                            var checked = list[x].info.itemcode == current_goodsCode ? 'class="layui-menu-item-checked"' : '';
                            _html += '<li lay-options="{id: \'' + list[x].info.id + '\', itemCode: \'' + list[x].info.itemcode + '\'}" ' + checked + ' title="' + list[x].info.namethai + '"><div class="layui-menu-body-title"><span style="color: #AAA;">' + list[x].info.itemcode + '</span> ' + list[x].info.namethai + '</div></li>';
                        }
                    }
                    $('#productList').html(_html);
                    if (current_goodsCode == '') {
                        $('#productList').find('li').first().trigger('click');
                    }
                    if (current_filter.title != '' && list.length == 0) {
                        $('.product-search .search-empty').addClass('layui-show');
                    } else {
                        $('.product-search .search-empty').removeClass('layui-show');
                    }
                }
            });
        }
        loadActivityProduct();

        // 监听左侧商品菜单点击
        dropdown.on('click(productMenu)', function(options) {
            if (current_goodsCode != options.itemCode) {
                current_goodsCode = options.itemCode;
                $('#analysisProductSearch input[name="goodsCode"]').val(current_goodsCode).trigger('change');
                productCompare();
            }
        });
        $(document).ready(function(){
            // 监听搜索MM
            $('#searchProduct').change(function() {
                var value = $(this).val();
                if (value != '') {
                    current_filter.namethai = value;
                    loadActivityProduct();
                }
            });
            $('#searchProduct').on("input propertychange", function() {
                if ($(this).val() == '') {
                    current_filter.namethai = '';
                    loadActivityProduct();
                }
            });
        });
    }

    // 定义初始化的日期
    var startDate = getDateStr(-7, current_time),
        endDate = getDateStr(0, current_time);

    var current_startTime = startDate + ' 00:00:00',
        current_endTime = endDate + ' 23:59:59',
        current_goodsCode = '',
        current_mmCode = mmCode,
        current_mmCode2 = '';

    var now = new Date();
    laydate.render({
        elem: '#time'
        ,range: true
        ,value: startDate + ' - ' + endDate
        ,trigger: 'click'
        ,min: getDateStr(0, now.setMonth(now.getMonth() - 2))
        ,max: endDate
        ,lang: 'en'
    });

    // 返回对应日期
    function getDateStr(day, dateTime) {
        var date = dateTime == null ? new Date() : new Date(dateTime);
        date.setDate(date.getDate() + day);
        var y = date.getFullYear();
        var m = ('0' + (date.getMonth() + 1)).slice(-2);//获取当前月份的日期
        var d = ('0' + date.getDate()).slice(-2);
        return y + '-' + m + '-' + d;
    }
    
    form.verify({
        time: function(value, item) {
            var evt = event || window.event || {};
            if (evt.type == 'click' && ($(evt.target).attr('lay-filter') != 'LAY-marketingAnalysisProduct-front-reset')) {
                if (value == '') {
                    return 'Please select a time period';
                }
            }
            return false;
        }
    });
    // 比对
    form.on('submit(LAY-analysisProduct-front-compare)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        var time = result.time.split(' - ');
        current_startTime = time[0] + ' 00:00:00';
        current_endTime = time[1] + ' 23:59:59';
        current_goodsCode = result.goodsCode;
        if (mmCode == '') {
            current_mmCode = result.mmCode;
        }
        current_mmCode2 = result.mmCode2;
        productCompare();
    });

    // 数据更新的时间（昨天）
    var current_time = new Date(new Date().setDate(new Date().getDate() - 1));

    var current_data;

    // 监听商品比对tab切换
    element.on('tab(productCompareTab)', function() {
        var item = this.getAttribute('lay-item');
        switch (item) {
            case 'product1':
                initLineChart('echarts-product1-chart', current_data.visits, true);
                break;
            case 'product2':
                initLineChart('echarts-product2-chart', current_data.visitors, true);
                break;
        }
    });
    // 对比两个不同MM的商品
    function productCompare() {
        if (current_goodsCode && current_mmCode && current_startTime && current_endTime) {
            $('#productAnalysisCompareResult').html($('#productAnalysisCompareTpl').html());
            var data = {
                goodsCode: current_goodsCode,
                mmCode: current_mmCode,
                mmCode2: current_mmCode2,
                startTime: current_startTime,
                endTime: current_endTime,
            };
            AjaxRequest({
                url: getApiUrl('marketing.analysis.compareProduct'),
                method: getApiMethod('marketing.analysis.compareProduct'),
                data: data,
                success: function(result) {
                    if (result.code == '0000') {
                        current_data = result.data || {};
                        if (current_data.visits) {
                            initLineChart('echarts-product1-chart', current_data.visits, true);
                        }
                    }
                },
                error: function(e) {
                    console.log(e);
                }
            });
        }
    }

    // 图表集合
    var charts = {};

    // 生成线状图
    function initLineChart(id, params, forceRefresh) {
        if (!charts[id] || forceRefresh) {
            var chartDom = document.getElementById(id);
            charts[id] = echarts.init(chartDom);
        }
        var option;
        var legend = [], series = [];
        for (var i in params.list) {
            legend.push(params.list[i].name);
            series.push({
                name: params.list[i].name,
                type: 'line',
                smooth: true,
                data: params.list[i].values
            });
        }
        option = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                top: 5,
                right: '0',
                data: legend
            },
            grid: {
                top: params.top ? params.top : 50,
                left: params.left ? params.left : '3%',
                right: params.right ? params.right : '5%',
                bottom: params.bottom ? params.bottom : '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: params.label
            },
            yAxis: {
                type: 'value',
                minInterval: params.minInterval || 1
            },
            series: series
        };
        option && charts[id].setOption(option, true);
        return charts[id];
    }

});