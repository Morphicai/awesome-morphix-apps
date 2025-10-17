import React from 'react';
import { IonText } from '@ionic/react';
import styles from './EmptyState.module.css';

const EmptyState = ({ message = "暂无数据，请先新增", showButton = true }) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.illustration}>
        {/* You can use an SVG or an image here */}
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7.5L12 3L4 7.5L12 12L20 7.5Z" stroke="#d0d0d0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 7.5V16.5L12 21L20 16.5V7.5" stroke="#d0d0d0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 12V21" stroke="#d0d0d0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 7.5L16 9.5" stroke="#d0d0d0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 9.5L4 7.5" stroke="#d0d0d0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <IonText className={styles.message}>{message}</IonText>
    </div>
  );
};

export default EmptyState;
