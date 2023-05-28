<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class MarketingElement extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/element/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/element/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/element/add");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/element/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/element/edit");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/element/edit');
    }

    public function select()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/element/select");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/element/select');
    }

}
