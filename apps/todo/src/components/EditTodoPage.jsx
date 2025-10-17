import React, { useState } from 'react';
import {
  IonContent,
  IonFooter,
  IonToolbar,
  IonButton,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonSpinner,
  IonPage,
  IonToast,
  IonModal
} from '@ionic/react';
import { star, addOutline, closeOutline } from 'ionicons/icons';
import dayjs from 'dayjs';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { PageHeader } from '@morphixai/components';
import { translate } from '../utils/i18n';

const COLLECTION_NAME = 'todos';
const CATEGORY_COLLECTION = 'categories';

const EditTodoPage = ({ todo, onSave, onCancel, categories, language = 'en' }) => {
  const t = (key, params) => translate(language, key, params);
  
  const [content, setContent] = useState(todo?.content || '');
  const [reminder, setReminder] = useState(todo?.reminder || '');
  const [category, setCategory] = useState(todo?.category || categories[0] || '');
  const [priority, setPriority] = useState(todo?.priority || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const saveEdit = async () => {
    if (content.trim() === '') {
      setToastMessage(t('messages.emptyContent'));
      setShowToast(true);
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (reminder) {
        try {
          const reminderTime = new Date(reminder).getTime();
          await AppSdk.reminder.createReminder({
            message: content,
            start_time: reminderTime,
            title: t('app.title')
          });
        } catch (error) {
          await reportError(error, 'CreateReminderError', { component: 'EditTodoPage' });
          console.error('创建提醒失败:', error);
        }
      }
      
      const updatedTodo = await AppSdk.appData.updateData({
        collection: COLLECTION_NAME,
        id: todo.id,
        data: {
          content: content,
          reminder: reminder || null,
          category: category,
          priority: priority
        }
      });
      
      setToastMessage(t('messages.taskUpdated'));
      setShowToast(true);
      
      setTimeout(() => {
        onSave(updatedTodo);
      }, 500);
    } catch (error) {
      await reportError(error, 'UpdateTodoError', { component: 'EditTodoPage' });
      console.error('更新任务失败:', error);
      setToastMessage(t('messages.updateTaskFailed'));
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const addNewCategory = async () => {
    if (newCategory.trim() === '') {
      setToastMessage(t('messages.emptyCategoryName'));
      setShowToast(true);
      return;
    }
    
    if (categories.includes(newCategory.trim())) {
      setToastMessage(t('messages.categoryExists'));
      setShowToast(true);
      return;
    }
    
    try {
      setIsLoading(true);
      
      await AppSdk.appData.createData({
        collection: CATEGORY_COLLECTION,
        data: {
          name: newCategory.trim(),
          isDefault: false,
          createdAt: new Date().toISOString()
        }
      });
      
      setCategory(newCategory.trim());
      
      setShowAddCategoryModal(false);
      setNewCategory('');
      
      setToastMessage(t('messages.categoryAdded'));
      setShowToast(true);
    } catch (error) {
      await reportError(error, 'AddCategoryError', { component: 'EditTodoPage' });
      console.error('添加分类失败:', error);
      setToastMessage(t('messages.addCategoryFailed'));
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <PageHeader title={t('tasks.editTask')} />
      
      <IonContent className="edit-page-content">
        <div style={{ padding: '16px' }}>
          <div className="form-field">
            <IonLabel>{t('tasks.taskContent')}</IonLabel>
            <IonInput
              value={content}
              placeholder={t('tasks.taskContentPlaceholder')}
              onIonChange={e => setContent(e.detail.value)}
              className="custom-input"
            />
          </div>
          
          <div className="form-field">
            <IonLabel>{t('tasks.category')}</IonLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonSelect
                value={category}
                placeholder={t('tasks.selectCategory')}
                onIonChange={e => setCategory(e.detail.value)}
                style={{ flex: 1 }}
              >
                {categories.map(cat => (
                  <IonSelectOption key={cat} value={cat}>
                    {cat}
                  </IonSelectOption>
                ))}
              </IonSelect>
              <IonButton
                size="small"
                fill="clear"
                onClick={() => setShowAddCategoryModal(true)}
              >
                <IonIcon icon={addOutline} />
              </IonButton>
            </div>
          </div>
          
          <div className="form-field">
            <IonLabel>{t('tasks.priority')}</IonLabel>
            <div className="priority-toggle">
              <IonButton 
                expand="block"
                fill={priority === 1 ? "solid" : "outline"}
                onClick={() => setPriority(1)}
              >
                {t('tasks.normal')}
              </IonButton>
              <IonButton 
                expand="block"
                fill={priority === 3 ? "solid" : "outline"}
                color="warning"
                onClick={() => setPriority(3)}
              >
                {t('tasks.important')}
                <IonIcon slot="end" icon={star} />
              </IonButton>
            </div>
          </div>
          
          <div className="form-field">
            <IonLabel>{t('tasks.reminderTime')}</IonLabel>
            <input
              type="datetime-local"
              className="custom-datetime"
              value={reminder ? dayjs(reminder).format('YYYY-MM-DDTHH:mm') : ''}
              onChange={e => setReminder(e.target.value)}
            />
          </div>
        </div>
      </IonContent>
      
      <IonFooter className="edit-footer-safe">
        <div className="footer-buttons-container">
          <div className="edit-footer-buttons">
            <IonButton expand="block" fill="outline" onClick={onCancel}>
              {t('tasks.cancel')}
            </IonButton>
            <IonButton expand="block" onClick={saveEdit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <IonSpinner name="crescent" style={{ marginRight: '8px' }} />
                  {t('app.processing')}
                </>
              ) : t('tasks.save')}
            </IonButton>
          </div>
        </div>
      </IonFooter>
      
      <IonModal isOpen={showAddCategoryModal} onDidDismiss={() => setShowAddCategoryModal(false)}>
        <IonPage>
          <PageHeader title={t('categoryManager.addCategory')} />
          <IonContent>
            <div style={{ padding: '16px' }}>
              <div className="form-field">
                <IonLabel>{t('categoryManager.categoryName')}</IonLabel>
                <IonInput
                  value={newCategory}
                  placeholder={t('categoryManager.categoryNamePlaceholder')}
                  onIonChange={e => setNewCategory(e.detail.value)}
                  className="custom-input"
                />
              </div>
            </div>
          </IonContent>
          <IonFooter className="modal-footer-safe">
            <div className="footer-buttons-container">
              <IonButton 
                expand="block" 
                onClick={addNewCategory} 
                disabled={isLoading || newCategory.trim() === ''}
              >
                {isLoading ? (
                  <>
                    <IonSpinner name="crescent" style={{ marginRight: '8px' }} />
                    {t('categoryManager.addingCategory')}
                  </>
                ) : t('categoryManager.addCategory')}
              </IonButton>
            </div>
          </IonFooter>
        </IonPage>
      </IonModal>
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
      />
    </IonPage>
  );
};

export default EditTodoPage;