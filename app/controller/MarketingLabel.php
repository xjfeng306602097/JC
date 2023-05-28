<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

// Label，Component设计时可引入
class MarketingLabel extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/label/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/label/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/label/add");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/label/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/label/edit");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/label/edit');
    }

}
