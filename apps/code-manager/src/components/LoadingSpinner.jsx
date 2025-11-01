/**
 * 加载状态组件
 * 
 * 提供统一的加载状态显示，支持不同大小和样式
 */

import React from 'react';
import { IonSpinner } from '@ionic/react';
import styles from '../styles/LoadingSpinner.module.css';

/**
 * 加载状态组件
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  message = '加载中...', 
  overlay = false,
  fullScreen = false,
  color = 'primary'
}) => {
  const containerClass = `
    ${styles.container} 
    ${overlay ? styles.overlay : ''} 
    ${fullScreen ? styles.fullScreen : ''}
  `.trim();

  const spinnerClass = `
    ${styles.spinner} 
    ${styles[`spinner${size.charAt(0).toUpperCase() + size.slice(1)}`]}
  `.trim();

  return (
    <div className={containerClass}>
      <div className={styles.content}>
        <IonSpinner 
          name="crescent" 
          color={color}
          className={spinnerClass}
        />
        {message && (
          <p className={styles.message}>{message}</p>
        )}
      </div>
    </div>
  );
};

/**
 * 内联加载组件（用于按钮等）
 */
export const InlineLoader = ({ size = 'small', color = 'primary' }) => {
  return (
    <IonSpinner 
      name="crescent" 
      color={color}
      className={`${styles.spinner} ${styles[`spinner${size.charAt(0).toUpperCase() + size.slice(1)}`]}`}
    />
  );
};

/**
 * 卡片加载组件
 */
export const CardLoader = ({ message = '加载中...' }) => {
  return (
    <div className={styles.cardLoader}>
      <div className={styles.cardContent}>
        <IonSpinner 
          name="crescent" 
          color="medium"
          className={`${styles.spinner} ${styles.spinnerMedium}`}
        />
        <p className={styles.cardMessage}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;