import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonIcon,
  IonButton,
  IonSearchbar,
  IonFab,
  IonFabButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAlert,
  IonCard,
  IonCardContent,
  IonChip,
  IonRippleEffect,
  IonBadge
} from '@ionic/react';
import { 
  addOutline, 
  barbellOutline, 
  timeOutline, 
  calendarOutline,
  trashOutline,
  createOutline,
  copyOutline,
  searchOutline,
  filterOutline,
  arrowForwardOutline,
  chevronForwardOutline,
  ellipsisHorizontal
} from 'ionicons/icons';
import { Header } from '@morphicai/components';
import { useHistory } from 'react-router-dom';

import useStore from '../utils/store';
import { calculatePlanDuration } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const PlanLibrary = ({ onAddPlan }) => {
  const history = useHistory();
  const { 
    plans, 
    loadPlans, 
    deletePlan, 
    savePlanAsTemplate,
    isLoading 
  } = useStore();
  
  const [searchText, setSearchText] = useState('');
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  
  useEffect(() => {
    loadPlans();
  }, [loadPlans]);
  
  useEffect(() => {
    if (plans.length > 0) {
      if (searchText) {
        const filtered = plans.filter(plan => 
          plan.name.toLowerCase().includes(searchText.toLowerCase()) ||
          plan.description?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredPlans(filtered);
      } else {
        setFilteredPlans([...plans].sort((a, b) => 
          new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
        ));
      }
    } else {
      setFilteredPlans([]);
    }
  }, [plans, searchText]);
  
  const handleSearch = (e) => {
    setSearchText(e.detail.value);
  };
  
  const navigateToCreatePlan = () => {
    if (onAddPlan) {
      onAddPlan();
    } else {
      history.push('/plan/create');
    }
  };
  
  const navigateToPlanDetail = (planId) => {
    history.push(`/plan/${planId}`);
  };
  
  const navigateToEditPlan = (planId) => {
    history.push(`/plan/edit/${planId}`);
  };
  
  const confirmDeletePlan = (plan, e) => {
    if (e) {
      e.stopPropagation();
    }
    setPlanToDelete(plan);
    setShowDeleteAlert(true);
  };
  
  const handleDeletePlan = async () => {
    if (planToDelete) {
      try {
        await deletePlan(planToDelete.id);
      } catch (error) {
        console.error('删除计划失败:', error);
      }
    }
    setPlanToDelete(null);
  };
  
  const handleSaveAsTemplate = async (planId) => {
    try {
      await savePlanAsTemplate(planId);
    } catch (error) {
      console.error('保存为模板失败:', error);
    }
  };
  
  // 获取部位标签类名
  const getBodyPartClass = (part) => {
    const partMap = {
      '胸部': 'chest',
      '背部': 'back',
      '腿部': 'legs',
      '肩部': 'shoulders',
      '手臂': 'arms'
    };
    return partMap[part] || '';
  };
  
  if (isLoading && plans.length === 0) {
    return <LoadingSpinner message="加载健身计划..." />;
  }
  
  return (
    <IonContent>
      <div style={{ padding: '10px 12px 0' }}>
        <IonSearchbar
          placeholder="搜索健身计划"
          value={searchText}
          onIonInput={handleSearch}
          showCancelButton="never"
          className="search-bar"
          searchIcon={searchOutline}
        />
      </div>
      
      {filteredPlans.length > 0 ? (
        <div>
          {filteredPlans.map(plan => {
            const estimatedDuration = calculatePlanDuration(plan);
            
            return (
              <IonItemSliding key={plan.id}>
                <IonCard 
                  className="workout-card" 
                  style={{ margin: '10px 12px', cursor: 'pointer', position: 'relative' }}
                  onClick={() => navigateToPlanDetail(plan.id)}
                >
                  <IonCardContent style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        backgroundColor: 'rgba(123, 104, 238, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <IonIcon icon={barbellOutline} color="primary" style={{ fontSize: '20px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ 
                          margin: '0 0 4px 0', 
                          fontSize: '16px', 
                          fontWeight: 'bold' 
                        }}>
                          {plan.name}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ 
                            fontSize: '13px', 
                            color: 'var(--app-medium-text)',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <span>{plan.exercises?.length || 0} 个动作</span>
                            {estimatedDuration > 0 && (
                              <span style={{ marginLeft: '8px', display: 'flex', alignItems: 'center' }}>
                                • <IonIcon icon={timeOutline} style={{ margin: '0 2px 0 4px' }} /> {estimatedDuration}分钟
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <IonButton 
                          fill="clear" 
                          color="danger" 
                          size="small" 
                          onClick={(e) => confirmDeletePlan(plan, e)}
                          style={{ marginRight: '4px' }}
                        >
                          <IonIcon slot="icon-only" icon={trashOutline} />
                        </IonButton>
                        <IonIcon 
                          icon={chevronForwardOutline} 
                          color="medium" 
                          style={{ fontSize: '18px' }}
                        />
                      </div>
                    </div>
                    
                    {plan.bodyParts && plan.bodyParts.length > 0 && (
                      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap' }}>
                        {plan.bodyParts.map((part, idx) => (
                          <div key={idx} className={`body-part-tag ${getBodyPartClass(part)}`}>
                            {part}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <IonRippleEffect />
                  </IonCardContent>
                </IonCard>
                
                <IonItemOptions side="end">
                  <IonItemOption 
                    color="primary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToEditPlan(plan.id);
                    }}
                    style={{ '--padding-start': '1rem', '--padding-end': '1rem' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <IonIcon icon={createOutline} style={{ fontSize: '20px', marginBottom: '4px' }} />
                      <small>编辑</small>
                    </div>
                  </IonItemOption>
                  <IonItemOption 
                    color="secondary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveAsTemplate(plan.id);
                    }}
                    style={{ '--padding-start': '1rem', '--padding-end': '1rem' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <IonIcon icon={copyOutline} style={{ fontSize: '20px', marginBottom: '4px' }} />
                      <small>模板</small>
                    </div>
                  </IonItemOption>
                  <IonItemOption 
                    color="danger" 
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeletePlan(plan);
                    }}
                    style={{ '--padding-start': '1rem', '--padding-end': '1rem' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <IonIcon icon={trashOutline} style={{ fontSize: '20px', marginBottom: '4px' }} />
                      <small>删除</small>
                    </div>
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          icon={barbellOutline}
          message={searchText ? "没有找到匹配的计划" : "还没有健身计划"}
          actionText="创建计划"
          onAction={navigateToCreatePlan}
          hideAction={!!searchText}
        />
      )}
      
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={navigateToCreatePlan} className="fab-button">
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>
      
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="确认删除"
        message={`确定要删除"${planToDelete?.name}"吗？此操作无法撤销。`}
        buttons={[
          {
            text: '取消',
            role: 'cancel',
            handler: () => setPlanToDelete(null)
          },
          {
            text: '删除',
            role: 'destructive',
            handler: handleDeletePlan
          }
        ]}
      />
    </IonContent>
  );
};

export default PlanLibrary;