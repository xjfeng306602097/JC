/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/memberCustomer/import
    
 */

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

    var storage = layui.data(setter.tableName);

    var current_segmentId = $('input[name="segment"]').val();

    var uploadData = {};
    if (current_segmentId) {
        uploadData.segmentId = current_segmentId;
    }

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
        var layerProgress;
        var layerProgressIndex;
        var uploadRender = upload.render({
            elem: elemStr,
            url: getApiUrl('import.customer.parseExcel'),
            method: getApiMethod('import.customer.parseExcel'),
            field: 'file',
            headers: {
                'Authorization': 'Bearer ' + storage.access_token
            },
            data: uploadData,
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
                clearUploadFile(files);
                //将每次选择的文件追加到文件队列
                files = obj.pushFile();
                layer.open({
                    type: 1,
                    title: 'Upload',
                    id: 'upload-excel-progress',
                    content: $('#uploadProgressHtml').html(),
                    area: ['440px', '300px'],
                    move: false,
                    success: function(layero, index) {
                        layerProgress = layero;
                        layerProgressIndex = index;
                    },
                    yes: function(index, layero) {},
                    end: function() {
                        clearUploadFile(files);
                        uploadRender.config.elem.next()[0].value = '';
                    }
                });
            },
            progress: function(n, elem, res, index) {
                var percent = n + '%';
                element.progress('upload-progress', percent);
            },
            done: function(res, index, upload) {
                if (res.code === '0000') {
                    layer.close(layerProgressIndex);

                    var layerIndex = parent.layer.getFrameIndex(window.name); //获取当前弹窗的Id
                    parent.previewExcelData({
                        data: res.data,
                        uploadLayerIndex: layerIndex,
                    });

                    delete files[index];
                } else {
                    layerProgress.find('.upload-file .layui-progress-bar').addClass('layui-bg-red');
                    layerProgress.find('.upload-file .layui-progress-text').text(res.msg);
                    clearUploadFile(files);
                }
            },
            error: function() {
                layerProgress.find('.upload-file .layui-progress-bar').addClass('layui-bg-red');
                layerProgress.find('.upload-file .layui-progress-text').text('Error!');
                clearUploadFile(files);
            }
        });
    };
    initUpload();
});