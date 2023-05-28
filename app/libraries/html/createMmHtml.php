<?php
require "htmlApi.class.php";
require __DIR__ . "/../config.php";

/** 预览H5,用于在线实时预览H5 **/

//获取API Toktn
$token = $_COOKIE["makroDigital_token"];
if ($token == "" or $token == "undefined" or strlen($token) < 50) {
    //header("Content-Type: text/html;charset=utf-8");
    //echo "<br><br><p>Invalid request 7001</p>";
    echo json_encode(array("code" => "9999", "path" => "", "previewUrl" => "", "msg" => "Invalid request 7001"));
    exit;
}

$previewUrl = "";

// mmCode不能为空
if (empty($mmCode)) {
    echo json_encode(array("code" => "9999", "path" => "", "previewUrl" => "", "msg" => "Invalid request 7002"));
    exit;
}
$mmUrl = $apiUrl["mmDetailsUrl"] . $mmCode;

$result = getMarkeingApi($mmUrl, $token);
$result = json_decode($result);

//模板列表
$templatePages = [];
$pageData = null;

if ($result->code != "0000") {
    echo json_encode(array("code" => "9999", "path" => "", "previewUrl" => "", "msg" => "Invalid request 7003"));
    exit;
} else {

    //一版多页配置
    $pageConfigs = $result->data->pageConfigs;
    //一版多页设计排版方式
    $pageOption = $result->data->pageOption;

    //缩略图
    $previewUrl = $result->data->previewPath;

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

    //新unit dpi configW configH 设计稿PX转换算法
    $pageSize = array(
        "bleed" => array(
            "left" => 0, "top" => 0,
            "width" => ($configW + $bleedLineIn + $bleedLineOut) * 72 / $unitInch,
            "height" => ($configH + $bleedLineTop + $bleedLineBottom) * 72 / $unitInch,

            "bleedLineTop" => ($bleedLineTop) * 72 / $unitInch,
            "bleedLineBottom" => ($bleedLineBottom) * 72 / $unitInch,
            "bleedLineIn" => ($bleedLineIn) * 72 / $unitInch,
            "bleedLineOut" => ($bleedLineOut) * 72 / $unitInch,
        ),
        "paper" => array(
            "left" => ($bleedLineIn), "top" => ceil($bleedLineTop) * 72 / $unitInch,
            "width" => ($configW) * 72 / $unitInch,
            "height" => ($configH) * 72 / $unitInch,
        ),
        "margins" => array(
            "left" => ($bleedLineIn + $marginIn) * 72 / $unitInch, "top" => ($bleedLineTop + $marginTop) * 72 / $unitInch,
            "width" => ($marginsW) * 72 / $unitInch,
            "height" => ($marginsH) * 72 / $unitInch,
        ),
    );

    //模板页处理
    $pageArr = [];
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

                    $pageBackColor = "";
                    $tmp = array("pageWidth" => $row->width, "pageHeight" => $row->height, "pageBackColor" => "#FFF", "pageBackGroup" => $row->previewUrl, "Object" => $row->objects, 'sort' => $tmpPage->sort);
                    // array_push($pageArr,$tmp);

                    $pageArr[$tmpPage->sort * 1 - 1] = $tmp;

                }
            }

        }
    }

    //APP时使用appTitle
    $title = $is_app ? $result->data->mmInfo->appTitle : $result->data->mmInfo->title;
    //初始化参数
    $parma = [];
    $parma["pageTitle"] = $title;
    $parma["pageWidth"] = $pageSize["bleed"]["width"];
    $parma["pageHeight"] = $pageSize["bleed"]["height"];

    $parma["bleedLineIn"] = $pageSize["bleed"]["bleedLineIn"];
    $parma["bleedLineOut"] = $pageSize["bleed"]["bleedLineOut"];
    $parma["bleedLineTop"] = $pageSize["bleed"]["bleedLineTop"];
    $parma["bleedLineBottom"] = $pageSize["bleed"]["bleedLineBottom"];

    $parma["mmCode"] = $mmCode;
    $parma["savePath"] = "/html/" . $mmCode . "/";
    $parma["pageGoods"] = [];

    //获取最大一版N页数量
    $parma["pageOption"] = $pageOption;

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

    $parma["pageGoods"] = $mmProdData;

    //检查保存路径是否存在
    $savePath = $_SERVER['DOCUMENT_ROOT'] . '/html/' . $mmCode;
    if (!is_dir($savePath)) {
        mkdir($savePath, 0777);
    }

    $parma["fontPath"] = $apiUrl["fontPath"];

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

        $parma["fontData"] = $fontData;

    } else {
        //echo "font loading fail";exit;
        echo json_encode(array("code" => "9999", "path" => "", "previewUrl" => "", "msg" => "font loading fail 7004"));
        exit;
    }

    $H5 = new HtmlApi();
    $H5->format($parma);
    $H5->createHead();

    $pageNum = 1;
    $pageCount = count($pageArr);
    for ($i = 0; $i < $pageCount; $i++) {
        $row = $pageArr[$i];

        $H5->pagesData[($pageNum - 1)] = array("thumbSrc" => $row["pageBackGroup"], "bigSrc" => str_replace("_thumb", "", $row["pageBackGroup"]), "map" => "page_" . $i . "_Link");

        $pageParm = array("pageBackColor" => $row["pageBackColor"], "pageBackGroup" => $row["pageBackGroup"]);
        $pageObject = $row["Object"];
        $H5->newPage_Start($pageParm);
        $H5->createMap($pageObject, $pageNum - 1);
        $H5->newPage_End();
        if ($pageNum < $pageCount) {
            $H5->pageSpace();
            $pageNum++;
        }

    }

    $H5->createFooter();
    $htmlName = $is_app ? 'app' : 'index';
    $htmlPath = $H5->savecreateFile($htmlName);
    //header("Content-Type:text/json;charset=utf-8");
    echo json_encode(array("code" => "0000", "path" => "public/html/" . $mmCode . "/" . $htmlName . ".html", "previewUrl" => $previewUrl, "msg" => "Success"));
    exit;

}

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
