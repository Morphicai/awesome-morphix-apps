/**
 * 应用常量定义
 */

// 优惠券编码相关常量
export const COUPON_CODE_LENGTH = 6;
export const COUPON_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// 优惠券类型
export const COUPON_TYPES = {
  AMOUNT: 'amount',      // 金额券
  DISCOUNT: 'discount'   // 折扣券
};

// 存储相关常量
export const STORAGE_COLLECTION_NAME = 'coupons';

// 图片生成相关常量
export const DEFAULT_IMAGE_CONFIG = {
  width: 400,
  height: 280,
  backgroundColor: '#DC2626',
  textColor: '#FFFFFF',
  fontSize: {
    amount: 32,
    code: 20,
    label: 16
  },
  padding: 20
};

// 验证消息常量
export const VALIDATION_MESSAGES = {
  COUPON_NOT_FOUND: '优惠券不存在',
  COUPON_ALREADY_USED: '优惠券已使用',
  COUPON_VALID: '优惠券有效',
  INVALID_CODE_FORMAT: '优惠券编码格式无效',
  INVALID_AMOUNT: '金额格式无效'
};

// 成功消息常量
export const SUCCESS_MESSAGES = {
  COUPON_CREATED: '优惠券创建成功',
  COUPON_USED: '验券成功',
  IMAGE_SAVED: '图片保存成功'
};

// 错误消息常量
export const ERROR_MESSAGES = {
  STORAGE_ERROR: '存储操作失败',
  IMAGE_GENERATION_ERROR: '图片生成失败',
  NETWORK_ERROR: '网络连接失败'
};