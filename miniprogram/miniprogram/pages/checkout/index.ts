import { CartItem } from '../../types/types';
const drawQrcode = require('../../utils/weapp.qrcode.esm.js');
const PaynowQR = require('../../utils/paynow-qr.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cart: <CartItem[]>[],
    totalPrice: 0,
    qrcodeSaved: false,
    hasUserInfo: false
  },

  confirmPayment() {
    wx.removeStorageSync('cart');
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/products/index'
      });
    }, 1000);
  },

  saveQrcode() {
    wx.canvasToTempFilePath({
      canvasId: 'paynowQrcode',
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            this.setData({
              qrcodeSaved: true
            })
            wx.showToast({
              title: '已保存',
              icon: 'success'
            })
          },
          fail: (err) => {
            console.error(err)
            wx.showModal({
              title: '保存失败',
              content: '请在设置中允许访问您的相册',
              showCancel: false
            })
          }
        })
      },
      fail: (err) => {
        console.error('Failed to generate image:', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const cart: CartItem[] = wx.getStorageSync('cart') || [];
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const paynow = new PaynowQR({
      mobile: '+6596463268',        // or use 'mobile' or 'nric'
      amount: 99.00,
      refNumber: 'ORDER1001',
      editable: false,
      company: 'MyName'
    });

    const payload = paynow.output(); // EMV string to encode

    // draw QR code to canvas
    drawQrcode({
      width: 250,
      height: 250,
      foreground: '#86267a',
      canvasId: 'paynowQrcode',
      text: payload,
      image: {
        imageResource: '../../images/icon/paynow.png',
        dx: 90,
        dy: 102,
        dWidth: 70,
        dHeight: 47
      }
    });
    this.setData({
      cart,
      totalPrice: total,
      qrcodeSaved: false
    });
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