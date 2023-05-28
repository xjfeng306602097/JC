<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class MarketingActivity extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/activity/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/activity/index');
    }

    public function quickAdd()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/activity/quickAdd");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/activity/quickAdd');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/activity/add");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/activity/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/activity/edit");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/activity/edit');
    }

    public function product()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/activity/product");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/activity/product');
    }

    //MM商品详细信息
    public function productDetails()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/activity/productDetails");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/activity/productDetails');
    }

    public function productImport()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/activity/productImport");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/activity/productImport');
    }

    public function selectTemplate()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/activity/selectTemplate");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/activity/selectTemplate');
    }

    public function design()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/activity/design");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/activity/design');
    }

    public function preview()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/activity/preview");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/activity/preview');
    }

    public function exportPDF()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/activity/exportPDF");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/activity/exportPDF');
    }

    public function publish()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/activity/publish");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/activity/publish');
    }

    public function publishDetail()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/activity/publishDetail");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/activity/publishDetail');
    }

}
