<?php
namespace app\controller;

use app\BaseController;
use app\libraries\makromail\Http;
use app\libraries\makromail\UploadFile;
use app\libraries\result\JsonResult;
use think\facade\Cookie;
use think\facade\Request;
use think\facade\View;

class MarketingPage extends BaseController
{

    use JsonResult;

    protected $files = [
        // js文件
        [
            'path' => '/html/js/jquery-1.8.0.min.js',
            'bucketName' => 'makro-js',
        ],
        [
            'path' => '/html/js/common-1.0.1.js',
            'bucketName' => 'makro-js',
        ],
        [
            'path' => '/html/js/uni.webview.1.5.3.js',
            'bucketName' => 'makro-js',
        ],
        [
            'path' => '/html/js/liff.sdk.js',
            'bucketName' => 'makro-js',
        ],
        [
            'path' => '/html/js/pinchzoom.js',
            'bucketName' => 'makro-js',
        ],
        [
            'path' => '/html/js/md5.min.js',
            'bucketName' => 'makro-js',
        ],
        // css文件
        [
            'path' => '/html/css/marketing-1.0.0.css',
            'bucketName' => 'makro-css',
        ],
        [
            'path' => '/html/css/subscribe-1.0.0.css',
            'bucketName' => 'makro-css',
        ],
        // 图片
        [
            'path' => '/html/image/time.png',
            'bucketName' => 'makro-images',
        ],
        [
            'path' => '/html/image/pageLoad.gif',
            'bucketName' => 'makro-images',
        ],
        [
            'path' => '/html/image/to-left-1.png',
            'bucketName' => 'makro-images',
        ],
        [
            'path' => '/html/image/to-left-2.png',
            'bucketName' => 'makro-images',
        ],
        [
            'path' => '/html/image/to-right-1.png',
            'bucketName' => 'makro-images',
        ],
        [
            'path' => '/html/image/to-right-2.png',
            'bucketName' => 'makro-images',
        ],
        [
            'path' => '/img/nonePic.png',
            'bucketName' => 'makro-images',
        ],
    ];

    protected $pages = [
        'market-list' => 'marketing/page/market-list',
        'openapp' => 'marketing/page/openapp',
        'jump' => 'marketing/page/jump',
        'subscribe-ok' => 'marketing/page/email/subscribe-ok',
        'unsubscribe-ok' => 'marketing/page/email/unsubscribe-ok',
        'unsubscribe' => 'marketing/page/email/unsubscribe',
    ];

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/page/index");

        View::assign('js_timestamp', time());

        $files = [];
        foreach ($this->files as $_file) {
            $files[] = static_url('/' . $_file['bucketName'] . '/' . basename($_file['path']));
        }
        $pages = [];
        foreach ($this->pages as $_page => $_tpl) {
            $pages[] = static_url('/makro-htmls/' . $_page . '.html');
        }
        $tableData = [
            'page' => [
                'title' => 'Page',
                'list' => $pages,
            ],
            'file' => [
                'title' => 'File',
                'list' => $files,
            ],
        ];
        View::assign('tableData', json_encode($tableData, JSON_UNESCAPED_UNICODE));

