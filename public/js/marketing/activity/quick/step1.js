// 第一步
var step1 = function() {
    var $ = layui.$,
        setter = layui.setter,
        layer = layui.layer,
        laydate = layui.laydate,
        form = layui.form,
        dict = layui.dict;

    var storage = layui.data(setter.tableName);

    var now = new Date(),
        year = now.getFullYear(),
        month = now.getMonth() + 1,
        day = now.getDate();

    var chooseStore;
    var chooseMemberType;
    var chooseSegment;
    // 步骤初始化
    function onLoad() {
        laydate.render({
            elem: '#startTime',
            trigger: 'click',
            type: 'datetime',
            value: '',
            min: '2021-01-01 00:00:00',
            lang: 'en'
        });
        laydate.render({
            elem: '#endTime',
            trigger: 'click',
            type: 'datetime',
            value: year + '-' + month + '-' + day + ' 23:59:59',
            isInitValue: false,
            min: '2021-01-01 00:00:00',
            lang: 'en'
        });
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
                $('input[name="store"]').val(store);
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
                $('input[name="memberType"]').val(memberType);
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
                $('input[name="segment"]').val(segment);
            },
        });
        // 执行载入store列表
        loadStoreList(null);
        // 执行载入member Type数据
        loadMemberTypeList(null);
        // 执行载入segment数据
        loadSegmentList({
            invalid: 0
        });
        // 执行载入MM类型列表
        loadActivityType('');
    }
    // 步骤重新显示
    function onShow() {

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
            success: function(res) {
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

    // 测试使用
    // setTimeout(function() {
    //     var obj = {
    //         "title": "测试",
    //         "type": "classic",
    //         "startTime": "2022-11-15 00:00:00",
    //         "endTime": "2022-11-30 23:59:59",
    //         "store": "999",
    //         "memberType": "299",
    //         "segment": "5",
    //         "remark": "",
    //         "pageOption": "1",
    //         "templateCode": "",
    //     };
    //     form.val('quick-step1', obj);
    //     chooseStore.setValue([obj.store]);
    //     chooseMemberType.setValue([obj.memberType]);
    //     chooseSegment.setValue([obj.segment]);
    // }, 1000);

    return {
        onLoad: onLoad,
        onShow: onShow,
    };
};