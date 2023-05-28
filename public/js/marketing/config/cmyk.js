
var cmykColor=function () {
    var self=this;
    self.colorConverterHex="",self.colorConverterCmyk="",self.colorType="",self.colorObject;
    self.myColor=[];
    self.defaultColor=[{"titleEn":"White","titleCn":"白色(white)","rgb":"255,255,255","cmyk":"0,0,0,0","hex":"#ffffff"},{"titleEn":"Black","titleCn":"黑色(black)","rgb":"0,0,0","cmyk":"0,0,0,100","hex":"#000000"},{"titleEn":"Yellow","titleCn":"黄色(Yellow)","rgb":"255,241,0","cmyk":"0,0,100,0","hex":"#fff100"},{"titleEn":"Cyan","titleCn":"青色(Cyan)","rgb":"0,153,68","cmyk":"100,0,100,0","hex":"#009944"},{"titleEn":"Red","titleCn":"红色(Red)","rgb":"230,0,18","cmyk":"0,100,100,0","hex":"#e60012"},{"titleEn":"Magenta","titleCn":"洋红色(Magenta)","rgb":"228,0,127","cmyk":"0,100,0,0","hex":"#e4007f"},{"titleEn":"Magenta","titleCn":"品红、洋红Magenta（热情）","rgb":"207,0,112","cmyk":"15,100,20,0","hex":"#cf0070"},{"titleEn":"Carmine","titleCn":"胭脂红Carmine（大胆）","rgb":"215,0,63","cmyk":"0,100,60,10","hex":"#d70040"},{"titleEn":"Ruby","titleCn":"宝石红Ruby（富贵）","rgb":"200,8,82","cmyk":"20,100,50,0","hex":"#c80852"},{"titleEn":"Rose-red","titleCn":"玫瑰红Rose-red（典雅）","rgb":"230,27,100","cmyk":"0,95,35,0","hex":"#e61b64"},{"titleEn":"Camellia","titleCn":"山茶红Camellia（微笑）","rgb":"220,90,111","cmyk":"0,75,35,10","hex":"#dc5a6f"},{"titleEn":"Rose-pink","titleCn":"玫瑰粉Rose-pink（女人味）","rgb":"238,134,154","cmyk":"0,60,20,0","hex":"#ee869a"},{"titleEn":"Spinel-red","titleCn":"浓粉Spinel-red（娇媚）","rgb":"240,145,146","cmyk":"0,55,30,0","hex":"#f09192"},{"titleEn":"Opera-mauve","titleCn":"紫红色Opera-mauve（优美）","rgb":"225,152,192","cmyk":"10,50,0,0","hex":"#e198c0"},{"titleEn":"Coral-pink","titleCn":"珊瑚粉Coral-pink（温顺）","rgb":"241,156,159","cmyk":"0,50,25,0","hex":"#f19c9f"},{"titleEn":"Flamingo","titleCn":"火烈鸟Flamingo（可爱）","rgb":"245,178,178","cmyk":"0,40,20,10","hex":"#f5b2b2"},{"titleEn":"Pale-pink","titleCn":"淡粉Pale-pink（雅致）","rgb":"247,200,207","cmyk":"0,30,10,0","hex":"#f7c8cf"},{"titleEn":"Shell-pink","titleCn":"贝壳粉Shell-pink（纯真）","rgb":"248,198,181","cmyk":"0,30,25,0","hex":"#f8c6b5"},{"titleEn":"Baby-pink","titleCn":"淡粉，婴儿粉Baby-pink（美丽动人）","rgb":"252,229,223","cmyk":"0,15,10,0","hex":"#fce5df"},{"titleEn":"Salmon-pink","titleCn":"鲑鱼粉Salmon-pink（有趣）","rgb":"242,155,135","cmyk":"0,50,40,0","hex":"#f29b87"},{"titleEn":"Vermilion","titleCn":"朱红Vermilion（积极）","rgb":"233,71,41","cmyk":"0,85,85,0","hex":"#e94729"},{"titleEn":"Scarlet","titleCn":"绯红，绛红scarlet（生命力）","rgb":"230,0,18","cmyk":"0,100,100,0","hex":"#e60012"},{"titleEn":"Strong-red","titleCn":"深红Strong-red（华丽）","rgb":"216,0,15","cmyk":"0,100,100,10","hex":"#d8000f"},{"titleEn":"Cardinal-red","titleCn":"绯红Cardinal-red（威严）","rgb":"164,0,39","cmyk":"0,100,65,40","hex":"#a40027"},{"titleEn":"Burgundy","titleCn":"酒红Burgundy（充实）","rgb":"102,25,45","cmyk":"60,100,80,30","hex":"#66192d"},{"titleEn":"Old-rose","titleCn":"土红Old-rose（柔软）","rgb":"194,115,127","cmyk":"15,60,30,15","hex":"#c2737f"},{"titleEn":"Tangerine","titleCn":"橙色Tangerine（生气勃勃）","rgb":"234,85,32","cmyk":"0,80,90,0","hex":"#ea5520"},{"titleEn":"Persimmon","titleCn":"柿子色Persimmon（开朗）","rgb":"237,110,61","cmyk":"0,70,75,0","hex":"#ed6e3d"},{"titleEn":"Orange","titleCn":"橘黄色Orange（美好）","rgb":"237,109,0","cmyk":"0,70,100,0","hex":"#ed6d00"},{"titleEn":"Sun-orange","titleCn":"太阳橙Sun-orange（丰收）","rgb":"241,141,0","cmyk":"0,55,100,0","hex":"#f18d00"},{"titleEn":"Tropical-orange","titleCn":"热带橙Tropical-orange（幻想）","rgb":"243,152,57","cmyk":"0,50,80,0","hex":"#f39839"},{"titleEn":"Honey-orange","titleCn":"蜂蜜色Honey-orange（轻快）","rgb":"249,194,112","cmyk":"0,30,60,0","hex":"#f9c270"},{"titleEn":"Apricot","titleCn":"杏黄色Apricot（无邪）","rgb":"229,169,107","cmyk":"10,40,60,0","hex":"#e5a96b"},{"titleEn":"Sandbeige","titleCn":"伪装沙Sandbeige（天真）","rgb":"236,214,202","cmyk":"0,15,15,10","hex":"#ecd6ca"},{"titleEn":"Beige","titleCn":"浅茶色、米色Beige（纯朴）","rgb":"227,204,169","cmyk":"0,15,30,15","hex":"#e3cca9"},{"titleEn":"Pale-ocre","titleCn":"浅土色Pale-ocre（温和）","rgb":"211,181,148","cmyk":"20,30,45,0","hex":"#d3b594"},{"titleEn":"Camel","titleCn":"驼色Camel（质朴）","rgb":"181,134,84","cmyk":"10,40,60,30","hex":"#b58654"},{"titleEn":"Coconuts-brown","titleCn":"椰棕色Coconuts-brown（古典）","rgb":"106,51,21","cmyk":"50,80,100,40","hex":"#6a3315"},{"titleEn":"Brown","titleCn":"棕色、茶色Brown（安定）","rgb":"113,59,18","cmyk":"45,75,100,40","hex":"#713b12"},{"titleEn":"Coffee","titleCn":"咖啡Coffee（坚实）","rgb":"106,75,35","cmyk":"60,70,100,25","hex":"#6a4b23"},{"titleEn":"Marigold","titleCn":"金盏花Marigold（华丽）","rgb":"247,171,0","cmyk":"0,40,100,0","hex":"#f7ab00"},{"titleEn":"Chrome-yellow","titleCn":"铬黄Chrome-yellow（生动）","rgb":"253,208,0","cmyk":"0,20,100,0","hex":"#fdd000"},{"titleEn":"Jasmine","titleCn":"茉莉Jasmine（柔和）","rgb":"254,221,120","cmyk":"0,15,60,0","hex":"#fedd78"},{"titleEn":"Cream","titleCn":"淡黄色Cream（童话）","rgb":"255,234,180","cmyk":"0,10,35,0","hex":"#ffeab4"},{"titleEn":"Ivory","titleCn":"象牙色Ivory（简朴）","rgb":"235,229,209","cmyk":"10,10,20,0","hex":"#ebe5d1"},{"titleEn":"Champagne-yellow","titleCn":"香槟黄Champagne-yellow（醇厚）","rgb":"255,249,177","cmyk":"0,0,40,0","hex":"#fff9b1"},{"titleEn":"Moon-yellow","titleCn":"月亮黄Moon-yellow（智慧）","rgb":"255,244,99","cmyk":"0,0,70,0","hex":"#fff463"},{"titleEn":"Canaria-yellow","titleCn":"鲜黄色Canaria-yellow（开放）","rgb":"255,241,0","cmyk":"0,0,100,0","hex":"#fff100"},{"titleEn":"Mimosa","titleCn":"含羞草、巴黎金合欢Mimosa（幸福）","rgb":"237,212,67","cmyk":"10,15,80,0","hex":"#edd443"},{"titleEn":"Mustard","titleCn":"芥子Mustard（乡土）","rgb":"214,197,96","cmyk":"20,20,70,0","hex":"#d6c560"},{"titleEn":"Ochre","titleCn":"黄土色Ochre（温厚）","rgb":"196,143,0","cmyk":"0,35,100,30","hex":"#c48f00"},{"titleEn":"Khaki","titleCn":"卡其色Khaki（田园）","rgb":"176,136,39","cmyk":"0,30,80,40","hex":"#b08827"},{"titleEn":"Yellow-green","titleCn":"黄绿色Yellow-green（自由）","rgb":"196,215,0","cmyk":"30,0,100,0","hex":"#c4d700"},{"titleEn":"Apple-green","titleCn":"苹果绿Apple-green（新鲜）","rgb":"158,189,25","cmyk":"45,10,100,0","hex":"#9ebd19"},{"titleEn":"Fresh-leaves","titleCn":"嫩绿Fresh-leaves（快活）","rgb":"169,208,107","cmyk":"40,0,70,0","hex":"#a9d06b"},{"titleEn":"Foliage-green","titleCn":"叶绿色Foliage-green（自然）","rgb":"135,162,86","cmyk":"50,20,75,10","hex":"#87a256"},{"titleEn":"Grass-green","titleCn":"草绿色Grass-green（成长）","rgb":"170,196,104","cmyk":"40,10,70,0","hex":"#aac468"},{"titleEn":"Moss-green","titleCn":"苔绿色Moss-green（柔和）","rgb":"136,134,55","cmyk":"25,15,75,45","hex":"#888637"},{"titleEn":"Olive","titleCn":"橄榄绿Olive（诚意）","rgb":"98,90,5","cmyk":"45,40,100,50","hex":"#625a05"},{"titleEn":"Ivy-green","titleCn":"常青藤Ivy-green（安心）","rgb":"61,125,83","cmyk":"70,20,70,30","hex":"#3d7d53"},{"titleEn":"Cobalt-green","titleCn":"钴绿Cobalt-green（自然）","rgb":"106,189,120","cmyk":"60,0,65,0","hex":"#6abd78"},{"titleEn":"Emerald-green","titleCn":"翡翠绿Emerald-green（希望）","rgb":"21,174,103","cmyk":"75,0,75,0","hex":"#15ae67"},{"titleEn":"Turquoise-green","titleCn":"碧绿Turquoise-green（协调）","rgb":"66,171,145","cmyk":"70,10,50,0","hex":"#42ab91"},{"titleEn":"Celadon-green","titleCn":"灰绿色、青瓷色Celadon-green（潇洒）","rgb":"123,185,155","cmyk":"55,10,45,0","hex":"#7bb99b"},{"titleEn":"Malachite-green","titleCn":"孔雀石绿Malachite-green（和平）","rgb":"0,142,87","cmyk":"85,15,80,10","hex":"#008e57"},{"titleEn":"Mint","titleCn":"薄荷Mint（痛快）","rgb":"0,120,80","cmyk":"90,30,80,15","hex":"#007850"},{"titleEn":"Viridian","titleCn":"碧色Viridian（温情）","rgb":"0,101,80","cmyk":"90,35,70,30","hex":"#006550"},{"titleEn":"Peacock-green","titleCn":"孔雀绿Peacock-green（品格）","rgb":"0,128,119","cmyk":"100,30,60,0","hex":"#008077"},{"titleEn":"Horizon-blue","titleCn":"地平线Horizon-blue（奇趣）","rgb":"176,220,213","cmyk":"35,0,20,0","hex":"#b0dcd5"},{"titleEn":"Light sky-blue","titleCn":"浅天蓝色Light sky-blue（澄澈）","rgb":"161,216,230","cmyk":"40,0,10,0","hex":"#a1d8e6"},{"titleEn":"Aqua-blue","titleCn":"水蓝Aqua-blue（正义）","rgb":"89,195,226","cmyk":"60,0,10,0","hex":"#59c3e2"},{"titleEn":"Azure-blue","titleCn":"蔚蓝Azure-blue（爽快）","rgb":"34,174,230","cmyk":"70,10,0,0","hex":"#22aee6"},{"titleEn":"Sky-blue","titleCn":"天蓝Sky-blue（清凉）","rgb":"148,198,221","cmyk":"45,10,10,0","hex":"#94c6dd"},{"titleEn":"Baby-blue","titleCn":"淡蓝Baby-blue（幻想）","rgb":"177,212,219","cmyk":"30,0,10,10","hex":"#b1d4db"},{"titleEn":"Pale-blue","titleCn":"浅蓝Pale-blue（温和）","rgb":"139,176,205","cmyk":"40,10,0,20","hex":"#8bb0cd"},{"titleEn":"Saxe-blue","titleCn":"水蓝、浅蓝Saxe-blue（宽容）","rgb":"82,129,172","cmyk":"60,15,0,30","hex":"#5281ac"},{"titleEn":"Aquamarine","titleCn":"蓝绿色、水蓝宝石Aquamarine（纯粹）","rgb":"41,131,177","cmyk":"75,30,10,15","hex":"#2983b1"},{"titleEn":"Turquoise-blue","titleCn":"翠蓝、土耳其玉色Turquoise-blue（平衡）","rgb":"0,164,197","cmyk":"80,10,20,0","hex":"#00a4c5"},{"titleEn":"Cyan-blue","titleCn":"蓝绿Cyan-blue（清楚）","rgb":"0,136,144","cmyk":"95,25,45,0","hex":"#008890"},{"titleEn":"Peacock-blue","titleCn":"孔雀蓝Peacock-blue（贵重）","rgb":"0,105,128","cmyk":"100,50,45,0","hex":"#006980"},{"titleEn":"Cerulean-blue","titleCn":"天蓝Cerulean-blue（冷静）","rgb":"0,123,187","cmyk":"100,35,10,0","hex":"#007bbb"},{"titleEn":"Cobalt-blue","titleCn":"钴蓝Cobalt-blue（镇静）","rgb":"0,93,172","cmyk":"95,60,0,0","hex":"#005dac"},{"titleEn":"Ultramarine","titleCn":"深蓝Ultramarine（深远）","rgb":"0,64,152","cmyk":"100,80,0,0","hex":"#004098"},{"titleEn":"Royal-blue","titleCn":"品蓝、宝蓝Royal-blue（格调）","rgb":"30,80,162","cmyk":"90,70,0,0","hex":"#1e50a2"},{"titleEn":"Lapis lazuli","titleCn":"青金石、靛色Lapis lazuli（睿智）","rgb":"19,64,152","cmyk":"95,80,0,0","hex":"#134098"},{"titleEn":"Salvia-blue","titleCn":"鼠尾草Salvia-blue（洗练）","rgb":"91,119,175","cmyk":"70,50,10,0","hex":"#5b77af"},{"titleEn":"Wedgwood-blue","titleCn":"韦奇伍德蓝Wedgwood-blue（高贵）","rgb":"102,132,176","cmyk":"55,30,0,25","hex":"#6684b0"},{"titleEn":"Slate-blue","titleCn":"青蓝Slate-blue（静寂）","rgb":"100,121,151","cmyk":"60,40,20,20","hex":"#647997"},{"titleEn":"Sapphire-blue","titleCn":"天蓝、宝蓝Sapphire-blue（智慧）","rgb":"0,87,137","cmyk":"90,45,10,35","hex":"#005789"},{"titleEn":"Mineral-blue","titleCn":"石青Mineral-blue（认真）","rgb":"0,81,120","cmyk":"100,70,40,0","hex":"#005178"},{"titleEn":"Strong-blue","titleCn":"亮蓝Strong-blue（礼节）","rgb":"0,89,120","cmyk":"100,40,30,35","hex":"#005978"},{"titleEn":"Marine-blue","titleCn":"海蓝Marine-blue（时髦）","rgb":"0,69,107","cmyk":"100,60,30,35","hex":"#00456b"},{"titleEn":"Navy-blue","titleCn":"海军蓝、深蓝Navy-blue（纪律）","rgb":"0,28,84","cmyk":"100,90,25,45","hex":"#001c54"},{"titleEn":"Indigo","titleCn":"靛青Indigo（庄严）","rgb":"0,46,90","cmyk":"90,60,10,60","hex":"#002e5a"},{"titleEn":"Dark mineral-blue","titleCn":"深石青Dark mineral-blue（理智）","rgb":"56,66,106","cmyk":"80,70,30,30","hex":"#38426a"},{"titleEn":"Midnight-blue","titleCn":"深蓝Midnight-blue（传统）","rgb":"4,22,58","cmyk":"100,95,50,50","hex":"#04163a"},{"titleEn":"Wisteria","titleCn":"紫藤Wisteria（风雅）","rgb":"115,91,159","cmyk":"60,65,0,10","hex":"#735b9f"},{"titleEn":"Mauve","titleCn":"淡紫色Mauve（清凉）","rgb":"124,80,157","cmyk":"60,75,0,0","hex":"#7c509d"},{"titleEn":"Clematis","titleCn":"铁线莲Clematis（赞美）","rgb":"216,191,203","cmyk":"0,20,0,20","hex":"#d8bfcb"},{"titleEn":"Lilac","titleCn":"丁香Lilac（清香）","rgb":"187,161,203","cmyk":"30,40,0,0","hex":"#bba1cb"},{"titleEn":"Lavender","titleCn":"薰衣草Lavender（品格）","rgb":"166,136,177","cmyk":"40,50,10,0","hex":"#a688b1"},{"titleEn":"Amethyst","titleCn":"紫水晶Amethyst（直觉）","rgb":"126,73,133","cmyk":"60,80,20,0","hex":"#7e4985"},{"titleEn":"Purple","titleCn":"紫色Purple（优雅）","rgb":"146,61,146","cmyk":"50,85,0,0","hex":"#923d92"},{"titleEn":"Heliotrope","titleCn":"香水草Heliotrope（高尚）","rgb":"111,25,111","cmyk":"65,100,20,10","hex":"#6f196f"},{"titleEn":"Mineral violet","titleCn":"紫罗兰Mineral violet（怀旧）","rgb":"197,175,192","cmyk":"20,30,10,10","hex":"#c5afc0"},{"titleEn":"Pansy","titleCn":"三色堇、蝴蝶花Pansy（思虑）","rgb":"139,0,98","cmyk":"35,100,10,30","hex":"#8b0062"},{"titleEn":"Mallow","titleCn":"锦葵Mallow（妖精）","rgb":"211,105,164","cmyk":"15,70,0,0","hex":"#d369a4"},{"titleEn":"Orchid","titleCn":"兰花Orchid（温和）","rgb":"209,136,168","cmyk":"0,50,0,20","hex":"#d188a8"},{"titleEn":"Pale-lilac","titleCn":"浅莲灰Pale-lilac（萌芽）","rgb":"237,224,230","cmyk":"0,10,0,10","hex":"#ede0e6"},{"titleEn":"Gray-purple","titleCn":"灰紫Gray-purple（柔和）","rgb":"157,137,157","cmyk":"25,35,10,30","hex":"#9d899d"}];

    self.loadDefaultColor=function(callback=null){

        var _Html='';
        for (var i=0;i<self.defaultColor.length;i++){

            _Html=_Html + '<div class="colorLi mr-10 chooseColor" cmyk="'+self.defaultColor[i].cmyk+'" hex="'+self.defaultColor[i].hex+'">';
            _Html=_Html + ' <div class="colorLiBorder ">';
            _Html=_Html + '   <div class="colorView" title="'+self.defaultColor[i].titleEn+' '+self.defaultColor[i].hex.toUpperCase()+' CMYK:'+self.defaultColor[i].cmyk+'" style="background-color:'+self.defaultColor[i].hex+';"></div>';
            _Html=_Html + ' </div>';
            _Html=_Html + '</div>';

        }

        $("#defaultColorList").html(_Html);

    }

    self.loadSystemColor=function(colorData,callback=null){

        var _Html='';
        for (var i=0;i<colorData.length;i++){

            _Html=_Html + '<div class="colorLi mr-10 chooseColor" cmyk="'+ colorData[i].cmyk+'" hex="'+ colorData[i].hex+'">';
            _Html=_Html + ' <div class="colorLiBorder ">';
            _Html=_Html + '   <div class="colorView" title="' + colorData[i].hex.toUpperCase()+' CMYK:'+ colorData[i].cmyk+'" style="background-color:'+ colorData[i].hex+';"></div>';
            _Html=_Html + ' </div>';
            _Html=_Html + '</div>';

        }

        $("#defaultColorList").html(_Html);

    }


    self.loadMyColor=function(parma,callback=null){
        self.myColor=parma;

        var _Html='<div class="createColor colorLi mr-10">';
            //_Html=_Html + ' <div class="colorLiBorder " onclick=javascript:document.getElementById("selectColor").click();>';
            _Html=_Html + ' <div class="colorLiBorder openPickerColor" id="openPickerColor">';
            _Html=_Html + '   <div class="colorView layui-unselect layui-coloreditor">';
            _Html=_Html + '     <i class="layui-icon layui-icon-addition"></i>';
            _Html=_Html + '   </div>';
            _Html=_Html + ' </div>';

            //_Html=_Html + '<input type="color" id="selectColor" value="#AA3130" onchange="change_user_color();">';

            _Html=_Html + '</div>';

        if (parma!=null && parma!=undefined && parma!=''){
            for (var i=0;i<parma.length;i++){

                _Html=_Html + '<div class="colorLi mr-10 " >';
                _Html=_Html + ' <div class="colorLiBorder chooseColor" cmyk="'+parma[i].cmyk+'" hex="'+parma[i].hex+'">';
                _Html=_Html + '   <div class="colorView" title="' + parma[i].hex.toUpperCase()+' CMYK:'+parma[i].cmyk+'" style="background-color:'+parma[i].hex+';"></div>';
                _Html=_Html + ' </div>';
                _Html=_Html + ' <div class="deleteColor colored" sort="'+i+'"><i class="layui-icon layui-icon-delete delIconBtn" title="Delete"></i></div>';
                //_Html=_Html + ' <div class="delBtnBg"></div>';
                _Html=_Html + '</div>';

            }
        }
        $("#myColorList").html(_Html);

    }

    self.insertMyColor=function(parma,callback=null){

        if (parma!=null && parma!=undefined && parma!=''){
            var _Html='';
            for (var i=0;i<parma.length;i++){

                _Html=_Html + '<div class="colorLi mr-10 " >';
                _Html=_Html + ' <div class="colorLiBorder chooseColor" cmyk="'+parma[i].cmyk+'" hex="'+parma[i].hex+'">';
                _Html=_Html + '   <div class="colorView" title="' + parma[i].hex.toUpperCase()+' CMYK:'+parma[i].cmyk+'" style="background-color:'+parma[i].hex+';"></div>';
                _Html=_Html + ' </div>';
                _Html=_Html + ' <div class="deleteColor" sort="'+i+'"><i class="layui-icon layui-icon-delete delIconBtn" title="Delete"></i></div>';
                _Html=_Html + '</div>';

            }
            $("#myColorList").append(_Html);
        }
    }

    //初始化
    self.init=function(callback=null){
        returnFun=callback;

        //组装颜色配件
        var cssCode='';
            cssCode=cssCode + '.colorWin.disWin {display:block;}';
            cssCode=cssCode + '.colorWin{width:278px;height:100%;position:fixed;right:241px;top:47px;background-color:#fff;box-shadow:-2px 0px 3px rgb(0 0 0 / 12%);cursor:default;border-left:1px solid #d2d2d2;z-index:99;display:none;}';
            cssCode=cssCode + '.colorWin .colorSearch{width:250px;margin-left:14px;margin-right:14px;margin-top:0px;display:table}';
            cssCode=cssCode + '.colorWin .colorSearch .searchBox{width:100%;height:34px;border:1px solid #bbbbbb;border-radius:4px;background-color:#fff;overflow:hidden;position:relative}';
            cssCode=cssCode + '.colorWin .colorSearch .searchBox > span{width:34px;height:34px;line-height:34px;text-align:center;display:inline-block;position:absolute;left:1px;top:1px;z-index:2}';
            cssCode=cssCode + '.colorWin .colorSearch .searchBox > span >i{font-size:18px;color:#333}';
            cssCode=cssCode + '.colorWin .colorSearch .searchBox > input{width:99%;height:34px;border:0px;line-height:34px;font-size:14px;color:#333;text-indent:44px;text-align:left}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard{width:100%;height:auto;margin-top:10px}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .boardTitle{width:100%;height:30px;line-height:30px;color:#333;font-weight:bold;text-align:left;text-indent:4px}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList{width:100%;max-height:200px;overflow:hidden;overflow-y:scroll}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList::-webkit-scrollbar{display:none}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .colorLi{width:36px;height:36px;display:inline-block;border:1px solid #bbbbbb;border-radius:3px}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .createColor.colorLi{border:1px solid #AA3130}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .createColor.colorLi .colorLiBorder .colorView:hover{background-color:#AA3130;color:#fff}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .createColor .colorLiBorder .colorView{background-color:#fff}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .colorLi.mr-10{margin-right:12px;margin-bottom:4px;display:inline-block;float:left;position:relative;}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .colorLi .deleteColor{width:100%;height:16px;text-align:center;position:absolute;right:0px;bottom:0px;cursor:pointer;z-index:2;color:#fff;}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .colorLi .deleteColor{background-color:#333;-webkit-filter:opacity(60%); filter: opacity(60%);opacity:0.6;}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .colorLi .deleteColor:hover{-webkit-filter:opacity(90%); filter: opacity(90%);opacity:0.9;}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .colorLi .deleteColor > i{font-size:14px;}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .colorLi.mr-10:nth-child(5n){margin-right:0px}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .colorLi .colorLiBorder{padding:0px;width:36px;height:36px;cursor:pointer;display:table}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .colorLi .colorLiBorder .colorView:hover{margin:2px;width:32px;height:32px;line-height:32px;overflow:visible;padding:0px;}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .colorLi .colorLiBorder .colorView{width:100%;height:36px;text-align:center;line-height:36px;color:#AA3130;overflow:hidden;position:relative;padding:0px;}';
            cssCode=cssCode + '.colorWin .colorSearch .colorBoard .colorList .colorLi .colorLiBorder .colorView > i{font-size:18px;font-weight:bold}';
            
            cssCode=cssCode + '.createColor {position:relative;overflow: hidden;}';
            cssCode=cssCode + '.createColor:hover{position: relative;overflow: visible;padding:0px;}';
            cssCode=cssCode + '.createColor .colorLiBorder {position: absolute;z-index: 3;top: 0px;left: 0px;cursor:pointer;}';
            cssCode=cssCode + '#selectColor{width:36px;height: 36px;background-color: transparent;position: absolute;left: 0px;top: 0px;border: 0px;z-index: 2;}';

            cssCode=cssCode + '.preViewColor {width: 230px;height: auto;display: table;margin-left: 14px;margin-top: 20px;border: 1px solid #eee;padding: 5px;}';
            cssCode=cssCode + '.preViewColor .colorBox{width: 50px;height: 50px;float: left;border: 1px solid #eee;}';
            cssCode=cssCode + '.preViewColor .colorBox > span{width: 100%;height: 50px;display: table;font-size: 12px;line-height: 50px;cursor:pointer;}';
            cssCode=cssCode + '.preViewColor .colorInfo {width: auto;max-width: 180px;height: 50px;overflow: hidden;float: left;margin-left: 10px;}';
            cssCode=cssCode + '.preViewColor .colorInfo >span{width: auto;height: 16px;line-height: 16px;display: table;color: #333;font-size: 12px;}';

            cssCode=cssCode + '.inlineBlock {width:240px;height:auto;margin-left:14px;display:table;padding-top:5px;padding-bottom:5px;}';
            cssCode=cssCode + '.inlineBlock #clearColorBtn{float:right;width:auto;height:20px;line-height:20px;border-radius:2px;font-size:12px;padding-left:16px;padding-right:16px;padding-top:2px;padding-bottom:2px;cursor:pointer;background-color:#fff;border:1px solid #eee;color:#333;}';
            cssCode=cssCode + '.inlineBlock #clearColorBtn:hover{border:1px solid #ddd;background-color:#eee;}';


            //layui colorPicker
            cssCode=cssCode + '.layui-coloreditor-trigger-span {border:0px;color:#aa3130 !important;background-color:#fff !important;font-weight: bold;}';
            cssCode=cssCode + '.layui-coloreditor-trigger-span i {color:#aa3130 !important;}';
            cssCode=cssCode + '.layui-coloreditor-trigger-span:hover {border:0px;background-color:#aa3130 !important;color:#fff !important;}';
            cssCode=cssCode + '.layui-coloreditor-trigger-span:hover i {color:#fff !important;}';
            cssCode=cssCode + '.layui-coloreditor {width: 32px;height: 32px;border: 0px;padding: 2px;line-height: 34px;border-radius: 0px;}';

        var style = document.createElement('style');
        style.innerHTML = cssCode;
        document.head.appendChild(style);


        var _Html='';
            _Html=_Html + '<div class="colorWin">';
            _Html=_Html + ' <div class="preViewColor" >';
            _Html=_Html + '     <div class="colorBox">';
            _Html=_Html + '         <span id="currentColor" style="background-color:#fff;color:#fff;text-align: center;">Current</span>';
            _Html=_Html + '     </div>';
            _Html=_Html + '     <div class="colorInfo">';
            _Html=_Html + '         <span class="cmykInfo">CMYK:0,0,0,0</span>';
            _Html=_Html + '         <span class="rgbInfo">RGB:255,255,255</span>';
            _Html=_Html + '         <span class="hexInfo">HEX:#FFFFFF</span>';
            _Html=_Html + '     </div>';
            _Html=_Html + ' </div>';
            _Html=_Html + '<div class="inlineBlock"><div id="clearColorBtn">Clear</div></div>';
            _Html=_Html + ' <div class="colorSearch">';
            _Html=_Html + '     <div class="colorBoard" >';
            _Html=_Html + '         <div class="boardTitle">My Color</div>';
            _Html=_Html + '         <div class="colorList" id="myColorList"></div>';
            _Html=_Html + '     </div>';
            _Html=_Html + '     <div class="colorBoard" >';
            _Html=_Html + '         <div class="boardTitle">System Color</div>';
            _Html=_Html + '         <div class="colorList" id="defaultColorList"></div>';
            _Html=_Html + '     </div>';
            _Html=_Html + ' </div>';
            _Html=_Html + '</div>';
        /*
        var colorHtml = document.createElement('div');
        colorHtml.innerHTML = _Html;
        document.body.appendChild(colorHtml);*/
        $('body').append(_Html);
    }
    
    //执行完回调函数
    self.done=function(data){
        
    }

    self.updateMyColor=function(colorData){

    }

    /*
    //确认色彩
    self.confirmColor=function(elemID){
        var e=document.getElementById( elemID );
        e.firstChild.style.cssText="background-color:"+self.colorConverterHex+" !important";
        e.setAttribute("cmyk",self.colorConverterCmyk);
        e.setAttribute("hex",self.colorConverterHex);
        
        var colorType=e.getAttribute("colortype");
        self.done({colorType:colorType,Hex:self.colorConverterHex,Cmyk:self.colorConverterCmyk});
        return;
    }
    
    
    //清空色彩(透明)
    self.transparentColor=function(elemID){
        self.colorConverterHex="";
        self.colorConverterCmyk="";
        
        var e=document.getElementById( elemID );
        e.firstChild.style.cssText="background-color:"+self.colorConverterHex+" !important";
        e.setAttribute("cmyk",self.colorConverterCmyk);
        e.setAttribute("hex",self.colorConverterHex);
        
        var colorType=e.getAttribute("colortype");
        self.done({colorType:colorType,Hex:self.colorConverterHex,Cmyk:self.colorConverterCmyk});
    }
    */
    
    //生成颜色框
    self.createCmykColor=function(parm){
        self.colorConverterHex="",self.colorConverterCmyk="";

        var e=document.getElementById(parm.elem);
        
        var _Html="<span class='disColor' style='background-color:"+parm.color+"'></span>";
        if (e.getAttribute("clearColor")=="true"){
            _Html=_Html + "<span class='layui-coloreditor-trigger-span clearColor' >";
            _Html=_Html + "<i class='layui-icon layui-coloreditor-trigger-i layui-icon-close'></i>";
            _Html=_Html + "</span>";
        }
        _Html=_Html + "<div class='colorLayer'></div>";
        e.innerHTML=_Html;
        if (parm.cmyk=="undefined" || isEmpty(parm.cmyk) || parm.cmyk=="NaN,NaN,NaN,NaN"){parm.cmyk="";};
        if (parm.hex=="undefined" || isEmpty(parm.hex) || parm.hex=="NaN,NaN,NaN,NaN"){parm.hex="";};

        e.setAttribute("cmyk",parm.cmyk);
        e.setAttribute("hex",parm.hex);
        e.setAttribute("colortype",parm.colorType);
        return;


        //disColor监听
        e.firstChild.addEventListener('click',function () {
            var thisXY={left:e.offsetLeft,top:e.offsetTop};
            
            var panel=document.getElementsByClassName("edit-attribute-panel")[0];
            var panelHeight=parseInt(panel.style.height);
            if (panelHeight>700){
                e.lastChild.style.cssText="top:" + (50) +"px;right:" + (-170) + "px";
            }else{
                e.lastChild.style.cssText="top:" + (10) +"px;right:" + (-170) + "px";
            }
            e.lastChild.style.display="block";
            
            //实例ID
            var elem="'" + this.parentNode.id + "'";
            
            //取对象CMYK色
            var _tmpGet=e.getAttribute("cmyk");
            if (_tmpGet==""||_tmpGet==null || _tmpGet==undefined || _tmpGet=="NaN,NaN,NaN,NaN" || _tmpGet=="undefined" || _tmpGet=="null"){
                var cmykValue=[0,0,0,0];
            }else{
                var cmykValue=_tmpGet.split(",");
            }
            
            self.colorConverterCmyk=cmykValue;
            //取对象RGB色
            var _tmpGet=e.getAttribute("hex");
            if (_tmpGet==""||_tmpGet==null || _tmpGet==undefined){
                var hexValue="#FFFFFF";
            }else{
                var hexValue=_tmpGet;
            }
            self.colorConverterHex=hexValue;
            
            
            /** CMYK Input & Preview Box **/
            var colorLayerHtml='';
            e.lastChild.innerHTML=colorLayerHtml;
        })
        
        e.addEventListener("click",function(data){
            if(data.target.className){
                switch (data.target.className)
                {
                    case "submitBtn":
                        self.confirmColor(parm.elem);
                    break;
                    case "clearColorBtn":
                        self.transparentColor(parm.elem);
                    break;
                }
            }
            
        });
        
        e.addEventListener("input",function(data){
            //data.target 输入本身
            //data.target.value 输入后的值
            
            if (data.target.value*1>100){
                data.target.value=100;
            }else if (data.target.value*1<0){
                data.target.value=0;
            }
            self.updateColor(data.target);
        })
        
    }
    
    //更新颜色选择
    self.updateColor=function (elem){
        
        var _parent= elem.parentNode.parentNode;
        for (var i=0;i<_parent.childNodes.length;i++){
            if (_parent.childNodes[i].className=="valueInput"){
                switch (_parent.childNodes[i].firstChild.nextSibling.name)
                {
                    case "cyanValue":
                        _c=parseInt(_parent.childNodes[i].firstChild.nextSibling.value);
                    break;
                    case "magentaValue":
                        _m=parseInt(_parent.childNodes[i].firstChild.nextSibling.value);
                    break;                    
                    case "yellowValue":
                        _y=parseInt(_parent.childNodes[i].firstChild.nextSibling.value);
                    break;                    
                    case "KblackValue":
                        _k=parseInt(_parent.childNodes[i].firstChild.nextSibling.value);
                    break;                    
                }
            }
        }
        
        //计算RGB HEX
        var _rgb = self.colorConverter.toRGB(new CMYK(_c,_m,_y,_k));
        var _hex =  self.dec2Hex(_rgb.r).toString() + self.dec2Hex(_rgb.g).toString() + self.dec2Hex(_rgb.b).toString();
        self.colorConverterHex="#"+_hex;
        self.colorConverterCmyk=_c+","+_m+","+_y+","+_k;
        
        //更新色彩预览区别
        _parent.parentNode.parentNode.childNodes[1].firstChild.nextSibling.childNodes[0].nextSibling.style.cssText="background-color:#"+_hex+" !important";
        var nodes=_parent.parentNode.parentNode.parentNode.childNodes;
        for (var i=0;i<nodes.length;i++){
            if (nodes[i].className=="newColorInfo"){
                nodes[i].innerHTML="New Color: HEX(#" + _hex.toUpperCase() + ") ,CMYK("+_c+"%,"+_m+"%,"+_y+"%,"+_k+"%"+")";
            }
        }
    }
    
    //转为16进制形式
    self.dec2Hex=function (i)
    {
         var result = "00";
         if   (i >= 0  && i <= 15)  { result = "0" + i.toString(16); }
         else if (i >= 16  && i <= 255)  { result = i.toString(16); }
         return result
    }
    
    //各种颜色之前转换
    self.colorConverter={
            
        // rgb转cmyk，接口转换
        _RGBtoCMYK_API : function(RGB,component=null, success) {
            var color = RGB.r + ',' + RGB.g + ',' + RGB.b;
            var data = {
                "color": color,
                "colorMode": "rgb",
            };
            $.ajax({
                url: '/makroDigital/MarketingColor/convert',
                type: 'POST',
                async:false,
                data: data,
                success: function(result) {
                    if (result.color) {
                        success && success(result.color,component);
                    }
                },
                error: function(e) {

                }
            });
        },
            
        //RGB字符串转RGB对象    
        _RGBToObject:function (rgb, defaultValue) {
            if (typeof rgb == 'string') {
                var array = rgb.match(/^rgb\((.*?)\)/);
                if (array != null && array.length > 0 && array[1]) {
                    var rgbValue = array[1].replace(/\s+/g, '');
                    var rgbArray = rgbValue.split(',');
                    var r = rgbArray[0];
                    var g = rgbArray[1];
                    var b = rgbArray[2];
                    if (r <= 255 && g <= 255 && b <= 255) {
                        return new RGB(r, g, b);
                    }
                }
            }
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            return new RGB(0, 0, 0);
        },
            
        //将hex颜色转成rgb
       _HexToRgba : function (hex, opacity) {
            if (hex!="" && hex!=null && hex!=undefined){   
                let RGBA = "rgba(" + parseInt("0x" + hex.slice(1, 3)) + "," + parseInt("0x" + hex.slice(3, 5)) + "," + parseInt( "0x" + hex.slice(5, 7)) + "," + opacity + ")";
                return {
                    r: parseInt("0x" + hex.slice(1, 3)),
                    g: parseInt("0x" + hex.slice(3, 5)),
                    b: parseInt("0x" + hex.slice(5, 7)),
                    a: RGBA
                }
            }else{
                return "";
            }
        },
        
        _RGBtoHSV : function  (RGB) {
            var result = new HSV(0, 0, 0);
     
            r = RGB.r / 255;
            g = RGB.g / 255;
            b = RGB.b / 255;
     
            var minVal = Math.min(r, g, b);
            var maxVal = Math.max(r, g, b);
            var delta = maxVal - minVal;
     
            result.v = maxVal;
     
            if (delta == 0) {
                result.h = 0;
                result.s = 0;
            } else {
                result.s = delta / maxVal;
                var del_R = (((maxVal - r) / 6) + (delta / 2)) / delta;
                var del_G = (((maxVal - g) / 6) + (delta / 2)) / delta;
                var del_B = (((maxVal - b) / 6) + (delta / 2)) / delta;
     
                if (r == maxVal) { result.h = del_B - del_G; }
                else if (g == maxVal) { result.h = (1 / 3) + del_R - del_B; }
                else if (b == maxVal) { result.h = (2 / 3) + del_G - del_R; }
     
                if (result.h < 0) { result.h += 1; }
                if (result.h > 1) { result.h -= 1; }
            }
     
            result.h = Math.round(result.h * 360);
            result.s = Math.round(result.s * 1000)/10;
            result.v = Math.round(result.v * 1000)/10;
     
            return result;
        },
     
        _HSVtoRGB : function  (HSV) {
            var result = new RGB(0, 0, 0);
     
            var h = HSV.h / 360;
            var s = HSV.s / 100;
            var v = HSV.v / 100;
     
            if (s == 0) {
                result.r = v * 255;
                result.g = v * 255;
                result.v = v * 255;
            } else {
                var_h = h * 6;
                var_i = Math.floor(var_h);
                var_1 = v * (1 - s);
                var_2 = v * (1 - s * (var_h - var_i));
                var_3 = v * (1 - s * (1 - (var_h - var_i)));
     
                if (var_i == 0) {var_r = v; var_g = var_3; var_b = var_1}
                else if (var_i == 1) {var_r = var_2; var_g = v; var_b = var_1}
                else if (var_i == 2) {var_r = var_1; var_g = v; var_b = var_3}
                else if (var_i == 3) {var_r = var_1; var_g = var_2; var_b = v}
                else if (var_i == 4) {var_r = var_3; var_g = var_1; var_b = v}
                else {var_r = v; var_g = var_1; var_b = var_2};
     
                result.r = var_r * 255;
                result.g = var_g * 255;
                result.b = var_b * 255;
     
                result.r = Math.round(result.r);
                result.g = Math.round(result.g);
                result.b = Math.round(result.b);
            }
     
            return result;
        },
    
        _RGBtoHSL : function  (RGB) {
            var result = new HSL(0, 0, 0);
     
            r = RGB.r / 255;
            g = RGB.g / 255;
            b = RGB.b / 255;
     
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            result.l=(max + min) / 2;
        
            if (max == min) {
                result.h = result.s = 0; // achromatic
            } else {
                var d = max - min;
                result.s = result.l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
                switch (max) {
                  case r: result.h = (g - b) / d + (g < b ? 6 : 0); break;
                  case g: result.h = (b - r) / d + 2; break;
                  case b: result.h = (r - g) / d + 4; break;
                }
            } 
            result.h=Math.round(result.h*60);
            result.s=Math.round(result.s*1000)/10;
            result.l=Math.round(result.l*1000)/10;
         
            return result;
        },
        
        _HSLtoRGB : function  (HSL) {
              var result = new RGB(0, 0, 0);
              var h=HSL.h/360;
              var s=HSL.s/100;
              var l=HSL.l/100;
              
              if (s == 0) {
                result.r = result.g = result.b = l; // achromatic
              } else {
                function hue2rgb(p, q, t) {
                  if (t < 0) t += 1;
                  if (t > 1) t -= 1;
                  if (t < 1/6) return p + (q - p) * 6 * t;
                  if (t < 1/2) return q;
                  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                  return p;
                }
            
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
            
                result.r = hue2rgb(p, q, h + 1/3);
                result.g = hue2rgb(p, q, h);
                result.b = hue2rgb(p, q, h - 1/3);
              }
              result.r=Math.round(result.r*255);
              result.g=Math.round(result.g*255);
              result.b=Math.round(result.b*255);
              
              return result;
        },
         
        _CMYKtoRGB : function (CMYK){
            var result = new RGB(0, 0, 0);
     
            c = CMYK.c / 100;
            m = CMYK.m / 100;
            y = CMYK.y / 100;
            k = CMYK.k / 100;
     
            result.r = 1 - Math.min( 1, c * ( 1 - k ) + k );
            result.g = 1 - Math.min( 1, m * ( 1 - k ) + k );
            result.b = 1 - Math.min( 1, y * ( 1 - k ) + k );
     
            result.r = Math.round( result.r * 255 );
            result.g = Math.round( result.g * 255 );
            result.b = Math.round( result.b * 255 );
     
            return result;
        },
     
        _RGBtoCMYK : function (RGB){
            var result = new CMYK(0, 0, 0, 0);
     
            r = RGB.r / 255;
            g = RGB.g / 255;
            b = RGB.b / 255;
     
            result.k = Math.min( 1 - r, 1 - g, 1 - b );
            if ((1 - result.k) == 0 ){
              result.c = 0 ;
              result.m = 0 ;
              result.y = 0 ;
        } else {
            result.c = ( 1 - r - result.k ) / ( 1 - result.k );
            result.m = ( 1 - g - result.k ) / ( 1 - result.k );
            result.y = ( 1 - b - result.k ) / ( 1 - result.k );
        }
            result.c = Math.round( result.c * 100 );
            result.m = Math.round( result.m * 100 );
            result.y = Math.round( result.y * 100 );
            result.k = Math.round( result.k * 100 );
     
            return result;
        },
     
        toRGB : function (o) {
            if (o instanceof RGB) { return o; }
            if (o instanceof HSV) { return this._HSVtoRGB(o); }
            if (o instanceof HSL) { return this._HSLtoRGB(o); }
            if (o instanceof CMYK) { return this._CMYKtoRGB(o); }
        },
     
        toHSV : function (o) {
            if (o instanceof HSV) { return o; }
            if (o instanceof RGB) { return this._RGBtoHSV(o); }
            if (o instanceof CMYK) { return this._RGBtoHSV(this._CMYKtoRGB(o)); }
        },
    
        toHSL : function (o) {
            if (o instanceof HSL) { return o; }
            if (o instanceof RGB) { return this._RGBtoHSL(o); }
            //if (o instanceof CMYK) { return this._RGBtoHSV(this._CMYKtoRGB(o)); }
        },
     
        toCMYK : function (o) {
            if (o instanceof CMYK) { return o; }
            if (o instanceof RGB) { return this._RGBtoCMYK(o); }
            if (o instanceof HSV) { return this._RGBtoCMYK(this._HSVtoRGB(o)); }
        },

        decimalToHex : function(d){
          var hex = Number(d*1).toString(16);
          while (hex.length < 2) {hex = "0" + hex;}
          return hex;
        }
    }
    
    function HSV(h, s, v) {
        if (h <= 0) { h = 0; }
        if (s <= 0) { s = 0; }
        if (v <= 0) { v = 0; }
     
        if (h > 360) { h = 360; }
        if (s > 100) { s = 100; }
        if (v > 100) { v = 100; }
     
        this.h = h;
        this.s = s;
        this.v = v;
    }
    
    function HSL(h, s, l) {
        if (h <= 0) { h = 0; }
        if (s <= 0) { s = 0; }
        if (l <= 0) { l = 0; }
     
        if (h > 360) { h = 360; }
        if (s > 100) { s = 100; }
        if (l > 100) { l = 100; }
     
        this.h = h;
        this.s = s;
        this.l = l;
    }
     
    function RGB(r, g, b) {
        if (r <= 0) { r = 0; }
        if (g <= 0) { g = 0; }
        if (b <= 0) { b = 0; }
     
        if (r > 255) { r = 255; }
        if (g > 255) { g = 255; }
        if (b > 255) { b = 255; }
     
        this.r = r;
        this.g = g;
        this.b = b;
    }
     
    function CMYK(c, m, y, k) {
        if (c <= 0) { c = 0; }
        if (m <= 0) { m = 0; }
        if (y <= 0) { y = 0; }
        if (k <= 0) { k = 0; }
     
        if (c > 100) { c = 100; }
        if (m > 100) { m = 100; }
        if (y > 100) { y = 100; }
        if (k > 100) { k = 100; }
     
        this.c = c;
        this.m = m;
        this.y = y;
        this.k = k;
    }



}

