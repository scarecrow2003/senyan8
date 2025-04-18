const request = (url) => {
  return new Promise(function(resolve, reject) {
      wx.request({
          url: url,
          method: 'GET',
          header: {
              'Content-Type': 'application/json'
          },
          success: function(res) {
              if (res.statusCode == 200) {
                resolve(res.data);
              } else {
                  reject(res.errMsg);
              }
          },
          fail: function(err) {
              reject(err)
          }
      })
  });
}
