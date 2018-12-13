var app = getApp();
var wxCharts = require('../../lib/wxcharts.js');
var api = require("../../lib/api.js");
var apiurl = api.faceUrl;
Page({
  data: {
    imgUrl:"/images/renbg.png",
    showResult:false,
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

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  doUpload: function () {
    var that = this;
    // console.log(that);
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片

        that.setData({
          imgUrl: res.tempFilePaths[0],
          age: "",
          beauty: "",
          expression: "",
          faceShape: "",
          gender: "",
          glasses: "",
          raceType: "",
          info: ""
        })

        let base64 = wx.getFileSystemManager().readFileSync(res.tempFilePaths[0], 'base64')

        wx.showLoading({
          title: "魅力年龄分析中...",
          mask: true
        })
        wx.uploadFile({
          url: apiurl,
          filePath: res.tempFilePaths[0],
          header: {
            'content-type': 'multipart/form-data'
          },
          name: 'file',
          formData: {
            'api_key': "h9XLpJYcx5yxwAsKXB59M32vnl_mONst",
            'api_secret': "DTU2X_GdrzTgGQcO_lfjTHfcDBtvJ3KX",
            'return_attributes':"gender,age,smiling,facequality,emotion,beauty,skinstatus",
            'image_base64': base64
          },

          success: function (res) {

            var data = res.data;
            var str = JSON.parse(data);
            var faces = str.faces;
            var f1 = faces[0];
            var attrs = f1.attributes;
            console.log(attrs)
            that.setData({
              age: attrs.age,
              beauty: attrs.beauty,
              emotion: attrs.emotion,
              gender: attrs.gender,
              skinstatus: attrs.skinstatus,
              smile: attrs.smile,
              facequality: attrs.facequality
            })
            wx.hideLoading();
            that.showResult();
          },
          fail: function (res) {
            wx.hideLoading();
            wx.showModal({
              title: '温馨提示',
              content: 'Sorry 小程序离家出走了',
              showCancel: false
            })
          }
        })
      }
    })
  },
  translate: function(word){
    var result;
    switch(word){
      case "sadness": result = "悲伤";break;
      case "neutral": result = "平和"; break;
      case "disgust": result = "厌恶"; break;
      case "anger": result = "愤怒"; break;
      case "surprise": result = "惊讶"; break;
      case "fear": result = "恐惧"; break;
      case "happiness": result = "开心"; break;
    }
    return result;
  },
  showResult: function () {

    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    console.log('show result...')
    this.setData({
      showResult:true
    })
    

    var beauty = this.data.beauty;
    console.log('beauty:', beauty)

    var beautyArr = [];
    beautyArr.push(beauty.male_score);
    beautyArr.push(beauty.female_score);


    new wxCharts({
      canvasId: 'columnCanvas',
      type: 'column',
      animation: true,
      categories: ["男生眼中","女生眼中"],
      series: [{
        name: '颜值',
        data: beautyArr,
        format: function (val, name) {
          return val.toFixed(2);
        }
      }],
      yAxis: {
        format: function (val) {
          return val;
        },
        title: '颜值',
        min: 0
      },
      xAxis: {
        disableGrid: false,
        type: 'calibration'
      },
      extra: {
        column: {
          width: 15
        }
      },
      width: windowWidth,
      height: 200,
    });






    var emotion = this.data.emotion;
    var emoCat = [];
    var seriesData = [];
    for (var e in emotion) {
      emoCat.push(this.translate(e));
      seriesData.push(emotion[e]);
    }

     
      new wxCharts({
        canvasId: 'radarCanvas',
        type: 'radar',
        categories: emoCat,
        series: [{
          name: '情绪',
          data: seriesData
        }],
        width: windowWidth,
        height: 200,
        extra: {
          radar: {
            max: 100
          }
        }
      });
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
  }
});