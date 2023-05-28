/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/dict/index
    
 */
 
layui.config({
    base: '../layuiadmin/' //静态资源所在路径
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

    var filterLang = xmSelect.render({
        el: '#lang',
        style: {
            minHeight: '38px',
            lineHeight: '38px',
            boxSizing: 'border-box',
        },
        data: [],
        language: 'en',
        tips: 'Select',
        on: function(data) {
            var arr = data.arr;
            //change, 此次选择变化的数据,数组
            var change = data.change;
            //isAdd, 此次操作是新增还是删除
            var isAdd = data.isAdd;

            var result = arr;
            
            var list = [];
            for (var x in result) {
                list.push(result[x].value);
            }
            current_lang = list.join(',');
            return result;
        },
    });
    loadLangList();

    var current_lang = '',
        current_code = '',
        current_name = '',
        current_status = '';
    function getDictList(){
        table.render({
            id: 'dictTable'
            ,elem: '#content-dict-list'
            ,loading: true
            ,even: true
            ,url: getApiUrl('dict.page')
            ,method: getApiMethod('dict.page')
            ,contentType: 'application/json'
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,toolbar: true
            ,toolbar: '#dictToolbar'
            ,defaultToolbar: ['filter','exports']
            ,height: 'full'
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
                ,{width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{field:'name', width: 200, title: 'Name', fixed: 'left', sort: true }
                ,{field:'lang', width: 160, title: 'Language', templet: function(res) {
                    return res.lang.replace('_', '-');
                }}
                ,{field:'code', width: 160, title: 'Code'}
                ,{field:'status', width: 90, title: 'Status', templet: '#content-dict-list-status' }
                ,{field:'remark', minWidth: 200, title: 'Remarks' }
                ,{width: 200, title: 'Child', templet: '#content-dict-list-child', hide: !permission.verify('sys:dict:child') }
                ,{field:'id', width: 100, title: 'ID', sort: true }
                ,{field:'creator', width: 160, title: 'Creator' }
                ,{field:'gmtCreate', width: 200, title: 'Create Time', sort: true, hide: true }
                ,{field:'lastUpdater', width: 160, title: 'Last Updater', hide: true }
                ,{field:'gmtModified', width: 200, title: 'Last Update Time', sort: true, hide: true }
            ]],
            where: {
                req: {
                    lang: current_lang,
                    code: current_code,
                    name: current_name,
                    status: current_status,
                },
                sortItems: [
                    {
                        column: "code",
                        asc: true
                    },
                    {
                        column: "lang",
                        asc: false
                    },
                ],
            },
            page: true,
            limit: 10,
            limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
        });
    }
    
    getDictList();
    
    // 搜索
    form.on('submit(LAY-dict-front-search)', function(obj) {
        var field = JSON.stringify(obj.field);
        var result = JSON.parse(field);
        current_code = result.code;
        current_name = result.name;
        current_status = result.status === '' ? undefined : result.status;
        getDictList();
    });
    // 重置搜索
    form.on('submit(LAY-dict-front-reset)', function(obj) {
        form.val('dictSearch', {
            lang: '',
            code: '',
            name: '',
            status: '',
        });
        form.render();
        filterLang.setValue([]);
        current_lang = '';
        current_code = '';
        current_name = '';
        current_status = '';
        getDictList();
    });
    
    // 监听头部工具栏
    table.on('toolbar(content-dict-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加字典
            case 'add':
                var index_page = layer.open({
                    type: 2
                    ,title: 'Add Dict'
                    ,id: 'addDict'
                    ,content: '/makroDigital/dict/add'
                    ,maxmin: true
                    ,area: ['600px', '455px']
                    ,btn: ['Save', 'Cancel']
                    ,yes: function (index, layero) {
                        var iframeWindow = window['layui-layer-iframe' + index],
                            submitID = 'LAY-dict-add-submit',
                            submit = layero.find('iframe').contents().find('#' + submitID);
        
                        iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                            var field = JSON.stringify(obj.field);
                            var result = JSON.parse(field);
                            var mydata = {
                                "lang": result.lang,
                                "code": result.code,
                                "name": result.name,
                                "status": result.status,
                                "remark": result.remark,
                            };
                            
                            $.ajax({
                                url: getApiUrl('dict.add'),
                                type: getApiMethod('dict.add'),
                                data: JSON.stringify(mydata),
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": 'Bearer ' + storage.access_token
                                },
                                success: function(result) {
                                    if (result.code === "0000") {
                                        layer.msg(result.msg);
                                        layer.close(index_page);
                                        table.reload('dictTable');
                                    } else {
                                        layer.msg(result.msg);
                                    }
                                }
                            });
                        });
                        submit.trigger('click');
                    }
                });
                //layer.full(index_page);
                break;
            // 编辑字典
            case 'edit':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    var index_page = layer.open({
                        type: 2
                        ,title: 'Edit Dict'
                        ,id: 'editDict'
                        ,content: '/makroDigital/dict/edit/' + id
                        ,maxmin: true
                        ,area: ['600px', '455px']
                        ,btn: ['Save', 'Cancel']
                        ,yes: function (index, layero) {
                            var iframeWindow = window['layui-layer-iframe' + index],
                                submitID = 'LAY-dict-update-submit',
                                submit = layero.find('iframe').contents().find('#' + submitID);
            
                            iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
                                var field = JSON.stringify(obj.field);
                                var result = JSON.parse(field);
                                var mydata = {
                                    "lang": result.lang,
                                    "code": result.code,
                                    "name": result.name,
                                    "status": result.status,
                                    "remark": result.remark,
                                };
                                
                                $.ajax({
                                    url: getApiUrl('dict.update', {id: id}),
                                    type: getApiMethod('dict.update'),
                                    data: JSON.stringify(mydata),
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + storage.access_token
                                    },
                                    success: function(result) {
                                        if (result.code === "0000") {
                                            layer.msg(result.msg);
                                            layer.close(index_page);
                                            table.reload('dictTable');
                                        } else {
                                            layer.msg(result.msg);
                                        }
                                    }
                                });
                            });
                            submit.trigger('click');
                        }
                    });
                }
                break;
            // 删除字典
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    var id = data[0].id;
                    layer.confirm('Confirm for delete?', {
                        icon: 3,
                        title: 'Delete Dict',
                        btn: ['Submit', 'Cancel'],
                    }, function(index) {
                        $.ajax({
                            url: getApiUrl('dict.delete', {ids: id}),
                            type: getApiMethod('dict.delete'),
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": 'Bearer ' + storage.access_token
                            },
                            success: function(result) {
                                if (result.code === "0000") {
                                    layer.msg(result.msg);
                                    table.reload('dictTable');
                                } else {
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    });
                }
                break;
            default:
                break;
        }
    });

    var clickable = false, clickLayer;

    if (permission.verify('sys:dict:child')) {
        // 单击行事件
        table.on('row(content-dict-list)', function(obj) {
            clickLayer = undefined;
            if (!clickable) {
                clickLayer = layer.msg('Click again to open the child');
            }
            clickable = false;
        });

        // 双击行事件
        table.on('rowDouble(content-dict-list)', function(obj) {
            layer.close(clickLayer);
            var data = obj.data;
            openChildTable(data);
        });
    }
    
    // 监听工具条
    table.on('tool(content-dict-list)', function(obj) {
        clickable = true;
        var data = obj.data;
        // 查看、编辑子项
        if (obj.event === 'child') {
            openChildTable(data);
        }
    });

    // 打开子项弹窗
    function openChildTable(data) {
        layer.open({
            type: 2
            ,title: 'Dict : ' + data.name
            ,id: 'child'
            ,content: '/makroDigital/dict/child/' + data.code + '/' + data.id
            ,maxmin: true
            ,area: ['80%', '80%']
        });
    }

    // 监听开关事件
    form.on('switch(switchStatus)', function(obj) {
        clickable = true;
        var id = obj.value;
        var status = this.checked ? 1 : 0;
        var data = {
            status: status,
        };
        $.ajax({
            url: getApiUrl('dict.update', {id: id}),
            type: getApiMethod('dict.update'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: JSON.stringify(data),
            success: function(result) {
                if (result.code === "0000") {
                    layer.msg(result.msg);
                } else {
                    obj.elem.checked = !status;
                    form.render('checkbox');
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                obj.elem.checked = !status;
                form.render('checkbox');
                layer.msg('切换失败');
                console.log(e);
            }
        });
    });

    // 载入语言版本数据
    var __loadLangList_fail_number = 0;
    function loadLangList(data, success) {
        $.ajax({
            url: getApiUrl('lang.list'),
            type: getApiMethod('lang.list'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: data,
            success: function(result) {
                __loadLangList_fail_number = 0;
                if (result.code === "0000") {
                    var list = result.data;
                    if (list != null && list.length > 0) {
                        var langs = [];
                        $.each(list, function(index, value) {
                            var lang = list[index];
                            langs.push({
                                name: lang.replace('_', '-'),
                                value: lang,
                                selected: false,
                            });
                        });
                        filterLang.update({
                            data: langs,
                        });
                    }
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__loadLangList_fail_number;
                console.log('loadLangList: 网络错误！');
                if (__loadLangList_fail_number < 3) {
                    setTimeout(function() {
                        loadLangList(data, success);
                    }, 100);
                } else {
                    console.log('loadLangList: 已累计3次请求失败');
                }
            }
        });
    }
    
});