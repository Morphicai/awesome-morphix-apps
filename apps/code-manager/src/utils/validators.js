/**
 * 验证工具函数
 */

import { COUPON_CODE_LENGTH, COUPON_CODE_CHARS } from './constants';

/**
 * 验证优惠券金额格式
 * @param {string|number} amount - 金额
 * @returns {boolean} 是否有效
 */
export function validateAmount(amount) {
  const numAmount = Number(amount);
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 999999;
}

/**
 * 验证优惠券编码格式
 * @param {string} code - 优惠券编码
 * @returns {boolean} 是否有效
 */
export function validateCouponCode(code) {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  if (code.length !== COUPON_CODE_LENGTH) {
    return false;
  }
  
  // 检查是否只包含允许的字符
  for (let i = 0; i < code.length; i++) {
    if (!COUPON_CODE_CHARS.includes(code[i])) {
      return false;
    }
  }
  
  return true;
}

/**
 * 格式化金额显示
 * @param {number} amount - 金额
 * @returns {string} 格式化后的金额字符串
 */
export function formatAmount(amount) {
  return `¥${amount.toFixed(2)}`;
}

/**
 * 格式化日期显示
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date) {
  if (!date || !(date instanceof Date)) {
    return '';
  }
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 验证折扣值
 * @param {string|number} discount - 折扣值
 * @returns {boolean} 是否有效
 */
export function validateDiscount(discount) {
  const numDiscount = Number(discount);
  return !isNaN(numDiscount) && numDiscount > 0 && numDiscount <= 100;
}

/**
 * 验证备注长度
 * @param {string} note - 备注内容
 * @returns {boolean} 是否有效
 */
export function validateNote(note) {
  if (!note) return true; // 备注可选
  return typeof note === 'string' && note.length <= 200;
}

/**
 * 验证公司名称
 * @param {string} companyName - 公司名称
 * @returns {boolean} 是否有效
 */
export function validateCompanyName(companyName) {
  if (!companyName) return true; // 公司名称可选
  return typeof companyName === 'string' && companyName.length <= 50;
}

/**
 * 验证批量创建数量
 * @param {string|number} quantity - 数量
 * @returns {boolean} 是否有效
 */
export function validateQuantity(quantity) {
  const numQuantity = Number(quantity);
  return !isNaN(numQuantity) && numQuantity > 0 && numQuantity <= 100;
}

/**
 * 清理和标准化优惠券编码输入
 * @param {string} input - 用户输入
 * @returns {string} 清理后的编码
 */
export function sanitizeCouponCode(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // 转换为大写并移除空格和特殊字符
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}