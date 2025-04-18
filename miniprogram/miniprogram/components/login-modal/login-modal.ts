let url = 'https://7ottrlmonc.execute-api.ap-southeast-1.amazonaws.com/default/wechat-phone';
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Component({
  properties: {
    showModal: Boolean
  },
  data: {
    hasUserInfo: false,
    name: '',
    phone: '',
    openid: '',
    avatar: defaultAvatarUrl
  },
  methods: {
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const hasUserInfo: boolean = !!(this.data.name && this.data.phone && this.data.openid && (avatarUrl !== defaultAvatarUrl));
      this.setData({
        hasUserInfo: hasUserInfo,
        avatar: avatarUrl
      });
    },

    onInputChange(e: any) {
      const nickName = e.detail.value;
      const hasUserInfo: boolean = !!(nickName && this.data.phone && this.data.openid && (this.data.avatar !== defaultAvatarUrl));
      this.setData({
        hasUserInfo: hasUserInfo,
        name: nickName
      });
    },

    // getUserProfile() {
    //   wx.getUserProfile({
    //     desc: '用于完善会员资料',
    //     success: (res) => {
    //       this.setData({
    //         ...this.data,
    //         name: res.userInfo.nickName
    //       })
    //     },
    //     fail: (err) => {
    //       console.log('User denied permission', err);
    //     }
    //   });
    // },

    onGetPhone(e) {
      let that = this;
      if (e.detail.errMsg === 'getPhoneNumber:ok') {
        let { encryptedData, iv } = e.detail;
        wx.login({
          success(res) {
            const code = res.code;
            wx.request({
              url: url,
              method: 'POST',
              header: {
                'content-type': 'application/json'
              },
              data: {
                action: 'verify',
                code: code,
                encryptedData: encryptedData,
                iv: iv
              },
              success(res) {
                let { phone, openid } = res.data;
                const hasUserInfo: boolean = !!(that.data.name && phone && openid && (that.data.avatar !== defaultAvatarUrl));
                that.setData({
                  hasUserInfo: hasUserInfo,
                  phone: phone,
                  openid: openid
                })
              }
            });
          }
        });
      } else {
        console.warn('User denied phone number access');
      }
    },

    cancel() {
      this.triggerEvent('closemodal');
    },
  
    confirm() {
      if (this.data.name && this.data.phone && this.data.openid) {
        let that = this;
        wx.request({
          url: url,
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          data: {
            action: 'update_user',
            openid: this.data.openid,
            phone: this.data.phone,
            name: this.data.name
          },
          success(res) {
            const userInfo = { name: that.data.name, phone: that.data.phone, openid: that.data.openid, avatar: that.data.avatar };
            that.triggerEvent('setuserinfo', userInfo);
          },
          fail(res) {
            wx.showToast({
              title: '操作错误，请重试',
              icon: 'none',
              duration: 2000
            });
          }
        });
      } else {
        wx.showToast({
          title: '操作错误，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    },
  }
});