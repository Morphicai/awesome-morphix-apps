/**
 * 优惠券列表组件
 * 显示所有优惠券，支持点击查看详情
 */

import { 
  IonCard, 
  IonCardContent,
  IonText,
  IonIcon,
  IonBadge
} from '@ionic/react';
import { 
  checkmarkCircleOutline, 
  closeCircleOutline,
  timeOutline
} from 'ionicons/icons';
import styles from '../styles/CouponList.module.css';

const CouponList = ({ coupons, onCouponClick }) => {
  /**
   * 加密显示优惠券码（显示前2位和后2位，中间用*代替）
   */
  const maskCouponCode = (code) => {
    if (!code || code.length < 4) return code;
    return `${code.substring(0, 2)}**${code.substring(code.length - 2)}`;
  };

  /**
   * 格式化日期
   */
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (!coupons || coupons.length === 0) {
    return (
      <div className={styles.emptyState}>
        <IonText color="medium">
          <p>暂无优惠券</p>
        </IonText>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {coupons.map((coupon) => (
        <IonCard 
          key={coupon.code} 
          className={styles.couponItem}
          onClick={() => onCouponClick(coupon)}
          button
        >
          <IonCardContent className={styles.cardContent}>
            <div className={styles.leftSection}>
              <div className={styles.amountSection}>
                <IonText className={styles.currency}>¥</IonText>
                <IonText className={styles.amount}>{coupon.amount}</IonText>
              </div>
            </div>
            
            <div className={styles.rightSection}>
              <div className={styles.codeSection}>
                <IonText className={styles.codeLabel}>编码</IonText>
                <IonText className={styles.codeValue}>
                  {maskCouponCode(coupon.code)}
                </IonText>
              </div>
              
              <div className={styles.statusSection}>
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
              
              <div className={styles.dateSection}>
                <IonIcon icon={timeOutline} className={styles.dateIcon} />
                <IonText className={styles.dateText}>
                  {formatDate(coupon.createdAt)}
                </IonText>
              </div>
            </div>
          </IonCardContent>
        </IonCard>
      ))}
    </div>
  );
};

export default CouponList;