        return View::fetch('marketing/page/index');
    }

    // 获取文件信息
    public function getFilesInfo()
    {
        // 验证权限
        Self::checkLogin('json', "marketing/page/getFileInfo");

        $xFile = '';
        // 是否更新全部文件
        $isAll = false;
        if (Request::has('file')) {
            // 指定更新的文件
            $xFile = Request::param('file', '');
            if (empty($xFile)) {
                return $this->error('Error');
            }
        } else {
            $isAll = true;
            set_time_limit(300);
        }
        $list = [];
        foreach ($this->files as $_file) {
            $fileUrl = static_url('/' . $_file['bucketName'] . '/' . basename($_file['path']));

            if ($isAll || $xFile == $fileUrl) {
                $responseHeaders = curl_getheader($fileUrl);
                // 将响应头数组key全部转为小写
                $responseHeaders = array_change_key_case($responseHeaders, CASE_LOWER);
                $list[$fileUrl] = [
                    'status' => $responseHeaders['code'],
                    'lastModified' => date('Y-m-d H:i:s', strtotime($responseHeaders['last-modified'] ?? '')),
                    'contentType' => $responseHeaders['content-type'] ?? '',
                ];
            }
        }
        foreach ($this->pages as $_page => $_tpl) {
            $pageUrl = static_url('/makro-htmls/' . $_page . '.html');

            if ($isAll || $xFile == $pageUrl) {
                $responseHeaders = curl_getheader($pageUrl);
                // 将响应头数组key全部转为小写
                $responseHeaders = array_change_key_case($responseHeaders, CASE_LOWER);
                $list[$pageUrl] = [
                    'status' => $responseHeaders['code'],
                    'lastModified' => date('Y-m-d H:i:s', strtotime($responseHeaders['last-modified'] ?? '')),
                    'contentType' => $responseHeaders['content-type'] ?? '',
                ];
            }
        }
        return $this->success('Success', ['data' => $list]);
    }

    // 更新文件（包含页面）
    public function update()
    {
        // 验证权限
        Self::checkLogin('json', "marketing/page/update");

        $xFile = '';
        // 是否更新全部文件
        $isAll = false;
        if (Request::has('file')) {
            // 指定更新的文件
            $xFile = Request::param('file', '');
            if (empty($xFile)) {
                return $this->error('Error');
            }
        } else {
            $isAll = true;
            set_time_limit(0);
        }
        $upload = new UploadFile;

        $files = [];
        $publicPath = app()->getRootPath() . '/public';
        foreach ($this->files as $_file) {
            $fileUrl = static_url('/' . $_file['bucketName'] . '/' . basename($_file['path']));
            if ($isAll || $xFile == $fileUrl) {
                $uploadFile = $publicPath . $_file['path'];
                $fileName = basename($_file['path']);
                $uploadUrl = $upload->file($uploadFile, $fileName, $_file['bucketName']);
                $files[] = $uploadUrl;
                if (!$isAll) {
                    if (empty($uploadUrl)) {
                        return $this->error('Failed');
                    }
                    return $this->success('Success', ['url' => $uploadUrl]);
                }
            }
        }
        $http = Http::request(SELF_HOST);
        $http->setCookies(Cookie::get());
        $http->setConfig('timeout', 600);

        $pages = [];
        $htmlPath = app()->getRuntimePath() . 'temp/_html/';
        foreach ($this->pages as $_page => $_tpl) {
            $pageUrl = static_url('/makro-htmls/' . $_page . '.html');
            if ($isAll || $xFile == $pageUrl) {
                $uploadFile = $htmlPath . md5('html_' . millitime(true) . mt_rand(1, 99999)) . '.html';
                $content = $http->get('/makroDigital/marketingPage/view/' . $_page . '?' . http_build_query(['remote' => 'true']));
                file_put_contents($uploadFile, $content);
                $fileName = $_page . '.html';
                $uploadUrl = $upload->html($uploadFile, $fileName);
                unlink($uploadFile);
                $pages[] = $uploadUrl;
                if (!$isAll) {
                    if (empty($uploadUrl)) {
                        return $this->error('Failed');
                    }
                    return $this->success('Success', ['url' => $uploadUrl]);
                }
            }
        }
        if (!$isAll) {
            return $this->error('Error');
        }
        return $this->success('Successfully updated all', ['files' => $files, 'pages' => $pages]);
    }

    // 获取源文件地址（不包含页面）
    public function source()
    {
        // 验证权限
        Self::checkLogin('json', "marketing/page/source");

        $xFile = Request::param('file', '');
        if (empty($xFile)) {
            return $this->error('Error');
        }

        foreach ($this->files as $_file) {
            $fileUrl = static_url('/' . $_file['bucketName'] . '/' . basename($_file['path']));
            if ($xFile == $fileUrl) {
                return $this->success('Success', ['source' => $_file['path']]);
            }
        }
        return $this->error('Error');
    }

    // 预览页面
    public function view()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/page/view");

        $page = str_replace_once('/makroDigital/marketingPage/view/', '', Request::baseUrl());
        if (!isset($this->pages[$page])) {
            return response('404 Not Found', 404);
        }
        $content = view($this->pages[$page])->getContent();
        if (Request::param('remote', false)) {
            $staticUrl = static_url();
            $array = [];
            foreach ($this->files as $_file) {
                $array[$_file['path']] = $staticUrl . '/' . $_file['bucketName'] . '/' . basename($_file['path']);
            }
            $content = str_replace(array_keys($array), array_values($array), $content);
            // 直接输出，防止返回调试信息
            echo $content;
            exit;
        }
        return $content;
    }

}
