/**
 * 优惠券业务服务
 * 负责优惠券的创建、验证和状态管理
 */

import { COUPON_CODE_LENGTH, COUPON_CODE_CHARS } from '../utils/constants';
import { createCoupon, createValidationResult, CouponErrorType } from '../utils/types';
import { validateAmount, validateCouponCode } from '../utils/validators';
import StorageService from './StorageService';

class CouponService {
  constructor() {
    this.storageService = new StorageService();
  }

  /**
   * 生成6位唯一优惠券编码
   * @returns {string} 6位编码
   */
  generateCouponCode() {
    let code = '';
    for (let i = 0; i < COUPON_CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * COUPON_CODE_CHARS.length);
      code += COUPON_CODE_CHARS[randomIndex];
    }
    return code;
  }

  /**
   * 创建新优惠券
   * @param {number} amount - 优惠券金额
   * @returns {Promise<Object>} 创建的优惠券对象
   * @throws {Error} 当金额无效时抛出错误
   */
  async createCoupon(amount) {
    if (!validateAmount(amount)) {
      throw new Error('Invalid amount format');
    }

    // 生成唯一编码，确保不重复
    let code;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = this.generateCouponCode();
      attempts++;
      
      if (attempts > maxAttempts) {
        throw new Error('Failed to generate unique coupon code');
      }
    } while (await this.storageService.getCoupon(code));

    const coupon = createCoupon({
      id: code, // 使用编码作为ID
      code,
      amount: Number(amount),
      isUsed: false,
      createdAt: new Date()
    });

    return await this.storageService.saveCoupon(coupon);
  }

  /**
   * 验证优惠券编码
   * @param {string} code - 优惠券编码
   * @returns {Promise<Object>} 验证结果
   */
  async validateCoupon(code) {
    if (!validateCouponCode(code)) {
      return createValidationResult({
        isValid: false,
        message: '优惠券编码格式无效',
        canUse: false
      });
    }

    try {
      const coupon = await this.storageService.getCoupon(code);
      
      if (!coupon) {
        return createValidationResult({
          isValid: false,
          message: '优惠券不存在',
          canUse: false
        });
      }

      if (coupon.isUsed) {
        return createValidationResult({
          isValid: true,
          coupon,
          message: '优惠券已使用',
          canUse: false
        });
      }

      return createValidationResult({
        isValid: true,
        coupon,
        message: '优惠券有效',
        canUse: true
      });
    } catch (error) {
      return createValidationResult({
        isValid: false,
        message: '查询优惠券时发生错误',
        canUse: false
      });
    }
  }

  /**
   * 使用优惠券
   * @param {string} code - 优惠券编码
   * @returns {Promise<boolean>} 是否成功使用
   */
  async useCoupon(code) {
    try {
      const coupon = await this.storageService.getCoupon(code);
      
      if (!coupon) {
        throw new Error('Coupon not found');
      }

      if (coupon.isUsed) {
        throw new Error('Coupon already used');
      }

      const updatedCoupon = await this.storageService.updateCoupon(code, {
        ...coupon??{},
        isUsed: true,
        usedAt: new Date()
      });

      return !!updatedCoupon;
    } catch (error) {
      console.error('Error using coupon:', error);
      return false;
    }
  }

  /**
   * 获取所有优惠券
   * @returns {Promise<Array>} 优惠券列表
   */
  async getAllCoupons() {
    try {
      return await this.storageService.getAllCoupons();
    } catch (error) {
      console.error('Error getting all coupons:', error);
      return [];
    }
  }

  /**
   * 获取单个优惠券
   * @param {string} code - 优惠券编码
   * @returns {Promise<Object|null>} 优惠券对象或null
   */
  async getCoupon(code) {
    try {
      return await this.storageService.getCoupon(code);
    } catch (error) {
      console.error('Error getting coupon:', error);
      return null;
    }
  }
}

export default CouponService;