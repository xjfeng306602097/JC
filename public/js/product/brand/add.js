/**

 @Name：makro 
 @Author：makro
 @Site：http://mm.makrogo.com/makroDigital/productBrand/add
    
 */

// 已上传文件列表
var uploadList = [];
layui.config({
	base: '../../layuiadmin/' //静态资源所在路径
}).extend({
	index: 'lib/index' //主入口模块
}).use(['index', 'layer', 'form', 'upload', 'uploadAPI'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form
        ,upload = layui.upload
        ,uploadAPI = layui.uploadAPI;
    
    var storage = layui.data(setter.tableName);
    
    var files = {};
    var clearUploadFile = function(files) {
        for (var x in files) {
            delete files[x];
        }
    };
    var uploadRender = upload.render({
        elem: '#uploadBrandImage',
        url: getApiUrl('file.uploadImage'),
        method: getApiMethod('file.uploadImage'),
        field: api('file.uploadImage').file.field,
        headers: {
            'Authorization': 'Bearer ' + storage.access_token
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
                form.val('brandAdd', {
                    path: res.data.originPath,
                });
                uploadList.push(res.data.originPath);
                $('#brandImage').attr('src', res.data.thumbnailPath);
                window.brandImage = res.data;
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