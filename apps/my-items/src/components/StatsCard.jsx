import React from 'react';
import { IonRow, IonCol, IonText, IonIcon } from '@ionic/react';
import { chevronDownOutline } from 'ionicons/icons';
import styles from './StatsCard.module.css';

const StatsCard = ({ totalValue, dailyAverage, itemCount }) => {
  return (
    <div className={styles.statsCardContainer}>
      <IonRow className={styles.titleRow}>
        <IonCol size="auto" className={styles.title}>
          <IonText>全部物品</IonText>
        </IonCol>
        <IonCol className={styles.filter}>
          <IonText>默认</IonText>
          <IonIcon icon={chevronDownOutline} />
        </IonCol>
      </IonRow>
      <IonRow className={styles.statsRow}>
        <IonCol className={styles.statCol}>
          <IonText className={styles.statValue}>{totalValue.toFixed(2)}</IonText>
          <IonText className={styles.statLabel}>资产总计 (¥)</IonText>
        </IonCol>
        <IonCol className={styles.statCol}>
          <IonText className={styles.statValue}>{dailyAverage.toFixed(2)}</IonText>
          <IonText className={styles.statLabel}>总日均 (¥)</IonText>
        </IonCol>
        <IonCol className={styles.statCol}>
          <IonText className={styles.statValue}>{itemCount}</IonText>
          <IonText className={styles.statLabel}>数量 (个)</IonText>
        </IonCol>
      </IonRow>
    </div>
  );
};

export default StatsCard;