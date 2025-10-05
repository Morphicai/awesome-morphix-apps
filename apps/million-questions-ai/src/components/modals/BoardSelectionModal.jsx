import React, { useState } from 'react';
import { BOARD_ROLES } from '../../constants/mentors';
import styles from '../../styles/BoardSelectionModal.module.css';

export default function BoardSelectionModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedNavigator, setSelectedNavigator] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const selectNavigator = (navigator) => {
    setSelectedNavigator(navigator);
  };

  const toggleMember = (member) => {
    if (selectedMembers.find(m => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const nextStep = () => {
    if (!selectedNavigator) {
      alert('请先选择一位领航人');
      return;
    }
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const finishSelection = () => {
    if (selectedMembers.length === 0) {
      alert('请至少选择一位董事会成员');
      return;
    }

    if (onComplete) {
      onComplete({
        navigator: selectedNavigator,
        members: selectedMembers
      });
    }

    // 重置状态
    setStep(1);
    setSelectedNavigator(null);
    setSelectedMembers([]);
  };

  const handleMaskClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalMask} onClick={handleMaskClick}>
      <div className={styles.modalContainer}>
        {step === 1 ? (
          <div>
            <div className={styles.modalTitle}>第一步：请选择一位"领航人"</div>
            <div className={styles.modalSubtitle}>他将为你出具第一份核心分析报告</div>
            <div className={styles.rolesGrid}>
              {BOARD_ROLES.navigators.map(navigator => (
                <div
                  key={navigator.id}
                  className={`${styles.roleCard} ${selectedNavigator?.id === navigator.id ? styles.selected : ''}`}
                  onClick={() => selectNavigator(navigator)}
                >
                  <div className={styles.roleName}>{navigator.name}</div>
                  <div className={styles.roleRep}>风格代表: {navigator.representative}</div>
                  <div className={styles.roleQuote}>{navigator.quote}</div>
                </div>
              ))}
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.confirmBtn} onClick={nextStep}>
                下一步
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className={styles.modalTitle}>第二步：请选择董事会成员 (可多选)</div>
            <div className={styles.modalSubtitle}>他们将从不同角度，共同审视你的想法</div>
            <div className={styles.rolesGrid}>
              {BOARD_ROLES.members.map(member => (
                <div
                  key={member.id}
                  className={`${styles.roleCard} ${selectedMembers.find(m => m.id === member.id) ? styles.selected : ''}`}
                  onClick={() => toggleMember(member)}
                >
                  <div className={styles.roleName}>{member.name}</div>
                  <div className={styles.roleRep}>{member.expertise}</div>
                </div>
              ))}
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.secondaryBtn} onClick={prevStep}>
                返回上一步
              </button>
              <button className={styles.confirmBtn} onClick={finishSelection}>
                生成董事会决议
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
