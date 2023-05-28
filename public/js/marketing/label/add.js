/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingLabel/add
    
 */

layui.config({
	base: '../../layuiadmin/' //静态资源所在路径
}).extend({
	index: 'lib/index' //主入口模块
}).use(['index', 'layer', 'form', 'dict'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,form = layui.form
        ,dict = layui.dict;
    
    var storage = layui.data(setter.tableName);

    // 渲染选择器
    dict.render([
        // label分类
        { elem: 'select[name="classify"]', dictCode: 'label_classify', value: '' },
        // label类型
        { elem: 'select[name="type"]', dictCode: 'label_type', value: '' },
    ]);

});