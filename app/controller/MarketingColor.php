<?php
namespace app\controller;

use app\BaseController;
use app\libraries\tool\ColorConverter;
use think\facade\Request;
use think\facade\View;

class MarketingColor extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/color/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/color/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/color/add");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/color/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/color/edit");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/color/edit');
    }

    // 转换颜色接口，rgb=>cmyk，cmyk=>rgb
    public function convert()
    {
        $color = Request::param('color', '');
        $colorMode = Request::param('colorMode', 'rgb');
        // 如果colorMode=rgb，则转为cmyk，如果colorMode=cmyk，则转为rgb。
        $convertMode = '';
        $colorConverter = new ColorConverter();
        if ($colorMode == 'rgb') {
            $convertMode = 'cmyk';
            $convertColor = $colorConverter->RGBToCMYK($color);
        } else if ($colorMode == 'cmyk') {
            $convertMode = 'rgb';
            $convertColor = $colorConverter->CMYKToRGB($color);
        }
        return json(['color' => $convertColor, 'colorMode' => $convertMode]);
    }

}
