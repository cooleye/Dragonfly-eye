var app = getApp();
var wxCharts = require('../../lib/wxcharts.js');
var api = require("../../lib/api.js");
var html2canvas = require('../../lib/html2canvas.js');
var apiurl = api.personUrl;


Page({
  data: {
    qrcode:"../../images/qrcode.jpg",
    imageWidth: '',
    imageHeight: '',
    imgUrl: "/images/renbg.png",
    showResult: false,
    shareImgs: [
      "../../images/zp/zp1.jpg",
      "../../images/zp/zp2.jpg",
      "../../images/zp/zp3.jpg",
      "../../images/zp/zp4.jpg",
      "../../images/zp/zp5.jpg",
      "../../images/zp/zp6.jpg",
      "../../images/zp/zp7.jpg"
    ],
    evaluates:{
      male:[
        "长得丑不是你的错",
        "你长得就像闹着玩一样",
        "长得那么随心所欲",
        "你这长相得多读点书啊！",
        "相貌平平",
        "自信的人最帅",
        "相貌堂堂 、眉清目秀",
        "风度翩翩 气宇不凡",
        "貌似端庄 颜如舜华"
      ],
      female:[
        "长得丑不是你的错",
        "你长得就像闹着玩一样",
        "你这长相得多读点书啊！",
        "自信的人最美丽",
        "明艳动人 人见人爱",
        "如花似玉 玉洁冰清",
        "眉目如画 花容月貌",
        "沉鱼落雁 闭月羞花",
        "国色天香 倾国倾城"
      ]
    }
  },
  onReady: function () {
    //获取设备宽度，用于求所需画在画布上的图片的高度
    let _this = this;
    wx.getSystemInfo({success:function(res){
        _this.setData({
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight
        })
    }})

    //获取canvas大小
    var query = wx.createSelectorQuery();
    query.select('.gameCanvas').boundingClientRect(function (rect) {
      _this.setData({
        canvasWidth: rect.width,
        canvasHeight:rect.height
      })
    }).exec();
 
  },
  createImage: function () {
    let scale = 2; //图片放大两倍，更清晰
    // console.log(this.data.imgUrl)
    if (this.data.imgUrl == "/images/renbg.png"){
      wx.showToast({
        title: "上传一张图片先！",
        icon: 'none',
        duration: 1000
      })
    }else{
      let canvasWidth = this.data.canvasWidth,
        canvasHeight = this.data.canvasHeight;

      wx.canvasToTempFilePath({     //将canvas生成图片
        canvasId: 'gameCanvas',
        x: 0,
        y: 0,
        width: canvasWidth,
        height: canvasHeight,
        destWidth: canvasWidth * scale,     //截取canvas的宽度
        destHeight: canvasHeight * scale,   //截取canvas的高度
        success: function (res) {
          wx.saveImageToPhotosAlbum({  //保存图片到相册
            filePath: res.tempFilePath,
            success: function () {
              wx.showToast({
                title: "已经保存到相册了，发个朋友圈吧",
                duration: 2000
              })
            }
          })
        }
      })
    }
  },
  doUpload: function () {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempImg = res.tempFilePaths[0];
        let base64 = wx.getFileSystemManager().readFileSync(tempImg, 'base64')

        wx.showLoading({
          title: "人像分析中...",
          mask: true
        })

       //请求接口
        wx.request({
          url: apiurl,
          header: {
            "content-type": "application/json"
          },
          method: "POST",
          data: {
            image: base64,
            image_type: "BASE64",
            face_field: "age,beauty,expression,face_shape,gender,glasses,race,emotion"
          }, success: function (res) {

            wx.hideLoading();
            if (res.statusCode == 200 && res.data.error_code == 0) {
              that.setData({
                imgUrl: tempImg,
                showResult: true
              })

              that.showResult(res.data.result);
            } else {
              wx.showToast({
                title: '亲，换张图片吧',
                icon:"",
                duration:1000
              })
            }
          }
        })
      }
    })
  },
  translateEmotion: function (emo) {
    let emo_zh = "未知";
    switch (emo) {
      case "sadness": emo_zh = "悲伤"; break;
      case "neutral": emo_zh = "平和"; break;
      case "disgust": emo_zh = "厌恶"; break;
      case "anger": emo_zh = "愤怒"; break;
      case "surprise": emo_zh = "惊讶"; break;
      case "fear": emo_zh = "恐惧"; break;
      case "happiness": emo_zh = "开心"; break;
      default: emo_zh = "神秘，AI无法识别";
    }
    return emo_zh;
  },
  draw2Canvas:function(){
    let _this = this;
    //获取图片信息
    wx.getImageInfo({    
      src: _this.data.imgUrl,
      success: function (res) {
        
        let canvasWidth = _this.data.canvasWidth;
        let canvasHeight = _this.data.canvasHeight;

        let imageHeight = canvasHeight/2-50;  //求所需画在画布上的图片的高度
        let imageWidth = res.width * imageHeight/res.height;
        
        _this.setData({
          'imageWidth': imageWidth,
          'imageHeight': imageHeight
        });

        const ctx = wx.createCanvasContext('gameCanvas');  //创建画布对象  

        let textLeft = 20;
        let textTop = imageHeight + 180;
        //背景填充
        ctx.setFillStyle('#fff');
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.drawImage(_this.data.imgUrl, canvasWidth/2-imageWidth/2, 0, imageWidth, imageHeight);  //添加图片

        //画二维码
        ctx.drawImage(_this.data.qrcode, canvasWidth-100,canvasHeight-140, 80, 80);

        ctx.setFontSize(30);      //设置字体大小
        ctx.setFillStyle("#000");   //设置字体颜色
        ctx.fillText('颜值', textLeft, imageHeight + 60);  //设置字体内容、坐标
        ctx.setFontSize(20);
        
         //颜值
        // ctx.fillText('颜值：' + _this.data.nobody.beauty, imageWidth,imageHeight + 50);  //设置字体内容、坐标
        ctx.setFontSize(50);      //设置字体大小
        ctx.setFillStyle("#f00");   //设置字体颜色
        ctx.fillText(_this.data.nobody.beauty, 100, imageHeight + 60);  //设置字体内容、坐标

        let bs = (_this.data.nobody.beauty - 0 + 5.21).toFixed(2);
        bs = bs > 99.99 ? 99.99 : bs;
        let evaluates;
        if (_this.data.nobody.gender.type == "male"){
          evaluates = _this.data.evaluates.male;
        }else{
          evaluates = _this.data.evaluates.female;
        }

        let rw = "";
        switch(true){
          case bs < 20: rw = evaluates[0];
          case bs >= 20 && bs < 30: rw = evaluates[1]; break;
          case bs >= 30 && bs < 50: rw = evaluates[2]; break;
          case bs >= 40 && bs < 60: rw = evaluates[3]; break;
          case bs >= 50 && bs < 60: rw = evaluates[4]; break;
          case bs >= 60 && bs < 70: rw = evaluates[5]; break;
          case bs >= 70 && bs < 80: rw = evaluates[6]; break;
          case bs >= 80 && bs < 90: rw = evaluates[7]; break;
          case bs >= 90 && bs < 100: rw = evaluates[8]; break;
        }
        
        ctx.setFontSize(14);      //设置字体大小
        ctx.setFillStyle("#ff6600");  
        ctx.fillText("超过了全国" + bs + "%的网友," + rw, textLeft,imageHeight + 90);  //设置字体内容、坐标
        
        bs += 15;
        bs = bs >= 99.9 ? 99.9 : bs;

        ctx.setFillStyle("#000");  
        ctx.setFontSize(16);
        let nickName = app.globalData.userInfo.nickName;
        ctx.fillText('昵称：' + nickName, textLeft, imageHeight + 120);  //设置字体内容、坐标
        ctx.fillText('年龄：' + _this.data.nobody.age, textLeft, imageHeight + 150);  //设置字体内容、坐标
        let gender = _this.data.nobody.gender.type;
        gender = gender == "female" ? "女" : "男";
        ctx.fillText('性别：' + gender, textLeft, imageHeight + 180);  //设置字体内容、坐标
       
        ctx.fillText('情绪：' + _this.data.nobody.emotion.type, textLeft, imageHeight + 210);  //设置字体内容、坐标


        ctx.setFillStyle("#aaa");
        ctx.setFontSize(12);
        ctx.fillText('蜻蜓眼', canvasWidth / 2 - 15, canvasHeight - 40);  //设置字体内容、坐标
        ctx.fillText('Powered by Baidu AI', canvasWidth/2-55, canvasHeight-20);  //设置字体内容、坐标
  

        ctx.draw();     //开始绘画
      }
    })
  },
  showResult: function (result) {
    if(result){
      let person = result.face_list[0];
      let beauty = person.beauty;
      if (beauty < 80) {
        beauty += 20;
      } else if (beauty >= 80 && beauty < 91) {
        beauty += 5.21;
      }
      person.beauty = beauty.toFixed(2);

      let emo = person.emotion.type;
      emo = this.translateEmotion(emo);

      person.emotion = {
        type: emo
      }

      this.setData({
        nobody: person,
      })

      this.draw2Canvas();
    }else{
      let nobody = { name: "这张图片不行哦，换一张吧" }
      this.setData({
        nobody: nobody
      })
    }
   
  },
  onShareAppMessage: function () {

    var imgIndex = Math.floor(Math.random() * 7);
    var imageUrl;
    if (this.data.imgUrl == "/images/renbg.png"){
      imageUrl = this.data.shareImgs[imgIndex];
    }
    let beauty = this.data.nobody.beauty;

    return {
      title: "我的颜值在人工智能眼中得了:" + beauty+"分，你的呢？",
      path: '/pages/index/index',
      imageUrl: imageUrl,
      success: function (res) {
        // 转发成功
        // console.log("转发成功")
      },
      fail: function (res) {
        // 转发失败
        // console.log("转发失败")
      }
    }
  }
});
