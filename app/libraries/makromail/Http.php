<?php
namespace app\libraries\makromail;

use app\libraries\services\API;
use think\facade\Cookie;
use think\facade\Request;

class Http
{

    protected static $api;

    protected static $apiHost = '';

    public static function request($domain)
    {
        return new API($domain);
    }

    public static function requestAPI()
    {
        if (empty(self::$apiHost) && config('system.api.intranet_same', false)) {
            $intranetIp = self::getAPIIntranetIp();
            if (!empty($intranetIp)) {
                // 同域，API走内网
                self::$apiHost = 'http://' . $intranetIp . ':9999';
            }
        }
        if (empty(self::$apiHost)) {
            self::$apiHost = API_HOST;
        }
        $http = self::request(self::$apiHost);
        $token = Cookie::get('makroDigital_token');
        $language = Request::header('Makro-Accept-Language', 'en_US');
        $http->setConfig('headers', [
            'Authorization' => 'Bearer ' . $token,
            'Makro-Accept-Language' => $language,
            'Accept' => 'application/json',
        ]);
        return $http;
    }

    /**
     * 验证API token
     * @author siliang
     * @Date   2023-02-14
     * @param  string     $isResult 是否返回响应结果
     * @param  string     $token    token值
     * @return mixed
     */
    public static function verifyAPIToken($isResult = true, $token = null)
    {
        if ($token === null || $token === true) {
            $token = Cookie::get('makroDigital_token');
        }
        $http = self::request(API_HOST);
        $language = Request::header('Makro-Accept-Language', 'en_US');
        $uri = '/check';
        // $uri = '/makro-admin/api/v1/users/me';
        $result = $http->get($uri, [
            'Authorization' => 'Bearer ' . $token,
            'Makro-Accept-Language' => $language,
        ]);
        if (!$isResult) {
            if (is_array($result) && isset($result['code']) && $result['code'] == '0000') {
                return true;
            } else {
                return false;
            }
        }
        return $result;
    }

    /**
     * 获取API服务器的内网IP
     * @author siliang
     * @Date   2022-10-12
     * @return string
     */
    public static function getAPIIntranetIp()
    {
        $http = self::request(API_HOST);
        $result = $http->get('/ipAddress');
        if (isset($result['code']) && $result['code'] == '0000') {
            if (isset($result['data'][0])) {
                return $result['data'][0];
            }
        }
        return '';
    }

}
