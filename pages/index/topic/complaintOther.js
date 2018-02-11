// pages/index/topic/complaintOther.js

import api from '../../../api/common.js'
const app = getApp()

Page({
  data: {
    model: {
      type: 0,
      gameId: '',
      description: '',
    }
  },

  onLoad(options) {
    // console.log(getCurrentPages())
    this.data.model.gameId = options.id
    this.setData({
      model: this.data.model
    })
  },

  bindFormSubmit (e) {
    // console.log(e)
    // console.log(e.detail.value.textarea)
    if(e.detail.value.textarea == ''){
      wx.showToast({
        title: '内容不能为空',
        icon: 'none'
      })
    } else {
      wx.showModal({
        title: '温馨提醒',
        content: '已确认投诉理由,可提交',
        success: res => {
          if (res.confirm) {
            this.data.model.description = e.detail.value.textarea
            this.setData({
              model: this.data.model
            })
            this.complaints(this.data.model)
          }
        }
      })
    }
  },

  // 投诉
  complaints(model) {
    api.complaint(model).then(res => {
      console.log('complaint == ', res.data)
      if (res.data.errCode === 0) {
        wx.showModal({
          title: '投诉已提交',
          content: '你的投诉已提交审核，感谢您的支持！',
          success: res => {
            wx.navigateBack({
              delta: 2
            })
          }
        })
      } else if (res.data.errCode === 400 || res.data.errCode === 401) {
        app.userLoing(() => {
          this.complaints(model)
        })
      } else {
        wx.showModal({
          title: '错误提示',
          content: '提交出错，是否重试？',
          success: res => {
            if (res.confirm) {
              this.complaints(model)
            }
          }
        })
      }
    })
  },
})