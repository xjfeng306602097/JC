<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class Home extends BaseController
{

    public function console()
    {
        // 验证权限
        Self::checkLogin('page', 'home/console');

        View::assign('js_timestamp', time());

        return View::fetch('home/console');
    }

}
