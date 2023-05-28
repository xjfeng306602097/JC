<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class Menu extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "menu/index");

        View::assign('js_timestamp', time());

        return View::fetch('menu/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "menu/add");

        View::assign('js_timestamp', time());

        return View::fetch('menu/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "menu/edit");

        View::assign('js_timestamp', time());

        return View::fetch('menu/edit');
    }

}
