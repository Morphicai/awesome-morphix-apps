import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useHistory } from 'react-router-dom';
import { DataService } from '../services/DataService';
import { getTypeIcon, getTypeName } from '../utils/soulAnalysis';
import styles from '../styles/VaultPage.module.css';

export default function VaultPage() {
  const history = useHistory();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const records = await DataService.getAllRecords();
      setHistoryList(records);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0 && date.getDate() === now.getDate()) {
      // 同一天，显示时间
      return `今天 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else if (diffDays === 1) {
      // 昨天
      return `昨天 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else if (diffDays < 7) {
      // 近一周内
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return `${days[date.getDay()]} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else {
      // 超过一周，显示日期
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  const viewResult = (record) => {
    if (record && record.resultData) {
      history.push('/result', { testResult: record.resultData });
    }
  };

  const deleteRecord = async (id, event) => {
    event.stopPropagation(); // 阻止事件冒泡
    
    if (window.confirm('确定要删除这条记录吗？')) {
      const success = await DataService.deleteRecord(id);
      if (success) {
        // 重新加载历史记录
        await loadHistory();
      }
    }
  };

  const startNewTest = () => {
    history.push('/test');
  };

  return (
    <IonPage>
      <PageHeader title="密码库" />
      <IonContent className={styles.vaultContainer}>
        {/* 能量场背景 */}
        <div className={styles.energyField}>
          <div className={styles.starsBg}></div>
          <div className={styles.energyParticles}></div>
        </div>

        <div className={styles.contentBox}>
          <div className={styles.header}>
            <div className={styles.title}>✨ 我的能量成长轨迹</div>
            <div className={styles.subtitle}>每一次探索，都是灵魂的一次跃升</div>
            <div className={styles.count}>已记录 {historyList.length} 次内在探索</div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#c7bbff' }}>
              加载中...
            </div>
          ) : historyList.length > 0 ? (
            <div className={styles.historyList}>
              {historyList.map((record, index) => (
                <div
                  key={record.id || index}
                  className={styles.historyCard}
                  onClick={() => viewResult(record)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.recordDate}>
                      <span>🕒</span>
                      <span>{formatDate(record.date || record.createdAt)}</span>
                    </div>
                    <div className={styles.recordSeq}>#{historyList.length - index}</div>
                  </div>

                  <div className={styles.cardMain}>
                    {record.resultData && record.resultData.mainType && (
                      <div className={styles.typeDisplay}>
                        <div className={styles.typeIcon}>
                          {getTypeIcon(record.resultData.mainType)}
                        </div>
                        <div className={styles.typeText}>
                          {getTypeName(record.resultData.mainType)}
                        </div>
                      </div>
                    )}
                    
                    <div className={styles.recordSummary}>
                      {record.resultData?.scorePercentages && (
                        <>
                          核心特质倾向: {record.resultData.scorePercentages.mainType || '-'}%
                        </>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button 
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        viewResult(record);
                      }}
                    >
                      <span className={styles.buttonIcon}>👁️</span>
                      <span>查看</span>
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={(e) => deleteRecord(record.id, e)}
                    >
                      <span className={styles.buttonIcon}>🗑️</span>
                      <span>删除</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🌌</div>
              <span className={styles.emptyText}>你的灵魂旅程，从此刻开始</span>
              <span className={styles.emptySubtext}>每一次测试，都是一次与高我连接的契机</span>
              <button className={styles.startButton} onClick={startNewTest}>
                <span className={styles.buttonIcon}>✨</span>
                <span>开启灵魂探索</span>
              </button>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

