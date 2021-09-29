$(function() {
    $('#vlar-banner-slider-con').terseBanner({
		arrow: true
	});
});
	


//隐藏或显示侧滑导航
function setSlidemenu(type) {
	//显示菜单
	if(type==1){
		 //第一个花括号里面是动画内容，可以为空，但不能省去中括号,在回调函数里面改变css属性来实现transform中的动画变换
		$("#vlar-layermenu-box").animate({}, 300, function () {
			$("#vlar-layermenu-box").css({ "right": "0px",width: "50%"}); 
		})
		
		$("#vlar-layermenu-box-bg").css({ "display": "block","right": "50%" });

	}
	//隐藏菜单
	if(type==0){
		 //第一个花括号里面是动画内容，可以为空，但不能省去中括号,在回调函数里面改变css属性来实现transform中的动画变换
		$("#vlar-layermenu-box").animate({}, 300, function () {
			$("#vlar-layermenu-box").css({ "right": "-50%",width: "0%"  });
		})
		$("#vlar-layermenu-box-bg").css({ "display": "none" ,"right": "0px"});
	}
}












	
	