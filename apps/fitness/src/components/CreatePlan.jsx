import React, { useState, useEffect } from 'react';
import { 
  IonPage,
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonTextarea,
  IonButton,
  IonIcon,
  IonList,
  IonReorder,
  IonReorderGroup,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonCard,
  IonCardContent,
  IonAlert,
  IonModal,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonRange,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonToast,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonChip,
  IonAvatar,
  IonBadge,
  IonNote,
  IonRadioGroup,
  IonRadio,
  IonListHeader,
  IonHeader
} from '@ionic/react';
import { 
  addOutline, 
  removeOutline, 
  saveOutline, 
  closeOutline,
  trashOutline,
  copyOutline,
  searchOutline,
  barbellOutline,
  listOutline,
  informationCircleOutline
} from 'ionicons/icons';
import { PageHeader } from '@morphixai/components';
import { useParams, useHistory } from 'react-router-dom';

import useStore from '../utils/store';
import useLanguage from '../utils/useLanguage';
import { createDefaultPlan, createNewExercise, generateId, deepClone } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import { getAllCategories, getExercisesByCategory, searchExercisesByName } from '../utils/exerciseData';

const CreatePlan = () => {
  const { id } = useParams();
  const history = useHistory();
  const { t } = useLanguage();
  const { 
    getPlanById, 
    createPlan, 
    updatePlan, 
    loadPlans,
    isLoading 
  } = useStore();
  
  const [plan, setPlan] = useState(createDefaultPlan());
  const [editMode, setEditMode] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(-1);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // 动作选择相关状态
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [exerciseCategories, setExerciseCategories] = useState([]);
  const [exerciseResults, setExerciseResults] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseSelectorMode, setExerciseSelectorMode] = useState('category'); // 'category' 或 'search'
  
  useEffect(() => {
    if (id) {
      setEditMode(true);
      loadPlans().then(() => {
        const existingPlan = getPlanById(id);
        if (existingPlan) {
          setPlan(existingPlan);
        }
      });
    }
    
    // 加载健身动作分类
    setExerciseCategories(getAllCategories());
  }, [id, getPlanById, loadPlans]);
  
  const handleInputChange = (field, value) => {
    setPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleReorder = (event) => {
    const exercises = [...plan.exercises];
    const movedItem = exercises.splice(event.detail.from, 1)[0];
    exercises.splice(event.detail.to, 0, movedItem);
    
    setPlan(prev => ({
      ...prev,
      exercises
    }));
    
    event.detail.complete();
  };
  
  const addExercise = () => {
    // 打开动作选择器
    setShowExerciseSelector(true);
    setExerciseSearchQuery('');
    setActiveCategory('');
    setExerciseResults([]);
    setSelectedExercise(null);
    setExerciseSelectorMode('category');
  };
  
  const editExercise = (index) => {
    setCurrentExercise(deepClone(plan.exercises[index]));
    setCurrentExerciseIndex(index);
    setShowExerciseModal(true);
  };
  
  const confirmDeleteExercise = (index) => {
    setExerciseToDelete(index);
    setShowDeleteAlert(true);
  };
  
  const deleteExercise = () => {
    if (exerciseToDelete !== null) {
      const exercises = [...plan.exercises];
      exercises.splice(exerciseToDelete, 1);
      
      setPlan(prev => ({
        ...prev,
        exercises
      }));
    }
    setExerciseToDelete(null);
  };
  
  const duplicateExercise = (index) => {
    const exercises = [...plan.exercises];
    const newExercise = {
      ...deepClone(exercises[index]),
      id: generateId()
    };
    
    exercises.splice(index + 1, 0, newExercise);
    
    setPlan(prev => ({
      ...prev,
      exercises
    }));
  };
  
  const handleExerciseChange = (field, value) => {
    setCurrentExercise(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const saveExercise = () => {
    // 验证必填字段
    if (!currentExercise.name) {
      setToastMessage(t('createPlan.pleaseEnterName'));
      setShowToast(true);
      return;
    }
    
    const exercises = [...plan.exercises];
    
    if (currentExerciseIndex === -1) {
      // 添加新动作
      exercises.push(currentExercise);
    } else {
      // 更新现有动作
      exercises[currentExerciseIndex] = currentExercise;
    }
    
    setPlan(prev => ({
      ...prev,
      exercises
    }));
    
    setShowExerciseModal(false);
  };
  
  const savePlan = async () => {
    // 验证必填字段
    if (!plan.name) {
      setToastMessage(t('createPlan.pleaseEnterName'));
      setShowToast(true);
      return;
    }
    
    if (!plan.exercises || plan.exercises.length === 0) {
      setToastMessage(t('createPlan.pleaseAddExercise'));
      setShowToast(true);
      return;
    }
    
    try {
      if (editMode) {
        await updatePlan(id, plan);
      } else {
        await createPlan(plan);
      }
      
      history.goBack();
    } catch (error) {
      console.error('保存计划失败:', error);
      setToastMessage('保存失败，请重试');
      setShowToast(true);
    }
  };
  
  // 处理分类选择
  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
    const exercises = getExercisesByCategory(categoryId);
    setExerciseResults(exercises);
  };
  
  // 处理搜索
  const handleSearch = (query) => {
    setExerciseSearchQuery(query);
    if (query.trim() === '') {
      setExerciseResults([]);
      return;
    }
    const results = searchExercisesByName(query);
    setExerciseResults(results);
  };
  
  // 选择动作
  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
  };
  
  // 确认选择动作
  const confirmExerciseSelection = () => {
    if (!selectedExercise) {
      setToastMessage(t('createPlan.exerciseName'));
      setShowToast(true);
      return;
    }
    
    const newExercise = {
      id: generateId(),
      name: selectedExercise.name,
      sets: selectedExercise.defaultSets,
      reps: selectedExercise.defaultReps,
      weight: selectedExercise.defaultWeight,
      restBetweenSets: selectedExercise.defaultRestBetweenSets,
      restAfterExercise: selectedExercise.defaultRestAfterExercise
    };
    
    // 添加到计划中
    setPlan(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
    
    setShowExerciseSelector(false);
  };
  
  // 切换自定义动作
  const handleCustomExercise = () => {
    setCurrentExercise(createNewExercise());
    setCurrentExerciseIndex(-1);
    setShowExerciseSelector(false);
    setShowExerciseModal(true);
  };
  
  if (isLoading && editMode) {
    return (
      <IonPage>
        <PageHeader title={t(editMode ? 'headers.editPlan' : 'headers.createPlan')} />
        <IonContent>
          <LoadingSpinner message={t('loading.plans')} />
        </IonContent>
      </IonPage>
    );
  }
  
  return (
    <IonPage>
      <PageHeader title={t(editMode ? 'headers.editPlan' : 'headers.createPlan')} />
      <IonContent>
        <IonCard className="workout-card">
          <IonCardContent>
            <IonItem className="form-group">
              <IonLabel position="stacked">{t('createPlan.planName')} *</IonLabel>
              <IonInput
                value={plan.name}
                onIonInput={(e) => handleInputChange('name', e.detail.value)}
                placeholder={t('createPlan.planNamePlaceholder')}
                required
              />
            </IonItem>
            
            <IonItem className="form-group">
              <IonLabel position="stacked">{t('createPlan.description')}</IonLabel>
              <IonTextarea
                value={plan.description}
                onIonInput={(e) => handleInputChange('description', e.detail.value)}
                placeholder={t('createPlan.descriptionPlaceholder')}
                rows={3}
              />
            </IonItem>
          </IonCardContent>
        </IonCard>
        
        <div className="section-title">{t('plans.exerciseList')}</div>
        
        {plan.exercises && plan.exercises.length > 0 ? (
          <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
            {plan.exercises.map((exercise, index) => (
              <IonItemSliding key={exercise.id || index}>
                <IonItem className="exercise-list-item">
                  <IonLabel onClick={() => editExercise(index)}>
                    <h2>{exercise.name || t('createPlan.exerciseName')}</h2>
                    <div className="exercise-detail">
                      <span>{exercise.sets} {t('createPlan.sets')} × {exercise.reps} {t('createPlan.reps')}</span>
                      {exercise.weight > 0 && (
                        <span> • {exercise.weight} {t('createPlan.weightUnit')}</span>
                      )}
                    </div>
                  </IonLabel>
                  <IonReorder slot="end" />
                </IonItem>
                
                <IonItemOptions side="end">
                  <IonItemOption color="secondary" onClick={() => duplicateExercise(index)}>
                    <IonIcon slot="icon-only" icon={copyOutline} />
                  </IonItemOption>
                  <IonItemOption color="danger" onClick={() => confirmDeleteExercise(index)}>
                    <IonIcon slot="icon-only" icon={trashOutline} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonReorderGroup>
        ) : (
          <IonCard className="workout-card">
            <IonCardContent className="center-content" style={{ padding: '24px' }}>
              <p>{t('createPlan.addExercise')}</p>
            </IonCardContent>
          </IonCard>
        )}
        
        <div style={{ padding: '16px' }}>
          <IonButton 
            expand="block" 
            fill="outline" 
            onClick={addExercise}
          >
            <IonIcon slot="start" icon={addOutline} />
            {t('createPlan.addExercise')}
          </IonButton>
          
          <IonButton 
            expand="block" 
            color="primary"
            onClick={savePlan}
            style={{ marginTop: '16px' }}
          >
            <IonIcon slot="start" icon={saveOutline} />
            {editMode ? t('createPlan.updatePlan') : t('createPlan.savePlan')}
          </IonButton>
        </div>
        
        {/* 动作编辑模态框 */}
        <IonModal isOpen={showExerciseModal} onDidDismiss={() => setShowExerciseModal(false)}>
          <IonToolbar>
            <IonTitle>{currentExerciseIndex === -1 ? t('createPlan.addExercise') : t('common.edit')}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowExerciseModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
          
          <IonContent>
            {currentExercise && (
              <IonList>
                <IonItem className="form-group">
                  <IonLabel position="stacked">{t('createPlan.exerciseName')} *</IonLabel>
                  <IonInput
                    value={currentExercise.name}
                    onIonInput={(e) => handleExerciseChange('name', e.detail.value)}
                    placeholder={t('createPlan.exerciseNamePlaceholder')}
                    required
                  />
                </IonItem>
                
                <IonItem className="form-group">
                  <IonLabel position="stacked">{t('createPlan.sets')}</IonLabel>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="9">
                        <IonRange
                          min={1}
                          max={10}
                          step={1}
                          value={currentExercise.sets}
                          onIonChange={(e) => handleExerciseChange('sets', e.detail.value)}
                        />
                      </IonCol>
                      <IonCol size="3">
                        <IonInput
                          type="number"
                          value={currentExercise.sets}
                          onIonInput={(e) => handleExerciseChange('sets', parseInt(e.detail.value) || 1)}
                        />
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonItem>
                
                <IonItem className="form-group">
                  <IonLabel position="stacked">{t('createPlan.reps')}</IonLabel>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="9">
                        <IonRange
                          min={1}
                          max={30}
                          step={1}
                          value={currentExercise.reps}
                          onIonChange={(e) => handleExerciseChange('reps', e.detail.value)}
                        />
                      </IonCol>
                      <IonCol size="3">
                        <IonInput
                          type="number"
                          value={currentExercise.reps}
                          onIonInput={(e) => handleExerciseChange('reps', parseInt(e.detail.value) || 1)}
                        />
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonItem>
                
                <IonItem className="form-group">
                  <IonLabel position="stacked">{t('createPlan.weight')} ({t('createPlan.weightUnit')})</IonLabel>
                  <IonInput
                    type="number"
                    value={currentExercise.weight}
                    onIonInput={(e) => handleExerciseChange('weight', parseFloat(e.detail.value) || 0)}
                  />
                </IonItem>
                
                <IonItem className="form-group">
                  <IonLabel position="stacked">{t('execution.rest')} ({t('common.seconds')})</IonLabel>
                  <IonSelect
                    value={currentExercise.restBetweenSets}
                    onIonChange={(e) => handleExerciseChange('restBetweenSets', e.detail.value)}
                  >
                    <IonSelectOption value={30}>30{t('common.seconds')}</IonSelectOption>
                    <IonSelectOption value={45}>45{t('common.seconds')}</IonSelectOption>
                    <IonSelectOption value={60}>60{t('common.seconds')}</IonSelectOption>
                    <IonSelectOption value={90}>90{t('common.seconds')}</IonSelectOption>
                    <IonSelectOption value={120}>2{t('common.minutes')}</IonSelectOption>
                    <IonSelectOption value={180}>3{t('common.minutes')}</IonSelectOption>
                  </IonSelect>
                </IonItem>
                
                <IonItem className="form-group">
                  <IonLabel position="stacked">{t('execution.rest')} ({t('common.seconds')})</IonLabel>
                  <IonSelect
                    value={currentExercise.restAfterExercise}
                    onIonChange={(e) => handleExerciseChange('restAfterExercise', e.detail.value)}
                  >
                    <IonSelectOption value={60}>60{t('common.seconds')}</IonSelectOption>
                    <IonSelectOption value={90}>90{t('common.seconds')}</IonSelectOption>
                    <IonSelectOption value={120}>2{t('common.minutes')}</IonSelectOption>
                    <IonSelectOption value={180}>3{t('common.minutes')}</IonSelectOption>
                    <IonSelectOption value={240}>4{t('common.minutes')}</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonList>
            )}
            
            <div style={{ padding: '16px' }}>
              <IonButton 
                expand="block" 
                color="primary"
                onClick={saveExercise}
              >
                {t('common.save')}
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
        
        {/* 动作选择模态框 */}
        <IonModal isOpen={showExerciseSelector} onDidDismiss={() => setShowExerciseSelector(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{t('createPlan.addExercise')}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowExerciseSelector(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
            
            {/* 分段控制器：分类/搜索 */}
            <IonToolbar>
              <IonSegment value={exerciseSelectorMode} onIonChange={e => setExerciseSelectorMode(e.detail.value)}>
                <IonSegmentButton value="category">
                  <IonIcon icon={listOutline} />
                  <IonLabel>{t('createPlan.targetBodyParts')}</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="search">
                  <IonIcon icon={searchOutline} />
                  <IonLabel>{t('common.search')}</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonToolbar>
            
            {/* 搜索栏，仅在搜索模式显示 */}
            {exerciseSelectorMode === 'search' && (
              <IonToolbar>
                <IonSearchbar
                  value={exerciseSearchQuery}
                  onIonInput={e => handleSearch(e.detail.value)}
                  placeholder={t('plans.searchPlaceholder')}
                  showCancelButton="never"
                />
              </IonToolbar>
            )}
          </IonHeader>
          
          <IonContent>
            {/* 分类模式 */}
            {exerciseSelectorMode === 'category' && (
              <>
                {/* 分类选择器 */}
                {!activeCategory && (
                  <IonList>
                    <IonListHeader>
                      <IonLabel>{t('createPlan.targetBodyParts')}</IonLabel>
                    </IonListHeader>
                    {exerciseCategories.map(category => (
                      <IonItem 
                        key={category.id} 
                        button 
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <IonIcon icon={barbellOutline} slot="start" />
                        <IonLabel>{category.name}</IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                )}
                
                {/* 分类下的动作列表 */}
                {activeCategory && (
                  <>
                    <IonItem>
                      <IonButton 
                        fill="clear" 
                        onClick={() => setActiveCategory('')}
                      >
                        {t('common.back')}
                      </IonButton>
                      <IonLabel>
                        {exerciseCategories.find(c => c.id === activeCategory)?.name}
                      </IonLabel>
                    </IonItem>
                    <IonRadioGroup 
                      value={selectedExercise?.name || ''} 
                      onIonChange={e => {
                        const selected = exerciseResults.find(ex => ex.name === e.detail.value);
                        if (selected) handleExerciseSelect(selected);
                      }}
                    >
                      {exerciseResults.map(exercise => (
                        <IonItem key={exercise.name} button>
                          <IonLabel>
                            <h2>{exercise.name}</h2>
                            <IonNote>
                              {exercise.defaultSets} {t('createPlan.sets')} × {exercise.defaultReps} {t('createPlan.reps')}
                              {exercise.defaultWeight > 0 && ` • ${exercise.defaultWeight} ${t('createPlan.weightUnit')}`}
                            </IonNote>
                          </IonLabel>
                          <IonRadio 
                            slot="end" 
                            value={exercise.name}
                          />
                        </IonItem>
                      ))}
                    </IonRadioGroup>
                  </>
                )}
              </>
            )}
            
            {/* 搜索模式 */}
            {exerciseSelectorMode === 'search' && (
              <IonRadioGroup 
                value={selectedExercise?.name || ''}
                onIonChange={e => {
                  const selected = exerciseResults.find(ex => ex.name === e.detail.value);
                  if (selected) handleExerciseSelect(selected);
                }}
              >
                {exerciseResults.length > 0 ? (
                  exerciseResults.map(exercise => (
                    <IonItem key={exercise.name} button>
                      <IonLabel>
                        <h2>{exercise.name}</h2>
                        <IonNote>
                          {exercise.category?.name} • 
                          {exercise.defaultSets} {t('createPlan.sets')} × {exercise.defaultReps} {t('createPlan.reps')}
                          {exercise.defaultWeight > 0 && ` • ${exercise.defaultWeight} ${t('createPlan.weightUnit')}`}
                        </IonNote>
                      </IonLabel>
                      <IonRadio 
                        slot="end" 
                        value={exercise.name}
                      />
                    </IonItem>
                  ))
                ) : (
                  <IonItem>
                    <IonLabel className="ion-text-center">
                      {exerciseSearchQuery ? t('plans.noMatch') : t('plans.searchPlaceholder')}
                    </IonLabel>
                  </IonItem>
                )}
              </IonRadioGroup>
            )}
            
            <div style={{ padding: '16px' }}>
              <IonButton 
                expand="block" 
                color="primary"
                onClick={confirmExerciseSelection}
                disabled={!selectedExercise}
              >
                {t('common.confirm')}
              </IonButton>
              
              <IonButton 
                expand="block" 
                fill="outline"
                onClick={handleCustomExercise}
                style={{ marginTop: '8px' }}
              >
                {t('createPlan.addExercise')}
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
        
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={t('plans.confirmDelete')}
          message={t('plans.confirmDeleteMessage').replace('{name}', '')}
          buttons={[
            {
              text: t('common.cancel'),
              role: 'cancel',
              handler: () => setExerciseToDelete(null)
            },
            {
              text: t('common.delete'),
              role: 'destructive',
              handler: deleteExercise
            }
          ]}
        />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default CreatePlan;