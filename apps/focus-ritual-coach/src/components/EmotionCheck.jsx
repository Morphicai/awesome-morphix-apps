import React, { useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonTextarea,
  IonRange,
} from '@ionic/react';
import styles from '../styles/EmotionCheck.module.css';

const EMOTIONS = [
  { value: 'happy', label: '😊 愉悦', color: '#ffd93d' },
  { value: 'calm', label: '😌 平静', color: '#95e1d3' },
  { value: 'anxious', label: '😰 焦虑', color: '#f38181' },
  { value: 'tired', label: '😫 疲惫', color: '#aa96da' },
  { value: 'energetic', label: '💪 充满活力', color: '#ff6b6b' },
];

export default function EmotionCheck({ onComplete }) {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [energy, setEnergy] = useState(3);
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (selectedEmotion) {
      onComplete({
        emotion: selectedEmotion,
        energy,
        note,
      });
    }
  };

  return (
    <div className={styles.container}>
      <IonCard className={styles.card}>
        <IonCardHeader>
          <IonCardTitle>情绪签到</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>此刻的心情</h3>
            <div className={styles.emotionGrid}>
              {EMOTIONS.map((emotion) => (
                <button
                  key={emotion.value}
                  className={`${styles.emotionButton} ${
                    selectedEmotion === emotion.value ? styles.selected : ''
                  }`}
                  style={{
                    borderColor: selectedEmotion === emotion.value ? emotion.color : '#ddd',
                    backgroundColor: selectedEmotion === emotion.value ? `${emotion.color}20` : 'white',
                  }}
                  onClick={() => setSelectedEmotion(emotion.value)}
                >
                  <span className={styles.emotionLabel}>{emotion.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>能量等级</h3>
            <div className={styles.energyContainer}>
              <IonRange
                min={1}
                max={5}
                value={energy}
                pin
                ticks
                snaps
                onIonChange={(e) => setEnergy(e.detail.value)}
                className={styles.energyRange}
              />
              <div className={styles.energyLabels}>
                <span>低</span>
                <span>中</span>
                <span>高</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>备注（可选）</h3>
            <IonTextarea
              placeholder="记录一下此刻的想法..."
              value={note}
              onIonChange={(e) => setNote(e.detail.value)}
              rows={3}
              className={styles.noteInput}
            />
          </div>

          <IonButton
            expand="block"
            onClick={handleSubmit}
            disabled={!selectedEmotion}
            className={styles.submitButton}
          >
            继续
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
}

