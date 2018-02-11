const app = getApp();
import api from '../../../api/common.js'
Page({
  data: {
    price: 0.00
  },

  onLoad (options) {
    wx.showLoading({ title: '加载中' })
    this.apiBalance()
  },

  apiBalance () {
    api.selectAvailableAmount().then(res => {
      // console.log('余额===',res.data)
      if(res.data.errCode == 401 || res.data.errCode == 400){
        app.userLoing(() => {
          this.apiBalance()
        })
      }else if(res.data.errCode == 0){
        wx.hideLoading()
        this.setData({
          price: res.data.content0.availableAmount
        })
      }
    })
  }
})