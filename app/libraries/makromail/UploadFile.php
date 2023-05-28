<?php
namespace app\libraries\makromail;

use app\libraries\makromail\Http;
use think\facade\Log;
use think\File;

class UploadFile
{

    /**
     * 上传文件主方法
     * @author siliang
     * @Date   2022-03-30
     * @param  string         $uri      上传地址
     * @param  string         $file     文件地址
     * @param  array          $data     其他数据
     * @param  int            $timeout  超时时间，默认为一分钟
     * @return mixed
     */
    protected function upload($uri, $file, array $data = [], $timeout = 60)
    {
        $http = Http::requestAPI();
        $http->setConfig('timeout', $timeout);
        $data['file'] = new File($file);
        // 上传文件
        $result = $http->uploadFile($uri, [], $data);
        return $result;
    }

    /**
     * 上传html文件调用方法
     * @author siliang
     * @Date   2022-03-30
     * @param  string         $file     图片文件地址
     * @param  string|null    $name     自定义文件名称，默认为随机名称
     * @return string|boolean
     */
    public function html($file, $name = null)
    {
        $query = [
            'objectName' => $name,
        ];
        $result = $this->upload('/makro-file/api/v1/files/h5?' . http_build_query($query), $file);
        if (isset($result['code']) && $result['code'] == '0000') {
            return $result['data']['path'] ?? '';
        }
        return false;
    }

    /**
     * 上传图片文件调用方法
     * @author siliang
     * @Date   2022-03-30
     * @param  string         $file     图片文件地址
     * @param  string|null    $name     自定义文件名称，默认为随机名称
     * @param  int|null       $limit    设置限制大小（px）
     * @return string|boolean
     */
    public function image($file, $name = null, $limit = null)
    {
        $query = [
            'objectName' => $name,
            'limit' => $limit,
        ];
        $result = $this->upload('/makro-file/api/v1/pictures?' . http_build_query($query), $file);
        if (isset($result['code']) && $result['code'] == '0000') {
            return $result['data']['originPath'] ?? '';
        }
        return false;
    }

    /**
     * 上传文件调用方法
     * @author siliang
     * @Date   2022-03-30
     * @param  string         $file     图片文件地址
     * @param  string|null    $name     自定义文件名称，默认为随机名称
     * @param  string|null    $bucket   存储桶
     * @return string|boolean
     */
    public function file($file, $name = null, $bucket = null)
    {
        $fileSize = filesize($file);
        $sliceMin = 10 * 1024 * 1024;
        if ($fileSize > $sliceMin) {
            // 超过10M时走切片上传方法
            return $this->sliceUpload($file, $name, $bucket);
        } else {
            $query = [
                'objectName' => $name,
                'bucketName' => $bucket,
            ];
            $result = $this->upload('/makro-file/api/v1/files?' . http_build_query($query), $file, [], 1800);
            if (isset($result['code']) && $result['code'] == '0000') {
                return $result['data']['path'] ?? '';
            }
        }
        return false;
    }

    /**
     * 切片上传调用方法
     * @author siliang
     * @Date   2022-07-28
     * @param  string         $file     图片文件地址
     * @param  string|null    $name     自定义文件名称，默认为随机名称
     * @param  string|null    $bucket   存储桶
     * @param  int            $timeout  超时时间，默认为5分钟
     * @return string|boolean
     */
    protected function sliceUpload($file, $name = null, $bucket = null, $timeout = 300)
    {
        if (!is_file($file)) {
            return false;
        }
        // 未传递文件名生成随机文件名
        if (empty($name)) {
            $name = md5(rand_string(40, STRING_NUMBER)) . '.' . pathinfo($file, PATHINFO_EXTENSION);
        }
        if (empty($bucket)) {
            $bucket = '';
        }
        $fileSize = filesize($file);
        Log::record('sliceUpload start time=' . millitime(true) . ' name=' . $name . ' size=' . filesize_format($fileSize) . ' ' . http_build_query(['fileName' => $name, 'fileSize' => $fileSize, 'bucketName' => $bucket]));
        $http = Http::requestAPI();
        $result = $http->get('/makro-file/api/v1/files/upload/urls?' . http_build_query(['fileName' => $name, 'fileSize' => $fileSize, 'bucketName' => $bucket]));
        Log::record('create upload result: ' . json_encode($result));
        if (isset($result['code']) && $result['code'] == '0000') {
            $uploadId = $result['data']['uploadId'];
            $urls = $result['data']['urls'] ?? [];
            $chunkSize = intval($result['data']['chunkSize']);
            $chunkTotal = count($urls); // 分片数量，分片数量=平分数量-1，最后一个上传url需要传剩余未传分片
            $partNumber = ceil($fileSize / $chunkSize); // 平分数量
            $chunkIndex = 0; // 分片当前索引
            $mPart = '';

            $upload = Http::request('');
            $upload->setConfig('timeout', $timeout);
            foreach (file_read_chunks($file, $chunkSize) as $index => $part) {
                // 分片url仅剩一个时，将剩余的块放到最后一块上传
                if ($index == $partNumber - 1) {
                    $part = $mPart . $part;
                    $mPart = '';
                } else if ($index >= $chunkTotal - 1) {
                    $mPart .= $part;
                    continue;
                }
                $url = $urls[$chunkIndex];
                $partResponse = $upload->request([
                    'method' => 'PUT',
                    'headers' => [
                        'Accept' => 'application/json, text/plain, */*',
                        'Accept-Language' => 'zh-CN,zh;q=0.9',
                        'Cache-Control' => 'no-cache',
                        'Connection' => 'keep-alive',
                        'Content-Type' => 'application/x-www-form-urlencoded',
                        'Origin' => 'null',
                        'Pragma' => 'no-cache',
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36',
                    ],
                    'uri' => $url,
                    'body' => $part,
                ]);
                if ($partResponse === false) {
                    Log::record('upload chunk ' . $chunkIndex . ' error');
                    return false;
                }
                Log::record('upload chunk ' . $chunkIndex . ' size=' . strlen($part));
                ++$chunkIndex;
            }
            $result = $http->get('/makro-file/api/v1/files/upload/agg?' . http_build_query(['uploadId' => $uploadId]));
            Log::record('upload finish time=' . millitime(true) . ' result: ' . json_encode($result));
            if (isset($result['code']) && $result['code'] == '0000') {
                return $result['data']['path'] ?? '';
            }
        }
        return false;
    }

}
