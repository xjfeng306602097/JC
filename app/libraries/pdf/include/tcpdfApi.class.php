<?php

use app\libraries\makromail\Http;
use app\libraries\pdf\Pdf;
use Intervention\Image\ImageManagerStatic as Image;

/**
 * PDF 生成类 v1.0.1
 * 2022-02-27 检查本地磁盘是否存转换后字体格式文件，没有在线下载字体->在线中转格式->引用
 */
class pdfApi
{

    // TCPDF对象
    private $PDFDOC;

    private $pdfTitle;
    private $pdfWidth;
    private $pdfHeight;
    private $pdfUnit;
    private $pdfDPI;

    //预览模式，默认关闭
    private $previewMode = false;

    //缩放pdf输出
    private $scalePi = 1;

    //每英寸多少文档计量单位
    private $unitInch = 1;

    //出血线 width、height、left、top、strokeWeight、strokeColor、fillColor
    private $paperBleed = [];

    //纸张区域 width、height、left、top、fillColor
    private $paperBox = [];

    //页边距 width、height、left、top、strokeWeight、strokeColor
    private $paperMargins = [];

    //未分析mm模板数据
    private $templatePagesCode;

    //一版多页配置
    private $pageOption = 1;

    //已分析mm模板数据
    private $templatePagesData = [];

    //模板单页组件对象
    private $pageObjects;

    //mm商品数据
    private $mmProdData = [];

    //pdf页面链接区域
    private $linkArea = [];

    //保存生成文件路径
    private $savePath = "";

    //字体路径
    private $fontPath = "";

    //TCPDF字体集
    private $fontData = [];

    //输出字体用于打包
    private $zipFont = [];

    //PDF颜色模式
    private $colorMode = 'rgb';

    // 构造函数
    public function __construct($parma)
    {
        // 设置驱动为imagick
        Image::configure(['driver' => 'imagick']);

        $this->colorMode = $parma["colorMode"];

        $this->scalePi = $parma["scalePi"];

        $this->pdfTitle = $parma["title"];
        $this->pdfWidth = $parma["width"];
        $this->pdfHeight = $parma["height"];
        $this->pdfUnit = $parma["unit"];
        $this->pdfDPI = $parma["DPI"];

        $this->previewMode = $parma["previewMode"];

        $this->unitInch = $parma["unitInch"];

        $this->paperBleed = $parma["paperBleed"];
        $this->paperBox = $parma["paperBox"];
        // $this->paperMargins=$parma["paperMargins"];

        $this->mmProdData = $parma["mmProdData"];
        $this->templatePagesCode = $parma["templatePagesCode"];

        $this->fontPath = $parma["fontPath"];
        $this->fontData = $parma["fontData"];

        $this->pageOption = $parma["pageOption"];

        //创建PDF Doc
        $docParma = array("width" => ($this->paperBleed["width"]), "height" => $this->paperBleed["height"]);
        $this->createPdf($docParma);
    }

    //定义及初始化PDF文档 创建PDF DOC
    public function createPdf($docParma)
    {

        $this->PDFDOC = new Pdf(PDF_PAGE_ORIENTATION, $this->pdfUnit, [$docParma["width"], $docParma["height"]], true, 'UTF-8', false);

        //设置文档信息
        $this->PDFDOC->SetCreator(PDF_CREATOR);
        $this->PDFDOC->SetAuthor('Nicola Asuni');
        $this->PDFDOC->SetTitle($this->pdfTitle);
        $this->PDFDOC->SetSubject('Makro Digital');
        $this->PDFDOC->SetKeywords(date("Y-m-d") . ',MM');

        //设置页面 页头、页脚信息 (false 取消)
        $this->PDFDOC->setPrintHeader(false);
        $this->PDFDOC->setPrintFooter(false);

        //设置默认字体子集模式 true不嵌入到PDF中，false嵌入
        $this->PDFDOC->setFontSubsetting(false);

        //$fontname = "psl050pro"; //freeserif

        //设置页面默认的字体
        //$this->PDFDOC->SetDefaultMonospacedFont($fontname); //courier

        //设置页面边距 margin
        $this->PDFDOC->SetMargins(0, 0, 0);
        $this->PDFDOC->SetHeaderMargin(0);
        $this->PDFDOC->SetFooterMargin(0);

        //设置是否自动换页
        $this->PDFDOC->SetAutoPageBreak(false, 0);

        //设置图像渲染与设计稿偏差 偏移比例
        $this->PDFDOC->setImageScale(1.25);

        //设置输出文本兼容语言
        if (@file_exists(dirname(__FILE__) . '/lang/eng.php')) {
            require_once dirname(__FILE__) . '/lang/eng.php';
            $this->PDFDOC->setLanguageArray($l);
        }

        //绘制坐标回到页面原点 (左上角 0,0)
        $this->PDFDOC->SetX(0);
        $this->PDFDOC->SetY(0);

    }

    //读取分析模板页面数据
    public function readTemplatePages()
    {

        $templatePages = $this->templatePagesCode;

        for ($i = 0; $i < count($templatePages); $i++) {
            $tpRow = $templatePages[$i];
            array_push($this->templatePagesData, $tpRow);
        }

    }

    //遍历分析组件信息匹配替换更新 (有:商品组件、页码组件)
    public function readPageObject()
    {

        //mm商品数据
        $mmProdData = $this->mmProdData;

        //遍历模板页
        $mmPages = $this->templatePagesData;

        //页位置数据
        $pageNo = 1;
        foreach ($mmPages as $pk => $pv) {

            $thsPage = $mmPages[$pk];
            $thsPageObjects = $thsPage->objects;

            //链接区域
            $this->linkArea[$pageNo - 1] = [];

            //遍历单页组件
            for ($i = 0; $i < count($thsPageObjects); $i++) {

                //处理出血线是否显示
                // if (property_exists($thsPageObjects[$i],"dType")==true){
                //     if ($thsPageObjects[$i]->dType=="paperBleed" or $thsPageObjects[$i]->dType=="paperBox"){
                //         if ($this->paperBleed["draw"]=="P"){
                //             $thsPageObjects[$i]->visible=true;
                //         }else{
                //             $thsPageObjects[$i]->visible=false;
                //         }
                //     }else if ($thsPageObjects[$i]->dType=="paperMargins"){
                //         $thsPageObjects[$i]->visible=false;
                //     }
                // }


                if (property_exists($thsPageObjects[$i], "dType") == true) {
                    if ($thsPageObjects[$i]->dType == "paperBleed" or $thsPageObjects[$i]->dType == "paperBox" or $thsPageObjects[$i]->dType == "paperMargins" or $thsPageObjects[$i]->dType == "referenceLine" or $thsPageObjects[$i]->dType == "paperSlice" or property_exists($thsPageObjects[$i], "zIndex") == false) {
                        //or $thsPageObjects[$i]->dType =="tmpGroup"
                        $thsPageObjects[$i]->visible = false;
                    }
                } else {

                    if ($thsPageObjects[$i]->type == "group") {

                        //在这把Product商品编辑转为普通编组实现屏蔽商品清单替换
                        $thsPageObjects[$i]->dType = "tmpGroup";



                        if (property_exists($thsPageObjects[$i], "objects") == true) {

                            for ($k = 0; $k < count($thsPageObjects[$i]->objects); $k++) {

                                if ($thsPageObjects[$i]->objects[$k]->type == "image") {
                                    $thsPageObjects[$i]->objects[$k]->dType = "Picture";
                                } else {
                                    $thsPageObjects[$i]->objects[$k]->visible = false;
                                }

                                $thsPageObjects[$i]->objects[$k] = $this->resetObjectDtype($thsPageObjects[$i]->objects[$k]);
                            }

                        } else {
                            $thsPageObjects[$i]->visible = false;
                        }

                    } else {

                        $thsPageObjects[$i] = $this->resetObjectDtype($thsPageObjects[$i]);

                    }

                }

                //只处理可见组件
                if ($thsPageObjects[$i]->visible == true) {

                    if ($thsPageObjects[$i]->type == "group" and ($thsPageObjects[$i]->dType == "undefined" or $thsPageObjects[$i]->dType == "")) {
                        $thsPageObjects[$i]->dType = "tmpGroup";
                    }

                    //商品组件处理 替换商品信息
                    if ($thsPageObjects[$i]->dType == "Product") {

                        //商品在该MM模板页中页码+当前页排序位置
                        if (property_exists($thsPageObjects[$i], "dSort")) {

                            $_dSort = explode("-", $thsPageObjects[$i]->dSort);
                            if (count($_dSort) == 2) {
                                $productKey = "_" . $_dSort[0] . "_" . $_dSort[1];
                                if (array_key_exists($productKey, $mmProdData) == false) {
                                    $thsPageObjects[$i]->visible = false;
                                    continue;
                                }
                            } else {
                                $thsPageObjects[$i]->visible = false;
                                continue;
                            }
                        } else {
                            $thsPageObjects[$i]->visible = false;
                            continue;
                        }
                        $itemCode = $mmProdData[$productKey]->info->itemcode;
                        $productId = $mmProdData[$productKey]->info->productId ?? '';
                        //根据商品组件添加链接区域
                        $tmpLink = [];
                        $tmpLink["x"] = $this->pxToUnit($thsPageObjects[$i]->left * $this->scalePi);
                        $tmpLink["y"] = $this->pxToUnit($thsPageObjects[$i]->top * $this->scalePi);
                        $tmpLink["w"] = $this->pxToUnit($thsPageObjects[$i]->width * $thsPageObjects[$i]->scaleX * $this->scalePi);
                        $tmpLink["h"] = $this->pxToUnit($thsPageObjects[$i]->height * $thsPageObjects[$i]->scaleY * $this->scalePi);
                        $tmpLink["link"] = product_url($itemCode, $productId);

                        //写入链接区域
                        array_push($this->linkArea[$pageNo - 1], $tmpLink);
                        //信息替换更新
                        if (property_exists($thsPageObjects[$i], "objects") == true) {
                            $objects = $thsPageObjects[$i]->objects;
                            if ($objects != null) {
                                foreach ($objects as $k => $v) {

                                    switch ($objects[$k]->dType) {
                                        case "productNormalText":
                                            //输出pdf不作内容更新

                                            break;
                                        //商品图片 属于group组合元件
                                        case "productPicture":
                                            //取分组objects
                                            if (property_exists($objects[$k], "objects") == true) {
                                                $pp_objects = $objects[$k]->objects;
                                                for ($k2 = 0; $k2 < count($pp_objects); $k2++) {

                                                    if (property_exists($pp_objects[$k2], "dType") == true) {

                                                        if ($pp_objects[$k2]->dType == "previewPicture") {

                                                            if (property_exists($objects[$k], "angle")) {
                                                                $pp_objects[$k2]->angle = $objects[$k]->angle;
                                                            } else {
                                                                $pp_objects[$k2]->angle = 0;
                                                            }

                                                        } else {
                                                            //其他元件不显示
                                                            $pp_objects[$k2]->visible = false;

                                                        }
                                                    }
                                                }
                                                $objects[$k]->objects = $pp_objects;
                                            }
                                            break;
                                        //画线类文本
                                        case "productPriceGroup":

                                            break;
                                        //商品icon 1
                                        case "ICON-1":
                                            $objects[$k]->src = $mmProdData[$productKey]->icon1src;
                                            break;
                                        //商品icon 2
                                        case "ICON-2":
                                            $objects[$k]->src = $mmProdData[$productKey]->icon2src;
                                            break;
                                        //商品icon 3
                                        case "ICON-3":
                                            $objects[$k]->src = $mmProdData[$productKey]->icon3src;
                                            break;

                                    }

                                }
                            }
                        }
                        $thsPageObjects[$i]->objects = $objects;

                    }

                    //页码组件处理
                    if ($thsPageObjects[$i]->dType == "PageNo") {

                        //$thsPageObjects[$i]->text = ($pageNo );
                        $thsPageObjects[$i]->text = str_replace("P", "", $thsPageObjects[$i]->text);

                    }

                    //如果是用户把划线价copy到设计画布中，转为普通分组
                    if ($thsPageObjects[$i]->dType == "productPriceGroup") {
                        $thsPageObjects[$i]->dType = "tmpGroup";

                        $thsPageObjects[$i]->objects[0]->dType = "text";
                        $thsPageObjects[$i]->objects[1]->dType = "dottedLine";
                        $thsPageObjects[$i]->objects[1]->type = "polygon";

                        $thsPageObjects[$i]->objects[0]->top = ($thsPageObjects[$i]->objects[0]->height) / 2 * -1.1;
                        $thsPageObjects[$i]->objects[0]->left = ($thsPageObjects[$i]->objects[0]->width) / 2 * -1;

                        $points = [];
                        $points[0] = ["x" => $thsPageObjects[$i]->objects[1]->x1, "y" => $thsPageObjects[$i]->objects[1]->y1];
                        $points[1] = ["x" => $thsPageObjects[$i]->objects[1]->x2, "y" => $thsPageObjects[$i]->objects[1]->y2];

                        $thsPageObjects[$i]->objects[1]->points = json_decode(json_encode($points));

                    }

                    //如果是用户把productPicture copy到设计画布中，转为普通分组
                    if ($thsPageObjects[$i]->dType == "productPicture") {

                        if (property_exists($thsPageObjects[$i], "objects") == true) {

                            $isProductImage = false;
                            for ($k = 0; $k < count($thsPageObjects[$i]->objects); $k++) {

                                if ($thsPageObjects[$i]->objects[$k]->type == "image") {
                                    $isProductImage = true;
                                    $thsPageObjects[$i]->objects[$k]->dType = "Picture";
                                } else {
                                    $thsPageObjects[$i]->objects[$k]->visible = false;
                                }

                            }

                            if ($isProductImage == false) {
                                $thsPageObjects[$i]->visible = false;
                            } else {

                                $thsPageObjects[$i]->dType = "tmpGroup";

                            }

                        } else {
                            $thsPageObjects[$i]->visible = false;
                        }

                    }

                }

            }

            //替换原数组数据
            $thsPage->objects = $thsPageObjects;
            $mmPages[$pk] = $thsPage;

            $pageNo++;

        }

        $this->templatePagesData = $mmPages;

    }

    protected function resetObjectDtype($obj)
    {

        switch ($obj->type) {
            case "image":
                $obj->dType = "Picture";
                break;
            case "textbox":
                $obj->dType = "text";
                break;
            case "i-text":
                $obj->dType = "text";
                break;
            case "line":
                $obj->dType = "dottedLine";
                break;

        }
        return $obj;

    }

    //处理多级分组子组件的 Left / Top / Width / Height / ScaleX / ScaleY / RangeXY / Raduis
    protected function checkGroupComponentPos($groupObjects,$groupParent,$sortIndex,$layerSort){

        $groupScaleX=$groupObjects->scaleX;
        $groupScaleY=$groupObjects->scaleY;
        $groupLeft=$groupObjects->left;
        $groupTop=$groupObjects->top;
        $groupWidth=$groupObjects->width;
        $groupHeight=$groupObjects->height;
        for ($l=0;$l<count($groupObjects->objects);$l++){

            if ($groupObjects->objects[$l]->type<>"group"){
             
                if (empty($groupObjects->objects[$l]->top)){
                    if (property_exists($groupObjects->objects[$l],"nanTop")==true){
                        $groupObjects->objects[$l]->top=$groupObjects->objects[$l]->nanTop;
                    }else{
                        $groupObjects->objects[$l]->top=-0.5 * $groupObjects->objects[$l]->height * $groupObjects->objects[$l]->scaleY;
                    }
                    
                }

                //BASE INFO
                $groupObjects->objects[$l]->left=$groupLeft + ($groupObjects->objects[$l]->left + $groupWidth/2)* $groupScaleX;
                $groupObjects->objects[$l]->top=$groupTop + ($groupObjects->objects[$l]->top + $groupHeight/2)* $groupScaleY;
                $groupObjects->objects[$l]->width=$groupObjects->objects[$l]->width * $groupObjects->objects[$l]->scaleX / $groupObjects->scaleX;
                $groupObjects->objects[$l]->height=$groupObjects->objects[$l]->height * $groupObjects->objects[$l]->scaleY / $groupObjects->scaleY;

                if (property_exists($groupObjects,"dType")){
                    if ($groupObjects->dType=="productPriceGroup"){

                        if ($groupObjects->objects[$l]->type=="line"){
                            /*$groupObjects->objects[$l]->left - $groupHeight*0.2 * $groupObjects->objects[$l]->scaleX 用于计算划线左右延伸出字号大小的0.2距离*/

                            if ($groupObjects->scaleY*1<>1){
                                  $groupObjects->objects[$l]->x1=$groupObjects->objects[$l]->x1 * $groupObjects->objects[$l]->scaleX - $groupObjects->objects[$l]->strokeWidth * 1;
                                  $groupObjects->objects[$l]->y1=$groupObjects->objects[$l]->y1 * $groupObjects->objects[$l]->scaleX - $groupObjects->objects[$l]->strokeWidth * 2;
                                  $groupObjects->objects[$l]->x2=$groupObjects->objects[$l]->x2 * $groupObjects->objects[$l]->scaleX - $groupObjects->objects[$l]->strokeWidth;
                                  $groupObjects->objects[$l]->y2=$groupObjects->objects[$l]->y2 * $groupObjects->objects[$l]->scaleX - $groupObjects->objects[$l]->strokeWidth* 2;
                                  $groupObjects->objects[$l]->left=$groupObjects->objects[$l]->left * $groupObjects->objects[$l]->scaleX  - $groupObjects->objects[$l]->strokeWidth * 2;
                                  $groupObjects->objects[$l]->top=$groupObjects->objects[$l]->top * $groupObjects->objects[$l]->scaleX  - $groupObjects->objects[$l]->strokeWidth * 2;
                            }else{

                                $textObj=$groupObjects->objects[0];
                                if ($groupObjects->objects[$l]->x1<=$textObj->left and 1>3){
                                   
                                  $groupObjects->objects[$l]->left=$textObj->left - ($textObj->fontSize) * 0.5;
                                  $groupObjects->objects[$l]->top=$textObj->top - ($textObj->fontSize)*0.05;
                                  $groupObjects->objects[$l]->x1=$groupObjects->objects[$l]->left - $groupObjects->objects[$l]->strokeWidth;
                                  $groupObjects->objects[$l]->x2=$groupObjects->objects[$l]->left + $textObj->width + ($textObj->fontSize)*0.2;

                                }else{

                                    // $groupObjects->objects[$l]->left=$groupLeft - $groupHeight*0.2 * $groupObjects->objects[$l]->scaleX;
                                    $groupObjects->objects[$l]->x1=$groupLeft - $groupHeight*0.2 * $groupObjects->objects[$l]->scaleX;
                                    $groupObjects->objects[$l]->y1=$groupTop + ($groupObjects->objects[$l]->height*$groupObjects->scaleY);
                                    $groupObjects->objects[$l]->x2=$groupLeft + ($groupObjects->objects[$l]->width) - $groupHeight*0.4 * $groupObjects->objects[$l]->scaleX;
                                    $groupObjects->objects[$l]->y2=$groupTop;

                                    // $groupObjects->objects[$l]->left=$groupObjects->objects[$l]->left * $groupScaleX;
                                    $groupObjects->objects[$l]->x1=$groupObjects->objects[$l]->x1 * $groupScaleX;
                                    $groupObjects->objects[$l]->y1=$groupObjects->objects[$l]->y1 * $groupScaleY;
                                    $groupObjects->objects[$l]->x2=$groupObjects->objects[$l]->x2 * $groupScaleX;
                                    $groupObjects->objects[$l]->y2=$groupObjects->objects[$l]->y2 * $groupScaleY;

                                
                                }
                            }
                        }

                        if (property_exists($groupObjects->objects[$l],"dType")){

                            if ($groupObjects->objects[$l]->dType=="productPriceText"){
       
                                $groupObjects->objects[$l]->fontSize=$groupObjects->objects[$l]->fontSize * $groupObjects->objects[$l]->scaleX;

                                if ($groupObjects->scaleY*1==1){
                                    $groupObjects->objects[$l]->top=$groupTop + ($groupHeight * $groupObjects->scaleY - $groupObjects->objects[$l]->height )/2;
                                }else{
                                    $groupObjects->objects[$l]->top=$groupTop + ($groupHeight - $groupObjects->objects[$l]->height )/2 * $groupObjects->scaleY;
                                    $groupObjects->objects[$l]->left=$groupLeft + ($groupWidth - $groupObjects->objects[$l]->width/$groupObjects->objects[$l]->scaleX*$groupObjects->scaleX )/2 * $groupObjects->scaleX;
                                }

                                $strokePi=1;
                                if (property_exists($groupObjects->objects[$l],"strokeWidth")==true){
                                    if ($groupObjects->objects[$l]->strokeWidth*1>0){

                                        $strokePi=($groupObjects->objects[$l]->scaleX > $groupObjects->objects[$l]->scaleY)?$groupObjects->objects[$l]->scaleY:$groupObjects->objects[$l]->scaleX;
                                        //处理图形边框及left/top减去边框占位
                                        $groupObjects->objects[$l]->strokeWidth=$groupObjects->objects[$l]->strokeWidth * $strokePi;
                                        if ($groupObjects->objects[$l]->type<>""){
                                            $groupObjects->objects[$l]->left=$groupObjects->objects[$l]->left - $groupObjects->objects[$l]->strokeWidth * 2;
                                            $groupObjects->objects[$l]->top=$groupObjects->objects[$l]->top - $groupObjects->objects[$l]->strokeWidth * 2;
                                        }

                                    }else{
                                        $groupObjects->objects[$l]->strokeWidth=0;
                                    }
                                }




                                if (($groupObjects->objects[$l]->angle*1<>0 and $groupObjects->objects[$l]->angle*1<>360) or ($groupObjects->angle*1<>0 and $groupObjects->angle*1<>360)) {

                                    $groupObjects->objects[$l]->left=$groupLeft + $groupObjects->objects[$l]->fontSize * $groupObjects->objects[$l]->scaleX * 0.25;

                                }

                            }
                        }



                    }else{

                        if ($groupObjects->objects[$l]->type=="textbox" or $groupObjects->objects[$l]->type=="i-text"){

                            $groupObjects->objects[$l]->fontSize=$groupObjects->objects[$l]->fontSize * $groupObjects->objects[$l]->scaleX;

                        }

                    }
                }

                //pathOffset
                if (property_exists($groupObjects->objects[$l],"pathOffset")==true){

                    $pathOffset=$groupObjects->objects[$l]->pathOffset;                    
                    $pathOffset->x=$pathOffset->x * $groupObjects->objects[$l]->scaleX + $groupObjects->objects[$l]->strokeWidth * 2;
                    $pathOffset->y=$pathOffset->y * $groupObjects->objects[$l]->scaleY + $groupObjects->objects[$l]->strokeWidth * 2;

                    $groupObjects->objects[$l]->pathOffset=$pathOffset;
                }

                //处理分组及分组内对象角度
                if ($groupParent->angle * 1 != 0 and $groupParent->angle * 1 != 360) {

                    if ($groupParent->angle < 0) {
                        $groupParent_angle = 360 + $groupParent->angle;
                    }else{
                        $groupParent_angle = $groupParent->angle;
                    }

                    if ($groupObjects->objects[$l]->angle < 0) {
                        $groupObjects->objects[$l]->angle = 360 + $groupObjects->objects[$l]->angle;
                    }

                    $groupObjects->objects[$l]->parentObjAngleX = $groupParent->left; //20220813
                    $groupObjects->objects[$l]->parentObjAngleY = $groupParent->top; //20220813

                    $groupObjects->objects[$l]->parentAngle = $groupParent_angle;

                } else {


                    $groupObjects->objects[$l]->parentObjAngleX = $groupParent->left;
                    $groupObjects->objects[$l]->parentObjAngleY = $groupParent->top;
                    $groupObjects->objects[$l]->parentAngle = 0;

                    if ($groupObjects->objects[$l]->angle < 0) {
                        $groupObjects->objects[$l]->angle = 360 + $groupObjects->objects[$l]->angle;
                    }

                }




                //Stroke
                $strokePi=1;
                if (property_exists($groupObjects->objects[$l],"strokeWidth")==true && property_exists($groupObjects->objects[$l],"setStroke")==false){
                    if ($groupObjects->objects[$l]->strokeWidth*1>0){

                        $strokePi=($groupObjects->objects[$l]->scaleX > $groupObjects->objects[$l]->scaleY)?$groupObjects->objects[$l]->scaleY:$groupObjects->objects[$l]->scaleX;
                        //处理图形边框及left/top减去边框占位
                        $groupObjects->objects[$l]->strokeWidth=$groupObjects->objects[$l]->strokeWidth * $strokePi;
                        if ($groupObjects->objects[$l]->type<>""){
                            $groupObjects->objects[$l]->left=$groupObjects->objects[$l]->left + $groupObjects->objects[$l]->strokeWidth * 1;
                            $groupObjects->objects[$l]->top=$groupObjects->objects[$l]->top + $groupObjects->objects[$l]->strokeWidth * 1;
                            $groupObjects->objects[$l]->width=$groupObjects->objects[$l]->width - $groupObjects->objects[$l]->strokeWidth * 1;
                            $groupObjects->objects[$l]->height=$groupObjects->objects[$l]->height - $groupObjects->objects[$l]->strokeWidth * 1;
                        }

                    }else{
                        $groupObjects->objects[$l]->strokeWidth=0;
                    }
                }

                //TYPE
                $groupObjects->objects[$l]=$this->getComponentPos($groupObjects->objects[$l],$groupParent,1);
                $groupObjects->objects[$l]->zIndex=$layerSort;
                $groupObjects->objects[$l]->scaleX=$groupObjects->scaleX;
                $groupObjects->objects[$l]->scaleY=$groupObjects->scaleY;

                $layerSort++;

            }else{

                if ($groupParent->angle * 1 != 0 and $groupParent->angle * 1 != 360) {

                    if ($groupParent->angle < 0) {
                        $groupParent_angle = 360 + $groupParent->angle;
                    }else{
                        // $groupParent_angle = $groupParent->angle;
                    }

                    if ($groupObjects->objects[$l]->angle < 0) {
                        $groupObjects->objects[$l]->angle = 360 + $groupObjects->objects[$l]->angle;
                    }

                    $groupObjects->objects[$l]->parentObjAngleX = $groupParent->left; //20220813
                    $groupObjects->objects[$l]->parentObjAngleY = $groupParent->top; //20220813

                    $groupObjects->objects[$l]->parentAngle = $groupParent_angle;

                } else {


                    $groupObjects->objects[$l]->parentObjAngleX = $groupParent->left;
                    $groupObjects->objects[$l]->parentObjAngleY = $groupParent->top;
                    $groupObjects->objects[$l]->parentAngle = 0;

                    if ($groupObjects->objects[$l]->angle < 0) {
                        $groupObjects->objects[$l]->angle = 360 + $groupObjects->objects[$l]->angle;
                    }else{

                    }

                }

                // $groupObjects->objects[$l]->angle=$groupObjects->objects[$l]->angle * 1 + $groupParent->angle;
                
                $reultArr=$this->checkGroupComponentPos($groupObjects->objects[$l],$groupObjects,$l,$layerSort);
                array_splice($groupObjects->objects,$l,1,$reultArr);
                $l--;
                $layerSort=$layerSort + count($reultArr) + 1;
            }


        }
   
        return $groupObjects->objects;
    }

