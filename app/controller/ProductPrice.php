<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class ProductPrice extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "product/price/index");

        View::assign('js_timestamp', time());

        return View::fetch('product/price/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "product/price/add");

        View::assign('js_timestamp', time());

        return View::fetch('product/price/add');
    }

}
