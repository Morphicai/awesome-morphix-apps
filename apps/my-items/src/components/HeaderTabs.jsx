import React from 'react';
import { IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
import styles from './HeaderTabs.module.css';

const HeaderTabs = ({ selectedTab, onTabChange }) => {
  const tabs = ['全部', '服役中', '已超期', '已退役', '预备役'];

  return (
    <div className={styles.headerTabsContainer}>
      <IonSegment value={selectedTab} onIonChange={e => onTabChange(e.detail.value)} scrollable>
        {tabs.map(tab => (
          <IonSegmentButton key={tab} value={tab} className={styles.segmentButton}>
            <IonLabel>{tab}</IonLabel>
          </IonSegmentButton>
        ))}
      </IonSegment>
    </div>
  );
};

export default HeaderTabs;
