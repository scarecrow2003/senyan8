import { Product, CartItem } from '../../types/types';
const config = require('../../utils/config');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [
      { url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80' },
      { url: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=800&q=80' }
    ],
    categories: [
      { id: 'all', name: '全部' },
      { id: 'birthday', name: '生日' },
      { id: 'love', name: '爱情' },
      { id: 'sympathy', name: '慰问' }
    ],
    displayItems: [] as CartItem[],
    filterItems: [] as CartItem[],
    selectedCategory: 'all',
    products: [
      { id: '001', name: '红玫瑰花束', price: 88, image: '/images/rose.jpg' },
      { id: '002', name: '百合花篮', price: 108, image: '/images/lily.jpg' }
    ]
  },

  onCategorySelect(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({
      selectedCategory: categoryId
    });
    if (categoryId === 'all') {
      this.setData({
        filterItems: this.data.displayItems
      });
    } else {
      const filtered = this.data.displayItems.filter(item => item.category === categoryId);
      this.setData({
        filterItems: filtered
      });
    }
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
    if (this.data.selectedCategory === 'all') {
      this.setData({
        displayItems: displayItems,
        filterItems: displayItems
      });
    } else {
      const filtered = displayItems.filter(item => item.category === this.data.selectedCategory);
      this.setData({
        displayItems: displayItems,
        filterItems: filtered
      });
    }
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
    this.getProducts();
    wx.hideLoading()
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
          displayItems: displayItems,
          filterItems: displayItems
        })
      },
      fail: function(err) {
          console.error(err);
      }
    })
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