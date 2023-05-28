/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingTemplate/configDesignFrame
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'table', 'layer','form'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,table = layui.table
        ,form = layui.form
        ,layer = layui.layer;

    var current_id = getUrlRelativePath(4);
    var storage = layui.data(setter.tableName);

    var config = [];

    var _JC=parent._JC;
    var canvasPages=_JC.canvasConfig.canvasPages;
    var pageOption=_JC.canvasConfig.pageOption;

    if (isEmpty(canvasPages)==false){
        var _zIndex=1;
        for (var i=0;i<canvasPages.length;i++){

            var tmpConfig=canvasPages[i];
            var _textThaiPages=tmpConfig.textThaiPages;
            for (var j=0;j<_textThaiPages.length;j++){

                config.push({
                    page: _textThaiPages[j],
                    slice:(j+1),
                    dPage: (tmpConfig.drawCanvas + 1),
                    index: _zIndex,
                });
                _zIndex++;
            }

        }

    }else{
        layer.msg("无效数据！");
        return;
    }


    function getConfigDesignFrameList(){

        table.render({
            id: 'configDesignFrameTable'
            ,elem: '#content-configDesignFrame-list'
            ,loading: true
            ,even: true
            ,height:'430'
            ,data: config
            ,headers: {'Authorization': 'Bearer ' + storage.access_token}
            ,defaultToolbar: false
            ,cols: [[
                {field:'slice', minWidth: 60, title: 'Slice' }
                ,{field:'dPage', minWidth: 100, title: 'Design Frame' }
                ,{field:'page',title: 'TextThai Page', edit: 'text' }
            ]],
            page: false,
            renderAfter: function() {
                permission.render();
            }
        });
    }

    getConfigDesignFrameList();
    setDesignFrameAfter(pageOption);

    //生成DesignFrame 预览图
    function setDesignFrameAfter(dPage){
        $("#pageOption").html(dPage);
        var _Html='';
        switch (dPage)
        {
            case "1":
                _Html='<tr><td class="slice-1">Slice 1</td></tr>';
            break;
            case "2LR":
                _Html='<tr><td class="slice-2LR">Slice 1</td><td class="slice-2LR">Slice 2</td></tr>';
            break;      
            case "2TB":
                _Html='<tr><td class="slice-2LR">Slice 1</td></tr><tr><td class="slice-2LR">Slice 2</td></tr>';
            break;
            case "4LRTB":
                _Html='<tr><td class="slice-2LR">Slice 1</td><td class="slice-2LR">Slice 2</td></tr>';
                _Html=_Html + '<tr><td class="slice-2LR">Slice 3</td><td class="slice-2LR">Slice 4</td></tr>';
            break;            
        }
        $("#sampleTable").html(_Html);
    }

});