function change_user_color(){
    var tmpColor={};
    var hexColor=$("#selectColor").val();
    var rgbColor=_CMYK.colorConverter._HexToRgba(hexColor, 1);
    var cmykColor=_CMYK.colorConverter._RGBtoCMYK(rgbColor);

    tmpColor.hex=hexColor;
    tmpColor.rgb=rgbColor.r + "," + rgbColor.g + "," + rgbColor.b;
    tmpColor.cmyk=cmykColor.c + "," + cmykColor.m + "," + cmykColor.y + "," + cmykColor.k;

    if (_CMYK.myColor==null){
        _CMYK.myColor=[];
    }
    _CMYK.myColor.push(tmpColor);
    _CMYK.loadMyColor(_CMYK.myColor);
    _CMYK.updateMyColor(_CMYK.myColor);

}
function change_colorPicker(hexColor,rgbColor,cmykColor){
  
    if ((hexColor==null || hexColor=="") && (rgbColor==null || rgbColor=="") && (cmykColor==null || cmykColor=="") ){
        var tmpColor={};
        tmpColor.cmykColor={c:"",m:"",y:"",k:""};
        tmpColor.rgbColor={r:"",g:"",b:""};
        tmpColor.hexColor="";
        return tmpColor;
    }else {
        if (hexColor.length==7 && hexColor.substr(0,1)=="#"){
            hexColor=hexColor.toUpperCase();
            var tmpColor={};
            tmpColor.rgbColor=_CMYK.colorConverter._HexToRgba(hexColor, 1);
            tmpColor.cmykColor=_CMYK.colorConverter._RGBtoCMYK(tmpColor.rgbColor);
            tmpColor.hexColor=hexColor;
            return tmpColor;
        }else if (rgbColor!=""){
      
            var rcArr=rgbColor.split(",");
            if (rcArr.length==3 && rcArr[0]!="" && rcArr[1]!="" && rcArr[2]!=""){
                
                var tmpColor={};
                tmpColor.cmykColor=_CMYK.colorConverter._RGBtoCMYK({r:rcArr[0],g:rcArr[1],b:rcArr[2]});
                tmpColor.rgbColor={r:rcArr[0],g:rcArr[1],b:rcArr[2]};
                tmpColor.hexColor=_CMYK.colorConverter.decimalToHex(tmpColor.rgbColor.r) + _CMYK.colorConverter.decimalToHex(tmpColor.rgbColor.g) + _CMYK.colorConverter.decimalToHex(tmpColor.rgbColor.b);
                return tmpColor;

            }else{
                var tmpColor={};
                tmpColor.cmykColor={c:"",m:"",y:"",k:""};
                tmpColor.rgbColor={r:"",g:"",b:""};
                tmpColor.hexColor="";
                return tmpColor;
            }
        }else if (cmykColor!=""){

            var ccArr=cmykColor.split(",");
            if (ccArr.length==4 && ccArr[0]!="" && ccArr[1]!="" && ccArr[2]!="" && ccArr[3]!=""){
                
                var tmpColor={};
                tmpColor.cmykColor={c:ccArr[0],m:ccArr[1],y:ccArr[2],k:ccArr[3]};
                tmpColor.rgbColor=_CMYK.colorConverter._CMYKtoRGB(tmpColor.cmykColor);
                tmpColor.hexColor=_CMYK.colorConverter.decimalToHex(tmpColor.rgbColor.r) + _CMYK.colorConverter.decimalToHex(tmpColor.rgbColor.g) + _CMYK.colorConverter.decimalToHex(tmpColor.rgbColor.b);
                return tmpColor;

            }else{
                var tmpColor={};
                tmpColor.cmykColor={c:"",m:"",y:"",k:""};
                tmpColor.rgbColor={r:"",g:"",b:""};
                tmpColor.hexColor="";
                return tmpColor;
            }

        }

    }
}

