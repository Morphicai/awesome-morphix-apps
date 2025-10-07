import React from 'react';
import { IonIcon, IonButton } from '@ionic/react';
import { addOutline } from 'ionicons/icons';

// 空状态组件，用于显示没有数据时的提示
const EmptyState = ({ 
  icon, 
  message, 
  subMessage,
  actionText = '添加', 
  onAction,
  hideAction = false,
  customIcon = null,
  height = '60vh'
}) => {
  return (
    <div className="empty-state fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      height: height,
      textAlign: 'center'
    }}>
      <div className="empty-state-icon-container pulse" style={{
        backgroundColor: 'rgba(123, 104, 238, 0.1)',
        borderRadius: '50%',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        {customIcon || (
          <IonIcon 
            icon={icon} 
            style={{
              fontSize: '40px',
              color: 'var(--ion-color-primary)'
            }} 
          />
        )}
      </div>
      <p style={{
        fontSize: '18px',
        color: 'var(--ion-text-color)',
        margin: '0 0 8px 0',
        fontWeight: '600'
      }}>
        {message}
      </p>
      <p style={{
        fontSize: '14px',
        color: 'var(--app-medium-text)',
        margin: '0 0 24px 0',
        maxWidth: '280px',
        lineHeight: '1.5'
      }}>
        {subMessage || '开始创建您的健身计划，记录和追踪您的健身进度'}
      </p>
      {!hideAction && onAction && (
        <IonButton 
          onClick={onAction}
          shape="round"
          size="large"
          className="action-button scale-in"
          style={{
            '--border-radius': '50px',
            '--padding-start': '24px',
            '--padding-end': '24px',
            marginTop: '8px',
            fontWeight: '600',
            fontSize: '16px'
          }}
        >
          <IonIcon slot="start" icon={addOutline} />
          {actionText}
        </IonButton>
      )}
    </div>
  );
};

export default EmptyState;