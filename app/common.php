<?php
// 应用公共文件

/**
 * 判断是否为合法的json字符串
 * @author siliang
 * @Date   2021-06-30
 * @param  string     $json json字符串
 * @return boolean
 */
function is_json(string $json)
{
    json_decode($json);
    return (json_last_error() == JSON_ERROR_NONE);
}

/**
 * 获取当前毫秒级时间
 * @author siliang
 * @Date   2021-07-01
 * @param  boolean         $is_second 是否返回秒级时间
 * @param  float|null      $microtime microtime时间
 * @return string
 */
function millitime(bool $is_second = false, $microtime = null)
{
    if (is_null($microtime)) {
        $microtime = microtime(true);
    }
    return number_format($microtime, 3, ($is_second ? '.' : ''), '');
}

/**
 * 将数字字符串转为标准数字类型(int/float)
 * @author siliang
 * @Date   2021-07-02
 * @param  string         $string     数字/数字字符串
 * @param  boolean|int    $precision  传入整数，则对浮点型数字进行四舍五入，否则不进行四舍五入
 * @return int|float
 */
function number($string, $precision = true)
{
    if ($string == '') {
        $string = 0;
    }
    $string = (string) $string;
    if (!is_numeric($string)) {
        throw new \Exception('无法处理非数字字符串');
    }
    $array = explode('.', $string);
    $number = ltrim($array[0]);
    if (count($array) > 1) {
        $decimal = rtrim($array[1], '0');
        if (!empty($decimal)) {
            $number .= '.' . $decimal;
        }
    }
    if ($number == '') {
        $number = 0;
    }
    $number = $number + 0;
    if (is_float($number) && is_int($precision)) {
        return number_format($number, $precision, '.', '') + 0;
    }
    return $number;
}

/**
 * 检测变量是否是数字类型(int/float)
 * @author siliang
 * @Date   2021-07-02
 * @param  mixed          $var        检测的变量
 * @return boolean
 */
function is_number($var)
{
    if (is_int($var) || is_float($var)) {
        return true;
    }
    return false;
}

/**
 * 获取url中的host
 * @author siliang
 * @Date   2021-07-16
 * @param  string     $url         url
 * @param  boolean    $enable_port 是否返回端口
 * @return string
 */
function host($url, $enable_port = true)
{
    $host = parse_url($url, PHP_URL_HOST);
    if ($enable_port) {
        $port = parse_url($url, PHP_URL_PORT);
        if (!is_null($port) && !in_array($port, [80, 443])) {
            return $host . ':' . $port;
        }
    }
    return $host;
}

/**
 * str_replace的once版本，只替换一次
 * @author siliang
 * @Date   2021-07-28
 * @param  string     $needle   规定要查找的值
 * @param  string     $replace  规定替换 find 中的值的值
 * @param  string     $haystack 规定被搜索的字符串
 * @return string
 */
function str_replace_once($needle, $replace, $haystack)
{
    $pos = strpos($haystack, $needle);
    if ($pos === false) {
        return $haystack;
    }
    return substr_replace($haystack, $replace, $pos, strlen($needle));
}

/**
 * 获取解析时间的时间戳
 * @author siliang
 * @Date   2021-09-03
 * @param  string       $time        规定日期/时间字符串
 * @param  string|null  $format_time 格式化的时间格式
 * @return int          时间戳
 */
function timestamp($time = 'now', $format_time = null)
{
    if (is_null($format_time)) {
        return strtotime($time);
    }
    return strtotime(date('Y-m-d ' . $format_time, strtotime($time)));
}

