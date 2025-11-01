/**
 * 优惠券数据模型和类型定义
 * 基于需求文档中的数据结构定义
 */

/**
 * 优惠券错误类型枚举
 */
export const CouponErrorType = {
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  CODE_NOT_FOUND: 'CODE_NOT_FOUND',
  COUPON_ALREADY_USED: 'COUPON_ALREADY_USED',
  STORAGE_ERROR: 'STORAGE_ERROR',
  IMAGE_GENERATION_ERROR: 'IMAGE_GENERATION_ERROR'
};

/**
 * 优惠券状态枚举
 */
export const CouponStatus = {
  UNUSED: 'unused',
  USED: 'used'
};

/**
 * 优惠券类型枚举
 */
export const CouponType = {
  AMOUNT: 'amount',      // 金额券
  DISCOUNT: 'discount'   // 折扣券
};

/**
 * 创建优惠券对象
 * @param {Object} couponData - 优惠券数据
 * @param {string} couponData.id - 优惠券ID
 * @param {string} couponData.code - 6位唯一编码
 * @param {string} couponData.type - 优惠券类型 (amount/discount)
 * @param {number} couponData.amount - 优惠券金额
 * @param {number} [couponData.discount] - 折扣值 (0-100)
 * @param {string} [couponData.note] - 备注信息
 * @param {string} [couponData.companyName] - 公司名称
 * @param {boolean} couponData.isUsed - 使用状态
 * @param {Date} couponData.createdAt - 创建时间
 * @param {Date} [couponData.usedAt] - 使用时间
 * @returns {Object} 优惠券对象
 */
export function createCoupon({ 
  id, 
  code, 
  type = 'amount',
  amount, 
  discount = null,
  note = '',
  companyName = '',
  isUsed = false, 
  createdAt = new Date(), 
  usedAt = null 
}) {
  return {
    id,
    code,
    type,
    amount,
    discount,
    note,
    companyName,
    isUsed,
    createdAt,
    usedAt
  };
}

/**
 * 创建验证结果对象
 * @param {Object} resultData - 验证结果数据
 * @param {boolean} resultData.isValid - 是否有效
 * @param {Object} [resultData.coupon] - 优惠券对象
 * @param {string} resultData.message - 结果消息
 * @param {boolean} resultData.canUse - 是否可以使用
 * @returns {Object} 验证结果对象
 */
export function createValidationResult({ isValid, coupon = null, message, canUse = false }) {
  return {
    isValid,
    coupon,
    message,
    canUse
  };
}

/**
 * 创建优惠券错误对象
 * @param {Object} errorData - 错误数据
 * @param {string} errorData.type - 错误类型
 * @param {string} errorData.message - 错误消息
 * @param {*} [errorData.details] - 错误详情
 * @returns {Object} 错误对象
 */
export function createCouponError({ type, message, details = null }) {
  return {
    type,
    message,
    details
  };
}

/**
 * 创建优惠券图片配置对象
 * @param {Object} configData - 配置数据
 * @returns {Object} 图片配置对象
 */
export function createCouponImageConfig({
  width = 600,
  height = 420,
  backgroundColor = '#DC2626',
  textColor = '#FFFFFF',
  fontSize = {
    amount: 48,
    code: 28,
    label: 22
  },
  padding = 30
} = {}) {
  return {
    width,
    height,
    backgroundColor,
    textColor,
    fontSize,
    padding
  };
}

/**
 * 创建优惠券模板对象
 * @param {Object} templateData - 模板数据
 * @returns {Object} 模板对象
 */
export function createCouponTemplate({
  id,
  name,
  type,
  amount,
  discount = null,
  note = '',
  companyName = '',
  createdAt = new Date()
}) {
  return {
    id,
    name,
    type,
    amount,
    discount,
    note,
    companyName,
    createdAt
  };
}

/**
 * 验证优惠券对象结构
 * @param {Object} coupon - 优惠券对象
 * @returns {boolean} 是否有效
 */
export function isValidCoupon(coupon) {
  return coupon &&
    typeof coupon.id === 'string' &&
    typeof coupon.code === 'string' &&
    typeof coupon.type === 'string' &&
    typeof coupon.amount === 'number' &&
    typeof coupon.isUsed === 'boolean' &&
    coupon.createdAt instanceof Date &&
    coupon.code.length === 6;
}

/**
 * 验证验证结果对象结构
 * @param {Object} result - 验证结果对象
 * @returns {boolean} 是否有效
 */
export function isValidValidationResult(result) {
  return result &&
    typeof result.isValid === 'boolean' &&
    typeof result.message === 'string' &&
    typeof result.canUse === 'boolean';
}