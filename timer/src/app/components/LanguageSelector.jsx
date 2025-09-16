import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon, IonPopover, IonContent, IonList, IonItem, IonLabel, IonCheckbox } from '@ionic/react';
import { language, checkmark } from 'ionicons/icons';
import { getCurrentLanguage, getAvailableLanguages, setLanguage, addLanguageListener, t } from '../utils/i18n';
import styles from '../styles/LanguageSelector.module.css';

export default function LanguageSelector({ className = '' }) {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [isOpen, setIsOpen] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState(undefined);
  
  const availableLanguages = getAvailableLanguages();

  useEffect(() => {
    const unsubscribe = addLanguageListener((newLanguage) => {
      setCurrentLang(newLanguage);
    });
    return unsubscribe;
  }, []);

  const handleLanguageChange = async (languageCode) => {
    await setLanguage(languageCode);
    setIsOpen(false);
  };

  const openPopover = (e) => {
    setPopoverEvent(e.nativeEvent);
    setIsOpen(true);
  };

  const getCurrentLanguageInfo = () => {
    return availableLanguages.find(lang => lang.code === currentLang) || availableLanguages[0];
  };

  const currentLanguageInfo = getCurrentLanguageInfo();

  return (
    <div className={`${styles.languageSelector} ${className}`}>
      <IonButton
        fill="outline"
        size="small"
        onClick={openPopover}
        className={styles.languageButton}
      >
        <span className={styles.languageFlag}>{currentLanguageInfo.flag}</span>
        <span className={styles.languageCode}>
          {currentLang.toUpperCase()}
        </span>
        <IonIcon icon={language} className={styles.languageIcon} />
      </IonButton>

      <IonPopover
        isOpen={isOpen}
        event={popoverEvent}
        onDidDismiss={() => setIsOpen(false)}
        showBackdrop={true}
        className={styles.languagePopover}
      >
        <IonContent>
          <div className={styles.popoverHeader}>
            <h4 className={styles.popoverTitle}>{t('languageSettings')}</h4>
          </div>
          <IonList className={styles.languageList}>
            {availableLanguages.map((language) => (
              <IonItem
                key={language.code}
                button
                onClick={() => handleLanguageChange(language.code)}
                className={`${styles.languageItem} ${
                  currentLang === language.code ? styles.selected : ''
                }`}
              >
                <div className={styles.languageOption}>
                  <span className={styles.optionFlag}>{language.flag}</span>
                  <div className={styles.optionText}>
                    <div className={styles.optionName}>{language.name}</div>
                    <div className={styles.optionCode}>
                      {language.code === 'ko' ? '한국어' : '中文'}
                    </div>
                  </div>
                  {currentLang === language.code && (
                    <IonIcon 
                      icon={checkmark} 
                      className={styles.checkIcon}
                    />
                  )}
                </div>
              </IonItem>
            ))}
          </IonList>
          <div className={styles.popoverFooter}>
            <p className={styles.footerText}>
              {t('currentLanguage')}: {currentLanguageInfo.name}
            </p>
          </div>
        </IonContent>
      </IonPopover>
    </div>
  );
}