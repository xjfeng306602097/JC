<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class MarketingPush extends BaseController
{

    // 推送任务
    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/push/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/push/index');
    }

    // 推送任务详情
    public function detail()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/push/detail");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/push/detail');
    }

    // 推送邮件
    public function email()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/push/email");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/push/email');
    }

    // 推送LINE
    public function line()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/push/line");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/push/line');
    }

    // 推送短信
    public function sms()
    {
        // 验证权限
        Self::checkLogin('page', "marketing/push/sms");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/push/sms');
    }

}
