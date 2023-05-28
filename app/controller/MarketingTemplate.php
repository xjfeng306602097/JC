<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class MarketingTemplate extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/template/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/template/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/template/add");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/template/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/template/edit");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/template/edit');
    }

    public function design()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/template/design");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/template/design');
    }

    //模板图层弹出页
    public function level()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/template/level");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/template/level');
    }

    //页面版本(也就是原先的副本概念)列表
    public function duplicate()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/template/duplicate");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/template/duplicate');
    }

    //模板各页预览
    public function preview()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/template/preview");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/template/preview');
    }

    //导入其他模板单页
    public function importPage()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/template/importPage");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/template/importPage');
    }

    //配置textthai与设计页面的绑定
    public function configDesignFrame()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/template/configDesignFrame");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/template/configDesignFrame');
    }

    //预览textthai与一版多页
    public function previewDesignFrame()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/template/previewDesignFrame");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/template/previewDesignFrame');
    }

}