    //设计器组件坐标转换PDF输出坐标 groupParent=null groupParent!=null 代表子组件上层编组，$type=1 代表编组内环循处理（path/多边形路径值）
    protected function getComponentPos($object,$groupParent=null,$type=null){


        if ($groupParent==null){


            switch ($object->type){
                case "rect":

                    $object->left=$object->left + $object->strokeWidth * 0.5;
                    $object->top=$object->top + $object->strokeWidth * 0.5;
                    $object->width=$object->width - $object->strokeWidth * 2;
                    $object->height=$object->height - $object->strokeWidth * 2; 

                break;
                case "circle":

                    if ($object->scaleX==$object->scaleY){
                        $object->left=$object->left - $object->strokeWidth * 0.5 / $object->scaleX;
                        $object->top=$object->top - $object->strokeWidth * 0.5 / $object->scaleX;
                        $object->width=$object->width - $object->strokeWidth * 2;
                        $object->height=$object->height - $object->strokeWidth * 2; 
                    }else{
                        $object->left=$object->left + $object->strokeWidth * 0.5;
                        $object->top=$object->top + $object->strokeWidth * 0.5;
                        $object->width=$object->width - $object->strokeWidth * 2;
                        $object->height=$object->height - $object->strokeWidth * 2; 
                        $object->radius=$object->radius - $object->strokeWidth * 0.0;
                    }

                break;
                case "ellipse":
                    $object->left=$object->left + $object->strokeWidth * 0.5;
                    $object->top=$object->top + $object->strokeWidth * 0.5;
                    $object->width=$object->width - $object->strokeWidth * 2;
                    $object->height=$object->height - $object->strokeWidth * 1.5; 

                    $object->rx=$object->rx + $object->strokeWidth * 0.0;
                    $object->ry=$object->ry + $object->strokeWidth * 0.0;


                break;
                case "path":
     
                    $object->left=$object->left - $object->strokeWidth * 0.5;
                    $object->top=$object->top - $object->strokeWidth * 0.5;
                    $object->width=$object->width + $object->strokeWidth * 2;
                    $object->height=$object->height + $object->strokeWidth * 2;

                break;
                case "polygon":
                    $object->left=$object->left + $object->strokeWidth * 0.5;
                    $object->top=$object->top + $object->strokeWidth * 0.5;
                    $object->width=$object->width - $object->strokeWidth * 2;
                    $object->height=$object->height - $object->strokeWidth * 2; 
                break;
                case "textbox":
                case "i-text":
                case "image":
                    $object->left=$object->left + $object->strokeWidth * 0.5;
                    $object->top=$object->top + $object->strokeWidth * 0.5;
                    $object->width=$object->width - $object->strokeWidth * 2;
                    $object->height=$object->height - $object->strokeWidth * 2; 
                break;
         
            }
            return $object;
        }else {

            switch ($object->type){
                case "rect":
                    if ($type==1){
                        $object->left=$object->left - $object->strokeWidth * 2;
                        $object->top=$object->top - $object->strokeWidth * 2;
                        $object->width=$object->width  + $object->strokeWidth * 2;
                        $object->height=$object->height + $object->strokeWidth * 2;
                    }else{
                        $object->left=$object->left + $object->strokeWidth * 0.5;
                        $object->top=$object->top + $object->strokeWidth * 0.5;
                        $object->width=$object->width  - $object->strokeWidth * 2;
                        $object->height=$object->height - $object->strokeWidth * 2;
                    }
 

                break;
                case "circle":

                    if ($object->scaleX==$object->scaleY){
                        $object->left=$object->left - $object->strokeWidth * 0.5;
                        $object->top=$object->top - $object->strokeWidth * 0.5;
                        $object->width=$object->width - $object->strokeWidth * 2;
                        $object->height=$object->height - $object->strokeWidth * 2; 
                    }else{
                        $object->left=$object->left + $object->strokeWidth * 1;
                        $object->top=$object->top + $object->strokeWidth * 1;
                        $object->width=$object->width + $object->strokeWidth * 0;
                        $object->height=$object->height + $object->strokeWidth * 0; 
                        $object->radius=$object->radius  - $object->strokeWidth * 1;
                    }



                break;
                case "ellipse":
                    $object->left=$object->left - $object->strokeWidth * 1;
                    $object->top=$object->top - $object->strokeWidth * 1;
                    $object->width=$object->width - $object->strokeWidth * 2;
                    $object->height=$object->height - $object->strokeWidth * 1.5; 

                    // $object->rx=$object->rx * $object->scaleX + $object->strokeWidth * 1;
                    // $object->ry=$object->ry * $object->scaleY + $object->strokeWidth * 1;

                    $object->rx=$object->rx + $object->strokeWidth * 1;
                    $object->ry=$object->ry + $object->strokeWidth * 1;

                break;
                case "path":
        
                    if ($type==1){
                        $object->left=$object->left + $object->strokeWidth * 0.5;
                        $object->top=$object->top + $object->strokeWidth * 0.5;
                        $object->width=$object->width + $object->strokeWidth * 2;
                        $object->height=$object->height + $object->strokeWidth * 2;
                    }else{
                        $object->left=$object->left - $object->strokeWidth * 0.5;
                        $object->top=$object->top - $object->strokeWidth * 0.5;
                        $object->width=$object->width + $object->strokeWidth * 2;
                        $object->height=$object->height + $object->strokeWidth * 2;
                    }



                    if (property_exists($object,"path")==true && $type==1){

                        foreach ($object->path as $k=>$v) {

                            if (count($v)==3){
                                
                                $v[1]=$v[1] * $object->scaleX;
                                $v[2]=$v[2] * $object->scaleY;
                                $object->path[$k]=$v;

                            }else if (count($v)==7){

                                $v[1]=$v[1] * $object->scaleX;
                                $v[2]=$v[2] * $object->scaleY;

                                $v[3]=$v[3] * $object->scaleX;
                                $v[4]=$v[4] * $object->scaleY;

                                $v[5]=$v[5] * $object->scaleX;
                                $v[6]=$v[6] * $object->scaleY;

                                $object->path[$k]=$v;


                            }

                        }

                    }


                break;
                case "polygon":

                    if (property_exists($object,"setStroke")==false){

                        $object->left=$object->left + $object->strokeWidth * 0.5;
                        $object->top=$object->top + $object->strokeWidth * 0.5;
                        $object->width=$object->width - $object->strokeWidth * 2;
                        $object->height=$object->height - $object->strokeWidth * 2; 

                        if (property_exists($object,"points")==true && $type==1){

                            foreach ($object->points as $k=>$v) {

                                $v->x=$v->x * $object->scaleX + $object->strokeWidth * 2;
                                $v->y=$v->y * $object->scaleY + $object->strokeWidth * 2;
                                $object->points[$k]=$v;
                            }
                        }
                        $object->setStroke=true;
                    }

                break;
                case "line_bak":
                    $object->left=$object->left + $object->strokeWidth * 0.5;
                    $object->top=$object->top + $object->strokeWidth * 0.5;
                    $object->width=$object->width - $object->strokeWidth * 2;
                    $object->height=$object->height - $object->strokeWidth * 2; 

                    $object->x1=$object->x1 + $object->scaleX * 0;
                    $object->x2=$object->x2 + $object->scaleX * 0;
                    $object->y1=$object->y1 + $object->scaleY * 0;
                    $object->y2=$object->y2 + $object->scaleY * 0;

                    $object->type="polygon";
                    $object->dType = "dottedLine";
                       
                    $points = [];
                    $points[0] = ["x" => $object->x1, "y" => $object->y1];
                    $points[1] = ["x" => $object->x2, "y" => $object->y2];

                    $object->points = json_decode(json_encode($points));

                break;

                case "line":
                    $object->left=$object->left + $object->strokeWidth * 0.5;
                    $object->top=$object->top + $object->strokeWidth * 0.5;
                    $object->width=$object->width - $object->strokeWidth * 1;
                    $object->height=$object->height - $object->strokeWidth * 1; 

                    $object->x1=$object->x1 + $object->scaleX * 0;
                    $object->x2=$object->x2 + $object->scaleX * 0;
                    $object->y1=$object->y1 + $object->scaleY * 0;
                    $object->y2=$object->y2 + $object->scaleY * 0;

                    $object->type="polygon";
                    $object->dType = "dottedLine";
                       
                    $points = [];
                    $points[0] = ["x" => $object->x1, "y" => $object->y1];
                    $points[1] = ["x" => $object->x2, "y" => $object->y2];

                    $object->points = json_decode(json_encode($points));

                break;


                case "image":

                    $object->left=$object->left + $object->strokeWidth * 0.5;
                    $object->top=$object->top + $object->strokeWidth * 0.5;
                    if ($type==1){
                        $object->width=($object->width - $object->strokeWidth * 2);
                        $object->height=($object->height - $object->strokeWidth * 2);
                    }else{
                        $object->width=($object->width - $object->strokeWidth * 2);
                        $object->height=($object->height - $object->strokeWidth * 2);
                    }

                break;
                case "textbox":
                    $object->left=$object->left + $object->strokeWidth * 0.5;
                    if ($type==1){
                        $object->width=($object->width - $object->strokeWidth * 2) ;
                        $object->height=($object->height - $object->strokeWidth * 2);
                        $object->top=$object->top + $object->strokeWidth * 0.5;
                    }else{
                        $object->width=($object->width - $object->strokeWidth * 2);
                        $object->height=($object->height - $object->strokeWidth * 2);
                        if ($object->dType=="text"){
                            // $object->top=$object->top + $object->strokeWidth * 0.5 - $object->fontSize * 0.08;
                            $object->top=$object->top + $object->strokeWidth * 0.5 - $object->fontSize * 0.08 *0; //20230511
                        }else{
                            $object->top=$object->top + $object->strokeWidth * 0.5;// - $object->fontSize * 0.08;
                        }
                        
                    }
                break;
                case "i-text":

                    if ($object->strokeWidth*1==0){
                        /*$object->left=$object->left + $object->strokeWidth * 0.5;
                        $object->top=$object->top + $object->strokeWidth * 0.5;

                        if ($type==1){
                            $object->width=($object->width - $object->strokeWidth * 2) ;
                            $object->height=($object->height - $object->strokeWidth * 2);
                        }else{
                            $object->width=($object->width - $object->strokeWidth * 2);
                            $object->height=($object->height - $object->strokeWidth * 2);
                        }*/
                    }else{

                        /* 20230511
                        $object->left=$object->left - $object->strokeWidth * 0;
                        $object->top=$object->top - $object->strokeWidth * 1;
                        if ($type==1){
                            $object->width=($object->width + $object->strokeWidth * 2) ;
                            $object->height=($object->height + $object->strokeWidth * 2);
                        }else{
                            $object->width=($object->width + $object->strokeWidth * 2);
                            $object->height=($object->height + $object->strokeWidth * 2);
                        }*/


                        if (property_exists($object,"setStroke")==false){

                            $object->left=$object->left - $object->strokeWidth * 0;
                            $object->top=$object->top - $object->strokeWidth * 1;
                            if ($type==1){
                                $object->width=($object->width + $object->strokeWidth * 2) ;
                                $object->height=($object->height + $object->strokeWidth * 2);
                            }else{
                                $object->width=($object->width + $object->strokeWidth * 2);
                                $object->height=($object->height + $object->strokeWidth * 2);
                            }
                        }

                    }


                break;

                case "i-text3":
                    $object->left=$object->left + $object->strokeWidth * 0;
                    $object->top=$object->top + $object->strokeWidth * 0;
                    if ($type==1){
                        $object->width=($object->width + $object->strokeWidth * 0) ;
                        $object->height=($object->height + $object->strokeWidth * 0);
                    }else{
                        $object->width=($object->width + $object->strokeWidth * 0);
                        $object->height=($object->height + $object->strokeWidth * 0);
                    }

                break;

         
            }
            return $object;

        }

    }

    //单页组件 分组拆分及zIndex排序
    protected function objectsSplitSort($objects)
    {
        //根据组件在画布绘制从底层向上层级别设置排序值
        $layerSort=1;
        for ($i = 0; $i < count($objects); $i++) {
            if (property_exists($objects[$i], "zIndex") == true) {

                if ($objects[$i]->visible == true) {
                    
                    if ($objects[$i]->type == "group") {
                        //第1层
                        // Product Pictrue Group
                        for ($j=0;$j<count($objects[$i]->objects);$j++){
                            
                            if (property_exists($objects[$i]->objects[$j],"type")) {   

                                if ($objects[$i]->objects[$j]->type == "group") {
                                    //第2层 解析后放在当前分组同级 (所有第2层后的子孙分组都放在第2层 $objects[$i]->objects[$j]->objects.push())
                                    if ($objects[$i]->objects[$j]->dType=="productPriceGroup"){
                                        // continue;
                                    }

                                    $_object = $objects[$i]->objects[$j];

                                    $reultArr=$this->checkGroupComponentPos($_object,$objects[$i],$j,$layerSort);
                                    array_splice($objects[$i]->objects,$j,1,$reultArr);
                                    $j--;
                                    $layerSort=$layerSort + count($reultArr);
                                    $layerSort++;
                                
                                }else{

                                    $objects[$i]->objects[$j]->zIndex=$layerSort;
                                    $objects[$i]->objects[$j]=$this->getComponentPos($objects[$i]->objects[$j],$objects[$i]);
                                    $layerSort++;

                                    if (property_exists($objects[$i]->objects[$j],"id")){
                                        if ($objects[$i]->objects[$j]->id=="16739581380003629"){
                                            //echo json_encode($objects[$i]->objects[$j]);exit;
                                        }
                                    }


                                }
                             }
                        }
                    }else{
                        $objects[$i]->zIndex=$layerSort;
                        $objects[$i]=$this->getComponentPos($objects[$i],null);
                        $layerSort++;


                    }


                }
            }
        }

        $drawObjects = $objects;
        for ($i = 0; $i < count($objects); $i++) {
            if (property_exists($objects[$i], "zIndex") == true) {

                if ($objects[$i]->visible == true) {

                    if ($objects[$i]->type == "group") {
                        /*echo "<br><br>group<br>";
                        echo json_encode($objects[$i]);
                        exit;*/
                        for ($j = 0; $j < count($objects[$i]->objects); $j++) {

                            $_object = $objects[$i]->objects[$j];

                            if ($_object->visible == true) {

                                //处理分组及分组内对象角度
                                // 20220813 jira 391
                                if ($objects[$i]->angle * 1 != 0 and $objects[$i]->angle * 1 != 360) {

                                    if ($objects[$i]->angle < 0) {
                                        $objects[$i]->angle = 360 + $objects[$i]->angle;
                                    }

                                    if ($_object->angle < 0) {
                                        $_object->angle = 360 + $_object->angle;
                                    }

                                    $_object->parentObjAngleX = $objects[$i]->left; //20220813
                                    $_object->parentObjAngleY = $objects[$i]->top; //20220813

                                    $_object->parentAngle = $objects[$i]->angle;

                                } else {
                                    $_object->parentObjAngleX = $objects[$i]->left;
                                    $_object->parentObjAngleY = $objects[$i]->top;
                                    $_object->parentAngle = 0;

                                    if ($_object->angle < 0) {
                                        $_object->angle = 360 + $_object->angle;
                                    }

                                }

                                $_object->source_width = $_object->width;
                                $_object->source_height = $_object->height;
                                $_object->width = $_object->width * $objects[$i]->scaleX;
                                $_object->height = $_object->height * $objects[$i]->scaleY;

                                if ($_object->type == "circle" or $_object->type == "ellipse") {
              
                                    if (property_exists($_object, "radius") == true) {     
                                        if ($objects[$i]->scaleX != $objects[$i]->scaleY) {
                                            $_object->radiusX = $_object->radius * $_object->scaleX * $objects[$i]->scaleX;
                                            $_object->radiusY = $_object->radius * $_object->scaleY * $objects[$i]->scaleY;
                                        } else {
                                            $_object->radiusX = $_object->radius * $_object->scaleX * $objects[$i]->scaleX;
                                            $_object->radiusY = $_object->radius * $_object->scaleY * $objects[$i]->scaleY;
                                        }
                                    }else{

                                        if ($objects[$i]->scaleX != $objects[$i]->scaleY) {
                                            $_object->radiusX = $_object->rx  * $_object->scaleX * $objects[$i]->scaleX;
                                            $_object->radiusY = $_object->ry  * $_object->scaleY * $objects[$i]->scaleY;
                                        } else {
                                            $_object->radiusX = $_object->rx  * $_object->scaleX * $objects[$i]->scaleX;
                                            $_object->radiusY = $_object->ry  * $_object->scaleY * $objects[$i]->scaleY;
                                        }

                                    }
                                }

                                if (property_exists($_object, "zIndex") == false) {

                                    $_object->zIndex = $objects[$i]->zIndex * 1;
                                }
                                $_object->zIndex = $objects[$i]->zIndex * 1 + $j;

                                if ($_object->type != "textbox") {
                                    $strokeWidthUnit = 0;
                                    if (property_exists($_object, "strokeWidth") == true) {
                                        $strokeWidthUnit = $_object->strokeWidth * $_object->scaleX * $objects[$i]->scaleX;
                                    }

                                    $isProductPriceGroup = false;
                                    if (property_exists($_object, "dType") == false) {
                                        $isProductPriceGroup = false;
                                    } else {

                                        if ($_object->dType == "productPriceGroup") {
                                            $isProductPriceGroup = true;

                                            $_object->objects[1]->dType = "priceUndeline";

                                        }
                                    }

                                    if ($isProductPriceGroup == false) {

                                        $_object->left = $objects[$i]->left + ($objects[$i]->width * $objects[$i]->scaleX / 2) + $_object->left * $objects[$i]->scaleX + $strokeWidthUnit;
                                        $_object->top = $objects[$i]->top + ($objects[$i]->height * $objects[$i]->scaleY / 2) + $_object->top * $objects[$i]->scaleY + $strokeWidthUnit;
                                    }

                                } else {
                                    $_object->left = $objects[$i]->left + ($objects[$i]->width * $objects[$i]->scaleX / 2) + $_object->left * $objects[$i]->scaleX;
                                    $_object->top = $objects[$i]->top + ($objects[$i]->height * $objects[$i]->scaleY / 2) + $_object->top * $objects[$i]->scaleY;

                                    if (property_exists($_object, "fontSize")) {
                                        $_object->fontSize = $_object->fontSize * $objects[$i]->scaleY;
                                    }

                                }

                                if ($_object->type == "rect") {
                                    $_object->rx = $_object->rx * $_object->scaleX * $objects[$i]->scaleX;
                                }

                                if ($_object->type == "polygon") {

                                    $points = null;
                                    if ($_object->points) {

                                        //线条
                                        $points = [];
                                        foreach ($_object->points as $p) {

                                            $tmpPoint = $p;
                                            $tmpPoint->x = $p->x * $objects[$i]->scaleX + $_object->left;
                                            $tmpPoint->y = $p->y * $objects[$i]->scaleY + $_object->top;

                                            array_push($points, $tmpPoint);

                                        }

                                        $_object->points = $points;

                                    }

                                }

                                if ($_object->type == "path") {
                                    $points = null;
                                    if ($_object->path) {
                                        //多边形
                                        $points = [];
                                        foreach ($_object->path as $p) {
                                            if (isset($p[1])) {
                                                //isset($p[1])
                                                $tmpPoint = $p;
                                                $tmpPoint[1] = $p[1] * $objects[$i]->scaleX;
                                                $tmpPoint[2] = $p[2] * $objects[$i]->scaleY;
                                                array_push($points, $tmpPoint);
                                            } else {
                                                array_push($points, $p[0]);
                                            }
                                        }

                                        $_object->path = $points;
                                    }

                                }

                                if ($_object->type == "polygon") {
                                    $_object->left = $_object->left - $_object->strokeWidth;
                                    $_object->top = $_object->top - $_object->strokeWidth;
                                }

                                if ($_object->type == "rect") {
                                    $_object->left = $_object->left - $_object->strokeWidth;
                                    $_object->top = $_object->top - $_object->strokeWidth;
                                }

                                if (property_exists($_object, "dType") == false) {
                                    if ($_object->type == "line") {
                                        //$_object->dType="";
                                    }
                                    switch ($_object->type)
                                    {
                                        case "image":
                                            $_object->dType="Picture";
                                        break;
                                        case "rect":
                                        case "circle":
                                        case "path":
                                        case "polygon":
                                        case "ellipse":
                                        case "line":
                                            $_object->dType="shape";
                                        break;
                                        case "group":
                                            $_object->dType="tmpGroup";
                                        break;
                                        case "textbox":
                                        case "i-text":
                                            $_object->dType="text";
                                        break;

                                    }

                                }

                                if ($_object->dType == "productPicture" && 1 > 0) {
                                    $_object_object = $_object->objects;
                                    for ($k = 0; $k < count($_object_object); $k++) {

                                        if (property_exists($_object_object[$k], "dType") == true) {
                                            if ($_object_object[$k]->dType == "previewPicture") {

                                                $_object_object[$k]->width = $_object_object[$k]->width * $_object->scaleX * $objects[$i]->scaleX;
                                                $_object_object[$k]->height = $_object_object[$k]->height * $_object->scaleY * $objects[$i]->scaleY;

                                                $_object_object[$k]->left = $_object->left + ($_object->width * $_object->scaleX / 2) + $_object_object[$k]->left * $_object->scaleX * $objects[$i]->scaleX;
                                                $_object_object[$k]->top = $_object->top + ($_object->height * $_object->scaleY / 2) + $_object_object[$k]->top * $_object->scaleY * $objects[$i]->scaleY;

                                                if (property_exists($_object, "parentObjAngleX") == true) {
                                                    $_object_object[$k]->parentObjAngleX = $_object->parentObjAngleX;
                                                    $_object_object[$k]->parentObjAngleY = $_object->parentObjAngleY;
                                                }

                                                $_object_object[$k]->angle = $_object->angle;

                                                if (property_exists($_object_object[$k], "zIndex") == false) {
                                                    $_object_object[$k]->zIndex = $_object->zIndex;
                                                } else {
                                                    $_object_object[$k]->zIndex = $_object->zIndex + $j;
                                                }

                                                array_push($drawObjects, $_object_object[$k]);

                                            }
                                        }

                                    }
                                } else if ($_object->dType == "productPriceGroup" and $_object->type == "group") {

                                    //画线类文本
                                    if (property_exists($_object, "objects") == false) {

                                        if ($this->previewMode) {
                                            echo " Normal Price data is error ";exit;
                                        } else {
                                            $errTxt = $fontname . $styleName . " style font does not exist! <br>Please check: Markeing > config > font ";
                                            echo '<script>parent.layer.confirm("Normal Price data is error", {title: \'Error\', btn: [\'Close\']});</script>';exit;
                                        }
                                    }

                                    $componentTop = $objects[$i]->top;
                                    $componentLeft = $objects[$i]->left;
                                    //划线价分组属性
                                    $parentLeft = ($_object->left + $objects[$i]->width / 2);
                                    $parentTop = ($_object->top + $objects[$i]->height / 2);
                                    $parentWidth = $_object->source_width;
                                    $parentHeight = $_object->source_height;

                                    $_object_object = $_object->objects;

                                    for ($k = 0; $k < count($_object_object); $k++) {

                                        if (property_exists($_object_object[$k], "type") == true) {
                                            $tmpzIndex = 2;
                                            if ($_object_object[$k]->type == "i-text") {
                                                $tmpzIndex = 1;
                                                $_object_object[$k]->dType = "priceText";
                                            } else {
                                                $_object_object[$k]->dType = "priceUndeline";
                                            }

                                            $eScaleX = $_object->scaleX;

                                            if ($_object_object[$k]->type == "i-text") {

                                                $_object_object[$k]->fontSize = $_object_object[$k]->fontSize * $_object->scaleX * $objects[$i]->scaleY;

                                                $_object_object[$k]->left = $componentLeft + ($parentLeft * $objects[$i]->scaleX + ($_object_object[$k]->left + $parentWidth / 2) * $_object->scaleX * $objects[$i]->scaleX);

                                                if ($_object_object[$k]->top != "NaN" and $_object_object[$k]->top != null and $_object_object[$k]->top != "" and $_object_object[$k]->top > 0) {
                                                    $_object_object[$k]->top = $componentTop + ($parentTop * $objects[$i]->scaleY + ($_object_object[$k]->top + $parentHeight / 2) * $_object->scaleY * $objects[$i]->scaleY);
                                                } else {

                                                    $itextHeight = $_object_object[$k]->height * $_object_object[$k]->scaleY * $_object->scaleY * $objects[$i]->scaleY;

                                                    $_object_object[$k]->top = ($itextHeight) / 2 * -1;
                                                    $_object_object[$k]->top = $componentTop + ($parentTop * $objects[$i]->scaleY + ($_object_object[$k]->top + $parentHeight / 2) * $_object->scaleY * $objects[$i]->scaleY);
                                                }

                                                $_object_object[$k]->width = $_object_object[$k]->width * $_object_object[$k]->scaleX * $_object->scaleX * $objects[$i]->scaleX;
                                                $_object_object[$k]->height = $_object_object[$k]->height * $_object_object[$k]->scaleY * $_object->scaleY * $objects[$i]->scaleY;

                                                $_object_object[$k]->scaleY = 1;
                                                $_object_object[$k]->scaleX = 1;

                                            } else if ($_object_object[$k]->type == "line") {

                                                $_object_object[$k]->x1 = $componentLeft + ($parentLeft * $objects[$i]->scaleX + ($_object_object[$k]->x1 + $parentWidth / 2) * $_object->scaleX * $objects[$i]->scaleX);
                                                $_object_object[$k]->x2 = $componentLeft + ($parentLeft * $objects[$i]->scaleX + ($_object_object[$k]->x2 + $parentWidth / 2) * $_object->scaleX * $objects[$i]->scaleX);
                                                $_object_object[$k]->y1 = $componentTop + ($parentTop * $objects[$i]->scaleY + ($_object_object[$k]->y1 + $parentHeight / 2) * $_object->scaleY * $objects[$i]->scaleY);
                                                $_object_object[$k]->y2 = $componentTop + ($parentTop * $objects[$i]->scaleY + ($_object_object[$k]->y2 + $parentHeight / 2) * $_object->scaleY * $objects[$i]->scaleY);

                                                $_object_object[$k]->left = $componentLeft + ($parentLeft * $objects[$i]->scaleX + ($_object_object[$k]->left + $parentWidth / 2) * $_object->scaleX * $objects[$i]->scaleX);
                                                $_object_object[$k]->top = $componentTop + ($parentTop * $objects[$i]->scaleY + ($_object_object[$k]->top + $parentHeight / 2) * $_object->scaleY * $objects[$i]->scaleY);
                                                $_object_object[$k]->width = $_object_object[$k]->width * $_object_object[$k]->scaleX * $_object->scaleX * $objects[$i]->scaleX; //2022-11-11
                                                $_object_object[$k]->height = $_object_object[$k]->height * $_object_object[$k]->scaleY * $_object->scaleY * $objects[$i]->scaleY;

                                                $_object_object[$k]->strokeWidth = $_object_object[$k]->strokeWidth * $_object->scaleX * $objects[$i]->scaleX;

                                                $_object_object[$k]->scaleY = 1;
                                                $_object_object[$k]->scaleX = 1;


                                                //处理价格标签定位
                                                $lastSort=count($drawObjects);
                                                $drawObjects[$lastSort -1]->left=$_object_object[$k]->left + ($_object_object[$k]->width - $drawObjects[$lastSort -1]->width)/2;
                                                $drawObjects[$lastSort -1]->top=$_object_object[$k]->top + ($_object_object[$k]->height - $drawObjects[$lastSort -1]->height)/2;

                                            } else {

                                                $_object_object[$k]->left = $_object_object[$k]->left + $parentWidth / 2 + $parentLeft;
                                                $_object_object[$k]->top = $_object_object[$k]->top + $parentHeight / 2 + $parentTop;
                                                $_object_object[$k]->width = $_object_object[$k]->width * $objects[$i]->scaleX;
                                                $_object_object[$k]->height = $_object_object[$k]->height * $objects[$i]->scaleY;

                                            }




                                            if (property_exists($_object, "parentObjAngleX") == true) {
                                                $_object_object[$k]->parentObjAngleX = $_object->parentObjAngleX;
                                                $_object_object[$k]->parentObjAngleY = $_object->parentObjAngleY;
                                            }

                                            $_object_object[$k]->angle = $_object->angle;

                                            if (property_exists($_object_object[$k], "zIndex") == false) {
                                                $_object_object[$k]->zIndex = $_object->zIndex + $tmpzIndex;
                                            } else {
                                                $_object_object[$k]->zIndex = $_object->zIndex + $j + $tmpzIndex;
                                            }

                                            array_push($drawObjects, $_object_object[$k]);

                                        }

                                    }



                                } else if ($_object->dType == "productPriceGroup_old_ok_20230418" and $_object->type == "group") {

                                    //画线类文本
                                    if (property_exists($_object, "objects") == false) {

                                        if ($this->previewMode) {
                                            echo " Normal Price data is error ";exit;
                                        } else {
                                            $errTxt = $fontname . $styleName . " style font does not exist! <br>Please check: Markeing > config > font ";
                                            echo '<script>parent.layer.confirm("Normal Price data is error", {title: \'Error\', btn: [\'Close\']});</script>';exit;
                                        }
                                    }

                                    $componentTop = $objects[$i]->top;
                                    $componentLeft = $objects[$i]->left;
                                    //划线价分组属性
                                    $parentLeft = ($_object->left + $objects[$i]->width / 2);
                                    $parentTop = ($_object->top + $objects[$i]->height / 2);
                                    $parentWidth = $_object->source_width;
                                    $parentHeight = $_object->source_height;

                                    $_object_object = $_object->objects;
                                    for ($k = 0; $k < count($_object_object); $k++) {

                                        if (property_exists($_object_object[$k], "type") == true) {
                                            $tmpzIndex = 2;
                                            if ($_object_object[$k]->type == "i-text") {
                                                $tmpzIndex = 1;
                                                $_object_object[$k]->dType = "priceText";
                                            } else {
                                                $_object_object[$k]->dType = "priceUndeline";
                                            }

                                            $eScaleX = $_object->scaleX;

                                            if ($_object_object[$k]->type == "i-text") {

                                                $_object_object[$k]->fontSize = $_object_object[$k]->fontSize * $_object->scaleX * $objects[$i]->scaleY;

                                                $_object_object[$k]->left = $componentLeft + ($parentLeft * $objects[$i]->scaleX + ($_object_object[$k]->left + $parentWidth / 2) * $_object->scaleX * $objects[$i]->scaleX);

                                                if ($_object_object[$k]->top != "NaN" and $_object_object[$k]->top != null and $_object_object[$k]->top != "" and $_object_object[$k]->top > 0) {
                                                    $_object_object[$k]->top = $componentTop + ($parentTop * $objects[$i]->scaleY + ($_object_object[$k]->top + $parentHeight / 2) * $_object->scaleY * $objects[$i]->scaleY);
                                                } else {

                                                    $itextHeight = $_object_object[$k]->height * $_object_object[$k]->scaleY * $_object->scaleY * $objects[$i]->scaleY;

                                                    $_object_object[$k]->top = ($itextHeight) / 2 * -1;
                                                    $_object_object[$k]->top = $componentTop + ($parentTop * $objects[$i]->scaleY + ($_object_object[$k]->top + $parentHeight / 2) * $_object->scaleY * $objects[$i]->scaleY);
                                                }

                                                $_object_object[$k]->width = $_object_object[$k]->width * $_object_object[$k]->scaleX * $_object->scaleX * $objects[$i]->scaleX;
                                                $_object_object[$k]->height = $_object_object[$k]->height * $_object_object[$k]->scaleY * $_object->scaleY * $objects[$i]->scaleY;

                                                $_object_object[$k]->scaleY = 1;
                                                $_object_object[$k]->scaleX = 1;

                                            } else if ($_object_object[$k]->type == "line") {

                                                $_object_object[$k]->x1 = $componentLeft + ($parentLeft * $objects[$i]->scaleX + ($_object_object[$k]->x1 + $parentWidth / 2) * $_object->scaleX * $objects[$i]->scaleX);
                                                $_object_object[$k]->x2 = $componentLeft + ($parentLeft * $objects[$i]->scaleX + ($_object_object[$k]->x2 + $parentWidth / 2) * $_object->scaleX * $objects[$i]->scaleX);
                                                $_object_object[$k]->y1 = $componentTop + ($parentTop * $objects[$i]->scaleY + ($_object_object[$k]->y1 + $parentHeight / 2) * $_object->scaleY * $objects[$i]->scaleY);
                                                $_object_object[$k]->y2 = $componentTop + ($parentTop * $objects[$i]->scaleY + ($_object_object[$k]->y2 + $parentHeight / 2) * $_object->scaleY * $objects[$i]->scaleY);

                                                $_object_object[$k]->left = $componentLeft + ($parentLeft * $objects[$i]->scaleX + ($_object_object[$k]->left + $parentWidth / 2) * $_object->scaleX * $objects[$i]->scaleX);
                                                $_object_object[$k]->top = $componentTop + ($parentTop * $objects[$i]->scaleY + ($_object_object[$k]->top + $parentHeight / 2) * $_object->scaleY * $objects[$i]->scaleY);
                                                $_object_object[$k]->width = $_object_object[$k]->width * $_object_object[$k]->scaleX * $_object->scaleX * $objects[$i]->scaleX; //2022-11-11
                                                $_object_object[$k]->height = $_object_object[$k]->height * $_object_object[$k]->scaleY * $_object->scaleY * $objects[$i]->scaleY;

                                                $_object_object[$k]->strokeWidth = $_object_object[$k]->strokeWidth * $_object->scaleX * $objects[$i]->scaleX;

                                                $_object_object[$k]->scaleY = 1;
                                                $_object_object[$k]->scaleX = 1;

                                            } else {

                                                $_object_object[$k]->left = $_object_object[$k]->left + $parentWidth / 2 + $parentLeft;
                                                $_object_object[$k]->top = $_object_object[$k]->top + $parentHeight / 2 + $parentTop;
                                                $_object_object[$k]->width = $_object_object[$k]->width * $objects[$i]->scaleX;
                                                $_object_object[$k]->height = $_object_object[$k]->height * $objects[$i]->scaleY;

                                            }

                                            if (property_exists($_object, "parentObjAngleX") == true) {
                                                $_object_object[$k]->parentObjAngleX = $_object->parentObjAngleX;
                                                $_object_object[$k]->parentObjAngleY = $_object->parentObjAngleY;
                                            }

                                            $_object_object[$k]->angle = $_object->angle;

                                            if (property_exists($_object_object[$k], "zIndex") == false) {
                                                $_object_object[$k]->zIndex = $_object->zIndex + $tmpzIndex;
                                            } else {
                                                $_object_object[$k]->zIndex = $_object->zIndex + $j + $tmpzIndex;
                                            }

                                            array_push($drawObjects, $_object_object[$k]);

                                        }

                                    }

                                } else {

                                    array_push($drawObjects, $_object);
                                }
                            }
                        }
                    } else if ($objects[$i]->type == "circle") {
                        $objects[$i]->radiusX = $objects[$i]->scaleX * $objects[$i]->radius;
                        $objects[$i]->radiusY = $objects[$i]->scaleY * $objects[$i]->radius;

                    }

                } else {
                    $drawObjects[$i]->zIndex = -1;
                }
            } else {
                $drawObjects[$i]->zIndex = -2;
            }
        }
        $objects = $drawObjects;
        //组装绘制任务，根据zIndex 从小到大 排序
        usort($objects, function ($a, $b) {

            return $a->zIndex < $b->zIndex ? -1 : 1;
        });

        return $objects;
    }


