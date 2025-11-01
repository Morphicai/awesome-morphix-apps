/**
 * 优惠券创建结果 Modal 组件
 * 显示新创建的优惠券信息
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
  IonText
} from '@ionic/react';
import { 
  close,
  checkmarkCircleOutline,
  imageOutline
} from 'ionicons/icons';
import styles from '../styles/CouponResultModal.module.css';

const CouponResultModal = ({ 
  isOpen, 
  coupon, 
  onClose,
  onSaveImage,
  isSavingImage
}) => {
  if (!coupon) return null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>创建成功</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className={styles.content}>
        <div className={styles.resultContainer}>
          {/* 成功提示 */}
          <div className={styles.successHeader}>
            <IonIcon icon={checkmarkCircleOutline} className={styles.successIcon} />
            <IonText className={styles.successText}>
              <h2>优惠券创建成功！</h2>
            </IonText>
          </div>

          {/* 优惠券信息卡片 */}
          <div className={styles.couponCard}>
            {coupon.companyName && (
              <div className={styles.companySection}>
                <IonText className={styles.companyName}>{coupon.companyName}</IonText>
              </div>
            )}

            <div className={styles.amountSection}>
              <IonText className={styles.amountLabel}>
                {coupon.type === 'discount' ? '折扣' : '优惠金额'}
              </IonText>
              <div className={styles.amountDisplay}>
                {coupon.type === 'discount' ? (
                  <IonText className={styles.amount}>{coupon.discount}折</IonText>
                ) : (
                  <>
                    <IonText className={styles.currency}>¥</IonText>
                    <IonText className={styles.amount}>{coupon.amount}</IonText>
                  </>
                )}
              </div>
            </div>

            <div className={styles.codeSection}>
              <IonText className={styles.codeLabel}>优惠券编码</IonText>
              <IonText className={styles.codeValue}>
                {coupon.code}
              </IonText>
            </div>

            {coupon.note && (
              <div className={styles.noteSection}>
                <IonText className={styles.noteLabel}>备注</IonText>
                <IonText className={styles.noteValue}>
                  {coupon.note}
                </IonText>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className={styles.actionButtons}>
            <IonButton
              expand="block"
              fill="solid"
              onClick={() => onSaveImage(coupon)}
              disabled={isSavingImage}
              className={styles.saveButton}
            >
              <IonIcon icon={imageOutline} slot="start" />
              {isSavingImage ? '保存中...' : '保存图片到相册'}
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              onClick={onClose}
              className={styles.closeButton}
            >
              完成
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default CouponResultModal;
