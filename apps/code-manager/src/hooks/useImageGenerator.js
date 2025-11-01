/**
 * 图片生成自定义Hook
 * 封装Canvas图片生成逻辑和状态管理
 */

import { useState, useCallback } from 'react';
import ImageService from '../services/ImageService';

const useImageGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);

  // 创建图片服务实例
  const imageService = new ImageService();

  /**
   * 生成优惠券图片
   * @param {Object} coupon - 优惠券对象
   * @param {Object} config - 图片配置（可选）
   * @returns {Promise<string|null>} Base64格式的图片数据
   */
  const generateImage = useCallback(async (coupon, config = null) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const base64Data = await imageService.generateCouponImage(coupon, config);
      setGeneratedImage(base64Data);
      return base64Data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * 保存图片到相册
   * @param {string} base64Data - Base64格式的图片数据
   * @param {string} filename - 文件名（可选）
   * @returns {Promise<Object>} 保存结果
   */
  const saveToAlbum = useCallback(async (base64Data, filename = null) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const result = await imageService.saveImageToAlbum(base64Data, filename);
      
      if (!result.success && result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        filename: filename || null,
        error: err.message
      };
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * 生成并保存优惠券图片
   * @param {Object} coupon - 优惠券对象
   * @param {Object} config - 图片配置（可选）
   * @returns {Promise<Object>} 生成和保存结果
   */
  const generateAndSave = useCallback(async (coupon, config = null) => {
    setIsGenerating(true);
    setIsSaving(true);
    setError(null);
    
    try {
      const result = await imageService.generateAndSaveImage(coupon, config);
      
      if (result.success && result.base64Data) {
        setGeneratedImage(result.base64Data);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        base64Data: null,
        filename: null,
        error: err.message
      };
    } finally {
      setIsGenerating(false);
      setIsSaving(false);
    }
  }, []);

  /**
   * 清除生成的图片
   */
  const clearImage = useCallback(() => {
    setGeneratedImage(null);
  }, []);

  /**
   * 清除错误状态
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 状态
    isGenerating,
    isSaving,
    error,
    generatedImage,
    
    // 操作方法
    generateImage,
    saveToAlbum,
    generateAndSave,
    clearImage,
    clearError
  };
};

export default useImageGenerator;