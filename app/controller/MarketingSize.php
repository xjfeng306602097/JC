<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class MarketingSize extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/size/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/size/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/size/add");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/size/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/size/edit");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/size/edit');
    }

}
