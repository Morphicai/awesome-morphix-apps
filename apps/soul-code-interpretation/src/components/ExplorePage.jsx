import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { getZodiacList } from '../utils/zodiacAnalysis';
import { DataService } from '../services/DataService';
import { AIService } from '../services/AIService';
import styles from '../styles/ExplorePage.module.css';

export default function ExplorePage() {
  const history = useHistory();
  const zodiacs = getZodiacList();
  const [selectedZodiac, setSelectedZodiac] = useState('白羊座');
  const [showZodiacPicker, setShowZodiacPicker] = useState(false);
  const [dailyInsight, setDailyInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [soulExplorerCount] = useState(10000 + Math.floor(Math.random() * 5000));

  useEffect(() => {
    // 加载保存的星座选择
    const savedZodiac = DataService.getPreference('selectedZodiac', '白羊座');
    setSelectedZodiac(savedZodiac);

    // 生成每日能量指引
    generateDailyInsight();
  }, []);

  const generateDailyInsight = async () => {
    try {
      setLoadingInsight(true);
      const insight = await AIService.generateDailyInsight();
      setDailyInsight(insight);
    } catch (error) {
      console.error('生成每日指引失败:', error);
      // 使用默认指引
      setDailyInsight(AIService.getDefaultDailyInsight());
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleZodiacChange = (zodiac) => {
    setSelectedZodiac(zodiac);
    DataService.savePreference('selectedZodiac', zodiac);
    setShowZodiacPicker(false);
  };

  const startTest = () => {
    history.push('/test');
  };

  const viewHistory = () => {
    history.push('/vault');
  };

  return (
    <IonPage>
      <IonContent className={styles.exploreContainer}>
        {/* 星空能量背景 */}
        <div className={styles.energyField}></div>

        <div className={styles.scrollContent}>
          {/* 标题区域 */}
          <div className={styles.header}>
            <span className={styles.appTitle}>✨ 探索你的内在特质</span>
            <span className={styles.appSubtitle}>发现真实的自己，开启成长之旅</span>
          </div>

          {/* 每日能量指引卡片 */}
          <div className={styles.dailyInsightCard}>
            <div className={styles.cardTitle}>今日能量提示</div>
            <div className={styles.cardContent}>
              {loadingInsight ? (
                <div className={styles.loadingText}>AI 正在为你生成今日指引...</div>
              ) : (
                <div className={styles.insightText}>{dailyInsight}</div>
              )}
            </div>
          </div>

          {/* 星座选择 */}
          <div className={styles.zodiacSection}>
            <div className={styles.sectionTitle}>选择你的星座</div>
            <div className={styles.pickerContainer}>
              <div 
                className={styles.pickerSelector}
                onClick={() => setShowZodiacPicker(!showZodiacPicker)}
              >
                <span>{selectedZodiac}</span>
                <span className={styles.selectorIcon}>▼</span>
              </div>
              
              {showZodiacPicker && (
                <>
                  {/* 遮罩层：点击关闭下拉菜单 */}
                  <div 
                    className={styles.pickerOverlay}
                    onClick={() => setShowZodiacPicker(false)}
                  />
                  <div className={styles.pickerDropdown}>
                    {zodiacs.map((zodiac) => (
                      <div
                        key={zodiac}
                        className={styles.zodiacOption}
                        onClick={() => handleZodiacChange(zodiac)}
                      >
                        {zodiac}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 功能按钮 */}
          <div className={styles.buttonGroup}>
            <button className={styles.startTestBtn} onClick={startTest}>
              <span className={styles.buttonIcon}>🔮</span>
              <span>开始灵魂探索</span>
            </button>
            <button className={styles.viewHistoryBtn} onClick={viewHistory}>
              <span className={styles.buttonIcon}>📜</span>
              <span>查看我的成长轨迹</span>
            </button>
          </div>

          {/* 底部信息 */}
          <div className={styles.footer}>
            <span className={styles.userCount}>
              已有 {soulExplorerCount.toLocaleString()} 位探索者加入了旅程
            </span>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

