/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingAnalysis/advanced
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer', 'laytpl', 'dropdown', 'element'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer
        ,laytpl = layui.laytpl
        ,dropdown = layui.dropdown
        ,element = layui.element;
    
    var mmCode = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    // 数据更新的时间（昨天）
    var current_time = new Date(new Date().setDate(new Date().getDate() - 1));

    if (mmCode == '') {
        $('body').prepend($('#body_all').html());
    } else {
        $('body').prepend($('#body_mm').html());
        init();
    }
    var checked;
    var menuData = {};

    function init() {
        var load = layer.load(1, {
            shade: [1, '#f2f2f2']
        });
        AjaxRequest({
            // url: '/json/analysis/advanced.json',
            url: getApiUrl('marketing.analysis.advancedInfo'),
            method: getApiMethod('marketing.analysis.advancedInfo'),
            data: {
                mmCode: mmCode
            },
            // 缓存5分钟
            cache: 300,
            success: function(result) {
                layer.close(load);
                if (result.code == '0000') {
                    var data = result.data;
                    menuData = handleData({
                        type: 'group',
                        name: 'Dimension',
                        field: 'step1',
                        children: data,
                    });
                    renderMenu();
                    initChart('advanced-chart');
                } else {
                    layer.msg(result.msg, {
                        time: 0,
                        icon: 5,
                        shade: [1, '#f2f2f2'],
                    });
                }
            },
            error: function(e) {
                layer.close(load);
                layer.msg('Error', {
                    time: 0,
                    icon: 5,
                    shade: [1, '#f2f2f2'],
                });
            }
        });
    }

    // 渲染菜单筛选
    function renderMenu(key, extend) {
        var tpl = $('#menuTpl').html();

        var isTop = true;

        var data = {};
        if (key !== undefined) {
            isTop = false;
            data = menu(key, 'children');
        } else {
            key = '';
            data = menuData;
        }
        if (data === undefined) {
            return;
        }
        var level = data.level;
        data.render = function (index) {
            if (this.children[index]) {
                var childKey = this.children[index].key;
                // var filter = this.type === 'filter';
                setTimeout(function() {
                    renderMenu(childKey);
                });
            }
        };
        for (var x in extend) {
            data[x] = extend[x];
        }
        var elem = data.elem || $('#advancedMenu');
        var html = laytpl(tpl).render(data);
        var isAdd = false;
        if (isTop) {
            elem.html(html);
            isAdd = true;
        } else {
            elem.find('>.menu-item').each(function(index, item) {
                var itemLevel = $(this).attr('level');
                var itemKey = $(this).attr('key');
                if (itemLevel > level && itemKey.indexOf(key) != 0) {
                    $(this).remove();
                }
            });
            if (elem.find('>.menu-item[key="'+key+'"]').length == 0) {
                elem.append(html);
                isAdd = true;
            } else {
                console.log('已存在', key);
            }
        }
        form.render();
        var addElem = elem.find('>.menu-item[key="'+key+'"]');
        if (isAdd) {
            switch(data.type) {
                case 'group':
                    var groupElem = addElem.find('.menu-group');
                    for (var i = 0; i < data.children.length; i++) {
                        if (data.children[i].checked) {
                            renderMenu(data.children[i].key);
                        }
                    }
                    groupElem.on('click', '>.menu-group-item', function(e) {
                        var key = $(this).attr('key');
                        $(this).siblings().removeClass('menu-group-checked');
                        $(this).addClass('menu-group-checked');
                        // 选中状态变更
                        for (var i = 0; i < data.children.length; i++) {
                            if (data.children[i].key == key) {
                                data.children[i].checked = true;
                            } else {
                                data.children[i].checked = false;
                            }
                        }
                        // 取消group下面原有筛选项
                        var current = menu(key, 'children');
                        for (var i = 0; i < current.children.length; i++) {
                            if (current.children[i].type == 'filter') {
                                uncheckData(current.children[i]);
                            }
                        }
                        renderMenu(key);
                        initChart('advanced-chart');
                    });
                    break;
                case 'multiple-select':
                    var list = [];
                    for (var i = 0; i < data.children.length; i++) {
                        list.push({
                            name: data.children[i].name,
                            value: data.children[i].value,
                            selected: data.children[i].checked,
                        });
                    }
                    var selectElem = addElem.find('.menu-multiple-select');
                    selectRender(selectElem[0], list, function(selected_list) {
                        for (var i = 0; i < data.children.length; i++) {
                            if (selected_list.indexOf(data.children[i].value) === -1) {
                                data.children[i].checked = false;
                            } else {
                                data.children[i].checked = true;
                            }
                        }
                        initChart('advanced-chart');
                    });
                    break;
                case 'filter':
                    var filterList = [];
                    for (var i = 0; i < data.children.length; i++) {
                        filterList.push({
                            title: data.children[i].name,
                            id: i,
                            data: data.children[i],
                        });
                    }
                    // 增加筛选项按钮
                    dropdown.render({
                        elem: addElem.find('.menu-add-filter'),
                        data: filterList,
                        click: function(obj, othis) {
                            var data = obj.data;
                            var elem = $(this.elem).closest('.menu-item').find('.menu-filter');
                            renderMenu(data.key, {
                                elem: elem,
                                filter: true
                            });
                        }
                    });
                    // 删除筛选项
                    addElem.on('click', '.menu-del-filter', function(e) {
                        var key = $(this).closest('.menu-item').attr('key');
                        $(this).closest('.menu-item').remove();
                        var current = menu(key, 'children');
                        uncheckData(current);

                        initChart('advanced-chart');
                    });
                    break;
            }
        }
    }

    var dataFields = {};
    // 处理数据结构
    function handleData(data, callback, level, key) {
        level = level === undefined ? -1 : level;
        data.level = level;
        data.key = key || '';
        callback && callback(data);
        if (data.field) {
            dataFields[data.key] = data;
        }
        if (data.children) {
            ++level;
            var checkeds = [];
            if (data.type == 'multiple-select') {
                var list = arrayColumn(data.children, 'checked');
                for (var n = 0; n < list.length; n++) {
                    if (list[n]) {
                        checkeds.push(n);
                    }
                }
            }
            for (var i = 0; i < data.children.length; i++) {
                var child = data.children[i];
                // 默认全选
                if (data.type == 'multiple-select') {
                    if (checkeds.length == 0) {
                        // child.checked = true;
                    }
                }
                var n = key ? (key + '.' + i) : i.toString();
                handleData(child, callback, level, n);
            }
        }
        return data;
    }

    function uncheckData(data) {
        if (data.checked) {
            data.checked = false;
        }
        if (data.children) {
            for (var i = 0; i < data.children.length; i++) {
                uncheckData(data.children[i]);
            }
        }
    }

    // 获取字段数据
    function getFilterData(prefixKey) {
        var result = {};
        for (var x in dataFields) {
            if (prefixKey == null || x == '' || x.indexOf(prefixKey) == 0) {
                var data = dataFields[x] || {};
                var children = data.children;
                switch(data.type) {
                    case 'select':
                    case 'group':
                        result[data.field] = '';
                        for (var i = 0; i < children.length; i++) {
                            if (children[i].checked) {
                                result[data.field] = children[i].value;
                                break;
                            }
                        }
                        break;
                    case 'multiple-select':
                        result[data.field] = [];
                        for (var i = 0; i < children.length; i++) {
                            if (children[i].checked) {
                                result[data.field].push(children[i].value);
                            }
                        }
                        break;
                    default:
                        console.log(data.field, data);
                        break;
                }
            }
        }
        return result;
    }

    // 获取筛选的选择项
    function getFilterIndex() {
        var index = 0;
        for (var i = 0; i < menuData.children.length; i++) {
            if (menuData.children[i].checked) {
                index = i;
                break;
            }
        }
        return index;
    }

    function menu(key, prefix) {
        var value = menuData;
        var tree = key.split('.');
        for (var i in tree) {
            if (tree[i] !== '') {
                if (prefix) {
                    value = value[prefix][tree[i]];
                } else {
                    value = value[tree[i]];
                }
                if (value === undefined) {
                    return undefined;
                }
            }
        }
        return value;
    }

    // 渲染选择器
    function selectRender(elem, data, callback) {
        return xmSelect.render({
            el: elem,
            height: '200px',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            theme: {
                color: '#5fb878',
            },
            filterable: true,
            searchTips: 'search',
            autoRow: true,
            tips: '',
            data: data || [],
            language: 'en',
            on: function(data) {
                var arr = data.arr;
                var list = [];
                for (var x in arr) {
                    var value = arr[x].value;
                    list.push(value);
                }
                callback && callback(list);
            }
        });
    }

    // 数据更新的时间（昨天）
    var current_time = new Date(new Date().setDate(new Date().getDate() - 1));

    var chartOptions = {};
    function initChart(id) {
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
                        initChart(id);
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
                        initChart(id);
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
                        initChart(id);
                    }
                });
            }
        };
        if (!chartOptions[id]) {
            chartOptions[id] = {
                mmCode: mmCode,
                startDate: getDateStr(0, current_time),
                endDate: getDateStr(0, current_time),
            };
            initSelectTime();
        }
        var index = getFilterIndex();
        var data = getFilterData(index);
        for (var x in data) {
            if (Object.prototype.toString.call(data[x]) === '[object Array]' && data[x].length == 0) {
                console.log('del', x)
                delete data[x];
            }
        }
        console.log(data)
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
            url: getApiUrl('marketing.analysis.advanced'),
            method: getApiMethod('marketing.analysis.advanced'),
            data: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
            success: function(result) {
                if (result.code == '0000') {
                    var options = result.data;
                    options.top = 50;
                    options.bottom = '3%';
                    options.left = '0%';
                    options.right = '0%';
                    initBarChart(id, options);
                    initTable('advanced-tabel', result.data, {
                        startTime: data.startTime,
                        endTime: data.endTime,
                    });
                } else {
                    layer.msg(result.msg);
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

    // 生成柱状图
    function initBarChart(id, params, forceRefresh) {
        if (!charts[id] || forceRefresh) {
            var chartDom = document.getElementById(id);
            charts[id] = echarts.init(chartDom);
        }
        var option;
        var legend = [], series = [];
        for (var i in params.list) {
            legend.push(params.list[i].name);
            var unit = params.list[i].unit || '';
            // 由于无法直接传递单位，故只能用eval实现动态函数
            var valueFormatter = eval('(function(value) {return value + "' + unit + '";})');
            series.push({
                name: params.list[i].name,
                data: params.list[i].values,
                type: 'bar',
                tooltip: {
                    valueFormatter: valueFormatter,
                },
                barWidth: params.barWidth,
                barMaxWidth: 32,
                // showBackground: true,
                backgroundStyle: {
                    color: 'rgba(180, 180, 180, 0.2)'
                }
            });
        }
        option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#999'
                    }
                }
            },
            legend: {
                top: 5,
                right: '0',
                data: legend
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

    // 生成Table
    function initTable(id, params, reqData) {
        var labels = [], data = [];
        var templet = function(res) {
            var value = res[res.LAY_COL.field];
            if (res.name == 'Item Click') {
                return '<a style="color: #5470C6;cursor: pointer;" lay-event="viewClick:' + res.LAY_COL.field + '" title="Click to view details">' + value + '</a>';
            }
            return value;
        };
        labels.push({
            field: 'name',
            minWidth: 150,
            title: '',
            templet: templet,
        });
        for (var i in params.label) {
            var key = i;
            var label = {
                field: key,
                minWidth: 150,
                title: params.label[i],
                templet: templet,
            };
            labels.push(label);
        }
        for (var i in params.list) {
            var item = {};
            item.name = params.list[i].name;
            var unit = params.list[i].unit;
            for (var x in params.list[i].values) {
                var value = params.list[i].values[x];
                item[x] = unit ? value + unit : value;
            }
            data.push(item);
        }
        var tableIns = table.render({
            id: id
            ,elem: '#' + id
            ,loading: true
            ,toolbar: true
            ,defaultToolbar: ['filter','exports']
            ,data: data
            ,cols: [labels],
            page: false
        });
        //单元格工具事件
        table.on('tool(' + id + ')', function(obj) {
            var data = obj.data;
            // 查看商品点击
            var event_viewClick = 'viewClick';
            if (obj.event.substr(0, event_viewClick.length) == event_viewClick) {
                var field = obj.event.substr(event_viewClick.length + 1);
                var pageNo = '';
                var title = data.name;
                if (IsNumber(field)) {
                    pageNo = parseInt(field) + 1;
                    title += ': Page ' + pageNo;
                }
                var index_page = layer.open({
                    type: 2
                    ,title: title
                    ,id: 'viewItemClick'
                    ,content: '/makroDigital/marketingAnalysis/productClick/' + mmCode + '/' + pageNo + '?startTime=' + reqData.startTime + '&endTime=' + reqData.endTime
                    ,maxmin: true
                    ,area: ['1000px', '610px']
                });
                layer.full(index_page);
            }
        });
        return tableIns;
    }

    // 格式化为百分比数值
    function percentage(number, m) {
        return parseFloat((number * 10000 / 100).toFixed(m));
    }

});