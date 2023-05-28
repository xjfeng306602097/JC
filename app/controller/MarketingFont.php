<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class MarketingFont extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/font/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/font/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/font/add");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/font/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/font/edit");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/font/edit');
    }

}
