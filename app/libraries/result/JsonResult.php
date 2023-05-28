<?php
namespace app\libraries\result;

trait JsonResult
{

    /**
     * 返回成功信息
     * @author siliang
     * @Date   2022-03-31
     * @param  string     $message 提示信息
     * @param  array      $data    其他数据
     * @return \think\response\Json
     */
    protected function success(string $message = 'success', array $data = [])
    {
        return $this->result('0000', $message, $data);
    }

    /**
     * 返回错误信息
     * @author siliang
     * @Date   2022-03-31
     * @param  string     $message 提示信息
     * @param  array      $data    其他数据
     * @return \think\response\Json
     */
    protected function error(string $message = 'error', array $data = [])
    {
        return $this->result('1000', $message, $data);
    }

    /**
     * 返回数据
     * @author siliang
     * @Date   2022-03-31
     * @param  string     $code    错误码
     * @param  string     $message 提示信息
     * @param  array      $data    其他数据
     * @return \think\response\Json
     */
    protected function result(string $code, string $message = '', array $data = [])
    {
        $result['code'] = $code;
        $result['msg'] = $message;
        if (!empty($data)) {
            $result = array_merge($data, $result);
        }
        return json($result);
    }
}
