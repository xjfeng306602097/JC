/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/memberCustomer/index
    
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
    
    var storage = layui.data(setter.tableName);

    var querys = getUrlSearchParams();

    if (!querys.memberType) {
        var filterMemberType = xmSelect.render({
            el: '#memberType',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            data: [],
            language: 'en',
            tips: 'Select',
            // template: function(obj) {
            //     return obj.item.name  + '<span style="position: absolute; right: 0; color: #8799a3">' + obj.value + '</span>';
            // },
            on: function(data) {
                var arr = data.arr;
                //change, 此次选择变化的数据,数组
                var change = data.change;
                //isAdd, 此次操作是新增还是删除
                var isAdd = data.isAdd;

                var result = arr;
                
                var list = [];
                for (var x in result) {
                    list.push(result[x].value);
                }
                current_memberTypes = list;
                return result;
            },
        });
        loadMemberTypeList();
    }

    if (!querys.segment) {
        var filterSegment = xmSelect.render({
            el: '#segment',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            data: [],
            language: 'en',
            tips: 'Select',
            // template: function(obj) {
            //     return obj.item.name  + '<span style="position: absolute; right: 0; color: #8799a3">' + obj.value + '</span>';
            // },
            on: function(data) {
                var arr = data.arr;
                //change, 此次选择变化的数据,数组
                var change = data.change;
                //isAdd, 此次操作是新增还是删除
                var isAdd = data.isAdd;

                var result = arr;
                
                var list = [];
                for (var x in result) {
                    list.push(result[x].value);
                }
                current_segments = list;
                return result;
            },
        });
        loadSegmentList({
            invalid: 0
        });
    }
    
    var current_name = '',
        current_customerCode = '',
        current_phone = '',
        current_email = '',
        current_lineId = '',
        current_memberTypes = querys.memberType ? [querys.memberType] : [],
        current_segments = querys.segment ? [querys.segment] : [];
    function getMemberCustomerList(){
        table.render({
            id: 'memberCustomerTable'
            ,elem: '#content-memberCustomer-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('member.customer.page')
            ,method: getApiMethod('member.customer.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            // POST时必须添加contentType
            ,contentType: 'application/json;charset=utf-8'
            ,toolbar: true
            ,toolbar: '#memberCustomerToolbar'
            ,defaultToolbar: ['filter','exports']
            ,parseData: function(res) {
                if (res.code==="0000"){
                    return {
                        code: 0,
                        count: res.data.total,
                        data: res.data.records
                    }
                }
            }
            ,cols: [[
                {type:'radio',  width: 80, fixed: 'left' }
                ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{field:'name', width: 200, title: 'Name', fixed: 'left', sort: true, fixed: 'left' }
                ,{field:'customerCode', width: 200, title: 'Code' }
                ,{field:'phone', width: 200, title: 'Phone' }
                ,{field:'email', width: 200, title: 'Email' }
                ,{field:'lineId', width: 300, title: 'Line ID' }
                ,{field:'memberTypes', width: 300, title: 'Member Type', templet: function(res) {
                    var array = [];
                    if (res.memberTypes != null) {
                        for (var i = res.memberTypes.length - 1; i >= 0; i--) {
                            array.push(res.memberTypes[i].nameEn);
                        }
                    }
                    return array.join(', ');
                }}
                ,{field:'segments', width: 300, title: 'Segment', templet: function(res) {
                    var array = [];
                    if (res.segments != null) {
                        for (var i = res.segments.length - 1; i >= 0; i--) {
                            array.push(res.segments[i].name);
                        }
                    }
                    return array.join(', ');
                }}
                ,{field:'id', width: 120, title: 'ID', sort: true }
            ]],
            where: {
                req: {
                    name: current_name,
                    customerCode: current_customerCode,
                    phone: current_phone,
                    email: current_email,
                    lineId: current_lineId,
                    memberTypeIds: current_memberTypes,
                    segments: current_segments,
                },
                sortItems: [
                    {
                        column: "name",
                        asc: true
                    }
                ],
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
        });
    }
    
    getMemberCustomerList();
    
    // 搜索
    form.on('submit(LAY-memberCustomer-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_name = result.name;
        current_customerCode = result.customerCode;
        current_phone = result.phone;
        current_email = result.email;
        current_lineId = result.lineId;
        getMemberCustomerList();
    });
    // 重置搜索
    form.on('submit(LAY-memberCustomer-front-reset)', function(obj) {
        form.val('customerSearch', {
            name: '',
            customerCode: '',
            phone: '',
            email: '',
            lineId: '',
        });
        form.render();
        current_name = '';
        current_customerCode = '';
        current_phone = '';
        current_email = '';
        current_lineId = '';
        if (filterMemberType) {
            filterMemberType.setValue([]);
            current_memberTypes = [];
        }
        if (filterSegment) {
            filterSegment.setValue([]);
            current_segments = [];
        }
        getMemberCustomerList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-memberCustomer-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 批量导入客户
            case 'import':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Import Customer'
                    ,id: 'importCustomer'
                    ,content: '/makroDigital/memberCustomer/import' + window.location.search
                    ,maxmin: true
                    ,area: ['720px', '500px']
                    ,yes: function (index, layero) {
                    }
                });
                //layer.full(index_page);
                break;
            // 添加客户
            case 'add':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Add Customer'
                    ,id: 'addCustomer'
                    ,content: '/makroDigital/memberCustomer/add' + window.location.search
                    ,maxmin: true
                    ,area: ['900px', '660px']
                    ,btn: ['Save', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-customer-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            var mydata = {
                                "name": result.name,
                                "customerCode": result.customerCode,
                                "phone": result.phone,
                                "email": result.email,
                                "lineId": result.lineId,
                                "memberTypes": JSON.parse(result.memberTypes),
                                "segments": JSON.parse(result.segments),
                            };
                            
                            $.ajax({
                                url: getApiUrl('member.customer.add'),
                                type: getApiMethod('member.customer.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('memberCustomerTable');
                                    } else {
                                        layer.msg(result.msg);
                                    }
                                }
                            });
                        });
                        submit.trigger('click');
                    }
                });
                //layer.full(index_page);
                break;
            // 编辑客户
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Customer'
                        ,id: 'editCustomer'
                        ,content: '/makroDigital/memberCustomer/edit/' + id
                        ,maxmin: true
                        ,area: ['900px', '660px']
                        ,btn: ['Save', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-customer-edit-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                
                                var mydata = {
                                    "name": result.name,
                                    "customerCode": result.customerCode,
                                    "phone": result.phone,
                                    "email": result.email,
                                    "lineId": result.lineId,
                                    "memberTypes": JSON.parse(result.memberTypes),
                                    "segments": JSON.parse(result.segments),
                                };
                                
                                $.ajax({
                                    url: getApiUrl('member.customer.update', {id: id}),
                                    type: getApiMethod('member.customer.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('memberCustomerTable');
                                        } else {
                                            layer.msg(result.msg);
                                        }
                                    }
                                });
                            });
                            submit.trigger('click');
                        }
                    });
                }
                break;
            // 删除客户或删除客户的segment
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    // 如果是从segment进入，就是删除客户的segment，否则删除客户
                    if (querys.segment) {
                        layer.confirm('Confirm to delete the customer from the segment?', {
                            icon: 3,
                            title: 'Delete Customer [Segment]',
                            btn: ['Submit', 'Cancel'],
                        }, function(index) {
                            var id = data[0].id;
                            $.ajax({
                                url: getApiUrl('member.customer.deleteSegment', {ids: id, segmentId: querys.segment}),
                                type: getApiMethod('member.customer.deleteSegment'),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        table.reload('memberCustomerTable');
                                    } else {
                                        layer.msg(result.msg);
                                    }
                                }
                            });
                        });
                    } else {
                        layer.confirm('Confirm for delete?', {
                            icon: 3,
                            title: 'Delete Customer',
                            btn: ['Submit', 'Cancel'],
                        }, function(index) {
                            var id = data[0].id;
                            $.ajax({
                                url: getApiUrl('member.customer.delete', {ids: id}),
                                type: getApiMethod('member.customer.delete'),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        table.reload('memberCustomerTable');
                                    } else {
                                        layer.msg(result.msg);
                                    }
                                }
                            });
                        });
                    }
                }
                break;
            default:
                break;
        }
    });

    // 监听开关事件
    form.on('switch(switchStatus)', function(obj) {
        var id = obj.value;
        var checked = this.checked;
        var invalid = checked ? 0 : 1;
        var data = {
            invalid: invalid,
        };
        $.ajax({
            url: getApiUrl('member.customer.update', {id: id}),
            type: getApiMethod('member.customer.update'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: JSON.stringify(data),
            success: function(result) {
                if (result.code === "0000") {
                    layer.msg(result.msg);
                } else {
                    obj.elem.checked = !checked;
                    form.render('checkbox');
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                obj.elem.checked = !checked;
                form.render('checkbox');
                layer.msg('切换失败');
                console.log(e);
            }
        });
    });

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
                        if (filterMemberType) {
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
                            filterMemberType.update({
                                data: list,
                            });
                        }
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
                        if (filterSegment) {
                            var list = [];
                            $.each(listData, function(index, value) {
                                var tmp = listData[index];
                                if (tmp.code != 999) {
                                    list.push({
                                        name: tmp.name || '',
                                        value: tmp.id,
                                        selected: false,
                                    });
                                }
                            });
                            filterSegment.update({
                                data: list,
                            });
                        }
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

    // 预览已上传Excel的数据
    window.previewExcelData = function (importData) {
        if (importData !== undefined && importData.data !== undefined) {
            if (importData.data.length == 0) {
                layer.msg('No data found!');
                return;
            }
            var layerox = layer.open({
                type: 1,
                title: 'Preview Data',
                id: 'excelData',
                content: '<div style="padding: 0 20px;"><table class="layui-hide" id="excelImportData" lay-filter="excelImportData"></table></div>',
                area: ['600px', '480px'],
                move: false,
                btn: ['Import', 'Cancel'],
                success: function(layero, index) {
                    layer.full(index);
                    for (var i = 0; i < importData.data.length; i++) {
                        importData.data[i].LAY_CHECKED = true;
                    }
                    table.render({
                        elem: '#excelImportData',
                        height: 'full-130',
                        cols: [[ //标题栏
                            {type:'checkbox',  width: 80, fixed: 'left' }
                            ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                            ,{field:'isExist', width: 80, title: 'Exists', fixed: 'left', templet: function(res) {
                                if (res.isExist) {
                                    return '<span style="color: #FF5722;">true</span>';
                                } else {
                                    return 'false';
                                }
                            }}
                            ,{field:'name', width: 200, title: 'Name', edit: 'text', fixed: 'left' }
                            ,{field:'customerCode', width: 200, title: 'Code', edit: 'text' }
                            ,{field:'phone', width: 200, title: 'Phone' }
                            ,{field:'email', width: 200, title: 'Email', edit: 'text' }
                            ,{field:'lineId', width: 300, title: 'Line ID', edit: 'text' }
                            ,{field:'memberTypes', width: 300, title: 'Member Type', templet: function(res) {
                                var array = [];
                                if (res.memberTypes != null) {
                                    for (var i = res.memberTypes.length - 1; i >= 0; i--) {
                                        array.push(res.memberTypes[i].nameEn);
                                    }
                                }
                                return array.join(', ');
                            }}
                            ,{field:'segments', width: 300, title: 'Segment', templet: function(res) {
                                var array = [];
                                if (res.segments != null) {
                                    for (var i = res.segments.length - 1; i >= 0; i--) {
                                        array.push(res.segments[i].name);
                                    }
                                }
                                return array.join(', ');
                            }}
                        ]],
                        data: importData.data,
                        // page: false,
                        page: true,
                        limit: 50,
                        limits: [50, 100, 200, 300, 500, 1000],
                    });
                },
                yes: function(index, layero) {
                    var customerData = JSON.parse(JSON.stringify(importData.data));
                    for (var i = customerData.length - 1; i >= 0; i--) {
                        if (customerData[i].LAY_CHECKED !== true) {
                            customerData.splice(i, 1);
                        }
                    }
                    $.ajax({
                        url: getApiUrl('import.customer.submit'),
                        type: getApiMethod('import.customer.submit'),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        data: JSON.stringify(customerData),
                        success: function(result) {
                            if (result.code === "0000") {
                                layer.msg(result.msg);
                                layer.close(importData.uploadLayerIndex);
                                layer.close(index);
                                table.reload('memberCustomerTable');
                            } else {
                                layer.msg(result.msg);
                            }
                        }
                    });
                },
            });
        }
    };
    
});