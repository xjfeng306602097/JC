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

    var url = layui.url();
    var mmCode = '';
    if (!!url.search.mmCode) {
        mmCode = url.search.mmCode;
    }

    var config = [];
    var textThaiPages;

    if (!!url.search.pages) {

        if (url.search.pages!=''){

            var pagesArr=(url.search.pages).split(",");
            pagesArr.sort((a,b)=>{return a-b});
            //根据TextThai page从小从到排序
            textThaiPages=pagesArr;

        }
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
    
    // 监听头部工具栏
    table.on('toolbar(content-configDesignFrame-list)', function(obj){
        var checkStatus = table.checkStatus(obj.config.id); //获取选中行状态
        var data = checkStatus.data;  //获取选中行数据
        
        switch (obj.event) {
            // 添加
            case 'add':
                ++maxPage;
                config.push({
                    page: maxPage,
                    sort: 1,
                    dPage: '',
                    index: configIndex,
                });
                ++configIndex;
                getConfigDesignFrameList();
                break;
            // 删除
            case 'delete':
                if (data.length==0) {
                    layer.msg("Select one record");
                } else {
                    deleteConfigByIndex(data[0].index);
                    getConfigDesignFrameList();
                }
                break;

        }
    });

    table.on('edit(content-configDesignFrame-list)', function(obj) {
        var data = obj.data;
        var value = obj.value;
        var originalValue = $(this).prev().text();// 修改之前的值
        if (obj.field == 'page' || obj.field == 'dPage') {
            if (value !== '' && (!IsNumber(value) || value < 1)) {
                obj.tr.find('td[data-field="' + obj.field + '"] input').val(originalValue);
                obj.data[obj.field] = originalValue;
                obj.update(obj.data);
                return;
            }
            // console.log(obj)

        } else if (obj.field == 'sort') {
            if (value == '' || !IsNumber(value) || value < 1) {
                obj.tr.find('td[data-field="' + obj.field + '"] input').val(originalValue);
                obj.data[obj.field] = originalValue;
                obj.update(obj.data);
                return;
            }

        }
    });

    //切换Design Frame
    form.on('select(cutoverOption)', function (data) {
        setDesignFrameAfter();
        arrangeConfigData();
    });

    function deleteConfigByIndex(index) {
        config.splice(index, 1);
        var max = 1;
        for (var i in config) {
            config[i].index = parseInt(i);
            if (config[i].page > max) {
                max = config[i].page;
            }
        }
        if (max != maxPage) {
            maxPage = max;
        }
        configIndex = config.length;
    }

    $('#LAY-configDesignFrame-save-submit').click(function() {
        var pages = [], dPages = {}, dPageLength = 0;
        var isEmpty = false, isRepeat = false, isBeyond = false, isDiscontinuous = false, isDiff = false;
        
        $('input[name=mmPageOption]').val($("#pageOption").val());
        $('input[name=config]').val(JSON.stringify(config));
    });

    // 载入配置
    window.loadConfig = function(pageOption=null,mmConfig=null) {
 
        if (isEmpty(pageOption)==false) {
            $("select[name=pageOption]").val(pageOption);
   
            getConfigDesignFrameList();
            arrangeConfigData(mmConfig);
        }else{
          
            $("#pageOption").val("1");
            getConfigDesignFrameList();
            arrangeConfigData();
        }
        layui.form.render("select");
        setDesignFrameAfter();
    };

    //排列Config
    function arrangeConfigData(mmConfig=null){

        if (mmConfig==null){
            var dPage=$("#pageOption").val();
            switch (dPage)
            {
                case "1":
                    config=[];
                    for (var i=0;i<textThaiPages.length;i++){
                        config.push({
                            page: textThaiPages[i],
                            slice: 1,
                            dPage: (i+1),
                            index: i,
                        });
                    } 
                break;
                case "2LR":
                    config=[];
                    var _slice=1;
                    for (var i=0;i<textThaiPages.length;i++){
                        config.push({
                            page: textThaiPages[i],
                            slice: (_slice),
                            dPage: Math.ceil((i+1)/2),
                            index: i,
                        });
                        _slice=(_slice+1>2)?1:_slice+1;
                    } 
                break;
                case "2TB":
                    config=[];
                    var _slice=1;
                    for (var i=0;i<textThaiPages.length;i++){
                        config.push({
                            page: textThaiPages[i],
                            slice: (_slice),
                            dPage: Math.ceil((i+1)/2),
                            index: i,
                        });
                        _slice=(_slice+1>2)?1:_slice+1;
                    } 
                break;
                case "4LRTB":
                    config=[];
                    var _slice=1;
                    for (var i=0;i<textThaiPages.length;i++){
                        config.push({
                            page: textThaiPages[i],
                            slice: (_slice),
                            dPage: Math.ceil((i+1)/4),
                            index: i,
                        });
                        _slice=(_slice+1>4)?1:_slice+1;
                    } 
                break;
            }
        }else{
         
            config=mmConfig;
        }


        getConfigDesignFrameList();       
    }

    //生成DesignFrame 预览图
    function setDesignFrameAfter(){

        var dPage=$("#pageOption").val();
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