<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class ApprovalApplication extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "approval/application/index");

        View::assign('js_timestamp', time());

        return View::fetch('approval/application/index');
    }

}
