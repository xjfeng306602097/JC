<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class Permission extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "permission/index");

        View::assign('js_timestamp', time());

        return View::fetch('permission/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "permission/add");

        View::assign('js_timestamp', time());

        return View::fetch('permission/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "permission/edit");

        View::assign('js_timestamp', time());

        return View::fetch('permission/edit');
    }

}
