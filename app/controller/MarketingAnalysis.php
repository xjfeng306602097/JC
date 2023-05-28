<?php
namespace app\controller;

use app\BaseController;
use think\facade\Request;
use think\facade\View;

class MarketingAnalysis extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/analysis/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/analysis/index');
    }

    public function panel()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/analysis/panel");

        View::assign('js_timestamp', time());

        // 设置mmCode
        $pathArr = explode('/', Request::pathinfo());
        View::assign('mmCode', $pathArr[count($pathArr) - 1]);

        return View::fetch('marketing/analysis/panel');
    }

    public function behavior()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/analysis/behavior");

        View::assign('js_timestamp', time());

        // 设置mmCode
        $pathArr = explode('/', Request::pathinfo());
        View::assign('mmCode', $pathArr[count($pathArr) - 1]);

        return View::fetch('marketing/analysis/behavior');
    }

    public function advanced()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/analysis/advanced");

        View::assign('js_timestamp', time());

        // 设置mmCode
        $pathArr = explode('/', Request::pathinfo());
        View::assign('mmCode', $pathArr[count($pathArr) - 1]);

        return View::fetch('marketing/analysis/advanced');
    }

    public function product()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/analysis/product");

        View::assign('js_timestamp', time());

        // 设置mmCode
        $pathArr = explode('/', Request::pathinfo());
        View::assign('mmCode', $pathArr[count($pathArr) - 1]);

        return View::fetch('marketing/analysis/product');
    }

    public function source()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/analysis/source");

        View::assign('js_timestamp', time());

        // 设置mmCode
        $pathArr = explode('/', Request::pathinfo());
        View::assign('mmCode', $pathArr[count($pathArr) - 1]);

        return View::fetch('marketing/analysis/source');
    }

    public function visitor()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/analysis/visitor");

        View::assign('js_timestamp', time());

        // 设置mmCode
        $pathArr = explode('/', Request::pathinfo());
        View::assign('mmCode', $pathArr[count($pathArr) - 1]);

        return View::fetch('marketing/analysis/visitor');
    }

    public function productClick()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/analysis/productClick");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/analysis/productClick');
    }

}
