/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingActivity/productImport
    
 */

parent.importData = {};
var sheet = '';
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'upload', 'layer', 'element'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,form = layui.form
        ,upload = layui.upload
        ,layer = layui.layer
        ,element = layui.element;

    var mmCode = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    var data = {
        // 选择文件的盒子ID
        addUploadFileId: 'upload',
        // 确认上传按钮ID
        impDataBtnId: 'impDataBtn',
        // 上传初始化次数
        initUploadNum: 0
    };
    var initUpload = function() {
        // 初始化时重新绑定按钮对象
        var elemStr = '#' + data.addUploadFileId + '-' + data.initUploadNum;
        var impDataBtnStr = '#' + data.impDataBtnId + '-' + data.initUploadNum;
        var files = {};
        var clearUploadFile = function(files) {
            for (var x in files) {
                delete files[x];
            }
        };
        var layerUpload;
        var uploadId = '';
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
            // auto: false, //选择文件后不自动上传
            bindAction: impDataBtnStr, //指向一个按钮触发上传
            before: function() {
                // 点击上传后修改绑定对象的ID，使其可以重新初始化
                data.initUploadNum += 1;
                $(elemStr).id = '#' + data.addUploadFileId + '-' + data.initUploadNum;
                $(impDataBtnStr).id = '#' + data.impDataBtnId + '-' + data.initUploadNum;
            },
            choose: function(obj) {
                sheet = '';
                clearUploadFile(files);
                //将每次选择的文件追加到文件队列
                files = obj.pushFile();
                layer.open({
                    type: 1,
                    title: 'Upload',
                    id: 'selectSheet',
                    content: $('#uploadHtml').html(),
                    area: ['440px', '480px'],
                    move: false,
                    success: function(layero, index) {
                        layerUpload = layero;
                        // 选择指定的sheet
                        var selectSheet = function () {
                            $(this).parent().siblings().removeClass('selected');
                            $(this).parent().addClass('selected');
                            sheet = $(this).data('sheet');
                        }
                        // 载入sheet数据
                        var loadSheetData = function () {
                            if (sheet == '') {
                                layer.msg('Please select the sheet to be imported');
                                return;
                            }
                            var frame = $(this).parent().parent();
                            $.ajax({
                                url: getApiUrl('import.marketingActivity.getExcelData', {uploadId: uploadId}) + '?sheetName=' + encodeURIComponent(sheet),
                                type: getApiMethod('import.marketingActivity.getExcelData'),
                                // data: JSON.stringify({
                                //     sheetName: sheet,
                                // }),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === '0000') {
                                        var layerIndex = parent.layer.getFrameIndex(window.name); //获取当前弹窗的Id
                                        parent.layer.min(layerIndex);
                                        parent.previewExcelSheet({
                                            mmCode: mmCode,
                                            sheet: sheet,
                                            data: result.data,
                                            uploadLayerIndex: layerIndex,
                                        });
                                    } else {
                                        layer.alert(result.msg, {
                                            maxWidth: 400,
                                            title: 'Error',
                                            btn: 'Close',
                                            icon: 5
                                        });
                                    }
                                }
                            });
                        }
                        // 将事件绑定到指定的控件上
                        layerUpload.on('click', '.select-sheet ul li a', selectSheet);
                        layerUpload.on('click', '.select-sheet button', loadSheetData);
                    },
                    yes: function(index, layero) {},
                    end: function() {
                        clearUploadFile(files);
                        uploadRender.config.elem.next()[0].value = '';
                        sheet = '';
                    }
                });
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

                        layerUpload.find('.layui-layer-title').text('Please select the worksheet to be imported in Excel');
                        var box = layerUpload.find('.select-sheet');
                        var html = '<ul>';
                        for (var x in sheetList) {
                            html += '<li><a href="javascript:;" data-sheet="' + sheetList[x] + '">' + sheetList[x] + '</a></li>';
                        }
                        html += '</ul>';
                        html += '<button type="button" class="layui-btn layui-btn-fluid" data-layerIndex="' + index + '">Next</button>';
                        box.attr('style', null);
                        box.html(html);
                    } else {
                        uploadId = '';
                        layer.msg('Please upload again');
                    }

                    delete files[index];
                } else {
                    uploadId = '';
                    layer.alert(res.msg, {
                        maxWidth: 400,
                        title: 'Error',
                        btn: 'Close',
                        icon: 5
                    });
                }
            },
            error: function() {
                layerUpload.find('.select-sheet .layui-progress-bar').addClass('layui-bg-red');
                layerUpload.find('.select-sheet .layui-progress-text').text('Error!');
                clearUploadFile(files);
            }
        });
    };
    initUpload();
});