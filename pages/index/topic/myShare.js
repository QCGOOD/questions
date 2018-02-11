// pages/index/topic/myShare.js
const app = getApp()
import api from '../../../api/common.js'

Page({

  data: {
    id: '',
    userInfo: {},
    type: null,
    cdnUrl: 'http://question-1255600302.file.myqcloud.com',
    shareUrl: '',
    questionGame: {},
  },

  onUnload () {
    // console.log('页面卸载')
    this.setData({
      shareUrl: '',
    })
  },
  onLoad: function (options) {
    
    this.setData({
      userInfo: app.globalData.userInfo
    })
    // console.log('options === ', options)
    this.setData({
      id: options.id,
      // type: options.type
    })
    wx.showShareMenu({
      withShareTicket: true,
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
        // console.log(res)
      }
    })
    this.questionGameSelect()
    // this.getImage()
  },

  // 分享
  onShareAppMessage () {
    return {
      title: `${this.data.userInfo.nickName}给你发了一个${this.data.questionGame.type === 2 ? '语音' : '文字'}红包，快来答题领红包呗`, 
      path: `pages/index/topic/answer?id=${this.data.id}`,
      // imageUrl: `${this.data.cdnUrl}${this.data.shareUrl}`,
      success: function (res) {
        // console.log(res)
      },
      fail: function (res) {
        wx.showToast({
          title: '取消分享',
          icon: 'none'
        })
      }
    }
  },
  questionGameSelect () {
    api.questionGameSelect({id: this.data.id}).then(res => {
      // console.log('questionGameSelect === ', res.data)
      if (res.data.errCode === 0) {
        this.setData({
          questionGame: res.data.content0
        })
      } else if (res.data.errCode === 400 || res.data.errCode === 401) {
        app.userLoing(() => {
          this.questionGameSelect()
        })
      }
    })
  },

  // 获取图片
  getImage () {
    // console.log(this.data.shareUrl)
    if (this.data.shareUrl) {
      this.previewImage(this.data.shareUrl)
      return false
    }
    wx.showLoading({ title: '加载中' })
    api.getImage({ gameId: this.data.id }).then(res => {
      // console.log('getImage === ', res.data)
      if (res.data.errCode === 0) {
        wx.hideLoading()
        this.setData({
          shareUrl: res.data.content0
        })
        this.previewImage()
      } else if (res.data.errCode === 400 || res.data.errCode === 401) {
        app.userLoing(() => {
          this.getImage()
        })
      } else {
        wx.showModal({
          title: '提示',
          content: res.data.errMsg,
          success: res => {
            if (res.confirm) {
              this.getImage()
            }
          }
        })
      }
    })
  },

  // 预览图片
  previewImage () {
    wx.previewImage({
      urls: [`${this.data.cdnUrl}${this.data.shareUrl}`],
    })
  }
})