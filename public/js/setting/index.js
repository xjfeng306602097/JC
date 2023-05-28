/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/messageTemplate/index
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer;
    
    var storage = layui.data(setter.tableName);

    $('#settingTab').find('.layui-tab-title li').eq(0).addClass('layui-this');
    $('#settingTab').find('.layui-tab-content .layui-tab-item').eq(0).addClass('layui-show');

    // Basic
    AjaxRequest({
        url: getApiUrl('setting.basic.detail'),
        method: getApiMethod('setting.basic.detail'),
        success: function(result) {
            // console.log(result);
            if (result.code === "0000") {
                form.val('basic', result.data);
            } else {
                layer.msg(result.msg);
            }
        }
    });

    form.on('submit(LAY-setting-basic-front-save)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        // console.log(result);return;

        AjaxRequest({
            url: getApiUrl('setting.basic.update'),
            method: getApiMethod('setting.basic.update'),
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify(result),
            success: function(result) {
                if (result.code === "0000") {
                    layer.msg('Success');
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    });

    // Message
    AjaxRequest({
        url: getApiUrl('setting.message.detail'),
        method: getApiMethod('setting.message.detail'),
        success: function(result) {
            // console.log(result);
            if (result.code === "0000") {
                var smsChannel = result.data.smsChannel;
                form.val('message-sms', {
                    smsChannel: smsChannel,
                });
                $('.sms-channels .sms-channel-item').not('[data-channel="' + smsChannel + '"]').addClass('layui-hide');
                $('.sms-channels .sms-channel-item[data-channel="' + smsChannel + '"]').removeClass('layui-hide');
                var smsMap = toFormData(result.data.smsMap, 'smsMap');
                form.val('message-sms', smsMap);
                form.val('message-email', result.data);
                form.val('message-line', result.data);
            } else {
                layer.msg(result.msg);
            }
        }
    });

    // 切换短信渠道
    form.on('select(smsChannel)', function(data){
        var channel = data.value;
        $('.sms-channels .sms-channel-item').not('[data-channel="' + channel + '"]').addClass('layui-hide');
        $('.sms-channels .sms-channel-item[data-channel="' + channel + '"]').removeClass('layui-hide');
    });

    form.on('submit(LAY-setting-message-front-save)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        // 转为多维对象
        var data = formExpand(result);
        console.log(data);

        AjaxRequest({
            url: getApiUrl('setting.message.update'),
            method: getApiMethod('setting.message.update'),
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify(data),
            success: function(result) {
                if (result.code === "0000") {
                    layer.msg('Success');
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    });

    // 插入标签
    window.tag = function(id, value) {
        insertText(document.getElementById(id), '{' + value + '}');
    };

    function insertText(myField, str) {
        //IE support
        if (document.selection) {
            myField.focus();
            sel = document.selection.createRange();
            sel.text = str;
            sel.select();
        }
        //MOZILLA/NETSCAPE support
        else if (myField.selectionStart || myField.selectionStart == '0') {
            var startPos = myField.selectionStart;
            var endPos = myField.selectionEnd;
            // save scrollTop before insert
            var restoreTop = myField.scrollTop;
            myField.value = myField.value.substring(0, startPos) + str + myField.value.substring(endPos, myField.value.length);
            if (restoreTop > 0) {
                myField.scrollTop = restoreTop;
            }
            myField.focus();
            myField.selectionStart = startPos + str.length;
            myField.selectionEnd = startPos + str.length;
        } else {
            myField.value += str;
            myField.focus();
        }
    }
    
});