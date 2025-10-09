import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSpinner,
  IonChip,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
} from '@ionic/react';
import { sparkles, checkmarkCircle, add, close } from 'ionicons/icons';
import { generateCoachAdvice } from '../services/coachService';
import { saveRitualHistory } from '../services/dataService';
import styles from '../styles/AICoach.module.css';

export default function AICoach({ emotion, energy, note, onComplete }) {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    loadAdvice();
  }, []);

  const loadAdvice = async () => {
    setLoading(true);
    try {
      const generatedAdvice = await generateCoachAdvice({
        emotion,
        energy,
        tasks,
      });
      setAdvice(generatedAdvice);
    } catch (error) {
      console.error('Failed to generate advice:', error);
      setAdvice({
        motivation: '每一次专注都是成长',
        action: '让我们开始第一个小任务',
        focusTip: '保持呼吸节奏，专注当下',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    if (newTask.trim() && tasks.length < 3) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask('');
      // 添加任务后重新生成建议
      setTimeout(() => loadAdvice(), 500);
    }
  };

  const handleRemoveTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
    setTimeout(() => loadAdvice(), 500);
  };

  const handleContinue = async () => {
    // 保存仪式历史
    await saveRitualHistory({
      emotion,
      energy,
      note,
      tasks,
      aiAdvice: advice,
    });
    
    onComplete({ tasks, aiAdvice: advice });
  };

  return (
    <div className={styles.container}>
      <IonCard className={styles.card}>
        <IonCardHeader>
          <div className={styles.header}>
            <IonIcon icon={sparkles} className={styles.headerIcon} />
            <IonCardTitle>AI 仪式教练</IonCardTitle>
          </div>
        </IonCardHeader>
        <IonCardContent>
          {loading ? (
            <div className={styles.loadingContainer}>
              <IonSpinner name="crescent" />
              <p className={styles.loadingText}>正在为你生成建议...</p>
            </div>
          ) : (
            <>
              <div className={styles.adviceSection}>
                <div className={styles.motivationCard}>
                  <h3 className={styles.motivationLabel}>💫 激励</h3>
                  <p className={styles.motivationText}>{advice?.motivation}</p>
                </div>

                <div className={styles.actionCard}>
                  <h3 className={styles.actionLabel}>🎯 行动建议</h3>
                  <p className={styles.actionText}>{advice?.action}</p>
                </div>

                {advice?.focusTip && (
                  <div className={styles.tipCard}>
                    <h3 className={styles.tipLabel}>💡 专注小技巧</h3>
                    <p className={styles.tipText}>{advice?.focusTip}</p>
                  </div>
                )}
              </div>

              <div className={styles.tasksSection}>
                <h3 className={styles.sectionTitle}>今日三件事</h3>
                <IonList className={styles.taskList}>
                  {tasks.map((task, index) => (
                    <IonItem key={index} className={styles.taskItem}>
                      <IonIcon icon={checkmarkCircle} slot="start" color="success" />
                      <span className={styles.taskText}>{task}</span>
                      <IonIcon
                        icon={close}
                        slot="end"
                        onClick={() => handleRemoveTask(index)}
                        className={styles.removeIcon}
                      />
                    </IonItem>
                  ))}
                </IonList>

                {tasks.length < 3 && (
                  <div className={styles.addTaskContainer}>
                    <IonInput
                      placeholder="添加一个任务..."
                      value={newTask}
                      onIonChange={(e) => setNewTask(e.detail.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                      className={styles.taskInput}
                    />
                    <IonButton
                      onClick={handleAddTask}
                      disabled={!newTask.trim()}
                      size="small"
                    >
                      <IonIcon icon={add} slot="icon-only" />
                    </IonButton>
                  </div>
                )}
              </div>

              <IonButton
                expand="block"
                onClick={handleContinue}
                className={styles.continueButton}
              >
                开始专注
              </IonButton>
            </>
          )}
        </IonCardContent>
      </IonCard>
    </div>
  );
}

