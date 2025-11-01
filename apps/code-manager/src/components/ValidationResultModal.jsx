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
                <IonIcon
                  icon={result.coupon.isUsed ? closeCircleOutline : checkmarkCircleOutline}
                  className={result.coupon.isUsed ? styles.usedIcon : styles.successIcon}
                />
                <IonText className={result.coupon.isUsed ? styles.usedText : styles.successText}>
                  <h2>{result.coupon.isUsed ? '优惠券已被使用' : '优惠券有效'}</h2>
                </IonText>
              </div>

              {/* 优惠券信息 */}
              <div className={`${styles.couponCard} ${result.coupon.isUsed ? styles.usedCouponCard : ''}`}>
                {result.coupon.companyName && (
                  <div className={styles.companySection}>
                    <IonText className={styles.companyName}>{result.coupon.companyName}</IonText>
                  </div>
                )}

                <div className={styles.amountSection}>
                  <IonText className={styles.amountLabel}>
                    {result.coupon.type === 'discount' ? '折扣' : '优惠金额'}
                  </IonText>
                  <div className={styles.amountDisplay}>
                    {result.coupon.type === 'discount' ? (
                      <IonText className={styles.amount}>{result.coupon.discount}折</IonText>
                    ) : (
                      <>
                        <IonText className={styles.currency}>¥</IonText>
                        <IonText className={styles.amount}>{result.coupon.amount}</IonText>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.codeSection}>
                  <IonText className={styles.codeLabel}>优惠券编码</IonText>
                  <IonText className={styles.codeValue}>
                    {result.coupon.code}
                  </IonText>
                </div>

                {result.coupon.note && (
                  <div className={styles.noteSection}>
                    <IonText className={styles.noteLabel}>备注</IonText>
                    <IonText className={styles.noteValue}>{result.coupon.note}</IonText>
                  </div>
                )}

                {result.coupon.expiryDate && (
                  <div className={styles.expirySection}>
                    <IonText className={styles.expiryLabel}>有效期至</IonText>
                    <IonText className={styles.expiryValue}>{result.coupon.expiryDate}</IonText>
                  </div>
                )}

                {!result.coupon.isUsed && (
                  <div className={styles.statusSection}>
                    <IonText className={styles.statusLabel}>使用状态</IonText>
                    <IonBadge
                      color="success"
                      className={styles.statusBadge}
                    >
                      <IonIcon
                        icon={checkmarkCircleOutline}
                        className={styles.statusIcon}
                      />
                      未使用
                    </IonBadge>
                  </div>
                )}
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
                {result.canUse && result.coupon.source === 'created' && (
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

                {result.canUse && result.coupon.source === 'received' && (
                  <div className={styles.warningSection}>
                    <IonText color="warning">
                      <p>收到的优惠券不支持验券操作</p>
                    </IonText>
                  </div>
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
        message={`确定要使用这张 ${result?.coupon?.type === 'discount' ? `${result?.coupon?.discount}折` : `¥${result?.coupon?.amount}`} 的优惠券吗？使用后将无法撤销。`}
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
