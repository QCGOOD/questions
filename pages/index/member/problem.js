// pages/index/member/problem.js
const app = getApp();
import api from '../../../api/common.js'
Page({

  data: {
    open: false,
    type: 1,
    problemList: []
  },
  onLoad: function (options) {
    wx.showLoading({ title: '加载中' })
    this.apiGetListProblem()
  },

  apiGetListProblem() {
    api.getListProblem().then(res => {
      // console.log('常见问题列表===',res.data)
      if(res.data.errCode == 401 || res.data.errCode == 400){
        app.userLoing(() => {
          this.apiGetListProblem()
        })
      }else if(res.data.errCode == 0){
        wx.hideLoading()
        this.setData({
          problemList: res.data.content0.rows
        })
      }
    }) 
  },

  problemToggle (e) {
    let index = e.currentTarget.dataset.index
    this.data.problemList.map((item, i) => {
      if (index === i) item.open = !item.open
      else item.open = false
    })
    this.setData({
      problemList: this.data.problemList
    })
  }
})