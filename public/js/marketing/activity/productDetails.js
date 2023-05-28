/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingTemplate/add
    
 */
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'form', 'laydate', 'layer','table'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,layer = layui.layer
        ,table=layui.table
        ,laydate = layui.laydate
        ,form = layui.form;
    
    var productDetails;
    
    //获取当前商品数据    
    loadDetails();  
    
    function loadDetails(){
        //productDetails=parent.mmDetailsData[parent._JC.cunterPage][parent._JC.cunterObj.dSort];
        var _pD=parent._JC.cunterObj.dSort;
        if (isEmpty(_pD)){
            layer.msg("None Data 1");
            return;
        }
        var _pDArr=_pD.split("-");
        productDetails=parent.mmDetailsData[_pDArr[0]*1-1][_pDArr[1]];

        console.log(productDetails);

        var classify=parent.classify;
        
        var filedValue=[];
        for (var v in productDetails){
            filedValue[v]=productDetails[v];
        }
        console.log(filedValue);
        var _Html='';
        for (var i = 0; i < classify.length; i++) {
            _Html=_Html + '<dl>';
            _Html=_Html + ' <dt>'+classify[i].name+'</dt>';

            if (classify[i].name!="LinkItem"){
                for (var j = classify[i].label.length-1; j >= 0; j--) {
                    _Html=_Html + ' <dd>';
                    _Html=_Html + '     <div class="dataFiled-Title">'+classify[i].label[j].name+':</div>';
                    
                    var _tmpValue=filedValue[classify[i].label[j].value];
                    _tmpValue=(_tmpValue==null)?'-':_tmpValue;
                    _tmpValue=(typeof(_tmpValue)=="object")?'Y':_tmpValue;
                    
                    _Html=_Html + '     <div class="dataFiled-content">'+_tmpValue+'</div>';
                    _Html=_Html + ' </dd>';
                    
                }
            }else{

                var tmpLinkItems=productDetails.linkItems;
                if (isEmpty(tmpLinkItems)==false){

                    for (var p =0;p<tmpLinkItems.length;p++){  
                        _Html=_Html + '     <dd style="width:100%;font-weight:600;" >Sort '+(p+1)+'</dd>';
                        for (var j = classify[i].label.length-1; j >= 0; j--) {
                            var _tmpValue=tmpLinkItems[p][classify[i].label[j].value];

                            _Html=_Html + ' <dd>';
                            _Html=_Html + '     <div class="dataFiled-Title">'+classify[i].label[j].name+':</div>';

                            //_tmpValue=(_tmpValue==null)?'-':_tmpValue;
                            _tmpValue=(isEmpty(_tmpValue)==true)?'-':_tmpValue;
                            _tmpValue=(typeof(_tmpValue)=="object")?'Y':_tmpValue;
                            
                            _Html=_Html + '     <div class="dataFiled-content">'+_tmpValue+'</div>';
                            _Html=_Html + ' </dd>';



                        }

                    }
                }

                /*
                for (var j = classify[i].label.length-1; j >= 0; j--) {
                    _Html=_Html + ' <dd>';
                    _Html=_Html + '     <div class="dataFiled-Title">'+classify[i].label[j].name+':</div>';

                    if (_tmpValue)
                    
                    _Html=_Html + '     <div class="dataFiled-content">'+_tmpValue+'</div>';
                    _Html=_Html + ' </dd>';
                    
                }
                */

            }
            _Html=_Html + '</dl>';
        }
        
        $(".detailsBox").html(_Html);
    }



    function loadDetails_copy(){
        //productDetails=parent.mmDetailsData[parent._JC.cunterPage][parent._JC.cunterObj.dSort];
        var _pD=parent._JC.cunterObj.dSort;
        if (isEmpty(_pD)){
            layer.msg("None Data 1");
            return;
        }
        var _pDArr=_pD.split("-");
        productDetails=parent.mmDetailsData[_pDArr[0]*1-1][_pDArr[1]];

        console.log(productDetails);

        var classify=parent.classify;
        
        var filedValue=[];
        for (var v in productDetails){
            filedValue[v]=productDetails[v];
        }
        
        var _Html='';
        for (var i = 0; i < classify.length; i++) {
            _Html=_Html + '<dl>';
            _Html=_Html + ' <dt>'+classify[i].name+'</dt>';

            for (var j = classify[i].label.length-1; j >= 0; j--) {
                _Html=_Html + ' <dd>';
                _Html=_Html + '     <div class="dataFiled-Title">'+classify[i].label[j].name+':</div>';
                
                var _tmpValue=filedValue[classify[i].label[j].value];
                _tmpValue=(_tmpValue==null)?'-':_tmpValue;
                _tmpValue=(typeof(_tmpValue)=="object")?'Y':_tmpValue;
                
                _Html=_Html + '     <div class="dataFiled-content">'+_tmpValue+'</div>';
                _Html=_Html + ' </dd>';
                
            }
            
            _Html=_Html + '</dl>';
        }
        
        $(".detailsBox").html(_Html);
    }    
    
    window.loadDetails= function(){
       loadDetails();
    };
    
});