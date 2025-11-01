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
   * @param {Object} couponData - 优惠券数据
   * @returns {Promise<Object>} 创建的优惠券对象
   * @throws {Error} 当数据无效时抛出错误
   */
  async createCoupon(couponData) {
    const { type = 'amount', amount, discount, note = '', companyName = '', expiryDate } = couponData;

    // 验证金额或折扣
    if (type === 'amount' && !validateAmount(amount)) {
      throw new Error('Invalid amount format');
    }

    if (type === 'discount' && !validateAmount(discount)) {
      throw new Error('Invalid discount format');
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
      id: code,
      code,
      type,
      amount: type === 'amount' ? Number(amount) : 0,
      discount: type === 'discount' ? Number(discount) : null,
      note,
      companyName,
      expiryDate,
      isUsed: false,
      createdAt: new Date()
    });

    return await this.storageService.saveCreatedCoupon(coupon);
  }

  /**
   * 批量创建优惠券
   * @param {Object} couponData - 优惠券数据
   * @param {number} quantity - 创建数量
   * @returns {Promise<Array>} 创建的优惠券数组
   */
  async createBatchCoupons(couponData, quantity) {
    const coupons = [];

    for (let i = 0; i < quantity; i++) {
      try {
        const coupon = await this.createCoupon(couponData);
        coupons.push(coupon);
      } catch (error) {
        console.error(`Failed to create coupon ${i + 1}:`, error);
        // 继续创建其他优惠券
      }
    }

    return coupons;
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
        ...coupon ?? {},
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
   * 获取所有优惠券（分离的创建和收到）
   * @returns {Promise<Object>} { created: [], received: [] }
   */
  async getAllCoupons() {
    try {
      return await this.storageService.getAllCoupons();
    } catch (error) {
      console.error('Error getting all coupons:', error);
      return { created: [], received: [] };
    }
  }

  /**
   * 领取优惠券（保存到收到的列表）
   * @param {string} code - 优惠券编码
   * @returns {Promise<Object|null>} 领取的优惠券对象
   */
  async receiveCoupon(code) {
    try {
      // 检查是否已经在"我收到的"列表中
      const receivedCoupon = await this.storageService.getReceivedCoupon(code);
      if (receivedCoupon) {
        // 已经领取过了
        return receivedCoupon;
      }

      // 检查是否是自己创建的
      const createdCoupon = await this.storageService.getCreatedCoupon(code);
      if (createdCoupon) {
        // 不能领取自己创建的优惠券
        throw new Error('Cannot receive your own coupon');
      }

      // 创建一个基础的优惠券对象（只有 code）
      // 注意：由于无法跨用户访问数据，这里只能保存 code
      // 实际的优惠券信息需要在验证时从创建者那里获取
      const newCoupon = createCoupon({
        id: code,
        code,
        type: 'amount',
        amount: 0,
        discount: null,
        note: '待验证',
        companyName: '',
        expiryDate: null,
        isUsed: false,
        createdAt: new Date()
      });

      // 保存到收到的列表
      return await this.storageService.saveReceivedCoupon(newCoupon);
    } catch (error) {
      console.error('Error receiving coupon:', error);
      throw error;
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