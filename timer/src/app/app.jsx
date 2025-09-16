import React, { useState, useEffect } from 'react';
import { IonApp, IonTabs, IonTab, IonTabBar, IonTabButton, IonIcon, IonContent, IonPage } from '@ionic/react';
import { leaf, list, barChart, settings } from 'ionicons/icons';
import { PageHeader } from '@morphixai/components';
import { reportError } from '@morphixai/lib';
import AppSdk from '@morphixai/app-sdk';
import TimerTab from './components/TimerTab';
import TasksTab from './components/TasksTab';
import StatsTab from './components/StatsTab';
import SettingsTab from './components/SettingsTab';
import Loading from './components/Loading';
import ErrorToast from './components/ErrorToast';
import { useTimerStore } from './stores/timerStore';
import { useTaskStore } from './stores/taskStore';
import { t, addLanguageListener } from './utils/i18n';
import './styles/global.css';

let isInitializing = false;
let initializationPromise = null;

const initializeAppData = async () => {
  if (isInitializing) {
    return initializationPromise;
  }
  
  isInitializing = true;
  console.log("正在初始化应用数据...");
  
  initializationPromise = (async () => {
    try {
      try {
        const timerData = await AppSdk.appData.getData({
          collection: "timer",
          id: "current"
        });
        if (timerData) {
          console.log("已找到timer数据:", timerData);
        } else {
          console.log("timer数据为null，正在创建默认设置...");
          await AppSdk.appData.createData({
            collection: "timer",
            data: {
              id: "current",
              duration: 25 * 60,
              shortBreak: 5 * 60,
              longBreak: 15 * 60,
              cycles: 4,
              currentCycle: 1,
              isRunning: false,
              remainingTime: 25 * 60,
              mode: "focus",
              completedPomodoros: 0,
              totalFocusTime: 0,
              plants: [],
              lastUpdated: Date.now()
            }
          });
          console.log("成功创建timer默认数据");
        }
      } catch (error) {
        console.log("获取timer数据时发生错误，正在创建默认设置...");
        await AppSdk.appData.createData({
          collection: "timer",
          data: {
            id: "current",
            duration: 25 * 60,
            shortBreak: 5 * 60,
            longBreak: 15 * 60,
            cycles: 4,
            currentCycle: 1,
            isRunning: false,
            remainingTime: 25 * 60,
            mode: "focus",
            completedPomodoros: 0,
            totalFocusTime: 0,
            plants: [],
            lastUpdated: Date.now()
          }
        });
        console.log("成功创建timer默认数据");
      }
      
      try {
        const tasksData = await AppSdk.appData.getData({
          collection: "tasks",
          id: "list"
        });
        if (tasksData) {
          console.log("已找到tasks数据:", tasksData);
        } else {
          console.log("tasks数据为null，正在创建默认设置...");
          await AppSdk.appData.createData({
            collection: "tasks",
            data: {
              id: "list",
              items: []
            }
          });
          console.log("成功创建tasks默认数据");
        }
      } catch (error) {
        console.log("获取tasks数据时发生错误，正在创建默认设置...");
        await AppSdk.appData.createData({
          collection: "tasks",
          data: {
            id: "list",
            items: []
          }
        });
        console.log("成功创建tasks默认数据");
      }
      
      try {
        const statsData = await AppSdk.appData.getData({
          collection: "stats",
          id: "history"
        });
        if (statsData) {
          console.log("已找到stats数据:", statsData);
        } else {
          console.log("stats数据为null，正在创建默认设置...");
          await AppSdk.appData.createData({
            collection: "stats",
            data: {
              id: "history",
              completed: [],
              plants: []
            }
          });
          console.log("成功创建stats默认数据");
        }
      } catch (error) {
        console.log("获取stats数据时发生错误，正在创建默认设置...");
        await AppSdk.appData.createData({
          collection: "stats",
          data: {
            id: "history",
            completed: [],
            plants: []
          }
        });
        console.log("成功创建stats默认数据");
      }
      
      try {
        const languageData = await AppSdk.appData.getData({
          collection: "settings",
          id: "language"
        });
        if (languageData) {
          console.log("已找到language设置:", languageData);
        } else {
          console.log("language设置为null，正在创建默认设置...");
          await AppSdk.appData.createData({
            collection: "settings",
            data: {
              id: "language",
              current: "ko",
              available: ["ko", "zh"],
              autoDetect: true
            }
          });
          console.log("成功创建language默认设置");
        }
      } catch (error) {
        console.log("获取language设置时发生错误，正在创建默认设置...");
        await AppSdk.appData.createData({
          collection: "settings",
          data: {
            id: "language",
            current: "ko",
            available: ["ko", "zh"],
            autoDetect: true
          }
        });
        console.log("成功创建language默认设置");
      }
      
      try {
        const timerSettingsData = await AppSdk.appData.getData({
          collection: "settings",
          id: "timer"
        });
        if (timerSettingsData) {
          console.log("已找到timer设置:", timerSettingsData);
        } else {
          console.log("timer设置为null，正在创建默认设置...");
          await AppSdk.appData.createData({
            collection: "settings",
            data: {
              id: "timer",
              keepScreenOn: false,
              backgroundMode: true,
              notifications: true,
              sound: true
            }
          });
          console.log("成功创建timer默认设置");
        }
      } catch (error) {
        console.log("获取timer设置时发生错误，正在创建默认设置...");
        await AppSdk.appData.createData({
          collection: "settings",
          data: {
            id: "timer",
            keepScreenOn: false,
            backgroundMode: true,
            notifications: true,
            sound: true
          }
        });
        console.log("成功创建timer默认设置");
      }
      
      try {
        const themeData = await AppSdk.appData.getData({
          collection: "settings",
          id: "theme"
        });
        if (themeData) {
          console.log("已找到theme设置:", themeData);
        } else {
          console.log("theme设置为null，正在创建默认设置...");
          await AppSdk.appData.createData({
            collection: "settings",
            data: {
              id: "theme",
              mode: "light",
              gardenStyle: "natural"
            }
          });
          console.log("成功创建theme默认设置");
        }
      } catch (error) {
        console.log("获取theme设置时发生错误，正在创建默认设置...");
        await AppSdk.appData.createData({
          collection: "settings",
          data: {
            id: "theme",
            mode: "light",
            gardenStyle: "natural"
          }
        });
        console.log("成功创建theme默认设置");
      }
      
      console.log("应用数据初始化完成");
    } catch (error) {
      console.error("应用数据初始化失败:", error);
      throw error;
    } finally {
      isInitializing = false;
    }
  })();
  
  return initializationPromise;
};

