// 推送公共库
var pushInit = function(mmCode, channel) {
    var form = layui.form;
    var element = layui.element;
    var laydate = layui.laydate;
    var upload = layui.upload;
    form.verify({
        sendList: function(value, item) {
            var formData = form.val();
            if (formData['sendList.segmentIds'] == '' && formData['sendList.memberTypeIds'] == '') {
                return 'Please select the sending list';
            }
        },
    });
    /**
     * 推送用户渲染方法
     * @author siliang
     * @Date   2023-03-13
     */
    function pushUserRender() {
        var filter_name = '',
            filter_customerCode = '',
            filter_segments = [],
            filter_memberTypes = [];
        var activity_segments = null,
            activity_memberTypes = null;
        var singleFilterSegment = xmSelect.render({
            el: '#singleFilterSegment',
            height: '160px',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            filterable: true,
            tips: 'Segment',
            data: [],
            language: 'en',
            template: function(obj) {
                return '<span style="color: #8799a3">[' + obj.value + ']&nbsp;</span> ' + obj.item.name;
            },
        });
        var singleFilterMemberType = xmSelect.render({
            el: '#singleFilterMemberType',
            height: '160px',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            filterable: true,
            tips: 'Member Type',
            data: [],
            language: 'en',
            template: function(obj) {
                return '<span style="color: #8799a3">[' + obj.value + ']&nbsp;</span> ' + obj.item.name;
            },
        });
        // 载入客户数据
        var singleCustomerUpdate;
        var singleCustomerRemote = function(pageIndex) {
            var mydata = {
                req: {
                    name: filter_name,
                    customerCode: filter_customerCode,
                    memberTypeIds: filter_memberTypes,
                    segments: filter_segments,
                },
                sortItems: [{
                    column: "name",
                    asc: true
                }],
                limit: 5,
                page: pageIndex || 1,
            };
            getCustomerList(mydata, function(data) {
                var listData = data.records;
                var list = [];
                $.each(listData, function(index, value) {
                    var tmp = listData[index];
                    list.push({
                        name: tmp.name,
                        value: tmp.id,
                        code: tmp.customerCode,
                        phone: tmp.phone,
                        selected: false,
                    });
                });
                singleCustomerUpdate(list, data.pages);
            }, function() {
                singleCustomerUpdate([], 0);
            });
        };
        var singleCustomer = xmSelect.render({
            el: '#singleCustomer',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            toolbar: {
                show: true,
                list: ['ALL', 'CLEAR'],
            },
            filterable: true,
            paging: true,
            pageSize: 10,
            pageEmptyShow: false,
            pageRemote: true,
            remoteMethod: function(val, cb, show, pageIndex) {
                //val: 搜索框的内容, 不开启搜索默认为空, cb: 回调函数, show: 当前下拉框是否展开, pageIndex: 当前第几页
                singleCustomerUpdate = cb;
                filter_name = val;
                if (activity) {
                    singleCustomerRemote(pageIndex);
                } else {
                    var pendingLoad = setInterval(function() {
                        console.log(activity)
                        if (activity) {
                            singleCustomerRemote(pageIndex);
                            clearInterval(pendingLoad);
                        }
                    }, 10);
                }
            },
            layVerify: 'required',
            max: 50, // 设置最大数以后会出现点击全选只能全选当前页（其他的数据被去除）的情况
            autoRow: true,
            data: [],
            language: 'en',
            template: function(obj) {
                return '<span style="color: #8799a3">[' + obj.item.code + ']&nbsp;</span> ' + obj.item.name;
            },
            on: function(data) {
                var arr = data.arr;
                var list = [];
                for (var x in arr) {
                    var id = arr[x].value;
                    list.push(id);
                }
                $('input[name="mmCustomerId"]').val(list.join(','));
            },
        });
        var batchSendSegment = xmSelect.render({
            el: '#batchSendSegment',
            height: '160px',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            toolbar: {
                show: true,
                list: ['ALL', 'CLEAR'],
            },
            filterable: true,
            autoRow: true,
            tips: 'Segment',
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
                    list.push(id);
                }
                $('input[name="sendList.segmentIds"]').val(list.join(','));
            },
        });
        var batchSendMemberType = xmSelect.render({
            el: '#batchSendMemberType',
            height: '160px',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            toolbar: {
                show: true,
                list: ['ALL', 'CLEAR'],
            },
            filterable: true,
            autoRow: true,
            tips: 'Member Type',
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
                    list.push(id);
                }
                $('input[name="sendList.memberTypeIds"]').val(list.join(','));
            },
        });
        var batchExceptSegment = xmSelect.render({
            el: '#batchExceptSegment',
            height: '160px',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            toolbar: {
                show: true,
                list: ['ALL', 'CLEAR'],
            },
            filterable: true,
            autoRow: true,
            tips: 'Segment',
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
                    list.push(id);
                }
                $('input[name="exceptList.segmentIds"]').val(list.join(','));
            },
        });
        var batchExceptMemberType = xmSelect.render({
            el: '#batchExceptMemberType',
            height: '160px',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            toolbar: {
                show: true,
                list: ['ALL', 'CLEAR'],
            },
            filterable: true,
            autoRow: true,
            tips: 'Member Type',
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
                    list.push(id);
                }
                $('input[name="exceptList.memberTypeIds"]').val(list.join(','));
            },
        });
        // 监听single push/batch push切换
        element.on('tab(pushUserTab)', function() {
            var type = this.getAttribute('lay-id');
            $('input[name="type"]').val(type);
            switch (type) {
                case 'single':
                    $('#singleCustomer').removeClass('layui-hide');
                    $('#batchCustomer').addClass('layui-hide');
                    singleCustomer.update({
                        layVerify: 'required',
                        pageRemote: true,
                    });
                    var options = {
                        layVerify: '',
                    };
                    batchSendSegment.update(options);
                    batchSendMemberType.update(options);
                    break;
                case 'batch':
                    $('#singleCustomer').addClass('layui-hide');
                    $('#batchCustomer').removeClass('layui-hide');
                    singleCustomer.update({
                        layVerify: '',
                        pageRemote: false,
                    });
                    var options = {
                        layVerify: 'sendList',
                    };
                    batchSendSegment.update(options);
                    batchSendMemberType.update(options);
                    break;
            }
        });
        // 筛选客户
        form.on('submit(LAY-filterCustomer-front-search)', function(obj) {
            var field = JSON.stringify(obj.field);
            var result = JSON.parse(field);
            filter_customerCode = result.customerCode;
            filter_segments = singleFilterSegment.getValue('value');
            filter_memberTypes = singleFilterMemberType.getValue('value');
            if (filter_segments.length == 0) {
                filter_segments = activity_segments;
            }
            if (filter_memberTypes.length == 0) {
                filter_memberTypes = activity_memberTypes;
            }
            singleCustomerRemote();
        });
        // 重置筛选
        form.on('submit(LAY-filterCustomer-front-reset)', function(obj) {
            form.val('filterCustomer', {
                customerCode: '',
            });
            singleFilterSegment.setValue([]);
            singleFilterMemberType.setValue([]);
            filter_customerCode = '';
            filter_segments = activity_segments;
            filter_memberTypes = activity_memberTypes;
            singleCustomerRemote();
        });
        var activity;
        getActivityDetail(mmCode, function(data) {
            activity = data;
            var segments = [],
                memberTypes = [];
            // 初始化segment
            var segmentData = data.segments;
            activity_segments = [];
            $.each(segmentData, function(index, value) {
                var tmp = segmentData[index];
                segments.push({
                    name: tmp.name,
                    value: tmp.id,
                    selected: false,
                });
                activity_segments.push(tmp.id);
            });
            filter_segments = activity_segments;
            // 初始化member type
            var memberTypeData = data.memberTypes;
            activity_memberTypes = [];
            $.each(memberTypeData, function(index, value) {
                var tmp = memberTypeData[index];
                memberTypes.push({
                    name: tmp.nameEn,
                    value: tmp.id,
                    selected: false,
                });
                activity_memberTypes.push(tmp.id);
            });
            filter_memberTypes = activity_memberTypes;
            singleFilterSegment.update({
                data: segments,
            });
            batchSendSegment.update({
                data: segments,
            });
            singleFilterMemberType.update({
                data: memberTypes,
            });
            batchSendMemberType.update({
                data: memberTypes,
            });
        });
        getSegmentList({
            invalid: 0
        }, function(data) {
            var list = [];
            $.each(data, function(index, value) {
                var tmp = data[index];
                list.push({
                    name: tmp.name || '',
                    value: tmp.id,
                    selected: false,
                });
            });
            batchExceptSegment.update({
                data: list,
            });
        });
        getMemberTypeList({
            active: true
        }, function(data) {
            var list = [];
            $.each(data, function(index, value) {
                var tmp = data[index];
                list.push({
                    name: tmp.nameEn || '',
                    value: tmp.id,
                    selected: false,
                });
            });
            batchExceptMemberType.update({
                data: list,
            });
        });
        uploadExcelInit('#uploadSendCustomerList', function(data) {
            $('input[name="sendList.customersS3Url"]').val(data.path);
        });
        uploadExcelInit('#uploadExceptCustomerList', function(data) {
            $('input[name="exceptList.customersS3Url"]').val(data.path);
        });
        // 黑名单、白名单设置
        $('.list-btn').click(function() {
            var type = $(this).data('type');
            var value = $('input[name="' + type + '"]').val();
            var titleObj = {
                blacklist: 'Black List',
                whitelist: 'White List',
            };
            var title = titleObj[type] || '';
            layer.prompt({
                formType: 2,
                value: value,
                title: title,
                placeholder: 'Please enter customer codes, one per line',
                maxlength: 64000,
                require: false,
                btn: ['Set', 'Cancel'],
            }, function(value, index, elem) {
                layer.close(index);
                $('input[name="' + type + '"]').val(value);
            });
        });
        return {
            singleFilterSegment: singleFilterSegment,
            singleFilterMemberType: singleFilterMemberType,
            singleCustomer: singleCustomer,
            batchSendSegment: batchSendSegment,
            batchSendMemberType: batchSendMemberType,
            batchExceptSegment: batchExceptSegment,
            batchExceptMemberType: batchExceptMemberType,
        };
    }
    /**
     * 推送时间渲染方法
     * @author siliang
     * @Date   2023-03-13
     */
    function pushTimeRender() {
        // 补零
        function pad(num, n) {
            var len = num.toString().length;
            while (len < n) {
                num = "0" + num;
                len++;
            }
            return num;
        }
        var now = new Date(new Date().setHours(new Date().getHours() + 1)),
            year = now.getFullYear(),
            month = now.getMonth() + 1,
            day = now.getDate(),
            hour = now.getHours();
        return laydate.render({
            elem: '#workTime',
            trigger: 'click',
            type: 'datetime',
            value: year + '-' + pad(month, 2) + '-' + pad(day, 2) + ' ' + pad(hour, 2) + ':00:00',
            min: 'now',
            lang: 'en'
        });
    }
    /**
     * 推送页面渲染方法
     * @author siliang
     * @Date   2023-03-13
     */
    function pushPageRender(isImage) {
        var pageImage = '';
        var uploadImage = '';
        getPreviewImage(mmCode, function(images) {
            var pageTotal = images.length;
            var _Html = '';
            for (var i = 1; i <= pageTotal; i++) {
                _Html += '<option value="' + i + '">' + i + '</option>';
            }
            $('select[name="pageNo"]').html(_Html);
            form.render('select');
            if (isImage) {
                pageImage = images[0] || '';
                setCoverImage(pageImage);
                form.on('select(pageNo)', function(data) {
                    var index = parseInt(data.value) - 1;
                    pageImage = images[index];
                    if (uploadImage == '') {
                        setCoverImage(pageImage);
                    }
                });
            }
        });
        if (isImage) {
            // 设置封面图
            function setCoverImage(image) {
                $('input[name="coverUrl').val(image);
                $('.cover-image a').attr('href', image);
                $('.cover-image img').attr('src', image);
            }
            var files = {};
            var clearUploadFile = function(files) {
                for (var x in files) {
                    delete files[x];
                }
            };
            var uploadRender = upload.render({
                elem: '#uploadImage',
                url: getApiUrl('file.upload'),
                method: getApiMethod('file.upload'),
                field: api('file.upload').file.field,
                accept: 'images',
                exts: 'jpg|jpeg|png|gif',
                choose: function(obj) {
                    clearUploadFile(files);
                    //将每次选择的文件追加到文件队列
                    files = obj.pushFile();
                },
                done: function(res, index, upload) {
                    if (res.code === '0000') {
                        uploadImage = res.data.path;
                        setCoverImage(uploadImage);
                        $('#clearImage').removeClass('layui-hide');
                        delete files[index];
                    } else {
                        layer.msg(res.msg);
                    }
                },
                error: function() {
                    layer.msg('upload failed', {
                        icon: 5
                    });
                    clearUploadFile(files);
                }
            });
            // 清除上传图片
            $('#clearImage').click(function() {
                uploadImage = '';
                $('#clearImage').addClass('layui-hide');
                setCoverImage(pageImage);
            });
        }
    }
    // 上传文件
    function uploadExcelInit(elem, success) {
        var files = {};
        var clearUploadFile = function(files) {
            for (var x in files) {
                delete files[x];
            }
        };
        var uploadRender = upload.render({
            elem: elem,
            url: getApiUrl('file.upload'),
            method: getApiMethod('file.upload'),
            field: api('file.upload').file.field,
            accept: 'file',
            acceptMime: 'application/vnd.ms-excel,application/msexcel,application/x-msexcel,application/x-ms-excel,application/x-excel,application/x-dos_ms_excel,application/xls,application/x-xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv',
            exts: 'xls|xlsx|csv',
            choose: function(obj) {
                clearUploadFile(files);
                //将每次选择的文件追加到文件队列
                files = obj.pushFile();
            },
            done: function(res, index, upload) {
                if (res.code === '0000') {
                    success && success(res.data);
                    delete files[index];
                } else {
                    layer.msg(res.msg);
                }
            },
            error: function() {
                layer.msg('upload failed', {
                    icon: 5
                });
                clearUploadFile(files);
            }
        });
    }
    // 获取模板全部预览图
    function getPreviewImage(mmCode, success) {
        AjaxRequest({
            url: getApiUrl('marketing.activity.template', {
                mmCode: mmCode
            }),
            method: getApiMethod('marketing.activity.template'),
            headers: {
                "Content-Type": "application/json",
            },
            data: {
                // 不返回模板页面内容
                "content": 0,
            },
            success: function(result) {
                if (result.code === "0000") {
                    var previewUrl = [];
                    if (result.data.previewMap != null) {
                        var previewMap = JSON.parse(result.data.previewMap);
                        if (Array.isArray(previewMap.data)) {
                            for (var i in previewMap.data) {
                                previewUrl.push(previewMap.data[i].previewUrl);
                            }
                        }
                    }
                    success && success(previewUrl);
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                layer.msg('Error');
            }
        });
    }
    // 获取MM详情信息
    var __getActivityDetail_fail_number = 0;

    function getActivityDetail(mmCode, success) {
        AjaxRequest({
            url: getApiUrl('marketing.activity.detailByCode', {
                mmCode: mmCode
            }),
            method: getApiMethod('marketing.activity.detailByCode'),
            headers: {
                "Content-Type": "application/json",
            },
            success: function(result) {
                __getActivityDetail_fail_number = 0;
                if (result.code === "0000") {
                    success && success(result.data);
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__getActivityDetail_fail_number;
                console.log('getActivityDetail: 网络错误！');
                if (__getActivityDetail_fail_number < 3) {
                    setTimeout(function() {
                        getActivityDetail(mmCode, success);
                    }, 100);
                } else {
                    console.log('getActivityDetail: 已累计3次请求失败');
                }
            }
        });
    }
    // 获取客户列表
    var __getCustomerList_fail_number = 0;

    function getCustomerList(data, success, error) {
        AjaxRequest({
            url: getApiUrl('member.customer.page'),
            method: getApiMethod('member.customer.page'),
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify(data),
            success: function(result) {
                __getCustomerList_fail_number = 0;
                if (result.code === "0000") {
                    success && success(result.data);
                } else {
                    layer.msg(result.msg);
                    error && error();
                }
            },
            error: function(e) {
                ++__getCustomerList_fail_number;
                console.log('getCustomerList: 网络错误！');
                if (__getCustomerList_fail_number < 3) {
                    setTimeout(function() {
                        getCustomerList(data, success, error);
                    }, 100);
                } else {
                    console.log('getCustomerList: 已累计3次请求失败');
                    error && error();
                }
            }
        });
    }
    // 获取segment数据
    var __getSegmentList_fail_number = 0;

    function getSegmentList(data, success, error) {
        $.ajax({
            url: getApiUrl('segment.list'),
            type: getApiMethod('segment.list'),
            headers: {
                "Content-Type": "application/json",
            },
            data: data,
            success: function(result) {
                __getSegmentList_fail_number = 0;
                if (result.code === "0000") {
                    success && success(result.data);
                } else {
                    layer.msg(result.msg);
                    error && error();
                }
            },
            error: function(e) {
                ++__getSegmentList_fail_number;
                console.log('getSegmentList: 网络错误！');
                if (__getSegmentList_fail_number < 3) {
                    setTimeout(function() {
                        getSegmentList(data, success, error);
                    }, 100);
                } else {
                    console.log('getSegmentList: 已累计3次请求失败');
                    error && error();
                }
            }
        });
    }
    // 获取member Type数据
    var __getMemberTypeList_fail_number = 0;

    function getMemberTypeList(data, success, error) {
        $.ajax({
            url: getApiUrl('member.type.list'),
            type: getApiMethod('member.type.list'),
            headers: {
                "Content-Type": "application/json",
            },
            data: data,
            success: function(result) {
                __getMemberTypeList_fail_number = 0;
                if (result.code === "0000") {
                    success && success(result.data);
                } else {
                    layer.msg(result.msg);
                    error && error();
                }
            },
            error: function(e) {
                ++__getMemberTypeList_fail_number;
                console.log('getMemberTypeList: 网络错误！');
                if (__getMemberTypeList_fail_number < 3) {
                    setTimeout(function() {
                        getMemberTypeList(data, success, error);
                    }, 100);
                } else {
                    console.log('getMemberTypeList: 已累计3次请求失败');
                    error && error();
                }
            }
        });
    }
    return {
        pushUserRender: pushUserRender,
        pushTimeRender: pushTimeRender,
        pushPageRender: pushPageRender,
        // 获取数据方法
        getPreviewImage: getPreviewImage,
        getActivityDetail: getActivityDetail,
        getCustomerList: getCustomerList,
        getSegmentList: getSegmentList,
        getMemberTypeList: getMemberTypeList,
    };
};