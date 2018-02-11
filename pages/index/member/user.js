// pages/index/member/user.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnList: [
      { name: '我的余额', img: 'http://question-1255600302.file.myqcloud.com/attachments/image/yue.png', url: 'myBalance' },
      { name: '我的记录', img: 'http://question-1255600302.file.myqcloud.com/attachments/image/jilu.png', url: 'record' },
      { name: '我的排行', img: 'http://question-1255600302.file.myqcloud.com/attachments/image/paihang.png', url: 'ranking' },
    ],
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
      })
    } else {
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
        })
      }
    }
  },
})