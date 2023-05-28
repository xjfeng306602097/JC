/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/memberCustomer/add
    
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

    // 默认memberType与segment
    var querys = getUrlSearchParams();
    var current_memberTypeArr = [];
    var current_segmentArr = [];
    if (querys.memberType) {
        current_memberTypeArr.push(querys.memberType);
    }
    if (querys.segment) {
        current_segmentArr.push(querys.segment);
    }

    var memberTypeData, segmentData;
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
        var totalStep = 2;// 总步骤，如果存在多个异步请求，请修改此处数量
        var success = function () {
            --totalStep;
            // 仅在最后一步时进行赋值select
            if (totalStep <= 0) {
                chooseMemberType.setValue(current_memberTypeArr);
                chooseSegment.setValue(current_segmentArr);
                var memberTypeList = [];
                var segmentList = [];
                for (var id in current_memberTypeArr) {
                    memberTypeList.push(memberTypeData[id]);
                }
                for (var id in current_segmentArr) {
                    segmentList.push(segmentData[id]);
                }
                $('input[name=memberTypes]').val(JSON.stringify(memberTypeList));
                $('input[name=segments]').val(JSON.stringify(segmentList));
            }
        };
        // 执行载入member Type数据
        loadMemberTypeList(null, success);
        // 执行载入segment列表
        loadSegmentList({
            invalid: 0
        }, success);
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

});