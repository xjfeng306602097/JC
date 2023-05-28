<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class Role extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "role/index");

        View::assign('js_timestamp', time());

        return View::fetch('role/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "role/add");

        View::assign('js_timestamp', time());

        return View::fetch('role/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "role/edit");

        View::assign('js_timestamp', time());

        return View::fetch('role/edit');
    }

    public function permission()
    {
        // 验证权限
        Self::checkLogin('page', "role/permission");

        View::assign('js_timestamp', time());

        return View::fetch('role/permission');
    }

    public function menu()
    {
        // 验证权限
        Self::checkLogin('page', "role/menu");

        View::assign('js_timestamp', time());

        return View::fetch('role/menu');
    }

    public function user()
    {
        // 验证权限
        Self::checkLogin('page', "role/user");

        View::assign('js_timestamp', time());

        return View::fetch('role/user');
    }

}
