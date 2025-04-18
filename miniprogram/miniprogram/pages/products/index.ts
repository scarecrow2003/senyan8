import { Product, CartItem } from '../../types/types';
const config = require('../../utils/config');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    displayItems: [] as CartItem[],
    loading: false,
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
    this.getProducts();
  },

  getProducts: function() {
    let that = this;
    let cartItems: CartItem[] = wx.getStorageSync('cart') || [];
    wx.request({
      url: `${config.API_URL}?action=get_products`,
      method: 'GET',
      header: {
          'Content-Type': 'application/json'
      },
      success: function(res) {
        let products: Product[] = res.data;
        const displayItems = products.map(product => {
          const cartItem = cartItems.find(item => item.id === product.id);
          return {
            ...product,
            quantity: cartItem ? cartItem.quantity : 0
          };
        });
        that.setData({
          displayItems: displayItems
        })
      },
      fail: function(err) {
          console.error(err);
      }
  })
    //  util.request(url).then((res: { data: { products: any; }; }) => {
    //         this.setData({
    //             product: res.data
    //         });
    //     });
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

  },

  addToCart(e: WechatMiniprogram.BaseEvent) {
    const id: string = e.currentTarget.dataset.id;
    const displayItems = [...this.data.displayItems];
    const index = displayItems.findIndex(product => product.id === id);
    if (index != -1) {
      displayItems[index].quantity += 1;
      this.updateCart(displayItems);
    }

    wx.showToast({
      title: 'Added',
      icon: 'success'
    });
  },

  updateCart(displayItems: CartItem[]) {
    let cart: CartItem[] = displayItems.filter(item => item.quantity > 0);
    wx.setStorageSync('cart', cart);
    this.setData({
      displayItems
    });
  },

  increaseQty(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id;
    const displayItems = [...this.data.displayItems];
    const index = displayItems.findIndex(item => item.id === id);
    if (index !== -1) {
      displayItems[index].quantity += 1;
      this.updateCart(displayItems);
    }
  },

  decreaseQty(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id;
    const displayItems = [...this.data.displayItems];
    const index = displayItems.findIndex(item => item.id === id);
    if (index !== -1) {
      if (displayItems[index].quantity > 0) {
        displayItems[index].quantity -= 1;
      }
      this.updateCart(displayItems);
    }
  },

  goToCart() {
    const itemSelected: boolean = this.data.displayItems.filter(item => item.quantity !== 0).length > 0;
    if (itemSelected) {
      wx.switchTab({
        url: '/pages/cart/index'
      });
    } else {
      wx.showToast({
        title: '未选择商品',
        icon: 'none',
        duration: 2000
      })
    }
  },
})