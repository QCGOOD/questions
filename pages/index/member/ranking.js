// pages/index/member/ranking.js
const app = getApp();
import api from '../../../api/common.js'
Page({
  data: {
    active: true,
    userInfo: {},
    rankingFriend: 0,
    ranking: 0,
    rankingList: [],
  },

  onLoad(options) {
    
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
    this.rankingList()
  },


  rankingList() {
    wx.showLoading({ title: '加载中' })
    let apiRanking = this.data.active?api.selectFriendshipAmountRankingList:api.selectAmountRankingList;
    let that = this
    api.selectAmountRanking().then(rank => {
      if(rank.data.errCode == 401 || rank.data.errCode == 400){
        app.userLoing(() => {
          that.rankingList()
        })
      } else if (rank.data.errCode == 0) {
        wx.hideLoading()
        // console.log('排名', rank.data.content0)
        let data = { rankingId: rank.data.content0.ranking.id }
        that.setData({
          ranking: rank.data.content0.ranking.ranking,
          rankingFriend: rank.data.content0.ranking.friendshipRanking
        })
        apiRanking(data).then(res => {
          // console.log('排行榜===',res.data)
          if(res.data.errCode ==0 ){
            that.setData({
              rankingList: res.data.content0.accountList
            })
          }
        })
      } else {
        // console.log(res.data)
      }
    })
  },

  changeActive(e) {
    let active = e.currentTarget.dataset.active
    if(this.data.active == active) return;
    this.setData({
      active: active
    })
    this.rankingList()
  }
})