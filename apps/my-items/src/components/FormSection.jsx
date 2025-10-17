import React from 'react';
import { IonText } from '@ionic/react';
import styles from './FormSection.module.css';

const FormSection = ({ title, children }) => {
  return (
    <div className={styles.formSection}>
      {title && <IonText className={styles.title}>{title}</IonText>}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default FormSection;
