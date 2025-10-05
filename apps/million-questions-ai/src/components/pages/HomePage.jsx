import React from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import styles from '../../styles/HomePage.module.css';

export default function HomePage() {
  const history = useHistory();

  const goToInspiration = () => {
    history.push('/inspiration');
  };

  return (
    <IonPage>
      <PageHeader title="百万问AI" />
      <IonContent>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.logo}>💡</div>
            <div className={styles.title}>一个好问题，价值百万。</div>
            <div className={styles.subtitle}>伟大的产品，始于一个伟大的问题。</div>
          </div>

          <div className={styles.homeActions}>
            <button className={styles.actionButton} onClick={goToInspiration}>
              探索可能性
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
