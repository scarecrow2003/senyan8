import { IAppOption } from "../../../typings";
import { Order } from "../../types/types";
const config = require('../../utils/config');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orders: [] as Order[],
    isAdmin: false,
    aggregate: []
  },

  downloadInvoice(e: WechatMiniprogram.BaseEvent) {
    let that = this;
    wx.showLoading({ title: '加载中' });
    const id: string = e.currentTarget.dataset.id;
    let orders = this.data.orders;
    let index = this.data.orders.findIndex(order => order.id === id);
    let order = this.data.orders[index];
    if (!order.invoice_url) {
      wx.request({
        url: config.API_URL,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          action: 'generate_invoice',
          id: id
        },
        success(res) {
          if (res.statusCode == 200) {
            orders[index].invoice_url = res.data.url;
            that.setData({
              orders: orders
            });
            that.openInvoice(res.data.url);
          } else {
            wx.hideLoading();
            wx.showToast({ title: '下载失败', icon: 'none' })
          }
        },
        fail(res) {
          wx.hideLoading();
          wx.showToast({ title: '下载失败', icon: 'none' })
        }
      })
    } else {
      this.openInvoice(order.invoice_url);
    }
  },

  openInvoice(url) {
    wx.downloadFile({
      url: url,
      success(res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          fileType: 'xlsx',
          success: function () {
            wx.hideLoading();
            console.log('Document opened successfully')
          },
          fail: function () {
            wx.hideLoading();
            wx.showToast({ title: '无法打开文件', icon: 'none' })
          }
        })
      },
      fail() {
        wx.hideLoading();
        wx.showToast({ title: '下载失败', icon: 'none' })
      }
    })
  },

  confirmOrder(e: WechatMiniprogram.BaseEvent) {
    let that = this;
    wx.showLoading({ title: '加载中' })
    const id: string = e.currentTarget.dataset.id;
    wx.request({
      url: config.API_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        action: 'confirm_order',
        id: id
      },
      success(res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          let orders = that.data.orders;
          let index = orders.findIndex(order => order.id === id);
          if (index != -1) {
            orders[index].status = 'CONFIRMED';
            that.setData({
              orders: orders
            })
          }
        }
      },
      fail(res) {
        wx.hideLoading();
        console.error(err);
      }
    })
  },

  fetchOrders(openid, role, phone) {
    wx.showLoading({ title: '加载中' });
    let that = this;
    let url = `${config.API_URL}?action=get_orders&user_id=${openid}`;
    if (role === 'admin') {
      url += `&role=admin&phone=${encodeURIComponent(phone)}`;
    }
    wx.request({
      url: url,
      method: 'GET',
      header: {
          'Content-Type': 'application/json'
      },
      success: function(res) {
        wx.hideLoading();
        let orders: Order[] = res.data;
        let isAdmin = role === 'admin';
        let aggregateMap = new Map();
        if (isAdmin) {
          let nameMap = new Map();
          let countMap = new Map();
          orders.forEach(order => {
            order.items.forEach(item => {
              nameMap.set(item.id, item.name);
              let currentValue = countMap.get(item.id);
              if (currentValue) {
                countMap.set(item.id, currentValue + item.quantity);
              } else {
                countMap.set(item.id, item.quantity);
              }
            })
          });
          for (const [key, value] of countMap.entries()) {
            aggregateMap.set(nameMap.get(key), value);
          }
        }
        that.setData({
          orders: orders,
          isAdmin: isAdmin,
          aggregate: Array.from(aggregateMap, ([key, value]) => ({ name: key, quantity: value}))
        });
      },
      fail: function(err) {
        wx.hideLoading();
        console.error(err);
      }
    })
  },

  goToOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    const selectedOrder = this.data.orders.find((order) => order.id === orderId);
    const app = getApp<IAppOption>();
    app.globalData.selectedOrder = selectedOrder;
    wx.navigateTo({
      url: `/pages/orders/order-detail`
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    if (userInfo.openid) {
      this.fetchOrders(userInfo.openid, userInfo.role, userInfo.phone);
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