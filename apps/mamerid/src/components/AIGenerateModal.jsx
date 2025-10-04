import React, { useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonTextarea, IonSpinner, IonIcon } from '@ionic/react';
import { closeOutline, sparklesOutline } from 'ionicons/icons';
import styles from '../styles/AIGenerateModal.module.css';

/**
 * AI生成流程图模态框
 */
export default function AIGenerateModal({ isOpen, onClose, onGenerate }) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            return;
        }

        setIsGenerating(true);
        try {
            await onGenerate(prompt);
            setPrompt(''); // 清空输入
            onClose(); // 关闭模态框
        } catch (error) {
            console.error('生成失败:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClose = () => {
        if (!isGenerating) {
            setPrompt('');
            onClose();
        }
    };

    const examples = [
        '创建一个用户登录流程图，包含输入用户名密码、验证、成功/失败的处理',
        '绘制一个在线购物流程，从浏览商品到支付完成',
        '展示软件开发生命周期，包括需求分析、设计、开发、测试、部署',
        '制作一个客户服务流程图，包括接收问题、分类、处理、反馈'
    ];

    return (
        <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>AI 生成流程图</IonTitle>
                    <IonButton slot="end" fill="clear" onClick={handleClose} disabled={isGenerating}>
                        <IonIcon icon={closeOutline} />
                    </IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent className={styles.content}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <IonIcon icon={sparklesOutline} className={styles.headerIcon} />
                        <h2 className={styles.headerTitle}>描述你想要的流程图</h2>
                        <p className={styles.headerSubtitle}>AI 将根据你的描述生成专业的 Mermaid 流程图代码</p>
                    </div>

                    <div className={styles.inputSection}>
                        <IonTextarea
                            className={styles.textarea}
                            value={prompt}
                            onIonInput={(e) => setPrompt(e.detail.value)}
                            placeholder="例如：创建一个用户注册流程图，包含填写信息、验证邮箱、设置密码等步骤..."
                            rows={6}
                            autoGrow={true}
                            disabled={isGenerating}
                        />
                    </div>

                    <div className={styles.examples}>
                        <p className={styles.examplesTitle}>💡 示例提示词</p>
                        {examples.map((example, index) => (
                            <div
                                key={index}
                                className={styles.exampleItem}
                                onClick={() => !isGenerating && setPrompt(example)}
                            >
                                {example}
                            </div>
                        ))}
                    </div>

                    <div className={styles.actions}>
                        <IonButton
                            expand="block"
                            size="large"
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || isGenerating}
                            className={styles.generateButton}
                        >
                            {isGenerating ? (
                                <>
                                    <IonSpinner name="crescent" />
                                    <span style={{ marginLeft: '12px' }}>AI 生成中...</span>
                                </>
                            ) : (
                                <>
                                    <IonIcon slot="start" icon={sparklesOutline} />
                                    生成流程图
                                </>
                            )}
                        </IonButton>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
}

