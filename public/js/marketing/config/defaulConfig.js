/**
 * 初始化 默认值
 * @ dbParma 数据库
 * @ createTable 数据库表
 */
//请求资源网址 
var baseUrl=window.location.protocol + "//" +window.location.host;

//空白图片默认地址
var blankPic="/img/nonePic.png";

var svgElement={};
    svgElement.selectedIcon='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><g opacity="1" transform="translate(2 2)  rotate(0 6 6)"><path id="形状结合" fill-rule="evenodd" fill="currentColor" transform="translate(0.6366642549999142 1.9602259944999787)  rotate(0 5.363335745 4.039774005500001)" opacity="1" d="M3.57,5.82L1.59,3.84C1.3,3.55 0.82,3.55 0.53,3.84L0.53,3.84C0.39,3.98 0.31,4.17 0.31,4.37C0.31,4.57 0.39,4.76 0.53,4.9L3,7.37C3.39,7.76 4.02,7.76 4.41,7.37L10.2,1.59C10.49,1.3 10.49,0.82 10.2,0.53L10.2,0.53C10.06,0.39 9.87,0.31 9.67,0.31C9.47,0.31 9.28,0.39 9.14,0.53L3.85,5.82C3.77,5.9 3.65,5.9 3.57,5.82Z "></path></g></g></svg>';
    svgElement.textIcon='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><path id="iconSvg" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(3.0000000000001137 3)  rotate(0 5 5)" opacity="1" d="M4.2 1.2L0 1.2L0 0L10 0L10 1.2L5.8 1.2L5.8 10L4.2 10L4.2 1.2Z "></path></g></svg>';
    svgElement.pictureIcon='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><path id="iconSvg" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(3.4000000000000057 7)  rotate(0 4.6 2.75)" opacity="0.4" d="M9.2,2.32C9.2,1.62 8.72,0 7.41,0C6.19,0 5.77,2.64 4.86,2.64C3.97,2.64 3.69,1.38 2.57,1.38C1.46,1.38 0,3.96 0,3.96L0,5.5L9.2,5.5L9.2,3.44C9.2,3.44 9.2,3.04 9.2,2.32Z "></path><path id="iconSvg" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(2.5 2.5)  rotate(0 5.5 5.5)" opacity="1" d="M0 9C0 9.53043 0.210714 10.0391 0.585786 10.4142C0.960859 10.7893 1.46957 11 2 11L9 11C10.1046 11 11 10.1046 11 9L11 2C11 1.46957 10.7893 0.960859 10.4142 0.585786C10.0391 0.210714 9.53043 0 9 0L2 0C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2L0 9Z M1 9C1 9.26522 1.10536 9.51957 1.29289 9.70711C1.48043 9.89464 1.73478 10 2 10L9 10C9.55229 10 10 9.55229 10 9L10 2C10 1.73478 9.89464 1.48043 9.70711 1.29289C9.51957 1.10536 9.26522 1 9 1L2 1C1.73478 1 1.48043 1.10536 1.29289 1.29289C1.10536 1.48043 1 1.73478 1 2L1 9Z M2.29289 3.70711C2.10536 3.51957 2 3.26522 2 3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2C3.26522 2 3.51957 2.10536 3.70711 2.29289C3.89464 2.48043 4 2.73478 4 3C4 3.55228 3.55228 4 3 4C2.73478 4 2.48043 3.89464 2.29289 3.70711Z "></path></g></svg>';
    svgElement.shapeIcon='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="0 0 20 20" fill="none"><path id="直线 1 (轮廓)" fill-rule="evenodd" fill="currentColor" transform="translate(13.150244140625091 2.650305175288622)  rotate(0 0.6 7.35)" opacity="1" d="M0,0L0,14.7L1.2,14.7L1.2,0L0,0Z "></path><path id="直线 1 (轮廓)" fill-rule="evenodd" fill="currentColor" transform="translate(5.650244140625091 2.650305175288622)  rotate(0 0.6 7.35)" opacity="1" d="M0,0L0,14.7L1.2,14.7L1.2,0L0,0Z "></path><path id="直线 1 (轮廓)" fill-rule="evenodd" fill="currentColor" transform="translate(2.650244140625091 5.650000000000091)  rotate(0 7.35 0.6)" opacity="1" d="M0,1.2L14.7,1.2L14.7,0L0,0L0,1.2Z "></path><path id="直线 1 (轮廓)" fill-rule="evenodd" fill="currentColor" transform="translate(2.650244140625091 13.150305175288622)  rotate(0 7.35 0.6)" opacity="1" d="M0,1.2L14.7,1.2L14.7,0L0,0L0,1.2Z "></path></svg>';
    svgElement.groupIcon='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><path id="并集" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(3 3)  rotate(0 5.5 5)" opacity="1" d="M11 3.5L11 8.5C11 9.33 10.33 10 9.5 10L1.5 10C1.1 10 0.72 9.84 0.44 9.56C0.16 9.28 0 8.9 0 8.5L0 1.5C0 1.1 0.16 0.72 0.44 0.44C0.72 0.16 1.1 0 1.5 0L4.5 0C4.81 0 5.11 0.15 5.3 0.4L6.2 1.6C6.39 1.85 6.69 2 7 2L9.5 2C9.9 2 10.28 2.16 10.56 2.44C10.84 2.72 11 3.1 11 3.5Z M7 3L9.5 3C9.64 3 9.76 3.05 9.85 3.15C9.95 3.24 10 3.36 10 3.5L10 8.5C10 8.83 9.83 9 9.5 9L1.5 9C1.36 9 1.24 8.95 1.15 8.85C1.05 8.76 1 8.64 1 8.5L1 3L7 3Z M5.25 2L4.5 1L1.5 1C1.36 1 1.24 1.05 1.15 1.15C1.05 1.24 1 1.36 1 1.5L1 2L5.25 2Z "></path><path id="矩形 7" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(4 6)  rotate(0 4.5 3)" opacity="0.2" d="M0,6L9,6L9,0L0,0L0,6Z "></path></g></svg>';
    svgElement.upwardsIcon='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><defs><rect id="path_0" x="0" y="0" width="16" height="16"></rect></defs><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><g><path id="iconSvg" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(4 5)  rotate(0 4 2.2499999999999996)" opacity="1" d="M7.96,4.19C7.97,4.16 7.98,4.13 7.99,4.1C8,4.07 8,4.03 8,4C8,3.97 8,3.93 7.99,3.9C7.98,3.87 7.97,3.84 7.96,3.81C7.95,3.78 7.93,3.75 7.92,3.72C7.9,3.69 7.88,3.67 7.85,3.65L4.35,0.15C4.31,0.1 4.25,0.06 4.19,0.04C4.13,0.01 4.07,0 4,0C3.93,0 3.87,0.01 3.81,0.04C3.75,0.06 3.69,0.1 3.65,0.15L0.15,3.65C0.1,3.69 0.06,3.75 0.04,3.81C0.01,3.87 0,3.93 0,4C0,4.07 0.01,4.13 0.04,4.19C0.06,4.25 0.1,4.31 0.15,4.35C0.17,4.38 0.19,4.4 0.22,4.42C0.25,4.43 0.28,4.45 0.31,4.46C0.34,4.47 0.37,4.48 0.4,4.49C0.43,4.5 0.47,4.5 0.5,4.5C0.53,4.5 0.57,4.5 0.6,4.49C0.63,4.48 0.66,4.47 0.69,4.46C0.72,4.45 0.75,4.43 0.78,4.42C0.81,4.4 0.83,4.38 0.85,4.35L4,1.21L7.15,4.35C7.17,4.38 7.19,4.4 7.22,4.42C7.25,4.43 7.28,4.45 7.31,4.46C7.34,4.47 7.37,4.48 7.4,4.49C7.43,4.5 7.47,4.5 7.5,4.5C7.53,4.5 7.57,4.5 7.6,4.49C7.63,4.48 7.66,4.47 7.69,4.46C7.72,4.45 7.75,4.43 7.78,4.42C7.81,4.4 7.83,4.38 7.85,4.35C7.88,4.33 7.9,4.31 7.92,4.28C7.93,4.25 7.95,4.22 7.96,4.19Z "></path></g></g></svg>';
    svgElement.downward='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><path id="矩形 1 (轮廓)" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(4.869552607606693 4.224633491377972)  rotate(-45 3.125 3.125)" opacity="1" d="M6.25,6.25L6.25,5.25L1,5.25L1,0L0,0L0,5.55C0,5.74 0.07,5.91 0.21,6.04C0.34,6.18 0.51,6.25 0.7,6.25L6,6.25L6.25,6.25Z "></path></g></svg>';
    svgElement.showLayerIcon='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><path id="iconSvg" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(2 4)  rotate(0 6 4)" opacity="1" d="M6 0C9.5 0 12 3 12 4C12 5 9.5 8 6 8C2.5 8 0 5 0 4C0 3 2.5 0 6 0Z M6 1.7C7.27 1.7 8.3 2.73 8.3 4C8.3 5.27 7.27 6.3 6 6.3C4.73 6.3 3.7 5.27 3.7 4C3.7 2.73 4.73 1.7 6 1.7Z "></path></g></svg>';
    svgElement.hideLayerIcon='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><g opacity="1" transform="translate(2 4)  rotate(0 6 4)"><path id="iconSvg" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(4.44296008 1.7657620200000004)  rotate(0 3.77851996 3.11711899)" opacity="1" d="M6.04,0L3.86,2.18L3.86,2.23C3.86,3.5 2.83,4.53 1.56,4.53C1.54,4.53 1.52,4.53 1.5,4.53L0,6.03C0.49,6.16 1.01,6.23 1.56,6.23C5.06,6.23 7.56,3.23 7.56,2.23C7.56,1.76 7,0.84 6.04,0Z "></path><path id="iconSvg" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(0 0)  rotate(0 3.8743261799999997 3.1735251499999997)" opacity="1" d="M0,4C0,4.49 0.61,5.48 1.65,6.35L3.72,4.28C3.71,4.19 3.7,4.1 3.7,4C3.7,2.73 4.73,1.7 6,1.7C6.1,1.7 6.19,1.71 6.28,1.72L7.75,0.25C7.2,0.09 6.62,0 6,0C2.5,0 0,3 0,4Z "></path></g><path id="iconSvg" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(7.5555556888730155 1.9999996888730163)  rotate(45 0.5 6)" opacity="1" d="M0,12L1,12L1,0L0,0L0,12Z "></path></g></svg>';
    svgElement.lockLayerIcon='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><path id="iconSvg" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(4 7.5)  rotate(0 4 2.75)" opacity="1" d="M6.123233995736767e-17,4.5C0,4.765216489839544 0.10535684036541781,5.019570402738513 0.29289321881345254,5.207106781186548C0.48042959726148726,5.394643159634582 0.7347835101604561,5.5 1,5.5L7,5.5C7.552284749830793,5.5 8,5.052284749830793 8,4.5L8,1.0000000000000002C8,0.7347835101604557 7.894643159634582,0.4804295972614867 7.707106781186547,0.2928932188134521C7.519570402738513,0.10535684036541748 7.265216489839544,-2.220446049250313e-16 7,-2.220446049250313e-16L1.0000000000000002,0C0.7347835101604562,-2.220446049250313e-16 0.48042959726148704,0.1053568403654177 0.2928932188134523,0.2928932188134524C0.10535684036541759,0.48042959726148715 -2.220446049250313e-16,0.7347835101604563 -2.220446049250313e-16,1.0000000000000002Z "></path><path id="iconSvg" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(5 3)  rotate(0 3 2.25)" opacity="1" d="M0.8,0.8C0.27,1.33 0,1.98 0,2.73L0,4.5L1,4.5L1,2.73C1,2.26 1.17,1.85 1.51,1.51C1.85,1.17 2.26,1 2.73,1L3.27,1C3.74,1 4.15,1.17 4.49,1.51C4.83,1.85 5,2.26 5,2.73L5,4.5L6,4.5L6,2.73C6,1.98 5.73,1.33 5.2,0.8C4.67,0.27 4.02,0 3.27,0L2.73,0C1.98,0 1.33,0.27 0.8,0.8Z "></path></g></svg>';
    svgElement.unLockLayerIcon='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16" fill="none"><g opacity="1" transform="translate(0 0)  rotate(0 8 8)"><path id="iconSvg" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(5 7.5)  rotate(0 4 2.75)" opacity="1" d="M6.123233995736767e-17,4.5C0,4.765216489839544 0.10535684036541781,5.019570402738513 0.29289321881345254,5.207106781186548C0.48042959726148726,5.394643159634582 0.7347835101604561,5.5 1,5.5L7,5.5C7.552284749830793,5.5 8,5.052284749830793 8,4.5L8,1.0000000000000002C8,0.7347835101604557 7.894643159634582,0.4804295972614867 7.707106781186547,0.2928932188134521C7.519570402738513,0.10535684036541748 7.265216489839544,-2.220446049250313e-16 7,-2.220446049250313e-16L1.0000000000000002,0C0.7347835101604562,-2.220446049250313e-16 0.48042959726148704,0.1053568403654177 0.2928932188134523,0.2928932188134524C0.10535684036541759,0.48042959726148715 -2.220446049250313e-16,0.7347835101604563 -2.220446049250313e-16,1.0000000000000002Z "></path><path id="iconSvg" fill-rule="evenodd" fill="rgba(32, 32, 32, 1)" transform="translate(2 3)  rotate(0 3 2.5)" opacity="1" d="M5,2.73L5,4.5L6,4.5L6,2.73C6,1.98 5.73,1.33 5.2,0.8C4.67,0.27 4.02,0 3.27,0L2.73,0C1.98,0 1.33,0.27 0.8,0.8C0.27,1.33 0,1.98 0,2.73L3.061616997868383e-17,4.5C-1.9760167391247307e-9,4.632608237469191 0.052678416311607745,4.759785194703645 0.14644660413837013,4.8535533853249175C0.2402147919651325,4.94732157594619 0.3673917476296473,4.999999998023983 0.49999999254941924,5L0.5,5C0.6326082449197721,5 0.7597852013692565,4.947321579817291 0.8535533905932738,4.853553390593274C0.9473215798172911,4.759785201369256 1,4.632608244919772 1,4.5L1,2.73C1,2.26 1.17,1.85 1.51,1.51C1.85,1.17 2.26,1 2.73,1L3.27,1C3.74,1 4.15,1.17 4.49,1.51C4.83,1.85 5,2.26 5,2.73Z "></path></g></svg>';



