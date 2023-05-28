<?php

// 日志
function wLog($savePath, $content)
{

//     $filename =rtrim($_SERVER['DOCUMENT_ROOT'],'/') . "/log/".date("Ymd").".log";
    $str = $content . "\r\n\r\n";
    file_put_contents($savePath, $str, FILE_APPEND | LOCK_EX);

}

//删除空格
function trimall($str)
{
    $oldchar = array(" ", "　", "\t", "\n", "\r");
    $newchar = array("", "", "", "", "");
    return str_replace($oldchar, $newchar, $str);
}

//下载文件
function downFile($url, $save_dir = '', $filename = '', $type = 0)
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
    $check = function ($path) {
        if (is_dir($path)) {
            $fd = opendir($path);
            if ($fd === false) {
                return '文件存在,不可读,不可写';
            } else {
                if (is_writable($path)) {
                    return '文件可读可写';
                } else {
                    return '文件可读,不可写';
                }
            }
        } else {
            return '文件不存在';
        }
    };
    $save_dir = substr($save_dir, 0, -1);
    // var_dump([
    //     'dir' => $save_dir,
    //     'dir_permission' => $check($save_dir),
    //     'file' => $save_dir . $filename,
    //     'file_permission' => $check($save_dir . $filename),
    //     'fopen' => @fopen($save_dir . $filename, 'a'),
    // ]);exit;
    //文件大小
    $fp2 = fopen($save_dir . $filename, 'a');
    fwrite($fp2, $content);
    fclose($fp2);
    unset($content, $url);
    return array(
        'file_name' => $filename,
        'save_path' => $save_dir . $filename,
    );
}
