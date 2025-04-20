import { Address, CartItem, UserInfo } from '../../types/types';

let url = 'https://7ottrlmonc.execute-api.ap-southeast-1.amazonaws.com/default/wechat-phone';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cart: <CartItem[]>[],
    totalPrice: 0,
    userInfo: {
      name: '',
      phone: '',
      openid: '',
      avatar: '',
      role: ''
    },
    showModal: false,
    selectedAddress: {} as Address
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
    wx.showLoading({ title: '加载中' })
    const userInfo: UserInfo = wx.getStorageSync('userInfo') || {};
    const address = getApp().globalData.selectedAddress;
    this.setData({
      selectedAddress: address,
      userInfo: userInfo
    });
    this.loadCart();
    wx.hideLoading()
  },

  loadCart() {
    const cart: CartItem[] = wx.getStorageSync('cart') || [];
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    this.setData({
      cart,
      totalPrice: total
    });
  },

  updateCart(cart: CartItem[]) {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    wx.setStorageSync('cart', cart);
    this.setData({
      cart,
      totalPrice: total
    });
  },

  increaseQty(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id;
    const cart = [...this.data.cart];
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
      cart[index].quantity += 1;
      this.updateCart(cart);
    }
  },

  decreaseQty(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id;
    const cart = [...this.data.cart];
    const index = cart.findIndex(item => item.id === id);
    if (index !== -1) {
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      } else {
        cart.splice(index, 1);
      }
      this.updateCart(cart);
    }
  },

  clearCart() {
    wx.showModal({
      title: '清空购物车',
      content: '确定清空购物车吗?',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('cart');
          this.setData({
            cart: [],
            totalPrice: 0
          });
          wx.showToast({
            title: '购物车已清空',
            icon: 'none'
          });
        }
      }
    });
  },

  goToCheckout() {
    if (!this.data.userInfo.name || !this.data.userInfo.openid || !this.data.userInfo.phone) {
      this.setData({
        showModal: true
      })
    } else {
      this.createOrder();
    }
  },

  addAddress() {
    wx.navigateTo({
      url: '/pages/address/index'
    })
  },

  createOrder() {
    wx.showLoading({ title: '加载中' })
    wx.request({
      url: url,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        action: 'create_order',
        address: encodeURIComponent(this.data.selectedAddress.address),
        openid: encodeURIComponent(this.data.userInfo.openid),
        name: encodeURIComponent(this.data.userInfo.name),
        phone: encodeURIComponent(this.data.userInfo.phone),
        items: this.data.cart.map(({ id, quantity }) => ({ id, quantity }))
      },
      success(res) {
        wx.hideLoading();
        if (res.statusCode === 201) {
          let invoice = res.data.invoice;
          let price = res.data.price;
          wx.navigateTo({
            url: `/pages/checkout/index?invoice=${invoice}&price=${price}`
          });
        } else {
          wx.showToast({
            title: '创建订单失败',
            icon: 'none'
          });
        }
      },
      fail(res) {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    });
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
    wx.navigateTo({
      url: '/pages/checkout/index'
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