<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class MarketingComponent extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/component/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/component/add");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/component/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/component/edit");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/component/edit');
    }

    public function design()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/component/design");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/component/design');
    }

}
