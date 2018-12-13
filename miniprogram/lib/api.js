let access_token = wx.getStorageSync("access_token");

//人脸识别
const faceUrl = "https://api-cn.faceplusplus.com/facepp/v3/detect";
//花卉识别
const flowerUrl = "https://aip.baidubce.com/rest/2.0/image-classify/v1/plant?access_token=" + access_token;
//动物识别
const aniUrl = "https://aip.baidubce.com/rest/2.0/image-classify/v1/animal?access_token=" + access_token;
//菜品识别
const foodUrl = "https://aip.baidubce.com/rest/2.0/image-classify/v2/dish?access_token=" + access_token;
//人脸检测
const personUrl = "https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=" + access_token;

module.exports = {
  faceUrl: faceUrl,
  flowerUrl: flowerUrl,
  aniUrl: aniUrl,
  foodUrl: foodUrl,
  personUrl: personUrl
}