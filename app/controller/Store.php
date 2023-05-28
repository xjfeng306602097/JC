<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class Store extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "store/index");

        View::assign('js_timestamp', time());

        return View::fetch('store/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "store/add");

        View::assign('js_timestamp', time());

        return View::fetch('store/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "store/edit");

        View::assign('js_timestamp', time());

        return View::fetch('store/edit');
    }

}
