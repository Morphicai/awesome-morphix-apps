import React from 'react';
import { IonFab, IonFabButton, IonIcon, IonLabel } from '@ionic/react';
import { add } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import styles from './FloatingButton.module.css';

const FloatingButton = ({ children, onClick }) => {
    const history = useHistory();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            history.push('/add');
        }
    };

  return (
    <IonFab vertical="bottom" horizontal="center" slot="fixed" className={styles.fab}>
      <IonFabButton onClick={handleClick} className={styles.fabButton}>
        {children ? (
          <span className={styles.buttonText}>{children}</span>
        ) : (
          <IonIcon icon={add} />
        )}
      </IonFabButton>
    </IonFab>
  );
};

export default FloatingButton;
