import React, { useState, useEffect } from 'react';
import './styles/global.css';
import { 
  IonApp,
  IonPage, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonCheckbox, 
  IonButton, 
  IonIcon, 
  IonFab, 
  IonFabButton, 
  IonModal, 
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonFooter,
  IonToolbar,
  IonTitle,
  IonSpinner,
  IonToast,
  IonRouterOutlet,
  IonAlert
} from '@ionic/react';
import { 
  add, 
  star, 
  chevronForward, 
  listOutline,
  alertCircleOutline,
  briefcaseOutline, 
  personOutline, 
  cartOutline, 
  bookOutline, 
  appsOutline,
  closeOutline
} from 'ionicons/icons';
import { IonReactHashRouter } from '@ionic/react-router';
import { Route, Switch, useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { PageHeader } from '@morphixai/components';
import EditTodoPage from './components/EditTodoPage';
import ReorderableTodoList from './components/ReorderableTodoList';
import CategorySidebar from './components/CategorySidebar';
import CategorySelector from './components/CategorySelector';
import CategoryManager from './components/CategoryManager';
import { 
  LanguageContext, 
  translate, 
  detectSystemLanguage, 
  getDefaultCategories 
} from './utils/i18n';

const COLLECTION_NAME = 'todos';
const CATEGORY_COLLECTION = 'categories';

const HomePage = () => {
  const history = useHistory();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPriority, setNewPriority] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [language, setLanguage] = useState('en');
  
  const t = (key, params) => translate(language, key, params);
  
  useEffect(() => {
    const initLanguage = async () => {
      try {
        const detectedLang = await detectSystemLanguage();
        setLanguage(detectedLang);
        const defaultCats = getDefaultCategories(detectedLang);
        setNewCategory(defaultCats[0]);
        setFilterCategory(translate(detectedLang, 'categories.all'));
      } catch (error) {
        const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        const detectedLang = browserLang.startsWith('zh') ? 'zh' : 'en';
        setLanguage(detectedLang);
        const defaultCats = getDefaultCategories(detectedLang);
        setNewCategory(defaultCats[0]);
        setFilterCategory(translate(detectedLang, 'categories.all'));
      }
    };
    initLanguage();
  }, []);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await AppSdk.appData.queryData({
          collection: CATEGORY_COLLECTION,
          query: []
        });
        
        if (result.length === 0) {
          const defaultCategories = getDefaultCategories(language);
          const defaultCategoryPromises = defaultCategories.map(name => 
            AppSdk.appData.createData({
              collection: CATEGORY_COLLECTION,
              data: { name, isDefault: true }
            })
          );
          
          await Promise.all(defaultCategoryPromises);
          setCategories(defaultCategories);
        } else {
          const categoryNames = result.map(cat => cat.name);
          setCategories(categoryNames);
        }
      } catch (error) {
        await reportError(error, 'LoadCategoriesError', { component: 'HomePage' });
        console.error('加载分类失败:', error);
        const defaultCategories = getDefaultCategories(language);
        setCategories(defaultCategories);
      }
    };
    
    if (language) {
      loadCategories();
    }
  }, [language]);
  
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setIsLoading(true);
        const result = await AppSdk.appData.queryData({
          collection: COLLECTION_NAME,
          query: []
        });
        
        const sortedTodos = result.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setTodos(sortedTodos);
      } catch (error) {
        await reportError(error, 'DataLoadError', { component: 'TodoApp' });
        console.error('加载任务失败:', error);
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
          setTodos(JSON.parse(savedTodos));
        }
      } finally {
        setIsLoading(false);
        setInitialLoad(false);
      }
    };

    loadTodos();
  }, []);

  const addTodo = async () => {
    if (newTodo.trim() !== '') {
      try {
        setIsLoading(true);
        const todoData = {
          content: newTodo,
          completed: false,
          createdAt: new Date().toISOString(),
          reminder: null,
          category: newCategory,
          priority: newPriority,
          order: todos.length
        };
        
        const createdTodo = await AppSdk.appData.createData({
          collection: COLLECTION_NAME,
          data: todoData
        });
        
        setTodos([createdTodo, ...todos]);
        setNewTodo('');
        const defaultCats = getDefaultCategories(language);
        setNewCategory(defaultCats[0]);
        setNewPriority(1);
        setShowAddModal(false);
        
        setToastMessage(t('messages.taskAdded'));
        setShowToast(true);
      } catch (error) {
        await reportError(error, 'CreateTodoError', { component: 'TodoApp' });
        console.error('创建任务失败:', error);
        alert(t('messages.createTaskFailed'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const confirmClearCompleted = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setShowClearAlert(true);
  };

  const clearCompleted = async () => {
    try {
      setIsLoading(true);
      const completedTodos = todos.filter(todo => todo.completed);
      
      await Promise.all(
        completedTodos.map(todo => 
          AppSdk.appData.deleteData({
            collection: COLLECTION_NAME,
            id: todo.id
          })
        )
      );
      
      setTodos(todos.filter(todo => !todo.completed));
      
      setToastMessage(t('messages.completedCleared'));
      setShowToast(true);
    } catch (error) {
      await reportError(error, 'ClearCompletedError', { component: 'TodoApp' });
      console.error('清理已完成任务失败:', error);
      alert(t('messages.clearCompletedFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatReminder = (reminder) => {
    if (!reminder) return '';
    return dayjs(reminder).format('MM-DD HH:mm');
  };

  const handleEditTodo = (todo) => {
    history.push(`/edit/${todo.id}`);
  };

  const filteredTodos = todos.filter(todo => {
    if (filterCategory !== t('categories.all') && todo.category !== filterCategory) {
      return false;
    }
    return true;
  });

  const pendingTasks = filteredTodos.filter(todo => !todo.completed);
  const completedTasks = filteredTodos.filter(todo => todo.completed);

  const handleCategoryChange = (category) => {
    setFilterCategory(category);
  };

  const handleCategoriesChange = (updatedCategories) => {
    setCategories(updatedCategories);
  };

  const renderEmptyState = () => {
    return (
      <div className="empty-state">
        <IonIcon icon={listOutline} />
        <h3>{t('tasks.noTasks')}</h3>
        <p>{t('tasks.noTasksDesc')}</p>
        <IonButton expand="block" onClick={() => setShowAddModal(true)}>
          {t('tasks.addFirstTask')}
        </IonButton>
      </div>
    );
  };

  const renderInitialLoading = () => {
    return (
      <div className="initial-loading">
        <IonSpinner name="crescent" />
        <p>{t('app.loading')}</p>
      </div>
    );
  };

  return (
    <IonPage>
      <PageHeader title={t('app.title')} />
      <IonContent>
        <div className="app-container">
          <CategorySidebar
            categories={categories}
            activeCategory={filterCategory}
            onSelectCategory={handleCategoryChange}
            todos={todos}
            language={language}
          />
          
          <div className="app-main">
            <div className="todo-page-content">
              <CategorySelector
                categories={categories}
                activeCategory={filterCategory}
                onSelectCategory={handleCategoryChange}
                onManageCategories={() => setShowCategoryManager(true)}
                todos={todos}
                maxVisibleCategories={4}
                language={language}
              />
              
              <div className="main-content">
                {initialLoad ? (
                  renderInitialLoading()
                ) : filteredTodos.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <>
                    {pendingTasks.length > 0 && (
                      <ReorderableTodoList
                        todos={pendingTasks}
                        onTodosChange={(updatedTodos) => {
                          const allUpdatedTodos = [
                            ...updatedTodos,
                            ...completedTasks
                          ];
                          setTodos(allUpdatedTodos);
                        }}
                        onEditTodo={handleEditTodo}
                        formatReminder={formatReminder}
                        language={language}
                      />
                    )}
                    
                    {completedTasks.length > 0 && (
                      <div>
                        <div 
                          className="completed-header"
                          onClick={() => setShowCompleted(!showCompleted)}
                        >
                          <div>
                            <IonIcon 
                              icon={chevronForward} 
                              className={showCompleted ? "expanded" : ""} 
                            />
                            {t('tasks.completed')} ({completedTasks.length})
                          </div>
                          {completedTasks.length > 0 && (
                            <IonButton 
                              size="small" 
                              fill="clear" 
                              onClick={confirmClearCompleted}
                            >
                              {t('tasks.clear')}
                            </IonButton>
                          )}
                        </div>
                        
                        {showCompleted && (
                          <ReorderableTodoList
                            todos={completedTasks}
                            onTodosChange={(updatedTodos) => {
                              const allUpdatedTodos = [
                                ...pendingTasks,
                                ...updatedTodos
                              ];
                              setTodos(allUpdatedTodos);
                            }}
                            onEditTodo={handleEditTodo}
                            formatReminder={formatReminder}
                            language={language}
                          />
                        )}
                      </div>
                    )}
                  </>
                )}
                
                <IonFab vertical="bottom" horizontal="end" slot="fixed" className="add-task-fab">
                  <IonFabButton onClick={() => setShowAddModal(true)} disabled={isLoading}>
                    <IonIcon icon={add} />
                  </IonFabButton>
                </IonFab>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
      
      <IonModal isOpen={showAddModal} onDidDismiss={() => setShowAddModal(false)}>
        <IonPage>
          <PageHeader title={t('tasks.newTask')} />
          <IonContent>
            <div style={{ padding: '16px' }}>
              <div className="form-field">
                <IonLabel>{t('tasks.taskContent')}</IonLabel>
                <IonInput
                  value={newTodo}
                  placeholder={t('tasks.taskContentPlaceholder')}
                  onIonChange={e => setNewTodo(e.detail.value)}
                  className="custom-input"
                />
              </div>
              
              <div className="form-field">
                <IonLabel>{t('tasks.category')}</IonLabel>
                <IonSelect
                  value={newCategory}
                  placeholder={t('tasks.selectCategory')}
                  onIonChange={e => setNewCategory(e.detail.value)}
                >
                  {categories.map(category => (
                    <IonSelectOption key={category} value={category}>
                      {category}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
              
              <div className="form-field">
                <IonLabel>{t('tasks.priority')}</IonLabel>
                <div className="priority-toggle">
                  <IonButton 
                    expand="block"
                    fill={newPriority === 1 ? "solid" : "outline"}
                    onClick={() => setNewPriority(1)}
                  >
                    {t('tasks.normal')}
                  </IonButton>
                  <IonButton 
                    expand="block"
                    fill={newPriority === 3 ? "solid" : "outline"}
                    color="warning"
                    onClick={() => setNewPriority(3)}
                  >
                    {t('tasks.important')}
                    <IonIcon slot="end" icon={star} />
                  </IonButton>
                </div>
              </div>
            </div>
          </IonContent>
          <IonFooter className="modal-footer-safe">
            <div className="footer-buttons-container">
              <IonButton expand="block" onClick={addTodo} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <IonSpinner name="crescent" style={{ marginRight: '8px' }} />
                    {t('app.processing')}
                  </>
                ) : t('tasks.addTask')}
              </IonButton>
            </div>
          </IonFooter>
        </IonPage>
      </IonModal>
      
      <IonModal isOpen={showCategoryManager} onDidDismiss={() => setShowCategoryManager(false)}>
        <CategoryManager
          isOpen={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
          onCategoriesChange={handleCategoriesChange}
          currentCategories={categories}
          todos={todos}
          language={language}
        />
      </IonModal>
      
      <IonAlert
        isOpen={showClearAlert}
        onDidDismiss={() => setShowClearAlert(false)}
        header={t('confirmations.confirmClear')}
        message={t('confirmations.clearCompleted', { count: completedTasks.length })}
        buttons={[
          {
            text: t('tasks.cancel'),
            role: 'cancel'
          },
          {
            text: t('tasks.clear'),
            handler: () => {
              clearCompleted();
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

const EditTodoPageWrapper = () => {
  const history = useHistory();
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  
  const t = (key, params) => translate(language, key, params);
  
  useEffect(() => {
    const initLanguage = async () => {
      try {
        const detectedLang = await detectSystemLanguage();
        setLanguage(detectedLang);
      } catch (error) {
        const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        const detectedLang = browserLang.startsWith('zh') ? 'zh' : 'en';
        setLanguage(detectedLang);
      }
    };
    initLanguage();
  }, []);
  
  const todoId = window.location.hash.split('/edit/')[1];
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const [todosResult, categoriesResult] = await Promise.all([
          AppSdk.appData.queryData({
            collection: COLLECTION_NAME,
            query: []
          }),
          AppSdk.appData.queryData({
            collection: CATEGORY_COLLECTION,
            query: []
          })
        ]);
        
        setTodos(todosResult);
        
        if (categoriesResult.length > 0) {
          setCategories(categoriesResult.map(cat => cat.name));
        } else {
          setCategories(getDefaultCategories(language));
        }
      } catch (error) {
        await reportError(error, 'DataLoadError', { component: 'EditTodoPageWrapper' });
        console.error('加载数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (language) {
      loadData();
    }
  }, [language]);
  
  const currentTodo = todos.find(todo => todo.id === todoId);
  
  const handleSave = (updatedTodo) => {
    setTodos(todos.map(todo => 
      todo.id === updatedTodo.id ? updatedTodo : todo
    ));
    
    history.push('/');
  };
  
  const handleCancel = () => {
    history.push('/');
  };
  
  if (isLoading) {
    return (
      <IonPage>
        <PageHeader title={t('app.title')} />
        <IonContent>
          <div className="initial-loading">
            <IonSpinner name="crescent" />
            <p>{t('app.loading')}</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }
  
  if (!currentTodo) {
    return (
      <IonPage>
        <PageHeader title={t('app.title')} />
        <IonContent>
          <div className="empty-state">
            <IonIcon icon={alertCircleOutline} />
            <h3>{t('tasks.taskNotFound')}</h3>
            <p>{t('tasks.taskNotFoundDesc')}</p>
            <IonButton expand="block" onClick={handleCancel}>
              {t('tasks.backToHome')}
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }
  
  return (
    <EditTodoPage 
      todo={currentTodo}
      onSave={handleSave}
      onCancel={handleCancel}
      categories={categories}
      language={language}
    />
  );
};

const App = () => {
  const [language, setLanguage] = useState('en');
  
  useEffect(() => {
    const initLanguage = async () => {
      try {
        const detectedLang = await detectSystemLanguage();
        setLanguage(detectedLang);
      } catch (error) {
        const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
        const detectedLang = browserLang.startsWith('zh') ? 'zh' : 'en';
        setLanguage(detectedLang);
      }
    };
    initLanguage();
  }, []);
  
  const t = (key, params) => translate(language, key, params);
  
  const contextValue = {
    language,
    t,
    setLanguage,
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      <IonApp>
        <IonReactHashRouter>
          <IonRouterOutlet>
            <Switch>
              <Route path="/edit/:id" component={EditTodoPageWrapper} />
              <Route path="/" component={HomePage} exact />
            </Switch>
          </IonRouterOutlet>
        </IonReactHashRouter>
      </IonApp>
    </LanguageContext.Provider>
  );
};

export default App;