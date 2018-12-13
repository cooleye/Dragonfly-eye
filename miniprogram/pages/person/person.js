var app = getApp();
var wxCharts = require('../../lib/wxcharts.js');
var api = require("../../lib/api.js");
var html2canvas = require('../../lib/html2canvas.js');
var apiurl = api.personUrl;

Page({
  data: {
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
    ]
  },
  doUpload: function () {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
       
        that.setData({
          imgUrl: res.tempFilePaths[0],
          showResult: true
        })
        let base64 = wx.getFileSystemManager().readFileSync(res.tempFilePaths[0], 'base64')

        wx.showLoading({
          title: "花卉分析中...",
          mask: true
        })

        wx.request({
          url: apiurl,
          header: {
            "content-type": "application/json"
          },
          method: "POST",
          data: {
            image: base64,
            image_type:"BASE64",
            face_field:"age,beauty,expression,face_shape,gender,glasses,race,emotion"
          }, success: function (res) {
            wx.hideLoading();
            console.log(res)
            console.log(res.data.error_code)
            if (res.statusCode == 200 && res.data.error_code == 0) {
              that.showResult(res.data.result);
            }else{
                console.log('图片不符合要求，重新上传');
            }
          }
        })
      }
    })
  },
  translateEmotion: function(emo){
    let emo_zh = "未知";
      switch(emo){
        case "sadness": emo_zh = "悲伤"; break;
        case "neutral": emo_zh = "平和"; break;
        case "disgust": emo_zh = "厌恶"; break;
        case "anger": emo_zh = "愤怒"; break;
        case "surprise": emo_zh = "惊讶"; break;
        case "fear": emo_zh = "恐惧"; break;
        case "happiness": emo_zh = "开心"; break;
        default: emo_zh = "未知";
      }
    return emo_zh;
  },
  showResult: function (result) {

    let person = result.face_list[0];
    let beauty = person.beauty;
    if(beauty < 80){
      beauty += 10;
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

    console.log(this.data.nobody)
  },
  onShareAppMessage: function () {

    var imgIndex = Math.floor(Math.random() * 7);
    var imageUrl = this.data.shareImgs[imgIndex];

    return {
      title: "敢不敢测测你的颜值得多少分？",
      path: '/pages/index/index',
      imageUrl: imageUrl,
      success: function (res) {
        // 转发成功
        console.log("转发成功")
      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败")
      }
    }
  },
  sharebtn: function(){
    html2canvas(document.querySelector("#show_page"), {
      scale: 3
    }).then(canvas => {

      $("#pic_page").append(canvas);
      // document.body.appendChild(canvas)
    });
  }
});