<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2019 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: liu21st <liu21st@gmail.com>
// +----------------------------------------------------------------------

// [ 应用入口文件 ]
namespace think;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../env.php';

$app = new App();
// 当前环境，获取不到时会采用默认的.env配置
define('ENV_NAME', getEnvName($app));

// 执行HTTP应用并响应
$http = $app->setEnvName(ENV_NAME)->http;

$response = $http->run();

$response->send();

$http->end($response);
