import React, { useEffect, useState } from 'react';
import { IonButton, IonIcon, IonSpinner } from '@ionic/react';
import { play, pause, refresh, leaf } from 'ionicons/icons';
import { useTimerStore } from '../stores/timerStore';
import FlowerAnimation from './FlowerAnimation';
import styles from '../styles/TimerTab.module.css';

export default function TimerTab() {
  const {
    timeLeft,
    isRunning,
    isBreak,
    currentSession,
    completedPomodoros,
    startTimer,
    pauseTimer,
    resetTimer,
    tick
  } = useTimerStore();

  const [showAnimation, setShowAnimation] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  
  // 检查数据是否已准备好
  useEffect(() => {
    // 检查关键数据是否已加载
    if (timeLeft !== undefined && timeLeft !== null) {
      setIsDataReady(true);
    }
  }, [timeLeft]);

  // Timer tick effect
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  useEffect(() => {
    if (timeLeft === 0) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);
    }
  }, [timeLeft]);

  const handleStartPause = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionTitle = () => {
    return isBreak ? '휴식 시간' : '집중 시간';
  };

  const getSessionEmoji = () => {
    return isBreak ? '🦋' : '🌱';
  };

  const getProgress = () => {
    const { duration, shortBreak, longBreak, mode, remainingTime } = useTimerStore.getState();
    let totalTime;
    
    switch (mode) {
      case 'shortBreak':
        totalTime = shortBreak;
        break;
      case 'longBreak':
        totalTime = longBreak;
        break;
      default:
        totalTime = duration;
    }
    
    return ((totalTime - remainingTime) / totalTime) * 100;
  };

  // 如果数据未준비好，显示加载状态
  if (!isDataReady) {
    return (
      <div className={styles.loadingContainer}>
        <IonSpinner name="crescent" />
        <p>타이머 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {showAnimation && <FlowerAnimation />}
      
      <div className={styles.gardenBackground}>
        <div className={styles.sessionHeader}>
          <span className={styles.sessionEmoji}>{getSessionEmoji()}</span>
          <h2 className={styles.sessionTitle}>{getSessionTitle()}</h2>
        </div>

        <div className={styles.timerDisplay}>
          <div className={styles.timeCircle}>
            <svg className={styles.progressRing} viewBox="0 0 120 120">
              <circle
                className={styles.progressRingBackground}
                cx="60"
                cy="60"
                r="54"
                fill="transparent"
                stroke="#e0e0e0"
                strokeWidth="4"
              />
              <circle
                className={styles.progressRingProgress}
                cx="60"
                cy="60"
                r="54"
                fill="transparent"
                stroke={isBreak ? "#A0C8E6" : "#4A7C59"}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - getProgress() / 100)}`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className={styles.timeText}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <IonButton
            fill="clear"
            size="large"
            onClick={handleStartPause}
            className={styles.playPauseButton}
          >
            <IonIcon 
              icon={isRunning ? pause : play} 
              size="large"
              style={{ color: isBreak ? "#A0C8E6" : "#4A7C59" }}
            />
          </IonButton>
          
          <IonButton
            fill="clear"
            size="large"
            onClick={resetTimer}
            className={styles.resetButton}
          >
            <IonIcon 
              icon={refresh} 
              size="large"
              style={{ color: "#8B6B4A" }}
            />
          </IonButton>
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <IonIcon icon={leaf} className={styles.statIcon} />
            <span className={styles.statText}>
              오늘 완료: {completedPomodoros}개
            </span>
          </div>
        </div>

        <div className={styles.gardenElements}>
          <div className={styles.tree}>🌳</div>
          <div className={styles.flowers}>
            {Array.from({ length: Math.min(completedPomodoros, 8) }, (_, i) => (
              <span key={i} className={styles.flower} style={{
                left: `${20 + (i % 4) * 20}%`,
                bottom: `${10 + Math.floor(i / 4) * 15}%`,
                animationDelay: `${i * 0.5}s`
              }}>
                🌸
              </span>
            ))}
          </div>
          
          {isBreak && (
            <div className={styles.butterflies}>
              <span className={styles.butterfly}>🦋</span>
              <span className={styles.butterfly} style={{ animationDelay: '2s' }}>🦋</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}