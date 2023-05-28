/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/memberCustomer/edit
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'laydate', 'layer','form'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form;
        
    var current_id = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);

    var customerData, memberTypeData, segmentData;
    var chooseMemberType;
    var chooseSegment;
    init();
    //初始化页面
    function init() {
        chooseMemberType = xmSelect.render({
            el: '#chooseMemberType',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            filterable: true,
            // layVerify: 'required',
            data: [],
            language: 'en',
            template: function(obj) {
                return '<span style="color: #8799a3">[' + obj.value + ']&nbsp;</span> ' + obj.item.name;
            },
            on: function(data) {
                var arr = data.arr;
                var list = [];
                for (var x in arr) {
                    var id = arr[x].value;
                    list.push(memberTypeData[id]);
                }
                var json = JSON.stringify(list);
                $('input[name=memberTypes]').val(json);
            },
        });
        chooseSegment = xmSelect.render({
            el: '#chooseSegment',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            filterable: true,
            // layVerify: 'required',
            data: [],
            language: 'en',
            template: function(obj) {
                return '<span style="color: #8799a3">[' + obj.value + ']&nbsp;</span> ' + obj.item.name;
            },
            on: function(data) {
                var arr = data.arr;
                var list = [];
                for (var x in arr) {
                    var id = arr[x].value;
                    list.push(segmentData[id]);
                }
                var json = JSON.stringify(list);
                $('input[name=segments]').val(json);
            },
        });
        var totalStep = 3;// 总步骤，如果存在多个异步请求，请修改此处数量
        var success = function () {
            --totalStep;
            // 仅在最后一步时进行赋值select
            if (totalStep <= 0) {
                var memberTypes = [];
                if (customerData.memberTypes != null) {
                    for (var i = customerData.memberTypes.length - 1; i >= 0; i--) {
                        memberTypes.push(customerData.memberTypes[i].id);
                    }
                }
                chooseMemberType.setValue(memberTypes);
                var segments = [];
                if (customerData.segments != null) {
                    for (var i = customerData.segments.length - 1; i >= 0; i--) {
                        segments.push(customerData.segments[i].id);
                    }
                }
                chooseSegment.setValue(segments);
                $('input[name=memberTypes]').val(JSON.stringify(customerData.memberTypes));
                $('input[name=segments]').val(JSON.stringify(customerData.segments));
            }
        };
        // 执行载入member Type数据
        loadMemberTypeList(null, success);
        // 执行载入segment列表
        loadSegmentList({
            invalid: 0
        }, success);
        // 获取该客户信息
        loadCustomerData(null, success);
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
                        memberTypeData = arrayColumn(listData, null, 'id');
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
                        segmentData = arrayColumn(listData, null, 'id');
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
    // 载入客户信息
    var __loadCustomerData_fail_number = 0;
    function loadCustomerData(data, success) {
        $.ajax({
            url: getApiUrl('member.customer.detail', {id: current_id}),
            type: getApiMethod('member.customer.detail'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                __loadCustomerData_fail_number = 0;
                if (result.code === "0000") {
                    form.val('customerEdit', {
                        "name": result.data.name,
                        "customerCode": result.data.customerCode,
                        "phone": result.data.phone,
                        "email": result.data.email,
                        "lineId": result.data.lineId,
                    });
                    customerData = result.data;
                    success && success();
                } else {
                    layer.msg(result.msg, {
                        time: 2000,
                        end: function () {
                            var index = parent.layer.getFrameIndex(window.name);
                            parent.layer.close(index);
                        }
                    });
                }
            },
            error: function(e) {
                ++__loadCustomerData_fail_number;
                console.log('loadCustomerData: 网络错误！');
                if (__loadCustomerData_fail_number < 3) {
                    setTimeout(function() {
                        loadCustomerData(data, success);
                    }, 100);
                } else {
                    console.log('loadCustomerData: 已累计3次请求失败');
                }
            }
        });
    }

});