import React, { useState, useRef } from 'react';
import {
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonButton,
  IonIcon,
  IonReorderGroup,
  IonReorder,
  IonChip,
  IonToast,
  IonAlert,
  IonBadge
} from '@ionic/react';
import {
  star,
  starOutline,
  timeOutline,
  trashOutline,
  createOutline,
  menuOutline,
  reorderThreeOutline
} from 'ionicons/icons';
import dayjs from 'dayjs';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { translate } from '../utils/i18n';

const COLLECTION_NAME = 'todos';

const ReorderableTodoList = ({ 
  todos, 
  onTodosChange, 
  onEditTodo, 
  formatReminder,
  language = 'en'
}) => {
  const t = (key, params) => translate(language, key, params);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const todoListRef = useRef(null);

  const toggleComplete = async (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      const todo = todos.find(todo => todo.id === id);
      if (!todo) return;
      
      setIsLoading(true);
      const updatedTodo = await AppSdk.appData.updateData({
        collection: COLLECTION_NAME,
        id: id,
        data: { completed: !todo.completed }
      });
      
      const updatedTodos = todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      );
      
      onTodosChange(updatedTodos);
    } catch (error) {
      await reportError(error, 'UpdateTodoError', { component: 'ReorderableTodoList' });
      console.error('更新任务状态失败:', error);
      setToastMessage(t('messages.updateStatusFailed'));
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePriority = async (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      const todo = todos.find(todo => todo.id === id);
      if (!todo) return;
      
      const newPriority = todo.priority === 3 ? 1 : 3;
      
      setIsLoading(true);
      const updatedTodo = await AppSdk.appData.updateData({
        collection: COLLECTION_NAME,
        id: id,
        data: { priority: newPriority }
      });
      
      const updatedTodos = todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      );
      
      onTodosChange(updatedTodos);
    } catch (error) {
      await reportError(error, 'UpdatePriorityError', { component: 'ReorderableTodoList' });
      console.error('更新任务优先级失败:', error);
      setToastMessage(t('messages.updatePriorityFailed'));
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    const todo = todos.find(todo => todo.id === id);
    if (!todo) return;
    
    setTodoToDelete(todo);
    setShowDeleteAlert(true);
  };

  const deleteTodo = async () => {
    if (!todoToDelete) return;
    
    try {
      setIsLoading(true);
      await AppSdk.appData.deleteData({
        collection: COLLECTION_NAME,
        id: todoToDelete.id
      });
      
      const updatedTodos = todos.filter(todo => todo.id !== todoToDelete.id);
      onTodosChange(updatedTodos);
      
      setToastMessage(t('messages.taskDeleted'));
      setShowToast(true);
    } catch (error) {
      await reportError(error, 'DeleteTodoError', { component: 'ReorderableTodoList' });
      console.error('删除任务失败:', error);
      setToastMessage(t('messages.deleteTaskFailed'));
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setTodoToDelete(null);
    }
  };

  const handleReorder = async (event) => {
    const { from, to } = event.detail;
    
    const newTodos = [...todos];
    
    const movedItem = newTodos.splice(from, 1)[0];
    newTodos.splice(to, 0, movedItem);
    
    const updatedTodos = newTodos.map((todo, index) => ({
      ...todo,
      order: index
    }));
    
    onTodosChange(updatedTodos);
    
    event.detail.complete();
    
    try {
      await Promise.all(
        updatedTodos.map(todo =>
          AppSdk.appData.updateData({
            collection: COLLECTION_NAME,
            id: todo.id,
            data: { order: todo.order }
          })
        )
      );
      
      setToastMessage(t('messages.orderUpdated'));
      setShowToast(true);
    } catch (error) {
      await reportError(error, 'ReorderError', { component: 'ReorderableTodoList' });
      console.error('更新任务顺序失败:', error);
      setToastMessage(t('messages.reorderFailed'));
      setShowToast(true);
    }
  };

  const handleItemClick = (todo, event) => {
    if (event.target === event.currentTarget || 
        event.target.tagName === 'H2' || 
        event.target.classList.contains('todo-content')) {
      onEditTodo(todo);
    }
  };

  const handleDragStart = (e, todo, index) => {
    setDraggedItem({ todo, index });
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e, todo, index) => {
    e.preventDefault();
    setDragOverItem({ todo, index });
    
    const items = todoListRef.current.querySelectorAll('.todo-item');
    items.forEach(item => item.classList.remove('drag-over'));
    
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragEnd = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragging');
    
    const items = todoListRef.current.querySelectorAll('.todo-item');
    items.forEach(item => item.classList.remove('drag-over'));
    
    if (!draggedItem || !dragOverItem || draggedItem.index === dragOverItem.index) {
      return;
    }
    
    try {
      const newTodos = [...todos];
      
      const movedItem = newTodos.splice(draggedItem.index, 1)[0];
      newTodos.splice(dragOverItem.index, 0, movedItem);
      
      const updatedTodos = newTodos.map((todo, index) => ({
        ...todo,
        order: index
      }));
      
      onTodosChange(updatedTodos);
      
      await Promise.all(
        updatedTodos.map(todo =>
          AppSdk.appData.updateData({
            collection: COLLECTION_NAME,
            id: todo.id,
            data: { order: todo.order }
          })
        )
      );
      
      setToastMessage(t('messages.orderUpdated'));
      setShowToast(true);
    } catch (error) {
      await reportError(error, 'DragReorderError', { component: 'ReorderableTodoList' });
      console.error('拖动排序失败:', error);
      setToastMessage(t('messages.reorderFailed'));
      setShowToast(true);
    } finally {
      setDraggedItem(null);
      setDragOverItem(null);
    }
  };

  const handleTouchStart = (e, todo, index) => {
    setDraggedItem({ todo, index, startY: e.touches[0].clientY });
  };

  const handleTouchMove = (e, todo, index) => {
    if (!draggedItem) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - draggedItem.startY;
    
    if (Math.abs(deltaY) > 30) {
      let targetIndex = index;
      if (deltaY < 0 && index > 0) {
        targetIndex = index - 1;
      } else if (deltaY > 0 && index < todos.length - 1) {
        targetIndex = index + 1;
      }
      
      if (targetIndex !== index) {
        setDragOverItem({ todo: todos[targetIndex], index: targetIndex });
        const items = todoListRef.current.querySelectorAll('.todo-item');
        items.forEach(item => item.classList.remove('drag-over'));
        items[targetIndex].classList.add('drag-over');
      }
    }
  };

  const handleTouchEnd = async (e) => {
    if (!draggedItem || !dragOverItem || draggedItem.index === dragOverItem.index) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }
    
    try {
      const newTodos = [...todos];
      
      const movedItem = newTodos.splice(draggedItem.index, 1)[0];
      newTodos.splice(dragOverItem.index, 0, movedItem);
      
      const updatedTodos = newTodos.map((todo, index) => ({
        ...todo,
        order: index
      }));
      
      onTodosChange(updatedTodos);
      
      const items = todoListRef.current.querySelectorAll('.todo-item');
      items.forEach(item => item.classList.remove('drag-over'));
      
      await Promise.all(
        updatedTodos.map(todo =>
          AppSdk.appData.updateData({
            collection: COLLECTION_NAME,
            id: todo.id,
            data: { order: todo.order }
          })
        )
      );
      
      setToastMessage(t('messages.orderUpdated'));
      setShowToast(true);
    } catch (error) {
      await reportError(error, 'TouchReorderError', { component: 'ReorderableTodoList' });
      console.error('触摸排序失败:', error);
      setToastMessage(t('messages.reorderFailed'));
      setShowToast(true);
    } finally {
      setDraggedItem(null);
      setDragOverItem(null);
    }
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      [t('categories.work')]: 'primary',
      [t('categories.personal')]: 'success',
      [t('categories.shopping')]: 'warning',
      [t('categories.study')]: 'tertiary',
    };
    
    return categoryColors[category] || 'medium';
  };

  const renderTodoItem = (todo, index) => {
    return (
      <IonItem 
        key={todo.id} 
        className={`todo-item ${todo.completed ? 'completed' : ''} draggable-item`}
        onClick={(e) => handleItemClick(todo, e)}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, todo, index)}
        onDragOver={(e) => handleDragOver(e, todo, index)}
        onDragEnd={handleDragEnd}
        onTouchStart={(e) => handleTouchStart(e, todo, index)}
        onTouchMove={(e) => handleTouchMove(e, todo, index)}
        onTouchEnd={handleTouchEnd}
        lines="none"
      >
        <IonCheckbox
          slot="start"
          checked={todo.completed}
          onIonChange={(e) => toggleComplete(todo.id, e)}
          onClick={(e) => e.stopPropagation()}
        />
        <IonLabel className="todo-content">
          <div className="todo-title-row">
            <span className="todo-title">{todo.content}</span>
            {todo.priority === 3 && (
              <IonIcon icon={star} color="warning" className="priority-star" />
            )}
          </div>
          <div className="todo-details-row">
            <IonBadge 
              color={getCategoryColor(todo.category)} 
              className="category-badge"
              onClick={(e) => e.stopPropagation()}
            >
              {todo.category}
            </IonBadge>
            {todo.reminder && (
              <span className="todo-reminder" onClick={(e) => e.stopPropagation()}>
                <IonIcon icon={timeOutline} />
                {formatReminder(todo.reminder)}
              </span>
            )}
          </div>
        </IonLabel>
        <div className="todo-actions" onClick={(e) => e.stopPropagation()}>
          {!todo.completed && (
            <IonButton fill="clear" onClick={(e) => togglePriority(todo.id, e)}>
              <IonIcon 
                slot="icon-only" 
                icon={todo.priority === 3 ? star : starOutline} 
                color={todo.priority === 3 ? "warning" : "medium"} 
              />
            </IonButton>
          )}
          <IonButton fill="clear" color="danger" onClick={(e) => confirmDelete(todo.id, e)}>
            <IonIcon slot="icon-only" icon={trashOutline} />
          </IonButton>
        </div>
        <IonReorder slot="end" onClick={(e) => e.stopPropagation()} className="reorder-handle">
          <IonIcon icon={reorderThreeOutline} />
        </IonReorder>
      </IonItem>
    );
  };

  return (
    <>
      <div className="reorder-hint">
        <IonIcon icon={reorderThreeOutline} />
        {t('tasks.reorderHint')}
      </div>
      <IonList ref={todoListRef} className="todo-list">
        <IonReorderGroup 
          disabled={false} 
          onIonItemReorder={handleReorder}
        >
          {todos.map((todo, index) => renderTodoItem(todo, index))}
        </IonReorderGroup>
      </IonList>
      
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header={t('confirmations.confirmDelete')}
        message={todoToDelete ? t('confirmations.deleteTask', { content: todoToDelete.content }) : t('confirmations.deleteTaskGeneric')}
        buttons={[
          {
            text: t('tasks.cancel'),
            role: 'cancel',
            handler: () => {
              setTodoToDelete(null);
            }
          },
          {
            text: t('tasks.delete'),
            handler: () => {
              deleteTodo();
            }
          }
        ]}
      />
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
      />
    </>
  );
};

export default ReorderableTodoList;