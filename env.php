<?php

use think\facade\Request;

/**
 * 获取当前环境名称
 * @author siliang
 * @Date   2022-02-25
 * @param  \think\App   $app App对象
 * @return string
 */
function getEnvName($app)
{
    $cacheFile = $app->getRootPath() . 'envCache.php';
    $systemKey = getSystemKey();
    if (file_exists($cacheFile)) {
        // 从缓存中获取环境名
        $cache = (include $cacheFile);
        if (!empty($cache) && !empty($cache['systemKey']) && $cache['systemKey'] == $systemKey) {
            return $cache['env'] ?? '';
        }
    }
    // 请求的host
    $requestHost = Request::host();
    // 对应环境，空为本地环境
    $envName = '';
    // 获取所有环境
    $envConfig = getEnvConfig();
    foreach ($envConfig as $env => $host) {
        if (is_array($host) && in_array($requestHost, $host)) {
            $envName = $env;
            break;
        } else if (is_string($host) && $requestHost == $host) {
            $envName = $env;
            break;
        }
    }
    if (!empty($envName)) {
        // 将当前环境缓存
        writeConfig($cacheFile, [
            'env' => $envName,
            'systemKey' => $systemKey,
        ]);
    }
    return $envName;
}

/**
 * 环境配置函数
 * 返回各种环境配置，以及对应访问的host
 * 提示：环境名称应统一为英文小写，并且与.env文件的对应（如：uat环境对应.env.uat文件）
 * @author siliang
 * @Date   2022-02-25
 * @return array
 */
function getEnvConfig()
{
    return [
        'dev' => 'dev-mail.makrogo.com',
        'test' => 'test-mail.makrogo.com',
        'uat' => 'uat-jc.makromail.atmakro.com',
        'prd' => 'jc.makromail.atmakro.com',
    ];
}

/**
 * 系统统一密钥，请勿公开（修改将更新服务器的环境缓存envCache.php文件）
 * @author siliang
 * @Date   2022-05-27
 * @return string
 */
function getSystemKey()
{
    return 'izpjM6ahxZ8tbKrTrW5scWnpfZdw8BTBNG7kMaMwpPAibERcayb5NJF3DdZ4XaS6';
}

/**
 * 写入配置数据
 * @author siliang
 * @Date   2022-05-27
 * @param  string     $file 配置文件地址
 * @param  mixed      $data 配置数据
 * @return bool
 */
function writeConfig($file, $data = [])
{
    $content = "<?php\r\nreturn " . var_export($data, true) . ";";
    return file_put_contents($file, $content, LOCK_EX);
}
