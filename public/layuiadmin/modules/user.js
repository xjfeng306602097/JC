/**

 @Name：layuiAdmin 用户登入和注册等
 
 
 @License: LPPL
    
 */
 
layui.define('form', function(exports){
  var $ = layui.$
  ,layer = layui.layer
  ,laytpl = layui.laytpl
  ,setter = layui.setter
  ,view = layui.view
  ,admin = layui.admin
  ,form = layui.form;

  var $body = $('body');
  
  var current_uuid = '';
  
    $ajaxSent = new Ajax();
    
    var storage = layui.data(setter.tableName);
    
    var myData='', headData=[];
        headData[0]={};
        headData[0].key="Authorization";
        headData[0].val="Bearer "+storage.access_token;
    
  //发送短信验证码
//   admin.sendAuthCode({
//     elem: '#LAY-user-getsmscode'
//     ,elemPhone: '#LAY-user-login-cellphone'
//     ,elemVercode: '#LAY-user-login-vercode'
//     ,ajax: {
//       url: layui.setter.base + 'json/user/sms.js' //实际使用请改成服务端真实接口
//     }
//   });
  
  
  //对外暴露的接口
  exports('user', {});
});