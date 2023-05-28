<?php

use think\facade\Log;

/**
 * Html5 生成类
 */
class HtmlApi
{

    private $mmCode;
    //保存生成文件路径
    private $savePath = "";
    //生成的Html代码
    private $htmlCode = "";

    //本页采用字体
    private $htmlFont = [];
    //字体库
    private $fontData = [];

    private $pageCssCode = "";
    private $htmlData = [];
    //需要处理的 json 组件对象
    private $sourceObject;

    private $pageWidth;
    private $pageHeight;
    private $pageBackColor;
    private $pageBackGroup;
    private $pageTitle;

    private $bleedLineIn = 0;
    private $bleedLineOut = 0;
    private $bleedLineTop = 0;
    private $bleedLineBottom = 0;

    //获取一版最大N页数量
    private $pageOption = 1;

    //MM 商品数组
    private $pageGoods = [];

    //字体路径
    private $fontPath;

    private $pageScale = 5;

    public $pagesMap = [];

    public $pagesData = [];

    //初始化类
    public function format($parma)
    {
        $this->bleedLineIn = $parma["bleedLineIn"] * $this->pageScale;
        $this->bleedLineOut = $parma["bleedLineOut"] * $this->pageScale;
        $this->bleedLineTop = $parma["bleedLineTop"] * $this->pageScale;
        $this->bleedLineBottom = $parma["bleedLineBottom"] * $this->pageScale;

        $this->pageWidth = $parma["pageWidth"] * $this->pageScale;
        $this->pageHeight = $parma["pageHeight"] * $this->pageScale;
        $this->pageTitle = $parma["pageTitle"];
        $this->mmCode = $parma["mmCode"];
        $this->savePath = $parma["savePath"];
        $this->pageGoods = $parma["pageGoods"];

        $this->pageCssCode = ' body{ padding:0px;margin:0px;width:100%;height:auto;}';
        $this->pageCssCode = $this->pageCssCode . '.pageLoad {width:100%;height:100%;position: fixed;left:0px;top:0px;opacity:0.9;background-color:#000000;z-index:999;}';
        $this->pageCssCode = $this->pageCssCode . '.pageLoad .loadImage {position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);}';
        $this->pageCssCode = $this->pageCssCode . '.pageBox {width:100%;height:auto;position: relative;overflow:hidden;}';

        $this->htmlData["Body"] = "";
        $this->htmlFont = [];
        $this->fontPath = $parma["fontPath"];
        $this->fontData = $parma["fontData"];

        $this->pageOption = $parma["pageOption"];
    }

    //生成html Head 代码
    public function createHead()
    {
        $_html = '<!DOCTYPE html>';
        $_html = $_html . ' <html>';
        $_html = $_html . ' <head lang="en">';
        $_html = $_html . '   <meta charset="UTF-8">';
        $_html = $_html . '   <title>' . $this->pageTitle . '</title>';
        $_html = $_html . '   <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">';
        $_html = $_html . '   <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0">';
        $_html = $_html . '   <link rel="stylesheet" href="' . $this->savePath . $this->mmCode . '.css?tn=' . time() . '">';
        $_html = $_html . '   </head>';
        $_html = $_html . '   <body >';
        $this->htmlData["Head"] = $_html;
    }

    //插入生成模板页内容
    public function newPage_Start($pageParm)
    {
        $_html = "";
        $_html = $_html . '     <div class="pageBox" style="background-color:' . $pageParm["pageBackColor"] . ';background-image: url(' . $pageParm["pageBackGroup"] . ');background-repeat:no-repeat;background-size:100% auto;width:' . ($this->pageWidth - $this->bleedLineIn - $this->bleedLineOut) . 'px">';

        //如果一版有多个切片绘制切片
        $pageOption = $this->pageOption;
        $sliceHtml = '';
        switch ($pageOption) {
            case "2LR":
                $sliceHtml = $sliceHtml . '<div style="width:1px;position:absolute;z-index:9999;height:100%;border:0px;border-left:1px solid #1793cc;left:50%;top:0px;"></div>';
                break;
            case "2TB":
                $sliceHtml = $sliceHtml . '<div style="width:100%;position:absolute;z-index:9999;height:100%;border:0px;border-top:1px solid #1793cc;top:50%;left:0px;"></div>';
                break;
            case "4LRTB":
                $sliceHtml = $sliceHtml . '<div style="width:1px;position:absolute;z-index:9999;height:100%;border:0px;border-left:1px solid #1793cc;left:50%;top:0px;"></div>';
                $sliceHtml = $sliceHtml . '<div style="width:100%;position:absolute;z-index:9999;height:100%;border:0px;border-top:1px solid #1793cc;top:50%;left:0px;"></div>';
                break;
        }

        $this->htmlData["Body"] = $this->htmlData["Body"] . $_html . $sliceHtml;
    }
    public function newPage_End()
    {
        $_html = "";
        $_html = $_html . '     </div>';
        $this->htmlData["Body"] = $this->htmlData["Body"] . $_html;
    }

    //生成html Footer 代码
    public function createFooter()
    {
        $_html = '           ';

        $_html = $_html . '<script src="../js/jquery-1.8.0.min.js"></script>';
        $jsCode = '<script id="main">
            $(function() {
                var sourcePageWidth=' . ($this->pageWidth - $this->bleedLineOut - $this->bleedLineIn) . ';
                var sourcePageHeight=' . ($this->pageHeight - $this->bleedLineTop - $this->bleedLineBottom) . ';
                var winW=window.screen.width;
                var winH=window.screen.height;

                var pi=winW/sourcePageWidth;
                console.log("pi=",pi);
                var pageBox_Height=pi * sourcePageHeight;
                pageBox_Height=sourcePageHeight;
                $(".pageBox").css("height",pageBox_Height.toString() + "px");
                function bodyScale() {
                    var devicewidth = document.documentElement.clientWidth;
                    var scaleVal = devicewidth / sourcePageWidth;  // 分母——设计稿的尺寸
                    document.body.style.zoom = scaleVal;

                    $(".pageLoad").hide();

                }
                window.onload = window.onresize = function () {
                    bodyScale();
                };
            });
        </script>';
        $_html = $_html . $jsCode;
        $_html = $_html . '</body>';
        $_html = $_html . '</html>';
        $this->htmlData["Footer"] = $_html;
    }

