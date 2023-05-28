/**

 @Name：多语言库
    
 */

layui.define(['http'], function(exports) {
    var $ = layui.$
        ,setter = layui.setter
        ,http = layui.http
        ,httpHeader = http.header();

    // 从数组中删除指定的值
    function removeValue(array, value) {
        var n = 0;
        while (true) {
            var index = array.indexOf(value);
            if (index === -1) {
                break;
            } else {
                array.splice(index, 1);
                ++n;
            }
        }
        return n;
    }

    // 当前语言包所在路径
    var path = '/lang/';

    function Language(version) {
        this.version = version || '';
        // 语言包数据
        this.data = {};
        // 初始加载的语言模块
        var modules = ['design'];
        this.setModulesTo(modules);
        if (this.version) {
            for (var i = 0; i < modules.length; i++) {
                var m = modules[i];
                this.loadModule(m);
            }
        }
    }
    // 获取语言数据
    Language.prototype.get = function(key) {
        var value = this.data;
        key = key || '';
        var tree = key.split('.');
        for (var key in tree) {
            if (tree[key] !== '') {
                value = value[tree[key]];
                if (value === undefined) {
                    return undefined;
                }
            }
        }
        return value;
    };
    // 设置语言版本
    Language.prototype.setVersion = function(version) {
        // 非当前语言则载入对应的语言包
        if (version != this.version) {
            this.version = version || '';
            this.data = {};
            this.reload();
        }
    }
    // 重新载入语言包
    Language.prototype.reload = function() {
        var modules = this.getModules();
        modules = modules.concat(this.getModulesTo());
        this.setModulesTo(modules);
        modules = modules.join(',').split(',');
        this.setModules([]);
        // 重新载入语言包
        for (var i = 0; i < modules.length; i++) {
            var m = modules[i];
            if (m) {
                this.loadModule(m, this.version);
            }
        }
    }
    // 已载入的模块列表
    Language.prototype.modules = [];
    Language.prototype.getModules = function() {
        return Language.prototype.modules;
    };
    Language.prototype.setModules = function(modules) {
        Language.prototype.modules = modules;
    };
    // 待载入的模块列表
    Language.prototype.modulesTo = [];
    Language.prototype.getModulesTo = function() {
        return Language.prototype.modulesTo;
    };
    Language.prototype.setModulesTo = function(modules) {
        Language.prototype.modulesTo = modules;
    };
    // 加载模块
    Language.prototype.loadModule = function(m, version) {
        var version = version || this.version;
        var that = this;
        var data;
        $.ajax({
            url: path + version + '/' + m + '.json',
            type: 'GET',
            async: false,
            success: function(result) {
                console.log('load lang module: ' + m);
                data = result;
                that.data[m] = data;
                if (that.modules.indexOf(m) === -1) {
                    that.modules.push(m);
                }
                removeValue(that.modulesTo, m);
            },
            error: function(e) {
                console.log('load lang module[' + m + '] failed');
            }
        });
        return data;
    };
    if (self != top) {
        window.language = top.language;
    } else {
        var myLanguage = httpHeader.get('Makro-Accept-Language') || '';
        window.language = new Language(myLanguage);
        // 如果首次获取语言版本失败，则异步延迟获取语言版本
        if (myLanguage == '') {
            // 最大等待时间：30秒
            var maxTime = 30000;
            var waitGetLang = setInterval(function () {
                myLanguage = httpHeader.get('Makro-Accept-Language') || '';
                if (myLanguage) {
                    window.language.setVersion(myLanguage);
                    console.log(window.language);
                    clearInterval(waitGetLang);
                    return;
                }
                maxTime -= 100;
                if (maxTime == 0) {
                    clearInterval(waitGetLang);
                }
            }, 100);
        }
        console.log(window.language);
    }
    // 重载语言包
    window.reloadLanguage = function(myLanguage) {
        window.language.setVersion(myLanguage);
    };

    //对外暴露的接口
    exports('lang', window.language.data);
});