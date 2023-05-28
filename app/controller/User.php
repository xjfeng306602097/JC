<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class User extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "user/index");

        View::assign('js_timestamp', time());

        return View::fetch('user/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "user/add");

        View::assign('js_timestamp', time());

        return View::fetch('user/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "user/edit");

        View::assign('js_timestamp', time());

        return View::fetch('user/edit');
    }

    public function info()
    {
        // 验证权限
        Self::checkLogin('page', "user/info");

        View::assign('js_timestamp', time());

        return View::fetch('user/info');
    }

    public function password()
    {
        // 验证权限
        Self::checkLogin('page', "user/password");

        View::assign('js_timestamp', time());

        return View::fetch('user/password');
    }

    public function log()
    {
        // 验证权限
        Self::checkLogin('page', "user/log");

        View::assign('js_timestamp', time());

        return View::fetch('user/log');
    }

}
