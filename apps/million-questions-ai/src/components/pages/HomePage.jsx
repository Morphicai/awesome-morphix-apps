import React from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useAppContext } from '../../contexts/AppContext';
import styles from '../../styles/HomePage.module.css';

export default function HomePage() {
  const history = useHistory();
  const { t } = useAppContext();

  const goToInspiration = () => {
    history.push('/inspiration');
  };

  return (
    <IonPage>
      <PageHeader title={t('common.appName')} />
      <IonContent>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.logo}>{t('home.logo')}</div>
            <div className={styles.title}>{t('home.title')}</div>
            <div className={styles.subtitle}>{t('home.subtitle')}</div>
          </div>

          <div className={styles.homeActions}>
            <button className={styles.actionButton} onClick={goToInspiration}>
              {t('home.exploreButton')}
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
