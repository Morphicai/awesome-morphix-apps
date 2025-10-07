import React, { useEffect, useState } from 'react';
import {
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonList,
    IonSpinner,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonFab,
    IonFabButton,
    IonAlert,
} from '@ionic/react';
import AppSdk from '@morphixai/app-sdk';
import { reportError } from '@morphixai/lib';
import { chevronBack, add, time, grid, trash } from 'ionicons/icons';
import styles from '../styles/HistoryPage.module.css';
import { useMatrix } from '../store/matrixStore';

const COLLECTION_NAME = 'act_matrix_quadrants';
const MATRIX_SESSIONS_COLLECTION = 'act_matrix_sessions';
const HOOKS_COLLECTION = 'act_matrix_hooks';

export default function HistoryPage({ onBack, onCreateNew }) {
    const { currentMatrixId, setCurrentMatrix } = useMatrix();
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [matrixIdToDelete, setMatrixIdToDelete] = useState(null);

    useEffect(() => {
        console.log('[HistoryPage] mounted');
        loadHistoryData();
    }, []);

    const loadHistoryData = async () => {
        console.log('[HistoryPage] loadHistoryData: start');
        setLoading(true);
        try {
            // 获取所有象限数据
            const quadrantsResult = await AppSdk.appData.queryData({
                collection: COLLECTION_NAME,
                query: [],
            });
            console.log(
                '[HistoryPage] queryData result count:',
                Array.isArray(quadrantsResult) ? quadrantsResult.length : 'N/A'
            );

            // 获取所有钩子记录表数据
            const hooksResult = await AppSdk.appData.queryData({
                collection: HOOKS_COLLECTION,
                query: [],
            });
            console.log(
                '[HistoryPage] hooks result count:',
                Array.isArray(hooksResult) ? hooksResult.length : 'N/A'
            );

            // 不再过滤空内容，保留所有矩阵
            const allItems = Array.isArray(quadrantsResult) ? quadrantsResult : [];

            // 按矩阵ID分组数据，创建会话
            const sessionMap = new Map();

            if (Array.isArray(allItems)) {
                allItems.forEach((item) => {
                    const matrixId = item.matrixId || 'default';
                    const createdAt = item.createdAt || Date.now();

                    if (!sessionMap.has(matrixId)) {
                        sessionMap.set(matrixId, {
                            id: matrixId,
                            matrixId: matrixId,
                            timestamp: createdAt,
                            items: [],
                            hooksCount: 0,
                            isCurrentMatrix: matrixId === currentMatrixId,
                        });
                    }

                    const session = sessionMap.get(matrixId);
                    session.items.push(item);
                    // 更新时间戳为最新的项目时间
                    if (createdAt > session.timestamp) {
                        session.timestamp = createdAt;
                    }
                });
            }

            // 统计每个矩阵的钩子数量
            if (Array.isArray(hooksResult)) {
                hooksResult.forEach((hookRecord) => {
                    // hookRecord.id 就是 matrixId（因为我们用 matrixId 作为记录的 id）
                    const matrixId = hookRecord.id || hookRecord.matrixId;
                    console.log('[HistoryPage] processing hook record:', { 
                        recordId: hookRecord.id, 
                        matrixId: hookRecord.matrixId,
                        hooksLength: hookRecord.hooks?.length 
                    });
                    
                    if (matrixId) {
                        // 如果 sessionMap 中还没有这个矩阵，创建一个空的会话
                        if (!sessionMap.has(matrixId)) {
                            sessionMap.set(matrixId, {
                                id: matrixId,
                                matrixId: matrixId,
                                timestamp: hookRecord.createdAt || Date.now(),
                                items: [],
                                hooksCount: 0,
                                isCurrentMatrix: matrixId === currentMatrixId,
                            });
                        }
                        
                        const session = sessionMap.get(matrixId);
                        const hooksArray = hookRecord.hooks || [];
                        session.hooksCount = Array.isArray(hooksArray) ? hooksArray.length : 0;
                        console.log('[HistoryPage] set hooksCount:', session.hooksCount, 'for matrixId:', matrixId);
                    }
                });
            }

            // 转换为数组并按时间排序
            const sessionsArray = Array.from(sessionMap.values()).sort(
                (a, b) => b.timestamp - a.timestamp
            );
            console.log('[HistoryPage] sessionsArray (built):', sessionsArray);
            setSessions(sessionsArray);
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HistoryPage',
                action: 'loadHistoryData',
            });
        } finally {
            setLoading(false);
            console.log('[HistoryPage] loadHistoryData: end');
        }
    };

    const handleCreateNewMatrix = async () => {
        try {
            // 创建新的矩阵会话
            const newSession = {
                id: Date.now().toString(),
                createdAt: Date.now(),
                name: `ACT矩阵 - ${formatDate(Date.now())}`,
            };

            // 可以在这里保存会话信息到数据库
            // await AppSdk.appData.createData({
            //     collection: MATRIX_SESSIONS_COLLECTION,
            //     data: newSession
            // });

            if (onCreateNew) {
                onCreateNew();
            }
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HistoryPage',
                action: 'handleCreateNewMatrix',
            });
        }
    };

    const getQuadrantSummary = (items) => {
        const quadrantCounts = {
            away_moves: 0,
            toward_moves: 0,
            inner_experience: 0,
            
            values: 0,
        };

        items.forEach((item) => {
            if (quadrantCounts.hasOwnProperty(item.quadrantType)) {
                quadrantCounts[item.quadrantType]++;
            }
        });

        return quadrantCounts;
    };

    const getQuadrantName = (type) => {
        const names = {
            away_moves: '远离行为',
            inner_experience: '内在体验',
            
            toward_moves: '趋向行为',
            values: '对你重要的事(人)',
        };
        return names[type] || type;
    };

    const handleViewSessionDetails = (session) => {
        // 直接切换到指定的矩阵
        console.log(
            '[HistoryPage] view details -> setCurrentMatrix:',
            session.matrixId
        );
        setCurrentMatrix(session.matrixId);
        // 关闭历史记录模态框，返回首页
        onBack();
    };

    const handleSwitchToMatrix = (session) => {
        // 切换到指定的矩阵
        console.log(
            '[HistoryPage] switch matrix -> setCurrentMatrix:',
            session.matrixId
        );
        setCurrentMatrix(session.matrixId);
        // 关闭历史记录模态框
        onBack();
    };

    const handleDeleteMatrix = async (matrixId) => {
        try {
            console.log('[HistoryPage] delete start, matrixId:', matrixId);
            setLoading(true);
            // 查询该矩阵下的所有象限数据
            const items = await AppSdk.appData.queryData({
                collection: COLLECTION_NAME,
                query: [{ key: 'matrixId', operator: 'eq', value: matrixId }],
            });

            console.log(
                '[HistoryPage] items to delete (count):',
                Array.isArray(items) ? items.length : 'N/A',
                Array.isArray(items) ? items.map((i) => i.id) : []
            );

            let deleteResults = [];
            if (Array.isArray(items) && items.length > 0) {
                // 并发删除并等待完成，收集结果
                deleteResults = await Promise.all(
                    items.map(async (item) => {
                        try {
                            const res = await AppSdk.appData.deleteData({
                                collection: COLLECTION_NAME,
                                id: item.id,
                            });
                            return { id: item.id, ok: true, res };
                        } catch (e) {
                            return { id: item.id, ok: false, error: String(e) };
                        }
                    })
                );
            }
            console.log('[HistoryPage] delete results:', deleteResults);

            // 删除该矩阵的钩子记录表
            try {
                await AppSdk.appData.deleteData({
                    collection: HOOKS_COLLECTION,
                    id: matrixId,
                });
                console.log('[HistoryPage] deleted hooks for matrixId:', matrixId);
            } catch (e) {
                console.warn('[HistoryPage] failed to delete hooks (may not exist):', e);
            }
            // 如果删除的是当前矩阵，则清空当前选择
            if (currentMatrixId === matrixId) {
                console.log('[HistoryPage] deleted current matrix, switching to fallback');
                // 回退：切换到最新的一个会话（若有），否则创建新矩阵
                const remainingSessions = sessions.filter(s => s.matrixId !== matrixId);
                if (remainingSessions.length > 0) {
                    setCurrentMatrix(remainingSessions[0].matrixId);
                } else {
                    // 交给外部创建逻辑
                    if (typeof onCreateNew === 'function') {
                        onCreateNew();
                    } else {
                        setCurrentMatrix(`matrix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
                    }
                }
            }

            // 重新加载列表
            await loadHistoryData();
            console.log('[HistoryPage] delete finished, matrixId:', matrixId);
        } catch (error) {
            await reportError(error, 'JavaScriptError', {
                component: 'HistoryPage',
                action: 'handleDeleteMatrix',
            });
            console.error('[HistoryPage] delete error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={onBack}>
                            <IonIcon icon={chevronBack} />
                            返回
                        </IonButton>
                    </IonButtons>
                    <IonTitle>历史记录</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className={styles.content}>
                <div className={styles.container}>
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <IonSpinner name="crescent" />
                        </div>
                    )}

                    {!loading && sessions.length === 0 && (
                        <div className={styles.emptyState}>
                            <IonIcon icon={grid} className={styles.emptyIcon} />
                            <h2>暂无历史记录</h2>
                            <p>开始创建您的第一个ACT矩阵</p>
                            <IonButton onClick={handleCreateNewMatrix}>
                                <IonIcon icon={add} slot="start" />
                                创建新矩阵
                            </IonButton>
                        </div>
                    )}

                    {!loading && sessions.length > 0 && (
                        <div className={styles.sessionsList}>
                            <div className={styles.header}>
                                <p>共 {sessions.length} 个记录</p>
                            </div>

                            {sessions.reverse().map((session) => {
                                const summary = getQuadrantSummary(
                                    session.items
                                );
                                return (
                                    <IonCard
                                        key={session.id}
                                        className={`${styles.sessionCard} ${
                                            session.isCurrentMatrix
                                                ? styles.currentMatrix
                                                : ''
                                        }`}
                                    >
                                        <IonCardHeader>
                                            <IonCardTitle
                                                className={styles.sessionTitle}
                                            >
                                                <IonIcon
                                                    icon={time}
                                                    className={styles.timeIcon}
                                                />
                                                {formatDate(session.timestamp)}
                                                {session.isCurrentMatrix && (
                                                    <span
                                                        className={
                                                            styles.currentLabel
                                                        }
                                                    >
                                                        当前
                                                    </span>
                                                )}
                                            </IonCardTitle>
                                        </IonCardHeader>
                                        <IonCardContent>
                                            <div
                                                className={
                                                    styles.sessionSummary
                                                }
                                            >
                                                <IonGrid>
                                                    <IonRow>
                                                        {Object.entries(
                                                            summary
                                                        ).map(
                                                            ([type, count]) => (
                                                                <IonCol
                                                                    size="6"
                                                                    key={type}
                                                                >
                                                                    <div
                                                                        className={
                                                                            styles.quadrantSummary
                                                                        }
                                                                    >
                                                                        <div
                                                                            className={
                                                                                styles.quadrantName
                                                                            }
                                                                        >
                                                                            {getQuadrantName(
                                                                                type
                                                                            )}
                                                                        </div>
                                                                        <div
                                                                            className={
                                                                                styles.quadrantCount
                                                                            }
                                                                        >
                                                                            {
                                                                                count
                                                                            }{' '}
                                                                            项
                                                                        </div>
                                                                    </div>
                                                                </IonCol>
                                                            )
                                                        )}
                                                    </IonRow>
                                                    <IonRow>
                                                        <IonCol size="12">
                                                            <div
                                                                className={
                                                                    styles.hooksCountDisplay
                                                                }
                                                            >
                                                                <span className={styles.hooksIcon}>🪝</span>
                                                                <span className={styles.hooksLabel}>钩子记录：</span>
                                                                <span className={styles.hooksCount}>
                                                                    {session.hooksCount || 0} 项
                                                                </span>
                                                            </div>
                                                        </IonCol>
                                                    </IonRow>
                                                </IonGrid>
                                            </div>
                                            {/* 保留下方与删除在一起的“查看详情”，这里移除重复按钮 */}
                                            <div
                                                className={
                                                    styles.sessionActions
                                                }
                                            >
                                                <IonButton
                                                    fill="outline"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleViewSessionDetails(
                                                            session
                                                        );
                                                    }}
                                                >
                                                    查看详情
                                                </IonButton>
                                                <IonButton
                                                    fill="outline"
                                                    color="danger"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        console.log(
                                                            '[HistoryPage] open delete confirm for matrixId:',
                                                            session.matrixId
                                                        );
                                                        setMatrixIdToDelete(
                                                            session.matrixId
                                                        );
                                                        setConfirmOpen(true);
                                                    }}
                                                >
                                                    <IonIcon
                                                        icon={trash}
                                                        slot="start"
                                                    />{' '}
                                                    删除
                                                </IonButton>
                                            </div>
                                        </IonCardContent>
                                    </IonCard>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 浮动新建按钮 */}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={handleCreateNewMatrix}>
                        {console.log(
                            '[HistoryPage] render, sessions length:',
                            sessions.length,
                            'currentMatrixId:',
                            currentMatrixId
                        )}
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>

                {/* 删除确认弹窗 */}
                <IonAlert
                    isOpen={confirmOpen}
                    onDidDismiss={() => {
                        setConfirmOpen(false);
                        setMatrixIdToDelete(null);
                    }}
                    header="确认删除"
                    message="删除该矩阵将移除其下所有内容，且不可恢复。是否继续？"
                    buttons={[
                        {
                            text: '取消',
                            role: 'cancel',
                            handler: () => {
                                setConfirmOpen(false);
                                setMatrixIdToDelete(null);
                            },
                        },
                        {
                            text: '删除',
                            role: 'destructive',
                            handler: async () => {
                                if (matrixIdToDelete) {
                                    await handleDeleteMatrix(matrixIdToDelete);
                                }
                                setConfirmOpen(false);
                                setMatrixIdToDelete(null);
                            },
                        },
                    ]}
                />
            </IonContent>
        </>
    );
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
