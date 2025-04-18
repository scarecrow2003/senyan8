import { Order } from "../../types/types";
const config = require('../../utils/config');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orders: [] as Order[]
  },

  fetchOrders(openid) {
    let that = this;
    wx.request({
      url: `${config.API_URL}?action=get_orders&user_id=${openid}`,
      method: 'GET',
      header: {
          'Content-Type': 'application/json'
      },
      success: function(res) {
        let orders: Order[] = res.data;
        that.setData({
          orders: orders
        });
      },
      fail: function(err) {
          console.error(err);
      }
    })
  },

  goToOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${orderId}`
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    if (userInfo.openid) {
      this.fetchOrders(userInfo.openid);
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1000
      })
      wx.switchTab({
        url: '/pages/setting/index'
      })
    }
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