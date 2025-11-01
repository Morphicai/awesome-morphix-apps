import { useState, useEffect } from 'react';
import { 
    IonTabs,
    IonTab,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonPage, 
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle
} from '@ionic/react';
import { addCircleOutline, listOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { PageHeader } from '@morphixai/components';
import CouponCreator from './components/CouponCreator';
import CouponValidator from './components/CouponValidator';
import CouponList from './components/CouponList';
import CouponDetailModal from './components/CouponDetailModal';
import CouponResultModal from './components/CouponResultModal';
import ValidationResultModal from './components/ValidationResultModal';
import ErrorBoundary from './components/ErrorBoundary';
import ToastManager from './components/ToastManager';
import useCouponManager from './hooks/useCouponManager';
import useImageGenerator from './hooks/useImageGenerator';
import useErrorHandler from './hooks/useErrorHandler';
import styles from './styles/App.module.css';

/**
 * 主应用组件
 * 
 * 优惠券管理系统，包含创建优惠券、验券管理和优惠券列表三个功能模块
 * 使用底部 Tab 布局实现无刷新切换
 */
export default function App() {
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    
    const { 
        coupons,
        getAllCoupons,
        useCoupon,
        isLoading: isCouponLoading
    } = useCouponManager();
    
    const {
        generateAndSave,
        isGenerating: isImageGenerating
    } = useImageGenerator();
    
    const { 
        toasts, 
        removeToast, 
        addError,
        showToast,
        handleImageError,
        handleStorageError,
        withLoading
    } = useErrorHandler();

    // 加载优惠券列表
    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        await getAllCoupons();
    };

    /**
     * 处理全局错误
     */
    const handleGlobalError = (error, errorInfo) => {
        console.error('全局错误:', error, errorInfo);
        addError('应用发生意外错误，请刷新页面重试', 'critical');
    };

    /**
     * 处理优惠券创建成功
     */
    const handleCouponCreated = (coupon) => {
        setSelectedCoupon(coupon);
        setShowResultModal(true);
        loadCoupons(); // 刷新列表
    };

    /**
     * 处理验证成功
     */
    const handleValidationSuccess = (result) => {
        setValidationResult(result);
        setShowValidationModal(true);
    };

    /**
     * 处理优惠券点击
     */
    const handleCouponClick = (coupon) => {
        setSelectedCoupon(coupon);
        setShowDetailModal(true);
    };

    /**
     * 处理删除优惠券
     */
    const handleDeleteCoupon = async (code) => {
        const result = await withLoading(async () => {
            const storageService = new (await import('./services/StorageService')).default();
            const success = await storageService.deleteCoupon(code);
            
            if (!success) {
                throw new Error('删除优惠券失败');
            }
            
            return success;
        }, '删除优惠券失败，请重试');

        if (result.success) {
            showToast('优惠券已删除', 'success');
            setShowDetailModal(false);
            setSelectedCoupon(null);
            loadCoupons(); // 刷新列表
        } else {
            handleStorageError(result.error);
        }
    };

    /**
     * 处理保存图片
     */
    const handleSaveImage = async (coupon) => {
        const result = await withLoading(async () => {
            const saveResult = await generateAndSave(coupon);
            
            if (!saveResult.success) {
                throw new Error(saveResult.error || '保存图片失败');
            }
            
            return saveResult;
        }, '保存图片失败，请重试');

        if (result.success) {
            showToast('优惠券图片已保存到相册', 'success');
        } else {
            handleImageError(result.error);
        }
    };

    /**
     * 处理验券
     */
    const handleUseCoupon = async (code) => {
        const result = await withLoading(async () => {
            const success = await useCoupon(code);
            
            if (!success) {
                throw new Error('验券失败');
            }
            
            return success;
        }, '验券失败，请重试');

        if (result.success) {
            showToast('验券成功！优惠券已使用', 'success');
            setShowValidationModal(false);
            setValidationResult(null);
            loadCoupons(); // 刷新列表
        } else {
            handleStorageError(result.error);
        }
    };

    return (
        <ErrorBoundary onError={handleGlobalError}>
            <IonTabs>
                {/* 创建优惠券 Tab */}
                <IonTab tab="create">
                    <IonPage>
                        <PageHeader title="创建优惠券" />
                        <IonContent className={styles.content}>
                            <CouponCreator onCouponCreated={handleCouponCreated} />
                        </IonContent>
                    </IonPage>
                </IonTab>

                {/* 优惠券列表 Tab */}
                <IonTab tab="list">
                    <IonPage>
                        <PageHeader title="优惠券列表" />
                        <IonContent className={styles.content}>
                            <CouponList 
                                coupons={coupons} 
                                onCouponClick={handleCouponClick}
                            />
                        </IonContent>
                    </IonPage>
                </IonTab>

                {/* 验券管理 Tab */}
                <IonTab tab="validate">
                    <IonPage>
                        <PageHeader title="验券管理" />
                        <IonContent className={styles.content}>
                            <CouponValidator onValidationSuccess={handleValidationSuccess} />
                        </IonContent>
                    </IonPage>
                </IonTab>

                {/* 底部 Tab 导航栏 */}
                <IonTabBar slot="bottom" className={styles.tabBar}>
                    <IonTabButton tab="create" className={styles.tabButton}>
                        <IonIcon icon={addCircleOutline} />
                        <IonLabel>创建优惠券</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="list" className={styles.tabButton}>
                        <IonIcon icon={listOutline} />
                        <IonLabel>优惠券列表</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="validate" className={styles.tabButton}>
                        <IonIcon icon={checkmarkCircleOutline} />
                        <IonLabel>验券管理</IonLabel>
                    </IonTabButton>
                </IonTabBar>
            </IonTabs>

            {/* 优惠券详情 Modal */}
            <CouponDetailModal
                isOpen={showDetailModal}
                coupon={selectedCoupon}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedCoupon(null);
                }}
                onDelete={handleDeleteCoupon}
                onSaveImage={handleSaveImage}
                isDeleting={isCouponLoading}
                isSavingImage={isImageGenerating}
            />

            {/* 创建结果 Modal */}
            <CouponResultModal
                isOpen={showResultModal}
                coupon={selectedCoupon}
                onClose={() => {
                    setShowResultModal(false);
                    setSelectedCoupon(null);
                }}
                onSaveImage={handleSaveImage}
                isSavingImage={isImageGenerating}
            />

            {/* 验证结果 Modal */}
            <ValidationResultModal
                isOpen={showValidationModal}
                result={validationResult}
                onClose={() => {
                    setShowValidationModal(false);
                    setValidationResult(null);
                }}
                onUseCoupon={handleUseCoupon}
                isUsing={isCouponLoading}
            />

            {/* 全局 Toast 管理 */}
            <ToastManager 
                toasts={toasts} 
                onRemoveToast={removeToast} 
            />
        </ErrorBoundary>
    );
}