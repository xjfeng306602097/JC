<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class Department extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "department/index");

        View::assign('js_timestamp', time());

        return View::fetch('department/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "department/add");

        View::assign('js_timestamp', time());

        return View::fetch('department/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "department/edit");

        View::assign('js_timestamp', time());

        return View::fetch('department/edit');
    }

}
