<?php
namespace app\libraries\services;

use GuzzleHttp\Client;
use GuzzleHttp\Cookie\CookieJar;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Handler\CurlHandler;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Psr7\Utils;
use Psr\Http\Message\ResponseInterface;
use think\facade\Log;
use think\File;

class API
{

    protected $domain = '';

    protected $cookies = false;

    protected $config = [];

    protected $retries = 0;

    /**
     * @var Client
     */
    protected $client;

    protected $handlerStack;

    protected $lastRequest;

    /**
     * GuzzleRetry constructor.
     */
    public function __construct($domain = '', $retries = 0)
    {
        $this->retries = $retries;
        if (empty($this->retries)) {
            // 创建 Handler
            $this->handlerStack = HandlerStack::create(new CurlHandler());
            $this->handlerStack->push(Middleware::retry($this->retryDecider(), $this->retryDelay()));
        } else {
            $this->handlerStack = null;
        }
        $domain = empty($domain) ? $this->domain : $domain;
        $this->resetDomain($domain);
    }

    public function resetDomain($domain = '')
    {
        $this->client = new Client([
            'base_uri' => $domain,
            'handler' => $this->handlerStack,
        ]);
        $this->domain = $domain;
        $this->setConfig('headers', []);
        if ($this->cookies !== false) {
            $this->cookies->clear();
        }
        if (method_exists($this, 'mockRequest')) {
            $this->mockRequest();
        }
    }

    public function setCookies($cookies = null)
    {
        if (is_null($cookies)) {
            $this->cookies = false;
        } else {
            $domain = parse_url($this->domain, PHP_URL_HOST);
            $this->cookies = CookieJar::fromArray($cookies, $domain);
        }
    }

    /**
     * 设置全局默认参数
     * @param $key 键名
     * @param $value 对应的值，如果为null则删除对应的配置
     */
    public function setConfig($key, $value)
    {
        if (is_string($key)) {
            if (is_null($value)) {
                if (isset($this->config[$key])) {
                    unset($this->config[$key]);
                }
            } else {
                $this->config[$key] = $value;
            }
        }
    }

    /**
     * 清除全局默认参数
     */
    public function clearConfig()
    {
        $this->config = [
            'headers' => [],
        ];
    }

    /**
     * retryDecider
     * 返回一个匿名函数, 匿名函数若返回false 表示不重试，反之则表示继续重试
     * @return Closure
     */
    protected function retryDecider()
    {
        return function (
            $retries,
            Request $request,
            Response $response = null,
            \Exception $exception = null
        ) {
            // 超过最大重试次数，不再重试
            if ($retries >= $this->retries) {
                return false;
            }
            // 请求失败，继续重试
            if ($exception instanceof ConnectException) {
                return true;
            }
            if ($response) {
                // 如果请求有响应，但是状态码大于等于500，继续重试(这里根据自己的业务而定)
                if ($response->getStatusCode() >= 500) {
                    return true;
                }
            }
            return false;
        };
    }

    /**
     * 返回一个匿名函数，该匿名函数返回下次重试的时间（毫秒）
     * @return Closure
     */
    protected function retryDelay()
    {
        return function ($numberOfRetries) {
            return 1 * $numberOfRetries;
        };
    }

    /**
     * 发送post请求
     * @return mixed
     */
    public function post($uri, $header = [], $data = [])
    {
        $this->storeRequestInfo('post', [$uri, $header, $data]);
        try {
            $array = [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ];
            $header = array_merge($array, $this->config['headers'], $header);
            if (is_array($data)) {
                $data = json_encode($data);
            }
            $options = array_merge([
                'verify' => false,
                'http_errors' => false,
                'timeout' => 10,
            ], $this->config, [
                'headers' => $header,
                'body' => $data,
                'cookies' => $this->cookies,
            ]);
            $response = $this->client->post($uri, $options);
            return $this->getResult($response, $header);
        } catch (RequestException $e) {
            Log::record($e->getMessage());
        } catch (\Exception $e) {
            Log::record($e->getMessage());
        }
        return false;
    }

    /**
     * 发送get请求
     * @return mixed
     */
    public function get($uri, $header = [], $is_permeate = false)
    {
        $this->storeRequestInfo('get', [$uri, $header, $is_permeate]);
        try {
            $array = [];
            if ($is_permeate) {
                $array = [
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36 Chrome 17.0 – MAC',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                    'Referer' => $this->domain,
                ];
            }
            $header = array_merge($array, $this->config['headers'], $header);
            $options = array_merge([
                'verify' => false,
                'http_errors' => false,
                'timeout' => 10,
            ], $this->config, [
                'headers' => $header,
                'cookies' => $this->cookies,
            ]);
            $response = $this->client->get($uri, $options);
            $statusCode = $response->getStatusCode();
            return $this->getResult($response, $header);
        } catch (RequestException $e) {
            Log::record($e->getMessage());
        } catch (\Exception $e) {
            Log::record($e->getMessage());
        }
        return false;
    }

