/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/approvalApplication/index
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
    layeditKz: '../layui_exts/layedit/Kz.layedit',
}).use(['index', 'laydate', 'layer', 'form', 'carousel', 'laytpl', 'layeditKz'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form
        ,carousel = layui.carousel
        ,laytpl = layui.laytpl
        ,layedit = layui.layeditKz;
        
    var mmCode = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);

    var types = {};
    for (var i in storage.workflow) {
        types[storage.workflow[i].code] = storage.workflow[i].id;
    }
    // MM发布工作流id
    var workflow_id = types['MM-PUBLISH'] || '';

    init();

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
    var flowDetail = [], loadStatus = 'loading';

    //初始化页面
    function init() {
        var loading = layer.load(1);
        var totalStep = 2;// 总步骤，如果存在多个异步请求，请修改此处数量
        var success = function () {
            --totalStep;
            // 仅在最后一步时进行赋值select
            if (totalStep <= 0) {
                layer.close(loading);
                loadStatus = 'normal';
            }
        };
        $('#submitApplication input[name="mmCode"]').val(mmCode);
        // 监听channel勾选，自动取消未勾选的验证
        form.on('checkbox(channel)', function(data) {
            var checked = data.elem.checked;
            var verifyItem;
            if (checked) {
                verifyItem = $(data.elem).parents('.layui-colla-item').find('.layui-colla-content *[lay-verify-disabled]');
                verifyItem.attr('lay-verify', verifyItem.attr('lay-verify-disabled')).removeAttr('lay-verify-disabled');
            } else {
                verifyItem = $(data.elem).parents('.layui-colla-item').find('.layui-colla-content *[lay-verify]');
                verifyItem.attr('lay-verify-disabled', verifyItem.attr('lay-verify')).removeAttr('lay-verify');
            }
            form.render();
        });
        loadActivityDetail(mmCode);
        loadFlowDetail(null, function() {
            var tpl = $('#timelineTpl').html();
            flowDetail.sort(function(a, b) {
                return a.step - b.step;
            });
            var _Html = '';
            $.each(flowDetail, function(index, item) {
                _Html += laytpl(tpl).render({
                    title: 'Step ' + item.step,
                    content: item.title,
                });
            });
            $('#approvalProcess').html(_Html);
            success();
        });
        var carouselIns = carousel.render({
            elem: '#preview',
            width: '100%', //设置容器宽度
            height: '100%', //设置容器高度
            arrow: 'always', //始终显示箭头
            autoplay: false,
        });
        getActivityTemplate(mmCode, function(result) {
            // 创建导出尺寸
            createExprotSize(result.data.configW, result.data.configH);
            var images = [];
            if (result.data.previewMap != null) {
                var previewMap = JSON.parse(result.data.previewMap);
                if (Array.isArray(previewMap.data)) {
                    for (var i in previewMap.data) {
                        images.push(previewMap.data[i].previewUrl);
                    }
                }
            }
            $('#submitApplication input[name="previewUrl"]').val(images.join(','));
            var previewHtml = '';
            for (var x in images) {
                previewHtml += '<div class="item"><div class="item-image"><a href="' + images[x] + '" target="_blank"><img src="' + images[x] + '"></a></div></div>';
            }
            $('#preview [carousel-item]').html(previewHtml);
            carouselIns.reload();
            success();
        });
    }
    // 载入审核流程详情
    var __loadFlowDetail_fail_number = 0;
    function loadFlowDetail(data, success) {
        if (workflow_id == undefined) {
            return;
        }
        $.ajax({
            url: getApiUrl('approval.workflow.getConfig', { id: workflow_id }),
            type: getApiMethod('approval.workflow.getConfig'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: data,
            success: function(result) {
                __loadFlowDetail_fail_number = 0;
                if (result.code === "0000") {
                    flowDetail = result.data;
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__loadFlowDetail_fail_number;
                console.log('loadFlowDetail: 网络错误！');
                if (__loadFlowDetail_fail_number < 3) {
                    setTimeout(function() {
                        loadFlowDetail(data, success);
                    }, 100);
                } else {
                    console.log('loadFlowDetail: 已累计3次请求失败');
                }
            }
        });
    }

    // 载入活动数据
    var __loadActivityDetail_fail_number = 0;
    function loadActivityDetail(mmCode, success) {
        AjaxRequest({
            url: getApiUrl('marketing.activity.detailByCode', {mmCode: mmCode}),
            method: getApiMethod('marketing.activity.detailByCode'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                __loadActivityDetail_fail_number = 0;
                if (result.code === "0000") {
                    var store = [], memberTypes = [];
                    for (var x in result.data.store) {
                        store.push(result.data.store[x].name);
                    }
                    for (var x in result.data.memberTypes) {
                        memberTypes.push(result.data.memberTypes[x].nameEn);
                    }
                    form.val('profile', {
                        title: result.data.title,
                        store: store.join(', '),
                        memberType: memberTypes.join(', '),
                        // segment: result.data.segment,
                        time: result.data.startTime + ' to ' + result.data.endTime,
                    });
                    var appTitle = result.data.appTitle || result.data.title;
                    $('#submitApplication input[name="channel_app_title"]').val(appTitle);
                    success && success();
                } else {
                    layer.msg(result.msg, {
                        time: 2000,
                        end: function () {
                            var index = parent.layer.getFrameIndex(window.name);
                            parent.layer.close(index);
                        }
                    });
                }
            },
            error: function(e) {
                ++__loadActivityDetail_fail_number;
                console.log('loadActivityDetail: 网络错误！');
                if (__loadActivityDetail_fail_number < 3) {
                    setTimeout(function() {
                        loadActivityDetail();
                    }, 100);
                } else {
                    console.log('loadActivityDetail: 已累计3次请求失败');
                }
            }
        });
    }

    // 获取MM的对应模板
    function getActivityTemplate(mmCode, success) {
        AjaxRequest({
            url: getApiUrl('marketing.activity.template', { mmCode: mmCode }),
            method: getApiMethod('marketing.activity.template'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: {
                // 不返回模板页面内容
                "content": 0,
            },
            success: function(result) {
                if (result.code === "0000") {
                    success && success(result);
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                layer.msg('Error');
            }
        });
    }
    
    // 生成可导出比例  
    function createExprotSize(width, height) {
        var pi = (width / height).toFixed(2);

        var mydata = {
            limit: 200,
            page: 1,
            req: {
                name:  "",
                sizeRate: ""
            }
        };
        
        $.ajax({
            url: getApiUrl('marketing.size.page'),
            type: getApiMethod('marketing.size.page'),
            data: JSON.stringify(mydata),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                if (result.code === "0000") {
                    var tmpData = result.data.records;
                    var _Html = '';
                    for (var i=0; i<tmpData.length; i++) {
                        if (tmpData[i].sizeRate * 1.0 == pi * 1.0) {
                            _Html = _Html + "<option value=" + (tmpData[i].width + "_" + tmpData[i].height) + ">" + (tmpData[i].name) + " </option>";
                        }
                    }
                    $('select[name="channel_pdf_size"]').append(_Html);
                    form.render('select');
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }

    $('#LAY-approval-application-submit').click(function() {
        if (loadStatus == 'loading') {
            layer.msg('loading...');
            return false;
        } else if (loadStatus == 'disabled') {
            layer.msg('Operation not allowed');
            return false;
        }
        var result = form.val('submitApplication');
        if (!result.channel_h5 && !result.channel_app && !result.channel_pdf && !result.channel_pdfPrinting) {
            $('#channel .layui-colla-checkbox').addClass('layui-colla-checkbox-require');
            layer.msg('Please select a channel first', {
                icon: 5
            }, function() {
                $('#channel .layui-colla-checkbox').removeClass('layui-colla-checkbox-require');
            });
            return false;
        }
        if (result.channel_h5 && (result.channel_h5_email != 'on' && result.channel_h5_line != 'on' && result.channel_h5_sms != 'on')) {
            layer.msg('When publishing h5, select at least one push type', {
                icon: 5
            });
            return false;
        }
        layedit.sync(remarkEditor);
        var description = trim(layedit.getText(remarkEditor));
        if (description == '') {
            layer.msg('Remarks cannot be empty', {
                icon: 5
            });
            layedit.focus(remarkEditor);
            return false;
        }
        if (description.length > 50) {
            description = description.substr(0, 50) + '...';
        }
        $('#description').val(description);
    });

});