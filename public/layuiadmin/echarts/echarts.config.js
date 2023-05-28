// 颜色分组
var colorGroup = {
    // 默认
    default: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
    // macarons主题颜色
    macarons: ['#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80', '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa', '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050', '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'],
    // 排行
    rank: ['#893448', '#d95850', '#eb8146', '#ffb248', '#f2d643'],
    // 渠道
    channel: ['#f9757c', '#f8a268', '#a6dd41', '#55d18e', '#77cbfb', '#9da6fb'],
    // 客户类型
    customerType: ['#4ea397', '#22c3aa', '#7bd9a5', '#d0648a', '#f58db2', '#f2b3c9'],
    // 会员类型
    memberType: ['#c629fb', '#2d4e90', '#fb38a3', '#f8792f', '#5afe29', '#5fd878', '#fec743', '#0a61fa'],
    // 发布类型
    publishType: ['#82b6e9', '#ff6347', '#0a915d', '#eaf889', '#ff6666'],
    // 客户端类型
    device: ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8'],
    // 蓝色全色系
    blue: ['#c5cfeb', '#8c9fd8', '#5470c6', '#384a84', '#1c2542', '#e52322'],
    // blue: [getLightColor('#5470c6', 0.666), getLightColor('#5470c6', 0.333), '#5470c6', getDarkColor('#5470c6', 0.333), getDarkColor('#5470c6', 0.666)]
};
console.log('color', colorGroup);

function hexToRgb(str) {
    var r = /^#?[0-9a-fA-F]{6}$/;
    //test方法检查在字符串中是否存在一个模式，如果存在则返回true，否则返回false
    if (!r.test(str)) {
        console.error('错误的HEX颜色值', str);
        return;
    }
    //replace替换查找的到的字符串
    str = str.replace("#", "");
    //match得到查询数组
    var hxs = str.match(/../g);
    for (var i = 0; i < 3; i++) {
        hxs[i] = parseInt(hxs[i], 16);
    }
    return hxs;
}
//RGB颜色转Hex颜色
function rgbToHex(a, b, c) {
    var r = /^\d{1,3}$/;
    if (!r.test(a) || !r.test(b) || !r.test(c)) {
        console.error('错误的RGB颜色值', [a, b, c]);
        return;
    }
    var hexs = [a.toString(16), b.toString(16), c.toString(16)];
    for (var i = 0; i < 3; i++) {
        if (hexs[i].length == 1) hexs[i] = "0" + hexs[i];
    }
    return "#" + hexs.join("");
}
//得到hex颜色值为color的加深颜色值，level为加深的程度，限0-1之间
function getDarkColor(color, level) {
    var r = /^#?[0-9a-fA-F]{6}$/;
    if (!r.test(color)) {
        console.error('错误的HEX颜色值', color);
        return;
    }
    var rgbc = hexToRgb(color);
    //floor 向下取整
    for (var i = 0; i < 3; i++) {
        rgbc[i] = Math.floor(rgbc[i] * (1 - level));
    }
    return rgbToHex(rgbc[0], rgbc[1], rgbc[2]);
}
//得到hex颜色值为color的减淡颜色值，level为加深的程度，限0-1之间
function getLightColor(color, level) {
    var r = /^#?[0-9a-fA-F]{6}$/;
    if (!r.test(color)) {
        console.error('错误的HEX颜色值', color);
        return;
    }
    var rgbc = hexToRgb(color);
    for (var i = 0; i < 3; i++) {
        rgbc[i] = Math.floor((255 - rgbc[i]) * level + rgbc[i]);
    }
    return rgbToHex(rgbc[0], rgbc[1], rgbc[2]);
}