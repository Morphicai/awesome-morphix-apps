import React, { useEffect, useState } from 'react';
import {
    IonPage,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonSpinner,
} from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useHistory } from 'react-router-dom';
import { useMatrix } from '../store/matrixStore';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import styles from '../styles/GuidedFormPage.module.css';

const COLLECTION_NAME = 'guided_form_records';

const GuidedSummaryPage = () => {
    const history = useHistory();
    const { currentGuidedRecordId, currentFormData } = useMatrix();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);

    // 从全局状态或 AppSdk 加载表单数据
    useEffect(() => {
        const loadFormData = async () => {
            // 优先使用全局状态中的数据（从表单页面设置的）
            if (currentFormData) {
                setFormData(currentFormData);
                setLoading(false);
                return;
            }

            // 如果是临时 ID，无法从数据库加载
            if (!currentGuidedRecordId || currentGuidedRecordId.startsWith('temp_')) {
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
                    setFormData(result.list[0]);
                }
            } catch (error) {
                await reportError(error, 'JavaScriptError', {
                    component: 'GuidedSummaryPage',
                    action: 'loadFormData',
                });
            } finally {
                setLoading(false);
            }
        };

        loadFormData();
    }, [currentGuidedRecordId, currentFormData]);

    const responses = formData;

    if (loading) {
        return (
            <IonPage>
                <PageHeader
                    title="ACT矩阵总结"
                    showBackButton={true}
                    onBackClick={() => history.goBack()}
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

    if (!formData) {
        return (
            <IonPage>
                <PageHeader
                    title="ACT矩阵总结"
                    showBackButton={true}
                    onBackClick={() => history.goBack()}
                />
                <IonContent>
                    <div className={styles.emptyState}>
                        <p className={styles.emptyHint}>暂无数据</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <PageHeader
                title="ACT矩阵总结"
                showBackButton={true}
                onBackClick={() => history.goBack()}
            />
            <IonContent className={styles.summaryContent}>
                <div className={styles.summaryContainer}>
                    {/* Detailed responses by area */}
                    <div className={styles.responsesGrid}>
                        {/* Outer Experience */}
                        <IonCard className={styles.areaCard}>
                            <IonCardHeader>
                                <IonCardTitle className={styles.outerTitle}>
                                    <span className={styles.stepBadge}>1</span>
                                    五感、外在体验
                                </IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <div className={styles.responseItem}>
                                    <p className={styles.responseQuestion}>
                                        你通过五感觉察到了什么？
                                    </p>
                                    <p className={styles.responseAnswer}>
                                        {responses.step1 || '(未填写)'}
                                    </p>
                                </div>
                            </IonCardContent>
                        </IonCard>

                        {/* Away Moves */}
                        <IonCard className={styles.areaCard}>
                            <IonCardHeader>
                                <IonCardTitle className={styles.awayTitle}>
                                    <span className={styles.stepBadge}>2-4</span>
                                    回避行为
                                </IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <div className={styles.responseItem}>
                                    <p className={styles.responseQuestion}>
                                        你觉察到钩子了吗？
                                    </p>
                                    <p className={styles.responseAnswer}>
                                        {responses.step2 || '(未填写)'}
                                    </p>
                                </div>
                                <div className={styles.responseItem}>
                                    <p className={styles.responseQuestion}>
                                        你的钩子让你有什么样的感受，你在身体哪里能感受到它？
                                    </p>
                                    <p className={styles.responseAnswer}>
                                        {responses.step3 || '(未填写)'}
                                    </p>
                                </div>
                                <div className={styles.responseItem}>
                                    <p className={styles.responseQuestion}>
                                        当你被钩子勾到时，能觉察到自己做什么吗？
                                    </p>
                                    <p className={styles.responseAnswer}>
                                        {responses.step4 || '(未填写)'}
                                    </p>
                                </div>
                            </IonCardContent>
                        </IonCard>

                        {/* Toward Moves */}
                        <IonCard className={styles.areaCard}>
                            <IonCardHeader>
                                <IonCardTitle className={styles.towardTitle}>
                                    <span className={styles.stepBadge}>5-6</span>
                                    趋近行为
                                </IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <div className={styles.responseItem}>
                                    <p className={styles.responseQuestion}>
                                        如果你是"想成为的自己"，你能觉察到你在做什么吗？
                                    </p>
                                    <p className={styles.responseAnswer}>
                                        {responses.step5 || '(未填写)'}
                                    </p>
                                </div>
                                <div className={styles.responseItem}>
                                    <p className={styles.responseQuestion}>
                                        这么做（做这个），对谁或什么来说是重要的？
                                    </p>
                                    <p className={styles.responseAnswer}>
                                        {responses.step6 || '(未填写)'}
                                    </p>
                                </div>
                            </IonCardContent>
                        </IonCard>

                        {/* Inner Experience */}
                        <IonCard className={styles.areaCard}>
                            <IonCardHeader>
                                <IonCardTitle className={styles.innerTitle}>
                                    <span className={styles.stepBadge}>7</span>
                                    内在体验
                                </IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <div className={styles.responseItem}>
                                    <p className={styles.responseQuestion}>
                                        '重要的人或者事儿'对你带来什么感受，你在身体哪里能感受到它？
                                    </p>
                                    <p className={styles.responseAnswer}>
                                        {responses.step7 || '(未填写)'}
                                    </p>
                                </div>
                            </IonCardContent>
                        </IonCard>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default GuidedSummaryPage;

