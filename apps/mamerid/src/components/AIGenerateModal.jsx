import React, { useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonTextarea, IonSpinner, IonIcon } from '@ionic/react';
import { closeOutline, sparklesOutline } from 'ionicons/icons';
import styles from '../styles/AIGenerateModal.module.css';

/**
 * AI Generate Flowchart Modal
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
            setPrompt(''); // Clear input
            onClose(); // Close modal
        } catch (error) {
            console.error('Generation failed:', error);
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
        'Create a user login flowchart with username/password input, validation, success/failure handling',
        'Draw an online shopping process from browsing products to payment completion',
        'Show software development lifecycle including requirements analysis, design, development, testing, deployment',
        'Create a customer service flowchart including receiving questions, classification, handling, feedback'
    ];

    return (
        <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>AI Generate Flowchart</IonTitle>
                    <IonButton slot="end" fill="clear" onClick={handleClose} disabled={isGenerating}>
                        <IonIcon icon={closeOutline} />
                    </IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent className={styles.content}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <IonIcon icon={sparklesOutline} className={styles.headerIcon} />
                        <h2 className={styles.headerTitle}>Describe Your Flowchart</h2>
                        <p className={styles.headerSubtitle}>AI will generate professional Mermaid flowchart code based on your description</p>
                    </div>

                    <div className={styles.inputSection}>
                        <IonTextarea
                            className={styles.textarea}
                            value={prompt}
                            onIonInput={(e) => setPrompt(e.detail.value)}
                            placeholder="e.g.: Create a user registration flowchart including filling information, email verification, password setup, etc..."
                            rows={6}
                            autoGrow={true}
                            disabled={isGenerating}
                        />
                    </div>

                    <div className={styles.examples}>
                        <p className={styles.examplesTitle}>💡 Example Prompts</p>
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
                                    <span style={{ marginLeft: '12px' }}>AI Generating...</span>
                                </>
                            ) : (
                                <>
                                    <IonIcon slot="start" icon={sparklesOutline} />
                                    Generate Flowchart
                                </>
                            )}
                        </IonButton>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
}

