/**
 * Toast 管理组件
 * 
 * 提供全局 Toast 提示功能，支持不同类型和自动消失
 */

import React from 'react';
import { IonToast, IonIcon } from '@ionic/react';
import { 
  checkmarkCircle, 
  alertCircle, 
  informationCircle, 
  warningOutline,
  closeOutline 
} from 'ionicons/icons';
import styles from '../styles/ToastManager.module.css';

/**
 * Toast 类型配置
 */
const TOAST_CONFIG = {
  success: {
    icon: checkmarkCircle,
    color: 'success',
    className: styles.successToast
  },
  error: {
    icon: alertCircle,
    color: 'danger',
    className: styles.errorToast
  },
  warning: {
    icon: warningOutline,
    color: 'warning',
    className: styles.warningToast
  },
  info: {
    icon: informationCircle,
    color: 'primary',
    className: styles.infoToast
  }
};

/**
 * Toast 管理组件
 */
const ToastManager = ({ toasts, onRemoveToast }) => {
  return (
    <>
      {toasts.map((toast) => {
        const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
        
        return (
          <IonToast
            key={toast.id}
            isOpen={true}
            onDidDismiss={() => onRemoveToast(toast.id)}
            message={toast.message}
            duration={toast.duration}
            position="top"
            color={config.color}
            buttons={[
              {
                icon: closeOutline,
                role: 'cancel',
                handler: () => onRemoveToast(toast.id)
              }
            ]}
            cssClass={config.className}
          />
        );
      })}
    </>
  );
};

export default ToastManager;