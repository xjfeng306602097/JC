
/*!
 * 界面入口模块  
 */
 
layui.extend({
    fixed: 'layui/fixed' //修正layui内置模块错误
    ,setter: 'config' //配置模块
    ,admin: 'lib/admin' //核心模块
    ,view: 'lib/view' //视图渲染模块
    ,http: 'lib/http' //http请求模块
    ,lang: 'lib/lang' //多语言模块
    ,verify: 'modules/verify'
}).define(['fixed', 'setter', 'admin', 'verify', 'http', 'lang'], function(exports){
    var $ = layui.$
    ,setter = layui.setter
    ,element = layui.element
    ,table = layui.table
    ,admin = layui.admin
    ,layer = layui.layer
    ,laypage = layui.laypage
    ,tabsPage = admin.tabsPage
    ,view = layui.view
    ,http = layui.http
    ,lang = layui.lang
    
    //打开标签页
    ,openTabsPage = function(url, text){
        //遍历页签选项卡
        var matchTo
        ,tabs = $('#LAY_app_tabsheader>li')
        ,path = url.replace(/(^http(s*):)|(\?[\s\S]*$)/g, '');
        
        tabs.each(function(index){
            var li = $(this)
            ,layid = li.attr('lay-id');
            
            if(layid === url){
                matchTo = true;
                tabsPage.index = index;
            }
        });
        text = text || '新标签页';
        
        //定位当前tabs
        var setThisTab = function(){
            element.tabChange(FILTER_TAB_TBAS, url);
            admin.tabsBodyChange(tabsPage.index, {
                url: url
                ,text: text
            });
        };
        
        if(setter.pageTabs){
            //如果未在选项卡中匹配到，则追加选项卡
            if(!matchTo){
                //延迟修复 Firefox 空白问题
                setTimeout(function(){
                    $(APP_BODY).append([
                        '<div class="layadmin-tabsbody-item layui-show">'
                            ,'<iframe src="'+ url +'" frameborder="0" class="layadmin-iframe"></iframe>'
                        ,'</div>'
                    ].join(''));
                    setThisTab();
                }, 10);
                
                tabsPage.index = tabs.length;
                element.tabAdd(FILTER_TAB_TBAS, {
                    title: '<span>'+ text +'</span>'
                    ,id: url
                    ,attr: path
                });
                
            }
        } else {
            var iframe = admin.tabsBody(admin.tabsPage.index).find('.layadmin-iframe');
            iframe[0].contentWindow.location.href = url;
        }
        
        setThisTab();
    }
    
    ,APP_BODY = '#LAY_app_body', FILTER_TAB_TBAS = 'layadmin-layout-tabs'
    ,$ = layui.$, $win = $(window);
    
    //初始
    if(admin.screen() < 2) admin.sideFlexible();

    // layui方法覆盖，支持调用原来的方法
    // 参数解析：_obj=原对象，_method=原方法名，init=初始化方法（用来修改源代码），call=在调用时执行（可初始化入参）
    function override(_obj, _method, init, call) {
        var source = _obj[_method];
        if (typeof init == 'function') {
            var sourceCode = typeof source == 'function' ? source.toString() : '';
            var exec = function(sourceCode) {
                if (sourceCode == '') {
                    return;
                }
                return eval('('+sourceCode+')');
            };
            source = init(sourceCode, exec);
        }
        return function () {
            var othis = this;
            var func = {
                exist: typeof source == 'function' ? true : false,
                arguments: arguments,
                exec: function() {
                    if (!this.exist) {
                        return;
                    }
                    var args = this.arguments;
                    return source.apply(othis, args);
                },
            };
            if (typeof call != 'function') {
                call = function(func) {
                    return func.exec();
                };
            }
            var result = call.call(othis, func);
            return result;
        };
    }
    
    //table.render方法重写
    //给table追加renderAfter方法，初次渲染完成与切换sort时会自动执行renderAfter
    //用于修复table点击排序后，按钮因为权限渲染未执行，导致按钮不显示的bug
    // 覆盖table.render方法
    table.render = override(table, 'render', null, function(func) {
        var args = func.arguments;
        var config = args[0];
        var othis = $(config.elem);
        // 覆盖配置项中的before方法
        config.before = override(config, 'before', null, function(func) {
            var tableELem = othis.next();
            if (config.page) {
                // 替换Table中的分页文本
                var pageElem = tableELem.find('.layui-table-pageview');
                laypageReplace(pageElem);
            }
            return func.exec();
        });
        // 覆盖配置项中的done方法
        config.done = override(config, 'done', null, function(func) {
            if (typeof config.renderAfter == 'function') {
                config.renderAfter.apply(config, []);
            }
            var tableELem = othis.next();
            // 替换文本
            tableELem.find('*[lay-event="LAYTABLE_COLS"]').attr('title', 'filter column');
            tableELem.find('*[lay-event="LAYTABLE_PRINT"]').attr('title', 'print');
            tableELem.find('*[lay-event="LAYTABLE_EXPORT"]').attr('title', 'export');
            tableELem.find('*[lay-event="LAYTABLE_EXPORT"]').on('click', function() {
                var eventELem = $(this);
                setTimeout(function() {
                    eventELem.find('.layui-table-tool-panel li[data-type="csv"]').text('Export to Csv file');
                    eventELem.find('.layui-table-tool-panel li[data-type="xls"]').text('Export to Excel file');
                }, 1);
            });
            return func.exec();
        });
        var text = {
            none: 'No Data',
        };
        if (config.text == undefined) {
            config.text = text;
        } else {
            config.text = $.extend(text, config.text);
        }
        if (config.page === false) {
            config.limit = Number.MAX_SAFE_INTEGER;
        }
        args[0] = config;
        func.arguments = args;
        var result = func.exec();
        if (typeof config.renderAfter == 'function') {
            var tableFilter = othis.attr('lay-filter');
            table.on('sort(' + tableFilter + ')', config.renderAfter);
        }
        return result;
    });

    // laypage 替换为中文
    function laypageReplace(elem) {
        if (elem.length > 0) {
            elem.find('.layui-laypage-first').attr('title', 'First page');
            elem.find('.layui-laypage-last').attr('title', 'Last page');
            elem.find('.layui-laypage-skip').contents().each(function() {
                this.textContent = this.textContent.replace('到第', 'Page').replace('确定', 'Skip').replace('页', '');
            });
            elem.find('.layui-laypage-count').contents().each(function() {
                this.textContent = this.textContent.replace('共', 'Total').replace('条', '');
            });
            elem.find('.layui-laypage-limits select').contents().each(function() {
                this.textContent = this.textContent.replace('条/页', '/Page');
            });
        } else {
            setTimeout(function () {
                laypageReplace(elem);
            });
        }
    }

    // 覆盖laypage.render方法，修改内容
    laypage.render = override(laypage, 'render', null, function(func) {
        var args = func.arguments;
        var config = args[0];
        var elem = typeof config.elem == 'string' ? '#' + config.elem : config.elem;
        var othis = $(elem);
        laypageReplace(othis);
        // 覆盖配置项中的jump方法
        config.jump = override(config, 'jump', null, function(func) {
            laypageReplace(othis);
            return func.exec();
        });
        args[0] = config;
        func.arguments = args;
        var result = func.exec();
        return result;
    });

    // 覆盖layer.photos方法，修改源码覆盖
    layer.photos = override(layer, 'photos', function(sourceCode, exec) {
        // 引入缺失的变量
        var cache = layer.cache || {}, skin = function(type) {
            return (cache.skin ? (' ' + cache.skin + ' ' + cache.skin + '-' + type) : '');
        };
        if (layui.v == '2.6.8') {
            var e = document,
                i = $,
                r = layer,
                f = layer.cache || {},
                c = skin;
        } else if (layui.v == '2.7.6') {
            var p = document,
                h = $,
                m = layer,
                f = layer.cache || {},
                g = skin;
        }
        // 替换文本
        sourceCode = sourceCode.replace('&#x6CA1;&#x6709;&#x56FE;&#x7247;', 'No image!');
        sourceCode = sourceCode.replace('&#x5F53;&#x524D;&#x56FE;&#x7247;&#x5730;&#x5740;&#x5F02;&#x5E38;<br>&#x662F;&#x5426;&#x7EE7;&#x7EED;&#x67E5;&#x770B;&#x4E0B;&#x4E00;&#x5F20;&#xFF1F;', 'The current picture address is abnormal<br>Continue to view the next one?');
        sourceCode = sourceCode.replace('&#x4E0B;&#x4E00;&#x5F20;', 'Next');
        sourceCode = sourceCode.replace('&#x4E0D;&#x770B;&#x4E86;', 'Close');
        return eval('('+sourceCode+')');
    });

    // 覆盖layer.prompt方法，修改源码覆盖
    layer.prompt = override(layer, 'prompt', function(sourceCode, exec) {
        // 引入缺失的变量
        var cache = layer.cache || {}, skin = function(type) {
            return (cache.skin ? (' ' + cache.skin + ' ' + cache.skin + '-' + type) : '');
        };
        var placeholder = '';
        if (layui.v == '2.6.8') {
            var e = document,
                i = $,
                n = $(window),
                r = layer,
                c = skin;
            placeholder = '(e.placeholder || "")';
            // 增加require参数，用于可取消不能为空验证，默认为true
            sourceCode = sourceCode.replace('""===n', '""===n && (e.require===undefined || e.require)');
        } else if (layui.v == '2.7.6') {
            var p = document,
                h = $,
                f = $(window),
                m = layer,
                g = skin;
            placeholder = '(i.placeholder || "")';
            // 增加require参数，用于可取消不能为空验证，默认为true
            sourceCode = sourceCode.replace('""===t', '""=== t && (i.require===undefined || i.require)');
        }
        // 替换文本
        sourceCode = sourceCode.replace('<textarea ', `<textarea placeholder="' + ` + placeholder + ` + '" `);
        sourceCode = sourceCode.replace('<input ', `<input placeholder="' + ` + placeholder + ` + '" `);
        sourceCode = sourceCode.replace('&#x786E;&#x5B9A;', 'OK');
        sourceCode = sourceCode.replace('&#x53D6;&#x6D88;', 'Cancel');
        sourceCode = sourceCode.replace('&#x6700;&#x591A;&#x8F93;&#x5165;', 'Enter up to ');
        sourceCode = sourceCode.replace('&#x4E2A;&#x5B57;&#x6570;', ' words');
        return eval('('+sourceCode+')');
    });
    
    //将模块根路径设置为 controller 目录
    layui.config({
        base: setter.base + 'modules/'
    });
    
    //加载公共模块
    layui.use('common');
    
    //扩展 lib 目录下的其它模块
    layui.each(setter.extend, function(key, value){
        var mods = {}
        ,_isArray = setter.extend.constructor === Array;
        mods[_isArray ? value : key] = '{/}' + setter.base + 'lib/extend/' + value;
        layui.extend(mods);
    });
    
    view().autoRender();

    // 自定义组件监听
    (function() {
        // layui-collapse增加checkbox实现
        $(document).on('click', '.layui-collapse .layui-colla-checkbox', function(e) {
            if ($(this).find('input[type="checkbox"]').prop('disabled')) {
                return false;
            }
            var checked = $(this).find('input[type="checkbox"]').prop('checked');
            if ($(e.target).is('.layui-colla-checkbox')) {
                checked = !checked;
                $(this).find('input[type="checkbox"]').next('.layui-form-checkbox').trigger('click');
            }
            $(this).parents('.layui-collapse').find('.layui-colla-checkbox-require').removeClass('layui-colla-checkbox-require');
            if (checked) {
                $(this).parent('.layui-colla-item').find('.layui-colla-content').addClass('layui-show');
            } else {
                $(this).parent('.layui-colla-item').find('.layui-colla-content').removeClass('layui-show');
            }
            return false;
        });
    })();

    // 是否为系统框架页
    function isSystemFrame() {
        return self == top && top.location.pathname == '/makroDigital/index';
    }

    // 页面初始化
    (function() {
        var storage = layui.data(setter.tableName);

        if (typeof $.cookie == 'function') {
            // cookie中的token被移除后执行操作
            if ($.cookie('makroDigital_token') == undefined) {
                $.removeCookie('makroDigital_username');
                if (storage.access_token) {
                    layui.data(setter.tableName, {
                        key: 'username'
                        ,remove: true
                    });
                    
                    layui.data(setter.tableName, {
                        key: 'access_token'
                        ,remove: true
                    });
                    
                    layui.data(setter.tableName, {
                        key: 'permissions'
                        ,remove: true
                    });
                    
                    layui.data(setter.tableName, {
                        key: 'httpHeader'
                        ,remove: true
                    });
                    
                    delete storage.username;
                    delete storage.access_token;
                    delete storage.permissions;
                    delete storage.httpHeader;
                }
            }
        }

        // 初始化httpHeader
        var httpHeader = http.header();
        if (storage.access_token != null) {
            httpHeader.set('Authorization', 'Bearer ' + storage.access_token);
        }
        // 载入设置
        httpHeader.setup();

        // 用户信息请求预设置
        var userInfo = http.collection({
            url: getApiUrl('user.detail', { id: 'me' }),
            method: getApiMethod('user.detail'),
            headers: {
                "Content-Type": "application/json"
            }
        });

        userInfo.bind('lang', {
            success: function(result) {
                if (result.code == '0000') {
                    httpHeader.set('Makro-Accept-Language', result.data.lang, true);
                    httpHeader.setup();
                }
            }
        });
        
        // 判断登录
        if (storage.access_token) {
            // 用户权限列表
            var userPermissions;
            if (isSystemFrame()) {
                userInfo.bind('permission', {
                    success: function (result) {
                        if (result.code == '0000') {
                            userPermissions = result.data.perms;
                        } else {
                            userPermissions = null;
                        }
                    },
                    error: function(e) {
                        console.log(e);
                        userPermissions = null;
                    }
                });
                userInfo.bind('roles', {
                    success: function(result) {
                        if (result.code == '0000') {
                            layui.data(setter.tableName, {
                                key: "roles",
                                value: result.roles
                            });
                        }
                    }
                });
                userInfo.request();
                // 请求获取工作流信息
                http.request({
                    url: getApiUrl('approval.workflow.list'),
                    type: getApiMethod('approval.workflow.list'),
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function(result) {
                        if (result.code == '0000') {
                            var data = result.data;
                            layui.data(setter.tableName, {
                                key: "workflow",
                                value: data
                            });
                            var workflowPermission = {};
                            for (var i in data) {
                                workflowPermission[data[i].code] = data[i].relatePermission;
                            }
                            layui.data(setter.tableName, {
                                key: "workflowPermission",
                                value: workflowPermission
                            });
                        }
                    }
                });
            } else {
                userPermissions = storage.permissions || null;
            }
            layui.use('common', function() {
                var permission = layui.common.permission;
                var wait = setInterval(function() {
                    if (userPermissions !== undefined) {
                        clearInterval(wait);
                        if (userPermissions === null) {
                            storage.permissions = [];
                        } else {
                            layui.data(setter.tableName, {
                                key: "permissions",
                                value: userPermissions
                            });
                            storage = layui.data(setter.tableName);
                            // 成功获取权限后，调用reRenderAfterUpdate方法重载
                            permission.config.reRenderAfterUpdate();
                        }
                        permission.init();

                        if (isSystemFrame()) {
                            // 拥有设计权限时，自动加载设计字体
                            if (permission.exist(['marketing:component:design', 'marketing:template:design', 'marketing:activity:design'])) {
                                var mydata = {
                                    "page": 1,
                                    "limit": 1000,
                                    "req": {
                                        "name": "",
                                        "status": 1
                                    },
                                    "sortItems": [{
                                        "column": "name",
                                        "asc": true
                                    }]
                                };
                                http.request({
                                    url: getApiUrl('marketing.font.page'),
                                    type: getApiMethod('marketing.font.page'),
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    data: JSON.stringify(mydata),
                                    success: function (result) {
                                        if (result.code == '0000') {
                                            var fontData = result.data.records;
                                            var fontFace = '';
                                            var loadFontHtml = '';
                                            window.designFont = {};
                                            for (var i = 0; i < fontData.length; i++) {
                                                if (fontData[i] == null) {
                                                    continue;
                                                }
                                                //字体名称大写转小写
                                                var lowerName = (fontData[i].name).toLowerCase();
                                                var fontValue = 'design_' + lowerName.replace(/\s*/g, "");
                                                fontFace = fontFace + "@font-face { ";
                                                fontFace = fontFace + "    font-family: '" + fontValue + "'; ";
                                                fontFace = fontFace + "    src: url('" + fontData[i].path + "'); ";
                                                fontFace = fontFace + "}";
                                                if (fontValue == "freeserif") {
                                                    fontData[i].name = "Default font";
                                                }
                                                loadFontHtml = loadFontHtml + "<span style='font-family:\"" + fontValue + "\"'>" + fontData[i].name + "</span>";
                                                //字体及字体样式
                                                designFont[fontValue] = {
                                                    regular: false,
                                                    bold: false,
                                                    italics: false,
                                                    boldItalics: false
                                                };
                                                if (fontData[i].path != null) {
                                                    designFont[fontValue].regular = true;
                                                }
                                                if (fontData[i].boldPath != null) {
                                                    designFont[fontValue].bold = true;
                                                }
                                                if (fontData[i].italicsPath != null) {
                                                    designFont[fontValue].italics = true;
                                                }
                                                if (fontData[i].boldItalicsPath != null) {
                                                    designFont[fontValue].boldItalics = true;
                                                }
                                            }
                                            console.log('load fonts', window.designFont);
                                            fontFace = "<style>" + fontFace + "</style>";
                                            // 添加字体引入css
                                            $("head").append(fontFace);
                                            // 预加载字体文件
                                            $("body").append('<div id="loadFonts" style="display: block;width: 0;height: 0;visibility: hidden;overflow: hidden;">' + loadFontHtml + '</div>');
                                        }
                                    }
                                });
                            }
                        }

                    }
                }, 5);
            });
        }

    })();
    
    //对外输出
    exports('index', {
        openTabsPage: openTabsPage
    });
});