<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class MessageTemplate extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "message/template/index");

        View::assign('js_timestamp', time());

        return View::fetch('message/template/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "message/template/add");

        View::assign('js_timestamp', time());

        return View::fetch('message/template/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "message/template/edit");

        View::assign('js_timestamp', time());

        return View::fetch('message/template/edit');
    }

    public function select()
    {
        // 验证权限
        Self::checkLogin('page', "message/template/select");

        View::assign('js_timestamp', time());

        return View::fetch('message/template/select');
    }

}