//选色框失去焦点处理处理
$(document).click(function(e){
    var _con = $('.colorWin');
    if (!_con.is(e.target) && _con.has(e.target).length === 0 && $('.colorWin').hasClass("disWin")) {
        //console.log(e.target.className);
        if (e.target.className!="" && e.target.className!=null && e.target.className!=undefined){
            var classTitleArr=e.target.className.split(" ");
            var disabledClassArr=["layui-coloreditor-main-box","layui-btn layui-btn-primary layui-btn-sm colored","layui-btn layui-btn-sm colored","layui-input colored","layui-anim layui-anim-downbit layui-coloreditor-main","layui-btn-container colored","layui-coloreditor-main-wrapper","layui-coloreditor-side","layui-coloreditor-basis-black","layui-coloreditor-basis","colorView layui-unselect layui-coloreditor","layui-icon layui-icon-addition","colorLiBorder openPickerColor","layui-coloreditor-trigger-span","disColor","layui-icon layui-icon-delete delIconBtn"];
            if ($('.colorWin').hasClass("disWin") && $('.colorWin').css("display")!="none" && classTitleArr.indexOf("colored")<=-1 && disabledClassArr.indexOf(e.target.className)<=-1){
                $('.colorWin').removeClass('disWin');
            }
        }
    }
});

