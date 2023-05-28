/**

 @Name：layuiAdmin 用户登入和注册等
 
 
 @License: LPPL
    
 */
 
layui.define('form', function(exports){
    var $ = layui.$
        ,layer = layui.layer
        ,setter = layui.setter
        ,view = layui.view
        ,admin = layui.admin
        ,form = layui.form;

    var $body = $('body');
  
    //自定义验证
    form.verify({
        required: [/[\S]+/, 'Required fields cannot be empty'],
        username: [/^[a-zA-Z0-9_\-]{3,30}$/, 'Please enter a valid username'],
        phone: [/^1\d{10}$/, 'Please enter a valid phone number'],
        email: [/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/, 'E-mail format is incorrect'],
        url: [/^(#|(http(s?)):\/\/|\/\/)[^\s]+\.[^\s]+$/, 'Url format is incorrect'],
        number: function(value) {
            if (!value || isNaN(value)) return 'Only numbers are allowed';
        },
        date: [/^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/, 'Incorrect date format'],
        identity: [/(^\d{15}$)|(^\d{17}(x|X|\d)$)/, 'Please enter the correct ID'],

        nickname: function(value, item) { //value：表单的值、item：表单的DOM对象
            if (!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(value)) {
                return 'The username cannot have special characters'; // 用户名不能有特殊字符
            }
            if (/(^\_)|(\__)|(\_+$)/.test(value)) {
                return 'Username must not have underscores at the beginning and end\'_\'';
            }
            if (/^\d+\d+\d$/.test(value)) {
                return 'The username cannot be all numbers'; // 用户名不能全为数字
            }
        },
    
        // 我们既支持上述函数式的方式，也支持下述数组的形式
        // 数组的两个值分别代表：[正则匹配、匹配不符时的提示文字]
        pass: [
            /^[\S]{8,16}$/,
            'Password must be 8 to 16 characters and no spaces'
        ]
    });
  
    exports('verify', {});
});