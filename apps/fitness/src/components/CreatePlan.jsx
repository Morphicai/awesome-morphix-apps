import React, { useState, useEffect } from 'react';
import { 
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
import { Header } from '@morphicai/components';
import { useParams, useHistory } from 'react-router-dom';

import useStore from '../utils/store';
import { createDefaultPlan, createNewExercise, generateId, deepClone } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import { getAllCategories, getExercisesByCategory, searchExercisesByName } from '../utils/exerciseData';

const CreatePlan = () => {
  const { id } = useParams();
  const history = useHistory();
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
      setToastMessage('请输入动作名称');
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
      setToastMessage('请输入计划名称');
      setShowToast(true);
      return;
    }
    
    if (!plan.exercises || plan.exercises.length === 0) {
      setToastMessage('请至少添加一个动作');
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
      setToastMessage('请选择一个动作');
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
    return <LoadingSpinner message="加载计划数据..." />;
  }
  
  return (
    <>
      <Header title={editMode ? '编辑计划' : '创建计划'} />
      <IonContent>
        <IonCard className="workout-card">
          <IonCardContent>
            <IonItem className="form-group">
              <IonLabel position="stacked">计划名称 *</IonLabel>
              <IonInput
                value={plan.name}
                onIonInput={(e) => handleInputChange('name', e.detail.value)}
                placeholder="例如：胸部训练、腿部日"
                required
              />
            </IonItem>
            
            <IonItem className="form-group">
              <IonLabel position="stacked">计划描述</IonLabel>
              <IonTextarea
                value={plan.description}
                onIonInput={(e) => handleInputChange('description', e.detail.value)}
                placeholder="添加计划描述（可选）"
                rows={3}
              />
            </IonItem>
          </IonCardContent>
        </IonCard>
        
        <div className="section-title">动作列表</div>
        
        {plan.exercises && plan.exercises.length > 0 ? (
          <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
            {plan.exercises.map((exercise, index) => (
              <IonItemSliding key={exercise.id || index}>
                <IonItem className="exercise-list-item">
                  <IonLabel onClick={() => editExercise(index)}>
                    <h2>{exercise.name || '未命名动作'}</h2>
                    <div className="exercise-detail">
                      <span>{exercise.sets} 组 × {exercise.reps} 次</span>
                      {exercise.weight > 0 && (
                        <span> • {exercise.weight} kg</span>
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
              <p>还没有添加动作</p>
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
            添加动作
          </IonButton>
          
          <IonButton 
            expand="block" 
            color="primary"
            onClick={savePlan}
            style={{ marginTop: '16px' }}
          >
            <IonIcon slot="start" icon={saveOutline} />
            保存计划
          </IonButton>
        </div>
        
        {/* 动作编辑模态框 */}
        <IonModal isOpen={showExerciseModal} onDidDismiss={() => setShowExerciseModal(false)}>
          <IonToolbar>
            <IonTitle>{currentExerciseIndex === -1 ? '添加动作' : '编辑动作'}</IonTitle>
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
                  <IonLabel position="stacked">动作名称 *</IonLabel>
                  <IonInput
                    value={currentExercise.name}
                    onIonInput={(e) => handleExerciseChange('name', e.detail.value)}
                    placeholder="例如：卧推、深蹲"
                    required
                  />
                </IonItem>
                
                <IonItem className="form-group">
                  <IonLabel position="stacked">组数</IonLabel>
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
                  <IonLabel position="stacked">每组次数</IonLabel>
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
                  <IonLabel position="stacked">重量 (kg)</IonLabel>
                  <IonInput
                    type="number"
                    value={currentExercise.weight}
                    onIonInput={(e) => handleExerciseChange('weight', parseFloat(e.detail.value) || 0)}
                  />
                </IonItem>
                
                <IonItem className="form-group">
                  <IonLabel position="stacked">组间休息时间 (秒)</IonLabel>
                  <IonSelect
                    value={currentExercise.restBetweenSets}
                    onIonChange={(e) => handleExerciseChange('restBetweenSets', e.detail.value)}
                  >
                    <IonSelectOption value={30}>30秒</IonSelectOption>
                    <IonSelectOption value={45}>45秒</IonSelectOption>
                    <IonSelectOption value={60}>60秒</IonSelectOption>
                    <IonSelectOption value={90}>90秒</IonSelectOption>
                    <IonSelectOption value={120}>2分钟</IonSelectOption>
                    <IonSelectOption value={180}>3分钟</IonSelectOption>
                  </IonSelect>
                </IonItem>
                
                <IonItem className="form-group">
                  <IonLabel position="stacked">动作后休息时间 (秒)</IonLabel>
                  <IonSelect
                    value={currentExercise.restAfterExercise}
                    onIonChange={(e) => handleExerciseChange('restAfterExercise', e.detail.value)}
                  >
                    <IonSelectOption value={60}>60秒</IonSelectOption>
                    <IonSelectOption value={90}>90秒</IonSelectOption>
                    <IonSelectOption value={120}>2分钟</IonSelectOption>
                    <IonSelectOption value={180}>3分钟</IonSelectOption>
                    <IonSelectOption value={240}>4分钟</IonSelectOption>
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
                保存动作
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
        
        {/* 动作选择模态框 */}
        <IonModal isOpen={showExerciseSelector} onDidDismiss={() => setShowExerciseSelector(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>选择健身动作</IonTitle>
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
                  <IonLabel>分类浏览</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="search">
                  <IonIcon icon={searchOutline} />
                  <IonLabel>搜索</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonToolbar>
            
            {/* 搜索栏，仅在搜索模式显示 */}
            {exerciseSelectorMode === 'search' && (
              <IonToolbar>
                <IonSearchbar
                  value={exerciseSearchQuery}
                  onIonInput={e => handleSearch(e.detail.value)}
                  placeholder="搜索动作名称..."
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
                      <IonLabel>选择部位</IonLabel>
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
                        返回分类
                      </IonButton>
                      <IonLabel>
                        {exerciseCategories.find(c => c.id === activeCategory)?.name} 动作
                      </IonLabel>
                    </IonItem>
                    <IonRadioGroup value={selectedExercise?.name || ''}>
                      {exerciseResults.map(exercise => (
                        <IonItem key={exercise.name}>
                          <IonLabel>
                            <h2>{exercise.name}</h2>
                            <IonNote>
                              {exercise.defaultSets} 组 × {exercise.defaultReps} 次
                              {exercise.defaultWeight > 0 && ` • ${exercise.defaultWeight} kg`}
                            </IonNote>
                          </IonLabel>
                          <IonRadio 
                            slot="end" 
                            value={exercise.name}
                            onClick={() => handleExerciseSelect(exercise)}
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
              <IonRadioGroup value={selectedExercise?.name || ''}>
                {exerciseResults.length > 0 ? (
                  exerciseResults.map(exercise => (
                    <IonItem key={exercise.name}>
                      <IonLabel>
                        <h2>{exercise.name}</h2>
                        <IonNote>
                          {exercise.category?.name} • 
                          {exercise.defaultSets} 组 × {exercise.defaultReps} 次
                          {exercise.defaultWeight > 0 && ` • ${exercise.defaultWeight} kg`}
                        </IonNote>
                      </IonLabel>
                      <IonRadio 
                        slot="end" 
                        value={exercise.name}
                        onClick={() => handleExerciseSelect(exercise)}
                      />
                    </IonItem>
                  ))
                ) : (
                  <IonItem>
                    <IonLabel className="ion-text-center">
                      {exerciseSearchQuery ? '没有找到匹配的动作' : '请输入搜索关键词'}
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
                选择此动作
              </IonButton>
              
              <IonButton 
                expand="block" 
                fill="outline"
                onClick={handleCustomExercise}
                style={{ marginTop: '8px' }}
              >
                创建自定义动作
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
        
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="确认删除"
          message="确定要删除这个动作吗？"
          buttons={[
            {
              text: '取消',
              role: 'cancel',
              handler: () => setExerciseToDelete(null)
            },
            {
              text: '删除',
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
    </>
  );
};

export default CreatePlan;