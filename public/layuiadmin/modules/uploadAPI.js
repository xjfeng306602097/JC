/**

 @Name：上传相关API接口封装
    
 */

layui.define(['form', 'layer', 'upload', 'http'], function(exports) {
    var $ = layui.$,
        setter = layui.setter,
        layer = layui.layer,
        upload = layui.upload,
        http = layui.http;

    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {
            type: mime
        });
    }
    var storage = layui.data(setter.tableName);
    var obj = {
        // 上传文件
        upload: function(file, success, fail) {
            var formData = new FormData();
            formData.append('file', file);
            $.ajax({
                url: getApiUrl('file.upload'),
                type: getApiMethod('file.upload'),
                headers: {
                    "Authorization": 'Bearer ' + storage.access_token
                },
                data: formData,
                contentType: false,
                processData: false,
                success: function(res) {
                    if (res.code === '0000') {
                        success && success(res);
                    } else {
                        fail && fail(null, res);
                    }
                },
                error: function(e) {
                    fail && fail(e);
                }
            });
        },
        // 上传图片，支持File对象、Blob对象、base64字符串上传
        uploadImage: function(file, success, fail) {
            var type = 'file',
                query = {};
            if (!(file instanceof window.File) && Object.prototype.toString.call(file) === '[object Object]') {
                var options = file;
                file = null;
                if (options.file == undefined) {
                    console.error('uploadAPI.uploadImage()错误：请传入file参数');
                    fail && fail(null, {
                        msg: 'Upload Image Error',
                    });
                    return false;
                }
                type = options.type == undefined ? 'file' : options.type.toLowerCase();
                query = options.query || {};
                if (type == 'base64') {
                    var dataurl = options.file;
                    if (dataurl.indexOf('base64,') === -1) {
                        console.error('uploadAPI.uploadImage()错误：指定内容不为base64信息');
                        fail && fail(null, {
                            msg: 'Upload Image Error',
                        });
                        return false;
                    }
                    var ext = dataurl.replace(/data:image\/([^;]+).*/i, '$1');
                    var blob = dataURLtoBlob(dataurl);
                    var name = 'temp_' + parseInt(timestamp());
                    file = new window.File([blob], name + '.' + ext, {
                        type: blob.type
                    });
                } else if (type == 'file') {
                    file = options.file;
                } else if (type == 'blob') {
                    var blob = options.file;
                    if (!(blob instanceof window.Blob)) {
                        console.error('uploadAPI.uploadImage()错误：指定内容不为Blob格式');
                        fail && fail(null, {
                            msg: 'Upload Image Error',
                        });
                        return false;
                    }
                    var name = 'temp_' + parseInt(timestamp());
                    file = new window.File([blob], name + '.' + ext, {
                        type: blob.type
                    });
                } else {
                    console.error('uploadAPI.uploadImage()错误：type只支持file、blob、base64格式');
                    fail && fail(null, {
                        msg: 'Upload Image Error',
                    });
                    return false;
                }
            }
            if (!(file instanceof window.File)) {
                console.error('uploadAPI.uploadImage()错误：FormData仅支持File格式上传文件');
                fail && fail(null, {
                    msg: 'Upload Image Error',
                });
                return false;
            }
            var formData = new FormData();
            var fileField = api('file.uploadImage').file.field;
            formData.append(fileField, file);
            $.ajax({
                url: getApiUrl('file.uploadImage') + '?' + $.param(query),
                type: getApiMethod('file.uploadImage'),
                headers: {
                    "Authorization": 'Bearer ' + storage.access_token
                },
                data: formData,
                contentType: false,
                processData: false,
                success: function(res) {
                    if (res.code === '0000') {
                        success && success(res);
                    } else {
                        fail && fail(null, res);
                    }
                },
                error: function(e) {
                    fail && fail(e);
                }
            });
        },
        // 删除无用文件
        cancel: function(array, excludePath) {
            if (array.length == 0) {
                return;
            }
            if (Object.prototype.toString.call(excludePath) === '[object Object]') {
                excludePath = Object.keys(excludePath).map(function(i) {
                    return obj[i];
                });
            }
            var excludes = [undefined, null, ''];
            if (Array.isArray(excludePath)) {
                excludes = excludes.concat(excludePath);
            } else if (typeof excludePath == 'string' && excludePath != '') {
                excludes.push(excludePath);
            }
            array.filter(function(item) {
                return excludes.indexOf(item) !== -1;
            });
            if (array.length == 0) {
                return;
            }
            var request = {
                url: getApiUrl('file.batchRemove'),
                method: getApiMethod('file.batchRemove'),
                headers: {
                    "Authorization": 'Bearer ' + storage.access_token
                },
            };
            var formData = new FormData();
            formData.append('paths', JSON.stringify(array));
            for (var x in array) {
                console.log('删除未使用的文件：' + array[x]);
            }
            // 清空，防止重复提交
            array.splice(0, array.length);
            http.sendBeacon(request.url, formData, request.headers);
        },
    };
    //对外暴露的接口
    exports('uploadAPI', obj);
});