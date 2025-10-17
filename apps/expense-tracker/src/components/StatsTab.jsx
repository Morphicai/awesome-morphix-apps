import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonRefresher, IonRefresherContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import dayjs from 'dayjs';
import { useAppStore } from '../store/useAppStore';
import { t, getCategoryKey } from '../utils/i18n';
import styles from '../styles/Stats.module.css';

export default function StatsTab() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));

  const refreshTick = useAppStore((state) => state.refreshTick);

  const loadRecords = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await AppSdk.appData.queryData({
        collection: 'records',
        query: []
      });
      setRecords(data);
    } catch (error) {
      await reportError(error, 'JavaScriptError', { component: 'StatsTab' });
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

  const monthRecords = records.filter((record) => {
    const recordMonth = dayjs(record.timestamp).format('YYYY-MM');
    return recordMonth === currentMonth;
  });

  const totalIncome = monthRecords
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpense = monthRecords
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const balance = totalIncome - totalExpense;

  const expenseByCategory = monthRecords
    .filter((r) => r.type === 'expense')
    .reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.amount;
      return acc;
    }, {});

  const categoryStats = Object.entries(expenseByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  const changeMonth = (offset) => {
    const newMonth = dayjs(currentMonth).add(offset, 'month').format('YYYY-MM');
    setCurrentMonth(newMonth);
  };

  const getCategoryDisplayName = (categoryName) => {
    const categoryKey = getCategoryKey('expense', categoryName);
    return t(`categories.expense.${categoryKey}`);
  };

  return (
    <IonPage>
      <PageHeader title={t('stats.title')} />
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className={styles.content}>
          <div className={styles.monthSelector}>
            <button className={styles.monthButton} onClick={() => changeMonth(-1)}>
              ‹
            </button>
            <div className={styles.monthText}>{currentMonth}</div>
            <button className={styles.monthButton} onClick={() => changeMonth(1)}>
              ›
            </button>
          </div>

          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>{t('stats.income')}</div>
              <div className={`${styles.summaryAmount} ${styles.income}`}>
                ¥{totalIncome.toFixed(2)}
              </div>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>{t('stats.expense')}</div>
              <div className={`${styles.summaryAmount} ${styles.expense}`}>
                ¥{totalExpense.toFixed(2)}
              </div>
            </div>

            <div className={`${styles.summaryCard} ${styles.balanceCard}`}>
              <div className={styles.summaryLabel}>{t('stats.balance')}</div>
              <div className={`${styles.summaryAmount} ${balance >= 0 ? styles.income : styles.expense}`}>
                ¥{balance.toFixed(2)}
              </div>
            </div>
          </div>

          {categoryStats.length > 0 && (
            <div className={styles.categorySection}>
              <div className={styles.sectionTitle}>{t('stats.categoryTitle')}</div>
              {categoryStats.map((stat) => (
                <div key={stat.category} className={styles.categoryItem}>
                  <div className={styles.categoryInfo}>
                    <div className={styles.categoryName}>{getCategoryDisplayName(stat.category)}</div>
                    <div className={styles.categoryAmount}>¥{stat.amount.toFixed(2)}</div>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <div className={styles.categoryPercentage}>
                    {stat.percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          )}

          {monthRecords.length === 0 && !loading && (
            <div className={styles.empty}>{t('stats.empty')}</div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
