/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/productPrice/add
    
 */

layui.config({
	base: '../../layuiadmin/' //静态资源所在路径
}).extend({
	index: 'lib/index' //主入口模块
}).use(['index', 'laydate', 'layer','form'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,laydate=layui.laydate
        ,form = layui.form;
    
    var storage = layui.data(setter.tableName);

    var current_itemCode = getUrlRelativePath(4);

    form.val('productPriceAdd', {
        itemcode: current_itemCode,
    });

    var chooseStore;
    init();
    //初始化页面
    function init() {
        chooseStore = xmSelect.render({
            el: '#chooseStore',
            style: {
                minHeight: '38px',
                lineHeight: '38px',
                boxSizing: 'border-box',
            },
            layVerify: 'required',
            data: [],
            language: 'en',
            template: function(obj) {
                return obj.item.name  + '<span style="position: absolute; right: 0; color: #8799a3">' + obj.value + '</span>';
            },
            on: function(data) {
                var arr = data.arr;
                //change, 此次选择变化的数据,数组
                var change = data.change;
                //isAdd, 此次操作是新增还是删除
                var isAdd = data.isAdd;

                var result = arr;
                if (isAdd) {
                    var allItem = change.find(function(item) {
                        return item.value == '999';
                    });
                    if (allItem) {
                        result = [allItem];
                    } else {
                        allItem = arr.find(function(item) {
                            return item.value == '999';
                        });
                        if (allItem) {
                            result = change;
                        }
                    }
                }

                var list = [];
                for (var x in result) {
                    list.push(result[x].value);
                }
                var store = list.join(',');
                $('input[name=storecode]').val(store);
                return result;
            },
        });
        // 执行载入store列表
        loadStoreList(null);
    }
    // 载入store数据
    var __loadStoreList_fail_number = 0;
    function loadStoreList(data, success) {
        $.ajax({
            url: getApiUrl('store.list'),
            type: getApiMethod('store.list'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: data,
            success: function(result) {
                __loadStoreList_fail_number = 0;
                if (result.code === "0000") {
                    var list = result.data;
                    if (list != null && list.length > 0) {
                        var storeData = [];
                        $.each(list, function(index, value) {
                            var tmp = list[index];
                            storeData.push({
                                name: tmp.name,
                                value: tmp.code,
                                selected: false,
                            });
                        });
                        chooseStore.update({
                            data: storeData,
                        });
                    }
                    success && success();
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                ++__loadStoreList_fail_number;
                console.log('loadStoreList: 网络错误！');
                if (__loadStoreList_fail_number < 3) {
                    setTimeout(function() {
                        loadStoreList(data, success);
                    }, 100);
                } else {
                    console.log('loadStoreList: 已累计3次请求失败');
                }
            }
        });
    }

});