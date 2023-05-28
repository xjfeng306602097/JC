<?php
namespace app\controller;

use app\BaseController;
use app\libraries\makromail\Http;
use app\libraries\result\JsonResult;
use app\libraries\tool\ImageConverter;
use think\facade\Request;
use think\File;

class Upload extends BaseController
{

    use JsonResult;

    // 上传设计图片
    public function designImage()
    {
        $file = Request::file('file');
        $filePath = $file->getPathname();
        $fileName = $file->getOriginalName();
        $fileExt = strrchr($fileName, '.') ?: '';
        $fileExt = strtolower(substr($fileExt, 1));
        try {
            $LimitSize = 1024 * 1024 * 100; // 上传最大文件大小：100MB
            $exts = ['jpg', 'jpeg', 'png', 'gif', 'ai', 'eps', 'psd', 'pdf'];
            validate([
                'file' => 'filesize:' . $LimitSize . '|fileExt:' . implode(',', $exts),
            ], [
                'file.filesize' => 'Uploaded file size cannot exceed 100MB',
                'file.fileExt' => 'Unsupported picture format.',
            ])->check(['file' => $file]);
        } catch (\think\exception\ValidateException $e) {
            return $this->error($e->getError());
        }
        // 特殊格式处理
        $newFile = '';
        $imageConverter = new ImageConverter();
        $tempPath = app()->getRuntimePath() . 'temp/_upload/';
        switch ($fileExt) {
            case 'ai':
                // ai文件转png
                $newFile = $tempPath . md5('upload_' . millitime(true) . mt_rand(1, 99999)) . '.png';
                $imageConverter->toPNG('ai', $filePath, $newFile);
                break;
            case 'eps':
                // eps文件转png
                $newFile = $tempPath . md5('upload_' . millitime(true) . mt_rand(1, 99999)) . '.png';
                $imageConverter->toPNG('eps', $filePath, $newFile);
                break;
            case 'psd':
                // psd文件转png
                $newFile = $tempPath . md5('upload_' . millitime(true) . mt_rand(1, 99999)) . '.png';
                $imageConverter->toPNG('psd', $filePath, $newFile);
                break;
            case 'pdf':
                // pdf文件转png
                $newFile = $tempPath . md5('upload_' . millitime(true) . mt_rand(1, 99999)) . '.png';
                $imageConverter->toPNG('pdf', $filePath, $newFile);
                break;
            default:
                break;
        }
        if (!empty($newFile)) {
            if (is_file($newFile)) {
                $file = new File($newFile);
            } else {
                return $this->error('Format conversion failed');
            }
        }
        $query = Request::param();
        $authorization = Request::header('Authorization', '');
        $header = [];
        if (!empty($authorization)) {
            $header['Authorization'] = $authorization;
        }
        $http = Http::requestAPI();
        $http->setConfig('timeout', 60);
        $result = $http->uploadFile('/makro-file/api/v1/pictures?' . http_build_query($query), $header, ['file' => $file]);
        if (!empty($newFile) && is_file($newFile)) {
            unlink($newFile);
        }
        if (isset($result['code'])) {
            return json($result);
        }
        return $this->error('Error');
    }

}
