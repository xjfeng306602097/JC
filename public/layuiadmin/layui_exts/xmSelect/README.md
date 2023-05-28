xmSelect使用方法

1. 引入 `dist/xm-select.js`
2. 写一个`<div id="demo1"></div>`
3. js渲染
var demo1 = xmSelect.render({
	el: '#demo1', 
	data: [
		{name: '水果', value: 1, selected: true, disabled: true},
		{name: '蔬菜', value: 2, selected: true},
		{name: '桌子', value: 3, disabled: true},
		{name: '北京', value: 4},
	],
});