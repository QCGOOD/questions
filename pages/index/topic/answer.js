// pages/index/answer/answer.js
const innerAudioContext = wx.createInnerAudioContext()
import api from '../../../api/common.js'
const app = getApp()

Page({
  data: {
    answerSelectList: [
      { name: 'A', text: '', choiceRight: false, choiceWrong: false },
      { name: 'B', text: '', choiceRight: false, choiceWrong: false },
      { name: 'C', text: '', choiceRight: false, choiceWrong: false },
    ],
    receiveList: [],
    yuyinIndex: 2,
    playTimer: null,
    tempFilePath: '',
    isPlay: false,
    questionUser: {},
    questionGame: {},
    recordSecond: 0,
    recordSecondTimer: null,
    model: {
      id: '',
      answer: '',
    },
    receiveVisible: false,
    finishVisible: false,
    bonusAmount: 0,
    answerList: [],
    isShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    wx.showLoading({ title: '加载中' })
    // console.log(options)
    var scene = decodeURIComponent(options.scene)
    // console.log('scene == ', scene)
    if (options.id) {
      this.data.model.id = options.id
    } else if (scene !== 'undefined') {
      this.data.model.id = scene
    } else {
      this.data.model.id = 'ac10000f6179cb1601617a279d3400b7'
    }
    
    this.setData({
      model: this.data.model
    })
    this.friendship(this.data.model.id)
    this.selectToAnswer(this.data.model.id)
  },

  onShow () {
    // console.log('显示')
    this.selectToAnswer(this.data.model.id)
  },
  onHide () {
    // console.log('隐藏')
  },

  navigate (e) {
    let url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url,
    })
  },

  changeYuyinIndex () {
    if (this.data.yuyinIndex < 2) {
      this.setData({
        yuyinIndex: this.data.yuyinIndex + 1
      })
    } else {
      this.setData({
        yuyinIndex: 0
      })
    }
  },

  play () {
    if (this.data.isPlay) {
      wx.stopVoice()
      clearInterval(this.data.playTimer)
      clearInterval(this.data.recordSecondTimer)
      this.setData({
        yuyinIndex: 2,
        isPlay: false,
        recordSecond: this.data.questionGame.recordSecond
      })
      return false
    }

    this.playSound()
    this.data.playTimer = setInterval(() => {
      this.changeYuyinIndex()
    }, 300)
    this.data.recordSecondTimer = setInterval(() => {
      if (this.data.recordSecond === 0) {
        this.setData({
          recordSecond: 0
        })
      } else {
        this.setData({
          recordSecond: this.data.recordSecond - 1
        })
      }
    }, 1000)
    this.setData({
      isPlay: true
    })
  },

  // 播放录音
  playSound () {
    if (this.data.tempFilePath) {
      wx.playVoice({
        filePath: this.data.tempFilePath,
        success: res => {
          // console.log('成功', res)
        },
        fail: err => {
          // console.log('失败', err)
        },
        complete: () => {
          clearInterval(this.data.playTimer)
          clearInterval(this.data.recordSecondTimer)
          this.setData({
            yuyinIndex: 2,
            isPlay: false,
            recordSecond: this.data.questionGame.recordSecond
          })
          // console.log('停止')
        }
      })
      return false
    }

    wx.downloadFile({
      url: this.data.questionGame.question,
      success: res => {
        // console.log('下载 === ', res)
        if (res.statusCode === 200) {
          this.setData({
            tempFilePath: res.tempFilePath
          })
          wx.playVoice({
            filePath: res.tempFilePath,
            success: res => {
              // console.log('成功', res)
            },
            fail: err => {
              // console.log('失败', err)
            },
            complete: () => {
              clearInterval(this.data.playTimer)
              clearInterval(this.data.recordSecondTimer)
              this.setData({
                yuyinIndex: 2,
                isPlay: false,
                recordSecond: this.data.questionGame.recordSecond
              })
              // console.log('停止')
            }
          })
        }
      }
    })
  },

  // 问卷答案列表
  selectToAnswer (id, status) {
    // console.log('调用问卷答案列表接口 === ', id)
    api.selectToAnswer({ id: id }).then(res => {
      // console.log('selectToAnswer === ', res.data)
      
      if (res.data.errCode === 0) {
        wx.hideLoading()
        let data = res.data.content0
        this.setData({
          questionUser: data.questionUser,
          questionGame: data.questionGame,
          recordSecond: data.questionGame.recordSecond
        })

        this.pushAnswerSelectList(data.questionGame)
        this.pushReceiveList(data.answerList)
        if (!status) this.answered(data.answer)
      } else if (res.data.errCode == 401 || res.data.errCode == 400) {
        // console.log('selectToAnswer出错了 === ', JSON.stringify(res.data))
        app.userLoing(() => {
          this.selectToAnswer(id)
        })
      }
    })
  },

  // 已答
  answered (answer) {
    if (answer.answer) {
      this.data.answerSelectList.map((item, i) => {
        if (item.name === answer.answer) {
          if (answer.result === 1) item.choiceRight = true
          else item.choiceWrong = true
        } else {
          item.choiceRight = false
          item.choiceWrong = false
        }
      })
      this.setData({
        answerSelectList: this.data.answerSelectList
      })
    }
  },
  
  // 答对领取列表
  pushReceiveList(answerList) {
    this.setData({
      receiveList: []
    })
    answerList.map(item => {
      if (item.result === 1) {
        this.data.receiveList.push(item)
      }
    })
    this.setData({
      receiveList: this.data.receiveList
    })
    // console.log('receiveList === ', this.data.receiveList)
  },

  // 获取答卷
  pushAnswerSelectList (answers) {
    this.data.answerSelectList[0].text = answers.optionA
    this.data.answerSelectList[1].text = answers.optionB
    this.data.answerSelectList[2].text = answers.optionC
    if (answers.optionC === '') this.data.answerSelectList.pop()
    this.setData({
      answerSelectList: this.data.answerSelectList
    })
    // console.log('answerSelectList ==', this.data.answerSelectList)
  },
  
  selectAnswer (e) {
    this.data.model.answer = e.currentTarget.dataset.name
    this.setData({
      model: this.data.model
    })
    // console.log(this.data.model)
    this.doAnswer()
  },

  // 作答
  doAnswer () {
    wx.showLoading({
      title: '提交答案',
    })
    api.doAnswer(this.data.model).then(res => {
      // console.log('doAnswer === ', res.data)
      wx.hideLoading()
      if (res.data.errCode === 0) {
        let answer = res.data.content0.questionGame.answer
        this.setData({
          answerList: res.data.content0.answerList
        })
        if (answer === this.data.model.answer) {
          // console.log('对了')
          this.data.answerSelectList.map((item, i) => {
            if (item.name === this.data.model.answer) {
              item.choiceRight = true
            }
          })
          wx.showToast({
            title: `恭喜你答对了`,
            icon: 'none'
          })
          setTimeout(() => {
            this.setData({
              receiveVisible: true,
              bonusAmount: res.data.content0.answer.bonusAmount
            })
          }, 500)
          
        } else {
          // console.log('错了')
          this.data.answerSelectList.map((item, i) => {
            if (item.name === this.data.model.answer) {
              item.choiceWrong = true
            }
            if (item.name === answer) {
              item.choiceRight = true
            }
          })
          wx.vibrateLong()
          wx.showToast({
            title: `很遗憾答错了`,
            icon: 'none',
            duration: 5000
          })
        }
        this.setData({
          answerSelectList: this.data.answerSelectList
        })
        
      } else if (res.data.errCode == 401 || res.data.errCode == 400) {
        app.userLoing(() => {
          this.doAnswer()
        })
      } else {
        wx.showToast({
          title: res.data.errMsg,
          icon: 'none'
        })
        if (/遗憾/.test(res.data.errMsg)) {
          this.setData({
            finishVisible: true
          })
        }
      }
      this.selectToAnswer(this.data.model.id, true)
    })
  },

  close () {
    this.setData({
      finishVisible: false,
      receiveVisible: false,
    })
  },
  
  friendship (id) {
    api.friendship({ gameId: id }).then(res => {
      // console.log('friendship === ', res.data)
      if (res.data.errCode == 401 || res.data.errCode == 400) {
        this.friendship(id)
      }
    })
  }
})