//index.js
//获取应用实例
const app = getApp()
const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()

import api from '../../api/common.js'

Page({
  data: {
    tempFilePath: '',  // 录音文件临时路径
    recordingUrl: '', // 录音上传后返回的链接
    recordSecond: 0, // 秒数
    recordSecondTimer: null,
    isSound: false,
    isPlay: false,
    isRandom: false, // 是否随机出题

    poolQuestion: '',
    answerList: [  // 答案列表
      { index: 0, name: 'A', value: '', checked: false, placeholder: '请输入答案' },
      { index: 1, name: 'B', value: '', checked: false, placeholder: '请输入答案' },
      { index: 2, name: 'C', value: '', checked: false, placeholder: '请输入答案(选填)' },
    ],
    circleList: [  // 波纹
      { circle: 'circle_1', opacity: 'opacity_1' },
      { circle: 'circle_2', opacity: 'opacity_2' },
      { circle: 'circle_3', opacity: 'opacity_3' },
      { circle: 'circle_4', opacity: 'opacity_4' },
    ],
    timer: null,  // 循环
    poolId: '',  // 随机出题id
    myActive: false,
    myTimer: null,
    error: false,
    startTime: null,
    stopTime: null,
  },

  onLoad () {

  },

  onShareAppMessage () {
    return {
      title: '答妃所问',
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  // 输入答案
  bindKeyInput (model) {
    let e = model.detail
    let index = e.currentTarget.dataset.index
    this.data.answerList[index].value = e.detail.value
    this.setData({
      answerList: this.data.answerList
    })
  },

  // 勾选正确答案
  select (model) {
    let e = model.detail
    let index = e.currentTarget.dataset.index
    this.data.answerList.map((item, i) => {
      if (i === index) {
        item.checked = !item.checked
      } else {
        item.checked = false
      }
    })
    this.setData({
      answerList: this.data.answerList
    })
  },

  touchcancel () {
    // console.log('touchcancel')
  },
  touchmove () {
    // console.log('touchmove')
  },

  // 开始录音
  startSound () {
    // setTimeout(() => {
    this.setData({
      startTime: new Date().getTime()
    })
    this.soundPlay()
    this.data.recordSecondTimer = setInterval(() => {
      this.setData({
        recordSecond: this.data.recordSecond + 1
      })
    }, 1000)
    
 
    wx.startRecord({
      success: res => {
        // console.log('停止录音', res.tempFilePath)
        clearInterval(this.data.recordSecondTimer)
        // console.log('recordSecond === ', this.data.recordSecond)
        if (this.data.stopTime - this.data.startTime < 1000) {
          // console.log('录音时间太短')
          wx.showModal({
            title: '提示',
            content: '录音时间短于1秒，请重试'
          })
          this.setData({
            isSound: false,
            recordSecond: 0
          })
          return false
        }
        this.setData({
          tempFilePath: res.tempFilePath,
          isSound: true,
        })  
      },
      fail: err => {
        this.soundStop()
        this.setData({
          isSound: false,
          error: true,
        })
        // console.log('错误 === ', err)
        if (/short/.test(err.errMsg)) {
          wx.showModal({
            title: '提示',
            content: '录音时间太短，请重试'
          })
        } else if (/fail/.test(err.errMsg)) {
          wx.showModal({
            title: '提示',
            content: '录音失败，请重试'
          })
        } else if (/录音设备/.test(err.errMsg)) {
          wx.showModal({
            title: '提示',
            content: err.errMsg.split(' ')[1]
          })
        } else if (/auth/.test(err.errMsg)) {
          wx.showModal({
            title: '警告',
            content: '您拒绝授权录音功能，将无法使用此功能。是否重新授权？',
            success: res => {
              if (res.confirm) {
                // console.log('确定')
                wx.openSetting({
                  success: res => {
                    // console.log('重新授权 === ', res.authSetting['scope.record'])
                    if (!res.authSetting['scope.record']) {
                      wx.showToast({
                        title: '用户拒绝授权录音功能',
                        icon: 'none'
                      })
                    } else {
                      this.setData({
                        error: false,
                      })
                    }
                  }
                })
              }
            }
          })
        }
        this.soundStop()
      }
    })
    // }, 1000);
  },

  // 停止录音
  stopSound () {
    wx.stopRecord()
    // console.log('stopSound')
    // console.log(new Date().getTime())
    this.setData({
      stopTime: new Date().getTime()
    })
    
    if (this.data.error) {
      this.setData({
        recordSecond: 0
      })
      return false
    }
    wx.stopRecord()
    this.soundStop()
    this.setData({
      isSound: true,
    })
    if (this.data.stopTime - this.data.startTime < 1000 && !this.data.tempFilePath) {
      wx.stopRecord()
    }
    setTimeout(() => {
      wx.stopRecord()
    }, 1000);
  },

  // 播放录音
  playSound () {
    this.setData({
      isPlay: true,
    })
    this.soundPlay()
    // console.log('tempFilePath === ', this.data.tempFilePath)
    wx.playVoice({
      filePath: this.data.tempFilePath,
      success: res => {
        // console.log('成功', res)
        this.setData({
          isPlay: false,
        })
        this.soundStop()
      },
      fail: err => {
        // console.log('失败', err)
      }
    })
  },

  // 停止播放
  stopPlay () {
    this.setData({
      isPlay: false,
    })
    this.soundStop()
    wx.stopVoice()
  },

  // 波纹
  soundPlay () {
    this.data.timer = setInterval(() => {
      this.run(true)
    }, 120)
  },

  // 波纹停止
  soundStop () {
    clearInterval(this.data.timer)
    this.run(false)
  },

  // 循环波纹
  run (status) {
    if (status) {
      this.data.circleList.map((item, i) => {
        let opacity = item.opacity
        let next = Number(opacity.charAt(opacity.length - 1))
        if (next === 4) next = 1
        else next += 1
        let param = `circleList[${i}].opacity`
        this.setData({
          [param]: `opacity_${next}`
        })
      })
    } else {
      this.data.circleList.map((item, i) => {
        let param = `circleList[${i}].opacity`
        this.setData({
          [param]: `opacity_${i+1}`
        })
      })
    }  
  },

  // 重新录音
  again () {
    this.stopPlay()
    wx.showModal({
      title: '温馨提醒',
      content: '是否放弃此录音，重新录音？',
      success: res => {
        if (res.confirm) {
          this.soundStop()
          // console.log('确定')
          this.setData({
            isSound: false,
            tempFilePath: '',
            recordingUrl: '',
            recordSecond: 0,
          })
        } else {
          // console.log('取消')
        }
      }
    })
  },

  questionPool (id) {
    wx.showLoading({
      title: '正在生成随机题'
    })
    api.questionPool({id: id}).then(res => {
      wx.hideLoading()
      // console.log('questionPool === ', res.data)
      if (res.data.errCode === 0) {
        let data = res.data.content0
        this.data.poolQuestion = data.question
        this.data.answerList.map((item, i) => {
          if (item.name === 'A') item.value = data.optionA
          if (item.name === 'B') item.value = data.optionB
          if (item.name === 'C') item.value = data.optionC
          if (data.answer === item.name) {
            item.checked = true
          } else {
            item.checked = false
          }
        })
        this.setData({
          poolQuestion: this.data.poolQuestion,
          answerList: this.data.answerList,
          poolId: data.id
        })
      } else if (res.data.errCode == 401 || res.data.errCode == 400) {
        app.userLoing(() => {
          this.questionPool(id)
        })
      }
    })
  },

  // 语音文字切换
  changeRandom (e) {
    this.setData({
      isRandom: e.currentTarget.dataset.random
    })
    if (this.data.isRandom) {
      this.questionPool()
    } else {
      this.data.answerList.map(item => {
        item.value =  ''
        item.checked = false
      })
      this.setData({
        answerList: this.data.answerList
      })
    }
  },

  // 换问题
  randomQuestion () {
    this.questionPool(this.data.poolId)
  },

  check () {
    let checked = false
    for (var i = 0; i < this.data.answerList.length; i++) {
      let item = this.data.answerList[i]
      if (i !== this.data.answerList.length - 1) {
        if (!item.value) return false
        if (item.checked) checked = true
      } else {
        if (item.checked) {
          checked = true
          if (!item.value) return false
        }
      }
    }
    if (checked) return true
    else return false
  },

  // 下一步
  next () {
    let checked = this.check()
    // console.log(checked)
    if (checked) {
      let answerData = {}
      if (this.data.isRandom) {
        answerData.type = 1
        answerData.question = this.data.poolQuestion
        answerData.poolId = this.data.poolId
      } else {
        answerData.type = 2
        answerData.question = api.tencentCloud() + this.data.recordingUrl
        answerData.recordSecond = this.data.recordSecond
      }
      
      this.data.answerList.map(item => {
        if (item.checked) {
          answerData.answer = item.name
        }
        if (item.name === 'A') answerData.optionA = item.value
        if (item.name === 'B') answerData.optionB = item.value
        if (item.name === 'C') answerData.optionC = item.value
      })
      wx.setStorage({
        key: 'answerData',
        data: answerData
      })
      wx.hideLoading()
      wx.navigateTo({
        url: 'topic/generate'
      })
    } else {
      wx.showToast({
        title: '请输入答案',
        icon: 'none',
        mask: true,
      })
    }
  },
  
  // 录音上传
  uploadSound () {
    if (this.data.isRandom) {
      this.next()
      return false
    }
    if (!this.data.tempFilePath) {
      wx.showToast({
        title: '请出题',
        icon: 'none',
        mask: true,
      })
      return false
    }
    wx.showLoading({
      title: '加载中'
    })
    if (this.data.recordingUrl) {
      this.next()
      return false
    }
    api.uploadSound(this.data.tempFilePath).then(res => {
      let data = JSON.parse(res.data)
      if (data.errCode === 0) {
        this.setData({
          recordingUrl: data.content0.recordingUrl
        })
        this.next()
      } else if (res.data.errCode == 401 || res.data.errCode == 400) {
        app.userLoing(() => {
          this.uploadSound()
        })
      } else {
        wx.showToast({
          title: res.data.errMsg,
          icon: 'none'
        })
      }
    })
  },

  active () {
    if (this.data.myActive) {
      clearTimeout(this.data.myTimer)
      this.setData({
        myActive: false
      })
      this.getUser()
    } else {
      this.setData({
        myActive: true
      })
      this.data.myTimer = setTimeout(() => {
        this.setData({
          myActive: false
        })
      }, 2000)
    }
  },

  // 个人中心
  getUser() {
    wx.navigateTo({
      url: 'member/user'
    })
  },

  // 文字题输入
  textarea (e) {
    wx.hideToast()
    let value = e.detail.value
    this.setData({
      poolQuestion: value.trim()
    })
  }
})
