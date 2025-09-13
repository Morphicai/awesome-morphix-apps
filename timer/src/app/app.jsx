import React, { useState, useEffect } from 'react';
import { IonApp, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonContent, IonLoading } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { Route, Switch } from 'react-router-dom';
import { leaf, list, barChart, settings } from 'ionicons/icons';
import { PageHeader } from '@morphixai/components';
import { reportError } from '@morphixai/lib';
import AppSdk from '@morphixai/app-sdk';
import TimerTab from './components/TimerTab';
import TasksTab from './components/TasksTab';
import StatsTab from './components/StatsTab';
import SettingsTab from './components/SettingsTab';
import { useTimerStore } from './stores/timerStore';
import { useTaskStore } from './stores/taskStore';
import './styles/global.css';

// 全局初始化状态，防止重复初始化
let isInitializing = false;
let initializationPromise = null;

// 应用启动时的数据初始化函数
const initializeAppData = async () => {
  if (isInitializing) {
    return initializationPromise;
  }
  
  isInitializing = true;
  console.log("正在初始化应用数据...");
  
  initializationPromise = (async () => {
    try {
      // 检查timer数据
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
      
      // 检查tasks数据
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
      
      // 检查stats数据
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

  useEffect(() => {
    const checkDataInitialization = async () => {
      try {
        // 先执行数据初始化
        await initializeAppData();
        
        console.log('Starting app initialization...');
        
        // 初始化timer store
        await initializeTimer();
        console.log('Timer initialized successfully');
        
        // 加载tasks
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
      <IonLoading
        key={'loading'}
        isOpen={showLoading}
        message="정원을 준비하는 중..."
        spinner="crescent"
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
          <h2>앱 초기화 중 오류가 발생했습니다</h2>
          <p>앱을 다시 시작해 주세요.</p>
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
            다시 시도
          </button>
        </div>
      ) : isDataInitialized ? (
        <IonReactHashRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Switch>
                <Route exact path="/timer">
                  <div id="timer-page">
                    <PageHeader title="자연 정원 뽀모도로" />
                    <IonContent>
                      <TimerTab />
                    </IonContent>
                  </div>
                </Route>
                
                <Route exact path="/tasks">
                  <div id="tasks-page">
                    <PageHeader title="할일 관리" />
                    <IonContent>
                      <TasksTab />
                    </IonContent>
                  </div>
                </Route>
                
                <Route exact path="/stats">
                  <div id="stats-page">
                    <PageHeader title="정원 통계" />
                    <IonContent>
                      <StatsTab />
                    </IonContent>
                  </div>
                </Route>
                
                <Route exact path="/settings">
                  <div id="settings-page">
                    <PageHeader title="설정" />
                    <IonContent>
                      <SettingsTab />
                    </IonContent>
                  </div>
                </Route>
                
                <Route exact path="/">
                  <div id="timer-page">
                    <PageHeader title="자연 정원 뽀모도로" />
                    <IonContent>
                      <TimerTab />
                    </IonContent>
                  </div>
                </Route>
              </Switch>
            </IonRouterOutlet>

            <IonTabBar slot="bottom" className="garden-tab-bar">
              <IonTabButton tab="timer" href="/timer" className="tab-button">
                <IonIcon icon={leaf} />
                타이머
              </IonTabButton>
              <IonTabButton tab="tasks" href="/tasks" className="tab-button">
                <IonIcon icon={list} />
                할일
              </IonTabButton>
              <IonTabButton tab="stats" href="/stats" className="tab-button">
                <IonIcon icon={barChart} />
                통계
              </IonTabButton>
              <IonTabButton tab="settings" href="/settings" className="tab-button">
                <IonIcon icon={settings} />
                설정
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactHashRouter>
      ) : null}
    </IonApp>
  );
}