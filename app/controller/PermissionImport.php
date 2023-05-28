<?php
namespace app\controller;

use app\BaseController;
use app\libraries\makromail\Http;
use think\facade\Log;

class PermissionImport extends BaseController
{

    // 权限数据
    protected $data = [
        'workflow' => [
            'list' => [
                [
                    'menuId' => '183',
                    'name' => 'my approval search',
                    'btnPerm' => 'approval:myApproval:search',
                    'urlPerm' => '',
                    'id' => '241',
                ],
                [
                    'menuId' => '183',
                    'name' => 'my approval list',
                    'btnPerm' => 'approval:myApproval:list',
                    'urlPerm' => 'POST:/makro-admin/api/v1/flow/page',
                    'id' => '242',
                ],
                [
                    'menuId' => '183',
                    'name' => 'my approval approve',
                    'btnPerm' => 'approval:myApproval:approve',
                    'urlPerm' => 'PUT:/makro-admin/api/v1/flow/verify',
                    'id' => '243',
                ],
                [
                    'menuId' => '184',
                    'name' => 'approval search',
                    'btnPerm' => 'approval:process:search',
                    'urlPerm' => '',
                    'id' => '244',
                ],
                [
                    'menuId' => '184',
                    'name' => 'approval list',
                    'btnPerm' => 'approval:process:list',
                    'urlPerm' => 'POST:/makro-admin/api/v1/flow/page',
                    'id' => '245',
                ],
                [
                    'menuId' => '184',
                    'name' => 'approval approve',
                    'btnPerm' => 'approval:process:approve',
                    'urlPerm' => 'PUT:/makro-admin/api/v1/flow/verify',
                    'id' => '246',
                ],
                [
                    'menuId' => '185',
                    'name' => 'search workflow',
                    'btnPerm' => 'approval:workflow:search',
                    'urlPerm' => '',
                    'id' => '247',
                ],
                [
                    'menuId' => '185',
                    'name' => 'workflow list',
                    'btnPerm' => 'approval:workflow:list',
                    'urlPerm' => 'POST:/makro-admin/api/v1/flow/config/page',
                    'id' => '248',
                ],
                [
                    'menuId' => '185',
                    'name' => 'edit workflow',
                    'btnPerm' => 'approval:workflow:edit',
                    'urlPerm' => 'PUT:/makro-admin/api/v1/flow/config/*',
                    'id' => '249',
                ],
                [
                    'menuId' => '185',
                    'name' => 'workflow switch status',
                    'btnPerm' => 'approval:workflow:switchStatus',
                    'urlPerm' => 'PUT:/makro-admin/api/v1/flow/config/*',
                    'id' => '250',
                ],
                [
                    'menuId' => '185',
                    'name' => 'workflow flowchart',
                    'btnPerm' => 'approval:workflow:flowchart',
                    'urlPerm' => 'GET:/makro-admin/api/v1/flow/config/*/items',
                    'id' => '251',
                ],
                [
                    'menuId' => '185',
                    'name' => 'workflow flowchart save',
                    'btnPerm' => 'approval:workflow:flowchart:save',
                    'urlPerm' => 'PUT:/makro-admin/api/v1/flow/config/*/details',
                    'id' => '252',
                ],
            ],
        ],
        'marketingColor' => [
            'list' => [
                [
                    'menuId' => '262',
                    'name' => 'search marketing color',
                    'btnPerm' => 'marketing:color:search',
                    'urlPerm' => '',
                    'id' => '393',
                ],
                [
                    'menuId' => '262',
                    'name' => 'marketing color list',
                    'btnPerm' => 'marketing:color:list',
                    'urlPerm' => 'POST:/makro-admin/api/v1/color/page',
                    'id' => '394',
                ],
                [
                    'menuId' => '262',
                    'name' => 'add marketing color',
                    'btnPerm' => 'marketing:color:add',
                    'urlPerm' => 'POST:/makro-admin/api/v1/color',
                    'id' => '395',
                ],
                [
                    'menuId' => '262',
                    'name' => 'edit marketing color',
                    'btnPerm' => 'marketing:color:edit',
                    'urlPerm' => 'PUT:/makro-admin/api/v1/color/*',
                    'id' => '396',
                ],
                [
                    'menuId' => '262',
                    'name' => 'delete marketing color',
                    'btnPerm' => 'marketing:color:delete',
                    'urlPerm' => 'DELETE:/makro-admin/api/v1/color/*',
                    'id' => '397',
                ],
                [
                    'menuId' => '262',
                    'name' => 'switch marketing color status',
                    'btnPerm' => 'marketing:color:switchStatus',
                    'urlPerm' => '',
                    'id' => '398',
                ],
            ]
        ],
        'messageTemplate' => [
            'list' => [
                [
                    'menuId' => '283',
                    'name' => 'search message template',
                    'btnPerm' => 'message:template:search',
                    'urlPerm' => '',
                    'id' => '399',
                ],
                [
                    'menuId' => '283',
                    'name' => 'message template list',
                    'btnPerm' => 'message:template:list',
                    'urlPerm' => 'POST:/makro-admin/api/v1/sms/template/page',
                    'id' => '400',
                ],
                [
                    'menuId' => '283',
                    'name' => 'add message template',
                    'btnPerm' => 'message:template:add',
                    'urlPerm' => 'POST:/makro-admin/api/v1/sms/template',
                    'id' => '401',
                ],
                [
                    'menuId' => '283',
                    'name' => 'edit message template',
                    'btnPerm' => 'message:template:edit',
                    'urlPerm' => 'PATCH:/makro-admin/api/v1/sms/template/*',
                    'id' => '402',
                ],
                [
                    'menuId' => '283',
                    'name' => 'delete message template',
                    'btnPerm' => 'message:template:delete',
                    'urlPerm' => 'DELETE:/makro-admin/api/v1/sms/template/*',
                    'id' => '403',
                ],
                [
                    'menuId' => '283',
                    'name' => 'select message template',
                    'btnPerm' => 'message:template:select',
                    'urlPerm' => '',
                    'id' => '404',
                ],
                [
                    'menuId' => '283',
                    'name' => 'switch message template status',
                    'btnPerm' => 'message:template:switchStatus',
                    'urlPerm' => '',
                    'id' => '405',
                ],
            ]
        ],
    ];

