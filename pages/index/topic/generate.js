// pages/index/generate/generate.js
import api from '../../../api/common.js'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    model: [
      { name: '总赏金', value: null, type: 'digit', placeholder: '请填写金额', company: '元' },
      { name: '数量', value: null, type: 'number', placeholder: '请填写数量', company: '个' },
      { name: '留言', value: '恭喜发财', placeholder: '请填写留言', type: 'text' },
    ],
    params: {
      answer: '',  // 答案
      bonusAmount: null,  // 赏金金额，单位：分
      bonusQty: null,  // 赏金数量
      bonusType: 1,  // 赏金类型，1：平均，2：随机
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      poolId: '',  // 题库问题ID
      question: '',  // 题目，如果是语音题目，该字段保存为语音的链接
      recordSecond: 0,  // 录音时长
      type: null,  // 类型，1：文本，2：语音
      bonusDesc: '',
    },
    gameId: '',
    serviceCharge: 0,
    interest: 0.02,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
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

    wx.getStorage({
      key: 'answerData',
      success: res => {
        this.setData({
          params: Object.assign(this.data.params, res.data)
        })
        // console.log(this.data.params)
      },
    })
    wx.removeStorage({
      key: 'answerData',
      success: function (res) {
        // console.log(res.data)
      }
    })
  },

  clearNoNum (value) {
    let val = value
    value = val.replace(/[^\d.]/g, "")  //清除“数字”和“.”以外的字符  
    value = value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的  
    value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数  
    if(value.indexOf(".") < 0 && value != "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额 
      value = parseFloat(value);
    }
    return value
  },

  check (e) {
    let index = e.currentTarget.dataset.index
    if (index === 0) {
      let value = this.clearNoNum(e.detail.value)
      return value
    }
  },

  bindKeyInput (e) {
    // console.log(e)
    if (e.detail.value === '') return false

    let index = e.currentTarget.dataset.index
    if (index === 0) {
      let num = (e.detail.value * this.data.interest) * 100
      this.setData({
        serviceCharge: Math.ceil(num)
      })
      
    }
    if (index === 2) this.data.model[index].value = e.detail.value
    else this.data.model[index].value = Number(e.detail.value)
    this.setData({
      model: this.data.model
    })
    // console.log(this.data.model)
  },

  next () {
    for (let i = 0; i < this.data.model.length; i++) {
      let item = this.data.model[i]
      if (!item.value) {
        wx.showToast({
          title: item.placeholder,
          icon: 'none'
        })
        return false
      } 
    }

    this.data.model.map((item, i) => {
      if (i === 0) this.data.params.bonusAmount = Number(item.value) * 100
      if (i === 1) this.data.params.bonusQty = Number(item.value)
      if (i === 2) this.data.params.bonusDesc = item.value
    })
    this.setData({
      params: this.data.params
    })
    // console.log('params === ', this.data.params)

    wx.showLoading({
      title: '正在发起支付'
    })

    if (this.data.gameId) {
      let model = {}
      this.data.model.map((item, i) => {
        if (i === 0) model.bonusAmount = Number(item.value) * 100
        if (i === 1) model.bonusQty = Number(item.value)
        if (i === 2) model.bonusDesc = item.value
      })
      model.id = this.data.gameId
      this.updateBonus(model, this.data.gameId)
      return false
    }

    this.questionGameInsert()
  },
  
  questionGameInsert () {
    api.questionGameInsert(this.data.params).then(res => {
      // console.log('questionGameInsert === ', res.data)
      if (res.data.errCode === 0) {


        // test
        // this.wxpay(res.data.content0.questionGame.id, true)
        this.wxpay(res.data.content0.questionGame.id)

        this.setData({
          gameId: res.data.content0.questionGame.id
        })

      } else if (res.data.errCode == 401 || res.data.errCode == 400) {
        app.userLoing(() => {
          this.questionGameInsert()
        })
      } else {
        wx.hideLoading()
        // console.log(res.data)
        wx.showToast({
          title: res.data.errMsg,
          icon: 'none',
          mask: true
        })
      }
    })
  },

  // 修改红包金额
  updateBonus (model, id) {
    api.updateBonus(model).then(res => {
      // console.log('updateBonus === ', res.data)
      if (res.data.errCode === 0) {


        this.wxpay(id)
        // this.wxpay(id, true)


      } else if (res.data.errCode === 400 || res.data.errCode === 401) {
        app.userLoing(() => {
          this.updateBonus(model, id)
        })
      } else {
        // console.log(res.data)
        wx.hideLoading()
      }
    })
  },

  wxpay (id, status) {
    api.wxpay({ gameId: id }, status).then(res => {
      // console.log('wxpay === ', res.data)
      wx.hideLoading()
      let data = res.data
      if (status) {
        
        wx.redirectTo({
          url: `myShare?id=${data.content0.gameId}`
        })
        return false
      }

      wx.requestPayment({
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: data.signType,
        paySign: data.paySign,
        success: res => {
          // console.log('支付成功')
          wx.redirectTo({
            url: `myShare?id=${id}&type=${this.data.params.type}`
          })
        },
        fail: err => {
          wx.showToast({
            title: '取消支付',
            icon: 'none'
          })
        }
      })
    })
  }
})