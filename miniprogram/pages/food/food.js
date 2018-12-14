var app = getApp();
var wxCharts = require('../../lib/wxcharts.js');
var api = require("../../lib/api.js");
var apiurl = api.foodUrl;

Page({
  data: {
    imgUrl: "/images/canting.png",
    showResult: false,
    shareImgs: [
      "../../images/food/food1.jpg",
      "../../images/food/food2.jpg",
      "../../images/food/food3.jpg",
      "../../images/food/food4.jpg",
      "../../images/food/food5.jpg"
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
          title: "美食分析中...",
          mask: true
        })

        wx.request({
          url: apiurl,
          header: {
            "content-type": "application/x-www-form-urlencoded"
          },
          method: "POST",
          data: {
            image: base64,
            baike_num: 1
          }, success: function (res) {
            wx.hideLoading();
            console.log(res)
            if (res.statusCode == 200) {
              that.showResult(res.data.result);
            }
          }
        })
      }
    })
  },
  showResult: function (result) {
    let len = result.length;
    let item = { probability: 0 };
    for (let i = 0; i < len; i++) {
      if (result[i].probability > item.probability) {
        item = result[i]
      }
    }
    this.setData({
      nobody: item
    })
  },
  onShareAppMessage: function () {

    var imgIndex = Math.floor(Math.random() * 5);
    var imageUrl = this.data.imgUrl || this.data.shareImgs[imgIndex];

    return {
      title: "作为吃货的你怎么能不知道这些菜叫什么",
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