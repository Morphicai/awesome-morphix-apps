import React from 'react';
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/react';
import { useAppContext } from '../../contexts/AppContext';
import styles from '../../styles/ShareImageModal.module.css';

/**
 * 分享图片预览和下载弹窗
 */
export default function ShareImageModal({ isOpen, onClose, imageUrl, fileName }) {
  const { t } = useAppContext();
  
  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName || `${t('common.appName')}_${t('share.title')}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('share.title')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>{t('share.closeButton')}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className={styles.container}>
          <div className={styles.imageWrapper}>
            {imageUrl ? (
              <img src={imageUrl} alt={t('share.title')} className={styles.image} />
            ) : (
              <div className={styles.loading}>{t('common.loading')}</div>
            )}
          </div>
          
          <div className={styles.actions}>
            <button className={styles.downloadButton} onClick={handleDownload}>
              {t('share.saveButton')}
            </button>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
}
