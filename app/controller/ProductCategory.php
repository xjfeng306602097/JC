<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class ProductCategory extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "product/category/index");

        View::assign('js_timestamp', time());

        return View::fetch('product/category/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "product/category/add");

        View::assign('js_timestamp', time());

        return View::fetch('product/category/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "product/category/edit");

        View::assign('js_timestamp', time());

        return View::fetch('product/category/edit');
    }

}
