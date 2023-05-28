<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class MemberCustomer extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "member/customer/index");

        View::assign('js_timestamp', time());

        return View::fetch('member/customer/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "member/customer/add");

        View::assign('js_timestamp', time());

        return View::fetch('member/customer/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "member/customer/edit");

        View::assign('js_timestamp', time());

        return View::fetch('member/customer/edit');
    }

    public function import()
    {
        // 验证权限
        Self::checkLogin('page', "member/customer/import");

        View::assign('js_timestamp', time());

        return View::fetch('member/customer/import');
    }

}
