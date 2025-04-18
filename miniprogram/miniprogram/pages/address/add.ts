// pages/address/add.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    postalCode: '',
    address: '',
    level: '',
    unit: ''
  },

  onPostalCodeInput(e) {
    this.setData({ postalCode: e.detail.value });
  },

  onLevelInput(e) {
    this.setData({ level: e.detail.value });
  },

  onUnitInput(e) {
    this.setData({ unit: e.detail.value });
  },

  getAddress() {
    const { postalCode } = this.data;
    if (postalCode.length !== 6) {
      wx.showToast({ title: '请输入有效邮编', icon: 'none' });
      return;
    }

    wx.request({
      url: 'https://developers.onemap.sg/commonapi/search',
      method: 'GET',
      data: {
        searchVal: postalCode,
        returnGeom: 'Y',
        getAddrDetails: 'Y',
        pageNum: 1
      },
      success: (res) => {
        if (res.data.found > 0) {
          const address = res.data.results[0].ADDRESS;
          this.setData({ address });
        } else {
          wx.showToast({ title: '地址未找到', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  saveAddress() {
    const { postalCode, address, level, unit } = this.data;

    if (!postalCode || !address) {
      wx.showToast({ title: '请填写完整地址信息', icon: 'none' });
      return;
    }

    const newAddress = {
      id: Date.now(),
      name: `Blk ${postalCode}`,
      address: `${address}, ${level}-${unit}, Singapore ${postalCode}`
    };

    const list = wx.getStorageSync('addressList') || [];
    list.push(newAddress);
    wx.setStorageSync('addressList', list);

    wx.showToast({ title: '保存成功', icon: 'success' });

    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})