$(".attribute-panel").on("click",".colorPreview",function(){
    if (!$(".colorWin").hasClass("disWin")){
        var hexColor=$(this).attr("hex");
        var rgbColor=_CMYK.colorConverter._HexToRgba(hexColor, 1);
        $("#currentColor").css("background-color",$(this).attr("hex"));
        $("#currentColor").attr("hex",$(this).attr("hex"));
        $("#currentColor").attr("cmyk",$(this).attr("cmyk"));

        if (!isEmpty($(this).attr("hex")) && ($(this).attr("hex")).substring(0,1)=="#"){
            $(".preViewColor .cmykInfo").html("CMYK:" + $(this).attr("cmyk"));
            $(".preViewColor .hexInfo").html("HEX:" + $(this).attr("hex"));
            $(".preViewColor .rgbInfo").html("RGB:" + rgbColor.r + "," + rgbColor.g + "," + rgbColor.b);
        }else{
            $(".preViewColor .cmykInfo").html("Transparent");
            $(".preViewColor .hexInfo").html("");
            $(".preViewColor .rgbInfo").html("");
        }

        $(".colorWin").addClass("disWin");
        _CMYK.colorType=$(this).attr("colorType");
        _CMYK.colorObject=$(this).find(".disColor");

        layui.coloreditor.render({
            elem: '#openPickerColor' //绑定元素
            ,color:'#ffffff'
            ,icon: {
                down: 'layui-icon-addition',
                close: 'layui-icon-addition',
            }
            ,change: function(color){ //颜色改变的回调

            }
            ,done:function(hexColor,tmpColor){
                if (hexColor!=undefined && hexColor!=""  && hexColor!="NaN" && tmpColor!==null){
                    if (hexColor.charAt(0)!="#"){
                        hexColor="#"+hexColor;
                    }
                    $(".layui-coloreditor-trigger-span").css("background","");
                    _CMYK.colorConverterCmyk=tmpColor.cmyk;
                    _CMYK.colorConverterHex=hexColor;

                    tmpColor.hex=hexColor;
                    if (_CMYK.myColor==null){
                        _CMYK.myColor=[];
                    }
                    _CMYK.myColor.push(tmpColor);
                    _CMYK.insertMyColor([tmpColor]);
                    _CMYK.updateMyColor(_CMYK.myColor);
                }else{

                }
            }
        });


    }
});

