/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingAnalysis/source
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer;
    
    var current_mmCode = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    // 数据更新的时间（昨天）
    var current_time = new Date(new Date().setDate(new Date().getDate() - 1));

    var chartOptions = {};
    function initChart(type, id, mod) {
        var initSelectTime = function() {
            var item = $('#' + id).parents('.layui-card');
            var timeOption = item.find('.time-select');
            if (timeOption.length > 0) {
                timeOption.on('click', 'button', function() {
                    timeOption.find('button').removeClass('layui-btn-checked');
                    $(this).addClass('layui-btn-checked');
                    var day = $(this).data('day');
                    if (!isNaN(day)) {
                        chartOptions[id].startDate = getDateStr(parseInt(day), current_time);
                        initChart(type, id, mod);
                        item.find('.date-range').find('input[name="startDate"]').val(chartOptions[id].startDate);
                        item.find('.date-range').find('input[name="endDate"]').val(chartOptions[id].endDate);
                        item.find('.date-range').find('input').prop('disabled', true);
                    } else {
                        item.find('.date-range').find('input[name="startDate"]').val(chartOptions[id].startDate);
                        item.find('.date-range').find('input[name="endDate"]').val(chartOptions[id].endDate);
                        item.find('.date-range').find('input').prop('disabled', false);
                    }
                });
                if (timeOption.find('button.layui-btn-checked').length == 0) {
                    timeOption.find('button').eq(0).addClass('layui-btn-checked');
                    item.find('.date-range').find('input[name="startDate"]').val(chartOptions[id].startDate);
                    item.find('.date-range').find('input[name="endDate"]').val(chartOptions[id].endDate);
                    item.find('.date-range').find('input').prop('disabled', true);
                }
                laydate.render({
                    elem: item.find('.date-range input[name="startDate"]')[0]
                    ,value: chartOptions[id].startDate
                    ,trigger: 'click'
                    ,min: '2021-01-01'
                    ,max: getDateStr(0, current_time)
                    ,lang: 'en'
                    ,btns: ['confirm']
                    ,done: function(value, date, endDate) {
                        if (value.replace('-', '') > chartOptions[id].endDate.replace('-', '')) {
                            layer.msg('Start date cannot be greater than end date');
                            setTimeout(function() {
                                item.find('.date-range input[name="startDate"]').val(chartOptions[id].startDate);
                            }, 1);
                            return;
                        }
                        chartOptions[id].startDate = value;
                        initChart(type, id, mod);
                    }
                });
                laydate.render({
                    elem: item.find('.date-range input[name="endDate"]')[0]
                    ,value: chartOptions[id].endDate
                    ,trigger: 'click'
                    ,min: '2021-01-01'
                    ,max: getDateStr(0, current_time)
                    ,lang: 'en'
                    ,btns: ['confirm']
                    ,done: function(value, date, endDate) {
                        if (value.replace('-', '') < chartOptions[id].startDate.replace('-', '')) {
                            layer.msg('End date cannot be less than start date');
                            setTimeout(function() {
                                item.find('.date-range input[name="endDate"]').val(chartOptions[id].endDate);
                            }, 1);
                            return;
                        }
                        chartOptions[id].endDate = value;
                        initChart(type, id, mod);
                    }
                });
            }
        };
        var types = ['line'];
        if (types.indexOf(type) === -1) {
            return;
        }
        if (!chartOptions[id]) {
            chartOptions[id] = {
                mmCode: current_mmCode,
                startDate: getDateStr(-7, current_time),
                endDate: getDateStr(0, current_time),
            };
            initSelectTime();
        }
        var data = {};
        // 将日期段转为时间段
        for (var x in chartOptions[id]) {
            if (x == 'startDate') {
                data.startTime = chartOptions[id].startDate + ' 00:00:00';
            } else if (x == 'endDate') {
                data.endTime = chartOptions[id].endDate + ' 23:59:59';
            } else {
                data[x] = chartOptions[id][x];
            }
        }
        AjaxRequest({
            url: getApiUrl('marketing.analysis.' + mod),
            method: getApiMethod('marketing.analysis.' + mod),
            data: data,
            success: function(result) {
                if (result.code == '0000') {
                    if (type == 'line') {
                        initLineChart(id, result.data);
                    } else if (type == 'horizontalBar') {
                        initHorizontalBarChart(id, result.data);
                    } else {
                        console.log('不支持的Chart类型展示');
                    }
                }
            },
            error: function(e) {
                console.log(e);
            }
        });
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

    var source1Chart = initChart('line', 'echarts-source1-chart', 'channelVisits');
    var source2Chart = initChart('line', 'echarts-source2-chart', 'channelVisitors');

});