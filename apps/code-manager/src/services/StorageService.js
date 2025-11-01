/**
 * 云端存储服务
 * 基于AppSdk.appData实现优惠券数据的云端存储
 */

import AppSdk from '@morphixai/app-sdk';
import { STORAGE_COLLECTION_NAME, STORAGE_CREATED_COUPONS, STORAGE_RECEIVED_COUPONS } from '../utils/constants';

class StorageService {
  constructor() {
    this.legacyCollection = STORAGE_COLLECTION_NAME; // 旧的 collection
    this.createdCollection = STORAGE_CREATED_COUPONS;
    this.receivedCollection = STORAGE_RECEIVED_COUPONS;
    this.migrationKey = 'coupon_data_migrated'; // 迁移标记
  }

  /**
   * 保存我创建的优惠券到云端存储
   * @param {Object} coupon - 优惠券对象
   * @returns {Promise<Object>} 保存的优惠券对象
   */
  async saveCreatedCoupon(coupon) {
    try {
      const result = await AppSdk.appData.createData({
        collection: this.createdCollection,
        data: {
          id: coupon.code,
          ...coupon,
          createdAt: coupon.createdAt.toISOString(),
          usedAt: coupon.usedAt ? coupon.usedAt.toISOString() : null,
          expiryDate: coupon.expiryDate || null
        }
      });

      return this._deserializeCoupon(result);
    } catch (error) {
      console.error('Error saving created coupon:', error);
      throw new Error('Failed to save created coupon');
    }
  }

  /**
   * 保存我收到的优惠券到云端存储
   * @param {Object} coupon - 优惠券对象
   * @returns {Promise<Object>} 保存的优惠券对象
   */
  async saveReceivedCoupon(coupon) {
    try {
      const result = await AppSdk.appData.createData({
        collection: this.receivedCollection,
        data: {
          id: coupon.code,
          ...coupon,
          createdAt: coupon.createdAt.toISOString(),
          usedAt: coupon.usedAt ? coupon.usedAt.toISOString() : null,
          expiryDate: coupon.expiryDate || null,
          receivedAt: new Date().toISOString()
        }
      });

      return this._deserializeCoupon(result);
    } catch (error) {
      console.error('Error saving received coupon:', error);
      throw new Error('Failed to save received coupon');
    }
  }

  /**
   * 从云端存储获取优惠券（先查创建的，再查收到的，最后查旧数据）
   * @param {string} code - 优惠券编码
   * @returns {Promise<Object|null>} 优惠券对象或null，包含 source 字段标识来源
   */
  async getCoupon(code) {
    try {
      // 先查创建的
      let result = await AppSdk.appData.getData({
        collection: this.createdCollection,
        id: code
      });

      if (result) {
        const coupon = this._deserializeCoupon(result);
        coupon.source = 'created';
        return coupon;
      }

      // 再查收到的
      result = await AppSdk.appData.getData({
        collection: this.receivedCollection,
        id: code
      });

      if (result) {
        const coupon = this._deserializeCoupon(result);
        coupon.source = 'received';
        return coupon;
      }

      // 最后查旧的 collection（兼容旧数据）
      result = await AppSdk.appData.getData({
        collection: this.legacyCollection,
        id: code
      });

      if (result) {
        const coupon = this._deserializeCoupon(result);
        coupon.source = 'created'; // 旧数据默认视为创建的
        return coupon;
      }

      return null;
    } catch (error) {
      console.error('Error getting coupon:', error);
      return null;
    }
  }

  /**
   * 获取我创建的优惠券
   * @returns {Promise<Array>} 优惠券列表
   */
  async getCreatedCoupons() {
    try {
      const result = await AppSdk.appData.queryData({
        collection: this.createdCollection,
        query: []
      });
      return result.map(record => {
        const coupon = this._deserializeCoupon(record);
        coupon.source = 'created';
        return coupon;
      });
    } catch (error) {
      console.error('Error getting created coupons:', error);
      return [];
    }
  }

  /**
   * 获取我收到的优惠券
   * @returns {Promise<Array>} 优惠券列表
   */
  async getReceivedCoupons() {
    try {
      const result = await AppSdk.appData.queryData({
        collection: this.receivedCollection,
        query: []
      });
      return result.map(record => {
        const coupon = this._deserializeCoupon(record);
        coupon.source = 'received';
        return coupon;
      });
    } catch (error) {
      console.error('Error getting received coupons:', error);
      return [];
    }
  }

