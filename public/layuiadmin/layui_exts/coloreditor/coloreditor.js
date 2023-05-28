/*!
 * color Editor 
 * 颜色选择编辑器
 * 从layui内置colorpicker组件修改而来
 */
layui.define(['jquery', 'lay'], function(exports) {
    "use strict";
    var $ = layui.jquery
        , lay = layui.lay
        , device = layui.device()
        , clickOrMousedown = (device.mobile ? 'click' : 'mousedown')
        //外部接口
        , coloreditor = {
            config: {}
            , index: layui.coloreditor ? (layui.coloreditor.index + 10000) : 0
                //设置全局项
            , set: function(options) {
                    var that = this;
                    that.config = $.extend({}, that.config, options);
                    return that;
                }
                //事件
            , on: function(events, callback) {
                return layui.onevent.call(this, 'coloreditor', events, callback);
            }
        }
        //操作当前实例
        , thisColorPicker = function() {
            var that = this
                , options = that.config;
            return {
                config: options
            }
        }
        //字符常量
        , MOD_NAME = 'coloreditor'
        , SHOW = 'layui-show'
        , THIS = 'layui-this'
        , ELEM = 'layui-coloreditor'
        , ELEM_MAIN = '.layui-coloreditor-main'
        , ICON_PICKER_DOWN = 'layui-icon-down'
        , ICON_PICKER_CLOSE = 'layui-icon-close'
        , PICKER_TRIG_SPAN = 'layui-coloreditor-trigger-span'
        , PICKER_TRIG_I = 'layui-coloreditor-trigger-i'
        , PICKER_SIDE = 'layui-coloreditor-side'
        , PICKER_SIDE_SLIDER = 'layui-coloreditor-side-slider'
        , PICKER_BASIS = 'layui-coloreditor-basis'
        , PICKER_ALPHA_BG = 'layui-coloreditor-alpha-bgcolor'
        , PICKER_ALPHA_SLIDER = 'layui-coloreditor-alpha-slider'
        , PICKER_BASIS_CUR = 'layui-coloreditor-basis-cursor'
        , PICKER_INPUT = 'layui-coloreditor-main-input'
        , PICKER_INPUT_RGB = 'layui-coloreditor-rgb-input'
        , PICKER_INPUT_HEX = 'layui-coloreditor-hex-input'
        , PICKER_INPUT_CMYK = 'layui-coloreditor-cmyk-input'
        //RGB转HSB
        , RGBToHSB = function(rgb) {
            var hsb = {
                h: 0
                , s: 0
                , b: 0
            };
            var min = Math.min(rgb.r, rgb.g, rgb.b);
            var max = Math.max(rgb.r, rgb.g, rgb.b);
            var delta = max - min;
            hsb.b = max;
            hsb.s = max != 0 ? 255 * delta / max : 0;
            if (hsb.s != 0) {
                if (rgb.r == max) {
                    hsb.h = (rgb.g - rgb.b) / delta;
                } else if (rgb.g == max) {
                    hsb.h = 2 + (rgb.b - rgb.r) / delta;
                } else {
                    hsb.h = 4 + (rgb.r - rgb.g) / delta;
                }
            } else {
                hsb.h = -1;
            };
            if (max == min) {
                hsb.h = 0;
            };
            hsb.h *= 60;
            if (hsb.h < 0) {
                hsb.h += 360;
            };
            hsb.s *= 100 / 255;
            hsb.b *= 100 / 255;
            return hsb;
        }
        //HEX转HSB
        , HEXToHSB = function(hex) {
            var hex = hex.indexOf('#') > -1 ? hex.substring(1) : hex;
            if (hex.length == 3) {
                var num = hex.split("");
                hex = num[0] + num[0] + num[1] + num[1] + num[2] + num[2]
            };
            hex = parseInt(hex, 16);
            var rgb = {
                r: hex >> 16
                , g: (hex & 0x00FF00) >> 8
                , b: (hex & 0x0000FF)
            };
            return RGBToHSB(rgb);
        }
        //HSB转RGB
        , HSBToRGB = function(hsb) {
            var rgb = {};
            var h = hsb.h;
            var s = hsb.s * 255 / 100;
            var b = hsb.b * 255 / 100;
            if (s == 0) {
                rgb.r = rgb.g = rgb.b = b;
            } else {
                var t1 = b;
                var t2 = (255 - s) * b / 255;
                var t3 = (t1 - t2) * (h % 60) / 60;
                if (h == 360) h = 0;
                if (h < 60) {
                    rgb.r = t1;
                    rgb.b = t2;
                    rgb.g = t2 + t3
                } else if (h < 120) {
                    rgb.g = t1;
                    rgb.b = t2;
                    rgb.r = t1 - t3
                } else if (h < 180) {
                    rgb.g = t1;
                    rgb.r = t2;
                    rgb.b = t2 + t3
                } else if (h < 240) {
                    rgb.b = t1;
                    rgb.r = t2;
                    rgb.g = t1 - t3
                } else if (h < 300) {
                    rgb.b = t1;
                    rgb.g = t2;
                    rgb.r = t2 + t3
                } else if (h < 360) {
                    rgb.r = t1;
                    rgb.g = t2;
                    rgb.b = t1 - t3
                } else {
                    rgb.r = 0;
                    rgb.g = 0;
                    rgb.b = 0
                }
            }
            return {
                r: Math.round(rgb.r)
                , g: Math.round(rgb.g)
                , b: Math.round(rgb.b)
            };
        }
        //HSB转HEX
        , HSBToHEX = function(hsb) {
            var rgb = HSBToRGB(hsb);
            var hex = [
                rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16)
            ];
            $.each(hex, function(nr, val) {
                if (val.length == 1) {
                    hex[nr] = '0' + val;
                }
            });
            return hex.join('');
        }
        //转化成所需rgb格式
        , RGBSTo = function(rgbs) {
            var regexp = /[0-9]{1,3}/g;
            var re = rgbs.match(regexp) || [];
            return {
                r: re[0]
                , g: re[1]
                , b: re[2]
            };
        }
        /** 新增方法 **/
        , HSV = function(h, s, v) {
            if (h <= 0) {
                h = 0;
            }
            if (s <= 0) {
                s = 0;
            }
            if (v <= 0) {
                v = 0;
            }
            if (h > 360) {
                h = 360;
            }
            if (s > 100) {
                s = 100;
            }
            if (v > 100) {
                v = 100;
            }
            this.h = h;
            this.s = s;
            this.v = v;
        }
        , HSL = function(h, s, l) {
            if (h <= 0) {
                h = 0;
            }
            if (s <= 0) {
                s = 0;
            }
            if (l <= 0) {
                l = 0;
            }
            if (h > 360) {
                h = 360;
            }
            if (s > 100) {
                s = 100;
            }
            if (l > 100) {
                l = 100;
            }
            this.h = h;
            this.s = s;
            this.l = l;
        }
        , RGB = function(r, g, b) {
            if (r <= 0) {
                r = 0;
            }
            if (g <= 0) {
                g = 0;
            }
            if (b <= 0) {
                b = 0;
            }
            if (r > 255) {
                r = 255;
            }
            if (g > 255) {
                g = 255;
            }
            if (b > 255) {
                b = 255;
            }
            this.r = r;
            this.g = g;
            this.b = b;
        }
        , CMYK = function(c, m, y, k) {
            if (c <= 0) {
                c = 0;
            }
            if (m <= 0) {
                m = 0;
            }
            if (y <= 0) {
                y = 0;
            }
            if (k <= 0) {
                k = 0;
            }
            if (c > 100) {
                c = 100;
            }
            if (m > 100) {
                m = 100;
            }
            if (y > 100) {
                y = 100;
            }
            if (k > 100) {
                k = 100;
            }
            this.c = c;
            this.m = m;
            this.y = y;
            this.k = k;
        }
        //HEX转RGB
        , HEXToRGB = function(hex) {
            if (hex != "" && hex != null && hex != undefined) {
                return {
                    r: parseInt("0x" + hex.slice(1, 3))
                    , g: parseInt("0x" + hex.slice(3, 5))
                    , b: parseInt("0x" + hex.slice(5, 7))
                , }
            } else {
                return {
                    r: 0
                    , g: 0
                    , b: 0
                , };
            }
        }
        //RGB转HEX
        , RGBToHEX = function(RGB) {
            if (typeof RGB == 'string') {
                var arr = RGB.split(',');
                RGB = {
                    r: arr[0]
                    , g: arr[1]
                    , b: arr[2]
                , };
            }
            var hex = '#' + decimalToHex(RGB.r) + decimalToHex(RGB.g) + decimalToHex(RGB.b);
            return hex.toUpperCase();
        }
        //HEX转RGBA
        , HEXToRGBA = function(hex, opacity) {
            if (hex != "" && hex != null && hex != undefined) {
                let RGBA = "rgba(" + parseInt("0x" + hex.slice(1, 3)) + "," + parseInt("0x" + hex.slice(3, 5)) + "," + parseInt("0x" + hex.slice(5, 7)) + "," + opacity + ")";
                return {
                    r: parseInt("0x" + hex.slice(1, 3))
                    , g: parseInt("0x" + hex.slice(3, 5))
                    , b: parseInt("0x" + hex.slice(5, 7))
                    , a: RGBA
                }
            } else {
                return {
                    r: 0
                    , g: 0
                    , b: 0
                    , a: ""
                };
            }
        }
        , HSVtoRGB = function(HSV) {
            var result = new RGB(0, 0, 0);
            var h = HSV.h / 360;
            var s = HSV.s / 100;
            var v = HSV.v / 100;
            if (s == 0) {
                result.r = v * 255;
                result.g = v * 255;
                result.v = v * 255;
            } else {
                var_h = h * 6;
                var_i = Math.floor(var_h);
                var_1 = v * (1 - s);
                var_2 = v * (1 - s * (var_h - var_i));
                var_3 = v * (1 - s * (1 - (var_h - var_i)));
                if (var_i == 0) {
                    var_r = v;
                    var_g = var_3;
                    var_b = var_1
                } else if (var_i == 1) {
                    var_r = var_2;
                    var_g = v;
                    var_b = var_1
                } else if (var_i == 2) {
                    var_r = var_1;
                    var_g = v;
                    var_b = var_3
                } else if (var_i == 3) {
                    var_r = var_1;
                    var_g = var_2;
                    var_b = v
                } else if (var_i == 4) {
                    var_r = var_3;
                    var_g = var_1;
                    var_b = v
                } else {
                    var_r = v;
                    var_g = var_1;
                    var_b = var_2
                };
                result.r = var_r * 255;
                result.g = var_g * 255;
                result.b = var_b * 255;
                result.r = Math.round(result.r);
                result.g = Math.round(result.g);
                result.b = Math.round(result.b);
            }
            return result;
        }
        , HSLtoRGB = function(HSL) {
            var result = new RGB(0, 0, 0);
            var h = HSL.h / 360;
            var s = HSL.s / 100;
            var l = HSL.l / 100;
            if (s == 0) {
                result.r = result.g = result.b = l; // achromatic
            } else {
                function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                result.r = hue2rgb(p, q, h + 1 / 3);
                result.g = hue2rgb(p, q, h);
                result.b = hue2rgb(p, q, h - 1 / 3);
            }
            result.r = Math.round(result.r * 255);
            result.g = Math.round(result.g * 255);
            result.b = Math.round(result.b * 255);
            return result;
        }
        , CMYKtoRGB = function(CMYK) {
            var result = new RGB(0, 0, 0);
            var c = CMYK.c / 100;
            var m = CMYK.m / 100;
            var y = CMYK.y / 100;
            var k = CMYK.k / 100;
            result.r = 1 - Math.min(1, c * (1 - k) + k);
            result.g = 1 - Math.min(1, m * (1 - k) + k);
            result.b = 1 - Math.min(1, y * (1 - k) + k);
            result.r = Math.round(result.r * 255);
            result.g = Math.round(result.g * 255);
            result.b = Math.round(result.b * 255);
            return result;
        }
        , RGBtoCMYK = function(RGB) {
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
        , decimalToHex = function(d) {
            var hex = Number(d * 1).toString(16);
            while (hex.length < 2) {
                hex = "0" + hex;
            }
            return hex;
        }
        // 通过接口将rgb转换为cmyk
        , convertColor = function(color, colorMode, success) {
            var data = {
                "color": color
                , "colorMode": colorMode
            };
            $.ajax({
                url: '/makroDigital/MarketingColor/convert'
                , type: 'POST'
                , data: data
                , success: function(result) {
                    if (result.color) {
                        success && success(result.color);
                    }
                }
                , error: function(e) {}
            });
        }
        , updateCMYK = function(elemPicker) {
            console.log('updateCMYK()');
            var hex = '#' + elemPicker.find('input[name="color_Hex"]').val();
            if (hex == '#') {
                hex = '#000000';
            }
            var rgbColor = HEXToRGB(hex);
            var color = rgbColor.r + ',' + rgbColor.g + ',' + rgbColor.b;
            convertColor(color, 'rgb', function(cmykColor) {
                var arr = cmykColor.split(',');
                var cmyk_C = arr[0];
                var cmyk_M = arr[1];
                var cmyk_Y = arr[2];
                var cmyk_K = arr[3];
                elemPicker.find('input[name="color_C"]').val(cmyk_C);
                elemPicker.find('input[name="color_M"]').val(cmyk_M);
                elemPicker.find('input[name="color_Y"]').val(cmyk_Y);
                elemPicker.find('input[name="color_K"]').val(cmyk_K);
            });
        }
        , updateRGB = function(elemPicker) {
            console.log('updateRGB()');
            var cmykColor = '';
            cmykColor += elemPicker.find('input[name="color_C"]').val();
            cmykColor += ',' + elemPicker.find('input[name="color_M"]').val();
            cmykColor += ',' + elemPicker.find('input[name="color_Y"]').val();
            cmykColor += ',' + elemPicker.find('input[name="color_K"]').val();
            convertColor(cmykColor, 'cmyk', function(rgbColor) {
                var arr = rgbColor.split(',');
                var rgb_R = arr[0];
                var rgb_G = arr[1];
                var rgb_B = arr[2];
                var hex = RGBToHEX(rgbColor);
                elemPicker.find('.' + PICKER_INPUT + ' input').val(hex);
                if (hex.substr(0, 1) == "#") {
                    hex = hex.substr(1, hex.length - 1);
                }
                elemPicker.find('input[name="color_Hex"]').val(hex);
                elemPicker.find('input[name="color_R"]').val(rgb_R);
                elemPicker.find('input[name="color_G"]').val(rgb_G);
                elemPicker.find('input[name="color_B"]').val(rgb_B);
            });
        }
        , $win = $(window)
        , $doc = $(document)
        //构造器
        , Class = function(options) {
            var that = this;
            that.index = ++coloreditor.index;
            that.config = $.extend({}, that.config, coloreditor.config, options);
            that.render();
        };
    //默认配置
    Class.prototype.config = {
        color: '' //默认颜色，默认没有
        , size: null //选择器大小
        , alpha: false //是否开启透明度
        , format: 'hex' //颜色显示/输入格式，可选 rgb,hex
        , predefine: false //预定义颜色是否开启
        , colors: [ //默认预定义颜色列表
            '#009688', '#5FB878', '#1E9FFF', '#FF5722', '#FFB800', '#01AAED', '#999', '#c00', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff', '#c71585', 'rgb(0, 186, 189)', 'rgb(255, 120, 0)', 'rgb(250, 212, 0)', '#393D49', 'rgba(0,0,0,.5)', 'rgba(255, 69, 0, 0.68)', 'rgba(144, 240, 144, 0.5)', 'rgba(31, 147, 255, 0.73)'
        ]
    };
    //初始颜色选择框
    Class.prototype.render = function() {
        var that = this
            , options = that.config
            //颜色选择框对象
            , elemColorBox = $(['<div class="layui-unselect layui-coloreditor">', '<span ' + (options.format == 'rgb' && options.alpha ? 'class="layui-coloreditor-trigger-bgcolor"' : '') + '>', '<span class="layui-coloreditor-trigger-span" ', 'lay-type="' + (options.format == 'rgb' ? (options.alpha ? 'rgba' : 'torgb') : '') + '" ', 'style="' + function() {
                var bgstr = '';
                if (options.color) {
                    bgstr = options.color;
                    if ((options.color.match(/[0-9]{1,3}/g) || []).length > 3) { //需要优化
                        if (!(options.alpha && options.format == 'rgb')) {
                            bgstr = '#' + HSBToHEX(RGBToHSB(RGBSTo(options.color)))
                        }
                    }
                    return 'background: ' + bgstr;
                }
                return bgstr;
            }() + '">', '<i class="layui-icon layui-coloreditor-trigger-i ' + (options.color ? (options.icon && options.icon.down ? options.icon.down : ICON_PICKER_DOWN) : (options.icon && options.icon.close ? options.icon.close : ICON_PICKER_CLOSE)) + '"></i>', '</span>', '</span>', '</div>'].join(''))
        //初始化颜色选择框
        var othis = $(options.elem);
        options.size && elemColorBox.addClass('layui-coloreditor-' + options.size); //初始化颜色选择框尺寸
        //插入颜色选择框
        othis.addClass('layui-inline').html(that.elemColorBox = elemColorBox);
        //获取背景色值
        that.color = that.elemColorBox.find('.' + PICKER_TRIG_SPAN)[0].style.background;
        //相关事件
        that.events();
    };
    //渲染颜色选择器
    Class.prototype.renderPicker = function() {
        var colorInput = '<div class="layui-coloreditor-input-box colored">';
        colorInput += '   <div class="layui-coloreditor-input-row colored">';
        colorInput += '       <div class="layui-inline colored">';
        colorInput += '           <label class="layui-form-label colorLabel colored">R</label>';
        colorInput += '           <input type="number" name="color_R" min="0" max="255" value="255" autocomplete="off" class="layui-input colored ' + PICKER_INPUT_RGB + '" tabIndex="3000">';
        colorInput += '       </div>';
        colorInput += '       <div class="layui-inline colored">';
        colorInput += '           <label class="layui-form-label colorLabel colored">C</label>';
        colorInput += '           <input type="number" name="color_C" min="0" max="100" value="0" class="layui-input colored ' + PICKER_INPUT_CMYK + '" tabIndex="3003">';
        colorInput += '       </div>';
        colorInput += '   </div>';
        colorInput += '   <div class="layui-coloreditor-input-row colored">';
        colorInput += '       <div class="layui-inline colored">';
        colorInput += '           <label class="layui-form-label colorLabel colored">G</label>';
        colorInput += '           <input type="number" name="color_G" min="0" max="255" value="255" autocomplete="off" class="layui-input colored ' + PICKER_INPUT_RGB + '" tabIndex="3001">';
        colorInput += '       </div>';
        colorInput += '       <div class="layui-inline colored">';
        colorInput += '           <label class="layui-form-label colorLabel colored">M</label>';
        colorInput += '           <input type="number" name="color_M" min="0" max="100" value="0" autocomplete="off" class="layui-input colored ' + PICKER_INPUT_CMYK + '" tabIndex="3004">';
        colorInput += '       </div>';
        colorInput += '   </div>';
        colorInput += '   <div class="layui-coloreditor-input-row colored">';
        colorInput += '       <div class="layui-inline colored">';
        colorInput += '           <label class="layui-form-label colorLabel colored">B</label>';
        colorInput += '           <input type="number" name="color_B" min="0" max="255" value="255" autocomplete="off" class="layui-input colored ' + PICKER_INPUT_RGB + '" tabIndex="3002">';
        colorInput += '       </div>';
        colorInput += '       <div class="layui-inline colored">';
        colorInput += '           <label class="layui-form-label colorLabel colored">Y</label>';
        colorInput += '           <input type="number" name="color_Y" min="0" max="100" value="0" autocomplete="off" class="layui-input colored ' + PICKER_INPUT_CMYK + '" tabIndex="3005">';
        colorInput += '       </div>';
        colorInput += '   </div>';
        colorInput += '   <div class="layui-coloreditor-input-row colored">';
        colorInput += '       <div class="layui-inline colored">';
        colorInput += '           <label class="layui-form-label colorLabel colored">#</label>';
        colorInput += '           <input type="text" name="color_Hex" value="ffffff" placeholder="Hex" maxlength="6" autocomplete="off" class="layui-input colored ' + PICKER_INPUT_HEX + '"  tabIndex="3007">';
        colorInput += '       </div>';
        colorInput += '       <div class="layui-inline colored">';
        colorInput += '           <label class="layui-form-label colorLabel colored">K</label>';
        colorInput += '           <input type="number" name="color_K" min="0" max="100" value="0" autocomplete="off" class="layui-input colored ' + PICKER_INPUT_CMYK + '" tabIndex="3006">';
        colorInput += '       </div>';
        colorInput += '   </div>';
        colorInput += '<div class="layui-btn-container colored">';
        colorInput += '   <button class="layui-btn layui-btn-primary layui-btn-sm colored" coloreditor-events="clear">Clear</button>';
        colorInput += '   <button class="layui-btn layui-btn-sm colored" coloreditor-events="confirm">Confirm</button>';
        colorInput += '</div>';
        colorInput += '</div>';
        var that = this
            , options = that.config
            , elemColorBox = that.elemColorBox[0]
            //颜色选择器对象
            , elemPicker = that.elemPicker = $(['<div id="layui-coloreditor' + that.index + '" data-index="' + that.index + '" class="layui-anim layui-anim-downbit layui-coloreditor-main">', '<div class="layui-coloreditor-title colored">Color Picker</div>', '<div class="layui-coloreditor-main-box">'
                //颜色面板
                , '<div class="layui-coloreditor-main-wrapper">', '<div class="layui-coloreditor-basis">', '<div class="layui-coloreditor-basis-white"></div>', '<div class="layui-coloreditor-basis-black"></div>', '<div class="layui-coloreditor-basis-cursor"></div>', '</div>', '<div class="layui-coloreditor-side">', '<div class="layui-coloreditor-side-slider"></div>', '</div>', '</div>', colorInput, '</div>'
                //透明度条块
                , '<div class="layui-coloreditor-main-alpha ' + (options.alpha ? SHOW : '') + '">', '<div class="layui-coloreditor-alpha-bgcolor">', '<div class="layui-coloreditor-alpha-slider"></div>', '</div>', '</div>'
                //预设颜色列表
                , function() {
                    if (options.predefine) {
                        var list = ['<div class="layui-coloreditor-main-pre">'];
                        layui.each(options.colors, function(i, v) {
                            list.push(['<div class="layui-coloreditor-pre' + ((v.match(/[0-9]{1,3}/g) || []).length > 3 ? ' layui-coloreditor-pre-isalpha' : '') + '">', '<div style="background:' + v + '"></div>', '</div>'].join(''));
                        });
                        list.push('</div>');
                        return list.join('');
                    } else {
                        return '';
                    }
                }()
                //底部表单元素区域
                , '<div class="layui-coloreditor-main-input">', '<div class="layui-inline">', '<input type="text" class="layui-input">', '</div>', '<div class="layui-btn-container">', '<button class="layui-btn layui-btn-primary layui-btn-sm" coloreditor-events="clear">Clear</button>', '<button class="layui-btn layui-btn-sm" coloreditor-events="confirm">Confirm</button>', '</div', '</div>', '</div>'
            ].join(''))
            , elemColorBoxSpan = that.elemColorBox.find('.' + PICKER_TRIG_SPAN)[0];
        //如果当前点击的颜色盒子已经存在选择器，则关闭
        if ($(ELEM_MAIN)[0] && $(ELEM_MAIN).data('index') == that.index) {
            that.removePicker(Class.thisElemInd);
        } else { //插入颜色选择器
            that.removePicker(Class.thisElemInd);
            $('body').append(elemPicker);
        }
        Class.thisElemInd = that.index; //记录最新打开的选择器索引
        Class.thisColor = elemColorBox.style.background //记录最新打开的选择器颜色选中值
        that.position();
        that.pickerEvents();
    };
    //颜色选择器移除
    Class.prototype.removePicker = function(index) {
        var that = this
            , options = that.config;
        $('#layui-coloreditor' + (index || that.index)).remove();
        return that;
    };
    //定位算法
    Class.prototype.position = function() {
        var that = this
            , options = that.config;
        lay.position(that.bindElem || that.elemColorBox[0], that.elemPicker[0], {
            position: options.position
            , align: 'center'
        });
        return that;
    };
    //颜色选择器赋值
    Class.prototype.val = function() {
        var that = this
            , options = that.config
            , elemColorBox = that.elemColorBox.find('.' + PICKER_TRIG_SPAN)
            , elemPickerInput = that.elemPicker.find('.' + PICKER_INPUT)
            , e = elemColorBox[0]
            , bgcolor = e.style.backgroundColor;
        //判断是否有背景颜色
        if (bgcolor) {
            //转化成hsb格式
            var hsb = RGBToHSB(RGBSTo(bgcolor))
                , type = elemColorBox.attr('lay-type');
            //同步滑块的位置及颜色选择器的选择
            that.select(hsb.h, hsb.s, hsb.b);
            //如果格式要求为rgb
            if (type === 'torgb') {
                elemPickerInput.find('input').val(bgcolor);
            };
            //如果格式要求为rgba
            if (type === 'rgba') {
                var rgb = RGBSTo(bgcolor);
                //如果开启透明度而没有设置，则给默认值
                if ((bgcolor.match(/[0-9]{1,3}/g) || []).length == 3) {
                    elemPickerInput.find('input').val('rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 1)');
                    that.elemPicker.find('.' + PICKER_ALPHA_SLIDER).css("left", 280);
                } else {
                    elemPickerInput.find('input').val(bgcolor);
                    var left = bgcolor.slice(bgcolor.lastIndexOf(",") + 1, bgcolor.length - 1) * 295;
                    that.elemPicker.find('.' + PICKER_ALPHA_SLIDER).css("left", left);
                };
                //设置span背景色
                that.elemPicker.find('.' + PICKER_ALPHA_BG)[0].style.background = 'linear-gradient(to right, rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0), rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + '))';
            };
        } else {
            //如果没有背景颜色则默认到最初始的状态
            that.select(0, 100, 100);
            elemPickerInput.find('input').val("");
            that.elemPicker.find('.' + PICKER_ALPHA_BG)[0].style.background = '';
            that.elemPicker.find('.' + PICKER_ALPHA_SLIDER).css("left", 295);
        }
    };
    //颜色选择器滑动 / 点击
    Class.prototype.side = function() {
        var that = this
            , options = that.config
            , span = that.elemColorBox.find('.' + PICKER_TRIG_SPAN)
            , type = span.attr('lay-type')
            , side = that.elemPicker.find('.' + PICKER_SIDE)
            , slider = that.elemPicker.find('.' + PICKER_SIDE_SLIDER)
            , basis = that.elemPicker.find('.' + PICKER_BASIS)
            , choose = that.elemPicker.find('.' + PICKER_BASIS_CUR)
            , alphacolor = that.elemPicker.find('.' + PICKER_ALPHA_BG)
            , alphaslider = that.elemPicker.find('.' + PICKER_ALPHA_SLIDER)
            , _h = slider[0].offsetTop / 250 * 360
            , _b = 100 - (choose[0].offsetTop + 3) / 250 * 100
            , _s = (choose[0].offsetLeft + 3) / 280 * 100
            , _a = Math.round(alphaslider[0].offsetLeft / 295 * 100) / 100
            , i = that.elemColorBox.find('.' + PICKER_TRIG_I)
            , pre = that.elemPicker.find('.layui-coloreditor-pre').children('div')
            , change = function(x, y, z, a) {
                that.select(x, y, z);
                var rgb = HSBToRGB({
                    h: x
                    , s: y
                    , b: z
                });
                i.addClass(options.icon && options.icon.down ? options.icon.down : ICON_PICKER_DOWN).removeClass(options.icon && options.icon.close ? options.icon.close : ICON_PICKER_CLOSE);
                span[0].style.background = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
                if (type === 'torgb') {
                    that.elemPicker.find('.' + PICKER_INPUT).find('input').val('rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')');
                };
                if (type === 'rgba') {
                    var left = 0;
                    left = a * 295;
                    alphaslider.css("left", left);
                    that.elemPicker.find('.' + PICKER_INPUT).find('input').val('rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + a + ')');
                    span[0].style.background = 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + a + ')';
                    alphacolor[0].style.background = 'linear-gradient(to right, rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0), rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + '))'
                };
                //回调更改的颜色
                options.change && options.change(that.elemPicker.find('.' + PICKER_INPUT).find('input').val());
                var newColor = that.elemPicker.find('.' + PICKER_INPUT).find("input").val();
                var color_hex = '';
                if (options.format == 'rgb') {
                    var rgbValues = newColor.match(/\((.*?)\)/);
                    var rgbValue = rgbValues[1] ? rgbValues[1].replace(/\s+/g, '') : '';
                    color_hex = RGBToHEX(rgbValue);
                } else {
                    color_hex = newColor.toUpperCase();
                }
                var color_rgb = HEXToRGB(color_hex);
                if (color_hex.substr(0, 1) == "#") {
                    color_hex = color_hex.substr(1, color_hex.length - 1);
                }
                that.elemPicker.find('input[name="color_Hex"]').val(color_hex);
                that.elemPicker.find('input[name="color_R"]').val(color_rgb.r);
                that.elemPicker.find('input[name="color_G"]').val(color_rgb.g);
                that.elemPicker.find('input[name="color_B"]').val(color_rgb.b);
            }
            //拖拽元素
            , elemMove = $(['<div class="layui-auxiliar-moving" id="LAY-coloreditor-moving"></div>'].join(''))
            , createMoveElem = function(call) {
                $('#LAY-coloreditor-moving')[0] || $('body').append(elemMove);
                elemMove.on('mousemove', call);
                elemMove.on('mouseup', function() {
                    elemMove.remove();
                    updateCMYK(that.elemPicker);
                }).on('mouseleave', function() {
                    elemMove.remove();
                });
            };
        //右侧主色选择
        slider.on('mousedown', function(e) {
            var oldtop = this.offsetTop
                , oldy = e.clientY;
            var move = function(e) {
                var top = oldtop + (e.clientY - oldy)
                    , maxh = side[0].offsetHeight;
                if (top < 0) top = 0;
                if (top > maxh) top = maxh;
                var h = top / 250 * 360;
                _h = h;
                change(h, _s, _b, _a);
                e.preventDefault();
            };
            createMoveElem(move);
            //layui.stope(e);
            e.preventDefault();
        });
        side.on('click', function(e) {
            var top = e.clientY - $(this).offset().top;
            if (top < 0) top = 0;
            if (top > this.offsetHeight) top = this.offsetHeight;
            var h = top / 250 * 360;
            _h = h;
            change(h, _s, _b, _a);
            updateCMYK(that.elemPicker);
            e.preventDefault();
        });
        //中间小圆点颜色选择
        choose.on('mousedown', function(e) {
            var oldtop = this.offsetTop
                , oldleft = this.offsetLeft
                , oldy = e.clientY
                , oldx = e.clientX;
            var move = function(e) {
                var top = oldtop + (e.clientY - oldy)
                    , left = oldleft + (e.clientX - oldx)
                    , maxh = basis[0].offsetHeight - 3
                    , maxw = basis[0].offsetWidth - 3;
                if (top < -3) top = -3;
                if (top > maxh) top = maxh;
                if (left < -3) left = -3;
                if (left > maxw) left = maxw;
                var s = (left + 3) / 280 * 100
                    , b = 100 - (top + 3) / 250 * 100;
                _b = b;
                _s = s;
                change(_h, s, b, _a);
                e.preventDefault();
            };
            layui.stope(e);
            createMoveElem(move);
            e.preventDefault();
        });
        basis.on('mousedown', function(e) {
            var top = e.clientY - $(this).offset().top - 3 + $win.scrollTop()
                , left = e.clientX - $(this).offset().left - 3 + $win.scrollLeft()
            if (top < -3) top = -3;
            if (top > this.offsetHeight - 3) top = this.offsetHeight - 3;
            if (left < -3) left = -3;
            if (left > this.offsetWidth - 3) left = this.offsetWidth - 3;
            var s = (left + 3) / 280 * 100
                , b = 100 - (top + 3) / 250 * 100;
            _b = b;
            _s = s;
            change(_h, s, b, _a);
            updateCMYK(that.elemPicker);
            layui.stope(e);
            e.preventDefault();
            choose.trigger(e, 'mousedown');
        });
        //底部透明度选择
        alphaslider.on('mousedown', function(e) {
            var oldleft = this.offsetLeft
                , oldx = e.clientX;
            var move = function(e) {
                var left = oldleft + (e.clientX - oldx)
                    , maxw = alphacolor[0].offsetWidth;
                if (left < 0) left = 0;
                if (left > maxw) left = maxw;
                var a = Math.round(left / 295 * 100) / 100;
                _a = a;
                change(_h, _s, _b, a);
                e.preventDefault();
            };
            createMoveElem(move);
            e.preventDefault();
        });
        alphacolor.on('click', function(e) {
            var left = e.clientX - $(this).offset().left
            if (left < 0) left = 0;
            if (left > this.offsetWidth) left = this.offsetWidth;
            var a = Math.round(left / 295 * 100) / 100;
            _a = a;
            change(_h, _s, _b, a);
            e.preventDefault();
        });
        //预定义颜色选择
        pre.each(function() {
            $(this).on('click', function() {
                $(this).parent('.layui-coloreditor-pre').addClass('selected').siblings().removeClass('selected');
                var color = this.style.backgroundColor
                    , hsb = RGBToHSB(RGBSTo(color))
                    , a = color.slice(color.lastIndexOf(",") + 1, color.length - 1)
                    , left;
                _h = hsb.h;
                _s = hsb.s;
                _b = hsb.b;
                if ((color.match(/[0-9]{1,3}/g) || []).length == 3) a = 1;
                _a = a;
                left = a * 295;
                change(hsb.h, hsb.s, hsb.b, a);
            })
        });
    };
    //颜色选择器hsb转换
    Class.prototype.select = function(h, s, b, type) {
        var that = this
            , options = that.config
            , hex = HSBToHEX({
                h: h
                , s: 100
                , b: 100
            })
            , color = HSBToHEX({
                h: h
                , s: s
                , b: b
            })
            , sidetop = h / 360 * 250
            , top = 250 - b / 100 * 250 - 3
            , left = s / 100 * 280 - 3;
        that.elemPicker.find('.' + PICKER_SIDE_SLIDER).css("top", sidetop); //滑块的top
        that.elemPicker.find('.' + PICKER_BASIS)[0].style.background = '#' + hex; //颜色选择器的背景
        //选择器的top left
        that.elemPicker.find('.' + PICKER_BASIS_CUR).css({
            "top": top
            , "left": left
        });
        if (type === 'change') return;
        //选中的颜色
        that.elemPicker.find('.' + PICKER_INPUT).find('input').val('#' + color);
    };
    Class.prototype.pickerEvents = function() {
        var that = this
            , options = that.config
            , elemColorBoxSpan = that.elemColorBox.find('.' + PICKER_TRIG_SPAN) //颜色盒子
            , elemPickerInput = that.elemPicker.find('.' + PICKER_INPUT + ' input') //颜色选择器表单
            , rgbInput = that.elemPicker.find('.' + PICKER_INPUT_RGB) // rgb input box
            , cmykInput = that.elemPicker.find('.' + PICKER_INPUT_CMYK) // cmyk input box
            , hexInput = that.elemPicker.find('.' + PICKER_INPUT_HEX) // hex input box
            , pickerEvents = {
                //清空
                clear: function(othis) {
                    var value = '#FFFFFF';
                    elemColorBoxSpan[0].style.background = value;
                    that.elemColorBox.find('.' + PICKER_TRIG_I).removeClass(options.icon && options.icon.down ? options.icon.down : ICON_PICKER_DOWN).addClass(options.icon && options.icon.close ? options.icon.close : ICON_PICKER_CLOSE);
                    that.color = value;
                    options.done && options.done(value, null);
                    that.removePicker();
                }
                //确认
                , confirm: function(othis, change) {
                    var value = elemPickerInput.val()
                        , colorValue = value
                        , hsb = {};
                    //改造原Hex输入框为隐藏，采用自定义Hex输入框并做歉容处理    
                    if (value == "" || value == null || value == undefined) {
                        value = hexInput.val();
                    }
                    if (value.indexOf(',') > -1) {
                        hsb = RGBToHSB(RGBSTo(value));
                        that.select(hsb.h, hsb.s, hsb.b);
                        elemColorBoxSpan[0].style.background = (colorValue = '#' + HSBToHEX(hsb));
                        if ((value.match(/[0-9]{1,3}/g) || []).length > 3 && elemColorBoxSpan.attr('lay-type') === 'rgba') {
                            var left = value.slice(value.lastIndexOf(",") + 1, value.length - 1) * 295;
                            that.elemPicker.find('.' + PICKER_ALPHA_SLIDER).css("left", left);
                            elemColorBoxSpan[0].style.background = value;
                            colorValue = value;
                        };
                    } else {
                        hsb = HEXToHSB(value);
                        elemColorBoxSpan[0].style.background = (colorValue = '#' + HSBToHEX(hsb));
                        that.elemColorBox.find('.' + PICKER_TRIG_I).removeClass(options.icon && options.icon.close ? options.icon.close : ICON_PICKER_CLOSE).addClass(options.icon && options.icon.down ? options.icon.down : ICON_PICKER_DOWN);
                    };
                    var tmpColor = {};
                    tmpColor.hex = '#' + that.elemPicker.find('input[name="color_Hex"]').val();
                    tmpColor.rgb = that.elemPicker.find('input[name="color_R"]').val() + ',' + that.elemPicker.find('input[name="color_G"]').val() + ',' + that.elemPicker.find('input[name="color_B"]').val();
                    tmpColor.cmyk = that.elemPicker.find('input[name="color_C"]').val() + ',' + that.elemPicker.find('input[name="color_M"]').val() + ',' + that.elemPicker.find('input[name="color_Y"]').val() + ',' + that.elemPicker.find('input[name="color_K"]').val();
                    if (change === 'change') {
                        that.select(hsb.h, hsb.s, hsb.b, change);
                        options.change && options.change(colorValue);
                        return;
                    }
                    that.color = value;
                    options.done && options.done(value, tmpColor);
                    that.removePicker();
                }
            };
        //选择器面板点击事件
        that.elemPicker.on('click', '*[coloreditor-events]', function() {
            var othis = $(this)
                , attrEvent = othis.attr('coloreditor-events');
            pickerEvents[attrEvent] && pickerEvents[attrEvent].call(this, othis);
        });
        //输入框事件
        elemPickerInput.on('keyup', function(e) {
            var othis = $(this)
            pickerEvents.confirm.call(this, othis, e.keyCode === 13 ? null : 'change');
        });
        // hex输入框事件
        hexInput.on('input propertychange', function(e) {
            var othis = $(this);
            var allowChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F'];
            var theVal = this.value;
            if (theVal.length > 0) {
                var newChar = '';
                for (var k = 0; k < theVal.length; k++) {
                    if (allowChars.indexOf(theVal.charAt(k)) > -1) {
                        newChar = newChar + theVal.charAt(k);
                    }
                }
                this.value = newChar;
                theVal = newChar;
                if (theVal.length == 6) {
                    var p3 = $(this).parents().parents().parents();
                    var color_hex = '#' + theVal;
                    var color_rgb = HEXToRGB(color_hex);
                    //通过原colorPicker的输入框change事件触发左边色版点选位更新
                    elemPickerInput.val(color_hex);
                    p3.find('input[name="color_R"]').val(color_rgb.r);
                    p3.find('input[name="color_G"]').val(color_rgb.g);
                    p3.find('input[name="color_B"]').val(color_rgb.b);
                    updateCMYK(p3);
                    pickerEvents.confirm.call(this, othis, 13 === e.keyCode ? null : 'change');
                }
            }
        });
        // rgb输入框事件
        rgbInput.on('input propertychange', function(e) {
            var othis = $(this);
            this.value = this.value.replace(/[^\d]/g, '');
            if (this.value * 1 < 0) {
                this.value = 0;
            } else if (this.value * 1 > 255) {
                this.value = 255;
            }
            var p3 = $(this).parents().parents().parents();
            var RGB = {};
            RGB.r = p3.find('input[name="color_R"]').val();
            RGB.g = p3.find('input[name="color_G"]').val();
            RGB.b = p3.find('input[name="color_B"]').val();
            if (RGB.r != "" && RGB.g != "" && RGB.b != "") {
                var color_hex = RGBToHEX(RGB);
                //write cmyk/hex input box
                if (color_hex != "" && color_hex != null) {
                    //通过原colorPicker的输入框change事件触发左边色版点选位更新
                    elemPickerInput.val(color_hex);
                    if (color_hex.substr(0, 1) == "#") {
                        color_hex = color_hex.substr(1, color_hex.length - 1);
                    }
                }
                p3.find('input[name="color_Hex"]').val(color_hex);
                updateCMYK(p3);
                pickerEvents.confirm.call(this, othis, 13 === e.keyCode ? null : 'change');
            }
        });
        // cmyk输入框事件
        cmykInput.on('input propertychange', function(e) {
            var othis = $(this);
            this.value = this.value.replace(/[^\d]/g, '');
            if (this.value * 1 < 0) {
                this.value = 0;
            } else if (this.value * 1 > 100) {
                this.value = 100;
            }
            var p3 = $(this).parents().parents().parents();
            var _c = p3.find('input[name="color_C"]').val();
            var _m = p3.find('input[name="color_M"]').val();
            var _y = p3.find('input[name="color_Y"]').val();
            var _k = p3.find('input[name="color_K"]').val();
            if (_c != "" && _m != "" && _y != "" && _k != "") {
                updateRGB(p3);
                pickerEvents.confirm.call(this, othis, 13 === e.keyCode ? null : 'change');
            }
        });
        // 从input获取颜色
        if (that.elemPicker) {
            var newColor = that.color;
            var color_hex = '';
            if (newColor.indexOf('rgb') !== -1) {
                var rgbValues = newColor.match(/\((.*?)\)/);
                var rgbValue = rgbValues[1] ? rgbValues[1].replace(/\s+/g, '') : '';
                color_hex = RGBToHEX(rgbValue);
            } else {
                color_hex = newColor.toUpperCase();
            }
            var color_rgb = HEXToRGB(color_hex);
            if (color_hex.substr(0, 1) == "#") {
                color_hex = color_hex.substr(1, color_hex.length - 1);
            }
            that.elemPicker.find('input[name="color_Hex"]').val(color_hex);
            that.elemPicker.find('input[name="color_R"]').val(color_rgb.r);
            that.elemPicker.find('input[name="color_G"]').val(color_rgb.g);
            that.elemPicker.find('input[name="color_B"]').val(color_rgb.b);
            updateCMYK(that.elemPicker);
        }
    }
    //颜色选择器输入
    Class.prototype.events = function() {
        var that = this
            , options = that.config
            , elemColorBoxSpan = that.elemColorBox.find('.' + PICKER_TRIG_SPAN)
        //弹出颜色选择器
        that.elemColorBox.on('click', function() {
            that.renderPicker();
            if ($(ELEM_MAIN)[0]) {
                that.val();
                that.side();
            };
        });
        if (!options.elem[0] || that.elemColorBox[0].eventHandler) return;
        //绑定关闭控件事件
        $doc.on(clickOrMousedown, function(e) {
            //如果点击的元素是颜色框
            if ($(e.target).hasClass(ELEM) || $(e.target).parents('.' + ELEM)[0]) return;
            //如果点击的元素是选择器
            if ($(e.target).hasClass(ELEM_MAIN.replace(/\./g, '')) || $(e.target).parents(ELEM_MAIN)[0]) return;
            if (!that.elemPicker) return;
            if (that.color) {
                var hsb = RGBToHSB(RGBSTo(that.color));
                that.select(hsb.h, hsb.s, hsb.b);
            } else {
                that.elemColorBox.find('.' + PICKER_TRIG_I).removeClass(options.icon && options.icon.down ? options.icon.down : ICON_PICKER_DOWN).addClass(options.icon && options.icon.close ? options.icon.close : ICON_PICKER_CLOSE);
            }
            elemColorBoxSpan[0].style.background = that.color || '';
            that.removePicker();
        });
        //自适应定位
        $win.on('resize', function() {
            if (!that.elemPicker || !$(ELEM_MAIN)[0]) {
                return false;
            }
            that.position();
        });
        that.elemColorBox[0].eventHandler = true;
    };
    //核心入口
    coloreditor.render = function(options) {
        var inst = new Class(options);
        return thisColorPicker.call(inst);
    };
    exports(MOD_NAME, coloreditor);
});
layui.link('/layuiadmin/layui_exts/coloreditor/coloreditor.css');