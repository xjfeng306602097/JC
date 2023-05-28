/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/approvalProcess/approve
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
    layeditKz: '../layui_exts/layedit/Kz.layedit',
}).use(['index', 'laydate', 'layer', 'form', 'upload', 'carousel', 'element', 'laytpl', 'layeditKz'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form
        ,upload = layui.upload
        ,carousel = layui.carousel
        ,element = layui.element
        ,laytpl = layui.laytpl
        ,layedit = layui.layeditKz;
        
    var current_id = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);

    init();

    form.verify({
        number: function(value, item) {
            var reg = /^[0-9]*$/;
            if (value && !reg.test(value)) {
                return 'Only allow to fill in pure numbers';
            }
        },
    });

    // 监听审核结果切换
    form.on('select(flowOption)', function(data) {
        if (data.value == 'REJECT') {
            $('#returnTo').removeClass('layui-hide');
        } else {
            $('#returnTo').addClass('layui-hide');
        }
    });

    layedit.set({
        //暴露layupload参数设置接口 --详细查看layupload参数说明
        uploadImage: {
            url: getApiUrl('file.uploadWebImage'),
            field: api('file.uploadWebImage').file.field,//上传时的文件参数字段名
            accept: 'image',
            acceptMime: api('file.uploadWebImage').file.acceptMime,
            exts: api('file.uploadWebImage').file.exts,
            size: 1024 * 10,
            fields: {
                src: 'data.originPath',
                title: null,
                name: null,
            },
            done: function (data) {//文件上传接口返回code为0时的回调
                // console.log(data)
            }
        },
        // uploadVideo: {
        //     url: '/Attachment/LayUploadFile',
        //     field: 'file',//上传时的文件参数字段名
        //     accept: 'video',
        //     acceptMime: 'video/*',
        //     exts: 'mp4|flv|avi|rm|rmvb',
        //     size: 1024 * 2 * 10,
        //     done: function (data) {//文件上传接口返回code为0时的回调

        //     }
        // },
        //右键删除图片/视频时的回调参数，post到后台删除服务器文件等操作，
        //传递参数：
        //图片： imgpath --图片路径
        //视频： filepath --视频路径 imgpath --封面路径
        calldel: {
            url: '/Attachment/DeleteFile',
            done: function (data) {//data删除文件接口返回返回的数据

            }
        },
        //开发者模式 --默认为false
        // devmode: true,
        //插入代码设置
        codeConfig: {
            hide: false,  //是否显示编码语言选择框
            default: 'javascript' //hide为true时的默认语言格式
        },
        //新增iframe外置样式和js
        quote: {
            style: ['/layuiadmin/layui/css/layui.css', '/layuiadmin/layui_exts/layedit/Kz.layedit.css'],
            js: ['/js/jquery/jquery-1.8.0.min.js']
        },
        // fontFomatt:["p","span"],  //自定义段落格式 ，如不填，默认为 ["p", "h1", "h2", "h3", "h4", "h5", "h6", "div"]~~
        tool: [
            'html', 'strong', 'italic', 'underline', 'del', '|',
            'left', 'center', 'right', '|',
            'fontFomatt','colorpicker', 'face', '|',
            'link', 'unlink', 'image_alt', 'altEdit', 'table', '|',
            'fullScreen'
        ],
        text: {
            /* 工具栏 */
            html: 'HTML source code',
            undo: 'Undo',
            redo: 'Redo',
            bold: 'Bold',
            italic: 'Italic',
            underline: 'Underline',
            strikeThrough: 'Strikethrough',
            justifyLeft: 'Align left',
            justifyCenter: 'Align center ',
            justifyRight: 'Align right',
            addLink: 'Insert link',
            unlink: 'Clear Link',
            face: 'Face',
            image: 'Image',
            insertCode: 'Insert Code',
            addImages: 'Upload multiple images',
            addVideo: 'Insert video',
            fullScreen: 'Full screen',
            fontColor: 'Font color',
            fontBackColor: 'Font background color',
            fontFomatt: 'Paragraph formatting',
            fontFamily: 'font',
            addhr: 'Add hr',
            addAnchor: 'Add anchor point',
            addTable: 'Insert Table',
            addAttachment: 'Add attachments',
            preview: 'Preview',
            removeFormat: 'Clear text style',
            help: 'Help',
            /* 普通文本 */
            sure: 'OK',
            cancel: 'Cancel',
            htmlMode: 'Html Mode',
            selectLanguage: 'Language',
            code: 'Code',
            left: 'Left',
            center: 'Center',
            right: 'Right',
            link: 'Hyperlinks',
            linkUrl: 'Link URL',
            linkText: 'Link Text',
            linkRel: 'rel',
            openType: 'Open Way',
            newWindow: 'new window',
            currentWindow: 'current window',
            none: 'None',
            editImage: 'Image',
            images: 'Image',
            video: 'Video',
            previewImage: 'Preview Image',
            selectImage: 'Please click to upload image',
            imageUrl: 'Image Path',
            imageWidth: 'Width',
            imageHeight: 'Height',
            imageDescription: 'Description',
            imageDescriptionPlaceholder: 'Please enter a image description, it can be empty',
            uploadImage: 'Upload',
            uploadVideo: 'Video',
            uploadVideoCover: 'Cover',
            uploadFailed: 'Upload failed!',
            description: 'description',
            alt: 'alt',
            width: 'width',
            height: 'height',
            addAnchor: 'Add Anchor',
            name: 'Name',
            selectFile: 'Please select file',
            delete: 'Delete',
            column: 'Column',
            row: 'Row',
            hint: 'Hint',
            labelP: 'Text (p)',
            labelH1: 'Title (h1)',
            labelH2: 'Title (h2)',
            labelH3: 'Title (h3)',
            labelH4: 'Title (h4)',
            labelDiv: 'Block (div)',
        }
    });
    var remarkEditor = layedit.build('remark', {
        height: 200,
    });

    // 定义请求拿到的数据存储变量
    var processDetail, processLog, processStep = {}, loadStatus = 'loading';

    //初始化页面
    function init() {
        // isProcessFinish(function(success, result) {
        //     if (!success) {
        //         // layer.msg('No permission', {
        //         //     icon: 9,
        //         //     time: 0,
        //         //     shade: 0.3,
        //         // });
        //         $('#processApprove').find('input, select, textarea').prop('disabled', true);
        //         $('#processApprove').find('.layui-layedit').addClass('layui-layedit-disabled');
        //         $('#uploadAttachment').addClass('layui-btn-disabled').off('click');
        //         form.render();
        //     }
        // });
        uploadAttachment();
        var totalStep = 2;// 总步骤，如果存在多个异步请求，请修改此处数量
        var success = function () {
            --totalStep;
            // 仅在最后一步时进行赋值select
            if (totalStep <= 0) {
                var currentStep = processDetail.step;
                var lastStep = 0;
                var processConfig = processDetail.configJson == null ? [] : JSON.parse(processDetail.configJson);
                processConfig.sort(function(a, b) {
                    return a.step - b.step;
                });
                // console.log(processConfig)
                for (var x in processConfig) {
                    var title = processConfig[x].title;
                    processStep[processConfig[x].step] = {
                        title: title,
                        roleId: processConfig[x].roleId,
                        roleName: processConfig[x].roleName,
                    };
                    if (processConfig[x].step > lastStep) {
                        lastStep = processConfig[x].step;
                    }
                }
                var _StepOptionHtml = '';
                var prevStep = currentStep - 1;
                for (var step in processStep) {
                    if (currentStep > step) {
                        _StepOptionHtml = '<option value="' + step + '" ' + (prevStep == step ? 'selected' : '') + '>' + step + '.' + processStep[step].title + '</option>' + _StepOptionHtml;
                    }
                }
                $('select[name="returnToStep"]').html(_StepOptionHtml);
                var disabledStatus = [99, 100];
                if (disabledStatus.indexOf(parseInt(processDetail.status)) !== -1) {
                    $('#processApprove').find('input, select, textarea').prop('disabled', true);
                    $('#processApprove').find('.layui-layedit').addClass('layui-layedit-disabled');
                    $('#uploadAttachment').addClass('layui-btn-disabled').off('click');
                    loadStatus = 'disabled';
                } else {
                    loadStatus = 'normal';
                }
                form.render('select');
                if (processLog != null && processLog.length > 0) {
                    var tpl = $('#approvalLogTpl').html();
                    var _Html = '';
                    $.each(processLog, function(index, item) {
                        var content = item.htmlRemark == null ? '' : item.htmlRemark;
                        if (content == '' && item.flowOption == 'CREATE') {
                            content = 'Submit application';
                        }
                        var files = [];
                        if (item.filePath != null && item.filePath.length > 0) {
                            files = item.filePath.split(',');
                        }
                        var icon = null;
                        if (item.flowOption == 'APPROVE') {
                            icon = 'ok';
                        } else if (item.flowOption == 'REJECT') {
                            icon = 'close';
                        }
                        _Html += laytpl(tpl).render({
                            step: item.step,
                            icon: icon,
                            title: item.stepName,
                            time: item.gmtCreate,
                            user: item.authUser,
                            content: content,
                            files: files,
                        });
                    });
                    // 待审核的状态
                    var undoneStatus = [0, 1, 2];
                    if (undoneStatus.indexOf(parseInt(processDetail.status)) !== -1 && processStep[currentStep]) {
                        _Html += laytpl(tpl).render({
                            step: currentStep,
                            icon: 'loading layui-anim layui-anim-rotate layui-anim-loop',
                            title: processStep[currentStep].title,
                            time: '',
                            user: '',
                            content: 'To be approved by ' + processStep[currentStep].roleName,
                            files: [],
                        });
                    }
                    $("#approvalLog").html(_Html);
                    var processTpl = $('#approvalProcessTpl').html();
                    var _Html = '';
                    $.each(processConfig, function(index, item) {
                        _Html += laytpl(processTpl).render({
                            title: 'Step ' + item.step,
                            content: item.title,
                        });
                    });
                    $("#approvalProcess").html(_Html);
                }
            }
        };
        var carouselIns = carousel.render({
            elem: '#preview',
            width: '100%', //设置容器宽度
            height: 'calc(100vh - 102px)', //设置容器高度
            arrow: 'always', //始终显示箭头
            autoplay: false,
        });
        loadApprovalDetail(null, function () {
            if (processDetail.status == '999') {
                $('[approve]').remove();
            }
            var previewUrl = processDetail.previewUrl || '';
            var preview = previewUrl.split(',');
            var previewHtml = '';
            for (var x in preview) {
                previewHtml += '<div class="item"><div class="item-image"><a href="' + preview[x] + '" target="_blank"><img src="' + preview[x] + '"></a></div></div>';
            }
            $('#preview [carousel-item]').html(previewHtml);
            carouselIns.reload();
            success();
        });
        // 载入流程审核日志后再依次载入其他数据
        loadApprovalLog(null, success);
    }
    // 是否允许当前用户完结流程
    var __isProcessFinish_fail_number = 0;
    function isProcessFinish(success) {
        $.ajax({
            url: getApiUrl('approval.process.checkFinish', { id: current_id }),
            type: getApiMethod('approval.process.checkFinish'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                __isProcessFinish_fail_number = 0;
                success && success(result.code === "0000", result);
            },
            error: function(e) {
                ++__isProcessFinish_fail_number;
                console.log('isProcessFinish: 网络错误！');
                if (__isProcessFinish_fail_number < 3) {
                    setTimeout(function() {
                        isProcessFinish(success);
                    }, 100);
                } else {
                    console.log('isProcessFinish: 已累计3次请求失败');
                }
            }
        });
    }
    // 载入审核信息
    var __loadApprovalDetail_fail_number = 0;
    function loadApprovalDetail(data, success) {
        $.ajax({
            url: getApiUrl('approval.process.detail', { id: current_id }),
            type: getApiMethod('approval.process.detail'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: data,
            success: function(result) {
                __loadApprovalDetail_fail_number = 0;
                if (result.code === "0000") {
                    processDetail = result.data;
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__loadApprovalDetail_fail_number;
                console.log('loadApprovalDetail: 网络错误！');
                if (__loadApprovalDetail_fail_number < 3) {
                    setTimeout(function() {
                        loadApprovalDetail(data, success);
                    }, 100);
                } else {
                    console.log('loadApprovalDetail: 已累计3次请求失败');
                }
            }
        });
    }
    // 载入审核日志
    var __loadApprovalLog_fail_number = 0;
    function loadApprovalLog(data, success) {
        $.ajax({
            url: getApiUrl('approval.process.getLogs', { id: current_id }),
            type: getApiMethod('approval.process.getLogs'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: data,
            success: function(result) {
                __loadApprovalLog_fail_number = 0;
                if (result.code === "0000") {
                    processLog = result.data;
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__loadApprovalLog_fail_number;
                console.log('loadApprovalLog: 网络错误！');
                if (__loadApprovalLog_fail_number < 3) {
                    setTimeout(function() {
                        loadApprovalLog(data, success);
                    }, 100);
                } else {
                    console.log('loadApprovalLog: 已累计3次请求失败');
                }
            }
        });
    }

    // 上传附件控件
    function uploadAttachment() {
        var files = {};
        var clearUploadFile = function(files) {
            for (var x in files) {
                delete files[x];
            }
        };
        var uploadRender = upload.render({
            elem: '#uploadAttachment',
            url: getApiUrl('file.upload'),
            method: getApiMethod('file.upload'),
            field: api('file.upload').file.field,
            headers: {
                'Authorization': 'Bearer ' + storage.access_token
            },
            accept: 'file',
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
                    var attachment = $('input[name="attachment"]').val().split(',');
                    if (attachment.length == 1 && attachment[0] == '') {
                        attachment = [];
                    }
                    attachment.push(res.data.path);
                    setAttachment(attachment);
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

    function setAttachment(attachment) {
        form.val('processApprove', {
            attachment: attachment.join(','),
        });
        var tpl = $('#fileTpl').html();
        var html = laytpl(tpl).render({
            files: attachment
        });
        $('#attachmentList').html(html);
    }

    $(document).on('click', '#attachmentList .file-delete', function() {
        var attachment = $('input[name="attachment"]').val().split(',');
        if (attachment.length == 1 && attachment[0] == '') {
            attachment = [];
        }
        var fileIndex = $(this).parent().index();
        attachment.splice(fileIndex, 1);
        setAttachment(attachment);
    });

    $(document).on('click', '.process-log .content img', function() {
        var image = $(this).attr('src');
        layer.photos({
            photos: {
                "data": [
                    { "src": image }
                ]
            }
            ,anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机
            ,shade: [0.8, '#EEEEEE'] //背景遮布
            ,move: false //禁止拖动
        });
    });

    $('#LAY-process-approval-submit').click(function() {
        if (loadStatus == 'loading') {
            layer.msg('loading...');
            return false;
        } else if (loadStatus == 'disabled') {
            layer.msg('Operation not allowed');
            return false;
        }
        layedit.sync(remarkEditor);
        var remark = trim(layedit.getText(remarkEditor));
        if (remark == '') {
            layer.msg('Remarks cannot be empty');
            layedit.focus(remarkEditor);
            return false;
        }
    });

});