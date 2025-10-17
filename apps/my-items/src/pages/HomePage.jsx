import React, { useState, useMemo } from 'react';
import { IonPage, IonContent, useIonViewWillEnter, IonRefresher, IonRefresherContent, IonSpinner, IonButton } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { reportError } from '@morphixai/lib';

import useItemStore from '../store/useItemStore';
import StatsCard from '../components/StatsCard';
import HeaderTabs from '../components/HeaderTabs';
import ItemList from '../components/ItemList';
import EmptyState from '../components/EmptyState';
import FloatingButton from '../components/FloatingButton';

const HomePage = () => {
  const { items, loadItems, initialLoading } = useItemStore();
  const [selectedTab, setSelectedTab] = useState('全部');
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useIonViewWillEnter(() => {
    if (initialLoading && !dataLoaded) {
      loadData();
    }
  });

  const loadData = async () => {
    try {
      setLoadError(null);
      await loadItems();
      setDataLoaded(true);
    } catch (error) {
      console.error('Failed to load data:', error);
      const errorContext = {
        operation: 'loadItems',
        online: navigator.onLine,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      await reportError(error, 'JavaScriptError', errorContext);
      setLoadError(error);
      setDataLoaded(true);
    }
  };

  const handleRefresh = async (event) => {
    setRefreshing(true);
    try {
      setLoadError(null);
      await loadItems();
    } catch (error) {
      setLoadError(error);
    }
    setRefreshing(false);
    event.detail.complete();
  };

  const handleRetry = () => {
    setDataLoaded(false);
    loadData();
  };

  const filteredItems = useMemo(() => {
    if (selectedTab === '全部') return items;
    return items.filter(item => item.status === selectedTab);
  }, [items, selectedTab]);

  const stats = useMemo(() => {
    const result = items.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      acc.totalValue += price;
      
      if (item.purchaseDate) {
        const purchaseDate = new Date(item.purchaseDate);
        const currentDate = new Date();
        const daysDiff = Math.max(1, Math.ceil((currentDate - purchaseDate) / (1000 * 60 * 60 * 24)));
        acc.dailyAverage += price / daysDiff;
      } else {
        acc.dailyAverage += price / 365;
      }
      
      return acc;
    }, { totalValue: 0, dailyAverage: 0 });
    
    return { ...result, itemCount: items.length };
  }, [items]);

  return (
    <IonPage>
      <PageHeader title="全部物品" />
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon="chevron-down-circle-outline"
            pullingText="下拉刷新"
            refreshingSpinner="circles"
            refreshingText="刷新中..."
          />
        </IonRefresher>
        
        {initialLoading && !dataLoaded ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '300px',
            flexDirection: 'column',
            gap: '16px',
            color: '#666',
            padding: '20px'
          }}>
            <IonSpinner name="circles" />
            <div>正在加载数据...</div>
          </div>
        ) : loadError ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '300px',
            flexDirection: 'column',
            gap: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px' }}>⚠️</div>
            <div style={{ color: '#666', fontSize: '16px' }}>加载失败</div>
            <div style={{ color: '#999', fontSize: '14px' }}>
              {!navigator.onLine ? '网络连接已断开，请检查网络设置' : '数据加载出错，请重试'}
            </div>
            <IonButton onClick={handleRetry} color="primary">
              重试
            </IonButton>
          </div>
        ) : (
          <>
            <StatsCard 
              totalValue={stats.totalValue} 
              dailyAverage={stats.dailyAverage} 
              itemCount={stats.itemCount} 
            />
            <HeaderTabs selectedTab={selectedTab} onTabChange={setSelectedTab} />
            
            {filteredItems.length === 0 ? (
              <EmptyState />
            ) : (
              <ItemList items={filteredItems} />
            )}
          </>
        )}
        
        <FloatingButton>新增</FloatingButton>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;