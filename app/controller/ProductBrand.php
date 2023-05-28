<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class ProductBrand extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "product/brand/index");

        View::assign('js_timestamp', time());

        return View::fetch('product/brand/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "product/brand/add");

        View::assign('js_timestamp', time());

        return View::fetch('product/brand/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "product/brand/edit");

        View::assign('js_timestamp', time());

        return View::fetch('product/brand/edit');
    }

    public function pictureSelect()
    {
        // 验证权限
        Self::checkLogin('page', "product/brand/select");

        View::assign('js_timestamp', time());

        return View::fetch('product/brand/select');
    }

}
