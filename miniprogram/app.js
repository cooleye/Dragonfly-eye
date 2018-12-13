const api_key = "DzHSYEH3XG5eLmshBG5PEYuL";
const secret_key = "R4hKQx7xzk6wO1ENqpyvgSEAvL9M5VPN";


//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.getToken();
  },
  getToken: function(){
    var access_token = wx.getStorageSync("access_token");
    var now = new Date().getTime();
    var access_token_date = parseInt(wx.getStorageSync("access_token_date"));
    var expires_in = parseInt(wx.getStorageSync("expires_in"));

    if(!access_token){
      this.requestToken();
    } else if (now >= access_token_date + expires_in){
      this.requestToken();
    }else{
      this.globalData.access_token = access_token;
    }
  },
  requestToken:function(){
    wx.request({
      url: 'https://aip.baidubce.com/oauth/2.0/token',
      data: {
        grant_type: "client_credentials",
        client_id: api_key,
        client_secret: secret_key
      },
      success: function (res) {

        if(res.statusCode == 200){
          console.log(res)
          wx.setStorageSync("access_token", res.data.access_token);
          wx.setStorageSync("expires_in", res.data.expires_in);
          wx.setStorageSync("access_token_date", new Date().getTime());
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
