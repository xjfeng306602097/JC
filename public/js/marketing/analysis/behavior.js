/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingAnalysis/behavior
    
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
        var types = ['line', 'horizontalBar'];
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
                        initBarChart(id, {list: result.data, top: 50, bottom: '3%'});
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
            var value = percentage(params.list[i].value / params.list[i].total, 2);
            data.push(value > 100 ? 100 : value);
        }
        option = {
            tooltip: {
                trigger: 'item',
                formatter: '{c}%'
            },
            grid: {
                top: params.top ? params.top : '3%',
                left: params.left ? params.left : '4%',
                right: params.right ? params.right : '4%',
                bottom: params.bottom ? params.bottom : '0%',
                borderWidth: 0,
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: labels
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value}%'
                },
                max: 100
            },
            series: [
                {
                    data: data,
                    type: 'bar',
                    barWidth: params.barWidth,
                    barMaxWidth: 40,
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                position: 'top',
                                formatter: '{c}%'
                            }
                        }
                    },
                    showBackground: true,
                    backgroundStyle: {
                        color: 'rgba(180, 180, 180, 0.2)'
                    }
                }
            ]
        };
        option && charts[id].setOption(option, true);
        return charts[id];
    }

    // 格式化为百分比数值
    function percentage(number, m) {
        return parseFloat((number * 10000 / 100).toFixed(m));
    }

    // 载入member Type数据
    function loadMemberTypes(change) {
        var chooseMemberType = xmSelect.render({
            el: '#chooseMemberType',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            filterable: true,
            layVerify: 'required',
            data: [],
            language: 'en',
            template: function(obj) {
                return '<span style="color: #8799a3">[' + obj.value + ']&nbsp;</span> ' + obj.item.name;
            },
            on: function(data) {
                var arr = data.arr;
                var list = [];
                for (var x in arr) {
                    list.push(arr[x].value);
                }
                change && change(list);
            },
        });
        AjaxRequest({
            url: getApiUrl('member.type.list'),
            method: getApiMethod('member.type.list'),
            headers: {
                "Content-Type": "application/json",
            },
            success: function(result) {
                if (result.code === "0000") {
                    var list = result.data;
                    if (list != null && list.length > 0) {
                        var memberTypeData = [];
                        $.each(list, function(index, value) {
                            var tmp = list[index];
                            var disabled = tmp.active != true;
                            memberTypeData.push({
                                name: tmp.nameEn,
                                value: tmp.id,
                                selected: false,
                                disabled: disabled,
                            });
                        });
                        chooseMemberType.update({
                            data: memberTypeData,
                        });
                    }
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                console.log('loadMemberTypes: 网络错误！');
            }
        });
    }

    var behavior1Chart = initChart('line', 'echarts-behavior1-chart', 'behaviorData');
    var behavior2Chart = initChart('line', 'echarts-behavior2-chart', 'productClicksByVisitors');
    var behavior3Chart = initChart('line', 'echarts-behavior3-chart', 'averageVisitorVisits');
    var behavior4Chart = initChart('horizontalBar', 'echarts-behavior4-chart', 'channelVisitorConversion');
    var behavior5Chart = initChart('horizontalBar', 'echarts-behavior5-chart', 'memberTypeClickThroughRate');
    // loadMemberTypes(function(types) {
    //     chartOptions['echarts-behavior5-chart'].memberTypes = types.join(',');
    //     initChart('horizontalBar', 'echarts-behavior5-chart', 'memberTypeClickThroughRate');
    // });

});