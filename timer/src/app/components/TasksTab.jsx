import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon, IonInput, IonSelect, IonSelectOption, IonCheckbox, IonSpinner, IonItem, IonLabel } from '@ionic/react';
import { add, trash, create, checkmark } from 'ionicons/icons';
import { useTaskStore } from '../stores/taskStore';
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

  // 检查数据是否已准备好
  useEffect(() => {
    // 当tasks数组已定义且不在加载状态时，认为数据已准备好
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
      } catch (error) {
        console.error('Failed to add task:', error);
      }
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await toggleTask(taskId);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
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

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ff6b6b',
      medium: '#feca57',
      low: '#48dbfb'
    };
    return colors[priority] || colors.medium;
  };

  const getFlowerEmoji = (priority) => {
    const flowers = {
      high: '🌹',
      medium: '🌷',
      low: '🌼'
    };
    return flowers[priority] || flowers.medium;
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  };

  // 如果数据未准备好，显示加载状态
  if (!isDataReady) {
    return (
      <div className={styles.loadingContainer}>
        <IonSpinner name="crescent" />
        <p>할일 목록을 불러오는 중...</p>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();
  const stats = getTaskStats();

  return (
    <div className={styles.container}>
      <div className={styles.gardenBackground}>
        {/* 统计信息 */}
        <div className={styles.statsSection}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.total}</span>
            <span className={styles.statLabel}>전체</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.completed}</span>
            <span className={styles.statLabel}>완료</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{stats.pending}</span>
            <span className={styles.statLabel}>대기</span>
          </div>
        </div>

        {/* 添加新任务 */}
        <div className={styles.addTaskSection}>
          <div className={styles.inputGroup}>
            <IonInput
              value={newTaskText}
              placeholder="새로운 할일을 입력하세요..."
              onIonInput={(e) => setNewTaskText(e.detail.value)}
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
            >
              <IonSelectOption value="high">높음 🌹</IonSelectOption>
              <IonSelectOption value="medium">보통 🌷</IonSelectOption>
              <IonSelectOption value="low">낮음 🌼</IonSelectOption>
            </IonSelect>
            <IonButton
              onClick={handleAddTask}
              disabled={!newTaskText.trim()}
              className={styles.addButton}
            >
              <IonIcon icon={add} />
            </IonButton>
          </div>
        </div>

        {/* 过滤器 */}
        <div className={styles.filterSection}>
          <IonSelect
            value={filter}
            onIonChange={(e) => setFilter(e.detail.value)}
            className={styles.filterSelect}
          >
            <IonSelectOption value="all">전체 보기</IonSelectOption>
            <IonSelectOption value="pending">대기 중</IonSelectOption>
            <IonSelectOption value="completed">완료됨</IonSelectOption>
            <IonSelectOption value="high">높은 우선순위</IonSelectOption>
            <IonSelectOption value="medium">보통 우선순위</IonSelectOption>
            <IonSelectOption value="low">낮은 우선순위</IonSelectOption>
          </IonSelect>
        </div>

        {/* 任务列表 */}
        <div className={styles.tasksList}>
          {filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🌱</div>
              <p className={styles.emptyText}>
                {filter === 'all' ? '아직 할일이 없습니다' : '해당하는 할일이 없습니다'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`${styles.taskCard} ${task.completed ? styles.completed : ''}`}
              >
                <div className={styles.taskContent}>
                  <IonCheckbox
                    checked={task.completed}
                    onIonChange={() => handleToggleTask(task.id)}
                    className={styles.taskCheckbox}
                  />
                  
                  <div className={styles.taskInfo}>
                    {editingTask === task.id ? (
                      <div className={styles.editMode}>
                        <IonInput
                          value={editText}
                          onIonInput={(e) => setEditText(e.detail.value)}
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
                          <IonButton size="small" onClick={saveEdit}>
                            <IonIcon icon={checkmark} />
                          </IonButton>
                          <IonButton size="small" fill="clear" onClick={cancelEdit}>
                            취소
                          </IonButton>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.taskText}>
                          <span className={styles.priorityEmoji}>
                            {getFlowerEmoji(task.priority)}
                          </span>
                          <span className={task.completed ? styles.completedText : ''}>
                            {task.text}
                          </span>
                        </div>
                        <div className={styles.taskMeta}>
                          <span 
                            className={styles.priorityBadge}
                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                          >
                            {task.priority === 'high' ? '높음' : 
                             task.priority === 'medium' ? '보통' : '낮음'}
                          </span>
                          {task.completedAt && (
                            <span className={styles.completedTime}>
                              {new Date(task.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
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
            ))
          )}
        </div>

        {/* 装饰性花园元素 */}
        <div className={styles.gardenElements}>
          <div className={styles.decorativeFlowers}>
            {Array.from({ length: Math.min(stats.completed, 6) }, (_, i) => (
              <span 
                key={i} 
                className={styles.decorativeFlower}
                style={{
                  left: `${10 + (i % 3) * 30}%`,
                  bottom: `${5 + Math.floor(i / 3) * 10}%`,
                  animationDelay: `${i * 0.3}s`
                }}
              >
                🌺
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}