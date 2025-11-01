/**
 * 验证结果 Modal 组件
 * 显示优惠券验证结果，支持验券操作
 */

import { 
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonText,
  IonBadge,
  IonAlert
} from '@ionic/react';
import { 
  close,
  checkmarkCircleOutline,
  closeCircleOutline,
  alertCircleOutline,
  checkmarkDoneOutline
} from 'ionicons/icons';
import { useState } from 'react';
import styles from '../styles/ValidationResultModal.module.css';

const ValidationResultModal = ({ 
  isOpen, 
  result, 
  onClose,
  onUseCoupon,
  isUsing
}) => {
  const [showUseConfirm, setShowUseConfirm] = useState(false);

  const handleUseCoupon = () => {
    setShowUseConfirm(true);
  };

  const confirmUse = () => {
    setShowUseConfirm(false);
    onUseCoupon(result.coupon.code);
  };

  const cancelUse = () => {
    setShowUseConfirm(false);
  };

  if (!result) return null;

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>验券结果</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        
        <IonContent className={styles.content}>
          {result.isValid ? (
            <div className={styles.resultContainer}>
              {/* 验证成功 */}
              <div className={styles.successHeader}>
                <IonIcon icon={checkmarkCircleOutline} className={styles.successIcon} />
                <IonText className={styles.successText}>
                  <h2>优惠券有效</h2>
                </IonText>
              </div>

              {/* 优惠券信息 */}
              <div className={styles.couponCard}>
                <div className={styles.amountSection}>
                  <IonText className={styles.amountLabel}>优惠金额</IonText>
                  <div className={styles.amountDisplay}>
                    <IonText className={styles.currency}>¥</IonText>
                    <IonText className={styles.amount}>{result.coupon.amount}</IonText>
                  </div>
                </div>

                <div className={styles.codeSection}>
                  <IonText className={styles.codeLabel}>优惠券编码</IonText>
                  <IonText className={styles.codeValue}>
                    {result.coupon.code}
                  </IonText>
                </div>

                <div className={styles.statusSection}>
                  <IonText className={styles.statusLabel}>使用状态</IonText>
                  <IonBadge 
                    color={result.coupon.isUsed ? 'medium' : 'success'}
                    className={styles.statusBadge}
                  >
                    <IonIcon 
                      icon={result.coupon.isUsed ? closeCircleOutline : checkmarkCircleOutline}
                      className={styles.statusIcon}
                    />
                    {result.coupon.isUsed ? '已使用' : '未使用'}
                  </IonBadge>
                </div>
              </div>

              {/* 提示信息 */}
              <div className={styles.messageSection}>
                <IonText 
                  color={result.canUse ? 'success' : 'medium'}
                  className={styles.messageText}
                >
                  <p>{result.message}</p>
                </IonText>
              </div>

              {/* 操作按钮 */}
              <div className={styles.actionButtons}>
                {result.canUse && (
                  <IonButton
                    expand="block"
                    fill="solid"
                    color="primary"
                    onClick={handleUseCoupon}
                    disabled={isUsing}
                    className={styles.useButton}
                  >
                    <IonIcon icon={checkmarkDoneOutline} slot="start" />
                    {isUsing ? '验券中...' : '验券使用'}
                  </IonButton>
                )}

                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={onClose}
                  className={styles.closeButton}
                >
                  关闭
                </IonButton>
              </div>
            </div>
          ) : (
            <div className={styles.resultContainer}>
              {/* 验证失败 */}
              <div className={styles.errorHeader}>
                <IonIcon icon={alertCircleOutline} className={styles.errorIcon} />
                <IonText className={styles.errorText}>
                  <h2>优惠券无效</h2>
                </IonText>
              </div>

              <div className={styles.errorMessage}>
                <IonText color="danger">
                  <p>{result.message}</p>
                </IonText>
              </div>

              <div className={styles.actionButtons}>
                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={onClose}
                  className={styles.closeButton}
                >
                  关闭
                </IonButton>
              </div>
            </div>
          )}
        </IonContent>
      </IonModal>

      {/* 验券确认对话框 */}
      <IonAlert
        isOpen={showUseConfirm}
        onDidDismiss={cancelUse}
        header="确认验券"
        message={`确定要使用这张 ¥${result?.coupon?.amount} 的优惠券吗？使用后将无法撤销。`}
        buttons={[
          {
            text: '取消',
            role: 'cancel',
            handler: cancelUse
          },
          {
            text: '确认使用',
            handler: confirmUse
          }
        ]}
      />
    </>
  );
};

export default ValidationResultModal;