export default function App() {
  const { initializeTimer } = useTimerStore();
  const { loadTasks } = useTaskStore();
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('ko');

  useEffect(() => {
    const unsubscribe = addLanguageListener((newLanguage) => {
      setCurrentLanguage(newLanguage);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkDataInitialization = async () => {
      try {
        await initializeAppData();
        
        console.log('Starting app initialization...');
        
        await initializeTimer();
        console.log('Timer initialized successfully');
        
        await loadTasks();
        console.log('Tasks loaded successfully');
        
        setIsDataInitialized(true);
        console.log('App initialization completed');
      } catch (error) {
        console.error('App initialization failed:', error);
        setInitError(error);
        await reportError(error, 'JavaScriptError', { 
          component: 'App',
          context: 'initialization'
        });
      }
    };
    
    checkDataInitialization();
  }, [initializeTimer, loadTasks]);
  
  const showLoading = !isDataInitialized && !initError;
  console.log('showLoading', showLoading);
  
  return (
    <IonApp>
      <Loading 
        isVisible={showLoading} 
        message={t('loadingGarden')} 
      />
      
      {initError ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2>{t('error')}</h2>
          <p>{t('retry')}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4A7C59',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {t('retry')}
          </button>
        </div>
      ) : isDataInitialized ? (
        <IonTabs>
          <IonTab tab="timer">
            <IonPage>
              <PageHeader title={t('appTitle')} />
              <IonContent>
                <TimerTab />
              </IonContent>
            </IonPage>
          </IonTab>
          
          <IonTab tab="tasks">
            <TasksTab />
          </IonTab>
          
          <IonTab tab="stats">
            <IonPage>
              <PageHeader title={t('gardenStats')} />
              <IonContent>
                <StatsTab />
              </IonContent>
            </IonPage>
          </IonTab>
          
          <IonTab tab="settings">
            <SettingsTab />
          </IonTab>

          <IonTabBar slot="bottom" className="garden-tab-bar">
            <IonTabButton tab="timer" className="tab-button">
              <IonIcon icon={leaf} />
              {t('timer')}
            </IonTabButton>
            <IonTabButton tab="tasks" className="tab-button">
              <IonIcon icon={list} />
              {t('tasks')}
            </IonTabButton>
            <IonTabButton tab="stats" className="tab-button">
              <IonIcon icon={barChart} />
              {t('stats')}
            </IonTabButton>
            <IonTabButton tab="settings" className="tab-button">
              <IonIcon icon={settings} />
              {t('settings')}
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      ) : null}
      
      <ErrorToast />
    </IonApp>
  );
}