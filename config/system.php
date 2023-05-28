<?php
// +----------------------------------------------------------------------
// | 系统环境配置
// +----------------------------------------------------------------------

return [
    // API配置
    'api' => [
        // API地址
        'host'           => env('api.host', ''),
        // 是否处于同一内网，如果为true，将通过内网IP请求API接口
        'intranet_same'  => env('api.intranet_same', false),
    ],
    // 存储配置
    'storage' => [
        // 文件访问地址
        'host'           => env('storage.host', ''),
        // 文件内网访问地址
        'intranet_host'  => env('storage.intranet_host', ''),
    ],
    // Line接口配置
    'line' => [
        // Line Liff ID
        'liff_id'        => env('line.liff_id', ''),
    ],
];
