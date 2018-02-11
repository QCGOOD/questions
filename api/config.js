// 用来获取storage 中的sessionKey  添加到 data中的参数里面;
let getSessionKey = (data) => {
  data.sessionKeyId = wx.getStorageSync('sessionKeyId');
  return data
}


const request = {
  host: 'https://q.wego168.com/question/',  // 线上
  // host: 'http://192.168.1.73:8180/question/m/',  // 宁
  // host: 'http://192.168.1.70:8180/question/m/',  // 辉
  index: 0,
  that: this,
  // get请求
  getData: function (url, model = {}, status) {
    // console.log(this.host + url)
    if (!status) model = getSessionKey(model)
    // console.log(new Date())
    // console.log('getmodel === ', model)
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.host}${url}`,
        method: 'GET',
        data: model,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
          // console.log('fail === ', JSON.stringify(err))
          // console.log('再次请求')
          this.getData(url, model, status)
        }
      })
    })
    // .catch (err => {
      console.log('捕获的报错 === ', JSON.stringify(err))
      console.log('再次请求')
    //   this.getData(url, model, status)
    // })
  },
  
  // post请求
  postData: function (url, model, status) {
    // console.log(this.host + url)
    if (!status) model = getSessionKey(model)
    // console.log(new Date())
    // console.log('postmodel === ', model)
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.host}${url}`,
        method: 'POST',
        data: model,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
          // console.log('fail === ', JSON.stringify(err))
          // console.log('再次请求')
          this.postData(url, model, status)
        }
      })
    })
  },

  // 上传文件请求
  uploadFile: function (url, tempFilePath) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${this.host}${url}`,
        filePath: tempFilePath,
        name: 'file',
        formData: {
          'sessionKeyId': wx.getStorageSync('sessionKeyId')
        },
        header: {
          'content-type': 'multipart/form-data'
        },
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  }
}

module.exports = request