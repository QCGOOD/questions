import api from '../../../api/common.js'
const app = getApp()

Page({
  data: {
    isChecked: false,
    complaint:[
      { content: '欺诈', checked: false, type: 1 },
      { content: '色情', checked: false, type: 2 },
      { content: '不实信息', checked: false, type: 3 },
      { content: '诱导行为', checked: false, type: 4 },
      { content: '骚扰', checked: false, type: 5 },
      { content: '侵权(冒充他人、侵犯名誉等)', checked: false, type: 6 },
      { content: '其他', checked: false, type: 0 },
    ],
    id: '',
  },

  onLoad(options) {
    // console.log(getCurrentPages())
    // console.log(options)
    if (options.id) {
      this.data.id = options.id
    } else {
      // this.data.id = 'c0a801496173657301617365b88b0002'
    }
    this.setData({
      id: this.data.id
    })
    // console.log(this.data.id)
  },

  // 投诉
  complaints (model) {
    api.complaint(model).then(res => {
      // console.log('complaint == ', res.data)
      if (res.data.errCode === 0) {
        wx.showModal({
          title: '投诉已提交',
          content: '你的投诉已提交审核，感谢您的支持！',
          success: res => {
            wx.navigateBack({
              delta: 1
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

  submitBtn () {
    let data = {}
    let type = null
    this.data.complaint.forEach((item,i) => {
      if(item.checked){
        this.setData({isChecked: true})
        type = item.type
      }
    })
    if(!this.data.isChecked){
      wx.showToast({
        title:'请选择投诉理由',
        icon: 'none'
      })
      return;
    }
    wx.showModal({
      title: '温馨提醒',
      content: '已确认投诉理由,可提交',
      success: res => {
        if (res.confirm) {
          // console.log('用户点击确定')
          let model = {}
          model.gameId = this.data.id
          model.type = type
          this.complaints(model)
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })
  },

  checked(e) {
    // console.log(e)
    let index = e.currentTarget.dataset.index
    let type = this.data.complaint[index].type
    let len = this.data.complaint.length
    let checked = this.data.complaint[index].checked
    if (type === 0) {
      wx.navigateTo({
        url: `complaintOther?id=${this.data.id}`
      })
      return;
    }
    this.data.complaint.forEach((item,i) => {
      if (i == index) item.checked = !item.checked
      else item.checked = false
    });
    // console.log(this.data.complaint[index])
    this.setData({
      complaint: this.data.complaint
    })
  }
})