import React, { useState, useEffect } from 'react';
import { IonApp, IonTabs, IonTab, IonTabBar, IonTabButton, IonIcon, IonContent, IonRouterOutlet } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { addCircle, list, statsChart } from 'ionicons/icons';
import AddRecordTab from './components/AddRecordTab';
import RecordsTab from './components/RecordsTab';
import StatsTab from './components/StatsTab';
import { useAppStore } from './store/useAppStore';
import { t } from './utils/i18n';
import './styles/global.css';

export default function App() {
  const triggerRefresh = useAppStore((state) => state.triggerRefresh);

  const handleTabChange = (e) => {
    triggerRefresh();
  };

  return (
    <IonApp>
      <IonReactHashRouter>
        <IonTabs onIonTabsDidChange={handleTabChange}>
          <IonTab tab="add">
            <AddRecordTab />
          </IonTab>
          <IonTab tab="records">
            <RecordsTab />
          </IonTab>
          <IonTab tab="stats">
            <StatsTab />
          </IonTab>

          <IonTabBar slot="bottom">
            <IonTabButton tab="add">
              <IonIcon icon={addCircle} />
              {t('tabs.add')}
            </IonTabButton>
            <IonTabButton tab="records">
              <IonIcon icon={list} />
              {t('tabs.records')}
            </IonTabButton>
            <IonTabButton tab="stats">
              <IonIcon icon={statsChart} />
              {t('tabs.stats')}
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactHashRouter>
    </IonApp>
  );
}
