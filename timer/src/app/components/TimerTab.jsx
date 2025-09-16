import React, { useEffect, useState } from 'react';
import { IonButton, IonIcon, IonSpinner, IonSelect, IonSelectOption, IonAlert, IonContent } from '@ionic/react';
import { play, pause, refresh, leaf, checkmarkCircle, chevronDown } from 'ionicons/icons';
import { useTimerStore } from '../stores/timerStore';
import { useTaskStore } from '../stores/taskStore';
import FlowerAnimation from './FlowerAnimation';
import GardenFairy from './GardenFairy';
import { t, addLanguageListener } from '../utils/i18n';
import styles from '../styles/TimerTab.module.css';

export default function TimerTab() {
  const {
    remainingTime,
    isRunning,
    mode,
    currentSession,
    completedPomodoros,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    restoreTimer
  } = useTimerStore();

  const {
    tasks,
    loadTasks,
    toggleTask
  } = useTaskStore();

  const [showAnimation, setShowAnimation] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('ko');
  const [isAppVisible, setIsAppVisible] = useState(true);
  
  // 监听语言变化
  useEffect(() => {
    const unsubscribe = addLanguageListener((newLanguage) => {
      setCurrentLanguage(newLanguage);
    });
    return unsubscribe;
  }, []);

  // App visibility and lifecycle management
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsAppVisible(isVisible);
      
      if (isVisible) {
        // App became visible, restore timer state
        console.log('App became visible, restoring timer...');
        restoreTimer();
      }
    };

    const handleFocus = () => {
      console.log('App gained focus, restoring timer...');
      setIsAppVisible(true);
      restoreTimer();
    };

    const handleBlur = () => {
      console.log('App lost focus');
      setIsAppVisible(false);
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Initial restore when component mounts
    restoreTimer();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [restoreTimer]);

  useEffect(() => {
    if (remainingTime !== undefined && remainingTime !== null) {
      setIsDataReady(true);
    }
  }, [remainingTime]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Timer tick - only when app is visible or for background sync
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  // Background timer sync - check every 30 seconds when app is hidden
  useEffect(() => {
    let backgroundInterval;
    
    if (isRunning && !isAppVisible) {
      backgroundInterval = setInterval(() => {
        console.log('Background sync - restoring timer state');
        restoreTimer();
      }, 30000); // Check every 30 seconds
    }
    
    return () => {
      if (backgroundInterval) {
        clearInterval(backgroundInterval);
      }
    };
  }, [isRunning, isAppVisible, restoreTimer]);

  const isBreak = mode === 'shortBreak' || mode === 'longBreak';

  useEffect(() => {
    if (remainingTime === 0 && !isBreak && selectedTaskId) {
      setShowAnimation(true);
      setShowCompletionAlert(true);
      setTimeout(() => setShowAnimation(false), 3000);
    } else if (remainingTime === 0) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);
    }
  }, [remainingTime, isBreak, selectedTaskId]);

  const handleStartPause = async () => {
    if (isRunning) {
      await pauseTimer();
    } else {
      await startTimer();
    }
  };

  const handleReset = async () => {
    await resetTimer();
  };

  const handleTaskComplete = async () => {
    if (selectedTaskId) {
      await toggleTask(selectedTaskId);
      setSelectedTaskId(null);
    }
    setShowCompletionAlert(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionTitle = () => {
    return isBreak ? t('butterflyRest') : t('focusSession');
  };

  const getSessionEmoji = () => {
    if (isBreak) {
      return '🦋';
    }
    
    const { duration, remainingTime } = useTimerStore.getState();
    const elapsed = duration - remainingTime;
    const progress = elapsed / duration;
    
    if (progress < 0.3) {
      return '🌱';
    } else if (progress < 0.7) {
      return '🌿';
    } else {
      return '🌸';
    }
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

  const getSelectedTask = () => {
    return tasks.find(task => task.id === selectedTaskId);
  };

  const getIncompleteTasks = () => {
    return tasks.filter(task => !task.completed);
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      high: '🌹',
      medium: '🌻', 
      low: '🌿'
    };
    return icons[priority] || '🌻';
  };

  // Show background timer indicator
  const getTimerStatusMessage = () => {
    if (!isRunning) return null;
    
    if (!isAppVisible) {
      return (
        <div className={styles.backgroundTimerIndicator}>
          <span className={styles.backgroundIcon}>🌱</span>
          <span className={styles.backgroundText}>
            {isBreak ? '휴식 중 (백그라운드)' : '집중 중 (백그라운드)'}
          </span>
        </div>
      );
    }
    
    return null;
  };

  if (!isDataReady) {
    return (
      <IonContent style={{ '--background': '#FFFFFF' }}>
        <div className={styles.loadingContainer}>
          <IonSpinner name="crescent" />
          <p>{t('loadingTimer')}</p>
        </div>
      </IonContent>
    );
  }

  const incompleteTasks = getIncompleteTasks();
  const selectedTask = getSelectedTask();

  return (
    <IonContent style={{ '--background': '#FFFFFF' }}>
      <div className={styles.container}>
        {showAnimation && <FlowerAnimation />}
        
        {getTimerStatusMessage()}
        
        <GardenFairy
          isTimerRunning={isRunning}
          isBreak={isBreak}
          completedPomodoros={completedPomodoros}
          selectedTask={selectedTask}
          timeLeft={remainingTime}
        />
        
        <div className={styles.gardenBackground}>
          <div className={styles.taskSelection}>
            <h3 className={styles.taskSelectionTitle}>
              🌱 {t('selectTask')}
            </h3>
            
            {incompleteTasks.length > 0 ? (
              <div className={styles.taskSelectContainer}>
                <IonSelect
                  value={selectedTaskId}
                  placeholder={t('selectTaskPlaceholder')}
                  onIonChange={(e) => setSelectedTaskId(e.detail.value)}
                  className={styles.taskSelect}
                  interface="popover"
                >
                  {incompleteTasks.map(task => (
                    <IonSelectOption key={task.id} value={task.id}>
                      <div className={styles.taskOption}>
                        <span className={styles.taskPriorityIcon}>
                          {getPriorityIcon(task.priority)}
                        </span>
                        <span className={styles.taskText}>{task.text}</span>
                      </div>
                    </IonSelectOption>
                  ))}
                </IonSelect>
                <IonIcon icon={chevronDown} className={styles.selectIcon} />
              </div>
            ) : (
              <div className={styles.noTasksMessage}>
                <span className={styles.noTasksIcon}>🌺</span>
                <p>{t('noTasks')}</p>
              </div>
            )}
          </div>

          {selectedTask ? (
            <div className={styles.selectedTaskDisplay}>
              <div className={styles.selectedTaskCard}>
                <span className={styles.selectedTaskIcon}>
                  {getPriorityIcon(selectedTask.priority)}
                </span>
                <div className={styles.selectedTaskInfo}>
                  <h4 className={styles.selectedTaskTitle}>🌸 {t('currentTask')}</h4>
                  <p className={styles.selectedTaskText}>{selectedTask.text}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.noSelectedTask}>
              <span className={styles.encourageIcon}>🌱</span>
              <p>{t('encourageStart')}</p>
            </div>
          )}

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
                  stroke="rgba(200, 230, 201, 0.3)"
                  strokeWidth="4"
                />
                <circle
                  className={styles.progressRingProgress}
                  cx="60"
                  cy="60"
                  r="54"
                  fill="transparent"
                  stroke={isBreak ? "#A0C8E6" : "#2E7D32"}
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - getProgress() / 100)}`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className={styles.timeText}>
                {formatTime(remainingTime)}
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
              />
              <span className={styles.buttonText}>
                {isRunning ? t('pause') : t('start')}
              </span>
            </IonButton>
            
            <IonButton
              fill="clear"
              size="large"
              onClick={handleReset}
              className={styles.resetButton}
            >
              <IonIcon 
                icon={refresh} 
                size="large"
              />
              <span className={styles.buttonText}>{t('reset')}</span>
            </IonButton>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>🌸</span>
              <span className={styles.statText}>
                {t('completedFlowers', { count: completedPomodoros })}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>🌺</span>
              <span className={styles.statText}>
                {t('todayCompleted', { count: completedPomodoros })}
              </span>
            </div>
          </div>

          <div className={styles.gardenElements}>
            <div className={styles.backgroundTrees}>
              <span className={styles.tree} style={{ left: '10%', top: '20%' }}>🌳</span>
              <span className={styles.tree} style={{ right: '15%', top: '15%' }}>🌲</span>
              <span className={styles.tree} style={{ left: '80%', top: '25%' }}>🌳</span>
            </div>
            
            <div className={styles.growingPlants}>
              {isRunning && !isBreak && (
                <div className={styles.plantGrowth}>
                  <span className={styles.growingPlant}>🌱</span>
                  <span className={styles.growingPlant} style={{ animationDelay: '1s' }}>🌿</span>
                  <span className={styles.growingPlant} style={{ animationDelay: '2s' }}>🌸</span>
                </div>
              )}
            </div>
            
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
                <span className={styles.butterfly} style={{ animationDelay: '4s' }}>🦋</span>
              </div>
            )}
            
            <div className={styles.clouds}>
              <span className={styles.cloud} style={{ left: '20%', top: '10%' }}>☁️</span>
              <span className={styles.cloud} style={{ right: '30%', top: '5%' }}>☁️</span>
            </div>
          </div>
        </div>

        <IonAlert
          isOpen={showCompletionAlert}
          onDidDismiss={() => setShowCompletionAlert(false)}
          header={`🌸 ${t('pomodoroComplete')}`}
          message={selectedTask ? t('taskCompleteQuestion', { task: selectedTask.text }) : t('pomodoroComplete')}
          buttons={[
            {
              text: t('stillWorking'),
              role: 'cancel',
              handler: () => {
                setShowCompletionAlert(false);
              }
            },
            {
              text: t('completed'),
              handler: handleTaskComplete
            }
          ]}
        />
      </div>
    </IonContent>
  );
}