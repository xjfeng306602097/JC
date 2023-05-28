/**

 @Name：makro 
 @Author：makro
 @Site：http://mm.makrogo.com/makroDigital/marketingElement/add
    
 */

// 已上传文件列表
var uploadList = [];
layui.config({
	base: '../../layuiadmin/' //静态资源所在路径
}).extend({
	index: 'lib/index' //主入口模块
}).use(['index', 'layer', 'form', 'dict', 'upload', 'uploadAPI'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form
        ,dict = layui.dict
        ,upload = layui.upload
        ,uploadAPI = layui.uploadAPI;
    
    var storage = layui.data(setter.tableName);
    var elementType = getUrlRelativePath(4) || '';

    init();
    //初始化页面
    function init() {
        loadElementType(elementType);
        if (elementType) {
            $('select[name="type"]').prop('disabled', true);
            form.render();
        }
    }

    // 载入Element类型列表
    var __loadElementType_fail_number = 0;
    function loadElementType(value, success) {
        dict.render({
            elem: 'select[name="type"]',
            dictCode: 'element_type',
            value: value,
            success: function (res) {
                __loadElementType_fail_number = 0;
            },
            error: function(e) {
                ++__loadElementType_fail_number;
                console.log('loadElementType: 网络错误！');
                if (__loadElementType_fail_number < 3) {
                    setTimeout(function() {
                        loadElementType(value, success);
                    }, 100);
                } else {
                    console.log('loadElementType: 已累计3次请求失败');
                }
            }
        });
    }
    
    var files = {};
    var clearUploadFile = function(files) {
        for (var x in files) {
            delete files[x];
        }
    };
    var uploadRender = upload.render({
        elem: '#uploadElement',
        url: getApiUrl('file.uploadImage'),
        method: getApiMethod('file.uploadImage'),
        field: api('file.uploadImage').file.field,
        headers: {
            'Authorization': 'Bearer ' + storage.access_token
        },
        data: {
            limit: 1500, // 限制最长边1500px
        },
        accept: 'file',
        exts: api('file.uploadImage').file.exts,
        choose: function(obj) {
            clearUploadFile(files);
            //将每次选择的文件追加到文件队列
            files = obj.pushFile();
        },
        before: function(obj) {
            layer.load(); // 打开loading
        },
        done: function(res, index, upload) {
            layer.closeAll('loading'); // 关闭loading
            if (res.code === '0000') {
                form.val('elementAdd', {
                    path: res.data.originPath,
                });
                parent.filePath=JSON.stringify(res.data);
                uploadList.push(res.data.originPath);
                delete files[index];
            } else {
                layer.msg(res.msg);
            }
        },
        error: function() {
            layer.msg('upload failed', {icon: 5});
            clearUploadFile(files);
        }
    });

    window.onbeforeunload = function() {
        uploadAPI.cancel(uploadList);
    };
           
}); 