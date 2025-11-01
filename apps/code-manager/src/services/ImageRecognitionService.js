/**
 * 图片识别服务
 * 支持条形码识别和AI文字识别
 */

import AppSdk from '@morphixai/app-sdk';

class ImageRecognitionService {
  /**
   * 从图片中识别优惠券编码
   * @param {string} base64Image - Base64格式的图片数据
   * @returns {Promise<Object>} 识别结果
   */
  async recognizeCouponCode(base64Image) {
    try {
      // 首先尝试条形码识别
      const barcodeResult = await this.recognizeBarcode(base64Image);
      if (barcodeResult.success && barcodeResult.code) {
        return {
          success: true,
          code: barcodeResult.code,
          method: 'barcode',
          confidence: barcodeResult.confidence || 1.0
        };
      }

      // 如果条形码识别失败，使用AI识别
      const aiResult = await this.recognizeWithAI(base64Image);
      if (aiResult.success && aiResult.code) {
        return {
          success: true,
          code: aiResult.code,
          method: 'ai',
          confidence: aiResult.confidence || 0.8
        };
      }

      return {
        success: false,
        code: null,
        method: null,
        error: '未能识别出优惠券编码'
      };
    } catch (error) {
      console.error('Error recognizing coupon code:', error);
      return {
        success: false,
        code: null,
        method: null,
        error: error.message || '识别失败'
      };
    }
  }

