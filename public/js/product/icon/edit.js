/**

 @Name：makro 
 @Author：makro
 @Site：http://mm.makrogo.com/makroDigital/productIcon/edit
    
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
    
    var iconName = '';
    // 获取icon信息
    $.ajax({
        url: getApiUrl('product.icon.detail', {id: current_id}),
        type: getApiMethod('product.icon.detail'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code === "0000") {
                form.val('iconEdit', {
                    "name": result.data.name,
                    "picid": result.data.picid,
                    "remark": result.data.remark
                });
                iconName = result.data.name;
                currentFile = result.data.path;
                var picid = result.data.picid;
                if (picid != null) {
                    $.ajax({
                        url: getApiUrl('product.icon.picture.detail', {id: picid}),
                        type: getApiMethod('product.icon.picture.detail'),
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        success: function(result) {
                            if (result.code === "0000") {
                                form.val('iconEdit', {
                                    "path": result.data.originPath
                                });
                                $('#iconImage').attr('src', result.data.thumbnailPath);
                            } else {
                                layer.msg(result.msg);
                            }
                        }
                    });
                }
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
        elem: '#uploadProductIcon',
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
            delete files[index];
            if (res.code === '0000') {
                form.val('iconEdit', {
                    path: res.data.originPath
                });
                $('#iconImage').attr('src', res.data.thumbnailPath);
                var imageData = res.data;
                var mydata = {
                    iconid: current_id,
                    defaulted: 1,
                    filePath: JSON.stringify(imageData),
                };
                $.ajax({
                    url: getApiUrl('product.icon.picture.add'),
                    type: getApiMethod('product.icon.picture.add'),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + storage.access_token
                    },
                    data: JSON.stringify(mydata),
                    success: function(res) {
                        if (res.code === '0000') {
                            form.val('iconEdit', {
                                picid: res.data.id
                            });
                        } else {
                            console.log('插入icon图片数据失败');
                        }
                    },
                    error: function(e) {
                        console.log(e);
                    }
                });
            } else {
                layer.msg(res.msg);
            }
        },
        error: function() {
            layer.msg('upload failed', {icon: 5});
            clearUploadFile(files);
        }
    });

    $('#selectPicture').click(function() {
        var layerIndex = parent.layer.open({
            type: 2
            ,title: false
            ,id: 'selectIconPicture'
            ,content: '/makroDigital/productIcon/pictureSelect/' + current_id
            ,area: ['900px', '550px']
            ,closeBtn: 0
            ,shadeClose: true
            ,skin: 'layui-layer-transparent'
            ,success: function(layero, index) {
                var iframeWindow = layero.find('iframe')[0].contentWindow,
                    submitID = 'LAY-picture-selected-submit';
                iframeWindow.iconName = iconName;
                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
                    form.val('iconEdit', {
                        picid: result.picID,
                        path: result.picPath
                    });
                    $('#iconImage').attr('src', result.thumbPath);
                });
            }
        });
    });
           
});