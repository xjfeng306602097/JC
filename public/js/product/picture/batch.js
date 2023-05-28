/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/productPicture/batch
    
 */

parent.importData = {};
var sheet = '';
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'upload', 'layer', 'table', 'element'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,form = layui.form
        ,upload = layui.upload
        ,layer = layui.layer
        ,table = layui.table
        ,element = layui.element;

    var storage = layui.data(setter.tableName);

    var data = {
        // 选择文件的盒子ID
        addUploadFileId: 'upload',
        // 确认上传按钮ID
        submitUpload: 'LAY-picture-batchUpload-submit',
        // 上传初始化次数
        initUploadNum: 0
    };
    var files = {},
        uploadList = [],
        uploadFileIndex = {},
        uploadRender, load;
    window.uploadNum = 0;
    var initUpload = function() {
        // 初始化时重新绑定按钮对象
        var elemStr = '#' + data.addUploadFileId + '-' + data.initUploadNum;
        var submitUploadBtnStr = '#' + data.submitUpload;
        var clearUploadFile = function(files) {
            for (var x in files) {
                delete files[x];
            }
        };
        clearUploadFile(files);
        uploadRender = upload.render({
            elem: elemStr,
            url: getApiUrl('product.picture.batchUpload'),
            method: getApiMethod('product.picture.batchUpload'),
            field: api('product.picture.batchUpload').file.field,
            headers: {
                'Authorization': 'Bearer ' + storage.access_token
            },
            accept: 'images',
            exts: api('product.picture.batchUpload').file.exts,
            multiple: true,
            auto: false, //选择文件后不自动上传
            bindAction: submitUploadBtnStr, //指向一个按钮触发上传
            before: function(obj) {
                if (uploadNum == 0) {
                    return;
                }
                for (var i in uploadList) {
                    if (uploadList[i].itemCode == '') {
                        layer.msg('Item code cannot be empty, please complete');
                        return false;
                    }
                }
                load = layer.load(1);
                // 点击上传后修改绑定对象的ID，使其可以重新初始化
                data.initUploadNum += 1;
                $(elemStr).id = '#' + data.addUploadFileId + '-' + data.initUploadNum;
                $(submitUploadBtnStr).id = '#' + data.submitUpload;
                // 待上传时，修改文件名称
                for (var i in uploadList) {
                    if (uploadList[i].status == 0) {
                        var itemCode = uploadList[i].itemCode;
                        var key = uploadList[i].key;
                        var name = uploadList[i].name;
                        if (itemCode != '' && files[key]) {
                            var suffix = name.lastIndexOf('.') == -1 ? '' : name.substring(name.lastIndexOf('.'));
                            obj.resetFile(key, files[key], itemCode + '_' + key + suffix);
                        }
                    }
                }
            },
            choose: function(obj) {
                if (uploadNum == 0) {
                    layer.closeAll('tips');
                }
                //将每次选择的文件追加到文件队列
                files = obj.pushFile();
                uploadList = [];
                uploadFileIndex = {};
                uploadNum = 0;
                for (var x in files) {
                    var fileName = files[x].name;
                    var res = fileName.replace(/\.(.*?)$/, "").match(/[0-9]+/);
                    var itemCode = res ? res[0] : '';
                    uploadList.push({
                        key: x,
                        status: 0,
                        name: fileName,
                        size: parseInt(files[x].size * 100 / 1024) / 100 + 'KB',
                        type: files[x].type,
                        itemCode: itemCode || '',
                    });
                    uploadFileIndex[x] = uploadList.length - 1;
                }
                uploadNum = uploadList.length;
                loadUploadList();
            },
            done: function(res, index, upload) {
                delete files[index];
                --uploadNum;
                if (res.code === '0000') {
                    uploadList[uploadFileIndex[index]].status = 1;
                } else {
                    uploadList[uploadFileIndex[index]].status = -1;
                    uploadList[uploadFileIndex[index]].errorMsg = res.msg;
                    var position = '.layui-table-view .layui-table-body table>tbody tr:eq(' + uploadFileIndex[index] + ') td:nth-child(2)';
                    layer.tips(res.msg, position, {
                        time: 10000,
                        tips: 2,
                        tipsMore: true,
                    });
                }
                loadUploadList();
            },
            error: function(index, upload) {
                delete files[index];
                --uploadNum;
                uploadList[uploadFileIndex[index]].status = -2;
                loadUploadList();
            },
            allDone: function() {
                clearUploadFile(files);
                layer.close(load);
            }
        });
    };
    initUpload();

    function initUploadList() {
        table.render({
            id: 'batchUploadListTable'
            ,elem: '#content-picture-batchUpload-list'
            ,loading: true
            ,even: true
            ,data: []
            ,toolbar: '#batchUploadListToolbar'
            ,defaultToolbar: ['filter','exports']
            ,cols: [[
                {type:'radio', width: 60, fixed: 'left' }
                ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{field:'status', width: 120, title: 'Status', templet: function(res) {
                    switch (res.status) {
                        case 0:
                            return '<span style="color: #1E9FFF;">Pending</span>';
                        case 1:
                            return '<span style="color: #FFB800;">Succeeded</span>';
                        case -1:
                            return '<span style="color: #FF5722;">Failed</span>';
                        case -2:
                            return '<span style="color: #FF5722;">Error</span>';
                    }
                    return '<span>Unknown</span>';
                }}
                ,{field:'name', minWidth: 200, title: 'File Name' }
                ,{field:'size', width: 160, title: 'File Size' }
                ,{field:'itemCode', width: 160, title: 'Item Code', sort: true, edit: 'text' }
            ]],
            page: false
        });
    }
    initUploadList();

    //头工具栏事件
    table.on('toolbar(content-picture-batchUpload-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch(obj.event){
            case 'remove':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var key = data[0].key;
                    delete files[key];
                    --uploadNum;
                    for (var i in uploadList) {
                        if (uploadList[i].key == key) {
                            uploadList.splice(i, 1);

                            resetUploadID();
                            break;
                        }
                    }
                    loadUploadList();
                }
                break;
        }
    });

    table.on('edit(content-picture-batchUpload-list)', function(obj) {
        var data = obj.data;
        var value = obj.value;
        var originalValue = $(this).prev().text();// 修改之前的值
        if (obj.field == 'itemCode') {
            if ((value != '' && parseInt(value).toString() !== value) || data.status != 0) {
                obj.tr.find('td[data-field="' + obj.field + '"] input').val(originalValue);
                obj.data[obj.field] = originalValue;
                obj.update(obj.data);
                if (data.status != 0) {
                    layer.msg('Can only be edited while pending upload');
                }
                return;
            }
        }
    });

    function loadUploadList() {
        table.reload('batchUploadListTable', {
            data: uploadList
        });
        form.val('batchUpload', {
            list: JSON.stringify(uploadList),
            number: uploadNum,
        });
    }

    function resetUploadID() {
        var elemStr = '#' + data.addUploadFileId + '-' + data.initUploadNum;
        var submitUploadBtnStr = '#' + data.submitUpload;
        data.initUploadNum += 1;
        $(elemStr).id = '#' + data.addUploadFileId + '-' + data.initUploadNum;
        $(submitUploadBtnStr).id = '#' + data.submitUpload;
    }

});