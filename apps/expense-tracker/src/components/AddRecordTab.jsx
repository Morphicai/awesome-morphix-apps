import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonButton, IonInput, IonTextarea, IonToast, IonLoading } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { useAppStore } from '../store/useAppStore';
import { t, getExpenseCategories, getIncomeCategories, getCategoryKey } from '../utils/i18n';
import styles from '../styles/AddRecord.module.css';

export default function AddRecordTab() {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const refreshTick = useAppStore((state) => state.refreshTick);
  const triggerRefresh = useAppStore((state) => state.triggerRefresh);

  const categories = type === 'expense' ? getExpenseCategories() : getIncomeCategories();

  useEffect(() => {
    setAmount('');
    setNote('');
    setCategory('');
  }, [refreshTick]);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setToastMessage(t('addRecord.invalidAmount'));
      setShowToast(true);
      return;
    }

    if (!category) {
      setToastMessage(t('addRecord.selectCategory'));
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      await AppSdk.appData.createData({
        collection: 'records',
        data: {
          type,
          amount: parseFloat(amount),
          category,
          note: note.trim(),
          timestamp: Date.now()
        }
      });

      setToastMessage(t('addRecord.saveSuccess'));
      setShowToast(true);
      setAmount('');
      setNote('');
      setCategory('');
      triggerRefresh();
    } catch (error) {
      await reportError(error, 'JavaScriptError', { component: 'AddRecordTab' });
      setToastMessage(t('addRecord.saveFailed'));
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <PageHeader title={t('addRecord.title')} />
      <IonContent>
        <div className={styles.content}>
          <div className={styles.typeSelector}>
            <button
              className={`${styles.typeButton} ${type === 'expense' ? styles.typeButtonActive : ''}`}
              onClick={() => {
                setType('expense');
                setCategory('');
              }}
            >
              {t('addRecord.expense')}
            </button>
            <button
              className={`${styles.typeButton} ${type === 'income' ? styles.typeButtonActive : ''}`}
              onClick={() => {
                setType('income');
                setCategory('');
              }}
            >
              {t('addRecord.income')}
            </button>
          </div>

          <div className={styles.amountSection}>
            <div className={styles.amountLabel}>{t('addRecord.amount')}</div>
            <div className={styles.amountInput}>
              <span className={styles.currency}>¥</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionLabel}>{t('addRecord.category')}</div>
            <div className={styles.categories}>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className={`${styles.categoryButton} ${category === cat.name ? styles.categoryButtonActive : ''}`}
                  onClick={() => setCategory(cat.name)}
                >
                  {t(`categories.${type}.${cat.key}`)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionLabel}>{t('addRecord.note')}</div>
            <textarea
              placeholder={t('addRecord.notePlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>

          <IonButton
            expand="block"
            className={styles.saveButton}
            onClick={handleSave}
          >
            {t('addRecord.saveButton')}
          </IonButton>
        </div>
      </IonContent>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="top"
      />

      <IonLoading
        key="loading"
        isOpen={loading}
        message={t('addRecord.saving')}
        spinner="crescent"
      />
    </IonPage>
  );
}
