<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class ProductPicture extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "product/picture/index");

        View::assign('js_timestamp', time());
        View::assign('is_all', true);

        return View::fetch('product/picture/index');
    }

    public function batch()
    {
        // 验证权限
        Self::checkLogin('page', "product/picture/batch");

        View::assign('js_timestamp', time());

        return View::fetch('product/picture/batch');
    }

}
