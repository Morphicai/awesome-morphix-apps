import React, { useState } from 'react';
import { IonButton, IonIcon, IonToggle, IonRange, IonItem, IonLabel } from '@ionic/react';
import { notifications, volume, refresh, download, trash } from 'ionicons/icons';
import { useTimerStore } from '../stores/timerStore';
import { useTaskStore } from '../stores/taskStore';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import styles from '../styles/SettingsTab.module.css';

export default function SettingsTab() {
  const { plants, completedPomodoros, totalFocusTime } = useTimerStore();
  const { tasks } = useTaskStore();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(50);
  const [isExporting, setIsExporting] = useState(false);

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
    if (window.confirm('모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        // Clear timer data
        await AppSdk.appData.deleteData({
          collection: 'timer',
          id: 'current'
        });

        // Clear all tasks
        for (const task of tasks) {
          await AppSdk.appData.deleteData({
            collection: 'tasks',
            id: task.id
          });
        }

        // Reload the page to reset state
        window.location.reload();
      } catch (error) {
        await reportError(error, 'JavaScriptError', { component: 'SettingsTab' });
      }
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  return (
    <div className={styles.container}>
      {/* App Info */}
      <div className="garden-card">
        <h3 className="gradient-text">자연 정원 뽀모도로</h3>
        <div className={styles.appInfo}>
          <p className={styles.appDescription}>
            자연의 평온함과 함께하는 치유적인 뽀모도로 타이머입니다. 
            집중할 때마다 식물이 자라나고, 휴식할 때마다 나비가 날아다니는 
            평화로운 경험을 즐겨보세요.
          </p>
          <div className={styles.version}>버전 1.0.0</div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="garden-card">
        <h3 className="gradient-text">나의 정원 현황</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{completedPomodoros}</div>
            <div className="stat-label">완료한 뽀모도로</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{formatTime(totalFocusTime)}</div>
            <div className="stat-label">총 집중 시간</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{plants.length}</div>
            <div className="stat-label">키운 식물</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{tasks.length}</div>
            <div className="stat-label">등록한 할일</div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="garden-card">
        <h3 className="gradient-text">알림 설정</h3>
        <div className={styles.settingsList}>
          <IonItem className={styles.settingItem}>
            <IonIcon icon={notifications} slot="start" className="nature-icon" />
            <IonLabel>
              <h3>푸시 알림</h3>
              <p>타이머 완료 시 알림을 받습니다</p>
            </IonLabel>
            <IonToggle
              checked={notificationsEnabled}
              onIonChange={(e) => setNotificationsEnabled(e.detail.checked)}
              slot="end"
            />
          </IonItem>

          <IonItem className={styles.settingItem}>
            <IonIcon icon={volume} slot="start" className="nature-icon" />
            <IonLabel>
              <h3>소리 알림</h3>
              <p>부드러운 자연 소리로 알림을 받습니다</p>
            </IonLabel>
            <IonToggle
              checked={soundEnabled}
              onIonChange={(e) => setSoundEnabled(e.detail.checked)}
              slot="end"
            />
          </IonItem>

          {soundEnabled && (
            <div className={styles.volumeControl}>
              <IonLabel>알림 소리 크기</IonLabel>
              <IonRange
                min={0}
                max={100}
                value={soundVolume}
                onIonChange={(e) => setSoundVolume(e.detail.value)}
                pin={true}
                className={styles.volumeSlider}
              />
            </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="garden-card">
        <h3 className="gradient-text">데이터 관리</h3>
        <div className={styles.dataActions}>
          <IonButton
            className="garden-button"
            onClick={handleExportData}
            disabled={isExporting}
          >
            <IonIcon icon={download} slot="start" />
            {isExporting ? '내보내는 중...' : '데이터 내보내기'}
          </IonButton>
          
          <IonButton
            className="garden-button secondary"
            color="danger"
            onClick={handleClearAllData}
          >
            <IonIcon icon={trash} slot="start" />
            모든 데이터 삭제
          </IonButton>
        </div>
        
        <div className={styles.dataInfo}>
          <p>
            데이터 내보내기를 통해 정원 데이터를 백업할 수 있습니다. 
            JSON 파일로 저장되며, 나중에 복원할 수 있습니다.
          </p>
        </div>
      </div>

      {/* Garden Preview */}
      <div className="garden-card">
        <h3 className="gradient-text">나의 정원 미리보기</h3>
        <div className={styles.gardenPreview}>
          {plants.length === 0 ? (
            <div className={styles.emptyGarden}>
              <span className={styles.seedling}>🌱</span>
              <p>아직 식물이 자라지 않았습니다.</p>
              <p>첫 번째 뽀모도로를 완료해보세요!</p>
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
                  +{plants.length - 20}개 더
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div className="garden-card">
        <h3 className="gradient-text">앱 정보</h3>
        <div className={styles.aboutContent}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🌿</span>
            <div className={styles.featureText}>
              <h4>자연 치유 디자인</h4>
              <p>부드러운 자연 녹색 톤으로 편안한 집중 환경을 제공합니다.</p>
            </div>
          </div>
          
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⏰</span>
            <div className={styles.featureText}>
              <h4>뽀모도로 기법</h4>
              <p>25분 집중 + 5분 휴식의 과학적인 시간 관리 방법을 사용합니다.</p>
            </div>
          </div>
          
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🌱</span>
            <div className={styles.featureText}>
              <h4>정원 성장 시스템</h4>
              <p>완료한 뽀모도로마다 아름다운 식물을 키울 수 있습니다.</p>
            </div>
          </div>
          
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📝</span>
            <div className={styles.featureText}>
              <h4>할일 관리</h4>
              <p>자연 아이콘으로 장식된 할일 목록으로 생산성을 높여보세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}