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

const CouponCreator = () => {
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  
  const { 
    createCoupon, 
    isLoading: isCouponLoading, 
    error: couponError, 
    currentCoupon,
    clearError,
    clearCurrentCoupon
  } = useCouponManager();
  
  const {
    generateAndSave,
    isGenerating: isImageGenerating,
    error: imageError
  } = useImageGenerator();

  const { 
    showToast, 
    handleValidationError,
    handleStorageError,
    handleImageError,
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
      // 创建成功，清空输入
      setAmount('');
      setAmountError('');
      showToast('优惠券创建成功！', 'success');
    } else {
      handleStorageError(result.error);
    }
  };

  /**
   * 处理保存图片
   */
  const handleSaveImage = async () => {
    if (!currentCoupon) {
      return;
    }

    const result = await withLoading(async () => {
      const saveResult = await generateAndSave(currentCoupon);
      
      if (!saveResult.success) {
        throw new Error(saveResult.error || imageError || '保存图片失败');
      }
      
      return saveResult;
    }, '保存图片失败，请重试');

    if (result.success) {
      showToast('优惠券图片已保存到相册', 'success');
    } else {
      handleImageError(result.error);
    }
  };

  /**
   * 创建新优惠券（清除当前显示的优惠券）
   */
  const handleCreateNew = () => {
    clearCurrentCoupon();
    setAmount('');
    setAmountError('');
  };

  return (
    <div className={styles.container}>
      {!currentCoupon ? (
        // 创建优惠券表单
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
      ) : (
        // 显示生成的优惠券
        <div className={styles.couponDisplay}>
          <div className={styles.successMessage}>
            <IonText className={styles.successText}>
              <p>
                <IonIcon icon={checkmarkCircleOutline} />
                优惠券创建成功！
              </p>
            </IonText>
          </div>
          
          <IonCard className={styles.couponCard}>
            <IonCardHeader>
              <IonCardTitle>优惠券信息</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className={styles.couponInfo}>
                <div className={styles.amountSection}>
                  <IonText className={styles.amountLabel}>
                    <p>优惠金额</p>
                  </IonText>
                  <IonText className={styles.amountValue}>
                    <h2>¥{currentCoupon.amount}</h2>
                  </IonText>
                </div>
                
                <div className={styles.codeSection}>
                  <IonText className={styles.codeLabel}>
                    <p>优惠券编码</p>
                  </IonText>
                  <IonText className={styles.codeValue}>
                    <h3>{currentCoupon.code}</h3>
                  </IonText>
                </div>
              </div>
              
              <div className={styles.actionButtons}>
                <IonButton
                  expand="block"
                  fill="solid"
                  onClick={handleSaveImage}
                  disabled={isImageGenerating}
                  className={`${styles.saveButton} ${isImageGenerating ? styles.buttonLoading : ''}`}
                >
                  {isImageGenerating ? (
                    <>
                      <IonSpinner name="crescent" />
                      <span className={styles.buttonText}>保存中...</span>
                    </>
                  ) : (
                    '保存图片到相册'
                  )}
                </IonButton>
                
                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={handleCreateNew}
                  className={styles.newButton}
                >
                  创建新优惠券
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      )}
      
      {/* 加载遮罩 */}
      {(isCouponLoading || isImageGenerating) && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner 
            message={isCouponLoading ? '正在创建优惠券...' : '正在保存图片...'}
            size="medium"
          />
        </div>
      )}
    </div>
  );
};

export default CouponCreator;