<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class MarketingDesign extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/design/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/design/index');
    }

}
