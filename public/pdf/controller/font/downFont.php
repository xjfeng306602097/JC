<?php

require $_SERVER['DOCUMENT_ROOT'] . "/pdf/controller/include/filter.php";
require $_SERVER['DOCUMENT_ROOT'] . "/pdf/controller/include/function.php";

//引入TCPDF
require_once $_SERVER['DOCUMENT_ROOT'] . '/../app/libraries/pdf/tcpdf/tcpdf.php';

// 定义字体文件文件夹所在位置
define('TCPDF_RAWFONT_PATH', realpath(dirname(__FILE__) . '/../../static/font/') . '/');

$filterObj = new filter();
$getFilter = $filterObj->check_input($_GET);
$inputFilter = $filterObj->check_input($_POST);

$fontName = $_POST["fontName"];
$fontName = strtolower($fontName);
$fontName = trimall($fontName);

//字体常规样式
$regularPath = $_POST["regularPath"];
$regularStatus = null;
if ($regularPath != "") {
    $pathArr = explode(".", $regularPath);
    // $regularFileName = $fontName . "." . $pathArr[count($pathArr) - 1];
    $regularStatus = downToSaveFont($fontName, $pathArr[count($pathArr) - 1], $regularPath);
}

//字体加粗模式
$boldPath = $_POST["boldPath"];
$boldStatus = null;
if ($boldPath != "") {
    $pathArr = explode(".", $boldPath);
    $boldStatus = downToSaveFont($fontName . "-b", $pathArr[count($pathArr) - 1], $boldPath);
}

//字体斜体模式
$italicsPath = $_POST["italicsPath"];
$italicsStatus = null;
if ($italicsPath != "") {
    $pathArr = explode(".", $italicsPath);
    $italicsStatus = downToSaveFont($fontName . "-i", $pathArr[count($pathArr) - 1], $italicsPath);
}

//字体斜体加粗模式
$boldItalicsPath = $_POST["boldItalicsPath"];
$boldItalicsStatus = null;
if ($boldItalicsPath != "") {
    $pathArr = explode(".", $boldItalicsPath);
    $boldItalicsStatus = downToSaveFont($fontName . "-bi", $pathArr[count($pathArr) - 1], $boldItalicsPath);
}

//下载保存字体
function downToSaveFont($fontName, $extName, $fontPath)
{
    //字体文件路径
    $fontFile = TCPDF_RAWFONT_PATH . $fontName . "." . $extName;
    //原字体文件，删除原有的
    if (file_exists($fontFile)) {
        unlink($fontFile);
    }
    //删除原有转换后的字体文件 .php .z ctg.z
    if (file_exists(K_PATH_FONTS . $fontName . ".php")) {
        unlink(K_PATH_FONTS . $fontName . ".php");
    }
    if (file_exists(K_PATH_FONTS . $fontName . ".z")) {
        unlink(K_PATH_FONTS . $fontName . ".z");
    }
    if (file_exists(K_PATH_FONTS . $fontName . ".ctg.z")) {
        unlink(K_PATH_FONTS . $fontName . ".ctg.z");
    }

    $fileName = $fontName . "." . $extName;
    $result = downFile($fontPath, TCPDF_RAWFONT_PATH, $fileName, 1);
    if (!empty($result['file_name'])) {
        /*
        //将该字体加入到TCPDF的字体转换队列中
        // $jsonFile = TCPDF_RAWFONT_PATH . 'fonts.json';
        // $array = array();
        // if (file_exists($jsonFile)) {
        //     $json = @file_get_contents($jsonFile);
        //     $array = json_decode($json, true);
        //     if (empty($array) || !is_array($array)) {
        //         $array = array();
        //     }
        // }
        // // 添加字体
        // $array[$fontName] = [
        //     'fonts' => $result['save_path'],
        // ];
        // $json = json_encode($array);
        // file_put_contents($jsonFile, $json);
        */
        //字体转换
        // $newFont = TCPDF_FONTS::addTTFfont($fontFile, '', '', 32,TCPDF_RAWFONT_PATH);
        $newFont = TCPDF_FONTS::addTTFfont($fontFile, 'TrueTypeUnicode', '', 96,TCPDF_RAWFONT_PATH);
        if ($newFont === false) {
            wLog("createfont.log",date("Y-m-d H:i:s") . " " . $fontFile . " => err");
            return false;
        } else {
            wLog("createfont.log",date("Y-m-d H:i:s") . " " . $fontFile . "=> " . TCPDF_RAWFONT_PATH . " => " . $newFont);
            
            
            /* 多节点 字体不同步处理 */
            //生成 字体转换最新识别 文件 字体名样式名_vf_字体源文件.log
            $tmpNameArr=explode("/",$fontPath);
            $sourceFontName=$tmpNameArr[count($tmpNameArr)-1];
            $sourceFontName=str_replace(".","_",$sourceFontName);
            $cvFontName=$fontName . "_vf_" . $sourceFontName . ".log";
            if (!file_exists(TCPDF_RAWFONT_PATH . "vflog/" . $cvFontName)) {
                
                //删除该字体样式原有vf文件
                
                
                //写入新vf文件
                file_put_contents(TCPDF_RAWFONT_PATH . "vflog/". $cvFontName,time(), FILE_APPEND|LOCK_EX);
            }
            
            
            return true;
        }
    } else {
        return false;
    }

}

header('Content-Type:application/json');
echo json_encode([
    'code' => '0000',
    'msg' => 'success',
    'status' => [
        'regular' => $regularStatus,
        'bold' => $boldStatus,
        'italics' => $italicsStatus,
        'boldItalics' => $boldItalicsStatus,
    ],
]);
exit;
