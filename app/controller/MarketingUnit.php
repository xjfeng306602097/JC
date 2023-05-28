<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class MarketingUnit extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/unit/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/unit/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/unit/add");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/unit/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/unit/edit");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/unit/edit');
    }

}
