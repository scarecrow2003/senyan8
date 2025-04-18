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
      avatar: ''
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
    const userInfo: UserInfo = wx.getStorageSync('userInfo') || {};
    const address = getApp().globalData.selectedAddress;
    this.setData({
      selectedAddress: address,
      userInfo: userInfo
    });
    this.loadCart();
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
    wx.request({
      url: url,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        action: 'create_order',
        address: encodeURIComponent(JSON.stringify(this.data.selectedAddress.address)),
        openid: encodeURIComponent(this.data.userInfo.openid),
        name: encodeURIComponent(this.data.userInfo.name),
        phone: encodeURIComponent(this.data.userInfo.phone),
        items: this.data.cart.map(({ id, quantity }) => ({ id, quantity }))
      },
      success(res) {
        if (res.statusCode === 201) {
          wx.navigateTo({
            url: '/pages/checkout/index'
          });
        } else {
          wx.showToast({
            title: '创建订单失败',
            icon: 'none'
          });
        }
      },
      fail(res) {
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    });
  },

  // getUserProfile() {
  //   console.log('Calling wx.getUserProfile');
  //   wx.getUserProfile({
  //     desc: '用于完善会员资料',
  //     success: (res) => {
  //       console.log('User Info:', res.userInfo);
  //       let userInfo = {
  //         ...this.data.userInfo,
  //         name: res.userInfo.nickName
  //       }
  //       this.setData({
  //         ...this.data,
  //         userInfo
  //       })
  //     },
  //     fail: (err) => {
  //       console.log('User denied permission', err);
  //     }
  //   });
  // },

  // onGetPhone(e) {
  //   let that = this;
  //   if (e.detail.errMsg === 'getPhoneNumber:ok') {
  //     let { encryptedData, iv } = e.detail;
  //     wx.login({
  //       success(res) {
  //         const code = res.code;
  //         wx.request({
  //           url: 'https://7ottrlmonc.execute-api.ap-southeast-1.amazonaws.com/default/wechat-phone',
  //           method: 'POST',
  //           header: {
  //             'content-type': 'application/json'
  //           },
  //           data: {
  //             code: code,
  //             encryptedData: encryptedData,
  //             iv: iv
  //           },
  //           success(res) {
  //             console.log('Phone number decrypted:', res.data);
  //             let { phone, openid } = res.data;
  //             let userInfo = {
  //               ...that.data.userInfo,
  //               phone: phone,
  //               openid: openid
  //             }
  //             that.setData({
  //               ...that.data,
  //               userInfo
  //             })
  //           }
  //         });
  //       }
  //     });
  //   } else {
  //     console.warn('User denied phone number access');
  //   }
  // },

  // cancel() {
  //   this.setData({ showModal: false });
  // },

  // confirm() {
  //   this.setData({ showModal: false });
  //   wx.navigateTo({
  //     url: '/pages/checkout/index'
  //   });
  //   // You can now use this name, or send it to backend
  // },

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