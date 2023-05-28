/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/messageTemplate/index
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'table', 'layer'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,table = layui.table
        ,layer = layui.layer;
    
    var storage = layui.data(setter.tableName);
    
    var current_status = '1';
    function getMessageTemplateList(){
        table.render({
            id: 'messageTemplateTable'
            ,elem: '#content-messageTemplate-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('message.template.page')
            ,method: getApiMethod('message.template.page')
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            // POST时必须添加contentType
            ,contentType: 'application/json;charset=utf-8'
            ,toolbar: false
            ,height: 'full-35'
            ,parseData: function(res) {
                if (res.code==="0000"){
                    return {
                        code: 0,
                        count: res.data.total,
                        data: res.data.records
                    }
                }
            }
            ,cols: [[
                {type:'radio',  width: 80, fixed: 'left' }
                ,{field:'title', width: 200, title: 'Title', fixed: 'left', sort: true, fixed: 'left' }
                ,{field:'templateContent', minWidth: 200, title: 'Content' }
                ,{field:'id', width: 120, title: 'ID', sort: true, hide: true }
            ]],
            where: {
                req: {
                    status: current_status,
                },
                sortItems: [
                    {
                        column: "sort",
                        asc: false
                    },
                    {
                        column: "gmtCreate",
                        asc: true
                    }
                ],
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
                // 重置选择的模板
                form.val('messageTemplateSelect', {
                    id: '',
                    title: '',
                    templateContent: '',
                });
            }
        });
    }
    
    getMessageTemplateList();

    table.on('radio(content-messageTemplate-list)', function(obj){
        var field = JSON.stringify(obj.data);
        var result = JSON.parse(field);
        // console.log(result);
        form.val('messageTemplateSelect', {
            id: result.id,
            title: result.title,
            templateContent: result.templateContent,
        });
    });
    
});