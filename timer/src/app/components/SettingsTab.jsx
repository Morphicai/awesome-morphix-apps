import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon, IonToggle, IonRange, IonItem, IonLabel, IonPage, IonContent, IonModal } from '@ionic/react';
import { notifications, volume, download, trash, informationCircle, close } from 'ionicons/icons';
import { PageHeader } from '@morphixai/components';
import { useTimerStore } from '../stores/timerStore';
import { useTaskStore } from '../stores/taskStore';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { t, addLanguageListener, formatTime } from '../utils/i18n';
import { getSetting, getLanguageSetting, getTimerSetting, getThemeSetting, updateSetting } from '../utils/dataHelpers';
import LanguageSelector from './LanguageSelector';
import Loading from './Loading';
import styles from '../styles/SettingsTab.module.css';

export default function SettingsTab() {
  const { plants, completedPomodoros, totalFocusTime } = useTimerStore();
  const { tasks } = useTaskStore();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(50);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('ko');
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [animatedValues, setAnimatedValues] = useState({
    pomodoros: 0,
    focusTime: 0,
    completedTasks: 0
  });

  useEffect(() => {
    const unsubscribe = addLanguageListener((newLanguage) => {
      setCurrentLanguage(newLanguage);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const [languageSettings, timerSettings, themeSettings] = await Promise.all([
          getLanguageSetting(),
          getTimerSetting(), 
          getThemeSetting()
        ]);
        
        setSettings({
          language: languageSettings,
          timer: timerSettings,
          theme: themeSettings
        });
        
        if (timerSettings) {
          setNotificationsEnabled(timerSettings.notifications ?? true);
          setSoundEnabled(timerSettings.sound ?? true);
        }
        
        if (languageSettings) {
          setCurrentLanguage(languageSettings.current || 'ko');
        }
        
      } catch (error) {
        await reportError(error, 'JavaScriptError', { 
          component: 'SettingsTab',
          context: 'loadSettings'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  useEffect(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    
    const animateValue = (start, end, duration, key) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        
        setAnimatedValues(prev => ({ ...prev, [key]: current }));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    };

    setTimeout(() => animateValue(0, completedPomodoros, 1000, 'pomodoros'), 300);
    setTimeout(() => animateValue(0, totalFocusTime, 1200, 'focusTime'), 600);
    setTimeout(() => animateValue(0, completedTasks, 800, 'completedTasks'), 900);
  }, [completedPomodoros, totalFocusTime, tasks]);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        plants,
        tasks,
        stats: {
          completedPomodoros,
          totalFocusTime,
          exportDate: new Date().toISOString()
        }
      };

      const dataString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataString], { type: 'application/json' });
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      const filename = `nature-garden-pomodoro-${new Date().toISOString().split('T')[0]}.json`;
      
      await AppSdk.fileSystem.downloadFile({
        url: base64Data,
        filename
      });

    } catch (error) {
      await reportError(error, 'JavaScriptError', { component: 'SettingsTab' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm(t('confirmClearData'))) {
      try {
        await AppSdk.appData.deleteData({
          collection: 'timer',
          id: 'current'
        });

        try {
          await AppSdk.appData.deleteData({
            collection: 'tasks',
            id: 'list'
          });
        } catch (error) {
          console.log('tasks/list document not found or already deleted');
        }

        for (const task of tasks) {
          try {
            await AppSdk.appData.deleteData({
              collection: 'tasks',
              id: task.id
            });
          } catch (error) {
            console.log(`Failed to delete task ${task.id}:`, error);
          }
        }

        try {
          await AppSdk.appData.deleteData({
            collection: 'stats',
            id: 'history'
          });
        } catch (error) {
          console.log('stats/history document not found or already deleted');
        }

        window.location.reload();
      } catch (error) {
        await reportError(error, 'JavaScriptError', { component: 'SettingsTab' });
      }
    }
  };

  const formatTimeNatural = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return t('timeFormat', { hours, minutes });
    }
    if (minutes > 0) {
      return t('minutesOnly', { minutes });
    }
    return t('notStarted');
  };

  const getGardenStartDate = () => {
    if (plants.length === 0) {
      return t('startingToday');
    }
    const firstPlant = plants.reduce((earliest, plant) => 
      plant.completedAt < earliest.completedAt ? plant : earliest
    );
    const startDate = new Date(firstPlant.completedAt);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return t('startedYesterday');
    } else if (diffDays < 7) {
      return t('startedDaysAgo', { days: diffDays });
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return t('startedWeeksAgo', { weeks });
    } else {
      const months = Math.floor(diffDays / 30);
      return t('startedMonthsAgo', { months });
    }
  };

  const getProgressPercentage = () => {
    if (completedPomodoros === 0) return 0;
    const targetPomodoros = 50;
    return Math.min((completedPomodoros / targetPomodoros) * 100, 100);
  };

  const getAchievementLevel = () => {
    if (completedPomodoros >= 100) return { 
      title: t('gardenMaster'), 
      color: '#E91E63', 
      description: t('gardenMasterDesc') 
    };
    if (completedPomodoros >= 50) return { 
      title: t('skilledGardener'), 
      color: '#9C27B0', 
      description: t('skilledGardenerDesc') 
    };
    if (completedPomodoros >= 20) return { 
      title: t('growingGardener'), 
      color: '#4CAF50', 
      description: t('growingGardenerDesc') 
    };
    if (completedPomodoros >= 5) return { 
      title: t('sproutGardener'), 
      color: '#8BC34A', 
      description: t('sproutGardenerDesc') 
    };
    return { 
      title: t('seedPlanting'), 
      color: '#795548', 
      description: t('seedPlantingDesc') 
    };
  };

  const getMotivationalMessage = (type, value) => {
    const messageKeys = {
      pomodoros: {
        0: "plantFirstSeed",
        1: "sproutGrowing",
        5: "flowersBloom",
        20: "gardenInFullBloom",
        50: "amazingGardener"
      },
      tasks: {
        0: "completeFirstTask",
        1: "goodStart",
        5: "consistentAchievement",
        10: "excellentExecution"
      },
      time: {
        0: "gardenAwaits",
        900: "good15MinFocus",
        1800: "good30MinFocus",
        3600: "excellent1HourFocus"
      }
    };

    const getMessageForValue = (messageObj, val) => {
      const keys = Object.keys(messageObj).map(Number).sort((a, b) => b - a);
      for (const key of keys) {
        if (val >= key) return t(messageObj[key]);
      }
      return t(messageObj[0]);
    };

    return getMessageForValue(messageKeys[type], value);
  };

  const handleCardClick = (cardData) => {
    setSelectedCard(cardData);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <IonPage>
        <PageHeader title={t('settingsTitle')} />
        <IonContent>
          <Loading 
            isVisible={isLoading} 
            message={t('loadingSettings') || '설정을 불러오는 중...'} 
          />
        </IonContent>
      </IonPage>
    );
  }

  const completedTasks = tasks.filter(task => task.completed).length;
  const achievement = getAchievementLevel();

  const gardenCards = [
    {
      id: 'focus-sessions',
      icon: '🌱',
      title: t('plantedSeeds'),
      subtitle: t('focusSessions'),
      value: animatedValues.pomodoros,
      realValue: completedPomodoros,
      description: t('completedPomodoroSessions'),
      message: getMotivationalMessage('pomodoros', completedPomodoros),
      progress: getProgressPercentage(),
      details: {
        total: completedPomodoros,
        today: Math.min(completedPomodoros, 3),
        thisWeek: Math.min(completedPomodoros, 15),
        target: 50,
        streak: Math.min(completedPomodoros, 7)
      }
    },
    {
      id: 'grown-sprouts',
      icon: '🌿',
      title: t('grownSprouts'),
      subtitle: t('completedPomodoros'),
      value: animatedValues.pomodoros,
      realValue: completedPomodoros,
      description: t('successfulFocusTime'),
      message: completedPomodoros > 0 ? t('beautifulSprouts', { count: completedPomodoros }) : t('growFirstSprout'),
      progress: (completedPomodoros / 25) * 100,
      details: {
        efficiency: completedPomodoros > 0 ? Math.min(95, 70 + completedPomodoros * 2) : 0,
        avgSession: 25,
        bestStreak: Math.min(completedPomodoros, 10),
        totalDays: Math.min(Math.ceil(completedPomodoros / 3), 30)
      }
    },
    {
      id: 'bloomed-flowers',
      icon: '🌸',
      title: t('bloomedFlowers'),
      subtitle: t('completedTasks'),
      value: animatedValues.completedTasks,
      realValue: completedTasks,
      description: t('achievedTasks'),
      message: getMotivationalMessage('tasks', completedTasks),
      progress: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0,
      details: {
        completed: completedTasks,
        pending: tasks.length - completedTasks,
        completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
        productivity: completedTasks > 0 ? t('high') : t('startingStage')
      }
    },
    {
      id: 'butterfly-rest',
      icon: '🦋',
      title: t('butterflyRest'),
      subtitle: t('restTime'),
      value: Math.floor(animatedValues.focusTime / 5),
      realValue: Math.floor(totalFocusTime / 5),
      description: t('healthyRestPattern'),
      message: totalFocusTime > 0 ? t('balancedRest') : t('restIsImportant'),
      progress: Math.min((Math.floor(totalFocusTime / 5) / 60) * 100, 100),
      details: {
        totalBreaks: Math.floor(totalFocusTime / 1500),
        avgBreakTime: 5,
        restQuality: totalFocusTime > 0 ? t('good') : t('measuring'),
        balance: totalFocusTime > 0 ? t('balanced') : t('startingStage')
      }
    },
    {
      id: 'garden-time',
      icon: '🌺',
      title: t('gardenTime'),
      subtitle: t('recordedTime'),
      value: Math.floor(animatedValues.focusTime / 60),
      realValue: Math.floor(totalFocusTime / 60),
      description: t('totalFocusTime'),
      message: getMotivationalMessage('time', totalFocusTime),
      progress: Math.min((totalFocusTime / 18000) * 100, 100),
      details: {
        totalMinutes: Math.floor(totalFocusTime / 60),
        totalHours: Math.floor(totalFocusTime / 3600),
        avgDaily: Math.floor(totalFocusTime / Math.max(1, Math.ceil(completedPomodoros / 3)) / 60),
        focusQuality: totalFocusTime > 3600 ? t('excellent') : totalFocusTime > 1800 ? t('good') : t('startingStage')
      }
    },
    {
      id: 'gardener-level',
      icon: '🌳',
      title: t('gardenerLevel'),
      subtitle: t('consecutiveDays'),
      value: Math.min(completedPomodoros, 30),
      realValue: Math.min(completedPomodoros, 30),
      description: t('consistentGrowthRecord'),
      message: completedPomodoros > 7 ? t('becomingSteadyGardener') : t('growDailySlowly'),
      progress: Math.min((completedPomodoros / 30) * 100, 100),
      details: {
        currentStreak: Math.min(completedPomodoros, 15),
        bestStreak: Math.min(completedPomodoros, 20),
        level: Math.floor(completedPomodoros / 10) + 1,
        nextLevelIn: 10 - (completedPomodoros % 10)
      }
    }
  ];

  return (
    <IonPage>
      <PageHeader title={t('settingsTitle')} />
      <IonContent>
        <div className={styles.container}>
          <div className="garden-card">
            <h3 className="gradient-text">{t('appInfo')}</h3>
            <div className={styles.appInfo}>
              <p className={styles.appDescription}>
                {t('appDescription')}
              </p>
              <div className={styles.version}>{t('version')}</div>
            </div>
          </div>

          <div className="garden-card">
            <h3 className="gradient-text">🌍 {t('languageSettings')}</h3>
            <div className={styles.languageSection}>
              <div className={styles.languageInfo}>
                <p className={styles.languageDescription}>
                  {currentLanguage === 'ko' 
                    ? '언어를 변경하여 앱을 더 편리하게 사용하세요' 
                    : '更改语言以更方便地使用应用'}
                </p>
                <div className={styles.currentLanguageDisplay}>
                  <span className={styles.currentLanguageLabel}>{t('currentLanguage')}:</span>
                  <span className={styles.currentLanguageValue}>
                    {currentLanguage === 'ko' ? '🇰🇷 한국어' : '🇨🇳 中文'}
                  </span>
                </div>
              </div>
              <div className={styles.languageSelectorContainer}>
                <LanguageSelector />
              </div>
            </div>
          </div>

          <div className="garden-card">
            <h3 className="gradient-text">🌺 {t('myGardenDiary')}</h3>
            
            <div className={styles.achievementBadge}>
              <span className={styles.achievementIcon}>{achievement.title.split(' ')[0]}</span>
              <div className={styles.achievementText}>
                <div className={styles.achievementTitle}>{achievement.title.split(' ').slice(1).join(' ')}</div>
                <div className={styles.achievementSubtitle}>{achievement.description}</div>
              </div>
            </div>

            <div className={styles.todaySection}>
              <h4 className={styles.sectionTitle}>📊 {t('todayAchievements')}</h4>
              <div className={styles.todayStats}>
                <div className={styles.todayStat}>
                  <span className={styles.todayIcon}>🌱</span>
                  <span className={styles.todayValue}>{Math.min(completedPomodoros, 3)}{t('count')}</span>
                  <span className={styles.todayLabel}>{t('focusSessions')}</span>
                </div>
                <div className={styles.todayStat}>
                  <span className={styles.todayIcon}>🌸</span>
                  <span className={styles.todayValue}>{Math.min(completedTasks, 5)}{t('count')}</span>
                  <span className={styles.todayLabel}>{t('completedTasks')}</span>
                </div>
                <div className={styles.todayStat}>
                  <span className={styles.todayIcon}>⏰</span>
                  <span className={styles.todayValue}>{Math.floor(Math.min(totalFocusTime, 7200) / 60)}{t('minutes')}</span>
                  <span className={styles.todayLabel}>{t('focusTime')}</span>
                </div>
              </div>
              <div className={styles.todayMessage}>
                {completedPomodoros > 0 ? t('keepBeautifyingGarden') : t('plantFirstSeed')}
              </div>
            </div>

            <div className={styles.gardenStatsGrid}>
              {gardenCards.map((card, index) => (
                <div 
                  key={card.id}
                  className={`${styles.gardenStatCard} ${styles.interactive}`}
                  onClick={() => handleCardClick(card)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.statIcon}>{card.icon}</div>
                    <IonIcon 
                      icon={informationCircle} 
                      className={styles.infoIcon}
                    />
                  </div>
                  
                  <div className={styles.statContent}>
                    <div className={styles.statTitle}>{card.title}</div>
                    <div className={styles.statSubtitle}>{card.subtitle}</div>
                    
                    <div className={styles.statValue}>
                      {card.realValue === 0 ? (
                        <span className={styles.emptyState}>{t('noneYet')}</span>
                      ) : (
                        <span className={styles.countUp}>{card.value}</span>
                      )}
                    </div>

                    {card.progress > 0 && (
                      <div className={styles.progressContainer}>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill} 
                            style={{ width: `${Math.min(card.progress, 100)}%` }}
                          ></div>
                        </div>
                        <span className={styles.progressText}>{Math.round(card.progress)}%</span>
                      </div>
                    )}

                    <div className={styles.encouragement}>{card.message}</div>
                  </div>

                  <div className={styles.cardGlow}></div>
                </div>
              ))}
            </div>

            {completedPomodoros === 0 && (
              <div className={styles.emptyGardenMessage}>
                <div className={styles.emptyGardenIcon}>🌱</div>
                <h4>{t('noSeedsPlanted')}</h4>
                <p>{t('startTimerMessage')}</p>
                <div className={styles.startButton}>
                  <span>{t('startFromTimerTab')} →</span>
                </div>
              </div>
            )}

            <div className={styles.motivationalQuotes}>
              <div className={styles.quote}>
                <span className={styles.quoteIcon}>🌿</span>
                <span className={styles.quoteText}>
                  {completedPomodoros > 20 ? t('gardenGrowingLush') :
                   completedPomodoros > 5 ? t('steadyEffortBloomsFlowers') :
                   t('growSlowlyButSteadily')}
                </span>
              </div>
            </div>
          </div>

          <div className="garden-card">
            <h3 className="gradient-text">{t('gardenPreview')}</h3>
            <div className={styles.gardenPreview}>
              {plants.length === 0 ? (
                <div className={styles.emptyGarden}>
                  <span className={styles.seedling}>🌱</span>
                  <p>{t('noPlants')}</p>
                  <p>{t('completeFirstPomodoro')}</p>
                </div>
              ) : (
                <div className={styles.plantGarden}>
                  {plants.slice(-20).map((plant, index) => {
                    const plantEmojis = {
                      seedling: '🌱',
                      flower: '🌿',
                      fruit: '🌸',
                      tree: '🌳'
                    };
                    return (
                      <span 
                        key={plant.id} 
                        className={styles.gardenPlant}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {plantEmojis[plant.type] || '🌱'}
                      </span>
                    );
                  })}
                  {plants.length > 20 && (
                    <div className={styles.morePlants}>
                      +{plants.length - 20}{t('morePlants')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h3>{selectedCard?.icon} {selectedCard?.title}</h3>
                <IonButton 
                  fill="clear" 
                  onClick={() => setIsModalOpen(false)}
                  className={styles.closeButton}
                >
                  <IonIcon icon={close} />
                </IonButton>
              </div>
              
              {selectedCard && (
                <div className={styles.modalBody}>
                  <div className={styles.modalStats}>
                    <div className={styles.modalMainStat}>
                      <span className={styles.modalMainValue}>{selectedCard.realValue}</span>
                      <span className={styles.modalMainLabel}>{selectedCard.subtitle}</span>
                    </div>
                    
                    <div className={styles.modalDetailStats}>
                      {Object.entries(selectedCard.details).map(([key, value]) => (
                        <div key={key} className={styles.modalDetailStat}>
                          <span className={styles.modalDetailLabel}>
                            {t(`detail_${key}`, key)}
                          </span>
                          <span className={styles.modalDetailValue}>
                            {typeof value === 'number' ? 
                              (key.includes('Rate') ? `${value}%` : value) : 
                              value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.modalMessage}>
                    <p>{selectedCard.message}</p>
                  </div>
                </div>
              )}
            </div>
          </IonModal>
        </div>
      </IonContent>
    </IonPage>
  );
}