  /**
   * 获取所有优惠券（创建的 + 收到的）
   * 首次调用时会自动迁移旧数据
   * @returns {Promise<Object>} { created: [], received: [] }
   */
  async getAllCoupons() {
    try {
      // 检查是否需要迁移数据
      await this._migrateDataIfNeeded();

      const [created, received] = await Promise.all([
        this.getCreatedCoupons(),
        this.getReceivedCoupons()
      ]);
      return { created, received };
    } catch (error) {
      console.error('Error getting all coupons:', error);
      return { created: [], received: [] };
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
      // 先获取现有数据，确定来源
      const existingCoupon = await this.getCoupon(code);
      if (!existingCoupon) {
        return null;
      }

      const collection = existingCoupon.source === 'created'
        ? this.createdCollection
        : this.receivedCollection;

      // 准备更新数据（序列化日期）
      const updateData = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value instanceof Date) {
          updateData[key] = value.toISOString();
        } else {
          updateData[key] = value;
        }
      }

      // 执行更新
      await AppSdk.appData.updateData({
        collection,
        id: code,
        data: updateData
      });

      // 更新后重新获取完整数据
      const updatedCoupon = await this.getCoupon(code);
      return updatedCoupon;
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
      // 先确定优惠券来源
      const coupon = await this.getCoupon(code);
      if (!coupon) {
        return false;
      }

      const collection = coupon.source === 'created'
        ? this.createdCollection
        : this.receivedCollection;

      const result = await AppSdk.appData.deleteData({
        collection,
        id: code
      });
      return result.success;
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
      usedAt: data.usedAt ? new Date(data.usedAt) : null,
      expiryDate: data.expiryDate || null,
      receivedAt: data.receivedAt ? new Date(data.receivedAt) : null
    };
  }

  /**
   * 检查并迁移旧数据（如果需要）
   * 将旧 collection 中的数据迁移到新的 created_coupons collection
   * @private
   */
  async _migrateDataIfNeeded() {
    try {
      // 检查是否已经迁移过
      const migrated = localStorage.getItem(this.migrationKey);
      if (migrated === 'true') {
        return; // 已经迁移过，跳过
      }

      console.log('开始检查旧数据迁移...');

      // 查询旧 collection 中的所有数据
      const legacyData = await AppSdk.appData.queryData({
        collection: this.legacyCollection,
        query: []
      });

      if (!legacyData || legacyData.length === 0) {
        console.log('没有发现旧数据，标记迁移完成');
        localStorage.setItem(this.migrationKey, 'true');
        return;
      }

      console.log(`发现 ${legacyData.length} 条旧数据，开始迁移...`);

      // 迁移每条数据到新的 created_coupons collection
      let successCount = 0;
      let failCount = 0;

      for (const oldCoupon of legacyData) {
        try {
          // 检查新 collection 中是否已存在
          const exists = await AppSdk.appData.getData({
            collection: this.createdCollection,
            id: oldCoupon.code || oldCoupon.id
          });

          if (!exists) {
            // 不存在则迁移
            await AppSdk.appData.createData({
              collection: this.createdCollection,
              data: {
                ...oldCoupon,
                id: oldCoupon.code || oldCoupon.id
              }
            });
            successCount++;
          } else {
            console.log(`优惠券 ${oldCoupon.code} 已存在，跳过迁移`);
          }
        } catch (error) {
          console.error(`迁移优惠券 ${oldCoupon.code} 失败:`, error);
          failCount++;
        }
      }

      console.log(`数据迁移完成: 成功 ${successCount} 条, 失败 ${failCount} 条`);

      // 标记迁移完成
      localStorage.setItem(this.migrationKey, 'true');

      // 可选：删除旧数据（谨慎操作，建议先保留一段时间）
      // await this._cleanupLegacyData(legacyData);

    } catch (error) {
      console.error('数据迁移过程出错:', error);
      // 不抛出错误，避免影响正常功能
    }
  }

  /**
   * 清理旧数据（可选，谨慎使用）
   * @param {Array} legacyData - 旧数据列表
   * @private
   */
  async _cleanupLegacyData(legacyData) {
    console.log('开始清理旧数据...');
    for (const oldCoupon of legacyData) {
      try {
        await AppSdk.appData.deleteData({
          collection: this.legacyCollection,
          id: oldCoupon.code || oldCoupon.id
        });
      } catch (error) {
        console.error(`删除旧数据 ${oldCoupon.code} 失败:`, error);
      }
    }
    console.log('旧数据清理完成');
  }

  /**
   * 手动触发数据迁移（用于测试或强制重新迁移）
   * @returns {Promise<void>}
   */
  async forceMigration() {
    localStorage.removeItem(this.migrationKey);
    await this._migrateDataIfNeeded();
  }
}

export default StorageService;