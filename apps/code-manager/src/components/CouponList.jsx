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
    try {
      const d = new Date(date);
      // 检查日期是否有效
      if (isNaN(d.getTime())) {
        console.error('Invalid date:', date);
        return '日期无效';
      }
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '日期错误';
    }
  };

  /**
   * 排序优惠券：未使用的在前，按创建时间倒序
   */
  const sortCoupons = (coupons) => {
    return [...coupons].sort((a, b) => {
      // 首先按使用状态排序（未使用在前）
      if (a.isUsed !== b.isUsed) {
        return a.isUsed ? 1 : -1;
      }
      
      // 然后按创建时间倒序（新的在前）
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
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

  const sortedCoupons = sortCoupons(coupons);

  return (
    <div className={styles.listContainer}>
      {sortedCoupons.map((coupon) => (
        <IonCard 
          key={coupon.code} 
          className={styles.couponItem}
          onClick={() => onCouponClick(coupon)}
          button
        >
          <IonCardContent className={styles.cardContent}>
            <div className={styles.leftSection}>
              <div className={styles.amountSection}>
                {coupon.type === 'discount' ? (
                  <>
                    <IonText className={styles.amount}>{coupon.discount}</IonText>
                    <IonText className={styles.discountLabel}>折</IonText>
                  </>
                ) : (
                  <>
                    <IonText className={styles.currency}>¥</IonText>
                    <IonText className={styles.amount}>{coupon.amount}</IonText>
                  </>
                )}
              </div>
              {coupon.companyName && (
                <div className={styles.companyName}>
                  <IonText className={styles.companyText}>{coupon.companyName}</IonText>
                </div>
              )}
            </div>
            
            <div className={styles.rightSection}>
              <div className={styles.codeSection}>
                <IonText className={styles.codeLabel}>编码</IonText>
                <IonText className={styles.codeValue}>
                  {maskCouponCode(coupon.code)}
                </IonText>
              </div>
              
              {coupon.note && (
                <div className={styles.noteSection}>
                  <IonText className={styles.noteText}>
                    {coupon.note.length > 20 ? `${coupon.note.substring(0, 20)}...` : coupon.note}
                  </IonText>
                </div>
              )}
              
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
