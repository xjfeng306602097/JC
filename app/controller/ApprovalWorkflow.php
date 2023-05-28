<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class ApprovalWorkflow extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "approval/workflow/index");

        View::assign('js_timestamp', time());

        return View::fetch('approval/workflow/index');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "approval/workflow/edit");

        View::assign('js_timestamp', time());

        return View::fetch('approval/workflow/edit');
    }

    public function flowchart()
    {
        // 验证权限
        Self::checkLogin('page', "approval/workflow/flowchart");

        View::assign('js_timestamp', time());

        return View::fetch('approval/workflow/flowchart');
    }

}
