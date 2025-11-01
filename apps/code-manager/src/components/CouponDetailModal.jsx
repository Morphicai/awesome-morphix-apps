/**
 * 优惠券详情 Modal 组件
 * 显示优惠券完整信息，支持删除和保存图片操作
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
  timeOutline,
  imageOutline,
  trashOutline
} from 'ionicons/icons';
import { useState } from 'react';
import styles from '../styles/CouponDetailModal.module.css';

const CouponDetailModal = ({ 
  isOpen, 
  coupon, 
  onClose, 
  onDelete,
  onSaveImage,
  isDeleting,
  isSavingImage
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * 格式化日期
   */
  const formatDate = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      // 检查日期是否有效
      if (isNaN(d.getTime())) {
        console.error('Invalid date:', date);
        return '日期无效';
      }
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '日期错误';
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(coupon.code);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (!coupon) return null;

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>优惠券详情</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        
        <IonContent className={styles.content}>
          <div className={styles.detailContainer}>
            {/* 金额展示 */}
            <div className={styles.amountCard}>
              {coupon.companyName && (
                <IonText className={styles.companyName}>{coupon.companyName}</IonText>
              )}
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

            {/* 优惠券信息 */}
            <div className={styles.infoSection}>
              <div className={styles.infoItem}>
                <IonText className={styles.infoLabel}>优惠券编码</IonText>
                <IonText className={styles.infoValue}>
                  {coupon.code}
                </IonText>
              </div>

              {coupon.note && (
                <div className={styles.infoItem}>
                  <IonText className={styles.infoLabel}>备注信息</IonText>
                  <IonText className={styles.infoValue}>
                    {coupon.note}
                  </IonText>
                </div>
              )}

              <div className={styles.infoItem}>
                <IonText className={styles.infoLabel}>使用状态</IonText>
                <IonBadge 
                  color={coupon.isUsed ? 'medium' : 'success'}
                  className={styles.statusBadge}
                >
                  <IonIcon 
                    icon={coupon.isUsed ? closeCircleOutline : checkmarkCircleOutline}
                    className={styles.statusIcon}
                  />
                  {coupon.isUsed ? '已使用' : '未使用'}
                </IonBadge>
              </div>

              <div className={styles.infoItem}>
                <IonText className={styles.infoLabel}>
                  <IonIcon icon={timeOutline} className={styles.labelIcon} />
                  创建时间
                </IonText>
                <IonText className={styles.infoValue}>
                  {formatDate(coupon.createdAt)}
                </IonText>
              </div>

              {coupon.isUsed && coupon.usedAt && (
                <div className={styles.infoItem}>
                  <IonText className={styles.infoLabel}>
                    <IonIcon icon={timeOutline} className={styles.labelIcon} />
                    使用时间
                  </IonText>
                  <IonText className={styles.infoValue}>
                    {formatDate(coupon.usedAt)}
                  </IonText>
                </div>
              )}

              {coupon.expiryDate && (
                <div className={styles.infoItem}>
                  <IonText className={styles.infoLabel}>
                    <IonIcon icon={timeOutline} className={styles.labelIcon} />
                    有效期至
                  </IonText>
                  <IonText className={styles.infoValue}>
                    {coupon.expiryDate}
                  </IonText>
                </div>
              )}

              {coupon.source && (
                <div className={styles.infoItem}>
                  <IonText className={styles.infoLabel}>来源</IonText>
                  <IonBadge color={coupon.source === 'created' ? 'primary' : 'secondary'}>
                    {coupon.source === 'created' ? '我创建的' : '我收到的'}
                  </IonBadge>
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
                {isSavingImage ? '保存中...' : '保存图片'}
              </IonButton>

              <IonButton
                expand="block"
                fill="outline"
                color="danger"
                onClick={handleDelete}
                disabled={isDeleting}
                className={styles.deleteButton}
              >
                <IonIcon icon={trashOutline} slot="start" />
                {isDeleting ? '删除中...' : '删除优惠券'}
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      {/* 删除确认对话框 */}
      <IonAlert
        isOpen={showDeleteConfirm}
        onDidDismiss={cancelDelete}
        header="确认删除"
        message={`确定要删除这张 ${coupon.type === 'discount' ? `${coupon.discount}折` : `¥${coupon.amount}`} 的优惠券吗？删除后将无法恢复。`}
        buttons={[
          {
            text: '取消',
            role: 'cancel',
            handler: cancelDelete
          },
          {
            text: '确认删除',
            role: 'destructive',
            handler: confirmDelete
          }
        ]}
      />
    </>
  );
};

export default CouponDetailModal;
