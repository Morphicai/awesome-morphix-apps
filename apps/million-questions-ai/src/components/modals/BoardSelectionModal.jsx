import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { BOARD_ROLES } from '../../constants/mentors';
import styles from '../../styles/BoardSelectionModal.module.css';

export default function BoardSelectionModal({ isOpen, onClose, onComplete }) {
  const { t } = useAppContext();
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
      alert(t('boardSelection.selectNavigatorFirst'));
      return;
    }
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const finishSelection = () => {
    if (selectedMembers.length === 0) {
      alert(t('boardSelection.selectMemberFirst'));
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
            <div className={styles.modalTitle}>{t('boardSelection.step1Title')}</div>
            <div className={styles.modalSubtitle}>{t('boardSelection.step1Subtitle')}</div>
            <div className={styles.rolesGrid}>
              {BOARD_ROLES.navigators.map(navigator => (
                <div
                  key={navigator.id}
                  className={`${styles.roleCard} ${selectedNavigator?.id === navigator.id ? styles.selected : ''}`}
                  onClick={() => selectNavigator(navigator)}
                >
                  <div className={styles.roleName}>{t(`boardRoles.navigators.${navigator.id}.name`)}</div>
                  <div className={styles.roleRep}>{t('boardSelection.styleRep')}: {t(`boardRoles.navigators.${navigator.id}.representative`)}</div>
                  <div className={styles.roleQuote}>{t(`boardRoles.navigators.${navigator.id}.quote`)}</div>
                </div>
              ))}
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.confirmBtn} onClick={nextStep}>
                {t('boardSelection.nextButton')}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className={styles.modalTitle}>{t('boardSelection.step2Title')}</div>
            <div className={styles.modalSubtitle}>{t('boardSelection.step2Subtitle')}</div>
            <div className={styles.rolesGrid}>
              {BOARD_ROLES.members.map(member => (
                <div
                  key={member.id}
                  className={`${styles.roleCard} ${selectedMembers.find(m => m.id === member.id) ? styles.selected : ''}`}
                  onClick={() => toggleMember(member)}
                >
                  <div className={styles.roleName}>{t(`boardRoles.members.${member.id}.name`)}</div>
                  <div className={styles.roleRep}>{t(`boardRoles.members.${member.id}.expertise`)}</div>
                </div>
              ))}
            </div>
            <div className={styles.buttonGroup}>
              <button className={styles.secondaryBtn} onClick={prevStep}>
                {t('boardSelection.prevButton')}
              </button>
              <button className={styles.confirmBtn} onClick={finishSelection}>
                {t('boardSelection.generateButton')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
