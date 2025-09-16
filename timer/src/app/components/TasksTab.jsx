import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon, IonInput, IonSelect, IonSelectOption, IonCheckbox, IonSpinner, IonItem, IonLabel, IonFab, IonFabButton, IonPage, IonContent } from '@ionic/react';
import { add, trash, create, checkmark, close } from 'ionicons/icons';
import { PageHeader } from '@morphixai/components';
import { useTaskStore } from '../stores/taskStore';
import { t } from '../utils/i18n';
import styles from '../styles/TasksTab.module.css';

export default function TasksTab() {
  const {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    getFlowerTypeForPriority
  } = useTaskStore();

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [filter, setFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');
  const [isDataReady, setIsDataReady] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [removingTasks, setRemovingTasks] = useState(new Set());

  // 检查数据是否准备完毕
  useEffect(() => {
    if (Array.isArray(tasks) && !loading) {
      setIsDataReady(true);
    }
  }, [tasks, loading]);

  const handleAddTask = async () => {
    if (newTaskText.trim()) {
      try {
        await addTask(newTaskText, newTaskPriority);
        setNewTaskText('');
        setNewTaskPriority('medium');
        setShowAddForm(false);
      } catch (error) {
        console.error('Failed to add task:', error);
      }
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task.completed) {
        // 完成动画触发
        setCompletedTasks(prev => new Set([...prev, taskId]));
        setTimeout(() => {
          setCompletedTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(taskId);
            return newSet;
          });
        }, 1000);
      }
      await toggleTask(taskId);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // 添加删除动画
      setRemovingTasks(prev => new Set([...prev, taskId]));
      
      // 等待动画完成后删除
      setTimeout(async () => {
        await deleteTask(taskId);
        setRemovingTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }, 300);
    } catch (error) {
      console.error('Failed to delete task:', error);
      // 如果删除失败，移除动画状态
      setRemovingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const startEditing = (task) => {
    setEditingTask(task.id);
    setEditText(task.text);
  };

  const saveEdit = async () => {
    if (editText.trim() && editingTask) {
      try {
        await updateTask(editingTask, editText);
        setEditingTask(null);
        setEditText('');
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditText('');
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'completed':
        return tasks.filter(task => task.completed);
      case 'pending':
        return tasks.filter(task => !task.completed);
      case 'high':
        return tasks.filter(task => task.priority === 'high');
      case 'medium':
        return tasks.filter(task => task.priority === 'medium');
      case 'low':
        return tasks.filter(task => task.priority === 'low');
      default:
        return tasks;
    }
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      high: '🌹',
      medium: '🌻', 
      low: '🌿'
    };
    return icons[priority] || icons.medium;
  };

  const getPriorityBorderColor = (priority) => {
    const colors = {
      high: '#E74C3C',
      medium: '#F39C12',
      low: '#7FB069'
    };
    return colors[priority] || colors.medium;
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  };

  // 数据未准备好时显示加载状态
  if (!isDataReady) {
    return (
      <IonPage>
        <PageHeader title={t('myTaskGardenTitle')} />
        <IonContent>
          <div className={styles.loadingContainer}>
            <IonSpinner name="crescent" />
            <p>{t('loadingTasksList')}</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const filteredTasks = getFilteredTasks();
  const stats = getTaskStats();

  return (
    <IonPage>
      <PageHeader title={t('myTaskGardenTitle')} />
      <IonContent>
        <div className={styles.container}>
          {/* 자연 배경 */}
          <div className={styles.gardenBackground}>
            
            {/* 페이지 제목 */}
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>{t('myTaskGardenTitle')}</h1>
              <p className={styles.pageSubtitle}>{t('taskGardenSubtitle')}</p>
            </div>

            {/* 통계 카드 */}
            <div className={styles.statsContainer}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🌱</div>
                <div className={styles.statNumber}>{stats.total}</div>
                <div className={styles.statLabel}>{t('totalTasksLabel')}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🌸</div>
                <div className={styles.statNumber}>{stats.completed}</div>
                <div className={styles.statLabel}>{t('completedTasksLabel')}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🌿</div>
                <div className={styles.statNumber}>{stats.pending}</div>
                <div className={styles.statLabel}>{t('pendingTasksLabel')}</div>
              </div>
            </div>

            {/* 필터 섹션 */}
            <div className={styles.filterSection}>
              <IonSelect
                value={filter}
                onIonChange={(e) => setFilter(e.detail.value)}
                className={styles.filterSelect}
                placeholder={t('taskFilterPlaceholder')}
              >
                <IonSelectOption value="all">🌺 {t('viewAll')}</IonSelectOption>
                <IonSelectOption value="pending">🌱 {t('viewPending')}</IonSelectOption>
                <IonSelectOption value="completed">🌸 {t('viewCompleted')}</IonSelectOption>
                <IonSelectOption value="high">🌹 {t('highPriorityFilter')}</IonSelectOption>
                <IonSelectOption value="medium">🌻 {t('mediumPriorityFilter')}</IonSelectOption>
                <IonSelectOption value="low">🌿 {t('lowPriorityFilter')}</IonSelectOption>
              </IonSelect>
            </div>

            {/* 할일 추가 폼 */}
            {showAddForm && (
              <div className={styles.addTaskForm}>
                <div className={styles.formCard}>
                  <div className={styles.formHeader}>
                    <span className={styles.formIcon}>🌱</span>
                    <span className={styles.formTitle}>{t('formTitleNewTask')}</span>
                    <IonButton 
                      fill="clear" 
                      size="small"
                      onClick={() => setShowAddForm(false)}
                      className={styles.closeButton}
                    >
                      <IonIcon icon={close} />
                    </IonButton>
                  </div>
                  
                  <IonInput
                    value={newTaskText}
                    placeholder={t('newTaskInputPlaceholder')}
                    onIonInput={(e) => setNewTaskText(e.detail.value ?? '')}
                    className={styles.taskInput}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTask();
                      }
                    }}
                  />
                  
                  <IonSelect
                    value={newTaskPriority}
                    onIonChange={(e) => setNewTaskPriority(e.detail.value)}
                    className={styles.prioritySelect}
                    placeholder={t('prioritySelectionPlaceholder')}
                  >
                    <IonSelectOption value="high">🌹 {t('highPriorityOption')}</IonSelectOption>
                    <IonSelectOption value="medium">🌻 {t('mediumPriorityOption')}</IonSelectOption>
                    <IonSelectOption value="low">🌿 {t('lowPriorityOption')}</IonSelectOption>
                  </IonSelect>
                  
                  <div className={styles.formActions}>
                    <IonButton
                      onClick={handleAddTask}
                      disabled={!newTaskText.trim()}
                      className={styles.plantButton}
                      expand="block"
                    >
                      <IonIcon icon={add} slot="start" />
                      {t('plantTaskButtonText')}
                    </IonButton>
                  </div>
                </div>
              </div>
            )}

            {/* 할일 목록 */}
            <div className={styles.tasksList}>
              {filteredTasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🌱</div>
                  <h3 className={styles.emptyTitle}>{t('noTasksEmptyTitle')}</h3>
                  <p className={styles.emptyText}>
                    {filter === 'all' 
                      ? t('firstSeedPlantMessage') 
                      : t('noMatchingTasksMessage')}
                  </p>
                  {filter === 'all' && (
                    <IonButton 
                      onClick={() => setShowAddForm(true)}
                      className={styles.emptyActionButton}
                    >
                      <IonIcon icon={add} slot="start" />
                      {t('plantFirstTaskButtonText')}
                    </IonButton>
                  )}
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`${styles.taskCard} ${task.completed ? styles.completed : ''} ${completedTasks.has(task.id) ? styles.completing : ''} ${removingTasks.has(task.id) ? styles.removing : ''}`}
                  >
                    <div 
                      className={styles.priorityBorder}
                      style={{ borderColor: getPriorityBorderColor(task.priority) }}
                    />
                    
                    <div className={styles.taskContent}>
                      <div className={styles.taskLeft}>
                        <IonCheckbox
                          checked={task.completed}
                          onIonChange={() => handleToggleTask(task.id)}
                          className={styles.taskCheckbox}
                        />
                        
                        <div className={styles.priorityIcon}>
                          {getPriorityIcon(task.priority)}
                        </div>
                      </div>
                      
                      <div className={styles.taskInfo}>
                        {editingTask === task.id ? (
                          <div className={styles.editMode}>
                            <IonInput
                              value={editText}
                              onIonInput={(e) => setEditText(e.detail.value ?? '')}
                              className={styles.editInput}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  saveEdit();
                                } else if (e.key === 'Escape') {
                                  cancelEdit();
                                }
                              }}
                            />
                            <div className={styles.editActions}>
                              <IonButton size="small" onClick={saveEdit} className={styles.saveButton}>
                                <IonIcon icon={checkmark} />
                              </IonButton>
                              <IonButton size="small" fill="clear" onClick={cancelEdit} className={styles.cancelButton}>
                                <IonIcon icon={close} />
                              </IonButton>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={`${styles.taskText} ${task.completed ? styles.completedText : ''}`}>
                              {task.text}
                            </div>
                            <div className={styles.taskMeta}>
                              <span className={styles.priorityLabel}>
                                {task.priority === 'high' ? t('highPriorityLabel') : 
                                 task.priority === 'medium' ? t('mediumPriorityLabel') : t('lowPriorityLabel')}
                              </span>
                              {task.completedAt && (
                                <span className={styles.completedTime}>
                                  {new Date(task.completedAt).toLocaleDateString('ko-KR')}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className={styles.taskActions}>
                        {editingTask !== task.id && (
                          <>
                            <IonButton
                              fill="clear"
                              size="small"
                              onClick={() => startEditing(task)}
                              className={styles.editButton}
                            >
                              <IonIcon icon={create} />
                            </IonButton>
                            <IonButton
                              fill="clear"
                              size="small"
                              onClick={() => handleDeleteTask(task.id)}
                              className={styles.deleteButton}
                            >
                              <IonIcon icon={trash} />
                            </IonButton>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 완료 애니메이션 */}
                    {completedTasks.has(task.id) && (
                      <div className={styles.completionAnimation}>
                        <span className={styles.growthAnimation}>🌱→🌸</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* 장식용 꽃들 */}
            <div className={styles.decorativeElements}>
              {Array.from({ length: Math.min(stats.completed, 8) }, (_, i) => (
                <span 
                  key={i} 
                  className={styles.decorativeFlower}
                  style={{
                    left: `${5 + (i % 4) * 22}%`,
                    bottom: `${2 + Math.floor(i / 4) * 8}%`,
                    animationDelay: `${i * 0.5}s`
                  }}
                >
                  {i % 3 === 0 ? '🌺' : i % 3 === 1 ? '🌸' : '🌼'}
                </span>
              ))}
            </div>
          </div>

          {/* 플로팅 추가 버튼 */}
          {!showAddForm && (
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
              <IonFabButton 
                onClick={() => setShowAddForm(true)}
                className={styles.fabButton}
              >
                🌱
              </IonFabButton>
            </IonFab>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}