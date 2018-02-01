import webapi from '../../src/api/webapi'
import EXIF from './exif'
import Qs from 'qs'

const uploadImg ={
    maxLen:9,                                         //最大上传数量
    maxH:800,                                         //图片最大高度
    maxW:800,                                         //图片最大宽度
    base64Data: '',                                   //图片数组
    uploadPath: 'appUploadImg/imgBase64',             //上传接口
    isUpload: true,                                   //是否上传
    flag:0,                                           //拍照类型：0、拍照；1、相册;

    //检测数据
    isNull:function(ele){
      if( ele != null && ele != undefined )
        return false;
      else
          return true;
    },

    init:function(param){
    	if( param && !uploadImg.isNull(param.maxLen) ){
    		uploadImg.maxLen = param.maxLen;
    	}
    	if( param && !uploadImg.isNull(param.maxH)){
    		uploadImg.maxH = param.maxH;
    	}
    	if( param && !uploadImg.isNull(param.maxW) ){
    		uploadImg.maxW = param.maxW;
    	}
    	if( param && !uploadImg.isNull(param.uploadPath) ){
    		uploadImg.uploadPath = param.uploadPath;
    	}
      if( param && !uploadImg.isNull(param.isUpload) ){
        uploadImg.isUpload = param.isUpload;
      }
    	if( param && !uploadImg.isNull(param.callback) ){
    		uploadImg.callback = param.callback;
    	}

      var a = [{
        title: "拍照"
      }, {
        title: "从手机相册选择"
      }];

      if( plus ){
        plus.nativeUI.actionSheet({
          title: "上传图片",
          cancel: "取消",
          buttons: a
        }, function(b) { /*actionSheet 按钮点击事件*/
          switch (b.index) {
            case 0:
              break;
            case 1:
              uploadImg.getImage(); /*拍照*/
              break;
            case 2:
              uploadImg.galleryImg();/*打开相册*/
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
    	uploadImg.flag = 0;
      var c = plus.camera.getCamera();
      c.captureImage(function(e) {
        plus.io.resolveLocalFileSystemURL(e, function(entry) {
          //图片
          var s = entry.toLocalURL() + "?version=" + new Date().getTime();
          uploadImg.uploadHead(s,0); /*上传图片*/
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
    galleryImg:function() {
      // window.alert("getImage:");
      uploadImg.flag = 1;
      plus.gallery.pick(function(file) {
        plus.io.resolveLocalFileSystemURL(file,function(entry){
          //图片：entry.toLocalURL()
          uploadImg.uploadHead(entry.toLocalURL(),1); /*上传图片*/
        })
      }, function(error) {
        console.log("galleryBtn error: " + JSON.stringify(error));
      }, {
        filter: 'image',
        multiple: false
      })
    },

    //上传头像图片
    uploadHead:function(imgPath,flag) {
      // window.alert("uploadHead:");
      var Orientation = null;
      var image = new Image();
      image.src = imgPath;
        image.onload = function() {
          if( flag == 0 ){
            //获取照片方向角属性，用户旋转控制
            EXIF.getData(image, function() {
              EXIF.getAllTags(this);
              Orientation = EXIF.getTag(this, 'Orientation');
              var imgData =uploadImg.getBase64ImageConvert(Orientation,image);
              uploadImg.uploadFun(imgData);
            });
          }else{
            var imgData = uploadImg.getBase64Image(image);
            uploadImg.uploadFun(imgData);
          }
      }
    },

    uploadFun:function(imgData){
      // window.alert("uploadFun：");
      var params = Qs.stringify({ "img":imgData})// 解决后台接收参数错误问题
      webapi.post(uploadImg.uploadPath, params, function (data) {
        if( data && data.code == "01" ){
          uploadImg.callback(data.result);
        }else{
          console.log("上传失败:");
        }
      })
    },

    getBase64ImageConvert:function(Orientation,img) {
      var canvas = document.createElement("canvas");
      var width = img.width;
      var height = img.height;
      // console.log("getBase64ImageConvert:width="+width+"<>height="+height)
      // 宽度等比例缩放 *=
      var MAX_HEIGHT = uploadImg.maxH;
      var MAX_WIDTH = uploadImg.maxW;
      if( height > width && height > MAX_HEIGHT ) {
        width = width * MAX_HEIGHT/height;
        height = MAX_HEIGHT;
      }else if( width > height && width > MAX_WIDTH ){
        height = height * MAX_WIDTH/width;
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
        //alert(Orientation);
        if(Orientation != "" && Orientation != undefined && Orientation != 1){
          var degree = 0;
          var drawWidth = width;
          var drawHeight = height;
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
        base64 = canvas.toDataURL("image/png", 0.8);
      }else if (navigator.userAgent.match(/Android/i)) {// 修复android
        ctx.drawImage(img, 0, 0, width, height);
          base64 = canvas.toDataURL("image/png", 0.8);
      }else{
          base64 = canvas.toDataURL("image/png", 0.8);
      }
      return base64.replace("data:image/png;base64,", "");
    },

    getBase64Image:function(img) {
      var canvas = document.createElement("canvas");
      var width = img.width;
      var height = img.height;
      // console.log("getBase64Image:width="+width+"<>height="+height)
      // 宽度等比例缩放 *=
      var MAX_HEIGHT = uploadImg.maxH;
      var MAX_WIDTH = uploadImg.maxW;
      if( height > width && height > MAX_HEIGHT ) {
        width = width * MAX_HEIGHT/height;
        height = MAX_HEIGHT;
      }else if( width > height && width > MAX_WIDTH ){
        height = height * MAX_WIDTH/width;
        width = MAX_WIDTH;
      }

      canvas.width = width;   //设置新的图片的宽度
      canvas.height = height; //设置新的图片的长度
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height); //绘图
      var dataURL = canvas.toDataURL("image/png", 0.8);
      return dataURL.replace("data:image/png;base64,", "");
    },

    callback:function(path) {
      console.log("path:"+path)
    }

}

export default uploadImg;
