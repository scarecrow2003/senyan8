import { UserInfo } from "../../types/types";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
    userInfo: {
      name: '',
      phone: '',
      openid: '',
      avatar: '',
      role: ''
    }
  },

  login() {
    this.setData({
      showModal: true
    })
  },

  handleLogout() {
    wx.clearStorageSync();
    wx.showToast({
      title: '已退出登录',
      icon: 'none'
    });
    this.setData({
      userInfo: {
        name: '',
        phone: '',
        openid: '',
        avatar: '',
        role: ''
      }
    })
  },

  onCloseModal() {
    this.setData({ showModal: false });
  },
  setUserInfo(e) {
    wx.setStorageSync('userInfo', e.detail);
    this.setData({
      showModal: false,
      userInfo: e.detail 
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
    const userInfo: UserInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo: userInfo
    });
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