    //输出配置及计算预处理 (宽高位置)
    protected function outPretreatment($objects)
    {

        $drawObjects = [];
        for ($i = 0; $i < count($objects); $i++) {
            if ($objects[$i]->dType != "referenceLine") {
                if ($objects[$i]->visible == true) {

                    $tmp = array(
                        "left" => ($this->pxToUnit($objects[$i]->left * $this->scalePi)),
                        "top" => ($this->pxToUnit($objects[$i]->top * $this->scalePi)),
                        "width" => ($this->pxToUnit($objects[$i]->width * $objects[$i]->scaleX * $this->scalePi)),
                        "height" => ($this->pxToUnit($objects[$i]->height * $objects[$i]->scaleY * $this->scalePi)),
                        "type" => $objects[$i]->type,
                        //"dType"=>$objects[$i]->dType,

                        "scaleX" => $objects[$i]->scaleX,
                        "scaleY" => $objects[$i]->scaleY,
                        "angle" => $objects[$i]->angle,
                    );

                    $tmp["SkewX"] = 0;
                    $tmp["SkewY"] = 0;
                    if (property_exists($objects[$i], "skewX") == true) {
                        $tmp["SkewX"] = $objects[$i]->skewX;
                    }

                    if (property_exists($objects[$i], "skewY") == true) {
                        $tmp["SkewY"] = $objects[$i]->skewY;
                    }

                    if (property_exists($objects[$i], "opacity") == true) {
                        $tmp["opacity"] = $objects[$i]->opacity;
                    } else {
                        $tmp["opacity"] = 1;
                    }

                    //分组旋转角色时，子对象旋转坐标
                    if (property_exists($objects[$i], "parentObjAngleX") == true) {
                        $tmp["parentObjAngleX"] = $this->pxToUnit($objects[$i]->parentObjAngleX * $this->scalePi);
                        $tmp["parentObjAngleY"] = $this->pxToUnit($objects[$i]->parentObjAngleY * $this->scalePi);
                    }

                    if (property_exists($objects[$i], "parentAngle") == true) {
                        $tmp["parentAngle"] = ($objects[$i]->parentAngle);
                    } else {
                        $tmp["parentAngle"] = 0;
                    }

                    if (property_exists($objects[$i], "dType") == true) {
                        $tmp["dType"] = $objects[$i]->dType;
                    }

                    if (property_exists($objects[$i], "textLines") == true) {
                        $tmp["textLines"] = $objects[$i]->textLines;
                    }

                    //组件控制点
                    if (property_exists($objects[$i], "rotateXY") == true) {
                        $tmp["rotateXY"] = $objects[$i]->rotateXY;
                    }

                    //渐变色的尺寸
                    if (property_exists($objects[$i], "viewBoxHeight") == true) {
                        $tmp["viewBoxHeight"] = $objects[$i]->viewBoxHeight;
                    }
                    if (property_exists($objects[$i], "viewBoxWidth") == true) {
                        $tmp["viewBoxWidth"] = $objects[$i]->viewBoxWidth;
                    }

                    //根据不同类型分别差异化追加属性
                    switch ($tmp["type"]) {
                        //文本类型
                        case "textbox":
                        case "i-text":

                            $tmp["text"] = $objects[$i]->text;
                            $tmp["top"] = $this->pxToUnit($objects[$i]->top * $this->scalePi);
                            $tmp["left"] = $this->pxToUnit($objects[$i]->left * $this->scalePi);

                            // 20220808 pdf set color mode at out file
                            $hexColor = (property_exists($objects[$i], "fill") == true) ? $objects[$i]->fill : null;
                            $cmykColor = (property_exists($objects[$i], "fillCmyk") == true) ? $objects[$i]->fillCmyk : null;
                            $isValid = (empty($hexColor)) ? 0 : 1;
                            $tmp["fontColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                            $fontFamily = $this->getFontName($objects[$i]->fontFamily);
                            $tmp["fontFamily"] = $fontFamily;
                            $tmp["fontSize"] = $objects[$i]->fontSize * $objects[$i]->scaleX * $this->scalePi;

                            // Align:文本位置。L,左对齐,R,右对齐,C,居中,J,自动对齐
                            $tmp["textAlign"] = "J";
                            switch ($objects[$i]->textAlign) {
                                case "center":
                                    $tmp["textAlign"] = "C";
                                    break;
                                case "left":
                                    $tmp["textAlign"] = "L";
                                    break;
                                case "right":
                                    $tmp["textAlign"] = "R";
                                    break;
                            }

                            //字体是否加粗、斜体、下划线
                            $fontWeight = array("bold" => "b", "normal" => "");
                            $fontStyle = array("italic" => "i", "normal" => "");
                            $tmp["style"] = $fontWeight[$objects[$i]->fontWeight] . $fontStyle[$objects[$i]->fontStyle];


                            if (substr($tmp["text"],0,2)=="Te"){
                                //echo "OKI";exit;
                                // echo "OKI2=>" . json_encode($objects[$i]->shadow);exit;
                            }

                            //文本阴影
                            $tmp["shadw"] = null;
                            if ($objects[$i]->shadow != null && $objects[$i]->shadow != "") {
                                if ($objects[$i]->shadow->offsetX + $objects[$i]->shadow->offsetY <> 0) {

                                    // 20220808 pdf set color mode at out file
                                    $hexColor = (property_exists($objects[$i]->shadow, "color") == true) ? $objects[$i]->shadow->color : null;
                                    $cmykColor = (property_exists($objects[$i], "shadowColorCmyk") == true) ? $objects[$i]->shadowColorCmyk : null;
                                    $isValid = (empty($hexColor)) ? 0 : 1;
                                    $shadowColor = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                                    $tmp["shadw"] = array(
                                        "dw" => $this->pxToUnit($objects[$i]->shadow->offsetX),
                                        "dh" => $this->pxToUnit($objects[$i]->shadow->offsetY),
                                        "color" => $shadowColor,
                                    );
                                }
                            }

                            //文字描边
                            $tmp["strokeWidth"] = 0;
                            if (property_exists($objects[$i], "strokeWidth") == true) {
                                if ($objects[$i]->strokeWidth * 1 > 0) {
                                    $tmp["strokeWidth"] = $this->pxToUnit($objects[$i]->strokeWidth * $this->scalePi); //0727 启用
                                }
                            }

                            // 20220808 pdf set color mode at out file
                            $hexColor = (property_exists($objects[$i], "stroke") == true) ? $objects[$i]->stroke : null;
                            $cmykColor = (property_exists($objects[$i], "strokeCmyk") == true) ? $objects[$i]->strokeCmyk : null;
                            $isValid = (empty($hexColor) or $tmp["strokeWidth"] <= 0) ? 0 : 1;
                            $tmp["strokeColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                            $tmp["fontWeight"] = ($objects[$i]->fontWeight);
                            $tmp["fontStyle"] = $objects[$i]->fontStyle;
                            $tmp["textBackgroundColor"] = $objects[$i]->backgroundColor;
                            $tmp["backgroundColor"] = $objects[$i]->backgroundColor;
                            $tmp["backgroundColorCmyk"] = (property_exists($objects[$i], "backgroundColorCmyk") == true) ? $objects[$i]->backgroundColorCmyk : null;
                            $tmp["underline"] = $objects[$i]->underline;

                            //字间距
                            //$tmp["spacing"] = $this->pxToUnit(($objects[$i]->charSpacing * 0.001 * $tmp["fontSize"]));

                            if ($objects[$i]->charSpacing == 0 or $objects[$i]->charSpacing == null or $objects[$i]->charSpacing == "undefined") {
                                $tmp["spacing"] = 0.001; //解决泰文文字拆分问题 san 0720

                                //在这里补宽度 0.001 * 字数
                                $tmp["width"] = $tmp["width"] * 1.1;

                                if ($tmp["textAlign"] == "C") {
                                    $tmp["left"] = $tmp["left"] - $tmp["width"] * 0.05;
                                } else if ($tmp["textAlign"] == "R") {
                                    $tmp["left"] = $tmp["left"] - $tmp["width"] * 0.1;
                                }

                            } else {
                                $tmp["spacing"] = $this->pxToUnit($objects[$i]->charSpacing * 0.001 * $tmp["fontSize"]);
                            }

                            //行间距
                            if (property_exists($objects[$i], "textLines") == true) {
                                $moreLine = $objects[$i]->textLines;
                                if (!isset($moreLine[1])) {
                                    $tmp["lineHeight"] = $objects[$i]->lineHeight * 1;
                                } else {
                                    $tmp["lineHeight"] = $objects[$i]->lineHeight * 1;
                                }
                            } else {
                                $tmp["lineHeight"] = $objects[$i]->lineHeight * 1;
                            }

                            //多行文字
                            if (property_exists($objects[$i], "textLines") == true) {
                                $tmp["textLines"] = $objects[$i]->textLines;
                            } else {
                                $tmp["textLines"] = null;
                            }

                            break;
                        case "image":

                            $tmp["src"] = $objects[$i]->src;
                            break;
                        case "rect":

                            //边框
                            if (property_exists($objects[$i], "strokeWidth") == true) {
                                if ($objects[$i]->strokeWidth * 1 > 0) {
                                    $tmp["strokeWidth"] = $this->pxToUnit($objects[$i]->strokeWidth * $objects[$i]->scaleX) * $this->scalePi;
                                    $tmp["strokePt"] = $objects[$i]->strokeWidth;
                                } else {
                                    $tmp["strokeWidth"] = 0;
                                    $tmp["strokePt"] = 0;
                                }
                            } else {
                                $tmp["strokeWidth"] = 0;
                                $tmp["strokePt"] = 0;
                            }

                            if (property_exists($objects[$i], "rx") == true) {
                                $tmp["rx"] = $this->pxToUnit($objects[$i]->rx);
                            }

                            // 20220808 pdf set color mode at out file
                            $hexColor = (property_exists($objects[$i], "stroke") == true) ? $objects[$i]->stroke : null;
                            $cmykColor = (property_exists($objects[$i], "strokeCmyk") == true) ? $objects[$i]->strokeCmyk : null;
                            $isValid = (empty($hexColor) or $tmp["strokeWidth"] <= 0) ? 0 : 1;
                            $tmp["strokeColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                            $tmp["dash"] = null;
                            if ($objects[$i]->strokeDashArray) {
                                $tmp["dash"] = $objects[$i]->strokeDashArray;
                            }

                            //填充
                            // 20220808 pdf set color mode at out file
                            $tmp["fillColor"] = null;
                            if (property_exists($objects[$i], "fill") == true) {

                                if (is_string($objects[$i]->fill)) {
                                    $tmp["fillMode"] = "color";
                                    $hexColor = (property_exists($objects[$i], "fill") == true) ? $objects[$i]->fill : null;
                                    $cmykColor = (property_exists($objects[$i], "fillCmyk") == true) ? $objects[$i]->fillCmyk : null;
                                    $isValid = (empty($hexColor)) ? 0 : 1;
                                    $tmp["fillColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);
                                } else if (property_exists($objects[$i]->fill, "type") == true) {
                                    $tmp["fillColor"] = $objects[$i]->fill;
                                    $tmp["fillMode"] = "gradientColor";
                                }
                            }
                            break;
                        case "circle":

                            //半径
                            //$tmp["radius"] = $this->pxToUnit($objects[$i]->radius * 1 * $objects[$i]->scaleX * $this->scalePi);
                            $tmp["radiusX"] = $this->pxToUnit($objects[$i]->radiusX * 1 * $this->scalePi);
                            $tmp["radiusY"] = $this->pxToUnit($objects[$i]->radiusY * 1 * $this->scalePi);

                            if (round($objects[$i]->scaleX, 3) != round($objects[$i]->scaleY, 3)) {
                                $tmp["type"] = "ellipse";
                            }

                            //边框
                            if (property_exists($objects[$i], "strokeWidth") == true) {
                                if ($objects[$i]->strokeWidth * 1 > 0) {
                                    $strokeScale = ($objects[$i]->scaleX > $objects[$i]->scaleY) ? $objects[$i]->scaleY : $objects[$i]->scaleX;
                                    $tmp["strokeWidth"] = $this->pxToUnit($objects[$i]->strokeWidth * $strokeScale) * $this->scalePi;
                                } else {
                                    $tmp["strokeWidth"] = 0;
                                }
                            } else {
                                $tmp["strokeWidth"] = 0;
                            }

                            // 20220808 pdf set color mode at out file
                            $hexColor = (property_exists($objects[$i], "stroke") == true) ? $objects[$i]->stroke : null;
                            $cmykColor = (property_exists($objects[$i], "strokeCmyk") == true) ? $objects[$i]->strokeCmyk : null;
                            $isValid = (empty($hexColor) or $tmp["strokeWidth"] <= 0) ? 0 : 1;

                            $tmp["strokeColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                            $tmp["dash"] = null;
                            if ($objects[$i]->strokeDashArray) {
                                $tmp["dash"] = $objects[$i]->strokeDashArray;
                            }

                            //填充
                            // 20220808 pdf set color mode at out file
                            $tmp["fillColor"] = null;
                            $tmp["fillMode"] = "D";
                            if (property_exists($objects[$i], "fill") == true) {

                                if (is_string($objects[$i]->fill)) {
                                    $hexColor = (property_exists($objects[$i], "fill") == true) ? $objects[$i]->fill : null;
                                    $cmykColor = (property_exists($objects[$i], "fillCmyk") == true) ? $objects[$i]->fillCmyk : null;
                                    $isValid = (empty($hexColor)) ? 0 : 1;
                                    $tmp["fillColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                                } else if (property_exists($objects[$i]->fill, "type") == true) {
                                    $tmp["fillColor"] = $objects[$i]->fill;
                                    $tmp["fillMode"] = "gradientColor";
                                }

                            }
                            break;

                        case "ellipse":

                            //半径

                            $tmp["radiusX"] = $this->pxToUnit($objects[$i]->rx * $objects[$i]->scaleX * $this->scalePi);
                            $tmp["radiusY"] = $this->pxToUnit($objects[$i]->ry * $objects[$i]->scaleY * $this->scalePi);

                            // $tmp["radiusX"] = $this->pxToUnit($objects[$i]->rx *  $objects[$i]->scaleX * $this->scalePi);
                            // $tmp["radiusY"] = $this->pxToUnit($objects[$i]->ry * $objects[$i]->scaleY * $this->scalePi);

                            //边框
                            if (property_exists($objects[$i], "strokeWidth") == true) {
                                if ($objects[$i]->strokeWidth * 1 > 0) {
                                    $strokeScale = ($objects[$i]->scaleX > $objects[$i]->scaleY) ? $objects[$i]->scaleY : $objects[$i]->scaleX;
                                    $tmp["strokeWidth"] = $this->pxToUnit($objects[$i]->strokeWidth * $strokeScale) * $this->scalePi;
                                } else {
                                    $tmp["strokeWidth"] = 0;
                                }
                            } else {
                                $tmp["strokeWidth"] = 0;
                            }

                            // 20220808 pdf set color mode at out file
                            $hexColor = (property_exists($objects[$i], "stroke") == true) ? $objects[$i]->stroke : null;
                            $cmykColor = (property_exists($objects[$i], "strokeCmyk") == true) ? $objects[$i]->strokeCmyk : null;
                            $isValid = (empty($hexColor) or $tmp["strokeWidth"] <= 0) ? 0 : 1;

                            $tmp["strokeColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                            $tmp["dash"] = null;
                            if ($objects[$i]->strokeDashArray) {
                                $tmp["dash"] = $objects[$i]->strokeDashArray;
                            }

                            //填充
                            // 20220808 pdf set color mode at out file
                            $tmp["fillColor"] = null;
                            $tmp["fillMode"] = "D";
                            if (property_exists($objects[$i], "fill") == true) {

                                if (is_string($objects[$i]->fill)) {
                                    $hexColor = (property_exists($objects[$i], "fill") == true) ? $objects[$i]->fill : null;
                                    $cmykColor = (property_exists($objects[$i], "fillCmyk") == true) ? $objects[$i]->fillCmyk : null;
                                    $isValid = (empty($hexColor)) ? 0 : 1;
                                    $tmp["fillColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                                } else if (property_exists($objects[$i]->fill, "type") == true) {
                                    $tmp["fillColor"] = $objects[$i]->fill;
                                    $tmp["fillMode"] = "gradientColor";
                                }

                            }
                            break;

                        case "polygon":

                            //边框
                            if (property_exists($objects[$i], "strokeWidth") == true) {
                                $tmp["strokeWidth"] = $this->pxToUnit($objects[$i]->strokeWidth * 1) * $this->scalePi * $objects[$i]->scaleX;
                            } else {
                                $tmp["strokeWidth"] = 0;
                            }

                            // 20220808 pdf set color mode at out file
                            $hexColor = (property_exists($objects[$i], "stroke") == true) ? $objects[$i]->stroke : null;
                            $cmykColor = (property_exists($objects[$i], "strokeCmyk") == true) ? $objects[$i]->strokeCmyk : null;
                            $isValid = (empty($hexColor) or $tmp["strokeWidth"] <= 0) ? 0 : 1;
                            $tmp["strokeColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                            $tmp["dash"] = null;
                            if ($objects[$i]->strokeDashArray) {
                                $tmp["dash"] = $objects[$i]->strokeDashArray;
                            }

                            $points = null;
                            if ($objects[$i]->points) {
                                //线条
                                $points = [];

                                $pathOffsetX = -1;
                                $pathOffsetY = -1;
                                foreach ($objects[$i]->points as $p) {

                                    if ($pathOffsetY == -1) {
                                        $pathOffsetY = ($p->y * $objects[$i]->scaleY);
                                    } else {
                                        if ($pathOffsetY > $p->y * $objects[$i]->scaleY) {
                                            $pathOffsetY = $p->y * $objects[$i]->scaleY;
                                        }
                                    }

                                    if ($pathOffsetX == -1) {
                                        $pathOffsetX = ($p->x * $objects[$i]->scaleX);
                                    } else {
                                        if ($pathOffsetX > $p->x * $objects[$i]->scaleX) {
                                            $pathOffsetX = $p->x * $objects[$i]->scaleX;
                                        }
                                    }
                                }

                                foreach ($objects[$i]->points as $p) {

                                    array_push($points, $this->pxToUnit(($p->x * $this->scalePi * $objects[$i]->scaleX - $pathOffsetX * $this->scalePi)) + $tmp["left"] + $tmp["strokeWidth"] *0 / 2);
                                    array_push($points, $this->pxToUnit(($p->y * $this->scalePi * $objects[$i]->scaleY - $pathOffsetY * $this->scalePi)) + $tmp["top"] + $tmp["strokeWidth"] *0 / 2);
                                }

                                $tmp["points"] = $points;

                                //填充
                                // 20220808 pdf set color mode at out file
                                $tmp["fillColor"] = null;
                                if (property_exists($objects[$i], "fill") == true) {

                                    if (is_string($objects[$i]->fill)) {
                                        $hexColor = (property_exists($objects[$i], "fill") == true) ? $objects[$i]->fill : null;
                                        $cmykColor = (property_exists($objects[$i], "fillCmyk") == true) ? $objects[$i]->fillCmyk : null;
                                        $isValid = (empty($hexColor)) ? 0 : 1;
                                        $tmp["fillColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);
                                        $tmp["fillMode"] = "color";
                                    } else if (property_exists($objects[$i]->fill, "type") == true) {
                                        $tmp["fillColor"] = $objects[$i]->fill;
                                        $tmp["fillMode"] = "gradientColor";
                                    }

                                }

                            } else if ($objects[$i]->path) {
                                //非线条
                                $points = [];
                                foreach ($objects[$i]->path as $p) {
                                    array_push($points, $this->pxToUnit($p[1] * $this->scalePi));
                                    array_push($points, $this->pxToUnit($p[2] * $this->scalePi));
                                }
                                $tmp["points"] = $points;

                                //填充
                                // 20220808 pdf set color mode at out file
                                $tmp["fillColor"] = null;
                                if (property_exists($objects[$i], "fill") == true) {

                                    if (is_string($objects[$i]->fill)) {
                                        $hexColor = (property_exists($objects[$i], "fill") == true) ? $objects[$i]->fill : null;
                                        $cmykColor = (property_exists($objects[$i], "fillCmyk") == true) ? $objects[$i]->fillCmyk : null;
                                        $isValid = (empty($hexColor)) ? 0 : 1;
                                        $tmp["fillColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);
                                        $tmp["fillMode"] = "color";
                                    } else if (property_exists($objects[$i]->fill, "type") == true) {
                                        $tmp["fillColor"] = $objects[$i]->fill;
                                        $tmp["fillMode"] = "gradientColor";
                                    }

                                }
                            }

                            break;

                        case "polygon_bak20220812":

                            //边框
                            if (property_exists($objects[$i], "strokeWidth") == true) {
                                $tmp["strokeWidth"] = $this->pxToUnit($objects[$i]->strokeWidth * 1) * $this->scalePi * $objects[$i]->scaleX;
                            } else {
                                $tmp["strokeWidth"] = 0;
                            }

                            // 20220808 pdf set color mode at out file
                            $hexColor = (property_exists($objects[$i], "stroke") == true) ? $objects[$i]->stroke : null;
                            $cmykColor = (property_exists($objects[$i], "strokeCmyk") == true) ? $objects[$i]->strokeCmyk : null;
                            $isValid = (empty($hexColor) or $tmp["strokeWidth"] <= 0) ? 0 : 1;
                            $tmp["strokeColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                            $tmp["dash"] = null;
                            if ($objects[$i]->strokeDashArray) {
                                $tmp["dash"] = $objects[$i]->strokeDashArray;
                            }

                            $points = null;
                            if ($objects[$i]->points) {
                                //线条
                                $points = [];

                                $pathOffsetX = 0;
                                $pathOffsetY = 0;
                                foreach ($objects[$i]->points as $p) {

                                    if ($pathOffsetY == 0) {
                                        $pathOffsetY = ($p->y * $objects[$i]->scaleY);
                                    } else {
                                        if ($pathOffsetY > $p->y * $objects[$i]->scaleY) {
                                            $pathOffsetY = $p->y * $objects[$i]->scaleY;
                                        }
                                    }

                                    if ($pathOffsetX == 0) {
                                        $pathOffsetX = ($p->x * $objects[$i]->scaleX);
                                    } else {
                                        if ($pathOffsetX > $p->x * $objects[$i]->scaleX) {
                                            $pathOffsetX = $p->x * $objects[$i]->scaleX;
                                        }
                                    }
                                }

                                foreach ($objects[$i]->points as $p) {

                                    array_push($points, $this->pxToUnit(($p->x * $this->scalePi * $objects[$i]->scaleX - $pathOffsetX * $this->scalePi)) + $tmp["left"] + $tmp["strokeWidth"] / 2);
                                    array_push($points, $this->pxToUnit(($p->y * $this->scalePi * $objects[$i]->scaleY - $pathOffsetY * $this->scalePi)) + $tmp["top"] + $tmp["strokeWidth"] / 2);

                                }

                                $tmp["points"] = $points;

                                //$tmp["fillColor"] = null; //需要优化有填充颜色  20220808 pdf set color mode at out file --> del

                                //填充
                                // 20220808 pdf set color mode at out file
                                $tmp["fillColor"] = null;
                                $hexColor = (property_exists($objects[$i], "fill") == true) ? $objects[$i]->fill : null;
                                $cmykColor = (property_exists($objects[$i], "fillCmyk") == true) ? $objects[$i]->fillCmyk : null;
                                $isValid = (empty($hexColor)) ? 0 : 1;
                                $tmp["fillColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                            } else if ($objects[$i]->path) {
                                //非线条
                                $points = [];
                                foreach ($objects[$i]->path as $p) {
                                    array_push($points, $this->pxToUnit($p[1] * $this->scalePi));
                                    array_push($points, $this->pxToUnit($p[2] * $this->scalePi));
                                }
                                $tmp["points"] = $points;

                                //填充
                                // 20220808 pdf set color mode at out file
                                $tmp["fillColor"] = null;
                                $hexColor = (property_exists($objects[$i], "fill") == true) ? $objects[$i]->fill : null;
                                $cmykColor = (property_exists($objects[$i], "fillCmyk") == true) ? $objects[$i]->fillCmyk : null;
                                $isValid = (empty($hexColor)) ? 0 : 1;
                                $tmp["fillColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                            }

                            break;
                        case "path":

                            //边框
                            if (property_exists($objects[$i], "strokeWidth") == true) {
                                if ($objects[$i]->strokeWidth * 1 > 0) {
                                    //$tmp["strokeWidth"] = ($objects[$i]->strokeWidth * 1) * $this->scalePi;
                                    $tmp["strokeWidth"] = ($objects[$i]->strokeWidth * 1);
                                } else {
                                    $tmp["strokeWidth"] = 0;
                                }
                            } else {
                                $tmp["strokeWidth"] = 0;
                            }

                            // 20220808 pdf set color mode at out file
                            $hexColor = (property_exists($objects[$i], "stroke") == true) ? $objects[$i]->stroke : null;
                            $cmykColor = (property_exists($objects[$i], "strokeCmyk") == true) ? $objects[$i]->strokeCmyk : null;
                            $isValid = (empty($hexColor) or $tmp["strokeWidth"] <= 0) ? 0 : 1;
                            $tmp["strokeColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                            $tmp["dash"] = null;
                            if ($objects[$i]->strokeDashArray) {
                                $tmp["dash"] = $objects[$i]->strokeDashArray;
                            }

                            $pathOffsetX = $objects[$i]->pathOffset->x;
                            $pathOffsetY = $objects[$i]->pathOffset->y;

                            $points = null;
                            if ($objects[$i]->path) {

                                //非线条
                                $points = [];
                                $scalePx = $objects[$i]->scaleX * $this->scalePi * 1;
                                $scalePy = $objects[$i]->scaleY * $this->scalePi * 1;
                                $dText = '';
                                foreach ($objects[$i]->path as $p) {

                                    if (isset($p[1])) {

                                        $tmpPI = [];
                                        if (count($p) == 3) {

                                            $p[3] = $p[1];
                                            $p[4] = $p[2];
                                            $p[5] = $p[1];
                                            $p[6] = $p[2];

                                        }

                                        $dText = $dText . $p[0];
                                        for ($px = 1; $px < count($p); $px++) {

                                            if ($px % 2 != 0) {

                                                $dText = $dText . ($tmp["left"] * 1 + $this->pxToUnit($p[$px] * $scalePx - $pathOffsetX * $scalePx * 1) + $tmp["width"] / 2 + $tmp["strokeWidth"]*0) . ',';
                                            } else {

                                                $dText = $dText . ($tmp["top"] * 1 + $this->pxToUnit($p[$px] * $scalePy - $pathOffsetY * $scalePy * 1) + $tmp["height"] / 2 + $tmp["strokeWidth"]*0) . ',';
                                            }

                                        }

                                        $dText = substr($dText, 0, strlen($dText) - 1);

                                        array_push($points, $tmpPI);

                                    } else if ($p[0] == "z" or $p[0] == "Z") {

                                        $dText = $dText . 'z';

                                    }
                                }

    
                                $tmp["dText"] = $dText;
                                $tmp["strokeWidth"] = $this->pxToUnit($objects[$i]->strokeWidth * $objects[$i]->scaleX * $this->scalePi);

                                //填充
                                // 20220808 pdf set color mode at out file
                                $tmp["fillColor"] = null;
                                if (property_exists($objects[$i], "fill") == true) {

                                    if ($objects[$i]->fill == null or $objects[$i]->fill == "null") {
                                        $objects[$i]->fill = "";
                                    }

                                    if (is_string($objects[$i]->fill)) {
                                        //纯色填充
                                        $tmp["fillMode"] = "color";
                                        $hexColor = (property_exists($objects[$i], "fill") == true) ? $objects[$i]->fill : null;
                                        $cmykColor = (property_exists($objects[$i], "fillCmyk") == true) ? $objects[$i]->fillCmyk : null;
                                        $isValid = (empty($hexColor)) ? 0 : 1;
                                        $tmp["fillColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);
                                    } else if (property_exists($objects[$i]->fill, "type") == true) {
                                        //渐变色填充
                                        $tmp["fillColor"] = $objects[$i]->fill;
                                        $tmp["fillMode"] = "gradientColor";
                                    }

                                }
                            }

                            break;

                        case "path_bak_2023-02-18":

                            //边框
                            if (property_exists($objects[$i], "strokeWidth") == true) {
                                if ($objects[$i]->strokeWidth * 1 > 0) {
                                    //$tmp["strokeWidth"] = ($objects[$i]->strokeWidth * 1) * $this->scalePi;
                                    $tmp["strokeWidth"] = ($objects[$i]->strokeWidth * 1);
                                } else {
                                    $tmp["strokeWidth"] = 0;
                                }
                            } else {
                                $tmp["strokeWidth"] = 0;
                            }

                            // 20220808 pdf set color mode at out file
                            $hexColor = (property_exists($objects[$i], "stroke") == true) ? $objects[$i]->stroke : null;
                            $cmykColor = (property_exists($objects[$i], "strokeCmyk") == true) ? $objects[$i]->strokeCmyk : null;
                            $isValid = (empty($hexColor) or $tmp["strokeWidth"] <= 0) ? 0 : 1;
                            $tmp["strokeColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                            $tmp["dash"] = null;
                            if ($objects[$i]->strokeDashArray) {
                                $tmp["dash"] = $objects[$i]->strokeDashArray;
                            }

                            $pathOffsetX = $objects[$i]->pathOffset->x;
                            $pathOffsetY = $objects[$i]->pathOffset->y;

                            $points = null;
                            if ($objects[$i]->path) {

                                $pathMinX = -1;
                                $pathMinY = -1;
                                foreach ($objects[$i]->path as $p) {

                                    if (isset($p[1])) {
                                        if ($pathMinY == -1) {
                                            $pathMinY = ($p[2] * $objects[$i]->scaleY);
                                        } else {
                                            if ($pathMinY > $p[2] * $objects[$i]->scaleY) {
                                                $pathMinY = $p[2] * $objects[$i]->scaleY;
                                            }
                                        }

                                        if ($pathMinX == -1) {
                                            $pathMinX = ($p[1] * $objects[$i]->scaleX);
                                        } else {
                                            if ($pathMinX > $p[1] * $objects[$i]->scaleX) {
                                                $pathMinX = $p[1] * $objects[$i]->scaleX;
                                            }
                                        }
                                    }
                                }

                                $tmp["pathStartX"] = $this->pxToUnit($objects[$i]->path[0][1] * $objects[$i]->scaleX * $this->scalePi);
                                $tmp["pathStartY"] = $this->pxToUnit($objects[$i]->path[0][2] * $objects[$i]->scaleX * $this->scalePi);

                                //非线条
                                $points = [];
                                $scalePx = $objects[$i]->scaleX * $this->scalePi;
                                $scalePy = $objects[$i]->scaleY * $this->scalePi;

                                foreach ($objects[$i]->path as $p) {

                                    if (isset($p[1])) {

                                        $tmpPI = [];
                                        if (count($p) == 3) {

                                            $p[3] = $p[1];
                                            $p[4] = $p[2];
                                            $p[5] = $p[1];
                                            $p[6] = $p[2];

                                        }

                                        for ($px = 1; $px < count($p); $px++) {

                                            if ($px % 2 != 0) {
                                                array_push($tmpPI, $tmp["left"] * 1 + $this->pxToUnit($p[$px] * $scalePx - $pathOffsetX * $scalePx * 1) + $tmp["width"] / 2);
                                            } else {
                                                array_push($tmpPI, $tmp["top"] * 1 + $this->pxToUnit($p[$px] * $scalePy - $pathOffsetY * $scalePy * 1) + $tmp["height"] / 2);
                                            }

                                        }

                                        array_push($points, $tmpPI);

                                    } else if ($p[0] == "z" or $p[0] == "Z") {
                                        //echo "is have";exit;
                                        //路径闭环合并处理
                                        $lastIndex = count($points) - 1;
                                        $lastPointType = $objects[$i]->path[$lastIndex][0];
                                        if ($lastPointType == "L") {
                                            $zPoint = [];

                                            //控制点 1 的坐标
                                            $zPoint[0] = $points[$lastIndex][0];
                                            $zPoint[1] = $points[$lastIndex][1];

                                            //控制点 2 的坐标
                                            $zPoint[2] = $points[$lastIndex][2];
                                            $zPoint[3] = $points[$lastIndex][3];

                                            //终点坐标
                                            $zPoint[4] = $points[0][0];
                                            $zPoint[5] = $points[0][1];
                                            array_push($points, $zPoint);
                                        }

                                    }
                                }

                                $tmp["points"] = $points;
                                //echo json_encode($points);exit;
                                $tmp["strokeWidth"] = $this->pxToUnit($objects[$i]->strokeWidth * $objects[$i]->scaleX * $this->scalePi);

                                //填充
                                // 20220808 pdf set color mode at out file
                                $tmp["fillColor"] = null;
                                if (property_exists($objects[$i], "fill") == true) {

                                    if (is_string($objects[$i]->fill)) {
                                        $tmp["fillMode"] = "color";
                                        $hexColor = (property_exists($objects[$i], "fill") == true) ? $objects[$i]->fill : null;
                                        $cmykColor = (property_exists($objects[$i], "fillCmyk") == true) ? $objects[$i]->fillCmyk : null;
                                        $isValid = (empty($hexColor)) ? 0 : 1;
                                        $tmp["fillColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);
                                    } else if (property_exists($objects[$i]->fill, "type") == true) {
                                        $tmp["fillColor"] = $objects[$i]->fill;
                                        $tmp["fillMode"] = "gradientColor";
                                    }

                                }
                            }

                            break;
                        case "line":
                            //边框
                            if (property_exists($objects[$i], "strokeWidth") == true) {
                                if ($objects[$i]->strokeWidth * 1 > 0) {
                                    $tmp["strokeWidth"] = $this->pxToUnit($objects[$i]->strokeWidth * 1);
                                } else {
                                    $tmp["strokeWidth"] = 0;
                                }
                            } else {
                                $tmp["strokeWidth"] = 0;
                            }

                            // 20220808 pdf set color mode at out file
                            $hexColor = (property_exists($objects[$i], "stroke") == true) ? $objects[$i]->stroke : null;
                            $cmykColor = (property_exists($objects[$i], "strokeCmyk") == true) ? $objects[$i]->strokeCmyk : null;
                            $isValid = (empty($hexColor) or $tmp["strokeWidth"] <= 0) ? 0 : 1;
                            $tmp["strokeColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                            $tmp["x1"] = $this->pxToUnit($objects[$i]->x1);
                            $tmp["y1"] = $this->pxToUnit($objects[$i]->y1);

                            $tmp["x2"] = $this->pxToUnit($objects[$i]->x2);
                            $tmp["y2"] = $this->pxToUnit($objects[$i]->y2);

                            break;
                    }

                    //写入任务清单
                    array_push($drawObjects, $tmp);
                    $tmp = null;
                }
            }
        }

        return $drawObjects;
    }

    //新增pdf页面并渲染数据
    public function createRender()
    {
        $this->PDFDOC->setJPEGQuality(100);

        //已处理模板页数据遍历
        $templatePagesData = $this->templatePagesData;
        foreach ($templatePagesData as $k => $v) {

            $objects = $templatePagesData[$k]->objects;

            //分组拆分及zIndex排序
            $objects = $this->objectsSplitSort($objects);
            // if ($k>2){exit;}
            //输出配置及计算预处理
            $objects = $this->outPretreatment($objects);

            //新增一个页面
            if ($this->paperBleed["width"] >= $this->paperBleed["height"]) {
                //横向打印
                $this->PDFDOC->AddPage("L");
            } else {
                //纵向打印
                $this->PDFDOC->AddPage();
            }

            //偏历绘制组件
            if (count($objects) >= 1) {
                for ($i = 0; $i < count($objects); $i++) {
                    $tmp = $objects[$i];

                    // if (in_array("strokeWidth", $tmp) == false) {
                    if (isset($tmp["strokeWidth"]) == false) {
                        $tmp["strokeWidth"] = 0;
                    }
                    // if (in_array("strokeColor", $tmp) == false) {
                    if (isset($tmp["strokeColor"]) == false) {
                        $tmp["strokeColor"] = "";
                    }

                    switch ($tmp["type"]) {

                        case "textbox":
                        case "i-text":

                            //计算设计器与TCPDF 坐标偏移量

                            if (array_key_exists("backgroundColor", $tmp) == true) {
                                //文本没有设置背景色时 加 偏移量
                                if ($tmp["backgroundColor"]==""){
                                    if ($tmp["strokeWidth"]*1>0){
                                        if ($tmp["textLines"] != null) {

                                            if (count($tmp["textLines"]) > 1) {
                                                //有边框多行
                                                // $tmp["top"] = $tmp["top"] + $tmp["strokeWidth"] * 2 * count($tmp["textLines"]);
                                                $tmp["top"] = $tmp["top"] + $tmp["strokeWidth"] * 2;// * count($tmp["textLines"]);
                                                $tmp["left"] = $tmp["left"] + $this->pxToUnit($tmp["fontSize"] * 0.065 * 1);
                                            } else {
                                                //有边框单行 OK
                                                $tmp["top"] = $tmp["top"] + $this->pxToUnit($tmp["fontSize"] * 0.056 * 1);// + $tmp["strokeWidth"] * 2;
                                                $tmp["left"] = $tmp["left"] - $this->pxToUnit($tmp["fontSize"] * 0.065 * 1);
                                            }

                                        }
                                        
                                    }else{
                                        
                                        if (count($tmp["textLines"]) > 1) {
                                            //无边框多行 OK
                                            $tmp["top"] = $tmp["top"] + $this->pxToUnit($tmp["fontSize"] * 0.056 * 1);
                                            $tmp["left"] = $tmp["left"] + $this->pxToUnit($tmp["fontSize"] * 0.056 * 1);
                                        }else{
                                            //无边框单行 OK
                                            $tmp["top"] = $tmp["top"] + $this->pxToUnit($tmp["fontSize"] * 0.056 * 2);
                                            $tmp["left"] = $tmp["left"] - $this->pxToUnit($tmp["fontSize"] * 0.056 * 1);
                                        }

                                    }
                                    
                                }
                                
                            } else {
                                //本文本有设置背景色时 保持定位不变
                                //$tmp["top"] = $tmp["top"] + $this->pxToUnit($tmp["fontSize"] * 0.065 * 2);
                            }

                            //字体、样式
                            $fontname = $tmp["fontFamily"];
                            $xetName = ($tmp["style"] != "") ? "" . $tmp["style"] : "";

                            $fontKey = empty($xetName) ? $fontname : $fontname . '-' . $xetName;
                            if (!isset($this->fontData[$fontKey])) {
                                if ($tmp["style"] == "") {
                                    $styleName = " regular";
                                } else if ($tmp["style"] == "b") {
                                    $styleName = " bold";
                                } else if ($tmp["style"] == "i") {
                                    $styleName = " italics";
                                } else if ($tmp["style"] == "bi") {
                                    $styleName = " bold-italics";
                                }

                                if ($this->previewMode) {
                                    echo $tmp["text"] . "<br>";
                                    echo $fontname . $styleName . " style font does not exist! <br>Please check: Markeing > config > font ";exit;
                                } else {
                                    $errTxt = $fontname . $styleName . " style font does not exist! <br>Please check: Markeing > config > font ";
                                    echo '<script>parent.layer.confirm("' . $errTxt . '", {title: \'Error\', btn: [\'Close\']});</script>';exit;
                                }

                            }

                            /*验证 字体+样式转换文件*/
                            $vfResult = $this->verifyFont($fontname, $xetName);
                            //echo "fontsize=" . $tmp["fontSize"] . "<br>";
                            //自定义字体
                            $this->PDFDOC->SetFont($fontname, $tmp["style"], $tmp["fontSize"], $_SERVER["DOCUMENT_ROOT"] . 'pdf/static/font/' . $fontname, false);

                            if (!empty($this->fontData[$fontKey]) && !isset($this->zipFont[$fontKey])) {
                                $this->zipFont[$fontKey] = $this->fontData[$fontKey];
                            }

                            //字体颜色CMYK
                            if (empty($tmp["fontColor"]) == false) {
                                if (count($tmp["fontColor"]) > 3) {
                                    $this->PDFDOC->SetTextColor($tmp["fontColor"][0], $tmp["fontColor"][1], $tmp["fontColor"][2], $tmp["fontColor"][3]);
                                } else if (count($tmp["fontColor"]) == 3) {
                                    $this->PDFDOC->SetTextColor($tmp["fontColor"][0], $tmp["fontColor"][1], $tmp["fontColor"][2]);
                                } else {
                                    $tmp["fontColor"] = null;
                                }
                            }

                            //本文背景色
                            if (empty($tmp["textBackgroundColor"]) == false) {

                                $hexColor = (array_key_exists("backgroundColor", $tmp) == true) ? $tmp["backgroundColor"] : null;
                                $cmykColor = (array_key_exists("backgroundColorCmyk", $tmp) == true) ? $tmp["backgroundColorCmyk"] : null;
                                $isValid = (empty($hexColor)) ? 0 : 1;
                                $tmp["textBackgroundColor"] = $this->cutoverColor($hexColor, $cmykColor, $isValid, $this->colorMode);

                                if ($tmp["textBackgroundColor"] != null) {
                                    $colorLen = count($tmp["textBackgroundColor"]);
                                    if ($colorLen == 4) {
                                        $this->PDFDOC->SetFillColor($tmp["textBackgroundColor"][0], $tmp["textBackgroundColor"][1], $tmp["textBackgroundColor"][2], $tmp["textBackgroundColor"][3]);
                                    } else if ($colorLen == 3) {
                                        $this->PDFDOC->SetFillColor($tmp["textBackgroundColor"][0], $tmp["textBackgroundColor"][1], $tmp["textBackgroundColor"][2]);
                                    }
                                }

                            }

                            //不同对齐方式偏移量补值
                            $moveOffsetX = 0;
                            if ($tmp["textAlign"] == "R") {
                                $moveOffsetX = $this->pxToUnit(-0.5 * $tmp["fontSize"] * 0.56);
                            } else if ($tmp["textAlign"] == "C") {
                                $moveOffsetX = $this->pxToUnit(-0.5 * $tmp["fontSize"] * 0.56);
                            } else if ($tmp["textAlign"] == "L") {
                                // 2022-11-30 $moveOffsetX = $this->pxToUnit(-0.05 * $tmp["fontSize"]);
                                $moveOffsetX =$this->pxToUnit(0.05 * $tmp["fontSize"]);
                            }

                            //文字描边设置
                            if ($tmp["strokeWidth"] != "") {
                                if ($tmp["strokeWidth"] * 1 > 0) {
                                    $tmp["strokeWidth"] = $tmp["strokeWidth"] * 1;
                                } else {
                                    $tmp["strokeWidth"] = 0;
                                }

                            } else {
                                $tmp["strokeWidth"] = 0;
                            }

                            //文字描边颜色 dash虚线边
                            $strokeOffsetX = 0;
                            $strokeOffsetY = 0;

                            if ($tmp["strokeWidth"] > 0) {
                                //$strokeOffsetX=($tmp["strokeWidth"]*1);
                                $strokeOffsetY = ($tmp["strokeWidth"] * 1);
                                $strokeOffsetX = ($tmp["strokeWidth"] * 1);
                            }

                            if ($tmp["angle"]*1<>0 and $tmp["angle"]*1 <>360){
                                $strokeOffsetX =$strokeOffsetX + $this->pxToUnit(-0.25 * $tmp["fontSize"]);
                                $strokeOffsetY =$strokeOffsetY - $this->pxToUnit(-0.25 * $tmp["fontSize"]);
                            }

                            if ($tmp["dType"]=="productPriceText"){
                                // $strokeOffsetX=0;
                                // $strokeOffsetY=0;
                            }

                            if ($tmp["strokeWidth"] > 0 and !empty($tmp["strokeColor"])) {
                                $this->PDFDOC->setTextRenderingMode($tmp["strokeWidth"], true, false);
                                $this->PDFDOC->SetLineStyle(array('cap' => 'butt', 'join' => 'miter', 'dash' => '', 'color' => $tmp["strokeColor"]));

                            } else if ($tmp["strokeWidth"] > 0 and empty($tmp["strokeColor"])) {
                                $tmp["strokeWidth"] = 0;
                                $this->PDFDOC->setTextRenderingMode($tmp["strokeWidth"], true, false);
                                //$strokeOffsetX=$tmp["strokeWidth"];$strokeOffsetY=$tmp["strokeWidth"];

                            } else if ($tmp["strokeWidth"] <= 0) {
                                $this->PDFDOC->setTextRenderingMode($tmp["strokeWidth"], true, false);
                            }

                            //绘制坐标
                            $this->PDFDOC->SetXY($tmp["left"] + $moveOffsetX + $strokeOffsetX / 2, $tmp["top"] - $strokeOffsetY / 2, true);
                            //获取当前坐标
                            $dx = $this->PDFDOC->GetX();
                            $dy = $this->PDFDOC->GetY();
                            //echo "start left=" . $tmp["left"] . ", top=" . $tmp["top"] . "<br><br><br>";
                            //旋转角度
                            $isParentAngle = false;
                            $isAngle = false;
                            if (array_key_exists("parentAngle", $tmp) == true) {

                                if ($tmp["parentAngle"] * 1 != 0 and $tmp["parentAngle"] * 1 != 360) {
                                    $parentRx = $tmp["parentObjAngleX"] * 1;
                                    $parentRy = $tmp["parentObjAngleY"] * 1;
                                    $isParentAngle = true;
                                    $this->PDFDOC->rotate(-1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                                }

                            }

                            if ($tmp["angle"] * 1 != 0 and $tmp["angle"] * 1 != 360) {
                                $rx = $dx * 1 + $tmp["strokeWidth"];
                                $ry = $dy * 1 + $tmp["strokeWidth"];
                                $isAngle = true;
                                $this->PDFDOC->rotate(-1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha($tmp["opacity"] * 1);
                                }
                            }

                            //设置文本阴影
                            if ($tmp["shadw"] != null) {
                                $this->PDFDOC->setTextShadow(array('enabled' => true, 'depth_w' => ($tmp["shadw"]["dw"]), 'depth_h' => ($tmp["shadw"]["dh"]), 'color' => $tmp["shadw"]["color"], 'opacity' => 1));
                                // echo "OKI2=" . $tmp["text"];exit;
                            } else {
                                $this->PDFDOC->setTextShadow(array('enabled' => false, 'depth_w' => 0, 'depth_h' => 0, 'color' => array(), 'opacity' => 1));
                            }

                            //字间距
                            $this->PDFDOC->setFontSpacing($tmp["spacing"]);

                            //字宽度拉伸
                            // $this->PDFDOC->setFontStretching($tmp["spacing"]);

                            $this->PDFDOC->setCellPaddings(0);
                            //行间距 0~5

                            if ($tmp["textLines"] != null) {

                                if (count($tmp["textLines"]) > 1) {
                                    $this->PDFDOC->setCellHeightRatio($tmp["lineHeight"] * 0.833333);
                                } else {
                                    $this->PDFDOC->setCellHeightRatio($tmp["lineHeight"] * 0.833333);
                                }

                            }

                            //组件倾斜处理
                            $isStartTransform = false;
                            if ($tmp["SkewX"] * 1 != 0 or $tmp["SkewY"] * 1 != 0) {
                                $isStartTransform = true;
                                $this->PDFDOC->StartTransform();
                                if ($tmp["SkewX"] * 1 != 0) {
                                    $this->PDFDOC->SkewX($tmp["SkewX"] * -1, $dx, $dy + $tmp["height"]);
                                }
                                if ($tmp["SkewY"] * 1 != 0) {
                                    $this->PDFDOC->SkewY($tmp["SkewY"] * -1, $dx, $dy);
                                }

                            }

                            if (!empty($tmp["fontColor"])) {

                                $isBg = ($tmp["textBackgroundColor"] != null) ? true : false;

                                if ($tmp["strokeWidth"] <= 0) {

                                    
                                    //有设字体颜色
                                    if (count($tmp["textLines"]) == 1) {
                                        $offsetH = $this->pxToUnit($tmp["fontSize"] * 0.833333);
                                        $dy = $dy - $this->pxToUnit($tmp["fontSize"] * 0.056);
                                        $this->PDFDOC->SetXY($dx, $dy, true);
                                        $offsetH = $tmp["height"];
                                        $this->PDFDOC->setCellHeightRatio(1);
                                        $fontPt = $this->pxToUnit($tmp["fontSize"]);
                                        if ($fontPt * strlen($tmp["textLines"][0]) > $tmp["width"]) {
                                            $textWidth = $tmp["width"] + $this->pxToUnit($tmp["fontSize"] * 0.56);
                                        } else {
                                            $textWidth = $tmp["width"];
                                            if ($tmp["textAlign"] == "R") {
                                                $dx = $dx + $this->pxToUnit(0.5 * $tmp["fontSize"] * 0.56);
                                            } else if ($tmp["textAlign"] == "C") {
                                                $dx = $dx + $this->pxToUnit(0.5 * $tmp["fontSize"] * 0.56);
                                            } else if ($tmp["textAlign"] == "L") {
                                                $dx = $dx + $this->pxToUnit(0.5 * $tmp["fontSize"] * 0.56);
                                            }
                                            $this->PDFDOC->SetXY($dx, $dy, true);
                                        }
                                        //echo "offsetH=" . $offsetH . "<br>";
                                        $this->PDFDOC->MultiCell($textWidth, $offsetH, $tmp["text"], 0, $tmp["textAlign"], $isBg, 1, '', '', true, 0, false, true, $offsetH, 'M', false);

                                    } else if (count($tmp["textLines"]) > 1) {
                                        $offsetH = $this->pxToUnit($tmp["fontSize"] * 0.833333);
                                        $textWidth = $tmp["width"] + $this->pxToUnit($tmp["fontSize"] * 0.56);
                                        $offsetH = (int) $tmp["height"] / count($tmp["textLines"]);

                                        for ($l = 0; $l < count($tmp["textLines"]); $l++) {

                                            /*$this->PDFDOC->MultiCell($textWidth+20, $offsetH + 20 , $tmp["textLines"][$l], 0, $tmp["textAlign"], $isBg, 1, '', '', true, 0, false, true, $offsetH, 'M', false);
                                            $offsetH = (int) $tmp["height"] / count($tmp["textLines"]);

                                            $this->PDFDOC->SetXY($dx, ($dy + $offsetH * ($l + 1)), true);*/

                                            $this->PDFDOC->MultiCell($tmp["width"] + $this->pxToUnit($tmp["fontSize"] * 0.56), $offsetH, $tmp["textLines"][$l], 0, $tmp["textAlign"], false, 1, '', '', true, 0, false, true, $offsetH, 'M', false);

                                            $offsetH = (int) $tmp["height"] / count($tmp["textLines"]);
                                            $this->PDFDOC->SetXY($dx + $tmp["strokeWidth"] / 2, ($dy + $offsetH * ($l + 1)), true);

                                        }

                                    }

                                } else {

                                    //如果文本带有描边为了在AI打开文本不打散，先以write方法插入绘制描边无填充文本颜色，后再以write插入绘制只有填充文本颜色
                                    $thisLineX = $dx;
                                    $thisLineY = $dy;
                                    $this->PDFDOC->SetXY($dx, $dy, true);
                                    //字体颜色为空 + 字体描边
                                    $this->PDFDOC->setTextRenderingMode($stroke = $tmp["strokeWidth"], $fill = false, $clip = false);

                                    //如果描边+阴影模式 原描边文字不做阴影模式，只需自开发的描边文字做阴影
                                    if ($tmp["shadw"] != null and $tmp["strokeWidth"] > 0) {
                                        //原文字描边做阴影模式

                                        $this->PDFDOC->setTextShadow(array('enabled' => true, 'depth_w' => $tmp["shadw"]["dw"], 'depth_h' => $tmp["shadw"]["dh"], 'color' => $tmp["shadw"]["color"], 'opacity' => 1));
                                    }

                                    if ($tmp["textLines"] != null) {

                                        $fontPt = $this->pxToUnit($tmp["fontSize"]);
                                        if ($fontPt * strlen($tmp["textLines"][0]) > $tmp["width"]) {
                                            //$tmp["width"]=$tmp["width"] + $this->pxToUnit($tmp["fontSize"] * 0.56);
                                        }

                                        //$tmp["width"]=$tmp["width"] + $this->pxToUnit($tmp["fontSize"] * 0.56);

                                        if (count($tmp["textLines"]) > 1) {

                                            // $offsetH = $this->pxToUnit($tmp["fontSize"]);
                                            $offsetH = (int) $tmp["height"] / count($tmp["textLines"]) + $tmp["strokeWidth"] * 2;
                                            $dy = $dy + $tmp["strokeWidth"];
                                            $dx = $dx - $tmp["strokeWidth"] / 2;
                                            $this->PDFDOC->SetXY($dx, $dy, true);
                               
                                            for ($l = 0; $l < count($tmp["textLines"]); $l++) {

                                                $this->PDFDOC->MultiCell($tmp["width"] + $this->pxToUnit($tmp["fontSize"] * 0.56), $offsetH, $tmp["textLines"][$l], 0, $tmp["textAlign"], false, 1, '', '', true, 0, false, true, $offsetH, 'M', false);

                                                $offsetH = (int) $tmp["height"] / count($tmp["textLines"]) + $tmp["strokeWidth"] * 2;
                               
                                                $this->PDFDOC->SetXY($dx + $tmp["strokeWidth"] / 2, ($dy + $offsetH * ($l + 1)-$tmp["strokeWidth"] * 2), true);

                                            }
                         
                                        } else {
                                            $this->PDFDOC->setCellHeightRatio(0.83333);
                                            $this->PDFDOC->MultiCell($tmp["width"] + $this->pxToUnit($tmp["fontSize"] * 0.56), $tmp["height"]+$tmp["strokeWidth"]*2, $tmp["text"], 0, $tmp["textAlign"], false, 1, '', '', true, 0, false, true, $tmp["height"]+$tmp["strokeWidth"]*2, 'M', false);
                                        }

                                    }

                                    if ($tmp["shadw"] != null and $tmp["strokeWidth"] > 0) {
                                        //原文字不做阴影模式
                                        $this->PDFDOC->setTextShadow(array('enabled' => false, 'depth_w' => 0, 'depth_h' => 0, 'color' => array(), 'opacity' => 1));
                                    }

                                    $strokePt = $this->pxToUnit($tmp["strokeWidth"]);
                                    $dx = $thisLineX;
                                    $dy = $thisLineY;
                                    $this->PDFDOC->SetXY($dx, $dy, true);

                                    //字体只有填充文本颜色
                                    $this->PDFDOC->setTextRenderingMode($stroke = 0, $fill = true, $clip = false);
                                    if ($tmp["textLines"] != null) {

                                        if (count($tmp["textLines"]) > 1) {
                                            // $offsetH = $this->pxToUnit($tmp["fontSize"]);
                                            $offsetH = (int) $tmp["height"] / count($tmp["textLines"]) + $tmp["strokeWidth"]*2;
                                            $dy = $dy + $tmp["strokeWidth"];
                                            $dx = $dx - $tmp["strokeWidth"] / 2;
                                            $this->PDFDOC->SetXY($dx, $dy, true);
                                            //$this->PDFDOC->setCellHeightRatio(1);
                             
                                            for ($l = 0; $l < count($tmp["textLines"]); $l++) {

                                                $this->PDFDOC->MultiCell($tmp["width"] + $this->pxToUnit($tmp["fontSize"] * 0.56), $offsetH, $tmp["textLines"][$l], 0, $tmp["textAlign"], false, 1, '', '', true, 0, false, true, $offsetH, 'M', false);

                                                $offsetH = (int) $tmp["height"] / count($tmp["textLines"]) + $tmp["strokeWidth"] * 2;
                               
                                                $this->PDFDOC->SetXY($dx + $tmp["strokeWidth"] / 2, ($dy + $offsetH * ($l + 1)-$tmp["strokeWidth"] * 2), true);

                                            }

                                        } else {
                                            $this->PDFDOC->MultiCell($tmp["width"] + $this->pxToUnit($tmp["fontSize"] * 0.56), $tmp["height"]+$tmp["strokeWidth"]*2, $tmp["text"], 0, $tmp["textAlign"], false, 1, '', '', true, 0, false, true, $tmp["height"]+$tmp["strokeWidth"]*2, 'M', false);
                                        }

                                    }
                                }

                            } else {

                                //字体颜色为空 + 字体描边
                                $this->PDFDOC->setTextRenderingMode($stroke = $tmp["strokeWidth"], $fill = false, $clip = false);
                                if ($tmp["textLines"] != null) {

                                    if (count($tmp["textLines"]) > 1) {
                                        $offsetH = $this->pxToUnit($tmp["fontSize"]);
                                        //$this->PDFDOC->setCellHeightRatio(0.8);
                                        for ($l = 0; $l < count($tmp["textLines"]); $l++) {

                                            $this->PDFDOC->Write($offsetH, $tmp["textLines"][$l], '', 0, $tmp["textAlign"], false, 0, false, false, 0);
                                            $this->PDFDOC->SetXY($dx, ($dy + $offsetH * ($l + 1)), true);

                                        }

                                    } else {
                                        $this->PDFDOC->Write($tmp["height"], $tmp["text"], '', 0, $tmp["textAlign"], true, 0, false, false, 0);
                                    }

                                }

                            }

                            //如果是画线类文本
                            if (array_key_exists("dType", $tmp) == true) {
                                if (array_key_exists("textLines", $tmp) == true and $tmp["dType"] == "productLineationText_bak") {

                                    $textLnWidth = strlen($tmp["textLines"][0]) * $this->pxToUnit($tmp["fontSize"] * 0.79) * 0.8;
                                    $textLnHeight = ($this->pxToUnit($tmp["fontSize"] * 0.79)) * 0.9;

                                    $wLineParm = [];
                                    $wLineParm["dash"] = "1,0";
                                    $wLineParm["strokeWidth"] = "0.1";
                                    $wLineParm["strokeColor"] = $tmp["fontColor"];
                                    $wLineParm["points"] = [];
                                    $points = [];
                                    switch ($tmp["textAlign"]) {
                                        case "L":
                                            $wLineParm["left"] = $tmp["left"] + $moveOffsetX;
                                            $wLineParm["top"] = $tmp["top"];

                                            $x1 = $wLineParm["left"] + $textLnWidth * 0.05;
                                            $y1 = $tmp["top"] + $tmp["height"] * 0.9;
                                            $x2 = $wLineParm["left"] + $textLnWidth * 0.8;
                                            $y2 = $tmp["top"] - $textLnHeight * 0.001;
                                            array_push($points, $x1);
                                            array_push($points, $y1);
                                            array_push($points, $x2);
                                            array_push($points, $y2);
                                            break;
                                        case "C":
                                            $wLineParm["left"] = $tmp["left"] + $moveOffsetX;
                                            $wLineParm["top"] = $tmp["top"];

                                            $x1 = $wLineParm["left"] + $textLnWidth * 0.05 + ($tmp["width"] - $textLnWidth) * 0.5 + $this->pxToUnit($tmp["fontSize"] * 0.56) * 0.5;
                                            $y1 = $tmp["top"] + $tmp["height"] * 0.9;
                                            $x2 = $x1 + $textLnWidth * 0.8;
                                            $y2 = $tmp["top"] - $textLnHeight * 0.0;
                                            array_push($points, $x1);
                                            array_push($points, $y1);
                                            array_push($points, $x2);
                                            array_push($points, $y2);
                                            break;
                                        case "R":
                                            $wLineParm["left"] = $tmp["left"] + $moveOffsetX;
                                            $wLineParm["top"] = $tmp["top"];

                                            $x1 = $wLineParm["left"] + ($tmp["width"] - $textLnWidth) + $this->pxToUnit($tmp["fontSize"] * 0.56);
                                            $y1 = $tmp["top"] + $tmp["height"] * 0.9;
                                            $x2 = $x1 + $textLnWidth * 0.8;
                                            $y2 = $tmp["top"] - $textLnHeight * 0.0;
                                            array_push($points, $x1);
                                            array_push($points, $y1);
                                            array_push($points, $x2);
                                            array_push($points, $y2);
                                            break;
                                    }
                                    $wLineParm["points"] = $points;
                                    //echo $tmp["left"] . "," . $tmp["top"] . "<br><br><br><br>";
                                    //echo json_encode($wLineParm);exit;
                                    $this->drawTextLine($wLineParm);
                                }
                            }

                            if ($isStartTransform == true) {
                                $this->PDFDOC->StopTransform();
                            }

                            //还原透明设置 1
                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha(1);
                                }
                            }


                            //还原角度
                            if ($isAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            if ($isParentAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                            }

                            break;

                        case "image":

                            $picPath = $tmp["src"];
                            $extName = substr($picPath, -10);
                            if (substr($tmp["src"], 0, 4) == "http") {
                                if ($extName == "_rgb_thumb" and !$this->previewMode) {
                                    $tmp["src"] = str_replace("_rgb_thumb", "_rgb", $picPath);
                                }
                                if ($extName == "cmyk_thumb" and !$this->previewMode) {
                                    $tmp["src"] = str_replace("_cmyk_thumb", "_cmyk", $picPath);
                                }

                            }

                            //echo "<br>image=" . $tmp["left"] . " , " . $tmp["top"];
                            $this->PDFDOC->SetXY($tmp["left"], $tmp["top"], true);
                            $this->PDFDOC->setImageScale(1);

                            //获取当前坐标
                            $dx = $this->PDFDOC->GetX();
                            $dy = $this->PDFDOC->GetY();

                            //旋转角度
                            $isParentAngle = false;
                            $isAngle = false;
                            if (array_key_exists("parentAngle", $tmp) == true) {

                                if ($tmp["parentAngle"] * 1 != 0 and $tmp["parentAngle"] * 1 != 360) {
                                    $parentRx = $tmp["parentObjAngleX"] * 1;
                                    $parentRy = $tmp["parentObjAngleY"] * 1;
                                    $isParentAngle = true;
                                    $this->PDFDOC->rotate(-1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                                }

                            }

                            if ($tmp["angle"] * 1 != 0 and $tmp["angle"] * 1 != 360) {
                                $rx = $dx * 1 + $tmp["strokeWidth"];
                                $ry = $dy * 1 + $tmp["strokeWidth"];
                                $isAngle = true;
                                $this->PDFDOC->rotate(-1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            //图片透明设置
                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha($tmp["opacity"] * 1);
                                }
                            }

                            if (substr($tmp["src"], 0, 4) == "http") {
                                // 获取图片文件
                                $imageInfo = $this->getImage($tmp["src"]);
                                $imageFile = $imageInfo["imageFile"];
                                $isMask = $imageInfo["isMask"];
                                if ($isMask != true) {
                                    $this->PDFDOC->Image($imageFile, $tmp["left"], $tmp["top"], $tmp["width"], $tmp["height"]);
                                } else {

                                    $maskImg = $imageInfo["maskImg"];
                                    $mask = $this->PDFDOC->Image($maskImg, $tmp["left"], $tmp["top"], $tmp["width"], $tmp["height"], '', '', '', false, 300, '', true);
                                    $this->PDFDOC->Image($imageFile, $tmp["left"], $tmp["top"], $tmp["width"], $tmp["height"], '', '', '', false, 300, '', false, $mask);
                                }

                            } else {
                                /********   在这里需要把bas64写本地png，再进行CMYK处理 ********/
                                //$this->PDFDOC->setAlpha(0.5);
                                $findStr = "base64,";
                                $strPos = stripos($tmp["src"], $findStr);
                                $replaceStr = substr($tmp["src"], 0, ($strPos + strlen($findStr)));
                                $imageBase64 = base64_decode(str_replace($replaceStr, "", $tmp["src"]));
                                $this->PDFDOC->Image('@' . $imageBase64, $tmp["left"], $tmp["top"], $tmp["width"], $tmp["height"]);
                            }

                            /*
                            测试在tcPdf中导入ai文件并导出pdf，只支持Ai IIIustrator 3保存的ai文件，测试成功
                            $testaiPath=K_PATH_CACHE . "dtc-4.ai";
                            //echo $testaiPath;exit;
                            $this->PDFDOC->ImageEps($testaiPath, 10, 40, 50, '', 'http://www.tcpdf.org', true, '', '', 0, false);*/

                            //还原透明设置 1
                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha(1);
                                }
                            }

                            //还原角度
                            if ($isAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            if ($isParentAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                            }

                            break;
                        case "rect":
                            //$this->PDFDOC->SetXY($tmp["left"] - $tmp["strokeWidth"], $tmp["top"] - $tmp["strokeWidth"], true);
                            $this->PDFDOC->SetXY($tmp["left"] + $tmp["strokeWidth"] * 0, $tmp["top"] + $tmp["strokeWidth"] * 0, true);
                            //获取当前坐标
                            $dx = $this->PDFDOC->GetX();
                            $dy = $this->PDFDOC->GetY();

                            //边框样式
                            $dash = 0;
                            if ($tmp["dash"] != null and $tmp["dash"] != 'null') {
                                if ($tmp["dash"][0] == "0" and $tmp["dash"][1] == "0") {

                                } else {
                                    $dash = $tmp["dash"][0] . "," . $tmp["dash"][1];
                                }

                            }

                            //F代表填充色，D代表画边框线
                            $fillMode = 'F';
                            if ($tmp["strokeColor"] != "" and $tmp["strokeColor"] != null and $tmp["strokeWidth"] * 1 > 0) {
                                $fillMode = $fillMode . "D";
                            }

                            if ($tmp["fillColor"] == null || is_object($tmp["fillColor"])) {
                                $fillMode = str_replace("F", "", $fillMode);
                            }

                            if ($tmp["strokeWidth"] * 1 > 0 and $tmp["strokeColor"] != "" and $tmp["strokeColor"] != null) {
                                $strokeStyle = array('width' => $tmp["strokeWidth"], 'cap' => 'square', 'join' => 'miter', 'dash' => $dash, 'color' => $tmp["strokeColor"]);
                            } else {
                                $strokeStyle = null;
                            }

                            //是否绘制边框
                            if ($strokeStyle != null) {
                                $drawStroke = array('all' => $strokeStyle);
                                $this->PDFDOC->SetLineStyle(array('width' => $tmp["strokeWidth"], 'cap' => 'butt', 'join' => 'miter', 'dash' => $dash, 'color' => $tmp["strokeColor"]));
                            } else {
                                $drawStroke = null;
                            }

                            $isParentAngle = false;
                            $isAngle = false;
                            if (array_key_exists("parentAngle", $tmp) == true) {

                                if ($tmp["parentAngle"] * 1 != 0 and $tmp["parentAngle"] * 1 != 360) {
                                    $parentRx = $tmp["parentObjAngleX"] * 1;
                                    $parentRy = $tmp["parentObjAngleY"] * 1;
                                    $isParentAngle = true;

                                    $this->PDFDOC->rotate(-1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                                }

                            }

                            if ($tmp["angle"] * 1 != 0 and $tmp["angle"] * 1 != 360) {
                                $rx = $dx * 1 + $tmp["strokeWidth"];
                                $ry = $dy * 1 + $tmp["strokeWidth"];
                                $isAngle = true;
                                $this->PDFDOC->rotate(-1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            $drawRectMode = 2;
                            if (array_key_exists("rx", $tmp) == true) {
                                if ($tmp["rx"] > 0) {
                                    $drawRectMode = 2;
                                } else {
                                    $drawRectMode = 1;
                                }
                            }

                            $strokeWidthUnit = $tmp["strokeWidth"];


                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha($tmp["opacity"] * 1);
                                }
                            }


                            if ($tmp["fillMode"] != "gradientColor") {
                                //color fill


                                //组件倾斜处理
                                $isStartTransform = false;
                                if ($tmp["SkewX"] * 1 != 0 or $tmp["SkewY"] * 1 != 0) {
                                    $isStartTransform = true;
                                    $this->PDFDOC->StartTransform();
                                    if ($tmp["SkewX"] * 1 != 0) {
                                        $this->PDFDOC->SkewX($tmp["SkewX"] * -1, $dx, $dy + $tmp["height"]);
                                    }
                                    if ($tmp["SkewY"] * 1 != 0) {
                                        $this->PDFDOC->SkewY($tmp["SkewY"] * -1, $dx, $dy);
                                    }

                                }

                                if ($drawRectMode == 2) {

                                    $this->PDFDOC->RoundedRect($tmp["left"], $tmp["top"], $tmp["width"] + $strokeWidthUnit * 2, $tmp["height"] + $strokeWidthUnit * 2, $tmp["rx"], "1111", $fillMode, $drawStroke, $tmp["fillColor"]);

                                } else {

                                    $this->PDFDOC->Rect($tmp["left"] + $strokeWidthUnit / 2, $tmp["top"] + $strokeWidthUnit / 2, $tmp["width"], $tmp["height"], $fillMode, $drawStroke, $tmp["fillColor"]);
                                }

                                //组件倾斜还原
                                if ($isStartTransform == true) {
                                    $this->PDFDOC->StopTransform();
                                }

                            } else {

                                $this->svgFillRander($tmp, $strokeWidthUnit);
                                if ($strokeWidthUnit * 1 > 0) {
                                    if ($drawRectMode == 2) {
                                        $this->PDFDOC->RoundedRect($tmp["left"], $tmp["top"], $tmp["width"] + $strokeWidthUnit * 2, $tmp["height"] + $strokeWidthUnit * 2, $tmp["rx"], "1111", $fillMode, $drawStroke, null);
                                    } else {
                                        $this->PDFDOC->Rect($tmp["left"] + $strokeWidthUnit / 2, $tmp["top"] + $strokeWidthUnit / 2, $tmp["width"], $tmp["height"], $fillMode, $drawStroke, null);
                                    }
                                }

                            }

                            //还原透明设置 1
                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha(1);
                                }
                            }


                            //还原角度
                            if ($isAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            if ($isParentAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                            }

                            break;
                        case "circle":

                            $this->PDFDOC->SetXY($tmp["left"] + ($tmp["strokeWidth"]) + $tmp["radiusX"], $tmp["top"] + ($tmp["strokeWidth"]) + $tmp["radiusY"], true);

                            //获取当前坐标
                            $dx = $this->PDFDOC->GetX();
                            $dy = $this->PDFDOC->GetY();

                            //边框样式
                            $dash = '';
                            if ($tmp["dash"] != null) {
                                $dash = $tmp["dash"][0] . "," . $tmp["dash"][1];
                            }

                            $fillMode = 'F';
                            if ($tmp["fillColor"] != null) {
                                $fillMode = $fillMode . "D";
                            } else {
                                $fillMode = "D";
                            }

                            //旋转角度
                            $isParentAngle = false;
                            $isAngle = false;
                            if (array_key_exists("parentAngle", $tmp) == true) {

                                if ($tmp["parentAngle"] * 1 != 0 and $tmp["parentAngle"] * 1 != 360) {
                                    $parentRx = $tmp["parentObjAngleX"] * 1;
                                    $parentRy = $tmp["parentObjAngleY"] * 1;

                                    $isParentAngle = true;
                                    $this->PDFDOC->rotate(-1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                                }

                            }

                            $pointX = $dx; // - $tmp["strokeWidth"]*2;
                            $pointY = $dy; // - $tmp["strokeWidth"]*2;
                            $offsetX = 0;
                            $offsetY = 0;

                            $rx = $tmp["left"] - $tmp["strokeWidth"];
                            $ry = $tmp["top"] - $tmp["strokeWidth"];

                            $tmp["pointX"] = $pointX;
                            $tmp["pointY"] = $pointY;

                            if ($tmp["angle"] * 1 != 0 and $tmp["angle"] * 1 != 360) {

                                $isAngle = true;
                                $this->PDFDOC->rotate(-1 * $tmp["angle"] * 1, $rx, $ry);
                            }


                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha($tmp["opacity"] * 1);
                                }
                            }


                            $strokeStyle = array('width' => $tmp["strokeWidth"], 'cap' => 'butt', 'join' => 'miter', 'dash' => $dash, 'color' => $tmp["strokeColor"]);

                            //20220813
                            if ($tmp["fillMode"] == "gradientColor") {

                                $this->svgFillRander($tmp, $tmp["strokeWidth"]);
                                if ($tmp["strokeWidth"] * 1 > 0) {
                                    $fillMode = "D";
                                    $this->PDFDOC->Circle($pointX, $pointY, $tmp["radiusY"], 0, 360, $fillMode, $strokeStyle);
                                }

                            } else {
                                $this->PDFDOC->Circle($pointX, $pointY, $tmp["radiusY"], 0, 360, $fillMode, $strokeStyle, $tmp["fillColor"]);
                            }

                            //还原透明设置 1
                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha(1);
                                }
                            }


                            //还原角度
                            if ($isAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            if ($isParentAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                            }

                            break;
                        case "ellipse":

                            $this->PDFDOC->SetXY($tmp["left"], $tmp["top"], true);

                            //获取当前坐标
                            $dx = $this->PDFDOC->GetX();
                            $dy = $this->PDFDOC->GetY();

                            //边框样式
                            $dash = '';
                            if (array_key_exists("dash", $tmp) == true) {
                                if ($tmp["dash"] != null and $tmp["dash"] != "") {
                                    $dash = $tmp["dash"][0] . "," . $tmp["dash"][1];
                                }
                            }

                            $fillMode = 'F';
                            if (array_key_exists("fillColor", $tmp) == true) {
                                if ($tmp["fillColor"] != null and $tmp["fillColor"] != "") {
                                    $fillMode = $fillMode . "D";
                                } else {
                                    $fillMode = "D";
                                }
                            }

                            //旋转角度
                            $isParentAngle = false;
                            $tmp["isAngle"] = false;
                            if (array_key_exists("parentAngle", $tmp) == true) {

                                if ($tmp["parentAngle"] * 1 != 0 and $tmp["parentAngle"] * 1 != 360) {
                                    $parentRx = $tmp["parentObjAngleX"] * 1;
                                    $parentRy = $tmp["parentObjAngleY"] * 1;

                                    $isParentAngle = true;
                                    $this->PDFDOC->rotate(-1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                                }

                            }

                            if ($tmp["angle"] * 1 != 0 and $tmp["angle"] * 1 != 360) {

                                $tmp["angleX"] = $dx + $tmp["strokeWidth"];
                                $tmp["angleY"] = $dy + $tmp["strokeWidth"];
                                $tmp["isAngle"] = true;
                                //$this->PDFDOC->rotate(-1 * $tmp["angle"] * 1, $tmp["angleX"], $tmp["angleY"]);
                            }

                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha($tmp["opacity"] * 1);
                                }
                            }


                            $strokeStyle = array('width' => $tmp["strokeWidth"], 'cap' => 'butt', 'join' => 'miter', 'dash' => $dash, 'color' => $tmp["strokeColor"]);

                            //椭圆
                            $pointX = $this->pxToUnit($tmp["rotateXY"]->x * $this->scalePi);
                            $pointY = $this->pxToUnit($tmp["rotateXY"]->y * $this->scalePi);

                            $x0 = $pointX; // + $tmp["strokeWidth"];
                            $y0 = $pointY; // + $tmp["strokeWidth"];

                            $rx = $tmp["radiusX"];
                            $ry = $tmp["radiusY"];

                            $angle = $tmp["angle"];
                            $astart = 0;
                            $afinish = 360;
                            $style = $fillMode; //''
                            $line_style = $strokeStyle;
                            $fill_color = $tmp["fillColor"];

                            if ($tmp["fillMode"] == "gradientColor") {

                                $tmp["rx"] = $rx;
                                $tmp["ry"] = $ry;
                                $tmp["x0"] = $x0;
                                $tmp["y0"] = $y0;
                                $tmp["pointX"] = $x0;
                                $tmp["pointY"] = $y0;
                                $tmp["angle"] = $angle;
                                $tmp["astart"] = $astart;
                                $tmp["afinish"] = $afinish;

                                $this->svgFillRander($tmp, $tmp["strokeWidth"]);

                                if ($tmp["strokeWidth"] * 1 > 0) {
                                    $fill_color = "D";
                                    $style = "";

                                    if ($angle*1==0){
                                        $x0=$tmp["left"] + $rx;
                                        $y0=$tmp["top"] + $ry;
                                    }

                                    $this->PDFDOC->Ellipse($x0, $y0, $rx, $ry, -1 * $angle, $astart, $afinish, $style, $line_style, $fill_color, $nc = 2);
                                }

                            } else {

                                $isStartTransform = false;
                                if ($tmp["SkewX"] * 1 != 0 or $tmp["SkewY"] * 1 != 0) {
                                    $isStartTransform = true;
                                    $this->PDFDOC->StartTransform();
                                    if ($tmp["SkewX"] * 1 != 0) {
                                        $this->PDFDOC->SkewX($tmp["SkewX"], $x0, $y0);
                                    }
                                    if ($tmp["SkewY"] * 1 != 0) {
                                        $this->PDFDOC->SkewY($tmp["SkewY"] * -1, $pointX, $pointY);
                                    }

                                }
                          
                                // $this->PDFDOC->Ellipse($x0, $y0, $rx, $ry, -1 * $angle, $astart, $afinish, $style, $line_style, $fill_color, $nc = 2);
                                if ($angle*1==0){
                                    $x0=$tmp["left"] + $rx;
                                    $y0=$tmp["top"] + $ry;
                                }
                                $this->PDFDOC->Ellipse($x0, $y0, $rx, $ry, -1 * $angle, $astart, $afinish, $style, $line_style, $fill_color, $nc = 2);

                                if ($isStartTransform == true) {
                                    $this->PDFDOC->StopTransform();
                                }
                            }

                            //还原透明设置 1
                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha(1);
                                }
                            }

                            //还原角度
                            if ($isParentAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                            }

                            break;

                        case "polygon":

                            $this->PDFDOC->SetXY($tmp["left"], $tmp["top"], true);

                            //获取当前坐标
                            $dx = $this->PDFDOC->GetX();
                            $dy = $this->PDFDOC->GetY();

                            //边框样式
                            $dash = '';
                            if ($tmp["dash"] != null) {
                                $dash = $tmp["dash"][0] . "," . $tmp["dash"][1];
                            }

                            //旋转角度
                            $isParentAngle = false;
                            $isAngle = false;
                            if (array_key_exists("parentAngle", $tmp) == true) {

                                if ($tmp["parentAngle"] * 1 != 0 and $tmp["parentAngle"] * 1 != 360) {
                                    $parentRx = $tmp["parentObjAngleX"] * 1;
                                    $parentRy = $tmp["parentObjAngleY"] * 1;

                                    $isParentAngle = true;
                                    $this->PDFDOC->rotate(-1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                                }

                            }
                            $dd = $this->pxToUnit($tmp["strokeWidth"] * $tmp["scaleX"] * $this->scalePi);
                            if ($tmp["angle"] * 1 != 0 and $tmp["angle"] * 1 != 360) {
                                $rx = $dx * 1 + $dd;
                                $ry = $dy * 1 + $dd;
                                $isAngle = true;
                                $this->PDFDOC->rotate(-1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha($tmp["opacity"] * 1);
                                }
                            }

                            $strokeStyle = array('width' => $tmp["strokeWidth"], 'cap' => 'butt', 'join' => 'miter', 'dash' => $dash, 'color' => $tmp["strokeColor"]);
                            $this->PDFDOC->SetLineStyle(array('width' => $tmp["strokeWidth"], 'cap' => 'butt', 'join' => 'miter', 'dash' => $dash, 'color' => $tmp["strokeColor"]));

                            if ($tmp["fillColor"] == null) {
                                $this->PDFDOC->Polygon($tmp["points"]);
                            } else {

                                if ($tmp["fillMode"] != "gradientColor") {

                                    if ($tmp["strokeWidth"] > 0 and $tmp["strokeColor"] != null and $tmp["fillColor"] != null) {
                                        $this->PDFDOC->Polygon($tmp["points"], "DF", array("all" => $strokeStyle), $tmp["fillColor"]);
                                    } else if (($tmp["strokeWidth"] <= 0 or $tmp["strokeColor"] == null) and $tmp["fillColor"] != null) {
                                        $this->PDFDOC->Polygon($tmp["points"], "F", array(), $tmp["fillColor"]);
                                    }

                                } else {

                                    $this->svgFillRander($tmp, $strokeWidthUnit);
                                    if ($tmp["strokeWidth"] > 0 and $tmp["strokeColor"] != null and $tmp["fillColor"] != null) {
                                        $this->PDFDOC->Polygon($tmp["points"], "D", array("all" => $strokeStyle), null);
                                    } else if (($tmp["strokeWidth"] <= 0 or $tmp["strokeColor"] == null) and $tmp["fillColor"] != null) {
                                        $this->PDFDOC->Polygon($tmp["points"], "D", array(), null);
                                    }

                                }

                            }

                            //还原透明设置 1
                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha(1);
                                }
                            }

                            //还原角度
                            if ($isAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            if ($isParentAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                            }

                            break;
                        case "path":

                            if (array_key_exists("dText",$tmp)==false){
                                // continue;
                                break;
                            }

                            $this->PDFDOC->SetXY($tmp["left"] + $tmp["strokeWidth"], $tmp["top"] + $tmp["strokeWidth"], true);

                            //获取当前坐标
                            $dx = $this->PDFDOC->GetX();
                            $dy = $this->PDFDOC->GetY();

                            //边框样式
                            $dash = '';
                            if ($tmp["dash"] != null) {
                                $dash = ($tmp["dash"][0]) * $tmp["scaleX"] . "," . ($tmp["dash"][1]) * $tmp["scaleX"];
                            }

                            //旋转角度
                            $isParentAngle = false;
                            $isAngle = false;
                            if (array_key_exists("parentAngle", $tmp) == true) {

                                if ($tmp["parentAngle"] * 1 != 0 and $tmp["parentAngle"] * 1 != 360) {
                                    $parentRx = $tmp["parentObjAngleX"] * 1;
                                    $parentRy = $tmp["parentObjAngleY"] * 1;
                                    $isParentAngle = true;
                                    $this->PDFDOC->rotate(-1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                                }

                            }

                            if ($tmp["angle"] * 1 != 0 and $tmp["angle"] * 1 != 360) {
                                $rx = $tmp["left"] * 1 + $tmp["strokeWidth"];
                                $ry = $tmp["top"] * 1 + $tmp["strokeWidth"];
                                $isAngle = true;
                                $this->PDFDOC->rotate(-1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha($tmp["opacity"] * 1);
                                }
                            }


                            $strokeStyle = array('width' => $tmp["strokeWidth"], 'cap' => 'square', 'join' => 'miter', 'dash' => $dash, 'color' => $tmp["strokeColor"]);
                            $this->PDFDOC->SetLineStyle(array('width' => $tmp["strokeWidth"], 'cap' => 'butt', 'join' => 'miter', 'dash' => $dash, 'color' => $tmp["strokeColor"]));

                            if (array_key_exists("fillColor",$tmp)==false){
                                $tmp["fillColor"]=null;
                            }

                            if ($tmp["fillColor"] == null) {
                                $this->PDFDOC->SVGPathExpand($tmp["dText"], 'D', $this->pdfUnit);
                            } else {

                                if ($tmp["fillMode"] != "gradientColor") {

                                    if (count($tmp["fillColor"]) == 4) {
                                        $this->PDFDOC->SetFillColor($tmp["fillColor"][0], $tmp["fillColor"][1], $tmp["fillColor"][2], $tmp["fillColor"][3]);
                                    } else {
                                        $this->PDFDOC->SetFillColor($tmp["fillColor"][0], $tmp["fillColor"][1], $tmp["fillColor"][2]);
                                    }

                                    if ($tmp["strokeWidth"] > 0 and $tmp["strokeColor"] != null and $tmp["fillColor"] != null) {
                                        $this->PDFDOC->SVGPathExpand($tmp["dText"], 'DF', $this->pdfUnit);
                                    } else {
                                        $this->PDFDOC->SVGPathExpand($tmp["dText"], 'F', $this->pdfUnit);
                                    }

                                } else if ($tmp["fillMode"] == "gradientColor") {

                                    $this->svgFillRander($tmp, $tmp["strokeWidth"]);

                                    if ($tmp["strokeWidth"] > 0 and $tmp["strokeColor"] != null and $tmp["fillColor"] != null) {
                                        $this->PDFDOC->SVGPathExpand($tmp["dText"], 'D', $this->pdfUnit);
                                    }

                                }

                            }

                            //还原透明设置 1
                            if (array_key_exists("opacity", $tmp) == true) {
                                if ($tmp["opacity"] != "") {
                                    $this->PDFDOC->setAlpha(1);
                                }
                            }


                            //还原角度
                            if ($isAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            if ($isParentAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                            }

                            break;

                        case "path_bak_2023-02-18":

                            $startx = $tmp["points"][0][0];
                            $starty = $tmp["points"][0][1];
                            //$this->PDFDOC->SetXY($tmp["left"], $tmp["top"], true);
                            $this->PDFDOC->SetXY($startx, $starty, true);
                            //获取当前坐标
                            $dx = $this->PDFDOC->GetX();
                            $dy = $this->PDFDOC->GetY();

                            //边框样式
                            $dash = '';
                            if ($tmp["dash"] != null) {
                                $dash = ($tmp["dash"][0]) * $tmp["scaleX"] . "," . ($tmp["dash"][1]) * $tmp["scaleX"];
                                //$dash = $this->pxToUnit($tmp["dash"][0]) . "," . $this->pxToUnit($tmp["dash"][1]);
                            }

                            /*
                            //旋转角度
                            $isAngle = false;
                            if (array_key_exists("parentObjAngleX", $tmp) == true) {
                            $rx = $tmp["parentObjAngleX"] * 1;
                            $ry = $tmp["parentObjAngleY"] * 1;
                            $isAngle = true;
                            $this->PDFDOC->rotate(-1 * $tmp["angle"] * 1, $rx, $ry);
                            } else if ($tmp["angle"] * 1 != 0) {
                            $rx = $dx * 1;
                            $ry = $dy * 1;
                            $isAngle = true;
                            $this->PDFDOC->rotate(-1 * $tmp["angle"] * 1, $rx, $ry);
                            }*/

                            //旋转角度
                            $isParentAngle = false;
                            $isAngle = false;
                            if (array_key_exists("parentAngle", $tmp) == true) {

                                if ($tmp["parentAngle"] * 1 != 0 and $tmp["parentAngle"] * 1 != 360) {
                                    $parentRx = $tmp["parentObjAngleX"] * 1;
                                    $parentRy = $tmp["parentObjAngleY"] * 1;
                                    $isParentAngle = true;
                                    $this->PDFDOC->rotate(-1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                                }

                            }

                            if ($tmp["angle"] * 1 != 0 and $tmp["angle"] * 1 != 360) {
                                $rx = $tmp["left"] * 1 + $tmp["strokeWidth"];
                                $ry = $tmp["top"] * 1 + $tmp["strokeWidth"];
                                $isAngle = true;
                                $this->PDFDOC->rotate(-1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            $startx = $tmp["points"][0][0];
                            $starty = $tmp["points"][0][1];

                            $strokeStyle = array('width' => $tmp["strokeWidth"], 'cap' => 'square', 'join' => 'miter', 'dash' => $dash, 'color' => $tmp["strokeColor"]);
                            $this->PDFDOC->SetLineStyle(array('width' => $tmp["strokeWidth"], 'cap' => 'butt', 'join' => 'miter', 'dash' => $dash, 'color' => $tmp["strokeColor"]));

                            if ($tmp["fillColor"] == null) {
                                $this->PDFDOC->Polycurve($startx, $starty, $tmp["points"]);
                            } else {

                                if ($tmp["strokeWidth"] > 0 and $tmp["strokeColor"] != null and $tmp["fillColor"] != null) {
                                    $this->PDFDOC->Polycurve($startx, $starty, $tmp["points"], "DF", array("all" => $strokeStyle), $tmp["fillColor"]);
                                } else if (($tmp["strokeWidth"] <= 0 or $tmp["strokeColor"] == null) and $tmp["fillColor"] != null) {
                                    $this->PDFDOC->Polycurve($startx, $starty, $tmp["points"], "F", array(), $tmp["fillColor"]);
                                }

                            }

                            /*
                            //还原角度
                            if ($isAngle == true) {
                            $this->PDFDOC->rotate(1 * $tmp["angle"] * 1, $rx, $ry);
                            }*/

                            //还原角度
                            if ($isAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            if ($isParentAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                            }

                            break;
                        case "line":

                            $this->PDFDOC->SetXY($tmp["left"], $tmp["top"], true);
                            //获取当前坐标
                            $dx = $this->PDFDOC->GetX();
                            $dy = $this->PDFDOC->GetY();

                            /*
                            //旋转角度
                            $isAngle = false;
                            if (array_key_exists("parentObjAngleX", $tmp) == true) {
                            $rx = $tmp["parentObjAngleX"] * 1;
                            $ry = $tmp["parentObjAngleY"] * 1;
                            $isAngle = true;
                            $this->PDFDOC->rotate(-1 * $tmp["angle"] * 1, $rx, $ry);
                            } else if ($tmp["angle"] * 1 != 0) {
                            $rx = $dx * 1;
                            $ry = $dy * 1;
                            $isAngle = true;
                            $this->PDFDOC->rotate(-1 * $tmp["angle"] * 1, $rx, $ry);
                            }*/

                            //旋转角度
                            $isParentAngle = false;
                            $isAngle = false;
                            if (array_key_exists("parentAngle", $tmp) == true) {

                                if ($tmp["parentAngle"] * 1 != 0 and $tmp["parentAngle"] * 1 != 360) {
                                    $parentRx = $tmp["parentObjAngleX"] * 1;
                                    $parentRy = $tmp["parentObjAngleY"] * 1;
                                    $isParentAngle = true;
                                    $this->PDFDOC->rotate(-1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                                }

                            }

                            if ($tmp["angle"] * 1 != 0 and $tmp["angle"] * 1 != 360) {
                                $rx = $dx * 1 + $tmp["strokeWidth"];
                                $ry = $dy * 1 + $tmp["strokeWidth"];
                                $isAngle = true;
                                $this->PDFDOC->rotate(-1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            if (count($tmp["strokeColor"]) == 4) {
                                $this->PDFDOC->SetDrawColor($tmp["strokeColor"][0], $tmp["strokeColor"][1], $tmp["strokeColor"][2], $tmp["strokeColor"][3]);
                            } else {
                                $this->PDFDOC->SetDrawColor($tmp["strokeColor"][0], $tmp["strokeColor"][1], $tmp["strokeColor"][2]);
                            }

                            $this->PDFDOC->SetLineWidth($tmp["strokeWidth"]);

                            $lineStyle = array('width' => $tmp["strokeWidth"], 'cap' => 'butt', 'join' => 'miter', 'dash' => 0, 'color' => $tmp["strokeColor"]);
                            $this->PDFDOC->Line($tmp["x1"], $tmp["y1"], $tmp["x2"], $tmp["y2"], $lineStyle);

                            /*
                            //还原角度
                            if ($isAngle == true) {
                            $this->PDFDOC->rotate(1 * $tmp["angle"] * 1, $rx, $ry);
                            }*/

                            //还原角度
                            if ($isAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["angle"] * 1, $rx, $ry);
                            }

                            if ($isParentAngle == true) {
                                $this->PDFDOC->rotate(1 * $tmp["parentAngle"] * 1, $parentRx, $parentRy);
                            }

                            break;

                    }
                }

            }

            //当前页链接区域 插入链接
            $linkArea = $this->linkArea[$k];
            if (isset($linkArea)) {

                for ($i = 0; $i < count($linkArea); $i++) {
                    $tmpLink = $linkArea[$i];
                    //$this->PDFDOC->SetXY($tmpLink["x"], $tmpLink["y"], true);
                    $this->PDFDOC->Link($tmpLink["x"], $tmpLink["y"], $tmpLink["w"], $tmpLink["h"], $tmpLink["link"], $spaces = 0);
                }
            }

        }

    }

    //保存PDF
    public function savePdf($parma)
    {

        $this->PDFDOC->Output($parma["savePath"], $parma["mode"]);

    }

    //16进制hex转rgb格式
    public function hex2rgb($colour)
    {
        if ($colour == "" or $colour == null or $colour == "null" or $colour == "undefined") {
            return null;
        }

        if ($colour[0] == '#') {
            $colour = substr($colour, 1);
        }
        if (strlen($colour) == 6) {
            list($r, $g, $b) = array($colour[0] . $colour[1], $colour[2] . $colour[3], $colour[4] . $colour[5]);
        } elseif (strlen($colour) == 3) {
            list($r, $g, $b) = array($colour[0] . $colour[0], $colour[1] . $colour[1], $colour[2] . $colour[2]);
        } else {
            return false;
        }
        $r = hexdec($r);
        $g = hexdec($g);
        $b = hexdec($b);
        // return array( 'red' => $r, 'green' => $g, 'blue' => $b );
        return array($r, $g, $b);
    }

    // hex to cmyk step 1
    public function hexTorgb($hex)
    {
        $color = str_replace('#', '', $hex);
        $rgb = array('r' => hexdec(substr($color, 0, 2)),
            'g' => hexdec(substr($color, 2, 2)),
            'b' => hexdec(substr($color, 4, 2)));
        return $rgb;
    }
    // hex to cmyk step 2
    public function rgb2cmyk($var1, $g = 0, $b = 0)
    {
        if (is_array($var1)) {
            $r = $var1['r'];
            $g = $var1['g'];
            $b = $var1['b'];
        } else {
            $r = $var1;
        }

        $cyan = 255 - $r;
        $magenta = 255 - $g;
        $yellow = 255 - $b;
        $black = min($cyan, $magenta, $yellow);
        $cyan = @(($cyan - $black) / (255 - $black)) * 255;
        $magenta = @(($magenta - $black) / (255 - $black)) * 255;
        $yellow = @(($yellow - $black) / (255 - $black)) * 255;

        return array($cyan / 255, $magenta / 255, $yellow / 255, $black / 255);

    }

    //hex & cmyk color
    public function cutoverColor($hexColor, $cmykColor, $isValid, $colorMode)
    {

        if (empty($hexColor) && empty($cmykColor)) {
            return null;
        } else if ($isValid == 0) {
            return null;
        } else if ($isValid > 0) {

            if ($colorMode == "cmyk") {

                if (empty($cmykColor) or substr($cmykColor, 0, 3) == "NaN") {

                    if (empty($hexColor) == false) {
                        // hex to cmyk
                        //return $this->rgb2cmyk($this->hexTorgb($hexColor));
                        if (substr($hexColor, 0, 1) == "#") {
                            return $this->hex2rgb($hexColor);
                        } else if (substr($hexColor, 0, 3) == "rgb") {
                            $hexColor = str_replace("rgb(", "", $hexColor);
                            $hexColor = str_replace("）", "", $hexColor);
                            return explode(",", $hexColor);
                        } else {
                            return null;
                        }

                    } else {
                        return null;
                    }

                } else {
                    return explode(",", $cmykColor);
                }

            } else if ($colorMode == "rgb") {

                if (empty($hexColor) == false) {
                    // hex to rgb
                    if (substr($hexColor, 0, 1) == "#") {
                        return $this->hex2rgb($hexColor);
                    } else if (substr($hexColor, 0, 4) == "rgba") {
                        // echo $hexColor;exit;
                        $hexColor = str_replace("rgba(", "", $hexColor);
                        $hexColor = str_replace("）", "", $hexColor);
                        $rgbaArr= explode(",", $hexColor);
                        return [$rgbaArr[0],$rgbaArr[1],$rgbaArr[2]];
                    } else if (substr($hexColor, 0, 3) == "rgb") {
                        $hexColor = str_replace("rgb(", "", $hexColor);
                        $hexColor = str_replace("）", "", $hexColor);
                        return explode(",", $hexColor);
                    } else {
                        return null;
                    }

                } else {
                    return null;
                }

            } else {
                return null;
            }

        }
    }

    //文本类画斜角线
    public function drawTextLine($parm)
    {

        $this->PDFDOC->SetXY($parm["left"], $parm["top"], true);

        //获取当前坐标
        $dx = $this->PDFDOC->GetX();
        $dy = $this->PDFDOC->GetY();

        //边框样式
        $dash = '';
        if ($parm["dash"] != null) {
            $dash = $parm["dash"][0] . "," . $parm["dash"][1];
        }

        //旋转角度
        $isAngle = false;

        $this->PDFDOC->SetLineStyle(array('width' => $parm["strokeWidth"], 'cap' => 'butt', 'join' => 'miter', 'dash' => $dash, 'color' => $parm["strokeColor"]));
        $this->PDFDOC->Polygon($parm["points"]);

    }

    //字体名称转换
    public function getFontName($name)
    {

        $oldchar = array(" ", "　", "\t", "\n", "\r");
        $newchar = array("", "", "", "", "");
        $name = str_replace($oldchar, $newchar, $name);
        return strtolower($name);
    }

    //验证字体 [下载及转换]
    public function verifyFont($fontname, $xetName)
    {

        /*字体+样式转换文件*/
        $lowerFontName = strtolower($fontname);

        if ($xetName == "") {
            $verifyFontStyle = $lowerFontName;
        } else if ($xetName == "b") {
            $verifyFontStyle = $lowerFontName . "-b";
        } else if ($xetName == "i") {
            $verifyFontStyle = $lowerFontName . "-i";
        } else if ($xetName == "bi") {
            $verifyFontStyle = $lowerFontName . "-bi";
        }

        //检查当前字体是否在可用字体中(API返回fontData)
        if (array_key_exists($verifyFontStyle, $this->fontData)) {

            //该字体可用,检查本地磁盘是否最新字体
            $checkFontFile = TCPDF_RAWFONT_PATH . "/" . str_replace("-", "", $verifyFontStyle) . ".php";
            if (!file_exists($checkFontFile)) {
                //不存在该磁盘,下载字体并转换
                $fontUrlPath = $this->fontData[$verifyFontStyle]["sourceUrl"];
                $pathArr = explode(".", $fontUrlPath);
                $extName = $pathArr[count($pathArr) - 1];
                //扩展名

                //下载->保存->转换
                $downFileStatus = $this->downToSaveFont($verifyFontStyle, $extName, $fontUrlPath);

                //返回操作流程结果
                return $downFileStatus;

            } else {
                //存在该磁盘，检查是否最新字体
                $vflogPath = $this->fontData[$verifyFontStyle]["vf"];
                if (file_exists(TCPDF_RAWFONT_PATH . "/vflog/" . $vflogPath)) {
                    //最新
                    return true;
                } else {
                    //不是最新,重新下载并替换
                    $fontUrlPath = $this->fontData[$verifyFontStyle]["sourceUrl"];
                    $pathArr = explode(".", $fontUrlPath);
                    $extName = $pathArr[count($pathArr) - 1];
                    //扩展名

                    //下载->保存->转换
                    $downFileStatus = $this->downToSaveFont($verifyFontStyle, $extName, $fontUrlPath);

                    //返回操作流程结果
                    return $downFileStatus;

                }

            }

        } else {
            //不存在该字体,检查是否存在历史字体文件(产生原因：设计时用了该字体，但后来删除了)
            //为了兼容：不删除字体及关联字体文件
            return true;
        }

    }

    //下载保存字体
    public function downToSaveFont($fontName, $extName, $fontUrlPath)
    {
        //字体文件路径
        $fontFile = TCPDF_RAWFONT_PATH . "/" . $fontName . "." . $extName;
        //原字体文件，删除原有的
        if (file_exists($fontFile)) {
            unlink($fontFile);
        }
        //删除原有转换后的字体文件 .php .z ctg.z
        if (file_exists(TCPDF_RAWFONT_PATH . $fontName . ".php")) {
            unlink(TCPDF_RAWFONT_PATH . $fontName . ".php");
        }
        if (file_exists(TCPDF_RAWFONT_PATH . $fontName . ".z")) {
            unlink(TCPDF_RAWFONT_PATH . $fontName . ".z");
        }
        if (file_exists(TCPDF_RAWFONT_PATH . $fontName . ".ctg.z")) {
            unlink(TCPDF_RAWFONT_PATH . $fontName . ".ctg.z");
        }

        $fileName = $fontName . "." . $extName;
        $result = $this->downFile($fontUrlPath, TCPDF_RAWFONT_PATH, $fileName, 1);
        if (!empty($result['file_name'])) {
            //字体转换
            $newFont = TCPDF_FONTS::addTTFfont($fontFile, '', '', 32, TCPDF_RAWFONT_PATH . "/");
            if ($newFont === false) {
                return false;
            } else {

                /* 多节点 字体不同步处理 */
                //生成 字体转换最新识别 文件 字体名样式名_vf_字体源文件.log
                $tmpNameArr = explode("/", $fontUrlPath);
                $sourceFontName = $tmpNameArr[count($tmpNameArr) - 1];
                $sourceFontName = str_replace(".", "_", $sourceFontName);
                $cvFontName = $fontName . "_vf_" . $sourceFontName . ".log";
                if (!file_exists(TCPDF_RAWFONT_PATH . "/vflog/" . $cvFontName)) {

                    //模糊搜索字体样式历史文件，删除该字体样式原有vf文件

                    //写入新vf文件
                    file_put_contents(TCPDF_RAWFONT_PATH . "/vflog/" . $cvFontName, time(), FILE_APPEND | LOCK_EX);
                }

                return true;
            }
        } else {
            return false;
        }

    }

    //下载文件
    public function downFile($url, $save_dir = '', $filename = '', $type = 0)
    {
        if (trim($url) == '') {
            return array(false, 'url none');
        }
        if (trim($save_dir) == '') {
            $save_dir = './';
        }
        if (0 !== strrpos($save_dir, '/')) {
            $save_dir .= '/';
        }

        //创建保存目录
        if (!file_exists($save_dir) && !mkdir($save_dir, 0777, true)) {
            return array(false, 'none Path:' . $save_dir);
        }
        //获取远程文件所采用的方法
        if ($type) {
            $ch = curl_init();
            $timeout = 30;
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $content = curl_exec($ch);
            curl_close($ch);
        } else {
            ob_start();
            readfile($url);
            $content = ob_get_contents();
            ob_end_clean();
        }
        $size = strlen($content);
        //文件大小
        $fp2 = @fopen($save_dir . $filename, 'a');
        fwrite($fp2, $content);
        fclose($fp2);
        unset($content, $url);
        return array(
            'file_name' => $filename,
            'save_path' => $save_dir . $filename,
        );
    }

    // 获取使用到的字体
    public function getFonts()
    {
        return $this->zipFont;
    }

    // 获取并保存图片，返回文件路径
    public function getImage($src)
    {
        if ($this->colorMode == 'cmyk') {
            // cmyk输出模式
            $cmyk_src = str_replace('rgb', 'cmyk', $src);
            $cmyk_header = @curl_getheader($cmyk_src);
            // 文件存在时才切换
            if ($cmyk_header !== false && $cmyk_header['code'] == 200) {
                $src = $cmyk_src;
            }
        }
        // 文件夹名称，图片URL的md5值
        $imageFolder = md5($src);
        $originalImage = $imageFolder . '/_original';
        $imageFile = K_PATH_IMAGES . $originalImage;
        if (!is_file($imageFile) || @getimagesize($imageFile) === false) {
            if (STORAGE_HOST != STORAGE_FAST_HOST) {
                $src = str_replace_once(STORAGE_HOST, STORAGE_FAST_HOST, $src);
            }
            // 创建文件夹
            if (!is_dir(K_PATH_IMAGES . $imageFolder)) {
                mkdir(K_PATH_IMAGES . $imageFolder);
            }
            if (empty(ENV_NAME)) {
                file_put_contents(K_PATH_IMAGES . $imageFolder . '/url.txt', $src);
            }
            // 下载文件
            $http = Http::request('');
            $http->setConfig('timeout', 300);
            $http->downloadFile($src, $imageFile);
        }

        $isMask = false;
        $maskPngPath = "";
        if (is_file($imageFile)) {
            // 修正图片偏色问题
            $image = new Imagick($imageFile);
            // 图片格式
            $imageFormat = strtolower($image->getImageFormat());

            if ($imageFormat == 'jpeg') {
                $colorSpace = $image->getImageColorspace();

                //Imagick::COLORSPACE_CMYK= 2
                //Imagick::COLORSPACE_SRGB= 23

                if ($this->colorMode == 'cmyk' && $colorSpace == Imagick::COLORSPACE_CMYK) {

                    // CMYK模式强制反相
                    $filePath = K_PATH_IMAGES . $imageFolder . '/cmyk.' . $imageFormat;

                    if (!is_file($filePath)) {
                        //echo $imageFile;exit;
                        //反相
                        $this->invertImage($imageFile, $filePath);
                        $imageFile = $filePath;

                    } else {
                        $imageFile = $filePath;
                    }
                } else if ($this->colorMode == 'cmyk' && $colorSpace == Imagick::COLORSPACE_SRGB) {

                    // 强制转为CMYK模式
                    $filePath = K_PATH_IMAGES . $imageFolder . '/cmyk.jpg';
                    if (!is_file($filePath)) {

                        $pdfCmykFile = K_PATH_IMAGES . $imageFolder . '/pdfCmyk.jpg';
                        $rgbIccPath = app()->getRootPath() . 'resource/icc/RGB/sRGB IEC61966-21.icc';
                        $cmykIccPath = app()->getRootPath() . 'resource/icc/CMYK/US Web Coated (SWOP) v2.icc';

                        $this->jpgRgbTojpgCmyk($imageFile, $filePath, $rgbIccPath, $cmykIccPath);

                        //反相
                        $this->invertImage($filePath, $pdfCmykFile);
                        $imageFile = $pdfCmykFile;

                    } else {
                        $pdfCmykFile = K_PATH_IMAGES . $imageFolder . '/pdfCmyk.jpg';
                        $imageFile = $pdfCmykFile;
                    }

                } else {

                    // 强制转为RGB模式
                    $filePath = K_PATH_IMAGES . $imageFolder . '/rgb.' . $imageFormat;
                    if (!is_file($filePath)) {

                        $iccFile = app()->getRootPath() . 'resource/icc/RGB/Apple RGB.icc';
                        $image->profileImage('icc', file_get_contents($iccFile));
                        $image->transformimagecolorspace(Imagick::COLORSPACE_SRGB);
                        $image->setImageFormat('jpeg');
                        if ($image->writeImage($filePath)) {
                            $imageFile = $filePath;
                        }

                        $image->clear();
                    } else {
                        $imageFile = $filePath;
                    }
                }
            } else if ($imageFormat == 'png') {

                if ($this->colorMode == 'cmyk') {

                    $filePath = K_PATH_IMAGES . $imageFolder . '/pdfCmyk.jpg';
                    if (!is_file($filePath)) {

                        $rgbIccPath = app()->getRootPath() . 'resource/icc/RGB/sRGB IEC61966-21.icc';
                        $cmykIccPath = app()->getRootPath() . 'resource/icc/CMYK/US Web Coated (SWOP) v2.icc';

                        $fileName = $imageFile;
                        $shaowFile = K_PATH_IMAGES . $imageFolder . '/shaowRgb.png';
                        $outCmykFile = K_PATH_IMAGES . $imageFolder . '/cmyk.jpg';
                        $pdfCmykFile = K_PATH_IMAGES . $imageFolder . '/pdfCmyk.jpg';
                        $maskPngPath = K_PATH_IMAGES . $imageFolder . '/maskRgb.png';

                        // STEP 1 获取图片遮罩
                        $this->getImageMask($fileName, $maskPngPath);

                        // STEP 2 阴影面积处理
                        $isMask = $this->resetImageShaow($fileName, $shaowFile, 0.92);

                        // STEP 3 RGB PNG 转 CMYK JPG
                        $this->pngRgbTojpgCmyk($shaowFile, $outCmykFile, $rgbIccPath, $cmykIccPath);

                        // STEP 4 反相
                        $this->invertImage($outCmykFile, $pdfCmykFile);

                        $imageFile = $pdfCmykFile;
                    } else {
                        $imageFile = $filePath;

                        if (is_file(K_PATH_IMAGES . $imageFolder . '/maskRgb.png')) {

                            $isMask = true;
                            $maskPngPath = K_PATH_IMAGES . $imageFolder . '/maskRgb.png';

                        }

                    }
                }
            }
        }

        return array("imageFile" => $imageFile, "isMask" => $isMask, "maskImg" => $maskPngPath);
    }

    //JPG RGB -> JPGCMYK 准确率99.98%
    public function jpgRgbTojpgCmyk($fileName, $outFile, $rgbIccPath, $cmykIccPath)
    {

        /*$img = new Imagick();
        $img->readImage($fileName);
        $img = Image::make($img);
        $img->opacity(100);
        $img_core = $img->getCore();
        $img_core->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
        $img_core->setImageResolution(300, 300);
        $iccFile = file_get_contents($cmykIccPath);
        $img_core->profileImage('icc', $iccFile);
        $img_core->transformimagecolorspace(\Imagick::COLORSPACE_CMYK);
        $img->save($outFile, 100, 'jpg');
        $img->destroy();*/

        $img = new Imagick();
        $img->readImage($fileName);
        $img = Image::make($img);
        $img->opacity(100);
        $img_core = $img->getCore();
        $img_core->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
        $img_core->setImageResolution(300, 300);
        $iccFile = file_get_contents($rgbIccPath);
        $img_core->profileImage('icc', $iccFile);
        $img_core->transformimagecolorspace(\Imagick::COLORSPACE_SRGB);
        $img->save($outFile, 100, 'jpg');
        $img->destroy();

        $img2 = new Imagick();
        $img2->readImage($outFile);
        $img2 = Image::make($img2);
        $img2->opacity(100);
        $img2_core = $img2->getCore();
        $img2_core->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
        $img2_core->setImageResolution(300, 300);
        $iccFile = file_get_contents($cmykIccPath);
        $img2_core->profileImage('icc', $iccFile);
        $img2_core->transformimagecolorspace(\Imagick::COLORSPACE_CMYK);
        $img2->save($outFile, 100, 'jpg');
        $img2->destroy();

    }

    public function jpgRgbTojpgCmyk_bak_20230314($fileName, $outFile, $iccPath)
    {

        $img = new Imagick();
        $img->readImage($fileName);
        $img = Image::make($img);
        $img->opacity(100);
        $img_core = $img->getCore();
        $img_core->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
        $img_core->setImageResolution(300, 300);
        $iccFile = file_get_contents($iccPath);
        $img_core->profileImage('icc', $iccFile);
        $img_core->transformimagecolorspace(\Imagick::COLORSPACE_CMYK);
        $img->save($outFile, 100, 'jpg');
        $img->destroy();
    }

    //PNG RGB -> JPG RGB ->JPG CMYK 准确率99.98%
    public function pngRgbTojpgCmyk($fileName, $outFile, $rgbIccPath, $cmykIccPath)
    {

        $img = new Imagick();
        $img->readImage($fileName);
        $img = Image::make($img);
        $img->opacity(100);
        $img_core = $img->getCore();
        $img_core->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
        $img_core->setImageResolution(300, 300);
        $iccFile = file_get_contents($rgbIccPath);
        $img_core->profileImage('icc', $iccFile);
        $img_core->transformimagecolorspace(\Imagick::COLORSPACE_SRGB);
        $img->save($outFile, 100, 'jpg');
        $img->destroy();

        $img2 = new Imagick();
        $img2->readImage($outFile);
        $img2 = Image::make($img2);
        $img2->opacity(100);
        $img2_core = $img2->getCore();
        $img2_core->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
        $img2_core->setImageResolution(300, 300);
        $iccFile = file_get_contents($cmykIccPath);
        $img2_core->profileImage('icc', $iccFile);
        $img2_core->transformimagecolorspace(\Imagick::COLORSPACE_CMYK);
        $img2->save($outFile, 100, 'jpg');
        $img2->destroy();
    }

    //遮罩获取（透明区域黑白二值图）黑色不显示，白色穿透显示
    public function getImageMask($fileName, $outFile)
    {

        $img = new Imagick();
        $img->readImage($fileName);
        $img->setImageAlphaChannel(Imagick::ALPHACHANNEL_EXTRACT);
        $img->setImageFormat('png');
        $img->writeImage($outFile);
        $img->destroy();
    }

    //更改透明像素加减深颜色
    public function resetImageShaow($fileName, $outFile, $upValue)
    {

        $isMask = false;
        $img = new Imagick($fileName);
        $pixel_iterator = $img->getPixelIterator();
        foreach ($pixel_iterator as $y => $pixels) {

            foreach ($pixels as $x => $pixel) {
                $color = $pixel->getColor(true);

                if ($color['a'] > 0 and $color['a'] < 1) {

                    $color['r'] = $color['r'] * $upValue * 255;
                    $color['g'] = $color['g'] * $upValue * 255;
                    $color['b'] = $color['b'] * $upValue * 255;
                    $pixel->setColor("rgb(" . $color['r'] . "," . $color['g'] . "," . $color['b'] . ")");
                    $isMask = true;
                }

            }
            $pixel_iterator->syncIterator();
        }

        $img->setImageFormat('png');
        $img->writeImage($outFile);
        $img->destroy();
        return $isMask;
    }

    //图片反相 用于CMYK图片在AI中显示（AI中TCPDF输出的CMYK图片会反相反色）
    public function invertImage($fileName, $outFile)
    {

        $img = new Imagick();
        $img->readImage($fileName);
        $img = Image::make($img);
        $img->invert(); //反相
        $img->save($outFile, 100, 'jpg');
        $img->destroy();
    }

    // JPG CMYK -> PNG RGB 未测
    public function jpgCmykToPngRgb($fileName, $outFile, $iccPath)
    {

        $img = new Imagick();
        $img->readImage($fileName);
        $img = Image::make($img);
        $img->opacity(100);
        $img_core = $img->getCore();
        $img_core->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
        $img_core->setImageResolution(300, 300);
        $iccFile = file_get_contents($iccPath);
        $img_core->profileImage('icc', $iccFile);
        $img_core->transformimagecolorspace(\Imagick::COLORSPACE_SRGB);
        $img->save($outFile, 100, 'png');
        $img->destroy();
    }

    //linear radial color
    public function svgFillRander($fillObj, $strokeWidthUnit)
    {

        $gradientType = $fillObj["fillColor"]->type;

        switch ($gradientType) {

            case "linear":

                $dataCoords = $fillObj["fillColor"]->coords;
                $gtm = $fillObj["fillColor"]->gradientTransform;
                $crzx = ($gtm[0] == 1) ? 1 : $gtm[0] * 1;
                $crzy = ($gtm[3] == 1) ? 1 : $gtm[3] * 1;

                $coordsOffsetX = $fillObj["fillColor"]->offsetX * $fillObj["scaleX"];
                $coordsOffsetY = $fillObj["fillColor"]->offsetY * $fillObj["scaleY"];

                if ($fillObj["fillColor"]->gradientUnits=="pixels"){
                    $gradientColorWidth = $this->pxToUnit($gtm[0] * ($dataCoords->x1 + $dataCoords->x2) + $gtm[4] * 2);
                    $gradientColorHeight = $this->pxToUnit($gtm[3] * ($dataCoords->y1 + $dataCoords->y2) + $gtm[5] * 2);
                }else {

                    $gradientColorWidth = $fillObj["width"];
                    $gradientColorHeight = $fillObj["height"];

                }



                // echo $gradientColorWidth;exit;

                $gradientColorX = $fillObj["left"];
                $gradientColorY = $fillObj["top"];
                $gradientColorX = $gradientColorX + $this->pxToUnit($fillObj["fillColor"]->offsetX * $fillObj["scaleX"]) + $strokeWidthUnit;
                $gradientColorY = $gradientColorY + $this->pxToUnit($fillObj["fillColor"]->offsetY * $fillObj["scaleY"]) + $strokeWidthUnit;

                $fillObjGradientNode = [];
                $gradientNode = [];
                $colorStops = $fillObj["fillColor"]->colorStops;
                for ($c = 0; $c < count($colorStops); $c++) {

                    // @ _cArr=>array('color' => $col1, 'offset' => 0, 'exponent' => 1,'opacity'=>1)

                    $_Color = $colorStops[$c]->color;
                    $_Color = str_replace("rgb(", "", $_Color);
                    $_Color = str_replace(")", "", $_Color);
                    $_Color = explode(",", $_Color);

                    $_cArr = array('color' => $_Color, 'offset' => $colorStops[$c]->offset * 1, 'exponent' => 1, 'opacity' => $colorStops[$c]->opacity * 1);
                    $fillObjGradientNode[$c] = $_cArr;

                }

                $gradientNode = array_reverse($fillObjGradientNode);

                if ($gradientColorWidth == 0) {
                    $x1 = 0;
                    $x2 = 0;
                } else {
                    $x1 = $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4]) / $gradientColorWidth;
                    $x2 = $this->pxToUnit($dataCoords->x2 * $crzx + $gtm[4]) / $gradientColorWidth;
                }
                if ($gradientColorHeight == 0) {
                    $y1 = 0;
                    $y2 = 0;
                } else {
                    $y1 = 1 - $this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5]) / $gradientColorHeight;
                    $y2 = 1 - $this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5]) / $gradientColorHeight;
                }

                if ($gradientColorWidth != 0 and $gradientColorHeight != 0) {
                    $x1 = $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4]) / $gradientColorWidth;
                    $x2 = $this->pxToUnit($dataCoords->x2 * $crzx + $gtm[4]) / $gradientColorWidth;
                    $y1 = 1 - $this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5]) / $gradientColorHeight;
                    $y2 = 1 - $this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5]) / $gradientColorHeight;
                }

                if ($fillObj["fillColor"]->gradientUnits=="pixels"){
                    //gradientUnits: "pixels"
                    $coords = array($x1, $y1, $x2, $y2);
                }else{
                    //gradientUnits: "percentage"
                    $coords = array($dataCoords->x1, $dataCoords->y1, $dataCoords->x2, $dataCoords->y2);
                    $fillObj["scaleX"]=1;
                    $fillObj["scaleY"]=1;
                }

                /*
                $coords=array(

                $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4])/$gradientColorWidth,
                1-$this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5])/$gradientColorHeight,

                $this->pxToUnit($dataCoords->x2 * $crzx+ $gtm[4])/$gradientColorWidth,
                1-$this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5])/$gradientColorHeight,

                );*/

                $this->PDFDOC->StartTransform();

                if ($gradientColorHeight < $fillObj["height"]) {
                    $drawHeight = $fillObj["height"];
                } else {
                    $drawHeight = $gradientColorHeight;
                }

                switch ($fillObj["type"]) {
                    case "rect":
                        $this->PDFDOC->Rect($fillObj["left"] + $strokeWidthUnit / 2, $fillObj["top"] + $strokeWidthUnit / 2, $fillObj["width"], $fillObj["height"], 'CNZ');
                        break;
                    case "circle":
                        $this->PDFDOC->Circle($fillObj["pointX"] + $fillObj["strokeWidth"], $fillObj["pointY"] + $fillObj["strokeWidth"], $fillObj["radiusY"], 0, 360, 'CNZ');
                        break;
                    case "ellipse":

                        $this->PDFDOC->Ellipse($fillObj["pointX"], $fillObj["pointY"], $fillObj["rx"], $fillObj["ry"], -1 * $fillObj["angle"], $fillObj["astart"], $fillObj["afinish"], 'CNZ');

                        //$this->PDFDOC->Ellipse($fillObj["pointX"], $fillObj["pointY"], $fillObj["rx"], $fillObj["ry"], -1 * $fillObj["angle"], $fillObj["astart"], $fillObj["afinish"], 'D');
                        break;
                    case "polygon":
                        $this->PDFDOC->Polygon($fillObj["points"], "CNZ");
                        break;
                    case "path":
                        $this->PDFDOC->SVGPathExpand($fillObj["dText"], "CNZ", $this->pdfUnit);
                        // $gradientColorWidth=$gradientColorWidth + $fillObj["strokeWidth"] * 4;
                        // $drawHeight=$drawHeight + $fillObj["strokeWidth"] * 4;

                        break;
                }

                $isAngle = false;
                if ($fillObj["type"] == "ellipse" and $fillObj["isAngle"] == true) {
                    $this->PDFDOC->rotate(-1 * $fillObj["angle"] * 1, $fillObj["angleX"], $fillObj["angleY"]);
                    $isAngle = true;
                }

                $this->PDFDOC->LinearGradientExpand($gradientColorX, $gradientColorY, $gradientColorWidth * $fillObj["scaleX"], $drawHeight * $fillObj["scaleY"], $gradientNode, $coords);

                //还原角度
                if ($isAngle == true) {
                    $this->PDFDOC->rotate(1 * $fillObj["angle"] * 1, $fillObj["rx"], $fillObj["ry"]);
                }

                $this->PDFDOC->StopTransform();

                break;

            case "linear_bak":

                $dataCoords = $fillObj["fillColor"]->coords;
                $gtm = $fillObj["fillColor"]->gradientTransform;
                $crzx = ($gtm[0] == 1) ? 1 : $gtm[0] * 1;
                $crzy = ($gtm[3] == 1) ? 1 : $gtm[3] * 1;

                $coordsOffsetX = $fillObj["fillColor"]->offsetX * $fillObj["scaleX"];
                $coordsOffsetY = $fillObj["fillColor"]->offsetY * $fillObj["scaleY"];

                $gradientColorWidth = $this->pxToUnit($gtm[0] * ($dataCoords->x1 + $dataCoords->x2) + $gtm[4] * 2);
                $gradientColorHeight = $this->pxToUnit($gtm[3] * ($dataCoords->y1 + $dataCoords->y2) + $gtm[5] * 2);

                $gradientColorX = $fillObj["left"];
                $gradientColorY = $fillObj["top"];
                $gradientColorX = $gradientColorX + $this->pxToUnit($fillObj["fillColor"]->offsetX * $fillObj["scaleX"]) + $strokeWidthUnit;
                $gradientColorY = $gradientColorY + $this->pxToUnit($fillObj["fillColor"]->offsetY * $fillObj["scaleY"]) + $strokeWidthUnit;

                $fillObjGradientNode = [];
                $gradientNode = [];
                $colorStops = $fillObj["fillColor"]->colorStops;
                for ($c = 0; $c < count($colorStops); $c++) {

                    // @ _cArr=>array('color' => $col1, 'offset' => 0, 'exponent' => 1,'opacity'=>1)

                    $_Color = $colorStops[$c]->color;
                    $_Color = str_replace("rgb(", "", $_Color);
                    $_Color = str_replace(")", "", $_Color);
                    $_Color = explode(",", $_Color);

                    $_cArr = array('color' => $_Color, 'offset' => $colorStops[$c]->offset * 1, 'exponent' => 1, 'opacity' => $colorStops[$c]->opacity * 1);
                    $fillObjGradientNode[$c] = $_cArr;

                }

                $gradientNode = array_reverse($fillObjGradientNode);

                if ($gradientColorWidth == 0) {
                    $x1 = 0;
                    $x2 = 0;
                } else {
                    $x1 = $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4]) / $gradientColorWidth;
                    $x2 = $this->pxToUnit($dataCoords->x2 * $crzx + $gtm[4]) / $gradientColorWidth;
                }
                if ($gradientColorHeight == 0) {
                    $y1 = 0;
                    $y2 = 0;
                } else {
                    $y1 = 1 - $this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5]) / $gradientColorHeight;
                    $y2 = 1 - $this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5]) / $gradientColorHeight;
                }

                if ($gradientColorWidth != 0 and $gradientColorHeight != 0) {
                    $x1 = $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4]) / $gradientColorWidth;
                    $x2 = $this->pxToUnit($dataCoords->x2 * $crzx + $gtm[4]) / $gradientColorWidth;
                    $y1 = 1 - $this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5]) / $gradientColorHeight;
                    $y2 = 1 - $this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5]) / $gradientColorHeight;
                }

                $coords = array($x1, $y1, $x2, $y2);

                /*
                $coords=array(

                $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4])/$gradientColorWidth,
                1-$this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5])/$gradientColorHeight,

                $this->pxToUnit($dataCoords->x2 * $crzx+ $gtm[4])/$gradientColorWidth,
                1-$this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5])/$gradientColorHeight,

                );*/

                $this->PDFDOC->StartTransform();

                if ($gradientColorHeight < $fillObj["height"]) {
                    $drawHeight = $fillObj["height"];
                } else {
                    $drawHeight = $gradientColorHeight;
                }

                switch ($fillObj["type"]) {
                    case "rect":
                        $this->PDFDOC->Rect($fillObj["left"] + $strokeWidthUnit / 2, $fillObj["top"] + $strokeWidthUnit / 2, $fillObj["width"], $fillObj["height"], 'CNZ');
                        break;
                    case "circle":
                        $this->PDFDOC->Circle($fillObj["pointX"] + $fillObj["strokeWidth"], $fillObj["pointY"] + $fillObj["strokeWidth"], $fillObj["radiusY"], 0, 360, 'CNZ');
                        break;
                    case "ellipse":

                        $this->PDFDOC->Ellipse($fillObj["pointX"], $fillObj["pointY"], $fillObj["rx"], $fillObj["ry"], -1 * $fillObj["angle"], $fillObj["astart"], $fillObj["afinish"], 'CNZ');

                        //$this->PDFDOC->Ellipse($fillObj["pointX"], $fillObj["pointY"], $fillObj["rx"], $fillObj["ry"], -1 * $fillObj["angle"], $fillObj["astart"], $fillObj["afinish"], 'D');
                        break;
                    case "polygon":
                        $this->PDFDOC->Polygon($fillObj["points"], "CNZ");
                        break;
                    case "path":
                        $this->PDFDOC->SVGPathExpand($fillObj["dText"], "CNZ", $this->pdfUnit);
                        break;
                }

                $isAngle = false;
                if ($fillObj["type"] == "ellipse" and $fillObj["isAngle"] == true) {
                    $this->PDFDOC->rotate(-1 * $fillObj["angle"] * 1, $fillObj["angleX"], $fillObj["angleY"]);
                    $isAngle = true;
                }
                //echo "gradientColorX=" . $gradientColorX . " , gradientColorY=" . $gradientColorY . " , gradientColorWidth=" . $gradientColorWidth . " , drawHeight=" . $drawHeight;
                //echo json_encode($gradientNode);exit;
                $this->PDFDOC->LinearGradientExpand($gradientColorX, $gradientColorY, $gradientColorWidth * $fillObj["scaleX"], $drawHeight * $fillObj["scaleY"], $gradientNode, $coords);

                //还原角度
                if ($isAngle == true) {
                    $this->PDFDOC->rotate(1 * $fillObj["angle"] * 1, $fillObj["rx"], $fillObj["ry"]);
                }

                $this->PDFDOC->StopTransform();

                break;

            case "radial":
                $dataCoords = $fillObj["fillColor"]->coords;
                $gtm = $fillObj["fillColor"]->gradientTransform;
                $crzx = ($gtm[0] == 1) ? 1 : $gtm[0] * 1;
                $crzy = ($gtm[3] == 1) ? 1 : $gtm[3] * 1;

                $coordsOffsetX = $fillObj["fillColor"]->offsetX * $fillObj["scaleX"];
                $coordsOffsetY = $fillObj["fillColor"]->offsetY * $fillObj["scaleY"];

                if ($coordsOffsetY > 0 and $gtm[3] > 0) {
                    $gtm[3] = -1 * $gtm[3];
                }

                $gradientColorX = $fillObj["left"];
                $gradientColorY = $fillObj["top"];
                $gradientColorX = $gradientColorX + $this->pxToUnit($coordsOffsetX) + $strokeWidthUnit;
                $gradientColorY = $gradientColorY + $this->pxToUnit($coordsOffsetY) + $strokeWidthUnit;

                /*
                宽只显示右边一半 bug
                gtm[0] =>(>0) gtm[3] =>(<0) offsetX =>(>0) offsetY =>(>0)
                 */
                if ($fillObj["fillColor"]->offsetY > 0 and $fillObj["fillColor"]->offsetX > 0 and $gtm[3] < 0 and $gtm[0] > 0) {

                    $gradientColorX = $gradientColorX - $this->pxToUnit($coordsOffsetX);
                    $gradientColorY = $gradientColorY - $this->pxToUnit($coordsOffsetY);
                    $dataCoords->x1 = $dataCoords->x1 + $coordsOffsetX * 2;
                    $dataCoords->x2 = $dataCoords->x2 + $coordsOffsetX * 2;

                    $dataCoords->y1 = $dataCoords->y1 - $coordsOffsetY;
                    $dataCoords->y2 = $dataCoords->y2 - $coordsOffsetY;

                }

                $drawWidth = $fillObj["left"] + $fillObj["width"] - $gradientColorX - $this->pxToUnit($fillObj["fillColor"]->offsetX * $fillObj["scaleX"]);
                $drawHeight = $fillObj["top"] + $fillObj["height"] - $gradientColorY - $this->pxToUnit($fillObj["fillColor"]->offsetY * $fillObj["scaleY"]);

                $offCroodsY = 0;
                if ($coordsOffsetY > 0 and array_key_exists("viewBoxWidth", $fillObj)) {

                    $drawWidth = $this->pxToUnit($fillObj["viewBoxWidth"]) * $fillObj["scaleX"];
                    if ($gtm[3] < 0) {

                        $drawHeight = $this->pxToUnit($fillObj["viewBoxHeight"]) * $fillObj["scaleY"];
                        if ($drawHeight == $drawWidth) {
                            if ($fillObj["width"] != $fillObj["height"]) {
                                $drawHeight = $drawHeight * $fillObj["height"] / $fillObj["width"];
                            }
                        }
                        $gradientColorY = $fillObj["top"];

                        if ($fillObj["width"] > $fillObj["height"]) {
                            $offCroodsY = ($fillObj["width"] - $fillObj["height"]);
                        }

                        $gtm[5] = $gtm[5] + $fillObj["fillColor"]->offsetY;
                    } else {

                        $drawHeight = $this->pxToUnit($fillObj["viewBoxHeight"]) * $fillObj["scaleY"];
                        if ($drawHeight == $drawWidth) {
                            if ($fillObj["width"] != $fillObj["height"]) {
                                $drawHeight = $drawHeight * $fillObj["height"] / $fillObj["width"];
                            }
                        }
                    }

                }

                if (abs($crzy) == abs($crzx) && $fillObj["scaleX"] == $fillObj["scaleY"]) {

                    if ($drawWidth > $drawHeight) {
                        $drawHeight = $drawWidth;
                    } else {
                        $drawWidth = $drawHeight;
                    }
                }

                $gradientColorWidth = $drawWidth;
                $gradientColorHeight = $drawHeight;

                $fillObjGradientNode = [];
                $gradientNode = [];
                $colorStops = $fillObj["fillColor"]->colorStops;
                for ($c = 0; $c < count($colorStops); $c++) {

                    // @ _cArr=>array('color' => $col1, 'offset' => 0, 'exponent' => 1,'opacity'=>1)

                    $_Color = $colorStops[$c]->color;
                    $_Color = str_replace("rgb(", "", $_Color);
                    $_Color = str_replace(")", "", $_Color);
                    $_Color = explode(",", $_Color);

                    $_cArr = array('color' => $_Color, 'offset' => $colorStops[$c]->offset * 1, 'exponent' => 1, 'opacity' => $colorStops[$c]->opacity * 1);
                    $fillObjGradientNode[$c] = $_cArr;

                }

                $gradientNode = array_reverse($fillObjGradientNode);

                /**
                 * $coords 形式的数组 (fx, fy, cx, cy, r) 其中 (fx, fy) 是颜色 1 的渐变起点，(cx, cy) 是颜色 2 的圆心，r 是 圆的半径
                （参见 radial_gradient_coords.jpg）。 (fx, fy) 应该在圆圈内，否则某些区域将无法定义。
                 **/

                $r = $this->pxToUnit($dataCoords->r2 * $crzy * $fillObj["scaleY"]) / $gradientColorHeight;
                if (abs($crzy) != abs($crzx) && $fillObj["scaleX"] == $fillObj["scaleY"]) {

                    if ($fillObj["width"] > $fillObj["height"]) {
                        $r = $this->pxToUnit($dataCoords->r2 * $crzx * $fillObj["scaleX"]) / $gradientColorWidth;
                    }
                }

                if ($r < 0) {
                    $r = $this->pxToUnit($dataCoords->r2 * $crzx * $fillObj["scaleX"]) / $gradientColorWidth;
                }

                if ($fillObj["scaleX"] < $fillObj["scaleY"] and $fillObj["type"] == "ellipse") {
                    $bi = $fillObj["scaleX"] / $fillObj["scaleY"];
                    $gradientColorWidth = $gradientColorWidth / $bi;
                    $dataCoords->x1 = $dataCoords->x1 / $bi;
                    $dataCoords->x2 = $dataCoords->x2 / $bi;
                }

                $coords = array(
                    $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4]) * $fillObj["scaleX"] / $gradientColorWidth,
                    1 - $this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5]) * $fillObj["scaleY"] / $gradientColorHeight,

                    $this->pxToUnit($dataCoords->x2 * $crzx + $gtm[4]) * $fillObj["scaleX"] / $gradientColorWidth,
                    1 - $this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5]) * $fillObj["scaleY"] / $gradientColorHeight,
                    $r,
                );

                $this->PDFDOC->StartTransform();

                switch ($fillObj["type"]) {
                    case "rect":
                        $this->PDFDOC->Rect($fillObj["left"] + $strokeWidthUnit / 2, $fillObj["top"] + $strokeWidthUnit / 2, $fillObj["width"], $fillObj["height"], 'CNZ');
                        $this->PDFDOC->Rect($fillObj["left"] + $strokeWidthUnit / 2, $fillObj["top"] + $strokeWidthUnit / 2, $fillObj["width"], $fillObj["height"], 'D');
                        if ($drawHeight > $gradientColorWidth) {
                            $gradientColorWidth = $drawHeight;
                        } else if ($gtm[0] > $gtm[3]) {

                        }

                        break;
                    case "circle":
                        $this->PDFDOC->Circle($fillObj["pointX"], $fillObj["pointY"], $fillObj["radiusY"], 0, 360, 'CNZ');
                        break;
                    case "ellipse":
                        $this->PDFDOC->Ellipse($fillObj["x0"], $fillObj["y0"], $fillObj["rx"], $fillObj["ry"], -1 * $fillObj["angle"], $fillObj["astart"], $fillObj["afinish"], 'CNZ');
                        $this->PDFDOC->Ellipse($fillObj["x0"], $fillObj["y0"], $fillObj["rx"], $fillObj["ry"], -1 * $fillObj["angle"], $fillObj["astart"], $fillObj["afinish"], 'F');
                        $fillObj["pointX"] = $fillObj["x0"];
                        $fillObj["pointY"] = $fillObj["y0"];

                        if ($drawHeight > $gradientColorWidth) {
                            $drawHeight = $gradientColorWidth;
                        }

                        break;
                    case "polygon":
                        $this->PDFDOC->Polygon($fillObj["points"], "CNZ");
                        break;
                    case "path":
                        $this->PDFDOC->SVGPathExpand($fillObj["dText"], "CNZ", $this->pdfUnit);
                        break;
                }

                $isAngle = false;
                if ($fillObj["type"] == "ellipse" and $fillObj["isAngle"] == true) {
                    $this->PDFDOC->rotate(-1 * $fillObj["angle"] * 1, $fillObj["angleX"], $fillObj["angleY"]);
                    $isAngle = true;
                }

                $this->PDFDOC->RadialGradientExpand($gradientColorX, $gradientColorY, $drawWidth, $drawHeight, $gradientNode, $coords);

                //还原角度
                if ($isAngle == true) {
                    $this->PDFDOC->rotate(1 * $fillObj["angle"] * 1, $fillObj["rx"], $fillObj["ry"]);
                }

                $this->PDFDOC->StopTransform();

                break;

        }

    }

    public function svgFillRander_bak_20230416($fillObj, $strokeWidthUnit)
    {

        $gradientType = $fillObj["fillColor"]->type;

        switch ($gradientType) {

            case "linear":

                $dataCoords = $fillObj["fillColor"]->coords;
                $gtm = $fillObj["fillColor"]->gradientTransform;
                $crzx = ($gtm[0] == 1) ? 1 : $gtm[0] * 1;
                $crzy = ($gtm[3] == 1) ? 1 : $gtm[3] * 1;

                $coordsOffsetX = $fillObj["fillColor"]->offsetX * $fillObj["scaleX"];
                $coordsOffsetY = $fillObj["fillColor"]->offsetY * $fillObj["scaleY"];

                $gradientColorWidth = $this->pxToUnit($gtm[0] * ($dataCoords->x1 + $dataCoords->x2) + $gtm[4] * 2);
                $gradientColorHeight = $this->pxToUnit($gtm[3] * ($dataCoords->y1 + $dataCoords->y2) + $gtm[5] * 2);

                //echo $gradientColorWidth;exit;

                $gradientColorX = $fillObj["left"];
                $gradientColorY = $fillObj["top"];
                $gradientColorX = $gradientColorX + $this->pxToUnit($fillObj["fillColor"]->offsetX * $fillObj["scaleX"]) + $strokeWidthUnit;
                $gradientColorY = $gradientColorY + $this->pxToUnit($fillObj["fillColor"]->offsetY * $fillObj["scaleY"]) + $strokeWidthUnit;

                $fillObjGradientNode = [];
                $gradientNode = [];
                $colorStops = $fillObj["fillColor"]->colorStops;
                for ($c = 0; $c < count($colorStops); $c++) {

                    // @ _cArr=>array('color' => $col1, 'offset' => 0, 'exponent' => 1,'opacity'=>1)

                    $_Color = $colorStops[$c]->color;
                    $_Color = str_replace("rgb(", "", $_Color);
                    $_Color = str_replace(")", "", $_Color);
                    $_Color = explode(",", $_Color);

                    $_cArr = array('color' => $_Color, 'offset' => $colorStops[$c]->offset * 1, 'exponent' => 1, 'opacity' => $colorStops[$c]->opacity * 1);
                    $fillObjGradientNode[$c] = $_cArr;

                }

                $gradientNode = array_reverse($fillObjGradientNode);

                if ($gradientColorWidth == 0) {
                    $x1 = 0;
                    $x2 = 0;
                } else {
                    $x1 = $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4]) / $gradientColorWidth;
                    $x2 = $this->pxToUnit($dataCoords->x2 * $crzx + $gtm[4]) / $gradientColorWidth;
                }
                if ($gradientColorHeight == 0) {
                    $y1 = 0;
                    $y2 = 0;
                } else {
                    $y1 = 1 - $this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5]) / $gradientColorHeight;
                    $y2 = 1 - $this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5]) / $gradientColorHeight;
                }

                if ($gradientColorWidth != 0 and $gradientColorHeight != 0) {
                    $x1 = $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4]) / $gradientColorWidth;
                    $x2 = $this->pxToUnit($dataCoords->x2 * $crzx + $gtm[4]) / $gradientColorWidth;
                    $y1 = 1 - $this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5]) / $gradientColorHeight;
                    $y2 = 1 - $this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5]) / $gradientColorHeight;
                }

                $coords = array($x1, $y1, $x2, $y2);

                /*
                $coords=array(

                $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4])/$gradientColorWidth,
                1-$this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5])/$gradientColorHeight,

                $this->pxToUnit($dataCoords->x2 * $crzx+ $gtm[4])/$gradientColorWidth,
                1-$this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5])/$gradientColorHeight,

                );*/

                $this->PDFDOC->StartTransform();

                if ($gradientColorHeight < $fillObj["height"]) {
                    $drawHeight = $fillObj["height"];
                } else {
                    $drawHeight = $gradientColorHeight;
                }

                switch ($fillObj["type"]) {
                    case "rect":
                        $this->PDFDOC->Rect($fillObj["left"] + $strokeWidthUnit / 2, $fillObj["top"] + $strokeWidthUnit / 2, $fillObj["width"], $fillObj["height"], 'CNZ');
                        break;
                    case "circle":
                        $this->PDFDOC->Circle($fillObj["pointX"] + $fillObj["strokeWidth"], $fillObj["pointY"] + $fillObj["strokeWidth"], $fillObj["radiusY"], 0, 360, 'CNZ');
                        break;
                    case "ellipse":

                        $this->PDFDOC->Ellipse($fillObj["pointX"], $fillObj["pointY"], $fillObj["rx"], $fillObj["ry"], -1 * $fillObj["angle"], $fillObj["astart"], $fillObj["afinish"], 'CNZ');

                        //$this->PDFDOC->Ellipse($fillObj["pointX"], $fillObj["pointY"], $fillObj["rx"], $fillObj["ry"], -1 * $fillObj["angle"], $fillObj["astart"], $fillObj["afinish"], 'D');
                        break;
                    case "polygon":
                        $this->PDFDOC->Polygon($fillObj["points"], "CNZ");
                        break;
                    case "path":
                        $this->PDFDOC->SVGPathExpand($fillObj["dText"], "CNZ", $this->pdfUnit);
                        break;
                }

                $isAngle = false;
                if ($fillObj["type"] == "ellipse" and $fillObj["isAngle"] == true) {
                    $this->PDFDOC->rotate(-1 * $fillObj["angle"] * 1, $fillObj["angleX"], $fillObj["angleY"]);
                    $isAngle = true;
                }
                //echo "gradientColorX=" . $gradientColorX . " , gradientColorY=" . $gradientColorY . " , gradientColorWidth=" . $gradientColorWidth . " , drawHeight=" . $drawHeight;
                //echo json_encode($gradientNode);exit;
                $this->PDFDOC->LinearGradientExpand($gradientColorX, $gradientColorY, $gradientColorWidth * $fillObj["scaleX"], $drawHeight * $fillObj["scaleY"], $gradientNode, $coords);

                //还原角度
                if ($isAngle == true) {
                    $this->PDFDOC->rotate(1 * $fillObj["angle"] * 1, $fillObj["rx"], $fillObj["ry"]);
                }

                $this->PDFDOC->StopTransform();

                break;

            case "linear_bak":

                $dataCoords = $fillObj["fillColor"]->coords;
                $gtm = $fillObj["fillColor"]->gradientTransform;
                $crzx = ($gtm[0] == 1) ? 1 : $gtm[0] * 1;
                $crzy = ($gtm[3] == 1) ? 1 : $gtm[3] * 1;

                $coordsOffsetX = $fillObj["fillColor"]->offsetX * $fillObj["scaleX"];
                $coordsOffsetY = $fillObj["fillColor"]->offsetY * $fillObj["scaleY"];

                $gradientColorWidth = $this->pxToUnit($gtm[0] * ($dataCoords->x1 + $dataCoords->x2) + $gtm[4] * 2);
                $gradientColorHeight = $this->pxToUnit($gtm[3] * ($dataCoords->y1 + $dataCoords->y2) + $gtm[5] * 2);

                $gradientColorX = $fillObj["left"];
                $gradientColorY = $fillObj["top"];
                $gradientColorX = $gradientColorX + $this->pxToUnit($fillObj["fillColor"]->offsetX * $fillObj["scaleX"]) + $strokeWidthUnit;
                $gradientColorY = $gradientColorY + $this->pxToUnit($fillObj["fillColor"]->offsetY * $fillObj["scaleY"]) + $strokeWidthUnit;

                $fillObjGradientNode = [];
                $gradientNode = [];
                $colorStops = $fillObj["fillColor"]->colorStops;
                for ($c = 0; $c < count($colorStops); $c++) {

                    // @ _cArr=>array('color' => $col1, 'offset' => 0, 'exponent' => 1,'opacity'=>1)

                    $_Color = $colorStops[$c]->color;
                    $_Color = str_replace("rgb(", "", $_Color);
                    $_Color = str_replace(")", "", $_Color);
                    $_Color = explode(",", $_Color);

                    $_cArr = array('color' => $_Color, 'offset' => $colorStops[$c]->offset * 1, 'exponent' => 1, 'opacity' => $colorStops[$c]->opacity * 1);
                    $fillObjGradientNode[$c] = $_cArr;

                }

                $gradientNode = array_reverse($fillObjGradientNode);

                if ($gradientColorWidth == 0) {
                    $x1 = 0;
                    $x2 = 0;
                } else {
                    $x1 = $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4]) / $gradientColorWidth;
                    $x2 = $this->pxToUnit($dataCoords->x2 * $crzx + $gtm[4]) / $gradientColorWidth;
                }
                if ($gradientColorHeight == 0) {
                    $y1 = 0;
                    $y2 = 0;
                } else {
                    $y1 = 1 - $this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5]) / $gradientColorHeight;
                    $y2 = 1 - $this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5]) / $gradientColorHeight;
                }

                if ($gradientColorWidth != 0 and $gradientColorHeight != 0) {
                    $x1 = $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4]) / $gradientColorWidth;
                    $x2 = $this->pxToUnit($dataCoords->x2 * $crzx + $gtm[4]) / $gradientColorWidth;
                    $y1 = 1 - $this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5]) / $gradientColorHeight;
                    $y2 = 1 - $this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5]) / $gradientColorHeight;
                }

                $coords = array($x1, $y1, $x2, $y2);

                /*
                $coords=array(

                $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4])/$gradientColorWidth,
                1-$this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5])/$gradientColorHeight,

                $this->pxToUnit($dataCoords->x2 * $crzx+ $gtm[4])/$gradientColorWidth,
                1-$this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5])/$gradientColorHeight,

                );*/

                $this->PDFDOC->StartTransform();

                if ($gradientColorHeight < $fillObj["height"]) {
                    $drawHeight = $fillObj["height"];
                } else {
                    $drawHeight = $gradientColorHeight;
                }

                switch ($fillObj["type"]) {
                    case "rect":
                        $this->PDFDOC->Rect($fillObj["left"] + $strokeWidthUnit / 2, $fillObj["top"] + $strokeWidthUnit / 2, $fillObj["width"], $fillObj["height"], 'CNZ');
                        break;
                    case "circle":
                        $this->PDFDOC->Circle($fillObj["pointX"] + $fillObj["strokeWidth"], $fillObj["pointY"] + $fillObj["strokeWidth"], $fillObj["radiusY"], 0, 360, 'CNZ');
                        break;
                    case "ellipse":

                        $this->PDFDOC->Ellipse($fillObj["pointX"], $fillObj["pointY"], $fillObj["rx"], $fillObj["ry"], -1 * $fillObj["angle"], $fillObj["astart"], $fillObj["afinish"], 'CNZ');

                        //$this->PDFDOC->Ellipse($fillObj["pointX"], $fillObj["pointY"], $fillObj["rx"], $fillObj["ry"], -1 * $fillObj["angle"], $fillObj["astart"], $fillObj["afinish"], 'D');
                        break;
                    case "polygon":
                        $this->PDFDOC->Polygon($fillObj["points"], "CNZ");
                        break;
                    case "path":
                        $this->PDFDOC->SVGPathExpand($fillObj["dText"], "CNZ", $this->pdfUnit);
                        break;
                }

                $isAngle = false;
                if ($fillObj["type"] == "ellipse" and $fillObj["isAngle"] == true) {
                    $this->PDFDOC->rotate(-1 * $fillObj["angle"] * 1, $fillObj["angleX"], $fillObj["angleY"]);
                    $isAngle = true;
                }
                //echo "gradientColorX=" . $gradientColorX . " , gradientColorY=" . $gradientColorY . " , gradientColorWidth=" . $gradientColorWidth . " , drawHeight=" . $drawHeight;
                //echo json_encode($gradientNode);exit;
                $this->PDFDOC->LinearGradientExpand($gradientColorX, $gradientColorY, $gradientColorWidth * $fillObj["scaleX"], $drawHeight * $fillObj["scaleY"], $gradientNode, $coords);

                //还原角度
                if ($isAngle == true) {
                    $this->PDFDOC->rotate(1 * $fillObj["angle"] * 1, $fillObj["rx"], $fillObj["ry"]);
                }

                $this->PDFDOC->StopTransform();

                break;

            case "radial":
                $dataCoords = $fillObj["fillColor"]->coords;
                $gtm = $fillObj["fillColor"]->gradientTransform;
                $crzx = ($gtm[0] == 1) ? 1 : $gtm[0] * 1;
                $crzy = ($gtm[3] == 1) ? 1 : $gtm[3] * 1;

                $coordsOffsetX = $fillObj["fillColor"]->offsetX * $fillObj["scaleX"];
                $coordsOffsetY = $fillObj["fillColor"]->offsetY * $fillObj["scaleY"];

                if ($coordsOffsetY > 0 and $gtm[3] > 0) {
                    $gtm[3] = -1 * $gtm[3];
                }

                $gradientColorX = $fillObj["left"];
                $gradientColorY = $fillObj["top"];
                $gradientColorX = $gradientColorX + $this->pxToUnit($coordsOffsetX) + $strokeWidthUnit;
                $gradientColorY = $gradientColorY + $this->pxToUnit($coordsOffsetY) + $strokeWidthUnit;

                /*
                宽只显示右边一半 bug
                gtm[0] =>(>0) gtm[3] =>(<0) offsetX =>(>0) offsetY =>(>0)
                 */
                if ($fillObj["fillColor"]->offsetY > 0 and $fillObj["fillColor"]->offsetX > 0 and $gtm[3] < 0 and $gtm[0] > 0) {

                    $gradientColorX = $gradientColorX - $this->pxToUnit($coordsOffsetX);
                    $gradientColorY = $gradientColorY - $this->pxToUnit($coordsOffsetY);
                    $dataCoords->x1 = $dataCoords->x1 + $coordsOffsetX * 2;
                    $dataCoords->x2 = $dataCoords->x2 + $coordsOffsetX * 2;

                    $dataCoords->y1 = $dataCoords->y1 - $coordsOffsetY;
                    $dataCoords->y2 = $dataCoords->y2 - $coordsOffsetY;

                }

                $drawWidth = $fillObj["left"] + $fillObj["width"] - $gradientColorX - $this->pxToUnit($fillObj["fillColor"]->offsetX * $fillObj["scaleX"]);
                $drawHeight = $fillObj["top"] + $fillObj["height"] - $gradientColorY - $this->pxToUnit($fillObj["fillColor"]->offsetY * $fillObj["scaleY"]);

                $offCroodsY = 0;
                if ($coordsOffsetY > 0 and array_key_exists("viewBoxWidth", $fillObj)) {

                    $drawWidth = $this->pxToUnit($fillObj["viewBoxWidth"]) * $fillObj["scaleX"];
                    if ($gtm[3] < 0) {

                        $drawHeight = $this->pxToUnit($fillObj["viewBoxHeight"]) * $fillObj["scaleY"];
                        if ($drawHeight == $drawWidth) {
                            if ($fillObj["width"] != $fillObj["height"]) {
                                $drawHeight = $drawHeight * $fillObj["height"] / $fillObj["width"];
                            }
                        }
                        $gradientColorY = $fillObj["top"];

                        if ($fillObj["width"] > $fillObj["height"]) {
                            $offCroodsY = ($fillObj["width"] - $fillObj["height"]);
                        }

                        $gtm[5] = $gtm[5] + $fillObj["fillColor"]->offsetY;
                    } else {

                        $drawHeight = $this->pxToUnit($fillObj["viewBoxHeight"]) * $fillObj["scaleY"];
                        if ($drawHeight == $drawWidth) {
                            if ($fillObj["width"] != $fillObj["height"]) {
                                $drawHeight = $drawHeight * $fillObj["height"] / $fillObj["width"];
                            }
                        }
                    }

                }

                if (abs($crzy) == abs($crzx) && $fillObj["scaleX"] == $fillObj["scaleY"]) {

                    if ($drawWidth > $drawHeight) {
                        $drawHeight = $drawWidth;
                    } else {
                        $drawWidth = $drawHeight;
                    }
                }

                $gradientColorWidth = $drawWidth;
                $gradientColorHeight = $drawHeight;

                $fillObjGradientNode = [];
                $gradientNode = [];
                $colorStops = $fillObj["fillColor"]->colorStops;
                for ($c = 0; $c < count($colorStops); $c++) {

                    // @ _cArr=>array('color' => $col1, 'offset' => 0, 'exponent' => 1,'opacity'=>1)

                    $_Color = $colorStops[$c]->color;
                    $_Color = str_replace("rgb(", "", $_Color);
                    $_Color = str_replace(")", "", $_Color);
                    $_Color = explode(",", $_Color);

                    $_cArr = array('color' => $_Color, 'offset' => $colorStops[$c]->offset * 1, 'exponent' => 1, 'opacity' => $colorStops[$c]->opacity * 1);
                    $fillObjGradientNode[$c] = $_cArr;

                }

                $gradientNode = array_reverse($fillObjGradientNode);

                /**
                 * $coords 形式的数组 (fx, fy, cx, cy, r) 其中 (fx, fy) 是颜色 1 的渐变起点，(cx, cy) 是颜色 2 的圆心，r 是 圆的半径
                （参见 radial_gradient_coords.jpg）。 (fx, fy) 应该在圆圈内，否则某些区域将无法定义。
                 **/

                $r = $this->pxToUnit($dataCoords->r2 * $crzy * $fillObj["scaleY"]) / $gradientColorHeight;
                if (abs($crzy) != abs($crzx) && $fillObj["scaleX"] == $fillObj["scaleY"]) {

                    if ($fillObj["width"] > $fillObj["height"]) {
                        $r = $this->pxToUnit($dataCoords->r2 * $crzx * $fillObj["scaleX"]) / $gradientColorWidth;
                    }
                }

                if ($r < 0) {
                    $r = $this->pxToUnit($dataCoords->r2 * $crzx * $fillObj["scaleX"]) / $gradientColorWidth;
                }

                if ($fillObj["scaleX"] < $fillObj["scaleY"] and $fillObj["type"] == "ellipse") {
                    $bi = $fillObj["scaleX"] / $fillObj["scaleY"];
                    $gradientColorWidth = $gradientColorWidth / $bi;
                    $dataCoords->x1 = $dataCoords->x1 / $bi;
                    $dataCoords->x2 = $dataCoords->x2 / $bi;
                }

                $coords = array(
                    $this->pxToUnit($dataCoords->x1 * $crzx + $gtm[4]) * $fillObj["scaleX"] / $gradientColorWidth,
                    1 - $this->pxToUnit($dataCoords->y1 * $crzy + $gtm[5]) * $fillObj["scaleY"] / $gradientColorHeight,

                    $this->pxToUnit($dataCoords->x2 * $crzx + $gtm[4]) * $fillObj["scaleX"] / $gradientColorWidth,
                    1 - $this->pxToUnit($dataCoords->y2 * $crzy + $gtm[5]) * $fillObj["scaleY"] / $gradientColorHeight,
                    $r,
                );

                $this->PDFDOC->StartTransform();

                switch ($fillObj["type"]) {
                    case "rect":
                        $this->PDFDOC->Rect($fillObj["left"] + $strokeWidthUnit / 2, $fillObj["top"] + $strokeWidthUnit / 2, $fillObj["width"], $fillObj["height"], 'CNZ');
                        $this->PDFDOC->Rect($fillObj["left"] + $strokeWidthUnit / 2, $fillObj["top"] + $strokeWidthUnit / 2, $fillObj["width"], $fillObj["height"], 'D');
                        if ($drawHeight > $gradientColorWidth) {
                            $gradientColorWidth = $drawHeight;
                        } else if ($gtm[0] > $gtm[3]) {

                        }

                        break;
                    case "circle":
                        $this->PDFDOC->Circle($fillObj["pointX"], $fillObj["pointY"], $fillObj["radiusY"], 0, 360, 'CNZ');
                        break;
                    case "ellipse":
                        $this->PDFDOC->Ellipse($fillObj["x0"], $fillObj["y0"], $fillObj["rx"], $fillObj["ry"], -1 * $fillObj["angle"], $fillObj["astart"], $fillObj["afinish"], 'CNZ');
                        $this->PDFDOC->Ellipse($fillObj["x0"], $fillObj["y0"], $fillObj["rx"], $fillObj["ry"], -1 * $fillObj["angle"], $fillObj["astart"], $fillObj["afinish"], 'F');
                        $fillObj["pointX"] = $fillObj["x0"];
                        $fillObj["pointY"] = $fillObj["y0"];

                        if ($drawHeight > $gradientColorWidth) {
                            $drawHeight = $gradientColorWidth;
                        }

                        break;
                    case "polygon":
                        $this->PDFDOC->Polygon($fillObj["points"], "CNZ");
                        break;
                    case "path":
                        $this->PDFDOC->SVGPathExpand($fillObj["dText"], "CNZ", $this->pdfUnit);
                        break;
                }

                $isAngle = false;
                if ($fillObj["type"] == "ellipse" and $fillObj["isAngle"] == true) {
                    $this->PDFDOC->rotate(-1 * $fillObj["angle"] * 1, $fillObj["angleX"], $fillObj["angleY"]);
                    $isAngle = true;
                }

                $this->PDFDOC->RadialGradientExpand($gradientColorX, $gradientColorY, $drawWidth, $drawHeight, $gradientNode, $coords);

                //还原角度
                if ($isAngle == true) {
                    $this->PDFDOC->rotate(1 * $fillObj["angle"] * 1, $fillObj["rx"], $fillObj["ry"]);
                }

                $this->PDFDOC->StopTransform();

                break;

        }

    }


    //尺寸计量单位转换
    public function pxToUnit($pxVal)
    {

        if ($pxVal != 0) {
            return ($pxVal * $this->unitInch / 72);
        } else {
            return 0;
        }
    }

    //json或对象转成数组
    public function ob2ar($obj)
    {
        if (is_object($obj)) {
            $obj = (array) $obj;
            $obj = $this->ob2ar($obj);
        } elseif (is_array($obj)) {
            foreach ($obj as $key => $value) {
                $obj[$key] = $this->ob2ar($value);
            }
        }
        return $obj;
    }

    public function __destruct()
    {
        unset($this->PDFDOC);
    }

}
