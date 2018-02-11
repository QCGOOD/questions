// pages/record/record.js
const app = getApp();
import api from '../../../api/common.js'
Page({
  data: {
    userInfo: {},
    navActive: true,
    price: 0,
    number: 0,
    recordData: [],
    sendBonusList: [],
    sendBonusData: {},
    receivedBonusList: [],
    receivedBonusData: {},
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
    // this.apiMyGiveBonusList()
    this.sendBonus()
  },

  // 发出
  sendBonus () {
    this.selectMyGivenBonusList()
    this.postMyBonus()
  },
  selectMyGivenBonusList () {
    api.selectMyGivenBonusList().then(res => {
      // console.log('selectMyGivenBonusList == ', res.data)
      if (res.data.errCode === 0) {
        wx.hideLoading()
        this.setData({
          sendBonusList: res.data.content0.rows
        })
      } else if (res.data.errCode == 401 || res.data.errCode == 400) {
        app.userLoing(() => {
          this.selectMyGivenBonusList()
        })
      }
    })
  },
  postMyBonus () {
    api.postMyBonus().then(res => {
      // console.log('postMyBonus == ', res.data)
      if (res.data.errCode === 0) {
        this.data.sendBonusData.price = res.data.content0.bonusAmount
        this.data.sendBonusData.number = res.data.content0.bonusQty
        this.setData({
          sendBonusData: this.data.sendBonusData
        })
      } else if (res.data.errCode == 401 || res.data.errCode == 400) {
        app.userLoing(() => {
          this.postMyBonus()
        })
      }
    })
  },

  // 收到
  receivedBonus () {
    this.selectMyBonusList()
    this.getMyBonus()
  },
  selectMyBonusList () {
    api.selectMyBonusList().then(res => {
      if (res.data.errCode === 0) {
        wx.hideLoading()
        this.setData({
          receivedBonusList: res.data.content0.rows
        })
      } else if (res.data.errCode == 401 || res.data.errCode == 400) {
        app.userLoing(() => {
          this.selectMyBonusList()
        })
      }
    })
  },
  getMyBonus () {
    api.getMyBonus().then(res => {
      // console.log('getMyBonus == ', res.data)
      if (res.data.errCode === 0) {
        this.data.receivedBonusData.price = res.data.content0.bonusAmount
        this.data.receivedBonusData.number = res.data.content0.bonusQty
        this.setData({
          receivedBonusData: this.data.receivedBonusData
        })
      } else if (res.data.errCode == 401 || res.data.errCode == 400) {
        app.userLoing(() => {
          this.getMyBonus()
        })
      }
    })
  },


  apiMyGiveBonusList() {
    let apiBonusList = this.data.navActive?api.selectMyGivenBonusList:api.selectMyBonusList;
    let apiMyBonus = this.data.navActive?api.postMyBonus:api.getMyBonus;
    let that = this

    apiBonusList().then(res => {
      wx.hideLoading()
      console.log('红包列表===',res.data)
      if(res.data.errCode == 401 || res.data.errCode == 400){
        app.userLoing(() => {
          this.apiBonusList()
        })
      }else if(res.data.errCode ==0 ){
        for(let i=0,len= res.data.content0.rows.length;i<len;i++){
          let criTime = res.data.content0.rows[i].createTime.substr(0,10)
          res.data.content0.rows[i].criTime = criTime
        } 
        this.setData({
          recordData: {
            list: res.data.content0.rows
          }
        })
      }
    })

    apiMyBonus().then(res => {
      wx.hideLoading()
      // console.log('红包汇总===',res.data)
      if(res.data.errCode == 401 || res.data.errCode == 400){
        app.userLoing(() => {
          this.apiMyBonus()
        })
      }else if(res.data.errCode ==0 ){
        this.setData({
          price: res.data.content0.bonusAmount,
          number: res.data.content0.bonusQty
        })
      }
    })
  },

  changeNavActive (e) {
    let navActive = e.currentTarget.dataset.active
    if(this.data.navActive == navActive) return;
    this.setData({
      navActive: navActive
    })
    // this.apiMyGiveBonusList()
    if (!this.data.navActive && this.data.receivedBonusList.length === 0) {
      wx.showLoading({ title: '加载中' })
      this.receivedBonus()
    }
  },

  toAnswer (e) {
    console.log(e,'跳转到红包分享')
    wx.navigateTo({
      url: `/pages/index/topic/answer?id=${e.currentTarget.dataset.id}`
    })
  }
})