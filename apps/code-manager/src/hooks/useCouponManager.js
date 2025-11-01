/**
 * 优惠券管理自定义Hook
 * 封装优惠券创建、查询、使用逻辑和状态管理
 */

import { useState, useCallback } from 'react';
import CouponService from '../services/CouponService';

const useCouponManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coupons, setCoupons] = useState({ created: [], received: [] });
  const [currentCoupon, setCurrentCoupon] = useState(null);

  // 创建优惠券服务实例
  const couponService = new CouponService();

  /**
   * 创建新优惠券
   * @param {Object} couponData - 优惠券数据对象
   * @returns {Promise<Object|null>} 创建的优惠券对象
   */
  const createCoupon = useCallback(async (couponData) => {
    setIsLoading(true);
    setError(null);

    try {
      const coupon = await couponService.createCoupon(couponData);
      setCurrentCoupon(coupon);

      // 更新优惠券列表
      setCoupons(prev => ({
        created: [coupon, ...prev.created],
        received: prev.received
      }));

      return coupon;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 验证优惠券
   * @param {string} code - 优惠券编码
   * @returns {Promise<Object|null>} 验证结果
   */
  const validateCoupon = useCallback(async (code) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await couponService.validateCoupon(code);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 使用优惠券
   * @param {string} code - 优惠券编码
   * @returns {Promise<boolean>} 是否成功使用
   */
  const useCoupon = useCallback(async (code) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await couponService.useCoupon(code);

      if (success) {
        // 更新本地状态中的优惠券
        setCoupons(prev => ({
          created: prev.created.map(coupon =>
            coupon.code === code
              ? { ...coupon, isUsed: true, usedAt: new Date() }
              : coupon
          ),
          received: prev.received.map(coupon =>
            coupon.code === code
              ? { ...coupon, isUsed: true, usedAt: new Date() }
              : coupon
          )
        }));
      }

      return success;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 获取单个优惠券
   * @param {string} code - 优惠券编码
   * @returns {Promise<Object|null>} 优惠券对象
   */
  const getCoupon = useCallback(async (code) => {
    setIsLoading(true);
    setError(null);

    try {
      const coupon = await couponService.getCoupon(code);
      return coupon;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 获取所有优惠券（分离的创建和收到）
   * @returns {Promise<Object>} { created: [], received: [] }
   */
  const getAllCoupons = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allCoupons = await couponService.getAllCoupons();
      setCoupons(allCoupons);
      return allCoupons;
    } catch (err) {
      setError(err.message);
      return { created: [], received: [] };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 清除错误状态
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 清除当前优惠券
   */
  const clearCurrentCoupon = useCallback(() => {
    setCurrentCoupon(null);
  }, []);

  return {
    // 状态
    isLoading,
    error,
    coupons,
    currentCoupon,

    // 操作方法
    createCoupon,
    validateCoupon,
    useCoupon,
    getCoupon,
    getAllCoupons,
    clearError,
    clearCurrentCoupon
  };
};

export default useCouponManager;