<?php
namespace app\controller;

use app\BaseController;
use think\facade\Request;
use think\facade\View;

class Login extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "login/index");

        View::assign('js_timestamp', time());

        $originUrl = Request::param('originUrl');
        View::assign('origin_url', $originUrl);

        return View::fetch('login/index');
    }

    public function forgot()
    {
        // 验证权限
        Self::checkLogin('page', "login/forgot");

        View::assign('js_timestamp', time());

        return View::fetch('login/forgot');
    }

    public function reset()
    {
        // 验证权限
        Self::checkLogin('page', "login/reset");

        View::assign('js_timestamp', time());

        return View::fetch('login/reset');
    }

}
