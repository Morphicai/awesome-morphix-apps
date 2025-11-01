/**
 * 云端存储服务
 * 基于AppSdk.appData实现优惠券数据的云端存储
 */

import { STORAGE_COLLECTION_NAME } from '../utils/constants';

class StorageService {
  constructor() {
    this.collectionName = STORAGE_COLLECTION_NAME;
  }

  /**
   * 保存优惠券到云端存储
   * @param {Object} coupon - 优惠券对象
   * @returns {Promise<Object>} 保存的优惠券对象
   */
  async saveCoupon(coupon) {
    try {
      // 使用优惠券编码作为记录ID
      const result = await AppSdk.appData.setRecord(
        this.collectionName,
        coupon.code,
        {
          ...coupon,
          // 确保日期对象被正确序列化
          createdAt: coupon.createdAt.toISOString(),
          usedAt: coupon.usedAt ? coupon.usedAt.toISOString() : null
        }
      );
      
      return this._deserializeCoupon(result);
    } catch (error) {
      console.error('Error saving coupon:', error);
      throw new Error('Failed to save coupon');
    }
  }

  /**
   * 从云端存储获取优惠券
   * @param {string} code - 优惠券编码
   * @returns {Promise<Object|null>} 优惠券对象或null
   */
  async getCoupon(code) {
    try {
      const result = await AppSdk.appData.getRecord(this.collectionName, code);
      return result ? this._deserializeCoupon(result) : null;
    } catch (error) {
      console.error('Error getting coupon:', error);
      return null;
    }
  }

  /**
   * 获取所有优惠券
   * @returns {Promise<Array>} 优惠券列表
   */
  async getAllCoupons() {
    try {
      const result = await AppSdk.appData.getRecords(this.collectionName);
      return result.map(record => this._deserializeCoupon(record));
    } catch (error) {
      console.error('Error getting all coupons:', error);
      return [];
    }
  }

  /**
   * 更新优惠券
   * @param {string} code - 优惠券编码
   * @param {Object} updates - 更新数据
   * @returns {Promise<Object|null>} 更新后的优惠券对象
   */
  async updateCoupon(code, updates) {
    try {
      const existingCoupon = await this.getCoupon(code);
      if (!existingCoupon) {
        return null;
      }

      const updatedCoupon = {
        ...existingCoupon,
        ...updates
      };

      // 如果更新包含日期，确保正确序列化
      const serializedUpdates = {
        ...updatedCoupon,
        createdAt: updatedCoupon.createdAt.toISOString(),
        usedAt: updatedCoupon.usedAt ? updatedCoupon.usedAt.toISOString() : null
      };

      const result = await AppSdk.appData.setRecord(
        this.collectionName,
        code,
        serializedUpdates
      );

      return this._deserializeCoupon(result);
    } catch (error) {
      console.error('Error updating coupon:', error);
      return null;
    }
  }

  /**
   * 删除优惠券
   * @param {string} code - 优惠券编码
   * @returns {Promise<boolean>} 是否成功删除
   */
  async deleteCoupon(code) {
    try {
      await AppSdk.appData.deleteRecord(this.collectionName, code);
      return true;
    } catch (error) {
      console.error('Error deleting coupon:', error);
      return false;
    }
  }

  /**
   * 反序列化优惠券数据（将字符串日期转换为Date对象）
   * @param {Object} data - 序列化的优惠券数据
   * @returns {Object} 反序列化的优惠券对象
   * @private
   */
  _deserializeCoupon(data) {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      usedAt: data.usedAt ? new Date(data.usedAt) : null
    };
  }
}

export default StorageService;