    /**
     * 发送上传文件请求（post类型）
     * @return mixed
     */
    public function uploadFile($uri, $header = [], $formData = [])
    {
        $this->storeRequestInfo('uploadFile', [$uri, $header, $formData]);
        try {
            $array = [
                'Accept' => 'application/json',
            ];
            $header = array_merge($array, $this->config['headers'], $header);
            if (!is_array($formData)) {
                return false;
            }
            $multipart = [];
            foreach ($formData as $name => $value) {
                $item = [];
                $item['name'] = $name;
                if ($value instanceof File) {
                    $item['contents'] = Utils::tryFopen($value, 'r');
                    $item['filename'] = method_exists($value, 'getOriginalName') ? $value->getOriginalName() : $value->getFilename();
                } else {
                    $item['contents'] = $value;
                }
                $multipart[] = $item;
            }
            $options = array_merge([
                'verify' => false,
                'http_errors' => false,
                'timeout' => 60,
            ], $this->config, [
                'headers' => $header,
                'multipart' => $multipart,
                'cookies' => $this->cookies,
            ]);
            $response = $this->client->post($uri, $options);
            return $this->getResult($response, $header);
        } catch (RequestException $e) {
            Log::record($e->getMessage());
        } catch (\Exception $e) {
            Log::record($e->getMessage());
        }
        return false;
    }

    /**
     * 下载文件到指定地址
     * @return bool
     */
    public function downloadFile($uri, $savePath = null, $header = [])
    {
        $this->storeRequestInfo('downloadFile', [$uri, $savePath, $header]);
        try {
            $header = array_merge($this->config['headers'], $header);
            $options = array_merge([
                'verify' => false,
                'http_errors' => false,
                'timeout' => 60,
            ], $this->config, [
                'headers' => $header,
                'cookies' => $this->cookies,
            ]);
            if (!empty($savePath)) {
                $options['sink'] = Utils::tryFopen($savePath, 'w+');
            }
            $response = $this->client->get($uri, $options);
            if ($response->getStatusCode() === 200) {
                return true;
            }
        } catch (RequestException $e) {
            Log::record($e->getMessage());
        } catch (\Exception $e) {
            Log::record($e->getMessage());
        }
        if (!empty($savePath) && is_file($savePath)) {
            unlink($savePath);
        }
        return false;
    }

    /**
     * 通用请求方法
     * @return mixed
     */
    public function request($params)
    {
        $uri = $params['uri'];
        if (empty($uri)) {
            return false;
        }
        $this->storeRequestInfo('request', [$params]);
        $method = $params['method'] ?? 'GET';
        $header = $params['headers'] ?? [];
        $body = $params['body'] ?? null;
        try {
            $header = array_merge($this->config['headers'], $header);
            $options = array_merge([
                'verify' => false,
                'http_errors' => false,
                'timeout' => 20,
            ], $this->config, [
                'headers' => $header,
                'body' => $body,
                'cookies' => $this->cookies,
            ]);
            $response = $this->client->request($method, $uri, $options);
            return $response;
        } catch (RequestException $e) {
            Log::record($e->getMessage());
        } catch (\Exception $e) {
            Log::record($e->getMessage());
        }
        return false;
    }

    /**
     * 根据上次请求时的入参，重新发起一次请求
     * @return mixed
     */
    public function againRequest(...$params)
    {
        if (!empty($this->lastRequest)) {
            $method = $this->lastRequest['method'];
            $requestParams = $params + $this->lastRequest['requestParams'];
            $this->$method(...$requestParams);
        }
        return false;
    }

    /**
     * 获取response对象中的返回结果
     * @return mixed
     */
    protected function getResult(ResponseInterface $response, $header = [])
    {
        $contentType = $response->getHeaderLine('Content-Type');
        $result = $response->getBody()->getContents();
        $typeArray = explode(';', $contentType);
        if (!empty($header['Accept'])) {
            $typeArray = array_merge($typeArray, explode(';', $header['Accept']));
        }
        $typeArray = array_map('trim', $typeArray);
        if (in_array('application/json', $typeArray)) {
            $json = json_decode($result, true);
            if (json_last_error() == JSON_ERROR_NONE) {
                return $json;
            }
        }
        return $result;
    }

    /**
     * 存储当前请求的信息
     */
    protected function storeRequestInfo($method, $requestParams = [])
    {
        $this->lastRequest['method'] = $method;
        $this->lastRequest['requestParams'] = $requestParams;
    }

}
