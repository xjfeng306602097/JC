<?php
header("Content-Type: text/html;charset=utf-8");
require __DIR__ . "/../config.php";



//require __DIR__ . '/../../../vendor/autoload.php';
/*use Intervention\Image\ImageManager;
use Intervention\Image\ImageManagerStatic as Image;
Image::configure(['driver' => 'imagick']);*/

/*
$rgbIccPath=app()->getRootPath() . 'resource/icc/RGB/sRGB IEC61966-21.icc';
$cmykIccPath=app()->getRootPath() . 'resource/icc/CMYK/US Web Coated (SWOP) v2.icc';

$fileName=app()->getRootPath() . 'testImage/alpalColor-RGB.png';
$shaowFile=app()->getRootPath() . 'testImage/alpalColor-RGB-cov.png';
$outCmykFile=app()->getRootPath() . 'testImage/alpalColor-CMYK.jpg';
$pdfCmykFile=app()->getRootPath() . 'testImage/alpalColor-PDF.jpg';
$maskPngPath=app()->getRootPath() . 'testImage/alpalColor-RGB-Mask.png';




// STEP 1 获取图片遮罩
getImageMask($fileName,$maskPngPath);

//STEP 2 阴影面积处理
$pixColor=getPixColor($fileName);
resetPixColor($fileName,$shaowFile,$pixColor,0.92);

//STEP 3 RGB PNG 转 CMYK JPG
pngRgbTojpgCmyk($shaowFile,$outCmykFile,$rgbIccPath,$cmykIccPath);

//STEP 4 反相
invertImage($outCmykFile,$pdfCmykFile);




//JPG RGB -> JPGCMYK 准确率99.98%
function jpgRgbTojpgCmyk($fileName,$outFile,$iccPath){

    $img = new Imagick();
    $img->readImage($fileName);
    $img = Image::make($img);
    $img->opacity(100);
    $img_core = $img->getCore();
    $img_core->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
    $img_core->setImageResolution(300,300);
    $iccFile =file_get_contents($iccPath);
    $img_core->profileImage('icc', $iccFile);
    $img_core->transformimagecolorspace(\Imagick::COLORSPACE_CMYK);
    $img->save($outFile,100,'jpg');

}

//PNG RGB -> JPG RGB ->JPG CMYK 准确率99.98%
function pngRgbTojpgCmyk($fileName,$outFile,$rgbIccPath,$cmykIccPath){

    $img = new Imagick();
    $img->readImage($fileName);
    $img = Image::make($img);
    $img->opacity(100);
    $img_core = $img->getCore();
    $img_core->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
    $img_core->setImageResolution(300,300);
    $iccFile =file_get_contents($rgbIccPath);
    $img_core->profileImage('icc', $iccFile);
    $img_core->transformimagecolorspace(\Imagick::COLORSPACE_SRGB);
    $img->save($outFile,100,'jpg');

    $img2 = new Imagick();
    $img2->readImage($outFile);
    $img2 = Image::make($img2);
    $img2->opacity(100);
    $img2_core = $img2->getCore();
    $img2_core->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
    $img2_core->setImageResolution(300,300);
    $iccFile =file_get_contents($cmykIccPath);
    $img2_core->profileImage('icc', $iccFile);
    $img2_core->transformimagecolorspace(\Imagick::COLORSPACE_CMYK);
    $img2->save($outFile,100,'jpg');

}

//遮罩获取（透明区域黑白二值图）黑色不显示，白色穿透显示
function getImageMask($fileName,$outFile){

    $img = new Imagick();
    $img->readImage($fileName);
    $img->setImageAlphaChannel(Imagick::ALPHACHANNEL_EXTRACT);
    $img->setImageFormat('png');
    $img->writeImage($outFile);

}

//遍历遮罩图像素 黑到白：0.0 ~ 1.0 , 透明到不透明：0.0 ~ 1.0
function getPixColor($fileName){
    $imageColor=[];
    $image = new Imagick($fileName); 
    $pixel_iterator = $image->getPixelIterator(); 
    foreach($pixel_iterator as $y => $pixels) 
    { 
        $imageColor[$y]=[];
        foreach($pixels as $x => $pixel) 
        { 
          $color = $pixel->getColor(true); 
          $imageColor[$y][$x]=$color;
        } 
    } 
    return $imageColor;
}


//更改透明像素加减深颜色
function resetPixColor($fileName,$outFile,$pixColor,$upValue){

    $img = new Imagick($fileName); 
    $pixel_iterator = $img->getPixelIterator(); 
    foreach($pixel_iterator as $y => $pixels) 
    { 

        foreach($pixels as $x => $pixel) 
        { 

            if ($pixColor[$y][$x]['a']>0 and $pixColor[$y][$x]['a']<1){

                $color = $pixel->getColor(true); 
                $color['r']=$color['r'] * $upValue * 255;
                $color['g']=$color['g'] * $upValue * 255;
                $color['b']=$color['b'] * $upValue * 255;
                $pixel->setColor("rgb(".$color['r'].",".$color['g'].",".$color['b'].")");

            }
           
        } 
        $pixel_iterator->syncIterator(); 
    } 
    $img->setImageFormat('png');
    $img->writeImage($outFile);

}

//图片反相 用于CMYK图片在AI中显示（AI中TCPDF输出的CMYK图片会反相反色）
function invertImage($fileName,$outFile){

    $img = new Imagick();
    $img->readImage($fileName);
    $img = Image::make($img);
    $img->invert();//反相
    $img->save($outFile,100,'jpg');
}

function jpgCmykToPngRgb($fileName,$outFile,$iccPath){

    $img = new Imagick();
    $img->readImage($fileName);
    $img = Image::make($img);
    $img->opacity(100);
    $img_core = $img->getCore();
    $img_core->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
    $img_core->setImageResolution(300,300);
    $iccFile =file_get_contents($iccPath);
    $img_core->profileImage('icc', $iccFile);
    $img_core->transformimagecolorspace(\Imagick::COLORSPACE_SRGB);
    $img->save($outFile,100,'png');
}




exit;*/



