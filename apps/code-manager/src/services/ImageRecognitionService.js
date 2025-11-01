/**
 * 图片识别服务
 * 支持条形码识别和AI文字识别
 */

import AppSdk from '@morphixai/app-sdk';
import { Html5Qrcode } from 'html5-qrcode';

class ImageRecognitionService {
  /**
   * 从图片中识别优惠券编码
   * @param {string} base64Image - Base64格式的图片数据
   * @returns {Promise<Object>} 识别结果
   */
  async recognizeCouponCode(base64Image) {
    console.log('🔍 [识别开始] 开始识别优惠券编码');
    console.log('📷 [图片信息] 图片大小:', Math.round(base64Image.length / 1024), 'KB');

    try {
      // 首先尝试条形码识别
      console.log('📊 [条形码识别] 开始条形码识别...');
      const startBarcode = Date.now();

      const barcodeResult = await this.recognizeBarcode(base64Image);
      const barcodeTime = Date.now() - startBarcode;

      console.log(`⏱️  [条形码识别] 耗时: ${barcodeTime}ms`);

      if (barcodeResult.success && barcodeResult.code) {
        console.log('✅ [条形码识别] 识别成功!');
        console.log('🎯 [识别结果] 编码:', barcodeResult.code);
        console.log('📈 [置信度]', (barcodeResult.confidence * 100).toFixed(1) + '%');

        return {
          success: true,
          code: barcodeResult.code,
          method: 'barcode',
          confidence: barcodeResult.confidence || 1.0
        };
      }

      console.log('❌ [条形码识别] 识别失败，切换到AI识别');

      // 如果条形码识别失败，使用AI识别
      console.log('🤖 [AI识别] 开始AI识别...');
      const startAI = Date.now();

      const aiResult = await this.recognizeWithAI(base64Image);
      const aiTime = Date.now() - startAI;

      console.log(`⏱️  [AI识别] 耗时: ${aiTime}ms`);

      if (aiResult.success && aiResult.code) {
        console.log('✅ [AI识别] 识别成功!');
        console.log('🎯 [识别结果] 编码:', aiResult.code);
        console.log('📈 [置信度]', (aiResult.confidence * 100).toFixed(1) + '%');

        return {
          success: true,
          code: aiResult.code,
          method: 'ai',
          confidence: aiResult.confidence || 0.8
        };
      }

      console.log('❌ [AI识别] 识别失败');
      console.log('⚠️  [识别结束] 所有识别方法均失败');

      return {
        success: false,
        code: null,
        method: null,
        error: '未能识别出优惠券编码'
      };
    } catch (error) {
      console.error('💥 [识别错误] 识别过程发生错误:', error);
      return {
        success: false,
        code: null,
        method: null,
        error: error.message || '识别失败'
      };
    }
  }

  /**
   * 条形码识别（使用 html5-qrcode）
   * @param {string} base64Image - Base64格式的图片数据
   * @returns {Promise<Object>} 识别结果
   */
  async recognizeBarcode(base64Image) {
    console.log('  📊 [html5-qrcode] 初始化识别器...');

    try {
      // 动态导入 html5-qrcode 库
      const { Html5Qrcode } = await import('html5-qrcode');

      console.log('  📊 [html5-qrcode] 准备图片数据...');

      // 将 base64 转换为 File 对象
      const blob = await this._base64ToBlob(base64Image);
      const file = new File([blob], 'coupon.jpg', { type: blob.type });

      console.log('  📊 [html5-qrcode] 文件大小:', Math.round(file.size / 1024), 'KB');

      // 创建临时容器元素（html5-qrcode 需要）
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-qr-reader-' + Date.now();
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      try {
        const html5QrCode = new Html5Qrcode(tempDiv.id);

        console.log('  📊 [html5-qrcode] 开始扫描文件...');

        // 扫描文件
        const decodedText = await html5QrCode.scanFile(file, false);

        console.log('  📊 [html5-qrcode] 原始识别结果:', decodedText);

        // 清理临时元素
        document.body.removeChild(tempDiv);

        // 尝试从识别结果中提取 code
        const extractedCode = this._extractCodeFromText(decodedText);
        
        if (extractedCode) {
          console.log('  📊 [html5-qrcode] ✅ 识别成功，编码:', extractedCode);
          return {
            success: true,
            code: extractedCode,
            confidence: 0.95
          };
        } else {
          console.log('  📊 [html5-qrcode] ⚠️ 识别到内容但无法提取编码:', decodedText);
          return {
            success: false,
            code: null,
            rawText: decodedText
          };
        }
      } catch (error) {
        // 清理临时元素
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }

        console.log('  📊 [html5-qrcode] ❌ 识别失败:', error.message);
        return {
          success: false,
          code: null
        };
      }
    } catch (error) {
      console.error('  📊 [html5-qrcode] 初始化失败:', error);
      return {
        success: false,
        code: null,
        error: error.message
      };
    }
  }

  /**
   * 将 base64 转换为 Blob
   * @param {string} base64Image - Base64格式的图片数据
   * @returns {Promise<Blob>} Blob 对象
   * @private
   */
  async _base64ToBlob(base64Image) {
    // 如果是 data URL，提取 base64 部分
    let base64Data = base64Image;
    let mimeType = 'image/jpeg';

    if (base64Image.startsWith('data:')) {
      const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    // 将 base64 转换为二进制
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Blob([bytes], { type: mimeType });
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

      const result = await AppSdk.AI.chat({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${pureBase64}`
                }
              }
            ]
          }
        ],
        options: {
          temperature: 0.1 // 使用较低的温度以获得更准确的结果
        }
      });

      if (result && result.content) {
        const recognizedText = result.content.trim().toUpperCase();
        
        console.log('  🤖 [AI] 原始识别内容:', recognizedText);
        
        // 尝试从识别结果中提取 code
        const extractedCode = this._extractCodeFromText(recognizedText);
        
        if (extractedCode) {
          console.log('  🤖 [AI] 提取到编码:', extractedCode);
          return {
            success: true,
            code: extractedCode,
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
   * 从文本中提取优惠券编码
   * @param {string} text - 识别到的文本
   * @returns {string|null} 提取到的编码
   * @private
   */
  _extractCodeFromText(text) {
    // 1. 尝试从 URL 中提取 code 参数
    const urlMatch = text.match(/[?&]code=([A-Z0-9]{6})/i);
    if (urlMatch) {
      console.log('  🤖 [AI] 从 URL 提取编码');
      return urlMatch[1].toUpperCase();
    }
    
    // 2. 尝试直接匹配6位编码
    const codeMatch = text.match(/[A-Z0-9]{6}/);
    if (codeMatch) {
      console.log('  🤖 [AI] 直接匹配编码');
      return codeMatch[0];
    }
    
    return null;
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
