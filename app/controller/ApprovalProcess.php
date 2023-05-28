<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class ApprovalProcess extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "approval/process/index");

        View::assign('js_timestamp', time());

        return View::fetch('approval/process/index');
    }

    public function myApproval()
    {
        // 验证权限
        Self::checkLogin('page', "approval/process/myApproval");

        View::assign('js_timestamp', time());

        return View::fetch('approval/process/myApproval');
    }

    public function myApplication()
    {
        // 验证权限
        Self::checkLogin('page', "approval/process/myApplication");

        View::assign('js_timestamp', time());

        return View::fetch('approval/process/myApplication');
    }

    public function approve()
    {
        // 验证权限
        Self::checkLogin('page', "approval/process/approve");

        View::assign('js_timestamp', time());

        return View::fetch('approval/process/approve');
    }

    public function approveDetail()
    {
        // 验证权限
        Self::checkLogin('page', "approval/process/approveDetail");

        View::assign('js_timestamp', time());

        return View::fetch('approval/process/approveDetail');
    }

}
