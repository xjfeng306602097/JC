<?php
namespace app\controller;

use app\BaseController;
use app\libraries\makromail\Http;
use app\libraries\makromail\UploadFile;
use app\libraries\result\JsonResult;
use think\facade\Cookie;
use think\facade\Log;
use think\facade\Request;

class MarketingPublish extends BaseController
{

    use JsonResult;

    // 存储的任务
    protected $jobs = [];

    // 上传的文件
    protected $uploadFiles = [];

    // 后台api请求实例
    protected $api;

    // 自调用请求实例
    protected $http;

    // 上传文件请求实例
    protected $upload;

    // 生成发布文件接口
    public function index()
    {
        // 验证权限
        Self::checkLogin('json', "marketing/publish/index");

        // 设置未执行完成永不超时
        ignore_user_abort(true);
        set_time_limit(0);

        $relatedFlow = Request::param('relatedFlow', '');
        $mmCode = Request::param('mmCode', '');
        $jobs = Request::param('jobs', []);
        if (empty($jobs) || !is_array($jobs) || count(array_column($jobs, 'mediaType')) != count($jobs)) {
            return $this->error('Request Error', [$jobs]);
        }
        $publishStart = millitime(true);
        $this->api = Http::requestAPI();
        $result = $this->api->post('/makro-admin/api/v1/publish/job/' . $relatedFlow . '/mm/' . $mmCode, [], $jobs);
        if (!isset($result['code']) || $result['code'] != '0000') {
            return $this->error($result['msg'] ?? 'Error', ['relatedFlow' => $relatedFlow, 'mmCode' => $mmCode, 'jobs' => $jobs, 'result' => $result]);
        }
        $jobs = $result['data'] ?? [];
        if (empty($jobs)) {
            return $this->error('Failed to create publish task');
        }
        if (function_exists('fastcgi_finish_request')) {
            $this->success('Publish task submitted successfully')->send();
        }

        $failed = [];
        $this->jobs = array_column($jobs, null, 'id');
        foreach ($jobs as &$job) {
            $jobID = $job['id'];
            $job = $this->build($jobID);

            if ($job === false) {
                $failed[] = $jobID;
            }
        }
        $publishEnd = millitime(true);
        return $this->success('Success', [
            'mmCode' => $mmCode,
            'publish' => [
                'jobs' => $jobs,
                'failed' => $failed,
                'time' => $publishEnd - $publishStart,
            ],
        ]);
    }

    // 更新所有已发布的MM
    public function updateAll()
    {
        // 验证权限
        Self::checkLogin('json', "marketing/publish/updateAll");

        $mediaType = Request::param('mediaType', '');
        $mediaTypes = array_filter(explode(',', $mediaType));
        if (empty($mediaTypes)) {
            return $this->error('Please select mediaType');
        }
        $array = ['h5', 'app', 'pdf', 'pdf-printing'];
        $mediaTypes = array_intersect($array, $mediaTypes);
        if (count($mediaTypes) <= 0) {
            return $this->error('Error: 10000');
        }
        // 设置未执行完成永不超时
        ignore_user_abort(true);
        set_time_limit(0);
        $publishStart = millitime(true);

        $this->api = Http::requestAPI();
        $this->api->setConfig('timeout', 600);
        $result = $this->api->post('/makro-admin/api/v1/activity/page', [], [
            'page' => 1,
            'limit' => 10000,
            'status' => '6',
        ]);
        if (!isset($result['code']) || $result['code'] != '0000') {
            return $this->error('Error: 10001');
        }
        if (function_exists('fastcgi_finish_request')) {
            $this->success('Update MM jobs task submitted successfully')->send();
        }
        Log::record('MarketingPublish.updateAll start mediaType=' . implode(',', $mediaTypes));
        $list = $result['data']['records'] ?? [];
        $jobs = [];
        // 失败的job
        $failed = [];
        foreach ($list as $mm) {
            $mmCode = $mm['mmCode'];
            $jobResult = $this->api->get('/makro-admin/api/v1/publish/job/mm/' . $mm['mmCode'] . '/list', [], [
                'page' => 1,
                'limit' => 10000,
                'status' => '6',
            ]);
            $jobs[$mmCode] = [];
            if (isset($jobResult['code']) && $jobResult['code'] == '0000' && isset($jobResult['data'])) {
                foreach ($jobResult['data'] as $job) {
                    if (in_array($job['mediaType'], $mediaTypes)) {
                        $jobID = $job['id'];
                        $this->jobs[$jobID] = $job;
                        $jobData = $this->build($jobID);
                        $jobInfo = [
                            'id' => $jobID,
                            'mmCode' => $mmCode,
                            'mediaType' => $job['mediaType'],
                        ];
                        $jobs[$mmCode][] = $jobInfo;
                        if ($jobData === false) {
                            $failed[] = $jobInfo;
                        }
                        // 只更新一个
                        // break 2;
                    }
                }
            }
        }
        $publishEnd = millitime(true);
        $msg = 'total: ' . count($this->jobs) . ', failed: ' . count($failed);
        Log::record('MarketingPublish.updateAll end. ' . $msg);
        return $this->success($msg, [
            'publish' => [
                'jobs' => $jobs,
                'failed' => $failed,
                'time' => $publishEnd - $publishStart,
            ],
        ]);
    }