$(document).on("click",".colorWin .chooseColor",function(){

    $(_CMYK.colorObject).css("background-color",$(this).attr("hex"));
    _CMYK.colorConverterCmyk=$(this).attr("cmyk");
    _CMYK.colorConverterHex=$(this).attr("hex");
    _CMYK.done({colorType:_CMYK.colorType,Hex:_CMYK.colorConverterHex,Cmyk:_CMYK.colorConverterCmyk});

});

$(document).on("click",".colorWin #currentColor",function(){
    $(_CMYK.colorObject).css("background-color",$(this).attr("hex"));
    _CMYK.colorConverterCmyk=$(this).attr("cmyk");
    _CMYK.colorConverterHex=$(this).attr("hex");
    _CMYK.done({colorType:_CMYK.colorType,Hex:_CMYK.colorConverterHex,Cmyk:_CMYK.colorConverterCmyk});
});

$(document).on("click",".colorWin #clearColorBtn",function(){
    $(_CMYK.colorObject).css("background-color","");
    _CMYK.colorConverterCmyk="";
    _CMYK.colorConverterHex="";
    _CMYK.done({colorType:_CMYK.colorType,Hex:_CMYK.colorConverterHex,Cmyk:_CMYK.colorConverterCmyk});
});

$(document).on("click",".colorWin .deleteColor",function(){
    var delSort=$(this).attr("sort");
    if (!isEmpty(delSort)){
        delSort=delSort*1;
        _CMYK.myColor.splice(delSort,1);
        $(this).parent().remove();
        _CMYK.updateMyColor(_CMYK.myColor);
    }

});

