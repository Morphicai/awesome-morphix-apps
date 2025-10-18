import React, { useState, useRef, useEffect } from 'react';
import {
    IonPage,
    IonContent,
    IonButton,
    IonTextarea,
    IonIcon,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonList,
    IonItem,
    IonLabel,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonSpinner,
    IonFab,
    IonFabButton,
    IonAlert,
} from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useHistory } from 'react-router-dom';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { useMatrix } from '../store/matrixStore';
import {
    chevronBack,
    chevronForward,
    checkmarkCircle,
    eye,
    closeCircle,
    time,
    trash,
    add,
} from 'ionicons/icons';
import styles from '../styles/GuidedFormPage.module.css';

const COLLECTION_NAME = 'guided_form_records';

const GuidedFormPage = () => {
    const history = useHistory();
    const pageRef = useRef(null);
    const { currentGuidedRecordId, setCurrentGuidedRecordId, setCurrentFormData } = useMatrix();
    
    const [currentStep, setCurrentStep] = useState(0);
    const [showHistory, setShowHistory] = useState(false);
    const [historyRecords, setHistoryRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [hasAutoShownSummary, setHasAutoShownSummary] = useState(false);
    
    // 生成临时 recordId
    const generateTempRecordId = () => {
        return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    // 初始化空表单（数据从 AppSdk 加载）
    const [responses, setResponses] = useState({
        step1: '',
        step2: '',
        step3: '',
        step4: '',
        step5: '',
        step6: '',
        step7: '',
    });

    // 从 AppSdk 加载当前表单数据
    useEffect(() => {
        const loadCurrentForm = async () => {
            if (!currentGuidedRecordId) {
                // 如果没有当前记录 ID，生成一个新的临时 ID
                const newId = generateTempRecordId();
                setCurrentGuidedRecordId(newId);
                setDataLoaded(true);
                return;
            }

            // 如果是临时 ID，不需要从数据库加载
            if (currentGuidedRecordId.startsWith('temp_')) {
                setDataLoaded(true);
                setLoading(false);
                return;
            }

            // 从数据库加载表单数据
            try {
                const result = await AppSdk.appData.queryData({
                    collection: COLLECTION_NAME,
                    filter: {
                        id: currentGuidedRecordId,
                    },
                });

                if (result?.list?.[0]) {
                    const record = result.list[0];
                    setResponses({
                        step1: record.step1 || '',
                        step2: record.step2 || '',
                        step3: record.step3 || '',
                        step4: record.step4 || '',
                        step5: record.step5 || '',
                        step6: record.step6 || '',
                        step7: record.step7 || '',
                    });
                } else {
                    // 如果记录不存在，清除 ID 并生成新的
                    const newId = generateTempRecordId();
                    setCurrentGuidedRecordId(newId);
                }
            } catch (error) {
                await reportError(error, 'JavaScriptError', {
                    component: 'GuidedFormPage',
                    action: 'loadCurrentForm',
                });
                // 加载失败，生成新 ID
                const newId = generateTempRecordId();
                setCurrentGuidedRecordId(newId);
            } finally {
                setLoading(false);
                setDataLoaded(true);
            }
        };

        loadCurrentForm();
        loadHistoryRecords();
    }, []);

    const steps = [
        {
            title: '第1步：五感觉察',
            question: '你通过五感觉察到了什么？',
            placeholder: '例如：心跳加速、声音颤抖、手心出汗...',
            key: 'step1',
            area: 'outer',
            required: false,
        },
        {
            title: '第2步：发现钩子',
            question: '你觉察到钩子了吗?',
            placeholder: '例如："我会失败"、焦虑感、恐惧...',
            key: 'step2',
            area: 'away',
            required: true,
        },
        {
            title: '第3步：钩子的感受',
            question: '你的钩子让你有什么样的感受，你在身体哪里能感受到它?',
            placeholder: '例如：胸口发闷、喉咙紧缩、腹部不适...',
            key: 'step3',
            area: 'away',
            required: false,
        },
        {
            title: '第4步：觉察被钩住时的行为',
            question: '当你被钩子勾到时，能觉察到自己做什么吗?',
            placeholder: '例如：拖延、喝酒、刷社交媒体、逃避...',
            key: 'step4',
            area: 'away',
            required: true,
        },
        {
            title: '第5步：想成为的自己',
            question: '如果你是"想成为的自己"，你能觉察到你在做什么吗?',
            placeholder: '例如：坦诚对话、勇于挑战、善待他人...',
            key: 'step5',
            area: 'toward',
            required: true,
        },
        {
            title: '第6步：确认重要性',
            question: '这么做(做这个)，对谁或什么来说是重要的?',
            placeholder: '例如：我自己、家人、成长、关系、真诚...',
            key: 'step6',
            area: 'toward',
            required: false,
        },
        {
            title: '第7步：重要事物的感受',
            question:
                "'重要的人或者事儿'对你带来什么感受，你在身体哪里能感受到它?",
            placeholder: '例如：胸口温暖、身体轻盈、感受到能量...',
            key: 'step7',
            area: 'inner',
            required: false,
        },
    ];

    // 加载历史记录
    const loadHistoryRecords = async () => {
        setLoading(true);
        try {
            const records = await AppSdk.appData.queryData({
                collection: COLLECTION_NAME,
                query: [],
            });
            // 按创建时间倒序排列
            const sortedRecords = (records || []).sort(
                (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
            );
            setHistoryRecords(sortedRecords);
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'GuidedFormPage',
                action: 'loadHistoryRecords',
            });
            console.error('加载历史记录失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 保存表单记录到 AppSdk
    const saveRecord = async () => {
        if (!isComplete) return;

        setSaving(true);
        try {
            const recordData = {
                step1: responses.step1,
                step2: responses.step2,
                step3: responses.step3,
                step4: responses.step4,
                step5: responses.step5,
                step6: responses.step6,
                step7: responses.step7,
                createdAt: Date.now(),
                completedAt: Date.now(),
            };
            
            // 检查是否已经保存过（recordId 不是临时的）
            const isExistingRecord = currentGuidedRecordId && !currentGuidedRecordId.startsWith('temp_');
            
            if (isExistingRecord) {
                // 更新现有记录
                await AppSdk.appData.updateData({
                    collection: COLLECTION_NAME,
                    id: currentGuidedRecordId,
                    data: recordData,
                });
            } else {
                // 创建新记录
                const created = await AppSdk.appData.createData({
                    collection: COLLECTION_NAME,
                    data: recordData,
                });
                
                // 更新 recordId 为真实的数据库 ID，并保存到 localStorage
                setCurrentGuidedRecordId(created.id);
            }

            // 刷新历史记录
            await loadHistoryRecords();
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'GuidedFormPage',
                action: 'saveRecord',
            });
            alert('保存失败：' + error?.message);
        } finally {
            setSaving(false);
        }
    };

    // 删除记录
    const deleteRecord = async (recordId) => {
        try {
            await AppSdk.appData.deleteData({
                collection: COLLECTION_NAME,
                id: recordId,
            });

            // 检查删除的是否是当前表单（通过 recordId 判断）
            const isDeletingCurrent = currentGuidedRecordId === recordId;
            
            if (isDeletingCurrent) {
                // 清空当前表单并创建新的临时 ID
                const newId = generateTempRecordId();
                setCurrentGuidedRecordId(newId);
                setResponses({
                    step1: '',
                    step2: '',
                    step3: '',
                    step4: '',
                    step5: '',
                    step6: '',
                    step7: '',
                });
                setCurrentStep(0);
                setHasAutoShownSummary(false);
            }

            // 刷新历史记录（不关闭弹窗）
            await loadHistoryRecords();
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'GuidedFormPage',
                action: 'deleteRecord',
            });
            alert('删除失败：' + error?.message);
        }
    };

    // 查看历史记录
    const viewRecord = (record) => {
        // 更新当前 recordId（保存到 localStorage）
        setCurrentGuidedRecordId(record.id);
        // 加载表单数据
        setResponses({
            step1: record.step1 || '',
            step2: record.step2 || '',
            step3: record.step3 || '',
            step4: record.step4 || '',
            step5: record.step5 || '',
            step6: record.step6 || '',
            step7: record.step7 || '',
        });
        setCurrentStep(0);
        setShowHistory(false);
        setHasAutoShownSummary(false);
    };

    // 创建新记录
    const createNewRecord = () => {
        // 生成新的临时 ID（保存到 localStorage）
        const newId = generateTempRecordId();
        setCurrentGuidedRecordId(newId);
        // 清空表单
        setResponses({
            step1: '',
            step2: '',
            step3: '',
            step4: '',
            step5: '',
            step6: '',
            step7: '',
        });
        setCurrentStep(0);
        setShowHistory(false);
        setHasAutoShownSummary(false);
    };

    const handleInputChange = (key, value) => {
        setResponses({
            ...responses,
            [key]: value,
        });
    };

    const canGoNext = () => {
        return responses[steps[currentStep].key].trim().length > 0;
    };

    const goNext = async () => {
        if (currentStep < steps.length - 1 && canGoNext()) {
            setCurrentStep((prev) => prev + 1);
        } else if (currentStep === steps.length - 1 && isComplete && !hasAutoShownSummary) {
            // 最后一步完成后自动显示总结
            setHasAutoShownSummary(true);
            await handleShowSummary();
        }
    };

    const goPrev = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleShowSummary = async () => {
        // 将当前表单数据存入全局状态
        setCurrentFormData(responses);
        // 在显示总结前保存记录
        await saveRecord();
        // 跳转到总结页面
        history.push('/guided/summary');
    };

    const requestDeleteRecord = (record) => {
        setRecordToDelete(record);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteRecord = async () => {
        if (recordToDelete) {
            await deleteRecord(recordToDelete.id);
        }
        setRecordToDelete(null);
        setDeleteConfirmOpen(false);
    };

    const isLastStep = currentStep === steps.length - 1;
    const isComplete = Object.values(responses).every(
        (r) => r.trim().length > 0
    );

    // History view component
    const HistoryView = () => (
        <IonModal
            isOpen={showHistory}
            onDidDismiss={() => setShowHistory(false)}
        >
            <IonHeader>
                <IonToolbar>
                    <IonTitle>历史记录</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => setShowHistory(false)}>
                            <IonIcon icon={closeCircle} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div className={styles.historyContainer}>
                    {/* 新建按钮 */}
                    <div className={styles.historyHeader}>
                        <IonButton
                            expand="block"
                            onClick={createNewRecord}
                            className={styles.newRecordButton}
                        >
                            <IonIcon icon={add} slot="start" />
                            创建新练习
                        </IonButton>
                    </div>

                    {/* 加载状态 */}
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <IonSpinner name="crescent" />
                            <p>加载中...</p>
                        </div>
                    )}

                    {/* 历史记录列表 */}
                    {!loading && historyRecords.length > 0 && (
                        <IonList>
                            {historyRecords.map((record) => (
                                <IonItemSliding key={record.id}>
                                    <IonItem
                                        button
                                        onClick={() => viewRecord(record)}
                                        className={styles.historyItem}
                                    >
                                        <IonLabel>
                                            <h2 className={styles.historyTitle}>
                                                练习记录
                                                {currentGuidedRecordId === record.id && (
                                                    <span
                                                        className={
                                                            styles.currentBadge
                                                        }
                                                    >
                                                        当前
                                                    </span>
                                                )}
                                            </h2>
                                            <p className={styles.historyDate}>
                                                {formatDate(record.createdAt)}
                                            </p>
                                            <p className={styles.historyPreview}>
                                                {record.step2
                                                    ? truncate(record.step2, 50)
                                                    : '(未填写钩子)'}
                                            </p>
                                        </IonLabel>
                                    </IonItem>
                                    <IonItemOptions side="end">
                                        <IonItemOption
                                            color="danger"
                                            onClick={() =>
                                                requestDeleteRecord(record)
                                            }
                                        >
                                            <IonIcon icon={trash} slot="icon-only" />
                                        </IonItemOption>
                                    </IonItemOptions>
                                </IonItemSliding>
                            ))}
                        </IonList>
                    )}

                    {/* 空状态 */}
                    {!loading && historyRecords.length === 0 && (
                        <div className={styles.emptyState}>
                            <IonIcon
                                icon={time}
                                className={styles.emptyIcon}
                            />
                            <p>暂无历史记录</p>
                            <p className={styles.emptyHint}>
                                完成一次练习后，记录会自动保存
                            </p>
                        </div>
                    )}
                </div>
            </IonContent>
        </IonModal>
    );

    // 在数据加载完成前显示加载状态
    if (!dataLoaded) {
        return (
            <IonPage>
                <PageHeader
                    title="ACT矩阵引导练习"
                    showBackButton={false}
                />
                <IonContent>
                    <div className={styles.loadingContainer}>
                        <IonSpinner name="crescent" />
                        <p>加载中...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage ref={pageRef}>
            <PageHeader
                title="ACT矩阵引导练习"
                showBackButton={false}
            />
            <IonContent className={styles.content}>
                <div className={styles.container}>
                    {/* Header */}
                    <div className={styles.header}>
                        <h1 className={styles.mainTitle}>ACT矩阵</h1>
                        <p className={styles.subtitle}>语言行为引导练习表</p>
                    </div>

                    {/* Progress Bar */}
                    <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                            <span className={styles.progressLabel}>进度</span>
                            <span className={styles.progressCount}>
                                {currentStep + 1} / {steps.length}
                            </span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: `${
                                        ((currentStep + 1) / steps.length) * 100
                                    }%`,
                                }}
                            ></div>
                        </div>

                        {/* Step indicators */}
                        <div className={styles.stepIndicators}>
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className={`${styles.stepIndicator} ${
                                        index < currentStep
                                            ? styles.stepCompleted
                                            : index === currentStep
                                            ? styles.stepActive
                                            : styles.stepPending
                                    }`}
                                >
                                    {index < currentStep ? (
                                        <IonIcon icon={checkmarkCircle} />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className={styles.formSection}>
                        <div className={styles.questionSection}>
                            <h2 className={styles.stepTitle}>
                                {steps[currentStep].title}
                                {steps[currentStep].required && (
                                    <span className={styles.requiredBadge}>
                                        必填
                                    </span>
                                )}
                            </h2>
                            <p className={styles.question}>
                                {steps[currentStep].question}
                            </p>
                        </div>

                        <IonTextarea
                            value={responses[steps[currentStep].key]}
                            onIonInput={(e) =>
                                handleInputChange(
                                    steps[currentStep].key,
                                    e.detail.value || ''
                                )
                            }
                            placeholder={steps[currentStep].placeholder}
                            className={styles.textarea}
                            rows={8}
                            autoGrow={true}
                        />

                        {/* Navigation Buttons */}
                        <div className={styles.navigationButtons}>
                            <IonButton
                                onClick={goPrev}
                                disabled={currentStep === 0}
                                fill="outline"
                                className={styles.navButton}
                            >
                                <IonIcon icon={chevronBack} slot="start" />
                                上一步
                            </IonButton>

                            <IonButton
                                onClick={goNext}
                                disabled={!canGoNext()}
                                fill="solid"
                                className={styles.navButton}
                            >
                                下一步
                                <IonIcon icon={chevronForward} slot="end" />
                            </IonButton>
                        </div>
                    </div>

                    {/* Summary Button & Completion */}
                    {isComplete && (
                        <div className={styles.completionSection}>
                            <div className={styles.completionMessage}>
                                <IonIcon
                                    icon={checkmarkCircle}
                                    className={styles.completionIcon}
                                />
                                <span>已完成所有步骤！</span>
                            </div>
                            <IonButton
                                onClick={handleShowSummary}
                                expand="block"
                                className={styles.summaryButton}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <IonSpinner name="crescent" />
                                        <span style={{ marginLeft: '8px' }}>
                                            保存中...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <IonIcon icon={eye} slot="start" />
                                        查看矩阵总结
                                    </>
                                )}
                            </IonButton>
                        </div>
                    )}
                </div>

                {/* 浮动历史记录按钮 */}
                <IonFab 
                    vertical="bottom" 
                    horizontal="end" 
                    slot="fixed"
                    style={{ '--offset-bottom': '104px' }}
                >
                    <IonFabButton
                        onClick={() => {
                            loadHistoryRecords();
                            setShowHistory(true);
                        }}
                        className={styles.historyFab}
                    >
                        <IonIcon icon={time} />
                    </IonFabButton>
                </IonFab>
            </IonContent>

            {/* 历史记录弹窗 */}
            <HistoryView />

            {/* 删除确认对话框 */}
            <IonAlert
                isOpen={deleteConfirmOpen}
                onDidDismiss={() => {
                    setDeleteConfirmOpen(false);
                    setRecordToDelete(null);
                }}
                header="确认删除"
                message="确定要删除这条记录吗？此操作不可撤销。"
                buttons={[
                    {
                        text: '取消',
                        role: 'cancel',
                        handler: () => {
                            setDeleteConfirmOpen(false);
                            setRecordToDelete(null);
                        },
                    },
                    {
                        text: '删除',
                        role: 'destructive',
                        handler: confirmDeleteRecord,
                    },
                ]}
            />
        </IonPage>
    );
};

// 辅助函数
function formatDate(timestamp) {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    } catch (_) {
        return '';
    }
}

function truncate(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

export default GuidedFormPage;

