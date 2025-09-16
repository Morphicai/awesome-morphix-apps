import React, { useState, useEffect } from 'react';
import { IonSegment, IonSegmentButton, IonLabel, IonContent } from '@ionic/react';
import { useTimerStore } from '../stores/timerStore';
import { useTaskStore } from '../stores/taskStore';
import { t } from '../utils/i18n';
import styles from '../styles/StatsTab.module.css';

export default function StatsTab() {
  const { plants, getTodayStats } = useTimerStore();
  const { getTaskStats } = useTaskStore();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  
  const timerStats = getTodayStats();
  const taskStats = getTaskStats();

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weeklyPlants = plants.filter(plant => 
      plant.completedAt >= weekStart.getTime()
    );

    return {
      pomodoros: weeklyPlants.length,
      focusTime: weeklyPlants.length * 25 * 60,
      days: 7
    };
  };

  // Calculate monthly stats
  const getMonthlyStats = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyPlants = plants.filter(plant => 
      plant.completedAt >= monthStart.getTime()
    );

    return {
      pomodoros: monthlyPlants.length,
      focusTime: monthlyPlants.length * 25 * 60,
      days: now.getDate()
    };
  };

  const getCurrentStats = () => {
    switch (selectedPeriod) {
      case 'today':
        return {
          pomodoros: timerStats.todayPomodoros,
          focusTime: timerStats.todayFocusTime,
          label: t('todayGardenLabel')
        };
      case 'week':
        const weekStats = getWeeklyStats();
        return {
          pomodoros: weekStats.pomodoros,
          focusTime: weekStats.focusTime,
          label: t('weeklyGrowthLabel')
        };
      case 'month':
        const monthStats = getMonthlyStats();
        return {
          pomodoros: monthStats.pomodoros,
          focusTime: monthStats.focusTime,
          label: t('monthlyFlowerbedLabel')
        };
      case 'total':
        return {
          pomodoros: timerStats.totalPomodoros,
          focusTime: timerStats.totalFocusTime,
          label: t('totalGardenStatusLabel')
        };
      default:
        return {
          pomodoros: 0,
          focusTime: 0,
          label: t('todayGardenLabel')
        };
    }
  };

  const currentStats = getCurrentStats();

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return t('timeFormat', { hours, minutes });
    }
    return t('minutesFormat', { minutes });
  };

  const getPlantTypeStats = () => {
    const plantCounts = plants.filter(plant => plant).reduce((acc, plant) => {
      acc[plant.type] = (acc[plant.type] || 0) + 1;
      return acc;
    }, {});

    const plantTypes = [
      { type: 'seedling', emoji: '🌱', name: t('plantedSprouts') },
      { type: 'flower', emoji: '🌿', name: t('grownLeaves') },
      { type: 'fruit', emoji: '🌸', name: t('bloomedFlowers') },
      { type: 'tree', emoji: '🌳', name: t('grownTrees') }
    ];

    return plantTypes.map(plant => ({
      ...plant,
      count: plantCounts[plant.type] || 0
    }));
  };

  const plantTypeStats = getPlantTypeStats();

  // Get daily focus pattern for the last 7 days
  const getDailyPattern = () => {
    const days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayPlants = plants.filter(plant => {
        const plantDate = new Date(plant.completedAt);
        plantDate.setHours(0, 0, 0, 0);
        return plantDate.getTime() === date.getTime();
      });
      
      days.push({
        date: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
        pomodoros: dayPlants.length,
        focusTime: dayPlants.length * 25 * 60
      });
    }
    
    return days;
  };

  const dailyPattern = getDailyPattern();
  const maxDailyPomodoros = Math.max(...dailyPattern.map(d => d.pomodoros), 1);

  return (
    <IonContent style={{ '--background': '#FFFFFF' }}>
      <div className={styles.container}>
        {/* Period Selector */}
        <div className={styles.gardenCard}>
          <h3 className={styles.cardTitle}>🌺 {t('periodSelection')}</h3>
          <IonSegment 
            value={selectedPeriod} 
            onIonChange={(e) => setSelectedPeriod(e.detail.value)}
            className={styles.periodSelector}
          >
            <IonSegmentButton value="today">
              <IonLabel>{t('todayLabel')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="week">
              <IonLabel>{t('weekLabel')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="month">
              <IonLabel>{t('monthLabel')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="total">
              <IonLabel>{t('totalLabel')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Main Stats */}
        <div className={styles.gardenCard}>
          <h3 className={styles.cardTitle}>🌻 {currentStats.label} {t('currentStatus')}</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🌱</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{currentStats.pomodoros}</div>
                <div className={styles.statLabel}>{t('plantedSeeds')}</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⏰</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{formatTime(currentStats.focusTime)}</div>
                <div className={styles.statLabel}>{t('focusedTime')}</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{taskStats.completed}</div>
                <div className={styles.statLabel}>{t('completedTodos')}</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📈</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{taskStats.completionRate}%</div>
                <div className={styles.statLabel}>{t('completionRate')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Pattern */}
        <div className={styles.gardenCard}>
          <h3 className={styles.cardTitle}>🌿 {t('recent7DaysGrowth')}</h3>
          <div className={styles.dailyChart}>
            {dailyPattern.map((day, index) => (
              <div key={index} className={styles.dayColumn}>
                <div className={styles.dayBar}>
                  <div 
                    className={styles.dayBarFill}
                    style={{ 
                      height: `${(day.pomodoros / maxDailyPomodoros) * 100}%` 
                    }}
                  />
                </div>
                <div className={styles.dayLabel}>{day.date}</div>
                <div className={styles.dayValue}>
                  {day.pomodoros > 0 ? '🌸' : '🌱'} {day.pomodoros}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plant Collection */}
        <div className={styles.gardenCard}>
          <h3 className={styles.cardTitle}>🌺 {t('myPlantCollection')}</h3>
          <div className={styles.plantCollection}>
            {plantTypeStats.map((plant) => (
              <div key={plant.type} className={styles.plantStat}>
                <div className={styles.plantEmoji}>{plant.emoji}</div>
                <div className={styles.plantInfo}>
                  <div className={styles.plantName}>{plant.name}</div>
                  <div className={styles.plantCount}>{plant.count}{t('countUnit')}</div>
                </div>
                <div className={styles.plantProgress}>
                  <div 
                    className={styles.plantProgressFill}
                    style={{ 
                      width: `${plants.length > 0 ? (plant.count / plants.length) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Summary */}
        <div className={styles.gardenCard}>
          <h3 className={styles.cardTitle}>🏆 {t('gardenAchievementSummary')}</h3>
          <div className={styles.achievements}>
            <div className={styles.achievement}>
              <span className={styles.achievementIcon}>🌻</span>
              <div className={styles.achievementText}>
                <div className={styles.achievementTitle}>{t('totalFocusTimeLabel')}</div>
                <div className={styles.achievementValue}>
                  {formatTime(timerStats.totalFocusTime)}
                </div>
              </div>
            </div>
            
            <div className={styles.achievement}>
              <span className={styles.achievementIcon}>🌱</span>
              <div className={styles.achievementText}>
                <div className={styles.achievementTitle}>{t('grownPlantsLabel')}</div>
                <div className={styles.achievementValue}>
                  {plants.length}{t('countUnit')}
                </div>
              </div>
            </div>
            
            <div className={styles.achievement}>
              <span className={styles.achievementIcon}>🌸</span>
              <div className={styles.achievementText}>
                <div className={styles.achievementTitle}>{t('completedTasksLabel')}</div>
                <div className={styles.achievementValue}>
                  {taskStats.completed}{t('countUnit')}
                </div>
              </div>
            </div>
            
            <div className={styles.achievement}>
              <span className={styles.achievementIcon}>🦋</span>
              <div className={styles.achievementText}>
                <div className={styles.achievementTitle}>{t('averageCompletionLabel')}</div>
                <div className={styles.achievementValue}>
                  {taskStats.completionRate}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {plants.length === 0 && (
          <div className={styles.gardenCard}>
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🌱</div>
              <h3 className={styles.emptyTitle}>{t('noSeedsPlantedTitle')}</h3>
              <p className={styles.emptyMessage}>
                {t('startTimerPlantFirstSeed')}<br/>
                {t('beautifulGardenGrows')}
              </p>
            </div>
          </div>
        )}
      </div>
    </IonContent>
  );
}