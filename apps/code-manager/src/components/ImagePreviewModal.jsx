/**
 * 图片预览 Modal 组件
 * 显示生成的优惠券图片预览，支持保存到相册
 */

import { 
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonSpinner
} from '@ionic/react';
import { 
  close,
  downloadOutline
} from 'ionicons/icons';
import styles from '../styles/ImagePreviewModal.module.css';

const ImagePreviewModal = ({ 
  isOpen, 
  imageData,
  coupon,
  onClose,
  onSave,
  isSaving
}) => {
  if (!coupon) return null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>优惠券图片预览</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className={styles.content}>
        <div className={styles.previewContainer}>
          {/* 图片预览 */}
          {imageData ? (
            <div className={styles.imageWrapper}>
              <img 
                src={imageData} 
                alt="优惠券预览" 
                className={styles.previewImage}
              />
            </div>
          ) : (
            <div className={styles.loadingWrapper}>
              <IonSpinner name="crescent" />
              <p>正在生成图片...</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className={styles.actionButtons}>
            <IonButton
              expand="block"
              fill="solid"
              onClick={onSave}
              disabled={isSaving || !imageData}
              className={styles.saveButton}
            >
              <IonIcon icon={downloadOutline} slot="start" />
              {isSaving ? '保存中...' : '保存到相册'}
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              onClick={onClose}
              disabled={isSaving}
              className={styles.cancelButton}
            >
              取消
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ImagePreviewModal;
