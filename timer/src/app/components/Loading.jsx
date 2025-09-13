import React from 'react';
import styles from '../styles/Loading.module.css';

export default function Loading({ isVisible, message = "정원을 준비하는 중..." }) {
  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.spinner}>
          <div className={styles.leaf}>🌱</div>
          <div className={styles.leaf}>🌿</div>
          <div className={styles.leaf}>🍃</div>
        </div>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}
