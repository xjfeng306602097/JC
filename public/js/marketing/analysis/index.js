/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingAnalysis/index
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer', 'dropdown', 'element'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer
        ,dropdown = layui.dropdown
        ,element = layui.element;
    
    var storage = layui.data(setter.tableName);

    var current_mmCode = '',// 选中的MM，为空则为分析全部（总览）
        current_tabItem = 'panel';

    // 监听左侧子菜单点击
    dropdown.on('click(analysisMenu)', function(options){
        if (current_mmCode != options.mmCode) {
            current_mmCode = options.mmCode;
            // current_tabItem = 'panel';
            // element.tabChange('analysisTab', current_tabItem);
            loadPage();
        }
    });

    // 监听tab切换，切换iframe的页面
    element.on('tab(analysisTab)', function() {
        current_tabItem = this.getAttribute('lay-id');
        loadPage();
    });

    loadPage();

    // 载入MM列表
    var current_filter = {
        title: '',
        status: 6,
        page: 1,
        limit: Number.MAX_SAFE_INTEGER,
    };
    window.mmList = [];
    function loadMarketingList() {
        AjaxRequest({
            url: getApiUrl('marketing.activity.page'),
            method: getApiMethod('marketing.activity.page'),
            data: JSON.stringify(current_filter),
            headers: {
                "Content-Type": "application/json",
            },
            loading: true,
            success: function(result) {
                if (result.code === "0000") {
                    var _html = '';
                    var list = result.data.records;
                    if (current_filter.title == '') {
                        window.mmList = list;
                    }
                    for (var x in list) {
                        var checked = list[x].mmCode == current_mmCode ? 'class="layui-menu-item-checked"' : '';
                        _html += '<li lay-options="{id: ' + list[x].id + ', mmCode: \'' + list[x].mmCode + '\'}" ' + checked + '><div class="layui-menu-body-title">' + list[x].title + '</div></li>';
                    }
                    $('#mmMenu').html(_html);
                    if (current_filter.title != '' && list.length == 0) {
                        $('.analysis-menu-search .search-empty').addClass('layui-show');
                    } else {
                        $('.analysis-menu-search .search-empty').removeClass('layui-show');
                    }
                } else {
                    layer.msg(result.msg);
                }
            }
        });
    }
    loadMarketingList();

    // 载入分析页面
    function loadPage() {
        var url = '/makroDigital/marketingAnalysis/' + current_tabItem + '/' + current_mmCode;
        $('.analysis-page').attr('src', url);
    }

    // 监听搜索MM
    $('#searchMM').change(function() {
        var value = $(this).val();
        if (value != '') {
            current_filter.title = value;
            loadMarketingList();
        }
    });
    $('#searchMM').on("input propertychange",function(){
        if ($(this).val() == '') {
            current_filter.title = '';
            loadMarketingList();
        }
    });
    
});