/**
 * 优惠券验证组件
 * 
 * 提供优惠券验证功能，包括编码输入、查询验证和使用操作
 * 支持显示验证结果和二次确认验券功能
 */

import React, { useState } from 'react';
import { 
  IonButton, 
  IonInput, 
  IonItem, 
  IonLabel, 
  IonSpinner,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonAlert,
  IonIcon
} from '@ionic/react';
import { 
  alertCircleOutline, 
  checkmarkCircleOutline, 
  closeCircleOutline,
  searchOutline 
} from 'ionicons/icons';
import { validateCouponCode } from '../utils/validators';
import useCouponManager from '../hooks/useCouponManager';
import useErrorHandler from '../hooks/useErrorHandler';
import LoadingSpinner from './LoadingSpinner';
import styles from '../styles/CouponValidator.module.css';

const CouponValidator = ({ onValidationSuccess }) => {
  const [inputCode, setInputCode] = useState('');
  const [codeError, setCodeError] = useState('');
  
  const { 
    validateCoupon, 
    isLoading, 
    error: serviceError, 
    clearError
  } = useCouponManager();

  const { 
    handleValidationError,
    handleStorageError,
    withLoading
  } = useErrorHandler();

  /**
   * 处理编码输入变化
   */
  const handleCodeChange = (e) => {
    const value = e.detail.value.toUpperCase(); // 转换为大写
    setInputCode(value);
    
    // 清除之前的错误
    if (codeError) {
      setCodeError('');
    }
    if (serviceError) {
      clearError();
    }
  };

  /**
   * 验证编码输入
   */
  const validateCodeInput = () => {
    if (!inputCode.trim()) {
      const errorMessage = '请输入优惠券编码';
      setCodeError(errorMessage);
      handleValidationError(errorMessage);
      return false;
    }
    
    if (!validateCouponCode(inputCode)) {
      const errorMessage = '请输入6位有效编码（字母和数字）';
      setCodeError(errorMessage);
      handleValidationError(errorMessage);
      return false;
    }
    
    return true;
  };

  /**
   * 处理查询优惠券
   */
  const handleValidateCoupon = async () => {
    if (!validateCodeInput()) {
      return;
    }

    const result = await withLoading(async () => {
      const validationResult = await validateCoupon(inputCode);
      
      if (!validationResult) {
        throw new Error(serviceError || '查询优惠券失败');
      }
      
      return validationResult;
    }, '查询优惠券失败，请重试');

    if (result.success) {
      setCodeError('');
      setInputCode('');
      
      // 通知父组件显示验证结果
      if (onValidationSuccess) {
        onValidationSuccess(result.data);
      }
    } else {
      handleStorageError(result.error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.queryForm}>
        <IonCard className={styles.formCard}>
          <IonCardHeader>
            <IonCardTitle>验券查询</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem className={styles.inputItem}>
              <IonLabel position="stacked">优惠券编码</IonLabel>
              <IonInput
                type="text"
                placeholder="请输入6位编码"
                value={inputCode}
                onIonInput={handleCodeChange}
                maxlength={6}
                className={codeError ? styles.inputError : ''}
              />
            </IonItem>
            
            {codeError && (
              <IonText color="danger" className={styles.errorText}>
                <p>
                  <IonIcon icon={alertCircleOutline} className={styles.errorIcon} />
                  {codeError}
                </p>
              </IonText>
            )}
            
            {serviceError && (
              <IonText color="danger" className={styles.errorText}>
                <p>
                  <IonIcon icon={alertCircleOutline} className={styles.errorIcon} />
                  {serviceError}
                </p>
              </IonText>
            )}
            
            <IonButton
              expand="block"
              onClick={handleValidateCoupon}
              disabled={isLoading}
              className={`${styles.queryButton} ${isLoading ? styles.buttonLoading : ''}`}
            >
              {isLoading ? (
                <>
                  <IonSpinner name="crescent" />
                  <span className={styles.buttonText}>查询中...</span>
                </>
              ) : (
                <>
                  <IonIcon icon={searchOutline} />
                  <span className={styles.buttonText}>查询优惠券</span>
                </>
              )}
            </IonButton>
          </IonCardContent>
        </IonCard>
      </div>
    </div>
  );
};

export default CouponValidator;