<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class MemberType extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "member/type/index");

        View::assign('js_timestamp', time());

        return View::fetch('member/type/index');
    }

    public function add()
    {
        // 验证权限
        Self::checkLogin('page', "member/type/add");

        View::assign('js_timestamp', time());

        return View::fetch('member/type/add');
    }

    public function edit()
    {
        // 验证权限
        Self::checkLogin('page', "member/type/edit");

        View::assign('js_timestamp', time());

        return View::fetch('member/type/edit');
    }

}
