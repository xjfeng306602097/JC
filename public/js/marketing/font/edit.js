/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingFont/edit
    
 */

// 已上传文件列表
var uploadList = [];
var currentFile = '';
layui.config({
	base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'keycode', 'layer', 'form', 'upload', 'uploadAPI'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form
        ,upload = layui.upload
        ,uploadAPI = layui.uploadAPI
        ,keycode = layui.keycode;
        
    var current_id = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);
    
    // 获取字体信息
    $.ajax({
        url: getApiUrl('marketing.font.detail', {id: current_id}),
        type: getApiMethod('marketing.font.detail'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code === "0000") {
                form.val('fontEdit', {
                    "name": result.data.name,
                    "path": result.data.path,
                    "pathMb": result.data.pathMb,
                    "boldPath": result.data.boldPath,
                    "boldPathMb": result.data.boldPathMb,
                    "italicsPath": result.data.italicsPath,
                    "italicsPathMb": result.data.italicsPathMb,
                    "boldItalicsPath": result.data.boldItalicsPath,
                    "boldItalicsPathMb": result.data.boldItalicsPathMb,
                    "remark": result.data.remark,
                    "keyCombination": result.data.keyCombination,
                });
                currentFile = result.data.path;
            } else {
                layer.msg(result.msg);
            }
        },
        complete: function() {
            initFont();
        }
    });

    function uploadFont(elem, input) {
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
            headers: {
                'Authorization': 'Bearer ' + storage.access_token
            },
            size: 4 * 1024,// 字体大小限制4MB
            accept: 'file',
            acceptMime: 'application/x-font-truetype',
            exts: 'ttf',// 注：tcpdf库仅支持ttf字体
            // acceptMime: 'application/x-font-truetype,application/x-font-opentype,application/vnd.ms-fontobject,application/x-font-woff,application/x-font-woff2',
            // exts: 'ttf|otf|eot|woff|woff2',
            choose: function(obj) {
                clearUploadFile(files);
                //将每次选择的文件追加到文件队列
                files = obj.pushFile();
            },
            done: function(res, index, upload) {
                if (res.code === '0000') {
                    form.val('fontEdit', {
                        [input]: res.data.path,
                        [input + 'Mb']: res.data.mb
                    });
                    uploadList.push(res.data.path);
                    $(elem).parent().prev().find('button').removeClass('layui-hide');
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
    }

    function initFont() {
        $('.fonts .layui-form-item input').each(function(i) {
            var value = $(this).val();
            if (value == '') {
                $(this).parent().find('button').addClass('layui-hide');
            } else {
                $(this).parent().find('button').removeClass('layui-hide');
            }
        });
    }

    // 绑定上传字体控件
    uploadFont('#uploadRegularFont', 'path');// 常规字体
    uploadFont('#uploadBoldFont', 'boldPath');// 粗体
    uploadFont('#uploadItalicsFont', 'italicsPath');// 斜体
    uploadFont('#uploadBoldItalicsFont', 'boldItalicsPath');// 粗斜体

    $(document).on('click', '.fonts .layui-form-item button', function() {
        $(this).addClass('layui-hide');
        $(this).parent().parent().find('input').val('');
    });

    $('input[name=keyCombination]').keydown(function(e){
        var array = [];
        if (e.ctrlKey) {
            array.push('Ctrl');
        }
        if (e.shiftKey) {
            array.push('Shift');
        }
        if (e.altKey) {
            array.push('Alt');
        }
        if (array.length > 0 && keycode[e.which] !== undefined) {
            array.push(keycode[e.which]);
            var hotkey = array.join(' + ');
            $(this).val(hotkey);
        } else if (array.length == 0 && e.which == 8) {
            $(this).val('');
        }
    });

    window.onbeforeunload = function() {
        uploadAPI.cancel(uploadList);
    };
    
});