    // 重新生成
    public function rebuild()
    {
        // 验证权限
        Self::checkLogin('json', "marketing/publish/rebuild");

        // 设置未执行完成永不超时
        ignore_user_abort(true);
        set_time_limit(0);

        $jobID = Request::param('jobID');
        if (function_exists('fastcgi_finish_request')) {
            $this->success('Rebuild task submitted successfully')->send();
        }
        $job = $this->build($jobID);
        if ($job === false) {
            return $this->error('Build Error');
        }
        return $this->success('Success', [
            'job' => $job,
        ]);
    }

    // 生成发布文件
    protected function build($jobID)
    {
        if (empty($this->api)) {
            $this->api = Http::requestAPI();
        }
        if (empty($this->http)) {
            $this->http = Http::request(SELF_HOST);
            $this->http->setCookies(Cookie::get());
            $this->http->setConfig('timeout', 1200);
        }
        if (empty($this->upload)) {
            $this->upload = new UploadFile;
        }

        if (isset($this->jobs[$jobID])) {
            $job = $this->jobs[$jobID];
        } else {
            // 不存在则请求接口获取job信息
            $result = $this->api->get('/makro-admin/api/v1/publish/job/' . $jobID);
            if (!isset($result['code']) || $result['code'] != '0000') {
                return false;
            }
            $job = $result['data'];
        }
        if (empty($job['mmCode'])) {
            return false;
        }
        // 需要修改的数据
        // publishStatus=1为成功，=2为失败
        $data = [];
        $mmCode = $job['mmCode'];
        $mediaType = $job['mediaType'] ?? '';

        // 设置编译时间
        $data['buildTime'] = date('Y-m-d H:i:s');

        // 发布状态不为0修改状态为0
        if ($job['publishStatus'] != 0 && in_array($mediaType, ['h5', 'app', 'pdf', 'pdf-printing'])) {
            $data['publishStatus'] = 0;
            $this->api->request([
                'method' => 'PUT',
                'uri' => '/makro-admin/api/v1/publish/job/' . $job['id'],
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'body' => json_encode($data),
            ]);
            $job = array_merge($job, $data);
            $data = [];
        }
        try {
            switch ($mediaType) {
                case 'h5':
                    $result = $this->http->get('/makroDigital/marketingExport/html/' . $mmCode, [
                        'Accept' => 'application/json',
                    ]);
                    if (!isset($result['code']) || $result['code'] != '0000') {
                        throw new \Exception($mediaType . '文件生成失败');
                    }
                    $path = $result['path'] ?? '';
                    $htmlFile = app()->getRootPath() . $path;
                    if (!file_exists($htmlFile)) {
                        throw new \Exception($mediaType . '生成的文件找不到');
                    }
                    $htmlUrl = $this->upload->html($htmlFile, 'mm/' . $mmCode . '.html');
                    if (empty($htmlUrl)) {
                        throw new \Exception('上传' . $mediaType . '文件失败');
                    }
                    $this->uploadFiles[$mmCode]['h5'] = $htmlUrl;
                    $data['filePath'] = (string) $htmlUrl;
                    $data['publishStatus'] = 1;
                    break;
                case 'app':
                    $result = $this->http->get('/makroDigital/marketingExport/html/' . $mmCode . '?' . http_build_query(['app' => 'true']), [
                        'Accept' => 'application/json',
                    ]);
                    if (!isset($result['code']) || $result['code'] != '0000') {
                        throw new \Exception($mediaType . '文件生成失败');
                    }
                    $path = $result['path'] ?? '';
                    $htmlFile = app()->getRootPath() . $path;
                    if (!file_exists($htmlFile)) {
                        throw new \Exception($mediaType . '生成的文件找不到');
                    }
                    $htmlUrl = $this->upload->html($htmlFile, 'mm-app/' . $mmCode . '.html');
                    if (empty($htmlUrl)) {
                        throw new \Exception('上传' . $mediaType . '文件失败');
                    }
                    $this->uploadFiles[$mmCode]['app'] = $htmlUrl;
                    $data['filePath'] = (string) $htmlUrl;
                    $data['publishStatus'] = 1;
                    break;
                case 'pdf':
                    $size = $job['pdfSize'] ?: 'OS';
                    $startTime = millitime(true);
                    $result = $this->http->get('/makroDigital/marketingExport/pdf/' . $size . '/F/' . $mmCode, [
                        'Accept' => 'application/json',
                    ]);
                    if (!isset($result['code']) || $result['code'] != '0000') {
                        throw new \Exception($mediaType . '文件生成失败');
                    }
                    Log::record('build pdf time: ' . (millitime(true) - $startTime) . 's');
                    $path = $result['downPath'] ?? '';
                    $pdfFile = app()->getRootPath() . 'public' . $path;
                    if (!file_exists($pdfFile)) {
                        throw new \Exception($mediaType . '生成的文件找不到');
                    }
                    $pdfUrl = $this->upload->file($pdfFile);
                    if (empty($pdfUrl)) {
                        throw new \Exception('上传' . $mediaType . '文件失败');
                    }
                    $this->uploadFiles[$mmCode]['pdf'] = $pdfUrl;
                    $data['filePath'] = (string) $pdfUrl;
                    $data['publishStatus'] = 1;
                    break;
                case 'pdf-printing':
                    $size = 'OS';
                    $startTime = millitime(true);
                    $result = $this->http->get('/makroDigital/marketingExport/pdf/' . $size . '/FP/' . $mmCode, [
                        'Accept' => 'application/json',
                    ]);
                    if (!isset($result['code']) || $result['code'] != '0000') {
                        throw new \Exception($mediaType . '文件生成pdf失败');
                    }
                    Log::record('build pdf-printing[pdf] time: ' . (millitime(true) - $startTime) . 's');
                    $path = $result['downPath'] ?? '';
                    $fonts = $result['fonts'] ?? [];
                    $publicPath = app()->getRootPath() . 'public/';
                    $pdfFile = $publicPath . $path;
                    if (!file_exists($pdfFile)) {
                        throw new \Exception($mediaType . '生成的文件找不到');
                    }
                    // 获取MM名称
                    $name = str_replace_once('-FP.pdf', '', basename($pdfFile));

                    // 生成AI分页文件
                    $startTime = millitime(true);
                    $result = $this->http->get('/makroDigital/marketingExport/pdf/' . $size . '/FSP/' . $mmCode, [
                        'Accept' => 'application/json',
                    ]);
                    if (!isset($result['code']) || $result['code'] != '0000') {
                        throw new \Exception($mediaType . '文件生成ai失败');
                    }
                    Log::record('build pdf-printing[ai] time: ' . (millitime(true) - $startTime) . 's');
                    $aiPaths = $result['downPaths'] ?? [];

                    // $pdfUrl = $this->upload->file($pdfFile);
                    // if (empty($pdfUrl)) {
                    //     throw new \Exception('上传' . $mediaType . ' pdf文件失败');
                    // }
                    // $files = [];
                    // $files[] = ['file' => $pdfUrl, 'filePath' => $name . '.pdf'];
                    // // 复制一份pdf并重新命名为ai
                    // // $files[] = ['file' => $pdfUrl, 'filePath' => $name . '.ai'];
                    // 引入AI分页文件
                    // foreach ($aiPaths as $page => $aiPath) {
                    //     $aiUrl = $this->upload->file($publicPath . $aiPath);
                    //     $files[] = ['file' => $aiUrl, 'filePath' => '/ai/page-' . $page . '.ai'];
                    // }
                    // foreach ($fonts as $font) {
                    //     $files[] = ['file' => $font['sourceUrl'], 'filePath' => '/font/' . basename($font['sourceUrl'])];
                    // }
                    // $zipResult = $this->api->post('/makro-file/api/v1/zip/files', [], [
                    //     'files' => $files,
                    //     'zipName' => '',
                    // ]);
                    // $zipUrl = $zipResult['data']['path'] ?? '';
                    // if (empty($zipUrl)) {
                    //     throw new \Exception('打包' . $mediaType . '文件失败');
                    // }

                    if (empty($zipUrl)) {
                        Log::record('switch local zip mode');
                        // 本地打包方法
                        // 压缩包临时存储路径
                        $zipFile = app()->getRuntimePath() . 'temp/_zip/' . md5('tempZip_' . millitime(true) . mt_rand(1, 99999)) . '.zip';
                        $zip = new \ZipArchive();
                        if ($zip->open($zipFile, \ZipArchive::CREATE) !== true) {
                            throw new \Exception($mediaType . '生成压缩包失败');
                        }

                        $zip->addFile($pdfFile, $name . '.pdf');
                        // 复制一份pdf并重新命名为ai
                        // $zip->addFile($pdfFile, $name . '.ai');
                        // 引入AI分页文件
                        foreach ($aiPaths as $page => $aiPath) {
                            if (file_exists($publicPath . $aiPath)) {
                                $zip->addFile($publicPath . $aiPath, 'ai/page-' . $page . '.ai');
                            }
                        }
                        // 引入字体
                        foreach ($fonts as $font) {
                            $fontPath = 'pdf/static/font/' . $font['name'] . '.ttf';
                            if (file_exists($publicPath . $fontPath)) {
                                $zip->addFile($publicPath . $fontPath, 'font/' . basename($fontPath));
                            }
                        }
                        $zip->close();

                        // sleep(1);
                        $zipUrl = $this->upload->file($zipFile);
                        if (empty($zipUrl)) {
                            throw new \Exception('上传' . $mediaType . '压缩包文件失败');
                        }
                        unlink($zipFile); // 删除压缩包
                    }

                    $this->uploadFiles[$mmCode]['pdf-printing'] = $zipUrl;
                    $data['filePath'] = (string) $zipUrl;
                    $data['publishStatus'] = 1;
                    break;
            }
        } catch (\Exception $e) {
            Log::record('Publish Error[' . $mmCode . ']: ' . $e->getMessage() . ' [' . $e->getFile() . ':' . $e->getLine() . ']');
            $data['publishStatus'] = 2;
        }
        // 更新job状态
        if (!empty($data) && !empty($job['id'])) {
            $response = $this->api->request([
                'method' => 'PUT',
                'uri' => '/makro-admin/api/v1/publish/job/' . $job['id'],
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'body' => json_encode($data),
            ]);
            $result = json_decode($response->getBody()->getContents(), true);
            if (!isset($result['code']) || $result['code'] != '0000') {
                Log::record('Publish Error[' . $mmCode . ']: 更新' . $mediaType . '数据失败。jobID: ' . $job['id'] . ' result: ' . json_encode($result));
                return false;
            }
            // 在pdf、pdf-printing时删除原来的文件
            if (in_array($mediaType, ['pdf', 'pdf-printing']) && !empty($job['filePath'])) {
                $this->api->request([
                    'method' => 'DELETE',
                    'uri' => '/makro-file/api/v1/files?path=' . $job['filePath'],
                ]);
            }
            $job = array_merge($job, $data);
            return $job;
        }
        return false;
    }

