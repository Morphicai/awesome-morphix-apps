import React from 'react';
import { 
    IonTabs, 
    IonTab, 
    IonTabBar, 
    IonTabButton, 
    IonIcon, 
    IonPage, 
    IonContent 
} from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { add, checkmarkCircle } from 'ionicons/icons';
import CouponCreator from './components/CouponCreator';
import CouponValidator from './components/CouponValidator';
import ErrorBoundary from './components/ErrorBoundary';
import ToastManager from './components/ToastManager';
import useErrorHandler from './hooks/useErrorHandler';
import styles from './styles/App.module.css';

/**
 * 主应用组件
 * 
 * 优惠券管理系统，包含创建优惠券和验券管理两个功能模块
 * 使用 IonTabs 布局实现无刷新切换
 * 集成全局错误处理和用户反馈系统
 */
export default function App() {
    const { toasts, removeToast, addError } = useErrorHandler();

    /**
     * 处理全局错误
     */
    const handleGlobalError = (error, errorInfo) => {
        console.error('全局错误:', error, errorInfo);
        addError('应用发生意外错误，请刷新页面重试', 'critical');
    };

    return (
        <ErrorBoundary onError={handleGlobalError}>
            <IonTabs>
                {/* 创建优惠券 Tab */}
                <IonTab tab="create">
                    <IonPage>
                        <PageHeader title="创建优惠券" />
                        <IonContent className={styles.content}>
                            <CouponCreator />
                        </IonContent>
                    </IonPage>
                </IonTab>

                {/* 验券管理 Tab */}
                <IonTab tab="validate">
                    <IonPage>
                        <PageHeader title="验券管理" />
                        <IonContent className={styles.content}>
                            <CouponValidator />
                        </IonContent>
                    </IonPage>
                </IonTab>

                {/* Tab 导航栏 */}
                <IonTabBar slot="bottom">
                    <IonTabButton tab="create">
                        <IonIcon icon={add} />
                        创建优惠券
                    </IonTabButton>
                    <IonTabButton tab="validate">
                        <IonIcon icon={checkmarkCircle} />
                        验券管理
                    </IonTabButton>
                </IonTabBar>
            </IonTabs>

            {/* 全局 Toast 管理 */}
            <ToastManager 
                toasts={toasts} 
                onRemoveToast={removeToast} 
            />
        </ErrorBoundary>
    );
}