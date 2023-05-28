<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class MarketingTextthai extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/textthai/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/textthai/index');
    }

    public function detail()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/textthai/detail");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/textthai/detail');
    }

}
