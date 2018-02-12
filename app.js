//app.js

import api from './api/common.js'
App({
  onLaunch: function () {
    wx.clearStorageSync()
    wx.setEnableDebug({
      enableDebug: true
    })
    this.userLoing()

    wx.authorize({
      scope: 'scope.record',
      success () {
        console.log('录音111')
      },
      fail () {
        console.log('录音222')
      }
    })
  }, 

  // 隐藏
  onHide: function () {
    console.log('从前台进入后台')
  },
  // 显示
  onShow: function () {
    console.log('当小程序启动，或从后台进入前台显示')
  },

  globalData: {
    userInfo: null,
  },
  status: false,

  // 登录
  userLoing (callback) {
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        this.getSetting(res.code, callback)
      },
    })
  },

  // 获取用户信息
  getSetting (code, callback) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // console.log('已经授权 === ', res)
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              this.handle(res, code, callback)
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          wx.authorize({
            scope: 'scope.userInfo',
            success: res => {
              console.log('成功')
              wx.getUserInfo({
                success: res => {
                  // console.log('已经授权 === ', res)
                  // 可以将 res 发送给后台解码出 unionId
                  this.globalData.userInfo = res.userInfo
                  this.handle(res, code, callback)
                  if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res)
                  }
                }
              })
            },
            fail: res => {
              console.log('失败')
              wx.showModal({
                title: '警告',
                content: '您暂未授权用户信息功能（头像与昵称），将无法正常使用答妃所问的功能体验。是否重新授权？',
                success: res => {
                  if (res.confirm) {
                    wx.openSetting({
                      success: res => {
                        // console.log('重新授权 === ', res.authSetting)
                        if (res.authSetting['scope.userInfo']) {
                          wx.getUserInfo({
                            success: res => {
                              // console.log('已经授权 === ', res)
                              // 可以将 res 发送给后台解码出 unionId
                              this.globalData.userInfo = res.userInfo
                              this.handle(res, code, callback)
                              if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                              }
                            }
                          })
                        } else {
                          wx.showToast({
                            title: '用户拒绝授权',
                            icon: 'none'
                          })
                        }
                      }
                    })
                  }
                }
              })
            }
          })
          
          
        }
      },
      fail: err => {
        // console.log('获取用户信息err == ', err)
      }
    })
  },

  handle (res, code, callback) {
    let model = Object.assign({}, res.userInfo)
    model.code = code
    model.encryptedData = res.encryptedData
    model.iv = res.iv
    this.getLogin(model, callback)
    // this.status = true
  },

  getLogin (model, callback) {
    api.getLogin(model).then(res => {
      wx.setStorageSync('sessionKeyId', res.data.sessionKeyId)
      // console.log('sessionKeyId === ', res.data.sessionKeyId)
      if (callback) callback()
    })
  },
})