// 定义常用随机的字符串
define('STRING_NUMBER', '0123456789');
define('STRING_ABC', 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ');
define('STRING_ABC_LOWER', 'abcdefghijklmnopqrstuvwxyz');
define('STRING_ABC_UPPER', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
define('STRING_HEX', '0123456789abcdef');
define('STRING_SPECIAL', '~!@#$%^&*()_+{}:\"|<>?`-=[];\'\\,./');
/**
 * 生成随机字符串（推荐）
 * @author siliang
 * @Date   2022-07-05
 * @param  int        $length 长度
 * @param  string     $string 用来生成随机字符串的文字
 * @return string
 */
function rand_string($length, $string = '0123456789')
{
    $max = strlen($string) - 1;
    $code = '';
    for ($i = 0; $i < $length; $i++) {
        $code .= $string[mt_rand(0, $max)];
    }
    return $code;
}

/**
 * 返回上传后的静态文件地址
 * @author siliang
 * @Date   2022-06-20
 * @param  string     $uri 请求uri
 * @return string
 */
function static_url($uri = '')
{
    return STORAGE_HOST . $uri;
}

/**
 * 获取目录大小
 * @author siliang
 * @Date   2022-07-27
 * @param  string     $dir 目录路径
 * @return int
 */
function dirsize($dir)
{
    $size = 0;
    $handle = opendir($dir);
    if ($handle !== false) {
        while ($file = readdir($handle)) {
            if ($file != "." and $file != "..") {
                $path = $dir . "/" . $file;
                if (is_dir($path)) {
                    $size += dirsize($path);
                } elseif (is_file($path)) {
                    $size += filesize($path);
                }
            }
        }
        closedir($handle);
    }
    return $size;
}

/**
 * 返回格式化的文件大小
 * @author siliang
 * @Date   2022-07-27
 * @param  int        $size 文件大小
 * @return string
 */
function filesize_format($size)
{
    $p = 0;
    $format = 'bytes';
    if ($size > 0 && $size < 1024) {
        $p = 0;
        return intval($size) . ' ' . $format;
    }
    if ($size >= 1024 && $size < pow(1024, 2)) {
        $p = 1;
        $format = 'KB';
    }
    if ($size >= pow(1024, 2) && $size < pow(1024, 3)) {
        $p = 2;
        $format = 'MB';
    }
    if ($size >= pow(1024, 3) && $size < pow(1024, 4)) {
        $p = 3;
        $format = 'GB';
    }
    if ($size >= pow(1024, 4) && $size < pow(1024, 5)) {
        $p = 3;
        $format = 'TB';
    }
    $size /= pow(1024, $p);
    return (number_format($size, 2, '.', '') + 0) . ' ' . $format;
}

/**
 * 高性能分块读取文件，解除内存超出限制
 * @author siliang
 * @Date   2022-07-27
 * @param  string     $file_name 文件地址
 * @return yield Object
 */
function file_read_chunks($file_name, $length = 1024 * 1024)
{
    $handle = fopen($file_name, 'rb');
    while (!feof($handle)) {
        yield fread($handle, $length);
    }
    fclose($handle);
}

/**
 * 获取系统类型
 * @author siliang
 * @Date   2023-02-03
 * @return string
 */
function get_os_type()
{
    if (stripos(PHP_OS, 'Linux') !== false) {
        return 'Linux';
    } else if (stripos(PHP_OS, 'Darwin') !== false) {
        return 'MacOS';
    } else if (stripos(PHP_OS, 'WIN') !== false) {
        return 'Windows';
    } else {
        return 'Unix';
    }
    return 'Unknown';
}

/**
 * 获取路径指定位置的名称
 * @author siliang
 * @Date   2023-02-20
 * @param  string     $url 指定URL
 * @param  int        $n   位置
 * @return string
 */
function get_url_pathname($url, $n)
{
    $path = parse_url($url, PHP_URL_PATH);
    if (!empty($path)) {
        $array = explode('/', $path);
        $length = count($array);
        $n = intval($n);
        if ($n < 0) {
            $m = $length + $n;
        } else {
            $m = $n;
        }
        if (isset($array[$m])) {
            return $array[$m];
        }
    }
    return '';
}

/**
 * 通过curl请求获取头部信息（通常用于获取文件信息）
 * @author siliang
 * @Date   2022-12-14
 * @param  string     $url 文件地址
 * @return array
 */
function curl_getheader($url)
{
    $headers = array('Accept: */*', 'User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)', 'Connection: Keep-Alive');
    $curl = curl_init($url);

    curl_setopt($curl, CURLOPT_HEADER, true);
    curl_setopt($curl, CURLOPT_NOBODY, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($curl, CURLOPT_AUTOREFERER, true);
    // 添加头信息
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    // 不验证SSL
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    // 响应超时设置
    curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 30);
    curl_setopt($curl, CURLOPT_TIMEOUT, 30);
    $header = curl_exec($curl);
    $ret = curl_errno($curl);
    $error = curl_error($curl);
    curl_close($curl);
    if ($ret === 0) {
        $responseHeaders = array();
        $headArray = explode("\r\n", trim($header));
        $first = array_shift($headArray);
        preg_match("#HTTP/[0-9\.]+\s+([0-9]+)#", $first, $code);
        $responseHeaders['code'] = intval($code[1]);
        foreach ($headArray as $v) {
            $arr = explode(':', $v, 2);
            $responseHeaders[trim($arr[0])] = trim($arr[1]);
        }
        return $responseHeaders;
    } else {
        trigger_error('curl_getheader() ' . $error, E_USER_ERROR);
        return false;
    }
}

function curlGet_https($url, $authorization)
{
    $headers = array('Authorization:' . $authorization);
    // 初始化
    $curl = curl_init();

    // 设置url路径
    curl_setopt($curl, CURLOPT_URL, $url);
    // 将 curl_exec()获取的信息以文件流的形式返回，而不是直接输出。
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    // 在启用 CURLOPT_RETURNTRANSFER 时候将获取数据返回
    curl_setopt($curl, CURLOPT_BINARYTRANSFER, true);
    // 添加头信息
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    // CURLINFO_HEADER_OUT选项可以拿到请求头信息
    curl_setopt($curl, CURLINFO_HEADER_OUT, true);
    // 不验证SSL
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    // 响应超时设置
    curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 30);
    curl_setopt($curl, CURLOPT_TIMEOUT, 60);
    // 执行
    $data = curl_exec($curl);
    // 打印请求头信息
    // echo curl_getinfo($curl, CURLINFO_HEADER_OUT);
    // 关闭连接
    curl_close($curl);
    // 返回数据
    return $data;
}

function curlPost_https($url, $headers, $data)
{
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    // 添加头信息
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    // CURLINFO_HEADER_OUT选项可以拿到请求头信息
    curl_setopt($curl, CURLINFO_HEADER_OUT, true);
    // 不验证SSL
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    // 响应超时设置
    curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 30);
    curl_setopt($curl, CURLOPT_TIMEOUT, 60);

    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Content-Length: ' . strlen($data)));
    $result = curl_exec($curl);
    curl_close($curl);
    return $result;
}
