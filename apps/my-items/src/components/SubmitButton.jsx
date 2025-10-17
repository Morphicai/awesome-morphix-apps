import React, { useState } from 'react';
import { IonButton, IonSpinner } from '@ionic/react';
import styles from './SubmitButton.module.css';

const SubmitButton = ({ children, onClick, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) return;
    
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.buttonContainer}>
      <IonButton 
        expand="block" 
        onClick={handleClick} 
        disabled={disabled || isLoading} 
        className={styles.button}
      >
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonSpinner name="dots" />
            保存中...
          </div>
        ) : (
          children
        )}
      </IonButton>
    </div>
  );
};

export default SubmitButton;
