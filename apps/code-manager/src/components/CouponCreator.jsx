/**
 * 优惠券创建组件
 * 
 * 提供优惠券创建表单，包括金额输入、验证和优惠券生成功能
 * 支持显示生成的优惠券信息和图片保存功能
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
  IonIcon
} from '@ionic/react';
import { alertCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { validateAmount } from '../utils/validators';
import useCouponManager from '../hooks/useCouponManager';
import useImageGenerator from '../hooks/useImageGenerator';
import useErrorHandler from '../hooks/useErrorHandler';
import LoadingSpinner from './LoadingSpinner';
import styles from '../styles/CouponCreator.module.css';

const CouponCreator = ({ onCouponCreated }) => {
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  
  const { 
    createCoupon, 
    isLoading: isCouponLoading, 
    error: couponError, 
    clearError
  } = useCouponManager();

  const { 
    handleValidationError,
    handleStorageError,
    withLoading
  } = useErrorHandler();

  /**
   * 处理金额输入变化
   */
  const handleAmountChange = (e) => {
    const value = e.detail.value;
    setAmount(value);
    
    // 清除之前的错误
    if (amountError) {
      setAmountError('');
    }
    if (couponError) {
      clearError();
    }
  };

  /**
   * 验证金额输入
   */
  const validateAmountInput = () => {
    if (!amount.trim()) {
      const errorMessage = '请输入优惠券金额';
      setAmountError(errorMessage);
      handleValidationError(errorMessage);
      return false;
    }
    
    const numAmount = parseFloat(amount);
    if (!validateAmount(numAmount)) {
      const errorMessage = '请输入有效的金额（大于0的数字）';
      setAmountError(errorMessage);
      handleValidationError(errorMessage);
      return false;
    }
    
    return true;
  };

  /**
   * 处理创建优惠券
   */
  const handleCreateCoupon = async () => {
    if (!validateAmountInput()) {
      return;
    }

    const result = await withLoading(async () => {
      const numAmount = parseFloat(amount);
      const coupon = await createCoupon(numAmount);
      
      if (!coupon) {
        throw new Error(couponError || '创建优惠券失败');
      }
      
      return coupon;
    }, '创建优惠券失败，请重试');

    if (result.success) {
      // 创建成功，清空输入并通知父组件
      setAmount('');
      setAmountError('');
      if (onCouponCreated) {
        onCouponCreated(result.data);
      }
    } else {
      handleStorageError(result.error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.createForm}>
        <IonCard className={styles.formCard}>
          <IonCardHeader>
            <IonCardTitle>创建优惠券</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem className={styles.inputItem}>
              <IonLabel position="stacked">优惠券金额 (元)</IonLabel>
              <IonInput
                type="number"
                placeholder="请输入金额"
                value={amount}
                onIonInput={handleAmountChange}
                className={amountError ? styles.inputError : ''}
              />
            </IonItem>
            
            {amountError && (
              <IonText color="danger" className={styles.errorText}>
                <p>
                  <IonIcon icon={alertCircleOutline} className={styles.errorIcon} />
                  {amountError}
                </p>
              </IonText>
            )}
            
            {couponError && (
              <IonText color="danger" className={styles.errorText}>
                <p>
                  <IonIcon icon={alertCircleOutline} className={styles.errorIcon} />
                  {couponError}
                </p>
              </IonText>
            )}
            
            <IonButton
              expand="block"
              onClick={handleCreateCoupon}
              disabled={isCouponLoading}
              className={`${styles.createButton} ${isCouponLoading ? styles.buttonLoading : ''}`}
            >
              {isCouponLoading ? (
                <>
                  <IonSpinner name="crescent" />
                  <span className={styles.buttonText}>创建中...</span>
                </>
              ) : (
                '创建优惠券'
              )}
            </IonButton>
          </IonCardContent>
        </IonCard>
      </div>
    </div>
  );
};

export default CouponCreator;