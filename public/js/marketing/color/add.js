/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingColor/add
    
 */

layui.config({
	base: '../../layuiadmin/' //静态资源所在路径
}).extend({
	index: 'lib/index', //主入口模块
}).use(['index', 'layer', 'form', 'colorpicker'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form
        ,colorpicker = layui.colorpicker;

    form.verify({
        cmyk: function(value, item) {
            var array = value.replace(/\s+/g, '').split(',');
            if (array.length != 4) {
                return 'CMYK color values must contain 4 numbers 0-100 separated by commas';
            }
            for (var i = 0; i < array.length; i++) {
                if (array[i].length > 3 || array[i] < 0 || array[i] > 100) {
                    return 'CMYK color values must contain 4 numbers 0-100 separated by commas';
                }
            }
            // return 'CMYK color value error';
        },
    });

    // 颜色选择器
    function setColor(color) {
        colorpicker.render({
            elem: '#rgbColorPicker',
            color: color,
            format: 'rgb',
            done: function(color) {
                color = color.replace(/\s+/g, '');
                var rgbObj = RGBToObject(color);
                // var cmykObj = RGBtoCMYK(rgbObj);
                form.val('colorAdd', {
                    "rgb": color,
                    "hex": RGBToHex(rgbObj),
                    // "cmyk": [cmykObj.c, cmykObj.m, cmykObj.y, cmykObj.k].join(','),
                });
                // 改用接口获取cmyk值
                RGBtoCMYK_API(rgbObj, function(cmykColor) {
                    // 赋值cmyk
                    $('input[name="cmyk"]').val(cmykColor);
                });
            }
        });
    }
    setColor('');

    $('input[name="rgb"]').on('input propertychange', function(e) {
        var rgb = $(this).val();
        rgb = rgb.replace(/\s+/g, '');
        var rgbObj = RGBToObject(rgb, null);
        var hex = '', cmyk = '';
        if (rgbObj !== null) {
            hex = RGBToHex(rgbObj);
            // var cmykObj = RGBtoCMYK(rgbObj);
            // cmyk = [cmykObj.c, cmykObj.m, cmykObj.y, cmykObj.k].join(',');
            // 改用接口获取cmyk值
            RGBtoCMYK_API(rgbObj, function(cmykColor) {
                // 赋值cmyk
                $('input[name="cmyk"]').val(cmykColor);
            });
        } else {
            rgb = '';
        }
        setColor(rgb);
        $('input[name="hex"]').val(hex);
        // 赋值cmyk
        $('input[name="cmyk"]').val(cmyk);
    });

    function RGB(r, g, b) {
        if (r <= 0) r = 0;
        if (g <= 0) g = 0;
        if (b <= 0) b = 0;

        if (r > 255) r = 255;
        if (g > 255) g = 255;
        if (b > 255) b = 255;

        this.r = r;
        this.g = g;
        this.b = b;
    }

    function CMYK(c, m, y, k) {
        if (c <= 0) c = 0;
        if (m <= 0) m = 0;
        if (y <= 0) y = 0;
        if (k <= 0) k = 0;

        if (c > 100) c = 100;
        if (m > 100) m = 100;
        if (y > 100) y = 100;
        if (k > 100) k = 100;

        this.c = c;
        this.m = m;
        this.y = y;
        this.k = k;
    }

    function RGBToObject(rgb, defaultValue) {
        if (typeof rgb == 'string') {
            var array = rgb.match(/^rgb\((.*?)\)/);
            if (array != null && array.length > 0 && array[1]) {
                var rgbValue = array[1].replace(/\s+/g, '');
                var rgbArray = rgbValue.split(',');
                var r = rgbArray[0];
                var g = rgbArray[1];
                var b = rgbArray[2];
                if (r <= 255 && g <= 255 && b <= 255) {
                    return new RGB(r, g, b);
                }
            }
        }
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        return new RGB(0, 0, 0);
    }

    // rgb转Hex编码
    function RGBToHex(RGB) {
        var r = RGB.r;
        var g = RGB.g;
        var b = RGB.b;
        // 数字转16进制
        var toHex = function (n) {
            var hex = Number(n).toString(16).toUpperCase();
            if (hex.length < 2) {
                return '0' + hex;
            }
            return hex;
        }
        return "#" + toHex(r) + toHex(g) + toHex(b);
    }

    // rgb转cmyk
    function RGBtoCMYK(RGB) {
        var result = new CMYK(0, 0, 0, 0);
        var r = RGB.r / 255;
        var g = RGB.g / 255;
        var b = RGB.b / 255;
        result.k = Math.min(1 - r, 1 - g, 1 - b);
        if ((1 - result.k) == 0) {
            result.c = 0;
            result.m = 0;
            result.y = 0;
        } else {
            result.c = (1 - r - result.k) / (1 - result.k);
            result.m = (1 - g - result.k) / (1 - result.k);
            result.y = (1 - b - result.k) / (1 - result.k);
        }
        result.c = Math.round(result.c * 100);
        result.m = Math.round(result.m * 100);
        result.y = Math.round(result.y * 100);
        result.k = Math.round(result.k * 100);
        return result;
    }

    // rgb转cmyk，接口转换
    function RGBtoCMYK_API(RGB, success) {
        var color = RGB.r + ',' + RGB.g + ',' + RGB.b;
        var data = {
            "color": color,
            "colorMode": "rgb",
        };
        $.ajax({
            url: '/makroDigital/MarketingColor/convert',
            type: 'POST',
            data: data,
            success: function(result) {
                if (result.color) {
                    success && success(result.color);
                }
            },
            error: function(e) {

            }
        });
    }

});