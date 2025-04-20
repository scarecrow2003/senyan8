/// <reference path="./types/index.d.ts" />

import { Address, Order } from "../miniprogram/types/types";

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    selectedOrder?: Order,
    selectedAddress?: Address
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}