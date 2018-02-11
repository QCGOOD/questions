// pages/index/topic/detail.js
const app = getApp()
import api from '../../../api/common.js'

Page({

  data: {
    receiveList: [],
    userInfo: {},
    bonusAmount: 0,
    getNum: 0,
    total: 0,
    gameId: '',
    questionGame: {},
    answer: {},
    options: {},
  },

  onLoad: function (options) {
    wx.showLoading({ title: '加载中' })
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
    this.setData({
      options: options,
    })
    let id = ''
    if (options.id) id = options.id
    else id = 'ac10000f61750c530161788d091c0074'
    this.apiGetBonusList(id)
  },

  apiGetBonusList(gameId) {
    let params = { gameId: gameId }, arr = [];
    api.selectBonusListByGameId(params).then(res => {
      // console.log('领取列表===',res.data)
      if (res.data.errCode == 401 || res.data.errCode == 400){
        app.userLoing(() => {
          this.apiGetBonusList(gameId)
        })
      }else if(res.data.errCode == 0) {
        wx.hideLoading()
        res.data.content0.answerList.forEach((item, index) => {
          if(res.data.content0.answerList[index].result === 1) arr.push(item);
        });
        this.setData({
          receiveList: arr,
          getNum: arr.length,
          questionGame: res.data.content0.questionGame,
          answer: res.data.content0.answer
        })
      }
    })
  },

  navigate (e) {
    let url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url,
    })
  },
})