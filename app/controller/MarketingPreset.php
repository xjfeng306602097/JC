<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

// 预设模块，给template用
class MarketingPreset extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/preset/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/preset/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/preset/add");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/preset/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/preset/edit");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/preset/edit');
    }

}
