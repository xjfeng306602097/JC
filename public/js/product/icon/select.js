/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/productIcon/pictureSelect
    
 */


layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'upload', 'uploadAPI', 'layer', 'laypage'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,upload = layui.upload
        ,uploadAPI = layui.uploadAPI
        ,layer = layui.layer
        ,laypage = layui.laypage;

    if (window == top) {
        layer.confirm('Please don\'t open it directly', {
            title: 'Warning',
            btn: ['Sure']
        });
    }
    var iconID = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    var isEdit = false;

    if (window.iconName !== undefined) {
        $('.title span').text('(' + window.iconName + ')');
    }
    $('input[name="searchKey"]').val(iconID);
    var current_page = 1,
        current_limit = 12,
        current_iconid = iconID;
    function loadPictureData(success) {
        var load = layer.load(1);
        var mydata = {
            req: {
                iconid: current_iconid,
            },
            sortItems: [
                {
                    column: "gmtCreate",
                    asc: false
                },
            ],
            page: current_page,
            limit: current_limit,
        };
        $.ajax({
            url: getApiUrl('product.icon.picture.page'),
            type: getApiMethod('product.icon.picture.page'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: JSON.stringify(mydata),
            success: function(result) {
                layer.close(load);
                if (result.code === "0000") {
                    var list = result.data.records;
                    if (list && list.length > 0) {
                        var _Html = '';
                        for (var i = 0; i < list.length; i++) {
                            var item = list[i];
                            var title = 'Create Time: ' + item.basicInfo.gmtCreate + '\nUpdate Time: ' + item.basicInfo.gmtModified + '\nResolution: ' + item.originWidth + ' * ' + item.originHeight + '\nOriginal Image: ' + item.originPath;
                            _Html += '<div class="layui-col-xs3 layui-col-lg2">';
                            _Html += '    <div class="picture-image choosePicture" title="' + title + '" data-id="' + item.basicInfo.id + '" data-originpath="' + item.originPath + '" data-thumbnailpath="' + item.thumbnailPath + '" data-type="product">';
                            _Html += '        <img src="' + item.thumbnailPath + '">';
                            if (item.basicInfo.defaulted == 1) {
                                _Html += '        <div class="defaulted"><span>default</span></div>';
                            }
                            _Html += '    </div>';
                            _Html += '    <div class="picture-action' + (isEdit ? '' : ' disabled') + '">';
                            if (item.basicInfo.defaulted == 1) {
                                _Html += '        <button type="button" class="layui-btn layui-btn-disabled layui-btn-xs" data-action="alert" data-message="Default picture are not allowed to be deleted">delete</button>';
                            } else if (!permission.verify('product:icon:picture:delete')) {
                                _Html += '        <button type="button" class="layui-btn layui-btn-disabled layui-btn-xs" data-action="alert" data-message="Permission denied!">delete</button>';
                            } else {
                                _Html += '        <button type="button" class="layui-btn layui-btn-danger layui-btn-xs" data-action="delete">delete</button>';
                            }
                            _Html += '    </div>';
                            _Html += '</div>';
                        }
                        $('.picture-list>.layui-row').html(_Html);
                    } else {
                        $('.picture-list>.layui-row').html('<p style="text-align: center;">There are currently no pictures!</p>');
                    }
                    success && success(result);
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function() {
                layer.close(load);
            }
        });
    }

    // 载入分页
    function loadPage(total) {
        laypage.render({
            elem: 'picture-page',
            count: total,
            curr: current_page,
            limit: current_limit,
            limits: [12, 24, 40, 100, 200],
            // theme: '#ee1c1d',
            prev: 'Prev',
            next: 'Next',
            layout: ['count', 'prev', 'page', 'next', 'limit', 'refresh', 'skip'],
            jump: function (obj, first) {
                if (!first) {
                    current_page = obj.curr;
                    current_limit = obj.limit;
                    loadPictureData();
                }
            }
        });
    }

    var files = {};
    var uploadRender = upload.render({
        elem: '.upload-btn',
        url: getApiUrl('file.uploadImage'),
        method: getApiMethod('file.uploadImage'),
        field: api('file.uploadImage').file.field,
        headers: {
            'Authorization': 'Bearer ' + storage.access_token
        },
        accept: 'file',
        exts: api('file.uploadImage').file.exts,
        choose: function(obj) {
            //将每次选择的文件追加到文件队列
            files = obj.pushFile();
        },
        done: function(res, index, upload) {
            delete files[index];
            if (res.code === '0000') {
                var imageData = res.data;
                var mydata = {
                    iconid: iconID,
                    defaulted: 0,
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
                            initPictureList();
                        } else {
                            console.log('插入icon图片数据失败');
                            uploadAPI.cancel([imageData.originPath, imageData.thumbnailPath]);
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
            delete files[index];
            layer.msg('upload failed', {icon: 5});
        }
    });

    $('input[name="searchKey"]').on('keydown', function(e) {
        if (e.keyCode == 13) {
            current_iconid = $(this).val();
            initPictureList();
        }
    });

    // 监听选择图片事件
    $(document).on('click', '.choosePicture', function() {
        var picID = $(this).data('id');
        var originPath = $(this).data('originpath');
        var thumbnailPath = $(this).data('thumbnailpath');
        if (isEdit) {
            parent.layer.confirm('Whether to submit?', {
                icon: 3,
                title: 'Choose Image',
                btn: ['Submit', 'Cancel'],
            }, function(index) {
                parent.layer.close(index);
                form.val('pictureSelected', {
                    iconID: iconID,
                    picID: picID,
                    picPath: originPath,
                    thumbPath: thumbnailPath,
                });
                $('#LAY-picture-selected-submit').trigger('click');
                closeWindow();
            });
        } else {
            form.val('pictureSelected', {
                iconID: iconID,
                picID: picID,
                picPath: originPath,
                thumbPath: thumbnailPath,
            });
            $('#LAY-picture-selected-submit').trigger('click');
            closeWindow();
        }
    });

    // 监听切换编辑模式按钮
    $('.picture-edit').click(function() {
        if (isEdit) {
            isEdit = false;
            $(this).find('span').text('Enter Edit Mode');
            $('.picture-list .picture-action').addClass('disabled');
        } else {
            isEdit = true;
            $(this).find('span').text('Exit Edit Mode');
            $('.picture-list .picture-action').removeClass('disabled');
        }
    });

    // 监听动作事件
    $(document).on('click', '.picture-action button', function() {
        var action = $(this).data('action');
        var picElem = $(this).parents('.picture-action').prev();
        var picID = picElem.data('id');
        var originPath = picElem.data('originpath');
        var thumbnailPath = picElem.data('thumbnailpath');

        if (action == 'alert') {
            var message = $(this).data('message');
            layer.msg(message);
            return;
        } else if (action == 'delete') {// 删除图片
            parent.layer.confirm('Confirm for delete?', {
                icon: 3,
                title: 'Delete Image',
                btn: ['Submit', 'Cancel'],
            }, function(index) {
                var mydata = {
                    deleted: 1,
                };
                $.ajax({
                    url: getApiUrl('product.icon.picture.update', {id: picID}),
                    type: getApiMethod('product.icon.picture.update'),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + storage.access_token
                    },
                    data: JSON.stringify(mydata),
                    success: function(result) {
                        if (result.code === "0000") {
                            parent.layer.close(index);
                            layer.msg(result.msg);
                            initPictureList();
                        } else {
                            layer.msg(result.msg);
                        }
                    }
                });
            });
        }
    });

    function initPictureList() {
        current_page = 1;
        loadPictureData(function(res) {
            if (res.data.total >= 1) {
                loadPage(res.data.total);
            }
        });
    }
    initPictureList();

    // 关闭自身弹窗
    function closeWindow() {
        if (window == top) {
            return;
        }
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index);
    }
    $('.close').click(closeWindow);

});