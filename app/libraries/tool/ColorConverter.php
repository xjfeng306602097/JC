<?php
namespace app\libraries\tool;

use Intervention\Image\ImageManagerStatic as Image;
use \Imagick;
use \ImagickPixel;

/**
 * 颜色转换器
 */
class ColorConverter
{

    protected $icc_RGB;

    protected $icc_CMYK;

    public function __construct()
    {
        $this->icc_RGB = app()->getRootPath() . 'resource/icc/RGB/sRGB IEC61966-21.icc';
        $this->icc_CMYK = app()->getRootPath() . 'resource/icc/CMYK/US Web Coated (SWOP) v2.icc';
        // 设置驱动为imagick
        Image::configure(['driver' => 'imagick']);
    }

    // RGB转换CMYK
    public function RGBToCMYK($color)
    {
        $randNum = $this->createUuid();
        $tempFileType = "jpg";
        $convertFile = app()->getRootPath() . "runtime/temp/" . $randNum . "-rgb.jpg";
        $convertFileCmyk = app()->getRootPath() . "runtime/temp/" . $randNum . "-rgb-cmyk.jpg";

        $sourceColor = "rgb(" . $color . ")";

        $width = 9;
        $height = 9;

        $img = new Imagick();
        $img->newImage($width, $height, new ImagickPixel($sourceColor), $tempFileType);
        $img = Image::make($img);

        $img_core = $img->getCore();

        $img_core->setImageUnits(Imagick::RESOLUTION_PIXELSPERINCH);
        $img_core->setImageResolution(72, 72);
        $iccFile = file_get_contents($this->icc_RGB);
        $img_core->profileImage('icc', $iccFile);
        $img_core->transformimagecolorspace(Imagick::COLORSPACE_SRGB);
        $img->save($convertFile, 100, 'jpg');
        $img->destroy();

        $img2 = new Imagick($convertFile);
        //$img2->readImage($convertFile);
        $img2 = Image::make($img2);
        $img2->opacity(100);
        $img2_core = $img2->getCore();
        $img2_core->setImageUnits(Imagick::RESOLUTION_PIXELSPERINCH);
        $img2_core->setImageResolution(72, 72);
        $iccFile = file_get_contents($this->icc_CMYK);
        $img2_core->profileImage('icc', $iccFile);
        $img2_core->transformimagecolorspace(Imagick::COLORSPACE_CMYK);
        $img2->save($convertFileCmyk, 100, 'jpg');
        $img2->destroy();

        $image = new Imagick($convertFileCmyk);
        $pixel_iterator = $image->getPixelIterator();
        foreach ($pixel_iterator as $y => $pixels) {
            $imageColor[$y] = [];
            foreach ($pixels as $x => $pixel) {
                if ($y == 5 and $x == 5) {

                    $c = $this->valueOperation($pixel->getColorValue(Imagick::COLOR_CYAN));
                    $m = $this->valueOperation($pixel->getColorValue(Imagick::COLOR_MAGENTA));
                    $y = $this->valueOperation($pixel->getColorValue(Imagick::COLOR_YELLOW));
                    $k = $this->valueOperation($pixel->getColorValue(Imagick::COLOR_BLACK));

                    if (file_exists($convertFile)) {
                        chmod($convertFile, 0777);
                        unlink($convertFile);
                        unlink($convertFileCmyk);
                    }
                    return $c . ',' . $m . ',' . $y . ',' . $k;

                }
            }
        }
        return '';
    }

    // CMYK转换RGB
    public function CMYKToRGB($color)
    {
        $randNum = $this->createUuid();

        $tempFileType = "jpg";
        $convertFile = app()->getRootPath() . "runtime/temp/" . $randNum . "-cmyk.jpg";

        $cArr = explode(",", $color);
        $c = round($cArr[0] * 2.55);
        $m = round($cArr[1] * 2.55);
        $y = round($cArr[2] * 2.55);
        $k = round($cArr[3] * 2.55);
        $color = $c . ',' . $m . ',' . $y . ',' . $k;

        $sourceColor = "cmyk(" . $color . ")";

        $width = 9;
        $height = 9;

        $img = new Imagick();
        $img->newImage($width, $height, new ImagickPixel($sourceColor), $tempFileType);
        $img = Image::make($img);

        $img_core = $img->getCore();

        $img_core->setImageUnits(Imagick::RESOLUTION_PIXELSPERINCH);
        $img_core->setImageResolution(72, 72);
        $iccFile = file_get_contents($this->icc_CMYK);
        $img_core->profileImage('icc', $iccFile);
        $img->save($convertFile, 100, 'jpg');

        $img = new Imagick();
        $img->readImage($convertFile);
        $img = Image::make($img);
        $img->opacity(100);
        $img_core = $img->getCore();
        $img_core->setImageUnits(Imagick::RESOLUTION_PIXELSPERINCH);
        $img_core->setImageResolution(72, 72);
        $iccFile = file_get_contents($this->icc_RGB);
        $img_core->profileImage('icc', $iccFile);
        $img_core->transformimagecolorspace(Imagick::COLORSPACE_SRGB);
        $img->save($convertFile, 100, 'jpg');
        $img->destroy();

        $image = new Imagick($convertFile);
        $pixel_iterator = $image->getPixelIterator();

        foreach ($pixel_iterator as $y => $pixels) {
            $imageColor[$y] = [];
            foreach ($pixels as $x => $pixel) {
                if ($y == 5 and $x == 5) {
                    $color = $pixel->getColor(true);
                    $r = $color['r'] * 255;
                    $g = $color['g'] * 255;
                    $b = $color['b'] * 255;

                    if (file_exists($convertFile)) {
                        chmod($convertFile, 0777);
                        unlink($convertFile);
                    }
                    return $r . ',' . $g . ',' . $b;

                }
            }
        }
        return '';
    }

    protected function createUuid()
    {
        $chars = md5(uniqid(mt_rand(), true));
        // $chars = substr($chars, 0, 8) . '-'
        // . substr($chars, 8, 4) . '-'
        // . substr($chars, 12, 4) . '-'
        // . substr($chars, 16, 4) . '-'
        // . substr($chars, 20, 12);
        return $chars;
    }

    protected function valueOperation($num)
    {
        if ($num > 0.00 and $num * 100 < 1) {
            return 1;
        } else {
            $num = round($num, 2) * 100;
            if ($num > 100) {
                return 100;
            } else {
                return $num;
            }
        }
    }

}
