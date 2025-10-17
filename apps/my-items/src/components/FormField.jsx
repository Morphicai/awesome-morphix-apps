import React from 'react';
import { IonItem, IonLabel, IonText, IonIcon } from '@ionic/react';
import { chevronForward } from 'ionicons/icons';
import styles from './FormField.module.css';

const FormField = ({ label, children, onClick, value }) => {
  return (
    <IonItem onClick={onClick} className={styles.formField} lines="none">
      <IonLabel className={styles.label}>{label}</IonLabel>
      <div className={styles.valueContainer}>
        {value && <IonText className={styles.value}>{value}</IonText>}
        {children}
        {onClick && <IonIcon icon={chevronForward} color="medium" />}
      </div>
    </IonItem>
  );
};

export default FormField;
