import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useAppContext } from '../../contexts/AppContext';
import styles from '../../styles/InspirationPage.module.css';

export default function InspirationPage() {
  const history = useHistory();
  const { currentIdea, setCurrentIdea } = useAppContext();

  // 确保组件更新时同步最新的 idea 值
  useEffect(() => {
    console.log('📝 当前想法:', currentIdea);
  }, [currentIdea]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    console.log('✍️ 输入变更:', value);
    setCurrentIdea(value);
  };

  const generateQuestionList = () => {
    console.log('🔍 检查当前想法:', currentIdea);
    if (!currentIdea || !currentIdea.trim()) {
      alert('请输入你的问题或想法');
      return;
    }
    console.log('✅ 想法已输入，跳转到问题清单页');
    history.push('/questions');
  };

  const conveneBoardMeeting = () => {
    console.log('🔍 检查当前想法:', currentIdea);
    if (!currentIdea || !currentIdea.trim()) {
      alert('请输入你的问题或想法');
      return;
    }
    console.log('✅ 想法已输入，跳转到董事会选择');
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
              value={currentIdea}
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
                disabled={!currentIdea || !currentIdea.trim()}
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
