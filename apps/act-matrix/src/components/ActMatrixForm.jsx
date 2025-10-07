import React, { useEffect, useState, useRef } from 'react';
import {
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
    IonSpinner,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonIcon,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonPage,
    IonFab,
    IonFabButton,
    useIonViewDidEnter,
    IonAlert,
} from '@ionic/react';
import { useHistory, useResume } from 'react-router-dom';
import { PageHeader } from '@morphixai/components';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import {
    close,
    add,
    trash,
    create,
    arrowForward,
    arrowBack,
    time,
    grid,
    eye,
} from 'ionicons/icons';
import styles from '../styles/ActMatrixForm.module.css';
import HistoryPage from './HistoryPage.jsx';
import { useMatrix } from '../store/matrixStore';
import { STORAGE_KEY } from '../store/matrixStore';
const COLLECTION_NAME = 'act_matrix_quadrants';

// 象限类型定义
const QUADRANT_TYPES = {
    INNER_EXPERIENCE: 'inner_experience', // 左下：内在体验
    AWAY_MOVES: 'away_moves', // 左上：远离行为
    VALUES: 'values', // 右下：价值/对你重要的事(人)
    TOWARD_MOVES: 'toward_moves', // 右上：价值行动
};

const QUADRANT_CONFIG = {
    [QUADRANT_TYPES.INNER_EXPERIENCE]: {
        title: '负面内在体验',
        subtitle: '朝向重要的事(人)的时候，阻碍你的负面内心感受是什么?',
        question: '朝向重要的事(人)的时候，阻碍你的负面内心感受是什么?',
        placeholder: '例如:恐惧、焦虑、"我不够好"的想法',
        position: 'left-bottom',
        color: '#ef4444',
    },
    [QUADRANT_TYPES.AWAY_MOVES]: {
        title: '远离行为',
        subtitle: '为了解决你的负面内心体验，你会做什么?',
        question: '为了解决你的负面内心体验，你会做什么?',
        placeholder: '例如:逃避、拖延、刷手机、找借口',
        position: 'left-top',
        color: '#f97316',
    },
    [QUADRANT_TYPES.VALUES]: {
        title: '对你重要的事(人)',
        subtitle: '对你重要的事(人)是什么?',
        question: '谁和什么对你是重要的？',
        placeholder: '例如:家人、成长、诚实、创造价值',
        position: 'right-bottom',
        color: '#10b981',
    },
    [QUADRANT_TYPES.TOWARD_MOVES]: {
        title: '趋向行为',
        subtitle: '朝向对你重要的事的时候，你会做什么?',
        question: '朝向对你重要的事的时候，你会做什么?',
        placeholder: '例如:主动沟通、练习技能、关心他人',
        position: 'right-top',
        color: '#7A6C5D',
    },
};

