<?php

use think\facade\Request;

// 定义字体文件文件夹所在位置
define('TCPDF_RAWFONT_PATH', app()->getRootPath() . '/public/pdf/static/font');

function system_url()
{
    $host = Request::host();
    return [
        "mmDetailsUrl" => API_HOST . "/makro-template/api/v1/template/mm/",
        "getProductUrl" => API_HOST . "/makro-product/api/v1/product/data?page=1&limit=5000&isvalid=1&mmCode=",
        "getFontUrl" => API_HOST . "/makro-file/api/v1/fonts/page",
        "fontPath" => "http://" . $host . "/pdf/static/font/",
    ];
}

/**
 * 生成商品链接
 * @author siliang
 * @Date   2023-04-11
 * @param  string     $itemCode   商品编码
 * @param  string     $productId  productId
 * @param  string     $type       类型：支持web、app
 * @return string
 */
function product_url($itemCode, $productId, $type = 'web')
{
    $query = [
        'itemCode' => $itemCode,
        'productId' => $productId,
    ];
    return API_HOST . '/goto/product/' . $type . '?' . http_build_query($query);
}

$apiUrl = system_url();
