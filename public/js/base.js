// 没有载入自定义jquery时，从layui获取内置jquery
if (typeof $ == 'undefined' && layui) {
    var $ = layui.$;
}
// API相关配置
var api_url = gateway();
var web_url = window.location.protocol + '//' + window.location.host + '/makroDigital';
var api_module = {
    // 登录
    "login": {
        "validateCode": {
            "url": api_url + "/validate-code",
            "type": "GET",
        },
        "check": {
            "url": api_url + "/check",
            "type": "GET",
        },
        "auth": {
            "url": api_url + "/makro-auth/oauth/token",
            "type": "POST",
        },
        "logout": {
            "url": api_url + "/makro-auth/oauth/logout",
            "type": "DELETE",
        },
        "forgot": {
            "url": api_url + "/makro-admin/api/v1/password/forget",
            "type": "GET",
        },
        "reset": {
            "url": api_url + "/makro-admin/api/v1/password/reset",
            "type": "POST",
        }
    },
    // 菜单
    "menu": {
        "list": {
            "url": api_url + "/makro-admin/api/v1/menus",
            "type": "GET",
        },
        "table": {
            "url": api_url + "/makro-admin/api/v1/menus/table",
            "type": "GET",
        },
        // 菜单路由
        "route": {
            "url": api_url + "/makro-admin/api/v1/menus/route",
            "type": "GET",
        },
        // 详情
        "detail": {
            "url": api_url + "/makro-admin/api/v1/menus/{id}",
            "type": "GET",
        },
        // 新增
        "add": {
            "url": api_url + "/makro-admin/api/v1/menus",
            "type": "POST",
        },
        // 修改
        "update": {
            "url": api_url + "/makro-admin/api/v1/menus/{id}",
            "type": "PUT",
        },
        "delete": {
            "url": api_url + "/makro-admin/api/v1/menus",
            "type": "DELETE",
        },
        // 选择性修改
        "text": {
            "url": api_url + "/makro-admin/api/v1/menus",
            "type": "PATCH",
        },
    },
    // 系统用户
    "user": {
        "list": {
            "url": api_url + "/makro-admin/api/v1/users",
            "type": "GET",
        },
        "page": {
            "url": api_url + "/makro-admin/api/v1/users/page",
            "type": "GET",
        },
        "detail": {
            "url": api_url + "/makro-admin/api/v1/users/{id}",
            "type": "GET",
        },
        "add": {
            "url": api_url + "/makro-admin/api/v1/users",
            "type": "POST",
        },
        "update": {
            "url": api_url + "/makro-admin/api/v1/users/{id}",
            "type": "PUT",
        },
        "text": {
            "url": api_url + "/makro-admin/api/v1/users/{id}",
            "type": "PATCH",
        },
        "menu": {
            "url": api_url + "/makro-admin/api/v1/users/menus",
            "type": "GET",
        },
        "log": {
            "url": api_url + "/makro-stat-collector/api/v1/sys/log/user/page",
            "type": "POST",
        },
    },
    // 角色
    "role": {
        "list": {
            "url": api_url + "/makro-admin/api/v1/roles",
            "type": "GET",
        },
        "page": {
            "url": api_url + "/makro-admin/api/v1/roles/page",
            "type": "GET",
        },
        "detail": {
            "url": api_url + "/makro-admin/api/v1/roles/{id}",
            "type": "GET",
        },
        "add": {
            "url": api_url + "/makro-admin/api/v1/roles",
            "type": "POST",
        },
        "update": {
            "url": api_url + "/makro-admin/api/v1/roles/{id}",
            "type": "PUT",
        },
        "getMenus": {
            "url": api_url + "/makro-admin/api/v1/roles/{id}/menus",
            "type": "GET",
        },
        "getMenusWithCheck": {
            "url": api_url + "/makro-admin/api/v1/roles/{id}/menus-with-check",
            "type": "GET",
        },
        "updateMenus": {
            "url": api_url + "/makro-admin/api/v1/roles/{id}/menus",
            "type": "PUT",
        },
        "getPermissions": {
            "url": api_url + "/makro-admin/api/v1/roles/{id}/permissions",
            "type": "GET",
        },
        "updatePermissions": {
            "url": api_url + "/makro-admin/api/v1/roles/{id}/permissions",
            "type": "PUT",
        },
        "text": {
            "url": api_url + "/makro-admin/api/v1/roles/{id}",
            "type": "PATCH",
        },
    },
    // 权限
    "permission": {
        "list": {
            "url": api_url + "/makro-admin/api/v1/permissions",
            "type": "GET",
        },
        "page": {
            "url": api_url + "/makro-admin/api/v1/permissions/page",
            "type": "GET",
        },
        "detail": {
            "url": api_url + "/makro-admin/api/v1/permissions/{id}",
            "type": "GET",
        },
        "add": {
            "url": api_url + "/makro-admin/api/v1/permissions",
            "type": "POST",
        },
        "update": {
            "url": api_url + "/makro-admin/api/v1/permissions/{id}",
            "type": "PUT",
        },
        "delete": {
            "url": api_url + "/makro-admin/api/v1/permissions/{ids}",
            "type": "DELETE",
        },
    },
    // 部门
    "department": {
        "list": {
            "url": api_url + "/makro-admin/api/v1/depts",
            "type": "GET",
        },
        "table": {
            "url": api_url + "/makro-admin/api/v1/depts/table",
            "type": "GET",
        },
        "select": {
            "url": api_url + "/makro-admin/api/v1/depts/select",
            "type": "GET",
        },
        "detail": {
            "url": api_url + "/makro-admin/api/v1/depts/{id}",
            "type": "GET",
        },
        "add": {
            "url": api_url + "/makro-admin/api/v1/depts",
            "type": "POST",
        },
        "update": {
            "url": api_url + "/makro-admin/api/v1/depts/{id}",
            "type": "PUT",
        },
        "delete": {
            "url": api_url + "/makro-admin/api/v1/depts/{ids}",
            "type": "DELETE",
        },
    },
    // 门店
    "store": {
        "list": {
            "url": api_url + "/makro-admin/api/v1/stores/list",
            "type": "GET",
        },
        "page": {
            "url": api_url + "/makro-admin/api/v1/stores/page",
            "type": "POST",
        },
        "sync": {
            "url": api_url + "/makro-admin/api/v1/stores/sync",
            "type": "GET",
        },
        "detail": {
            "url": api_url + "/makro-admin/api/v1/stores/{id}",
            "type": "GET",
        },
        "add": {
            "url": api_url + "/makro-admin/api/v1/stores",
            "type": "POST",
        },
        "update": {
            "url": api_url + "/makro-admin/api/v1/stores/{id}",
            "type": "PUT",
        },
        "delete": {
            "url": api_url + "/makro-admin/api/v1/stores/{ids}",
            "type": "DELETE",
        },
    },
    // 字典
    "dict": {
        "page": {
            "url": api_url + "/makro-admin/api/v1/dicts/page",
            "type": "POST",
        },
        "detail": {
            "url": api_url + "/makro-admin/api/v1/dicts/{id}",
            "type": "GET",
        },
        "add": {
            "url": api_url + "/makro-admin/api/v1/dicts",
            "type": "POST",
        },
        "update": {
            "url": api_url + "/makro-admin/api/v1/dicts/{id}",
            "type": "PUT",
        },
        "delete": {
            "url": api_url + "/makro-admin/api/v1/dicts/{ids}",
            "type": "DELETE",
        },
        // 子项
        "item": {
            "list": {
                "url": api_url + "/makro-admin/api/v1/dict-items",
                "type": "GET",
            },
            "listByDictId": {
                "url": api_url + "/makro-admin/api/v1/dict-items/list/{dictId}",
                "type": "GET",
            },
            "listByDictCode": {
                "url": api_url + "/makro-admin/api/v1/dict-items/{dictCode}",
                "type": "GET",
            },
            "page": {
                "url": api_url + "/makro-admin/api/v1/dict-items/page",
                "type": "GET",
            },
            "detail": {
                "url": api_url + "/makro-admin/api/v1/dict-items/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-admin/api/v1/dict-items",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-admin/api/v1/dict-items/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-admin/api/v1/dict-items/{ids}",
                "type": "DELETE",
            },
            "text": {
                "url": api_url + "/makro-admin/api/v1/dict-items/{id}",
                "type": "PATCH",
            },
        },
    },
    // Segment关系维护
    "segment": {
        "list": {
            "url": api_url + "/makro-admin/api/v1/segments/list",
            "type": "GET",
        },
        "page": {
            "url": api_url + "/makro-admin/api/v1/segments/page",
            "type": "POST",
        },
        "detail": {
            "url": api_url + "/makro-admin/api/v1/segments/{id}",
            "type": "GET",
        },
        "add": {
            "url": api_url + "/makro-admin/api/v1/segments",
            "type": "POST",
        },
        "update": {
            "url": api_url + "/makro-admin/api/v1/segments/{id}",
            "type": "PATCH",
        },
        "delete": {
            "url": api_url + "/makro-admin/api/v1/segments/{ids}",
            "type": "DELETE",
        },
    },
    // MM
    "marketing": {
        // MM活动
        "activity": {
            // 活动列表
            "page": {
                "url": api_url + "/makro-admin/api/v1/activity/page",
                "type": "POST",
            },
            // 活动详情-根据id获取
            "detail": {
                "url": api_url + "/makro-admin/api/v1/activity/{id}",
                "type": "GET",
            },
            // 活动详情-根据code获取
            "detailByCode": {
                "url": api_url + "/makro-admin/api/v1/activity/mmCode/{mmCode}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-admin/api/v1/activity",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-admin/api/v1/activity/{id}",
                "type": "PUT",
            },
            "updateByCode": {
                "url": api_url + "/makro-admin/api/v1/activity/code/{mmCode}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-admin/api/v1/activity/{ids}",
                "type": "DELETE",
            },
            // 活动绑定模板
            "bindTemplate": {
                "url": api_url + "/makro-template/api/v1/template/{templateCode}/mm/{mmCode}",
                "type": "POST",
            },
            // 获取活动模板模板详情
            "template": {
                "url": api_url + "/makro-template/api/v1/template/mm/{mmCode}",
                "type": "GET",
            },
            "publish": {
                "url": web_url + "/marketingPublish/index",
                "type": "POST",
            },
            // 回滚
            "rollback": {
                "url": api_url + "/makro-admin/api/v1/activity/rollback/{mmCode}",
                "type": "PUT",
            },
            // 重新生成发布job对应的文件
            "rebuild": {
                "url": web_url + "/marketingPublish/rebuild?jobID={jobID}",
                "type": "POST",
            },
            // 获取MM用户列表,根据MM的segment查找客户
            "getCustomer": {
                "url": api_url + "/makro-admin/api/v1/activity/getCustomer/{mmCode}",
                "type": "GET",
            },
        },
        // MM发布工作
        "publishJob": {
            "create": {
                "url": api_url + "/makro-admin/api/v1/publish/job/{flowId}/mm/{mmCode}",
                "type": "POST",
            },
            "page": {
                "url": api_url + "/makro-admin/api/v1/publish/job/page",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-admin/api/v1/publish/job/{id}",
                "type": "GET",
            },
            "update": {
                "url": api_url + "/makro-admin/api/v1/publish/job/{id}",
                "type": "PUT",
            },
            "relateByMMCode": {
                "url": api_url + "/makro-admin/api/v1/publish/job/mm/{mmCode}/list",
                "type": "GET",
            },
            "relateByFlowId": {
                "url": api_url + "/makro-admin/api/v1/publish/job/{flowId}/list",
                "type": "GET",
            },
        },
        // 推送消息
        "pushMessage": {
            "page": {
                "url": api_url + "/makro-admin/api/v1/pushMessage/task/page",
                "type": "POST",
            },
            // 取消推送
            "cancel": {
                "url": api_url + "/makro-admin/api/v1/pushMessage/task/cancel",
                "type": "POST",
            },
            // 重新推送（指定会员）
            "again": {
                "url": api_url + "/makro-admin/api/v1/pushMessage/task/again",
                "type": "POST",
            },
            "users": {
                "url": api_url + "/makro-admin/api/v1/pushMessage/task/userPage",
                "type": "POST",
            },
            "email": {
                "url": api_url + "/makro-admin/api/v1/pushMessage/v2/email",
                "type": "POST",
            },
            "line": {
                "url": api_url + "/makro-admin/api/v1/pushMessage/v2/line",
                "type": "POST",
            },
            "sms": {
                "url": api_url + "/makro-admin/api/v1/pushMessage/v2/sms",
                "type": "POST",
            },
        },
        // MM组件
        "component": {
            "page": {
                "url": api_url + "/makro-template/api/v1/component/page",
                "type": "GET",
            },
            "detail": {
                "url": api_url + "/makro-template/api/v1/component/{code}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-template/api/v1/component",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-template/api/v1/component/{code}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-template/api/v1/component/{codes}",
                "type": "DELETE",
            },
            // 历史版本
            "draft": {
                "url": api_url + "/makro-template/api/v1/component/{code}/draft",
                "type": "GET",
            },
            // 历史版本详情
            "draftDetail": {
                "url": api_url + "/makro-template/api/v1/component/{code}/draft/{version}",
                "type": "GET",
            },
        },
        // MM模板
        "template": {
            "page": {
                "url": api_url + "/makro-template/api/v1/template/page",
                "type": "GET",
            },
            "detail": {
                "url": api_url + "/makro-template/api/v1/template/{code}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-template/api/v1/template",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-template/api/v1/template/{code}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-template/api/v1/template/{codes}",
                "type": "DELETE",
            },
            "lock": {
                "url": api_url + "/makro-template/api/v1/template/lock/{code}",
                "type": "PUT",
            },
            "unlock": {
                "url": api_url + "/makro-template/api/v1/template/unlock/{code}",
                "type": "PUT",
            },
            // 复制模板
            "copy": {
                "url": api_url + "/makro-template/api/v1/template/copy/{code}",
                "type": "POST",
            },
            // 发布模板，生成新的模板
            "publish": {
                "url": api_url + "/makro-template/api/v1/template/publish/{code}",
                "type": "POST",
            },
            // 回滚
            "rollback": {
                "url": api_url + "/makro-template/api/v1/template/rollback/{code}",
                "type": "PUT",
            },
            // 修改模板页面
            "updatePage": {
                "url": api_url + "/makro-template/api/v1/template/{code}/page",
                "type": "PUT",
            },
            // 调整页面排序
            "updatePageSort": {
                "url": api_url + "/makro-template/api/v1/template/{code}/page/{pageCode}/{sort}",
                "type": "PUT",
            },
            // 删除模板页面
            "deletePage": {
                "url": api_url + "/makro-template/api/v1/template/{code}/page/{pageCode}",
                "type": "DELETE",
            },
            // 历史版本
            "draft": {
                "url": api_url + "/makro-template/api/v1/template/{code}/draft",
                "type": "GET",
            },
            // 历史版本详情
            "draftDetail": {
                "url": api_url + "/makro-template/api/v1/template/{code}/draft/{version}",
                "type": "GET",
            },
        },
        // MM关联商品
        "product": {
            "page": {
                "url": api_url + "/makro-product/api/v1/product/data",
                "type": "GET",
            },
            "detail": {
                "url": api_url + "/makro-product/api/v1/product/data/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-product/api/v1/product/data/add/{mmCode}",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-product/api/v1/product/data/update/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-product/api/v1/product/data/{id}",
                "type": "DELETE",
            },
            "restore": {
                "url": api_url + "/makro-product/api/v1/product/data/restore/{id}",
                "type": "PUT",
            },
        },
        // MM Element
        "element": {
            "page": {
                "url": api_url + "/makro-file/api/v1/element/page",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-file/api/v1/element/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-file/api/v1/element",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-file/api/v1/element/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-file/api/v1/element/{ids}",
                "type": "DELETE",
            },
            // Element文件夹
            "folder": {
                "page": {
                    "url": api_url + "/makro-file/api/v1/elementFolder",
                    "type": "GET",
                },
                "add": {
                    "url": api_url + "/makro-file/api/v1/elementFolder",
                    "type": "POST",
                },
                "update": {
                    "url": api_url + "/makro-file/api/v1/elementFolder/{id}",
                    "type": "PUT",
                },
                "delete": {
                    "url": api_url + "/makro-file/api/v1/elementFolder/{ids}",
                    "type": "DELETE",
                },
            },
        },
        // MM Text Thai
        "textthai": {
            "page": {
                "url": api_url + "/makro-product/api/v1/product/excel",
                "type": "GET",
            },
            "designInfo": {
                "url": api_url + "/makro-product/api/v1/product/excel/design/{excelId}",
                "type": "GET",
            },
            "originalInfo": {
                "url": api_url + "/makro-product/api/v1/product/excel/details/{excelId}",
                "type": "GET",
            },
        },
        // MM分析
        "analysis": {
            // 基础数据统计
            "basicData": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/basicData",
                "type": "GET",
            },
            // 实时访问（次数、人数）
            "realTimeAccess": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/realTimeAccess",
                "type": "GET",
            },
            // 行为数据对比
            "behaviorData": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/behaviorData",
                "type": "GET",
            },
            // 不同类型访客点击商品次数
            "productClicksByVisitors": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/productClicksByVisitors",
                "type": "GET",
            },
            // 不同方式访问的访客平均访问次数
            "averageVisitorVisits": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/averageVisitorVisits",
                "type": "GET",
            },
            // 不同渠道推广访客转化率对比
            "channelVisitorConversion": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/channelVisitorConversion",
                "type": "GET",
            },
            // 不同会员类型点击率对比
            "memberTypeClickThroughRate": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/memberTypeClickThroughRate",
                "type": "GET",
            },
            // 不同渠道来源访问次数
            "channelVisits": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/channelVisits",
                "type": "GET",
            },
            // 不同渠道来源访客人数
            "channelVisitors": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/channelVisitors",
                "type": "GET",
            },
            // 商品分析
            "product": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/productAnalysis",
                "type": "GET",
            },
            // 根据ItemCode获取拥有该itemCode的其他MM
            "getMmByItemCode": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/getMmByItemCode/{itemCode}",
                "type": "GET",
            },
            // 商品对比访问次数
            "compareProduct": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/compareProduct",
                "type": "GET",
            },
            // 访问明细
            "visitDetails": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/visitDetails",
                "type": "GET",
            },
            /** Summary专用 开始 **/
            // 访问次数最多的页面
            "mostVisitPage": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/mostVisitPage",
                "type": "GET",
            },
            // 点击次数最多的页面
            "mostItemClickPage": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/mostItemClickPage",
                "type": "GET",
            },
            // 客户类型饼图
            "customerTypePie": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/customerTypePie",
                "type": "GET",
            },
            // 渠道饼图
            "channelPie": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/channelPie",
                "type": "GET",
            },
            // 总点击次数
            "summaryOfClicks": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/summaryOfClicks",
                "type": "GET",
            },
            // 总点击次数详情
            "summaryOfClicksDetail": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/summaryOfClicksDetail",
                "type": "GET",
            },
            // 页面停留
            "pageStay": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/pageStay",
                "type": "GET",
            },
            // Friends分组
            "friends": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/friends",
                "type": "GET",
            },
            // 商品点击数
            "itemClicks": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/ItemClicks",
                "type": "POST",
            },
            // 导出Summary的Excel文件
            "exportSummary": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/export",
                "type": "GET",
            },
            /** Summary专用 结束 **/
            // 获取高级分析结构信息
            "advancedInfo": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/mixedPanelSummaryJson",
                "type": "GET",
            },
            // 高级分析
            "advanced": {
                "url": api_url + "/makro-stat-collector/api/v1/indicators/mixedPanelSummary",
                "type": "POST",
            },
        },
        /** MM配置 开始 **/
        "preset": {
            "page": {
                "url": api_url + "/makro-file/api/v1/config/preset/page",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-file/api/v1/config/preset/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-file/api/v1/config/preset",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-file/api/v1/config/preset/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-file/api/v1/config/preset/{ids}",
                "type": "DELETE",
            },
        },
        "size": {
            "page": {
                "url": api_url + "/makro-file/api/v1/pdf/size/page",
                "type": "POST",
            },
            "listByRate": {
                "url": api_url + "/makro-file/api/v1/pdf/size/listByRate/{rate}",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-file/api/v1/pdf/size/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-file/api/v1/pdf/size",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-file/api/v1/pdf/size/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-file/api/v1/pdf/size/{ids}",
                "type": "DELETE",
            },
        },
        "unit": {
            "page": {
                "url": api_url + "/makro-file/api/v1/config/unit/page",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-file/api/v1/config/unit/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-file/api/v1/config/unit",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-file/api/v1/config/unit/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-file/api/v1/config/unit/{ids}",
                "type": "DELETE",
            },
        },
        "svg": {
            "page": {
                "url": api_url + "/makro-file/api/v1/component/svg/page",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-file/api/v1/component/svg/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-file/api/v1/component/svg",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-file/api/v1/component/svg/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-file/api/v1/component/svg/{ids}",
                "type": "DELETE",
            },
        },
        "font": {
            "page": {
                "url": api_url + "/makro-file/api/v1/fonts/page",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-file/api/v1/fonts/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-file/api/v1/fonts",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-file/api/v1/fonts/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-file/api/v1/fonts/{ids}",
                "type": "DELETE",
            },
        },
        "label": {
            "page": {
                "url": api_url + "/makro-file/api/v1/label/page",
                "type": "GET",
            },
            "detail": {
                "url": api_url + "/makro-file/api/v1/label/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-file/api/v1/label",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-file/api/v1/label/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-file/api/v1/label/{ids}",
                "type": "DELETE",
            },
        },
        "color": {
            "page": {
                "url": api_url + "/makro-admin/api/v1/color/page",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-admin/api/v1/color/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-admin/api/v1/color",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-admin/api/v1/color/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-admin/api/v1/color/{ids}",
                "type": "DELETE",
            },
        },
        // 设计器缓存
        "designCache": {
            "get": {
                "url": api_url + "/makro-template/api/v1/template/userCache/{id}",
                "type": "GET",
            },
            "save": {
                "url": api_url + "/makro-template/api/v1/template/userCache",
                "type": "POST",
            },
        },
        /** MM配置 结束 **/
    },
    // 商品
    "product": {
        "page": {
            "url": api_url + "/makro-product/api/v1/product",
            "type": "GET",
        },
        "detail": {
            "url": api_url + "/makro-product/api/v1/product/{id}",
            "type": "GET",
        },
        "add": {
            "url": api_url + "/makro-product/api/v1/product/add",
            "type": "POST",
        },
        "update": {
            "url": api_url + "/makro-product/api/v1/product/update/{id}",
            "type": "PUT",
        },
        "delete": {
            "url": api_url + "/makro-product/api/v1/product/{id}",
            "type": "DELETE",
        },
        /** 商品其他模块 开始 **/
        // 商品类别
        "category": {
            "page": {
                "url": api_url + "/makro-product/api/v1/product/category",
                "type": "GET",
            },
            "select": {
                "url": api_url + "/makro-product/api/v1/product/category/select",
                "type": "GET",
            },
            "table": {
                "url": api_url + "/makro-product/api/v1/product/category/table",
                "type": "GET",
            },
            "detail": {
                "url": api_url + "/makro-product/api/v1/product/category/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-product/api/v1/product/category",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-product/api/v1/product/category/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-product/api/v1/product/category/{ids}",
                "type": "DELETE",
            },
        },
        // 商品品牌
        "brand": {
            "page": {
                "url": api_url + "/makro-product/api/v1/product/brand",
                "type": "GET",
            },
            "select": {
                "url": api_url + "/makro-product/api/v1/product/brand/getBrandNames",
                "type": "GET",
            },
            "detail": {
                "url": api_url + "/makro-product/api/v1/product/brand/{id}",
                "type": "GET",
            },
            "detailByName": {
                "url": api_url + "/makro-product/api/v1/product/brand/getOneByName",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-product/api/v1/product/brand/add",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-product/api/v1/product/brand/update/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-product/api/v1/product/brand/{ids}",
                "type": "DELETE",
            },
            // 品牌图片库
            "picture": {
                "page": {
                    "url": api_url + "/makro-product/api/v1/product/brand/pic/page",
                    "type": "POST",
                },
                "add": {
                    "url": api_url + "/makro-product/api/v1/product/brand/pic/add",
                    "type": "POST",
                },
                "detail": {
                    "url": api_url + "/makro-product/api/v1/product/brand/pic/{id}",
                    "type": "GET",
                },
                "update": {
                    "url": api_url + "/makro-product/api/v1/product/brand/pic/{id}",
                    "type": "PUT",
                },
            },
        },
        "icon": {
            "page": {
                "url": api_url + "/makro-product/api/v1/product/icon",
                "type": "GET",
            },
            "select": {
                "url": api_url + "/makro-product/api/v1/product/icon/getIconNames",
                "type": "GET",
            },
            "detail": {
                "url": api_url + "/makro-product/api/v1/product/icon/{id}",
                "type": "GET",
            },
            "detailByName": {
                "url": api_url + "/makro-product/api/v1/product/icon/getOneByName",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-product/api/v1/product/icon/add",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-product/api/v1/product/icon/update/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-product/api/v1/product/icon/{ids}",
                "type": "DELETE",
            },
            // 品牌图片库
            "picture": {
                "page": {
                    "url": api_url + "/makro-product/api/v1/product/icon/pic/page",
                    "type": "POST",
                },
                "add": {
                    "url": api_url + "/makro-product/api/v1/product/icon/pic/add",
                    "type": "POST",
                },
                "detail": {
                    "url": api_url + "/makro-product/api/v1/product/icon/pic/{id}",
                    "type": "GET",
                },
                "update": {
                    "url": api_url + "/makro-product/api/v1/product/icon/pic/{id}",
                    "type": "PUT",
                },
            },
        },
        // 商品附加属性
        "aux": {
            "page": {
                "url": api_url + "/makro-product/api/v1/product/aux",
                "type": "GET",
            },
            "detail": {
                "url": api_url + "/makro-product/api/v1/product/aux/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-product/api/v1/product/aux/add",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-product/api/v1/product/aux/update/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-product/api/v1/product/aux/{ids}",
                "type": "DELETE",
            },
            "getTypes": {
                "url": api_url + "/makro-product/api/v1/product/aux/getTypes",
                "type": "GET",
            },
        },
        // 价格历史记录
        "price": {
            "page": {
                "url": api_url + "/makro-product/api/v1/product/price",
                "type": "GET",
            },
            "detail": {
                "url": api_url + "/makro-product/api/v1/product/price/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-product/api/v1/product/price/add",
                "type": "POST",
            },
        },
        // 商品图片
        "picture": {
            "page": {
                "url": api_url + "/makro-product/api/v1/product/pic/page",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-product/api/v1/product/pic/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-product/api/v1/product/pic",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-product/api/v1/product/pic/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-product/api/v1/product/pic/{ids}",
                "type": "DELETE",
            },
            // 批量上传商品图片
            "batchUpload": {
                "url": api_url + "/makro-product/api/v1/product/pic/batch/upload",
                "type": "POST",
                "file": {
                    "field": "files",
                    "exts": "jpg|jpeg|png|gif",
                },
            },
        },
        // 商品活动
        "activity": {
            "pageByItemCode": {
                "url": api_url + "/makro-product/api/v1/product/data/getMmActivityByItemCode/{itemCode}",
                "type": "GET",
            },
        },
        /** 商品其他模块 结束 **/
        // Makro Pro商品查询接口
        "pro": {
            "search": {
                "url": api_url + "/makro-product/api/v1/pro/query",
                "type": "POST",
            },
        },
    },
    // 会员
    "member": {
        "customer": {
            "page": {
                "url": api_url + "/makro-admin/api/v1/customers/page",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-admin/api/v1/customers/{id}",
                "type": "GET",
            },
            "detailByPhone": {
                "url": api_url + "/makro-admin/api/v1/customers/phone/{phone}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-admin/api/v1/customers/add",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-admin/api/v1/customers/{id}",
                "type": "PATCH",
            },
            "delete": {
                "url": api_url + "/makro-admin/api/v1/customers/{ids}",
                "type": "DELETE",
            },
            "deleteSegment": {
                "url": api_url + "/makro-admin/api/v1/customers/{ids}/segment/{segmentId}",
                "type": "DELETE",
            },
        },
        "type": {
            "list": {
                "url": api_url + "/makro-admin/api/v1/memberType/list",
                "type": "GET",
            },
            "page": {
                "url": api_url + "/makro-admin/api/v1/memberType/page",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-admin/api/v1/memberType/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-admin/api/v1/memberType",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-admin/api/v1/memberType/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-admin/api/v1/memberType/{id}",
                "type": "DELETE",
            },
        },
    },
    // 消息
    "message": {
        // 消息模板
        "template": {
            "page": {
                "url": api_url + "/makro-admin/api/v1/sms/template/page",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-admin/api/v1/sms/template/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-admin/api/v1/sms/template",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-admin/api/v1/sms/template/{id}",
                "type": "PATCH",
            },
            "delete": {
                "url": api_url + "/makro-admin/api/v1/sms/template/{ids}",
                "type": "DELETE",
            },
        },
    },
    // 审核
    "approval": {
        // 审核流程
        "process": {
            "page": {
                "url": api_url + "/makro-admin/api/v1/flow/page",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-admin/api/v1/flow/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-admin/api/v1/flow",
                "type": "POST",
            },
            "delete": {
                "url": api_url + "/makro-admin/api/v1/flow/{ids}",
                "type": "DELETE",
            },
            "verify": {
                "url": api_url + "/makro-admin/api/v1/flow/verify",
                "type": "PUT",
            },
            "getLogs": {
                "url": api_url + "/makro-admin/api/v1/flow/details/{id}",
                "type": "GET",
            },
            // 获取对应流程的角色节点
            "getRoles": {
                "url": api_url + "/makro-admin/api/v1/flow/{id}/roles",
                "type": "GET",
            },
            // 根据code获取当前正在审核的流程
            "relateByCode": {
                "url": api_url + "/makro-admin/api/v1/flow/relate/{code}",
                "type": "GET",
            },
            // 判断当前角色是否有权限完结流程
            "checkFinish": {
                "url": api_url + "/makro-admin/api/v1/flow/{id}/checkLast",
                "type": "GET",
            },
        },
        // 工作流
        "workflow": {
            "list": {
                "url": api_url + "/makro-admin/api/v1/flow/types",
                "type": "GET",
            },
            "page": {
                "url": api_url + "/makro-admin/api/v1/flow/config/page",
                "type": "POST",
            },
            "detail": {
                "url": api_url + "/makro-admin/api/v1/flow/config/{id}",
                "type": "GET",
            },
            "update": {
                "url": api_url + "/makro-admin/api/v1/flow/config/{id}",
                "type": "PUT",
            },
            "getConfig": {
                "url": api_url + "/makro-admin/api/v1/flow/config/{id}/items",
                "type": "GET",
            },
            "updateConfig": {
                "url": api_url + "/makro-admin/api/v1/flow/config/{id}/details",
                "type": "PUT",
            },
        },
    },
    // 设置
    "setting": {
        "basic": {
            "detail": {
                "url": api_url + "/makro-admin/api/v1/setting",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-admin/api/v1/setting",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-admin/api/v1/setting",
                "type": "PUT",
            },
        },
        "message": {
            "detail": {
                "url": api_url + "/makro-message/api/v1/properties",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-message/api/v1/properties",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-message/api/v1/properties",
                "type": "PUT",
            },
        },
    },
    // 导入
    "import": {
        // 导入MM活动商品数据
        "marketingActivity": {
            // 1.上传Excel
            "upload": {
                "url": api_url + "/makro-product/api/v1/import/v4/getSheetList",
                "type": "POST",
            },
            // 2.获取Excel指定sheet数据
            "getExcelData": {
                "url": api_url + "/makro-product/api/v1/import/v4/getExcelDataFromSheetName/{uploadId}",
                "type": "POST",
            },
            // 2.1 解析Excel数据，并转为商品数据结构
            "excelDataToProductData": {
                "url": api_url + "/makro-product/api/v1/import/v4/parseExcelData/toProductData",
                "type": "POST",
            },
            // 3.确定导入数据
            "confirm": {
                "url": api_url + "/makro-product/api/v1/import/v4/addTemplateData/{mmCode}",
                "type": "POST",
            },
            // 旧接口
            // // 1.上传Excel
            // "upload": {
            //     "url": api_url + "/makro-product/api/v1/import/getSheetList/{mmCode}",
            //     "type": "POST",
            // },
            // // 2.获取Excel指定sheet数据
            // "getExcelData": {
            //     "url": api_url + "/makro-product/api/v1/import/getExcelDataFromSheetName/{mmCode}",
            //     "type": "POST",
            // },
            // // 3.确定导入数据
            // "confirm": {
            //     "url": api_url + "/makro-product/api/v1/import/addTemplateDataFromExcel/{mmCode}",
            //     "type": "POST",
            // },
            // // 取消导入
            // "cancel": {
            //     "url": api_url + "/makro-product/api/v1/import/cancelImport{mmCode}",
            //     "type": "POST",
            // },
        },
        // 导入客户数据
        "customer": {
            // 1.上传Excel并返回解析的数据
            "parseExcel": {
                "url": api_url + "/makro-admin/api/v1/customers/parseExcel",
                "type": "POST",
            },
            // 2.提交导入的数据
            "submit": {
                "url": api_url + "/makro-admin/api/v1/customers",
                "type": "POST",
            },
        },
    },
    // 文件
    "file": {
        // 普通上传
        "upload": {
            "url": api_url + "/makro-file/api/v1/files",
            "type": "POST",
            "file": {
                "field": "file",
            },
        },
        // 上传二进制流
        "uploadStream": {
            "url": api_url + "/makro-file/api/v1/files/stream",
            "type": "POST",
        },
        // 上传图片接口（仅支持jpg、png、gif图片）
        "uploadWebImage": {
            "url": api_url + "/makro-file/api/v1/pictures",
            "type": "POST",
            "file": {
                "field": "file",
                "acceptMime": "image/*",
                "exts": "jpg|jpeg|png|gif",
            },
        },
        // 上传设计图片（支持jpg、png、gif、ai、eps、psd、pdf等格式）
        "uploadImage": {
            "url": web_url + "/upload/designImage",
            "type": "POST",
            "file": {
                "field": "file",
                "acceptMime": "image/*,application/postscript,application/octet-stream,application/pdf",
                "exts": "jpg|jpeg|png|gif|ai|eps|psd|pdf",
            },
        },
        // 下载指定的文件
        "download": {
            "url": api_url + "/makro-file/api/v1/files?path={path}",
            "type": "GET",
        },
        // 删除指定的文件
        "delete": {
            "url": api_url + "/makro-file/api/v1/files?path={path}",
            "type": "DELETE",
        },
        // 批量删除文件
        "batchRemove": {
            "url": api_url + "/makro-file/api/v1/files/batchRemove",
            "type": "POST",
        },
        // 素材接口
        "material": {
            "page": {
                "url": api_url + "/makro-file/api/v1/pic-material/page",
                "type": "GET",
            },
            // 根据Type查询
            "listByType": {
                "url": api_url + "/makro-file/api/v1/pic-material/listByType",
                "type": "GET",
            },
            // 根据type和itemCode查找图片素材
            "listByTypeAndItem": {
                "url": api_url + "/makro-file/api/v1/pic-material/listByTypeAndItem",
                "type": "GET",
            },
            "detail": {
                "url": api_url + "/makro-file/api/v1/pic-material/{id}",
                "type": "GET",
            },
            "add": {
                "url": api_url + "/makro-file/api/v1/pic-material/",
                "type": "POST",
            },
            "update": {
                "url": api_url + "/makro-file/api/v1/pic-material/{id}",
                "type": "PUT",
            },
            "delete": {
                "url": api_url + "/makro-file/api/v1/pic-material/{ids}",
                "type": "DELETE",
            },
        },
    },
    // 数据采集
    "track": {
        // 系统用户行为日志
        "sysUserLog": {
            "url": "/makro-stat/api/v1/sys/log/user",
            "method": "POST",
        },
    },
    // 语言版本
    "lang": {
        // 获取后端所有的多语言
        "list": {
            "url": api_url + "/makro-admin/api/v1/i18n",
            "type": "GET",
        },
    },
}
// 获取指定模块的api信息
function api(module) {
    var value = api_module;
    var tree = module.split('.');
    for (var key in tree) {
        if (tree[key] !== '') {
            value = value[tree[key]];
            if (value === undefined) {
                return undefined;
            }
        }
    }
    return value;
}
// 获取api的url地址
function getApiUrl(module, params) {
    var item = api(module);
    if (item != undefined) {
        var url = item.url;
        if (typeof(url) == 'string') {
            var key;
            for (var x in params) {
                key = new RegExp('{' + x + '}', 'g');
                // console.log(key)
                url = url.replace(key, params[x]);
            }
            var checkReg = new RegExp('{(\\w+)}', 'g');
            var array = url.match(checkReg);
            if (array !== null && array.length > 0) {
                console.error('getApiUrl()错误：api: ' + module + ' 要求必须提供参数：' + array.join(', '));
            }
            return url;
        }
    }
    console.error('getApiUrl()错误：不存在指定的api: ' + module);
    return null;
}
// 获取api的method
function getApiMethod(module) {
    var item = api(module);
    if (item != undefined) {
        var mothod = item.type;
        if (typeof(mothod) == 'string') {
            return mothod;
        }
    }
    console.error('getApiMethod()错误：不存在指定的api: ' + module);
    return null;
}
class Ajax {
    constructor(xhr) {
        xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        this.xhr = xhr;
    }
    send(options) {
        let xhr = this.xhr;
        let opt = {
            type: options.type || 'get',
            url: options.url || '',
            async: options.async || true,
            dataType: options.dataType || 'json',
            questring: options.questring || ''
        };
        return new Promise((resolve, reject) => {
            xhr.open(opt.type, opt.url, opt.async);
            xhr.onreadystatechange = () => {
                // readyState: 0: init, 1: connect has set up, 2: recive request, 3: request.. , 4: request end, send response
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        // status: 200: OK,  404: Not Found Page
                        if (opt.dataType === 'json') {
                            const data = JSON.parse(xhr.responseText);
                            resolve(data);
                        }
                    } else {
                        reject(new Error(xhr.status || 'Server is fail.'));
                    }
                }
            };
            xhr.onerror = () => {
                reject(new Error(xhr.status || 'Server is fail.'));
            }
            if (options.headers != null) {
                for (var i = 0; i < options.headers.length; i++) {
                    xhr.setRequestHeader(options.headers[i].key, options.headers[i].val);
                }
            }
            // xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            xhr.send(opt.questring);
        });
    }
};
// 获取页面参数
function getUrlRelativePath(i) {
    var url = document.location.toString();
    var arrUrl = url.split("//");
    var start = arrUrl[1].indexOf("/");
    var relUrl = arrUrl[1].substring(start); //stop省略，截取从start开始到结尾的所有字符
    if (relUrl.indexOf("?") != -1) {
        relUrl = relUrl.split("?")[0];
    }
    para = relUrl.split("/");
    return para[i];
}
// 获取页面query参数，不传key则返回全部
function getUrlSearchParams(key) {
    var url = new URL(document.location.href);
    if (key != null && key != '') {
        return url.searchParams.get(key);
    }
    var obj = {};
    url.searchParams.forEach(function(value, key) {
        obj[key] = value;
    });
    return obj;
}
// 单选下拉菜单
function getSelectOption(f, m, a, d, t) {
    var bodyStr = "",
        selected = "";
    AjaxRequest({
        url: m,
        method: "GET",
        data: JSON.stringify(d),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + a
        },
        success: function(result) {
            if (result.code === "0000") {
                bodyStr += '<option value="">Select</option>';
                if (result.data.length === 0) {
                    bodyStr += '<option value="" disabled>No Data</option>';
                } else {
                    $.each(result.data, function(i, o) {
                        if (t == o.id) {
                            selected = ' selected="selected"';
                        } else {
                            selected = '';
                        }
                        bodyStr += '<option value="' + o.id + '" ' + selected + '>' + o.name + '</option>';
                    });
                }
            }
            $('#' + f).html(bodyStr);
            layui.form.render('select');
        }
    });
}
// 多选
function getMultipleOption(f, m, a, d, t) {
    var bodyStr = "",
        selected = "";
    AjaxRequest({
        url: m,
        method: "GET",
        data: JSON.stringify(d),
        headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + a
        },
        success: function(result) {
            if (result.code === "0000") {
                $.each(result.data, function(i, o) {
                    var index = $.inArray(o.id, t);
                    if (index >= 0) {
                        selected = " checked";
                    } else {
                        selected = "";
                    }
                    bodyStr += '<input type="checkbox" name="' + f + '[' + o.id + ']" title="' + o.name + '" ' + selected + '>';
                });
            }
            $("#" + f + "").html(bodyStr);
            layui.form.render();
        }
    });
}
// 渲染组件函数
function render(elem, data, value) {
    // ...待实现
}
//参数是否数值型
function IsNumber(parm) {
    if (parseFloat(parm).toString() == "NaN") {
        return false;
    } else {
        return true;
    }
}
//是否为空
function isEmpty(parm) {
    if (parm == null || parm == undefined || parm == "") {
        return true;
    } else {
        return false;
    }
}
//获取对象数组特定key对应的值数组
function arrayColumn(array, columnKey, indexKey) {
    var type =  Object.prototype.toString.call(array);
    if (type == '[object Array]') {
        if (indexKey == undefined) {
            return array.map((item, index) => {
                return item[columnKey];
            });
        } else {
            var obj = {};
            for (var x in array) {
                var key = array[x][indexKey];
                obj[key] = columnKey == null ? array[x] : array[x][columnKey];
            }
            return obj;
        }
    } else if (type == '[object Object]') {
        var obj = {};
        for (var x in array) {
            var key = indexKey == undefined ? x : array[x][indexKey];
            obj[key] = columnKey == null ? array[x] : array[x][columnKey];
        }
        return obj;
    }
    return null;
}
//获取某个字符串在指定字符串出现的次数
function getCharCount(str, char) {
    var regex = new RegExp(char, 'g'); // 使用g表示整个字符串都要匹配
    var result = str.match(regex); //match方法可在字符串内检索指定的值，或找到一个或多个正则表达式的匹配。
    var count = !result ? 0 : result.length;
    return count;
}
//转为表单数据
function toFormData(data, prefix) {
    var formData = {};
    for (var x in data) {
        var array = [];
        if (prefix) {
            array.push(prefix);
        }
        array.push(x);
        var name = array.join('.');
        if (typeof data[x] != 'string') {
            var list = toFormData(data[x], name);
            formData = Object.assign({}, formData, list);
        } else {
            formData[name] = data[x];
        }
    }
    return formData;
}
//表单数据展开（一维对象转多维对象，key以点“.”形式转为对象，以点“[]”形式转为数组形式）
function formExpand(formData) {
    var data = {};
    var dataIndex;
    // 支持数组，待调
    // var setData = function(res, key, value) {
    //     dataIndex = null;
    //     var checkReg = /\[(.*?)\]$/g;
    //     var array = key.match(checkReg);
    //     if (array !== null && array.length > 0) {
    //         var index = array[0].substring(1).substring(0, array[0].length - 2);
    //         if (index == '') {
    //             if (res === undefined) {
    //                 res = [];
    //             }
    //             res.push(value);
    //             dataIndex = res.length - 1;
    //         } else {
    //             if (res === undefined) {
    //                 res = {};
    //             }
    //             res[index] = value;
    //             dataIndex = index;
    //         }
    //     }
    //     return res;
    // };
    for (var x in formData) {
        if (x.indexOf('.') != -1) {
            var keys = x.split('.');
            var value = formData[x];
            var last = keys.length - 1;
            var tmp = data;
            for (var i = 0; i < keys.length; i++) {
                if (i != last) {
                    if (tmp[keys[i]] === undefined) {
                        tmp[keys[i]] = {};
                    }
                } else {
                    tmp[keys[i]] = value;
                }
                tmp = tmp[keys[i]];
            }
        } else {
            data[x] = formData[x];
        }
    }
    return data;
}
//去除两边空格
function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}
//去除左边空格
function ltrim(str) {
    return str.replace(/(^\s*)/g, "");
}
//去除右边空格
function rtrim(str) {
    return str.replace(/(\s*$)/g, "");
}
//获取后台API地址
function gateway() {
    return $('meta[name="gateway"]').attr("content");
}
//获取时间
function timestamp() {
    return (new Date()).getTime() / 1000;
}
//复制内容到剪切板
function copyText(text) {
    var input = document.createElement('input');
    document.body.appendChild(input);
    input.setAttribute('value', text);
    // input.focus();
    input.select();
    var result = false;
    if (document.execCommand('copy')) {
        document.execCommand('copy');
        result = true;
    }
    document.body.removeChild(input);
    return result;
}
//生成页面编码
function createPageUuid(len, radix) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
// ajax请求全局参数
var ajaxParams = {
    locked: false, // 是否已开启锁定，false=未锁定，true=已锁定（不可创建新的请求）
    lock: {}, // 锁定数据
    tips: {
        lock: 'The request is being submitted, please wait', // 锁定提示
        repeatClick: 'The request is being submitted, please wait', // 重复点击提示
    },
    interval: 0, // 请求时间间隔
    lastRequestTime: 0, // 上次请求时间
    lastClickRequestTime: 0, // 最后点击请求时间，请求间隔判断使用
    loadingStyle: { // 加载样式
        shade: [0.2, '#fff'],
    },
    debug: false,
};