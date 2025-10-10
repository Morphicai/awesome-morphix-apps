import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { PageHeader } from '@morphixai/components';
import { useHistory } from 'react-router-dom';
import { questions, calculateTestResult } from '../utils/questions';
import { DataService } from '../services/DataService';
import styles from '../styles/TestPage.module.css';

export default function TestPage() {
  const history = useHistory();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [selectedValue, setSelectedValue] = useState(null);
  const [showEnergyGuide, setShowEnergyGuide] = useState(true);
  const [energyProgress, setEnergyProgress] = useState(0);
  const [energyValue, setEnergyValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  useEffect(() => {
    // 能量引导动画
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setEnergyProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShowEnergyGuide(false);
        }, 500);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const handleSelect = (optionIndex) => {
    setSelectedValue(optionIndex);
    setEnergyValue(prev => prev + 10);
  };

  const nextQuestion = async () => {
    if (isSubmitting || selectedValue === null) {
      return;
    }

    // 保存答案
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedValue;
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // 最后一题，计算结果并跳转
      setIsSubmitting(true);
      
      const result = calculateTestResult(newAnswers);
      console.log('测试结果:', result);

      // 保存到数据库
      try {
        const zodiac = DataService.getPreference('selectedZodiac', '白羊座');
        await DataService.saveTestRecord({
          title: `类型 ${result.mainType}`,
          date: new Date().toISOString(),
          resultData: result,
          zodiac: zodiac
        });
      } catch (error) {
        console.error('保存测试记录失败:', error);
      }

      // 跳转到结果页
      console.log('准备跳转到结果页，结果数据:', result);
      history.push('/result', { testResult: result });
      console.log('跳转命令已执行');
    } else {
      // 下一题
      setCurrentIndex(currentIndex + 1);
      setSelectedValue(null);
    }
  };

  return (
    <IonPage>
      <PageHeader title="灵魂探索" />
      <IonContent className={styles.testContainer}>
        {/* 能量场背景 */}
        <div className={styles.energyField}>
          <div className={styles.starsBg}></div>
          <div className={styles.energyParticles}></div>
        </div>

        {/* 能量引导 */}
        {showEnergyGuide && (
          <div className={styles.energyGuide}>
            <div className={styles.energyText}>✨ 宇宙能量正在与你共振...</div>
            <div className={styles.energyProgress}>
              <div className={styles.progressBar} style={{ width: `${energyProgress}%` }}></div>
            </div>
          </div>
        )}

        {/* 问题卡片 */}
        {!showEnergyGuide && (
          <div className={styles.questionCard}>
            <div className={styles.questionIntro}>
              🧘‍♀️ 请先深呼吸，让心灵与宇宙能量连接
            </div>

            <div className={styles.questionTitle}>
              <span>第 {currentIndex + 1} 题 / 共 {questions.length} 题</span>
              <div className={styles.energyValue}>能量值: {energyValue}</div>
            </div>

            {isLastQuestion && (
              <div className={styles.finalTip}>
                <div className={styles.tipIcon}>✨</div>
                <div className={styles.tipText}>这是你灵魂探索的最后一题</div>
                <div className={styles.tipSubtext}>请跟随内心的指引，完成最后的能量汇聚</div>
              </div>
            )}

            <div className={styles.questionText}>
              {currentQuestion.text}
            </div>

            {/* 选项 */}
            <div className={styles.optionsGroup}>
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`${styles.optionItem} ${selectedValue === index ? styles.optionSelected : ''}`}
                  onClick={() => handleSelect(index)}
                >
                  <div className={styles.optionRadio}></div>
                  <div className={styles.optionText}>{option.text}</div>
                </div>
              ))}
            </div>

            {/* 下一题按钮 */}
            <button
              className={`${styles.btnNext} ${selectedValue !== null ? styles.btnNextActive : ''} ${isLastQuestion ? styles.btnEnergy : ''}`}
              disabled={selectedValue === null || isSubmitting}
              onClick={nextQuestion}
            >
              <span className={styles.btnText}>
                {isLastQuestion ? '💫 完成灵魂觉醒' : '下一题'}
              </span>
              <span className={styles.btnIcon}>
                {isLastQuestion ? '✨' : '➡️'}
              </span>
            </button>

            {/* 进度提示 */}
            <div style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              已完成 {progressPercent}%
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}

