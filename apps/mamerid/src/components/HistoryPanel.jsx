import React, { useState, useEffect } from 'react';
import { IonModal, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonSearchbar, IonText } from '@ionic/react';
import { closeOutline, trashOutline, timeOutline } from 'ionicons/icons';
import HistoryService from '../services/HistoryService';
import styles from '../styles/HistoryPanel.module.css';

/**
 * History Panel Component
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
        if (confirm('Are you sure you want to clear all history?')) {
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
        
        // Less than 1 minute
        if (diff < 60000) {
            return 'Just now';
        }
        // Less than 1 hour
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)} min ago`;
        }
        // Less than 1 day
        if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)} hr ago`;
        }
        // Less than 7 days
        if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)} days ago`;
        }
        
        // More than 7 days, show specific date
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <div className={styles.header}>
                <h2 className={styles.title}>History</h2>
                <IonButton fill="clear" size="small" onClick={onClose}>
                    <IonIcon slot="icon-only" icon={closeOutline} />
                </IonButton>
            </div>

            <IonContent className={styles.content}>
                <div className={styles.searchBar}>
                    <IonSearchbar
                        value={searchKeyword}
                        onIonInput={(e) => handleSearch(e.detail.value)}
                        placeholder="Search history..."
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
                            Clear All
                        </IonButton>
                    </div>
                )}

                {history.length === 0 ? (
                    <div className={styles.emptyState}>
                        <IonIcon icon={timeOutline} className={styles.emptyIcon} />
                        <p>No history yet</p>
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