    //解析sourceObject
    public function readObject($pageObject, $pageSort)
    {
        try {
            //$pageObj=$this->sourceObject;
            $pageObj = $pageObject;
            //防止对象克隆后 id 重复处理
            $pageObjectID = [];

            $tmpHtml = '';
            for ($i = 0; $i < count($pageObj); $i++) {
                $tmp = $pageObj[$i];

                if (property_exists($tmp, "id") == true) {
                    if ($tmp->id == "" or $tmp->id == null) {
                        $tmp->id = uniqid();
                    }
                } else {
                    $tmp->id = uniqid();
                }
                $tmp->id = uniqid();

                if (array_key_exists($tmp->id, $pageObjectID)) {
                    $tmp->id = $tmp->id . uniqid();
                } else {
                    $pageObjectID[$tmp->id] = "1";
                }

                if ($tmp->dType == "undefined" && $tmp->type == "group") {
                    $tmp->dType = "tmpGroup";
                }

                if ($tmp->visible == true) {

                    switch ($tmp->dType) {
                        case "BackgroundImage":

                            if (property_exists($tmp, "src") == true) {
                                $tmpHtml = $tmpHtml . '<div class="Picture_' . $tmp->id . '" >';
                                $tmpHtml = $tmpHtml . '<img src="' . $this->thumb($tmp->src) . '" style="width:100%;height:100%;position:absolute;left:0px;top:0px;">';
                                $tmpHtml = $tmpHtml . '</div>';

                                $cssParm = array(
                                    "className" => "Picture_" . $tmp->id,
                                    "left" => intval($tmp->left * $this->pageScale * 1 - $this->bleedLineIn) . "px",
                                    "top" => intval($tmp->top * $this->pageScale * 1 - $this->bleedLineTop) . "px",
                                    "width" => ($tmp->width * $this->pageScale * $tmp->scaleX) . "px",
                                    "height" => ($tmp->height * $this->pageScale * $tmp->scaleY) . "px",
                                    "position" => "absolute");

                                if (is_numeric($tmp->angle)) {
                                    $cssParm["transform"] = 'rotate(' . $tmp->angle . 'deg)';
                                    $cssParm["transform-origin"] = 'left top';
                                }

                                $this->createCss($cssParm);
                            }
                            break;
                        case "Product":
                            //商品组件

                            //如果该页面不存在商品数据，跳过商品数据输出

                            if (property_exists($tmp, "dSort")) {

                                $_dSort = explode("-", $tmp->dSort);
                                if (count($_dSort) == 2) {
                                    $productKey = "_" . $_dSort[0] . "_" . $_dSort[1];
                                    if (array_key_exists($productKey, $this->pageGoods)) {
                                        if (property_exists($this->pageGoods[$productKey], "info")) {
                                            if (property_exists($this->pageGoods[$productKey]->info, "itemcode")) {

                                            } else {
                                                continue 2;
                                            }
                                        } else {
                                            continue 2;
                                        }
                                    } else {
                                        continue 2;
                                    }
                                } else {
                                    continue 2;
                                }

                            } else {
                                continue 2;
                            }
                            // $itemCode = $tmp->itemCode;
                            $itemCode = $this->pageGoods[$productKey]->info->itemcode;
                            $productId = $this->pageGoods[$productKey]->info->productId ?? '';

                            $tmpHtml = $tmpHtml . '<div class="product_' . $tmp->id . '">';
                            $cssParm = array(
                                "className" => "product_" . $tmp->id,
                                "left" => intval($tmp->left * $this->pageScale * 1 - $this->bleedLineIn) . "px",
                                "top" => intval($tmp->top * $this->pageScale * 1 - $this->bleedLineTop) . "px",
                                "width" => ($tmp->width * $this->pageScale * $tmp->scaleX) . "px",
                                "height" => ($tmp->height * $this->pageScale * $tmp->scaleY) . "px",
                                "position" => "absolute");

                            if (is_numeric($tmp->angle)) {
                                $cssParm["transform"] = 'rotate(' . $tmp->angle . 'deg)';
                                $cssParm["transform-origin"] = 'left top';
                            }

                            $this->createCss($cssParm);

                            $subObject = $tmp->objects;
                            $subHtml = '';

                            //计算该组件最左minLeft、最上坐标minTop,然后所有该组内的对象都要减去minLeft、minTop
                            $minLeft = 8000;
                            $minTop = 8000;
                            for ($j = 0; $j < count($subObject); $j++) {
                                $subtmp = $subObject[$j];
                                if ($minTop > $subtmp->top) {
                                    $minTop = $subtmp->top * 1;
                                }
                                if ($minLeft > $subtmp->left) {
                                    $minLeft = $subtmp->left * 1;
                                }

                            }

                            for ($j = 0; $j < count($subObject); $j++) {

                                $subtmp = $subObject[$j];
                                //生成子对象css代码

                                if ($subtmp->stroke == "" or $subtmp->stroke == null or $subtmp->stroke == "undefined") {
                                    $subtmp->stroke = " transparent";
                                }

                                /* 商品组件克隆时，有些属性没有克隆到，估在此增加特殊处理 */
                                if (!$subtmp->dType and $subtmp->type == "image") {
                                    $subtmp->dType = "Picture";
                                }
                                if (!$subtmp->dType and $subtmp->type == "rect") {
                                    $subtmp->dType = "shape";
                                }
                                $subtmp->id = uniqid();
                                // echo $tmp->dType . "," . $subtmp->dType. "<br>";
                                $subjectCssParm = array(
                                    "className" => "product_" . $tmp->id . " ." . $subtmp->dType . "_" . $subtmp->id,
                                    "left" => ($subtmp->left * $tmp->scaleX + (($tmp->width * $tmp->scaleX) / 2)) * $this->pageScale . "px",
                                    // "left"=>($subtmp->left   ) . "px",
                                    "top" => ($subtmp->top * $tmp->scaleY + (($tmp->height * $tmp->scaleY) / 2)) * $this->pageScale . "px",
                                    "width" => ($subtmp->width * $subtmp->scaleX * $tmp->scaleX) * $this->pageScale . "px",
                                    "height" => ($subtmp->height * $subtmp->scaleY * $tmp->scaleY) * $this->pageScale . "px",
                                    "position" => "absolute");

                                if (property_exists($subtmp, "angle") == true) {
                                    $subjectCssParm["transform"] = (is_numeric($subtmp->angle)) ? "rotate(" . $subtmp->angle . "deg)" : "";

                                    if ($subtmp->type == "circle") {

                                        if ($subtmp->scaleX != $subtmp->scaleY) {

                                            //$scaleCss=' scale(' . $subtmp->scaleX . ',' . $subtmp->scaleY . ')';
                                            //$subjectCssParm["transform"]=$subjectCssParm["transform"] . $scaleCss;

                                        }

                                    }

                                    $subjectCssParm["transform-origin"] = "left top";
                                }

                                if ($subtmp->type == "textbox" or $subtmp->type == "i-text") {

                                    $subjectCssParm["vertical-align"] = "middle";

                                    $subjectCssParm["line-height"] = ($subtmp->lineHeight * $subtmp->fontSize * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . "px";

                                    $subjectCssParm["font-weight"] = (property_exists($subtmp, "fontWeight") == true) ? $subtmp->fontWeight : "";

                                    $subjectCssParm["font-style"] = (property_exists($subtmp, "fontStyle") == true) ? $subtmp->fontStyle : "";

                                    if (property_exists($subtmp, "charSpacing") == true) {
                                        $charSpacing = $subtmp->charSpacing * 0.001 * ($subtmp->fontSize * $subtmp->scaleY);
                                        $subjectCssParm["letter-spacing"] = (is_numeric($subtmp->charSpacing)) ? $charSpacing . "px" : 0 . "px";
                                    }

                                    if (property_exists($subtmp, "backgroundColor") == true) {
                                        if ($subtmp->backgroundColor != "") {
                                            $subjectCssParm["background-color"] = $subtmp->backgroundColor;
                                        }
                                    }

                                    if (property_exists($subtmp, "fontSize") == true) {
                                        $fontSize = $subtmp->fontSize * $this->pageScale * $subtmp->scaleY * $tmp->scaleY;
                                        $subjectCssParm["font-size"] = $fontSize . "px";
                                    }

                                    if (property_exists($subtmp, "fontFamily") == true) {
                                        $subjectCssParm["font-family"] = $subtmp->fontFamily;
                                    }

                                    if (property_exists($subtmp, "fontStyle") == true) {
                                        $subjectCssParm["font-style"] = $subtmp->fontStyle;
                                    }

                                    if (property_exists($subtmp, "textAlign") == true) {
                                        $subjectCssParm["text-align"] = $subtmp->textAlign;
                                    }

                                    if (property_exists($subtmp, "fill") == true) {

                                        if (empty($subtmp->fill)) {
                                            $subjectCssParm["color"] = "transparent";
                                        } else {
                                            $subjectCssParm["color"] = $subtmp->fill;
                                        }

                                    } else {
                                        $subjectCssParm["color"] = "transparent";
                                    }

                                    //描边
                                    if ($subtmp->strokeWidth and $subtmp->strokeWidth != "" and is_numeric($subtmp->strokeWidth)) {
                                        $subjectCssParm["text-shadow"] = "";
                                        if ($subtmp->strokeWidth * 1 > 5) {

                                            if ($subtmp->stroke != "" and $subtmp->stroke != null and $subtmp->stroke != "undefined") {
                                                $subjectCssParm["-webkit-text-stroke"] = ($subtmp->strokeWidth * $subtmp->scaleX * $this->pageScale) . "px " . $subtmp->stroke;
                                            } else {
                                                $subjectCssParm["-webkit-text-stroke"] = ($subtmp->strokeWidth * $subtmp->scaleX * $this->pageScale) . "px transparent";
                                            }

                                        } else {

                                            if ($subjectCssParm["color"] != "transparent") {
                                                $subjectCssParm["text-shadow"] = "-1px 1px 0px " . $subtmp->stroke . ",-1px -1px 0px " . $subtmp->stroke . ",2px 2px 0px " . $subtmp->stroke . ",-2px -2px 0px " . $subtmp->stroke . ",3px 3px 0px " . $subtmp->stroke . ",-3px -3px 0px " . $subtmp->stroke;
                                            } else if ($subtmp->stroke != "" and $subtmp->stroke != null and $subtmp->stroke != "undefined") {
                                                $subjectCssParm["-webkit-text-stroke"] = ($subtmp->strokeWidth * $subtmp->scaleX * $this->pageScale) . "px " . $subtmp->stroke;
                                            }

                                        }

                                    }
                                }

                                if (property_exists($subtmp, "fontWeight") == true) {
                                    if ($subtmp->fontWeight and $subtmp->fontWeight != "" and is_numeric($subtmp->fontWeight)) {
                                        $subjectCssParm["font-weight"] = $subtmp->fontWeight;
                                    }
                                }

                                if ($subtmp->dType == "shape") {
                                    //边框
                                    if (property_exists($subtmp, "strokeWidth") == true) {
                                        if ($subtmp->strokeWidth and $subtmp->strokeWidth != "" and is_numeric($subtmp->strokeWidth)) {
                                            $strokeScale = ($subtmp->scaleX > $subtmp->scaleY) ? $subtmp->scaleY : $subtmp->scaleX;
                                            $subjectCssParm["border"] = $subtmp->strokeWidth * $strokeScale * $this->pageScale . "px solid " . $subtmp->stroke;
                                        }
                                    }

                                    if ($subtmp->type == "rect") {
                                        $subjectCssParm["border-radius"] = $subtmp->rx * $this->pageScale . "px";
                                    }

                                    //填充色
                                    if ($subtmp->fill != "") {
                                        $subjectCssParm["background-color"] = $subtmp->fill;
                                    }
                                }

                                $this->createCss($subjectCssParm);

                                switch ($subtmp->dType) {

                                    case "productNormalText":
                                    case "productLineationText_bak":

                                        //取字体
                                        if ($subtmp->fontFamily != "freeserif") {
                                            if (empty($this->htmlFont)) {
                                                array_push($this->htmlFont, $subtmp->fontFamily);
                                            } else {
                                                if (!in_array($subtmp->fontFamily, $this->htmlFont)) {
                                                    array_push($this->htmlFont, $subtmp->fontFamily);
                                                }
                                            }
                                        }

                                        $subHtml = $subHtml . '<div class="' . $subtmp->dType . '_' . $subtmp->id . ' labelText"  >';
                                        $textStrokeCss = '';
                                        if (array_key_exists("-webkit-text-stroke", $subjectCssParm) == true) {
                                            $textStrokeCss = '-webkit-text-stroke:' . $subjectCssParm["-webkit-text-stroke"];
                                            if ($subtmp->strokeWidth * 1 <= 1 and $subtmp->strokeWidth * 1 > 0) {
                                                $textStrokeCss = 'text-shadow:' . $subjectCssParm["text-shadow"];
                                            }
                                        }
                                        $productLink = product_url($itemCode, $productId);
                                        $subHtml = $subHtml . '<a href="' . $productLink . '" style="border:0px;color:' . $subtmp->fill . ';text-decoration:none;white-space: pre-line;' . $textStrokeCss . ';vertical-align:middle">' . $subtmp->text . '</a>';
                                        $subHtml = $subHtml . '</div>';
                                        //如果是画线类文本 作废
                                        if ($subtmp->dType == "productLineat_bak") {

                                            if (property_exists($subtmp, "textLines") == true) {
                                                $drLineWidth = strlen($subtmp->textLines[0]) * ($subtmp->fontSize * $subtmp->scaleY * $tmp->scaleY * $this->pageScale * 0.7) * 0.8;
                                                $drLineHeight = ($subtmp->fontSize * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) * 0.9;

                                                //Align=Left
                                                if ($subtmp->textAlign == "left") {
                                                    $drLineX1 = $drLineWidth * 0.05;
                                                    $drLineY1 = $drLineHeight * 1.15;
                                                    $drLineX2 = $drLineWidth * 0.8;
                                                    $drLineY2 = 0 - $drLineHeight * 0.05;

                                                    $svgX = ($subtmp->left * $tmp->scaleX + (($tmp->width * $tmp->scaleX) / 2)) * $this->pageScale;
                                                    $svgY = ($subtmp->top * $tmp->scaleY + (($tmp->height * $tmp->scaleY) / 2)) * $this->pageScale;
                                                } else if ($subtmp->textAlign == "center") {

                                                    $drLineX1 = $drLineWidth * 0.05;
                                                    $drLineY1 = $drLineHeight * 1.15;
                                                    $drLineX2 = $drLineWidth * 0.8;
                                                    $drLineY2 = 0 - $drLineHeight * 0.05;

                                                    $svgX = ($subtmp->left * $tmp->scaleX + (($tmp->width * $tmp->scaleX) / 2) + $subtmp->width * $subtmp->scaleX * $tmp->scaleX * 0.5) * $this->pageScale;
                                                    $svgX = $svgX - $drLineWidth * 0.5;

                                                    $svgY = ($subtmp->top * $tmp->scaleY + (($tmp->height * $tmp->scaleY) / 2)) * $this->pageScale;

                                                } else if ($subtmp->textAlign == "right") {
                                                    $drLineX1 = $drLineWidth * 0.05;
                                                    $drLineY1 = $drLineHeight * 1.15;
                                                    $drLineX2 = $drLineWidth * 0.8;
                                                    $drLineY2 = 0 - $drLineHeight * 0.05;

                                                    //$svgX= ($subtmp->left * $tmp->scaleX + (($tmp->width * $tmp->scaleX) / 2)) * $this->pageScale + $drLineWidth/0.8;

                                                    $X = str_replace("px", "", $subjectCssParm["left"]) * 1;
                                                    $W = str_replace("px", "", $subjectCssParm["width"]) * 1;
                                                    $svgX = $X + $W - $drLineWidth * 0.9;
                                                    $svgY = ($subtmp->top * $tmp->scaleY + (($tmp->height * $tmp->scaleY) / 2)) * $this->pageScale;

                                                }

                                                $subHtml = $subHtml . '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="position:absolute;width:' . ($drLineWidth) . 'px;height:' . ($drLineHeight) . 'px;left:' . ($svgX) . 'px;top:' . ($svgY) . 'px;' . ';overflow:visible;" >';

                                                $subHtml = $subHtml . '<line da="productLineationText_bak" x1="' . $drLineX1 . '" y1="' . $drLineY1 . '" x2="' . $drLineX2 . '" y2="' . $drLineY2 . '"';
                                                $subHtml = $subHtml . 'style="position:absolute;stroke:' . $subtmp->fill . ';stroke-width:' . ($fontSize * 0.08) . ';" ';
                                                $subHtml = $subHtml . ' stroke-dasharray="1,0"/>';
                                                $subHtml = $subHtml . '</svg>';

                                            } else {
                                            }

                                        }

                                        //$subHtml = $subHtml . '</div>';
                                        break;
                                    case "productPriceGroup":

                                        //如果是画线类文本 productPriceGroup

                                        //取价格文本及划线线条
                                        if (property_exists($subtmp, "objects") == true) {

                                            if ($subtmp->objects[0]->type == "i-text") {
                                                $_textObj = $subtmp->objects[0];
                                                $_lineObj = $subtmp->objects[1];
                                                $_textIndex = 0;
                                                $_lineIndex = 1;
                                            } else {
                                                $_textObj = $subtmp->objects[1];
                                                $_lineObj = $subtmp->objects[0];
                                                $_textIndex = 1;
                                                $_lineIndex = 0;
                                            }

                                            //取字体
                                            if ($_textObj->fontFamily != "freeserif") {
                                                if (empty($this->htmlFont)) {
                                                    array_push($this->htmlFont, $_textObj->fontFamily);
                                                } else {
                                                    if (!in_array($_textObj->fontFamily, $this->htmlFont)) {
                                                        array_push($this->htmlFont, $_textObj->fontFamily);
                                                    }
                                                }
                                            }

                                            $parentLeft = ($subtmp->left * $tmp->scaleX + (($tmp->width * $tmp->scaleX) / 2));
                                            $parentTop = ($subtmp->top * $tmp->scaleY + (($tmp->height * $tmp->scaleY) / 2));
                                            $parentWidth = ($subtmp->width * $subtmp->scaleX * $tmp->scaleX);
                                            $parentHeight = ($subtmp->height * $subtmp->scaleY * $tmp->scaleY);

                                            $lineTextPriceLeft = ($_textObj->left + $parentWidth / 2 + $parentLeft) * $this->pageScale;
                                            $lineTextPriceTop = ($_textObj->height * -0.5 + $parentHeight / 2 + $parentTop) * $this->pageScale;
                                            $lineTextPriceWidth = $_textObj->width * $this->pageScale;
                                            $lineTextPriceHeight = $_textObj->height * $this->pageScale;

                                            //优先处理文本 线条在文字上面
                                            $lineTextPriceCss = "position:absolute;";
                                            $lineTextPriceCss = $lineTextPriceCss . "left:" . $lineTextPriceLeft . "px;";
                                            $lineTextPriceCss = $lineTextPriceCss . "top:" . $lineTextPriceTop . "px;";
                                            $lineTextPriceCss = $lineTextPriceCss . "width:" . $lineTextPriceWidth . "px;";
                                            $lineTextPriceCss = $lineTextPriceCss . "height:" . $lineTextPriceHeight . "px;";
                                            $lineTextPriceCss = $lineTextPriceCss . "font-family:'" . $_textObj->fontFamily . "';";
                                            $lineTextPriceCss = $lineTextPriceCss . "font-size:" . ($_textObj->fontSize * $this->pageScale) . "px;";
                                            $lineTextPriceCss = $lineTextPriceCss . "color:" . $_textObj->fill . ";";

                                            $subHtml = $subHtml . '<div style="' . $lineTextPriceCss . '"  >' . $_textObj->text . '</div>';

                                            //绘制画线
                                            $drLineColor = $_lineObj->stroke;
                                            $drStrokeWidth = $_lineObj->strokeWidth * $tmp->scaleX * $this->pageScale;
                                            $drLineWidth = $_lineObj->width * $tmp->scaleX * $this->pageScale;
                                            $drLineHeight = $_lineObj->height * $tmp->scaleY * $this->pageScale;
                                            $svgX = ($_lineObj->left + $parentWidth / 2 + $parentLeft) * $this->pageScale;
                                            $svgY = ($_lineObj->top + $parentHeight / 2 + $parentTop) * $this->pageScale;

                                            $drLineX1 = ($_lineObj->x1 + $_lineObj->width / 2) * $tmp->scaleX * $this->pageScale;
                                            $drLineY1 = ($_lineObj->y1 + $_lineObj->height / 2) * $tmp->scaleY * $this->pageScale;
                                            $drLineX2 = ($_lineObj->x2 + $_lineObj->width / 2) * $tmp->scaleX * $this->pageScale;
                                            $drLineY2 = ($_lineObj->y2 + $_lineObj->height / 2) * $tmp->scaleY * $this->pageScale;

                                            $subHtml = $subHtml . '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="position:absolute;width:' . ($drLineWidth) . 'px;height:' . ($drLineHeight) . 'px;left:' . ($svgX) . 'px;top:' . ($svgY) . 'px;' . ';overflow:visible;" >';

                                            $subHtml = $subHtml . '<line da="productLineationText_bak" x1="' . $drLineX1 . '" y1="' . $drLineY1 . '" x2="' . $drLineX2 . '" y2="' . $drLineY2 . '"';
                                            $subHtml = $subHtml . 'style="position:absolute;stroke:' . $drLineColor . ';stroke-width:' . $drStrokeWidth . ';" ';
                                            $subHtml = $subHtml . ' stroke-dasharray="0"/>';
                                            $subHtml = $subHtml . '</svg>';

                                        } else {
                                            //echo "333333";
                                        }

                                        break;
                                    case "productPicture":
                                        //商品图
                                        $subHtml = $subHtml . '<div class="productPicture_' . $subtmp->id . '" data="' . $itemCode . '" >';

                                        $productBoxHeight = $subtmp->height * $subtmp->scaleY * $tmp->scaleY * $this->pageScale;

                                        $ppObjects = $subtmp->objects;
                                        for ($k = 0; $k < count($ppObjects); $k++) {
                                            if ($ppObjects[$k]->type == "image" && $ppObjects[$k]->visible == true) {

                                                $pictureBoxHeight = $ppObjects[$k]->height * $subtmp->scaleY * $ppObjects[$k]->scaleY * $tmp->scaleY * $this->pageScale;

                                                $pictureTop = 0;
                                                if (($productBoxHeight - $pictureBoxHeight) / 2 > 0) {
                                                    $pictureTop = ($productBoxHeight - $pictureBoxHeight) / 2;
                                                }

                                                $_ppStyle = 'position: absolute;top:' . $pictureTop . 'px;width:' . ($ppObjects[$k]->width * $subtmp->scaleX * $ppObjects[$k]->scaleX * $tmp->scaleX * $this->pageScale) . 'px;height:' . ($ppObjects[$k]->height * $subtmp->scaleY * $ppObjects[$k]->scaleY * $tmp->scaleY * $this->pageScale) . 'px;';

                                                if (property_exists($ppObjects[$k], "src") == true) {
                                                    $productLink = product_url($itemCode, $productId);
                                                    $subHtml = $subHtml . '<a href="' . $productLink . '"><img src="' . $this->thumb($ppObjects[$k]->src) . '" style="' . $_ppStyle . '"></a>';
                                                }
                                            }
                                        }

                                        $subHtml = $subHtml . '</div>';
                                        break;
                                    case "Picture":
                                    case "IconElement":
                                        //组件装饰图片
                                        if (property_exists($subtmp, "src") == true) {
                                            $subHtml = $subHtml . '<div class="Picture_' . $subtmp->id . '" >';
                                            $subHtml = $subHtml . '<img src="' . $this->thumb($subtmp->src) . '" style="width:' . ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . 'px;height:' . ($subtmp->height * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . 'px;">';
                                            $subHtml = $subHtml . '</div>';
                                        }
                                        break;
                                    case "shape":
                                        //矩型
                                        //过滤出血线、页边距、纸张边框
                                        if ($tmp->dType == "paperBleed" || $tmp->dType == "paperMargins" || $tmp->dType == "paperBox") {

                                        } else {

                                            $circleCss = "";
                                            if ($subtmp->type == "circle") {
                                                $circleCss = 'style="border-radius:50%;"';
                                            }

                                            $subHtml = $subHtml . '<div class="shape_' . $subtmp->id . '" ' . $circleCss . ' >';
                                            $subHtml = $subHtml . '</div>';
                                        }
                                        break;
                                    case "dottedLine":
                                        //虚线
                                        $subjectCssParm = array(
                                            "className" => "dottedLine_" . $pageSort . "_" . $tmp->id . "_" . $subtmp->id,
                                            "left" => ($subtmp->left * $tmp->scaleX + (($tmp->width * $tmp->scaleX) / 2)) * $this->pageScale . "px",
                                            "top" => ($subtmp->top * $tmp->scaleY + (($tmp->height * $tmp->scaleY) / 2)) * $this->pageScale . "px",
                                            "width" => ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . "px",
                                            "height" => ($subtmp->height * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . "px",
                                            "position" => "absolute");

                                        $subjectCssParm["border-color"] = $subtmp->stroke;

                                        //偏移量
                                        $pathOffset = $subtmp->pathOffset;
                                        $points = $subtmp->points;

                                        $x1 = (int) ($subtmp->left);
                                        $y1 = (int) ($subtmp->top);
                                        $x2 = $x1 + ($subtmp->width * $subtmp->scaleX);
                                        $y2 = ($points[1]->y * $subtmp->scaleY - $points[0]->y * $subtmp->scaleY);

                                        $points = [];
                                        $defX = 0;
                                        $defY = 0;
                                        $tip = "";
                                        foreach ($subtmp->points as $p) {

                                            //处理画布设计 左上偏移量(因为保存模板时，只计算了left、top，里面的点坐标没有减去偏移量)
                                            if ($defX == 0) {

                                                $defX = $subtmp->points[0]->x;
                                            }

                                            if ($defY == 0) {

                                                if ($y2 == 0) {
                                                    $defY = $p->y * 1;
                                                    $tip = "a";
                                                } else if ($y2 > 0) {
                                                    $defY = $subtmp->points[0]->y;
                                                    $tip = "b";
                                                } else if ($y2 < 0) {
                                                    //$defY = $p->y * 1 - ($subtmp->height * $subtmp->scaleY * $tmp->scaleY);
                                                    $defY = ($p->y * 1 - $subtmp->height) * $subtmp->scaleY;
                                                    $tip = "c";
                                                }

                                                //$defY=$defY * $tmp->scaleY;
                                            }

                                            array_push($points, ($p->x * 1 * $subtmp->scaleY - $defX * $subtmp->scaleX) * $tmp->scaleX * $this->pageScale);
                                            array_push($points, ($p->y * 1 * $subtmp->scaleY - $defY) * $tmp->scaleY * $this->pageScale);

                                        }

                                        $strokeDashData = "";
                                        if ($subtmp->strokeDashArray) {
                                            $subjectCssParm["border-left"] = $subtmp->strokeWidth * $this->pageScale . "px dashed " . $subtmp->stroke;
                                            $strokeDashData = implode(",", $subtmp->strokeDashArray);
                                        }
                                        if ($subtmp->strokeWidth > $subtmp->height) {
                                            $subtmp->height = $subtmp->strokeWidth * $tmp->scaleY * $this->pageScale;
                                        }

                                        if ($subtmp->strokeWidth > $subtmp->width) {
                                            $subtmp->width = $subtmp->strokeWidth * $tmp->scaleX * $this->pageScale;
                                        }

                                        $this->createCss($subjectCssParm);

                                        $angleStyle = '';
                                        if (is_numeric($subtmp->angle)) {
                                            $angleStyle = 'transform:rotate(' . $subtmp->angle . 'deg);';
                                            $angleStyle = $angleStyle . 'transform-origin:left top';
                                        }

                                        $subHtml = $subHtml . '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="position:absolute;width:' . ($subtmp->width * $this->pageScale) . 'px;height:' . ($subtmp->height * $this->pageScale) . 'px;left:' . ($subjectCssParm["left"]) . ';top:' . ($subjectCssParm["top"]) . ';' . $angleStyle . ';overflow:visible;" >';

                                        $subHtml = $subHtml . '<line da="2" x1="' . $points[0] . '" y1="' . $points[1] . '" x2="' . $points[2] . '" y2="' . $points[3] . '"';
                                        $subHtml = $subHtml . 'style="position:absolute;stroke:' . $subtmp->stroke . ';stroke-width:' . ($subtmp->strokeWidth * $tmp->scaleX * $subtmp->scaleX * $this->pageScale) . ';" ';
                                        $subHtml = $subHtml . ' stroke-dasharray="' . $strokeDashData . '"/>';
                                        $subHtml = $subHtml . '</svg>';

                                        break;
                                    case "text":

                                        //取字体
                                        if ($subtmp->fontFamily != "freeserif") {
                                            if (empty($this->htmlFont)) {
                                                array_push($this->htmlFont, $subtmp->fontFamily);
                                            } else {
                                                if (!in_array($subtmp->fontFamily, $this->htmlFont)) {
                                                    array_push($this->htmlFont, $subtmp->fontFamily);
                                                }
                                            }
                                        }

                                        $subHtml = $subHtml . '<div class="text_' . $subtmp->id . ' labelText"  >';
                                        $textShow = '';
                                        if ($subtmp->shadow) {
                                            $_blur = $subtmp->shadow->blur * $subtmp->scaleX;
                                            $_color = $subtmp->shadow->color;
                                            $_offsetX = $subtmp->shadow->offsetX * $subtmp->scaleX * $this->pageScale;
                                            $_offsetY = $subtmp->shadow->offsetY * $subtmp->scaleY * $this->pageScale;

                                            $textShow = 'text-shadow: ' . $_offsetX . 'px ' . $_offsetY . 'px ' . $_blur . 'px ' . $_color . ';';
                                        }

                                        // $itemCode = $this->pageGoods["_" . $pageSort . "_" . $tmp->dSort]->info->urlparma;

                                        $productLink = "#";
                                        $productLink = product_url($itemCode, $productId);
                                        $textStrokeCss = '';
                                        if (array_key_exists("-webkit-text-stroke", $subjectCssParm) == true) {
                                            $textStrokeCss = '-webkit-text-stroke:' . $subjectCssParm["-webkit-text-stroke"];

                                            if ($subtmp->strokeWidth * 1 > 0 and $subtmp->strokeWidth * 1 <= 1) {
                                                $textStrokeCss = '';
                                                if ($textShow == '') {
                                                    $textStrokeCss = 'text-shadow:' . $subjectCssParm["text-shadow"];
                                                } else {
                                                    $textShow = $textShow . "," . $subjectCssParm["text-shadow"];
                                                }

                                            }

                                        }

                                        $subHtml = $subHtml . '<a href="' . $productLink . '" style="border:0px;color:' . $subtmp->fill . ';text-decoration:none;' . $textShow . ';white-space: pre-line;' . $textStrokeCss . '">' . $subtmp->text . '</a>';

                                        $subHtml = $subHtml . '</div>';
                                        break;

                                }

                            }
                            $tmpHtml = $tmpHtml . $subHtml;
                            $tmpHtml = $tmpHtml . '</div>';
                            break;
                        case "text":

                            //取字体
                            if (empty($this->htmlFont)) {
                                array_push($this->htmlFont, $tmp->fontFamily);
                            } else {
                                if (!in_array($tmp->fontFamily, $this->htmlFont)) {
                                    array_push($this->htmlFont, $tmp->fontFamily);
                                }
                            }

                            $tmpHtml = $tmpHtml . '<div class="Text_' . $pageSort . '_' . $tmp->id . '" >';
                            $tmpHtml = $tmpHtml . $tmp->text;
                            $tmpHtml = $tmpHtml . '</div>';

                            //设计器与输出文本类型偏移量计算
                            $offserY = $tmp->fontSize * $tmp->scaleX * 0.065 * 2 * $this->pageScale;
                            //$offserY=0;
                            $cssParm = array(
                                "className" => "Text_" . $pageSort . "_" . $tmp->id,
                                "left" => intval($tmp->left * 1 * $this->pageScale - $this->bleedLineIn) . "px",
                                "top" => intval($tmp->top * 1 * $this->pageScale - $this->bleedLineTop + $offserY) . "px",

                                //"left" => (($tmp->left - $tmp->strokeWidth * 2 * $tmp->scaleX) * 1 * $this->pageScale - $this->bleedLineIn) . "px",
                                //"top" => (($tmp->top - $tmp->strokeWidth * 2 * $tmp->scaleX) * 1 * $this->pageScale - $this->bleedLineTop + $offserY) . "px",

                                "width" => ($tmp->width * $tmp->scaleX * $this->pageScale) . "px",
                                "height" => ($tmp->height * $tmp->scaleY * $this->pageScale) . "px",
                                "font-size" => ($tmp->fontSize * $tmp->scaleX * $this->pageScale) . "px",
                                "font-family" => $tmp->fontFamily,
                                "font-style" => $tmp->fontStyle,
                                "font-weight" => $tmp->fontWeight,
                                "color" => $tmp->fill,
                                "text-align" => $tmp->textAlign,
                                "vertical-align" => "middle",
                                "white-space" => "pre-line",
                                "line-height" => ($tmp->lineHeight * $tmp->fontSize * $tmp->scaleY * $this->pageScale) . "px",
                                "position" => "absolute");

                            if ($tmp->shadow != null) {
                                $_blur = $tmp->shadow->blur * $tmp->scaleX;
                                $_color = $tmp->shadow->color;
                                $_offsetX = $tmp->shadow->offsetX * $tmp->scaleX * $this->pageScale;
                                $_offsetY = $tmp->shadow->offsetY * $tmp->scaleY * $this->pageScale;

                                $cssParm['text-shadow'] = $_offsetX . 'px ' . $_offsetY . 'px ' . $_blur . 'px ' . $_color;
                            } else {
                                $cssParm['text-shadow'] = '';
                            }

                            //描边
                            if ($tmp->strokeWidth != "" and $tmp->strokeWidth * 1 > 0 and $tmp->stroke != "") {

                                if ($tmp->stroke == "" or $tmp->stroke == null or $tmp->stroke == "undefined") {
                                    $tmp->stroke = " transparent";
                                }

                                if ($tmp->strokeWidth * 1 >= 1) {
                                    if (empty($tmp->fill)) {
                                        $cssParm["color"] = "transparent";
                                    }
                                    $cssParm["-webkit-text-stroke"] = ($tmp->strokeWidth * $tmp->scaleX * $this->pageScale) . "px " . $tmp->stroke;

                                } else if ($tmp->strokeWidth * 1 > 0 and $tmp->strokeWidth * 1 < 1) {

                                    if (empty($tmp->fill)) {
                                        $cssParm["color"] = "transparent";
                                        $cssParm["-webkit-text-stroke"] = ($tmp->strokeWidth * $tmp->scaleX * $this->pageScale) . "px " . $tmp->stroke;
                                    } else {

                                        if ($cssParm["text-shadow"] == '') {
                                            $cssParm["text-shadow"] = "-1px 1px 0px " . $tmp->stroke . ",-1px -1px 0px " . $tmp->stroke . ",2px 2px 0px " . $tmp->stroke . ",-2px -2px 0px " . $tmp->stroke . ",3px 3px 0px " . $tmp->stroke . ",-3px -3px 0px " . $tmp->stroke;
                                        } else {
                                            $cssParm["text-shadow"] = $cssParm["text-shadow"] . ",-1px 1px 0px " . $tmp->stroke . ",-1px -1px 0px " . $tmp->stroke . ",2px 2px 0px " . $tmp->stroke . ",-2px -2px 0px " . $tmp->stroke . ",3px 3px 0px " . $tmp->stroke . ",-3px -3px 0px " . $tmp->stroke;
                                        }
                                    }
                                }

                            }
                            if ($tmp->backgroundColor != "") {
                                $cssParm["background-color"] = $tmp->backgroundColor;
                            }
                            if ($tmp->angle) {
                                $cssParm["transform"] = (is_numeric($tmp->angle)) ? "rotate(" . $tmp->angle . "deg)" : "";
                                $cssParm["transform-origin"] = "left top";
                            }
                            if (property_exists($tmp, "charSpacing") == true) {

                                $charSpacing = $tmp->charSpacing * 0.001 * ($tmp->fontSize * $tmp->scaleX) * $this->pageScale;
                                $cssParm["letter-spacing"] = (is_numeric($tmp->charSpacing)) ? ($charSpacing) . "px" : 0 . "px";
                            }

                            $this->createCss($cssParm);

                            break;
                        case "PageNo":

                            //取字体
                            if (empty($this->htmlFont)) {
                                array_push($this->htmlFont, $tmp->fontFamily);
                            } else {
                                if (!in_array($tmp->fontFamily, $this->htmlFont)) {
                                    array_push($this->htmlFont, $tmp->fontFamily);
                                }
                            }

                            $tmpHtml = $tmpHtml . '<div class="Text_' . $pageSort . '_' . $tmp->id . '" >';
                            //$tmpHtml = $tmpHtml . $pageSort;
                            $tmpHtml = $tmpHtml . str_replace("P", "", $tmp->text);
                            $tmpHtml = $tmpHtml . '</div>';

                            //设计器与输出文本类型偏移量计算
                            $offserY = $tmp->fontSize * $tmp->scaleX * 0.065 * 2 * $this->pageScale;
                            $cssParm = array(
                                "className" => "Text_" . $pageSort . "_" . $tmp->id,
                                "left" => intval($tmp->left * 1 * $this->pageScale - $this->bleedLineIn) . "px",
                                "top" => intval($tmp->top * 1 * $this->pageScale - $this->bleedLineTop) . "px",
                                "width" => ($tmp->width * $tmp->scaleX * $this->pageScale) . "px",
                                "height" => ($tmp->height * $tmp->scaleY * $this->pageScale) . "px",
                                "font-size" => ($tmp->fontSize * $tmp->scaleX * $this->pageScale) . "px",
                                "font-family" => $tmp->fontFamily,
                                "font-style" => $tmp->fontStyle,
                                "font-weight" => $tmp->fontWeight,
                                "color" => $tmp->fill,
                                "text-align" => $tmp->textAlign,
                                "vertical-align" => "middle",
                                "line-height" => ($tmp->fontSize * $tmp->scaleY * $this->pageScale) . "px",
                                "position" => "absolute");

                            if ($tmp->shadow != null) {
                                $_blur = $tmp->shadow->blur * $tmp->scaleX;
                                $_color = $tmp->shadow->color;
                                $_offsetX = $tmp->shadow->offsetX * $tmp->scaleX * $this->pageScale;
                                $_offsetY = $tmp->shadow->offsetY * $tmp->scaleY * $this->pageScale;

                                $cssParm['text-shadow'] = $_offsetX . 'px ' . $_offsetY . 'px ' . $_blur . 'px ' . $_color;
                            }

                            if ($tmp->strokeWidth != "" and $tmp->strokeWidth * 1 > 0 and $tmp->stroke != "") {
                                $cssParm["-webkit-text-stroke"] = ($tmp->strokeWidth * $tmp->scaleX * $this->pageScale) . "px " . $tmp->stroke;
                            }
                            if ($tmp->backgroundColor != "") {
                                $cssParm["background-color"] = $tmp->backgroundColor;
                            }
                            if ($tmp->angle) {
                                $cssParm["transform"] = (is_numeric($tmp->angle)) ? "rotate(" . $tmp->angle . "deg)" : "";
                                $cssParm["transform-origin"] = "left top";
                            }

                            $this->createCss($cssParm);

                            break;
                        case "Picture":
                        case "IconElement":

                            if (property_exists($tmp, "src") == true) {
                                $tmpHtml = $tmpHtml . '<div class="Picture_' . $pageSort . "_" . $tmp->id . '" >';
                                $tmpHtml = $tmpHtml . '<img src="' . $this->thumb($tmp->src) . '" style="width:100%;height:auto;">';
                                $tmpHtml = $tmpHtml . '</div>';

                                $cssParm = array(
                                    "className" => "Picture_" . $pageSort . "_" . $tmp->id,
                                    "left" => intval($tmp->left * 1 * $this->pageScale - $this->bleedLineIn) . "px",
                                    "top" => intval($tmp->top * 1 * $this->pageScale - $this->bleedLineTop) . "px",
                                    "width" => ($tmp->width * $tmp->scaleX * $this->pageScale) . "px",
                                    "height" => ($tmp->height * $tmp->scaleY * $this->pageScale) . "px",
                                    "position" => "absolute");

                                if (is_numeric($tmp->angle)) {
                                    $cssParm["transform"] = 'rotate(' . $tmp->angle . 'deg)';
                                    $cssParm["transform-origin"] = 'left top';
                                }

                                $this->createCss($cssParm);
                            }
                            break;
                        case "dottedLine":
                            //虚线
                            $cssParm = array(
                                "className" => "dottedLine_" . $pageSort . "_" . $tmp->id,
                                "left" => intval($tmp->left * 1 * $this->pageScale - $this->bleedLineIn) . "px",
                                "top" => intval($tmp->top * 1 * $this->pageScale - $this->bleedLineTop) . "px",
                                "width" => ($tmp->width * $tmp->scaleX * $this->pageScale) . "px",
                                "height" => ($tmp->height * $tmp->scaleY * $this->pageScale) . "px",
                                "position" => "absolute");

                            $cssParm["border-color"] = $tmp->stroke;

                            $points = $tmp->points;
                            $x1 = (int) ($tmp->left * $this->pageScale - $this->bleedLineIn + $tmp->strokeWidth);
                            $y1 = (int) ($tmp->top * $this->pageScale - $this->bleedLineTop + $tmp->strokeWidth);
                            $x2 = $x1 + ($tmp->width * $this->pageScale * $tmp->scaleX);
                            $y2 = ($points[1]->y * $tmp->scaleY - $points[0]->y * $tmp->scaleY * $this->pageScale);

                            $points = [];
                            $defX = 0;
                            $defY = 0;

                            //偏移量
                            $pathOffset = $tmp->pathOffset;

                            $tip = "";
                            foreach ($tmp->points as $p) {

                                //处理画布设计 左上偏移量(因为保存模板时，只计算了left、top，里面的点坐标没有减去偏移量)
                                if ($defX == 0) {
                                    // $defX = $p->x * 1 - ( $tmp->scaleX + $tmp->strokeWidth );
                                    $defX = $tmp->points[0]->x;
                                }

                                if ($defY == 0) {
                                    // $defY = $p->y * 1 - ($tmp->height * $tmp->scaleY); 原先的
                                    if ($y2 == 0) {
                                        $defY = $p->y * 1;
                                        $tip = "a";
                                    } else if ($y2 > 0) {
                                        $defY = $tmp->points[0]->y;
                                        $tip = "b";
                                    } else if ($y2 < 0) {
                                        $defY = $p->y * 1 - ($tmp->height * $tmp->scaleY);
                                        $tip = "c";
                                    }
                                }

                                array_push($points, ($p->x * 1 * $tmp->scaleY - $defX * $tmp->scaleX) * $this->pageScale);
                                array_push($points, ($p->y * 1 * $tmp->scaleY - $defY * $tmp->scaleY) * $this->pageScale);

                            }

                            $strokeDashData = "";
                            if ($tmp->strokeDashArray) {
                                $cssParm["border-left"] = ($tmp->strokeWidth) . "px dashed " . $tmp->stroke;
                                //html svg虚线 线段与间隔与设计器 顺序相反
                                $strokeDashData = ($tmp->strokeDashArray[1] * $this->pageScale) . "," . ($tmp->strokeDashArray[0] * $this->pageScale);
                            }
                            if ($tmp->strokeWidth > $tmp->height) {
                                $tmp->height = $tmp->strokeWidth * $this->pageScale;
                            }

                            if ($tmp->strokeWidth > $tmp->width) {
                                $tmp->width = $tmp->strokeWidth * $this->pageScale;
                            }

                            $this->createCss($cssParm);

                            $angleStyle = '';
                            if (is_numeric($tmp->angle)) {
                                $angleStyle = 'transform:rotate(' . $tmp->angle . 'deg);';
                                $angleStyle = $angleStyle . 'transform-origin:left top';
                            }

                            $tmpHtml = $tmpHtml . '<svg xmlns="http://www.w3.org/2000/svg" tip="' . $tip . '" version="1.1" style="position:absolute;width:' . ($tmp->width * $this->pageScale) . 'px;height:' . ($tmp->height * $this->pageScale) . 'px;left:' . $x1 . 'px;top:' . $y1 . 'px;' . $angleStyle . ';overflow: visible;" >';
                            // $tmpHtml=$tmpHtml . '<line x1="0" y1="0" x2="'.$tmp->width.'" y2="'. $y2 .'"';
                            $tmpHtml = $tmpHtml . '<line da="3" x1="' . ($points[0] + $tmp->strokeWidth) . '" y1="' . ($points[1] + $tmp->strokeWidth) . '" x2="' . ($points[2] + $tmp->strokeWidth) . '" y2="' . ($points[3] + $tmp->strokeWidth) . '"';
                            $tmpHtml = $tmpHtml . 'style="position:absolute;stroke:' . $tmp->stroke . ';stroke-width:' . ($tmp->strokeWidth * $this->pageScale) . ';" ';
                            $tmpHtml = $tmpHtml . ' stroke-dasharray="' . $strokeDashData . '"/>';
                            $tmpHtml = $tmpHtml . '</svg>';

                            break;
                        case "shape":

                            $cssParm = array(
                                "className" => "shape_" . $pageSort . "_" . $tmp->id,
                                "left" => intval(($tmp->left) * 1 * $this->pageScale - $this->bleedLineIn) . "px",
                                "top" => intval(($tmp->top) * 1 * $this->pageScale - $this->bleedLineTop) . "px",
                                "width" => ($tmp->width * $tmp->scaleX * $this->pageScale) . "px",
                                "height" => ($tmp->height * $tmp->scaleY * $this->pageScale) . "px",
                                "position" => "absolute");

                            if (is_numeric($tmp->angle)) {
                                $cssParm["transform"] = 'rotate(' . $tmp->angle . 'deg)';
                                $cssParm["transform-origin"] = 'left top';
                            }

                            //边框样式
                            $strokeDashData = "";
                            if ($tmp->strokeDashArray) {
                                $tmp->strokeDashArray[0] = $tmp->strokeDashArray[0] * $tmp->scaleX * $this->pageScale;
                                $tmp->strokeDashArray[1] = $tmp->strokeDashArray[1] * $tmp->scaleX * $this->pageScale;
                                $strokeDashData = implode(",", $tmp->strokeDashArray);
                                $strokeDashData = ' stroke-dasharray="' . $strokeDashData . '"';
                            }

                            $_strokeWidth = $tmp->strokeWidth;
                            $tmp->strokeWidth = $tmp->strokeWidth * $tmp->scaleX * $this->pageScale;

                            $circleOffsetX = 0;
                            $circleOffsetY = 0;

                            $pathOffsetX = 0;
                            $pathOffsetY = 0;

                            $cssParm["border-color"] = $tmp->stroke;
                            $cssParm["fill"] = ($tmp->fill == "") ? "transparent" : $tmp->fill;
                            $svgHtml = '';
                            if (property_exists($tmp, "path") == true) {

                                $svgHtml = '<polygon fill = "' . $cssParm["fill"] . '" ' . $strokeDashData . ' stroke = "' . $cssParm["border-color"] . '" stroke-width = "' . ($tmp->strokeWidth) . '" points = "';

                                foreach ($tmp->path as $v) {
                                    if (isset($v[1])) {

                                        $svgHtml = $svgHtml . ($v[1] * $tmp->scaleX * $this->pageScale - $this->bleedLineIn - $tmp->strokeWidth * 4) . "," . ($v[2] * $tmp->scaleY * $this->pageScale - $this->bleedLineTop - $tmp->strokeWidth * 4) . " ";

                                        if ($pathOffsetY == 0) {
                                            $pathOffsetY = ($v[2] * $tmp->scaleY);
                                        } else {
                                            if ($pathOffsetY > $v[2] * $tmp->scaleY) {
                                                $pathOffsetY = $v[2] * $tmp->scaleY;
                                            }
                                        }

                                        if ($pathOffsetX == 0) {
                                            $pathOffsetX = ($v[1] * $tmp->scaleX);
                                        } else {
                                            if ($pathOffsetX > $v[1] * $tmp->scaleX) {
                                                $pathOffsetX = $v[1] * $tmp->scaleX;
                                            }
                                        }

                                    }
                                }

                                if ($pathOffsetX > 0) {
                                    $pathOffsetX = ($pathOffsetX - $tmp->strokeWidth) * $tmp->scaleX * $this->pageScale - $this->bleedLineIn;
                                }
                                if ($pathOffsetY > 0) {
                                    $pathOffsetY = ($pathOffsetY - $tmp->strokeWidth) * $tmp->scaleY * $this->pageScale - $this->bleedLineTop;
                                }

                                $svgHtml = $svgHtml . '"/>';

                            } else if ($tmp->type == "circle") {

                                $circleOffsetX = $tmp->radius * $tmp->scaleX;
                                $circleOffsetY = $tmp->radius * $tmp->scaleY;

                                $circleZoom = 1;
                                if ($tmp->scaleX * 1 == $tmp->scaleY * 1) {
                                    $circleZoom = $tmp->scaleX;
                                }

                                $svgHtml = '<circle cx="0" cy="0" r="' . ($tmp->radius * $circleZoom * $this->pageScale) . '" stroke="' . $cssParm["border-color"] . '" stroke-width="' . ($tmp->strokeWidth) . '" fill="' . $cssParm["fill"] . '" ' . $strokeDashData . '/>';
                            } else if ($tmp->type == "rect") {

                                $svgHtml = '<rect width="' . ($tmp->width * $tmp->scaleX * $this->pageScale) . '" height="' . ($tmp->height * $tmp->scaleY * $this->pageScale) . '" rx="' . ($tmp->rx * $this->pageScale) . '" ry="' . ($tmp->ry * $this->pageScale) . '"  stroke="' . $cssParm["border-color"] . '" stroke-width="' . ($tmp->strokeWidth) . '" fill="' . $cssParm["fill"] . '" ' . $strokeDashData . '/>';

                            }

                            if ($tmp->strokeWidth > $tmp->height) {
                                $tmp->height = $tmp->strokeWidth * $this->pageScale;
                            }

                            if ($tmp->strokeWidth > $tmp->width) {
                                $tmp->width = $tmp->strokeWidth * $this->pageScale;
                            }

                            $this->createCss($cssParm);
                            $angleStyle = '';
                            if (is_numeric($tmp->angle)) {

                                if ($tmp->type == "circle") {

                                    if ($tmp->scaleX != $tmp->scaleY) {

                                        $scaleCss = ' scale(' . $tmp->scaleX . ',' . $tmp->scaleY . ')';
                                        $angleStyle = 'transform:rotate(' . $tmp->angle . 'deg)' . $scaleCss;
                                        $angleStyle = $angleStyle . ';transform-origin:left top';

                                    } else {

                                        $angleStyle = 'transform:rotate(' . $tmp->angle . 'deg);';
                                        $angleStyle = $angleStyle . 'transform-origin:left top';

                                    }

                                } else {

                                    $angleStyle = 'transform:rotate(' . $tmp->angle . 'deg);';
                                    $angleStyle = $angleStyle . 'transform-origin:left top';

                                }

                            }

                            if (property_exists($tmp, "path") == false) {

                                $tmpHtml = $tmpHtml . '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="' . ($pathOffsetX) . ' ' . ($pathOffsetY) . ' ' . ($tmp->width * $tmp->scaleX * $this->pageScale) . ' ' . ($tmp->height * $tmp->scaleY * $this->pageScale) . '" preserveAspectRatio="xMinYMin meet" style="position:absolute;width:' . ($tmp->width * $tmp->scaleX * $this->pageScale) . 'px;height:' . ($tmp->height * $tmp->scaleY * $this->pageScale) . 'px;left:' . (($tmp->left + $circleOffsetX) * $this->pageScale - $this->bleedLineIn + $tmp->strokeWidth / 2) . 'px;top:' . (($tmp->top + $circleOffsetY) * $this->pageScale - $this->bleedLineTop + $tmp->strokeWidth / 2) . 'px;' . $angleStyle . ';overflow:visible;" >';

                            } else {

                                $tmpHtml = $tmpHtml . '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="' . $pathOffsetX . ' ' . $pathOffsetY . ' ' . ($tmp->width * $tmp->scaleX * $this->pageScale) . ' ' . ($tmp->height * $tmp->scaleY * $this->pageScale) . '" preserveAspectRatio="xMinYMin meet" style="position:absolute;width:' . ($tmp->width * $tmp->scaleX * $this->pageScale) . 'px;height:' . ($tmp->height * $tmp->scaleY * $this->pageScale) . 'px;left:' . (($tmp->left + $circleOffsetX) * $this->pageScale - $this->bleedLineIn - $tmp->strokeWidth / 2) . 'px;top:' . (($tmp->top + $circleOffsetY) * $this->pageScale - $this->bleedLineTop - $tmp->strokeWidth / 2) . 'px;' . $angleStyle . ';overflow:visible;" >';
                            }

                            $tmpHtml = $tmpHtml . $svgHtml;

                            $tmpHtml = $tmpHtml . '</svg>';

                            break;
                        case "tmpGroup":
                            $tmpHtml = $tmpHtml . '<div class="tmpGroup_' . $pageSort . "_" . $tmp->id . '">';

                            $cssParm = array(
                                "className" => "tmpGroup_" . $pageSort . "_" . $tmp->id,
                                "left" => intval($tmp->left * 1 * $this->pageScale - $this->bleedLineIn) . "px",
                                "top" => intval($tmp->top * $this->pageScale - $this->bleedLineTop) . "px",
                                "width" => ($tmp->width * $tmp->scaleX * $this->pageScale) . "px",
                                "height" => ($tmp->height * $tmp->scaleY * $this->pageScale) . "px",
                                "position" => "absolute");

                            if (is_numeric($tmp->angle)) {
                                $cssParm["transform"] = 'rotate(' . $tmp->angle . 'deg)';
                                $cssParm["transform-origin"] = 'left top';
                            }

                            $this->createCss($cssParm);

                            $subObject = $tmp->objects;
                            $subHtml = '';

                            //计算该组件最左minLeft、最上坐标minTop,然后所有该组内的对象都要减去minLeft、minTop
                            $minLeft = 8000;
                            $minTop = 8000;
                            for ($j = 0; $j < count($subObject); $j++) {
                                $subtmp = $subObject[$j];
                                if ($minTop > $subtmp->top) {
                                    $minTop = $subtmp->top * 1;
                                }
                                if ($minLeft > $subtmp->left) {
                                    $minLeft = $subtmp->left * 1;
                                }

                            }

                            for ($j = 0; $j < count($subObject); $j++) {
                                $subtmp = $subObject[$j];
                                //生成子对象css代码
                                if ($subtmp->id == "" or $subtmp->id == null) {
                                    $subtmp->id = uniqid();
                                }
                                /* 商品组件克隆时，有些属性没有克隆到，估在此增加特殊处理 */
                                if ($subtmp->dType == "Rect") {
                                    $subtmp->id = uniqid();
                                }
                                if (!$subtmp->dType and $subtmp->type == "image") {
                                    $subtmp->id = uniqid();
                                    $subtmp->dType = "Picture";
                                }
                                if (!$subtmp->dType and $subtmp->type == "rect") {
                                    $subtmp->id = uniqid();
                                    $subtmp->dType = "Rect";
                                }
                                if ($subtmp->type == "circle") {
                                    $subtmp->id = uniqid();
                                    $subtmp->dType = "circle";
                                }
                                $subjectCssParm = array(
                                    "className" => $subtmp->dType . "_" . $subtmp->id, //".tmpGroup_".$tmp->id .
                                    "left" => ($subtmp->left * $tmp->scaleX + (($tmp->width * $tmp->scaleX) / 2)) * $this->pageScale . "px",
                                    "top" => ($subtmp->top * $tmp->scaleY + (($tmp->height * $tmp->scaleY) / 2)) * $this->pageScale . "px",
                                    "width" => ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . "px",
                                    "height" => ($subtmp->height * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . "px",
                                    "position" => "absolute");

                                if ($subtmp->type == "textbox") {
                                    $subjectCssParm["vertical-align"] = "middle";
                                    $subjectCssParm["line-height"] = ($subtmp->lineHeight * $subtmp->fontSize * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . "px";
                                    //设计器与输出文本类型偏移量计算
                                    $offserY = $subtmp->fontSize * $tmp->scaleY * $subtmp->scaleX * 0.065 * 2 * $this->pageScale;
                                    $subjectCssParm["top"] = (($subtmp->top * $tmp->scaleY + ($tmp->height * $tmp->scaleY) / 2) * $this->pageScale + $offserY) . "px";

                                    if (property_exists($subtmp, "fontWeight") == true) {
                                        $subjectCssParm["font-weight"] = $subtmp->fontWeight;
                                    }
                                    $subjectCssParm["font-style"] = $subtmp->fontStyle;
                                    $subjectCssParm["text-align"] = $subtmp->textAlign;
                                    $subjectCssParm["color"] = $subtmp->fill;
                                    $subjectCssParm["font-family"] = $subtmp->fontFamily;
                                    $subjectCssParm["font-size"] = ($subtmp->fontSize * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . "px";
                                    if ($subtmp->charSpacing) {
                                        $charSpacing = $subtmp->charSpacing * 0.001 * ($subtmp->fontSize * $subtmp->scaleY * $this->pageScale);
                                        $subjectCssParm["letter-spacing"] = (is_numeric($subtmp->charSpacing)) ? ($charSpacing) . "px" : 0 . "px";
                                    }
                                    if ($subtmp->angle) {
                                        $subjectCssParm["transform"] = (is_numeric($subtmp->angle)) ? "rotate(" . $subtmp->angle . "deg)" : "";
                                        $subjectCssParm["transform-origin"] = "left top";
                                    }

                                }

                                if ($subtmp->angle) {
                                    $subjectCssParm["transform"] = (is_numeric($subtmp->angle)) ? "rotate(" . $subtmp->angle . "deg)" : "";
                                    $subjectCssParm["transform-origin"] = "left top";
                                }

                                if ($subtmp->strokeWidth and $subtmp->strokeWidth != "" and is_numeric($subtmp->strokeWidth)) {

                                    if ($subtmp->stroke != "" and $subtmp->stroke != null and $subtmp->stroke != "undefined") {
                                        $subjectCssParm["-webkit-text-stroke"] = $subtmp->strokeWidth * $subtmp->scaleX * $this->pageScale . "px " . $subtmp->stroke;
                                    } else {
                                        $subjectCssParm["-webkit-text-stroke"] = $subtmp->strokeWidth * $subtmp->scaleX * $this->pageScale . "px transparent";
                                    }

                                }

                                if ($subtmp->dType == "Rect") {
                                    //边框
                                    if ($subtmp->strokeWidth and $subtmp->strokeWidth != "" and is_numeric($subtmp->strokeWidth) and $subtmp->fill != "") {
                                        $subjectCssParm["border"] = ($subtmp->strokeWidth * $this->pageScale) . "px solid " . $subtmp->stroke;
                                        $subjectCssParm["background-color"] = $subtmp->fill;
                                    }
                                }

                                if ($subtmp->dType) {
                                    switch ($subtmp->dType) {
                                        case "Picture":
                                            //组件装饰图片
                                            // exit;
                                            if (property_exists($subtmp, "src") == true) {
                                                $subHtml = $subHtml . '<div class="Picture_' . $subtmp->id . '"  >';
                                                $subHtml = $subHtml . '<img src="' . $this->thumb($subtmp->src) . '" style="width:' . ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . 'px;height:' . ($subtmp->height * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . 'px;">';
                                                $subHtml = $subHtml . '</div>';
                                            }

                                            break;
                                        case "Rect":
                                            //矩型
                                            $subHtml = $subHtml . '<div class="Rect_' . $subtmp->id . '"  >';
                                            $subHtml = $subHtml . '</div>';

                                            break;
                                        case "text":

                                            //取字体
                                            if ($subtmp->fontFamily != "freeserif") {
                                                if (empty($this->htmlFont)) {
                                                    array_push($this->htmlFont, $subtmp->fontFamily);
                                                } else {
                                                    if (!in_array($subtmp->fontFamily, $this->htmlFont)) {
                                                        array_push($this->htmlFont, $subtmp->fontFamily);
                                                    }
                                                }
                                            }

                                            $subHtml = $subHtml . '<div class="text_' . $subtmp->id . ' labelText"  >';
                                            $subHtml = $subHtml . $subtmp->text;
                                            $subHtml = $subHtml . '</div>';
                                            break;
                                        case "circle":
                                            $borderW = $subtmp->strokeWidth * $subtmp->scaleX * $tmp->scaleX * $this->pageScale;
                                            $subjectCssParm["left"] = (($subtmp->left * $tmp->scaleX + (($tmp->width * $tmp->scaleX) / 2)) * $this->pageScale - $borderW / 2) . "px";
                                            $subjectCssParm["top"] = (($subtmp->top * $tmp->scaleY + (($tmp->height * $tmp->scaleY) / 2)) * $this->pageScale - $borderW / 2) . "px";
                                            $subjectCssParm["width"] = ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale - $borderW) . "px";
                                            $subjectCssParm["height"] = ($subtmp->height * $subtmp->scaleY * $tmp->scaleY * $this->pageScale - $borderW) . "px";
                                            $subjectCssParm["border-radius"] = "50%";
                                            $subjectCssParm["background-color"] = $subtmp->fill;
                                            $subjectCssParm["border"] = ($subtmp->strokeWidth * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . "px solid " . $subtmp->stroke;
                                            $subHtml = $subHtml . '<div class="circle_' . $subtmp->id . ' "  >';
                                            // $subHtml=$subHtml . $subtmp->text;
                                            $subHtml = $subHtml . '</div>';

                                            break;
                                        case "shape":

                                            //边框样式
                                            $strokeDashData = "";
                                            if ($subtmp->strokeDashArray) {
                                                $strokeDashData = implode(",", $subtmp->strokeDashArray);
                                                $strokeDashData = ' stroke-dasharray="' . $strokeDashData . '"';
                                            }

                                            $_strokeWidth = $subtmp->strokeWidth * $tmp->scaleX;
                                            $subtmp->strokeWidth = $subtmp->strokeWidth * $subtmp->scaleX * $tmp->scaleX * $this->pageScale;

                                            $circleOffsetX = 0;
                                            $circleOffsetY = 0;

                                            $pathOffsetX = 0;
                                            $pathOffsetY = 0;

                                            $subjectCssParm["border-color"] = $subtmp->stroke;
                                            $subjectCssParm["fill"] = ($subtmp->fill == "") ? "transparent" : $subtmp->fill;
                                            $svgHtml = '';
                                            if (property_exists($subtmp, "path") == true) {

                                                $svgHtml = '<polygon fill = "' . $subjectCssParm["fill"] . '" ' . $strokeDashData . ' stroke = "' . $subjectCssParm["border-color"] . '" stroke-width = "' . $subtmp->strokeWidth . '" points = "';
                                                foreach ($subtmp->path as $v) {
                                                    if (isset($v[1])) {

                                                        $svgHtml = $svgHtml . ($v[1] * $tmp->scaleX * $subtmp->scaleX * $this->pageScale - $this->bleedLineIn - $_strokeWidth * $tmp->scaleX * 4) . "," . ($v[2] * $tmp->scaleY * $subtmp->scaleY * $this->pageScale - $this->bleedLineTop - $_strokeWidth * $tmp->scaleY * 4) . " ";

                                                        if ($pathOffsetY == 0) {
                                                            $pathOffsetY = ($v[2] * $subtmp->scaleY);
                                                        } else {
                                                            if ($pathOffsetY > $v[2] * $subtmp->scaleY) {
                                                                $pathOffsetY = $v[2] * $subtmp->scaleY;
                                                            }
                                                        }

                                                        if ($pathOffsetX == 0) {
                                                            $pathOffsetX = ($v[1] * $subtmp->scaleX);
                                                        } else {
                                                            if ($pathOffsetX > $v[1] * $subtmp->scaleX) {
                                                                $pathOffsetX = $v[1] * $subtmp->scaleX;
                                                            }
                                                        }

                                                    }
                                                }

                                                if ($pathOffsetX > 0) {
                                                    $pathOffsetX = ($pathOffsetX - $subtmp->strokeWidth) * $this->pageScale;
                                                }
                                                if ($pathOffsetY > 0) {
                                                    $pathOffsetY = ($pathOffsetY - $subtmp->strokeWidth) * $this->pageScale;
                                                }

                                                $svgHtml = $svgHtml . '"/>';

                                            } else if ($subtmp->type == "circle") {

                                                $circleOffsetX = $subtmp->radius * $subtmp->scaleX;
                                                $circleOffsetY = $subtmp->radius * $subtmp->scaleY;

                                                $svgHtml = '<circle cx="0" cy="0" r="' . ($subtmp->radius * $subtmp->scaleX * $tmp->scaleX * $this->pageScale - $subtmp->strokeWidth * 2) . '" stroke="' . $subjectCssParm["border-color"] . '" stroke-width="' . $subtmp->strokeWidth . '" fill="' . $subjectCssParm["fill"] . '" ' . $strokeDashData . '/>';
                                            } else if ($subtmp->type == "rect") {

                                                $svgHtml = '<rect da="da" rx="' . ($subtmp->rx * $subtmp->scaleX * $this->pageScale) . '" ry="' . ($subtmp->ry * $subtmp->scaleX * $this->pageScale) . '"  width="' . ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . '" height="' . ($subtmp->height * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . '"  stroke="' . $subjectCssParm["border-color"] . '" stroke-width="' . $subtmp->strokeWidth . '" fill="' . $subjectCssParm["fill"] . '" ' . $strokeDashData . '/>';

                                            }

                                            if ($subtmp->strokeWidth > $subtmp->height) {
                                                $subtmp->height = $subtmp->strokeWidth * $this->pageScale;
                                            }

                                            if ($subtmp->strokeWidth > $subtmp->width) {
                                                $subtmp->width = $subtmp->strokeWidth * $this->pageScale;
                                            }

                                            $this->createCss($subjectCssParm);
                                            $angleStyle = '';
                                            if (is_numeric($subtmp->angle)) {

                                                //$angleStyle = 'transform:rotate(' . $subtmp->angle . 'deg);';
                                                //$angleStyle = $angleStyle . 'transform-origin:left top';

                                                if ($subtmp->type == "circle") {

                                                    if ($subtmp->scaleX != $subtmp->scaleY) {

                                                        $scaleCss = ' scale(' . $subtmp->scaleX . ',' . $subtmp->scaleY . ')';
                                                        $angleStyle = 'transform:rotate(' . $subtmp->angle . 'deg)' . $scaleCss;
                                                        $angleStyle = $angleStyle . ';transform-origin:left top';

                                                    } else {

                                                        $angleStyle = 'transform:rotate(' . $subtmp->angle . 'deg);';
                                                        $angleStyle = $angleStyle . 'transform-origin:left top';

                                                    }

                                                } else {

                                                    $angleStyle = 'transform:rotate(' . $subtmp->angle . 'deg);';
                                                    $angleStyle = $angleStyle . 'transform-origin:left top';

                                                }
                                            }

                                            $subHtml = $subHtml . '<div class="shape_' . $subtmp->id . ' " dv="dv"  >';

                                            if (property_exists($subtmp, "path") == true) {

                                                $subHtml = $subHtml . '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="' . $pathOffsetX . ' ' . $pathOffsetY . ' ' . ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . ' ' . ($subtmp->height * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . '" preserveAspectRatio="xMinYMin meet" style="position:absolute;width:' . ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . 'px;height:' . ($subtmp->height * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . 'px;left:' . (0 - $subtmp->strokeWidth * 2) . 'px;top:' . (0 - $subtmp->strokeWidth * 2) . 'px;' . $angleStyle . ';overflow:visible;" >';

                                            } else if ($subtmp->type == "circle") {

                                                $subHtml = $subHtml . '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="' . $pathOffsetX . ' ' . $pathOffsetY . ' ' . ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . ' ' . ($subtmp->height * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . '" preserveAspectRatio="xMinYMin meet" style="position:absolute;width:' . ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . 'px;height:' . ($subtmp->height * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . 'px;left:' . (0 - $subtmp->strokeWidth * 2 * $this->pageScale) . 'px;top:' . (0 - $subtmp->strokeWidth * 2 * $this->pageScale) . 'px;' . $angleStyle . ';overflow:visible;" >';
                                            } else if ($subtmp->type == "rect") {

                                                $subHtml = $subHtml . '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="' . $pathOffsetX . ' ' . $pathOffsetY . ' ' . ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . ' ' . ($subtmp->height * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . '" preserveAspectRatio="xMinYMin meet" style="position:absolute;width:' . ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . 'px;height:' . ($subtmp->height * $subtmp->scaleY * $tmp->scaleY * $this->pageScale) . 'px;left:' . (0) . 'px;top:' . (0) . 'px;' . $angleStyle . ';overflow:visible;" >';

                                            }

                                            $subHtml = $subHtml . $svgHtml;
                                            $subHtml = $subHtml . '</svg>';

                                            $subHtml = $subHtml . '</div>';

                                            break;
                                        case "dottedLine":
                                            //虚线
                                            $subjectCssParm = array(
                                                "className" => "dottedLine_" . $pageSort . "_" . $tmp->id . "_" . $subtmp->id,
                                                "left" => ($subtmp->left * $subtmp->scaleX * $tmp->scaleX + (($tmp->width * $tmp->scaleX) / 2)) * $this->pageScale . "px",
                                                "top" => ($subtmp->top * $subtmp->scaleX * $tmp->scaleY + (($tmp->height * $tmp->scaleY) / 2)) * $this->pageScale . "px",
                                                "width" => ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . "px",
                                                "height" => ($subtmp->height * $subtmp->scaleY * $this->pageScale) . "px",
                                                "position" => "absolute");

                                            $subjectCssParm["border-color"] = $subtmp->stroke;

                                            $points = $subtmp->points;
                                            $x1 = (int) ($subtmp->left);
                                            $y1 = (int) ($subtmp->top);
                                            $x2 = $x1 + ($subtmp->width * $subtmp->scaleX * $tmp->scaleX);
                                            $y2 = ($points[1]->y * $subtmp->scaleY - $points[0]->y * $subtmp->scaleY);

                                            $points = [];
                                            $defX = 0;
                                            $defY = 0;
                                            /*
                                            foreach ($subtmp->points as $p) {

                                            //处理画布设计 左上偏移量(因为保存模板时，只计算了left、top，里面的点坐标没有减去偏移量)

                                            if ($defX == 0) {
                                            // $defX = $p->x * 1 - ( $subtmp->scaleX * $subtmp->strokeWidth);
                                            $defX = $p->x * 1 * $subtmp->scaleX - $subtmp->strokeWidth;
                                            }
                                            if ($defY == 0) {
                                            //$defY = $p->y * 1 - ($subtmp->height * $subtmp->scaleY);
                                            $defY = $p->y * 1 * $subtmp->scaleY  - ($subtmp->strokeWidth);
                                            }

                                            array_push($points, ($p->x * $subtmp->scaleX * $tmp->scaleX - $defX));
                                            array_push($points, ($p->y * 1 * $subtmp->scaleY * $tmp->scaleY  ));//- $defY
                                            }
                                             */

                                            $points = [];
                                            $defX = $subtmp->points[0]->x * 1 * $subtmp->scaleX - $tmp->strokeWidth;
                                            $defY = $subtmp->points[0]->y * 1 - ($subtmp->strokeWidth * $tmp->scaleY);
                                            $points[0] = 0 - $tmp->strokeWidth;
                                            $points[1] = 0 - $tmp->strokeWidth;

                                            $points[2] = 0 - $tmp->strokeWidth;
                                            $points[3] = ($subtmp->points[1]->y - $subtmp->points[0]->y) * $subtmp->scaleX * $subtmp->scaleY * $this->pageScale;

                                            $strokeDashData = "";
                                            if ($subtmp->strokeDashArray) {
                                                $cssParm["border-left"] = $subtmp->strokeWidth * $this->pageScale . "px dashed " . $subtmp->stroke;
                                                //echo json_encode($subtmp->strokeDashArray);exit;
                                                $lineZoom = $this->pageScale;
                                                $subtmp->strokeDashArray[0] = $subtmp->strokeDashArray[0] * $lineZoom;
                                                $subtmp->strokeDashArray[1] = $subtmp->strokeDashArray[1] * $lineZoom;
                                                $strokeDashData = implode(",", $subtmp->strokeDashArray);

                                            }
                                            if ($subtmp->strokeWidth > $subtmp->height) {
                                                $subtmp->height = $subtmp->strokeWidth * $this->pageScale;
                                            }

                                            if ($subtmp->strokeWidth > $subtmp->width) {
                                                $subtmp->width = $subtmp->strokeWidth * $this->pageScale;
                                            }

                                            $this->createCss($subjectCssParm);

                                            $angleStyle = '';
                                            if (is_numeric($subtmp->angle)) {
                                                $angleStyle = 'transform:rotate(' . $subtmp->angle . 'deg);';
                                                $angleStyle = $angleStyle . 'transform-origin:left top';
                                            }

                                            $subHtml = $subHtml . '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" style="position:absolute;width:' . ($subtmp->width * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . 'px;height:' . ($subtmp->height * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . 'px;left:' . (str_replace("px", "", $subjectCssParm["left"]) * 1) . 'px;top:' . (str_replace("px", "", $subjectCssParm["top"]) * 1) . 'px;' . $angleStyle . ';overflow:visible;" >';
                                            // $subHtml=$subHtml . '<line x1="0" y1="0" x2="'.$subtmp->width.'" y2="'. $y2 .'"';
                                            $subHtml = $subHtml . '<line da="1" x1="' . ($points[0]) . '" y1="' . ($points[1]) . '" x2="' . ($points[2]) . '" y2="' . ($points[3]) . '"';
                                            $subHtml = $subHtml . 'style="position:absolute;stroke:' . $subtmp->stroke . ';stroke-width:' . ($subtmp->strokeWidth * $subtmp->scaleX * $tmp->scaleX * $this->pageScale) . ';" ';
                                            $subHtml = $subHtml . ' stroke-dasharray="' . $strokeDashData . '"/>';
                                            $subHtml = $subHtml . '</svg>';

                                            break;

                                    }
                                } else {
                                    if ($subtmp->type == "circle") {
                                        $subjectCssParm["border-radius"] = "50%";
                                        $subjectCssParm["background-color"] = $subtmp->fill;
                                        $subjectCssParm["border"] = ($subtmp->strokeWidth * $this->pageScale) . "px solid " . $subtmp->stroke;
                                        $subHtml = $subHtml . '<div class="circle_' . $subtmp->id . ' "  >';
                                        $subHtml = $subHtml . '</div>';
                                    }
                                }
                                $this->createCss($subjectCssParm);
                            }
                            $tmpHtml = $tmpHtml . $subHtml;
                            $tmpHtml = $tmpHtml . '</div>';

                            break;
                    }
                }
            }

            $this->htmlData["Body"] = $this->htmlData["Body"] . $tmpHtml;
        } catch (\Exception $e) {
            Log::error($e->getMessage() . ', pageObject:');
            Log::error(json_encode($pageObject));
        }
    }

    //生成页面商品Map链接区域
    public function createMap($pageObject, $pageSort)
    {
        try {

            $this->pagesMap[$pageSort] = [];
            $pageWidth = ($this->pageWidth - $this->bleedLineOut - $this->bleedLineIn);
            $pageHeight = ($this->pageHeight - $this->bleedLineTop - $this->bleedLineBottom);

            $pageObj = $pageObject;
            //防止对象克隆后 id 重复处理
            $pageObjectID = [];

            //i--倒序写法为了解决map area重叠区域浏览器优先取先出现的area区域
            for ($i = count($pageObj)-1; $i>=0; $i--) {    

                $tmp = $pageObj[$i];

                if ($tmp->visible == true) {

                    switch ($tmp->dType) {

                        case "Product":
                            //商品组件

                            //如果该页面不存在商品数据，跳过商品数据输出
                            if (property_exists($tmp, "dSort")) {

                                $_dSort = explode("-", $tmp->dSort);
                                if (count($_dSort) == 2) {
                                    $productKey = "_" . $_dSort[0] . "_" . $_dSort[1];
                                    if (array_key_exists($productKey, $this->pageGoods)) {
                                        if (property_exists($this->pageGoods[$productKey], "info")) {
                                            if (property_exists($this->pageGoods[$productKey]->info, "itemcode")) {

                                            } else {
                                                continue 2;
                                            }
                                        } else {
                                            continue 2;
                                        }
                                    } else {
                                        continue 2;
                                    }
                                } else {
                                    continue 2;
                                }

                            } else {
                                continue 2;
                            }

                         
                            $x1 = intval($tmp->left * $this->pageScale * 1 - $this->bleedLineIn);
                            $x1 = ($x1 > 0) ? $x1 : 0;
                            $x1 = ($x1 > $pageWidth) ? $pageWidth : $x1;

                            $y1 = intval($tmp->top * $this->pageScale * 1 - $this->bleedLineTop);
                            $y1 = ($y1 < 0) ? 0 : $y1;
                            $y1 = ($y1 > $pageHeight) ? $pageHeight : $y1;

                            $x2 = $x1 + ($tmp->width * $this->pageScale * $tmp->scaleX);
                            $x2 = ($x2 > 0) ? $x2 : 0;
                            $x2 = ($x2 > $pageWidth) ? $pageWidth : $x2;

                            $y2 = $y1 + ($tmp->height * $this->pageScale * $tmp->scaleY);
                            $y2 = ($y2 < 0) ? 0 : $y2;
                            $y2 = ($y2 > $pageHeight) ? $pageHeight : $y2;

                            // $itemCode = $tmp->itemCode;
                            $itemCode = $this->pageGoods[$productKey]->info->itemcode;
                            $productId = $this->pageGoods[$productKey]->info->productId ?? '';

                            $tmpProduct = array(
                                0 => (int) $x1,
                                1 => (int) $y1,
                                2 => (int) $x2,
                                3 => (int) $y2,
                                4 => (string) $itemCode,
                                5 => (string) $productId,
                            );

                            array_push($this->pagesMap[$pageSort], $tmpProduct);

                            break;

                    }
                }
            }




        } catch (\Exception $e) {
            Log::error($e->getMessage() . ', pageObject:');
            Log::error(json_encode($pageObject));
        }
    }

    //插入页面分隔位
    public function pageSpace()
    {
        $this->htmlData["Body"] = $this->htmlData["Body"] . '<div style="width:100%;height:1em;"></div>';
    }

    //根据入参生成css代码
    public function createCss($cssParm)
    {
        $tmpCss = "";
        foreach ($cssParm as $key => $val) {
            if ($key != "className") {
                $tmpCss = $tmpCss . $key . ':' . $val . ';';
            }
        }
        $this->pageCssCode = $this->pageCssCode . "." . $cssParm["className"] . "{" . $tmpCss . "}";
    }

    //保存生成文件
    public function savecreateFile($type = '')
    {
        if (empty($type)) {
            $type = 'index';
        }
        $htmlPath = $this->savePath . $type . '.html';
        $savePathName = $this->savehtmlFile($htmlPath);
        return $savePathName;
    }

    //保存css文件
    public function savecssFile($cssPath)
    {
        //在这里插入字体引用
        $fontCss = '';
        for ($k = 0; $k < count($this->htmlFont); $k++) {
            if ($this->htmlFont[$k] != "") {
                $fontCss = $fontCss . ' @font-face { font-family:"' . $this->htmlFont[$k] . '";src: url("' . $this->fontPath . $this->htmlFont[$k] . ".ttf" . '")} ';
            }
        }
        $filename = rtrim($_SERVER['DOCUMENT_ROOT'], '/') . $cssPath;
        $fileContent = $fontCss . $this->pageCssCode;
        file_put_contents($filename, $fileContent);
    }

    //保存Html文件
    public function savehtmlFile($htmlPath)
    {
        $filename = rtrim($_SERVER['DOCUMENT_ROOT'], '/') . $htmlPath;

        // $fontCss = '';
        // for ($k = 0; $k < count($this->htmlFont); $k++) {
        //     if ($this->htmlFont[$k] != "") {
        //         $fontCss = $fontCss . ' @font-face { font-family:"' . $this->htmlFont[$k] . '";src: url("' . $this->fontData[$this->htmlFont[$k]]["sourceUrl"] . '")} ';
        //     }
        // }
        $staticUrl = static_url();
        $this->pageCssCode = '';
        $this->htmlData["Body"] = '';
        // 使用导出Html模板渲染
        $view = view('marketing/export/html/index', [
            'staticUrl' => $staticUrl,
            'mmCode' => $this->mmCode,
            'title' => $this->pageTitle,
            'style' => $this->pageCssCode,
            'body' => $this->htmlData["Body"],
            'pagesData' => json_encode($this->pagesData),
            'pagesMap' => json_encode($this->pagesMap),
            'pageWidth' => ($this->pageWidth - $this->bleedLineOut - $this->bleedLineIn),
            'pageHeight' => ($this->pageHeight - $this->bleedLineTop - $this->bleedLineBottom),
        ]);
        $_html = $view->getContent();

        file_put_contents($filename, $_html);

        return $filename;
    }

    //不保存但返回整个html+css H5源码用于在线预览
    public function reviewHtmlImage()
    {
        //echo json_encode($this->pagesMap);exit;
        $this->pageCssCode = '';
        $this->htmlData["Body"] = '';
        // 使用在线预览Html模板渲染
        $view = view('marketing/export/html/preview', [
            'mmCode' => $this->mmCode,
            'title' => $this->pageTitle,
            'style' => $this->pageCssCode,
            'body' => $this->htmlData["Body"],
            'pagesData' => json_encode($this->pagesData),
            'pagesMap' => json_encode($this->pagesMap),
            'pageWidth' => ($this->pageWidth - $this->bleedLineOut - $this->bleedLineIn),
            'pageHeight' => ($this->pageHeight - $this->bleedLineTop - $this->bleedLineBottom),
        ]);
        return $view->getContent();
    }

    public function reviewHtmlCode()
    {
        $fontCss = '';
        for ($k = 0; $k < count($this->htmlFont); $k++) {
            if ($this->htmlFont[$k] != "") {
                $fontCss = $fontCss . ' @font-face { font-family:"' . $this->htmlFont[$k] . '";src: url("' . $this->fontData[$this->htmlFont[$k]]["sourceUrl"] . '")} ';
            }
        }
        // 使用在线预览Html模板渲染
        $view = view('marketing/export/html/preview', [
            'mmCode' => $this->mmCode,
            'title' => $this->pageTitle,
            'style' => $fontCss . $this->pageCssCode,
            'body' => $this->htmlData["Body"],
            'pagesData' => json_encode($this->pagesData),
            'pagesMap' => json_encode($this->pagesMap),
            'pageWidth' => ($this->pageWidth - $this->bleedLineOut - $this->bleedLineIn),
            'pageHeight' => ($this->pageHeight - $this->bleedLineTop - $this->bleedLineBottom),
        ]);
        return $view->getContent();
    }

    public function drawLine($x1, $y1, $x2, $y2, $lineWidth = 4, $color = 'black')
    {
        $rectX = $x1 < $x2 ? $x1 : $x2;
        $rectY = $y1 < $y2 ? $y1 : $y2;
        $rectWidth = abs($x1 - $x2);
        $rectHeight = abs($y1 - $y2);
        //弦长
        $stringWidth = ceil(sqrt(($rectWidth * $rectWidth) + ($rectHeight * $rectHeight)));
        $xPad = ($rectWidth - $stringWidth) / 2;
        $yPad = ($rectHeight - $lineWidth) / 2;
        $radNum = atan2(($y1 - $y2), ($x1 - $x2));
        $transform = "translate(" . ($rectX + $xPad) . "px," . ($rectY + $yPad) . "px) rotate(" . $radNum . "rad);";
        return array("width" => $stringWidth . "px", "height" => $lineWidth . "px", "background-color" => $color, "transform" => $transform);
    }

    public function thumb($src)
    {
        $ext = pathinfo($src, PATHINFO_EXTENSION);
        if (!in_array(strtolower($ext), ['png_rgb', 'jpg_rgb', 'jpeg_rgb'])) {
            return $src;
        }
        return str_replace(['.png_rgb', '.jpg_rgb', '.jpeg_rgb'], ['.png_rgb_thumb', '.jpg_rgb_thumb', '.jpeg_rgb_thumb'], $src);
    }

}
