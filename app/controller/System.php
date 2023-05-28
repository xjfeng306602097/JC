<?php
namespace app\controller;

use app\BaseController;
use app\libraries\makromail\Http;
use think\facade\Log;
use think\facade\Request;

class System extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', 'system/index');

        phpinfo();
    }

    public function log()
    {
        // 验证权限
        Self::checkLogin('page', 'system/log');

        $date = Request::param('date', date('Ym/d'));

        if (!preg_match("/^\d{6}\/\d{2}$/", $date)) {
            return response('Error', 400);
        }

        $logFile = app()->getRuntimePath() . 'log/' . $date . '.log';

        if (!file_exists($logFile)) {
            return response('', 404);
        }

        return file_get_contents($logFile);
    }

    public function file()
    {
        if (ENV_NAME == 'prd') {
            return;
        }

        // 验证权限
        Self::checkLogin('page', 'system/file');

        $path = Request::param('path', '');
        if (strpos($path, '..') !== false) {
            echo 'path error!';
            exit;
        }

        $path = ltrim(ltrim($path, '.'), '/');

        $realPath = realpath(app()->getRuntimePath() . $path);

        if (!empty($path)) {
            $dir = dirname($path);
            if ($dir == '.') {
                $dir = '';
            }
            echo '<a href="/makroDigital/system/file?path=' . $dir . '">..</a> back', '<br>';
        }

        if ($realPath === false) {
            echo 'path not found!';
            exit;
        }

        if (is_dir($realPath)) {
            $realPath .= '/';
            if (!empty($path)) {
                $path .= '/';
            }
            $info = opendir($realPath);
            while (($file = readdir($info)) !== false) {
                if ($file[0] !== '.') {
                    $filePath = $path . $file;
                    echo '<a href="/makroDigital/system/file?path=' . $filePath . '">' . $file . '</a>';
                    if (is_file($realPath . $file)) {
                        echo ' size: ' . filesize_format(filesize($realPath . $file));
                        echo ' <a href="/makroDigital/system/file?path=' . $filePath . '&download=' . $file . '">download</a>';
                    } else if (is_dir($realPath . $file)) {
                        echo ' dir size: ' . filesize_format(dirsize($realPath . $file));
                    }
                    echo '<br>';
                }
            }
            closedir($info);
        } else if (is_file($realPath)) {
            $fileSize = filesize($realPath);
            if (Request::has('download')) {
                $name = Request::param('download', '');
                if (empty($name)) {
                    $name = basename($realPath);
                }
                $mimeType = finfo_file(finfo_open(FILEINFO_MIME_TYPE), $realPath);
                $expire = 180;
                $header['Pragma'] = 'public';
                $header['Content-Type'] = $mimeType ?: 'application/octet-stream';
                $header['Cache-control'] = 'max-age=' . $expire;
                $header['Content-Disposition'] = 'attachment; filename="' . $name . '"';
                $header['Content-Length'] = $fileSize;
                $header['Content-Transfer-Encoding'] = 'binary';
                $header['Expires'] = gmdate("D, d M Y H:i:s", time() + $expire) . ' GMT';

                // 开始输出文件
                ob_end_clean();
                ob_implicit_flush(1);
                http_response_code(200);
                foreach ($header as $key => $value) {
                    header($key . ':' . $value);
                }
                foreach (file_read_chunks($realPath, 1024 * 512) as $text) {
                    echo $text;
                }
            } else {
                echo 'file size: ' . filesize_format($fileSize), '<br>';
                $maxSize = 10 * 1024 * 1024; // 最大查看10M的文件
                if ($fileSize > $maxSize) {
                    echo 'The file is too large to view';
                } else {
                    echo 'content: <br>';
                    echo '<xmp>';
                    foreach (file_read_chunks($realPath, 1024 * 512) as $text) {
                        echo $text;
                    }
                    echo '</xmp>';
                }
            }
        } else {
            echo 'not found!';
        }
    }

    public function testDownload()
    {
        // 验证权限
        Self::checkLogin('page', 'system/testDownload');

        set_time_limit(0);
        $uri = Request::param('file', '');
        $uri = '/' . $uri;

        $startTime = millitime(true);
        $file1 = app()->getRuntimePath() . 'test1.zip';
        $http = Http::request(STORAGE_HOST);
        $http->setConfig('timeout', 3000);
        $http->downloadFile($uri, $file1);
        echo STORAGE_HOST . $uri, '<br>';
        echo millitime(true) - $startTime, '<br>';

        $startTime = millitime(true);
        $file2 = app()->getRuntimePath() . 'test2.zip';
        $http = Http::request(STORAGE_FAST_HOST);
        $http->setConfig('timeout', 3000);
        $http->downloadFile($uri, $file2);
        echo STORAGE_FAST_HOST . $uri, '<br>';
        echo millitime(true) - $startTime, '<br>';
    }

    public function testMagick()
    {
        $imagick = new \Imagick();
        dump(json_encode($imagick));
    }

}
