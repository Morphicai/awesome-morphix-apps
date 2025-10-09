import React, { useState, useEffect, useRef } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonProgressBar,
} from '@ionic/react';
import { play, pause, refresh, checkmarkCircle } from 'ionicons/icons';
import { saveFocusSession } from '../services/dataService';
import { useRitualStore } from '../store/ritualStore';
import styles from '../styles/FocusTimer.module.css';

export default function FocusTimer({ onComplete }) {
  const { focusTimer, settings, startFocusTimer, pauseFocusTimer, resumeFocusTimer, updateRemainingTime, resetFocusTimer } = useRitualStore();
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (focusTimer.isRunning) {
      intervalRef.current = setInterval(() => {
        updateRemainingTime(Math.max(0, focusTimer.remainingTime - 1));
        
        if (focusTimer.remainingTime <= 1) {
          handleComplete();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [focusTimer.isRunning, focusTimer.remainingTime]);

  const handleStart = () => {
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }
    startFocusTimer();
  };

  const handlePause = () => {
    pauseFocusTimer();
  };

  const handleResume = () => {
    resumeFocusTimer();
  };

  const handleReset = () => {
    resetFocusTimer();
    setSessionStartTime(null);
  };

  const handleComplete = async () => {
    pauseFocusTimer();
    
    // 保存专注会话
    await saveFocusSession({
      duration: settings?.focusDuration || 1500,
      completed: focusTimer.remainingTime <= 1,
      startTime: sessionStartTime,
      endTime: Date.now(),
    });

    onComplete();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = settings?.focusDuration || 1500;
  const progress = 1 - (focusTimer.remainingTime / totalDuration);

  return (
    <div className={styles.container}>
      <IonCard className={styles.card}>
        <IonCardHeader>
          <IonCardTitle>专注时光</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className={styles.timerDisplay}>
            <div className={styles.timerCircle}>
              <svg className={styles.progressRing} width="200" height="200">
                <circle
                  className={styles.progressRingBackground}
                  cx="100"
                  cy="100"
                  r="90"
                />
                <circle
                  className={styles.progressRingProgress}
                  cx="100"
                  cy="100"
                  r="90"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 90}`,
                    strokeDashoffset: `${2 * Math.PI * 90 * (1 - progress)}`,
                  }}
                />
              </svg>
              <div className={styles.timerText}>
                <span className={styles.timeValue}>{formatTime(focusTimer.remainingTime)}</span>
                <span className={styles.timeLabel}>
                  {focusTimer.isRunning ? '专注中' : '准备开始'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.controls}>
            {!focusTimer.isRunning && focusTimer.remainingTime === totalDuration && (
              <IonButton
                expand="block"
                size="large"
                onClick={handleStart}
                className={styles.startButton}
              >
                <IonIcon icon={play} slot="start" />
                开始专注
              </IonButton>
            )}

            {focusTimer.isRunning && (
              <IonButton
                expand="block"
                size="large"
                onClick={handlePause}
                className={styles.pauseButton}
                fill="outline"
              >
                <IonIcon icon={pause} slot="start" />
                暂停
              </IonButton>
            )}

            {!focusTimer.isRunning && focusTimer.remainingTime < totalDuration && focusTimer.remainingTime > 0 && (
              <div className={styles.pausedControls}>
                <IonButton
                  expand="block"
                  onClick={handleResume}
                  className={styles.resumeButton}
                >
                  <IonIcon icon={play} slot="start" />
                  继续
                </IonButton>
                <IonButton
                  expand="block"
                  onClick={handleReset}
                  fill="outline"
                  color="medium"
                >
                  <IonIcon icon={refresh} slot="start" />
                  重置
                </IonButton>
              </div>
            )}

            {focusTimer.remainingTime === 0 && (
              <div className={styles.completeContainer}>
                <IonIcon icon={checkmarkCircle} className={styles.completeIcon} color="success" />
                <h2 className={styles.completeTitle}>🎉 太棒了！</h2>
                <p className={styles.completeText}>你完成了一次专注仪式</p>
                <IonButton
                  expand="block"
                  onClick={handleComplete}
                  className={styles.finishButton}
                >
                  完成仪式
                </IonButton>
              </div>
            )}
          </div>

          <div className={styles.tips}>
            <p className={styles.tipText}>💡 保持深呼吸，专注当下的任务</p>
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  );
}

