import React, { useState, useEffect } from 'react';
import { IonToast } from '@ionic/react';
import { t } from '../utils/i18n';

let toastQueue = [];
let showToastFunction = null;

// 전역 토스트 표시 함수
export const showErrorToast = (message) => {
  if (showToastFunction) {
    showToastFunction(message, 'danger');
  } else {
    toastQueue.push({ message, color: 'danger' });
  }
};

export const showSuccessToast = (message) => {
  if (showToastFunction) {
    showToastFunction(message, 'success');
  } else {
    toastQueue.push({ message, color: 'success' });
  }
};

export const showInfoToast = (message) => {
  if (showToastFunction) {
    showToastFunction(message, 'primary');
  } else {
    toastQueue.push({ message, color: 'primary' });
  }
};

const ErrorToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // 전역 토스트 함수 등록
    showToastFunction = (message, color = 'danger') => {
      const id = Date.now();
      const newToast = {
        id,
        message,
        color,
        isOpen: true,
        duration: color === 'danger' ? 4000 : 3000
      };
      
      setToasts(prev => [...prev, newToast]);
      
      // 자동으로 토스트 제거
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, newToast.duration + 500);
    };

    // 대기 중인 토스트 처리
    toastQueue.forEach(({ message, color }) => {
      showToastFunction(message, color);
    });
    toastQueue = [];

    return () => {
      showToastFunction = null;
    };
  }, []);

  const handleToastDismiss = (toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  };

  return (
    <>
      {toasts.map(toast => (
        <IonToast
          key={toast.id}
          isOpen={toast.isOpen}
          message={toast.message}
          duration={toast.duration}
          color={toast.color}
          position="top"
          onDidDismiss={() => handleToastDismiss(toast.id)}
          buttons={[
            {
              text: t('confirmButton'),
              role: 'cancel'
            }
          ]}
        />
      ))}
    </>
  );
};

export default ErrorToast;