export default function ActMatrixForm() {
    const pageRef = useRef(null);
    const inputRef = useRef(null);
    const { currentMatrixId, setCurrentMatrix, createNewMatrix } = useMatrix();
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [quadrants, setQuadrants] = useState({
        [QUADRANT_TYPES.INNER_EXPERIENCE]: [],
        [QUADRANT_TYPES.AWAY_MOVES]: [],
        [QUADRANT_TYPES.VALUES]: [],
        [QUADRANT_TYPES.TOWARD_MOVES]: [],
    });

    // 模态框状态
    const [modalOpen, setModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [activeQuadrant, setActiveQuadrant] = useState(null);
    const [newItemText, setNewItemText] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    // 根据是否存在 order 字段决定排序方式
    const sortItems = (items) => {
        const hasAnyOrder =
            Array.isArray(items) &&
            items.some((i) => typeof i.order === 'number');
        if (hasAnyOrder) {
            return items.slice().sort((a, b) => {
                const ao =
                    typeof a.order === 'number'
                        ? a.order
                        : Number.POSITIVE_INFINITY;
                const bo =
                    typeof b.order === 'number'
                        ? b.order
                        : Number.POSITIVE_INFINITY;
                return ao - bo; // 数值越小排越前
            });
        }
        // 无 order 时按创建时间正序：先添加的在前，后添加的在后
        return items
            .slice()
            .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    };

    useEffect(() => {
        console.log(
            '[ActMatrixForm] currentMatrixId changed:',
            currentMatrixId
        );
        // 当有选中的矩阵时加载；否则清空

        if (currentMatrixId) {
            loadQuadrantData();
        } else {
            setQuadrants({
                [QUADRANT_TYPES.INNER_EXPERIENCE]: [],
                [QUADRANT_TYPES.AWAY_MOVES]: [],
                [QUADRANT_TYPES.VALUES]: [],
                [QUADRANT_TYPES.TOWARD_MOVES]: [],
            });
        }
    }, [currentMatrixId]);

    // 页面进入时，如已选择矩阵则主动刷新一次
    // useIonViewDidEnter(() => {
    //     console.log(
    //         '[ActMatrixForm] view did enter, currentMatrixId:',
    //         currentMatrixId
    //     );
    //     if (currentMatrixId) {
    //         loadQuadrantData();
    //     }
    // });

    // 避免在组件尚未完成挂载前触发 setState 的告警
    const isMountedRef = useRef(false);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // 页面重新进入前台时刷新数据
    useResume(() => {
        // 将执行延迟到下一事件循环，确保组件已完成挂载
        setTimeout(() => {
            if (isMountedRef.current && currentMatrixId) {
                loadQuadrantData();
            }
        }, 0);
    });

    const loadQuadrantData = async () => {
        if (!currentMatrixId) return;

        console.log(
            '[ActMatrixForm] loadQuadrantData start, matrixId:',
            currentMatrixId
        );
        setLoading(true);
        // 仅按当前矩阵ID查询，避免全量扫描
        try {
            const result = await AppSdk.appData.queryData({
                collection: COLLECTION_NAME,
                query: [
                    { key: 'matrixId', operator: 'eq', value: currentMatrixId },
                ],
            });
            console.log('[ActMatrixForm] query result count:', result);

            const newQuadrants = {
                [QUADRANT_TYPES.INNER_EXPERIENCE]: [],
                [QUADRANT_TYPES.AWAY_MOVES]: [],
                [QUADRANT_TYPES.VALUES]: [],
                [QUADRANT_TYPES.TOWARD_MOVES]: [],
            };

            if (Array.isArray(result)) {
                result.forEach((item) => {
                    if (item.quadrantType && newQuadrants[item.quadrantType]) {
                        newQuadrants[item.quadrantType].push(item);
                    }
                });

                // 对每个象限排序：若有 order 则按 order，否则按创建时间倒序
                Object.keys(newQuadrants).forEach((key) => {
                    newQuadrants[key] = sortItems(newQuadrants[key]);
                });
            }

            setQuadrants(newQuadrants);
            console.log('[ActMatrixForm] quadrants updated');
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'ActMatrixForm',
                action: 'loadQuadrantData',
            });
            console.error('[ActMatrixForm] loadQuadrantData error:', error);
        } finally {
            setLoading(false);
            console.log('[ActMatrixForm] loadQuadrantData end');
        }
    };

    const handleQuadrantClick = (quadrantType) => {
        setActiveQuadrant(quadrantType);
        setModalOpen(true);
        setNewItemText('');
        setEditingItem(null);
    };

    // 更好的方法：直接从输入框获取最新值
    const handleAddItemWithLatestValue = async () => {
        // 直接从输入元素获取当前值，确保是最新的
        const currentValue = inputRef.current?.value || newItemText;
        if (!currentMatrixId) {
            alert('请先创建矩阵');
        }
        if (!activeQuadrant) {
            alert('请先选择象限');
        }
        if (!currentValue.trim()) {
            alert('请先输入内容');
        }
        if (!currentValue.trim() || !activeQuadrant || !currentMatrixId) return;

        try {
            // 计算新条目的顺序：若已有 order，则插入到末尾（最大值 + 1）
            const currentItems = quadrants[activeQuadrant] || [];
            const itemsWithOrder = currentItems.filter(
                (i) => typeof i.order === 'number'
            );
            const hasAnyOrder = itemsWithOrder.length > 0;
            let nextOrder;
            if (hasAnyOrder) {
                const maxOrder = Math.max(
                    ...itemsWithOrder.map((i) => i.order)
                );
                nextOrder = (isFinite(maxOrder) ? maxOrder : -1) + 1;
            }

            const data = {
                matrixId: currentMatrixId,
                quadrantType: activeQuadrant,
                content: currentValue.trim(),
                createdAt: Date.now(),
                ...(typeof nextOrder === 'number' ? { order: nextOrder } : {}),
            };

            const created = await AppSdk.appData.createData({
                collection: COLLECTION_NAME,
                data,
            });

            setQuadrants((prev) => ({
                ...prev,
                [activeQuadrant]: sortItems([
                    created,
                    ...(prev[activeQuadrant] || []),
                ]),
            }));

            setNewItemText('');
            // 同时清空输入框
            if (inputRef.current) {
                inputRef.current.value = '';
            }
            // currentId 已在 store 内持久化，无需额外标记
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'ActMatrixForm',
                action: 'handleAddItemWithLatestValue',
            });
            alert('添加失败' + error?.message);
        }
    };

    // 拖拽排序并持久化顺序
    const persistOrder = async (quadrantType, items) => {
        try {
            await Promise.all(
                items.map((it, idx) =>
                    AppSdk.appData.updateData({
                        collection: COLLECTION_NAME,
                        id: it.id,
                        data: { order: idx },
                    })
                )
            );
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'ActMatrixForm',
                action: 'persistOrder',
            });
            console.error('[ActMatrixForm] persistOrder error:', error);
        }
    };

    const handleDragStart = (e, index) => {
        try {
            e.dataTransfer.setData('text/plain', String(index));
            e.dataTransfer.effectAllowed = 'move';
        } catch (_) {}
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        try {
            e.dataTransfer.dropEffect = 'move';
        } catch (_) {}
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (
            !Number.isFinite(sourceIndex) ||
            sourceIndex === targetIndex ||
            !activeQuadrant
        )
            return;
        setQuadrants((prev) => {
            const list = [...(prev[activeQuadrant] || [])];
            const [moved] = list.splice(sourceIndex, 1);
            list.splice(targetIndex, 0, moved);
            const updated = { ...prev, [activeQuadrant]: list };
            // 异步持久化顺序
            persistOrder(activeQuadrant, list);
            // currentId 已在 store 内持久化
            return updated;
        });
    };

    const handleEditItem = async (item) => {
        if (!newItemText.trim()) return;

        try {
            const updated = await AppSdk.appData.updateData({
                collection: COLLECTION_NAME,
                id: item.id,
                data: { content: newItemText.trim() },
            });

            setQuadrants((prev) => ({
                ...prev,
                [activeQuadrant]: prev[activeQuadrant].map((i) =>
                    i.id === item.id ? updated : i
                ),
            }));

            setNewItemText('');
            setEditingItem(null);
            // currentId 已在 store 内持久化
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'ActMatrixForm',
                action: 'handleEditItem',
            });
        }
    };

    const handleDeleteItem = async (item) => {
        try {
            await AppSdk.appData.deleteData({
                collection: COLLECTION_NAME,
                id: item.id,
            });

            // 防御式更新：跨所有象限移除该条目，避免依赖 activeQuadrant 状态
            setQuadrants((prev) => {
                const updated = { ...prev };
                Object.keys(updated).forEach((key) => {
                    updated[key] = (updated[key] || []).filter(
                        (i) => i.id !== item.id
                    );
                });
                return updated;
            });
            // currentId 已在 store 内持久化
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'ActMatrixForm',
                action: 'handleDeleteItem',
            });
        }
    };

    const requestDeleteItem = (item) => {
        setItemToDelete(item);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteItem = async () => {
        if (itemToDelete) {
            await handleDeleteItem(itemToDelete);
        }
        setItemToDelete(null);
        setDeleteConfirmOpen(false);
    };

    const startEdit = (item) => {
        setEditingItem(item);
        setNewItemText(item.content);
    };

    const closeModal = () => {
        setModalOpen(false);
        setActiveQuadrant(null);
        setNewItemText('');
        setEditingItem(null);
    };

    const handleShowHistory = () => {
        setHistoryModalOpen(true);
    };

    const handleCloseHistory = () => {
        setHistoryModalOpen(false);
    };

    const handleCreateNewMatrix = async () => {
        try {
            // 创建新的矩阵ID
            const newMatrixId = createNewMatrix();

            // 清空当前象限数据
            setQuadrants({
                [QUADRANT_TYPES.INNER_EXPERIENCE]: [],
                [QUADRANT_TYPES.AWAY_MOVES]: [],
                [QUADRANT_TYPES.VALUES]: [],
                [QUADRANT_TYPES.TOWARD_MOVES]: [],
            });

            // 关闭历史记录模态框
            setHistoryModalOpen(false);
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'ActMatrixForm',
                action: 'handleCreateNewMatrix',
            });
        }
    };

    const activeConfig = activeQuadrant
        ? QUADRANT_CONFIG[activeQuadrant]
        : null;
    const activeItems = activeQuadrant ? quadrants[activeQuadrant] : [];

    return (
        <IonPage ref={pageRef}>
            <PageHeader title="ACT 矩阵" />
            <IonContent className={styles.content}>
                <div className={styles.container}>
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <IonSpinner name="crescent" />
                        </div>
                    )}

                    {/* 当前矩阵ID显示 */}
                    {/* <div className={styles.currentIdBar}>
                        当前矩阵ID：{currentMatrixId || '未选择'}
                    </div> */}

                    {/* ACT 坐标系容器 */}
                    <div className={styles.coordinateSystem}>
                        {/* 坐标轴线 */}
                        <div className={styles.axisLines}>
                            <div className={styles.horizontalAxis}></div>
                            <div className={styles.verticalAxis}></div>
                        </div>

                        {/* 坐标轴标签 - 绝对定位覆盖在轴线上 */}
                        <div className={styles.axisLabels}>
                            {/* 顶部标签 */}
                            <div className={styles.topAxisLabel}>
                                <div className={styles.axisLabelText}>
                                    五感体验
                                </div>
                            </div>

                            {/* 底部标签 */}
                            <div className={styles.bottomAxisLabel}>
                                <div className={styles.axisLabelText}>
                                    心理体验
                                </div>
                            </div>

                            {/* 左侧标签 */}
                            <div className={styles.leftAxisLabel}>
                                <IonIcon
                                    icon={arrowBack}
                                    className={styles.axisArrow}
                                />
                                <div className={styles.axisLabelText}>
                                    远离away
                                </div>
                            </div>

                            {/* 右侧标签 */}
                            <div className={styles.rightAxisLabel}>
                                <div className={styles.axisLabelText}>
                                    趋向toward
                                </div>
                                <IonIcon
                                    icon={arrowForward}
                                    className={styles.axisArrow}
                                />
                            </div>
                        </div>

                        {/* 四象限网格 - 铺满整个容器 */}
                        <div className={styles.quadrantGrid}>
                            {/* 左上象限：远离行为 */}
                            <div
                                className={`${styles.quadrant} ${styles.topLeft}`}
                                onClick={() =>
                                    handleQuadrantClick(
                                        QUADRANT_TYPES.AWAY_MOVES
                                    )
                                }
                            >
                                <div className={styles.quadrantHeader}>
                                    <h3 className={styles.quadrantTitle}>
                                        {
                                            QUADRANT_CONFIG[
                                                QUADRANT_TYPES.AWAY_MOVES
                                            ].title
                                        }
                                    </h3>
                                    <p className={styles.quadrantSubtitle}>
                                        {
                                            QUADRANT_CONFIG[
                                                QUADRANT_TYPES.AWAY_MOVES
                                            ].subtitle
                                        }
                                    </p>
                                </div>
                                <div className={styles.quadrantContent}>
                                    {quadrants[QUADRANT_TYPES.AWAY_MOVES].map(
                                        (item) => (
                                            <div
                                                key={item.id}
                                                className={styles.quadrantItem}
                                            >
                                                {truncate(item.content, 30)}
                                            </div>
                                        )
                                    )}
                                    {quadrants[QUADRANT_TYPES.AWAY_MOVES]
                                        .length === 0 && (
                                        <div className={styles.emptyHint}>
                                            点击添加内容
                                        </div>
                                    )}
                                    {/* 右下角编辑与查看入口 */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuadrantClick(
                                                QUADRANT_TYPES.AWAY_MOVES
                                            );
                                        }}
                                        className={styles.quadrantCornerEdit}
                                        aria-label="编辑远离行为"
                                    >
                                        <IonIcon icon={create} />
                                    </button>
                                    {/* 右下角小眼睛图标作为详情入口 */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const id = currentMatrixId;
                                            if (!id) {
                                                alert('请先创建矩阵');
                                                return;
                                            }
                                            history.push(
                                                `/away/${encodeURIComponent(
                                                    id
                                                )}`
                                            );
                                        }}
                                        className={styles.quadrantCornerEye}
                                        aria-label="查看远离行为详情"
                                    >
                                        <IonIcon icon={eye} />
                                    </button>
                                </div>
                            </div>

                            {/* 右上象限：趋向行为 */}
                            <div
                                className={`${styles.quadrant} ${styles.topRight}`}
                                onClick={() =>
                                    handleQuadrantClick(
                                        QUADRANT_TYPES.TOWARD_MOVES
                                    )
                                }
                            >
                                <div className={styles.quadrantHeader}>
                                    <h3 className={styles.quadrantTitle}>
                                        {
                                            QUADRANT_CONFIG[
                                                QUADRANT_TYPES.TOWARD_MOVES
                                            ].title
                                        }
                                    </h3>
                                    <p className={styles.quadrantSubtitle}>
                                        {
                                            QUADRANT_CONFIG[
                                                QUADRANT_TYPES.TOWARD_MOVES
                                            ].subtitle
                                        }
                                    </p>
                                </div>
                                <div className={styles.quadrantContent}>
                                    {quadrants[QUADRANT_TYPES.TOWARD_MOVES].map(
                                        (item) => (
                                            <div
                                                key={item.id}
                                                className={styles.quadrantItem}
                                            >
                                                {truncate(item.content, 30)}
                                            </div>
                                        )
                                    )}
                                    {quadrants[QUADRANT_TYPES.TOWARD_MOVES]
                                        .length === 0 && (
                                        <div className={styles.emptyHint}>
                                            点击添加内容
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 左下象限：内在体验 */}
                            <div
                                className={`${styles.quadrant} ${styles.bottomLeft}`}
                                onClick={() =>
                                    handleQuadrantClick(
                                        QUADRANT_TYPES.INNER_EXPERIENCE
                                    )
                                }
                            >
                                <div className={styles.quadrantHeader}>
                                    <h3 className={styles.quadrantTitle}>
                                        {
                                            QUADRANT_CONFIG[
                                                QUADRANT_TYPES.INNER_EXPERIENCE
                                            ].title
                                        }
                                    </h3>
                                    <p className={styles.quadrantSubtitle}>
                                        {
                                            QUADRANT_CONFIG[
                                                QUADRANT_TYPES.INNER_EXPERIENCE
                                            ].subtitle
                                        }
                                    </p>
                                </div>
                                <div className={styles.quadrantContent}>
                                    {quadrants[
                                        QUADRANT_TYPES.INNER_EXPERIENCE
                                    ].map((item) => (
                                        <div
                                            key={item.id}
                                            className={styles.quadrantItem}
                                        >
                                            {truncate(item.content, 30)}
                                        </div>
                                    ))}
                                    {quadrants[QUADRANT_TYPES.INNER_EXPERIENCE]
                                        .length === 0 && (
                                        <div className={styles.emptyHint}>
                                            点击添加内容
                                        </div>
                                    )}
                                    {/* 右下角钩子图标 - 钩子记录表入口 */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const id = currentMatrixId;
                                            if (!id) {
                                                alert('请先创建矩阵');
                                                return;
                                            }
                                            history.push(
                                                `/hooks/${encodeURIComponent(
                                                    id
                                                )}`
                                            );
                                        }}
                                        className={styles.quadrantCornerHook}
                                        aria-label="查看钩子记录表"
                                    >
                                        🪝
                                    </button>
                                </div>
                            </div>

                            {/* 右下象限：对你重要的事(人) */}
                            <div
                                className={`${styles.quadrant} ${styles.bottomRight}`}
                                onClick={() =>
                                    handleQuadrantClick(QUADRANT_TYPES.VALUES)
                                }
                            >
                                <div className={styles.quadrantHeader}>
                                    <h3 className={styles.quadrantTitle}>
                                        {
                                            QUADRANT_CONFIG[
                                                QUADRANT_TYPES.VALUES
                                            ].title
                                        }
                                    </h3>
                                    <p className={styles.quadrantSubtitle}>
                                        {
                                            QUADRANT_CONFIG[
                                                QUADRANT_TYPES.VALUES
                                            ].subtitle
                                        }
                                    </p>
                                </div>
                                <div className={styles.quadrantContent}>
                                    {quadrants[QUADRANT_TYPES.VALUES].map(
                                        (item) => (
                                            <div
                                                key={item.id}
                                                className={styles.quadrantItem}
                                            >
                                                {truncate(item.content, 30)}
                                            </div>
                                        )
                                    )}
                                    {quadrants[QUADRANT_TYPES.VALUES].length ===
                                        0 && (
                                        <div className={styles.emptyHint}>
                                            点击添加内容
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 浮动历史记录按钮 */}
                <button
                    className={`${styles.floatingButton} ${styles.historyButton}`}
                    onClick={handleShowHistory}
                >
                    <IonIcon icon={time} />
                </button>
            </IonContent>

            {/* 象限内容管理模态框 */}
            <IonModal
                isOpen={modalOpen}
                onDidDismiss={closeModal}
                presentingElement={pageRef.current}
                canDismiss={true}
                showBackdrop={true}
            >
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>{activeConfig?.title}</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={closeModal}>
                                <IonIcon icon={close} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div className={styles.modalContent}>
                        {activeConfig && (
                            <div className={styles.modalHeader}>
                                <p className={styles.modalQuestion}>
                                    {activeConfig.question}
                                </p>
                            </div>
                        )}

                        {/* 已填写内容列表 - 放到上面 */}
                        {activeItems.length > 0 && (
                            <div className={styles.existingItemsSection}>
                                <IonList>
                                    {activeItems.map((item, index) => (
                                        <IonItem
                                            key={item.id}
                                            className={styles.existingItem}
                                            draggable
                                            onDragStart={(e) =>
                                                handleDragStart(e, index)
                                            }
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, index)}
                                        >
                                            <IonLabel>
                                                <p
                                                    className={
                                                        styles.itemContent
                                                    }
                                                >
                                                    {item.content}
                                                </p>
                                                <p className={styles.itemDate}>
                                                    {formatDate(item.createdAt)}
                                                </p>
                                            </IonLabel>
                                            <IonButton
                                                fill="clear"
                                                size="small"
                                                color="primary"
                                                onClick={() => startEdit(item)}
                                                slot="end"
                                            >
                                                <IonIcon icon={create} />
                                            </IonButton>
                                            <IonButton
                                                fill="clear"
                                                size="small"
                                                color="danger"
                                                onClick={() =>
                                                    requestDeleteItem(item)
                                                }
                                                slot="end"
                                            >
                                                <IonIcon icon={trash} />
                                            </IonButton>
                                        </IonItem>
                                    ))}
                                </IonList>
                            </div>
                        )}

                        {/* 添加/编辑输入框 */}
                        <div className={styles.inputSection}>
                            {editingItem ? (
                                <>
                                    <IonItem className={styles.inputWithButton}>
                                        <IonInput
                                            value={newItemText}
                                            placeholder={
                                                activeConfig?.placeholder
                                            }
                                            onIonInput={(e) =>
                                                setNewItemText(
                                                    e.detail.value || ''
                                                )
                                            }
                                            type="text"
                                        ></IonInput>
                                    </IonItem>
                                    <div className={styles.inputActions}>
                                        <IonButton
                                            onClick={() =>
                                                handleEditItem(editingItem)
                                            }
                                            disabled={!newItemText.trim()}
                                            color="primary"
                                            fill="solid"
                                        >
                                            保存修改
                                        </IonButton>
                                        <IonButton
                                            fill="outline"
                                            onClick={() => {
                                                setEditingItem(null);
                                                setNewItemText('');
                                            }}
                                        >
                                            取消
                                        </IonButton>
                                    </div>
                                </>
                            ) : (
                                <IonItem className={styles.inputWithButton}>
                                    <IonInput
                                        ref={inputRef}
                                        value={newItemText}
                                        placeholder={activeConfig?.placeholder}
                                        onIonInput={(e) =>
                                            setNewItemText(e.detail.value || '')
                                        }
                                        type="text"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleAddItemWithLatestValue();
                                            }
                                        }}
                                    ></IonInput>
                                    <IonButton
                                        slot="end"
                                        onClick={handleAddItemWithLatestValue}
                                        disabled={
                                            !newItemText.trim() ||
                                            !currentMatrixId
                                        }
                                        fill="solid"
                                        size="small"
                                        color="primary"
                                    >
                                        添加
                                    </IonButton>
                                </IonItem>
                            )}
                        </div>
                    </div>
                </IonContent>
            </IonModal>

            {/* 删除条目确认弹窗 */}
            <IonAlert
                isOpen={deleteConfirmOpen}
                onDidDismiss={() => {
                    setDeleteConfirmOpen(false);
                    setItemToDelete(null);
                }}
                header="确认删除"
                message="确定要删除该条目吗？此操作不可撤销。"
                buttons={[
                    {
                        text: '取消',
                        role: 'cancel',
                        handler: () => {
                            setDeleteConfirmOpen(false);
                            setItemToDelete(null);
                        },
                    },
                    {
                        text: '删除',
                        role: 'destructive',
                        handler: confirmDeleteItem,
                    },
                ]}
            />

            {/* 历史记录模态框 */}
            <IonModal
                isOpen={historyModalOpen}
                onDidDismiss={handleCloseHistory}
                presentingElement={pageRef.current}
                canDismiss={true}
                showBackdrop={true}
            >
                <HistoryPage
                    onBack={handleCloseHistory}
                    onCreateNew={handleCreateNewMatrix}
                />
            </IonModal>
        </IonPage>
    );
}

function truncate(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
}

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