    public function index()
    {
        // 验证权限
        Self::checkLogin('page', "permission/import/index");
        
        $type = 'marketingColor';
        $list = $this->data[$type]['list'];
        foreach ($list as $item) {
            if (!$this->checkPermission($item['id'])) {
                $result = $this->addPermission($item['menuId'], $item['name'], $item['btnPerm'], $item['urlPerm']);
                dump($item, $result);
                // break;
            } else {
                dump($item['id']);
                // break;
            }
        }
        return 'success';
    }

    protected function addPermission($menuId, $name, $btnPerm = '', $urlPerm = '')
    {
        $data['menuId'] = $menuId;
        $data['name'] = $name;
        $data['btnPerm'] = $btnPerm;
        $data['urlPerm'] = $urlPerm;
        $http = Http::requestAPI();
        $result = $http->post('/makro-admin/api/v1/permissions', [], $data);
        if (isset($result['code']) && $result['code'] == '0000') {
            return true;
        }
        if (isset($result['msg'])) {
            Log::record($result['msg']);
        }
        return false;
    }

    protected function checkPermission($id)
    {
        $http = Http::requestAPI();
        $result = $http->get('/makro-admin/api/v1/permissions/' . $id);
        if (isset($result['code']) && $result['code'] == '0000' && !empty($result['data'])) {
            return true;
        }
        if (isset($result['msg'])) {
            Log::record($result['msg']);
        }
        return false;
    }

}
