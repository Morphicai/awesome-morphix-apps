/**
 * 批量创建优惠券结果 Modal 组件
 * 显示批量创建的优惠券列表
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
  IonList,
  IonItem,
  IonLabel,
  IonBadge
} from '@ionic/react';
import { 
  close,
  checkmarkCircleOutline,
  downloadOutline,
  copyOutline
} from 'ionicons/icons';
import styles from '../styles/BatchCouponResultModal.module.css';

const BatchCouponResultModal = ({ 
  isOpen, 
  coupons = [], 
  onClose,
  onExport
}) => {
  const handleCopyAll = () => {
    const codes = coupons.map(c => c.code).join('\n');
    navigator.clipboard.writeText(codes);
    // 可以添加 toast 提示
  };

  const handleExport = () => {
    if (onExport) {
      onExport(coupons);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>批量创建成功</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className={styles.content}>
        <div className={styles.container}>
          {/* 成功提示 */}
          <div className={styles.successHeader}>
            <IonIcon icon={checkmarkCircleOutline} className={styles.successIcon} />
            <IonText className={styles.successText}>
              <h2>成功创建 {coupons.length} 张优惠券</h2>
            </IonText>
          </div>

          {/* 操作按钮 */}
          <div className={styles.actionButtons}>
            <IonButton
              expand="block"
              fill="outline"
              onClick={handleCopyAll}
              className={styles.actionButton}
            >
              <IonIcon icon={copyOutline} slot="start" />
              复制所有编码
            </IonButton>
          </div>

          {/* 优惠券列表 */}
          <div className={styles.couponList}>
            <IonText className={styles.listTitle}>
              <h3>优惠券列表</h3>
            </IonText>
            <IonList className={styles.list}>
              {coupons.map((coupon, index) => (
                <IonItem key={coupon.code} className={styles.couponItem}>
                  <IonLabel>
                    <div className={styles.couponInfo}>
                      <span className={styles.couponIndex}>#{index + 1}</span>
                      <span className={styles.couponCode}>{coupon.code}</span>
                      <IonBadge color="primary" className={styles.couponAmount}>
                        {coupon.type === 'amount' 
                          ? `¥${coupon.amount}` 
                          : `${coupon.discount}折`}
                      </IonBadge>
                    </div>
                    {coupon.note && (
                      <p className={styles.couponNote}>{coupon.note}</p>
                    )}
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </div>

          {/* 关闭按钮 */}
          <div className={styles.closeButtonContainer}>
            <IonButton
              expand="block"
              onClick={onClose}
              className={styles.closeButton}
            >
              关闭
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default BatchCouponResultModal;
