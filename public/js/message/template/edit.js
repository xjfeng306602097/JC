/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/messageTemplate/edit
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'layer','form'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form;
        
    var current_id = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);
    
    // 获取组件信息
    $.ajax({
        url: getApiUrl('message.template.detail', {id: current_id}),
        type: getApiMethod('message.template.detail'),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + storage.access_token
        },
        success: function(result) {
            if (result.code === "0000") {
                form.val('messageTemplateEdit', {
                    "title": result.data.title,
                    "templateContent": result.data.templateContent,
                    "sort": result.data.sort,
                });
            } else {
                layer.msg(result.msg);
            }
        }
    });

    // 插入标签
    window.tag = function(value) {
        insertText(document.getElementById('templateContent'), '{' + value + '}');
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