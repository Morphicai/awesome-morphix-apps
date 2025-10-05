import React from 'react';
import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/react';
import styles from '../../styles/ShareImageModal.module.css';

/**
 * 分享图片预览和下载弹窗
 */
export default function ShareImageModal({ isOpen, onClose, imageUrl, fileName }) {
  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName || `百万问AI_分享图_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>分享长图</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>关闭</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className={styles.container}>
          <div className={styles.imageWrapper}>
            {imageUrl ? (
              <img src={imageUrl} alt="分享图" className={styles.image} />
            ) : (
              <div className={styles.loading}>生成中...</div>
            )}
          </div>
          
          <div className={styles.actions}>
            <button className={styles.downloadButton} onClick={handleDownload}>
              下载到本地
            </button>
            <div className={styles.tips}>
              <p>💡 长按图片可保存或分享</p>
              <p>📱 点击下载按钮保存到相册</p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
}
