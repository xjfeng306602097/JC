// upload 重新对上传模块进行载入，修正上传时提示的是中文
layui.define("layer", function(e) {
    "use strict";
    var t = layui.$,
        i = layui.layer,
        n = layui.hint(),
        o = layui.device(),
        a = {
            config: {},
            config2: {},
            set: function(e) {
                var i = this;
                return i.config = t.extend({}, i.config, e), i
            },
            on: function(e, t) {
                return layui.onevent.call(this, r, e, t)
            }
        },
        l = function() {
            var e = this;
            return {
                upload: function(t) {
                    e.upload.call(e, t)
                },
                reload: function(t) {
                    e.reload.call(e, t)
                },
                config: e.config
            }
        },
        r = "upload",
        u = "layui-upload-file",
        c = "layui-upload-form",
        f = "layui-upload-iframe",
        s = "layui-upload-choose",
        p = function(e) {
            var i = this;
            i.config = t.extend({}, i.config, a.config, e), i.render()
        };
    p.prototype.config = {
        accept: "images",
        exts: "",
        auto: !0,
        bindAction: "",
        url: "",
        field: "file",
        acceptMime: "",
        method: "post",
        data: {},
        drag: !0,
        size: 0,
        number: 0,
        multiple: !1
    }, p.prototype.render = function(e) {
        var i = this,
            e = i.config;
        e.elem = t(e.elem), e.bindAction = t(e.bindAction), i.file(), i.events()
    }, p.prototype.file = function() {
        var e = this,
            i = e.config,
            n = e.elemFile = t(['<input class="' + u + '" type="file" accept="' + i.acceptMime + '" name="' + i.field + '"', i.multiple ? " multiple" : "", ">"].join("")),
            a = i.elem.next();
        (a.hasClass(u) || a.hasClass(c)) && a.remove(), o.ie && o.ie < 10 && i.elem.wrap('<div class="layui-upload-wrap"></div>'), e.isFile() ? (e.elemFile = i.elem, i.field = i.elem[0].name) : i.elem.after(n), o.ie && o.ie < 10 && e.initIE()
    }, p.prototype.initIE = function() {
        var e = this,
            i = e.config,
            n = t('<iframe id="' + f + '" class="' + f + '" name="' + f + '" frameborder="0"></iframe>'),
            o = t(['<form target="' + f + '" class="' + c + '" method="post" key="set-mine" enctype="multipart/form-data" action="' + i.url + '">', "</form>"].join(""));
        t("#" + f)[0] || t("body").append(n), i.elem.next().hasClass(c) || (e.elemFile.wrap(o), i.elem.next("." + c).append(function() {
            var e = [];
            return layui.each(i.data, function(t, i) {
                i = "function" == typeof i ? i() : i, e.push('<input type="hidden" name="' + t + '" value="' + i + '">')
            }), e.join("")
        }()))
    }, p.prototype.msg = function(e) {
        return i.msg(e, {
            icon: 2,
            shift: 6
        })
    }, p.prototype.isFile = function() {
        var e = this.config.elem[0];
        if (e) return "input" === e.tagName.toLocaleLowerCase() && "file" === e.type
    }, p.prototype.preview = function(e) {
        var t = this;
        window.FileReader && layui.each(t.chooseFiles, function(t, i) {
            var n = new FileReader;
            n.readAsDataURL(i), n.onload = function() {
                e && e(t, i, this.result)
            }
        })
    }, p.prototype.upload = function(e, i) {
        var n, a = this,
            l = a.config,
            r = a.elemFile[0],
            u = function() {
                var i = 0,
                    n = 0,
                    o = e || a.files || a.chooseFiles || r.files,
                    u = function() {
                        l.multiple && i + n === a.fileLength && "function" == typeof l.allDone && l.allDone({
                            total: a.fileLength,
                            successful: i,
                            aborted: n
                        })
                    };
                layui.each(o, function(e, o) {
                    var r = new FormData;
                    r.append(l.field, o), layui.each(l.data, function(e, t) {
                        t = "function" == typeof t ? t() : t, r.append(e, t)
                    });
                    var c = {
                        url: l.url,
                        type: "post",
                        data: r,
                        contentType: !1,
                        processData: !1,
                        dataType: "json",
                        headers: l.headers || {},
                        success: function(t) {
                            i++, d(e, t), u()
                        },
                        error: function() {
                            n++, a.msg("An exception occurred in the request upload interface"), m(e), u()
                        }
                    };
                    "function" == typeof l.progress && (c.xhr = function() {
                        var i = t.ajaxSettings.xhr();
                        return i.upload.addEventListener("progress", function(t) {
                            if (t.lengthComputable) {
                                var i = Math.floor(t.loaded / t.total * 100);
                                l.progress(i, l.item ? l.item[0] : l.elem[0], t, e)
                            }
                        }), i
                    }), t.ajax(c)
                })
            },
            c = function() {
                var e = t("#" + f);
                a.elemFile.parent().submit(), clearInterval(p.timer), p.timer = setInterval(function() {
                    var t, i = e.contents().find("body");
                    try {
                        t = i.text()
                    } catch (n) {
                        a.msg("An exception occurs when getting the response information after uploading"), clearInterval(p.timer), m()
                    }
                    t && (clearInterval(p.timer), i.html(""), d(0, t))
                }, 30)
            },
            d = function(e, t) {
                if (a.elemFile.next("." + s).remove(), r.value = "", "object" != typeof t) try {
                    t = JSON.parse(t)
                } catch (i) {
                    return t = {}, a.msg("Please return valid JSON to the upload interface")
                }
                "function" == typeof l.done && l.done(t, e || 0, function(e) {
                    a.upload(e)
                })
            },
            m = function(e) {
                l.auto && (r.value = ""), "function" == typeof l.error && l.error(e || 0, function(e) {
                    a.upload(e)
                })
            },
            h = l.exts,
            v = function() {
                var t = [];
                return layui.each(e || a.chooseFiles, function(e, i) {
                    t.push(i.name)
                }), t
            }(),
            g = {
                preview: function(e) {
                    a.preview(e)
                },
                upload: function(e, t) {
                    var i = {};
                    i[e] = t, a.upload(i)
                },
                pushFile: function() {
                    return a.files = a.files || {}, layui.each(a.chooseFiles, function(e, t) {
                        a.files[e] = t
                    }), a.files
                },
                resetFile: function(e, t, i) {
                    var n = new File([t], i);
                    a.files = a.files || {}, a.files[e] = n
                }
            },
            y = function() {
                if (!(("choose" === i || l.auto) && (l.choose && l.choose(g), "choose" === i) || l.before && l.before(g) === !1)) return o.ie ? o.ie > 9 ? u() : c() : void u()
            };
        if (v = 0 === v.length ? r.value.match(/[^\/\\]+\..+/g) || [] || "" : v, 0 !== v.length) {
            switch (l.accept) {
                case "file":
                    if (h && !RegExp("\\w\\.(" + h + ")$", "i").test(escape(v))) return a.msg("The selected file contains an unsupported format"), r.value = "";
                    break;
                case "video":
                    if (!RegExp("\\w\\.(" + (h || "avi|mp4|wma|rmvb|rm|flash|3gp|flv") + ")$", "i").test(escape(v))) return a.msg("The selected video contains an unsupported format"), r.value = "";
                    break;
                case "audio":
                    if (!RegExp("\\w\\.(" + (h || "mp3|wav|mid") + ")$", "i").test(escape(v))) return a.msg("The selected audio contains an unsupported format"), r.value = "";
                    break;
                default:
                    if (layui.each(v, function(e, t) {
                            RegExp("\\w\\.(" + (h || "jpg|png|gif|bmp|jpeg$") + ")", "i").test(escape(t)) || (n = !0)
                        }), n) return a.msg("The selected image contains an unsupported format"), r.value = ""
            }
            if (a.fileLength = function() {
                    var t = 0,
                        i = e || a.files || a.chooseFiles || r.files;
                    return layui.each(i, function() {
                        t++
                    }), t
                }(), l.number && a.fileLength > l.number) return a.msg("The maximum number that can be uploaded at the same time is:" + l.number);
            if (l.size > 0 && !(o.ie && o.ie < 10)) {
                var F;
                if (layui.each(a.chooseFiles, function(e, t) {
                        if (t.size > 1024 * l.size) {
                            var i = l.size / 1024;
                            i = i >= 1 ? i.toFixed(2) + "MB" : l.size + "KB", r.value = "", F = i
                        }
                    }), F) return a.msg("file cannot exceed " + F)
            }
            y()
        }
    }, p.prototype.reload = function(e) {
        e = e || {}, delete e.elem, delete e.bindAction;
        var i = this,
            e = i.config = t.extend({}, i.config, a.config, e),
            n = e.elem.next();
        n.attr({
            name: e.name,
            accept: e.acceptMime,
            multiple: e.multiple
        })
    }, p.prototype.events = function() {
        var e = this,
            i = e.config,
            a = function(t) {
                e.chooseFiles = {}, layui.each(t, function(t, i) {
                    var n = (new Date).getTime();
                    e.chooseFiles[n + "-" + t] = i
                })
            },
            l = function(t, n) {
                var o = e.elemFile,
                    a = (i.item ? i.item : i.elem, t.length > 1 ? t.length + " files" : (t[0] || {}).name || o[0].value.match(/[^\/\\]+\..+/g) || [] || "");
                o.next().hasClass(s) && o.next().remove(), e.upload(null, "choose"), e.isFile() || i.choose || o.after('<span class="layui-inline ' + s + '">' + a + "</span>")
            };
        i.elem.off("upload.start").on("upload.start", function() {
            var o = t(this),
                a = o.attr("lay-data");
            if (a) try {
                a = new Function("return " + a)(), e.config = t.extend({}, i, a)
            } catch (l) {
                n.error("Upload element property lay-data configuration item has a syntax error: " + a)
            }
            e.config.item = o, e.elemFile[0].click()
        }), o.ie && o.ie < 10 || i.elem.off("upload.over").on("upload.over", function() {
            var e = t(this);
            e.attr("lay-over", "")
        }).off("upload.leave").on("upload.leave", function() {
            var e = t(this);
            e.removeAttr("lay-over")
        }).off("upload.drop").on("upload.drop", function(n, o) {
            var r = t(this),
                u = o.originalEvent.dataTransfer.files || [];
            r.removeAttr("lay-over"), a(u), i.auto ? e.upload(u) : l(u)
        }), e.elemFile.off("upload.change").on("upload.change", function() {
            var t = this.files || [];
            a(t), i.auto ? e.upload() : l(t)
        }), i.bindAction.off("upload.action").on("upload.action", function() {
            e.upload()
        }), i.elem.data("haveEvents") || (e.elemFile.on("change", function() {
            t(this).trigger("upload.change")
        }), i.elem.on("click", function() {
            e.isFile() || t(this).trigger("upload.start")
        }), i.drag && i.elem.on("dragover", function(e) {
            e.preventDefault(), t(this).trigger("upload.over")
        }).on("dragleave", function(e) {
            t(this).trigger("upload.leave")
        }).on("drop", function(e) {
            e.preventDefault(), t(this).trigger("upload.drop", e)
        }), i.bindAction.on("click", function() {
            t(this).trigger("upload.action")
        }), i.elem.data("haveEvents", !0))
    }, a.render = function(e) {
        var t = new p(e);
        return l.call(t)
    }, e(r, a)
});
// colorpicker 重写方法 san
layui.define(["jquery", "lay"], function(e) {
    "use strict";
    var i = layui.jquery,
        r = layui.lay,
        o = layui.device(),
        n = o.mobile ? "click" : "mousedown",
        l = {
            config: {},
            index: layui.colorpicker ? layui.colorpicker.index + 1e4 : 0,
            set: function(e) {
                var r = this;
                return r.config = i.extend({}, r.config, e), r
            },
            on: function(e, i) {
                return layui.onevent.call(this, "colorpicker", e, i)
            }
        },
        t = function() {
            var e = this,
                i = e.config;
            return {
                config: i
            }
        },
        c = "colorpicker",
        a = "layui-show",
        s = "layui-colorpicker",
        f = ".layui-colorpicker-main",
        d = "layui-icon-down",
        u = "layui-icon-close",
        p = "layui-colorpicker-trigger-span",
        g = "layui-colorpicker-trigger-i",
        v = "layui-colorpicker-side",
        h = "layui-colorpicker-side-slider",
        b = "layui-colorpicker-basis",
        k = "layui-colorpicker-alpha-bgcolor",
        y = "layui-colorpicker-alpha-slider",
        m = "layui-colorpicker-basis-cursor",
        x = "layui-colorpicker-main-input",
        ri = "rgbInp",
        ci = "cmykInp",
        he = "hexInp",

        P = function(e) {
            var i = {
                    h: 0,
                    s: 0,
                    b: 0
                },
                r = Math.min(e.r, e.g, e.b),
                o = Math.max(e.r, e.g, e.b),
                n = o - r;
            return i.b = o, i.s = 0 != o ? 255 * n / o : 0, 0 != i.s ? e.r == o ? i.h = (e.g - e.b) / n : e.g == o ? i.h = 2 + (e.b - e.r) / n : i.h = 4 + (e.r - e.g) / n : i.h = -1, o == r && (i.h = 0), i.h *= 60, i.h < 0 && (i.h += 360), i.s *= 100 / 255, i.b *= 100 / 255, i
        },
        C = function(e) {
            var e = e.indexOf("#") > -1 ? e.substring(1) : e;
            if (3 == e.length) {
                var i = e.split("");
                e = i[0] + i[0] + i[1] + i[1] + i[2] + i[2]
            }
            e = parseInt(e, 16);
            var r = {
                r: e >> 16,
                g: (65280 & e) >> 8,
                b: 255 & e 
            };
            return P(r)
        },
        B = function(e) {
            var i = {},
                r = e.h,
                o = 255 * e.s / 100,
                n = 255 * e.b / 100;
            if (0 == o) i.r = i.g = i.b = n;
            else {
                var l = n,
                    t = (255 - o) * n / 255,
                    c = (l - t) * (r % 60) / 60;
                360 == r && (r = 0), r < 60 ? (i.r = l, i.b = t, i.g = t + c) : r < 120 ? (i.g = l, i.b = t, i.r = l - c) : r < 180 ? (i.g = l, i.r = t, i.b = t + c) : r < 240 ? (i.b = l, i.r = t, i.g = l - c) : r < 300 ? (i.b = l, i.g = t, i.r = t + c) : r < 360 ? (i.r = l, i.g = t, i.b = l - c) : (i.r = 0, i.g = 0, i.b = 0)
            }
            return {
                r: Math.round(i.r),
                g: Math.round(i.g),
                b: Math.round(i.b)
            }
        },
        w = function(e) {
            var r = B(e),
                o = [r.r.toString(16), r.g.toString(16), r.b.toString(16)];
            return i.each(o, function(e, i) {
                1 == i.length && (o[e] = "0" + i)
            }), o.join("")
        },
        D = function(e) {
            var i = /[0-9]{1,3}/g,
                r = e.match(i) || [];
            return {
                r: r[0],
                g: r[1],
                b: r[2]
            }
        },
        j = i(window),
        E = i(document),
        F = function(e) {
            var r = this;
            r.index = ++l.index, r.config = i.extend({}, r.config, l.config, e), r.render()
        };
    F.prototype.config = {
        color: "",
        size: null,
        alpha: !1,
        format: "hex",
        predefine: !1,
        colors: ["#009688", "#5FB878", "#1E9FFF", "#FF5722", "#FFB800", "#01AAED", "#999", "#c00", "#ff8c00", "#ffd700", "#90ee90", "#00ced1", "#1e90ff", "#c71585", "rgb(0, 186, 189)", "rgb(255, 120, 0)", "rgb(250, 212, 0)", "#393D49", "rgba(0,0,0,.5)", "rgba(255, 69, 0, 0.68)", "rgba(144, 240, 144, 0.5)", "rgba(31, 147, 255, 0.73)"]
    }, F.prototype.render_bakSan = function() {
        var e = this,
            r = e.config,
            o = i(['<div bd="0" class="layui-unselect layui-colorpicker">', "<span " + ("rgb" == r.format && r.alpha ? 'class="layui-colorpicker-trigger-bgcolor"' : "") + ">", '<span class="layui-colorpicker-trigger-span" ', 'lay-type="' + ("rgb" == r.format ? r.alpha ? "rgba" : "torgb" : "") + '" ', 'style="' + function() {
                var e = "";
                return r.color ? (e = r.color, (r.color.match(/[0-9]{1,3}/g) || []).length > 3 && (r.alpha && "rgb" == r.format || (e = "#" + w(P(D(r.color))))), "background: " + e) : e
            }() + '">', '<i class="layui-icon layui-colorpicker-trigger-i ' + (r.color ? d : u) + '"></i>', "</span>", "</span>", "</div>"].join("")),
            n = i(r.elem);
        r.size && o.addClass("layui-colorpicker-" + r.size), n.addClass("layui-inline").html(e.elemColorBox = o), e.color = e.elemColorBox.find("." + p)[0].style.background, e.events()
    
    }, F.prototype.render = function() {
        var e = this,
            r = e.config,
            o = i(['<div bd="1" class="layui-unselect layui-colorpicker">', "<span " + ("rgb" == r.format && r.alpha ? 'class="layui-colorpicker-trigger-bgcolor"' : "") + ">", '<span class="layui-colorpicker-trigger-span" ', 'lay-type="' + ("rgb" == r.format ? r.alpha ? "rgba" : "torgb" : "") + '" ', 'style="' + function() {
                var e = "";
                return r.color ? (e = r.color, (r.color.match(/[0-9]{1,3}/g) || []).length > 3 && (r.alpha && "rgb" == r.format || (e = "#" + w(P(D(r.color))))), "background: " + e) : e
            }() + '">', '<i class="layui-icon  layui-icon-addition  layui-colorpicker-trigger2-i ' + (r.color ? d : u) + '"></i>', "</span>", "</span>", "</div>"].join("")),
            
            n = i(r.elem);

        r.size && o.addClass("layui-colorpicker-" + r.size), n.addClass("layui-inline").html(e.elemColorBox = o), e.color = e.elemColorBox.find("." + p)[0].style.background, e.events()
    
    }, F.prototype.renderPicker = function() {
        var inputColor = '<div class="inputColorBox colored">';

            inputColor += '   <div class="rowLine colored">';
            inputColor += '       <div class="layui-inline colored">';
            inputColor += '           <label class="layui-form-label colorLabel colored">R</label>';
            inputColor += '           <input type="number" name="color_R" min="0" max="255" value="255" autocomplete="off" class="layui-input colored rgbInp" tabIndex="3000">';
            inputColor += '       </div>';
            inputColor += '       <div class="layui-inline colored">';
            inputColor += '           <label class="layui-form-label colorLabel colored">C</label>';
            inputColor += '           <input type="number" name="color_C" min="0" max="100" value="0" class="layui-input colored cmykInp" tabIndex="3003">';
            inputColor += '       </div>';
            inputColor += '   </div>';

            inputColor += '   <div class="rowLine colored">';
            inputColor += '       <div class="layui-inline colored">';
            inputColor += '           <label class="layui-form-label colorLabel colored">G</label>';
            inputColor += '           <input type="number" name="color_G" min="0" max="255" value="255" autocomplete="off" class="layui-input colored rgbInp" tabIndex="3001">';
            inputColor += '       </div>';
            inputColor += '       <div class="layui-inline colored">';
            inputColor += '           <label class="layui-form-label colorLabel colored">M</label>';
            inputColor += '           <input type="number" name="color_M" min="0" max="100" value="0" autocomplete="off" class="layui-input colored cmykInp" tabIndex="3004">';
            inputColor += '       </div>';
            inputColor += '   </div>';

            inputColor += '   <div class="rowLine colored">';
            inputColor += '       <div class="layui-inline colored">';
            inputColor += '           <label class="layui-form-label colorLabel colored">B</label>';
            inputColor += '           <input type="number" name="color_B" min="0" max="255" value="255" autocomplete="off" class="layui-input colored rgbInp" tabIndex="3002">';
            inputColor += '       </div>';
            inputColor += '       <div class="layui-inline colored">';
            inputColor += '           <label class="layui-form-label colorLabel colored">Y</label>';
            inputColor += '           <input type="number" name="color_Y" min="0" max="100" value="0" autocomplete="off" class="layui-input colored cmykInp" tabIndex="3005">';
            inputColor += '       </div>';
            inputColor += '   </div>';

            inputColor += '   <div class="rowLine colored">';
            inputColor += '       <div class="layui-inline colored">';
            inputColor += '           <label class="layui-form-label colorLabel colored">#</label>';
            inputColor += '           <input type="text" name="color_Hex" value="ffffff" placeholder="Hex" maxlength="6" autocomplete="off" class="layui-input colored hexInp"  tabIndex="3007">';
            inputColor += '       </div>';
            inputColor += '       <div class="layui-inline colored">';
            inputColor += '           <label class="layui-form-label colorLabel colored">K</label>';
            inputColor += '           <input type="number" name="color_K" min="0" max="100" value="0" autocomplete="off" class="layui-input colored cmykInp" tabIndex="3006">';
            inputColor += '       </div>';
            inputColor += '   </div>';


            inputColor += '<div class="layui-btn-container colored">';
            inputColor += '   <button class="layui-btn layui-btn-primary layui-btn-sm colored" colorpicker-events="clear">Clear</button>';
            inputColor += '   <button class="layui-btn layui-btn-sm colored" colorpicker-events="confirm">Confirm</button>';
            inputColor += '</div>';

            inputColor += '</div>';
        var e = this,
            r = e.config,
            o = e.elemColorBox[0],
            n = e.elemPicker = i(['<div bd="2" id="layui-colorpicker' + e.index + '" data-index="' + e.index + '" class="layui-anim layui-anim-downbit layui-colorpicker-main colored">', '<div class="pickerPager colored" >Color Picker</div><div class="colorPickerBox"><div class="layui-colorpicker-main-wrapper">', '<div class="layui-colorpicker-basis">', '<div class="layui-colorpicker-basis-white"></div>', '<div class="layui-colorpicker-basis-black"></div>', '<div class="layui-colorpicker-basis-cursor"></div>', "</div></div>" + inputColor, '<div class="layui-colorpicker-side">', '<div class="layui-colorpicker-side-slider"></div>', "</div>", "</div>", '<div class="layui-colorpicker-main-alpha ' + (r.alpha ? a : "") + '">', '<div class="layui-colorpicker-alpha-bgcolor">', '<div class="layui-colorpicker-alpha-slider"></div>', "</div>", "</div>", function() {
                if (r.predefine) {
                    var e = ['<div class="layui-colorpicker-main-pre">'];
                    return layui.each(r.colors, function(i, r) {
                        e.push(['<div class="layui-colorpicker-pre' + ((r.match(/[0-9]{1,3}/g) || []).length > 3 ? " layui-colorpicker-pre-isalpha" : "") + '">', '<div style="background:' + r + '"></div>', "</div>"].join(""))
                    }), e.push("</div>"), e.join("")
                }
                return ""
            }(), '<div class="layui-colorpicker-main-input">', '<div class="layui-inline">', '<input type="text" class="layui-input colored">', "</div>", '<div class="layui-btn-container colored">', '<button class="layui-btn layui-btn-primary layui-btn-sm colored" colorpicker-events="clear">Clear</button>', '<button class="layui-btn layui-btn-sm colored" colorpicker-events="confirm">Confirm</button>', "</div", "</div>", "</div>"].join(""));
        e.elemColorBox.find("." + p)[0];
        i(f)[0] && i(f).data("index") == e.index ? e.removePicker(F.thisElemInd) : (e.removePicker(F.thisElemInd), i("body").append(n)), F.thisElemInd = e.index, F.thisColor = o.style.background, e.position(), e.pickerEvents()
    }, F.prototype.removePicker = function(e) {
        var r = this;
        r.config;
        return i("#layui-colorpicker" + (e || r.index)).remove(), r
    }, F.prototype.position = function() {
        var e = this,
            i = e.config;
        return r.position(e.bindElem || e.elemColorBox[0], e.elemPicker[0], {
            position: i.position,
            align: "center"
        }), e
    }, F.prototype.val = function() {
        var e = this,
            i = (e.config, e.elemColorBox.find("." + p)),
            r = e.elemPicker.find("." + x),
            o = i[0],
            n = o.style.backgroundColor;
        if (n) {
            var l = P(D(n)),
                t = i.attr("lay-type");
            if (e.select(l.h, l.s, l.b), "torgb" === t && r.find("input").val(n), "rgba" === t) {
                var c = D(n);
                if (3 == (n.match(/[0-9]{1,3}/g) || []).length) r.find("input").val("rgba(" + c.r + ", " + c.g + ", " + c.b + ", 1)"), e.elemPicker.find("." + y).css("left", 280);
                else {
                    r.find("input").val(n);
                    var a = 295 * n.slice(n.lastIndexOf(",") + 1, n.length - 1);
                    e.elemPicker.find("." + y).css("left", a)
                }
                e.elemPicker.find("." + k)[0].style.background = "linear-gradient(to right, rgba(" + c.r + ", " + c.g + ", " + c.b + ", 0), rgb(" + c.r + ", " + c.g + ", " + c.b + "))"
            }
        } else e.select(0, 100, 100), r.find("input").val(""), e.elemPicker.find("." + k)[0].style.background = "", e.elemPicker.find("." + y).css("left", 295)
    }, F.prototype.side = function() {
        var e = this,
            r = e.config,
            o = e.elemColorBox.find("." + p),
            n = o.attr("lay-type"),
            l = e.elemPicker.find("." + v),
            t = e.elemPicker.find("." + h),
            c = e.elemPicker.find("." + b),
            a = e.elemPicker.find("." + m),
            s = e.elemPicker.find("." + k),
            f = e.elemPicker.find("." + y),
            C = t[0].offsetTop / 250 * 360,
            w = 100 - (a[0].offsetTop + 3) / 250 * 100,
            E = (a[0].offsetLeft + 3) / 280 * 100,
            F = Math.round(f[0].offsetLeft / 295 * 100) / 100,

            H = e.elemColorBox.find("." + g),
            M = e.elemPicker.find(".layui-colorpicker-pre").children("div"),
            Y = function(i, l, t, c) {
                e.select(i, l, t);
                var a = B({
                    h: i,
                    s: l,
                    b: t
                });
                if (H.addClass(d).removeClass(u), o[0].style.background = "rgb(" + a.r + ", " + a.g + ", " + a.b + ")", "torgb" === n && e.elemPicker.find("." + x).find("input").val("rgb(" + a.r + ", " + a.g + ", " + a.b + ")"), "rgba" === n) {
                    var p = 0;
                    p = 295 * c, f.css("left", p), e.elemPicker.find("." + x).find("input").val("rgba(" + a.r + ", " + a.g + ", " + a.b + ", " + c + ")"), o[0].style.background = "rgba(" + a.r + ", " + a.g + ", " + a.b + ", " + c + ")", s[0].style.background = "linear-gradient(to right, rgba(" + a.r + ", " + a.g + ", " + a.b + ", 0), rgb(" + a.r + ", " + a.g + ", " + a.b + "))"
                
                }
                r.change && r.change(e.elemPicker.find("." + x).find("input").val());

                var newColor=e.elemPicker.find("." + x).find("input").val();
                var tmpColor=change_colorPicker(newColor,"","");
                var cmykColor=tmpColor.cmykColor;
                r.change && r.change(e.elemPicker.find("input[name=color_C]").val(cmykColor.c),e.elemPicker.find("input[name=color_M]").val(cmykColor.m),e.elemPicker.find("input[name=color_Y]").val(cmykColor.y),e.elemPicker.find("input[name=color_K]").val(cmykColor.k),e.elemPicker.find("input[name=color_Hex]").val(newColor),e.elemPicker.find("input[name=color_R]").val(a.r),e.elemPicker.find("input[name=color_G]").val(a.g),e.elemPicker.find("input[name=color_B]").val(a.b));
                
            },
            I = i(['<div class="layui-auxiliar-moving" id="LAY-colorpicker-moving"></div>'].join("")),
            L = function(e) {
                i("#LAY-colorpicker-moving")[0] || i("body").append(I), I.on("mousemove", e), I.on("mouseup", function() {
                    I.remove()
                }).on("mouseleave", function() {
                    I.remove()
                })
            };
        t.on("mousedown", function(e) {
            var i = this.offsetTop,
                r = e.clientY,
                o = function(e) {
                    var o = i + (e.clientY - r),
                        n = l[0].offsetHeight;
                    o < 0 && (o = 0), o > n && (o = n);
                    var t = o / 250 * 360;
                    C = t, Y(t, E, w, F), e.preventDefault()
                };
            L(o), e.preventDefault()
        }), l.on("click", function(e) {
            var r = e.clientY - i(this).offset().top;
            r < 0 && (r = 0), r > this.offsetHeight && (r = this.offsetHeight);
            var o = r / 250 * 360;
            C = o, Y(o, E, w, F), e.preventDefault()
        }), a.on("mousedown", function(e) {
            var i = this.offsetTop,
                r = this.offsetLeft,
                o = e.clientY,
                n = e.clientX,
                l = function(e) {
                    var l = i + (e.clientY - o),
                        t = r + (e.clientX - n),
                        a = c[0].offsetHeight - 3,
                        s = c[0].offsetWidth - 3;
                    l < -3 && (l = -3), l > a && (l = a), t < -3 && (t = -3), t > s && (t = s);
                    var f = (t + 3) / 280 * 100,
                        d = 100 - (l + 3) / 250 * 100;
                    w = d, E = f, Y(C, f, d, F), e.preventDefault()


                };
            layui.stope(e), L(l), e.preventDefault()
        }), c.on("mousedown", function(e) {
            var r = e.clientY - i(this).offset().top - 3 + j.scrollTop(),
                o = e.clientX - i(this).offset().left - 3 + j.scrollLeft();
            r < -3 && (r = -3), r > this.offsetHeight - 3 && (r = this.offsetHeight - 3), o < -3 && (o = -3), o > this.offsetWidth - 3 && (o = this.offsetWidth - 3);
            var n = (o + 3) / 280 * 100,
                l = 100 - (r + 3) / 250 * 100;
            w = l, E = n, Y(C, n, l, F), layui.stope(e), e.preventDefault(), a.trigger(e, "mousedown")      

        }), f.on("mousedown", function(e) {
            var i = this.offsetLeft,
                r = e.clientX,
                o = function(e) {
                    var o = i + (e.clientX - r),
                        n = s[0].offsetWidth;
                    o < 0 && (o = 0), o > n && (o = n);
                    var l = Math.round(o / 295 * 100) / 100;
                    var l = Math.round(o / 295 * 100) / 100;
                    F = l, Y(C, E, w, l), e.preventDefault()

                };
            L(o), e.preventDefault()
        }), s.on("click", function(e) {
            var r = e.clientX - i(this).offset().left;
            r < 0 && (r = 0), r > this.offsetWidth && (r = this.offsetWidth);
            var o = Math.round(r / 295 * 100) / 100;
            F = o, Y(C, E, w, o), e.preventDefault()
        }), M.each(function() {
            i(this).on("click", function() {
                i(this).parent(".layui-colorpicker-pre").addClass("selected").siblings().removeClass("selected");
                var e, r = this.style.backgroundColor,
                    o = P(D(r)),
                    n = r.slice(r.lastIndexOf(",") + 1, r.length - 1);
                C = o.h, E = o.s, w = o.b, 3 == (r.match(/[0-9]{1,3}/g) || []).length && (n = 1), F = n, e = 295 * n, Y(o.h, o.s, o.b, n)
            })
        })
    }, F.prototype.select = function(e, i, r, o) {
        var n = this,
            l = (n.config, w({
                h: e,
                s: 100,
                b: 100
            })),
            t = w({
                h: e,
                s: i,
                b: r
            }),
            c = e / 360 * 250,
            a = 250 - r / 100 * 250 - 3,
            s = i / 100 * 280 - 3;
        n.elemPicker.find("." + h).css("top", c), n.elemPicker.find("." + b)[0].style.background = "#" + l, n.elemPicker.find("." + m).css({
            top: a,
            left: s
        }), "change" !== o && n.elemPicker.find("." + x).find("input").val("#" + t)
    }, F.prototype.pickerEvents = function() {
        var e = this,
            r = e.config,
            o = e.elemColorBox.find("." + p),
            n = e.elemPicker.find("." + x + " input"),
            // rgb input box
            rinput=e.elemPicker.find("."+ri),
            // cmyk input box
            cinput=e.elemPicker.find("."+ci),
            // hex input box
            hexInput=e.elemPicker.find("."+he),
            l = {
                clear: function(i) {
                    o[0].style.background = "", e.elemColorBox.find("." + g).removeClass(d).addClass(u), e.color = "", r.done && r.done("",""), e.removePicker()
                },
                confirm: function(i, l) {
                    var t = n.val(),
                        c = t,
                        a = {};

                    //改造原Hex输入框为隐藏，采用自定义Hex输入框并做歉容处理    
                    if (t=="" || t==null || t==undefined){
                        t=hexInput.val();
                    }

                    if (t.indexOf(",") > -1) {
                        if (a = P(D(t)), e.select(a.h, a.s, a.b), o[0].style.background = c = "#" + w(a), (t.match(/[0-9]{1,3}/g) || []).length > 3 && "rgba" === o.attr("lay-type")) {
                            var s = 295 * t.slice(t.lastIndexOf(",") + 1, t.length - 1);
                            e.elemPicker.find("." + y).css("left", s), o[0].style.background = t, c = t
                        }
                    } else a = C(t), o[0].style.background = c = "#" + w(a), e.elemColorBox.find("." + g).removeClass(u).addClass(d); 
                    var tmpColor={};
                        tmpColor.rgb=e.elemPicker.find("input[name=color_R]").val() + "," + e.elemPicker.find("input[name=color_G]").val() + "," + e.elemPicker.find("input[name=color_B]").val();
                        tmpColor.cmyk=e.elemPicker.find("input[name=color_C]").val() + "," + e.elemPicker.find("input[name=color_M]").val() + "," +  e.elemPicker.find("input[name=color_Y]").val() + ","  +  e.elemPicker.find("input[name=color_K]").val();
                    
                    return "change" === l ? (e.select(a.h, a.s, a.b, l), void(r.change && r.change(c))) : (e.color = t, r.done && r.done(t,tmpColor), void e.removePicker())
                
                }
            };
        e.elemPicker.on("click", "*[colorpicker-events]", function() {
            var e = i(this),
                r = e.attr("colorpicker-events");
            l[r] && l[r].call(this, e)
        }), n.on("keyup", function(e) {
            var r = i(this);
            l.confirm.call(this, r, 13 === e.keyCode ? null : "change")
            
        }), hexInput.on("keyup", function(e) {
            var r = i(this);
            var allowChars=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','A','B','C','D','E','F'];
            var theVal=this.value;

            if (theVal.length>0){

                var newChar='';
                for (var k=0;k<theVal.length;k++){
                    if (allowChars.indexOf(theVal.charAt(k))>-1){
                        newChar=newChar + theVal.charAt(k);
                    }
                }
                this.value=newChar;
                theVal=newChar;

                if (theVal.length==6){

                    var p3=i(this).parents().parents().parents();
                    var tmpColor=change_colorPicker("#"+theVal,"","");
                    var cmykColor=tmpColor.cmykColor;
                    var rgbColor=tmpColor.rgbColor;

                    //write cmyk/rgb input box
                    if (tmpColor.hexColor!="" && tmpColor.hexColor!=null){

                        //通过原colorPicker的输入框change事件触发左边色版点选位更新
                        n.val(tmpColor.hexColor);
                        if (tmpColor.hexColor.substr(0,1)=="#"){
                            tmpColor.hexColor=tmpColor.hexColor.substr(1,tmpColor.hexColor.length-1);
                        }
                    }

                    p3.find("input[name=color_R]").val(rgbColor.r);
                    p3.find("input[name=color_G]").val(rgbColor.g);
                    p3.find("input[name=color_B]").val(rgbColor.b);

                    p3.find("input[name=color_C]").val(cmykColor.c);
                    p3.find("input[name=color_M]").val(cmykColor.m);
                    p3.find("input[name=color_Y]").val(cmykColor.y);
                    p3.find("input[name=color_K]").val(cmykColor.k);

                    l.confirm.call(this, r, 13 === e.keyCode ? null : "change")
                }
                
            }
        
        }), rinput.on("keyup", function(e) {
            var r = i(this);
            this.value=this.value.replace(/[^\d]/g,'');
            if (this.value*1<0){
                this.value=0;
            }else if (this.value*1>255){
                this.value=255;
            }

            var p3=i(this).parents().parents().parents();
            var _r=p3.find("input[name=color_R]").val();
            var _g=p3.find("input[name=color_G]").val();
            var _b=p3.find("input[name=color_B]").val();

            if (_r!="" && _g!="" && _b!=""){

                var newColor=_r + "," + _g + "," + _b;
                var tmpColor=change_colorPicker("",newColor,"");
                var cmykColor=tmpColor.cmykColor;

                //write cmyk/hex input box
                if (tmpColor.hexColor!="" && tmpColor.hexColor!=null){

                    //通过原colorPicker的输入框change事件触发左边色版点选位更新
                    n.val(tmpColor.hexColor);
                    if (tmpColor.hexColor.substr(0,1)=="#"){
                        tmpColor.hexColor=tmpColor.hexColor.substr(1,tmpColor.hexColor.length-1);
                    }                   
                }
                p3.find("input[name=color_Hex]").val(tmpColor.hexColor);
                p3.find("input[name=color_C]").val(cmykColor.c);
                p3.find("input[name=color_M]").val(cmykColor.m);
                p3.find("input[name=color_Y]").val(cmykColor.y);
                p3.find("input[name=color_K]").val(cmykColor.k);

                l.confirm.call(this, r, 13 === e.keyCode ? null : "change")
            }

        }), cinput.on("keyup", function(e) {
            var r = i(this);
            this.value=this.value.replace(/[^\d]/g,'');
            if (this.value*1<0){
                this.value=0;
            }else if (this.value*1>100){
                this.value=100;
            }

            var p3=i(this).parents().parents().parents();
            var _c=p3.find("input[name=color_C]").val();
            var _m=p3.find("input[name=color_M]").val();
            var _y=p3.find("input[name=color_Y]").val();
            var _k=p3.find("input[name=color_K]").val();

            if (_c!="" && _m!="" && _y!="" && _k!=""){

                var newColor=_c + "," + _m + "," + _y + "," + _k;
                var tmpColor=change_colorPicker("","",newColor);
                var rgbColor=tmpColor.rgbColor;

                //write rgb/hex input box
                if (tmpColor.hexColor!="" && tmpColor.hexColor!=null){

                    //通过原colorPicker的输入框change事件触发左边色版点选位更新
                    n.val(tmpColor.hexColor);
                    if (tmpColor.hexColor.substr(0,1)=="#"){
                        tmpColor.hexColor=tmpColor.hexColor.substr(1,tmpColor.hexColor.length-1);
                    }   
                }
                p3.find("input[name=color_Hex]").val(tmpColor.hexColor);
                p3.find("input[name=color_R]").val(rgbColor.r);
                p3.find("input[name=color_G]").val(rgbColor.g);
                p3.find("input[name=color_B]").val(rgbColor.b);

                l.confirm.call(this, r, 13 === e.keyCode ? null : "change")
            }

        })
    }, F.prototype.events = function() {
        var e = this,
            r = e.config,
            o = e.elemColorBox.find("." + p);
        e.elemColorBox.on("click", function() {
            e.renderPicker(), i(f)[0] && (e.val(), e.side())
        }), r.elem[0] && !e.elemColorBox[0].eventHandler && (E.on(n, function(r) {
            if (!i(r.target).hasClass(s) && !i(r.target).parents("." + s)[0] && !i(r.target).hasClass(f.replace(/\./g, "")) && !i(r.target).parents(f)[0] && e.elemPicker) {
                if (e.color) {
                    var n = P(D(e.color));
                    e.select(n.h, n.s, n.b)
                } else e.elemColorBox.find("." + g).removeClass(d).addClass(u);
                o[0].style.background = e.color || "", e.removePicker()
            }
        }), j.on("resize", function() {
            return !(!e.elemPicker || !i(f)[0]) && void e.position()
        }), e.elemColorBox[0].eventHandler = !0)
    }, l.render = function(e) {
        var i = new F(e);
        return t.call(i)
    }, e(c, l)
});
// 该处不可删除，用于修正载入错误
layui.__proto__.cache.status.fixed = true;