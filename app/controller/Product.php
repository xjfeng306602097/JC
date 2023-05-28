<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class Product extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "product/index");

        View::assign('js_timestamp', time());

        return View::fetch('product/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "product/add");

        View::assign('js_timestamp', time());

        return View::fetch('product/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "product/edit");

        View::assign('js_timestamp', time());

        return View::fetch('product/edit');
    }

    public function price()
    {
        // 验证权限
        Self::checkLogin('page', "product/price/index");

        View::assign('js_timestamp', time());

        return View::fetch('product/price/index');
    }

    public function picture()
    {
        // 验证权限
        Self::checkLogin('page', "product/picture/index");

        View::assign('js_timestamp', time());

        return View::fetch('product/picture/index');
    }

    public function pictureSelect()
    {
        // 验证权限
        Self::checkLogin('page', "product/picture/select");

        View::assign('js_timestamp', time());

        return View::fetch('product/picture/select');
    }

    public function activity()
    {
        // 验证权限
        Self::checkLogin('page', "product/activity/index");

        View::assign('js_timestamp', time());

        return View::fetch('product/activity/index');
    }

    public function linkProductSelect()
    {
        // 验证权限
        Self::checkLogin('page', "product/linkProduct/select");

        View::assign('js_timestamp', time());

        return View::fetch('product/linkProduct/select');
    }

}
