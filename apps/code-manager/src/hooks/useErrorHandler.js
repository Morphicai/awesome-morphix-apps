/**
 * 全局错误处理 Hook
 * 
 * 提供统一的错误处理、Toast 提示和加载状态管理
 */

import { useState, useCallback } from 'react';

/**
 * 错误类型枚举
 */
export const ErrorType = {
  VALIDATION: 'validation',
  NETWORK: 'network', 
  STORAGE: 'storage',
  IMAGE: 'image',
  UNKNOWN: 'unknown'
};

/**
 * 错误严重程度
 */
export const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning', 
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * 全局错误处理 Hook
 */
const useErrorHandler = () => {
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  /**
   * 添加错误
   */
  const addError = useCallback((error, type = ErrorType.UNKNOWN, severity = ErrorSeverity.ERROR) => {
    const errorId = Date.now() + Math.random();
    const errorObj = {
      id: errorId,
      message: typeof error === 'string' ? error : error.message || '未知错误',
      type,
      severity,
      timestamp: new Date(),
      details: typeof error === 'object' ? error : null
    };

    setErrors(prev => [...prev, errorObj]);

    // 自动清除非关键错误
    if (severity !== ErrorSeverity.CRITICAL) {
      setTimeout(() => {
        clearError(errorId);
      }, 5000);
    }

    return errorId;
  }, []);

  /**
   * 清除特定错误
   */
  const clearError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  /**
   * 清除所有错误
   */
  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  /**
   * 显示 Toast 提示
   */
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const toastId = Date.now() + Math.random();
    const toast = {
      id: toastId,
      message,
      type,
      duration,
      timestamp: new Date()
    };

    setToasts(prev => [...prev, toast]);

    // 自动移除 Toast
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, duration);

    return toastId;
  }, []);

  /**
   * 移除 Toast
   */
  const removeToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  /**
   * 异步操作包装器
   */
  const withLoading = useCallback(async (asyncFn, errorMessage = '操作失败') => {
    try {
      setIsLoading(true);
      const result = await asyncFn();
      return { success: true, data: result };
    } catch (error) {
      console.error('异步操作错误:', error);
      addError(error.message || errorMessage, ErrorType.UNKNOWN, ErrorSeverity.ERROR);
      return { success: false, error: error.message || errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  /**
   * 处理验证错误
   */
  const handleValidationError = useCallback((message) => {
    return addError(message, ErrorType.VALIDATION, ErrorSeverity.WARNING);
  }, [addError]);

  /**
   * 处理网络错误
   */
  const handleNetworkError = useCallback((error) => {
    const message = '网络连接失败，请检查网络设置';
    return addError(message, ErrorType.NETWORK, ErrorSeverity.ERROR);
  }, [addError]);

  /**
   * 处理存储错误
   */
  const handleStorageError = useCallback((error) => {
    const message = '数据保存失败，请重试';
    return addError(message, ErrorType.STORAGE, ErrorSeverity.ERROR);
  }, [addError]);

  /**
   * 处理图片生成错误
   */
  const handleImageError = useCallback((error) => {
    const message = '图片生成失败，请重试';
    return addError(message, ErrorType.IMAGE, ErrorSeverity.ERROR);
  }, [addError]);

  /**
   * 获取最新错误
   */
  const getLatestError = useCallback(() => {
    return errors.length > 0 ? errors[errors.length - 1] : null;
  }, [errors]);

  /**
   * 获取特定类型的错误
   */
  const getErrorsByType = useCallback((type) => {
    return errors.filter(error => error.type === type);
  }, [errors]);

  return {
    // 状态
    errors,
    isLoading,
    toasts,
    
    // 错误管理
    addError,
    clearError,
    clearAllErrors,
    getLatestError,
    getErrorsByType,
    
    // Toast 管理
    showToast,
    removeToast,
    
    // 工具方法
    withLoading,
    handleValidationError,
    handleNetworkError,
    handleStorageError,
    handleImageError
  };
};

export default useErrorHandler;