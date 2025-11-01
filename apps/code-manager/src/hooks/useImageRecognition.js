/**
 * 图片识别自定义Hook
 * 封装图片识别逻辑和状态管理
 */

import { useState, useCallback } from 'react';
import ImageRecognitionService from '../services/ImageRecognitionService';

const useImageRecognition = () => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState(null);
  const [recognitionResult, setRecognitionResult] = useState(null);

  // 创建图片识别服务实例
  const recognitionService = new ImageRecognitionService();

  /**
   * 识别图片中的优惠券编码
   * @param {string} base64Image - Base64格式的图片数据
   * @returns {Promise<Object>} 识别结果
   */
  const recognizeCode = useCallback(async (base64Image) => {
    setIsRecognizing(true);
    setError(null);
    
    try {
      const result = await recognitionService.recognizeCouponCode(base64Image);
      setRecognitionResult(result);
      
      if (!result.success) {
        setError(result.error || '识别失败');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || '识别过程中发生错误';
      setError(errorMessage);
      return {
        success: false,
        code: null,
        error: errorMessage
      };
    } finally {
      setIsRecognizing(false);
    }
  }, []);

  /**
   * 从相机拍照并识别
   * @returns {Promise<Object>} 识别结果
   */
  const captureAndRecognize = useCallback(async () => {
    setIsRecognizing(true);
    setError(null);
    
    try {
      const base64Image = await recognitionService.captureFromCamera();
      const result = await recognitionService.recognizeCouponCode(base64Image);
      setRecognitionResult(result);
      
      if (!result.success) {
        setError(result.error || '识别失败');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || '拍照或识别失败';
      setError(errorMessage);
      return {
        success: false,
        code: null,
        error: errorMessage
      };
    } finally {
      setIsRecognizing(false);
    }
  }, []);

  /**
   * 从相册选择图片并识别
   * @returns {Promise<Object>} 识别结果
   */
  const selectAndRecognize = useCallback(async () => {
    setIsRecognizing(true);
    setError(null);
    
    try {
      const base64Image = await recognitionService.selectFromGallery();
      const result = await recognitionService.recognizeCouponCode(base64Image);
      setRecognitionResult(result);
      
      if (!result.success) {
        setError(result.error || '识别失败');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.message || '选择图片或识别失败';
      setError(errorMessage);
      return {
        success: false,
        code: null,
        error: errorMessage
      };
    } finally {
      setIsRecognizing(false);
    }
  }, []);

  /**
   * 清除错误状态
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 清除识别结果
   */
  const clearResult = useCallback(() => {
    setRecognitionResult(null);
  }, []);

  return {
    // 状态
    isRecognizing,
    error,
    recognitionResult,
    
    // 操作方法
    recognizeCode,
    captureAndRecognize,
    selectAndRecognize,
    clearError,
    clearResult
  };
};

export default useImageRecognition;
