/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingPage/index
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'laydate', 'layer', 'form', 'table'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form
        ,table = layui.table;
    
    var storage = layui.data(setter.tableName);

    var tables = {};
    // 渲染表格
    for (var type in tableData) {
        tables[type] = renderTable(type, tableData[type]);
    }

    function renderTable(type, tableInfo) {
        var title = tableInfo.title || '';
        var data = [];
        for (var i in tableInfo.list) {
            var url = tableInfo.list[i];
            data.push({
                type: type,
                url: url,
                status: 0,// 状态 0=未知，1=未上传，2=已上传
                lastModified: '',
            });
        }
        var tableID = 'content-' + type + '-list';
        if ($('#tables #'+tableID).length == 0) {
            $('#tables').append('<div class="layui-col-sm12"><div class="layui-card"><div class="layui-card-header">' + title + '</div><div class="layui-card-body"><table id="' + tableID + '" lay-filter="' + tableID + '"></table></div></div></div>');
        }
        var tableM = table.render({
            id: type + 'Table'
            ,elem: '#' + tableID
            ,even: true
            ,cols: [[
                {width: 80, title: 'Serial', type: 'numbers', fixed: 'left' }
                ,{field: 'url', minWidth: 200, title: 'URL', sort: true }
                ,{field: 'status', width: 180, title: 'Status', templet: function(res) {
                    switch (res.status) {
                        case 1:
                            return 'Not uploaded';
                        case 2:
                            return '<span style="color: #5FB878;">Uploaded</span>';
                    }
                    return 'Unknown';
                }}
                ,{field: 'lastModified', width: 180, title: 'Last Modified' }
                ,{width: 320, title: 'Action', templet: '#content-page-list-action' }
            ]],
            data: data,
            page: false,
        });
        // 监听工具条
        table.on('tool(' + tableID + ')', function(obj) {
            var data = obj.data;
            var itemUrl = data.url;
            // 更新文件
            if (obj.event === 'update') {
                layer.confirm('Confirm Update?', {
                    icon: 3,
                    title: 'Update',
                    btn: ['Submit', 'Cancel'],
                }, function(index) {
                    AjaxRequest({
                        url: '/makroDigital/marketingPage/update',
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": 'Bearer ' + storage.access_token
                        },
                        data: JSON.stringify({
                            file: itemUrl
                        }),
                        loading: true,
                        success: function(result) {
                            if (result.code === "0000") {
                                layer.msg(result.msg);
                                getFilesInfo(itemUrl);
                            } else {
                                layer.msg(result.msg);
                            }
                        }
                    });
                });
            } else if (obj.event === 'viewCurrent') {// 查看线上版本
                window.open(itemUrl);
            } else if (obj.event === 'viewSource') {// 查看本地源文件
                AjaxRequest({
                    url: '/makroDigital/marketingPage/source',
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + storage.access_token
                    },
                    data: {
                        file: itemUrl
                    },
                    loading: true,
                    success: function(result) {
                        if (result.code === "0000") {
                            window.open(result.source);
                        } else {
                            layer.msg(result.msg);
                        }
                    }
                });
            } else if (obj.event === 'previewPage') {// 预览页面，仅用于测试
                layer.confirm('This is only used for the test page', {
                    icon: 3,
                    title: 'Preview Page',
                    btn: ['Open', 'Cancel'],
                }, function(index) {
                    var arr = itemUrl.split('/');
                    var filename = arr[arr.length - 1];
                    var name = filename.substr(0, filename.indexOf('.'));
                    window.open('/makroDigital/marketingPage/view/' + name);
                    layer.close(index);
                });
            }
        });
        return tableM;
    }

    $('#getFileInfo').click(function() {
        getFilesInfo(null, true);
    });

    $('#updatePageFile').click(function() {
        layer.confirm('Confirm Update?', {
            icon: 3,
            title: 'Update Page & File',
            btn: ['Submit', 'Cancel'],
        }, function(index) {
            AjaxRequest({
                url: '/makroDigital/marketingPage/update',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + storage.access_token
                },
                loading: true,
                success: function(result) {
                    if (result.code === "0000") {
                        layer.msg(result.msg);
                        getFilesInfo(null, false, function() {
                            layer.close(index);
                        });
                    } else {
                        layer.msg(result.msg);
                    }
                }
            });
        });
    });

    $('#updateJob').click(function() {
        var chooseMediaType;
        layer.open({
            type: 1,
            maxmin: false,
            area: ['500px', 'auto'],
            title: 'Update MM Jobs',
            content: '<div style="height: 220px;padding: 20px;"><div id="updateJob_mediaType"></div></div>',
            btn: ['Submit', 'Cancel'],
            success: function(layero, index) {
                chooseMediaType = xmSelect.render({
                    el: '#updateJob_mediaType',
                    style: {
                        minHeight: '38px',
                        lineHeight: '38px',
                        boxSizing: 'border-box',
                    },
                    data: [
                        { name: 'H5', value: 'h5' },
                        { name: 'APP', value: 'app' },
                        { name: 'PDF', value: 'pdf' },
                        { name: 'PDF Printing', value: 'pdf-printing' },
                    ],
                    language: 'en',
                    tips: 'Select',
                    layVerify: 'required',
                });
            },
            yes: function(index, layero) {
                var mediaType = chooseMediaType.getValue('value').join(',');
                AjaxRequest({
                    url: '/makroDigital/marketingPublish/updateAll',
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": 'Bearer ' + storage.access_token
                    },
                    data: JSON.stringify({
                        mediaType: mediaType,
                    }),
                    loading: true,
                    success: function(result) {
                        if (result.code === "0000") {
                            layer.close(index);
                            layer.alert(result.msg, {
                                maxWidth: 400,
                                title: 'Update MM Jobs Success',
                                btn: 'Close',
                                icon: 6
                            });
                        } else {
                            layer.msg(result.msg);
                        }
                    }
                });
            }
        });
    });

    // 文件信息
    var fileList = {};
    // 获取文件信息，默认获取全部
    function getFilesInfo(file, loading, success) {
        file = file === null ? void 0 : file;
        AjaxRequest({
            url: '/makroDigital/marketingPage/getFilesInfo',
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: JSON.stringify({
                file: file,
            }),
            loading: loading,
            success: function(result) {
                if (result.code === "0000") {
                    var fileData = result.data || {};
                    for (var x in fileData) {
                        fileList[x] = fileData[x];
                    }
                    for (var type in tableData) {
                        var tableInfo = tableData[type];
                        var data = [];
                        for (var i in tableInfo.list) {
                            var url = tableInfo.list[i];
                            var lastModified = '';
                            var status = 0;
                            if (fileList[url]) {
                                if (fileList[url].status == 200) {
                                    lastModified = fileList[url].lastModified;
                                    status = 2;
                                } else if (fileList[url].status == 404) {
                                    status = 1;
                                }
                            }
                            data.push({
                                type: type,
                                url: url,
                                status: status,
                                lastModified: lastModified,
                            });
                        }
                        table.reloadData(type + 'Table', {
                            data: data
                        });
                        // tables[type] = renderTable(type, tableData[type]);
                    }
                    // layer.msg(result.msg);
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
        });
    }
    getFilesInfo();

});