  /**
   * 条形码识别
   * @param {string} base64Image - Base64格式的图片数据
   * @returns {Promise<Object>} 识别结果
   */
  async recognizeBarcode(base64Image) {
    try {
      // 使用Canvas进行图像处理
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      return new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // 获取图像数据
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // 简化版条形码识别（扫描黑白条纹）
          const code = this._scanBarcode(imageData);
          
          if (code) {
            resolve({
              success: true,
              code: code,
              confidence: 0.9
            });
          } else {
            resolve({
              success: false,
              code: null
            });
          }
        };

        img.onerror = () => {
          resolve({
            success: false,
            code: null
          });
        };

        img.src = base64Image;
      });
    } catch (error) {
      console.error('Barcode recognition error:', error);
      return {
        success: false,
        code: null
      };
    }
  }

  /**
   * AI文字识别
   * @param {string} base64Image - Base64格式的图片数据
   * @returns {Promise<Object>} 识别结果
   */
  async recognizeWithAI(base64Image) {
    try {
      // 提取纯Base64数据
      const pureBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

      // 使用AppSdk的AI能力进行文字识别
      const prompt = `请识别图片中的6位优惠券编码。编码由大写字母和数字组成，格式如：ABC123。
只返回识别到的6位编码，不要包含任何其他文字。如果图片中有多个编码，返回最清晰的一个。
如果无法识别，返回"NONE"。`;

      const result = await AppSdk.ai.chat({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image',
                image: pureBase64
              }
            ]
          }
        ],
        temperature: 0.1 // 使用较低的温度以获得更准确的结果
      });

      if (result.success && result.content) {
        const recognizedText = result.content.trim().toUpperCase();
        
        // 验证识别结果是否为有效的6位编码
        const codeMatch = recognizedText.match(/[A-Z0-9]{6}/);
        
        if (codeMatch) {
          return {
            success: true,
            code: codeMatch[0],
            confidence: 0.8
          };
        }
      }

      return {
        success: false,
        code: null
      };
    } catch (error) {
      console.error('AI recognition error:', error);
      return {
        success: false,
        code: null,
        error: error.message
      };
    }
  }

  /**
   * 简化版条形码扫描
   * @param {ImageData} imageData - 图像数据
   * @returns {string|null} 识别到的编码
   * @private
   */
  _scanBarcode(imageData) {
    try {
      const { width, height, data } = imageData;
      
      // 扫描图像中间区域寻找条形码
      const centerY = Math.floor(height / 2);
      const scanLines = 5; // 扫描多行以提高准确率
      
      for (let offsetY = -scanLines; offsetY <= scanLines; offsetY++) {
        const y = centerY + offsetY * 10;
        if (y < 0 || y >= height) continue;
        
        const pattern = [];
        let lastPixel = null;
        let count = 0;
        
        // 扫描一行像素
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          // 计算灰度值
          const gray = (r + g + b) / 3;
          const isBlack = gray < 128;
          
          if (lastPixel === null) {
            lastPixel = isBlack;
            count = 1;
          } else if (lastPixel === isBlack) {
            count++;
          } else {
            pattern.push({ color: lastPixel ? 1 : 0, width: count });
            lastPixel = isBlack;
            count = 1;
          }
        }
        
        // 尝试从条形码模式解码
        if (pattern.length > 20) {
          const code = this._decodeBarcode(pattern);
          if (code) {
            return code;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Barcode scanning error:', error);
      return null;
    }
  }

  /**
   * 从条形码模式解码
   * @param {Array} pattern - 条形码模式
   * @returns {string|null} 解码后的编码
   * @private
   */
  _decodeBarcode(pattern) {
    // 这是一个简化版本，实际应用中应使用专业的条形码解码库
    // 这里我们只是尝试识别我们自己生成的条形码格式
    
    try {
      // 查找起始和结束标记
      const startMarker = this._findMarker(pattern, 0);
      const endMarker = this._findMarker(pattern, pattern.length - 10);
      
      if (!startMarker || !endMarker) {
        return null;
      }
      
      // 提取中间的数据部分
      const dataPattern = pattern.slice(startMarker.end, endMarker.start);
      
      // 解码数据
      const code = this._decodeDataPattern(dataPattern);
      
      // 验证编码格式
      if (code && /^[A-Z0-9]{6}$/.test(code)) {
        return code;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 查找条形码标记
   * @param {Array} pattern - 条形码模式
   * @param {number} startIndex - 开始索引
   * @returns {Object|null} 标记位置
   * @private
   */
  _findMarker(pattern, startIndex) {
    // 查找 1-0-1-0-1 模式
    for (let i = startIndex; i < Math.min(startIndex + 10, pattern.length - 4); i++) {
      if (pattern[i].color === 1 &&
          pattern[i + 1].color === 0 &&
          pattern[i + 2].color === 1 &&
          pattern[i + 3].color === 0 &&
          pattern[i + 4].color === 1) {
        return {
          start: i,
          end: i + 5
        };
      }
    }
    return null;
  }

  /**
   * 解码数据模式
   * @param {Array} dataPattern - 数据模式
   * @returns {string|null} 解码后的字符串
   * @private
   */
  _decodeDataPattern(dataPattern) {
    // 简化版解码，实际应用中需要更复杂的算法
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    // 每7个条纹代表一个字符
    for (let i = 0; i < dataPattern.length - 6; i += 7) {
      const charPattern = dataPattern.slice(i, i + 6);
      
      // 将模式转换为数字
      let value = 0;
      charPattern.forEach((bar, idx) => {
        if (bar.color === 1) {
          value += Math.pow(2, idx);
        }
      });
      
      // 映射到字符
      const charIndex = value % chars.length;
      code += chars[charIndex];
      
      if (code.length >= 6) {
        break;
      }
    }
    
    return code.length === 6 ? code : null;
  }

  /**
   * 从相机拍照
   * @returns {Promise<string>} Base64格式的图片数据
   */
  async captureFromCamera() {
    try {
      const result = await AppSdk.camera.takePicture({
        quality: 0.9
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // 如果有base64数据，直接使用
        if (asset.base64) {
          return `data:image/jpeg;base64,${asset.base64}`;
        }
        // 否则使用uri
        return asset.uri;
      }

      throw new Error('拍照失败或已取消');
    } catch (error) {
      console.error('Camera capture error:', error);
      throw error;
    }
  }

  /**
   * 从相册选择图片
   * @returns {Promise<string>} Base64格式的图片数据
   */
  async selectFromGallery() {
    try {
      const result = await AppSdk.camera.pickImage({
        quality: 0.9
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // 如果有base64数据，直接使用
        if (asset.base64) {
          return `data:image/jpeg;base64,${asset.base64}`;
        }
        // 否则使用uri
        return asset.uri;
      }

      throw new Error('选择图片失败或已取消');
    } catch (error) {
      console.error('Gallery selection error:', error);
      throw error;
    }
  }
}

export default ImageRecognitionService;
