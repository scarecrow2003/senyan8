import { Address } from "../../types/types";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [] as Address[]
  },

  goToAddAddress() {
    wx.navigateTo({
      url: '/pages/address/add'
    });
  },

  selectAddress(e) {
    getApp().globalData.selectedAddress = e.currentTarget.dataset.address;
    wx.switchTab({
      url: '/pages/cart/index'
    });
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
    const stored = wx.getStorageSync('addressList') || [{
      id: Date.now(),
      name: '342102',
      address: '123 Orchard Road, #08-12, Singapore 238888'
    }];
    this.setData({ addressList: stored });
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