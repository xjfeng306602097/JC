<?php
namespace app\controller;

use app\BaseController;
use think\facade\View;

class Index extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', 'index/index');

        View::assign('js_timestamp', time());

        return View::fetch('index/index');
    }

    public function info()
    {
        // 验证权限
        Self::checkLogin('page', 'index/info');

        View::assign('js_timestamp', time());

        return View::fetch('user/info');
    }

    public function password()
    {
        // 验证权限
        Self::checkLogin('page', 'index/password');

        View::assign('js_timestamp', time());

        return View::fetch('user/password');
    }

    public function test()
    {
        $this->username = Cookie::get('makroDigital_username');
        $this->token = Cookie::get('makroDigital_token');

        $url = API_HOST . '/makro-admin/api/v1/users/me';

        $authorization = "Bearer " . $this->token;

        $output = curlGet_https($url, $authorization);
        $out_json = json_decode($output);

        $object = json_decode(json_encode($out_json), true);

        return json($object);
    }

}
