// 第二步
var step2 = function() {
    var $ = layui.$,
        setter = layui.setter,
        layer = layui.layer,
        form = layui.form,
        table = layui.table,
        upload = layui.upload,
        element = layui.element;

    var storage = layui.data(setter.tableName);
    
    // 步骤初始化
    function onLoad() {
        showStep();
        initUploadProduct();
    }

    // 步骤重新显示
    function onShow() {
        showStep();
        loadExcelSheetData();
    }

    // 在当前步骤时触发
    function showStep() {
        // 表单form值验证
        form.verify({
            // 必须存在商品数据
            requiredProduct: function(value) {
                if (!window.productData || !window.productData.info || !window.productData.dataList) {
                    return 'The current sheet does not have valid data!';
                }
                if (window.productData.dataList.length == 0) {
                    return 'The current sheet does not have valid data!';
                }
            },
        });
    }
    var uploadId = '';
    var sheet = '';

    /** 商品导入 **/
    var data = {
        // 选择文件的盒子ID
        addUploadFileId: 'uploadProductExcel',
        // 上传初始化次数
        uploadNum: 0,
    };

    function initUploadProduct() {
        // 初始化时重新绑定按钮对象
        var elemStr = '#' + data.addUploadFileId + '-' + data.uploadNum;
        var files = {};
        var clearUploadFile = function(files) {
            for (var x in files) {
                delete files[x];
            }
        };
        var layerUpload;
        var uploadRender = upload.render({
            elem: elemStr,
            url: getApiUrl('import.marketingActivity.upload'),
            method: getApiMethod('import.marketingActivity.upload'),
            field: 'file',
            headers: {
                'Authorization': 'Bearer ' + storage.access_token
            },
            accept: 'file',
            acceptMime: 'application/vnd.ms-excel,application/msexcel,application/x-msexcel,application/x-ms-excel,application/x-excel,application/x-dos_ms_excel,application/xls,application/x-xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            exts: 'xls|xlsx',
            before: function() {
                // 点击上传后修改绑定对象的ID，使其可以重新初始化
                data.uploadNum += 1;
                $(elemStr).id = '#' + data.addUploadFileId + '-' + data.uploadNum;
            },
            choose: function(obj) {
                sheet = '';
                clearUploadFile(files);
                //将每次选择的文件追加到文件队列
                files = obj.pushFile();
            },
            progress: function(n, elem, res, index) {
                var percent = n + '%';
                element.progress('upload-progress', percent);
            },
            done: function(res, index, upload) {
                if (res.code === '0000') {
                    var sheetList = res.data.sheets;
                    if (sheetList.length > 0) {
                        uploadId = res.data.uploadId;

                        $('#excel-info,#excel-data').removeClass('layui-hide');
                        var box = $('#excel-info select[name="sheet"]');
                        var html = '';
                        for (var x in sheetList) {
                            html += '<option value="' + sheetList[x] + '">' + sheetList[x] + '</option>';
                        }
                        box.html(html);
                        form.render('select');

                        sheet = sheetList[0];
                        loadExcelSheetData(sheet);
                        var fileName = files[index].name;
                        $('#excel-info input[name="excelFile"]').val(fileName);
                    } else {
                        layer.msg('Please upload again');
                    }
                    delete files[index];
                } else {
                    layer.alert(res.msg, {
                        maxWidth: 400,
                        title: 'Error',
                        btn: 'Close',
                        icon: 5
                    });
                }
            },
            error: function() {
                clearUploadFile(files);
            }
        });
    }
    // 载入工作表数据
    function loadExcelSheetData(sheetName)
    {
        var importData;
        // 加载完成回调
        var loadComplete = function() {
            var dataList = [];
            if (sheetName !== undefined) {
                window.productData = importData;

                if (importData != null && importData.dataList.length > 0) {
                    dataList = importData.dataList;
                    for (var i = dataList.length - 1; i >= 0; i--) {
                        if (dataList[i].pic === undefined) {
                            dataList[i].pic = null;
                        }
                    }
                }

                // 商品的页面
                window.productPages = [];
                var pages = [];
                for (var i = 0; i < dataList.length; i++) {
                    var page = parseInt(dataList[i].page);
                    if (pages.indexOf(page) === -1) {
                        pages.push(page);
                    }
                }
                pages.sort((a, b) => {
                    return a - b;
                });
                window.productPages = pages;
                console.log('textthai 页面', window.productPages);
            } else {
                // 复用时执行
                importData = window.productData;

                if (importData != null && importData.dataList.length > 0) {
                    dataList = importData.dataList;
                }
            }
            // 显示表格
            table.render({
                elem: '#excelSheetImportData',
                cols: [[ //标题栏
                    {width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                    ,{width: 120, title: 'From', fixed: 'left', templet: function(res) {
                        return res.channelType == '' || res.channelType == null ? 'Database' : 'Excel';
                    }}
                    ,{field:'channelType', minWidth: 120, title: 'Channel Type' }
                    ,{field:'thumbnailPath', width: 180, title: 'Picture', templet: imgTpl }
                    ,{field:'namethai', minWidth: 240, title: 'Name (Thai)' }
                    ,{field:'nameen', minWidth: 240, title: 'Name (EN)' }
                    ,{field:'parentCode', width: 160, title: 'Parent Code' }
                    ,{field:'urlparam', width: 160, title: 'Item Code' }
                    // ,{field:'urlparam', width: 160, title: 'Url Param' }
                    ,{field:'productId', width: 160, title: 'Product ID' }
                    ,{field:'page', width: 120, title: 'Page', sort: true }
                    ,{field:'sort', width: 120, title: 'Sort', sort: true }
                    ,{field:'linkitemno', width: 200, title: 'LinkItemNo' }
                    ,{field:'pack', width: 200, title: 'Package' }
                    ,{field:'model', width: 160, title: 'Model' }
                    ,{field:'normalprice', width: 120, title: 'Normal Price' }
                    ,{field:'promoprice', width: 120, title: 'Promo Price' }
                    ,{field:'promotedesc', width: 300, title: 'Promo Price Description' }
                    ,{field:'categoryid', width: 200, title: 'Category ID' }
                    ,{field:'icon1', width: 160, title: 'Icon (1)' }
                    ,{field:'icon2', width: 160, title: 'Icon (2)' }
                    ,{field:'icon3', width: 160, title: 'Icon (3)' }
                    ,{field:'iconRemark', width: 200, title: 'Icon Remark' }
                    ,{field:'promotype', width: 120, title: 'Promo Type', templet: function(res) {
                        switch (res.promotype) {
                            case 1:
                                return 'Normal';
                            case 2:
                                return 'Link Item';
                            default:
                                return 'Unknown';
                        }
                    }}
                    ,{field:'qty1', width: 80, title: 'Step1' }
                    ,{field:'qty1unit', width: 160, title: 'Sale Unit' }
                    ,{field:'promoprice1', width: 120, title: 'Promo Price 1' }
                    ,{field:'qty2', width: 80, title: 'Step2' }
                    ,{field:'qty2unit', width: 160, title: 'Step2/Unit' }
                    ,{field:'promoprice2', width: 120, title: 'Promo Price 2' }
                    ,{field:'promoprice2description', width: 240, title: 'Promo Price 2 Description' }
                    ,{field:'qty3', width: 80, title: 'Step3' }
                    ,{field:'qty3unit', width: 160, title: 'Step3/Unit' }
                    ,{field:'promoprice3', width: 120, title: 'Promo Price 3' }
                    ,{field:'promoprice3description', width: 240, title: 'Promo Price 3 Description' }
                    ,{field:'qty4', width: 80, title: 'Step4' }
                    ,{field:'qty4unit', width: 160, title: 'Step4/Unit' }
                    ,{field:'promoprice4', width: 120, title: 'Promo Price 4' }
                    ,{field:'promoprice4description', width: 240, title: 'Promo Price 4 Description' }
                    ,{field:'remark1', width: 200, title: 'Remark 1' }
                    ,{field:'remark2', width: 200, title: 'Remark 2' }
                    ,{field:'remark3', width: 200, title: 'Remark 3' }
                ]],
                data: dataList,
                page: false,
                done: function(res, curr, count) {
                    var that = $(this.elem).next();
                    var mmType = $('#quick-step1 select[name="type"]').val();
                    if (typeof mmType == 'string') {
                        mmType = mmType.toLowerCase();
                    }
                    //循环遍历返回数据中的data
                    res.data.forEach(function(item, index) {
                        var itemType = typeof item.channelType == 'string' ? item.channelType.toLowerCase() : item.channelType;
                        if (itemType != '' && itemType != null && itemType != mmType) {
                            //在获取到的DOM元素中找到data-index属性等于当前index的行
                            var tr = that.find(".layui-table-box tbody tr[data-index='" + index + "']");
                            //设置该行颜色
                            tr.css("background-color", "#E74E1E");
                            tr.css("color", "#FFF");
                        }
                    });
                }
            });
    
            // 监听工具条
            table.on('tool(excelSheetImportData)', function(obj) {
                var data = obj.data;
                // 选择图片替换
                if (obj.event === 'replacePicture') {
                    var itemCode = data.urlparam;
                    var layerIndex = parent.layer.open({
                        type: 2
                        ,title: false
                        ,id: 'selectProductPicture'
                        ,content: '/makroDigital/product/pictureSelect/' + itemCode + '?tempUpload=1'
                        ,area: ['900px', '550px']
                        ,closeBtn: 0
                        ,shadeClose: true
                        ,skin: 'layui-layer-transparent'
                        ,success: function(layero, index) {
                            var iframeWindow = layero.find('iframe')[0].contentWindow,
                                submitID = 'LAY-picture-selected-submit';
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj2) {
                                var field = JSON.stringify(obj2.field);
                                var result = JSON.parse(field);

                                // 插入商品图片信息
                                var pic = JSON.parse(result.json);
                                obj.update({
                                    pic: pic,
                                    picid: result.picID,
                                }, true);
                            });
                        }
                    });
                }
            });
        };
        if (sheetName) {
            $.ajax({
                url: getApiUrl('import.marketingActivity.getExcelData', { uploadId: uploadId }) + '?sheetName=' + encodeURIComponent(sheetName) + '&product=1',
                type: getApiMethod('import.marketingActivity.getExcelData'),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + storage.access_token
                },
                success: function(result) {
                    if (result.code === '0000') {
                        importData = result.data;
                    } else {
                        layer.alert(result.msg, {
                            maxWidth: 400,
                            title: 'Error',
                            btn: 'Close',
                            icon: 5
                        });
                    }
                },
                complete: loadComplete
            });
        } else {
            loadComplete();
        }
    }

    // 选择Excel工作表事件监听
    form.on('select(sheet)', function(data) {
        sheet = data.value;
        loadExcelSheetData(sheet);
    });

    return {
        onLoad: onLoad,
        onShow: onShow,
    };
};