//获取API Toktn
$token = $_COOKIE["makroDigital_token"];
if ($token == "" or $token == "undefined" or strlen($token) < 50) {
    echo "<br><br><p>Invalid request 7001</p>";
    exit;
}

// mmCode不能为空
if (empty($mmCode)) {
    echo "<br><br><p>Invalid request 7002</p>";
    exit;
}
$mmUrl = $apiUrl["mmDetailsUrl"] . $mmCode;

// 设置最大内存
ini_set('memory_limit', '512M');

$result = getMarkeingApi($mmUrl, $token);
$result = json_decode($result);

//模板列表
$templatePages = [];
$pageData = null;

if ($result->code != "0000") {
    echo "<br><br><p>Invalid request 7003</p>";
    exit;
} else {

    //一版多页配置
    $pageConfigs = $result->data->pageConfigs;
    //一版多页设计排版方式
    $pageOption = $result->data->pageOption;

    //MM活动文档信息
    $docInfo = array(
        "title" => $result->data->mmInfo->title,
        //标题
        "subtitle" => $result->data->gmtModified,
        //副标题
        "keywords" => "Makro Digital",
        //关键词
        "author" => "Makro " . $result->data->lastUpdater,
        //作者
    );
    $mmInfo = json_decode(json_encode($docInfo));

    //页面尺寸、出血线、纸张等信息
    $unitInch = $result->data->unitInch * 1;
    $configDpi = $result->data->configDpi * 1;

    $configW = $result->data->configW * 1;
    $configH = $result->data->configH * 1;
    $bleedLineIn = $result->data->bleedLineIn * 1;
    $bleedLineOut = $result->data->bleedLineOut * 1;
    $bleedLineTop = $result->data->bleedLineTop * 1;
    $bleedLineBottom = $result->data->bleedLineBottom * 1;

    $marginIn = $result->data->marginIn * 1;
    $marginOut = $result->data->marginOut * 1;
    $marginTop = $result->data->marginTop * 1;
    $marginBottom = $result->data->marginBottom * 1;
    $marginsW = ($configW - $marginIn - $marginOut);
    $marginsH = ($configH - $marginTop - $marginBottom);
    $previewMode = false;

    //缩放尺寸
    $scaleValue = get_url_pathname($url, -3);
    if ($scaleValue == "OS") {
        $scalePi = 1;
    } else if ($scaleValue == "Preview") {
        $previewMode = true;
        $scalePi = 1;
    } else {
        $valArr = explode("_", $scaleValue);
        $resetWidth = $valArr[0] * 1;
        $resetHeight = $valArr[1] * 1;

        $scalePi = $resetWidth / intval(($configW + $bleedLineIn + $bleedLineOut) / $unitInch * $configDpi);
        $scalePi = round($scalePi, 4);
    }

    // 原先px OK版本
    // $sizeData = array(
    //     "bleed" => array(
    //         "left" => 0, "top" => 0,
    //         "width" => intval(($configW + $bleedLineIn + $bleedLineOut) / $unitInch * $configDpi),
    //         "height" => intval(($configH + $bleedLineTop + $bleedLineBottom) / $unitInch * $configDpi),
    //     ),
    //     "paper" => array(
    //         "left" => intval($bleedLineIn / $unitInch * $configDpi), "top" => ceil($bleedLineTop / $unitInch * $configDpi),
    //         "width" => intval($configW / $unitInch * $configDpi),
    //         "height" => intval($configH / $unitInch * $configDpi),
    //     ),
    //     "margins" => array(
    //         "left" => intval(($bleedLineIn + $marginIn) / $unitInch * $configDpi), "top" => ceil(($bleedLineTop + $marginTop) / $unitInch * $configDpi),
    //         "width" => intval($marginsW / $unitInch * $configDpi),
    //         "height" => intval($marginsH / $unitInch * $configDpi),
    //     ),
    // );

    //新unit dpi configW configH 设计稿PX转换算法
    $sizeData = array(
        "bleed" => array(
            "left" => 0, "top" => 0,
            "width" => ($configW + $bleedLineIn + $bleedLineOut),
            "height" => ($configH + $bleedLineTop + $bleedLineBottom),
        ),
        "paper" => array(
            "left" => ($bleedLineIn), "top" => ceil($bleedLineTop),
            "width" => ($configW),
            "height" => ($configH),
        ),
        "margins" => array(
            "left" => ($bleedLineIn + $marginIn), "top" => ($bleedLineTop + $marginTop),
            "width" => ($marginsW),
            "height" => ($marginsH),
        ),
    );

    $pageSize = json_decode(json_encode($sizeData));

    //模板页代码集
    $templatePagesCode = [];
    $templateList = $result->data->templatePageList;
    for ($i = 0; $i < count($templateList); $i++) {
        $tmpPage = $templateList[$i];
        if ($tmpPage->isValid * 1 == 1) {

            $duplicate = $tmpPage->content->duplicate;
            //取有效副本主版
            foreach ($duplicate as $row) {

                if ($row->isValid * 1 == 0) {

                    // array_push($templatePagesCode, $row);
                    $templatePagesCode[$tmpPage->sort * 1 - 1] = $row;

                }
            }

        }
    }

    //MM商品数据
    $mmProdData = [];
    $mmDetailsUrl = $apiUrl["getProductUrl"] . $mmCode;
    $result = getMarkeingApi($mmDetailsUrl, $token);
    $result = json_decode($result);
    if ($result->code == "0000") {

        $mmDetailsData = $result->data->records;
        //json对象转数组
        foreach ($mmDetailsData as $row) {
            $mmProdData["_" . $row->info->page . "_" . $row->info->sort] = $row;
        }

    }

    //获取字体列表信息
    $fontData = [];
    $fontsUrl = $apiUrl["getFontUrl"];
    $requestParma = array(
        "page" => 1,
        "limit" => 1000,
        "req" => array(
            "status" => "1",
            "name" => "",
        ),
        "sortItems" => array(
            array("column" => "name", "asc" => true),
        ),
    );

    $result = getMarkeingApi($fontsUrl, $token, "POST", json_encode($requestParma));
    $result = json_decode($result);
    if ($result->code == "0000") {

        $resultData = $result->data->records;
        //json对象转数组
        foreach ($resultData as $row) {

            $tmpFontName = strtolower($row->name);
            $tmpFontName = trimall($tmpFontName);

            //常规字体
            if ($row->path != "") {
                $tmpNameArr = explode("/", $row->path);
                $sourceFontName = $tmpNameArr[count($tmpNameArr) - 1];
                $sourceFontName = str_replace(".", "_", $sourceFontName);
                $cvFontName = $tmpFontName . "_vf_" . $sourceFontName . ".log";
                $fontData[$tmpFontName] = array(
                    "vf" => $cvFontName,
                    "sourceUrl" => $row->path,
                    "name" => $tmpFontName,
                );
            } else {
                $fontData[$tmpFontName] = "";
            }

            //粗体
            if ($row->boldPath != "") {
                $tmpNameArr = explode("/", $row->boldPath);
                $sourceFontName = $tmpNameArr[count($tmpNameArr) - 1];
                $sourceFontName = str_replace(".", "_", $sourceFontName);
                $cvFontName = $tmpFontName . "-b_vf_" . $sourceFontName . ".log";
                $fontData[$tmpFontName . "-b"] = array(
                    "vf" => $cvFontName,
                    "sourceUrl" => $row->boldPath,
                    "name" => $tmpFontName . "-b",
                );
            } else {
                $fontData[$tmpFontName . "-b"] = "";
            }

            //斜体
            if ($row->italicsPath != "") {
                $tmpNameArr = explode("/", $row->italicsPath);
                $sourceFontName = $tmpNameArr[count($tmpNameArr) - 1];
                $sourceFontName = str_replace(".", "_", $sourceFontName);
                $cvFontName = $tmpFontName . "-i_vf_" . $sourceFontName . ".log";
                $fontData[$tmpFontName . "-i"] = array(
                    "vf" => $cvFontName,
                    "sourceUrl" => $row->italicsPath,
                    "name" => $tmpFontName . "-i",
                );

            } else {
                $fontData[$tmpFontName . "-i"] = "";
            }

            //粗斜体
            if ($row->boldItalicsPath != "") {
                $tmpNameArr = explode("/", $row->boldItalicsPath);
                $sourceFontName = $tmpNameArr[count($tmpNameArr) - 1];
                $sourceFontName = str_replace(".", "_", $sourceFontName);
                $cvFontName = $tmpFontName . "-bi_vf_" . $sourceFontName . ".log";
                $fontData[$tmpFontName . "-bi"] = array(
                    "vf" => $cvFontName,
                    "sourceUrl" => $row->boldItalicsPath,
                    "name" => $tmpFontName . "-bi",
                );

            } else {
                $fontData[$tmpFontName . "-bi"] = "";
            }

        }

    }

/*
    //引入 Image图片处理类
    require __DIR__ . '/../../../vendor/autoload.php';
    use Intervention\Image\ImageManager;
    use Intervention\Image\ImageManagerStatic as Image;
    Image::configure(['driver' => 'imagick']);*/

    //引入TCPDF
    require_once __DIR__ . '/tcpdf/examples/tcpdf_include.php';
    require_once __DIR__ . '/tcpdf/tcpdf.php';
    require_once __DIR__ . '/tcpdf/include/tcpdf_fonts.php';
    require_once __DIR__ . '/tcpdf/include/tcpdf_static.php';
    include __DIR__ . "/include/tcpdfApi.class.php";

    //--------------------------------------------------------------------------

    /**
     * 创建 MM PDF 流程
     * ->创建 PDFDOC
     * ->初始化数据
     * ->读取分析模板页面数据
     * ->搜索商品组件信息匹配替换更新
     * ->新建pdf页面并渲染数据
     *   模板单页组件折分及zIndex排序
     * ->保存pdf文件
     * ->上传pdf文件
     * ->返回pdf文件路径信息
     */

    //生成pdf模式，P打印模式 绘制出血线，E电子板模式 不绘制出血线
    $drawMode = "P";

    $bleedStrokeColor = array(10, 97, 100, 0);
    $bleedFillColor = null;

    $unitToMM = 1;
    switch ($unitInch) {
        case 1:
            $docUnit = "in";
            $unitToMM = 25.4;
            break;
        case 2.54:
            $docUnit = "cm";
            $unitToMM = 10;
            break;
        case 25.4:
            $docUnit = "mm";
            $unitToMM = 1;
            break;
        case 72:
            $docUnit = "pt";
            $unitToMM = 0.3528;
            break;
    }

    $docUnit = "mm";
    $unitInch = 25.4;
    //$scalePi =$scalePi * $unitToMM;
    $parma = array(
        "title" => $mmInfo->title,
        "subtitle" => $mmInfo->subtitle,
        "keywords" => $mmInfo->keywords,
        "width" => round($pageSize->bleed->width * $scalePi * $unitToMM),
        "height" => round($pageSize->bleed->height * $scalePi * $unitToMM),
        "unitInch" => $unitInch,
        "unit" => $docUnit,
        "DPI" => 300,
        "scalePi" => $scalePi,
        "paperBleed" => array(
            "draw" => $drawMode,
            "width" => round($scalePi * $pageSize->bleed->width * $unitToMM),
            "height" => round($scalePi * $pageSize->bleed->height * $unitToMM),
            "left" => 0, "top" => 0,
            "strokeWeight" => 2,
            "strokeColor" => $bleedStrokeColor,
            "fillColor" => $bleedFillColor,
        ),
        "paperBox" => array(
            "draw" => $drawMode,
            "width" => round($scalePi * $pageSize->paper->width * $unitToMM),
            "height" => round($scalePi * $pageSize->paper->height * $unitToMM),
            "left" => round($scalePi * $pageSize->paper->left),
            "top" => round($scalePi * $pageSize->paper->top),
        ),
        "templatePagesCode" => $templatePagesCode,
        "mmProdData" => $mmProdData,
        "fontPath" => $apiUrl["fontPath"],
        "fontData" => $fontData,
        "previewMode" => $previewMode,
    );

    //一版多页配置
    $parma["pageOption"] = $pageOption;
    // exit;

    //检查保存路径是否存在
    $savePath = $_SERVER["DOCUMENT_ROOT"] . "/pdf/export";
    if (!is_dir($savePath)) {
        mkdir($savePath, 0777);
    }

    //保存模式
    $saveMode = get_url_pathname($url, -2);

    $parma["colorMode"]="rgb";

    if ($saveMode == "I") {
        //创建 PDFDOC
        $Doc = new pdfApi($parma);
        //读取分析模板页面数据
        $Doc->readTemplatePages();
        //遍历分析组件信息匹配替换更新
        $Doc->readPageObject();
        //新建pdf页面并渲染数据
        $Doc->createRender();
        $fileName = "Makro_Mall_" . $docInfo["title"] . "-I.pdf";
        $sParma = array("savePath" => $fileName, "mode" => "I");
        $Doc->savePdf($sParma);

    } else if ($saveMode == "F") {
        //创建 PDFDOC
        $Doc = new pdfApi($parma);
        //读取分析模板页面数据
        $Doc->readTemplatePages();
        //遍历分析组件信息匹配替换更新
        $Doc->readPageObject();
        //新建pdf页面并渲染数据
        $Doc->createRender();
        $fileName = "Makro_Mall_" . $docInfo["title"] . "-F.pdf";
        $sParma = array("savePath" => $savePath . "/" . $fileName, "mode" => "F");
        $Doc->savePdf($sParma);

        echo json_encode(array("code" => "0000", "downPath" => "/pdf/export/" . $fileName));
    } else if ($saveMode == "FD") {
        //创建 PDFDOC
        $Doc = new pdfApi($parma);
        //读取分析模板页面数据
        $Doc->readTemplatePages();
        //遍历分析组件信息匹配替换更新
        $Doc->readPageObject();
        //新建pdf页面并渲染数据
        $Doc->createRender();
        $fileName = "Makro_Mall_" . $docInfo["title"] . "-FD.pdf";
        $sParma = array("savePath" => $savePath . "/" . $fileName, "mode" => "FD");
        $Doc->savePdf($sParma);

    } else if ($saveMode == "FP") {
        //创建 PDFDOC
        $Doc = new pdfApi($parma);
        //读取分析模板页面数据
        $Doc->readTemplatePages();
        //遍历分析组件信息匹配替换更新
        $Doc->readPageObject();
        //新建pdf页面并渲染数据
        $Doc->createRender();
        $fileName = "Makro_Mall_" . $docInfo["title"] . "-FP.pdf";
        $sParma = array("savePath" => $savePath . "/" . $fileName, "mode" => "F");
        $Doc->savePdf($sParma);

        echo json_encode(array("code" => "0000", "downPath" => "/pdf/export/" . $fileName, "fonts" => $Doc->getFonts()));
    } else if ($saveMode == "FSP") {
        //分页生成PDF
        $splitFiles = [];
        $fonts = [];
        foreach ($templatePagesCode as $pageIndex => $templatePage) {
            $pageParam = $parma;
            $pageParam['templatePagesCode'] = [];
            $pageParam['templatePagesCode'][] = $templatePage;

            $pageParam["colorMode"]="cmyk";

            //创建 PDFDOC
            $Doc = new pdfApi($pageParam);
            //读取分析模板页面数据
            $Doc->readTemplatePages();
            //遍历分析组件信息匹配替换更新
            $Doc->readPageObject();
            //新建pdf页面并渲染数据
            $Doc->createRender();
            $page = $pageIndex + 1;
            $fileName = "Makro_Mall_" . $docInfo["title"] . "-FSP-" . $page . ".pdf";
            $sParma = array("savePath" => $savePath . "/" . $fileName, "mode" => "F");
            $Doc->savePdf($sParma);
            $splitFiles[$page] = "/pdf/export/" . $fileName;
            $fonts = array_merge($fonts, $Doc->getFonts());
            //释放内存
            unset($Doc);
        }

        echo json_encode(array("code" => "0000", "downPaths" => $splitFiles, "fonts" => $fonts));
    }
    // 记录使用的内存
    $info = [];
    $info[] = 'Memory usage: ' . round(memory_get_usage() / 1024 / 1024, 2) . 'MB';
    $info[] = 'Memory peak usage: ' . round(memory_get_peak_usage() / 1024 / 1024, 2) . 'MB';
    \think\facade\Log::write('create PDF finish. ' . implode(', ', $info));
}

exit;

//请求API
function getMarkeingApi($url, $token, $reqMode = "GET", $data = null)
{

    $curl = curl_init();
    $reqMode = strtoupper($reqMode);
    $options = array(
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => $reqMode,
        CURLOPT_HTTPHEADER => array(
            'Authorization:Bearer ' . $token,
        ),
    );
    if ($reqMode == 'POST') {
        $options[CURLOPT_POSTFIELDS] = $data;
        $options[CURLOPT_HTTPHEADER][] = 'Content-Type: application/json';
    }
    curl_setopt_array($curl, $options);

    $response = curl_exec($curl);
    curl_close($curl);
    return $response;
}

//删除空格
function trimall($str)
{
    $oldchar = array(" ", "　", "\t", "\n", "\r");
    $newchar = array("", "", "", "", "");
    return str_replace($oldchar, $newchar, $str);
}
