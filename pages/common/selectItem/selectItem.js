// pages/selectItem/selectItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: '',
    }
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
    bindKeyInput: function (e) {
      this.triggerEvent('keyinput', e)
    },
    select: function (e) {
      this.triggerEvent('select', e)
    }
  }
})
