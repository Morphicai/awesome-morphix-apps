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

const CouponValidator = () => {
  const [inputCode, setInputCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const { 
    validateCoupon, 
    useCoupon,
    isLoading, 
    error: serviceError, 
    clearError
  } = useCouponManager();

  const { 
    showToast, 
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
    
    // 清除之前的错误和结果
    if (codeError) {
      setCodeError('');
    }
    if (serviceError) {
      clearError();
    }
    if (validationResult) {
      setValidationResult(null);
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
      setValidationResult(result.data);
      setCodeError('');
      
      if (result.data.isValid) {
        showToast('优惠券查询成功', 'success');
      } else {
        showToast('优惠券不存在或已失效', 'warning');
      }
    } else {
      handleStorageError(result.error);
    }
  };

  /**
   * 处理验券操作（显示确认对话框）
   */
  const handleUseCoupon = () => {
    setShowConfirmDialog(true);
  };

  /**
   * 确认验券操作
   */
  const confirmUseCoupon = async () => {
    setShowConfirmDialog(false);
    
    const result = await withLoading(async () => {
      const success = await useCoupon(inputCode);
      
      if (!success) {
        throw new Error(serviceError || '验券失败');
      }
      
      return success;
    }, '验券失败，请重试');

    if (result.success) {
      // 更新验证结果状态
      setValidationResult(prev => ({
        ...prev,
        coupon: {
          ...prev.coupon,
          isUsed: true,
          usedAt: new Date()
        },
        message: '优惠券已使用',
        canUse: false
      }));
      
      showToast('验券成功！优惠券已使用', 'success');
    } else {
      handleStorageError(result.error);
    }
  };

  /**
   * 取消验券操作
   */
  const cancelUseCoupon = () => {
    setShowConfirmDialog(false);
  };

  /**
   * 重新查询（清除当前结果）
   */
  const handleNewQuery = () => {
    setInputCode('');
    setValidationResult(null);
    setCodeError('');
    clearError();
  };

  return (
    <div className={styles.container}>
      {!validationResult ? (
        // 验券输入表单
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
      ) : (
        // 显示验证结果
        <div className={styles.resultDisplay}>
          <IonCard className={styles.resultCard}>
            <IonCardHeader>
              <IonCardTitle>验券结果</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {validationResult.isValid ? (
                <div className={styles.validResult}>
                  <div className={styles.couponInfo}>
                    <div className={styles.codeSection}>
                      <IonText className={styles.codeLabel}>
                        <p>优惠券编码</p>
                      </IonText>
                      <IonText className={styles.codeValue}>
                        <h3>{validationResult.coupon.code}</h3>
                      </IonText>
                    </div>
                    
                    <div className={styles.amountSection}>
                      <IonText className={styles.amountLabel}>
                        <p>优惠金额</p>
                      </IonText>
                      <IonText className={styles.amountValue}>
                        <h2>¥{validationResult.coupon.amount}</h2>
                      </IonText>
                    </div>
                    
                    <div className={styles.statusSection}>
                      <IonText className={styles.statusLabel}>
                        <p>使用状态</p>
                      </IonText>
                      <div className={`${styles.statusIndicator} ${
                        validationResult.coupon.isUsed ? styles.usedIndicator : styles.availableIndicator
                      }`}>
                        <IonIcon 
                          icon={validationResult.coupon.isUsed ? closeCircleOutline : checkmarkCircleOutline} 
                        />
                        {validationResult.coupon.isUsed ? '已使用' : '可使用'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.messageSection}>
                    <IonText 
                      color={validationResult.canUse ? 'success' : 'medium'}
                      className={styles.messageText}
                    >
                      <p>{validationResult.message}</p>
                    </IonText>
                  </div>
                  
                  <div className={styles.actionButtons}>
                    {validationResult.canUse && (
                      <IonButton
                        expand="block"
                        fill="solid"
                        color="primary"
                        onClick={handleUseCoupon}
                        disabled={isLoading}
                        className={styles.useButton}
                      >
                        验券使用
                      </IonButton>
                    )}
                    
                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={handleNewQuery}
                      className={styles.newQueryButton}
                    >
                      查询其他优惠券
                    </IonButton>
                  </div>
                </div>
              ) : (
                // 无效优惠券结果
                <div className={styles.invalidResult}>
                  <div className={styles.errorMessage}>
                    <IonText color="danger">
                      <h3>
                        <IonIcon icon={alertCircleOutline} className={styles.errorIcon} />
                        {validationResult.message}
                      </h3>
                    </IonText>
                  </div>
                  
                  <div className={styles.actionButtons}>
                    <IonButton
                      expand="block"
                      fill="outline"
                      onClick={handleNewQuery}
                      className={styles.newQueryButton}
                    >
                      重新查询
                    </IonButton>
                  </div>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      )}
      
      {/* 验券确认对话框 */}
      <IonAlert
        isOpen={showConfirmDialog}
        onDidDismiss={cancelUseCoupon}
        header="确认验券"
        message={`确定要使用这张 ¥${validationResult?.coupon?.amount} 的优惠券吗？使用后将无法撤销。`}
        buttons={[
          {
            text: '取消',
            role: 'cancel',
            handler: cancelUseCoupon,
            cssClass: 'alert-button-cancel'
          },
          {
            text: '确认使用',
            handler: confirmUseCoupon,
            cssClass: 'alert-button-confirm'
          }
        ]}
        cssClass={styles.confirmAlert}
      />
      
      {/* 加载遮罩 */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner 
            message="正在处理请求..."
            size="medium"
          />
        </div>
      )}
    </div>
  );
};

export default CouponValidator;