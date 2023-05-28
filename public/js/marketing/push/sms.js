/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingPush/sms
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'laydate', 'layer','form'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form;
        
    var current_mmCode = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);

    // 推送
    var push = pushInit(current_mmCode, 'sms');
    // 初始化页面
    function init() {
        var pushUser = push.pushUserRender();
        var pushTime = push.pushTimeRender();
        var pushPage = push.pushPageRender();
    }
    init();

    $('#LAY-publish-pushSms-selectTemplate').click(function() {
        parent.layer.open({
            type: 2
            ,title: 'Select Message Template'
            ,id: 'selectMessageTemplate'
            ,content: '/makroDigital/messageTemplate/select'
            ,maxmin: true
            ,area: ['800px', '500px']
            ,btn: ['Confirm', 'Cancel']
            ,yes: function (index, layero) {
                var iframeWindow = parent['layui-layer-iframe' + index],
                    submitID = 'LAY-messageTemplate-select-submit',
                    submit = layero.find('iframe').contents().find('#' + submitID);

                iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
                    
                    $('#msg').val(result.templateContent);
                    parent.layer.close(index);
                });
                submit.trigger('click');
            }
        });
    });

    // 插入标签
    window.tag = function(value) {
        insertText(document.getElementById('msg'), '{' + value + '}');
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