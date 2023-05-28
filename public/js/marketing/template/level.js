/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/marketingTemplate/level
    
 */
layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index', //主入口模块
    soulTable: '../layui_exts/soulTable/soulTable',
    tableChild: '../layui_exts/soulTable/tableChild',
    tableMerge: '../layui_exts/soulTable/tableMerge',
    tableFilter: '../layui_exts/soulTable/tableFilter',
    excel: '../layui_exts/soulTable/excel'
}).use(['index', 'form', 'laydate', 'layer', 'table', 'soulTable'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,form = layui.form
        ,laydate = layui.laydate
        ,layer = layui.layer
        ,table = layui.table
        ,soulTable = layui.soulTable;
    
    //当前页面组件集
    var canvasObjects;
    var levelData=[];

    var tableScrollTop=0;

    //加载图层数据    
    loadLayer();  
      
    function loadLayer(){

        levelData=[];
        canvasObjects=parent.canvas.getObjects();
       
        canvasObjects.sort((a,b)=>{
            return a.zIndex -  b.zIndex
        });

        //20220815
        if (parent._JC.undoGroupSource!=null){
            var hideObjects=parent._JC.undoGroupSource.canvasOtherObjects;
        }else{
            var hideObjects=[];
        }

        var disableComponent=parent._JC.disableComponent;
        var newzIndex=parent._JC.minLayer;
        for(key in canvasObjects){
            if (canvasObjects[key].dType && canvasObjects[key].id){
                if (disableComponent.indexOf(canvasObjects[key].dType)==-1 && canvasObjects[key].dType!="" && hideObjects.indexOf(canvasObjects[key].id)==-1 ){

                    //canvasObjects[key].zIndex=++newzIndex;
                    levelData.unshift({
                            sort:(key *1),
                            dType:canvasObjects[key].dType,
                            selectable:canvasObjects[key].selectable,
                            //name:(key *1),
                            name:(canvasObjects[key].dType),
                            zIndex:canvasObjects[key].zIndex*1,
                            visible:canvasObjects[key].visible,
                            lock:canvasObjects[key].lockMovementX
                        });

                }
            }

        }

		table.render({
			elem: '#content-level-list',
			even: true,
			height:500,
			data:levelData,
			toolbar: false,
			cols: [
				[
				    {field:'show',width:55, title: 'Show',align:'center', toolbar:'#content-level-show-operate'},
					{field:'name', title: 'Name', align: 'left', toolbar:'#content-level-name-operate'},
					{width: 90, title:'Panel', align: 'left', toolbar:'#content-level-panel-operate' }
				]
			],
			limit: 500,
			text: {
                none:'None level'
            },
            rowDrag: {
                done: function(obj) {
                    // 完成时（松开时）触发
                    // 如果拖动前和拖动后无变化，则不会触发此方法
                    //console.log(obj.row) // 当前行数据
                    //console.log(obj.cache) // 改动后全表数据
                    //console.log(obj.oldIndex) // 原来的数据索引
                    //console.log(obj.newIndex) // 改动后数据索引
                   
                    if (obj.newIndex>obj.oldIndex){
                        //组件往下移，zIndex变小
                        for(var key=levelData[obj.newIndex].sort;key<=levelData[obj.oldIndex].sort;key++){
                            canvasObjects[key].zIndex=canvasObjects[key].zIndex + 1;
                        }
                        canvasObjects[levelData[obj.oldIndex].sort].zIndex=canvasObjects[levelData[obj.newIndex].sort].zIndex-1;
                        parent._JC.drawing=true;
                    }else if (obj.newIndex<obj.oldIndex){
                        //组件往上移，zIndex变大
                        for(var key=levelData[obj.newIndex].sort;key<=levelData[obj.oldIndex].sort;key++){
                            canvasObjects[key].zIndex=canvasObjects[key].zIndex - 1;
                        }
                        canvasObjects[levelData[obj.oldIndex].sort].zIndex=canvasObjects[levelData[obj.newIndex].sort].zIndex+1;
                        parent._JC.drawing=true;
                    }

                    parent._JC.componentDraw().reSortComponent(function(){
                        parent.canvas.renderAll();
                        loadLayer();
                    });


                }
            },
            done: function(res) {
                
                var layuitable = $(document).find(".layui-table-main");
                layuitable[0].scrollTop = tableScrollTop;

                soulTable.render(this)
            }
		});
    } 

    table.on('tool(content-level-list)', function (obj) {

        //编辑分组时，不能操作
        //if (parent._JC.undoGroupSource==null){

            var layuitable = $(document).find(".layui-table-main");
            tableScrollTop=layuitable[0].scrollTop;

            //面板图标事件
            var rowData=obj.data;
  
            parent.canvas.setActiveObject(canvasObjects[rowData.sort]);
            parent.canvas.requestRenderAll();
            if (obj.event === 'visible'){
                if(canvasObjects[rowData.sort].visible){
                    canvasObjects[rowData.sort].visible=false;
                    parent.canvas.discardActiveObject();
                }else{
                    canvasObjects[rowData.sort].visible=true;  
                }
                parent._JC.drawing=true;
                loadLayer();

                parent._JC.drawing=true;
                //事务描述
                var msg="Edit element";
                parent._JC.canvasSave().canvasHistoryRecordCall(msg);

            }else if (obj.event === 'lock'){

                parent._JC.cunterObj=canvasObjects[rowData.sort];
                parent._JC.selectedObject=[];
                parent._JC.selectedObject[0]=parent._JC.cunterObj;
                parent._JC.componentDraw().lockBtnBtnObj();
                loadLayer();   
            }else if (obj.event === 'delete'){
                
                if(canvasObjects[rowData.sort]){
                    if (canvasObjects[rowData.sort].dType!="BackgroundImage"){
                        parent.canvas.remove(canvasObjects[rowData.sort]);
                        parent._JC.drawing=true;
                        parent.canvas.discardActiveObject();
                        parent._JC.mouseoverObject=null;

                        parent._JC.drawing=true;
                        //事务描述
                        var msg="Delete element";
                        parent._JC.canvasSave().canvasHistoryRecordCall(msg);


                    }else{
                        layer.msg("The BackgroundImage Cannot delete");
                    }
                }
                loadLayer(); 
            }
        //}
    });
    
    //点击表格行空白地方选中相应组件
    table.on('row(content-level-list)', function (obj) {
        var rowData=obj.data;
        if (canvasObjects[rowData.sort] && parent._JC.undoGroupSource==null){
            parent._JC.cunterObj=canvasObjects[rowData.sort]
            parent.canvas.setActiveObject(canvasObjects[rowData.sort]);
            parent._JC.componentListener().selectedComponent(canvasObjects[rowData.sort]);
            parent.canvas.requestRenderAll();
        }
    });
    
    window.loadLayer= function(){
       loadLayer();
    };

    window.closeLayer = function(){
        //先得到当前iframe层的索引
        var index = parent.layer.getFrameIndex(window.name);
        //再执⾏关闭
        parent.layer.close(index); 
    }
    
});