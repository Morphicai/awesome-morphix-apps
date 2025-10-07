import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useAppContext } from '../../contexts/AppContext';
import styles from '../../styles/InspirationPage.module.css';

export default function InspirationPage() {
  const history = useHistory();
  const { currentIdea, setCurrentIdea, t } = useAppContext();

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
      alert(t('inspiration.inputRequired'));
      return;
    }
    console.log('✅ 想法已输入，跳转到问题清单页');
    history.push('/questions');
  };

  const conveneBoardMeeting = () => {
    console.log('🔍 检查当前想法:', currentIdea);
    if (!currentIdea || !currentIdea.trim()) {
      alert(t('inspiration.inputRequired'));
      return;
    }
    console.log('✅ 想法已输入，跳转到董事会选择');
    history.push('/board-selection');
  };

  return (
    <IonPage>
      <PageHeader title={t('inspiration.title')} />
      <IonContent>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.title}>{t('inspiration.header')}</div>
            <div className={styles.subtitle}>{t('inspiration.subtitle')}</div>
          </div>

          <div style={{ width: '100%', maxWidth: '600px' }}>
            <textarea
              className={styles.ideaInput}
              placeholder={t('inspiration.placeholder')}
              value={currentIdea}
              onChange={handleInputChange}
            />

            <div className={styles.buttonGroup}>
              <button
                className={styles.secondaryButton}
                onClick={generateQuestionList}
              >
                {t('inspiration.generateButton')}
              </button>
              <button
                className={styles.primaryButton}
                onClick={conveneBoardMeeting}
                disabled={!currentIdea || !currentIdea.trim()}
              >
                {t('inspiration.boardButton')}
              </button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
