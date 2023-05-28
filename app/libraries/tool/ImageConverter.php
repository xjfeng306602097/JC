<?php
namespace app\libraries\tool;

use \Imagick;

/**
 * 图片转换器
 */
class ImageConverter
{

    // 转换为png图片
    public function toPNG($format, $filePath, $savePath)
    {
        // ghostscript
        $gs = get_os_type() == 'Windows' ? 'gswin64c.exe' : 'gs';
        switch ($format) {
            // ai转png
            case 'ai':
                $cmdStr = $gs . ' -dSAFER -dBATCH -dNOPAUSE -r300 -sDEVICE=pngalpha -dTextAlphaBits=4 -dMaxBitmap=2147483647 -dGraphicsAlphaBits=4 -sOutputFile="' . $savePath . '" -dEPSCrop ' . $filePath;
                exec($cmdStr, $errOut, $runStatus);
                if (!$runStatus) {
                    $image = new Imagick($savePath);
                    $image->stripImage(); //去除图片信息
                    $image->trimImage(0); //修剪空白透明区域
                    $image->setImageFormat("png");
                    $image->writeImage($savePath);
                    return true;
                }
                break;
            // eps转png
            case 'eps':
                $cmdStr = $gs . ' -dSAFER -dBATCH -dNOPAUSE -r300 -sDEVICE=pngalpha -dTextAlphaBits=4 -dMaxBitmap=2147483647 -dGraphicsAlphaBits=4 -sOutputFile="' . $savePath . '" -dEPSCrop ' . $filePath;
                exec($cmdStr, $errOut, $runStatus);
                if (!$runStatus) {
                    $image = new Imagick($savePath);
                    $image->stripImage(); //去除图片信息
                    $image->trimImage(0); //修剪空白透明区域
                    $image->setImageFormat("png");
                    $image->writeImage($savePath);
                    return true;
                }
                break;
            // psd转png
            case 'psd':
                $image = new Imagick($filePath);
                $image->setIteratorIndex(0);
                $image->stripImage(); //去除图片信息
                $image->setImageCompressionQuality(100); //图片质量
                $image->setImageFormat("png");
                $image->writeImage($savePath); //保存图片
                return true;
                break;
            // pdf转png
            case 'pdf':
                $cmdStr = $gs . ' -dSAFER -dBATCH -dNOPAUSE -r300 -sDEVICE=pngalpha -dTextAlphaBits=4 -dMaxBitmap=2147483647 -dGraphicsAlphaBits=4 -sOutputFile="' . $savePath . '" -dEPSCrop ' . $filePath;
                exec($cmdStr, $errOut, $runStatus);
                if (!$runStatus) {
                    $image = new Imagick($savePath);
                    $image->stripImage(); //去除图片信息
                    $image->trimImage(0); //修剪空白透明区域
                    $image->setImageFormat("png");
                    $image->writeImage($savePath);
                    return true;
                }
                break;
            default:
                break;
        }
        return false;
    }

}
