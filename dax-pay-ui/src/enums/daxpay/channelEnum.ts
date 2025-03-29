/**
 * 支付通道
 */
export enum ChannelEnum {
  ALI = 'ali_pay',
  ALI_ISV = 'alipay_isv',
  WECHAT = 'wechat_pay',
  WECHAT_ISV = 'wechat_pay_isv',
  UNION_PAY = 'union_pay',
}

/**
 * 支付方式
 */
export enum PayMethodEnum {
  WAP = 'wap',
  APP = 'app',
  WEB = 'web',
  QRCODE = 'qrcode',
  BARCODE = 'barcode',
  JSAPI = 'jsapi',
}

/**
 * 交易类型
 */
export enum TradeTypeEnum {
  /**
   * 支付
   */
  PAY = 'pay',
  /**
   * 退款
   */
  REFUND = 'refund',
  /**
   * 转账
   */
  TRANSFER = 'transfer',
}

/**
 * 客户通知内容类型
 */
export enum NotifyContentTypeEnum {
  /** 支付订单变动通知 */
  PAY = 'PAY',

  /** 退款订单变动通知 */
  REFUND = 'refund',

  /** 支付订单变动通知 */
  TRANSFER = 'transfer',
}

/**
 * 通道认证状态
 */
export enum ChannelAuthStatusEnum {
  /** 获取中 */
  WAITING = 'waiting',
  /** 获取成功 */
  SUCCESS = 'success',
  /** 数据不存在 */
  NOT_EXIST = 'not_exist',
}

/**
 * 收银台类型
 */
export enum CheckoutTypeEnum {
  H5 = 'h5',
  PC = 'pc',
  MINI_APP = 'mini_app',
  AGGREGATE = 'aggregate',
}

/**
 * 支付调起类型
 */
export enum CheckoutCallTypeEnum {
  /** 扫码支付 */
  QR_CODE = 'qr_code',
  /** 条码支付 */
  BAR_CODE = 'bar_code',
  /** 跳转链接 */
  LINK = 'link',
  /** 小程序 */
  MINI_APP = 'mini_app',
  /** APP支付 */
  APP = 'app',
  /** JSAPI */
  JSAPI = 'jsapi',
  /** 表单方式 */
  FROM = 'from',
}