    // 原发布接口（已废弃）
    private function html()
    {
        // 验证权限
        Self::checkLogin('json', "marketing/publish/html");

        $mmCode = Request::param('mmCode', '');
        $mmCode = str_replace(['/', '.'], ['', ''], $mmCode);
        $mode = Request::param('mode', '');
        if (empty($mode)) {
            return $this->error('Please select a publishing mode');
        }
        $path = Request::param('path', '');
        $previewUrl = Request::param('previewUrl', '');
        if (empty($mode) || empty($path)) {
            return $this->error('Publish error!');
        }
        $fileExt = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        if (!in_array($fileExt, ['html']) || strpos($path, '..') !== false) {
            return $this->error('Publish error!');
        }
        $path = 'public/' . $path;
        $mmDir = 'public/html/' . $mmCode;
        $htmlPath = $mmDir . '/index.html';
        if ($path != $htmlPath) {
            return $this->error('File does not exist');
        }
        $htmlFile = app()->getRootPath() . $htmlPath;

        if (!file_exists($htmlFile)) {
            return $this->error('File does not exist');
        }

        $upload = new UploadFile;
        $htmlUrl = $upload->html($htmlFile);
        if (!empty($htmlUrl)) {
            $publishStart = millitime(true);
            $http = Http::requestAPI();
            $result = $http->post('/makro-template/api/v1/template/publish/mm', [], [
                'code' => $mmCode,
                'publishUrl' => $htmlUrl,
                'previewUrl' => $previewUrl,
            ]);
            $publishEnd = millitime(true);
            unlink($htmlFile);
            rmdir(app()->getRootPath() . $mmDir);
            if (isset($result['code']) && $result['code'] == '0000') {
                $last = end($result['data']['items']);
                $publishUrl = '';
                if ($last !== false) {
                    $publishUrl = $last['publishUrl'];
                }
                return $this->success($result['msg'], [
                    'mmCode' => $mmCode,
                    'publishUrl' => $publishUrl,
                    'previewUrl' => $previewUrl,
                    'publish' => [
                        'result' => $result,
                        'time' => $publishEnd - $publishStart,
                    ],
                ]);
            } else {
                return $this->error($result['msg'] ?? 'Error');
            }
        }
        return $this->error('Operation failed');
    }

}
