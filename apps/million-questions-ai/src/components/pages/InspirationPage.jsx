import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import styles from '../../styles/InspirationPage.module.css';

export default function InspirationPage({ onIdeaChange }) {
  const history = useHistory();
  const [idea, setIdea] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setIdea(value);
    if (onIdeaChange) {
      onIdeaChange(value);
    }
  };

  const generateQuestionList = () => {
    if (!idea.trim()) {
      alert('请输入你的问题或想法');
      return;
    }
    history.push('/questions');
  };

  const conveneBoardMeeting = () => {
    if (!idea.trim()) {
      alert('请输入你的问题或想法');
      return;
    }
    history.push('/board-selection');
  };

  return (
    <IonPage>
      <PageHeader title="探索可能性" />
      <IonContent>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.title}>一个好问题，价值百万。</div>
            <div className={styles.subtitle}>在这里，提出你的挑战，我们将为你揭示机遇。</div>
          </div>

          <div style={{ width: '100%', maxWidth: '600px' }}>
            <textarea
              className={styles.ideaInput}
              placeholder="例如：如何为新一代创造一个现象级的学习产品？"
              value={idea}
              onChange={handleInputChange}
            />

            <div className={styles.buttonGroup}>
              <button
                className={styles.secondaryButton}
                onClick={generateQuestionList}
              >
                生成黄金提问清单
              </button>
              <button
                className={styles.primaryButton}
                onClick={conveneBoardMeeting}
                disabled={!idea.trim()}
              >
                召开虚拟董事会
              </button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
