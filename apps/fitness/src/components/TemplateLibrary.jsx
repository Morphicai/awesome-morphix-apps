import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonIcon,
  IonButton,
  IonSearchbar,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAlert,
  IonCard,
  IonCardContent
} from '@ionic/react';
import { 
  copyOutline, 
  barbellOutline, 
  timeOutline, 
  trashOutline,
  addOutline
} from 'ionicons/icons';
import { Header } from '@morphicai/components';
import { useHistory } from 'react-router-dom';

import useStore from '../utils/store';
import { calculatePlanDuration } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const TemplateLibrary = () => {
  const history = useHistory();
  const { 
    templates, 
    loadTemplates, 
    deleteTemplate, 
    createPlanFromTemplate,
    isLoading 
  } = useStore();
  
  const [searchText, setSearchText] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);
  
  useEffect(() => {
    if (templates.length > 0) {
      if (searchText) {
        const filtered = templates.filter(template => 
          template.name.toLowerCase().includes(searchText.toLowerCase()) ||
          template.description?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredTemplates(filtered);
      } else {
        setFilteredTemplates([...templates].sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        ));
      }
    } else {
      setFilteredTemplates([]);
    }
  }, [templates, searchText]);
  
  const handleSearch = (e) => {
    setSearchText(e.detail.value);
  };
  
  const confirmDeleteTemplate = (template) => {
    setTemplateToDelete(template);
    setShowDeleteAlert(true);
  };
  
  const handleDeleteTemplate = async () => {
    if (templateToDelete) {
      try {
        await deleteTemplate(templateToDelete.id);
      } catch (error) {
        console.error('删除模板失败:', error);
      }
    }
    setTemplateToDelete(null);
  };
  
  const handleCreateFromTemplate = async (templateId) => {
    try {
      const newPlan = await createPlanFromTemplate(templateId);
      if (newPlan && newPlan.id) {
        history.push(`/edit-plan/${newPlan.id}`);
      }
    } catch (error) {
      console.error('从模板创建计划失败:', error);
    }
  };
  
  const navigateToCreatePlan = () => {
    history.push('/create-plan');
  };
  
  if (isLoading && templates.length === 0) {
    return <LoadingSpinner message="加载模板库..." />;
  }
  
  return (
    <>
      <Header title="模板库" />
      <IonContent>
        <IonSearchbar
          placeholder="搜索模板"
          value={searchText}
          onIonInput={handleSearch}
          showCancelButton="never"
        />
        
        {filteredTemplates.length > 0 ? (
          <IonList>
            {filteredTemplates.map(template => {
              const estimatedDuration = calculatePlanDuration(template);
              
              return (
                <IonItemSliding key={template.id}>
                  <IonItem button onClick={() => handleCreateFromTemplate(template.id)}>
                    <IonIcon icon={barbellOutline} slot="start" color="secondary" />
                    <IonLabel>
                      <h2>{template.name}</h2>
                      <p>
                        {template.exercises?.length || 0} 个动作
                        {estimatedDuration > 0 && (
                          <span> • <IonIcon icon={timeOutline} size="small" /> {estimatedDuration}分钟</span>
                        )}
                      </p>
                    </IonLabel>
                  </IonItem>
                  
                  <IonItemOptions side="end">
                    <IonItemOption color="primary" onClick={() => handleCreateFromTemplate(template.id)}>
                      <IonIcon slot="icon-only" icon={copyOutline} />
                    </IonItemOption>
                    <IonItemOption color="danger" onClick={() => confirmDeleteTemplate(template)}>
                      <IonIcon slot="icon-only" icon={trashOutline} />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              );
            })}
          </IonList>
        ) : (
          <IonCard className="workout-card">
            <IonCardContent>
              <EmptyState 
                icon={copyOutline}
                message={searchText ? "没有找到匹配的模板" : "没有保存的模板"}
                actionText="创建计划"
                onAction={navigateToCreatePlan}
                hideAction={!!searchText}
              />
            </IonCardContent>
          </IonCard>
        )}
        
        <div style={{ padding: '16px' }}>
          <IonButton 
            expand="block" 
            onClick={navigateToCreatePlan}
          >
            <IonIcon slot="start" icon={addOutline} />
            创建新计划
          </IonButton>
        </div>
        
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="确认删除"
          message={`确定要删除"${templateToDelete?.name}"模板吗？此操作无法撤销。`}
          buttons={[
            {
              text: '取消',
              role: 'cancel',
              handler: () => setTemplateToDelete(null)
            },
            {
              text: '删除',
              role: 'destructive',
              handler: handleDeleteTemplate
            }
          ]}
        />
      </IonContent>
    </>
  );
};

export default TemplateLibrary;