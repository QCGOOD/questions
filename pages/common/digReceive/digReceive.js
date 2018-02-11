// pages/common/digReceive/digReceive.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    active: {
      type: Boolean,
      value: false,
    },
    questionUser: {
      type: Object,
      value: {},
    },
    bonusAmount: {
      type: Number,
      value: 0,
    },
    gameId: {
      type: String,
      value: ''
    },
    bonusDesc: {
      type: String,
      value: ''
    },
    questionGame: {
      type: Object,
      value: {},
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    rotate: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    open () {
      this.setData({
        rotate: !this.data.rotate
      })
      console.log(this.data.rotate)
      setTimeout(() => {
        wx.navigateTo({
          url: `detail?bonusAmount=${this.data.bonusAmount}&id=${this.data.questionGame.id}`
        })
        setTimeout(() => {
          this.close()
        }, 1000)
      }, 800)
      
      
    },
    close () {
      this.triggerEvent('close')
    }
  }
})
