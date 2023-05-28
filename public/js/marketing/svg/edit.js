/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingSvg/edit
    
 */

// 已上传文件列表
var uploadList = [];
var currentFile = '';
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
        
    var current_id = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);
    
    // 获取字体信息
    $.ajax({
        url: getApiUrl('marketing.svg.detail', {id: current_id}),
        type: getApiMethod('marketing.svg.detail'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code === "0000") {
                form.val('svgEdit', {
                    "name": result.data.name,
                    "path": result.data.path,
                    "remark": result.data.remark,
                    "sort": result.data.sort,
                });
                currentFile = result.data.path;
            } else {
                layer.msg(result.msg);
            }
        }
    });

    var files = {};
    var clearUploadFile = function(files) {
        for (var x in files) {
            delete files[x];
        }
    };
    var uploadRender = upload.render({
        elem: '#uploadSvg',
        url: getApiUrl('file.upload'),
        method: getApiMethod('file.upload'),
        field: api('file.upload').file.field,
        headers: {
            'Authorization': 'Bearer ' + storage.access_token
        },
        accept: 'images',
        acceptMime: 'image/svg+xml',
        exts: 'svg',
        choose: function(obj) {
            clearUploadFile(files);
            //将每次选择的文件追加到文件队列
            files = obj.pushFile();
        },
        done: function(res, index, upload) {
            if (res.code === '0000') {
                form.val('svgEdit', {
                    path: res.data.path
                });
                uploadList.push(res.data.path);
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