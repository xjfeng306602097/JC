<?php
namespace app\controller;

use app\BaseController;
use app\libraries\makromail\Http;
use think\facade\View;

class Setting extends BaseController
{

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "setting/index");

        View::assign('js_timestamp', time());

        // 获取所有短信发送渠道
        $api = Http::requestAPI();
        $result = $api->get('/makro-message/api/v1/sms/channels');
        $sms_channels = [];
        if (!empty($result['data'])) {
            $sms_channels = $result['data'];
        }
        View::assign('sms_channels', $sms_channels);

        return View::fetch('setting/index');
    }

}
