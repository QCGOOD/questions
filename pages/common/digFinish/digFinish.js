// pages/common/digFinish/digFinish.js
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
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    next: function () {
      wx.redirectTo({
        url: '/pages/index/index',
      })
    },
    close: function () {
      this.triggerEvent('close')
    }
  }
})
