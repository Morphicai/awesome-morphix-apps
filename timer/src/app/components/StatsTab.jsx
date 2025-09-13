import React, { useState, useEffect } from 'react';
import { IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
import { useTimerStore } from '../stores/timerStore';
import { useTaskStore } from '../stores/taskStore';
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
          label: '오늘'
        };
      case 'week':
        const weekStats = getWeeklyStats();
        return {
          pomodoros: weekStats.pomodoros,
          focusTime: weekStats.focusTime,
          label: '이번 주'
        };
      case 'month':
        const monthStats = getMonthlyStats();
        return {
          pomodoros: monthStats.pomodoros,
          focusTime: monthStats.focusTime,
          label: '이번 달'
        };
      case 'total':
        return {
          pomodoros: timerStats.totalPomodoros,
          focusTime: timerStats.totalFocusTime,
          label: '전체'
        };
      default:
        return {
          pomodoros: 0,
          focusTime: 0,
          label: '오늘'
        };
    }
  };

  const currentStats = getCurrentStats();

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  const getPlantTypeStats = () => {
    const plantCounts = plants.filter(plant => plant).reduce((acc, plant) => {
      acc[plant.type] = (acc[plant.type] || 0) + 1;
      return acc;
    }, {});

    const plantTypes = [
      { type: 'seedling', emoji: '🌱', name: '새싹' },
      { type: 'flower', emoji: '🌿', name: '잎사귀' },
      { type: 'fruit', emoji: '🌸', name: '꽃' },
      { type: 'tree', emoji: '🌳', name: '나무' }
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
        focusTime: dayPlants.length * 25
      });
    }
    
    return days;
  };

  const dailyPattern = getDailyPattern();
  const maxDailyPomodoros = Math.max(...dailyPattern.map(d => d.pomodoros), 1);

  return (
    <div className={styles.container}>
      {/* Period Selector */}
      <div className="garden-card">
        <IonSegment 
          value={selectedPeriod} 
          onIonChange={(e) => setSelectedPeriod(e.detail.value)}
          className={styles.periodSelector}
        >
          <IonSegmentButton value="today">
            <IonLabel>오늘</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="week">
            <IonLabel>주간</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="month">
            <IonLabel>월간</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="total">
            <IonLabel>전체</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </div>

      {/* Main Stats */}
      <div className="garden-card">
        <h3 className="gradient-text">{currentStats.label} 통계</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{currentStats.pomodoros}</div>
            <div className="stat-label">완료한 뽀모도로</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{formatTime(currentStats.focusTime)}</div>
            <div className="stat-label">집중한 시간</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{taskStats.completed}</div>
            <div className="stat-label">완료한 할일</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{taskStats.completionRate}%</div>
            <div className="stat-label">할일 완료율</div>
          </div>
        </div>
      </div>

      {/* Daily Pattern */}
      <div className="garden-card">
        <h3 className="gradient-text">최근 7일 집중 패턴</h3>
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
              <div className={styles.dayValue}>{day.pomodoros}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plant Collection */}
      <div className="garden-card">
        <h3 className="gradient-text">식물 컬렉션</h3>
        <div className={styles.plantCollection}>
          {plantTypeStats.map((plant) => (
            <div key={plant.type} className={styles.plantStat}>
              <div className={styles.plantEmoji}>{plant.emoji}</div>
              <div className={styles.plantInfo}>
                <div className={styles.plantName}>{plant.name}</div>
                <div className={styles.plantCount}>{plant.count}개</div>
              </div>
              <div className={styles.plantProgress}>
                <div 
                  className="garden-progress-fill"
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
      <div className="garden-card">
        <h3 className="gradient-text">성취 요약</h3>
        <div className={styles.achievements}>
          <div className={styles.achievement}>
            <span className={styles.achievementIcon}>🏆</span>
            <div className={styles.achievementText}>
              <div className={styles.achievementTitle}>총 집중 시간</div>
              <div className={styles.achievementValue}>
                {formatTime(timerStats.totalFocusTime)}
              </div>
            </div>
          </div>
          
          <div className={styles.achievement}>
            <span className={styles.achievementIcon}>🌱</span>
            <div className={styles.achievementText}>
              <div className={styles.achievementTitle}>키운 식물</div>
              <div className={styles.achievementValue}>
                {plants.length}개
              </div>
            </div>
          </div>
          
          <div className={styles.achievement}>
            <span className={styles.achievementIcon}>✅</span>
            <div className={styles.achievementText}>
              <div className={styles.achievementTitle}>완료한 할일</div>
              <div className={styles.achievementValue}>
                {taskStats.completed}개
              </div>
            </div>
          </div>
          
          <div className={styles.achievement}>
            <span className={styles.achievementIcon}>📈</span>
            <div className={styles.achievementText}>
              <div className={styles.achievementTitle}>평균 완료율</div>
              <div className={styles.achievementValue}>
                {taskStats.completionRate}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}