//最大/小缩放比例
var maxZoom=3;
var minZoom=0.05;

//缩略图最小边尺寸最小值，用于计算生成缩略图比例
var minThumbnail=1500;
var maxThumbnail=3000;


/** 数据库配置 **/
var dbParma={dataBaseName:"makroMM",version:2}; 
var createTable=[];
createTable[0]={
    tableName:"historyRecord",
    keyPath:{name : 'id',autoIncrement : true},
    fileds:[
        {name:"UUID",unique:true},
        {name:'msg',unique:true},
        {name:'time',unique:false},
        {name:'userID',unique:true},
        {name:'mmCode',unique:true},
        {name:'templateCode',unique:true},
        {name:'pageCode',unique:true},
        {name:'mode',unique:true},
        {name:'jsonCode',unique:true},
        {name:'active',unique:true},
        
        {name:'templatePages',unique:true},
        {name:'pageArrJson',unique:true},
        {name:'cunterPage',unique:true},
        //当前页本次操作记录的副本编号
        {name:'pageNo',unique:true},
        {name:'undoGroupSource',unique:true},
        //图层Html内容
        {name:'layerHtmlCode',unique:true},

    ]
};
createTable[1]={
    tableName:"tempPageSave",
    keyPath:{name : 'id',autoIncrement : true},
    fileds:[
        {name:'UUID',unique:true},
        {name:'time',unique:true},
        {name:'userID',unique:true},
        {name:'mmCode',unique:false},
        {name:'templateCode',unique:false},
        {name:'pageCode',unique:true},
        {name:'pageSort',unique:true},
        {name:'status',unique:true},
        {name:'jsonCode',unique:true},
        {name:'preView',unique:true}
        //active 0为非活动页，1为活动页
    ]
};

