/**

 @Name：dict 字典实现库
    
 */

layui.define(['form', 'layer'], function(exports) {
    var $ = layui.$,
        setter = layui.setter,
        form = layui.form,
        layer = layui.layer;

    var storage = layui.data(setter.tableName);
    var obj = {
        // dict 请求数据
        request: function(o) {
            if (Object.prototype.toString.call(o) === '[object Object]') {
                var elem = o.elem,
                    lang = o.lang === undefined ? 'en_US' : o.lang, // 语言
                    dictCode = o.dictCode, // 字典code
                    value = o.value, // 默认值
                    renderElement = o.renderElement, // 渲染element方法
                    success = o.success, // 请求成功回调
                    error = o.error, // 请求错误回调
                    complete = o.complete; // 请求完成回调

                if (dictCode === undefined) {
                    return;
                }
                $.ajax({
                    url: getApiUrl('dict.item.list'),
                    type: getApiMethod('dict.item.list'),
                    data: {
                        dictCode: dictCode,
                        lang: lang,
                        status: 1,
                    },
                    headers: {
                        "Authorization": 'Bearer ' + storage.access_token
                    },
                    success: function(result) {
                        if (typeof renderElement === 'function' && typeof elem === 'string') {
                            var html = renderElement(result, dictCode, value, lang);
                            $(elem).html(html);
                            layui.form.render('select');
                        }
                        success && success(result);
                    },
                    error: function(e) {
                        error && error(e);
                    },
                    complete: function(XMLHttpRequest, textStatus) {
                        complete && complete(textStatus);
                    }
                });
            } else {
                console.error('传参错误');
            }
        },
        // 渲染dict 
        // 参数：data         数据集
        // 参数：complete     渲染完成回调
        render: function(data, complete) {
            var renderElement = function (result, dictCode, value, lang) {
                var html = '';
                if (result.code === '0000') {
                    html += '<option value="">Select</option>';
                    if (result.data.length === 0) {
                        html += '<option value="" disabled>No Data</option>';
                    } else {
                        $.each(result.data, function(i, o) {
                            if (value == o.value) {
                                selected = ' selected="selected"';
                            } else {
                                selected = '';
                            }
                            html += '<option value="' + o.value + '" ' + selected + '>' + o.name + '</option>';
                        });
                    }
                }
                return html;
            };
            if (Array.isArray(data)) {
                var total = data.length;
                var current = 0;
                var completeOne = function () {
                    ++current;
                    if (current == total) {
                        complete && complete();
                    }
                };
                for (var n in data) {
                    var item = data[n];
                    if (Object.prototype.toString.call(item) === '[object Object]') {
                        if (typeof item.elem !== 'string') {
                            completeOne();
                            continue;
                        }
                        item.renderElement = renderElement;
                        var requestComplete = item.complete;
                        delete item.complete;
                        item.complete = function() {
                            requestComplete && requestComplete();
                            completeOne();
                        };
                        obj.request(item);
                    } else {
                        console.error('render方法仅支持对象及对象数组传入');
                        completeOne();
                    }
                }
            } else if (Object.prototype.toString.call(data) === '[object Object]') {
                if (typeof data.elem !== 'string') {
                    return;
                }
                data.renderElement = renderElement;
                var requestComplete = data.complete;
                delete data.complete;
                data.complete = function() {
                    requestComplete && requestComplete();
                    complete && complete();
                };
                obj.request(data);
            } else {
                console.error('render方法仅支持对象及对象数组传入');
            }
        },
    };
    //对外暴露的接口
    exports('dict', obj);
});