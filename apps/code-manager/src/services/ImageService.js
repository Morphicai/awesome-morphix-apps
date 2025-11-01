/**
 * 图片生成服务
 * 基于Canvas实现优惠券图片生成和AppSdk.fileSystem.saveImageToAlbum保存功能
 */

import AppSdk from '@morphixai/app-sdk';
import QRCode from 'qrcode';
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

      // 创建高分辨率Canvas元素（2倍分辨率提高清晰度）
      const scale = 2;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 设置画布尺寸（使用2倍分辨率）
      canvas.width = imageConfig.width * scale;
      canvas.height = imageConfig.height * scale;

      // 缩放上下文以匹配高分辨率
      ctx.scale(scale, scale);

      // 启用抗锯齿和图像平滑
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 绘制背景渐变
      this._drawBackground(ctx, imageConfig);

      // 绘制优惠券内容（异步，因为包含二维码生成）
      await this._drawCouponContent(ctx, coupon, imageConfig);

      // 转换为Base64（使用最高质量）
      const base64Data = canvas.toDataURL('image/png', 1.0);

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
   * 绘制背景渐变（红包风格）
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} config - 图片配置
   * @private
   */
  _drawBackground(ctx, config) {
    // 创建红包风格的渐变背景
    const gradient = ctx.createLinearGradient(0, 0, config.width, config.height);
    gradient.addColorStop(0, '#DC2626'); // 深红色
    gradient.addColorStop(0.5, '#EF4444'); // 红色
    gradient.addColorStop(1, '#F87171'); // 浅红色

    // 填充背景
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.width, config.height);

    // 添加装饰性图案（红包纹理）
    this._drawRedEnvelopePattern(ctx, config);

    // 添加圆角效果
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    this._drawRoundedRect(ctx, 0, 0, config.width, config.height, 24);
    ctx.restore();
  }

  /**
   * 绘制红包装饰图案
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} config - 图片配置
   * @private
   */
  _drawRedEnvelopePattern(ctx, config) {
    ctx.save();

    // 绘制半透明的装饰圆圈
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';

    // 左上角大圆
    ctx.beginPath();
    ctx.arc(-30, -30, 120, 0, Math.PI * 2);
    ctx.fill();

    // 右下角大圆
    ctx.beginPath();
    ctx.arc(config.width + 30, config.height + 30, 120, 0, Math.PI * 2);
    ctx.fill();

    // 中间装饰圆
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.arc(config.width / 2, config.height / 2, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * 绘制优惠券内容（优化布局）
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} coupon - 优惠券对象
   * @param {Object} config - 图片配置
   * @returns {Promise<void>}
   * @private
   */
  async _drawCouponContent(ctx, coupon, config) {
    const centerX = config.width / 2;
    const padding = 40;

    // === 主内容（居中显示） ===
    ctx.fillStyle = config.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // 计算起始Y位置，让内容整体居中
    let contentHeight = 0;

    // 计算总高度
    if (coupon.companyName) contentHeight += 50;
    contentHeight += 45; // "优惠券"标题
    contentHeight += 90; // 金额/折扣
    if (coupon.note) {
      const lines = this._wrapText(ctx, coupon.note, config.width - padding * 2);
      contentHeight += lines.length * 28 + 20;
    }
    contentHeight += 50; // 编码
    if (coupon.expiryDate) contentHeight += 35; // 有效期

    // 从垂直居中位置开始
    let currentY = (config.height - contentHeight) / 2;
    currentY = Math.max(50, currentY); // 最小上边距

    // 公司名称（如果有）
    if (coupon.companyName) {
      ctx.font = `600 ${config.fontSize.label + 6}px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`;
      ctx.fillText(coupon.companyName, centerX, currentY);
      currentY += 50;
    }

    // "优惠券"标题
    ctx.font = `${config.fontSize.label}px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText('优惠券', centerX, currentY);
    currentY += 45;

    // 金额或折扣（大字显示）
    ctx.fillStyle = config.textColor;
    ctx.font = `bold ${config.fontSize.amount + 20}px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`;
    if (coupon.type === 'discount') {
      ctx.fillText(`${coupon.discount}折`, centerX, currentY);
    } else {
      ctx.fillText(`¥${coupon.amount}`, centerX, currentY);
    }
    currentY += 90;

    // 备注（如果有）
    if (coupon.note) {
      ctx.font = `${config.fontSize.label - 1}px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';

      // 处理长文本换行，限制宽度避免与二维码重叠
      const maxWidth = config.width - padding * 2 - 100; // 留出二维码空间
      const lines = this._wrapText(ctx, coupon.note, maxWidth);

      lines.forEach((line, index) => {
        ctx.fillText(line, centerX, currentY + (index * 28));
      });

      currentY += lines.length * 28 + 20;
    }

    // 编码文字
    ctx.font = `bold ${config.fontSize.label + 4}px 'Courier New', monospace`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(coupon.code, centerX, currentY);
    currentY += 50;

    // 有效期（如果有）
    if (coupon.expiryDate) {
      ctx.font = `${config.fontSize.label - 3}px -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.fillText(`有效期至：${coupon.expiryDate}`, centerX, currentY);
    }

    // === 二维码（右下角，在50%基础上放大10%） ===
    const originalQrSize = 160;
    const qrSize = originalQrSize * 0.65; // 50% * 1.1 = 55%
    const qrPadding = 40;
    const qrX = config.width - qrSize - qrPadding;
    const qrY = config.height - qrSize - qrPadding;

    await this._drawQRCode(ctx, coupon.code, qrX + qrSize / 2, qrY, qrSize);

    // 如果已使用，添加水印
    if (coupon.isUsed) {
      this._drawUsedWatermark(ctx, config);
    }
  }

  /**
   * 生成二维码 URL
   * @param {string} code - 优惠券编码
   * @returns {Promise<string>} 二维码 URL
   * @private
   */
  async _generateQRCodeUrl(code) {
    try {
      // 1. 获取当前页面的 origin（不包含路径）
      const origin = window.location.origin;

      // 2. 尝试获取 app 信息
      let remoteId = null;
      try {
        const appInfo = await AppSdk.app.getAppInfo();
        if (appInfo && appInfo.remoteId) {
          remoteId = appInfo.remoteId;
        }
      } catch (error) {
        console.warn('获取 app 信息失败:', error);
      }

      // 3. 生成最终 URL
      let qrCodeUrl;
      if (remoteId) {
        // 有 remoteId，使用完整路径
        qrCodeUrl = `${origin}/app/${remoteId}?code=${code}`;
      } else {
        // 没有 remoteId，直接使用 code
        qrCodeUrl = code;
      }

      console.log('生成二维码 URL:', qrCodeUrl);
      return qrCodeUrl;
    } catch (error) {
      console.error('生成二维码 URL 失败:', error);
      // 失败时返回 code
      return code;
    }
  }

  /**
   * 绘制二维码
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {string} code - 优惠券编码
   * @param {number} x - 中心X坐标
   * @param {number} y - Y坐标
   * @param {number} size - 二维码尺寸
   * @returns {Promise<void>}
   * @private
   */
  async _drawQRCode(ctx, code, x, y, size = 160) {
    try {
      // 生成二维码 URL
      const qrCodeUrl = await this._generateQRCodeUrl(code);

      // 生成二维码为 Data URL（使用顶层导入的 QRCode）
      const qrDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // 加载二维码图片
      const qrImage = new Image();
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrDataUrl;
      });

      // 绘制白色背景
      const bgPadding = 10;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(
        x - size / 2 - bgPadding,
        y - bgPadding,
        size + bgPadding * 2,
        size + bgPadding * 2
      );

      // 绘制二维码
      ctx.drawImage(qrImage, x - size / 2, y, size, size);

    } catch (error) {
      console.error('绘制二维码失败:', error);
    }
  }

  /**
   * 绘制条形码
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {string} code - 优惠券编码
   * @param {number} x - 中心X坐标
   * @param {number} y - Y坐标
   * @param {Object} config - 图片配置
   * @private
   */
  _drawBarcode(ctx, code, x, y, config) {
    // 条形码参数（根据画布大小调整）
    const barcodeWidth = 300;
    const barcodeHeight = 60;
    const barWidth = 4;

    // 将编码转换为条形码模式（简化版Code 128）
    const pattern = this._generateBarcodePattern(code);

    // 绘制白色背景
    ctx.fillStyle = '#FFFFFF';
    const bgX = x - barcodeWidth / 2 - 15;
    const bgY = y - 8;
    ctx.fillRect(bgX, bgY, barcodeWidth + 30, barcodeHeight + 16);

    // 绘制条形码
    ctx.fillStyle = '#000000';
    const startX = x - (pattern.length * barWidth) / 2;

    pattern.forEach((bar, index) => {
      if (bar === 1) {
        ctx.fillRect(
          startX + index * barWidth,
          y,
          barWidth,
          barcodeHeight
        );
      }
    });
  }

  /**
   * 生成条形码图案
   * @param {string} code - 优惠券编码
   * @returns {Array} 条形码图案数组（0或1）
   * @private
   */
  _generateBarcodePattern(code) {
    const pattern = [];

    // 起始标记
    pattern.push(1, 0, 1, 0, 1);

    // 为每个字符生成条纹
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      // 使用字符编码生成独特的条纹模式
      const charPattern = [
        char % 2,
        (char >> 1) % 2,
        (char >> 2) % 2,
        (char >> 3) % 2,
        (char >> 4) % 2,
        (char >> 5) % 2
      ];
      pattern.push(...charPattern);

      // 字符间隔
      if (i < code.length - 1) {
        pattern.push(0);
      }
    }

    // 结束标记
    pattern.push(1, 0, 1, 0, 1);

    return pattern;
  }

  /**
   * 文本换行处理
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {string} text - 文本内容
   * @param {number} maxWidth - 最大宽度
   * @returns {Array} 换行后的文本数组
   * @private
   */
  _wrapText(ctx, text, maxWidth) {
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < text.length; i++) {
      const testLine = currentLine + text[i];
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = text[i];
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // 最多显示2行
    return lines.slice(0, 2);
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