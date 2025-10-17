import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonList,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAlert,
  IonSpinner,
  IonToast,
  IonFooter,
  IonToolbar,
  IonPage
} from '@ionic/react';
import { 
  addOutline, 
  trashOutline, 
  pencilOutline,
  saveOutline,
  closeOutline
} from 'ionicons/icons';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { PageHeader } from '@morphixai/components';
import { translate, getDefaultCategories } from '../utils/i18n';

const CATEGORY_COLLECTION = 'categories';

const CategoryManager = ({ 
  isOpen, 
  onClose, 
  onCategoriesChange,
  currentCategories,
  todos,
  language = 'en'
}) => {
  const t = (key, params) => translate(language, key, params);
  const DEFAULT_CATEGORIES = getDefaultCategories(language);
  
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editCategory, setEditCategory] = useState({ id: null, name: '' });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const result = await AppSdk.appData.queryData({
        collection: CATEGORY_COLLECTION,
        query: []
      });
      if (result.length === 0) {
        const defaultCategoryPromises = DEFAULT_CATEGORIES.map(name => 
          AppSdk.appData.createData({
            collection: CATEGORY_COLLECTION,
            data: { name, isDefault: true }
          })
        );
        const createdCategories = await Promise.all(defaultCategoryPromises);
        setCategories(createdCategories);
      } else {
        const sortedCategories = result.sort((a, b) => 
          new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
        setCategories(sortedCategories);
      }
    } catch (error) {
      await reportError(error, 'LoadCategoriesError', { component: 'CategoryManager' });
      console.error('加载分类失败:', error);
      setToastMessage(t('messages.loadCategoriesFailed'));
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async () => {
    if (newCategory.trim() === '') {
      setToastMessage(t('messages.emptyCategoryName'));
      setShowToast(true);
      return;
    }
    if (categories.some(cat => cat.name === newCategory.trim())) {
      setToastMessage(t('messages.categoryExists'));
      setShowToast(true);
      return;
    }
    try {
      setIsLoading(true);
      const createdCategory = await AppSdk.appData.createData({
        collection: CATEGORY_COLLECTION,
        data: {
          name: newCategory.trim(),
          isDefault: false,
          createdAt: new Date().toISOString()
        }
      });
      setCategories([...categories, createdCategory]);
      setNewCategory('');
      const updatedCategories = [...categories, createdCategory].map(cat => cat.name);
      onCategoriesChange(updatedCategories);
      setToastMessage(t('messages.categoryAdded'));
      setShowToast(true);
    } catch (error) {
      await reportError(error, 'AddCategoryError', { component: 'CategoryManager' });
      console.error('添加分类失败:', error);
      setToastMessage(t('messages.addCategoryFailed'));
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setShowDeleteAlert(true);
  };

  const deleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      setIsLoading(true);
      const tasksWithCategory = todos.filter(todo => todo.category === categoryToDelete.name);
      if (tasksWithCategory.length > 0) {
        setToastMessage(t('messages.categoryInUse', { count: tasksWithCategory.length }));
        setShowToast(true);
        return;
      }
      await AppSdk.appData.deleteData({
        collection: CATEGORY_COLLECTION,
        id: categoryToDelete.id
      });
      const updatedCategories = categories.filter(cat => cat.id !== categoryToDelete.id);
      setCategories(updatedCategories);
      onCategoriesChange(updatedCategories.map(cat => cat.name));
      setToastMessage(t('messages.categoryDeleted'));
      setShowToast(true);
    } catch (error) {
      await reportError(error, 'DeleteCategoryError', { component: 'CategoryManager' });
      console.error('删除分类失败:', error);
      setToastMessage(t('messages.deleteCategoryFailed'));
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setCategoryToDelete(null);
      setShowDeleteAlert(false);
    }
  };

  const startEditCategory = (category) => {
    setEditCategory({ id: category.id, name: category.name });
  };

  const saveEditCategory = async () => {
    if (editCategory.name.trim() === '') {
      setToastMessage(t('messages.emptyCategoryName'));
      setShowToast(true);
      return;
    }
    if (categories.some(cat => cat.name === editCategory.name.trim() && cat.id !== editCategory.id)) {
      setToastMessage(t('messages.categoryExists'));
      setShowToast(true);
      return;
    }
    try {
      setIsLoading(true);
      const updatedCategory = await AppSdk.appData.updateData({
        collection: CATEGORY_COLLECTION,
        id: editCategory.id,
        data: { name: editCategory.name.trim() }
      });
      const updatedCategories = categories.map(cat => 
        cat.id === editCategory.id ? updatedCategory : cat
      );
      setCategories(updatedCategories);
      onCategoriesChange(updatedCategories.map(cat => cat.name));
      setEditCategory({ id: null, name: '' });
      setToastMessage(t('messages.categoryUpdated'));
      setShowToast(true);
    } catch (error) {
      await reportError(error, 'UpdateCategoryError', { component: 'CategoryManager' });
      console.error('更新分类失败:', error);
      setToastMessage(t('messages.updateCategoryFailed'));
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditCategory({ id: null, name: '' });
  };

  const getCategoryUsageCount = (categoryName) => {
    return todos.filter(todo => todo.category === categoryName).length;
  };

  const isDefaultCategory = (category) => {
    return category.isDefault || DEFAULT_CATEGORIES.includes(category.name);
  };

  if (!isOpen) return null;

  return (
    <IonPage>
      <PageHeader title={t('categoryManager.title')} />
      
      <IonContent>
        {isLoading && categories.length === 0 ? (
          <div className="initial-loading">
            <IonSpinner name="crescent" />
            <p>{t('app.loading')}</p>
          </div>
        ) : (
          <>
            <div className="category-add-form">
              <IonItem className="category-input-item">
                <IonInput
                  value={newCategory}
                  placeholder={t('categoryManager.newCategoryName')}
                  onIonChange={e => setNewCategory(e.detail.value)}
                />
                <IonButton
                  fill="clear"
                  onClick={addCategory}
                  disabled={isLoading || newCategory.trim() === ''}
                >
                  <IonIcon slot="icon-only" icon={addOutline} />
                </IonButton>
              </IonItem>
            </div>
            
            <IonList className="category-list-container">
              {categories.map(category => (
                <IonItemSliding key={category.id}>
                  {editCategory.id === category.id ? (
                    <IonItem>
                      <IonInput
                        value={editCategory.name}
                        onIonChange={e => setEditCategory({ ...editCategory, name: e.detail.value })}
                      />
                      <IonButton fill="clear" onClick={saveEditCategory}>
                        <IonIcon slot="icon-only" icon={saveOutline} color="success" />
                      </IonButton>
                      <IonButton fill="clear" onClick={cancelEdit}>
                        <IonIcon slot="icon-only" icon={closeOutline} color="medium" />
                      </IonButton>
                    </IonItem>
                  ) : (
                    <IonItem>
                      <IonLabel>{category.name}</IonLabel>
                      <div className="category-usage-count">
                        {t('categories.usageCount')}: {getCategoryUsageCount(category.name)}
                      </div>
                      {!isDefaultCategory(category) && (
                        <>
                          <IonButton fill="clear" onClick={() => startEditCategory(category)}>
                            <IonIcon slot="icon-only" icon={pencilOutline} color="primary" />
                          </IonButton>
                          <IonButton fill="clear" onClick={() => confirmDeleteCategory(category)}>
                            <IonIcon slot="icon-only" icon={trashOutline} color="danger" />
                          </IonButton>
                        </>
                      )}
                      {isDefaultCategory(category) && (
                        <div className="default-badge">{t('categories.default')}</div>
                      )}
                    </IonItem>
                  )}
                  
                  {!isDefaultCategory(category) && (
                    <IonItemOptions side="end">
                      <IonItemOption color="primary" onClick={() => startEditCategory(category)}>
                        <IonIcon slot="icon-only" icon={pencilOutline} />
                      </IonItemOption>
                      <IonItemOption color="danger" onClick={() => confirmDeleteCategory(category)}>
                        <IonIcon slot="icon-only" icon={trashOutline} />
                      </IonItemOption>
                    </IonItemOptions>
                  )}
                </IonItemSliding>
              ))}
            </IonList>
          </>
        )}
      </IonContent>
      
      <IonFooter className="category-footer-safe">
        <div className="footer-buttons-container">
          <IonButton expand="block" onClick={onClose}>
            {t('tasks.done')}
          </IonButton>
        </div>
      </IonFooter>
      
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header={t('confirmations.confirmDelete')}
        message={categoryToDelete ? t('confirmations.deleteCategory', { name: categoryToDelete.name }) : t('confirmations.deleteCategoryGeneric')}
        buttons={[
          {
            text: t('tasks.cancel'),
            role: 'cancel',
            handler: () => {
              setCategoryToDelete(null);
            }
          },
          {
            text: t('tasks.delete'),
            handler: () => {
              deleteCategory();
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
    </IonPage>
  );
};

export default CategoryManager;