import React from 'react';
import { IonSpinner } from '@ionic/react';
import useLanguage from '../utils/useLanguage';

// 加载状态组件
const LoadingSpinner = ({ message }) => {
  const { t } = useLanguage();
  const displayMessage = message || t('common.loading');
  return (
    <div className="loading-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: 'rgba(123, 104, 238, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <IonSpinner 
          name="crescent" 
          style={{
            color: 'var(--ion-color-primary)',
            width: '32px',
            height: '32px',
          }}
        />
      </div>
      <p style={{
        fontSize: '16px',
        color: 'var(--app-medium-text)',
        margin: 0,
        fontWeight: '500'
      }}>
        {displayMessage}
      </p>
    </div>
  );
};

export default LoadingSpinner;