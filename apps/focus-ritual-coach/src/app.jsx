import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { home, statsChart } from 'ionicons/icons';
import { useRitualStore } from './store/ritualStore';
import Welcome from './components/Welcome';
import EmotionCheck from './components/EmotionCheck';
import AICoach from './components/AICoach';
import FocusTimer from './components/FocusTimer';
import styles from './styles/App.module.css';

/**
 * Focus Ritual Coach - 主应用组件
 * 
 * 帮助知识工作者构建日常专注仪式的应用
 * 流程：欢迎 -> 情绪签到 -> AI 激励 -> 专注倒计时
 */
export default function App() {
    const { currentRitual, initialize, setRitualStep, updateEmotion, setTasks, setAIAdvice, completeRitual, resetRitual } = useRitualStore();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        await initialize();
        setInitialized(true);
    };

    const handleStartRitual = () => {
        setRitualStep('emotion');
    };

    const handleEmotionComplete = ({ emotion, energy, note }) => {
        updateEmotion(emotion, energy, note);
        setRitualStep('coach');
    };

    const handleCoachComplete = ({ tasks, aiAdvice }) => {
        setTasks(tasks);
        setAIAdvice(aiAdvice);
        setRitualStep('focus');
    };

    const handleFocusComplete = () => {
        completeRitual();
    };

    const handleGoHome = () => {
        resetRitual();
    };

    if (!initialized) {
        return (
            <IonPage>
                <IonContent className={styles.content}>
                    <div className={styles.loading}>
                        <p>Loading...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Focus Ritual Coach</IonTitle>
                    {currentRitual.step !== 'welcome' && (
                        <IonButtons slot="end">
                            <IonButton onClick={handleGoHome}>
                                <IonIcon icon={home} />
                            </IonButton>
                        </IonButtons>
                    )}
                </IonToolbar>
            </IonHeader>
            <IonContent className={styles.content}>
                {currentRitual.step === 'welcome' && (
                    <Welcome onStart={handleStartRitual} />
                )}
                {currentRitual.step === 'emotion' && (
                    <EmotionCheck onComplete={handleEmotionComplete} />
                )}
                {currentRitual.step === 'coach' && (
                    <AICoach
                        emotion={currentRitual.emotion}
                        energy={currentRitual.energy}
                        note={currentRitual.note}
                        onComplete={handleCoachComplete}
                    />
                )}
                {currentRitual.step === 'focus' && (
                    <FocusTimer onComplete={handleFocusComplete} />
                )}
            </IonContent>
        </IonPage>
    );
}