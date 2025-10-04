import React, { useState, useEffect } from 'react';
import { IonModal, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonSearchbar, IonText } from '@ionic/react';
import { closeOutline, trashOutline, timeOutline } from 'ionicons/icons';
import HistoryService from '../services/HistoryService';
import styles from '../styles/HistoryPanel.module.css';

/**
 * 历史记录面板组件
 */
export default function HistoryPanel({ isOpen, onClose, onSelectHistory }) {
    const [history, setHistory] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);

    const loadHistory = () => {
        const allHistory = HistoryService.getHistory();
        setHistory(allHistory);
    };

    const handleSearch = (keyword) => {
        setSearchKeyword(keyword);
        const results = HistoryService.searchHistory(keyword);
        setHistory(results);
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        HistoryService.deleteHistoryItem(id);
        loadHistory();
    };

    const handleClearAll = () => {
        if (confirm('确定要清空所有历史记录吗？')) {
            HistoryService.clearHistory();
            loadHistory();
        }
    };

    const handleSelectItem = (item) => {
        onSelectHistory(item);
        onClose();
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // 小于1分钟
        if (diff < 60000) {
            return '刚刚';
        }
        // 小于1小时
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}分钟前`;
        }
        // 小于1天
        if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}小时前`;
        }
        // 小于7天
        if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)}天前`;
        }
        
        // 超过7天显示具体日期
        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <div className={styles.header}>
                <h2 className={styles.title}>历史记录</h2>
                <IonButton fill="clear" size="small" onClick={onClose}>
                    <IonIcon slot="icon-only" icon={closeOutline} />
                </IonButton>
            </div>

            <IonContent className={styles.content}>
                <div className={styles.searchBar}>
                    <IonSearchbar
                        value={searchKeyword}
                        onIonInput={(e) => handleSearch(e.detail.value)}
                        placeholder="搜索历史记录..."
                        debounce={300}
                    />
                </div>

                {history.length > 0 && (
                    <div className={styles.clearButton}>
                        <IonButton 
                            fill="clear" 
                            size="small" 
                            color="danger"
                            onClick={handleClearAll}
                        >
                            清空所有记录
                        </IonButton>
                    </div>
                )}

                {history.length === 0 ? (
                    <div className={styles.emptyState}>
                        <IonIcon icon={timeOutline} className={styles.emptyIcon} />
                        <p>暂无历史记录</p>
                    </div>
                ) : (
                    <IonList className={styles.historyList}>
                        {history.map((item) => (
                            <IonItem
                                key={item.id}
                                button
                                onClick={() => handleSelectItem(item)}
                                className={styles.historyItem}
                            >
                                <IonLabel>
                                    <div className={styles.itemHeader}>
                                        <span className={styles.itemPreview}>{item.preview}</span>
                                        <span className={styles.itemVersion}>v{item.version}</span>
                                    </div>
                                    <IonText color="medium" className={styles.itemTime}>
                                        {formatDate(item.timestamp)}
                                    </IonText>
                                </IonLabel>
                                <IonButton
                                    fill="clear"
                                    size="small"
                                    color="danger"
                                    slot="end"
                                    onClick={(e) => handleDelete(item.id, e)}
                                >
                                    <IonIcon slot="icon-only" icon={trashOutline} />
                                </IonButton>
                            </IonItem>
                        ))}
                    </IonList>
                )}
            </IonContent>
        </IonModal>
    );
}

