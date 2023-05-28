<?php
namespace app\controller;

use app\BaseController;
use app\libraries\pdf\pdf;
use think\Request;

class MarketingExport extends BaseController
{

    /**
     * 导出确认页
     * @Date   2021-12-21
     */
    public function index(Request $request)
    {
        // 验证权限
        Self::checkLogin('page', "marketing/export/index");

        View::assign('js_timestamp', time());

        return View::fetch('marketing/export/index');
    }

    /**
     * 导出pdf
     * @Date   2021-12-14
     */
    public function pdf(Request $request)
    {
        // 验证权限
        Self::checkLogin('page', "marketing/export/pdf");

        $url = $request->url();
        $mmCode = get_url_pathname($url, -1);

        // 引入文件
        require_once app_path() . 'libraries/pdf/createMmPdf.php';
    }

    /**
     * 导出html
     * @Date   2021-12-14
     */
    public function html(Request $request)
    {
        // 验证权限
        Self::checkLogin('page', "marketing/export/html");

        $url = $request->url();
        $mmCode = get_url_pathname($url, 4);
        // 是否为app
        $is_app = $request->param('app') == 'true' ? true : false;

        // 引入文件
        require_once app_path() . 'libraries/html/createMmHtml.php';
    }

    /**
     * 预览html
     * @Date   2022-03-01
     */
    public function reviewHtml(Request $request)
    {
        // 验证权限
        Self::checkLogin('page', "marketing/export/reviewHtml");

        $url = $request->url();
        $mmCode = get_url_pathname($url, 4);

        // 引入文件
        require_once app_path() . 'libraries/html/reviewMmHtml.php';
    }

    /**
     * 导出图片
     * @Date   2021-12-14
     */
    public function image(Request $request)
    {
        // 验证权限
        Self::checkLogin('page', "marketing/export/image");

        $url = $request->url();
        $mmCode = get_url_pathname($url, 4);

    }

}
