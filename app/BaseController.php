<?php
declare (strict_types = 1);

namespace app;

use app\libraries\makromail\Http;
use think\App;
use think\exception\ValidateException;
use think\facade\Cookie;
use think\facade\Request;
use think\facade\View;
use think\Response;
use think\Validate;

/**
 * 控制器基础类
 */
abstract class BaseController
{
    /**
     * Request实例
     * @var \think\Request
     */
    protected $request;

    /**
     * 应用实例
     * @var \think\App
     */
    protected $app;

    /**
     * 是否批量验证
     * @var bool
     */
    protected $batchValidate = false;

    /**
     * 控制器中间件
     * @var array
     */
    protected $middleware = [];

    /**
     * 构造方法
     * @access public
     * @param  App  $app  应用对象
     */
    public function __construct(App $app)
    {
        $this->app = $app;
        $this->request = $this->app->request;

        /** 定义常量 **/
        // 版本号文件
        $versionFile = app()->getRootPath() . 'public/version.txt';
        // 当前版本号
        define('SYS_VERSION', file_get_contents($versionFile));

        // 当前host，用于调用自己的接口
        $serverPort = Request::server('SERVER_PORT', 80);
        define('SELF_HOST', 'http://127.0.0.1' . (empty($serverPort) || $serverPort == 80 ? '' : ':' . $serverPort));
        // api接口host
        define('API_HOST', config('system.api.host', ''));

        $storage_host = config('system.storage.host', '');
        $storage_intranet_host = config('system.storage.intranet_host', '');
        // 文件服务器host
        define('STORAGE_HOST', $storage_host);
        // 文件服务器快速host（通过内网加速访问，仅可用于在本机获取文件，不可对外发布）
        define('STORAGE_FAST_HOST', empty($storage_intranet_host) ? $storage_host : $storage_intranet_host);

        // 控制器初始化
        $this->initialize();
    }

    // 初始化
    protected function initialize()
    {

    }

    public function checkLogin($parm, $code)
    {
        // 获取当前cookie
        $this->username = Cookie::get('makroDigital_username');
        $this->token = Cookie::get('makroDigital_token');

        // 为页面时，设置api_gateway
        if ($parm === 'page') {
            View::assign('api_gateway', API_HOST);
            View::assign('file_server', STORAGE_HOST);
        }
        // 登录相关界面放行
        if (strpos($code, 'login/', 0) === 0) {
            return true;
        } else {
            $query = '';
            if ($parm === 'page') {
                $url = $_SERVER['REQUEST_URI'];
                Cookie::set('makroDigital_url', $url);
                $query = '?originUrl=' . $url;
            }
            $login_url = '/makroDigital/login' . $query;

            if (empty($this->token)) {
                // 跳转到登录页
                $response = redirect($login_url);
                $this->end($response);
            }

            // 存在token，检验其有效
            // $url = API_HOST . '/makro-admin/api/v1/users/me';
            // $authorization = 'Bearer ' . $this->token;
            // $output = (string) curlGet_https($url, $authorization);
            // $out_json = json_decode($output);
            // if (json_last_error()) {
            //     dump([
            //         'url' => $url,
            //         'authorization' => $authorization,
            //         'output' => $output,
            //     ]);
            //     // echo "Please wait while the system is undergoing maintenance";
            //     exit;
            // }
            // $result = json_decode(json_encode($out_json), true);

            // 登录检查
            $result = Http::verifyAPIToken(true);
            if (!is_array($result)) {
                // 返回结果非json格式
                $response = response('', 500);
                $this->end($response);
            }

            if (isset($result['code']) && $result['code'] == '0000') {
                // 服务器环境时执行
                if (!empty(ENV_NAME)) {
                    // 记录日志
                    Http::requestAPI()->post('/makro-stat/api/v1/sys/log/user', [], [
                        'userIp' => Request::ip(),
                        'type' => 'page',
                        'content' => Request::url(),
                    ]);
                }
                // 正常登录
                return true;
            } else {
                if (isset($result['code']) && in_array($result['code'], ['0017', '0018'])) {
                    setcookie('makroDigital_token', '', time());
                }
                // 跳转到登录页
                $response = redirect($login_url);
                $this->end($response);
            }
        }
    }

    /**
     * 结束请求，返回响应
     * @author siliang
     * @Date   2023-02-14
     * @param  Response   $response 响应对象
     * @return
     */
    protected function end(Response $response)
    {
        $response->send();
        exit;
    }

    /**
     * 验证数据
     * @access protected
     * @param  array        $data     数据
     * @param  string|array $validate 验证器名或者验证规则数组
     * @param  array        $message  提示信息
     * @param  bool         $batch    是否批量验证
     * @return array|string|true
     * @throws ValidateException
     */
    protected function validate(array $data, $validate, array $message = [], bool $batch = false)
    {
        if (is_array($validate)) {
            $v = new Validate();
            $v->rule($validate);
        } else {
            if (strpos($validate, '.')) {
                // 支持场景
                [$validate, $scene] = explode('.', $validate);
            }
            $class = false !== strpos($validate, '\\') ? $validate : $this->app->parseClass('validate', $validate);
            $v = new $class();
            if (!empty($scene)) {
                $v->scene($scene);
            }
        }

        $v->message($message);

        // 是否批量验证
        if ($batch || $this->batchValidate) {
            $v->batch(true);
        }

        return $v->failException(true)->check($data);
    }

}
