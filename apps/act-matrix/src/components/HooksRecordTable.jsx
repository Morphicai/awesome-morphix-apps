import React, { useEffect, useState, useRef } from 'react';
import {
    IonPage,
    IonButton,
    IonIcon,
    IonContent,
    IonInput,
    IonSpinner,
    IonItem,
    IonLabel,
    IonAlert,
} from '@ionic/react';
import { add, trash, create } from 'ionicons/icons';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { PageHeader } from '@morphixai/components';
import { useHistory, useParams, useResume } from 'react-router-dom';
import styles from '../styles/HooksRecordTable.module.css';

const COLLECTION_NAME = 'act_matrix_hooks';

export default function HooksRecordTable() {
    const { matrixId } = useParams();
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [hookText, setHookText] = useState('');
    const [behaviorText, setBehaviorText] = useState('');
    const [hooks, setHooks] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const hookInputRef = useRef(null);
    const behaviorInputRef = useRef(null);

    // 加载钩子记录
    const loadHooks = async () => {
        if (!matrixId) return;
        setLoading(true);
        try {
            // 使用 matrixId 作为记录 ID
            const result = await AppSdk.appData.getData({
                collection: COLLECTION_NAME,
                id: matrixId,
            });
            
            if (result && Array.isArray(result.hooks)) {
                setHooks(result.hooks);
            } else {
                setHooks([]);
            }
        } catch (error) {
            // 记录不存在时返回空数组
            setHooks([]);
            await reportError(error, 'JavaScriptError', {
                component: 'HooksRecordTable',
                action: 'loadHooks',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHooks();
    }, [matrixId]);

    // 页面重新进入前台时刷新数据
    useResume(() => {
        loadHooks();
    });

    const goBack = () => {
        history.goBack();
    };

    // 保存钩子数组到数据库
    const saveHooks = async (newHooks) => {
        if (!matrixId) return;
        try {
            // 尝试获取现有记录
            const existing = await AppSdk.appData.getData({
                collection: COLLECTION_NAME,
                id: matrixId,
            });

            if (existing) {
                // 更新现有记录
                await AppSdk.appData.updateData({
                    collection: COLLECTION_NAME,
                    id: matrixId,
                    data: {
                        hooks: newHooks,
                        updatedAt: Date.now(),
                    },
                });
            } else {
                // 创建新记录
                await AppSdk.appData.createData({
                    collection: COLLECTION_NAME,
                    data: {
                        id: matrixId,
                        matrixId: matrixId,
                        hooks: newHooks,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    },
                });
            }
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HooksRecordTable',
                action: 'saveHooks',
            });
            throw error;
        }
    };

    // 添加或更新钩子
    const handleAddOrUpdate = async () => {
        const hook = (hookInputRef.current?.value || hookText).trim();
        const behavior = (behaviorInputRef.current?.value || behaviorText).trim();

        if (!hook || !behavior) {
            alert('请填写钩子和行为');
            return;
        }

        try {
            let newHooks;
            if (editingIndex !== null) {
                // 更新模式
                newHooks = [...hooks];
                newHooks[editingIndex] = {
                    hook,
                    behavior,
                    createdAt: hooks[editingIndex].createdAt,
                };
            } else {
                // 添加模式
                newHooks = [
                    ...hooks,
                    {
                        hook,
                        behavior,
                        createdAt: Date.now(),
                    },
                ];
            }

            await saveHooks(newHooks);
            setHooks(newHooks);
            
            // 清空输入框
            setHookText('');
            setBehaviorText('');
            setEditingIndex(null);
            if (hookInputRef.current) hookInputRef.current.value = '';
            if (behaviorInputRef.current) behaviorInputRef.current.value = '';
        } catch (error) {
            alert('保存失败：' + error?.message);
        }
    };

    // 开始编辑
    const handleEdit = (index) => {
        setEditingIndex(index);
        setHookText(hooks[index].hook);
        setBehaviorText(hooks[index].behavior);
    };

    // 取消编辑
    const handleCancelEdit = () => {
        setEditingIndex(null);
        setHookText('');
        setBehaviorText('');
        if (hookInputRef.current) hookInputRef.current.value = '';
        if (behaviorInputRef.current) behaviorInputRef.current.value = '';
    };

    // 删除钩子
    const handleDelete = async (index) => {
        try {
            const newHooks = hooks.filter((_, i) => i !== index);
            await saveHooks(newHooks);
            setHooks(newHooks);
        } catch (error) {
            alert('删除失败：' + error?.message);
            await reportError(error, 'JavaScriptError', {
                component: 'HooksRecordTable',
                action: 'handleDelete',
            });
        }
    };

    // 请求删除确认
    const requestDelete = (index) => {
        setDeleteIndex(index);
        setDeleteConfirmOpen(true);
    };

    // 确认删除
    const confirmDelete = () => {
        if (deleteIndex !== null) {
            handleDelete(deleteIndex);
        }
        setDeleteIndex(null);
        setDeleteConfirmOpen(false);
    };

    return (
        <IonPage>
            <PageHeader title="🪝 钩子记录表" />
            <IonContent className={styles.content}>
                {loading && (
                    <div className={styles.loadingContainer}>
                        <IonSpinner name="crescent" />
                    </div>
                )}

                {!loading && (
                    <div className={styles.container}>
                        {/* 输入表单卡片 */}
                        <div className={styles.formCard}>
                            <div className={styles.formHeader}>
                                <div className={styles.formTitle}>
                                    {editingIndex !== null ? '编辑记录' : '新增记录'}
                                </div>
                            </div>
                            
                            <div className={styles.formContent}>
                                {/* 一行左右布局 */}
                                <div className={styles.singleRow}>
                                    <div className={styles.fieldGroup}>
                                        <div className={styles.fieldLabel}>
                                            钩子（想法·情绪·情境）
                                        </div>
                                        <IonItem className={styles.fieldInput}>
                                            <IonInput
                                                ref={hookInputRef}
                                                value={hookText}
                                                placeholder="例如:我生气了 / 我焦虑了"
                                                onIonInput={(e) => setHookText(e.detail.value || '')}
                                            />
                                        </IonItem>
                                    </div>

                                    <div className={styles.fieldGroup}>
                                        <div className={styles.fieldLabel}>
                                            当时的行为
                                        </div>
                                        <IonItem className={styles.fieldInput}>
                                            <IonInput
                                                ref={behaviorInputRef}
                                                value={behaviorText}
                                                placeholder="例如:喝酒 / 刷视频了"
                                                onIonInput={(e) => setBehaviorText(e.detail.value || '')}
                                            />
                                        </IonItem>
                                    </div>
                                </div>

                                {/* 按钮区域 */}
                                <div className={styles.buttonRow}>
                                    {editingIndex !== null ? (
                                        <>
                                            <IonButton
                                                onClick={handleAddOrUpdate}
                                                disabled={!hookText.trim() || !behaviorText.trim()}
                                                color="primary"
                                                fill="solid"
                                                className={styles.saveButton}
                                            >
                                                保存修改
                                            </IonButton>
                                            <IonButton
                                                onClick={handleCancelEdit}
                                                fill="outline"
                                                color="medium"
                                            >
                                                取消
                                            </IonButton>
                                        </>
                                    ) : (
                                        <IonButton
                                            onClick={handleAddOrUpdate}
                                            disabled={!hookText.trim() || !behaviorText.trim()}
                                            expand="block"
                                            color="warning"
                                            fill="solid"
                                            className={styles.addButton}
                                        >
                                            <IonIcon icon={add} slot="start" />
                                            添加一行
                                        </IonButton>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 预览区域 */}
                        <div className={styles.previewSection}>
                            <div className={styles.previewHeader}>
                                <div className={styles.previewTitle}>🔍 预览</div>
                            </div>

                            {hooks.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>📝</div>
                                    <div className={styles.emptyText}>暂无记录</div>
                                    <div className={styles.emptyHint}>
                                        添加钩子和行为记录，帮助识别情绪触发器
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.hooksList}>
                                    {/* 数据行 - 简化为一行显示 */}
                                    {hooks.map((item, index) => (
                                        <div key={index} className={styles.previewRow}>
                                            <div className={styles.previewContent}>
                                                <div className={styles.hookDisplay}>
                                                    <span className={styles.hookIcon}>🪝</span>
                                                    <span className={styles.hookText}>{item.hook}</span>
                                                </div>
                                                <div className={styles.behaviorDisplay}>
                                                    <span className={styles.behaviorIcon}>💭</span>
                                                    <span className={styles.behaviorText}>{item.behavior}</span>
                                                </div>
                                            </div>
                                            <div className={styles.previewActions}>
                                                <IonButton
                                                    fill="clear"
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleEdit(index)}
                                                >
                                                    <IonIcon icon={create} />
                                                </IonButton>
                                                <IonButton
                                                    fill="clear"
                                                    size="small"
                                                    color="danger"
                                                    onClick={() => requestDelete(index)}
                                                >
                                                    <IonIcon icon={trash} />
                                                </IonButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 删除确认弹窗 */}
                <IonAlert
                    isOpen={deleteConfirmOpen}
                    onDidDismiss={() => {
                        setDeleteConfirmOpen(false);
                        setDeleteIndex(null);
                    }}
                    header="确认删除"
                    message="确定要删除这条钩子记录吗？此操作不可撤销。"
                    buttons={[
                        {
                            text: '取消',
                            role: 'cancel',
                            handler: () => {
                                setDeleteConfirmOpen(false);
                                setDeleteIndex(null);
                            },
                        },
                        {
                            text: '删除',
                            role: 'destructive',
                            handler: confirmDelete,
                        },
                    ]}
                />
            </IonContent>
        </IonPage>
    );
}
