<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class ProductIcon extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "product/icon/index");

        View::assign('js_timestamp', time());

        return View::fetch('product/icon/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "product/icon/add");

        View::assign('js_timestamp', time());

        return View::fetch('product/icon/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "product/icon/edit");

        View::assign('js_timestamp', time());

        return View::fetch('product/icon/edit');
    }

    public function pictureSelect()
    {
        // 验证权限
        Self::checkLogin('page', "product/icon/select");

        View::assign('js_timestamp', time());

        return View::fetch('product/icon/select');
    }

}
