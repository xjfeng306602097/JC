/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingActivity/edit
    
 */
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'laydate', 'layer', 'dict'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form
        ,dict = layui.dict;

    var current_id = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    var now = new Date(),
        year = now.getFullYear(),
        month = now.getMonth() + 1,
        day = now.getDate();
    laydate.render({
        elem: '#startTime'
        ,trigger: 'click'
        ,type: 'datetime'
        ,value: ''
        ,min: '2021-01-01 00:00:00'
        ,lang: 'en'
    });
    
    laydate.render({
        elem: '#endTime'
        ,trigger: 'click'
        ,type: 'datetime'
        ,value: year + '-' + month + '-' + day + ' 23:59:59'
        ,isInitValue: false
        ,min: '2021-01-01 00:00:00'
        ,lang: 'en'
    });
    var chooseStore;
    var chooseMemberType;
    var chooseSegment;
    init();
    //初始化页面
    function init() {
        chooseStore = xmSelect.render({
            el: '#chooseStore',
            height: '160px',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            filterable: true,
            layVerify: 'required',
            prop: {
                name: 'title',
            },
            data: [],
            language: 'en',
            template: function(obj) {
                return '<span style="color: #8799a3">[' + obj.value + ']&nbsp;</span> ' + obj.item.name;
            },
            on: function(data) {
                var arr = data.arr;
                //change, 此次选择变化的数据,数组
                var change = data.change;
                //isAdd, 此次操作是新增还是删除
                var isAdd = data.isAdd;

                var result = arr;
                if (isAdd) {
                    var allItem = change.find(function(item) {
                        return item.value == '999';
                    });
                    if (allItem) {
                        result = [allItem];
                    } else {
                        allItem = arr.find(function(item) {
                            return item.value == '999';
                        });
                        if (allItem) {
                            result = change;
                        }
                    }
                }

                var list = [];
                for (var x in result) {
                    list.push(result[x].value);
                }
                var store = list.join(',');
                $('input[name=store]').val(store);
                return result;
            },
        });
        chooseMemberType = xmSelect.render({
            el: '#chooseMemberType',
            height: '160px',
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
                var memberType = list.join(',');
                $('input[name=memberType]').val(memberType);
            },
        });
        chooseSegment = xmSelect.render({
            el: '#chooseSegment',
            height: '160px',
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
                var segment = list.join(',');
                $('input[name=segment]').val(segment);
            },
        });
        var totalStep = 4;// 总步骤，如果存在多个异步请求，请修改此处数量
        var success = function () {
            --totalStep;
            // 仅在最后一步时进行赋值select
            if (totalStep <= 0) {
                var activity = form.val('activityEdit');
                chooseStore.append(activity.store.split(','));
                chooseMemberType.append(activity.memberType.split(','));
                chooseSegment.append(activity.segment.split(','));
            }
        };
        // 执行载入store列表
        loadStoreList(null, success);
        // 执行载入member Type数据
        loadMemberTypeList(null, success);
        // 执行载入segment数据
        loadSegmentList({
            invalid: 0
        }, success);
        // 获取该活动的数据
        loadActivityData(null, success);
    }
    // 载入store数据
    var __loadStoreList_fail_number = 0;
    function loadStoreList(data, success) {
        $.ajax({
            url: getApiUrl('store.list'),
            type: getApiMethod('store.list'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: data,
            success: function(result) {
                __loadStoreList_fail_number = 0;
                if (result.code === "0000") {
                    var listData = result.data;
                    if (listData != null && listData.length > 0) {
                        var list = [];
                        $.each(listData, function(index, value) {
                            var tmp = listData[index];
                            list.push({
                                title: '[' + tmp.code + '] ' + tmp.name,
                                name: tmp.name || '',
                                value: tmp.code,
                                selected: false,
                            });
                        });
                        chooseStore.update({
                            data: list,
                        });
                    }
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__loadStoreList_fail_number;
                console.log('loadStoreList: 网络错误！');
                if (__loadStoreList_fail_number < 3) {
                    setTimeout(function() {
                        loadStoreList(data, success);
                    }, 100);
                } else {
                    console.log('loadStoreList: 已累计3次请求失败');
                }
            }
        });
    }
    // 载入member Type数据
    var __loadMemberTypeList_fail_number = 0;
    function loadMemberTypeList(data, success) {
        $.ajax({
            url: getApiUrl('member.type.list'),
            type: getApiMethod('member.type.list'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: data,
            success: function(result) {
                __loadMemberTypeList_fail_number = 0;
                if (result.code === "0000") {
                    var listData = result.data;
                    if (listData != null && listData.length > 0) {
                        var list = [];
                        $.each(listData, function(index, value) {
                            var tmp = listData[index];
                            var disabled = tmp.active != true;
                            list.push({
                                name: tmp.nameEn || '',
                                value: tmp.id,
                                selected: false,
                                disabled: disabled,
                            });
                        });
                        chooseMemberType.update({
                            data: list,
                        });
                    }
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__loadMemberTypeList_fail_number;
                console.log('loadMemberTypeList: 网络错误！');
                if (__loadMemberTypeList_fail_number < 3) {
                    setTimeout(function() {
                        loadMemberTypeList(data, success);
                    }, 100);
                } else {
                    console.log('loadMemberTypeList: 已累计3次请求失败');
                }
            }
        });
    }
    // 载入segment数据
    var __loadSegmentList_fail_number = 0;
    function loadSegmentList(data, success) {
        $.ajax({
            url: getApiUrl('segment.list'),
            type: getApiMethod('segment.list'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: data,
            success: function(result) {
                __loadSegmentList_fail_number = 0;
                if (result.code === "0000") {
                    var listData = result.data;
                    if (listData != null && listData.length > 0) {
                        var list = [];
                        $.each(listData, function(index, value) {
                            var tmp = listData[index];
                            list.push({
                                name: tmp.name || '',
                                value: tmp.id,
                                selected: false,
                            });
                        });
                        chooseSegment.update({
                            data: list,
                        });
                    }
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__loadSegmentList_fail_number;
                console.log('loadSegmentList: 网络错误！');
                if (__loadSegmentList_fail_number < 3) {
                    setTimeout(function() {
                        loadSegmentList(data, success);
                    }, 100);
                } else {
                    console.log('loadSegmentList: 已累计3次请求失败');
                }
            }
        });
    }
    // 载入MM类型列表
    var __loadActivityType_fail_number = 0;
    function loadActivityType(value, success) {
        dict.render({
            elem: 'select[name="type"]',
            dictCode: 'activity_type',
            value: value,
            success: function (res) {
                __loadActivityType_fail_number = 0;
                success && success();
            },
            error: function(e) {
                ++__loadActivityType_fail_number;
                console.log('loadActivityType: 网络错误！');
                if (__loadActivityType_fail_number < 3) {
                    setTimeout(function() {
                        loadActivityType(value, success);
                    }, 100);
                } else {
                    console.log('loadActivityType: 已累计3次请求失败');
                }
            }
        });
    }
    // 载入活动数据
    var __loadActivityData_fail_number = 0;
    function loadActivityData(data, success) {
        $.ajax({
            url: getApiUrl('marketing.activity.detail', {id: current_id}),
            type: getApiMethod('marketing.activity.detail'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                __loadActivityData_fail_number = 0;
                if (result.code === "0000") {
                    form.val('activityEdit', {
                        title: result.data.title,
                        startTime: result.data.startTime,
                        endTime: result.data.endTime,
                        store: result.data.storeCode,
                        memberType: result.data.memberType,
                        segment: result.data.segment,
                        remark: result.data.remark,
                    });
                    // 执行载入MM类型列表
                    loadActivityType(result.data.type);
                    success && success();
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
                ++__loadActivityData_fail_number;
                console.log('loadActivityData: 网络错误！');
                if (__loadActivityData_fail_number < 3) {
                    setTimeout(function() {
                        loadActivityData();
                    }, 100);
                } else {
                    console.log('loadActivityData: 已累计3次请求失败');
                }
            }
        });
    }
});