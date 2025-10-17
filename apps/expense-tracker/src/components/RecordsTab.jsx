import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonRefresher, IonRefresherContent, IonModal, IonButton, IonToast } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import dayjs from 'dayjs';
import { useAppStore } from '../store/useAppStore';
import { t, getExpenseCategories, getIncomeCategories, getCategoryKey } from '../utils/i18n';
import styles from '../styles/Records.module.css';

export default function RecordsTab() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNote, setEditNote] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const refreshTick = useAppStore((state) => state.refreshTick);

  const loadRecords = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await AppSdk.appData.queryData({
        collection: 'records',
        query: []
      });
      const sorted = data.sort((a, b) => b.timestamp - a.timestamp);
      setRecords(sorted);
    } catch (error) {
      await reportError(error, 'JavaScriptError', { component: 'RecordsTab' });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords(true);
  }, []);

  useEffect(() => {
    if (refreshTick > 0) {
      loadRecords(false);
    }
  }, [refreshTick]);

  const handleRefresh = async (event) => {
    await loadRecords(false);
    event.detail.complete();
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setEditAmount(record.amount.toString());
    setEditCategory(record.category);
    setEditNote(record.note || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editAmount || parseFloat(editAmount) <= 0) {
      setToastMessage(t('addRecord.invalidAmount'));
      setShowToast(true);
      return;
    }

    if (!editCategory) {
      setToastMessage(t('addRecord.selectCategory'));
      setShowToast(true);
      return;
    }

    try {
      await AppSdk.appData.updateData({
        collection: 'records',
        id: editingRecord.id,
        data: {
          amount: parseFloat(editAmount),
          category: editCategory,
          note: editNote.trim()
        }
      });

      setToastMessage(t('records.updateSuccess'));
      setShowToast(true);
      setShowEditModal(false);
      loadRecords();
    } catch (error) {
      await reportError(error, 'JavaScriptError', { component: 'RecordsTab' });
      setToastMessage(t('records.updateFailed'));
      setShowToast(true);
    }
  };

  const handleDelete = async (record) => {
    if (!confirm(t('records.deleteConfirm'))) return;

    try {
      await AppSdk.appData.deleteData({
        collection: 'records',
        id: record.id
      });

      setToastMessage(t('records.deleteSuccess'));
      setShowToast(true);
      loadRecords();
    } catch (error) {
      await reportError(error, 'JavaScriptError', { component: 'RecordsTab' });
      setToastMessage(t('records.deleteFailed'));
      setShowToast(true);
    }
  };

  const categories = editingRecord?.type === 'expense' ? getExpenseCategories() : getIncomeCategories();

  const getCategoryDisplayName = (record) => {
    const categoryKey = getCategoryKey(record.type, record.category);
    return t(`categories.${record.type}.${categoryKey}`);
  };

  return (
    <IonPage>
      <PageHeader title={t('records.title')} />
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className={styles.content}>
          {records.length === 0 && !loading && (
            <div className={styles.empty}>{t('records.empty')}</div>
          )}

          {records.map((record) => (
            <div key={record.id} className={styles.recordCard}>
              <div className={styles.recordMain}>
                <div className={styles.recordLeft}>
                  <div className={styles.recordCategory}>{getCategoryDisplayName(record)}</div>
                  <div className={styles.recordDate}>
                    {dayjs(record.timestamp).format('YYYY-MM-DD HH:mm')}
                  </div>
                  {record.note && (
                    <div className={styles.recordNote}>{record.note}</div>
                  )}
                </div>
                <div className={styles.recordRight}>
                  <div className={`${styles.recordAmount} ${record.type === 'expense' ? styles.expense : styles.income}`}>
                    {record.type === 'expense' ? '-' : '+'}¥{record.amount.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className={styles.recordActions}>
                <button className={styles.actionButton} onClick={() => handleEdit(record)}>
                  {t('records.edit')}
                </button>
                <button className={styles.actionButton} onClick={() => handleDelete(record)}>
                  {t('records.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </IonContent>

      <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
        <div className={styles.modalContainer}>
          <PageHeader title={t('records.editTitle')} />
          <IonContent>
            <div className={styles.modalContent}>
              <div className={styles.modalSection}>
                <div className={styles.modalLabel}>{t('addRecord.amount')}</div>
                <div className={styles.modalAmountInput}>
                  <span className={styles.currency}>¥</span>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.modalSection}>
                <div className={styles.modalLabel}>{t('addRecord.category')}</div>
                <div className={styles.categories}>
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      className={`${styles.categoryButton} ${editCategory === cat.name ? styles.categoryButtonActive : ''}`}
                      onClick={() => setEditCategory(cat.name)}
                    >
                      {t(`categories.${editingRecord?.type}.${cat.key}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.modalSection}>
                <div className={styles.modalLabel}>{t('addRecord.note')}</div>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              <div className={styles.modalButtons}>
                <IonButton expand="block" onClick={handleSaveEdit}>
                  {t('records.save')}
                </IonButton>
                <IonButton expand="block" fill="outline" onClick={() => setShowEditModal(false)}>
                  {t('records.cancel')}
                </IonButton>
              </div>
            </div>
          </IonContent>
        </div>
      </IonModal>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="top"
      />
    </IonPage>
  );
}
