/**
 * 图片生成服务
 * 基于Canvas实现优惠券图片生成和AppSdk.fileSystem.saveImageToAlbum保存功能
 */

import AppSdk from '@morphixai/app-sdk';
import { createCouponImageConfig, CouponErrorType, createCouponError } from '../utils/types';

class ImageService {
  constructor() {
    // 默认图片配置
    this.defaultConfig = createCouponImageConfig();
  }

  /**
   * 生成优惠券图片
   * @param {Object} coupon - 优惠券对象
   * @param {Object} config - 可选的图片配置
   * @returns {Promise<string>} Base64编码的图片数据
   */
  async generateCouponImage(coupon, config = {}) {
    try {
      const imageConfig = { ...this.defaultConfig, ...config };
      
      // 创建Canvas元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 设置画布尺寸
      canvas.width = imageConfig.width;
      canvas.height = imageConfig.height;
      
      // 绘制背景渐变
      this._drawBackground(ctx, imageConfig);
      
      // 绘制优惠券内容
      this._drawCouponContent(ctx, coupon, imageConfig);
      
      // 转换为Base64
      const base64Data = canvas.toDataURL('image/png');
      
      return base64Data;
    } catch (error) {
      console.error('Error generating coupon image:', error);
      throw createCouponError({
        type: CouponErrorType.IMAGE_GENERATION_ERROR,
        message: 'Failed to generate coupon image',
        details: error
      });
    }
  }

  /**
   * 保存图片到设备相册
   * @param {string} base64Data - Base64编码的图片数据
   * @param {string} filename - 可选的文件名
   * @returns {Promise<Object>} 保存结果
   */
  async saveImageToAlbum(base64Data, filename) {
    try {
      // 提取纯Base64数据（去除data:image/png;base64,前缀）
      const pureBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // 生成文件名（如果未提供）
      const finalFilename = filename || `coupon_${Date.now()}.png`;
      
      // 调用AppSdk保存到相册
      const result = await AppSdk.fileSystem.saveImageToAlbum({
        base64Data: pureBase64,
        filename: finalFilename
      });
      
      return {
        success: result.success,
        filename: finalFilename,
        error: result.error || null
      };
    } catch (error) {
      console.error('Error saving image to album:', error);
      return {
        success: false,
        filename: filename || null,
        error: error.message || 'Failed to save image'
      };
    }
  }

  /**
   * 生成并保存优惠券图片到相册
   * @param {Object} coupon - 优惠券对象
   * @param {Object} config - 可选的图片配置
   * @returns {Promise<Object>} 生成和保存结果
   */
  async generateAndSaveImage(coupon, config = {}) {
    try {
      // 生成图片
      const base64Data = await this.generateCouponImage(coupon, config);
      
      // 生成文件名
      const filename = `coupon_${coupon.code}_${Date.now()}.png`;
      
      // 保存到相册
      const saveResult = await this.saveImageToAlbum(base64Data, filename);
      
      return {
        success: saveResult.success,
        base64Data: saveResult.success ? base64Data : null,
        filename: saveResult.filename,
        error: saveResult.error
      };
    } catch (error) {
      console.error('Error generating and saving image:', error);
      return {
        success: false,
        base64Data: null,
        filename: null,
        error: error.message || 'Failed to generate and save image'
      };
    }
  }

  /**
   * 绘制背景渐变
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} config - 图片配置
   * @private
   */
  _drawBackground(ctx, config) {
    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, config.width, config.height);
    gradient.addColorStop(0, '#4F46E5'); // 蓝紫色
    gradient.addColorStop(1, '#7C3AED'); // 紫色
    
    // 填充背景
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.width, config.height);
    
    // 添加圆角效果（通过绘制圆角矩形）
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    this._drawRoundedRect(ctx, 0, 0, config.width, config.height, 12);
    ctx.restore();
  }

  /**
   * 绘制优惠券内容
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} coupon - 优惠券对象
   * @param {Object} config - 图片配置
   * @private
   */
  _drawCouponContent(ctx, coupon, config) {
    ctx.fillStyle = config.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    
    // 绘制"优惠券"标题
    ctx.font = `${config.fontSize.label}px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`;
    ctx.fillText('优惠券', centerX, centerY - 50);
    
    // 绘制金额
    ctx.font = `bold ${config.fontSize.amount}px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`;
    ctx.fillText(`¥${coupon.amount}`, centerX, centerY - 10);
    
    // 绘制编码标签
    ctx.font = `${config.fontSize.label}px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`;
    ctx.fillText('优惠券编码', centerX, centerY + 25);
    
    // 绘制编码
    ctx.font = `${config.fontSize.code}px 'Courier New', monospace`;
    ctx.fillText(coupon.code, centerX, centerY + 50);
    
    // 如果已使用，添加水印
    if (coupon.isUsed) {
      this._drawUsedWatermark(ctx, config);
    }
  }

  /**
   * 绘制"已使用"水印
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} config - 图片配置
   * @private
   */
  _drawUsedWatermark(ctx, config) {
    ctx.save();
    
    // 设置半透明红色
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.strokeStyle = 'rgba(239, 68, 68, 1)';
    ctx.lineWidth = 2;
    
    // 旋转画布
    ctx.translate(config.width / 2, config.height / 2);
    ctx.rotate(-Math.PI / 6); // -30度
    
    // 绘制水印文字
    ctx.font = `bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 绘制文字描边和填充
    ctx.strokeText('已使用', 0, 0);
    ctx.fillText('已使用', 0, 0);
    
    ctx.restore();
  }

  /**
   * 绘制圆角矩形
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {number} radius - 圆角半径
   * @private
   */
  _drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 获取默认图片配置
   * @returns {Object} 默认配置对象
   */
  getDefaultConfig() {
    return { ...this.defaultConfig };
  }

  /**
   * 更新默认图片配置
   * @param {Object} newConfig - 新的配置
   */
  updateDefaultConfig(newConfig) {
    this.defaultConfig = { ...this.defaultConfig, ...newConfig };
  }
}

export default ImageService;