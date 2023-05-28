/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingAnalysis/panel
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer', 'dropdown', 'element', 'dict'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer
        ,dropdown = layui.dropdown
        ,element = layui.element
        ,dict = layui.dict;
    
    var current_mmCode = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    // 渠道
    var channels = {
        'email': 'email',
        'sms': 'sms',
        'line': 'line',
        'facebook': 'facebook',
        'app': 'app',
    };
    // 客户类型
    var customerTypes = {
        'FR': 'FR',
        'NFR': 'NFR',
        'HO': 'HO',
        'SV': 'SV',
        'DT': 'DT',
        'OT': 'OT',
    };

    /* 定义 Summary 变量 */
    // 数据更新的时间（今天）
    var current_time = new Date();
    var summary_startDate = getDateStr(-7, current_time),
        summary_endDate = getDateStr(0, current_time);

    /* 定义 Real-time 变量 */
    var mmTitles = [];
    var current_date = getDateStr(0),
        compare_mmCode = current_mmCode,
        compare_date = getDateStr(-1);

    // 数据统计
    function initStats(data) {
        // $('#stat .update-time').text(data.lastUpdateTime);
        for (var x in data) {
            var item = $('.STATS .STATS-item[stats-item="' + x + '"]');
            if (item.length > 0) {
                // item.find('.STATS-count').text(count);
                // item.find('.item-column[stats-type="yesterday"] .item-column-label').attr('date', data[x].summary.yesterday.date);
                item.find('.item-column[stats-type="yesterday"] .item-column-value').eq(0).html(data[x].summary.yesterday.count);
                item.find('.item-column[stats-type="yesterday"] .item-column-value').eq(1).html(colorTag(data[x].summary.yesterday.chain));
                item.find('.item-column[stats-type="yesterday"] .item-column-value').eq(2).html(colorTag(percentage(data[x].summary.yesterday.chainRatio, 2), '%'));
                // item.find('.item-column[stats-type="week"] .item-column-label').attr('date', data[x].summary.week.date);
                item.find('.item-column[stats-type="week"] .item-column-value').eq(0).html(data[x].summary.week.count);
                item.find('.item-column[stats-type="week"] .item-column-value').eq(1).html(colorTag(data[x].summary.week.chain));
                item.find('.item-column[stats-type="week"] .item-column-value').eq(2).html(colorTag(percentage(data[x].summary.week.chainRatio, 2), '%'));
                // item.find('.item-column[stats-type="last_14_days"] .item-column-label').attr('date', data[x].summary.last_14_days.date);
                item.find('.item-column[stats-type="last_14_days"] .item-column-value').eq(0).html(data[x].summary.last_14_days.count);
                item.find('.item-column[stats-type="last_14_days"] .item-column-value').eq(1).html(colorTag(data[x].summary.last_14_days.chain));
                item.find('.item-column[stats-type="last_14_days"] .item-column-value').eq(2).html(colorTag(percentage(data[x].summary.last_14_days.chainRatio, 2), '%'));
                item.find('.item-column .item-column-label i').addClass('layui-icon').html('&#xe68d;');
            }
        }
        // 放置时间上时，显示日期
        // var dateTips;
        // $('.STATS .STATS-item .item-column .item-column-label').hover(function() {
        //     var date = $(this).attr('date');
        //     if (date) {
        //         dateTips = layer.tips('Date: ' + date, this, {
        //             tips: [1, '#73DF92'],
        //             time: 0
        //         });
        //     }
        // }, function() {
        //     layer.close(dateTips);
        // });
    }

    // 图表集合
    var charts = {};

    // 生成线状图
    function initLineChart(id, params, forceRefresh) {
        if (!charts[id] || forceRefresh) {
            var chartDom = document.getElementById(id);
            charts[id] = echarts.init(chartDom);
        }
        if (params.updateTime) {
            $('#' + id).parents('.layui-card').find('.update-time').text(params.updateTime);
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
                right: '0',
                data: legend
            },
            grid: {
                top: params.top ? params.top : 50,
                left: params.left ? params.left : '4%',
                right: params.right ? params.right : '4%',
                bottom: params.bottom ? params.bottom : '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: params.label,
                axisLabel: {
                    interval: 1,
                }
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

    // 生成柱状图
    function initBarChart(id, params, forceRefresh) {
        if (!charts[id] || forceRefresh) {
            var chartDom = document.getElementById(id);
            charts[id] = echarts.init(chartDom);
        }
        var option;
        var labels = [], data = [];
        for (var i in params.list) {
            labels.push(params.list[i].name);
            data.push(params.list[i].value);
        }
        // 选择颜色组
        var colorMode = params.colorMode || 'default';
        var colorTag = params.color || 'default';
        var colors = colorGroup[colorTag];
        option = {
            tooltip: {
                trigger: 'item'
            },
            grid: {
                top: params.top ? params.top : '3%',
                left: params.left ? params.left : '4%',
                right: params.right ? params.right : '4%',
                bottom: params.bottom ? params.bottom : '0',
                borderWidth: 0,
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: labels,
                axisTick: {
                    // alignWithLabel: true
                }
            },
            yAxis: {
                type: 'value',
                name: params.unit,
                minInterval: params.minInterval || 1
            },
            series: [
                {
                    data: data,
                    type: 'bar',
                    barWidth: params.barWidth,
                    barMaxWidth: 40,
                    label: {
                        show: true,
                        position: 'top'
                    },
                    itemStyle: {
                        // 柱子的颜色设置不同颜色
                        color: function (p) {
                            if (colorMode == 'sortByValue') {
                                var color = '#EEE';
                                if (p.value > 0 && p.value <= 50) {
                                    color = colors[0];
                                } else if (p.value > 50 && p.value <= 100) {
                                    color = colors[1];
                                } else if (p.value > 100 && p.value <= 500) {
                                    color = colors[2];
                                } else if (p.value > 500 && p.value <= 1000) {
                                    color = colors[3];
                                } else if (p.value > 1000 && p.value <= 5000) {
                                    color = colors[4];
                                } else if (p.value > 5000) {
                                    color = colors[5];
                                }
                                return color;
                            } else {
                                return colors[p.dataIndex % colors.length];
                            }
                        }
                    }
                }
            ]
        };
        option && charts[id].setOption(option, true);
        return charts[id];
    }

    // 生成条状图
    function initHorizontalBarChart(id, params, forceRefresh) {
        if (!charts[id] || forceRefresh) {
            var chartDom = document.getElementById(id);
            charts[id] = echarts.init(chartDom);
        }
        var option;
        var labels = [], data = [];
        for (var i in params.list) {
            labels.push(params.list[i].name);
            data.push(params.list[i].value);
        }
        // 选择颜色组
        var colorTag = params.color || 'default';
        var colors = colorGroup[colorTag];
        option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {},
            grid: {
                top: params.top ? params.top : '3%',
                left: params.left ? params.left : '0',
                right: params.right ? params.right : '4%',
                bottom: params.bottom ? params.bottom : '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                boundaryGap: [0, 0.01],
                minInterval: params.minInterval || 1
            },
            yAxis: {
                type: 'category',
                data: labels,
                inverse: true,
                axisTick: {
                    // alignWithLabel: true
                }
            },
            series: [
                {
                    data: data,
                    type: 'bar',
                    barWidth: params.barWidth,
                    barMaxWidth: 40,
                    label: {
                        show: true,
                        position: 'right'
                    },
                    itemStyle: {
                        // 柱子的颜色设置不同颜色
                        color: function (p) {
                            return colors[p.dataIndex % colors.length];
                        }
                    }
                }
            ]
        };
        option && charts[id].setOption(option, true);
        return charts[id];
    }

    // 生成饼图
    function initPieChart(id, params, forceRefresh) {
        if (!charts[id] || forceRefresh) {
            var chartDom = document.getElementById(id);
            charts[id] = echarts.init(chartDom);
        }
        var option;
        // 选择颜色组
        var colorTag = params.color || 'default';
        var colors = colorGroup[colorTag];
        option = {
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                right: '0'
            },
            series: [
                {
                    name: 'Access From',
                    type: 'pie',
                    radius: '50%',
                    data: params.list,
                    label: {
                        normal: {
                            show: true,
                            formatter: '{b}: {d}%' //自定义显示格式(b:name, c:value, d:百分比)
                        }
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        }
                    },
                    itemStyle: {
                        // 柱子的颜色设置不同颜色
                        color: function (p) {
                            return colors[p.dataIndex % colors.length];
                        }
                    }
                }
            ],
        };
        option && charts[id].setOption(option, true);
        return charts[id];
    }

    // 生成横着的Table
    function initHorizontalTable(id, params) {
        var labels = [], data = [], lists = {};
        for (var i in params.data) {
            var key = i;
            var label = {
                field: key,
                minWidth: 200,
                title: params.data[i].name,
            };
            if (params.data[i].html === true) {
                label.templet = function(res) {
                    return params.data[i].value;
                };
            } else if (params.data[i].list !== null) {
                lists[key] = params.data[i].list;
                label.templet = function(res) {
                    var list = lists[this.field] || [];
                    var items = list.slice(0, 2).join('/') || '';
                    if (items == '') {
                        return '';
                    }
                    if (list.length > 2) {
                        var allItems = list.join('/');
                        items = '<a copy-clipboard="' + allItems + '" title="' + allItems + '" style="cursor: pointer;">'+ items + '...</a>';
                    }
                    return items + ',Click-' + res[this.field];
                };
            }
            labels.push(label);
        }
        data.push(arrayColumn(params.data, 'value'));
        return table.render({
            id: id
            ,elem: '#' + id
            ,loading: true
            ,data: data
            ,cols: [labels],
            page: false
        });
    }

    // 格式化为百分比数值
    function percentage(number, m) {
        return parseFloat((number * 10000 / 100).toFixed(m));
    }

    // 根据数值返回带颜色的标签
    function colorTag(number, unit) {
        // 为无穷则代表数值为0，给值100
        if (number == Infinity) {
            return '-';
        }
        var color = number > 0 ? 'green' : (number < 0 ? 'red' : 'gray');
        number = number >= 0 ? '+' + number : number;
        unit = unit || '';
        return '<div class="color-' + color + '">' + number + unit + '</div>';
    }

    // 返回对应日期
    function getDateStr(day, dateTime) {
        var date = dateTime == null ? new Date() : new Date(dateTime);
        date.setDate(date.getDate() + day);
        var y = date.getFullYear();
        var m = ('0' + (date.getMonth() + 1)).slice(-2);//获取当前月份的日期
        var d = ('0' + date.getDate()).slice(-2);
        return y + '-' + m + '-' + d;
    }

    var visitsChart, visitorsChart;
    function init() {
        /* Summary 开始 */
        var now = new Date();
        laydate.render({
            elem: '#time'
            ,range: true
            ,value: summary_startDate + ' - ' + summary_endDate
            ,trigger: 'click'
            ,min: getDateStr(0, now.setMonth(now.getMonth() - 2))
            ,max: summary_endDate
            ,lang: 'en'
        });
        dict.request({
            dictCode: 'channel',
            success: function(result) {
                if (result.code === '0000') {
                    channels = {};
                    for (var x in result.data) {
                        var item = result.data[x];
                        channels[item.value] = item.name;
                    }
                }
            },
            complete: function() {
                initSummary();
            }
        });
        /* Summary 结束 */
        /* Statistical data 开始 */
        AjaxRequest({
            url: getApiUrl('marketing.analysis.basicData'),
            method: getApiMethod('marketing.analysis.basicData'),
            data: {
                mmCode: current_mmCode,
            },
            success: function(result) {
                if (result.code == '0000') {
                    initStats(result.data);
                }
            },
            error: function(e) {
                console.log(e);
            }
        });
        /* Statistical data 结束 */
        /* Real-time 开始 */
        mmTitles = arrayColumn(parent.mmList || [], 'title', 'mmCode');
        if (current_mmCode == '') {
            AjaxRequest({
                url: getApiUrl('marketing.analysis.realTimeAccess'),
                method: getApiMethod('marketing.analysis.realTimeAccess'),
                data: {
                    mmCode: current_mmCode,
                    queryDate: '',
                },
                success: function(result) {
                    if (result.code == '0000') {
                        visitsChart = initLineChart('echarts-realTimeVisits-chart', result.data.visits);
                        visitorsChart = initLineChart('echarts-realTimeVisitors-chart', result.data.visitors);
                    }
                },
                error: function(e) {
                    console.log(e);
                }
            });
        } else {
            var _MMHtml = '';
            for (var mmCode in mmTitles) {
                _MMHtml += '<option value="' + mmCode + '">' + mmTitles[mmCode] + '</option>';
            }
            $('#analysisAccessSearch select[name="compareMM"]').html(_MMHtml);
            $('#analysisAccessSearch input[name="currentMM"]').val(mmTitles[current_mmCode]);
            $('#analysisAccessSearch select[name="compareMM"]').val(current_mmCode);

            var minDate = new Date();
            minDate.setMonth(minDate.getMonth() - 2);
            laydate.render({
                elem: 'input[name="currentDate"]'
                ,value: current_date
                ,trigger: 'click'
                ,min: getDateStr(0, minDate)
                ,max: current_date
                ,lang: 'en'
            });
            laydate.render({
                elem: 'input[name="compareDate"]'
                ,value: compare_date
                ,trigger: 'click'
                ,min: getDateStr(0, minDate)
                ,max: current_date
                ,lang: 'en'
            });
            form.render();
            compareMMAccess();
        }
        /* Real-time 结束 */
        // 复制到剪切板
        $(document).on('click', '[copy-clipboard]', function() {
            var text = $(this).attr('copy-clipboard');
            if (copyText(text)) {
                layer.msg('Copy succeeded');
            }
        });
    }
    init();
    
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
    // 搜索
    form.on('submit(LAY-marketingAnalysisSummary-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        var summaryDate = result.summaryDate;
        var begin_end = summaryDate.split(' - ');
        summary_startDate = begin_end[0];
        summary_endDate = begin_end[1];
        initSummary();
    });
    // 导出
    dropdown.render({
        elem: '#LAY-marketingAnalysisSummary-front-export',
        data: [
            {title: 'Export to Excel file', action: 'exportExcel'},
        ],
        click: function(obj) {
            var summaryDate = $('input[name="summaryDate"]').val();
            var begin_end = summaryDate.split(' - ');
            var startDate = begin_end[0];
            var endDate = begin_end[1];
            if (startDate == '' || endDate == '') {
                return;
            }
            switch (obj.action) {
                case 'exportExcel':
                    var data = {
                        mmCode: current_mmCode,
                        startTime: startDate + ' 00:00:00',
                        endTime: endDate + ' 23:59:59',
                    };
                    // 下载文件
                    downloadFile({
                        url: getApiUrl('marketing.analysis.exportSummary') + '?' + $.param(data),
                        method: getApiMethod('marketing.analysis.exportSummary'),
                        fileName: 'summary-' + startDate + '--' + endDate + '.xlsx',
                    });
                    break;
            }
        }
    });

    function initSummary() {
        // 附加数据
        var summaryOfClicks = {
            channels: Object.keys(channels).join(','),
        };
        var summaryAverageStay = {
            channels: Object.keys(channels).join(','),
            customerTypes: Object.keys(customerTypes).join(','),
        };
        var summaryFriends = {
            channels: Object.keys(channels).join(','),
        };

        var data = {
            mmCode: current_mmCode,
            startTime: summary_startDate + ' 00:00:00',
            endTime: summary_endDate + ' 23:59:59',
        };
        AjaxRequest({
            url: getApiUrl('marketing.analysis.behaviorData'),
            method: getApiMethod('marketing.analysis.behaviorData'),
            data: data,
            success: function(result) {
                if (result.code == '0000') {
                    var summaryPVList = [];
                    for (var x in result.data.label) {
                        summaryPVList.push({
                            name: result.data.label[x].substring(5),
                            value: result.data.list[0].values[x],
                        });
                    }
                    var summaryUVList = [];
                    for (var x in result.data.label) {
                        summaryUVList.push({
                            name: result.data.label[x].substring(5),
                            value: result.data.list[1].values[x],
                        });
                    }
                    var summaryNewUVList = [];
                    for (var x in result.data.label) {
                        summaryNewUVList.push({
                            name: result.data.label[x].substring(5),
                            value: result.data.list[3].values[x],
                        });
                    }
                    var item = $('[lay-filter=summaryVisitTab] .layui-tab-title>.layui-this').attr('lay-item');
                    switch (item) {
                        case 'summaryPV':
                            initBarChart('echarts-summaryPV-chart', {list: summaryPVList, top: '5%', bottom: '5%', minInterval: 10, color: 'blue', colorMode: 'sortByValue'});
                            break;
                        case 'summaryUV':
                            initBarChart('echarts-summaryUV-chart', {list: summaryUVList, top: '5%', bottom: '5%', minInterval: 10, color: 'blue', colorMode: 'sortByValue'});
                            break;
                        case 'summaryNewUV':
                            initBarChart('echarts-summaryNewUV-chart', {list: summaryNewUVList, top: '5%', bottom: '5%', minInterval: 10, color: 'blue', colorMode: 'sortByValue'});
                            break;
                    }

                    // 监听访问数据tab切换
                    element.on('tab(summaryVisitTab)', function() {
                        var item = this.getAttribute('lay-item');
                        switch (item) {
                            case 'summaryPV':
                                initBarChart('echarts-summaryPV-chart', {list: summaryPVList, top: '5%', bottom: '5%', minInterval: 10, color: 'blue', colorMode: 'sortByValue'});
                                break;
                            case 'summaryUV':
                                initBarChart('echarts-summaryUV-chart', {list: summaryUVList, top: '5%', bottom: '5%', minInterval: 10, color: 'blue', colorMode: 'sortByValue'});
                                break;
                            case 'summaryNewUV':
                                initBarChart('echarts-summaryNewUV-chart', {list: summaryNewUVList, top: '5%', bottom: '5%', minInterval: 10, color: 'blue', colorMode: 'sortByValue'});
                                break;
                        }
                    });
                }
            },
            error: function(e) {
                console.log(e);
            }
        });
        // 前五页面排行
        function loadSummaryPageTop5(chart, desc) {
            // 调整样式
            var sortTool = $('#' + chart).parent().prev().find('.sort-tool');
            if (desc) {
                sortTool.data('sort', 'desc');
                sortTool.find('i').removeClass('layui-icon-up').addClass('layui-icon-down');
                sortTool.attr('title', 'most');
            } else {
                sortTool.data('sort', 'asc');
                sortTool.find('i').removeClass('layui-icon-down').addClass('layui-icon-up');
                sortTool.attr('title', 'least');
            }
            var chartApis = {
                'echarts-summaryVisitPageTop5-chart': 'marketing.analysis.mostVisitPage',
                'echarts-summaryItemClickPageTop5-chart': 'marketing.analysis.mostItemClickPage',
            };
            var api = chartApis[chart];
            var reqData = Object.assign({}, data, {
                desc: desc
            });
            AjaxRequest({
                url: getApiUrl(api),
                method: getApiMethod(api),
                data: reqData,
                success: function(result) {
                    if (result.code == '0000') {
                        var list = [];
                        for (var x in result.data.label) {
                            list.push({
                                name: 'Page ' + result.data.label[x],
                                value: result.data.list[0].values[x],
                            });
                        }
                        initHorizontalBarChart(chart, {list: list, color: 'rank'});
                    }
                },
                error: function(e) {
                    console.log(e);
                }
            });
        }
        loadSummaryPageTop5('echarts-summaryVisitPageTop5-chart', true);
        loadSummaryPageTop5('echarts-summaryItemClickPageTop5-chart', true);
        // 切换排序
        $('.sort-tool').off('click').on('click', function() {
            var chart = $(this).data('chart');
            var desc = $(this).data('sort') == 'desc';
            desc = !desc;
            loadSummaryPageTop5(chart, desc);
        });
        // 点击量表格
        function loadSummaryOfClicks() {
            var reqData = Object.assign({}, data, summaryOfClicks);
            AjaxRequest({
                url: getApiUrl('marketing.analysis.summaryOfClicks'),
                method: getApiMethod('marketing.analysis.summaryOfClicks'),
                data: reqData,
                success: function(result) {
                    if (result.code == '0000') {
                        var list = result.data;
                        if (current_mmCode != '') {
                            list.push({
                                name: '',
                                value: $('#summary-clicks-list-action').html(),
                                html: true,
                            });
                        }
                        initHorizontalTable('summary-clicks-list', {data: list});
                        // 监听工具条
                        table.on('tool(summary-clicks-list)', function(obj) {
                            // 明细
                            if (obj.event === 'detail') {
                                // var index_page = layer.open({
                                //     type: 1
                                //     ,title: 'Page Details : ' + mmTitles[current_mmCode]
                                //     ,id: 'viewPageDetails'
                                //     ,content: '<div style="padding: 0 20px;"><table class="layui-hide" id="summary-pageDetails-list"></table></div>'
                                //     ,maxmin: true
                                //     ,area: ['900px', '610px']
                                //     ,success: function(layero, index) {
                                //         table.render({
                                //             id: 'pageDetailsTable'
                                //             ,elem: '#summary-pageDetails-list'
                                //             ,loading: true
                                //             ,even: true
                                //             ,url: getApiUrl('marketing.analysis.summaryOfClicksDetail')
                                //             ,method: getApiMethod('marketing.analysis.summaryOfClicksDetail')
                                //             ,headers: {'Authorization': 'Bearer ' + storage.access_token}
                                //             ,toolbar: true
                                //             ,toolbar: '#marketingActivityToolbar'
                                //             ,defaultToolbar: ['filter','exports']
                                //             ,parseData: function(res) {
                                //                 if (res.code==="0000"){
                                //                     return {
                                //                         code: 0,
                                //                         count: res.data.length,
                                //                         data: res.data
                                //                     }
                                //                 }
                                //             }
                                //             ,cols: [[
                                //                 {field:'pageNo', width: 120, title: 'Page No', fixed: 'left', sort: true }
                                //                 ,{field:'totalView', width: 120, title: 'Total view', sort: true }
                                //                 ,{field:'totalClicks', width: 120, title: 'Total Clicks', sort: true }
                                //                 ,{field:'mostItemClick', minWidth: 120, title: 'Most Item Click', sort: true, templet: function(res) {
                                //                     var list = res.mostItem || [];
                                //                     var items = list.slice(0, 2).join('/') || '';
                                //                     if (items == '') {
                                //                         return '';
                                //                     }
                                //                     if (list.length > 2) {
                                //                         var allItems = list.join('/');
                                //                         items = '<a copy-clipboard="' + allItems + '" title="' + allItems + '" style="cursor: pointer;">'+ items + '...</a>';
                                //                     }
                                //                     return items + ',Click-' + res.mostItemClick;
                                //                 }}
                                //                 ,{field:'leastItemClick', minWidth: 120, title: 'Least Item Click', sort: true, templet: function(res) {
                                //                     var list = res.leastItem || [];
                                //                     var items = list.slice(0, 2).join('/') || '';
                                //                     if (items == '') {
                                //                         return '';
                                //                     }
                                //                     if (list.length > 2) {
                                //                         var allItems = list.join('/');
                                //                         items = '<a copy-clipboard="' + allItems + '" title="' + allItems + '" style="cursor: pointer;">'+ items + '...</a>';
                                //                     }
                                //                     return items + ',Click-' + res.leastItemClick;
                                //                 }}
                                //             ]],
                                //             where: reqData,
                                //             page: false
                                //         });
                                //     },
                                // });
                                console.log(reqData)
                                var index_page = layer.open({
                                    type: 2
                                    ,title: 'Item Click : ' + mmTitles[current_mmCode]
                                    ,id: 'viewItemClick'
                                    ,content: '/makroDigital/marketingAnalysis/productClick/' + current_mmCode + '/?startTime=' + reqData.startTime + '&endTime=' + reqData.endTime + '&channel=' + encodeURIComponent(reqData.channels)
                                    ,maxmin: true
                                    ,area: ['1000px', '610px']
                                });
                                layer.full(index_page);
                            }
                        });
                    }
                },
                error: function(e) {
                    console.log(e);
                }
            });
        }
        loadSummaryOfClicks();
        renderSelect('choose-summaryOfClicks-channel', channels, function(list) {
            summaryOfClicks.channels = list.join(',');
            loadSummaryOfClicks();
        }, 'channel');
        // 客户类型饼图
        AjaxRequest({
            url: getApiUrl('marketing.analysis.customerTypePie'),
            method: getApiMethod('marketing.analysis.customerTypePie'),
            data: data,
            success: function(result) {
                if (result.code == '0000') {
                    initPieChart('echarts-summaryCustomerType-chart', {list: result.data, color: 'customerType'});
                }
            },
            error: function(e) {
                console.log(e);
            }
        });
        // 渠道饼图
        AjaxRequest({
            url: getApiUrl('marketing.analysis.channelPie'),
            method: getApiMethod('marketing.analysis.channelPie'),
            data: data,
            success: function(result) {
                if (result.code == '0000') {
                    var list = [];
                    for (var x in result.data) {
                        var item = result.data[x];
                        item.name = channels[item.name] || item.name;
                        list.push(item);
                    }
                    initPieChart('echarts-summaryChannel-chart', {list: list, color: 'channel'});
                }
            },
            error: function(e) {
                console.log(e);
            }
        });
        // 页面停留时间
        function loadSummaryAverageStay() {
            AjaxRequest({
                url: getApiUrl('marketing.analysis.pageStay'),
                method: getApiMethod('marketing.analysis.pageStay'),
                data: Object.assign({}, data, summaryAverageStay),
                success: function(result) {
                    if (result.code == '0000') {
                        var list = [];
                        for (var x in result.data.label) {
                            list.push({
                                name: result.data.label[x],
                                value: result.data.list[0].values[x],
                            });
                        }
                        initBarChart('echarts-summaryAverageStay-chart', {list: list, top: 100, unit: 'second'});
                    }
                },
                error: function(e) {
                    console.log(e);
                }
            });
        }
        loadSummaryAverageStay();
        renderSelect('choose-summaryAverageStay-channel', channels, function(list) {
            summaryAverageStay.channels = list.join(',');
            loadSummaryAverageStay();
        }, 'channel');
        renderSelect('choose-summaryAverageStay-customerType', customerTypes, function(list) {
            summaryAverageStay.customerTypes = list.join(',');
            loadSummaryAverageStay();
        }, 'customerType');
        // 渠道对应的各客户类型数
        function loadSummaryFriends() {
            AjaxRequest({
                url: getApiUrl('marketing.analysis.friends'),
                method: getApiMethod('marketing.analysis.friends'),
                data: Object.assign({}, data, summaryFriends),
                success: function(result) {
                    if (result.code == '0000') {
                        var list = [];
                        for (var x in result.data.label) {
                            list.push({
                                name: result.data.label[x],
                                value: result.data.list[0].values[x],
                            });
                        }
                        initBarChart('echarts-summaryFriends-chart', {list: list, top: 100, color: 'customerType'});
                    }
                },
                error: function(e) {
                    console.log(e);
                }
            });
        }
        loadSummaryFriends();
        renderSelect('choose-summaryFriends-channel', channels, function(list) {
            summaryFriends.channels = list.join(',');
            loadSummaryFriends();
        }, 'channel');
    }

    form.on('submit(LAY-marketingAnalysisAccess-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_date = result.currentDate;
        compare_mmCode = result.compareMM;
        compare_date = result.compareDate;
        compareMMAccess();
    });

    function compareMMAccess() {
        var current, compare;
        var completed = function() {
            var visits = {
                label: [],
                list: []
            };
            var visitors = {
                label: [],
                list: []
            };

            visits.label = current.visits.label;
            visitors.label = current.visitors.label;
            var current_visits = current.visits.list[0];
            current_visits.name = mmTitles[current_mmCode] + ' [' + current_date + ']';
            visits.list.push(current_visits);
            var current_visitors = current.visitors.list[0];
            current_visitors.name = mmTitles[current_mmCode] + ' [' + current_date + ']';
            visitors.list.push(current_visitors);
            if (compare) {
                var compare_visits = compare.visits.list[0];
                compare_visits.name = mmTitles[compare_mmCode] + ' [' + compare_date + ']';
                visits.list.push(compare_visits);
                var compare_visitors = compare.visitors.list[0];
                compare_visitors.name = mmTitles[compare_mmCode] + ' [' + compare_date + ']';
                visitors.list.push(compare_visitors);
            }
            // console.log(visits, visitors);

            visitsChart = initLineChart('echarts-realTimeVisits-chart', visits);
            visitorsChart = initLineChart('echarts-realTimeVisitors-chart', visitors);
        }
        var a = 2;
        AjaxRequest({
            url: getApiUrl('marketing.analysis.realTimeAccess'),
            method: getApiMethod('marketing.analysis.realTimeAccess'),
            data: {
                mmCode: current_mmCode,
                queryDate: current_date,
            },
            success: function(result) {
                if (result.code == '0000') {
                    current = result.data;
                }
            },
            error: function(e) {
                console.log(e);
            },
            complete: function() {
                if (!current) {
                    current = {};
                }
                --a;
                if (a == 0) {
                    completed();
                }
            }
        });
        AjaxRequest({
            url: getApiUrl('marketing.analysis.realTimeAccess'),
            method: getApiMethod('marketing.analysis.realTimeAccess'),
            data: {
                mmCode: compare_mmCode,
                queryDate: compare_date,
            },
            success: function(result) {
                if (result.code == '0000') {
                    compare = result.data;
                }
            },
            error: function(e) {
                console.log(e);
            },
            complete: function() {
                if (!compare) {
                    compare = {};
                }
                --a;
                if (a == 0) {
                    completed();
                }
            }
        });
    }

    // 渲染xmSelect
    function renderSelect(id, list, change, colorTag) {
        // 选择颜色组
        colorTag = colorTag || 'default';
        var colors = colorGroup[colorTag];
        var style = '';

        var data = [];
        var index = 0;
        for (var value in list) {
            data.push({
                name: list[value],
                value: value,
                selected: true
            });
            var color = colors[index % colors.length];
            style += '#' + id + ' xm-select > .xm-body .xm-option:nth-child(' + (index + 1) + ') .xm-option-icon {border-color: ' + color +' !important;}';
            style += '#' + id + ' xm-select > .xm-body .xm-option:nth-child(' + (index + 1) + ').selected .xm-option-icon {color: ' + color +' !important;}';
            ++index;
        }
        $('head').append('<style>' + style + '</style>');
        return xmSelect.render({
            el: '#' + id,
            enableKeyboard: false,
            theme: {
                color: color || '#5470c6',
            },
            model: {
                type: 'relative',
            },
            height: 'auto',
            style: {
                minHeight: '32px',
                lineHeight: '32px',
                boxSizing: 'border-box',
            },
            layVerify: 'required',
            data: data,
            language: 'en',
            on: function(data) {
                var arr = data.arr;
                var list = [];
                for (var x in arr) {
                    list.push(arr[x].value);
                }
                change && change(list);
            },
        });
    }

});