import api from './config.js'

export default {
  tencentCloud () {
    return 'http://question-1255600302.file.myqcloud.com'
  },
  // 登录
  getLogin (model) {
    return api.getData('login.do', model, true)
  },

  // 好友
  friendship (params) {
    return api.postData('/friendship/insert', params)
  },

  // 支付
  wxpay (params, status) {
    if (status) return api.postData('/pay/testWxpay', params)
    else return api.postData('/pay/wxpay', params)
  },

  // 修改红包金额
  updateBonus (params) {
    return api.postData('/questionGame/updateBonus.do', params)
  },

  // 随机出题
  questionPool (params) {
    return api.getData('/questionPool/select.do', params)
  },

  // 录音
  uploadSound (tempFilePath) {
    return api.uploadFile('/attachments/recording/tencentCloud.do', tempFilePath)
  },

  // 发布问卷
  questionGameInsert(params) {
    return api.postData('/questionGame/insert.do', params)
  },

  // 查看问卷
  questionGameSelect (params) {
    return api.getData('/questionGame/select.do', params)
  },

  // 获取作答问卷
  selectToAnswer (params) {
    return api.getData('/questionGame/selectToAnswer.do', params)
  },

  // 抢答问卷
  doAnswer (params) {
    return api.postData('/answer/doAnswer.do', params)
  },

  // 常见问题列表
  getListProblem () {
    return api.getData('/explain/getList.do')
  },

  // 账户
  selectAvailableAmount () {
    return api.getData('/account/selectAvailableAmount.do')
  },

  // 我发的红包列表
  selectMyGivenBonusList () {
    return api.getData('/questionGame/selectMyGivenBonusList.do')
  },

  // 我发的红包汇总
  postMyBonus () {
    return api.getData('/questionGame/sumMyBonus.do')
  },

  // 我收到的红包列表
  selectMyBonusList () {
    return api.getData('/answer/selectMyBonusList.do')
  },

  // 我收到的红包汇总
  getMyBonus () {
    return api.getData('/answer/sumMyBonus.do')
  },

  // 问卷红包领取列表
  selectBonusListByGameId (data) {
    return api.getData('/answer/selectBonusListByGameId.do',data)
  },
  
  // 好友排名、世界排名
  selectAmountRanking () {
    return api.getData('/account/selectAmountRanking.do')
  },

  // 好友排名列表
  selectFriendshipAmountRankingList (data) {
    return api.getData('/account/selectFriendshipAmountRankingList.do', data)
  },

  // 世界排名列表
  selectAmountRankingList(data) {
    return api.getData('/account/selectAmountRankingList.do', data)
  },

  // 生成分享图片
  getImage (params) {
    return api.postData('/share/getImage.do', params)
  },

  // 投诉
  complaint (params) {
    return api.postData('/complaint/insert.do', params)
  },
}