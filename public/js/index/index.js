layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'user', 'element'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,admin = layui.admin
        ,element = layui.element
        ,form = layui.form
        ,router = layui.router()
        ,search = router.search
        ,user = layui.user;
    
    var $body = $('body');
    
    var storage = layui.data(setter.tableName);
    $("#index_username").html(storage.username);
    
    function getMenu() {
        var html = "";
        
        $.ajax({
            url: getApiUrl('user.menu'),
            type: getApiMethod('user.menu'),
            // data: JSON.stringify(mydata),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {    
                if (result.code==="0000"){ 
                    html += '<li data-name="home" class="layui-nav-item layui-nav-itemed">'
                        + '<a href="javascript:;" lay-tips="Home" lay-direction="2">'
                        + '<i class="layui-icon layui-icon-home"></i>'
                        + '<cite>Home</cite>'
                        + '</a>'
                        + '<dl class="layui-nav-child">'
                        + '<dd data-name="console" class="layui-this"><a lay-href="/makroDigital/home/console">Console</a></dd>'
                        + ' </dl>'
                        + '</li>';

                    // 渲染目录
                    function renderMenu(tree, level) {
                        var _html = '';
                        if (tree) {
                            $.each(tree, function(i, o) {
                                if (o.children) {
                                    if (level == 0) {
                                        _html += '<li data-name="' + o.meta.title + '" class="layui-nav-item">';
                                        _html += '<a href="javascript:;" lay-tips="' + o.meta.title + '" lay-direction="2">'
                                              + '<i class="layui-icon layui-icon-' + o.meta.icon + '"></i>'
                                              + '<cite>' + o.meta.title + '</cite>'
                                              + '</a>';
                                        _html += '<dl class="layui-nav-child">';
                                        _html += renderMenu(o.children, level + 1);
                                        _html += '</dl>';
                                        _html += '</li>';
                                    } else {
                                        _html += '<dd data-name="' + o.meta.title + '">';
                                        _html += '<a href="javascript:;">'
                                              + '<i class="layui-icon layui-icon-' + o.meta.icon + '"></i>'
                                              + '<cite>' + o.meta.title + '</cite>'
                                              + '</a>';
                                        _html += '<dl class="layui-nav-child">';
                                        _html += renderMenu(o.children, level + 1);
                                        _html += '</dl>';
                                        _html += '</dd>';
                                    }
                                } else {
                                    // 真实页面
                                    _html += '<dd data-name="' + o.meta.title + '">';
                                    _html += '<a lay-href="' + o.component + '/' + o.path + '" lay-text="' + o.meta.title + '">'
                                          + '<i class="layui-icon layui-icon-' + o.meta.icon + '"></i>'
                                          + o.meta.title
                                          // + '<span class="layui-nav-more"></span>'
                                          + '</a>';
                                    _html += '</dd>';
                                }
                            });
                        }
                        return _html;
                    }
                    html += renderMenu(result.data, 0);
                    // 渲染html
                    $('#LAY-system-side-menu').html(html);
                    element.init();
                    element.render('LAY-system-side-menu');

                    // 跳转之前的页面
                    var redirectUrl = storage.redirectTo;
                    var targetType = storage.targetType || '';
                    if (redirectUrl != null && redirectUrl != '') {
                        layui.data(setter.tableName, {
                            key: 'redirectTo'
                            ,remove: true
                        });
                        layui.data(setter.tableName, {
                            key: 'targetType'
                            ,remove: true
                        });
                        if (redirectUrl.substr(0, 14) == '/makroDigital/') {
                            var url = redirectUrl.substr(14);
                            var content = ''
                            var menuItem = $('.layui-side-menu').find('*[lay-href="'+url+'"]');
                            if (menuItem.length > 0) {
                                content = '正在打开指定页面中，请稍候...';
                                if (targetType == 'back') {
                                    content = '正在打开之前的页面中，请稍候...';
                                }
                                $('.layui-nav-item, .layui-nav-item .layui-nav-child dd').removeClass('layui-nav-itemed');
                                menuItem.eq(0).click();
                                menuItem.parents('.layui-nav-item, .layui-nav-item .layui-nav-child dd').addClass('layui-nav-itemed');
                            } else {
                                if (targetType != 'back' && url != 'index') {
                                    content = '正在跳转指定页面中，请稍候...';
                                    setTimeout(function() {
                                        window.location.href = redirectUrl;
                                    }, 1000);
                                }
                            }
                            if (content) {
                                var layerOpen = layer.msg(content, {
                                    icon: 16,
                                    shade: [0.3, '#000'],
                                    time: 10000,
                                });
                                setTimeout(function() {
                                    layer.close(layerOpen);
                                }, 1000);
                            }
                        }
                    }
                } else if (result.code==="0017") {
                    layer.msg('登录失效', {
                        offset: '15px'
                        ,icon: 1
                        ,time: 500
                    }, function(){
                        window.location.replace('/makroDigital/login');
                    });
                }
            }
        })
    }
    
    getMenu();
    
});