/**

 @Name：makro 
 @Author：makro
 @Site：http://ho.makrogo.com/makroDigital/approvalWorkflow/flowchart
    
 */

layui.config({
    base: '../../layuiadmin/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'common', 'laydate', 'layer', 'form', 'laytpl'], function() {
    var $ = layui.$
        ,setter = layui.setter
        ,permission = layui.common.permission
        ,layer = layui.layer
        ,laydate = layui.laydate
        ,form = layui.form
        ,laytpl = layui.laytpl;
        
    var current_id = getUrlRelativePath(4);
    
    var storage = layui.data(setter.tableName);

    // 是否有权限编辑
    var isEdit = permission.verify('approval:workflow:flowchart:save');

    var processData = [];
    var deleteData = [];
    var roles = [], roleNames = {}, roleCodes = {};

    var permissionData;
    // beginPermisson与originPermisson已设置并且相等时代表未修改，不需要去修改权限
    var beginPermisson, originPermisson;

    processData.push({
        title: 'Start',
        step: 1,
    });
    loadRoles(function(data) {
        roles = data || [];
        $.each(roles, function(index, item) {
            roleNames[item.id] = item.name;
            roleCodes[item.id] = item.code;
        });
    });
    loadWorkflowConfig(function(data) {
        processData = data || [];
        var html = '';
        var tpl = $('#addNodeTpl').html();
        processData.sort(function(a, b) {
            return a.step - b.step;
        });
        $.each(processData, function(index, item) {
            var itemData = {
                title: item.title,
                icon: 'circle',
                color: '#FF943E',
                user: item.roleName,
                step: item.step,
            };
            if (item.step == 1) {
                itemData.color = '#5FB878';
            }
            html += laytpl(tpl).render(itemData);
        });
        $('#box-all>div').not('.end-node').remove();
        $('#box-all .end-node').before(html);
        permission.render();
    }, function() {
        layer.msg('Error');
    });

    var _this;
    var scale = 1;

    window.zoomOut = function () {
        zoomSize(scale - 0.1);
    };

    window.zoomIn = function () {
        zoomSize(scale + 0.1);
    };

    function zoomSize(value) {
        var n = Math.round((value) * 100);
        if (n <= 0 || n > 200) {
            return;
        }
        scale = n / 100;
        $("#box-all").css("transform", "scale(" + scale + ")");
        $(".zoom .zoom-scale").text(n + '%');
        if (n > 100) {
            $("#box-all").css("transform-origin", "left top");
            // 移动滚动条到中间
            var width = $("#box-all").outerWidth();
            var left = parseInt((width * scale - width) / 2);
            $(".main").scrollLeft(left);
        } else {
            $("#box-all").css("transform-origin", "50% 0px 0px");
        }
    }
    function loadWorkflowConfig(success, fail) {
        $.ajax({
            url: getApiUrl('approval.workflow.getConfig', { id: current_id }),
            type: getApiMethod('approval.workflow.getConfig'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                if (result.code === '0000') {
                    success && success(result.data);
                } else {
                    fail && fail();
                }
            },
            error: function(e) {
                fail && fail();
            }
        });
    }
    function loadRoles(success, fail) {
        $.ajax({
            url: getApiUrl('role.list'),
            type: getApiMethod('role.list'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            success: function(result) {
                if (result.code === '0000') {
                    success && success(result.data);
                } else {
                    fail && fail();
                }
            },
            error: function(e) {
                fail && fail();
            }
        });
    }
    // 保存工作流配置
    $("#saveWorkflow").on("click", function(e) {
        var data = processData;
        var step = 1;
        var isStop = false;
        $.each(processData, function(index, item) {
            item.step = step;
            if (item.roleId == null) {
                layer.msg('Please select a Reviewer!');
                var mainBox = $('.main');
                var divBox = mainBox.find('#box-all>div').eq(index);
                mainBox.animate({
                    scrollTop: divBox.offset().top - mainBox.offset().top + mainBox.scrollTop()
                }, 200);
                isStop = true;
                return false;
            }
            ++step;
        });
        if (isStop) {
            return;
        }
        var load = layer.load(1);
        var totalStep = 1;// 总步骤，如果存在多个异步请求，请修改此处数量
        var completed = function() {
            --totalStep;
            // 仅在最后一步时关闭载入层
            if (totalStep <= 0) {
                layer.close(load);
            }
        };
        data = data.concat(deleteData);
        $.ajax({
            url: getApiUrl('approval.workflow.updateConfig', { id: current_id }),
            type: getApiMethod('approval.workflow.updateConfig'),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + storage.access_token
            },
            data: JSON.stringify(data),
            success: function(result) {
                if (result.code === '0000') {
                    layer.msg(result.msg);
                } else {
                    layer.msg(result.msg);
                }
            },
            error: function(e) {
                layer.msg('Error');
            },
            complete: completed
        });
        if (beginPermisson != undefined && beginPermisson !== originPermisson) {
            totalStep = 2;
            var updateData = {
                relatePermission: beginPermisson,
            };
            $.ajax({
                url: getApiUrl('approval.workflow.update', { id: current_id }),
                type: getApiMethod('approval.workflow.update'),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + storage.access_token
                },
                data: JSON.stringify(updateData),
                success: function(result) {
                    if (result.code === "0000") {
                        originPermisson = beginPermisson;
                    } else {
                        layer.msg(result.msg);
                    }
                },
                error: function(e) {
                    layer.msg('Error');
                },
                complete: completed
            });
        }
    });
    $("#box-all").on("click", ".addNodeClick", function(e) {
        _this = this;
        var offsetTop = $(this).offset().top;
        var offsetLeft = $(this).offset().left;
        $("#addtooltip-warpper").css({
            "left": offsetLeft + 20,
            "top": offsetTop - 10,
            "margin-left": "30px"
        });
        $("#addtooltip-warpper").hide();
        $("#addtooltip-warpper").show(150);
    });
    //新增
    $(document).on("click", ".item-wrapper", function(e) {
        e.stopPropagation(); //阻止事件冒泡
        var that = $(_this).parent().parent().parent().parent();
        var itemIndex = that.index();
        var addType = $(this).attr("data-addType");
        var html = '';
        if (addType == 1) { //审核人
            var tpl = $('#addNodeTpl').html();
            html += laytpl(tpl).render({
                title: 'Reviewer',
                color: 'rgb(255, 148, 62)',
                icon: 'circle',
                user: 'None',
            });
            processData.splice(itemIndex + 1, 0, {
                title: 'Reviewer',
            });
        }
        that.after(html);
        permission.render();
        $("#addtooltip-warpper").hide(100);
    });
    //删除
    $(document).on("click", ".btnRemove", function(e) {
        if ($(this).parents().hasClass("node-wrap")) {
            var that = $(this).parents(".node-wrap").parent();
            var itemIndex = that.index();
            if (processData.length <= 2) {
                layer.msg('The last approval node cannot be deleted');
                return false;
            }
            e.stopPropagation(); //阻止事件冒泡
            that.remove();
            var removeItem = processData.splice(itemIndex, 1)[0];
            if (removeItem) {
                removeItem.deleted = 1;
                deleteData.push(removeItem);
                // deleteData.push({
                //     id: removeItem.id,
                //     deleted: 1,
                // });
            }
        }
    });
    //详情、编辑
    $(document).on("click", ".node-wrap-box", function(e) {
        var that = $(this).parents(".node-wrap").parent();
        var itemIndex = that.index();
        var step = parseInt(itemIndex) + 1;//processData[itemIndex].step;
        var tpl = $('#editNodeTpl').html();
        var content = laytpl(tpl).render({
            step: step,
        });
        var index_page = layer.open({
            type: 1
            ,title: 'Edit - Step ' + step
            ,id: 'editNode'
            ,content: content
            ,maxmin: false
            ,move: false
            ,resize: false
            ,shade: 0.2
            ,shadeClose: true
            ,anim: 5
            ,isOutAnim: false
            ,offset: 'rt'
            ,area: ['500px', '100%']
            ,btn: isEdit ? ['Save', 'Cancel'] : ['Close']
            ,success: function(layero, index) {
                var roleOptions = '<option value="">Select</option>';
                $.each(roles, function(index, item) {
                    roleOptions += '<option value="' + item.id + '">' + item.name + '</option>';
                });
                layero.find('select[name="role"]').html(roleOptions);
                if (!isEdit) {
                    layero.find('select,input,textarea').prop('disabled', true);
                    layero.find('#choosePermission').hide();
                    layero.find('input[name="relatePermission"]').attr('type', 'text');
                }
                form.val('processNode', {
                    title: processData[itemIndex].title,
                    role: processData[itemIndex].roleId,
                    remark: processData[itemIndex].remark,
                });
                if (step == 1) {
                    firstStep();
                }
                form.render();
            }
            ,yes: function (index, layero) {
                var submitID = 'LAY-processNode-edit-submit',
                    submit = layero.find('#' + submitID);
                    
                form.on('submit(' + submitID + ')', function(obj) {
                    var field = JSON.stringify(obj.field);
                    var result = JSON.parse(field);
                    
                    that.find('.node-title').text(result.title);
                    processData[itemIndex].title = result.title;
                    processData[itemIndex].remark = result.remark;
                    if (result.role != undefined) {
                        processData[itemIndex].roleId = result.role;
                        processData[itemIndex].roleCode = roleCodes[result.role];
                        processData[itemIndex].roleName = roleNames[result.role];
                        that.find('.node-user').text(roleNames[result.role]);
                    }
                    if (step == 1) {
                        if (beginPermisson != result.relatePermission) {
                            beginPermisson = result.relatePermission;
                        }
                    }
                    // that.find('.node-remark').text(result.remark);
                    layer.close(index);
                });
                submit.trigger('click');
            }
        });
    });

    // 编辑第一步时
    function firstStep() {
        var load = layer.load(1);
        if (permissionData) {
            $.each(permissionData, function(index, item) {
                item.selected = false;
            });
        }
        if (isEdit) {
            choosePermission = xmSelect.render({
                el: '#choosePermission',
                radio: true,
                clickClose: true,
                enableHoverFirst: false,
                model: {
                    type: 'relative',
                },
                style: {
                    minHeight: '38px',
                    lineHeight: '38px',
                    boxSizing: 'border-box',
                },
                filterable: true,
                // layVerify: 'required',
                data: permissionData || [],
                language: 'en',
                template: function(obj) {
                    return '<span title="' + obj.item.name + '">' + obj.value + '</span>';
                },
                on: function(data) {
                    var arr = data.arr;
                    var list = [];
                    for (var x in arr) {
                        list.push(arr[x].value);
                    }
                    var relatePermission = list.join(',');
                    form.val('processNode', {
                        relatePermission: relatePermission,
                    });
                },
            });
        }
        var totalStep = 1;// 总步骤，如果存在多个异步请求，请修改此处数量
        var success = function () {
            --totalStep;
            // 仅在最后一步时进行赋值select
            if (totalStep <= 0) {
                var workflow = form.val('processNode');
                if (beginPermisson == undefined) {
                    beginPermisson = originPermisson;
                }
                if (isEdit) {
                    choosePermission.append(beginPermisson.split(','));
                }
                form.val('processNode', {
                    relatePermission: beginPermisson,
                });
                layer.close(load);
            }
        };
        if (isEdit) {
            totalStep = 2;
            // 执行载入权限列表
            loadPermissionList({
                limit: 999999999,
                page: 1,
            }, success);
        }
        // 载入工作流数据
        loadWorkflowData(null, success);
        // 载入权限数据
        var __loadPermissionList_fail_number = 0;
        function loadPermissionList(data, success) {
            if (permissionData != undefined) {
                success && success();
                return;
            }
            $.ajax({
                url: getApiUrl('permission.list'),
                type: getApiMethod('permission.list'),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + storage.access_token
                },
                data: data,
                success: function(result) {
                    __loadPermissionList_fail_number = 0;
                    if (result.code === "0000") {
                        var list = result.data;
                        if (list != null && list.length > 0) {
                            permissionData = [];
                            $.each(list, function(index, value) {
                                var tmp = list[index];
                                if (tmp.btnPerm != '') {
                                    permissionData.push({
                                        name: tmp.name,
                                        value: tmp.btnPerm,
                                        selected: false,
                                    });
                                }
                            });
                            permissionData.sort(function(a,b) {
                                return a.value.localeCompare(b.value);
                            });
                            choosePermission.update({
                                data: permissionData,
                            });
                        }
                        success && success();
                    } else {
                        layer.msg(result.msg);
                    }
                },
                error: function(e) {
                    ++__loadPermissionList_fail_number;
                    console.log('loadPermissionList: 网络错误！');
                    if (__loadPermissionList_fail_number < 3) {
                        setTimeout(function() {
                            loadPermissionList(data, success);
                        }, 100);
                    } else {
                        console.log('loadPermissionList: 已累计3次请求失败');
                    }
                }
            });
        }
        // 载入workflow数据
        var __loadWorkflowData_fail_number = 0;
        function loadWorkflowData(data, success) {
            if (originPermisson != undefined) {
                success && success();
                return;
            }
            $.ajax({
                url: getApiUrl('approval.workflow.detail', {id: current_id}),
                type: getApiMethod('approval.workflow.detail'),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + storage.access_token
                },
                data: data,
                success: function(result) {
                    __loadWorkflowData_fail_number = 0;
                    if (result.code === "0000") {
                        var workflowData = result.data;
                        originPermisson = workflowData.relatePermission;
                        success && success();
                    } else {
                        layer.msg(result.msg);
                    }
                },
                error: function(e) {
                    ++__loadWorkflowData_fail_number;
                    console.log('loadWorkflowData: 网络错误！');
                    if (__loadWorkflowData_fail_number < 3) {
                        setTimeout(function() {
                            loadWorkflowData(data, success);
                        }, 100);
                    } else {
                        console.log('loadWorkflowData: 已累计3次请求失败');
                    }
                }
            });
        }
    }

    //页面滑动 新增角色框跟着滑动
    $(".main").scroll(function() {
        if ($(_this).length == 0) {
            return;
        }
        //获取   已存按钮（_this）  -----点击的新增    出现的距离；
        var nowScrollTop = $(_this).offset().top - 10;
        if (!$("#addtooltip-warpper").is(":hidden")) $("#addtooltip-warpper").css("top", nowScrollTop);
    });
    //绑定整个页面点击隐藏新增角色
    $(document).on('click', function(e) {
        e = e || window.event; //浏览器兼容性
        var elem = e.target;
        if (elem.className && elem.className == $(".addNodeClick").eq(0).attr("class") && $("#addtooltip-warpper").css("display", "block")) {
            return false;
        }
        $("#addtooltip-warpper").hide(150);
    });

});