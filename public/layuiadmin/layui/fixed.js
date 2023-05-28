// 丢弃原模块
layui.disuse(["upload", "colorpicker"]);
// upload 重新对上传模块进行载入，修正上传时提示的是中文
layui.define("layer", function(e) {
    "use strict";
    var v = layui.$,
        t = layui.layer,
        r = layui.hint(),
        y = layui.device(),
        i = {
            config: {},
            set: function(e) {
                var t = this;
                return t.config = v.extend({}, t.config, e), t
            },
            on: function(e, t) {
                return layui.onevent.call(this, n, e, t)
            }
        },
        n = "upload",
        o = "layui-upload-file",
        a = "layui-upload-form",
        F = "layui-upload-iframe",
        b = "layui-upload-choose",
        x = function(e) {
            var t = this;
            t.config = v.extend({}, t.config, i.config, e), t.render()
        };
    x.prototype.config = {
        accept: "images",
        exts: "",
        auto: !0,
        bindAction: "",
        url: "",
        force: "",
        field: "file",
        acceptMime: "",
        method: "post",
        data: {},
        drag: !0,
        size: 0,
        number: 0,
        multiple: !1
    }, x.prototype.render = function(e) {
        var t = this;
        (e = t.config).elem = v(e.elem), e.bindAction = v(e.bindAction), t.file(), t.events()
    }, x.prototype.file = function() {
        var e = this,
            t = e.config,
            i = e.elemFile = v(['<input class="' + o + '" type="file" accept="' + t.acceptMime + '" name="' + t.field + '"', t.multiple ? " multiple" : "", ">"].join("")),
            n = t.elem.next();
        (n.hasClass(o) || n.hasClass(a)) && n.remove(), y.ie && y.ie < 10 && t.elem.wrap('<div class="layui-upload-wrap"></div>'), e.isFile() ? (e.elemFile = t.elem, t.field = t.elem[0].name) : t.elem.after(i), y.ie && y.ie < 10 && e.initIE()
    }, x.prototype.initIE = function() {
        var i, e = this.config,
            t = v('<iframe id="' + F + '" class="' + F + '" name="' + F + '" frameborder="0"></iframe>'),
            n = v(['<form target="' + F + '" class="' + a + '" method="post" key="set-mine" enctype="multipart/form-data" action="' + e.url + '">', "</form>"].join(""));
        v("#" + F)[0] || v("body").append(t), e.elem.next().hasClass(a) || (this.elemFile.wrap(n), e.elem.next("." + a).append((i = [], layui.each(e.data, function(e, t) {
            t = "function" == typeof t ? t() : t, i.push('<input type="hidden" name="' + e + '" value="' + t + '">')
        }), i.join(""))))
    }, x.prototype.msg = function(e) {
        return t.msg(e, {
            icon: 2,
            shift: 6
        })
    }, x.prototype.isFile = function() {
        var e = this.config.elem[0];
        if (e) return "input" === e.tagName.toLocaleLowerCase() && "file" === e.type
    }, x.prototype.preview = function(n) {
        window.FileReader && layui.each(this.chooseFiles, function(e, t) {
            var i = new FileReader;
            i.readAsDataURL(t), i.onload = function() {
                n && n(e, t, this.result)
            }
        })
    }, x.prototype.upload = function(i, e) {
        var n, o, t, a, l = this,
            r = l.config,
            u = l.elemFile[0],
            c = function() {
                var t = 0,
                    o = 0,
                    e = i || l.files || l.chooseFiles || u.files,
                    a = function() {
                        r.multiple && t + o === l.fileLength && "function" == typeof r.allDone && r.allDone({
                            total: l.fileLength,
                            successful: t,
                            failed: o
                        })
                    };
                layui.each(e, function(i, e) {
                    var n = new FormData,
                        e = (n.append(r.field, e), layui.each(r.data, function(e, t) {
                            t = "function" == typeof t ? t() : t, n.append(e, t)
                        }), {
                            url: r.url,
                            type: "post",
                            data: n,
                            contentType: !1,
                            processData: !1,
                            dataType: "json",
                            headers: r.headers || {},
                            success: function(e) {
                                t++, f(i, e), a()
                            },
                            error: function(e) {
                                o++, l.msg("Request URL is abnormal: " + (e.statusText || "error")), p(i), a()
                            }
                        });
                    "function" == typeof r.progress && (e.xhr = function() {
                        var e = v.ajaxSettings.xhr();
                        return e.upload.addEventListener("progress", function(e) {
                            var t;
                            e.lengthComputable && (t = Math.floor(e.loaded / e.total * 100), r.progress(t, (r.item || r.elem)[0], e, i))
                        }), e
                    }), v.ajax(e)
                })
            },
            s = function() {
                var n = v("#" + F);
                l.elemFile.parent().submit(), clearInterval(x.timer), x.timer = setInterval(function() {
                    var e, t = n.contents().find("body");
                    try {
                        e = t.text()
                    } catch (i) {
                        l.msg("Cross-domain requests are not supported"), clearInterval(x.timer), p()
                    }
                    e && (clearInterval(x.timer), t.html(""), f(0, e))
                }, 30)
            },
            f = function(e, t) {
                if (l.elemFile.next("." + b).remove(), u.value = "", "json" === r.force && "object" != typeof t) try {
                    t = JSON.parse(t)
                } catch (i) {
                    return t = {}, l.msg("Please return JSON data format")
                }
                "function" == typeof r.done && r.done(t, e || 0, function(e) {
                    l.upload(e)
                })
            },
            p = function(e) {
                r.auto && (u.value = ""), "function" == typeof r.error && r.error(e || 0, function(e) {
                    l.upload(e)
                })
            },
            d = r.exts,
            m = (o = [], layui.each(i || l.chooseFiles, function(e, t) {
                o.push(t.name)
            }), o),
            h = {
                preview: function(e) {
                    l.preview(e)
                },
                upload: function(e, t) {
                    var i = {};
                    i[e] = t, l.upload(i)
                },
                pushFile: function() {
                    return l.files = l.files || {}, layui.each(l.chooseFiles, function(e, t) {
                        l.files[e] = t
                    }), l.files
                },
                resetFile: function(e, t, i) {
                    t = new File([t], i);
                    l.files = l.files || {}, l.files[e] = t
                }
            },
            g = {
                file: "file",
                images: "image",
                video: "video",
                audio: "audio"
            }[r.accept] || "file",
            m = 0 === m.length ? u.value.match(/[^\/\\]+\..+/g) || [] || "" : m;
        if (0 !== m.length) {
            switch (r.accept) {
                case "file":
                    layui.each(m, function(e, t) {
                        if (d && !RegExp(".\\.(" + d + ")$", "i").test(escape(t))) return n = !0
                    });
                    break;
                case "video":
                    layui.each(m, function(e, t) {
                        if (!RegExp(".\\.(" + (d || "avi|mp4|wma|rmvb|rm|flash|3gp|flv") + ")$", "i").test(escape(t))) return n = !0
                    });
                    break;
                case "audio":
                    layui.each(m, function(e, t) {
                        if (!RegExp(".\\.(" + (d || "mp3|wav|mid") + ")$", "i").test(escape(t))) return n = !0
                    });
                    break;
                default:
                    layui.each(m, function(e, t) {
                        if (!RegExp(".\\.(" + (d || "jpg|png|gif|bmp|jpeg") + ")$", "i").test(escape(t))) return n = !0
                    })
            }
            if (n) return l.msg("The selected " + g + " contains an unsupported format"), u.value = "";
            if ("choose" !== e && !r.auto || (r.choose && r.choose(h), "choose" !== e)) {
                if (l.fileLength = (t = 0, g = i || l.files || l.chooseFiles || u.files, layui.each(g, function() {
                        t++
                    }), t), r.number && l.fileLength > r.number) return l.msg("At most: " + r.number + " files can be uploaded at the same time<br>You have selected: " + l.fileLength + " files");
                if (0 < r.size && !(y.ie && y.ie < 10))
                    if (layui.each(l.chooseFiles, function(e, t) {
                            t.size > 1024 * r.size && (t = 1 <= (t = r.size / 1024) ? t.toFixed(2) + "MB" : r.size + "KB", u.value = "", a = t)
                        }), a) return l.msg("File size cannot exceed " + a);
                if (!r.before || !1 !== r.before(h)) y.ie ? (9 < y.ie ? c : s)() : c()
            }
        }
    }, x.prototype.reload = function(e) {
        delete(e = e || {}).elem, delete e.bindAction;
        (e = this.config = v.extend({}, this.config, i.config, e)).elem.next().attr({
            name: e.name,
            accept: e.acceptMime,
            multiple: e.multiple
        })
    }, x.prototype.events = function() {
        var n = this,
            o = n.config,
            a = function(e) {
                n.chooseFiles = {}, layui.each(e, function(e, t) {
                    var i = (new Date).getTime();
                    n.chooseFiles[i + "-" + e] = t
                })
            },
            l = function(e, t) {
                var i = n.elemFile,
                    e = (o.item || o.elem, 1 < e.length ? e.length + " files" : (e[0] || {}).name || i[0].value.match(/[^\/\\]+\..+/g) || [] || "");
                i.next().hasClass(b) && i.next().remove(), n.upload(null, "choose"), n.isFile() || o.choose || i.after('<span class="layui-inline ' + b + '">' + e + "</span>")
            };
        o.elem.off("upload.start").on("upload.start", function() {
            var e = v(this),
                t = e.attr("lay-data");
            if (t) try {
                t = new Function("return " + t)(), n.config = v.extend({}, o, t)
            } catch (i) {
                r.error("Upload element property lay-data configuration item has a syntax error: " + t)
            }
            n.config.item = e, n.elemFile[0].click()
        }), y.ie && y.ie < 10 || o.elem.off("upload.over").on("upload.over", function() {
            v(this).attr("lay-over", "")
        }).off("upload.leave").on("upload.leave", function() {
            v(this).removeAttr("lay-over")
        }).off("upload.drop").on("upload.drop", function(e, t) {
            var i = v(this),
                t = t.originalEvent.dataTransfer.files || [];
            i.removeAttr("lay-over"), a(t), o.auto ? n.upload() : l(t)
        }), n.elemFile.off("upload.change").on("upload.change", function() {
            var e = this.files || [];
            a(e), o.auto ? n.upload() : l(e)
        }), o.bindAction.off("upload.action").on("upload.action", function() {
            n.upload()
        }), o.elem.data("haveEvents") || (n.elemFile.on("change", function() {
            v(this).trigger("upload.change")
        }), o.elem.on("click", function() {
            n.isFile() || v(this).trigger("upload.start")
        }), o.drag && o.elem.on("dragover", function(e) {
            e.preventDefault(), v(this).trigger("upload.over")
        }).on("dragleave", function(e) {
            v(this).trigger("upload.leave")
        }).on("drop", function(e) {
            e.preventDefault(), v(this).trigger("upload.drop", e)
        }), o.bindAction.on("click", function() {
            v(this).trigger("upload.action")
        }), o.elem.data("haveEvents", !0))
    }, i.render = function(e) {
        e = new x(e);
        return function() {
            var t = this;
            return {
                upload: function(e) {
                    t.upload.call(t, e)
                },
                reload: function(e) {
                    t.reload.call(t, e)
                },
                config: t.config
            }
        }.call(e)
    }, e(n, i)
});
// colorpicker
layui.define(["jquery", "lay"], function(e) {
    "use strict";
    var k = layui.jquery,
        n = layui.lay,
        r = layui.device().mobile ? "click" : "mousedown",
        l = {
            config: {},
            index: layui.colorpicker ? layui.colorpicker.index + 1e4 : 0,
            set: function(e) {
                var i = this;
                return i.config = k.extend({}, i.config, e), i
            },
            on: function(e, i) {
                return layui.onevent.call(this, "colorpicker", e, i)
            }
        },
        t = "layui-colorpicker",
        c = ".layui-colorpicker-main",
        y = "layui-icon-down",
        x = "layui-icon-close",
        P = "layui-colorpicker-trigger-span",
        C = "layui-colorpicker-trigger-i",
        B = "layui-colorpicker-side-slider",
        w = "layui-colorpicker-basis",
        D = "layui-colorpicker-alpha-bgcolor",
        j = "layui-colorpicker-alpha-slider",
        E = "layui-colorpicker-basis-cursor",
        F = "layui-colorpicker-main-input",
        H = function(e) {
            var i = {
                    h: 0,
                    s: 0,
                    b: 0
                },
                o = Math.min(e.r, e.g, e.b),
                r = Math.max(e.r, e.g, e.b),
                n = r - o;
            return i.b = r, i.s = 0 != r ? 255 * n / r : 0, 0 != i.s ? e.r == r ? i.h = (e.g - e.b) / n : e.g == r ? i.h = 2 + (e.b - e.r) / n : i.h = 4 + (e.r - e.g) / n : i.h = -1, r == o && (i.h = 0), i.h *= 60, i.h < 0 && (i.h += 360), i.s *= 100 / 255, i.b *= 100 / 255, i
        },
        M = function(e) {
            var i, o = {},
                r = e.h,
                n = 255 * e.s / 100,
                e = 255 * e.b / 100;
            return 0 == n ? o.r = o.g = o.b = e : (e = r % 60 * ((i = e) - (n = (255 - n) * e / 255)) / 60, (r = 360 == r ? 0 : r) < 60 ? (o.r = i, o.b = n, o.g = n + e) : r < 120 ? (o.g = i, o.b = n, o.r = i - e) : r < 180 ? (o.g = i, o.r = n, o.b = n + e) : r < 240 ? (o.b = i, o.r = n, o.g = i - e) : r < 300 ? (o.b = i, o.g = n, o.r = n + e) : r < 360 ? (o.r = i, o.g = n, o.b = i - e) : (o.r = 0, o.g = 0, o.b = 0)), {
                r: Math.round(o.r),
                g: Math.round(o.g),
                b: Math.round(o.b)
            }
        },
        f = function(e) {
            var e = M(e),
                o = [e.r.toString(16), e.g.toString(16), e.b.toString(16)];
            return k.each(o, function(e, i) {
                1 == i.length && (o[e] = "0" + i)
            }), o.join("")
        },
        Y = function(e) {
            e = e.match(/[0-9]{1,3}/g) || [];
            return {
                r: e[0],
                g: e[1],
                b: e[2]
            }
        },
        I = k(window),
        a = k(document),
        s = function(e) {
            this.index = ++l.index, this.config = k.extend({}, this.config, l.config, e), this.render()
        };
    s.prototype.config = {
        color: "",
        size: null,
        alpha: !1,
        format: "hex",
        predefine: !1,
        colors: ["#009688", "#5FB878", "#1E9FFF", "#FF5722", "#FFB800", "#01AAED", "#999", "#c00", "#ff8c00", "#ffd700", "#90ee90", "#00ced1", "#1e90ff", "#c71585", "rgb(0, 186, 189)", "rgb(255, 120, 0)", "rgb(250, 212, 0)", "#393D49", "rgba(0,0,0,.5)", "rgba(255, 69, 0, 0.68)", "rgba(144, 240, 144, 0.5)", "rgba(31, 147, 255, 0.73)"]
    }, s.prototype.render = function() {
        var e = this,
            i = e.config,
            o = k(i.elem);
        if (1 < o.length) return layui.each(o, function() {
            l.render(k.extend({}, i, {
                elem: this
            }))
        }), e;
        k.extend(i, n.options(o[0]));
        var o = k(['<div class="layui-unselect layui-colorpicker">', "<span " + ("rgb" == i.format && i.alpha ? 'class="layui-colorpicker-trigger-bgcolor"' : "") + ">", '<span class="layui-colorpicker-trigger-span" ', 'lay-type="' + ("rgb" == i.format ? i.alpha ? "rgba" : "torgb" : "") + '" ', 'style="' + (o = "", i.color ? (o = i.color, 3 < (i.color.match(/[0-9]{1,3}/g) || []).length && (i.alpha && "rgb" == i.format || (o = "#" + f(H(Y(i.color))))), "background: " + o) : o) + '">', '<i class="layui-icon layui-colorpicker-trigger-i ' + (i.color ? y : x) + '"></i>', "</span>", "</span>", "</div>"].join("")),
            r = i.elem = k(i.elem);
        i.size && o.addClass("layui-colorpicker-" + i.size), r.addClass("layui-inline").html(e.elemColorBox = o), e.color = e.elemColorBox.find("." + P)[0].style.background, e.events()
    }, s.prototype.renderPicker = function() {
        var o, e = this,
            i = e.config,
            r = e.elemColorBox[0],
            i = e.elemPicker = k(['<div id="layui-colorpicker' + e.index + '" data-index="' + e.index + '" class="layui-anim layui-anim-downbit layui-colorpicker-main">', '<div class="layui-colorpicker-main-wrapper">', '<div class="layui-colorpicker-basis">', '<div class="layui-colorpicker-basis-white"></div>', '<div class="layui-colorpicker-basis-black"></div>', '<div class="layui-colorpicker-basis-cursor"></div>', "</div>", '<div class="layui-colorpicker-side">', '<div class="layui-colorpicker-side-slider"></div>', "</div>", "</div>", '<div class="layui-colorpicker-main-alpha ' + (i.alpha ? "layui-show" : "") + '">', '<div class="layui-colorpicker-alpha-bgcolor">', '<div class="layui-colorpicker-alpha-slider"></div>', "</div>", "</div>", i.predefine ? (o = ['<div class="layui-colorpicker-main-pre">'], layui.each(i.colors, function(e, i) {
                o.push(['<div class="layui-colorpicker-pre' + (3 < (i.match(/[0-9]{1,3}/g) || []).length ? " layui-colorpicker-pre-isalpha" : "") + '">', '<div style="background:' + i + '"></div>', "</div>"].join(""))
            }), o.push("</div>"), o.join("")) : "", '<div class="layui-colorpicker-main-input">', '<div class="layui-inline">', '<input type="text" class="layui-input" style="width: 120px;">', "</div>", '<div class="layui-btn-container">', '<button class="layui-btn layui-btn-primary layui-btn-sm" colorpicker-events="clear">Clear</button>', '<button class="layui-btn layui-btn-sm" colorpicker-events="confirm">Confirm</button>', "</div", "</div>", "</div>"].join(""));
        e.elemColorBox.find("." + P)[0];
        k(c)[0] && k(c).data("index") == e.index ? e.removePicker(s.thisElemInd) : (e.removePicker(s.thisElemInd), k("body").append(i)), s.thisElemInd = e.index, s.thisColor = r.style.background, e.position(), e.pickerEvents()
    }, s.prototype.removePicker = function(e) {
        this.config;
        return k("#layui-colorpicker" + (e || this.index)).remove(), this
    }, s.prototype.position = function() {
        var e = this,
            i = e.config;
        return n.position(e.bindElem || e.elemColorBox[0], e.elemPicker[0], {
            position: i.position,
            align: "center"
        }), e
    }, s.prototype.val = function() {
        var e, i = this,
            o = (i.config, i.elemColorBox.find("." + P)),
            r = i.elemPicker.find("." + F),
            n = o[0].style.backgroundColor;
        n ? (e = H(Y(n)), o = o.attr("lay-type"), i.select(e.h, e.s, e.b), "torgb" === o && r.find("input").val(n), "rgba" === o && (e = Y(n), 3 == (n.match(/[0-9]{1,3}/g) || []).length ? (r.find("input").val("rgba(" + e.r + ", " + e.g + ", " + e.b + ", 1)"), i.elemPicker.find("." + j).css("left", 280)) : (r.find("input").val(n), o = 280 * n.slice(n.lastIndexOf(",") + 1, n.length - 1), i.elemPicker.find("." + j).css("left", o)), i.elemPicker.find("." + D)[0].style.background = "linear-gradient(to right, rgba(" + e.r + ", " + e.g + ", " + e.b + ", 0), rgb(" + e.r + ", " + e.g + ", " + e.b + "))")) : (i.select(0, 100, 100), r.find("input").val(""), i.elemPicker.find("." + D)[0].style.background = "", i.elemPicker.find("." + j).css("left", 280))
    }, s.prototype.side = function() {
        var n = this,
            l = n.config,
            t = n.elemColorBox.find("." + P),
            c = t.attr("lay-type"),
            a = n.elemPicker.find(".layui-colorpicker-side"),
            e = n.elemPicker.find("." + B),
            s = n.elemPicker.find("." + w),
            r = n.elemPicker.find("." + E),
            d = n.elemPicker.find("." + D),
            f = n.elemPicker.find("." + j),
            u = e[0].offsetTop / 180 * 360,
            p = 100 - (r[0].offsetTop + 3) / 180 * 100,
            g = (r[0].offsetLeft + 3) / 260 * 100,
            h = Math.round(f[0].offsetLeft / 280 * 100) / 100,
            v = n.elemColorBox.find("." + C),
            i = n.elemPicker.find(".layui-colorpicker-pre").children("div"),
            b = function(e, i, o, r) {
                n.select(e, i, o);
                e = M({
                    h: e,
                    s: i,
                    b: o
                });
                v.addClass(y).removeClass(x), t[0].style.background = "rgb(" + e.r + ", " + e.g + ", " + e.b + ")", "torgb" === c && n.elemPicker.find("." + F).find("input").val("rgb(" + e.r + ", " + e.g + ", " + e.b + ")"), "rgba" === c && (f.css("left", 280 * r), n.elemPicker.find("." + F).find("input").val("rgba(" + e.r + ", " + e.g + ", " + e.b + ", " + r + ")"), t[0].style.background = "rgba(" + e.r + ", " + e.g + ", " + e.b + ", " + r + ")", d[0].style.background = "linear-gradient(to right, rgba(" + e.r + ", " + e.g + ", " + e.b + ", 0), rgb(" + e.r + ", " + e.g + ", " + e.b + "))"), l.change && l.change(n.elemPicker.find("." + F).find("input").val())
            },
            o = k(['<div class="layui-auxiliar-moving" id="LAY-colorpicker-moving"></div>'].join("")),
            m = function(e) {
                k("#LAY-colorpicker-moving")[0] || k("body").append(o), o.on("mousemove", e), o.on("mouseup", function() {
                    o.remove()
                }).on("mouseleave", function() {
                    o.remove()
                })
            };
        e.on("mousedown", function(e) {
            var r = this.offsetTop,
                n = e.clientY;
            m(function(e) {
                var i = r + (e.clientY - n),
                    o = a[0].offsetHeight,
                    o = (i = o < (i = i < 0 ? 0 : i) ? o : i) / 180 * 360;
                b(u = o, g, p, h), e.preventDefault()
            }), e.preventDefault()
        }), a.on("click", function(e) {
            var i = e.clientY - k(this).offset().top,
                i = (i = (i = i < 0 ? 0 : i) > this.offsetHeight ? this.offsetHeight : i) / 180 * 360;
            b(u = i, g, p, h), e.preventDefault()
        }), r.on("mousedown", function(e) {
            var l = this.offsetTop,
                t = this.offsetLeft,
                c = e.clientY,
                a = e.clientX;
            layui.stope(e), m(function(e) {
                var i = l + (e.clientY - c),
                    o = t + (e.clientX - a),
                    r = s[0].offsetHeight - 3,
                    n = s[0].offsetWidth - 3,
                    n = ((o = n < (o = o < -3 ? -3 : o) ? n : o) + 3) / 260 * 100,
                    o = 100 - ((i = r < (i = i < -3 ? -3 : i) ? r : i) + 3) / 180 * 100;
                b(u, g = n, p = o, h), e.preventDefault()
            }), e.preventDefault()
        }), s.on("mousedown", function(e) {
            var i = e.clientY - k(this).offset().top - 3 + I.scrollTop(),
                o = e.clientX - k(this).offset().left - 3 + I.scrollLeft(),
                o = ((i = i < -3 ? -3 : i) > this.offsetHeight - 3 && (i = this.offsetHeight - 3), ((o = (o = o < -3 ? -3 : o) > this.offsetWidth - 3 ? this.offsetWidth - 3 : o) + 3) / 260 * 100),
                i = 100 - (i + 3) / 180 * 100;
            b(u, g = o, p = i, h), layui.stope(e), e.preventDefault(), r.trigger(e, "mousedown")
        }), f.on("mousedown", function(e) {
            var r = this.offsetLeft,
                n = e.clientX;
            m(function(e) {
                var i = r + (e.clientX - n),
                    o = d[0].offsetWidth,
                    o = (o < (i = i < 0 ? 0 : i) && (i = o), Math.round(i / 280 * 100) / 100);
                b(u, g, p, h = o), e.preventDefault()
            }), e.preventDefault()
        }), d.on("click", function(e) {
            var i = e.clientX - k(this).offset().left,
                i = ((i = i < 0 ? 0 : i) > this.offsetWidth && (i = this.offsetWidth), Math.round(i / 280 * 100) / 100);
            b(u, g, p, h = i), e.preventDefault()
        }), i.each(function() {
            k(this).on("click", function() {
                k(this).parent(".layui-colorpicker-pre").addClass("selected").siblings().removeClass("selected");
                var e = this.style.backgroundColor,
                    i = H(Y(e)),
                    o = e.slice(e.lastIndexOf(",") + 1, e.length - 1);
                u = i.h, g = i.s, p = i.b, 3 == (e.match(/[0-9]{1,3}/g) || []).length && (o = 1), h = o, b(i.h, i.s, i.b, o)
            })
        })
    }, s.prototype.select = function(e, i, o, r) {
        var n = this,
            l = (n.config, f({
                h: e,
                s: 100,
                b: 100
            })),
            t = f({
                h: e,
                s: i,
                b: o
            }),
            e = e / 360 * 180,
            o = 180 - o / 100 * 180 - 3,
            i = i / 100 * 260 - 3;
        n.elemPicker.find("." + B).css("top", e), n.elemPicker.find("." + w)[0].style.background = "#" + l, n.elemPicker.find("." + E).css({
            top: o,
            left: i
        }), "change" !== r && n.elemPicker.find("." + F).find("input").val("#" + t)
    }, s.prototype.pickerEvents = function() {
        var c = this,
            a = c.config,
            s = c.elemColorBox.find("." + P),
            d = c.elemPicker.find("." + F + " input"),
            o = {
                clear: function(e) {
                    s[0].style.background = "", c.elemColorBox.find("." + C).removeClass(y).addClass(x), c.color = "", a.done && a.done(""), c.removePicker()
                },
                confirm: function(e, i) {
                    var o, r, n = d.val(),
                        l = n,
                        t = {};
                    if (-1 < n.indexOf(",") ? (t = H(Y(n)), c.select(t.h, t.s, t.b), s[0].style.background = l = "#" + f(t), 3 < (n.match(/[0-9]{1,3}/g) || []).length && "rgba" === s.attr("lay-type") && (o = 280 * n.slice(n.lastIndexOf(",") + 1, n.length - 1), c.elemPicker.find("." + j).css("left", o), l = s[0].style.background = n)) : (3 == (o = -1 < (o = n).indexOf("#") ? o.substring(1) : o).length && (o = (r = o.split(""))[0] + r[0] + r[1] + r[1] + r[2] + r[2]), r = {
                            r: (o = parseInt(o, 16)) >> 16,
                            g: (65280 & o) >> 8,
                            b: 255 & o
                        }, t = H(r), s[0].style.background = l = "#" + f(t), c.elemColorBox.find("." + C).removeClass(x).addClass(y)), "change" === i) return c.select(t.h, t.s, t.b, i), void(a.change && a.change(l));
                    c.color = n, a.done && a.done(n), c.removePicker()
                }
            };
        c.elemPicker.on("click", "*[colorpicker-events]", function() {
            var e = k(this),
                i = e.attr("colorpicker-events");
            o[i] && o[i].call(this, e)
        }), d.on("keyup", function(e) {
            var i = k(this);
            o.confirm.call(this, i, 13 === e.keyCode ? null : "change")
        })
    }, s.prototype.events = function() {
        var i = this,
            e = i.config,
            o = i.elemColorBox.find("." + P);
        i.elemColorBox.on("click", function() {
            i.renderPicker(), k(c)[0] && (i.val(), i.side())
        }), e.elem[0] && !i.elemColorBox[0].eventHandler && (a.on(r, function(e) {
            k(e.target).hasClass(t) || k(e.target).parents("." + t)[0] || k(e.target).hasClass(c.replace(/\./g, "")) || k(e.target).parents(c)[0] || i.elemPicker && (i.color ? (e = H(Y(i.color)), i.select(e.h, e.s, e.b)) : i.elemColorBox.find("." + C).removeClass(y).addClass(x), o[0].style.background = i.color || "", i.removePicker())
        }), I.on("resize", function() {
            if (!i.elemPicker || !k(c)[0]) return !1;
            i.position()
        }), i.elemColorBox[0].eventHandler = !0)
    }, l.render = function(e) {
        e = new s(e);
        return function() {
            return {
                config: this.config
            }
        }.call(e)
    }, e("colorpicker", l)
});
// 该处不可删除，用于修正载入错误
layui.__proto__.cache.status.fixed = true;