import React from 'react';
import { t } from '../utils/i18n';
import styles from '../styles/Loading.module.css';

export default function Loading({ isVisible, message = null }) {
  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.spinner}>
          <div className={styles.leaf}>🌱</div>
          <div className={styles.leaf}>🌿</div>
          <div className={styles.leaf}>🍃</div>
        </div>
        <p className={styles.message}>{message || t('preparingGarden')}</p>
      </div>
    </div>
  );
}
