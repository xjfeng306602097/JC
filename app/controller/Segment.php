<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class Segment extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "segment/index");

        View::assign('js_timestamp', time());

        return View::fetch('segment/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "segment/add");

        View::assign('js_timestamp', time());

        return View::fetch('segment/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "segment/edit");

        View::assign('js_timestamp', time());

        return View::fetch('segment/edit');
    }

}
