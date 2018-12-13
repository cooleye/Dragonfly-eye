Page({
  data: {
    imagePath: '../../images/flower/f1.jpg',
    imageWidth: '',
    imageHeight: '',
  },
  onReady: function () {
    let _this = this,
      deviceWidth = 0;

    //获取设备宽度，用于求所需画在画布上的图片的高度
    wx.getSystemInfo({
      success: function (res) {
        deviceWidth = res.windowWidth;   //获取设备宽度
        wx.getImageInfo({    //获取图片信息
          src: _this.data.imagePath,
          success: function (res) {
            let imageWidth = deviceWidth,
              imageHeight = deviceWidth / res.width * res.height;  //求所需画在画布上的图片的高度
            _this.setData({
              'imageWidth': imageWidth,
              'imageHeight': imageHeight
            });

            const ctx = wx.createCanvasContext('gameCanvas');  //创建画布对象  
            ctx.drawImage(_this.data.imagePath, 0, 0, imageWidth, imageHeight);  //添加图片
            ctx.setFontSize(16);      //设置字体大小
            ctx.setFillStyle('blue');   //设置字体颜色
            ctx.fillText('你的名字', imageWidth / 2, imageHeight / 2);  //设置字体内容、坐标
            ctx.draw();     //开始绘画
          }
        })
      }
    });
  },
  createImage: function () {
    let imageWidth = this.data.imageWidth,
      imageHeight = this.data.imageHeight;

    wx.canvasToTempFilePath({     //将canvas生成图片
      canvasId: 'gameCanvas',
      x: 0,
      y: 0,
      width: imageWidth,
      height: imageHeight,
      destWidth: imageWidth,     //截取canvas的宽度
      destHeight: imageHeight,   //截取canvas的高度
      success: function (res) {
        wx.saveImageToPhotosAlbum({  //保存图片到相册
          filePath: res.tempFilePath,
          success: function () {
            wx.showToast({
              title: "保存图片到相册",
              duration: 2000
            })
          }
        })
      }
    })
  }
});
