import { IAppOption } from "../../../typings";
import { Order } from "../../types/types";
const drawQrcode = require('../../utils/weapp.qrcode.esm.js');
const PaynowQR = require('../../utils/paynow-qr.js');
const app = getApp<IAppOption>();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: {} as Order,
    paid: false
  },

  confirmPayment() {
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/setting/index'
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
    const order = app.globalData.selectedOrder;
    const paid = order?.status === 'CONFIRMED' || order?.status === 'DELIVERED';
    this.setData({
      order: order,
      paid: paid
    });
    if (!paid) {
      const total = order?.total_price;
      const invoice = order?.invoice;
      const paynow = new PaynowQR({
        mobile: '+6596463268',
        amount: total,
        refNumber: invoice,
        editable: false,
        company: 'MyName'
      });

      const payload = paynow.output();

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