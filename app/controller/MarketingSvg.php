<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

// SVG图案模块，设计时可引入
class MarketingSvg extends BaseController
{
    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/svg/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/svg/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/svg/add");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/svg/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/svg/edit");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/svg/edit');
    }

}
