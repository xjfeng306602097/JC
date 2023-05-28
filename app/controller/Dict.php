<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class Dict extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "dict/index");

        View::assign('js_timestamp', time());

        return View::fetch('dict/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "dict/add");

        View::assign('js_timestamp', time());

        return View::fetch('dict/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "dict/edit");

        View::assign('js_timestamp', time());

        return View::fetch('dict/edit');
    }

    public function child()
    {
        // 验证权限
        Self::checkLogin('page', "dict/child");

        View::assign('js_timestamp', time());

        return View::fetch('dict/child');
    }
    
}
