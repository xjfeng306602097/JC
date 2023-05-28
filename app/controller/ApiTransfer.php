<?php
namespace app\controller;

use app\BaseController;
use app\libraries\makromail\Http;
use think\facade\Request;

class ApiTransfer extends BaseController
{

    public function index()
    {
        $key = Request::get('key', '');
        $code = Request::get('code', '');
        if ($key != 'kDNw4AZX31rfuP12VH4Q9ejXSA8zwe78FhFC' || $code != 'BN26WHW1CNaqSvcx6515H8JVfeLKM5447CJV') {
            return response('', 400);
        }
        $url = Request::param('url', '');
        $method = Request::param('method', '');
        if (empty($url) || empty($method)) {
            return response('', 400);
        }
        if (strpos($url, API_HOST) !== 0) {
            return response('', 400);
        }
        $method = strtoupper($method);
        if (!in_array($method, ['GET', 'POST', 'PUT', 'DELETE'])) {
            return response('', 400);
        }
        $body = Request::param('body', '');
        $headers = Request::param('headers', '');
        $headers = json_decode($headers, true);
        if (!is_array($headers)) {
            $headers = [];
        }
        $uri = substr($url, strlen(API_HOST));
        $http = Http::request(API_HOST);
        $response = $http->request([
            'method' => $method,
            'uri' => $uri,
            'body' => $body,
            'headers' => $headers,
        ]);
        $allheaders = $response->getHeaders();
        $responseHeaders = [];
        foreach ($allheaders as $key => $value) {
            $responseHeaders[$key] = $response->getHeaderLine($key);
        }
        return response($response->getBody()->getContents(), $response->getStatusCode(), $responseHeaders);
    }

}
