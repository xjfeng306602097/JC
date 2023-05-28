/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroAdmin/productPrice/index
    
 */
 
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'form', 'laydate', 'table', 'layer'], function(){
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,form = layui.form
        ,laydate = layui.laydate
        ,table = layui.table
        ,layer = layui.layer;
    
    var storage = layui.data(setter.tableName);
    
    var current_param = getUrlRelativePath(4);
    
    var itemCode = '';
    
    var current_itemCode = '',
        current_mmCode = '';
    if (current_param) {
	    var _arr = current_param.split(',');
	    // console.log(_arr);
        
	    current_itemCode = itemCode = _arr[0],
		current_mmCode = _arr[1];
	}
    form.val('productPriceSearch', {
        itemCode: itemCode,
    });
    
    function getProductPriceList(){
		table.render({
		    id: 'productPriceTable'
			,elem: '#content-productPrice-list'
			,loading: true
			,even: true
			,url: getApiUrl('product.price.page')
			,method: getApiMethod('product.price.page')
			,headers: {'Authorization': 'Bearer ' + storage.access_token}
			,toolbar: true
            ,toolbar: '#productPriceToolbar'
			,defaultToolbar: ['filter','exports']
            ,parseData: function(res) {
                if (res.code==="0000"){
                    return {
                        code: 0,
                        count: res.data.total,
                        data: res.data.records
                    }
                }
            }
			,cols: [[
                {width: 200, title: '', templet: '#content-productPrice-list-operate' }
                ,{width: 80, title: 'Serial', type: 'numbers' }
				,{field:'itemcode', width: 140, title: 'Item Code' }
				,{field:'storecode', width: 140, title: 'Store Code' }
				,{field:'normalprice', width: 140, title: 'Normal Price' }
				,{field:'promoprice', width: 140, title: 'Promotion Price' }
				,{field:'id', width: 280, title: 'ID', sort: true }
			]],
			where:{
			    itemCode: current_itemCode,
			},
			page: true,
			limit: 10,
			limits: [10, 20, 30, 50, 100, 150, 200],
            renderAfter: function() {
                permission.render();
            }
		});
	}
	
	getProductPriceList();
	
	// 搜索
	form.on('submit(LAY-productPrice-front-search)', function(obj) {
		var field = JSON.stringify(obj.field);
		var result = JSON.parse(field);

        current_itemCode = result.itemCode;
		getProductPriceList();
	});
    // 重置搜索
    form.on('submit(LAY-productPrice-front-reset)', function(obj) {
        form.val('productPriceSearch', {
            itemCode: itemCode,
        });
        form.render();
        current_itemCode = itemCode;
        getProductPriceList();
    });
	
	//头工具栏事件
    table.on('toolbar(content-productPrice-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch(obj.event){
        case "new":
            var index_page = layer.open({
    			type: 2
    			,title: 'Add Product Price'
    			,id: 'addData'
    			,content: '/makroDigital/productPrice/add/' + itemCode
    			,maxmin: true
    			,area: ['600px', '480px']
    			,btn: ['Submit', 'Cancel']
    			,yes: function(index, layero){
    				var iframeWindow = window['layui-layer-iframe' + index],
    					submitID = 'LAY-productPrice-add-submit',
    					submit = layero.find('iframe').contents().find('#'+ submitID);
    
    				// 监听提交
    				iframeWindow.layui.form.on('submit(' + submitID + ')', function(obj) {
    					var field = JSON.stringify(obj.field);
    					var result = JSON.parse(field);
                        
    					var mydata = {
                            "storecode": result.storecode,
    						"itemcode": result.itemcode,
    						"normalprice": result.normalprice,
    						"promoprice": result.promoprice,
    						"isvalid": "1",
    					};
    					
    					// console.log(mydata);
    					$.ajax({
    						url: getApiUrl('product.price.add'),
    						type: getApiMethod('product.price.add'),
    						data: JSON.stringify(mydata),
    						headers: {
							    "Content-Type": "application/json",
							    "Authorization": 'Bearer ' + storage.access_token
							},
    						success: function(result) {
    							if (result.code === "0000") {
    								table.reload('productPriceTable'); //数据刷新
    								layer.msg(result.msg);
    
    								layer.close(index_page); //关闭弹层
    							} else {
    								layer.msg(result.msg);
    							}
    						}
    					});
    				});
    				submit.trigger('click');
    			}
    		});
            break;
        }
    });
});