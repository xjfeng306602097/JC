<?php
namespace app;

// 应用请求对象类
class Request extends \think\Request
{

    public function __construct()
    {
        $serverIp = $_SERVER['SERVER_ADDR'] ?? '';
        $this->proxyServerIp = ['127.0.0.1', $serverIp];
        parent::__construct();
    }

    public function ip(): string
    {
        if (!empty($this->realIP)) {
            return $this->realIP;
        }
        $this->realIP = $this->server('HTTP_X_ORIGINAL_FORWARDED_FOR', '');
        if (empty($this->realIP)) {
            return parent::ip();
        }
        return $this->realIP;
    }

}
