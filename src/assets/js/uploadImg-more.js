import webapi from '../../src/api/webapi'
import EXIF from './exif'
import Qs from 'qs'

const uploadImg2 ={
	maxLen:9,                                   // 最大上传数量
  maxH:800,                                   // 图片最大高度
  maxW:800,                                   // 图片最大宽度
  imgArr:[],                                  // 图片路径数组
  imgBase64:[],                               // 图片base64格式数据
	uploadPath:'appUploadImg/imgBase64',        // 上传接口
	callback:function(){},                      // 选择图片后执行
	successfun:function(){},                    // 上传图片后执行
	//检测数据
	isNull:function(ele){
		if( ele != null && ele != undefined )
			return false;
		else
      return true;
	},
  init:function(param){
    if( param && !uploadImg2.isNull(param.maxLen) ){
      uploadImg2.maxLen = param.maxLen;
    }
    if( param && !uploadImg2.isNull(param.maxH)){
      uploadImg2.maxH = param.maxH;
    }
    if( param && !uploadImg2.isNull(param.maxW) ){
      uploadImg2.maxW = param.maxW;
    }
    if( param && !uploadImg2.isNull(param.uploadPath) ){
      uploadImg2.uploadPath = param.uploadPath;
    }
    if( param && !uploadImg2.isNull(param.callback) ){
      uploadImg2.callback = param.callback;
    }
    if( param && !uploadImg2.isNull(param.successfun) ){
      uploadImg2.successfun = param.successfun;
    }

    var a = [{
      title: "拍照"
    }, {
      title: "从手机相册选择"
    }];
    if (plus) {
			plus.nativeUI.actionSheet({
				title: "上传图片",
				cancel: "取消",
				buttons: a
			}, function(b) { /*actionSheet 按钮点击事件*/
				switch (b.index) {
					case 0:
						break;
					case 1:
						uploadImg2.getImage(); /*拍照*/
						break;
					case 2:
            uploadImg2.galleryImgs();
						break;
					default:
						break;
				}
			})
		}
  },

  //拍照
  getImage:function() {
    // window.alert("getImage:");
		var c = plus.camera.getCamera();
		c.captureImage(function(e) {
			plus.io.resolveLocalFileSystemURL(e, function(entry) {
				//图片
				var s = entry.toLocalURL() + "?version=" + new Date().getTime();
				uploadImg2.getOrientation(s,1); /*图片修复*/
			}, function(e) {
				console.log("读取拍照文件错误：" + e.message);
			});
		}, function(s) {
			console.log("error" + s);
		}, {
			//filename: "_doc/head.png"
		})
	},

	//本地相册选择
	galleryImgs:function() {
    // window.alert("galleryImgs:");
		plus.gallery.pick(function(e) {
			var files = e.files;
			if( files.length > uploadImg2.maxLen ){
        plus.nativeUI.alert("最多只能选择"+uploadImg2.maxLen+"张图片");
			}else{
				if( (uploadImg2.imgArr.length+files.length) <= uploadImg2.maxLen ){
					for (var i=0;i<files.length;i++) {
						plus.io.resolveLocalFileSystemURL(files[i],function(entry){
							//图片：entry.toLocalURL()
							uploadImg2.getOrientation(entry.toLocalURL(),1); /*图片修复*/
						})
					}
				}else{
          plus.nativeUI.alert("最多只能选择"+uploadImg2.maxLen+"张图片");
				}
			}
		}, function(error) {
			console.log("galleryBtn error: " + JSON.stringify(error));
		},{
			filter:"image",
			multiple:true,
			maximum:uploadImg2.maxLen-uploadImg2.imgArr.length,
			system:false,
			selected:uploadImg2.imgArr,
			onmaxed:function(){
        plus.nativeUI.alert("最多只能选择"+uploadImg2.maxLen+"张图片");
      }
		});
	},

	getOrientation:function (imgPath,flag){
		var Orientation = null;
		var image = new Image();
		image.src = imgPath;
	  image.onload = function() {
      //获取照片方向角属性，用户旋转控制
      EXIF.getData(image, function() {
        EXIF.getAllTags(this);
        Orientation = EXIF.getTag(this, 'Orientation');
        console.log("Orientation = " + Orientation);
        var imgData =  uploadImg2.getBase64ImageConvert(Orientation,image);
        uploadImg2.imgArr.push(imgPath);
        uploadImg2.imgBase64.push({"filePath":imgPath,"base64Data":imgData});
        uploadImg2.callback(imgPath);
      });
		}
	},

	getBase64ImageConvert:function(Orientation,img) {
		var canvas = document.createElement("canvas");
		var width = img.width;
    var height = img.height;
    console.log("getBase64ImageConvert:width="+width+"<>height="+height)
    // 宽度等比例缩放 *=
    var MAX_HEIGHT = uploadImg2.maxH;
    var MAX_WIDTH = uploadImg2.maxW;
    if( height > width && height > MAX_HEIGHT ) {
			width *= MAX_HEIGHT/height;
			height = MAX_HEIGHT;
		}else if( width > height && width > MAX_WIDTH ){
			height *= MAX_WIDTH/width;
			width = MAX_WIDTH;
		}

		canvas.width = width;   /*设置新的图片的宽度*/
		canvas.height = height; /*设置新的图片的长度*/
		var ctx = canvas.getContext("2d");
    var base64 = null;
    //修复ios
    if (navigator.userAgent.match(/iphone/i)) {
      console.log('iphone');
      //如果方向角不为1，都需要进行旋转
      if(Orientation != "" && Orientation != undefined  && Orientation != 1){
        var degree = 0;
        var drawWidth = 0;
        var drawHeight = 0;
        switch(Orientation){
        //iphone横屏拍摄，此时home键在左侧
        case 3:
          degree=180;
          drawWidth=-width;
          drawHeight=-height;
          break;
        //iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)
        case 6:
          canvas.width=height;
          canvas.height=width;
          degree=90;
          drawWidth=width;
          drawHeight=-height;
          break;
        //iphone竖屏拍摄，此时home键在上方
        case 8:
          canvas.width=height;
          canvas.height=width;
          degree=270;
          drawWidth=-width;
          drawHeight=height;
          break;
        }
        ctx.rotate(degree*Math.PI/180);
        ctx.drawImage(img,0,0,drawWidth,drawHeight);
      }else{
        ctx.drawImage(img, 0, 0, width, height);
      }
      base64 = canvas.toDataURL("image/png", 1);
    }else if (navigator.userAgent.match(/Android/i)) {// 修复android
      ctx.drawImage(img, 0, 0, width, height);
        base64 = canvas.toDataURL("image/png", 1);
    }else{
        base64 = canvas.toDataURL("image/png", 1);
    }
    return base64.replace("data:image/png;base64,", "");
	},

	//上传图片base64
  uploadBase64:function(imgData,callback){
    var params = Qs.stringify({ "img":imgData})// 解决后台接收参数错误问题
    webapi.post(uploadImg.uploadPath, params, function (data) {
      if( data && data.code == "01" ){
        console.log("上传成功!")
        if( callback ){
          callback(data.result);
        }
      }else{
        console.log("上传失败!")
      }
    })
  },

  // 上传选中图片
  uploadImgs:function (callback) {
    var imgs = uploadImg2.imgBase64;
    if( imgs.length > 0 ){
      imgs.forEach(function (item,index) {
        uploadImg2.uploadBase64(item.base64Data,function (path) {
          uploadImg2.successfun(path);
        });
      })
    }else{
      plus.nativeUI.alert("请选择图片!");
    }
  },

	clearImgArr:function(flag,path) {
		if( flag == true ){//清空所有图片及缓存
			uploadImg2.imgArr = [];
			uploadImg2.imgBase64 = [];
		}else{
			var index = jQuery.inArray(path,uploadImg2.imgArr);
			if( index >= 0 ){
				uploadImg2.imgArr.splice(index,1);//清除图片路径
				uploadImg2.imgBase64.splice(index,1);//清除图片路径
			}
		}
	},
}
export default uploadImg2;
